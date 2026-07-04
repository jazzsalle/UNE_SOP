import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import { IconButton } from "@/components/buttons/IconButton";
import type { IconButtonSize } from "@/components/buttons/IconButton/styles";
import {
  baseWrapper,
  sizeStyles,
  inlineContainerSizeStyles,
  inlinePxStyles,
  inlineLabelSizeStyles,
  stateStyles,
  inputBase,
  inputSizeStyles,
  iconStyles,
  iconSizeStyles,
  labelSizeStyles,
  helperStyles,
  errorTextStyles,
  completeTextStyles,
  type InputSize,
  type InputVariant,
  type InputIntent,
} from "./styles";
import {
  IconX,
  IconInfoCircleFill,
  IconCheckFill,
  IconSeriousFill,
} from "../Icons";

export type { InputSize, InputVariant, InputIntent };

const slotButtonSize: Record<InputSize, IconButtonSize> = {
  "3xl": "md",   // 40px
  "2xl": "sm",   // 36px
  xl:    "xs",   // 32px
  lg:    "xs",   // 32px
  md:    "2xs",  // 28px
  sm:    "3xs",  // 24px
  xs:    "3xs",  // 24px
  "2xs": "4xs",  // 20px
};

export interface InputProps extends Omit<ComponentProps<"input">, "size"> {
  /** 입력 필드 크기 @default "md" */
  size?: InputSize;
  /** 레이아웃 변형 — standard: 레이블 위, inline: 레이블 왼쪽 @default "standard" */
  variant?: InputVariant;
  /** 유효성 검증 의도 @default "default" */
  intent?: InputIntent;
  /** 라벨 텍스트 */
  label?: string;
  /** 하단 안내/결과 메시지 */
  helperText?: string;
  /**
   * 에러 메시지 (truthy이면 에러 상태)
   * @deprecated intent="error"와 helperText를 사용하세요
   */
  error?: string | boolean;
  /** 왼쪽 슬롯 (아이콘, 버튼 등 자유 배치) */
  leftIcon?: ReactNode;
  /** 오른쪽 슬롯 (아이콘, 버튼 등 자유 배치) */
  rightButton?: ReactNode;
  /** 값 초기화 버튼 표시 여부 @default false */
  clearable?: boolean;
  /** 값 초기화 시 콜백 */
  onClear?: () => void;
}

