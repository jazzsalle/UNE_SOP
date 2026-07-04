import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import type { ChipSize, ChipVariant } from "../types";

export type ActionChipColor = "neutral" | "primary";

export interface ActionChipProps {
  /** 라벨 텍스트 */
  label: string;
  /** 크기 @default "md" */
  size?: ChipSize;
  /** 스타일 @default "fill" */
  variant?: ChipVariant;
  /** 색상 @default "neutral" */
  color?: ActionChipColor;
  /** 왼쪽 아이콘 */
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

// variant × color 조합별 활성 스타일
const getActiveStyles = (variant: ChipVariant, color: ActionChipColor): string => {
  if (variant === "fill") {
    return color === "primary"
      ? "bg-[var(--color-interactive-brand)] text-[var(--color-text-on-brand)] hover:bg-[var(--color-interactive-brand-hover)] active:bg-[var(--color-interactive-brand-pressed)]"
      : "bg-[var(--color-interactive-neutral)] text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-neutral-hover)] hover:text-[var(--color-text-default)] active:bg-[var(--color-interactive-neutral-pressed)] active:text-[var(--color-text-default)]";
  }
  if (variant === "outline") {
    return color === "primary"
      ? "ring-[1rem] ring-inset ring-[var(--color-border-brand)] text-[var(--color-text-brand)] hover:bg-[var(--color-bg-brand-subtle)] hover:ring-[var(--color-interactive-brand-hover)] hover:text-[var(--color-interactive-brand-hover)] active:bg-[var(--color-bg-brand-subtle-pressed)] active:ring-[var(--color-interactive-brand-pressed)] active:text-[var(--color-interactive-brand-pressed)]"
      : "ring-[1rem] ring-inset ring-[var(--color-control-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-control-bg-hover)] hover:ring-[var(--color-control-border-pressed)] hover:text-[var(--color-text-default)] active:bg-[var(--color-control-bg-pressed)] active:ring-[var(--color-control-border-active)] active:text-[var(--color-text-default)]";
  }
  // ghost
  return color === "primary"
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
 * 액션 트리거 칩 컴포넌트
 *
 * 특정 액션을 실행하는 버튼 형태의 칩입니다.
 * neutral(기본) 또는 primary(브랜드) 색상을 지원합니다.
 *
 * @example
 * <ActionChip label="추가" leftIcon={<IconPlus />} onClick={handleAdd} />
 * <ActionChip label="제출" color="primary" onClick={handleSubmit} />
 */
export const ActionChip = ({
  label,
  size = "md",
  variant = "fill",
  color = "neutral",
  leftIcon,
  onClick,
  disabled = false,
  className,
}: ActionChipProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "box-border inline-flex items-center rounded-[999px] whitespace-nowrap font-normal cursor-pointer border-0 bg-transparent outline-none focus-visible:shadow-[0_0_0_2rem_var(--color-bg-chip-selected-pressed)]",
        sizeStyles[size],
        disabled ? getDisabledStyles(variant) : getActiveStyles(variant, color),
        disabled && "cursor-not-allowed",
        className,
      )}
    >
      {/* 왼쪽 아이콘 슬롯 */}
      {leftIcon && (
        <span
          className={cn(
            "flex-shrink-0 flex items-center justify-center [&>*]:w-full [&>*]:h-full",
            iconSizeStyles[size],
          )}
        >
          {leftIcon}
        </span>
      )}
      {label}
    </button>
  );
};
