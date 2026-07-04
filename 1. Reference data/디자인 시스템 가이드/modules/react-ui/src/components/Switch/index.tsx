import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/utils/cn";
import SwitchTrack from "./SwitchTrack";
import SwitchThumb from "./SwitchThumb";

export interface SwitchProps extends ComponentProps<"div"> {
  /** 스위치 ON/OFF 상태 */
  value?: boolean;
  /** 상태 변경 핸들러 */
  setValue?: (value: boolean) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 스위치 크기 @default "md" */
  size?: "lg" | "md" | "sm";
}

/**
 * 토글 스위치 컴포넌트
 *
 * Compound 패턴(SwitchTrack + SwitchThumb)으로 구성되며,
 * LG / MD / SM 크기와 다크모드를 지원합니다.
 *
 * @example
 * <Switch value={checked} setValue={setChecked} />
 */
export const Switch = forwardRef<HTMLDivElement, SwitchProps>(
  ({ value, setValue, disabled, size = "md", className, ...props }, ref) => {
    // 체크박스 onChange 핸들러 (키보드 조작 + 클릭 토글)
    const handleChange = () => {
      if (disabled) return;
      setValue?.(!value);
    };

    return (
      <label
        className={cn(
          "inline-flex select-none",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        {/* 키보드 접근성 + focus-visible 링을 위한 숨겨진 체크박스 */}
        <input
          type="checkbox"
          checked={value || false}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only peer"
        />
        <SwitchTrack
          value={value}
          disabled={disabled}
          size={size}
          ref={ref}
          className={className}
          {...props}
        >
          <SwitchThumb value={value} size={size} disabled={disabled} />
        </SwitchTrack>
      </label>
    );
  },
);

Switch.displayName = "Switch";
