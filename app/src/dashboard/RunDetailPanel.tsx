/**
 * Run Detail Panel — 선택된 실행 Run의 상세를 관리자 점검용으로 표시한다.
 * ① 요약 헤더(그래프명/이벤트 타입/심각도/장소/발생 시각/run 상태/경과 분)
 * ② 임무 현황 ③ 상황전파 목록 ④ 조치결과 회신 이력(현장 회신 뷰의 REPORT_ACTION 누적)
 * ⑤ 상황판 기록(장소·시간·임무내용·상황전파 카드) ⑥ 실행이력 로그 테이블(ExecutionLogTable).
 *
 * 데이터는 loadRun(runId)로 읽고 subscribeRuns로 saveRun/deleteRun 동기 notify를 받아
 * 진행 중 run을 실시간 갱신한다 — 구독 시 version 카운터만 올리고, run 자체는
 * useMemo(runId, version)로 렌더 시점에 다시 읽어 runId 전환 프레임의 stale 표시를 막는다.
 * 색상은 전부 디자인 시스템 CSS 변수 토큰 사용 (hex/rgb 하드코딩 금지).
 */
import { useEffect, useMemo, useState } from "react";
import type { RuntimeMission, RuntimeNotification, Severity } from "../domain";
import {
  loadRun,
  subscribeRuns,
  type ActionReport,
  type ExecutionRunStatus,
} from "../engine";
import ExecutionLogTable from "./ExecutionLogTable";

/** Severity → 뱃지 변형 클래스 (RuntimePreviewPanel 매핑과 동일 관례). */
const SEVERITY_BADGE: Record<Severity, string> = {
  INFO: "dashboard-badge--info",
  CAUTION: "dashboard-badge--warning",
  WARNING: "dashboard-badge--warning",
  DANGER: "dashboard-badge--danger",
  CRITICAL: "dashboard-badge--danger",
};

/** run 상태 → 뱃지 변형 클래스 (RunListPanel과 동일 관례). */
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

/** 임무 상태 → 뱃지 변형 클래스 (SENT=info/RUNNING=brand/COMPLETED=success/DELAYED=warning/FAILED=danger). */
const MISSION_STATUS_BADGE: Record<RuntimeMission["status"], string> = {
  SENT: "dashboard-badge--info",
  RUNNING: "dashboard-badge--brand",
  COMPLETED: "dashboard-badge--success",
  DELAYED: "dashboard-badge--warning",
  FAILED: "dashboard-badge--danger",
};

/** 임무 상태 → 한국어 라벨. */
const MISSION_STATUS_LABEL: Record<RuntimeMission["status"], string> = {
  SENT: "하달",
  RUNNING: "착수",
  COMPLETED: "완료",
  DELAYED: "지연",
  FAILED: "실패",
};

/** 상황전파 채널 → 한국어/축약 표기 (RuntimePreviewPanel과 동일 관례). */
const CHANNEL_LABEL: Record<RuntimeNotification["channel"], string> = {
  sms: "SMS",
  app_push: "PUSH",
  broadcast: "방송",
};

/** 상황전파 상태 → 뱃지 변형 클래스 (RuntimePreviewPanel과 동일 관례). */
const NOTIFICATION_STATUS_BADGE: Record<RuntimeNotification["status"], string> = {
  SENT: "dashboard-badge--info",
  DELIVERED: "dashboard-badge--brand",
  ACKED: "dashboard-badge--success",
  FAILED: "dashboard-badge--danger",
};

/** 조치결과 회신 결과 → 뱃지 변형 클래스 (DONE=success, IMPOSSIBLE=danger). */
const REPORT_RESULT_BADGE: Record<ActionReport["result"], string> = {
  DONE: "dashboard-badge--success",
  IMPOSSIBLE: "dashboard-badge--danger",
};

/** 조치결과 회신 결과 → 한국어 라벨. */
const REPORT_RESULT_LABEL: Record<ActionReport["result"], string> = {
  DONE: "조치 완료",
  IMPOSSIBLE: "조치 불가",
};

/** 상황판 기록 카드의 4개 필드 키 — 표시 순서 고정. */
const BOARD_FIELD_KEYS = ["장소", "시간", "임무내용", "상황전파"] as const;

/** ISO 시각 → 로컬 시간 표기. 파싱 실패 시 원문을 그대로 반환한다. */
function formatLocalTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
}

interface RunDetailPanelProps {
  /** 표시할 runId — null이면 미선택 placeholder를 표시한다. */
  runId: string | null;
}

