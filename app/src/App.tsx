/**
 * App 셸 — 상단 글로벌 내비(~48px)에서 "Graph Studio | 전자상황판 | 현장 회신 | 공간 모델 | 시나리오"
 * 뷰를 전환한다.
 * react-router 미도입(Phase 5 선행 판단 1): App 레벨 상태로 뷰를 전환하되,
 * **모든 뷰를 마운트한 채 비활성 뷰는 `display:none`으로만 숨긴다** —
 * GraphStudio를 언마운트하면 React Flow 캔버스 편집 상태가 소실되기 때문.
 * (공간 모델 뷰는 정적 데이터라 lazy 렌더도 무방하나 기존 패턴을 그대로 따른다.)
 * 현장 회신(responder) 뷰는 subscribeRuns의 same-tab 동기 notify로 대시보드와
 * 실시간 연동되므로 같은 앱 내 뷰로 둔다(Phase 8 선행 결정 1).
 *
 * Phase 9 (결정 2): ReactFlowProvider → GraphStudioProvider를 App 최상위로 승격해
 * 시나리오 실행기/튜토리얼이 Studio API(loadDomainTemplate/runCompile 등)를 호출할 수 있게 하고,
 * activeView를 AppViewContext로 노출해 뷰 전환도 외부에서 제어 가능하게 한다.
 * 내비 탭/버튼에는 튜토리얼(T6)이 소비하는 data-tutorial-id를 부여한다.
 * 색상은 전부 디자인 시스템 CSS 변수 토큰 사용 (hex/rgb 하드코딩 금지).
 */
import { useMemo, useState, type CSSProperties } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import DashboardPage from "./dashboard/DashboardPage";
import ResponderPage from "./responder/ResponderPage";
import ScenarioPage from "./scenario/ScenarioPage";
import { AppViewContext, type AppView, type AppViewApi } from "./shell/AppViewContext";
import SpatialModelPage from "./spatial/SpatialModelPage";
import GraphStudio from "./studio/GraphStudio";
import { GraphStudioProvider } from "./studio/state/GraphStudioContext";
import TutorialOverlay from "./tutorial/TutorialOverlay";

/** 글로벌 내비 탭 정의 — id·표시 라벨·튜토리얼 계약 id(data-tutorial-id). */
const VIEW_TABS: { id: AppView; label: string; tutorialId: string }[] = [
  { id: "studio", label: "Graph Studio", tutorialId: "nav-studio" },
  { id: "dashboard", label: "전자상황판", tutorialId: "nav-dashboard" },
  { id: "responder", label: "현장 회신", tutorialId: "nav-responder" },
  { id: "spatial", label: "공간 모델", tutorialId: "nav-spatial" },
  { id: "scenario", label: "시나리오", tutorialId: "nav-scenario" },
];

/** 내비 탭 버튼 공통 스타일 — 활성/비활성은 색·보더로만 구분한다(BottomTabs 패턴). */
const navTabBase: CSSProperties = {
  height: "100%",
  padding: "0 16px",
  background: "transparent",
  border: "none",
  borderBottom: "2px solid transparent",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

/** 뷰 wrapper 공통 스타일 — display 토글로만 노출을 제어한다(언마운트 금지). */
const viewWrapperBase: CSSProperties = {
  flex: 1,
  minHeight: 0,
  flexDirection: "column",
};

function App() {
  const [activeView, setActiveView] = useState<AppView>("studio");
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const appViewApi = useMemo<AppViewApi>(
    () => ({ activeView, setActiveView }),
    [activeView],
  );

  return (
    <ReactFlowProvider>
      <GraphStudioProvider>
        <AppViewContext.Provider value={appViewApi}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100vh",
              background: "var(--color-bg-muted)",
              color: "var(--color-text-default)",
            }}
          >
            {/* 글로벌 내비 바 — 앱 타이틀 + 뷰 전환 탭 5개 + 튜토리얼 버튼 */}
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                flexShrink: 0,
                height: 48,
                padding: "0 20px",
                background: "var(--color-bg-surface)",
                borderBottom: "1px solid var(--color-border-subtle)",
              }}
            >
              <span
                className="typo-text-md font-bold"
                style={{ color: "var(--color-text-default)", flexShrink: 0 }}
              >
                Visual SOP Graph Studio
              </span>
              <div role="tablist" aria-label="앱 뷰 전환" style={{ display: "flex", height: "100%" }}>
                {VIEW_TABS.map((tab) => {
                  const active = activeView === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      data-tutorial-id={tab.tutorialId}
                      onClick={() => setActiveView(tab.id)}
                      className={`typo-text-md${active ? " font-bold" : ""}`}
                      style={{
                        ...navTabBase,
                        color: active
                          ? "var(--color-text-brand)"
                          : "var(--color-text-subtle)",
                        borderBottom: active
                          ? "2px solid var(--color-border-brand)"
                          : "2px solid transparent",
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              {/* 내비 우측 — 단계별 조작 튜토리얼 시작 버튼 (오버레이는 T6이 구현) */}
              <button
                type="button"
                data-tutorial-id="tutorial-start"
                onClick={() => setTutorialOpen(true)}
                className="typo-text-md"
                style={{
                  marginLeft: "auto",
                  flexShrink: 0,
                  padding: "6px 14px",
                  background: "var(--color-bg-surface)",
                  color: "var(--color-text-brand)",
                  border: "1px solid var(--color-border-brand)",
                  borderRadius: 6,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                튜토리얼
              </button>
            </nav>

            {/* 콘텐츠 영역 — 모든 뷰 마운트, 비활성 뷰는 display:none */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div
                style={{
                  ...viewWrapperBase,
                  display: activeView === "studio" ? "flex" : "none",
                }}
              >
                <GraphStudio />
              </div>
              <div
                style={{
                  ...viewWrapperBase,
                  display: activeView === "dashboard" ? "flex" : "none",
                }}
              >
                <DashboardPage />
              </div>
              <div
                style={{
                  ...viewWrapperBase,
                  display: activeView === "responder" ? "flex" : "none",
                }}
              >
                <ResponderPage />
              </div>
              <div
                style={{
                  ...viewWrapperBase,
                  display: activeView === "spatial" ? "flex" : "none",
                }}
              >
                <SpatialModelPage />
              </div>
              <div
                style={{
                  ...viewWrapperBase,
                  display: activeView === "scenario" ? "flex" : "none",
                }}
              >
                <ScenarioPage />
              </div>
            </div>

            {/* 단계별 조작 튜토리얼 오버레이 — T1에서는 스텁(null 렌더). */}
            <TutorialOverlay open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
          </div>
        </AppViewContext.Provider>
      </GraphStudioProvider>
    </ReactFlowProvider>
  );
}

export default App;
