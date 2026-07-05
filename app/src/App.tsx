/**
 * App 셸 — 상단 글로벌 내비(~48px)에서 "Graph Studio | 전자상황판 | 공간 모델" 뷰를 전환한다.
 * react-router 미도입(Phase 5 선행 판단 1): App 레벨 상태로 뷰를 전환하되,
 * **모든 뷰를 마운트한 채 비활성 뷰는 `display:none`으로만 숨긴다** —
 * GraphStudio를 언마운트하면 React Flow 캔버스 편집 상태가 소실되기 때문.
 * (공간 모델 뷰는 정적 데이터라 lazy 렌더도 무방하나 기존 패턴을 그대로 따른다.)
 * 색상은 전부 디자인 시스템 CSS 변수 토큰 사용 (hex/rgb 하드코딩 금지).
 */
import { useState, type CSSProperties } from "react";
import DashboardPage from "./dashboard/DashboardPage";
import SpatialModelPage from "./spatial/SpatialModelPage";
import GraphStudio from "./studio/GraphStudio";

type AppView = "studio" | "dashboard" | "spatial";

/** 글로벌 내비 탭 정의 — id와 표시 라벨. */
const VIEW_TABS: { id: AppView; label: string }[] = [
  { id: "studio", label: "Graph Studio" },
  { id: "dashboard", label: "전자상황판" },
  { id: "spatial", label: "공간 모델" },
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--color-bg-muted)",
        color: "var(--color-text-default)",
      }}
    >
      {/* 글로벌 내비 바 — 앱 타이틀 + 뷰 전환 탭 3개 */}
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
            display: activeView === "spatial" ? "flex" : "none",
          }}
        >
          <SpatialModelPage />
        </div>
      </div>
    </div>
  );
}

export default App;
