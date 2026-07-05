/**
 * Dashboard Page — 전자상황판(실행이력 점검) 화면 골격.
 * 헤더 + 2컬럼(좌측 360px Run 목록 / 우측 1fr 상세)로 구성되며,
 * 선택된 runId는 이 컴포넌트의 state로 관리해 RunListPanel(선택)과
 * 우측 상세 영역(표시)이 공유한다.
 * 색상은 전부 디자인 시스템 CSS 변수 토큰 사용 (hex/rgb 하드코딩 금지).
 */
import { useState } from "react";
import RunDetailPanel from "./RunDetailPanel";
import RunListPanel from "./RunListPanel";
import "./dashboard.css";

function DashboardPage() {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  return (
    <section className="dashboard">
      <header className="dashboard__header">
        <h2 className="dashboard__title typo-title-sm font-bold">
          전자상황판 — 실행이력 점검
        </h2>
        <p className="dashboard__subtitle typo-text-sm">
          훈련/실제 상황 공통 점검 화면 — 장소·시간·임무내용·상황전파를
          관리자가 점검합니다
        </p>
      </header>

      <div className="dashboard__body">
        <RunListPanel
          selectedRunId={selectedRunId}
          onSelect={setSelectedRunId}
        />

        {/* 선택 run의 요약/임무 현황/상황전파/상황판 기록/실행이력 로그 상세
            — 미선택 시 placeholder는 RunDetailPanel 내부에서 처리한다. */}
        <RunDetailPanel runId={selectedRunId} />
      </div>
    </section>
  );
}

export default DashboardPage;
