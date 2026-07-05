/**
 * Responder Page — "현장 회신" 뷰 (Phase 8 / 5단계). 외부 현장 점검자·안전관리자가
 * 진행 중 run을 골라 간이 로그인(담당자 role 선택) 후, 자신에게 수신된 상황전파를
 * 조회·수신확인(ACK_NOTIFICATION)하고 할당 임무에 조치결과를 회신(REPORT_ACTION)하는
 * 모바일 폭 시뮬레이션 프레임(중앙 max-width 420px 카드) 화면.
 *
 * ① run 선택: RUNNING run 목록 우선(없으면 placeholder), 종결 run도 읽기 전용 조회 가능
 * ② 담당자 선택: run.missions의 assigneeRole 유니크 + notifications.targets 합집합
 * ③ 상황전파 수신함: 선택 role이 targets에 포함되거나 targets가 빈 전파 + "수신 확인"
 * ④ 할당 임무: assigneeRole === 선택 role 또는 빈 값("담당 미지정"은 공통 노출)
 *
 * run 상태는 localStorage 단일 진실 — run을 useState로 들지 않고 subscribeRuns
 * version 카운터 의존 useMemo로 loadRun(runId)을 재조회한다(RunDetailPanel 패턴).
 * Studio ExecutionPanel의 TICK/수동 전이와 같은 run을 동시에 다뤄도 충돌하지 않는다.
 * 색상은 전부 디자인 시스템 CSS 변수 토큰 사용 (hex/rgb 하드코딩 금지).
 */
import { useEffect, useMemo, useState } from "react";
import type { RuntimeNotification } from "../domain";
import {
  applyExecutorAction,
  listRuns,
  loadRun,
  saveRun,
  subscribeRuns,
} from "../engine";
import type { ExecutionRun, ExecutorAction } from "../engine";
import MissionReportCard from "./MissionReportCard";
import "./responder.css";

/** 상황전파 채널 → 한국어/축약 표기 (RunDetailPanel과 동일 관례). */
const CHANNEL_LABEL: Record<RuntimeNotification["channel"], string> = {
  sms: "SMS",
  app_push: "PUSH",
  broadcast: "방송",
};

/** 상황전파 상태 → 뱃지 변형 클래스 (RunDetailPanel과 동일 관례). */
const NOTIFICATION_STATUS_BADGE: Record<RuntimeNotification["status"], string> = {
  SENT: "responder-badge--info",
  DELIVERED: "responder-badge--brand",
  ACKED: "responder-badge--success",
  FAILED: "responder-badge--danger",
};

/** 상황전파 상태 → 한국어 라벨 — 외부 담당자용 표기. */
const NOTIFICATION_STATUS_LABEL: Record<RuntimeNotification["status"], string> = {
  SENT: "발송됨",
  DELIVERED: "전달됨",
  ACKED: "수신 확인",
  FAILED: "실패",
};

/** run 상태 → 한국어 라벨 (RunListPanel과 동일 관례). */
const RUN_STATUS_LABEL: Record<ExecutionRun["status"], string> = {
  RUNNING: "진행 중",
  COMPLETED: "완료",
  FAILED: "실패",
};

/** ISO 시각 → 로컬 시간 표기. 파싱 실패 시 원문을 그대로 반환한다. */
function formatLocalTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
}

