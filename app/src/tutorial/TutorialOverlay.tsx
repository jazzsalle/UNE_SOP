/**
 * TutorialOverlay — 단계별 조작 튜토리얼 오버레이 (Phase 9 T6).
 * tutorialSteps의 스텝을 따라 (a) 스텝 진입 시 필요한 앱 뷰로 자동 전환하고,
 * (b) data-tutorial-id 대상 rect를 useTargetRect로 추적해 하이라이트 링 +
 * SVG 마우스 커서 아이콘 + 말풍선(순번/제목/본문/이전·다음·닫기)을 배치한다.
 * 대상이 없거나(targetId: null) 아직 화면에 없으면 중앙 안내로 폴백한다.
 * 닫기(X/Esc) 시 App의 onClose로 완전 언마운트되며, 다시 열면 1스텝부터 시작한다.
 * 말풍선 배치: 기본은 하이라이트 아래, 하단이 넘치면 위로 뒤집는다(flip).
 * 색상은 전부 디자인 시스템 CSS 변수 토큰 사용 (hex/rgb 하드코딩 금지).
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useAppView } from "../shell/AppViewContext";
import { TUTORIAL_STEPS } from "./tutorialSteps";
import { useTargetRect } from "./useTargetRect";
import "./tutorial.css";

export interface TutorialOverlayProps {
  /** 오버레이 표시 여부 — App의 tutorialOpen state가 제어한다. */
  open: boolean;
  /** 닫기 콜백 — 닫으면 오버레이가 완전히 제거된다. */
  onClose: () => void;
}

