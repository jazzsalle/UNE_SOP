import { cn } from "@/utils/cn";
import type { TooltipSize, TooltipDirection, TooltipArrow } from "./types";

// ─── 컨테이너 ───

export const containerStyles = cn("inline-flex");

// ─── 툴팁 콘텐츠 ───

// TODO: 시맨틱 토큰 미정의 — 툴팁 배경 dark 값(--grayscale-600)이 --color-bg-elevated 와 다름. 툴팁 전용 토큰 필요 시 재검토
export const tooltipBaseStyles = cn(
  "fixed w-max shadow-[var(--elevation-03)]",
  "bg-[var(--color-bg-elevated)]",
  "text-[var(--color-text-default)]",
  "animate-[fadeIn_150ms_ease-out]",
);

export const sizeStyles: Record<TooltipSize, string> = {
  sm: cn("px-[12rem] py-[4rem] rounded-[4rem] typo-text-sm max-w-[360rem] max-h-[192rem]"),
  lg: cn("px-[16rem] py-[16rem] rounded-[12rem] typo-text-sm max-w-[360rem] max-h-[192rem]"),
};

// ─── 화살표 ───

export const arrowBaseStyles = cn(
  "absolute",
  "w-0 h-0",
  "border-solid border-transparent",
);

export const getArrowStyles = (
  direction: TooltipDirection,
  arrow: TooltipArrow,
): string => {
  // TODO: 시맨틱 토큰 미정의 — 화살표 border-color는 배경과 동일해야 하나, Tailwind arbitrary에서 CSS var 사용 시 bg와 동기화 필요
  const arrowPositions: Record<TooltipDirection, string> = {
    top: cn(
      "top-full",
      "border-t-[6rem] border-x-[6rem] border-b-0",
      "border-t-white dark:border-t-[var(--color-bg-elevated)]",
    ),
    bottom: cn(
      "bottom-full",
      "border-b-[6rem] border-x-[6rem] border-t-0",
      "border-b-white dark:border-b-[var(--color-bg-elevated)]",
    ),
    left: cn(
      "left-full",
      "border-l-[6rem] border-y-[6rem] border-r-0",
      "border-l-white dark:border-l-[var(--color-bg-elevated)]",
    ),
    right: cn(
      "right-full",
      "border-r-[6rem] border-y-[6rem] border-l-0",
      "border-r-white dark:border-r-[var(--color-bg-elevated)]",
    ),
  };

  let alignClass: string;
  if (direction === "top" || direction === "bottom") {
    switch (arrow) {
      case "start":
        alignClass = "left-[12rem]";
        break;
      case "center":
        alignClass = "left-1/2 -translate-x-1/2";
        break;
      case "end":
        alignClass = "right-[12rem]";
        break;
    }
  } else {
    switch (arrow) {
      case "start":
        alignClass = "top-[12rem]";
        break;
      case "center":
        alignClass = "top-1/2 -translate-y-1/2";
        break;
      case "end":
        alignClass = "bottom-[12rem]";
        break;
    }
  }

  return cn(arrowBaseStyles, arrowPositions[direction], alignClass);
};

// ─── 닫기 버튼 ───

export const closeButtonWrapperStyles = cn("flex-shrink-0 ml-[4rem]");

// ─── 리스트 ───

export const listContainerStyles = cn(
  "flex flex-col gap-[4rem]",
  "max-h-[160rem] overflow-y-auto",
);

export const listItemStyles = cn("flex items-start gap-[8rem] typo-text-sm");
