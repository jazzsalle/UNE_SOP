/**
 * 캔버스 공통 엣지 옵션 — 모든 연결선의 기본 형태(smoothstep + 닫힌 화살표).
 * 엣지별 stroke 색은 onConnect(GraphStudioContext)에서 EDGE_COLOR_TOKEN 기반
 * `var(--color-…)` 문자열로 style.stroke에 지정된다(SVG에서 CSS 변수 동작).
 */
import { MarkerType, type DefaultEdgeOptions } from "@xyflow/react";

export const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed },
};
