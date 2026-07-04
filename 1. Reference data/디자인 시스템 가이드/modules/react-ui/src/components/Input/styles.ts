import { cn } from "@/utils/cn";

/* ──────────────────────────────────────────────
 * 타입
 * ────────────────────────────────────────────── */

export type InputSize = "3xl" | "2xl" | "xl" | "lg" | "md" | "sm" | "xs" | "2xs";
export type InputVariant = "standard" | "inline";

/* ──────────────────────────────────────────────
 * 컨테이너 (wrapper)
 * ────────────────────────────────────────────── */

export const baseWrapper = cn(
  "inline-flex items-center w-full box-border border-[1rem] rounded-[6rem]",
  "transition-[color,background-color,border-color,box-shadow] duration-200",
  "cursor-text",
);

export const sizeStyles: Record<InputSize, string> = {
  "3xl": "h-[56rem] px-[16rem] gap-[8rem] rounded-[8rem]",
  "2xl": "h-[52rem] px-[16rem] gap-[8rem] rounded-[8rem]",
  xl:    "h-[48rem] px-[16rem] gap-[8rem] rounded-[6rem]",
  lg:    "h-[44rem] px-[12rem] gap-[8rem] rounded-[6rem]",
  md:    "h-[40rem] px-[12rem] gap-[8rem] rounded-[6rem]",
  sm:    "h-[36rem] px-[12rem] gap-[8rem] rounded-[6rem]",
  xs:    "h-[32rem] px-[8rem]  gap-[8rem] rounded-[4rem]",
  "2xs": "h-[28rem] px-[8rem]  gap-[8rem] rounded-[4rem]",
};

// Inline 컨테이너 — 높이·반경만 (px·gap은 내부 섹션이 관리)
export const inlineContainerSizeStyles: Record<InputSize, string> = {
  "3xl": "h-[56rem] rounded-[8rem]",
  "2xl": "h-[52rem] rounded-[8rem]",
  xl:    "h-[48rem] rounded-[6rem]",
  lg:    "h-[44rem] rounded-[6rem]",
  md:    "h-[40rem] rounded-[6rem]",
  sm:    "h-[36rem] rounded-[6rem]",
  xs:    "h-[32rem] rounded-[4rem]",
  "2xs": "h-[28rem] rounded-[4rem]",
};

// Inline 레이블·입력 영역 공통 좌우 패딩
export const inlinePxStyles: Record<InputSize, string> = {
  "3xl": "px-[16rem]",
  "2xl": "px-[16rem]",
  xl:    "px-[16rem]",
  lg:    "px-[12rem]",
  md:    "px-[12rem]",
  sm:    "px-[12rem]",
  xs:    "px-[12rem]",
  "2xs": "px-[12rem]",
};

/* ──────────────────────────────────────────────
 * 상태 스타일 (다크모드는 시맨틱 토큰이 자동 처리)
 * ────────────────────────────────────────────── */

export type InputIntent = "default" | "complete" | "error";

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
 * input 요소
 * ────────────────────────────────────────────── */

export const inputBase = cn(
  "flex-1 min-w-0 bg-transparent border-none outline-none",
  "text-[var(--color-text-default)] placeholder:text-[var(--color-text-placeholder)]",
  "disabled:cursor-not-allowed",
  "disabled:text-[var(--color-text-disabled)] disabled:placeholder:text-[var(--color-text-disabled)]",
  "disabled:bg-transparent",
);

export const inputSizeStyles: Record<InputSize, string> = {
  "3xl": "typo-title-sm font-normal",
  "2xl": "typo-text-lg font-normal",
  xl:    "typo-text-lg font-normal",
  lg:    "typo-text-lg font-normal",
  md:    "typo-text-md font-normal",
  sm:    "typo-text-md font-normal",
  xs:    "typo-text-sm font-normal",
  "2xs": "typo-text-sm font-normal",
};

/* ──────────────────────────────────────────────
 * 아이콘 / 클리어 버튼
 * ────────────────────────────────────────────── */

export const iconStyles = cn(
  "flex-shrink-0 flex items-center justify-center",
  "text-[var(--color-icon-default)]",
);

export const iconSizeStyles: Record<InputSize, string> = {
  "3xl": "size-[24rem]",
  "2xl": "size-[24rem]",
  xl:    "size-[20rem]",
  lg:    "size-[20rem]",
  md:    "size-[16rem]",
  sm:    "size-[16rem]",
  xs:    "size-[16rem]",
  "2xs": "size-[16rem]",
};

/* ──────────────────────────────────────────────
 * 레이블 / 헬퍼 텍스트
 * ────────────────────────────────────────────── */

export const labelSizeStyles: Record<InputSize, string> = {
  "3xl": "typo-text-md font-normal text-[var(--color-text-subtle)]",
  "2xl": "typo-text-md font-normal text-[var(--color-text-subtle)]",
  xl:    "typo-text-md font-normal text-[var(--color-text-subtle)]",
  lg:    "typo-text-sm font-normal text-[var(--color-text-subtle)]",
  md:    "typo-text-sm font-normal text-[var(--color-text-subtle)]",
  sm:    "typo-text-sm font-normal text-[var(--color-text-subtle)]",
  xs:    "typo-text-sm font-normal text-[var(--color-text-subtle)]",
  "2xs": "typo-text-sm font-normal text-[var(--color-text-subtle)]",
};

// Inline 레이블 섹션 텍스트 스타일 (동일 사이즈 + medium 굵기)
export const inlineLabelSizeStyles: Record<InputSize, string> = {
  "3xl": "typo-text-md font-medium",
  "2xl": "typo-text-md font-medium",
  xl:    "typo-text-md font-medium",
  lg:    "typo-text-sm font-medium",
  md:    "typo-text-sm font-medium",
  sm:    "typo-text-sm font-medium",
  xs:    "typo-text-sm font-medium",
  "2xs": "typo-text-sm font-medium",
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
