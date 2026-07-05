/**
 * Mission List — Runtime Preview §3 임무 표.
 * SimulationResult.plan.missions를 title/assigneeRole/dueMinutes/status 열로 나열하고,
 * status는 디자인 시스템 subtle 배경 + status 텍스트 토큰 뱃지로 표시한다.
 */
import type { RuntimeMission } from "../../../domain";
import "./runtime.css";

/** RuntimeMission.status → 뱃지 변형 클래스 (SENT info / COMPLETED success / DELAYED warning / FAILED danger). */
const MISSION_STATUS_BADGE: Record<RuntimeMission["status"], string> = {
  SENT: "runtime-badge--info",
  RUNNING: "runtime-badge--brand",
  COMPLETED: "runtime-badge--success",
  DELAYED: "runtime-badge--warning",
  FAILED: "runtime-badge--danger",
};

function MissionList({ missions }: { missions: RuntimeMission[] }) {
  if (missions.length === 0) {
    return (
      <p className="runtime-section__empty typo-text-sm">
        생성된 임무가 없습니다
      </p>
    );
  }

  return (
    <table className="runtime-table typo-text-sm">
      <thead>
        <tr>
          <th>임무</th>
          <th>담당 역할</th>
          <th>기한(분)</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody>
        {missions.map((mission) => (
          <tr key={mission.missionId}>
            <td>{mission.title}</td>
            <td>{mission.assigneeRole ?? "-"}</td>
            <td>{mission.dueMinutes ?? "-"}</td>
            <td>
              <span
                className={`runtime-badge ${MISSION_STATUS_BADGE[mission.status]} typo-text-sm font-bold`}
              >
                {mission.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default MissionList;