/**
 * Input - 텍스트 입력 필드
 *
 * Label, Helper Text, Intent(검증 결과), 좌우 아이콘, Clear 버튼을 지원합니다.
 * Standard(레이블 위) / Inline(레이블 왼쪽) 변형과 8단계 크기(3xl ~ 2xs), 다크모드를 지원합니다.
 *
 * @example
 * <Input label="이름" placeholder="이름을 입력하세요" />
 * <Input size="lg" leftIcon={<IconSearch />} clearable />
 * <Input variant="inline" label="항목명" placeholder="값을 입력하세요" />
 * <Input intent="error" helperText="필수 입력 항목입니다" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      variant = "standard",
      intent: intentProp = "default",
      label,
      helperText,
      error,
      leftIcon,
      rightButton,
      clearable = false,
      onClear,
      disabled,
      className,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    // 포커스 상태
    const [focused, setFocused] = useState(false);
    // 내부 입력 값 (비제어 모드)
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");
    // input 엘리먼트 참조
    const innerRef = useRef<HTMLInputElement>(null);

    const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? innerRef;

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const hasValue = String(currentValue).length > 0;

    // error prop 하위 호환: error가 있으면 intent="error"로 처리
    const intent: InputIntent = error ? "error" : intentProp;
    const resolvedHelperText =
      error && typeof error === "string" ? error : helperText;

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setInternalValue(e.target.value);
        onChange?.(e);
      },
      [isControlled, onChange],
    );

    // 입력값 초기화 및 네이티브 change 이벤트 발생
    const handleClear = useCallback(() => {
      if (disabled) return;

      if (!isControlled) setInternalValue("");

      onClear?.();

      const input = inputRef.current;
      if (input) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;
        nativeInputValueSetter?.call(input, "");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
      }
    }, [disabled, isControlled, onClear, inputRef]);

    const handleWrapperClick = useCallback(() => {
      if (!disabled) inputRef.current?.focus();
    }, [disabled, inputRef]);

    // 상태별 wrapper 스타일
    const wrapperState = disabled
      ? stateStyles.disabled
      : focused && intent === "error"
      ? stateStyles.errorFocus
      : focused && intent === "complete"
      ? stateStyles.completeFocus
      : focused
      ? stateStyles.focus
      : intent === "error"
      ? stateStyles.error
      : intent === "complete"
      ? stateStyles.complete
      : stateStyles.default;

    const iconClass = cn(
      iconStyles,
      iconSizeStyles[size],
      "[&>*]:w-full [&>*]:h-full",
      disabled && "text-[var(--color-icon-disabled)]",
    );

    const isInline = variant === "inline";

    // 입력 영역 (아이콘, input, 초기화 버튼, 우측 슬롯)
    const inputArea = (
      <>
        {leftIcon && <span className={iconClass}>{leftIcon}</span>}
        <input
          ref={inputRef}
          disabled={disabled}
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(inputBase, inputSizeStyles[size])}
          {...rest}
        />
        {/* 초기화 버튼 (mousedown preventDefault로 포커스 유지) */}
        {clearable && hasValue && !disabled && (
          <IconButton
            variant="fill"
            color="grayscale"
            size={slotButtonSize[size]}
            tabIndex={-1}
            icon={<IconX />}
            onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
            onClick={handleClear}
            aria-label="입력 초기화"
          />
        )}
        {/* 우측 슬롯 (mousedown preventDefault로 포커스 유지) */}
        {rightButton && (
          <span
            className="flex-shrink-0 flex items-center justify-center"
            onMouseDown={(e) => e.preventDefault()}
          >
            {isValidElement(rightButton)
              ? cloneElement(rightButton, { disabled } as any)
              : rightButton}
          </span>
        )}
      </>
    );

    return (
      <div className="flex flex-col gap-[8rem] w-full">
        {/* Standard 변형: 레이블을 컨테이너 위에 렌더링 */}
        {!isInline && label && (
          <label className={labelSizeStyles[size]}>{label}</label>
        )}

        <div
          className={cn(
            baseWrapper,
            isInline
              ? cn(inlineContainerSizeStyles[size], "overflow-hidden")
              : sizeStyles[size],
            wrapperState,
            className,
          )}
          onClick={handleWrapperClick}
        >
          {/* Inline 변형: 왼쪽 고정 레이블 섹션 */}
          {isInline && label && (
            <span
              className={cn(
                "flex-shrink-0 self-stretch flex items-center",
                "w-[160rem]",
                "bg-[var(--color-bg-muted)]",
                "border-r border-[var(--color-border-default)]",
                "text-[var(--color-text-subtle)]",
                disabled && "text-[var(--color-text-disabled)]",
                inlineLabelSizeStyles[size],
                inlinePxStyles[size],
              )}
            >
              {label}
            </span>
          )}

          {/* Inline: 입력 영역을 flex-1 래퍼로 감싸 자체 패딩 적용 */}
          {isInline ? (
            <div className={cn("flex-1 flex items-center gap-[8rem]", inlinePxStyles[size])}>
              {inputArea}
            </div>
          ) : inputArea}
        </div>

        {/* 헬퍼 텍스트 */}
        {resolvedHelperText &&
          !disabled &&
          (intent !== "default" || focused) && (
            <span
              className={cn(
                intent === "error"
                  ? errorTextStyles
                  : intent === "complete"
                  ? completeTextStyles
                  : helperStyles,
                "inline-flex items-center gap-[4rem]",
              )}
            >
              {intent === "error" && <IconSeriousFill size={12} />}
              {intent === "complete" && <IconCheckFill size={12} />}
              {intent === "default" && <IconInfoCircleFill size={12} />}
              {resolvedHelperText}
            </span>
          )}
      </div>
    );
  },
);
Input.displayName = "Input";
