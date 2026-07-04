import { Background, Controls, ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/**
 * Graph Canvas — 중앙 무한 캔버스.
 * React Flow는 시각 편집기 레이어일 뿐이며, 제품 데이터 모델(SOPGraph)과는
 * 이후 normalizeGraph() 단계에서 분리·변환된다. (Phase 3~4)
 */
function GraphCanvas() {
  return (
    <div style={{ width: "100%", height: "100%", minHeight: 0 }}>
      <ReactFlowProvider>
        <ReactFlow nodes={[]} edges={[]} proOptions={{ hideAttribution: true }} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export default GraphCanvas;
