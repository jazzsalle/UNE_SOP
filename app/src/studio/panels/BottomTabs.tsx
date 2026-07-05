/**
 * Bottom Tabs — 하단 영역 탭 전환 컨테이너.
 * "Validation / Compile"(ValidationPanel) | "Runtime Preview"(RuntimePreviewPanel) |
 * "Execution"(ExecutionPanel — 2단계 SOP 실행기) 세 탭을 가지며,
 * useStudio().simulation이 새로 생성되면(이전 값과 비교) Runtime Preview 탭으로 자동 전환한다.
 * ExecutionPanel은 run 로컬 상태를 보유하므로 탭 전환 시 언마운트되지 않도록
 * 세 패널을 모두 마운트한 채 비활성 패널만 display:none으로 숨긴다.
 * 색상은 전부 디자인 시스템 CSS 변수 토큰 사용 (hex/rgb 하드코딩 금지).
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useStudio } from "../state/GraphStudioContext";
import ValidationPanel from "./ValidationPanel";
import RuntimePreviewPanel from "./RuntimePreviewPanel";
import ExecutionPanel from "./ExecutionPanel";

type BottomTabId = "validation" | "runtime" | "execution";

/** 탭 정의 — id와 표시 라벨. */
const TABS: { id: BottomTabId; label: string }[] = [
  { id: "validation", label: "Validation / Compile" },
  { id: "runtime", label: "Runtime Preview" },
  { id: "execution", label: "Execution" },
];

/** 탭 버튼 공통 스타일 — 활성/비활성은 색·보더로만 구분한다. */
const tabButtonBase: CSSProperties = {
  height: 36,
  padding: "0 16px",
  background: "transparent",
  border: "none",
  borderBottom: "2px solid transparent",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

function BottomTabs() {
  const { simulation } = useStudio();
  const [activeTab, setActiveTab] = useState<BottomTabId>("validation");

  // simulation이 "새로 생겼을 때"만 Runtime Preview 탭으로 자동 전환한다.
  // (clearSimulation으로 null이 되거나 동일 참조 유지 시에는 전환하지 않음)
  const prevSimulationRef = useRef(simulation);
  useEffect(() => {
    if (simulation && simulation !== prevSimulationRef.current) {
      setActiveTab("runtime");
    }
    prevSimulationRef.current = simulation;
  }, [simulation]);

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        background: "var(--color-bg-surface)",
        borderTop: "1px solid var(--color-border-subtle)",
      }}
    >
      <div
        role="tablist"
        aria-label="하단 패널 탭"
        style={{
          display: "flex",
          flexShrink: 0,
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`typo-text-md${active ? " font-bold" : ""}`}
              style={{
                ...tabButtonBase,
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
      {/* 세 패널 상시 마운트 — ExecutionPanel의 run 로컬 상태를 탭 전환에도 유지한다. */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          display: activeTab === "validation" ? "block" : "none",
        }}
      >
        <ValidationPanel />
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          display: activeTab === "runtime" ? "block" : "none",
        }}
      >
        <RuntimePreviewPanel />
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          display: activeTab === "execution" ? "block" : "none",
        }}
      >
        <ExecutionPanel />
      </div>
    </section>
  );
}

export default BottomTabs;
