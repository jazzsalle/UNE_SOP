/**
 * FloorPlanSvg — 선택 층의 공간 footprint 폴리곤과 시설물 점 마커를 SVG로 렌더한다.
 * 좌표계: 공간 데이터는 미터 단위·y축 위 방향, SVG는 y축 아래 방향이므로
 * viewBox 계산 시 y를 반전(mapY = maxY - y)해 평면도 방향을 유지한다.
 * 색상은 spatial.css의 `.spatial-division--*` 커스텀 프로퍼티(전부 var() 토큰)로만 칠한다.
 */
import type { SpatialFacility, SpatialSpace, SpatialPoint2D } from "../domain/spatial";
import { divisionLabel } from "../domain/spatial";

/** 평면 뷰 선택 대상 — 공간(기본키) 또는 시설물(3차원객체코드). */
export type PlanSelection =
  | { kind: "space"; id: string }
  | { kind: "facility"; id: string };

interface FloorPlanSvgProps {
  /** 선택 층의 공간 목록 — footprint 폴리곤으로 렌더. */
  spaces: SpatialSpace[];
  /** 선택 층의 시설물 목록 — position 점 마커로 렌더. */
  facilities: SpatialFacility[];
  /** 현재 선택 대상 — 해당 도형에 focus 스트로크 하이라이트. */
  selection: PlanSelection | null;
  /** 도형 클릭 시 선택 통지. */
  onSelect: (selection: PlanSelection) => void;
}

/** viewBox 여백(m) — bounding box 사방에 더한다. */
const PLAN_PADDING = 2;

/** 시설물 점 마커 반지름(m). */
const FACILITY_RADIUS = 0.55;

/** 공간 라벨 글자 크기(viewBox 사용자 좌표 = m). */
const LABEL_FONT_SIZE = 1.3;

/** division 코드 → 색 매핑 CSS 클래스(spatial.css `.spatial-division--*`). */
function divisionClass(division: string): string {
  return `spatial-division--${division.toLowerCase()}`;
}

/** 볼록다각형 라벨 기준점 — 꼭짓점 평균(별표 3 Room 볼록 제약상 내부 보장). */
function centroid(points: SpatialPoint2D[]): SpatialPoint2D {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function FloorPlanSvg({ spaces, facilities, selection, onSelect }: FloorPlanSvgProps) {
  // 렌더 대상이 없으면 placeholder — 빈 층/미등록 사이트 방어
  if (spaces.length === 0 && facilities.length === 0) {
    return <p className="spatial-page__plan-empty typo-text-sm">이 층에 등록된 공간이 없습니다.</p>;
  }

  // 층 전체 bounding box 계산 — 공간 footprint 꼭짓점 + 시설물 위치를 모두 포함
  const xs = [
    ...spaces.flatMap((space) => space.geometry.footprint.map((p) => p.x)),
    ...facilities.map((facility) => facility.position.x),
  ];
  const ys = [
    ...spaces.flatMap((space) => space.geometry.footprint.map((p) => p.y)),
    ...facilities.map((facility) => facility.position.y),
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
    </svg>
  );
}

export default FloorPlanSvg;
