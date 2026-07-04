import { cn } from "@/utils/cn";

/* ──────────────────────────────────────────────
 * 타입
 * ────────────────────────────────────────────── */

export type SelectSize = "3xl" | "2xl" | "xl" | "lg" | "md" | "sm" | "xs" | "2xs";
export type SelectIntent = "none" | "complete" | "error";
export type SelectVariant = "standard" | "inline";

/* ──────────────────────────────────────────────
 * 트리거 (버튼)
 * ────────────────────────────────────────────── */

export const baseTrigger = cn(
  "inline-flex items-center w-full box-border border-[1rem] rounded-[6rem]",
  "transition-[color,background-color,border-color,box-shadow] duration-200",
  "cursor-pointer select-none outline-none",
);

export const triggerSizeStyles: Record<SelectSize, string> = {
  "3xl": "h-[56rem] px-[20rem] gap-[8rem] rounded-[6rem]",
  "2xl": "h-[52rem] px-[16rem] gap-[8rem] rounded-[6rem]",
  xl:    "h-[48rem] px-[16rem] gap-[8rem] rounded-[6rem]",
  lg:    "h-[44rem] px-[16rem] gap-[8rem] rounded-[6rem]",
  md:    "h-[40rem] px-[12rem] gap-[8rem] rounded-[6rem]",
  sm:    "h-[36rem] px-[12rem] gap-[8rem] rounded-[6rem]",
  xs:    "h-[32rem] px-[12rem] gap-[8rem] rounded-[4rem]",
  "2xs": "h-[28rem] px-[12rem] gap-[8rem] rounded-[4rem]",
};

export const triggerTextStyles: Record<SelectSize, string> = {
  "3xl": "typo-text-lg font-normal",
  "2xl": "typo-text-lg font-normal",
  xl:    "typo-text-lg font-normal",
  lg:    "typo-text-lg font-normal",
  md:    "typo-text-md font-normal",
  sm:    "typo-text-md font-normal",
  xs:    "typo-text-md font-normal",
  "2xs": "typo-text-sm font-normal",
};

/* ──────────────────────────────────────────────
 * 상태 스타일 (다크모드는 시맨틱 토큰이 자동 처리)
 * ────────────────────────────────────────────── */

export const stateStyles = {
  default: cn(
    "bg-[var(--color-bg-surface)]",
    "border-[var(--color-border-default)]",
    "hover:border-[var(--color-border-brand)]",
  ),
  focused: cn(
    "bg-[var(--color-bg-surface)]",
    "border-[var(--color-border-brand)]",
    "shadow-[var(--selected-shadow)]",
  ),
  open: cn(
    "bg-[var(--color-bg-surface)]",
    "border-[var(--color-border-brand)]",
    "shadow-[var(--selected-shadow)]",
  ),
  error: cn(
    "bg-[var(--color-bg-surface)]",
    "border-[var(--color-border-danger)]",
    "hover:border-[var(--color-interactive-danger-hover)]",
  ),
  errorFocused: cn(
    "bg-[var(--color-bg-surface)]",
    "border-[var(--color-border-danger)]",
    "shadow-[var(--selected-shadow)]",
  ),
  errorOpen: cn(
    "bg-[var(--color-bg-surface)]",
    "border-[var(--color-border-danger)]",
    "shadow-[var(--selected-shadow)]",
  ),
  complete: cn(
    "bg-[var(--color-bg-surface)]",
    "border-[var(--color-border-default)]",
    "hover:border-[var(--color-border-brand)]",
  ),
  completeFocused: cn(
    "bg-[var(--color-bg-surface)]",
    "border-[var(--color-border-brand)]",
    "shadow-[var(--selected-shadow)]",
  ),
  completeOpen: cn(
    "bg-[var(--color-bg-surface)]",
    "border-[var(--color-border-brand)]",
    "shadow-[var(--selected-shadow)]",
  ),
  disabled: cn(
    "bg-[var(--color-bg-muted)] border-[var(--color-border-default)] cursor-not-allowed",
  ),
};

/* ──────────────────────────────────────────────
 * 트리거 내부 텍스트
 * ────────────────────────────────────────────── */

export const valueTextStyles = cn(
  "flex-1 min-w-0 truncate text-left",
  "text-[var(--color-text-default)]",
);

export const placeholderTextStyles = cn(
  "flex-1 min-w-0 truncate text-left",
  "text-[var(--color-text-placeholder)]",
);

export const disabledTextStyles = cn(
  "text-[var(--color-text-disabled)]",
);

/* ──────────────────────────────────────────────
 * 아이콘
 * ────────────────────────────────────────────── */

export const iconStyles = cn(
  "flex-shrink-0 flex items-center justify-center",
  "text-[var(--color-icon-default)]",
  "[&>*]:w-full [&>*]:h-full",
);

