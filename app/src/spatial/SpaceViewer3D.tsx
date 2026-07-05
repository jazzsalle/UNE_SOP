/**
 * SpaceViewer3D — 공간 스키마 + 토폴로지의 순수 WebGL 3D 뷰어 (Phase 9 Task T5).
 * 층 슬래브·공간 프리즘(division 색, 반투명)·시설물 마커·토폴로지 노드/링크를
 * webgl/ 모듈(mat4·orbitCamera·meshBuilders·renderer — React 무의존)로 그린다.
 * 좌표계: world.x = plan.x, world.z = −plan.y, world.y = 고도(m) — 토폴로지
 * worldPosition과 동일 공간. 층 표시/숨김 체크박스는 이 컴포넌트가 내부 관리한다
 * (2D 층 탭과 독립 — 3D는 여러 층 동시 표시가 기본이라 페이지 상태와 분리가 단순).
 * 색은 전부 getComputedStyle로 디자인 토큰 CSS 변수를 해석해 RGB로 변환한다
 * — division→토큰 매핑은 spatial.css `.spatial-division--*`와 동일하게 유지할 것.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { getFacilities, getFloors, getSpaces } from "../domain/spatial";
import type { SpatialDivision } from "../domain/spatial";
import { deriveLinks, getTopologySet } from "../domain/topology";
import type { Vec3 } from "./webgl/mat4";
import { mat4Multiply, mat4Perspective } from "./webgl/mat4";
import {
  cameraViewMatrix,
  createOrbitCamera,
  orbitBy,
  panBy,
  zoomBy,
  type OrbitCameraState,
} from "./webgl/orbitCamera";
import {
  buildFloorSlab,
  buildLinkLines,
  buildNodeMarker,
  buildPrism,
  planToWorld,
  type PlanBounds,
} from "./webgl/meshBuilders";
import { createRenderer, type Renderer, type Rgb, type SceneItem } from "./webgl/renderer";

interface SpaceViewer3DProps {
  /** 대상 사이트(건물) UFID. */
  siteUfid: string;
  /** 함께 그릴 토폴로지 셋 id — 없거나 미등록이면 공간만 렌더. */
  topologySetId?: string | null;
}

/** 수직 화각(라디안) — 투영·pan 스케일 공용. */
const FOV_Y = Math.PI / 4;

/** near/far 클립 거리(m). */
const NEAR = 0.5;
const FAR = 800;

/** 드래그 1px당 orbit 각도(라디안). */
const ORBIT_SPEED = 0.008;

/** 휠 deltaY → zoom 배율 지수 계수. */
const ZOOM_SPEED = 0.0012;

/** 공간 프리즘 반투명 알파 — 내부 시설물/노드 마커가 비쳐 보이게. */
const PRISM_ALPHA = 0.55;

/** 층 슬래브 두께(m). */
const SLAB_THICKNESS = 0.15;

/** 토폴로지 노드/시설물 마커 옥타헤드론 반지름(m). */
const NODE_MARKER_RADIUS = 0.45;
const FACILITY_MARKER_RADIUS = 0.35;

/* ── 디자인 토큰 색 해석 ─────────────────────────────────────── */

/**
 * CSS 색 문자열 → RGB [0..1] 파서 — 디자인 토큰(CSS 변수) "값 해석 전용".
 * getComputedStyle이 돌려주는 #rrggbb/#rgb(및 rgb()/rgba()) 표기를 숫자로 바꿀 뿐,
 * 소스에 색을 하드코딩하기 위한 것이 아니다(색 리터럴 금지 규칙의 명시 허용 예외).
 */
