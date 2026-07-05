/**
 * Mission Control List — Execution 탭 §임무 통제 표.
 * run.missions를 임무/담당 역할/기한(분)/상태/조치 열로 나열한다.
 * 상태 뱃지는 SENT=info / RUNNING=brand / COMPLETED=success / DELAYED=warning /
 * FAILED=danger 토큰, 조치 버튼([착수][완료][실패])은 executor 허용 전이표
 * (START: SENT / COMPLETE: RUNNING|DELAYED / FAIL: SENT|RUNNING|DELAYED)와
 * 동일한 조건으로만 활성화한다 — 전이 불가능한 버튼은 disabled.
 */
import type { RuntimeMission } from "../../../domain";
import type { ExecutorAction } from "../../../engine";
import "./execution.css";

/** RuntimeMission.status → 뱃지 변형 클래스 (MissionList 관례와 동일 매핑). */
const MISSION_STATUS_BADGE: Record<RuntimeMission["status"], string> = {
  SENT: "exec-badge--info",
  RUNNING: "exec-badge--brand",
  COMPLETED: "exec-badge--success",
  DELAYED: "exec-badge--warning",
  FAILED: "exec-badge--danger",
};

interface MissionControlListProps {
  missions: RuntimeMission[];
  /** run이 진행 중(RUNNING)일 때만 true — 종결된 run은 모든 버튼 비활성. */
  runActive: boolean;
  /** 조치 버튼 클릭 → ExecutorAction 디스패치 (ExecutionPanel이 saveRun까지 수행). */
  onAction: (action: ExecutorAction) => void;
}

function MissionControlList({ missions, runActive, onAction }: MissionControlListProps) {
  if (missions.length === 0) {
    return (
      <p className="exec-section__empty typo-text-sm">생성된 임무가 없습니다</p>
    );
  }

  return (
    <table className="exec-table typo-text-sm">
      <thead>
        <tr>
          <th>임무</th>
          <th>담당 역할</th>
          <th>기한(분)</th>
          <th>상태</th>
          <th>조치</th>
        </tr>
      </thead>
      <tbody>
        {missions.map((mission) => {
          // executor 전이표와 동일한 활성화 조건 — no-op이 될 클릭을 UI에서 차단한다.
          const canStart = runActive && mission.status === "SENT";
          const canComplete =
            runActive &&
            (mission.status === "RUNNING" || mission.status === "DELAYED");
          const canFail =
            runActive &&
            (mission.status === "SENT" ||
              mission.status === "RUNNING" ||
              mission.status === "DELAYED");
          return (
            <tr key={mission.missionId}>
              <td>{mission.title}</td>
              <td>{mission.assigneeRole ?? "-"}</td>
              <td>{mission.dueMinutes ?? "-"}</td>
              <td>
                <span
                  className={`exec-badge ${MISSION_STATUS_BADGE[mission.status]} typo-text-sm font-bold`}
                >
                  {mission.status}
                </span>
              </td>
              <td>
                <div className="exec-table__actions">
                  <button
                    type="button"
                    className="exec-btn exec-btn--outline typo-text-sm"
                    disabled={!canStart}
                    onClick={() =>
                      onAction({ type: "START_MISSION", missionId: mission.missionId })
                    }
                  >
                    착수
                  </button>
                  <button
                    type="button"
                    className="exec-btn exec-btn--success typo-text-sm"
                    disabled={!canComplete}
                    onClick={() =>
                      onAction({
                        type: "COMPLETE_MISSION",
                        missionId: mission.missionId,
                      })
                    }
                  >
                    완료
                  </button>
                  <button
                    type="button"
                    className="exec-btn exec-btn--danger typo-text-sm"
                    disabled={!canFail}
                    onClick={() =>
                      onAction({ type: "FAIL_MISSION", missionId: mission.missionId })
                    }
                  >
                    실패
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default MissionControlList;
