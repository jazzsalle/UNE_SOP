/**
 * Execution Log Table — 실행이력 로그(ExecutionLogEntry[])를 관리자 점검용 표로 표시한다.
 * 열: 시간(loggedAt 로컬 표기 + 경과분) | 장소 | 구분(kind 한국어 라벨) | 임무내용 |
 * 상황전파 | 메시지. 지연(MISSION_DELAYED)은 warning, 실패(MISSION_FAILED/RUN_FAILED)는
 * danger 상태 토큰으로 행을 강조한다. 색상은 전부 CSS 변수 토큰 사용.
 */
import type { ExecutionLogEntry, ExecutionLogKind } from "../engine";

/** ExecutionLogKind → 한국어 라벨. */
const LOG_KIND_LABEL: Record<ExecutionLogKind, string> = {
  RUN_STARTED: "실행 시작",
  MISSION_SENT: "임무 하달",
  MISSION_RUNNING: "임무 착수",
  MISSION_COMPLETED: "임무 완료",
  MISSION_DELAYED: "임무 지연",
  MISSION_FAILED: "임무 실패",
  NOTIFICATION_SENT: "상황 전파",
  NOTIFICATION_ACKED: "전파 확인",
  BOARD_RECORDED: "상황판 기록",
  RUN_COMPLETED: "실행 완료",
  RUN_FAILED: "실행 실패",
};

/** 강조 대상 kind → 행 변형 클래스 (지연=warning, 실패=danger). 나머지는 기본 행. */
const LOG_KIND_ROW_CLASS: Partial<Record<ExecutionLogKind, string>> = {
  MISSION_DELAYED: "log-table__row--warning",
  MISSION_FAILED: "log-table__row--danger",
  RUN_FAILED: "log-table__row--danger",
};

/** ISO 시각 → 로컬 시간 표기. 파싱 실패 시 원문을 그대로 반환한다. */
function formatLocalTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
}

interface ExecutionLogTableProps {
  /** 표시할 실행이력 로그 — seq 오름차순. */
  logs: ExecutionLogEntry[];
}

function ExecutionLogTable({ logs }: ExecutionLogTableProps) {
  if (logs.length === 0) {
    return (
      <p className="run-detail__empty typo-text-sm">실행이력 로그가 없습니다</p>
    );
  }

  return (
    <table className="log-table typo-text-sm">
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
          <tr
            key={entry.seq}
            className={LOG_KIND_ROW_CLASS[entry.kind] ?? ""}
          >
            <td className="log-table__time">
              {formatLocalTime(entry.loggedAt)}
              <span className="log-table__elapsed">
                +{entry.elapsedMinutes}분
              </span>
            </td>
            <td>{entry.location}</td>
            <td className="log-table__kind font-bold">
              {LOG_KIND_LABEL[entry.kind]}
            </td>
            <td>{entry.missionSummary}</td>
            <td>{entry.notificationSummary}</td>
            <td>{entry.message}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ExecutionLogTable;