function parseCssColor(raw: string): Rgb | null {
  const value = raw.trim();
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const r = Number.parseInt(hex[0] + hex[0], 16);
      const g = Number.parseInt(hex[1] + hex[1], 16);
      const b = Number.parseInt(hex[2] + hex[2], 16);
      if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
      return [r / 255, g / 255, b / 255];
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = Number.parseInt(hex.slice(0, 2), 16);
      const g = Number.parseInt(hex.slice(2, 4), 16);
      const b = Number.parseInt(hex.slice(4, 6), 16);
      if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
      return [r / 255, g / 255, b / 255];
    }
    return null;
  }
  // rgb(r g b / a) / rgb(r, g, b) / rgba(...) — 브라우저 정규화 표기 방어
  const match = /^rgba?\(([^)]+)\)$/.exec(value);
  if (match) {
    const parts = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (parts.length >= 3 && parts.slice(0, 3).every((n) => Number.isFinite(n))) {
      return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
    }
  }
  return null;
}

/** 토큰(CSS 변수명) → RGB. 파싱 실패 시 [0,0,0] — 색 지정이 아닌 방어 폴백값. */
function resolveToken(styles: CSSStyleDeclaration, token: string): Rgb {
  return parseCssColor(styles.getPropertyValue(token)) ?? [0, 0, 0];
}

/**
 * division → 채움색 토큰 — spatial.css `.spatial-division--*`의
 * `--spatial-division-fill` 매핑과 1:1 동일(변경 시 양쪽 함께 수정).
 */
const DIVISION_FILL_TOKEN: Record<SpatialDivision, string> = {
  MV: "--color-bg-brand-subtle",
  IF: "--color-bg-info-subtle",
  CV: "--color-bg-success-subtle",
  TP: "--color-bg-brand-subtle-pressed",
  SF: "--color-bg-warning-subtle",
  FF: "--color-bg-danger-subtle",
  SL: "--color-bg-brand-subtle-pressed",
  MD: "--color-bg-info-subtle",
  HS: "--color-bg-success-subtle",
  BS: "--color-bg-muted",
  MN: "--color-bg-subtle",
  IS: "--color-bg-disabled",
};

/**
 * division → 시설물 마커색 토큰 — spatial.css `--spatial-division-marker` 매핑과 동일.
 */
const DIVISION_MARKER_TOKEN: Record<SpatialDivision, string> = {
  MV: "--color-bg-brand",
  IF: "--color-bg-info",
  CV: "--color-bg-neutral",
  TP: "--color-bg-neutral",
  SF: "--color-bg-warning",
  FF: "--color-bg-danger",
  SL: "--color-bg-neutral",
  MD: "--color-bg-success",
  HS: "--color-bg-neutral",
  BS: "--color-bg-neutral",
  MN: "--color-bg-neutral",
  IS: "--color-bg-neutral",
};

/**
 * nodeTypeCode → 마커색 토큰 — spatial.css `.topology-node--*` 매핑과 동일
 * (normal=info, 수직 이동=warning, exit=danger). 미지 코드는 normal로 폴백.
 */
const NODE_TYPE_TOKEN: Record<string, string> = {
  normal: "--color-bg-info",
  stair: "--color-bg-warning",
  ramp: "--color-bg-warning",
  escalator: "--color-bg-warning",
  exit: "--color-bg-danger",
};

/* ── 장면 조립 ───────────────────────────────────────────────── */

/**
 * 현재 사이트/토폴로지/표시 층으로 장면 아이템을 조립한다.
 * 토폴로지는 층 필터와 무관하게 셋 전체를 렌더한다 — 수직(층간) 링크가 항상
 * 온전히 보이고 필터 조합 분기가 없는 단순한 쪽을 택했다(계획 명세 허용).
 */