function RunDetailPanel({ runId }: RunDetailPanelProps) {
  // saveRun/deleteRun 동기 notify → version 증가 → loadRun 재실행 (실시간 갱신).
  const [version, setVersion] = useState(0);
  useEffect(() => {
    return subscribeRuns(() => setVersion((v) => v + 1));
  }, []);

  const run = useMemo(
    () => (runId ? loadRun(runId) : null),
    [runId, version],
  );

  // 미선택(또는 삭제된 runId) — T3 placeholder 문구 유지.
  if (!run) {
    return (
      <div className="dashboard__detail-placeholder typo-text-md">
        Run을 선택하면 상세가 표시됩니다
      </div>
    );
  }

  const { eventContext } = run;
  const location = eventContext.spaceId ?? eventContext.siteId ?? "-";
  // Phase 8 이전 localStorage run에는 actionReports 필드가 없다 — ?? []로 하위 호환.
  const actionReports = run.actionReports ?? [];

  return (
    <section className="run-detail" aria-label="실행이력 상세">
      {/* ① 요약 헤더 */}
      <header className="run-detail__summary">
        <div className="run-detail__summary-top">
          <h3 className="run-detail__name typo-title-sm font-bold">
            {run.graphName}
          </h3>
          <span
            className={`dashboard-badge ${RUN_STATUS_BADGE[run.status]} typo-text-sm font-bold`}
          >
            {RUN_STATUS_LABEL[run.status]}
          </span>
          <span className="run-detail__elapsed typo-text-sm">
            경과 {run.elapsedMinutes}분
          </span>
        </div>
        <dl className="run-detail__kv typo-text-sm">
          <dt>이벤트</dt>
          <dd>{eventContext.eventType}</dd>
          <dt>심각도</dt>
          <dd>
            <span
              className={`dashboard-badge ${SEVERITY_BADGE[eventContext.severity]} font-bold`}
            >
              {eventContext.severity}
            </span>
          </dd>
          <dt>장소</dt>
          <dd>{location}</dd>
          <dt>발생 시각</dt>
          <dd>{formatLocalTime(eventContext.occurredAt)}</dd>
        </dl>
      </header>

      {/* ② 임무 현황 */}
      <div className="run-detail__section">
        <h4 className="run-detail__section-title typo-text-md font-bold">
          임무 현황
        </h4>
        {run.missions.length === 0 ? (
          <p className="run-detail__empty typo-text-sm">임무가 없습니다</p>
        ) : (
          <ul className="mission-status-list">
            {run.missions.map((mission) => (
              <li
                key={mission.missionId}
                className="mission-status-list__item typo-text-sm"
              >
                <span
                  className={`dashboard-badge ${MISSION_STATUS_BADGE[mission.status]} font-bold`}
                >
                  {MISSION_STATUS_LABEL[mission.status]}
                </span>
                <span className="mission-status-list__title">
                  {mission.title}
                </span>
                <span className="mission-status-list__meta">
                  {mission.assigneeRole ?? "담당 미지정"}
                  {mission.dueMinutes !== undefined
                    ? ` · 기한 ${mission.dueMinutes}분`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ③ 상황전파 목록 */}
      <div className="run-detail__section">
        <h4 className="run-detail__section-title typo-text-md font-bold">
          상황전파
        </h4>
        {run.notifications.length === 0 ? (
          <p className="run-detail__empty typo-text-sm">
            상황전파 내역이 없습니다
          </p>
        ) : (
          <table className="log-table typo-text-sm">
            <thead>
              <tr>
                <th>채널</th>
                <th>대상</th>
                <th>메시지</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {run.notifications.map((notification) => (
                <tr key={notification.notificationId}>
                  <td>{CHANNEL_LABEL[notification.channel]}</td>
                  <td>{notification.targets.join(", ")}</td>
                  <td>{notification.message}</td>
                  <td>
                    <span
                      className={`dashboard-badge ${NOTIFICATION_STATUS_BADGE[notification.status]} font-bold`}
                    >
                      {notification.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ④ 조치결과 회신 이력 — 현장 회신 뷰(REPORT_ACTION)의 누적 회신 */}
      <div className="run-detail__section">
        <h4 className="run-detail__section-title typo-text-md font-bold">
          조치결과 회신 이력
          <span className="run-detail__section-note typo-text-sm">
            {actionReports.length}건
          </span>
        </h4>
        {actionReports.length === 0 ? (
          <p className="run-detail__empty typo-text-sm">
            회신 이력이 없습니다 — 현장 회신 뷰에서 조치결과를 회신하면 기록됩니다
          </p>
        ) : (
          <table className="log-table typo-text-sm">
            <thead>
              <tr>
                <th>회신자</th>
                <th>회신 시각</th>
                <th>임무</th>
                <th>결과</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {actionReports.map((report) => (
                <tr key={report.reportId}>
                  <td>{report.reporter}</td>
                  <td className="log-table__time">
                    {formatLocalTime(report.reportedAt)}
                    <span className="log-table__elapsed">
                      +{report.elapsedMinutes}분
                    </span>
                  </td>
                  <td>{report.missionTitle}</td>
                  <td>
                    <span
                      className={`dashboard-badge ${REPORT_RESULT_BADGE[report.result]} font-bold`}
                    >
                      {REPORT_RESULT_LABEL[report.result]}
                    </span>
                  </td>
                  <td>{report.note ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ⑤ 상황판 기록 — 장소/시간/임무내용/상황전파 4필드 카드 */}
      <div className="run-detail__section">
        <h4 className="run-detail__section-title typo-text-md font-bold">
          상황판 기록
          <span className="run-detail__section-note typo-text-sm">
            훈련/실제 공통 점검 화면
          </span>
        </h4>
        {run.boardRecords.length === 0 ? (
          <p className="run-detail__empty typo-text-sm">
            상황판 기록이 없습니다 — 그래프에 전자상황판 노드가 있으면 기록됩니다
          </p>
        ) : (
          run.boardRecords.map((record) => (
            <div key={record.boardNodeId} className="board-record-card">
              {BOARD_FIELD_KEYS.map((key) => (
                <div key={key} className="board-record-card__row">
                  <span className="board-record-card__key typo-text-sm font-bold">
                    {key}
                  </span>
                  <span className="board-record-card__value typo-text-sm">
                    {record.fields[key]}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* ⑥ 실행이력 로그 테이블 */}
      <div className="run-detail__section">
        <h4 className="run-detail__section-title typo-text-md font-bold">
          실행이력 로그
          <span className="run-detail__section-note typo-text-sm">
            {run.logs.length}건
          </span>
        </h4>
        <ExecutionLogTable logs={run.logs} />
      </div>
    </section>
  );
}

export default RunDetailPanel;
