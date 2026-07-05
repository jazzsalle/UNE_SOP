/**
 * Timeline View — Runtime Preview §6의 세로 타임라인.
 * SimulationResult.timeline을 `+{offsetMinutes}분` + kind별 점 색 + 한국어 메시지로 나열한다.
 * 점 색은 status 계열 CSS 변수 토큰을 인라인 var()로 주입한다 (hex/rgb 금지,
 * 계열 배정은 flowTokens.ts의 PORT_COLOR_TOKEN 색 배정과 톤을 맞춘다).
 */
import type { TimelineEntry } from "../../../engine";
import "./runtime.css";

/** TimelineEntry.kind → 점 색 토큰 — 이벤트=danger, 임무=brand, 응답=success 등 흐름 계열 색. */
const KIND_DOT_TOKEN: Record<TimelineEntry["kind"], string> = {
  event: "--color-bg-danger",
  scope: "--color-bg-warning",
  asset: "--color-bg-info",
  condition: "--color-bg-warning",
  mission: "--color-bg-brand",
  notification: "--color-bg-info",
  response: "--color-bg-success",
  escalation: "--color-bg-danger",
  board: "--color-bg-neutral",
  record: "--color-bg-neutral",
};

function TimelineView({ timeline }: { timeline: TimelineEntry[] }) {
  if (timeline.length === 0) {
    return (
      <p className="runtime-section__empty typo-text-sm">
        타임라인 항목이 없습니다
      </p>
    );
  }

  return (
    <ol className="timeline">
      {timeline.map((entry) => (
        <li key={entry.seq} className="timeline__entry">
          <span
            className="timeline__dot"
            style={{ background: `var(${KIND_DOT_TOKEN[entry.kind]})` }}
            aria-hidden
          />
          <span className="timeline__offset typo-text-sm font-bold">
            +{entry.offsetMinutes}분
          </span>
          <span className="timeline__message typo-text-sm">
            {entry.message}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default TimelineView;
