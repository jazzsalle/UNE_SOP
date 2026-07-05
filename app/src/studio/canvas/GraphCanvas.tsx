/**
 * Graph Canvas — 중앙 무한 캔버스 (컨트롤드 React Flow).
 * 상태/핸들러는 GraphStudioContext(useStudio)가 단일 소스로 제공하며,
 * React Flow는 시각 편집기 레이어일 뿐이다. 제품 데이터 모델(SOPGraph)과는
 * 이후 normalizeGraph() 단계에서 분리·변환된다. (Phase 4)
 *
 * 담당: 팔레트 드롭 생성(그룹 자식 배치 포함), 타입드 포트 연결 검증,
 * MiniMap/Controls/Background, Delete/Backspace 삭제.
 */
import { useCallback, type DragEvent } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type XYPosition,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getTemplate } from "../../domain";
import { TEMPLATE_DRAG_MIME, type StudioNode } from "../state/editorTypes";
import { useStudio } from "../state/GraphStudioContext";
import { nodeTypes } from "./nodes/nodeTypes";
import { accentTokenForNodeType } from "./nodes/SOPNode";
import { defaultEdgeOptions } from "./edgeOptions";
import "./canvas.css";

/** 노드의 렌더 크기 — 측정값(measured) 우선, 없으면 style의 숫자 값 폴백. */
function nodeSize(node: StudioNode): { width: number; height: number } {
  const styleWidth =
    typeof node.style?.width === "number" ? node.style.width : 0;
  const styleHeight =
    typeof node.style?.height === "number" ? node.style.height : 0;
  return {
    width: node.measured?.width ?? styleWidth,
    height: node.measured?.height ?? styleHeight,
  };
}

/**
 * 드롭 좌표(flow 좌표계)를 포함하는 펼쳐진 SOP Group 프레임을 찾는다.
 * 겹칠 경우 배열 뒤쪽(위에 그려지는) 그룹을 우선한다. 없으면 null.
 */
function findExpandedGroupAt(
  nodes: StudioNode[],
  point: XYPosition,
): StudioNode | null {
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const node = nodes[i];
    if (node.type !== "sopGroup" || node.data.graphNode.collapsed) {
      continue;
    }
    const { width, height } = nodeSize(node);
    if (
      point.x >= node.position.x &&
      point.x <= node.position.x + width &&
      point.y >= node.position.y &&
      point.y <= node.position.y + height
    ) {
      return node;
    }
  }
  return null;
}

/** MiniMap 노드 색 — 노드 타입의 accent 토큰을 var() 문자열로 반환. */
function minimapNodeColor(node: StudioNode): string {
  return `var(${accentTokenForNodeType(node.data.graphNode.type)})`;
}

function GraphCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    addNodeFromTemplate,
  } = useStudio();
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes(TEMPLATE_DRAG_MIME)) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      const templateId = event.dataTransfer.getData(TEMPLATE_DRAG_MIME);
      if (!templateId) {
        return;
      }
      event.preventDefault();
      const template = getTemplate(templateId);
      if (!template) {
        return;
      }
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      // sop_task를 펼쳐진 SOP Group 프레임 위에 드롭하면 그룹 자식으로 생성
      // (position은 부모 상대좌표로 변환해 전달).
      if (template.nodeType === "sop_task") {
        const group = findExpandedGroupAt(nodes, position);
        if (group) {
          addNodeFromTemplate(
            templateId,
            {
              x: position.x - group.position.x,
              y: position.y - group.position.y,
            },
            group.id,
          );
          return;
        }
      }
      addNodeFromTemplate(templateId, position);
    },
    [nodes, addNodeFromTemplate, screenToFlowPosition],
  );

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 0 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onDragOver={onDragOver}
        onDrop={onDrop}
        deleteKeyCode={["Delete", "Backspace"]}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="var(--color-border-default)"
        />
        <Controls />
        <MiniMap pannable zoomable nodeColor={minimapNodeColor} />
      </ReactFlow>
    </div>
  );
}

export default GraphCanvas;
