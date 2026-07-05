/**
 * SOP Group 접기/펼치기 헬퍼 — 그룹 노드의 collapsed 상태를 갱신하고
 * 자식 노드·관련 엣지의 hidden을 동기화한 새 배열을 반환한다 (불변 갱신).
 */
import type { StudioEdge, StudioNode } from "./editorTypes";

/**
 * 그룹 접기/펼치기를 적용한다.
 * - 그룹 노드: `data.graphNode.collapsed = collapsed` (graphNode 스프레드로 새 참조 생성)
 *   + 접힘 시 style.height 제거(요약 목록 크기로 축소), 펼침 시 도메인 size로 복원 (대칭 갱신)
 * - `parentId === groupId`인 자식 노드: `hidden = collapsed`
 * - 양 끝 중 하나라도 hidden인 노드에 연결된 엣지: `hidden = true`, 아니면 `hidden = false`
 */
export function applyGroupCollapse(
  nodes: StudioNode[],
  edges: StudioEdge[],
  groupId: string,
  collapsed: boolean,
): { nodes: StudioNode[]; edges: StudioEdge[] } {
  const nextNodes = nodes.map((node): StudioNode => {
    if (node.id === groupId) {
      const next: StudioNode = {
        ...node,
        data: { ...node.data, graphNode: { ...node.data.graphNode, collapsed } },
      };
      // 프레임 높이는 도메인 size(팩토리가 템플릿 defaultSize를 복사)를 소스로 복원한다.
      const frameHeight = node.data.graphNode.size?.height;
      if (frameHeight !== undefined) {
        const { height: _omitted, ...restStyle } = node.style ?? {};
        next.style = collapsed ? restStyle : { ...restStyle, height: frameHeight };
      }
      return next;
    }
    if (node.parentId === groupId) {
      return { ...node, hidden: collapsed };
    }
    return node;
  });

  const hiddenNodeIds = new Set(
    nextNodes.filter((node) => node.hidden === true).map((node) => node.id),
  );

  const nextEdges = edges.map((edge): StudioEdge => {
    const hidden = hiddenNodeIds.has(edge.source) || hiddenNodeIds.has(edge.target);
    if (hidden === (edge.hidden ?? false)) {
      return edge;
    }
    return { ...edge, hidden };
  });

  return { nodes: nextNodes, edges: nextEdges };
}
