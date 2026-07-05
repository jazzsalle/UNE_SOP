/**
 * FloorPlanSvg — 선택 층의 공간 footprint 폴리곤과 시설물 점 마커를 SVG로 렌더한다.
 * 좌표계: 공간 데이터는 미터 단위·y축 위 방향, SVG는 y축 아래 방향이므로
 * viewBox 계산 시 y를 반전(mapY = maxY - y)해 평면도 방향을 유지한다.
 * Phase 7: 토폴로지 오버레이(선택) — webbuilder 노드를 toPlanPoint(계약 A)로 투영해
 * 링크 선(one-way 방향 화살표, 층간 vertical은 점선 스터브) 위에 노드 원을 겹쳐 그린다.
 * 색상은 spatial.css의 `.spatial-division--*`/`.topology-*` 클래스(전부 var() 토큰)로만 칠한다.
 */
import type { SpatialFacility, SpatialSpace, SpatialPoint2D } from "../domain/spatial";
import { divisionLabel } from "../domain/spatial";
import type { TopologyLink, TopologyNodeData } from "../domain/topology";
import { KNOWN_NODE_TYPE_CODES, toPlanPoint } from "../domain/topology";

/** 평면 뷰 선택 대상 — 공간(기본키)·시설물(3차원객체코드)·토폴로지 노드(노드 id). */
export type PlanSelection =
  | { kind: "space"; id: string }
  | { kind: "facility"; id: string }
  | { kind: "topology"; id: string };

interface FloorPlanSvgProps {
  /** 선택 층의 공간 목록 — footprint 폴리곤으로 렌더. */
  spaces: SpatialSpace[];
  /** 선택 층의 시설물 목록 — position 점 마커로 렌더. */
  facilities: SpatialFacility[];
  /** 현재 선택 대상 — 해당 도형에 focus 스트로크 하이라이트. */
  selection: PlanSelection | null;
  /** 도형 클릭 시 선택 통지. */
  onSelect: (selection: PlanSelection) => void;
  /** 토폴로지 오버레이 — 현재 층 노드 목록(미전달 시 오버레이 없음, 기존 렌더 동일). */
  topologyNodes?: TopologyNodeData[];
  /** 토폴로지 링크 — 양끝이 현재 층인 링크 + 한쪽만 현재 층인 vertical 링크. */
  topologyLinks?: TopologyLink[];
  /** 타 층에 있는 vertical 링크 상대 노드 — 점선 스터브의 방향·title 계산용. */
  offFloorNodes?: TopologyNodeData[];
  /** 외부(예: 상세 패널 외 소비자)에서 강조할 토폴로지 노드 id. */
  selectedTopologyNodeId?: string;
}

/** viewBox 여백(m) — bounding box 사방에 더한다. */
const PLAN_PADDING = 2;

/** 시설물 점 마커 반지름(m). */
const FACILITY_RADIUS = 0.55;

/** 공간 라벨 글자 크기(viewBox 사용자 좌표 = m). */
const LABEL_FONT_SIZE = 1.3;

/** 토폴로지 노드 원 반지름(m). */
const TOPOLOGY_NODE_RADIUS = 0.5;

/** 점검 포인트 이중 링 바깥 원 반지름(m). */
const CHECKPOINT_RING_RADIUS = 0.85;

/** 층간(vertical) 링크 점선 스터브 길이(m) — 현재 층 노드에서 상대 노드 방향으로 뻗는다. */
const VERTICAL_STUB_LENGTH = 1.8;

/** one-way 링크 방향 화살표(삼각형) 크기(m) — 길이/폭. */
const ARROW_LENGTH = 0.9;
const ARROW_WIDTH = 0.7;

/** division 코드 → 색 매핑 CSS 클래스(spatial.css `.spatial-division--*`). */
function divisionClass(division: string): string {
  return `spatial-division--${division.toLowerCase()}`;
}

/** nodeTypeCode → 색 매핑 클래스 접미(spatial.css `.topology-node--*`) — 미지 코드는 normal. */
function topologyNodeVariant(nodeTypeCode: string): string {
  return (KNOWN_NODE_TYPE_CODES as readonly string[]).includes(nodeTypeCode)
    ? nodeTypeCode
    : "normal";
}

