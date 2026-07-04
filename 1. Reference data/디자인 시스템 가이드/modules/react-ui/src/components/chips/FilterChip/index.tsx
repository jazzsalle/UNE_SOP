import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import type { ChipSize, ChipVariant } from "../types";
import { IconCheck } from "../../Icons";
import type { IconSize } from "../../Icons/types";

export interface FilterChipProps {
  /** 라벨 텍스트 */
  label: string;
  /** 크기 @default "md" */
  size?: ChipSize;
  /** 스타일 @default "fill" */
  variant?: ChipVariant;
  /** 선택 여부 @default false */
  selected?: boolean;
  /** 왼쪽 아이콘 (미선택 상태 전용, 선택 시 체크 아이콘으로 대체) */
  leftIcon?: ReactNode;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 비활성화 여부 @default false */
  disabled?: boolean;
  className?: string;
}

const sizeStyles: Record<ChipSize, string> = {
  lg: "h-[36rem] px-[14rem] gap-[8rem] typo-text-lg",
  md: "h-[32rem] px-[12rem] gap-[6rem] typo-text-md",
  sm: "h-[28rem] px-[10rem] gap-[4rem] typo-text-sm",
};

const iconSizeStyles: Record<ChipSize, string> = {
  lg: "size-[20rem]",
  md: "size-[16rem]",
  sm: "size-[16rem]",
};

const checkIconSize: Record<ChipSize, IconSize> = {
  lg: 20,
  md: 16,
  sm: 16,
};

// variant × selected 조합별 활성 스타일
const getActiveStyles = (variant: ChipVariant, selected: boolean): string => {
  if (variant === "fill") {
    return selected
      ? "bg-[var(--color-bg-brand-subtle-pressed)] text-[var(--color-text-brand)] hover:bg-[var(--color-bg-chip-selected-hover)] hover:text-[var(--color-interactive-brand-hover)] active:bg-[var(--color-bg-chip-selected-pressed)] active:text-[var(--color-interactive-brand-pressed)]"
      : "bg-[var(--color-interactive-neutral)] text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-neutral-hover)] hover:text-[var(--color-text-default)] active:bg-[var(--color-interactive-neutral-pressed)] active:text-[var(--color-text-default)]";
  }
  if (variant === "outline") {
    return selected
      ? "ring-[1rem] ring-inset ring-[var(--color-border-brand)] text-[var(--color-text-brand)] hover:bg-[var(--color-bg-brand-subtle)] hover:ring-[var(--color-interactive-brand-hover)] hover:text-[var(--color-interactive-brand-hover)] active:bg-[var(--color-bg-brand-subtle-pressed)] active:ring-[var(--color-interactive-brand-pressed)] active:text-[var(--color-interactive-brand-pressed)]"
      : "ring-[1rem] ring-inset ring-[var(--color-control-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-control-bg-hover)] hover:ring-[var(--color-control-border-pressed)] hover:text-[var(--color-text-default)] active:bg-[var(--color-control-bg-pressed)] active:ring-[var(--color-control-border-active)] active:text-[var(--color-text-default)]";
  }
  // ghost
  return selected
    ? "text-[var(--color-text-brand)] hover:bg-[var(--color-bg-brand-subtle)] hover:text-[var(--color-interactive-brand-hover)] active:bg-[var(--color-bg-brand-subtle-pressed)] active:text-[var(--color-interactive-brand-pressed)]"
    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-control-bg-hover)] hover:text-[var(--color-text-default)] active:bg-[var(--color-control-bg-pressed)] active:text-[var(--color-text-default)]";
};

const getDisabledStyles = (variant: ChipVariant): string => {
  if (variant === "fill") return "bg-[var(--color-bg-subtle)] text-[var(--color-text-disabled)]";
  if (variant === "outline")
    return "ring-[1rem] ring-inset ring-[var(--color-border-default)] text-[var(--color-text-disabled)]";
  return "text-[var(--color-text-disabled)]";
};

/**
 * 멀티 선택 필터 칩 컴포넌트
 *
 * 콘텐츠를 필터링하는 칩입니다. 선택 시 체크 아이콘이 표시되며
 * 사용자가 제공한 leftIcon은 미선택 상태에서만 표시됩니다.
 *
 * @example
 * <FilterChip label="전체" selected={selected} onClick={toggle} />
 * <FilterChip label="진행중" selected={selected} leftIcon={<IconList />} onClick={toggle} />
 */
export const FilterChip = ({
  label,
  size = "md",
  variant = "fill",
  selected = false,
  leftIcon,
  onClick,
  disabled = false,
  className,
}: FilterChipProps) => {
  const showIcon = selected || !!leftIcon;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "box-border inline-flex items-center rounded-[999px] whitespace-nowrap font-normal cursor-pointer border-0 bg-transparent outline-none focus-visible:shadow-[0_0_0_2rem_var(--color-bg-chip-selected-pressed)]",
        sizeStyles[size],
        disabled ? getDisabledStyles(variant) : getActiveStyles(variant, selected),
        disabled && "cursor-not-allowed",
        className,
      )}
    >
      {/* 아이콘 슬롯: 선택 시 체크 아이콘, 미선택 시 leftIcon */}
      {showIcon && (
        <span
          className={cn(
            "flex-shrink-0 flex items-center justify-center [&>*]:w-full [&>*]:h-full",
            iconSizeStyles[size],
          )}
        >
          {selected ? <IconCheck size={checkIconSize[size]} /> : leftIcon}
        </span>
      )}
      {label}
    </button>
  );
};
