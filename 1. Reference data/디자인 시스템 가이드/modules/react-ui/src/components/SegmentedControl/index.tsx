import type { ComponentProps, SetStateAction } from "react";
import SegmentedButton from "./SegmentedButton";
import SegmentedContainer from "./SegmentedContainer";
import type { SegmentedOption, SegmentedSize } from "./types";

export interface SegmentedControlProps<T extends string>
  extends ComponentProps<"div"> {
  /** 현재 선택된 값 */
  value: T;

  /** 선택 가능한 옵션 목록 */
  options: SegmentedOption<T>[];

  /** 값 변경 핸들러 */
  setValue: React.Dispatch<SetStateAction<T>>;

  /** 크기 @default "md" */
  size?: SegmentedSize;

  /** 전체 너비 사용 여부 */
  fullWidth?: boolean;

  /** 비활성화 여부 */
  disabled?: boolean;

  /** ��튼 너비를 콘텐츠 크기에 맞출지 여부 @default false */
  fitContent?: boolean;

  className?: string;
}

/**
 * 세그먼트 컨트롤 컴포넌트
 *
 * Compound 패턴(SegmentedContainer + SegmentedButton)으로 구성되며,
 * 여러 옵션 중 하나를 선택하는 버튼 그룹입니다.
 * Generic 타입으로 타입 안전한 값 관리를 지원합니다.
 *
 * @example
 * <SegmentedControl
 *   value={value}
 *   setValue={setValue}
 *   options={[
 *     { value: "day", label: "일" },
 *     { value: "month", label: "월" },
 *   ]}
 * />
 */
export function SegmentedControl<T extends string>({
  value,
  options,
  setValue,
  size = "md",
  fullWidth,
  disabled,
  fitContent,
  ...props
}: SegmentedControlProps<T>) {
  return (
    <SegmentedContainer fullWidth={fullWidth} fitContent={fitContent} size={size} {...props}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <SegmentedButton
            key={option.value}
            option={option}
            isSelected={isSelected}
            disabled={disabled}
            setValue={setValue}
            size={size}
            fitContent={fitContent}
          />
        );
      })}
    </SegmentedContainer>
  );
}
