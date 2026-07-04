import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ComponentProps,
} from "react";
import { cn } from "@/utils/cn";
import {
  baseWrapper,
  stateStyles,
  textareaBase,
  textareaSizeStyles,
  counterStyles,
  counterCountStyles,
  counterCountErrorStyles,
  labelSizeStyles,
  helperStyles,
  errorTextStyles,
  completeTextStyles,
  resizeHandleStyles,
  type TextareaIntent,
  type TextareaSize,
} from "./styles";
import {
  IconInfoCircleFill,
  IconCheckFill,
  IconSeriousFill,
  IconResize,
} from "../Icons";

export type { TextareaIntent, TextareaSize };

export type TextareaResize = "none" | "vertical" | "auto";

export interface TextareaProps
  extends Omit<ComponentProps<"textarea">, "style"> {
  /** 입력 필드 크기 @default "md" */
  size?: TextareaSize;
  /** 라벨 텍스트 */
  label?: string;
  /** 유효성 검증 의도 @default "default" */
  intent?: TextareaIntent;
  /** 하단 안내/결과 메시지 */
  helperText?: string;
  /**
   * 에러 메시지 (truthy이면 에러 상태)
   * @deprecated intent="error"와 helperText를 사용하세요
   */
  error?: string | boolean;
  /** 글자 수 제한 (0이면 카운터 미표시) @default 0 */
  maxLength?: number;
  /** 카운터 표시 여부 @default false */
  showCounter?: boolean;
  /** 최소 높이 (rem 단위) @default 100 */
  minHeight?: number;
  /** 최대 높이 (rem 단위, 0이면 제한 없음) @default 176 */
  maxHeight?: number;
  /** 리사이즈 동작 @default "auto" */
  resize?: TextareaResize;
}

/**
 * Textarea - 텍스트 영역 입력 필드
 *
 * Label, Helper Text, Intent(검증 결과), Counter(글자 수), 자동 높이 조절을 지원합니다.
 * 다크모드를 지원합니다.
 *
 * @example
 * <Textarea label="내용" placeholder="내용을 입력하세요" />
 * <Textarea maxLength={200} showCounter resize="auto" />
 * <Textarea intent="error" helperText="필수 입력 항목입니다" />
 * <Textarea intent="complete" helperText="사용 가능한 입력입니다" />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = "md",
      label,
      intent: intentProp = "default",
      helperText,
      error,
      maxLength = 0,
      showCounter = false,
      minHeight = 100,
      maxHeight = 176,
      resize = "auto",
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
    // 포커스 여부 (포커스 링 표시 + default helperText 노출에 사용)
    const [focused, setFocused] = useState(false);
    // 내부 입력 값 (비제어 모드)
    const [internalValue, setInternalValue] = useState(
      String(defaultValue ?? ""),
    );
    // textarea 엘리먼트 참조
    const innerRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef =
      (ref as React.RefObject<HTMLTextAreaElement>) ?? innerRef;

    const isControlled = value !== undefined;
    const currentValue = isControlled ? String(value) : internalValue;
    const charCount = currentValue.length;
    const isOver = maxLength > 0 && charCount > maxLength;

    // error prop 하위 호환: error가 있으면 intent="error"로 처리
    const intent: TextareaIntent = error ? "error" : intentProp;
    const resolvedHelperText =
      error && typeof error === "string" ? error : helperText;

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!isControlled) setInternalValue(e.target.value);
        onChange?.(e);
      },
      [isControlled, onChange],
    );

    const handleWrapperClick = useCallback(() => {
      if (!disabled) textareaRef.current?.focus();
    }, [disabled, textareaRef]);

    // 자동 높이 조절 (wrapper 기준)
    const adjustHeight = useCallback(() => {
      const el = textareaRef.current;
      const wrapper = el?.parentElement;
      if (!el || !wrapper) return;

      if (resize !== "auto") {
        // auto가 아닌 모드로 전환 시 inline height 초기화
        el.style.height = "";
        el.style.overflowY = "";
        wrapper.style.height = "";
        return;
      }

      // wrapper·textarea inline 높이 초기화 후 scrollHeight 측정
      wrapper.style.height = "";
      el.style.height = "auto";
      const scrollH = el.scrollHeight;
      const max = maxHeight > 0 ? maxHeight : Infinity;
      const exceeds = scrollH > max;

      // textarea는 항상 wrapper를 채움
      el.style.height = "100%";
      el.style.overflowY = exceeds ? "auto" : "hidden";

      // wrapper에 높이 적용
      wrapper.style.height = `${Math.min(scrollH, max)}rem`;
    }, [resize, maxHeight, textareaRef]);

    useEffect(() => {
      adjustHeight();
    }, [currentValue, adjustHeight]);

    // 상태별 wrapper 스타일
    const wrapperState = disabled
      ? stateStyles.disabled
      : focused && intent === "error"
      ? stateStyles.errorFocus
      : focused && intent === "complete"
      ? stateStyles.completeFocus
      : focused
      ? stateStyles.focus
      : intent === "error" || isOver
      ? stateStyles.error
      : intent === "complete"
      ? stateStyles.complete
      : stateStyles.default;

    const isResizable = resize === "vertical";
    const wrapperResize = isResizable
      ? "resize-y overflow-hidden [&::-webkit-resizer]:appearance-none"
      : "resize-none";

    const wrapperClass = cn(
      baseWrapper,
      "relative",
      wrapperState,
      wrapperResize,
      isResizable && "pb-0",
      className,
    );

    const wrapperStyle: React.CSSProperties = {
      minHeight: `${minHeight}rem`,
      ...(maxHeight > 0 && resize !== "auto"
        ? { maxHeight: `${maxHeight}rem`, overflowY: "auto" }
        : {}),
    };

    return (
      <div className="inline-flex flex-col gap-[8rem] w-full">
        {label && <label className={labelSizeStyles[size]}>{label}</label>}

        <div
          className={wrapperClass}
          style={wrapperStyle}
          onClick={handleWrapperClick}
        >
          <textarea
            ref={textareaRef}
            disabled={disabled}
            value={currentValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(textareaBase, textareaSizeStyles[size], "resize-none")}
            {...rest}
          />

          {/* 리사이즈 핸들 영역 */}
          {isResizable && !disabled && (
            <div className="flex justify-end items-center flex-shrink-0 pb-[4rem]">
              <IconResize size={12} className={resizeHandleStyles} />
            </div>
          )}
        </div>

        {/* 헬퍼 텍스트 · 글자 수 카운터 */}
        {(showCounter ||
          (resolvedHelperText &&
            !disabled &&
            (intent !== "default" || focused))) && (
          <div className="flex items-start justify-between gap-[8rem]">
            {resolvedHelperText &&
            !disabled &&
            (intent !== "default" || focused) ? (
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
            ) : (
              <span />
            )}

            {showCounter && (
              <span className={counterStyles}>
                <span
                  className={
                    isOver || intent === "error"
                      ? counterCountErrorStyles
                      : counterCountStyles
                  }
                >
                  {String(charCount).padStart(2, "0")}
                </span>
                {maxLength > 0 && `/${maxLength}`}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
