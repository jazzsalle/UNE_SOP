/**
 * ScenarioStepCard — 시나리오 실행기 우측 단계 카드 1장 (Phase 9 T4).
 * 순번/제목/설명/상태 뱃지(대기·진행 가능·완료)/실행 버튼을 표시하고,
 * 결과 요약·보조 내비 버튼은 children으로 페이지가 주입한다.
 * 실행 버튼은 "대기" 상태에서 항상 비활성(순차 활성화)이며, 완료 후 잠금 여부는
 * 페이지가 actionDisabled로 제어한다(내비형 버튼은 완료 후에도 눌러야 하므로).
 * 색상은 전부 디자인 시스템 CSS 변수 토큰 사용 (hex/rgb 하드코딩 금지).
 */
import type { ReactNode } from "react";
import type { ScenarioStepStatus } from "./useScenarioRunner";

/** 단계 상태 → 한국어 라벨. */
const STATUS_LABEL: Record<ScenarioStepStatus, string> = {
  waiting: "대기",
  ready: "진행 가능",
  done: "완료",
};

/** 단계 상태 → 뱃지 변형 클래스 (dashboard-badge 관례). */
const STATUS_BADGE: Record<ScenarioStepStatus, string> = {
  waiting: "scenario-badge--neutral",
  ready: "scenario-badge--brand",
  done: "scenario-badge--success",
};

interface ScenarioStepCardProps {
  /** 표시 순번 — 1부터. */
  index: number;
  title: string;
  description: string;
  status: ScenarioStepStatus;
  /** 튜토리얼(T6) 계약 id — 부여 대상 카드에만 지정한다. */
  tutorialId?: string;
  /** 실행 버튼 라벨 — 미지정 시 버튼을 렌더하지 않는다. */
  actionLabel?: string;
  onAction?: () => void;
  /** 페이지가 제어하는 추가 비활성 조건(예: 완료 후 재실행 잠금). */
  actionDisabled?: boolean;
  /** 단계 오류 메시지 — 있으면 role="alert"로 표시한다. */
  error?: string;
  /** 결과 요약/보조 버튼 영역. */
  children?: ReactNode;
}

function ScenarioStepCard({
  index,
  title,
  description,
  status,
  tutorialId,
  actionLabel,
  onAction,
  actionDisabled = false,
  error,
  children,
}: ScenarioStepCardProps) {
  return (
    <article
      className={`scenario-step scenario-step--${status}`}
      data-tutorial-id={tutorialId}
      aria-label={`${index}단계 ${title}`}
    >
      <div className="scenario-step__head">
        <span className="scenario-step__index typo-text-sm font-bold" aria-hidden="true">
          {index}
        </span>
        <h4 className="scenario-step__title typo-text-md font-bold">{title}</h4>
        <span className={`scenario-badge ${STATUS_BADGE[status]} typo-text-sm font-bold`}>
          {STATUS_LABEL[status]}
        </span>
        {actionLabel && (
          <button
            type="button"
            className="scenario-btn scenario-btn--primary typo-text-sm font-bold"
            onClick={onAction}
            disabled={status === "waiting" || actionDisabled}
          >
            {actionLabel}
          </button>
        )}
      </div>
      <p className="scenario-step__desc typo-text-sm">{description}</p>
      {error && (
        <p className="scenario-step__error typo-text-sm" role="alert">
          {error}
        </p>
      )}
      {children}
    </article>
  );
}

export default ScenarioStepCard;
