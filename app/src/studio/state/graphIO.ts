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
 * 그룹 프레임 자동 보정용 자식 노드 추정 크기/여백(px).
 * 로드 시점엔 RF 측정값(measured)이 없어 sop_task 렌더 크기를 추정치로 사용한다
 * (min-width 200 + 여유 / 헤더 + 포트 3행 높이).
 */
const EST_CHILD_WIDTH = 220;
const EST_CHILD_HEIGHT = 110;
const GROUP_FIT_PADDING = 16;

/**
 * SOPGraph를 캔버스에 배치 가능한 RF 노드/엣지로 변환한다.
 * - node.type: sop_group → "sopGroup", 그 외 → "sopNode" (커스텀 노드 타입 규약).
 * - style ← graphNode.size (그룹 컨테이너 크기).
 * - graph.groups의 nodeIds에 든 노드는 parentId로 그룹 자식 배치
 *   (position은 SOPGraph 규약대로 이미 부모 상대좌표). extent는 지정하지 않는다 —
 *   자식을 프레임 밖으로 드래그해 분리(detach)할 수 있어야 하기 때문 (dragReparent 참조).
 * - 그룹 프레임 자동 보정: 자식 배치 영역(자식 position + 추정 크기 + 여백)이 프레임을
 *   넘으면 그룹 크기를 확장한다. graphNode.size도 함께 동기화한다
 *   (groupCollapse가 펼침 시 graphNode.size.height로 프레임을 복원하므로).
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
    }
    return node;
  });

  // 그룹 프레임 자동 보정 — 자식이 프레임을 넘치지 않도록 그룹 크기를 확장한다.
  const childrenByParent = new Map<string, StudioNode[]>();
  for (const node of nodes) {
    if (!node.parentId) continue;
    const siblings = childrenByParent.get(node.parentId) ?? [];
    siblings.push(node);
    childrenByParent.set(node.parentId, siblings);
  }
  for (const group of nodes) {
    if (group.type !== "sopGroup") continue;
    const children = childrenByParent.get(group.id);
    if (!children || children.length === 0) continue;
    const requiredWidth =
      Math.max(
        ...children.map(
          (child) =>
            child.position.x +
            (child.data.graphNode.size?.width ?? EST_CHILD_WIDTH),
        ),
      ) + GROUP_FIT_PADDING;
    const requiredHeight =
      Math.max(
        ...children.map(
          (child) =>
            child.position.y +
            (child.data.graphNode.size?.height ?? EST_CHILD_HEIGHT),
        ),
      ) + GROUP_FIT_PADDING;
    const baseWidth =
      typeof group.style?.width === "number" ? group.style.width : 0;
    const baseHeight =
      typeof group.style?.height === "number" ? group.style.height : 0;
    const width = Math.max(baseWidth, requiredWidth);
    const height = Math.max(baseHeight, requiredHeight);
    if (width !== baseWidth || height !== baseHeight) {
      group.style = { ...group.style, width, height };
      // groupCollapse의 펼침 복원 소스(graphNode.size)도 확장 크기로 동기화.
      group.data = {
        graphNode: { ...group.data.graphNode, size: { width, height } },
      };
    }
  }

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
