/**
 * 에디터 색상 토큰 맵 — 포트 핸들/엣지 색을 디자인 시스템 CSS 변수명으로 지정한다.
 * 값은 CSS 변수명 문자열이며 사용처에서 `var(...)`로 감싸 쓴다. hex/rgb 하드코딩 금지.
 * (토큰 실존 근거: design-system/tokens/semantic/colors.css, colors-status.css)
 */
import type { EdgeType, PortDataType } from "../../domain";

/** PortDataType별 포트 핸들 색 토큰 — 같은 흐름 계열은 같은 색으로 통일한다. */
export const PORT_COLOR_TOKEN: Record<PortDataType, string> = {
  event: "--color-bg-danger",
  scoped_event: "--color-bg-warning",
  asset: "--color-bg-info",
  condition_result: "--color-bg-warning",
  execution_flow: "--color-bg-brand",
  mission: "--color-bg-brand",
  mission_status: "--color-bg-success",
  notification_payload: "--color-bg-info",
  response: "--color-bg-success",
  record: "--color-bg-neutral",
};

/** EdgeType별 연결선 stroke 색 토큰 — PORT_COLOR_TOKEN과 계열을 맞춘다. */
export const EDGE_COLOR_TOKEN: Record<EdgeType, string> = {
  event_flow: "--color-bg-danger",
  scope_flow: "--color-bg-warning",
  asset_flow: "--color-bg-info",
  condition_flow: "--color-bg-warning",
  execution_flow: "--color-bg-brand",
  notification_flow: "--color-bg-info",
  response_flow: "--color-bg-success",
  record_flow: "--color-bg-neutral",
};
