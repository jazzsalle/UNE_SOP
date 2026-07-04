import {
  forwardRef,
  createContext,
  useContext,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";

type RadioSize = "lg" | "md" | "sm";

// ─── RadioGroup Context ───

interface RadioGroupContextType {
  value: string;
  setValue: (value: string) => void;
  size: RadioSize;
  disabled: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextType | null>(null);

const useRadioGroup = () => useContext(RadioGroupContext);

// ─── RadioGroup ───

type RadioDirection = "vertical" | "horizontal";

export interface RadioGroupProps
  extends Omit<ComponentProps<"div">, "defaultValue"> {
  /** 현재 선택된 값 */
  value: string;
  /** 값 변경 핸들러 */
  setValue: (value: string) => void;
  /** 라디오 크기 @default "md" */
  size?: RadioSize;
  /** 배치 방향 @default "vertical" */
  direction?: RadioDirection;
  /** 전체 비활성화 */
  disabled?: boolean;
  children: ReactNode;
}

/**
 * 라디오 버튼 그룹 컴포넌트
 *
 * 여러 개의 옵션 중 한 개의 값을 선택할 수 있습니다.
 * Context로 하위 RadioButton에 상태를 전달합니다.
 *
 * @example
 * <RadioGroup value={value} setValue={setValue}>
 *   <RadioButton value="a" label="옵션 A" />
 *   <RadioButton value="b" label="옵션 B" />
 * </RadioGroup>
 */
export const RadioGroup = ({
  value,
  setValue,
  size = "md",
  direction = "vertical",
  disabled = false,
  className,
  children,
  ...props
}: RadioGroupProps) => {
  return (
    <RadioGroupContext.Provider value={{ value, setValue, size, disabled }}>
      <div
        role="radiogroup"
        className={cn(
          "flex",
          direction === "horizontal"
            ? "flex-row items-center gap-[16rem]"
            : "flex-col gap-[8rem]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

// ─── RadioButton ───

export interface RadioButtonProps
  extends Omit<ComponentProps<"input">, "size" | "type" | "value"> {
  /** 라디오 값 */
  value: string;
  /** 라벨 텍스트 */
  label?: string;
  /** 개별 비활성화 */
  disabled?: boolean;
  /** 라디오 크기 (RadioGroup 없이 단독 사용 시) @default "md" */
  size?: RadioSize;
}

/**
 * 개별 라디오 버튼. RadioGroup 내부 또는 단독으로 사용 가능합니다.
 *
 * @example
 * <RadioButton value="a" label="옵션 A" />
 */
export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  (
    {
      value,
      label,
      disabled: disabledProp,
      size: sizeProp,
      className,
      ...props
    },
    ref,
  ) => {
    const group = useRadioGroup();

    const size = group?.size ?? sizeProp ?? "md";
    const isDisabled = disabledProp || group?.disabled || false;
    const isChecked = group ? group.value === value : false;

    const handleChange = () => {
      if (isDisabled) return;
      group?.setValue(value);
    };

    const sizeStyles: Record<
      RadioSize,
      { outer: string; inner: string; text: string }
    > = {
      lg: {
        outer: "size-[24rem]",
        inner: "size-[12rem]",
        text: "typo-title-sm",
      },
      md: {
        outer: "size-[20rem]",
        inner: "size-[10rem]",
        text: "typo-text-lg",
      },
      sm: {
        outer: "size-[16rem]",
        inner: "size-[8rem]",
        text: "typo-text-md",
      },
    };

    const { outer, inner, text } = sizeStyles[size];

    return (
      <label
        className={cn(
          "inline-flex items-center gap-[8rem] select-none group",
          isDisabled ? "cursor-not-allowed" : "cursor-pointer",
          className,
        )}
      >
        <input
          ref={ref}
          type="radio"
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          onChange={handleChange}
          className="sr-only peer"
          {...props}
        />

        {/* Radio Track */}
        <span
          className={cn(
            outer,
            "relative flex-shrink-0",
            "rounded-full transition-colors",
            isDisabled
              ? cn(
                  "border-[1rem]",
                  // disabled 배경·테두리: 다크모드는 시맨틱 토큰이 자동 처리
                  "bg-[var(--color-bg-disabled)]",
                  "border-[var(--color-border-disabled)]",
                )
              : isChecked
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
                  "border-[var(--color-border-default)]",
                  // hover
                  "group-hover:border-[var(--color-border-strong)] group-hover:bg-[var(--color-bg-muted)]",
                  // active
                  "group-active:bg-[var(--color-bg-muted)] group-active:border-[var(--color-border-strong)]",
                  // focus-visible (키보드 포커스 링)
                  "peer-focus-visible:shadow-[var(--selected-shadow)]",
                ),
          )}
        >
          {/* Radio Thumb */}
          {isChecked && (
            <span
              className={cn(
                inner,
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                "rounded-full",
                isDisabled
                  ? "bg-[var(--color-text-disabled)]"
                  : "bg-[var(--color-text-on-brand)]",
              )}
            />
          )}
        </span>

        {/* Label */}
        {label && (
          <span
            className={cn(
              text,
              isDisabled
                ? "text-[var(--color-text-disabled)]"
                : "text-[var(--color-text-default)]",
            )}
          >
            {label}
          </span>
        )}
      </label>
    );
  },
);

RadioButton.displayName = "RadioButton";