function ResponderPage() {
  // saveRun/deleteRun 동기 notify → version 증가 → listRuns/loadRun 재실행 (실시간 갱신).
  const [version, setVersion] = useState(0);
  useEffect(() => {
    return subscribeRuns(() => setVersion((v) => v + 1));
  }, []);

  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");

  const runs = useMemo(() => listRuns(), [version]);
  const runningRuns = runs.filter((run) => run.status === "RUNNING");
  const settledRuns = runs.filter((run) => run.status !== "RUNNING");

  // run은 localStorage 단일 진실 — version 의존 useMemo로 렌더 시점에 다시 읽는다.
  const run = useMemo(
    () => (selectedRunId ? loadRun(selectedRunId) : null),
    [selectedRunId, version],
  );
  const runActive = run?.status === "RUNNING";

  // 담당자 후보 — 임무 assigneeRole 유니크 + 상황전파 targets 합집합.
  const roles = useMemo(() => {
    if (!run) return [];
    const set = new Set<string>();
    for (const mission of run.missions) {
      if (mission.assigneeRole) set.add(mission.assigneeRole);
    }
    for (const noti of run.notifications) {
      for (const target of noti.targets) set.add(target);
    }
    return [...set];
  }, [run]);

  /** run 전환 — 담당자 후보가 run마다 다르므로 간이 로그인 상태를 초기화한다. */
  const handleSelectRun = (runId: string) => {
    setSelectedRunId(runId || null);
    setSelectedRole("");
  };

  /** 실행기 액션 디스패치 — no-op(동일 참조)이면 저장하지 않는다 (ExecutionPanel 패턴). */
  const dispatch = (action: ExecutorAction) => {
    if (!run) return;
    const next = applyExecutorAction(run, action);
    if (next === run) return;
    saveRun(next); // notify → version 증가 → loadRun 재조회로 화면 갱신.
  };

  /** MissionReportCard "회신" — 선택 role을 회신자로 REPORT_ACTION을 디스패치한다. */
  const handleReport = (
    missionId: string,
    result: "DONE" | "IMPOSSIBLE",
    note: string,
  ) => {
    dispatch({
      type: "REPORT_ACTION",
      missionId,
      result,
      reporter: selectedRole,
      note: note || undefined,
    });
  };

  // ③ 상황전파 수신함 — 선택 role이 targets에 포함되거나 targets가 빈 전파(전체 공지).
  const inboxNotifications =
    run && selectedRole
      ? run.notifications.filter(
          (noti) => noti.targets.length === 0 || noti.targets.includes(selectedRole),
        )
      : [];

  // ④ 할당 임무 — assigneeRole 일치 + 빈 값("담당 미지정")은 모든 담당자에게 노출.
  const assignedMissions =
    run && selectedRole
      ? run.missions.filter(
          (mission) => !mission.assigneeRole || mission.assigneeRole === selectedRole,
        )
      : [];

  const actionReports = run?.actionReports ?? [];

  return (
    <div className="responder">
      <div className="responder__frame">
        <header className="responder__header">
          <h2 className="responder__title typo-title-sm font-bold">현장 회신</h2>
          <p className="responder__subtitle typo-text-sm">
            외부 현장 점검자 · 안전관리자용
          </p>
        </header>

        {/* ① run 선택 */}
        <section className="responder-section" aria-label="실행 선택">
          <h3 className="responder-section__title typo-text-md font-bold">
            실행 선택
          </h3>
          {runningRuns.length === 0 && (
            <p className="responder__placeholder typo-text-sm">
              진행 중인 실행이 없습니다 — Studio에서 실행을 시작하세요
            </p>
          )}
          {runs.length > 0 && (
            <select
              className="responder-select typo-text-md"
              value={selectedRunId ?? ""}
              onChange={(event) => handleSelectRun(event.target.value)}
              aria-label="실행 Run 선택"
            >
              <option value="">실행 선택…</option>
              {runningRuns.length > 0 && (
                <optgroup label="진행 중">
                  {runningRuns.map((item) => (
                    <option key={item.runId} value={item.runId}>
                      {item.graphName} · {item.eventContext.eventType} ·{" "}
                      {formatLocalTime(item.startedAt)}
                    </option>
                  ))}
                </optgroup>
              )}
              {settledRuns.length > 0 && (
                <optgroup label="종결됨 (읽기 전용)">
                  {settledRuns.map((item) => (
                    <option key={item.runId} value={item.runId}>
                      {item.graphName} · {item.eventContext.eventType} ·{" "}
                      {RUN_STATUS_LABEL[item.status]}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          )}
        </section>

        {run && (
          <>
            {!runActive && (
              <p className="responder__readonly-note typo-text-sm" role="status">
                이 실행은 종결되었습니다 — 읽기 전용으로 표시됩니다
              </p>
            )}

            {/* ② 담당자 간이 로그인 */}
            <section className="responder-section" aria-label="담당자 선택">
              <h3 className="responder-section__title typo-text-md font-bold">
                담당자 선택
                <span className="responder-section__note typo-text-sm">
                  간이 로그인
                </span>
              </h3>
              {roles.length === 0 ? (
                <p className="responder__placeholder typo-text-sm">
                  이 실행에는 담당자 후보(임무 담당/전파 대상)가 없습니다
                </p>
              ) : (
                <select
                  className="responder-select typo-text-md"
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value)}
                  aria-label="담당자 선택"
                >
                  <option value="">담당자 선택…</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              )}
            </section>

            {!selectedRole ? (
              <p className="responder__placeholder typo-text-sm">
                담당자를 선택하면 수신된 상황전파와 할당 임무가 표시됩니다
              </p>
            ) : (
              <>
                {/* ③ 상황전파 수신함 */}
                <section className="responder-section" aria-label="상황전파 수신함">
                  <h3 className="responder-section__title typo-text-md font-bold">
                    상황전파 수신함
                    <span className="responder-section__note typo-text-sm">
                      {inboxNotifications.length}건
                    </span>
                  </h3>
                  {inboxNotifications.length === 0 ? (
                    <p className="responder__placeholder typo-text-sm">
                      수신된 상황전파가 없습니다
                    </p>
                  ) : (
                    <ul className="noti-list">
                      {inboxNotifications.map((noti) => (
                        <li key={noti.notificationId} className="noti-card">
                          <div className="noti-card__top">
                            <span className="responder-badge responder-badge--neutral typo-text-sm font-bold">
                              {CHANNEL_LABEL[noti.channel]}
                            </span>
                            <span
                              className={`responder-badge ${NOTIFICATION_STATUS_BADGE[noti.status]} typo-text-sm font-bold`}
                            >
                              {NOTIFICATION_STATUS_LABEL[noti.status]}
                            </span>
                          </div>
                          <p className="noti-card__message typo-text-md">
                            {noti.message}
                          </p>
                          <div className="noti-card__bottom">
                            <span className="noti-card__targets typo-text-sm">
                              대상: {noti.targets.join(", ") || "전체"}
                            </span>
                            {runActive &&
                              (noti.status === "SENT" ||
                                noti.status === "DELIVERED") && (
                                <button
                                  type="button"
                                  className="responder-btn responder-btn--outline typo-text-sm"
                                  onClick={() =>
                                    dispatch({
                                      type: "ACK_NOTIFICATION",
                                      notificationId: noti.notificationId,
                                    })
                                  }
                                >
                                  수신 확인
                                </button>
                              )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* ④ 할당 임무 + 조치결과 회신 */}
                <section
                  className="responder-section"
                  aria-label="할당 임무"
                  data-tutorial-id="responder-mission-list"
                >
                  <h3 className="responder-section__title typo-text-md font-bold">
                    할당 임무
                    <span className="responder-section__note typo-text-sm">
                      {assignedMissions.length}건
                    </span>
                  </h3>
                  {assignedMissions.length === 0 ? (
                    <p className="responder__placeholder typo-text-sm">
                      {selectedRole} 담당으로 할당된 임무가 없습니다
                    </p>
                  ) : (
                    assignedMissions.map((mission) => (
                      <MissionReportCard
                        key={mission.missionId}
                        mission={mission}
                        report={actionReports.find(
                          (report) => report.missionId === mission.missionId,
                        )}
                        runActive={runActive}
                        onReport={handleReport}
                      />
                    ))
                  )}
                </section>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ResponderPage;
