import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";
import { IconChevronDown } from "@/components/Icons/IconChevronDown";
import {
  IconInfoCircleFill,
  IconCheckFill,
  IconSeriousFill,
} from "@/components/Icons";
import { Droplist } from "@/components/Droplist";
import {
  baseTrigger,
  triggerSizeStyles,
  triggerTextStyles,
  stateStyles,
  valueTextStyles,
  placeholderTextStyles,
  disabledTextStyles,
  iconStyles,
  iconSizeStyles,
  indicatorStyles,
  indicatorSizeStyles,
  labelStyles,
  helperStyles,
  errorTextStyles,
  completeTextStyles,
  inlineTrigger,
  inlineTextStyles,
  inlineSizeStyles,
  inlineAreaStyles,
  inlineDividerStyles,
  inlineLabelStyles,
  inlineLabelSizeStyles,
  inlineValueAreaStyles,
} from "./styles";
import type {
  SelectSize,
  SelectIntent,
  SelectOption,
  SelectGroup,
  SelectVariant,
  SelectProps,
} from "./types";

export type {
  SelectSize,
  SelectIntent,
  SelectOption,
  SelectGroup,
  SelectVariant,
  SelectProps,
};

/* ──────────────────────────────────────────────
 * 컴포넌트
 * ────────────────────────────────────────────── */

