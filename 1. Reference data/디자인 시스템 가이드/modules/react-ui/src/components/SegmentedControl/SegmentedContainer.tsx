import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";

interface SegmentedContainerProps extends ComponentProps<"div"> {
  fullWidth?: boolean;
  fitContent?: boolean;
  size?: "lg" | "md" | "sm";
}

/** 세그먼트 컨트롤의 외부 컨테이너. variant에 따라 배경과 테두리 스타일이 달라집니다. */
export default function SegmentedContainer({
  fullWidth,
  fitContent,
  size,
  ...props
}: SegmentedContainerProps) {
  return (
    <div
      role="radiogroup"
      className={cn(
        // default
        "p-[1rem] flex gap-[2rem]",

        // border — 다크모드는 시맨틱 토큰이 자동 처리
        "border-[1rem] border-[var(--color-border-subtle)]",
        size === "sm" ? "rounded-[6rem]" : "rounded-[8rem]",

        // background — 다크모드는 시맨틱 토큰이 자동 처리
        "bg-[var(--color-bg-muted)]",
        fullWidth && "w-full",
        fitContent && "w-fit",
      )}
    >
      {props.children}
    </div>
  );
}
