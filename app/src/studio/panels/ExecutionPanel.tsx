/**
 * Execution Panel — 하단 "Execution" 탭. SOP 실행기(2단계)의 Studio측 UI.
 * ① 샘플 이벤트 선택 → "실행 시작"으로 ExecutionRun 생성·저장
 * ② 임무별 [착수][완료][실패] 수동 전이 (MissionControlList)
 * ③ "+1분"/"+5분" TICK으로 모의 시간 진행 → dueMinutes 초과 임무 DELAYED
 * ④ 실행이력 로그 실시간 갱신 (ExecutionLogView)
 * ⑤ 전 임무 종결 시 "실행 완료" 뱃지 + "새 실행"으로 run state 초기화
 *
 * run은 이 컴포넌트의 로컬 useState로만 관리한다(GraphStudioContext 수정 금지 —
 * 병렬 태스크 계약 보호). 모든 상태 변경마다 `setRun(next); saveRun(next);`로
 * localStorage에 영속화해 Dashboard가 subscribeRuns로 실시간 반영하게 한다.
 * 단, 같은 run을 현장 회신 뷰(ResponderPage)도 saveRun으로 갱신할 수 있으므로
 * (Phase 8), subscribeRuns로 자기 runId의 최신본을 로컬 스냅샷에 반영한다 —
 * 구독 없이는 구버전 스냅샷 기반 다음 액션이 외부 회신을 덮어쓴다.
 *
 * **Compile 유도 방식(택1 근거)**: compiledGraph가 없으면 "실행 시작" 버튼에서
 * runCompile()을 먼저 호출한 뒤 그 반환 그래프로 진행한다 — runCompile()이 컴파일
 * 결과 SOPGraph를 동기 반환하므로 상태 갱신 타이밍 문제 없이 한 번의 클릭으로
 * 실행까지 이어져 사용자 마찰이 없다. 대신 Compile 전 상태임을 안내 문구
 * ("Compile 전 상태입니다 — 실행 시작 시 자동으로 Compile합니다")로 알린다.
 */
import { useEffect, useState } from "react";
import { ALL_SAMPLE_EVENTS } from "../../domain";
import {
  applyExecutorAction,
  createRun,
  loadRun,
  saveRun,
  subscribeRuns,
} from "../../engine";
import type { ExecutionRun, ExecutorAction } from "../../engine";
import { useStudio } from "../state/GraphStudioContext";
import MissionControlList from "./execution/MissionControlList";
import ExecutionLogView from "./execution/ExecutionLogView";
import "./execution/execution.css";

/** ExecutionRun.status → 뱃지 변형 클래스. */
const RUN_STATUS_BADGE: Record<ExecutionRun["status"], string> = {
  RUNNING: "exec-badge--brand",
  COMPLETED: "exec-badge--success",
  FAILED: "exec-badge--danger",
};

/** ExecutionRun.status → 한국어 라벨 — 종결(COMPLETED)은 "실행 완료"로 표기. */
const RUN_STATUS_LABEL: Record<ExecutionRun["status"], string> = {
  RUNNING: "실행 중",
  COMPLETED: "실행 완료",
  FAILED: "실행 실패",
};

