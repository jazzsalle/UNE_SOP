/**
 * 노드 팩토리 — 팔레트 템플릿(NodeTemplate)으로부터 캔버스에 배치할 GraphNode를 생성한다.
 * 템플릿의 기본 속성/포트를 깊은 복사해 노드 간 참조 공유를 방지한다.
 */
import type { GraphNode, NodeTemplate } from "./types";

/**
 * 템플릿과 캔버스 좌표로 새 GraphNode를 생성한다.
 * id 미지정 시 `node-{nodeType}-{uuid8}` 형식으로 자동 발급한다.
 */
export function createNodeFromTemplate(
  template: NodeTemplate,
  position: { x: number; y: number },
  id?: string,
): GraphNode {
  const node: GraphNode = {
    id: id ?? `node-${template.nodeType}-${crypto.randomUUID().slice(0, 8)}`,
    type: template.nodeType,
    label: template.label,
    description: template.description,
    properties: structuredClone(template.defaultProperties),
    ports: structuredClone(template.ports),
    position: { ...position },
  };
  if (template.defaultSize) {
    node.size = { ...template.defaultSize };
  }
  return node;
}
