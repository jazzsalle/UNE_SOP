/**
 * normalizeGraph — 편집기 스냅샷(EditorSnapshot)을 제품 데이터 모델 `SOPGraph`로 정규화한다.
 * (React Flow nodes/edges → normalizeGraph() → SOPGraph → validateGraph() → compileGraph())
 * 편집기 레이어(studio/*)를 import하지 않는 순수 모듈이다.
 */
import type {
  EdgeType,
  GraphEdge,
  GraphGroup,
  GraphNode,
  PortDataType,
  SOPGraph,
} from "../domain";
import type { EditorEdgeSnapshot, EditorSnapshot, GraphMeta } from "./types";

/**
 * PortDataType → EdgeType 매핑표.
 * 주의: `studio/state/portCompatibility.ts`의 DATA_TYPE_TO_EDGE_TYPE와 동일 내용의 **이중 정의**다.
 * 엔진은 편집기 레이어를 import할 수 없어 자체 보유한다 — 한쪽을 수정하면 다른 쪽도 함께 수정할 것.
 */
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

/** 소스 노드의 소스 포트 dataType으로 EdgeType을 유도한다. 판정 불가 시 execution_flow로 폴백. */
function deriveEdgeType(
  edge: EditorEdgeSnapshot,
  nodeById: Map<string, GraphNode>,
): EdgeType {
  const sourceNode = nodeById.get(edge.source);
  const sourcePort = sourceNode?.ports.find((port) => port.id === edge.sourceHandle);
  return sourcePort ? DATA_TYPE_TO_EDGE_TYPE[sourcePort.dataType] : "execution_flow";
}

/**
 * 편집기 스냅샷을 SOPGraph로 정규화한다.
 * - 노드: `data.graphNode`를 structuredClone하고 스냅샷의 position으로 동기화한다.
 *   parentId가 있는 노드(그룹 자식)는 RF 규약대로 부모 상대좌표를 그대로 저장한다.
 * - 그룹: `parentId === 그룹노드.id`인 자식들로 `groups`를 구성하고, 그룹 GraphNode의 children도 동기화한다.
 * - 엣지: edgeType은 편집기가 실어 준 `data.edgeType`을 우선하고, 없으면 소스 포트 dataType으로 유도한다.
 */
export function normalizeGraph(snapshot: EditorSnapshot, meta: GraphMeta): SOPGraph {
  const now = new Date().toISOString();

  // 1) 노드 정규화 — 도메인 GraphNode 복제 + 캔버스 position 동기화.
  const nodes: GraphNode[] = snapshot.nodes.map((editorNode) => {
    const graphNode = structuredClone(editorNode.data.graphNode);
    graphNode.position = { x: editorNode.position.x, y: editorNode.position.y };
    return graphNode;
  });
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  // 2) 그룹 구성 — parentId 기준으로 자식 노드 id를 수집한다.
  const childIdsByGroupId = new Map<string, string[]>();
  for (const editorNode of snapshot.nodes) {
    if (!editorNode.parentId) continue;
    const siblings = childIdsByGroupId.get(editorNode.parentId) ?? [];
    siblings.push(editorNode.id);
    childIdsByGroupId.set(editorNode.parentId, siblings);
  }
  const groups: GraphGroup[] = [];
  for (const node of nodes) {
    if (node.type !== "sop_group") continue;
    const nodeIds = childIdsByGroupId.get(node.id) ?? [];
    node.children = nodeIds;
    groups.push({
      id: node.id,
      label: node.label,
      nodeIds,
      collapsed: node.collapsed,
    });
  }

  // 3) 엣지 정규화 — 포트 id와 EdgeType을 도메인 규약으로 확정한다.
  const edges: GraphEdge[] = snapshot.edges.map((editorEdge) => ({
    id: editorEdge.id,
    sourceNodeId: editorEdge.source,
    sourcePortId: editorEdge.sourceHandle!,
    targetNodeId: editorEdge.target,
    targetPortId: editorEdge.targetHandle!,
    edgeType: editorEdge.data?.edgeType ?? deriveEdgeType(editorEdge, nodeById),
  }));

  return {
    graphId: meta.graphId,
    name: meta.name,
    description: meta.description,
    domain: meta.domain,
    version: meta.version,
    nodes,
    edges,
    groups,
    createdAt: meta.createdAt ?? now,
    updatedAt: now,
  };
}
