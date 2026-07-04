import { forwardRef, useEffect, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { assertRootFontSize } from "@/utils/assertRootFontSize";
import {
  baseClass,
  variantStyles,
  selectedStyle,
  type ButtonVariant,
  type ButtonColor,
} from "../styles";
import { buttonSizeStyles, buttonIconSizeStyles, type ButtonSize } from "./styles";

export interface ButtonProps
  extends Omit<ComponentProps<"button">, "color"> {
  /** 버튼 스타일 @default "fill" */
  variant?: ButtonVariant;
  /** 버튼 색상 @default "primary" */
  color?: ButtonColor;
  /** 버튼 크기 @default "md" */
  size?: ButtonSize;
  /** 선택 상태 @default false */
  selected?: boolean;
  /** 왼쪽 아이콘 */
  leftIcon?: ReactNode;
  /** 오른쪽 아이콘 */
  rightIcon?: ReactNode;
}

/**
 * Button - 텍스트 + 아이콘 조합 버튼
 *
 * Fill / Outline / Ghost 스타일과 Primary / Grayscale 색상,
 * 3XL(56) ~ 4XS(20) 10단계 크기를 제공합니다. 다크모드를 지원합니다.
 *
 * @example
 * <Button variant="fill" color="primary" size="md">버튼이름</Button>
 * <Button leftIcon={<MyIcon />}>버튼이름</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "fill",
      color = "primary",
      size = "md",
      selected = false,
      disabled,
      className,
      leftIcon,
      rightIcon,
      children,
      ...rest
    },
    ref,
  ) => {
    // html font-size 오설정 감지 (dev 전용, 세션 내 1회)
    useEffect(() => {
      assertRootFontSize();
    }, []);

    const buttonClass = cn(
      baseClass,
      buttonSizeStyles[size],
      variantStyles[variant][color],
      selected && selectedStyle,
      className,
    );

    const iconClass = cn("flex-shrink-0 flex items-center justify-center", buttonIconSizeStyles[size], "[&>*]:w-full [&>*]:h-full");

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        data-selected={selected || undefined}
        className={buttonClass}
        {...rest}
      >
        {leftIcon && <span className={iconClass}>{leftIcon}</span>}
        {children}
        {rightIcon && <span className={iconClass}>{rightIcon}</span>}
      </button>
    );
  },
);
Button.displayName = "Button";
