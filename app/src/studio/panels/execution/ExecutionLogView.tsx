/**
 * Execution Log View — Execution 탭 §실행이력 로그 테이블.
 * 열: 시간(loggedAt 로컬 표기) | 장소 | 구분(kind 한국어) | 임무내용 | 상황전파 | 메시지.
 *
 * **정렬 방향(택1 근거)**: 로그는 seq 오름차순(최신이 아래)으로 표시하고 스크롤을
 * 하단에 고정한다 — 실행 절차는 시간 순서대로 읽는 것이 자연스럽고(콘솔/채팅 관례),
 * 새 로그 추가 시 자동으로 최신 행이 보여 실시간 갱신 확인이 쉽다.
 */
import { useEffect, useRef } from "react";
import type { ExecutionLogEntry, ExecutionLogKind } from "../../../engine";
import "./execution.css";

/** ExecutionLogKind → 한국어 구분 라벨. */
const KIND_LABEL: Record<ExecutionLogKind, string> = {
  RUN_STARTED: "실행 시작",
  MISSION_SENT: "임무 전송",
  MISSION_RUNNING: "임무 착수",
  MISSION_COMPLETED: "임무 완료",
  MISSION_DELAYED: "임무 지연",
  MISSION_FAILED: "임무 실패",
  PATROL_WAYPOINT: "패트롤 이동",
  PATROL_CHECKPOINT: "점검 수행",
  NOTIFICATION_SENT: "전파 발송",
  NOTIFICATION_ACKED: "전파 확인",
  ACTION_REPORTED: "조치 회신",
  BOARD_RECORDED: "상황판 기록",
  RUN_COMPLETED: "실행 종결",
  RUN_FAILED: "실행 실패",
};

/** kind → 구분 뱃지 변형 (지연=warning, 실패=danger, 완료/종결=success, 그 외 neutral). */
const KIND_BADGE: Record<ExecutionLogKind, string> = {
  RUN_STARTED: "exec-badge--brand",
  MISSION_SENT: "exec-badge--info",
  MISSION_RUNNING: "exec-badge--brand",
  MISSION_COMPLETED: "exec-badge--success",
  MISSION_DELAYED: "exec-badge--warning",
  MISSION_FAILED: "exec-badge--danger",
  PATROL_WAYPOINT: "exec-badge--info",
  PATROL_CHECKPOINT: "exec-badge--brand",
  NOTIFICATION_SENT: "exec-badge--info",
  NOTIFICATION_ACKED: "exec-badge--success",
  ACTION_REPORTED: "exec-badge--brand",
  BOARD_RECORDED: "exec-badge--neutral",
  RUN_COMPLETED: "exec-badge--success",
  RUN_FAILED: "exec-badge--danger",
};

/** loggedAt(ISO) → 로컬 시각 표기. 파싱 실패 시 원문 폴백. */
function formatLoggedAt(loggedAt: string): string {
  const ms = Date.parse(loggedAt);
  return Number.isFinite(ms) ? new Date(ms).toLocaleTimeString() : loggedAt;
}

function ExecutionLogView({ logs }: { logs: ExecutionLogEntry[] }) {
  // 새 로그 추가 시 스크롤 하단 고정 — 최신 행이 항상 보이게 한다.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs.length]);

  if (logs.length === 0) {
    return (
      <p className="exec-section__empty typo-text-sm">실행 로그가 없습니다</p>
    );
  }

  return (
    <div ref={scrollRef} className="exec-log">
      <table className="exec-table typo-text-sm">
        <thead>
          <tr>
            <th>시간</th>
            <th>장소</th>
            <th>구분</th>
            <th>임무내용</th>
            <th>상황전파</th>
            <th>메시지</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((entry) => (
            <tr key={entry.seq}>
              <td className="exec-log__time">
                {formatLoggedAt(entry.loggedAt)} (+{entry.elapsedMinutes}분)
              </td>
              <td className="exec-log__location">{entry.location}</td>
              <td>
                <span
                  className={`exec-badge ${KIND_BADGE[entry.kind]} typo-text-sm font-bold`}
                >
                  {KIND_LABEL[entry.kind]}
                </span>
              </td>
              <td className="exec-log__message">{entry.missionSummary}</td>
              <td className="exec-log__message">{entry.notificationSummary}</td>
              <td className="exec-log__message">{entry.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExecutionLogView;
