/**
 * SpaceViewer3D — 공간 스키마 + 토폴로지의 순수 WebGL 3D 뷰어 (Phase 9 Task T5).
 * 층 슬래브·공간 프리즘(division 색, 반투명)·시설물 마커·토폴로지 노드/링크를
 * webgl/ 모듈(mat4·orbitCamera·meshBuilders·renderer — React 무의존)로 그린다.
 * 좌표계: world.x = plan.x, world.z = −plan.y, world.y = 고도(m) — 토폴로지
 * worldPosition과 동일 공간. 층 표시는 페이지 층 탭과 통합 — props.floorCode가
 * 단일 층이면 그 층의 슬래브/프리즘/시설물/토폴로지(floorName 일치)만 그리고,
 * null(전체 건물)이면 전 층을 층 간 explode 오프셋(FLOOR_GAP)을 벌려 그린다
 * — 위층 슬래브/프리즘 바닥과 아래층 프리즘 상단의 z-fighting 해소.
 * 패트롤 데모: 로봇개 메시가 최신 실행이력의 patrol 경로(없으면 자동 선정 경로)를
 * 따라 이동한다 — renderer 동적 model 행렬로 매 프레임 버퍼 재업로드 없이 갱신.
 * 색은 전부 getComputedStyle로 디자인 토큰 CSS 변수를 해석해 RGB로 변환한다
 * — division→토큰 매핑은 spatial.css `.spatial-division--*`와 동일하게 유지할 것.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { getFacilities, getFloors, getSpaces } from "../domain/spatial";
import type { SpatialDivision } from "../domain/spatial";
import {
  deriveLinks,
  findPath,
  getTopologySet,
  pickPatrolEndpoints,
} from "../domain/topology";
import { listRuns, subscribeRuns } from "../engine/runStorage";
import type { Vec3 } from "./webgl/mat4";
import { mat4Multiply, mat4Perspective, mat4RotateY, mat4Translate } from "./webgl/mat4";
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
  buildRobotDog,
  planToWorld,
  type PlanBounds,
} from "./webgl/meshBuilders";
import {
  buildPatrolTimeline,
  samplePatrolPose,
  type PatrolTimeline,
  type PatrolWaypoint,
} from "./webgl/patrolPath";
import { createRenderer, type Renderer, type Rgb, type SceneItem } from "./webgl/renderer";

interface SpaceViewer3DProps {
  /** 대상 사이트(건물) UFID. */
  siteUfid: string;
  /** 함께 그릴 토폴로지 셋 id — 없거나 미등록이면 공간만 렌더. */
  topologySetId?: string | null;
  /** 표시 층 FLOOR 코드 — null이면 전체 건물(전 층 + explode 오프셋). */
  floorCode: string | null;
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

/**
 * 전체 건물 모드의 층 간 explode 간격(m) — 층 인덱스(고도 오름차순)마다 누적해
 * 공간 프리즘 상단과 위층 슬래브 바닥의 coplanar 면(z-fighting)을 벌린다.
 */
const FLOOR_GAP = 1.8;

/** 공간 프리즘 높이 축소(m) — explode 후에도 남는 coplanar 면 방어. */
const PRISM_HEIGHT_EPSILON = 0.05;

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

/** 로봇개 몸체색 토큰 — accent(brand) 계열로 토폴로지 마커(info/warning/danger)와 구분. */
const ROBOT_DOG_TOKEN = "--color-bg-brand";

/* ── 장면 조립 ───────────────────────────────────────────────── */

/**
 * 현재 사이트/토폴로지/표시 층으로 장면 아이템을 조립한다.
 * - visibleFloorCodes에 속한 층만 렌더 — 단일 층 모드는 해당 층 하나,
 *   전체 건물 모드는 전 층. 토폴로지 노드는 floorName, 링크는 양끝 층으로 필터.
 * - floorOffsets(층 코드 → Y 오프셋)는 전체 건물 모드의 explode 간격 —
 *   슬래브/프리즘/시설물/토폴로지 노드·링크 끝점 모두 소속 층 기준으로 동일 적용.
 *   수직 링크는 벌어진 간격을 그대로 이어 층간 연결이 시각적으로 명확해진다.
 */