function buildSceneItems(
  siteUfid: string,
  topologySetId: string | null | undefined,
  visibleFloorCodes: Set<string>,
): SceneItem[] {
  const styles = getComputedStyle(document.documentElement);
  const slabColor = resolveToken(styles, "--color-border-subtle");
  const linkColor = resolveToken(styles, "--color-border-strong");
  const items: SceneItem[] = [];

  const spaces = getSpaces(siteUfid).filter((space) => visibleFloorCodes.has(space.floorCode));
  const floorOfSpace = new Map(spaces.map((space) => [space.primaryKey, space.floorCode]));

  // 층 슬래브 — 표시 층별 footprint 바운딩 사각형(공간 없는 층은 생략)
  for (const floor of getFloors(siteUfid)) {
    if (!visibleFloorCodes.has(floor.floorCode)) continue;
    const floorSpaces = spaces.filter((space) => space.floorCode === floor.floorCode);
    if (floorSpaces.length === 0) continue;
    const points = floorSpaces.flatMap((space) => space.geometry.footprint);
    const bounds: PlanBounds = {
      minX: Math.min(...points.map((p) => p.x)),
      minY: Math.min(...points.map((p) => p.y)),
      maxX: Math.max(...points.map((p) => p.x)),
      maxY: Math.max(...points.map((p) => p.y)),
    };
    const slab = buildFloorSlab(bounds, floor.elevation, SLAB_THICKNESS);
    items.push({ kind: "solid", ...slab, color: slabColor, alpha: 1 });
  }

  // 공간 프리즘 — division 채움 토큰색, 반투명
  for (const space of spaces) {
    const prism = buildPrism(
      space.geometry.footprint,
      space.geometry.baseElevation,
      space.geometry.height,
    );
    items.push({
      kind: "solid",
      ...prism,
      color: resolveToken(styles, DIVISION_FILL_TOKEN[space.division]),
      alpha: PRISM_ALPHA,
    });
  }

  // 시설물 마커 — 소속 공간이 표시 층일 때만. position.z는 절대 고도(m)
  for (const facility of getFacilities(siteUfid)) {
    if (!floorOfSpace.has(facility.spaceId)) continue;
    const center = planToWorld(
      { x: facility.position.x, y: facility.position.y },
      facility.position.z,
    );
    const marker = buildNodeMarker(center, FACILITY_MARKER_RADIUS);
    items.push({
      kind: "solid",
      ...marker,
      color: resolveToken(styles, DIVISION_MARKER_TOKEN[facility.division]),
      alpha: 1,
    });
  }

  // 토폴로지 노드/링크 — worldPosition을 그대로 사용(동일 좌표 공간)
  const topologySet = topologySetId ? getTopologySet(topologySetId) : null;
  if (topologySet) {
    const nodeById = new Map(topologySet.nodes.map((node) => [node.id, node]));
    const segments: Array<[Vec3, Vec3]> = [];
    for (const link of deriveLinks(topologySet.nodes)) {
      const source = nodeById.get(link.sourceId);
      const target = nodeById.get(link.targetId);
      if (!source || !target) continue;
      segments.push([
        [source.worldPosition.x, source.worldPosition.y, source.worldPosition.z],
        [target.worldPosition.x, target.worldPosition.y, target.worldPosition.z],
      ]);
    }
    if (segments.length > 0) {
      items.push({ kind: "lines", positions: buildLinkLines(segments), color: linkColor, alpha: 1 });
    }
    for (const node of topologySet.nodes) {
      const token = NODE_TYPE_TOKEN[node.nodeTypeCode] ?? NODE_TYPE_TOKEN["normal"];
      const marker = buildNodeMarker(
        [node.worldPosition.x, node.worldPosition.y, node.worldPosition.z],
        NODE_MARKER_RADIUS,
      );
      items.push({ kind: "solid", ...marker, color: resolveToken(styles, token), alpha: 1 });
    }
  }

  return items;
}

/**
 * 사이트 전체가 화면에 들어오는 초기 카메라 — 전 층 footprint/고도 바운딩 박스
 * 중심을 target으로, 최대 변 길이에 비례한 distance와 내려다보는 pitch를 잡는다
 * (검증용 건물 40m×20m×3층 기준 건물 전체가 보인다).
 */