/** 하이라이트 링이 대상 rect보다 사방으로 넓게 잡는 여백(px). */
const HIGHLIGHT_PADDING = 6;
/** 말풍선 고정 폭(px) — tutorial.css의 .tutorial-tooltip width와 일치해야 한다. */
const TOOLTIP_WIDTH = 340;
/** 말풍선 높이 추정치(px) — 하단 넘침(flip) 판정에만 사용한다. */
const TOOLTIP_ESTIMATED_HEIGHT = 240;
/** 하이라이트 링과 말풍선 사이 간격(px). */
const TOOLTIP_GAP = 12;
/** 말풍선/하이라이트가 뷰포트 가장자리에서 유지하는 최소 여백(px). */
const VIEWPORT_MARGIN = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 오버레이 본체 — open일 때만 마운트되므로 rect 폴링/키 리스너도 그때만 돈다. */
function TutorialOverlayContent({ onClose }: { onClose: () => void }) {
  const { activeView, setActiveView } = useAppView();
  const [stepIndex, setStepIndex] = useState(0);
  const step = TUTORIAL_STEPS[stepIndex];
  const totalSteps = TUTORIAL_STEPS.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  // 스텝 "진입 시"에만 뷰를 자동 전환한다 — activeView를 deps에 넣으면
  // 사용자가 다른 탭을 눌러도 계속 되돌리는 잠금이 되므로 ref로 최신값만 읽는다.
  const activeViewRef = useRef(activeView);
  activeViewRef.current = activeView;
  useEffect(() => {
    if (step.view !== activeViewRef.current) {
      setActiveView(step.view);
    }
  }, [step.view, setActiveView]);

  // Esc로 닫기.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const rect = useTargetRect(step.targetId);

  // ── 배치 계산 — rect가 있으면 하이라이트/커서/말풍선을 rect 기준으로,
  //    없으면(대상 未렌더 또는 targetId null) 중앙 안내 폴백.
  let highlightStyle: CSSProperties | null = null;
  let cursorStyle: CSSProperties | null = null;
  let tooltipStyle: CSSProperties | undefined;

  if (rect) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const highlight = {
      left: rect.left - HIGHLIGHT_PADDING,
      top: rect.top - HIGHLIGHT_PADDING,
      width: rect.width + HIGHLIGHT_PADDING * 2,
      height: rect.height + HIGHLIGHT_PADDING * 2,
    };
    highlightStyle = highlight;

    // 커서 아이콘 — 하이라이트 우하단 모서리에 살짝 겹치게 배치.
    cursorStyle = {
      left: highlight.left + highlight.width - 10,
      top: highlight.top + highlight.height - 10,
    };

    // 말풍선 — 좌측은 하이라이트 좌변 정렬 + 뷰포트 클램프, 세로는 아래 우선.
    const tooltipLeft = clamp(
      highlight.left,
      VIEWPORT_MARGIN,
      Math.max(VIEWPORT_MARGIN, viewportWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN),
    );
    const belowTop = highlight.top + highlight.height + TOOLTIP_GAP;
    const overflowsBottom =
      belowTop + TOOLTIP_ESTIMATED_HEIGHT > viewportHeight - VIEWPORT_MARGIN;
    tooltipStyle = overflowsBottom
      ? {
          left: tooltipLeft,
          // 위로 뒤집기 — 하이라이트 상단에서 GAP만큼 띄운 지점을 bottom 기준으로.
          bottom: viewportHeight - highlight.top + TOOLTIP_GAP,
        }
      : { left: tooltipLeft, top: belowTop };
  }

  // 대상이 지정됐지만 아직 화면에 없는 경우(뷰 전환 직후 未렌더 등) 폴백 힌트.
  const targetMissing = step.targetId !== null && rect === null;

  return (
    <div
      className="tutorial-overlay"
      role="dialog"
      aria-label="단계별 조작 튜토리얼"
    >
      {highlightStyle ? (
        <div className="tutorial-highlight" style={highlightStyle} />
      ) : (
        <div className="tutorial-dim" />
      )}

      {cursorStyle && (
        <div className="tutorial-cursor" style={cursorStyle} aria-hidden="true">
          {/* 마우스 커서 아이콘 — 인라인 SVG path, fill은 currentColor(토큰 색). */}
          <svg viewBox="0 0 24 24" role="presentation" focusable="false">
            <path
              d="M5.5 3.5v16.2c0 .53.64.8 1.02.42l4.1-4.1a.5.5 0 0 1 .36-.15h5.82c.53 0 .8-.65.42-1.02L6.52 3.07a.6.6 0 0 0-1.02.43Z"
              fill="currentColor"
              stroke="var(--color-bg-surface)"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      <div
        className={`tutorial-tooltip${rect ? "" : " tutorial-tooltip--center"}`}
        style={tooltipStyle}
      >
        <div className="tutorial-tooltip__header">
          <span className="tutorial-tooltip__badge typo-text-sm font-bold">
            {stepIndex + 1}
          </span>
          <h3 className="tutorial-tooltip__title typo-text-md font-bold">
            {step.title}
          </h3>
          <button
            type="button"
            className="tutorial-tooltip__close typo-text-md"
            onClick={onClose}
            aria-label="튜토리얼 닫기"
          >
            ✕
          </button>
        </div>

        <p className="tutorial-tooltip__body typo-text-sm">{step.body}</p>

        {targetMissing && (
          <p className="tutorial-tooltip__hint typo-text-sm" role="status">
            대상 화면 요소가 아직 표시되지 않아 중앙 안내로 대체합니다 — 앞
            단계의 조작을 수행하면 해당 위치가 하이라이트됩니다.
          </p>
        )}

        <div className="tutorial-tooltip__footer">
          <span className="tutorial-tooltip__progress typo-text-sm">
            {stepIndex + 1} / {totalSteps}
          </span>
          <button
            type="button"
            className="tutorial-btn tutorial-btn--outline typo-text-sm"
            onClick={() => setStepIndex((index) => Math.max(index - 1, 0))}
            disabled={isFirst}
          >
            이전
          </button>
          <button
            type="button"
            className="tutorial-btn tutorial-btn--primary typo-text-sm font-bold"
            onClick={() =>
              isLast
                ? onClose()
                : setStepIndex((index) => Math.min(index + 1, totalSteps - 1))
            }
          >
            {isLast ? "완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TutorialOverlay({ open, onClose }: TutorialOverlayProps) {
  // 닫힌 상태에서는 내용 컴포넌트를 완전 언마운트한다 —
  // rect 폴링/키 리스너가 정리되고, 다시 열면 항상 1스텝부터 시작한다.
  if (!open) {
    return null;
  }
  return <TutorialOverlayContent onClose={onClose} />;
}

export default TutorialOverlay;
