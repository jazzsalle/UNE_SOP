import { forwardRef, Children, isValidElement, type KeyboardEvent } from "react";
import { cn } from "@/utils/cn";
import { CardContext } from "./context";
import { CardMedia } from "./components/CardMedia";
import { CardHeader } from "./components/CardHeader";
import { CardBody } from "./components/CardBody";
import { CardFooter } from "./components/CardFooter";
import type { CardProps, CardStyle } from "./types";

// style × selected 조합별 shadow/border
const cardStyleClass: Record<CardStyle, { base: string; selected: string }> = {
  elevated: {
    base: "shadow-[var(--elevation-03)]",
    selected: "shadow-[var(--elevation-03),var(--selected-shadow)]",
  },
  fill: {
    base: "",
    selected: "shadow-[var(--selected-shadow)]",
  },
  outline: {
    base: "border border-[var(--color-border-default)]",
    selected: "border border-[var(--color-border-default)] shadow-[var(--selected-shadow)]",
  },
};

// style별 인터랙티브 hover/active 스타일
const cardInteractiveClass: Record<CardStyle, string> = {
  elevated: cn(
    "hover:shadow-[var(--elevation-05)]",
    "active:shadow-[var(--elevation-03)]",
  ),
  fill: cn(
    "hover:bg-[var(--color-bg-subtle)]",
    "active:bg-[var(--color-bg-muted)]",
  ),
  outline: cn(
    "hover:bg-[var(--color-bg-subtle)]",
    "active:bg-[var(--color-bg-muted)]",
  ),
};

// 가로형 레이아웃 내 콘텐츠 컨테이너 스타일
const horizontalContentClass =
  "flex flex-col items-start justify-center self-stretch flex-1 min-w-0";

/**
 * Card - 콘텐츠를 묶어 표시하는 카드 컴포넌트
 *
 * Media / Header / Body / Footer 네 영역을 선택적으로 조합합니다.
 * vertical(기본) 또는 horizontal 레이아웃, elevated / fill / outline 스타일을 지원합니다.
 *
 * @example
 * <Card cardStyle="elevated" onClick={handleClick}>
 *   <Card.Media><img src="..." alt="" /></Card.Media>
 *   <Card.Header title="제목" subtitle="부제목" />
 *   <Card.Body>콘텐츠</Card.Body>
 *   <Card.Footer><Button>액션</Button></Card.Footer>
 * </Card>
 */
const CardRoot = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "vertical",
      cardStyle = "elevated",
      selected = false,
      disabled = false,
      onClick,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    // onClick이 있거나 명시적으로 tabIndex를 주면 인터랙티브로 취급
    const isInteractive = Boolean(onClick);

    // 키보드 Enter/Space로 클릭 트리거
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.();
      }
    };

    const { base, selected: selectedClass } = cardStyleClass[cardStyle];

    // horizontal 모드: Media와 나머지 콘텐츠(Header/Body/Footer)를 분리
    const childArray = Children.toArray(children);
    const mediaChildren = childArray.filter(
      (child) => isValidElement(child) && child.type === CardMedia,
    );
    const contentChildren = childArray.filter(
      (child) => !(isValidElement(child) && child.type === CardMedia),
    );

    return (
      <CardContext.Provider value={{ variant }}>
        <div
          ref={ref}
          role={isInteractive ? "button" : undefined}
          tabIndex={isInteractive && !disabled ? 0 : undefined}
          aria-disabled={disabled || undefined}
          data-selected={selected || undefined}
          onClick={disabled ? undefined : onClick}
          onKeyDown={isInteractive ? handleKeyDown : undefined}
          className={cn(
            // 기본 레이아웃
            "relative rounded-[8rem] bg-[var(--color-bg-surface)]",
            "transition-shadow duration-150",
            variant === "vertical" ? "flex flex-col" : "flex flex-row",
            // 스타일 (선택 여부에 따라 분기)
            selected ? selectedClass : base,
            // 인터랙티브 상태
            isInteractive && !disabled && cardInteractiveClass[cardStyle],
            isInteractive && !disabled && "cursor-pointer",
            isInteractive && "focus-visible:outline-none focus-visible:shadow-[var(--selected-shadow)]",
            // 비활성화
            disabled && "opacity-40 cursor-not-allowed pointer-events-none",
            className,
          )}
          {...rest}
        >
          {/* vertical: 자식을 그대로 렌더, horizontal: Media + 콘텐츠 래퍼 분리 */}
          {variant === "vertical" ? (
            children
          ) : (
            <>
              {mediaChildren}
              {contentChildren.length > 0 && (
                <div className={horizontalContentClass}>{contentChildren}</div>
              )}
            </>
          )}
        </div>
      </CardContext.Provider>
    );
  },
);
CardRoot.displayName = "Card";

// 복합 컴포넌트 조합
export const Card = Object.assign(CardRoot, {
  Media: CardMedia,
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
