/**
 * Run List Panel — 저장된 실행이력(ExecutionRun) 목록을 최신 우선으로 표시한다.
 * run 카드: 그래프명 / 도메인 뱃지 / 이벤트 타입 / 시작 시각(로컬) / 상태 뱃지 /
 * 임무 진행(완료 n/전체 m). 선택 카드는 배경·좌측 보더로 강조한다.
 *
 * 구독 방식(택1 근거): `useSyncExternalStore(subscribeRuns, listRuns)`는
 * listRuns()가 호출마다 새 배열을 반환해 getSnapshot 불일치로 무한 리렌더가
 * 발생하므로(스냅샷 캐싱 계층 필요), 더 단순한 `useState + useEffect(subscribeRuns)`
 * 방식을 택했다 — saveRun/deleteRun 시 동기 notify를 받아 listRuns()를 다시 읽는다.
 */
import { useEffect, useState } from "react";
import {
  listRuns,
  subscribeRuns,
  type ExecutionRun,
  type ExecutionRunStatus,
} from "../engine";

/** run 상태 → 뱃지 변형 클래스 (RUNNING=info, COMPLETED=success, FAILED=danger). */
const RUN_STATUS_BADGE: Record<ExecutionRunStatus, string> = {
  RUNNING: "dashboard-badge--info",
  COMPLETED: "dashboard-badge--success",
  FAILED: "dashboard-badge--danger",
};

/** run 상태 → 한국어 라벨. */
const RUN_STATUS_LABEL: Record<ExecutionRunStatus, string> = {
  RUNNING: "진행 중",
  COMPLETED: "완료",
  FAILED: "실패",
};

/** ISO 시각 → 로컬 시간 표기. 파싱 실패 시 원문을 그대로 반환한다. */
function formatLocalTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
}

interface RunListPanelProps {
  /** 현재 선택된 runId — 없으면 null. */
  selectedRunId: string | null;
  /** run 카드 클릭 시 선택 콜백. */
  onSelect: (runId: string) => void;
}

function RunListPanel({ selectedRunId, onSelect }: RunListPanelProps) {
  const [runs, setRuns] = useState<ExecutionRun[]>(() => listRuns());

  // saveRun/deleteRun 후 동기 notify를 받아 목록을 다시 읽는다 (same-tab 실시간 반영).
  useEffect(() => {
    return subscribeRuns(() => setRuns(listRuns()));
  }, []);

  return (
    <aside
      className="run-list"
      aria-label="실행이력 목록"
      data-tutorial-id="dashboard-run-list"
    >
      <h3 className="run-list__title typo-text-md font-bold">
        실행 Run 목록
        <span className="run-list__count typo-text-sm">{runs.length}건</span>
      </h3>

      {runs.length === 0 ? (
        <p className="run-list__empty typo-text-sm">
          실행이력이 없습니다 — Graph Studio의 Execution 탭에서 SOP 실행을
          시작하면 여기에 표시됩니다
        </p>
      ) : (
        <ul className="run-list__items">
          {runs.map((run) => {
            const selected = run.runId === selectedRunId;
            const completedCount = run.missions.filter(
              (mission) => mission.status === "COMPLETED",
            ).length;
            return (
              <li key={run.runId}>
                <button
                  type="button"
                  onClick={() => onSelect(run.runId)}
                  aria-pressed={selected}
                  className={`run-card${selected ? " run-card--selected" : ""}`}
                >
                  <div className="run-card__top">
                    <span className="run-card__name typo-text-md font-bold">
                      {run.graphName}
                    </span>
                    <span className="dashboard-badge dashboard-badge--neutral typo-text-sm">
                      {run.domain}
                    </span>
                  </div>
                  <div className="run-card__meta typo-text-sm">
                    <span className="run-card__event">
                      {run.eventContext.eventType}
                    </span>
                    <span className="run-card__time">
                      {formatLocalTime(run.startedAt)}
                    </span>
                  </div>
                  <div className="run-card__bottom typo-text-sm">
                    <span
                      className={`dashboard-badge ${RUN_STATUS_BADGE[run.status]} font-bold`}
                    >
                      {RUN_STATUS_LABEL[run.status]}
                    </span>
                    <span className="run-card__progress">
                      임무 {completedCount}/{run.missions.length}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

export default RunListPanel;