function fitCamera(siteUfid: string): OrbitCameraState {
  const spaces = getSpaces(siteUfid);
  if (spaces.length === 0) {
    return { target: [0, 0, 0], distance: 60, yaw: Math.PI / 4, pitch: 0.55 };
  }
  const points = spaces.flatMap((space) => space.geometry.footprint);
  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));
  const minH = Math.min(...spaces.map((space) => space.geometry.baseElevation));
  const maxH = Math.max(
    ...spaces.map((space) => space.geometry.baseElevation + space.geometry.height),
  );
  const extent = Math.max(maxX - minX, maxY - minY, maxH - minH);
  return {
    // world.z = −plan.y — 중심의 plan.y 부호를 반전해 target을 잡는다
    target: [(minX + maxX) / 2, (minH + maxH) / 2, -(minY + maxY) / 2],
    distance: extent * 1.5 + 8,
    yaw: Math.PI / 4,
    pitch: 0.55,
  };
}

/* ── 컴포넌트 ───────────────────────────────────────────────── */

function SpaceViewer3D({ siteUfid, topologySetId }: SpaceViewer3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const cameraRef = useRef<OrbitCameraState>(createOrbitCamera(fitCamera(siteUfid)));
  // dirty 플래그 — 카메라/장면/크기 변경 시에만 rAF 루프가 draw한다
  const dirtyRef = useRef(true);

  // WebGL 미지원(컨텍스트/셰이더 생성 실패) 여부
  const [unsupported, setUnsupported] = useState(false);
  // 컨텍스트 유실 중 여부 — 복원 이벤트로 해제
  const [contextLost, setContextLost] = useState(false);
  // 컨텍스트 복원 세대 — 장면 재업로드 트리거
  const [restoreGeneration, setRestoreGeneration] = useState(0);
  // 숨긴 층 FLOOR 코드 집합 — 기본 전 층 표시, 사이트 변경 시 리셋
  const [hiddenFloorCodes, setHiddenFloorCodes] = useState<ReadonlySet<string>>(new Set());

  const floors = useMemo(() => getFloors(siteUfid), [siteUfid]);
  const visibleFloorCodes = useMemo(
    () =>
      new Set(
        floors.map((floor) => floor.floorCode).filter((code) => !hiddenFloorCodes.has(code)),
      ),
    [floors, hiddenFloorCodes],
  );

  // 렌더러 수명 주기 + 입력(orbit/zoom/pan) + 리사이즈 + rAF 루프 — 마운트 1회
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = createRenderer(canvas);
    if (!renderer) {
      setUnsupported(true);
      return;
    }
    rendererRef.current = renderer;

    /** 캔버스 백킹 크기를 CSS 크기 × DPR로 맞춘다. */
    const syncSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      rendererRef.current?.resize(width, height);
      dirtyRef.current = true;
    };
    syncSize();
    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(canvas);

    // 컨텍스트 유실/복원 — lost는 preventDefault로 복원 가능 상태 유지,
    // restored 시 렌더러를 재생성하고 세대를 올려 장면을 다시 업로드한다
    const handleLost = (event: Event) => {
      event.preventDefault();
      rendererRef.current = null;
      setContextLost(true);
    };
    const handleRestored = () => {
      const restored = createRenderer(canvas);
      rendererRef.current = restored;
      if (restored) {
        restored.resize(canvas.width, canvas.height);
        setContextLost(false);
        setRestoreGeneration((generation) => generation + 1);
      } else {
        setUnsupported(true);
      }
      dirtyRef.current = true;
    };
    canvas.addEventListener("webglcontextlost", handleLost);
    canvas.addEventListener("webglcontextrestored", handleRestored);

    // 포인터 드래그 — 좌클릭 orbit / 우클릭 또는 Shift+드래그 pan
    let drag: { x: number; y: number; mode: "orbit" | "pan" } | null = null;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.button !== 2) return;
      drag = {
        x: event.clientX,
        y: event.clientY,
        mode: event.button === 2 || event.shiftKey ? "pan" : "orbit",
      };
      canvas.setPointerCapture(event.pointerId);
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!drag) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag = { ...drag, x: event.clientX, y: event.clientY };
      if (drag.mode === "orbit") {
        orbitBy(cameraRef.current, -dx * ORBIT_SPEED, -dy * ORBIT_SPEED);
      } else {
        panBy(cameraRef.current, dx, dy, canvas.clientHeight, FOV_Y);
      }
      dirtyRef.current = true;
    };
    const handlePointerUp = (event: PointerEvent) => {
      drag = null;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomBy(cameraRef.current, Math.exp(event.deltaY * ZOOM_SPEED));
      dirtyRef.current = true;
    };
    const handleContextMenu = (event: MouseEvent) => event.preventDefault();
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("contextmenu", handleContextMenu);

    // rAF 루프 — dirty일 때만 draw(뷰가 숨겨져 크기 0이면 건너뜀)
    let rafId = 0;
    const frame = () => {
      rafId = requestAnimationFrame(frame);
      const activeRenderer = rendererRef.current;
      if (!dirtyRef.current || !activeRenderer || canvas.width === 0 || canvas.height === 0) {
        return;
      }
      dirtyRef.current = false;
      const projection = mat4Perspective(FOV_Y, canvas.width / canvas.height, NEAR, FAR);
      const viewProj = mat4Multiply(projection, cameraViewMatrix(cameraRef.current));
      const styles = getComputedStyle(document.documentElement);
      activeRenderer.draw(viewProj, resolveToken(styles, "--color-bg-muted"));
    };
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", handleLost);
      canvas.removeEventListener("webglcontextrestored", handleRestored);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("contextmenu", handleContextMenu);
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  // 사이트 변경 — 카메라를 새 건물 전체가 보이게 리셋 + 층 필터 초기화
  useEffect(() => {
    cameraRef.current = createOrbitCamera(fitCamera(siteUfid));
    setHiddenFloorCodes(new Set());
    dirtyRef.current = true;
  }, [siteUfid]);

  // 장면 재조립 — 사이트/토폴로지 셋/표시 층/컨텍스트 복원 변화 시 버퍼 재업로드
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setScene(buildSceneItems(siteUfid, topologySetId, visibleFloorCodes));
    dirtyRef.current = true;
  }, [siteUfid, topologySetId, visibleFloorCodes, restoreGeneration]);

  /** 층 체크박스 토글 — hidden 집합에 넣고 빼는 방식(기본 전 층 표시). */
  const toggleFloor = (floorCode: string) => {
    setHiddenFloorCodes((previous) => {
      const next = new Set(previous);
      if (next.has(floorCode)) {
        next.delete(floorCode);
      } else {
        next.add(floorCode);
      }
      return next;
    });
  };

  return (
    <div className="space-viewer">
      {/* 층 표시/숨김 체크박스 바 + 조작 힌트 */}
      <div className="space-viewer__floor-bar">
        <span className="space-viewer__floor-label typo-text-sm">층 표시</span>
        {floors.map((floor) => (
          <label key={floor.floorCode} className="space-viewer__floor-check typo-text-sm">
            <input
              type="checkbox"
              checked={!hiddenFloorCodes.has(floor.floorCode)}
              onChange={() => toggleFloor(floor.floorCode)}
            />
            {floor.name}
          </label>
        ))}
        <span className="space-viewer__hint typo-text-sm">
          드래그 회전 · 휠 확대/축소 · Shift/우클릭 드래그 이동
        </span>
      </div>

      <div className="space-viewer__canvas-wrap">
        <canvas
          ref={canvasRef}
          className="space-viewer__canvas"
          aria-label="공간 모델 3D 미리보기"
        />
        {/* WebGL 미지원/컨텍스트 유실 안내 오버레이 */}
        {(unsupported || contextLost) && (
          <p className="space-viewer__fallback typo-text-sm">
            {unsupported
              ? "이 브라우저에서 WebGL을 사용할 수 없어 3D 뷰를 표시할 수 없습니다. 2D 평면 모드를 이용하세요."
              : "WebGL 컨텍스트가 유실되었습니다 — 자동 복원을 기다리는 중입니다."}
          </p>
        )}
      </div>
    </div>
  );
}

export default SpaceViewer3D;
