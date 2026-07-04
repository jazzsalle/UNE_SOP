import { forwardRef, useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/utils/cn";
import { IconCheck } from "@/components/Icons/IconCheck";
import { IconMinus } from "@/components/Icons/IconMinus";
import type { IconSize } from "@/components/Icons/types";
type CheckboxSize = "lg" | "md" | "sm";

export interface CheckboxProps
  extends Omit<ComponentProps<"input">, "size" | "type"> {
  /** 체크 상태 */
  checked?: boolean;

  /** 중간 선택 상태 (일부 항목만 선택됐을 때) */
  indeterminate?: boolean;

  /** 상태 변경 핸들러 */
  onCheckedChange?: (checked: boolean) => void;

  /** 체크박스 크기 @default "md" */
  size?: CheckboxSize;

  /** 라벨 텍스트 */
  label?: string;

  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 체크박스 컴포넌트
 *
 * 사용자가 여러 개의 옵션 중 한 개 이상의 값을 선택할 수 있도록 하는 컴포넌트입니다.
 * Large / Medium / Small 크기와 다크모드를 지원합니다.
 *
 * @example
 * <Checkbox checked={value} onCheckedChange={setValue} label="체크박스" />
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      indeterminate = false,
      onCheckedChange,
      size = "md",
      label,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    // input DOM 요소의 indeterminate 프로퍼티 설정용
    const internalRef = useRef<HTMLInputElement>(null);

    // indeterminate 변경 시 DOM 프로퍼티 동기화 (스크린리더 "mixed" 상태 전달)
    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const handleChange = () => {
      if (disabled) return;
      onCheckedChange?.(!checked);
    };

    const sizeStyles: Record<
      CheckboxSize,
      { box: string; icon: IconSize; text: string }
    > = {
      lg: { box: "size-[24rem]", icon: 16, text: "typo-title-sm" },
      md: { box: "size-[20rem]", icon: 12, text: "typo-text-lg" },
      sm: { box: "size-[16rem]", icon: 12, text: "typo-text-md" },
    };

    const { box, icon, text } = sizeStyles[size];

    return (
      <label
        className={cn(
          "inline-flex items-center gap-[8rem] select-none group",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          className,
        )}
      >
        {/* 키보드 접근성 + focus-visible 링을 위한 숨겨진 체크박스 */}
        <input
          ref={(el) => {
            (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
          }}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only peer"
          {...props}
        />

        {/* 체크박스 트랙 */}
        <span
          className={cn(
            box,
            "inline-flex items-center justify-center flex-shrink-0",
            "rounded-[4rem] transition-colors",
            disabled
              ? cn(
                  "border-[1rem]",
                  // disabled 배경·테두리: 다크모드는 시맨틱 토큰이 자동 처리
                  "bg-[var(--color-bg-disabled)]",
                  "border-[var(--color-border-disabled)]",
                )
              : checked || indeterminate
              ? cn(
                  // default — 다크모드는 시맨틱 토큰이 자동 처리
                  "border-[1rem] border-[var(--color-interactive-brand)]",
                  "bg-[var(--color-interactive-brand)]",
                  // hover
                  "group-hover:border-[var(--color-interactive-brand-hover)]",
                  "group-hover:bg-[var(--color-interactive-brand-hover)]",
                  // active
                  "group-active:border-[var(--color-interactive-brand-pressed)]",
                  "group-active:bg-[var(--color-interactive-brand-pressed)]",
                  // focus-visible (키보드 포커스 링)
                  "peer-focus-visible:shadow-[var(--selected-shadow)]",
                )
              : cn(
                  // default — 다크모드는 시맨틱 토큰이 자동 처리
                  "border-[1rem]",
                  "border-[var(--color-control-border)]",
                  // hover
                  "group-hover:border-[var(--color-control-border-hover)]",
                  "group-hover:bg-[var(--color-control-bg-hover)]",
                  // active
                  "group-active:border-[var(--color-control-border-pressed)]",
                  "group-active:bg-[var(--color-control-bg-pressed)]",
                  // focus-visible (키보드 포커스 링)
                  "peer-focus-visible:shadow-[var(--selected-shadow)]",
                ),
          )}
        >
          {/* 아이콘: indeterminate → minus, checked → check */}
          {(() => {
            const iconColor = disabled ? "text-[var(--color-text-disabled)]" : "text-white";
            if (indeterminate) return <IconMinus size={icon} className={iconColor} />;
            if (checked) return <IconCheck size={icon} className={iconColor} />;
            return null;
          })()}
        </span>

        {label && (
          <span
            className={cn(
              text,
              "font-normal text-[var(--color-text-default)]",
            )}
          >
            {label}
          </span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
