import { forwardRef, type ReactNode, type ComponentProps } from "react";
import { cn } from "@/utils/cn";
import { IconButton } from "@/components/buttons/IconButton";
import { IconInfoCircleLine } from "@/components/Icons/IconInfoCircleLine";
import { IconCheckLine } from "@/components/Icons/IconCheckLine";
import { IconWarningLine } from "@/components/Icons/IconWarningLine";
import { IconXCircle } from "@/components/Icons/IconXCircle";
import { IconX } from "@/components/Icons/IconX";

// ─── Types ───

type AlertIntent = "info" | "success" | "warning" | "error";
type AlertVariant = "filled" | "outlined" | "light";

export interface AlertProps extends Omit<ComponentProps<"div">, "title"> {
  /** 알림 의도 @default "info" */
  intent?: AlertIntent;
  /** 스타일 @default "light" */
  variant?: AlertVariant;
  /** 제목 */
  title?: ReactNode;
  /** 닫기 콜백 (설정 시 닫기 버튼 표시) */
  onClose?: () => void;
  /** 좌측 아이콘 숨기기 @default false */
  hideIcon?: boolean;
}

// ─── Icons ───

const icons: Record<AlertIntent, ReactNode> = {
  info: <IconInfoCircleLine size={20} />,
  success: <IconCheckLine size={20} />,
  warning: <IconWarningLine size={20} />,
  error: <IconXCircle size={20} />,
};

// ─── Styles ───

const variantStyles: Record<AlertVariant, Record<AlertIntent, string>> = {
  filled: {
    // TODO: 시맨틱 토큰 미정의 — filled intent별 배경(--color-bg-*-solid)을 사용하나, text-inverse만 처리 가능
    info: "bg-[var(--color-bg-info)] text-[var(--color-text-on-brand)]",
    success: "bg-[var(--color-bg-success)] text-[var(--color-text-on-brand)]",
    warning: "bg-[var(--color-bg-warning)] text-[var(--color-text-on-brand)]",
    error: "bg-[var(--color-bg-danger)] text-[var(--color-text-on-brand)]",
  },
  outlined: {
    // TODO: 시맨틱 토큰 미정의 — outlined intent border/text (--light-blue-300, --light-blue-700 등) 미정의
    info: cn(
      "border border-[var(--color-border-brand)] text-[var(--color-text-info)] bg-transparent",
    ),
    success: cn(
      "border border-[var(--color-border-success)] text-[var(--color-text-success)] bg-transparent",
    ),
    warning: cn(
      "border border-[var(--color-border-warning)] text-[var(--color-text-warning)] bg-transparent",
    ),
    error: cn(
      "border border-[var(--color-border-danger)] text-[var(--color-text-danger)] bg-transparent",
    ),
  },
  light: {
    info: cn(
      "bg-[var(--color-bg-info-subtle)] text-[var(--color-text-info)]",
    ),
    success: cn(
      "bg-[var(--color-bg-success-subtle)] text-[var(--color-text-success)]",
    ),
    warning: cn(
      "bg-[var(--color-bg-warning-subtle)] text-[var(--color-text-warning)]",
    ),
    error: cn(
      "bg-[var(--color-bg-danger-subtle)] text-[var(--color-text-danger)]",
    ),
  },
};

const closeButtonStyles: Record<AlertVariant, string> = {
  filled: "hover:bg-white/20",
  outlined: "hover:bg-current/10",
  light: "hover:bg-current/10",
};

// ─── Component ───

/**
 * Alert - 인라인 알림 컴포넌트
 *
 * 페이지 내에 고정적으로 표시되는 알림입니다.
 * Filled / Outlined / Light 스타일과 4가지 타입을 지원합니다.
 *
 * @example
 * <Alert intent="success" title="완료" variant="light">
 *   저장되었습니다.
 * </Alert>
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      intent = "info",
      variant = "light",
      title,
      onClose,
      hideIcon = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex gap-[10rem] rounded-[8rem] px-[16rem] py-[12rem] text-[14rem]",
          variantStyles[variant][intent],
          className,
        )}
        {...rest}
      >
        {/* Icon */}
        {!hideIcon && (
          <span className="flex-shrink-0 mt-[1rem]">{icons[intent]}</span>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <p className="font-semibold mb-[2rem]">{title}</p>
          )}
          {children && <div className={cn(title && "opacity-90")}>{children}</div>}
        </div>

        {/* Close */}
        {onClose && (
          <IconButton
            variant="ghost"
            color="grayscale"
            size="4xs"
            icon={<IconX />}
            onClick={onClose}
            className={closeButtonStyles[variant]}
            aria-label="닫기"
          />
        )}
      </div>
    );
  },
);
Alert.displayName = "Alert";
