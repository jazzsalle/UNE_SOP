import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import {
  baseClass,
  variantStyles,
  selectedStyle,
  type ButtonVariant,
  type ButtonColor,
} from "../styles";
import {
  iconSizeStyles,
  iconButtonIconSizeStyles,
  type IconButtonSize,
} from "./styles";

export interface IconButtonProps
  extends Omit<ComponentProps<"button">, "color" | "children"> {
  /** 버튼 스타일 @default "fill" */
  variant?: ButtonVariant;
  /** 버튼 색상 @default "primary" */
  color?: ButtonColor;
  /** 버튼 크기 @default "md" */
  size?: IconButtonSize;
  /** 선택 상태 @default false */
  selected?: boolean;
  /** 표시할 아이콘 */
  icon: ReactNode;
  children?: never;
}

/**
 * IconButton - 아이콘 전용 버튼
 *
 * Fill / Outline / Ghost 스타일과 Primary / Grayscale 색상,
 * 3XL(56) ~ 4XS(20) 10단계 크기를 제공합니다. 다크모드를 지원합니다.
 *
 * @example
 * <IconButton icon={<MyIcon />} variant="fill" color="primary" size="md" />
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = "fill",
      color = "primary",
      size = "md",
      selected = false,
      disabled,
      className,
      icon,
      ...rest
    },
    ref,
  ) => {
    const buttonClass = cn(
      baseClass,
      iconSizeStyles[size],
      variantStyles[variant][color],
      selected && selectedStyle,
      className,
    );

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        data-selected={selected || undefined}
        className={buttonClass}
        {...rest}
      >
        <span
          className={cn(
            "flex items-center justify-center",
            iconButtonIconSizeStyles[size],
            "[&>*]:w-full [&>*]:h-full",
          )}
        >
          {icon}
        </span>
      </button>
    );
  },
);
IconButton.displayName = "IconButton";
