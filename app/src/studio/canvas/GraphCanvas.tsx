/**
 * Graph Canvas — 중앙 무한 캔버스 (컨트롤드 React Flow).
 * 상태/핸들러는 GraphStudioContext(useStudio)가 단일 소스로 제공하며,
 * React Flow는 시각 편집기 레이어일 뿐이다. 제품 데이터 모델(SOPGraph)과는
 * 이후 normalizeGraph() 단계에서 분리·변환된다. (Phase 4)
 *
 * 담당: 팔레트 드롭 생성(그룹 자식 배치 포함), 노드 드래그 종료 시 그룹 탈착/부착,
 * 타입드 포트 연결 검증, MiniMap/Controls/Background, Delete/Backspace 삭제.
 */
import { useCallback, useMemo, type DragEvent } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type OnNodeDrag,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getTemplate } from "../../domain";
import { TEMPLATE_DRAG_MIME, type StudioNode } from "../state/editorTypes";
import { useStudio } from "../state/GraphStudioContext";
import { findExpandedGroupAt } from "../state/dragReparent";
import { nodeTypes } from "./nodes/nodeTypes";
import { accentTokenForNodeType } from "./nodes/SOPNode";
import { defaultEdgeOptions } from "./edgeOptions";
import "./canvas.css";

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
    reparentNodeAfterDrag,
    simulation,
  } = useStudio();
  const { screenToFlowPosition } = useReactFlow();

  // ── 실행 경로 하이라이트 (Phase 4 T7) ──
  // simulation 존재 시 방문 노드/엣지에 className만 입힌 **파생 배열**을 만들어
  // ReactFlow에 넘긴다. 원본 nodes/edges 상태는 불변이므로 clearSimulation 시
  // 자동 원상 복구되고, RF change 이벤트는 id 기준이라 드래그/연결 등 편집도 유지된다.
  const visited = useMemo(
    () => new Set(simulation?.visitedNodeIds ?? []),
    [simulation],
  );
  const traversed = useMemo(
    () => new Set(simulation?.traversedEdgeIds ?? []),
    [simulation],
  );
  const displayNodes = useMemo(
    () =>
      simulation
        ? nodes.map((node) => ({
            ...node,
            className: visited.has(node.id)
              ? "sim-node--active"
              : "sim-node--dimmed",
          }))
        : nodes,
    [simulation, nodes, visited],
  );
  const displayEdges = useMemo(
    () =>
      simulation
        ? edges.map((edge) =>
            traversed.has(edge.id)
              ? { ...edge, animated: true, className: "sim-edge--active" }
              : { ...edge, className: "sim-edge--dimmed" },
          )
        : edges,
    [simulation, edges, traversed],
  );

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

  // 드래그 종료 시 그룹 탈착/부착 — 자식을 프레임 밖에 놓으면 detach,
  // 독립 sop_task를 펼쳐진 그룹 위에 놓으면 attach (판정은 dragReparent가 담당).
  // 판정점은 드롭 시점의 포인터 flow 좌표 — 노드 중심점 기준은 노드가 프레임에
  // 걸쳐 있을 때 attach가 조용히 실패했다(에러3). 좌표를 못 얻으면 중심점 폴백.
  const onNodeDragStop = useCallback<OnNodeDrag<StudioNode>>(
    (event, node) => {
      // 마우스는 event 자체, 터치는 changedTouches[0]에서 스크린 좌표를 얻는다.
      const source = "clientX" in event ? event : event.changedTouches[0];
      const dropPoint =
        source && Number.isFinite(source.clientX) && Number.isFinite(source.clientY)
          ? screenToFlowPosition({ x: source.clientX, y: source.clientY })
          : undefined;
      reparentNodeAfterDrag(node.id, dropPoint);
    },
    [reparentNodeAfterDrag, screenToFlowPosition],
  );

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 0 }}>
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeDragStop={onNodeDragStop}
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
