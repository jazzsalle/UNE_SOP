/**
 * Runtime Preview Panel — 시뮬레이션 결과(SimulationResult)를 6개 섹션으로 표시한다.
 * §1 Triggered Event / §2 Execution Path / §3 Missions / §4 Notifications /
 * §5 Responses / §6 Situation Board + Timeline.
 * simulation이 null이면 placeholder, matched=false면 reason을 상단에 표시한다.
 */
import { useMemo } from "react";
import type {
  RuntimeNotification,
  Severity,
} from "../../domain";
import type { MockResponse } from "../../engine";
import { useStudio } from "../state/GraphStudioContext";
import MissionList from "./runtime/MissionList";
import TimelineView from "./runtime/TimelineView";
import "./runtime/runtime.css";

/** Severity → 뱃지 변형 클래스 (INFO=info, CAUTION/WARNING=warning, DANGER/CRITICAL=danger). */
const SEVERITY_BADGE: Record<Severity, string> = {
  INFO: "runtime-badge--info",
  CAUTION: "runtime-badge--warning",
  WARNING: "runtime-badge--warning",
  DANGER: "runtime-badge--danger",
  CRITICAL: "runtime-badge--danger",
};

/** RuntimeNotification.channel → 한국어/축약 표기. */
const CHANNEL_LABEL: Record<RuntimeNotification["channel"], string> = {
  sms: "SMS",
  app_push: "PUSH",
  broadcast: "방송",
};

/** RuntimeNotification.status → 뱃지 변형 클래스. */
const NOTIFICATION_STATUS_BADGE: Record<
  RuntimeNotification["status"],
  string
> = {
  SENT: "runtime-badge--info",
  DELIVERED: "runtime-badge--brand",
  ACKED: "runtime-badge--success",
  FAILED: "runtime-badge--danger",
};

/** MockResponse.status → 뱃지 변형 클래스. */
const RESPONSE_STATUS_BADGE: Record<MockResponse["status"], string> = {
  COMPLETED: "runtime-badge--success",
  DELAYED: "runtime-badge--warning",
  NO_RESPONSE: "runtime-badge--danger",
};

