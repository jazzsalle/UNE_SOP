import { useState, useId, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { IconCaretDown } from "@/components/Icons/IconCaretDown";
import type { IconSize } from "@/components/Icons/types";
import { Checkbox } from "@/components/Checkbox";

export type AccordionVariant = "line" | "selecte";
export type AccordionSize = "lg" | "md" | "sm";

export interface AccordionProps {
  /** 컨테이너 스타일 변형 (기본형/라인형) */
  variant?: AccordionVariant;
  /** 헤더 크기 */
  size?: AccordionSize;
  /** 제어 모드: 열림 상태 */
  open?: boolean;
  /** 비제어 모드: 초기 열림 상태 */
  defaultOpen?: boolean;
  /** 열림/닫힘 토글 핸들러 */
  onToggle?: (open: boolean) => void;
  /** 헤더 타이틀 텍스트 */
  title: string;
  /** 헤더 왼쪽 아이콘 */
  leftIcon?: ReactNode;
  /** 헤더 왼쪽 체크박스 표시 여부 */
  headerCheckbox?: boolean;
  /** 헤더 체크박스 선택 상태 (제어 모드) */
  checked?: boolean;
  /** 헤더 체크박스 상태 변경 핸들러 */
  onCheckedChange?: (checked: boolean) => void;
  /** 헤더 우측 보조 텍스트 */
  helperText?: string;
  /** 열림 시 본문 텍스트 영역 표시 여부 */
  showBodyText?: boolean;
  /** 열림 시 리스트 콘텐츠 표시 여부 */
  showList?: boolean;
  /** 열림 시 리스트 콘텐츠 */
  list?: ReactNode;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 본문 텍스트 콘텐츠 */
  children: ReactNode;
}

export const Accordion = ({
  variant = "selecte",
  size = "lg",
  open: controlledOpen,
  defaultOpen = false,
  onToggle,
  title,
  leftIcon,
  headerCheckbox = false,
  checked,
  onCheckedChange,
  helperText,
  showBodyText = true,
  showList = false,
  list,
  disabled = false,
  children,
}: AccordionProps) => {
  // 비제어 모드 내부 열림 상태
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  // 콘텐츠 패널 접근성 연결용 ID
  const panelId = useId();
  const headerId = useId();

  // 제어/비제어 열림 값 결정
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  // 헤더 클릭 시 열림 상태 토글
  const handleToggle = () => {
    if (disabled) return;
    const next = !isOpen;
    if (controlledOpen === undefined) setInternalOpen(next);
    onToggle?.(next);
  };

  // 크기별 높이·패딩·폰트·아이콘 크기·모서리 반경
  const sizeMap = {
    lg: {
      headerHeight: "h-[64rem]",
      headerFont: "typo-title-sm",
      helperFont: "typo-text-lg",
      headerPx: "px-[20rem]",
      headerGap: "gap-[12rem]",
      iconSize: "size-[24rem]",
      chevronNum: 16 as IconSize,
      radius: "rounded-[12rem]",
      bottomRadius: "rounded-b-[12rem]",
      contentPadding: "px-[20rem] py-[16rem]",
    },
    md: {
      headerHeight: "h-[56rem]",
      headerFont: "typo-text-lg",
      helperFont: "typo-text-md",
      headerPx: "px-[16rem]",
      headerGap: "gap-[8rem]",
      iconSize: "size-[20rem]",
      chevronNum: 16 as IconSize,
      radius: "rounded-[8rem]",
      bottomRadius: "rounded-b-[8rem]",
      contentPadding: "p-[16rem]",
    },
    sm: {
      headerHeight: "h-[48rem]",
      headerFont: "typo-text-md",
      helperFont: "typo-text-sm",
      headerPx: "px-[12rem]",
      headerGap: "gap-[8rem]",
      iconSize: "size-[16rem]",
      chevronNum: 12 as IconSize,
      radius: "rounded-[6rem]",
      bottomRadius: "rounded-b-[6rem]",
      contentPadding: "px-[12rem] py-[14rem]",
    },
  };
  const s = sizeMap[size];

  // 컨테이너 스타일 (variant에 따라 테두리·모서리 다름)
  const containerStyles = cn(
    "flex flex-col",
    variant === "selecte" && cn(s.radius, "overflow-hidden"),
  );

  // 아이콘·셰브론 색상 (열림/비활성화/눌림 상태별)
  const iconColor = disabled
    ? "text-[var(--color-icon-disabled)]"
    : isOpen
      ? "text-[var(--color-icon-brand)] group-hover:text-[var(--color-interactive-brand-hover)] group-active:text-[var(--color-interactive-brand-pressed)]"
      : "text-[var(--color-icon-default)]";

  // 헤더 버튼 스타일 (열림/비활성화 상태별 배경·텍스트 색상)
  const headerStyles = cn(
    s.headerHeight,
    s.headerFont,
    s.headerPx,
    s.headerGap,
    "flex items-center w-full text-left",
    variant === "line"
      ? "border-0 border-b border-solid border-[var(--color-border-accordion)] select-none font-medium"
      : "border-0 select-none font-medium",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:shadow-[var(--selected-shadow)]",
    disabled
      ? "bg-[var(--color-bg-accordion-content)] text-[var(--color-text-disabled)] cursor-not-allowed"
      : isOpen
        ? cn(
            "bg-[var(--color-bg-accordion-open)] text-[var(--color-text-brand)] cursor-pointer",
            "hover:bg-[var(--color-bg-accordion-open-hover)] hover:text-[var(--color-interactive-brand-hover)]",
            "active:bg-[var(--color-bg-accordion-open-active)] active:text-[var(--color-interactive-brand-pressed)]",
          )
        : cn(
            "bg-[var(--color-bg-accordion-content)] text-[var(--color-text-default)] cursor-pointer",
            "hover:bg-[var(--color-bg-accordion-closed-hover)]",
            "active:bg-[var(--color-bg-accordion-closed-active)]",
          ),
  );

  return (
    <div className={containerStyles}>
      {/* 헤더 토글 버튼 */}
      <button
        type="button"
        id={headerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        disabled={disabled}
        className={cn(headerStyles, !disabled && "group")}
        onClick={handleToggle}
      >
        {/* 헤더 체크박스 — 클릭이 아코디언 토글로 전파되지 않도록 차단 */}
        {headerCheckbox && (
          <span
            className="shrink-0 inline-flex"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              size={size}
              checked={checked}
              onCheckedChange={onCheckedChange}
              disabled={disabled}
            />
          </span>
        )}

        {/* 왼쪽 아이콘 */}
        {leftIcon && (
          <span className={cn("inline-flex items-center justify-center shrink-0", s.iconSize, iconColor)}>
            {leftIcon}
          </span>
        )}

        {/* 타이틀 */}
        <span className="flex-1 min-w-0">{title}</span>

        {/* 헤더 우측 보조 텍스트 */}
        {helperText && (
          <span className={cn(
            s.helperFont,
            "shrink-0 font-normal whitespace-nowrap",
            disabled
              ? "text-[var(--color-text-accordion-helper-disabled)]"
              : isOpen
                ? "text-[var(--color-text-accordion-helper)]"
                : "text-[var(--color-icon-subtle)]",
          )}>
            {helperText}
          </span>
        )}

        {/* 셰브론: 열림 상태에서 180° 회전 */}
        <span className={cn(
          "inline-flex items-center justify-center shrink-0",
          "transition-transform duration-200",
          iconColor,
          isOpen && "rotate-180",
        )}>
          <IconCaretDown size={s.chevronNum} />
        </span>
      </button>

      {/* 본문 텍스트 영역 (열림 상태이고 showBodyText가 true일 때 노출) */}
      {isOpen && showBodyText && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className={cn(
            s.contentPadding,
            "bg-[var(--color-bg-accordion-content)] text-[var(--color-text-accordion-content)] font-normal",
            variant === "selecte" && !(showList && list) && s.bottomRadius,
          )}
        >
          {children}
        </div>
      )}

      {/* 리스트 콘텐츠 영역 (열림 상태이고 showList가 true이며 list가 있을 때 노출) */}
      {isOpen && showList && list && (
        <div className={cn(
          "flex flex-col w-full shrink-0 bg-[var(--color-bg-accordion-content)]",
          variant === "selecte" && s.bottomRadius,
        )}>
          {list}
        </div>
      )}
    </div>
  );
};
