import { cn } from "@/utils/cn";

/* ──────────────────────────────────────────────
 * 아이템 기본
 * ────────────────────────────────────────────── */

export const listItemBase = cn(
  "flex items-center gap-[8rem] w-full box-border select-none",
  "transition-colors duration-100",
  "focus-visible:outline-none focus-visible:shadow-[var(--selected-shadow)]",
);

/* ──────────────────────────────────────────────
 * 상태별 스타일
 * ────────────────────────────────────────────── */

// 비활성화가 아닐 때 hover/active 인터랙션
export const listItemInteractiveStyles = cn(
  "cursor-pointer",
  "hover:bg-[var(--color-bg-subtle)]",
  "active:bg-[var(--color-bg-muted)]",
);

export const listItemDefaultTextStyles = "text-[var(--color-text-subtle)]";
export const listItemSelectedTextStyles = "text-[var(--color-interactive-brand)]";

export const listItemDisabledStyles = cn(
  "text-[var(--color-text-disabled)] cursor-not-allowed",
);

/* ──────────────────────────────────────────────
 * 사이즈별 높이 / 패딩 / 타이포
 * (Figma: lg=h56/px28, md=h48/px24, sm=h40/px20)
 * ────────────────────────────────────────────── */

export const listItemSizeStyles = {
  lg: "h-[56rem] px-[28rem]",
  md: "h-[48rem] px-[24rem]",
  sm: "h-[40rem] px-[20rem]",
} as const;

export const listItemTypoStyles = {
  lg: "typo-text-lg font-normal",
  md: "typo-text-md font-normal",
  sm: "typo-text-sm font-normal",
} as const;

/* ──────────────────────────────────────────────
 * 체크박스 시각 표시 (Figma 기준)
 * lg → 20rem×20rem / md,sm → 16rem×16rem
 * ────────────────────────────────────────────── */

export const listCheckboxStyles = {
  lg: { box: "size-[20rem] rounded-[4rem]", iconSize: 12 as const },
  md: { box: "size-[16rem] rounded-[2rem]", iconSize: 12 as const },
  sm: { box: "size-[16rem] rounded-[2rem]", iconSize: 12 as const },
} as const;

/* ──────────────────────────────────────────────
 * 아이콘 래퍼
 * lg → 20rem, md → 16rem, sm → 12rem
 * ────────────────────────────────────────────── */

export const listItemIconSizeStyles = {
  lg: "size-[20rem]",
  md: "size-[16rem]",
  sm: "size-[12rem]",
} as const;

export const listItemIconWrapperStyles = cn(
  "flex-shrink-0 flex items-center justify-center",
  "[&>*]:w-full [&>*]:h-full",
);

