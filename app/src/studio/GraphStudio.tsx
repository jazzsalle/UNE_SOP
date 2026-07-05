import GraphCanvas from "./canvas/GraphCanvas";
import BottomTabs from "./panels/BottomTabs";
import NodePalette from "./panels/NodePalette";
import PropertyInspector from "./panels/PropertyInspector";
import SimulateDialog from "./panels/SimulateDialog";
import StudioToolbar from "./panels/StudioToolbar";

/**
 * Graph Studio — 4영역 레이아웃.
 *
 *  ┌────────────────── header ──────────────────┐
 *  │ Node Palette │ Canvas │ Inspector          │
 *  ├── Validation / Compile | Runtime Preview ──┤
 *  └────────────────────────────────────────────┘
 *
 * 레이아웃 치수는 html font-size 1px 전제(rem 기반 토큰)와 무관하게
 * px 단위 inline style로 직접 지정한다.
 *
 * 상태: ReactFlowProvider(RF 내부 스토어) → GraphStudioProvider(편집기 공유 상태)는
 * Phase 9에서 App 레벨로 승격됐다(결정 2 — 시나리오 실행기/튜토리얼이 Studio API 공유).
 * 이 컴포넌트는 Provider 내부에서 렌더되는 레이아웃만 담당한다.
 */
function GraphStudio() {
  return <GraphStudioLayout />;
}

/** 4영역 그리드 레이아웃 — Provider 내부에서 렌더되는 실제 화면 구성. */
function GraphStudioLayout() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr 320px",
        gridTemplateRows: "auto 1fr 260px",
        gridTemplateAreas: `
          "header header header"
          "palette canvas inspector"
          "bottom bottom bottom"
        `,
        height: "100%",
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
          style={{ margin: 0, color: "var(--color-text-default)", flexShrink: 0 }}
        >
          Visual SOP Graph Studio
        </h1>
        <StudioToolbar />
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

      <div style={{ gridArea: "bottom", minHeight: 0 }}>
        <BottomTabs />
      </div>

      {/* EventContext 시뮬레이터 — simulateDialogOpen이 true일 때만 오버레이로 뜬다. */}
      <SimulateDialog />
    </div>
  );
}

export default GraphStudio;