function buildSceneItems(
  siteUfid: string,
  topologySetId: string | null | undefined,
  visibleFloorCodes: ReadonlySet<string>,
  floorOffsets: ReadonlyMap<string, number>,
): SceneItem[] {
  const styles = getComputedStyle(document.documentElement);
  const slabColor = resolveToken(styles, "--color-border-subtle");
  const linkColor = resolveToken(styles, "--color-border-strong");
  const items: SceneItem[] = [];
  const offsetOf = (floorCode: string) => floorOffsets.get(floorCode) ?? 0;

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
    const slab = buildFloorSlab(bounds, floor.elevation + offsetOf(floor.floorCode), SLAB_THICKNESS);
    items.push({ kind: "solid", ...slab, color: slabColor, alpha: 1 });
  }

  // 공간 프리즘 — division 채움 토큰색, 반투명.
  // 높이를 살짝 줄여(ε) 위층 슬래브 바닥과의 coplanar 면을 제거한다(z-fighting 방어).
  for (const space of spaces) {
    const prism = buildPrism(
      space.geometry.footprint,
      space.geometry.baseElevation + offsetOf(space.floorCode),
      Math.max(space.geometry.height - PRISM_HEIGHT_EPSILON, PRISM_HEIGHT_EPSILON),
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
    const facilityFloor = floorOfSpace.get(facility.spaceId);
    if (facilityFloor === undefined) continue;
    const center = planToWorld(
      { x: facility.position.x, y: facility.position.y },
      facility.position.z + offsetOf(facilityFloor),
    );
    const marker = buildNodeMarker(center, FACILITY_MARKER_RADIUS);
    items.push({
      kind: "solid",
      ...marker,
      color: resolveToken(styles, DIVISION_MARKER_TOKEN[facility.division]),
      alpha: 1,
    });
  }

  // 토폴로지 노드/링크 — worldPosition(동일 좌표 공간) + 소속 층(floorName) 오프셋.
  // 단일 층 모드에서는 floorName 일치 노드와 양끝이 그 층인 링크만 남긴다.
  const topologySet = topologySetId ? getTopologySet(topologySetId) : null;
  if (topologySet) {
    const visibleNodes = topologySet.nodes.filter((node) =>
      visibleFloorCodes.has(node.floorName),
    );
    const nodeById = new Map(visibleNodes.map((node) => [node.id, node]));
    const segments: Array<[Vec3, Vec3]> = [];
    for (const link of deriveLinks(topologySet.nodes)) {
      const source = nodeById.get(link.sourceId);
      const target = nodeById.get(link.targetId);
      if (!source || !target) continue; // 한쪽이라도 비표시 층이면 생략
      segments.push([
        [
          source.worldPosition.x,
          source.worldPosition.y + offsetOf(source.floorName),
          source.worldPosition.z,
        ],
        [
          target.worldPosition.x,
          target.worldPosition.y + offsetOf(target.floorName),
          target.worldPosition.z,
        ],
      ]);
    }
    if (segments.length > 0) {
      items.push({ kind: "lines", positions: buildLinkLines(segments), color: linkColor, alpha: 1 });
    }
    for (const node of visibleNodes) {
      const token = NODE_TYPE_TOKEN[node.nodeTypeCode] ?? NODE_TYPE_TOKEN["normal"];
      const marker = buildNodeMarker(
        [node.worldPosition.x, node.worldPosition.y + offsetOf(node.floorName), node.worldPosition.z],
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
 * (검증용 건물 40m×20m×3층 기준 건물 전체가 보인다 — explode 추가분은
 * FLOOR_GAP×층수 수 m 수준이라 여유 distance 안에 들어온다).
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

/* ── 패트롤 경로 해석 ────────────────────────────────────────── */

/** 패트롤 경로 소스 — 노드 id 체인 + 체크포인트 id 목록. */
interface PatrolRoute {
  routeNodeIds: string[];
  checkpointNodeIds: string[];
}

/**
 * 패트롤 데모 경로를 해석한다 — 우선순위:
 * ① 실행이력(listRuns, 최신 우선 정렬)에서 선택 셋의 patrol 임무가 있는 최신 run의
 *    mission.patrol.routeNodeIds (SOP 실행 연동 — subscribeRuns로 갱신)
 * ② 없으면 pickPatrolEndpoints + findPath로 셋 안에서 자동 선정한 폴백 경로.
 * 셋 미선택/미등록/경로 불가면 null(데모 버튼 비활성).
 */
function resolvePatrolRoute(topologySetId: string | null | undefined): PatrolRoute | null {
  if (!topologySetId) return null;
  const set = getTopologySet(topologySetId);
  if (!set) return null;

  for (const run of listRuns()) {
    for (const mission of run.missions) {
      const patrol = mission.patrol;
      if (patrol && patrol.topologySetId === topologySetId && patrol.routeNodeIds.length >= 2) {
        return {
          routeNodeIds: patrol.routeNodeIds,
          checkpointNodeIds: patrol.checkpointNodeIds,
        };
      }
    }
  }

  const endpoints = pickPatrolEndpoints(set);
  if (!endpoints) return null;
  const path = findPath(set, endpoints.startNodeId, endpoints.endNodeId);
  if (!path || path.nodeIds.length < 2) return null;
  return { routeNodeIds: path.nodeIds, checkpointNodeIds: endpoints.checkpointNodeIds };
}

/** rAF 루프가 참조하는 패트롤 재생 상태 — 경유점/타임라인/재생 시작 시각(ms). */
interface PatrolPlayback {
  waypoints: PatrolWaypoint[];
  timeline: PatrolTimeline;
  startMs: number;
}

/* ── 컴포넌트 ───────────────────────────────────────────────── */

function SpaceViewer3D({ siteUfid, topologySetId, floorCode }: SpaceViewer3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const cameraRef = useRef<OrbitCameraState>(createOrbitCamera(fitCamera(siteUfid)));
  // dirty 플래그 — 카메라/장면/크기 변경 시에만 rAF 루프가 draw한다(재생 중엔 상시 dirty)
  const dirtyRef = useRef(true);
  // 패트롤 재생 상태 — rAF 루프가 매 프레임 참조(재생 중이 아니면 null)
  const playbackRef = useRef<PatrolPlayback | null>(null);

  // WebGL 미지원(컨텍스트/셰이더 생성 실패) 여부
  const [unsupported, setUnsupported] = useState(false);
  // 컨텍스트 유실 중 여부 — 복원 이벤트로 해제
  const [contextLost, setContextLost] = useState(false);
  // 컨텍스트 복원 세대 — 장면 재업로드 트리거
  const [restoreGeneration, setRestoreGeneration] = useState(0);
  // 패트롤 데모 재생 여부
  const [patrolPlaying, setPatrolPlaying] = useState(false);
  // 실행이력 변경 세대 — patrol 경로(run 소스) 재해석 트리거
  const [runsVersion, setRunsVersion] = useState(0);

  const floors = useMemo(() => getFloors(siteUfid), [siteUfid]);

  // 표시 층 집합 — floorCode null(전체 건물)이면 전 층, 아니면 해당 층 하나
  const visibleFloorCodes = useMemo(
    () =>
      floorCode === null
        ? new Set(floors.map((floor) => floor.floorCode))
        : new Set([floorCode]),
    [floors, floorCode],
  );

  // explode 오프셋 — 전체 건물 모드에서만 층 인덱스(고도 오름차순) × FLOOR_GAP.
  // 단일 층 모드는 빈 맵(오프셋 0) — 겹치는 층이 없어 explode 불필요.
  const floorOffsets = useMemo(() => {
    const map = new Map<string, number>();
    if (floorCode === null) {
      [...floors]
        .sort((a, b) => a.elevation - b.elevation)
        .forEach((floor, index) => map.set(floor.floorCode, index * FLOOR_GAP));
    }
    return map;
  }, [floors, floorCode]);

  // 실행이력 구독 — SOP 실행기가 patrol 임무 run을 저장하면 경로를 다시 해석
  useEffect(() => subscribeRuns(() => setRunsVersion((version) => version + 1)), []);

  // 패트롤 경로 해석 — ① 최신 run patrol → ② 자동 선정 폴백
  const patrolRoute = useMemo(
    () => resolvePatrolRoute(topologySetId),
    [topologySetId, runsVersion],
  );

  // 경로 노드 id → explode 오프셋 반영 경유점. 층 필터와 무관하게 전체 경로를
  // 따른다(단일 층 모드에서도 데모 허용 — 오프셋 0이라 실제 고도 그대로).
  const patrolWaypoints = useMemo<PatrolWaypoint[] | null>(() => {
    if (!patrolRoute || !topologySetId) return null;
    const set = getTopologySet(topologySetId);
    if (!set) return null;
    const nodeById = new Map(set.nodes.map((node) => [node.id, node]));
    const checkpointIds = new Set(patrolRoute.checkpointNodeIds);
    const waypoints: PatrolWaypoint[] = [];
    for (const nodeId of patrolRoute.routeNodeIds) {
      const node = nodeById.get(nodeId);
      if (!node) continue; // 경로에 남은 미등록 노드 방어
      waypoints.push({
        nodeId,
        position: [
          node.worldPosition.x,
          node.worldPosition.y + (floorOffsets.get(node.floorName) ?? 0),
          node.worldPosition.z,
        ],
        checkpoint: checkpointIds.has(nodeId) || node.metadata["checkpoint"] === true,
      });
    }
    return waypoints.length >= 2 ? waypoints : null;
  }, [patrolRoute, topologySetId, floorOffsets]);

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

    // rAF 루프 — dirty일 때만 draw. 패트롤 재생 중에는 매 프레임 로봇 model
    // 행렬을 갱신하고 상시 dirty로 돌린다(뷰가 숨겨져 크기 0이면 건너뜀).
    let rafId = 0;
    const frame = () => {
      rafId = requestAnimationFrame(frame);
      const activeRenderer = rendererRef.current;
      const playback = playbackRef.current;
      if (playback && activeRenderer) {
        const elapsedSec = (performance.now() - playback.startMs) / 1000;
        const pose = samplePatrolPose(playback.waypoints, playback.timeline, elapsedSec);
        activeRenderer.setDynamicModel(
          mat4Multiply(
            mat4Translate(pose.position[0], pose.position[1], pose.position[2]),
            mat4RotateY(pose.yaw),
          ),
        );
        dirtyRef.current = true;
      }
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

  // 사이트 변경 — 카메라를 새 건물 전체가 보이게 리셋
  useEffect(() => {
    cameraRef.current = createOrbitCamera(fitCamera(siteUfid));
    dirtyRef.current = true;
  }, [siteUfid]);

  // 장면 재조립 — 사이트/토폴로지 셋/표시 층(explode)/컨텍스트 복원 변화 시 버퍼 재업로드
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setScene(buildSceneItems(siteUfid, topologySetId, visibleFloorCodes, floorOffsets));
    dirtyRef.current = true;
  }, [siteUfid, topologySetId, visibleFloorCodes, floorOffsets, restoreGeneration]);

  // 경로가 사라지면(셋 해제/노드 부족) 재생을 자동 중지한다
  useEffect(() => {
    if (!patrolWaypoints) {
      setPatrolPlaying(false);
    }
  }, [patrolWaypoints]);

  // 패트롤 재생 — 로봇개 메시를 동적 아이템으로 업로드하고 재생 상태를 rAF에 넘긴다.
  // 경유점(explode 오프셋 포함)이 바뀌면 처음부터 다시 재생, 정지 시 동적 아이템 해제.
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    if (patrolPlaying && patrolWaypoints) {
      const styles = getComputedStyle(document.documentElement);
      const robot = buildRobotDog();
      renderer.setDynamic([
        { kind: "solid", ...robot, color: resolveToken(styles, ROBOT_DOG_TOKEN), alpha: 1 },
      ]);
      playbackRef.current = {
        waypoints: patrolWaypoints,
        timeline: buildPatrolTimeline(patrolWaypoints),
        startMs: performance.now(),
      };
    } else {
      renderer.setDynamic([]);
      playbackRef.current = null;
    }
    dirtyRef.current = true;
  }, [patrolPlaying, patrolWaypoints, restoreGeneration]);

  return (
    <div className="space-viewer">
      {/* 패트롤 데모 버튼 + 조작 힌트 바 — 층 표시는 페이지 층 탭(전체 건물 탭 포함)과 통합 */}
      <div className="space-viewer__floor-bar">
        <button
          type="button"
          className="space-viewer__patrol-btn typo-text-sm"
          disabled={!patrolWaypoints}
          aria-pressed={patrolPlaying}
          title={
            patrolWaypoints
              ? "로봇개가 패트롤 경로(최신 실행이력 또는 자동 선정)를 따라 이동합니다"
              : "토폴로지 셋을 선택하면 패트롤 데모를 재생할 수 있습니다"
          }
          onClick={() => setPatrolPlaying((playing) => !playing)}
        >
          {patrolPlaying ? "패트롤 데모 정지" : "🐕 패트롤 데모 재생"}
        </button>
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
