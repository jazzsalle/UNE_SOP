/**
 * graphIO — 편집기 레이어(StudioNode/StudioEdge) ↔ 도메인 모델(SOPGraph) 변환 어댑터.
 * 엔진(engine/*)은 편집기를 모르는 순수 모듈이므로, 방향별 변환은 여기서만 담당한다.
 *  - toEditorSnapshot: RF 상태 → normalizeGraph() 입력 스냅샷 (얕은 매핑)
 *  - toStudioGraph:    SOPGraph(시드/저장본) → RF 캔버스 배치용 노드/엣지
 */
import type { SOPGraph } from "../../domain";
import type { EditorSnapshot } from "../../engine";
import type { StudioEdge, StudioNode } from "./editorTypes";
import { EDGE_COLOR_TOKEN } from "./flowTokens";

/** RF 노드/엣지를 엔진 입력 스냅샷으로 얕게 매핑한다 (id/position/parentId/data 그대로). */
export function toEditorSnapshot(
  nodes: StudioNode[],
  edges: StudioEdge[],
): EditorSnapshot {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      position: node.position,
      parentId: node.parentId,
      data: node.data,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      data: edge.data,
    })),
  };
}

/**
 * SOPGraph를 캔버스에 배치 가능한 RF 노드/엣지로 변환한다.
 * - node.type: sop_group → "sopGroup", 그 외 → "sopNode" (커스텀 노드 타입 규약).
 * - style ← graphNode.size (그룹 컨테이너 크기).
 * - graph.groups의 nodeIds에 든 노드는 parentId/extent:"parent"로 그룹 자식 배치
 *   (position은 SOPGraph 규약대로 이미 부모 상대좌표).
 * - RF 규칙: 부모(그룹) 노드가 배열에서 자식보다 앞에 와야 하므로 부모 우선 정렬한다.
 */
export function toStudioGraph(graph: SOPGraph): {
  nodes: StudioNode[];
  edges: StudioEdge[];
} {
  // 그룹 자식 → 부모 그룹 id 역인덱스.
  const parentByNodeId = new Map<string, string>();
  for (const group of graph.groups ?? []) {
    for (const childId of group.nodeIds) {
      parentByNodeId.set(childId, group.id);
    }
  }

  const nodes: StudioNode[] = graph.nodes.map((graphNode) => {
    const node: StudioNode = {
      id: graphNode.id,
      type: graphNode.type === "sop_group" ? "sopGroup" : "sopNode",
      position: { ...graphNode.position },
      data: { graphNode },
    };
    if (graphNode.size) {
      node.style = {
        width: graphNode.size.width,
        height: graphNode.size.height,
      };
    }
    const parentId = parentByNodeId.get(graphNode.id);
    if (parentId) {
      node.parentId = parentId;
      node.extent = "parent";
    }
    return node;
  });

  // 부모(parentId 없는 노드) 먼저, 그룹 자식은 뒤로 — RF 부모-자식 순서 규칙.
  const ordered = [
    ...nodes.filter((node) => !node.parentId),
    ...nodes.filter((node) => node.parentId),
  ];

  const edges: StudioEdge[] = graph.edges.map((graphEdge) => ({
    id: graphEdge.id,
    source: graphEdge.sourceNodeId,
    sourceHandle: graphEdge.sourcePortId,
    target: graphEdge.targetNodeId,
    targetHandle: graphEdge.targetPortId,
    data: { edgeType: graphEdge.edgeType },
    style: { stroke: `var(${EDGE_COLOR_TOKEN[graphEdge.edgeType]})` },
  }));

  return { nodes: ordered, edges };
}
