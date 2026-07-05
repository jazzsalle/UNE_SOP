import { ReactFlowProvider } from "@xyflow/react";
import GraphCanvas from "./canvas/GraphCanvas";
import NodePalette from "./panels/NodePalette";
import PropertyInspector from "./panels/PropertyInspector";
import ValidationPanel from "./panels/ValidationPanel";
import { GraphStudioProvider } from "./state/GraphStudioContext";

/**
 * Graph Studio — 4영역 레이아웃.
 *
 *  ┌────────────── header ──────────────┐
 *  │ Node Palette │ Canvas │ Inspector  │
 *  ├──────── Validation / Compile ──────┤
 *  └────────────────────────────────────┘
 *
 * 레이아웃 치수는 html font-size 1px 전제(rem 기반 토큰)와 무관하게
 * px 단위 inline style로 직접 지정한다.
 *
 * 상태: ReactFlowProvider(RF 내부 스토어) → GraphStudioProvider(편집기 공유 상태)
 * 순으로 감싸 세 패널이 동일한 nodes/edges 소스를 공유한다.
 */
function GraphStudio() {
  return (
    <ReactFlowProvider>
      <GraphStudioProvider>
        <GraphStudioLayout />
      </GraphStudioProvider>
    </ReactFlowProvider>
  );
}

/** 4영역 그리드 레이아웃 — Provider 내부에서 렌더되는 실제 화면 구성. */
function GraphStudioLayout() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr 320px",
        gridTemplateRows: "auto 1fr 180px",
        gridTemplateAreas: `
          "header header header"
          "palette canvas inspector"
          "validation validation validation"
        `,
        height: "100vh",
        background: "var(--color-bg-muted)",
        color: "var(--color-text-default)",
      }}
    >
      <header
        style={{
          gridArea: "header",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          height: 52,
          background: "var(--color-bg-surface)",
          borderBottom: "1px solid var(--color-border-default)",
        }}
      >
        <h1
          className="typo-title-sm font-bold"
          style={{ margin: 0, color: "var(--color-text-default)" }}
        >
          Visual SOP Graph Studio
        </h1>
      </header>

      <div style={{ gridArea: "palette", minHeight: 0 }}>
        <NodePalette />
      </div>

      <main style={{ gridArea: "canvas", minWidth: 0, minHeight: 0 }}>
        <GraphCanvas />
      </main>

      <div style={{ gridArea: "inspector", minHeight: 0 }}>
        <PropertyInspector />
      </div>

      <div style={{ gridArea: "validation", minHeight: 0 }}>
        <ValidationPanel />
      </div>
    </div>
  );
}

export default GraphStudio;