export const iconSizeStyles: Record<SelectSize, string> = {
  "3xl": "size-[24rem]",
  "2xl": "size-[24rem]",
  xl:    "size-[24rem]",
  lg:    "size-[20rem]",
  md:    "size-[20rem]",
  sm:    "size-[16rem]",
  xs:    "size-[16rem]",
  "2xs": "size-[16rem]",
};

/* ──────────────────────────────────────────────
 * 인디케이터 (chevron)
 * ────────────────────────────────────────────── */

export const indicatorStyles = cn(
  "flex-shrink-0 flex items-center justify-center",
  "text-[var(--color-icon-default)]",
  "transition-transform duration-200",
  "[&>*]:w-full [&>*]:h-full",
);

export const indicatorSizeStyles: Record<SelectSize, string> = {
  "3xl": "size-[24rem]",
  "2xl": "size-[24rem]",
  xl:    "size-[24rem]",
  lg:    "size-[20rem]",
  md:    "size-[20rem]",
  sm:    "size-[16rem]",
  xs:    "size-[16rem]",
  "2xs": "size-[16rem]",
};

// 드롭다운(Droplist) 및 옵션/그룹 스타일은 공통 컴포넌트로 분리됨:
// → modules/react-ui/src/components/Droplist/styles.ts 참조

/* ──────────────────────────────────────────────
 * 라벨 / 헬퍼 텍스트
 * ────────────────────────────────────────────── */

export const labelStyles = cn(
  "typo-text-md font-normal",
  "text-[var(--color-text-subtle)]",
);

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
 * inline variant 스타일
 * ────────────────────────────────────────────── */

export const inlineTrigger = cn(
  "inline-flex items-center w-full box-border border-[1rem] rounded-[6rem]",
  "transition-[color,background-color,border-color,box-shadow] duration-200",
  "cursor-pointer select-none outline-none",
  "p-0",
);

export const inlineSizeStyles: Record<SelectSize, string> = {
  "3xl": "h-[56rem] rounded-[6rem]",
  "2xl": "h-[52rem] rounded-[6rem]",
  xl:    "h-[48rem] rounded-[6rem]",
  lg:    "h-[44rem] rounded-[6rem]",
  md:    "h-[40rem] rounded-[6rem]",
  sm:    "h-[36rem] rounded-[6rem]",
  xs:    "h-[32rem] rounded-[4rem]",
  "2xs": "h-[28rem] rounded-[4rem]",
};

// 라벨 영역 내부 텍스트 사이즈 (인라인 variant)
export const inlineTextStyles: Record<SelectSize, string> = {
  "3xl": "typo-text-lg font-normal",
  "2xl": "typo-text-lg font-normal",
  xl:    "typo-text-lg font-normal",
  lg:    "typo-text-lg font-normal",
  md:    "typo-text-md font-normal",
  sm:    "typo-text-md font-normal",
  xs:    "typo-text-md font-normal",
  "2xs": "typo-text-sm font-normal",
};

// 값 영역 내부 패딩 + gap
export const inlineAreaStyles: Record<SelectSize, string> = {
  "3xl": "px-[20rem] gap-[8rem]",
  "2xl": "px-[16rem] gap-[8rem]",
  xl:    "px-[16rem] gap-[8rem]",
  lg:    "px-[16rem] gap-[8rem]",
  md:    "px-[12rem] gap-[8rem]",
  sm:    "px-[12rem] gap-[8rem]",
  xs:    "px-[12rem] gap-[8rem]",
  "2xs": "px-[12rem] gap-[8rem]",
};

export const inlineDividerStyles = cn(
  "self-stretch w-[1rem] flex-shrink-0",
  "bg-[var(--color-border-default)]",
);

export const inlineLabelStyles = cn(
  "flex-shrink-0 flex items-center self-stretch",
  "bg-[var(--color-bg-subtle)]",
  "text-[var(--color-text-subtle)]",
);

// 사이즈별 라벨 영역 radius + 너비 + 패딩
export const inlineLabelSizeStyles: Record<SelectSize, string> = {
  "3xl": "rounded-l-[6rem] w-[126rem] px-[20rem]",
  "2xl": "rounded-l-[6rem] w-[118rem] px-[16rem]",
  xl:    "rounded-l-[6rem] w-[118rem] px-[16rem]",
  lg:    "rounded-l-[6rem] w-[118rem] px-[16rem]",
  md:    "rounded-l-[6rem] w-[100rem] px-[12rem]",
  sm:    "rounded-l-[6rem] w-[100rem] px-[12rem]",
  xs:    "rounded-l-[4rem] w-[100rem] px-[12rem]",
  "2xs": "rounded-l-[4rem] w-[89rem]  px-[12rem]",
};

export const inlineValueAreaStyles = cn("flex-1 min-w-0 flex items-center");