/** 볼록다각형 라벨 기준점 — 꼭짓점 평균(별표 3 Room 볼록 제약상 내부 보장). */
function centroid(points: SpatialPoint2D[]): SpatialPoint2D {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

/** 2D 벡터 정규화 — 영벡터(계단이 평면상 같은 위치)는 기본 방향(우상단)으로 대체. */
function normalize(dx: number, dy: number): { x: number; y: number } {
  const length = Math.hypot(dx, dy);
  if (length < 1e-6) {
    return { x: Math.SQRT1_2, y: -Math.SQRT1_2 };
  }
  return { x: dx / length, y: dy / length };
}

function FloorPlanSvg({
  spaces,
  facilities,
  selection,
  onSelect,
  topologyNodes = [],
  topologyLinks = [],
  offFloorNodes = [],
  selectedTopologyNodeId,
}: FloorPlanSvgProps) {
  // 렌더 대상이 없으면 placeholder — 빈 층/미등록 사이트 방어
  if (spaces.length === 0 && facilities.length === 0 && topologyNodes.length === 0) {
    return <p className="spatial-page__plan-empty typo-text-sm">이 층에 등록된 공간이 없습니다.</p>;
  }

  // 토폴로지 노드 평면 좌표 — 렌더·bounding box·링크 끝점 해석에 공유
  const topologyPlanById = new Map(
    topologyNodes.map((node) => [node.id, toPlanPoint(node.worldPosition)]),
  );
  const offFloorById = new Map(offFloorNodes.map((node) => [node.id, node]));

  // 층 전체 bounding box 계산 — 공간 footprint 꼭짓점 + 시설물 위치 + 토폴로지 노드를 모두 포함
  const xs = [
    ...spaces.flatMap((space) => space.geometry.footprint.map((p) => p.x)),
    ...facilities.map((facility) => facility.position.x),
    ...[...topologyPlanById.values()].map((p) => p.x),
  ];
  const ys = [
    ...spaces.flatMap((space) => space.geometry.footprint.map((p) => p.y)),
    ...facilities.map((facility) => facility.position.y),
    ...[...topologyPlanById.values()].map((p) => p.y),
  ];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX + PLAN_PADDING * 2;
  const height = maxY - minY + PLAN_PADDING * 2;

  // 데이터 좌표(m, y↑) → SVG 사용자 좌표(y↓) 변환
  const mapX = (x: number) => x - minX + PLAN_PADDING;
  const mapY = (y: number) => maxY - y + PLAN_PADDING;

  return (
    <svg
      className="floor-plan"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="층 평면 미리보기"
    >
      {/* 공간 footprint 폴리곤 — division별 채움색 + 중앙 종류 라벨 */}
      {spaces.map((space) => {
        const selected = selection?.kind === "space" && selection.id === space.primaryKey;
        const points = space.geometry.footprint
          .map((p) => `${mapX(p.x)},${mapY(p.y)}`)
          .join(" ");
        const label = centroid(space.geometry.footprint);
        return (
          <g key={space.primaryKey}>
            <polygon
              className={`floor-plan__space ${divisionClass(space.division)}${
                selected ? " floor-plan__space--selected" : ""
              }`}
              points={points}
              onClick={() => onSelect({ kind: "space", id: space.primaryKey })}
            >
              <title>{`${space.name} (${divisionLabel(space.division) ?? space.division}·${space.kind})`}</title>
            </polygon>
            <text
              className="floor-plan__space-label"
              x={mapX(label.x)}
              y={mapY(label.y)}
              fontSize={LABEL_FONT_SIZE}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {space.kind}
            </text>
          </g>
        );
      })}

      {/* 시설물 점 마커 — division 마커색 원 + 시설구분 라벨 툴팁(<title>) */}
      {facilities.map((facility) => {
        const selected = selection?.kind === "facility" && selection.id === facility.objectCode;
        return (
          <circle
            key={facility.objectCode}
            className={`floor-plan__facility ${divisionClass(facility.division)}${
              selected ? " floor-plan__facility--selected" : ""
            }`}
            cx={mapX(facility.position.x)}
            cy={mapY(facility.position.y)}
            r={FACILITY_RADIUS}
            onClick={() => onSelect({ kind: "facility", id: facility.objectCode })}
          >
            <title>{`${facility.name} (${divisionLabel(facility.division) ?? facility.division}·${facility.kind})`}</title>
          </circle>
        );
      })}

      {/* 토폴로지 링크 선 — 노드 원보다 먼저 그려 선이 원 아래에 깔리게 한다 */}
      {topologyLinks.map((link) => {
        const key = `${link.sourceId}->${link.targetId}`;
        const sourcePlan = topologyPlanById.get(link.sourceId);
        const targetPlan = topologyPlanById.get(link.targetId);

        // 양끝이 현재 층 — 실선(one-way면 중간에 방향 삼각형)
        if (sourcePlan && targetPlan) {
          const x1 = mapX(sourcePlan.x);
          const y1 = mapY(sourcePlan.y);
          const x2 = mapX(targetPlan.x);
          const y2 = mapY(targetPlan.y);
          const unit = normalize(x2 - x1, y2 - y1); // SVG 좌표계 방향(source→target)
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          // 화살표 삼각형 — 꼭짓점이 target 방향, 밑변이 진행 직교 방향
          const tipX = midX + (unit.x * ARROW_LENGTH) / 2;
          const tipY = midY + (unit.y * ARROW_LENGTH) / 2;
          const baseX = midX - (unit.x * ARROW_LENGTH) / 2;
          const baseY = midY - (unit.y * ARROW_LENGTH) / 2;
          const perpX = (-unit.y * ARROW_WIDTH) / 2;
          const perpY = (unit.x * ARROW_WIDTH) / 2;
          return (
            <g key={key}>
              <line
                className={`topology-link${link.direction === "one-way" ? " topology-link--one-way" : ""}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              />
              {link.direction === "one-way" && (
                <polygon
                  className="topology-link__arrow"
                  points={`${tipX},${tipY} ${baseX + perpX},${baseY + perpY} ${baseX - perpX},${baseY - perpY}`}
                />
              )}
            </g>
          );
        }

        // 한쪽만 현재 층인 vertical 링크 — 상대 노드 방향으로 짧은 점선 스터브 + 행선 층 툴팁
        const presentId = sourcePlan ? link.sourceId : link.targetId;
        const presentPlan = sourcePlan ?? targetPlan;
        const other = offFloorById.get(sourcePlan ? link.targetId : link.sourceId);
        if (!presentPlan || !other) {
          return null; // 양끝 모두 층 밖이거나 상대 노드 미해석 — 렌더 생략
        }
        const otherPlan = toPlanPoint(other.worldPosition);
        const x1 = mapX(presentPlan.x);
        const y1 = mapY(presentPlan.y);
        const unit = normalize(mapX(otherPlan.x) - x1, mapY(otherPlan.y) - y1);
        return (
          <line
            key={`${key}@${presentId}`}
            className="topology-link topology-link--vertical"
            x1={x1}
            y1={y1}
            x2={x1 + unit.x * VERTICAL_STUB_LENGTH}
            y2={y1 + unit.y * VERTICAL_STUB_LENGTH}
          >
            <title>{`→ ${other.floorName} (${other.displayName})`}</title>
          </line>
        );
      })}

      {/* 토폴로지 노드 원 — nodeTypeCode별 색, 점검 포인트는 이중 링 */}
      {topologyNodes.map((node) => {
        const plan = topologyPlanById.get(node.id);
        if (!plan) {
          return null;
        }
        const cx = mapX(plan.x);
        const cy = mapY(plan.y);
        const selected =
          (selection?.kind === "topology" && selection.id === node.id) ||
          selectedTopologyNodeId === node.id;
        const checkpoint = node.metadata["checkpoint"] === true;
        return (
          <g key={node.id}>
            {checkpoint && (
              <circle
                className="topology-node--checkpoint"
                cx={cx}
                cy={cy}
                r={CHECKPOINT_RING_RADIUS}
              />
            )}
            <circle
              className={`topology-node topology-node--${topologyNodeVariant(node.nodeTypeCode)}${
                selected ? " topology-node--selected" : ""
              }`}
              cx={cx}
              cy={cy}
              r={TOPOLOGY_NODE_RADIUS}
              onClick={() => onSelect({ kind: "topology", id: node.id })}
            >
              <title>{`${node.displayName} (${node.nodeTypeCode}${checkpoint ? "·점검" : ""}${node.isExit ? "·비상구" : ""})`}</title>
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

export default FloorPlanSvg;