/**
 * Select - 드롭다운 셀렉트
 *
 * Label, Helper Text, Intent(검증 결과), 옵션 그룹, 아이콘을 지원합니다.
 * 3단계 크기(xl / lg / md)와 다크모드를 지원합니다.
 *
 * @example
 * <Select options={[{ value: "1", label: "옵션 1" }]} placeholder="선택하세요" />
 * <Select groups={[{ label: "그룹", options: [...] }]} />
 * <Select intent="error" helperText="필수 선택 항목입니다" />
 * <Select intent="complete" helperText="선택 완료" />
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      variant = "standard",
      size = "md",
      intent: intentProp = "none",
      options = [],
      groups,
      value,
      defaultValue,
      onChange,
      placeholder = "선택하세요",
      label,
      helperText,
      error,
      disabled = false,
      leftIcon,
      zIndex = 50,
      className,
    },
    ref,
  ) => {
    // 드롭다운 열림 상태
    const [isOpen, setIsOpen] = useState(false);
    // 포커스 상태
    const [isFocused, setIsFocused] = useState(false);
    // 내부 선택 값 (비제어 모드)
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");
    // 셀렉트 컨테이너 참조
    const containerRef = useRef<HTMLDivElement>(null);
    // 드롭다운(Portal) 엘리먼트 참조
    const dropdownRef = useRef<HTMLDivElement>(null);
    // 스크롤/리사이즈 시 위치 재계산용 카운터
    const [, setTick] = useState(0);

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    // error prop 하위 호환: error가 있으면 intent="error"로 처리
    const intent: SelectIntent = error ? "error" : intentProp;
    const showHelperText = intent !== "none" || isOpen;
    const resolvedHelperText =
      error && typeof error === "string" ? error : helperText;

    // 모든 옵션 flat 리스트
    const allOptions = groups ? groups.flatMap((g) => g.options) : options;

    const selectedOption = allOptions.find((o) => o.value === currentValue);

    const handleSelect = useCallback(
      (optValue: string) => {
        if (!isControlled) setInternalValue(optValue);
        onChange?.(optValue);
        setIsOpen(false);
      },
      [isControlled, onChange],
    );

    const handleToggle = useCallback(() => {
      if (!disabled) setIsOpen((prev) => !prev);
    }, [disabled]);

    // Enter/Space로 열고 닫기, Escape로 닫기
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return;

        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      },
      [disabled],
    );

    const handleFocus = useCallback(() => {
      setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
    }, []);

    // 외부 클릭 시 닫기 (Portal 드롭다운 클릭은 예외)
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          containerRef.current &&
          !containerRef.current.contains(target) &&
          (!dropdownRef.current || !dropdownRef.current.contains(target))
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // 스크롤/리사이즈 시 드롭다운 위치 재계산
    useEffect(() => {
      if (!isOpen) return;
      // rAF로 스로틀링하여 성능 보장
      let rafId: number;
      const update = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => setTick((c) => c + 1));
      };
      // capture 단계에서 모든 스크롤 이벤트 감지
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update);
      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
      };
    }, [isOpen]);

    // Portal 기반 드롭다운 위치 계산 + 수직 auto-flip
    useLayoutEffect(() => {
      if (!isOpen || !dropdownRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      // 컨테이너가 아직 레이아웃되지 않았으면 다음 프레임에 재시도
      if (containerRect.width === 0 && containerRect.height === 0) {
        requestAnimationFrame(() => setTick((c) => c + 1));
        return;
      }

      // Figma Placement 규칙: 트리거-드롭리스트 간격 8px
      const GAP = 8;
      const VIEWPORT_PADDING = 8;
      const PREFERRED_MAX = 240;

      const spaceBelow =
        window.innerHeight - containerRect.bottom - GAP - VIEWPORT_PADDING;
      const spaceAbove = containerRect.top - GAP - VIEWPORT_PADDING;

      // 아래 공간이 부족하고 위 공간이 더 넓을 때만 위로 뒤집기
      const flipUp = spaceBelow < PREFERRED_MAX && spaceAbove > spaceBelow;
      const available = flipUp ? spaceAbove : spaceBelow;
      const maxHeight = Math.max(0, Math.min(PREFERRED_MAX, available));

      // 너비/maxHeight/left는 먼저 적용, top은 실제 렌더 높이 측정 후 적용
      const el = dropdownRef.current;
      el.style.width = `${containerRect.width}px`;
      el.style.left = `${containerRect.left}px`;
      el.style.maxHeight = `${maxHeight}px`;

      const actualHeight = el.offsetHeight;
      el.style.top = flipUp
        ? `${containerRect.top - GAP - actualHeight}px`
        : `${containerRect.bottom + GAP}px`;
      el.style.visibility = "visible";
    });

    // 트리거 상태 스타일
    const triggerState = disabled
      ? stateStyles.disabled
      : isOpen && intent === "error"
      ? stateStyles.errorOpen
      : isOpen && intent === "complete"
      ? stateStyles.completeOpen
      : isOpen
      ? stateStyles.open
      : isFocused && intent === "error"
      ? stateStyles.errorFocused
      : isFocused && intent === "complete"
      ? stateStyles.completeFocused
      : isFocused
      ? stateStyles.focused
      : intent === "error"
      ? stateStyles.error
      : intent === "complete"
      ? stateStyles.complete
      : stateStyles.default;

    // default variant 트리거 스타일
    const defaultTriggerClass = cn(
      baseTrigger,
      triggerSizeStyles[size],
      triggerState,
    );

    // inline variant 트리거 스타일
    const inlineTriggerClass = cn(
      inlineTrigger,
      inlineSizeStyles[size],
      triggerState,
    );

    const triggerClass =
      variant === "inline" ? inlineTriggerClass : defaultTriggerClass;

    const iconClass = cn(
      iconStyles,
      iconSizeStyles[size],
      disabled &&
        "text-[var(--color-icon-disabled)]",
    );

    return (
      <div
        ref={ref}
        className={cn("inline-flex flex-col gap-[8rem] w-full", className)}
      >
        {/* default variant일 때만 외부 라벨 표시 */}
        {variant === "standard" && label && (
          <label className={labelStyles}>{label}</label>
        )}

        <div ref={containerRef} className="relative">
          {/* 트리거 */}
          <div
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            className={triggerClass}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            {/* inline variant: 라벨 + 구분선 + 값 영역 */}
            {variant === "inline" ? (
              <>
                {label && (
                  <>
                    <span
                      className={cn(
                        inlineLabelStyles,
                        inlineLabelSizeStyles[size],
                        inlineTextStyles[size],
                        disabled && disabledTextStyles,
                      )}
                    >
                      {label}
                    </span>
                    <span className={inlineDividerStyles} />
                  </>
                )}

                {/* 값 영역 */}
                <span
                  className={cn(
                    inlineValueAreaStyles,
                    inlineAreaStyles[size],
                  )}
                >
                  {leftIcon && <span className={iconClass}>{leftIcon}</span>}

                  <span
                    className={cn(
                      triggerTextStyles[size],
                      "flex-1 min-w-0 truncate text-left",
                      selectedOption
                        ? cn(valueTextStyles, disabled && disabledTextStyles)
                        : cn(
                            placeholderTextStyles,
                            disabled && disabledTextStyles,
                          ),
                    )}
                  >
                    {selectedOption?.label ?? placeholder}
                  </span>

                  <span
                    className={cn(
                      indicatorStyles,
                      indicatorSizeStyles[size],
                      disabled &&
                        "text-[var(--color-icon-disabled)]",
                      isOpen && "rotate-180",
                    )}
                  >
                    <IconChevronDown />
                  </span>
                </span>
              </>
            ) : (
              <>
                {leftIcon && <span className={iconClass}>{leftIcon}</span>}

                <span
                  className={cn(
                    triggerTextStyles[size],
                    selectedOption
                      ? cn(valueTextStyles, disabled && disabledTextStyles)
                      : cn(
                          placeholderTextStyles,
                          disabled && disabledTextStyles,
                        ),
                  )}
                >
                  {selectedOption?.label ?? placeholder}
                </span>

                <span
                  className={cn(
                    indicatorStyles,
                    indicatorSizeStyles[size],
                    disabled &&
                      "text-[var(--color-icon-disabled)]",
                    isOpen && "rotate-180",
                  )}
                >
                  <IconChevronDown />
                </span>
              </>
            )}
          </div>

          {/* 드롭다운 - Portal로 body에 렌더하여 overflow: hidden 영향 제거 */}
          {isOpen &&
            createPortal(
              <Droplist
                ref={dropdownRef}
                options={options}
                groups={groups}
                value={currentValue}
                onSelect={handleSelect}
                style={{ visibility: "hidden", position: "fixed", zIndex }}
              />,
              document.body,
            )}
        </div>

        {resolvedHelperText && !disabled && showHelperText && (
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
            {intent === "none" && <IconInfoCircleFill size={12} />}
            {resolvedHelperText}
          </span>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";
