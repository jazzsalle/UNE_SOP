import { cn } from "@/utils/cn";

/* ──────────────────────────────────────────────
 * 타입
 * ────────────────────────────────────────────── */

export type TextareaIntent = "default" | "complete" | "error";
export type TextareaSize = "lg" | "md" | "sm";

/* ──────────────────────────────────────────────
 * 컨테이너 (wrapper)
 * ────────────────────────────────────────────── */

export const baseWrapper = cn(
  "flex flex-col w-full box-border border-[1rem] rounded-[6rem]",
  "transition-[color,background-color,border-color,box-shadow] duration-200",
  "cursor-text",
  "p-[4rem] pt-[8rem]",
);

/* ──────────────────────────────────────────────
 * 상태 스타일 (다크모드는 시맨틱 토큰이 자동 처리)
 * ────────────────────────────────────────────── */

export const stateStyles = {
  default: cn(
    "bg-[var(--color-bg-surface)]",
    "border-[var(--color-border-default)]",
    "hover:border-[var(--color-border-brand)]",
  ),
  focus: cn(
    "bg-[var(--color-bg-surface)]",
    "border-[var(--color-border-brand)]",
    "shadow-[var(--selected-shadow)]",
  ),
  error: cn(
    "bg-[var(--color-bg-surface)]",
    "border-[var(--color-border-danger)]",
    "hover:border-[var(--color-interactive-danger-hover)]",
  ),
  errorFocus: cn(
    "bg-[var(--color-bg-surface)]",
    "border-[var(--color-border-danger)]",
    "shadow-[var(--selected-shadow)]",
  ),
  complete: cn(
    "bg-[var(--color-bg-surface)]",
    "border-[var(--color-border-default)]",
    "hover:border-[var(--color-border-brand)]",
  ),
  completeFocus: cn(
    "bg-[var(--color-bg-surface)]",
    "border-[var(--color-border-brand)]",
    "shadow-[var(--selected-shadow)]",
  ),
  disabled: cn(
    "bg-[var(--color-bg-muted)] border-[var(--color-border-default)] cursor-not-allowed",
  ),
};

/* ──────────────────────────────────────────────
 * textarea 요소
 * ────────────────────────────────────────────── */

export const textareaBase = cn(
  "flex-1 bg-transparent border-none outline-none font-normal",
  "pb-[4rem]",
  "text-[var(--color-text-default)] placeholder:text-[var(--color-text-placeholder)]",
  "disabled:cursor-not-allowed",
  "disabled:text-[var(--color-text-disabled)] disabled:placeholder:text-[var(--color-text-disabled)]",
  "disabled:bg-transparent",
);

// wrapper px-[4rem] + textarea px = 실제 패딩: LG=16, MD=12, SM=8
export const textareaSizeStyles: Record<TextareaSize, string> = {
  lg: "px-[12rem] typo-text-lg font-normal",
  md: "px-[8rem]  typo-text-md font-normal",
  sm: "px-[4rem]  typo-text-sm font-normal",
};

/* ──────────────────────────────────────────────
 * 카운터
 * ────────────────────────────────────────────── */

export const counterStyles = cn(
  "typo-text-sm font-normal",
  "text-right flex-shrink-0",
  "text-[var(--color-text-subtle)]",
);

export const counterCountStyles = cn(
  "text-[var(--color-text-brand)]",
);

export const counterCountErrorStyles = cn(
  "text-[var(--color-text-danger)]",
);

/* ──────────────────────────────────────────────
 * 라벨 / 헬퍼 텍스트
 * ────────────────────────────────────────────── */

export const labelSizeStyles: Record<TextareaSize, string> = {
  lg: "typo-text-md font-normal text-[var(--color-text-subtle)]",
  md: "typo-text-sm font-normal text-[var(--color-text-subtle)]",
  sm: "typo-text-sm font-normal text-[var(--color-text-subtle)]",
};

export const helperStyles = cn(
  "typo-text-sm font-normal",
  "text-[var(--color-text-brand)]",
);

export const errorTextStyles = cn(
  "typo-text-sm font-normal",
  "text-[var(--color-text-danger)]",
);

export const completeTextStyles = cn(
  "typo-text-sm font-normal",
  "text-[var(--color-text-success)]",
);

/* ──────────────────────────────────────────────
 * 리사이즈 핸들
 * ────────────────────────────────────────────── */

export const resizeHandleStyles = cn(
  "pointer-events-none",
  "text-[var(--color-icon-disabled)]",
);
