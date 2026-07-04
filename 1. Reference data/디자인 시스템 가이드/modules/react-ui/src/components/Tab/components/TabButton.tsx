import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Badge, type BadgeProps } from "../../badges/Badge";
import type { BadgeSize } from "../../badges/types";
import { useTabs } from "../useTabs";

// 탭 사이즈별 뱃지 사이즈 — lg: sm(24px), md/sm: xs(20px)
const badgeSizeMap: Record<string, BadgeSize> = {
  lg: "sm",
  md: "xs",
  sm: "xs",
};

interface TabProps {
  /** 탭 식별 값 (Tabs의 value와 매칭) */
  value: string;
  /** 탭에 표시할 텍스트 */
  label: string;
  /** 왼쪽 아이콘 */
  icon?: ReactNode;
  /** 오른쪽 뱃지 */
  badge?: BadgeProps;
}

/** 개별 탭 버튼. 선택 시 하단 4px 인디케이터 + 브랜드 색상 텍스트가 적용됩니다. */
export const TabButton = ({
  value: tabValue,
  label,
  icon,
  badge,
}: TabProps) => {
  const { value, setValue, size } = useTabs();

  const isSelected = value === tabValue;

  // 크기별 높이·폰트·패딩·아이콘 크기
  const sizeMap = {
    lg: {
      height: "h-[56rem]",
      font: "typo-title-sm",
      iconSize: "size-[24rem]",
      px: "px-[20rem]",
    },
    md: {
      height: "h-[48rem]",
      font: "typo-text-lg",
      iconSize: "size-[20rem]",
      px: "px-[16rem]",
    },
    sm: {
      height: "h-[40rem]",
      font: "typo-text-md",
      iconSize: "size-[16rem]",
      px: "px-[12rem]",
    },
  };

  const s = sizeMap[size];

  // indicator를 absolute로 배치해 flex 높이 계산에서 제외 — 부모 overflow 방지
  // group 수식어로 hover/active 시 indicator 색상도 함께 변경
  const buttonStyles = cn(
    s.height,
    s.font,
    s.px,
    "group relative flex-1 flex items-center justify-center gap-[8rem] whitespace-nowrap",
    "border-0 bg-transparent cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:shadow-[var(--selected-shadow)]",
    isSelected
      ? cn(
          // 선택: default → hover → active 순으로 브랜드 색상 어두워짐
          // border-b transparent로 비선택(border-b 1px)과 flex 내부 높이를 동일하게 유지
          "font-medium border-b border-solid border-b-transparent",
          "text-[var(--color-text-brand)]",
          "hover:text-[var(--color-interactive-brand-hover)]",
          "active:text-[var(--color-interactive-brand-pressed)]",
        )
      : cn(
          // 비선택: 배경 변화 없음, 텍스트만 어두워짐
          "border-b border-solid border-b-[var(--color-border-default)]",
          "text-[var(--color-text-subtle)]",
          "hover:text-[var(--grayscale-800)]",
          "active:text-[var(--color-text-default)]",
        ),
  );

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      className={buttonStyles}
      onClick={() => setValue(tabValue)}
    >
      {icon && (
        <span
          className={cn(
            "inline-flex items-center justify-center shrink-0",
            s.iconSize,
          )}
        >
          {icon}
        </span>
      )}
      <span>{label}</span>
      {badge && (
        <span className="inline-flex items-center shrink-0">
          <Badge {...badge} size={badgeSizeMap[size]} />
        </span>
      )}

      {/* 선택 인디케이터: group hover/active로 버튼과 동시에 색상 변경 */}
      {isSelected && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-[4rem] rounded-tl-[8rem] rounded-tr-[8rem]",
            "bg-[var(--color-border-brand)]",
            "group-hover:bg-[var(--color-interactive-brand-hover)]",
            "group-active:bg-[var(--color-interactive-brand-pressed)]",
          )}
        />
      )}
    </button>
  );
};