function ExecutionPanel() {
  const { compiledGraph, runCompile } = useStudio();

  // run은 로컬 상태 — Context에 넣지 않는다(병렬 태스크 계약 보호).
  const [run, setRun] = useState<ExecutionRun | null>(null);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [startError, setStartError] = useState<string | null>(null);

  // 외부(현장 회신 뷰 등) saveRun 반영 — 자기 runId의 최신본으로 로컬 스냅샷을 갱신한다.
  // 구독하지 않으면 구버전 스냅샷 기반 다음 dispatch가 외부 회신을 덮어쓴다(모듈 헤더 참조).
  // 자기 자신의 saveRun notify도 받지만 같은 내용의 최신본으로 교체될 뿐이라 무해하다.
  const runId = run?.runId ?? null;
  useEffect(() => {
    if (!runId) return;
    return subscribeRuns(() => {
      const latest = loadRun(runId);
      if (latest) setRun(latest); // 삭제된 run은 현재 스냅샷 유지("새 실행"으로 정리).
    });
  }, [runId]);

  /** "실행 시작" — (필요 시 자동 Compile) → createRun → 저장. 실패 시 인라인 경고. */
  const handleStart = () => {
    const sample = ALL_SAMPLE_EVENTS.find(
      (event) => event.eventId === selectedEventId,
    );
    if (!sample) {
      return;
    }
    // Compile 유도 — 모듈 헤더 JSDoc 참조 (runCompile은 SOPGraph를 동기 반환).
    const graph = compiledGraph ?? runCompile();
    const result = createRun(graph, sample);
    if (!result.run) {
      setStartError(result.reason ?? "실행을 생성할 수 없습니다.");
      return;
    }
    setStartError(null);
    setRun(result.run);
    saveRun(result.run);
  };

  /** 실행기 액션 디스패치 — no-op(동일 참조)이면 저장하지 않는다. */
  const dispatch = (action: ExecutorAction) => {
    if (!run) {
      return;
    }
    const next = applyExecutorAction(run, action);
    if (next === run) {
      return;
    }
    setRun(next);
    saveRun(next);
  };

  /** "새 실행" — run state만 초기화한다 (저장된 실행이력은 Dashboard에 남는다). */
  const handleReset = () => {
    setRun(null);
    setStartError(null);
  };

  // ── run 생성 전: 이벤트 선택 + 실행 시작 폼 ──
  if (!run) {
    return (
      <section className="exec-panel">
        <div className="exec-section">
          <h3 className="exec-section__title typo-text-md font-bold">
            SOP 실행 시작
          </h3>
          <div className="exec-start">
            <select
              className="exec-start__select typo-text-md"
              value={selectedEventId}
              onChange={(event) => setSelectedEventId(event.target.value)}
              aria-label="실행 이벤트 선택"
            >
              <option value="">이벤트 선택…</option>
              {ALL_SAMPLE_EVENTS.map((sample) => (
                <option key={sample.eventId} value={sample.eventId}>
                  {sample.eventId} · {sample.eventType} ({sample.severity})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="exec-btn exec-btn--primary typo-text-md font-bold"
              onClick={handleStart}
              disabled={!selectedEventId}
            >
              실행 시작
            </button>
          </div>
          {!compiledGraph && (
            <p className="exec-start__hint typo-text-sm">
              Compile 전 상태입니다 — 실행 시작 시 자동으로 Compile합니다.
            </p>
          )}
          {startError && (
            <p className="exec-alert typo-text-sm" role="alert">
              {startError}
            </p>
          )}
        </div>
      </section>
    );
  }

  // ── run 진행/종결: 요약 헤더 + 임무 통제 + 실행 로그 ──
  const runActive = run.status === "RUNNING";
  return (
    <section className="exec-panel">
      <div className="exec-run-header">
        <div className="exec-run-header__meta">
          <span className="exec-run-header__name typo-text-md font-bold">
            {run.graphName}
          </span>
          <span
            className={`exec-badge ${RUN_STATUS_BADGE[run.status]} typo-text-sm font-bold`}
          >
            {RUN_STATUS_LABEL[run.status]}
          </span>
          <span className="exec-run-header__sub typo-text-sm">
            {run.runId} · {run.eventContext.eventId} (
            {run.eventContext.eventType}/{run.eventContext.severity})
          </span>
        </div>
        <div className="exec-clock">
          <span className="exec-clock__elapsed typo-text-sm font-bold">
            경과 {run.elapsedMinutes}분
          </span>
          <button
            type="button"
            className="exec-btn exec-btn--outline typo-text-sm"
            disabled={!runActive}
            onClick={() => dispatch({ type: "TICK", minutes: 1 })}
          >
            +1분
          </button>
          <button
            type="button"
            className="exec-btn exec-btn--outline typo-text-sm"
            disabled={!runActive}
            onClick={() => dispatch({ type: "TICK", minutes: 5 })}
          >
            +5분
          </button>
          {!runActive && (
            <button
              type="button"
              className="exec-btn exec-btn--primary typo-text-sm font-bold"
              onClick={handleReset}
            >
              새 실행
            </button>
          )}
        </div>
      </div>

      <div className="exec-section">
        <h3 className="exec-section__title typo-text-md font-bold">임무 통제</h3>
        <MissionControlList
          missions={run.missions}
          runActive={runActive}
          onAction={dispatch}
        />
      </div>

      <div className="exec-section">
        <h3 className="exec-section__title typo-text-md font-bold">
          실행이력 로그
        </h3>
        <ExecutionLogView logs={run.logs} />
      </div>
    </section>
  );
}

export default ExecutionPanel;