function RuntimePreviewPanel() {
  const { simulation, nodes } = useStudio();

  // 방문 노드 id → 캔버스 노드 label 조회용 맵 (없으면 id 그대로 표시).
  const labelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const node of nodes) {
      map.set(node.id, node.data.graphNode.label);
    }
    return map;
  }, [nodes]);

  if (!simulation) {
    return (
      <section className="runtime-panel">
        <div className="runtime-panel__placeholder typo-text-md">
          Simulate를 실행하면 임무/전파/응답/상황판 결과가 여기에 표시됩니다
        </div>
      </section>
    );
  }

  const { eventContext, plan, responses, boardRecords, timeline } = simulation;
  const missions = plan?.missions ?? [];
  const notifications = plan?.notifications ?? [];
  const hasNoResponse = responses.some(
    (response) => response.status === "NO_RESPONSE",
  );

  return (
    <section className="runtime-panel">
      {/* 트리거 미매칭 — reason 안내 (섹션들은 빈 상태로 함께 렌더된다). */}
      {!simulation.matched && (
        <p className="runtime-panel__mismatch typo-text-md font-bold">
          트리거 미매칭 — {simulation.reason ?? "사유 없음"}
        </p>
      )}

      {/* §1 Triggered Event */}
      <div className="runtime-section">
        <h3 className="runtime-section__title typo-text-md font-bold">
          1. Triggered Event
        </h3>
        <div className="runtime-kv typo-text-sm">
          <span className="runtime-kv__key">eventId</span>
          <span className="runtime-kv__value">{eventContext.eventId}</span>
          <span className="runtime-kv__key">eventType</span>
          <span className="runtime-kv__value">{eventContext.eventType}</span>
          <span className="runtime-kv__key">severity</span>
          <span className="runtime-kv__value">
            <span
              className={`runtime-badge ${SEVERITY_BADGE[eventContext.severity]} typo-text-sm font-bold`}
            >
              {eventContext.severity}
            </span>
          </span>
          <span className="runtime-kv__key">occurredAt</span>
          <span className="runtime-kv__value">{eventContext.occurredAt}</span>
          <span className="runtime-kv__key">장소</span>
          <span className="runtime-kv__value">
            {eventContext.spaceId ?? eventContext.siteId ?? "-"}
          </span>
          <span className="runtime-kv__key">source</span>
          <span className="runtime-kv__value">{eventContext.source}</span>
        </div>
      </div>

      {/* §2 Execution Path */}
      <div className="runtime-section">
        <h3 className="runtime-section__title typo-text-md font-bold">
          2. Execution Path
        </h3>
        {simulation.visitedNodeIds.length === 0 ? (
          <p className="runtime-section__empty typo-text-sm">
            실행 경로가 없습니다
          </p>
        ) : (
          <div className="runtime-path">
            {simulation.visitedNodeIds.map((nodeId, index) => (
              <span key={`${nodeId}-${index}`} style={{ display: "contents" }}>
                {index > 0 && (
                  <span className="runtime-path__arrow typo-text-sm">→</span>
                )}
                <span className="runtime-path__chip typo-text-sm">
                  {labelById.get(nodeId) ?? nodeId}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* §3 Missions */}
      <div className="runtime-section">
        <h3 className="runtime-section__title typo-text-md font-bold">
          3. Missions
        </h3>
        <MissionList missions={missions} />
      </div>

      {/* §4 Notifications */}
      <div className="runtime-section">
        <h3 className="runtime-section__title typo-text-md font-bold">
          4. Notifications
        </h3>
        {notifications.length === 0 ? (
          <p className="runtime-section__empty typo-text-sm">
            상황전파 내역이 없습니다
          </p>
        ) : (
          <table className="runtime-table typo-text-sm">
            <thead>
              <tr>
                <th>채널</th>
                <th>대상</th>
                <th>메시지</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.notificationId}>
                  <td>{CHANNEL_LABEL[notification.channel]}</td>
                  <td>{notification.targets.join(", ")}</td>
                  <td>{notification.message}</td>
                  <td>
                    <span
                      className={`runtime-badge ${NOTIFICATION_STATUS_BADGE[notification.status]} typo-text-sm font-bold`}
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

      {/* §5 Responses */}
      <div className="runtime-section">
        <h3 className="runtime-section__title typo-text-md font-bold">
          5. Responses
        </h3>
        {responses.length === 0 ? (
          <p className="runtime-section__empty typo-text-sm">
            응답 내역이 없습니다
          </p>
        ) : (
          <div>
            {responses.map((response) => (
              <div key={response.missionId} className="runtime-response">
                <span
                  className={`runtime-badge ${RESPONSE_STATUS_BADGE[response.status]} typo-text-sm font-bold`}
                >
                  {response.status}
                </span>
                <span className="runtime-response__title typo-text-sm">
                  {response.missionTitle}
                </span>
                <span className="runtime-response__meta typo-text-sm">
                  +{response.offsetMinutes}분
                  {response.respondedBy ? ` · ${response.respondedBy}` : ""}
                </span>
              </div>
            ))}
            {hasNoResponse && (
              <p className="runtime-response__escalation typo-text-sm">
                미응답 임무가 있어 escalation 경로로 상급 담당자에게
                재전파됩니다.
              </p>
            )}
          </div>
        )}
      </div>

      {/* §6 Situation Board + Timeline */}
      <div className="runtime-section">
        <h3 className="runtime-section__title typo-text-md font-bold">
          6. Situation Board
        </h3>
        {boardRecords.length === 0 ? (
          <p className="runtime-section__empty typo-text-sm">
            상황판 기록이 없습니다
          </p>
        ) : (
          boardRecords.map((record) => (
            <div key={record.boardNodeId} className="runtime-board-card">
              {(
                ["장소", "시간", "임무내용", "상황전파"] as const
              ).map((key) => (
                <div key={key} className="runtime-board-card__row">
                  <span className="runtime-board-card__key typo-text-sm font-bold">
                    {key}
                  </span>
                  <span className="runtime-board-card__value typo-text-sm">
                    {record.fields[key]}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
        <TimelineView timeline={timeline} />
      </div>
    </section>
  );
}

export default RuntimePreviewPanel;
