/**
 * 타입드 포트 연결 검증 유틸 — 포트 방향/데이터 타입 일치 규칙으로 연결 가능 여부를 판정하고,
 * 연결 성립 시 생성할 도메인 EdgeType을 결정한다.
 */
import type { EdgeType, GraphNode, NodePort, PortDataType } from "../../domain";
import type { StudioEdge, StudioNode } from "./editorTypes";

/** PortDataType → EdgeType 매핑표 — 연결선의 도메인 성격은 소스 포트의 데이터 타입이 결정한다. */
const DATA_TYPE_TO_EDGE_TYPE: Record<PortDataType, EdgeType> = {
  event: "event_flow",
  scoped_event: "scope_flow",
  asset: "asset_flow",
  condition_result: "condition_flow",
  execution_flow: "execution_flow",
  mission: "execution_flow",
  mission_status: "response_flow",
  notification_payload: "notification_flow",
  response: "response_flow",
  record: "record_flow",
};

/** 포트 데이터 타입에 대응하는 도메인 EdgeType을 반환한다. */
export function edgeTypeForDataType(dataType: PortDataType): EdgeType {
  return DATA_TYPE_TO_EDGE_TYPE[dataType];
}

/** GraphNode에서 portId로 포트 정의를 조회한다. 없으면 undefined. */
export function findPort(node: GraphNode, portId: string): NodePort | undefined {
  return node.ports.find((port) => port.id === portId);
}

/** checkConnection 판정 결과 — 거부 시 reason, 허용 시 생성할 edgeType을 담는다. */
export interface ConnectionCheckResult {
  ok: boolean;
  reason?: string;
  edgeType?: EdgeType;
}

/**
 * 연결 시도를 검증한다. 규칙(전부 충족 시에만 허용):
 * 1. self-loop 금지
 * 2. source 포트는 direction "output"
 * 3. target 포트는 direction "input"
 * 4. 양쪽 포트의 dataType 완전 일치
 * 5. 동일 포트쌍(source·sourceHandle·target·targetHandle) 중복 엣지 금지
 * 6. target 포트가 multiple !== true면 기존 incoming 엣지 존재 시 거부
 */
export function checkConnection(
  conn: {
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
  },
  nodes: StudioNode[],
  edges: StudioEdge[],
): ConnectionCheckResult {
  if (conn.source === conn.target) {
    return { ok: false, reason: "같은 노드끼리는 연결할 수 없습니다 (self-loop 금지)." };
  }
  if (!conn.sourceHandle || !conn.targetHandle) {
    return { ok: false, reason: "연결할 포트가 지정되지 않았습니다." };
  }

  const sourceNode = nodes.find((node) => node.id === conn.source);
  const targetNode = nodes.find((node) => node.id === conn.target);
  if (!sourceNode || !targetNode) {
    return { ok: false, reason: "연결 대상 노드를 찾을 수 없습니다." };
  }

  const sourcePort = findPort(sourceNode.data.graphNode, conn.sourceHandle);
  const targetPort = findPort(targetNode.data.graphNode, conn.targetHandle);
  if (!sourcePort || !targetPort) {
    return { ok: false, reason: "연결 대상 포트를 찾을 수 없습니다." };
  }

  if (sourcePort.direction !== "output") {
    return { ok: false, reason: `소스 포트 "${sourcePort.label}"는 output 포트가 아닙니다.` };
  }
  if (targetPort.direction !== "input") {
    return { ok: false, reason: `타깃 포트 "${targetPort.label}"는 input 포트가 아닙니다.` };
  }
  if (sourcePort.dataType !== targetPort.dataType) {
    return {
      ok: false,
      reason: `포트 데이터 타입이 다릅니다 (${sourcePort.dataType} → ${targetPort.dataType}).`,
    };
  }

  const isDuplicate = edges.some(
    (edge) =>
      edge.source === conn.source &&
      edge.sourceHandle === conn.sourceHandle &&
      edge.target === conn.target &&
      edge.targetHandle === conn.targetHandle,
  );
  if (isDuplicate) {
    return { ok: false, reason: "이미 동일한 포트쌍의 연결이 존재합니다." };
  }

  if (targetPort.multiple !== true) {
    const hasIncoming = edges.some(
      (edge) => edge.target === conn.target && edge.targetHandle === conn.targetHandle,
    );
    if (hasIncoming) {
      return {
        ok: false,
        reason: `타깃 포트 "${targetPort.label}"는 하나의 연결만 허용합니다.`,
      };
    }
  }

  return { ok: true, edgeType: edgeTypeForDataType(sourcePort.dataType) };
}
