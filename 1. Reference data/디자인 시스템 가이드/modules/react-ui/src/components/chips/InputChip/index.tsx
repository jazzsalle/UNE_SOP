import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import type { ChipSize, ChipVariant } from "../types";
import { IconX } from "../../Icons";

export interface InputChipProps {
  /** 라벨 텍스트 */
  label: string;
  /** 크기 @default "md" */
  size?: ChipSize;
  /** 스타일 @default "fill" */
  variant?: ChipVariant;
  /** 왼쪽 아이콘 */
  leftIcon?: ReactNode;
  /** 칩 클릭 핸들러 */
  onClick?: () => void;
  /** 삭제 버튼 클릭 핸들러 */
  onDelete?: () => void;
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

const variantActiveStyles: Record<ChipVariant, string> = {
  fill: "bg-[var(--color-interactive-neutral)] text-[var(--color-text-secondary)] hover:bg-[var(--color-interactive-neutral-hover)] hover:text-[var(--color-text-default)] active:bg-[var(--color-interactive-neutral-pressed)] active:text-[var(--color-text-default)]",
  outline:
    "ring-[1rem] ring-inset ring-[var(--color-control-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-control-bg-hover)] hover:ring-[var(--color-control-border-pressed)] hover:text-[var(--color-text-default)] active:bg-[var(--color-control-bg-pressed)] active:ring-[var(--color-control-border-active)] active:text-[var(--color-text-default)]",
  ghost:
    "text-[var(--color-text-secondary)] hover:bg-[var(--color-control-bg-hover)] hover:text-[var(--color-text-default)] active:bg-[var(--color-control-bg-pressed)] active:text-[var(--color-text-default)]",
};

const variantDisabledStyles: Record<ChipVariant, string> = {
  fill: "bg-[var(--color-bg-subtle)] text-[var(--color-text-disabled)]",
  outline: "ring-[1rem] ring-inset ring-[var(--color-border-default)] text-[var(--color-text-disabled)]",
  ghost: "text-[var(--color-text-disabled)]",
};

/**
 * 삭제 가능한 입력 칩 컴포넌트
 *
 * 태그나 선택된 항목을 표시하며 X 버튼으로 삭제할 수 있습니다.
 *
 * @example
 * <InputChip label="태그" onDelete={() => removeTag()} />
 * <InputChip label="클릭 가능" onClick={handleClick} onDelete={handleDelete} />
 */
export const InputChip = ({
  label,
  size = "md",
  variant = "fill",
  leftIcon,
  onClick,
  onDelete,
  disabled = false,
  className,
}: InputChipProps) => {
  const isClickable = !!onClick && !disabled;

  return (
    <div
      className={cn(
        "box-border inline-flex items-center rounded-[999px] whitespace-nowrap font-normal select-none outline-none focus-visible:shadow-[0_0_0_2rem_var(--color-bg-chip-selected-pressed)]",
        sizeStyles[size],
        disabled ? variantDisabledStyles[variant] : variantActiveStyles[variant],
        isClickable && "cursor-pointer",
        disabled && "cursor-not-allowed",
        className,
      )}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
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
      {/* 삭제 버튼 — 컨테이너 20rem 고정, 아이콘 12rem 고정 (Figma 기준, 사이즈 무관) */}
      {onDelete && (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={cn(
            "flex-shrink-0 flex items-center justify-center size-[20rem] border-0 bg-transparent outline-none focus-visible:shadow-[0_0_0_2rem_var(--color-bg-chip-selected-pressed)]",
            disabled ? "cursor-not-allowed" : "cursor-pointer hover:opacity-70",
          )}
          aria-label="삭제"
        >
          <IconX size={12} />
        </button>
      )}
    </div>
  );
};
