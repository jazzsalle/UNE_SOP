/**
 * Mission Report Card — 현장 회신 뷰의 임무 카드 1건.
 * 제목/상태 뱃지/담당·기한 메타를 표시하고,
 * - 미종결(SENT|RUNNING|DELAYED) 임무: 결과 라디오("조치 완료"/"조치 불가") + 비고 입력 +
 *   "회신" 버튼 → onReport 콜백(부모가 REPORT_ACTION 디스패치 + saveRun — 단일 진실 유지)
 * - 이미 회신된 임무(actionReports 매칭): 회신 내역(결과/비고/시각/회신자) 읽기 전용 표시
 * - 회신 없이 종결된 임무(Studio 수동 전이 등): 상태 뱃지만 표시
 * 색상은 전부 디자인 시스템 CSS 변수 토큰 사용 (hex/rgb 하드코딩 금지).
 */
import { useState } from "react";
import type { RuntimeMission } from "../domain";
import type { ActionReport } from "../engine";

/** 임무 상태 → 뱃지 변형 클래스 (RunDetailPanel과 동일 관례). */
const MISSION_STATUS_BADGE: Record<RuntimeMission["status"], string> = {
  SENT: "responder-badge--info",
  RUNNING: "responder-badge--brand",
  COMPLETED: "responder-badge--success",
  DELAYED: "responder-badge--warning",
  FAILED: "responder-badge--danger",
};

/** 임무 상태 → 한국어 라벨 (RunDetailPanel과 동일 관례). */
const MISSION_STATUS_LABEL: Record<RuntimeMission["status"], string> = {
  SENT: "하달",
  RUNNING: "착수",
  COMPLETED: "완료",
  DELAYED: "지연",
  FAILED: "실패",
};

/** 회신 결과 → 한국어 라벨. */
const RESULT_LABEL: Record<ActionReport["result"], string> = {
  DONE: "조치 완료",
  IMPOSSIBLE: "조치 불가",
};

/** 회신 결과 → 뱃지 변형 클래스. */
const RESULT_BADGE: Record<ActionReport["result"], string> = {
  DONE: "responder-badge--success",
  IMPOSSIBLE: "responder-badge--danger",
};

/** ISO 시각 → 로컬 시간 표기. 파싱 실패 시 원문을 그대로 반환한다. */
function formatLocalTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
}

interface MissionReportCardProps {
  /** 표시할 임무 — run.missions의 항목. */
  mission: RuntimeMission;
  /** 이 임무에 대한 회신 기록 — run.actionReports에서 missionId 매칭(없으면 undefined). */
  report?: ActionReport;
  /** run이 진행 중(RUNNING)인지 — 종결 run은 읽기 전용. */
  runActive: boolean;
  /** "회신" 제출 콜백 — 부모(ResponderPage)가 REPORT_ACTION 디스패치 + saveRun을 수행한다. */
  onReport: (missionId: string, result: "DONE" | "IMPOSSIBLE", note: string) => void;
}

function MissionReportCard({
  mission,
  report,
  runActive,
  onReport,
}: MissionReportCardProps) {
  const [result, setResult] = useState<"" | "DONE" | "IMPOSSIBLE">("");
  const [note, setNote] = useState("");

  // 회신 가능 조건 — run 진행 중 + 미종결(SENT|RUNNING|DELAYED) + 아직 회신 없음.
  const reportable =
    runActive &&
    !report &&
    (mission.status === "SENT" ||
      mission.status === "RUNNING" ||
      mission.status === "DELAYED");

  const handleSubmit = () => {
    if (!result) return;
    onReport(mission.missionId, result, note.trim());
  };

  return (
    <article className="mission-report-card" aria-label={`임무: ${mission.title}`}>
      <div className="mission-report-card__top">
        <span
          className={`responder-badge ${MISSION_STATUS_BADGE[mission.status]} typo-text-sm font-bold`}
        >
          {MISSION_STATUS_LABEL[mission.status]}
        </span>
        <span className="mission-report-card__title typo-text-md font-bold">
          {mission.title}
        </span>
      </div>
      <p className="mission-report-card__meta typo-text-sm">
        담당: {mission.assigneeRole ?? "담당 미지정"}
        {mission.dueMinutes !== undefined ? ` · 기한 ${mission.dueMinutes}분` : ""}
      </p>

      {report ? (
        // 회신 완료 — 회신 내역 읽기 전용 표시.
        <div className="report-history">
          <div className="report-history__row">
            <span className="report-history__key typo-text-sm font-bold">결과</span>
            <span
              className={`responder-badge ${RESULT_BADGE[report.result]} typo-text-sm font-bold`}
            >
              {RESULT_LABEL[report.result]}
            </span>
          </div>
          {report.note && (
            <div className="report-history__row">
              <span className="report-history__key typo-text-sm font-bold">비고</span>
              <span className="report-history__value typo-text-sm">{report.note}</span>
            </div>
          )}
          <div className="report-history__row">
            <span className="report-history__key typo-text-sm font-bold">회신</span>
            <span className="report-history__value typo-text-sm">
              {report.reporter} · {formatLocalTime(report.reportedAt)} (경과{" "}
              {report.elapsedMinutes}분)
            </span>
          </div>
        </div>
      ) : reportable ? (
        // 미종결 임무 — 조치결과 회신 폼.
        <div className="mission-report-card__form">
          <div
            className="mission-report-card__radios"
            role="radiogroup"
            aria-label="조치 결과 선택"
          >
            <label className="mission-report-card__radio typo-text-sm">
              <input
                type="radio"
                name={`report-result-${mission.missionId}`}
                checked={result === "DONE"}
                onChange={() => setResult("DONE")}
              />
              조치 완료
            </label>
            <label className="mission-report-card__radio typo-text-sm">
              <input
                type="radio"
                name={`report-result-${mission.missionId}`}
                checked={result === "IMPOSSIBLE"}
                onChange={() => setResult("IMPOSSIBLE")}
              />
              조치 불가
            </label>
          </div>
          <input
            type="text"
            className="mission-report-card__note typo-text-sm"
            placeholder="비고 (현장 특이사항 — 선택)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            aria-label="회신 비고"
          />
          <div className="mission-report-card__submit-row">
            <button
              type="button"
              className="responder-btn responder-btn--primary typo-text-sm font-bold"
              onClick={handleSubmit}
              disabled={!result}
            >
              회신
            </button>
          </div>
        </div>
      ) : (
        // 회신 없이 종결된 임무(Studio 수동 전이 등) 또는 종결 run — 읽기 전용 안내.
        <p className="mission-report-card__closed typo-text-sm">
          {mission.status === "COMPLETED" || mission.status === "FAILED"
            ? "회신 없이 처리된 임무입니다"
            : "실행이 종결되어 회신할 수 없습니다"}
        </p>
      )}
    </article>
  );
}

export default MissionReportCard;
