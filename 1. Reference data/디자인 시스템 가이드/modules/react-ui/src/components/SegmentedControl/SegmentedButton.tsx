import { cn } from "@/utils/cn";
import type { SegmentedOption, SegmentedSize } from "./types";
import { SetStateAction } from "react";

/** 세그먼트 컨트롤의 개별 버튼. 선택 상태에 따라 스타일이 변경됩니다. */
export default function SegmentedButton<T extends string>({
  option,
  isSelected,
  disabled,
  setValue,
  size,
  fitContent,
}: {
  option: SegmentedOption<T>;
  isSelected: boolean;
  disabled?: boolean;
  setValue: React.Dispatch<SetStateAction<T>>;
  size: SegmentedSize;
  fitContent?: boolean;
}) {
  const isDisabled = disabled || option.disabled;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      disabled={isDisabled}
      onClick={() => {
        if (isDisabled) return;
        setValue(option.value);
      }}
      className={cn(
        // default
        "relative flex items-center justify-center select-none transition-colors font-normal border-none bg-transparent",
        !fitContent && "flex-1",

        // container, text size
        size === "lg" && "h-[40rem] px-[16rem] typo-text-md rounded-[6rem]",
        size === "md" && "h-[36rem] px-[12rem] typo-text-md rounded-[6rem]",
        size === "sm" && "h-[32rem] px-[12rem] typo-text-md rounded-[4rem]",

        // disabled
        isDisabled && "cursor-not-allowed opacity-40",

        // default — 다크모드는 시맨틱 토큰이 자동 처리
        "text-[var(--color-text-placeholder)]",

        // hover (selected 상태에서는 적용하지 않음)
        !isSelected &&
          cn(
            "hover:text-[var(--color-text-subtle)] hover:bg-[var(--color-bg-muted)]",
          ),
        // selected
        isSelected &&
          cn(
            // shadow: --elevation-01 light / --elevation-03 dark 는 shadow.css에서 자동 처리
            "shadow-[var(--elevation-01)] dark:shadow-[var(--elevation-03)]",
            "bg-[var(--color-bg-elevated)] text-[var(--color-text-default)]",
          ),
      )}
    >
      {/* 아이콘 크기 제어 */}
      <span className="inline-flex items-center justify-center gap-[4rem] [&>svg]:size-[16rem]">{option.label}</span>
    </button>
  );
}
