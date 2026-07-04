import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import type { BadgeColor, BadgeSize } from "../types";
import { IconDot } from "../../Icons";
import type { IconSize } from "../../Icons/types";

type BadgeShape = "round-square" | "cylinder";
type BadgeVariant = "solid" | "solid-pastel" | "outline" | "dot-accent" | "dot-neutral";

export interface BadgeProps {
  /** 라벨 텍스트 */
  label: string;
  /** 형태 @default "round-square" */
  shape?: BadgeShape;
  /** 스타일 @default "solid" */
  variant?: BadgeVariant;
  /** 색상 @default "primary" */
  color?: BadgeColor;
  /** 크기 @default "md" */
  size?: BadgeSize;
  /** 왼쪽 아이콘 (solid / solid-pastel / outline variant 전용) */
  leftIcon?: ReactNode;
  className?: string;
}

// round-square는 사이즈별로 반경이 다르고(XL만 6rem, 그 외 4rem),
// cylinder는 사이즈 무관하게 rounded-full. size에 포함된 radius를 cylinder 선택 시 override 한다.
const cylinderRadius = "rounded-full";

// TODO: 시맨틱 토큰 미정의 — solid dark 배경(--dark-blue-300, --green-300 등)과 secondary/warning/grayscale intent는 시맨틱 토큰 없음. 프리미티브 유지.
// TODO: 시맨틱 토큰 미정의 — solid-pastel/outline 각 intent별 subtle bg/border 시맨틱 토큰 미정의. primary만 처리, 나머지 프리미티브 유지.
const badgeColorStyles: Record<BadgeVariant, Record<BadgeColor, string>> = {
  solid: {
    primary: cn(
      "bg-[var(--color-bg-brand)] text-[var(--color-text-on-brand)]",
    ),
    success: cn(
      "bg-[var(--color-bg-success)] text-[var(--color-text-on-brand)]",
    ),
    error: cn(
      "bg-[var(--color-bg-danger)] text-[var(--color-text-on-brand)]",
    ),
    // TODO: 시맨틱 토큰 미정의 — secondary(orange), warning(yellow) solid 배경
    secondary: cn(
      "bg-[var(--orange-500)] text-white",
      "dark:bg-[var(--orange-300)] dark:text-[var(--grayscale-900)]",
    ),
    warning: cn(
      "bg-[var(--yellow-400)] text-white",
      "dark:bg-[var(--yellow-300)] dark:text-[var(--grayscale-900)]",
    ),
    grayscale: cn(
      "bg-[var(--color-text-placeholder)] text-[var(--color-text-on-brand)]",
    ),
  },
  "solid-pastel": {
    primary: cn(
      "bg-[var(--color-bg-brand-subtle)] text-[var(--color-text-brand)]",
    ),
    success: cn(
      "bg-[var(--color-bg-success-subtle)] text-[var(--color-text-success)]",
    ),
    error: cn(
      "bg-[var(--color-bg-danger-subtle)] text-[var(--color-text-danger)]",
    ),
    // TODO: 시맨틱 토큰 미정의 — secondary(orange), warning(yellow), grayscale solid-pastel subtle 배경
    secondary: cn(
      "bg-[var(--orange-25)] text-[var(--orange-500)]",
      "dark:bg-[var(--orange-900)] dark:text-[var(--orange-300)]",
    ),
    warning: cn(
      "bg-[var(--yellow-25)] text-[var(--yellow-400)]",
      "dark:bg-[var(--yellow-900)] dark:text-[var(--yellow-300)]",
    ),
    grayscale: cn(
      "bg-[var(--color-bg-muted)] text-[var(--color-text-placeholder)]",
    ),
  },
  // outline: border 대신 inset box-shadow 사용 — border는 레이아웃에 영향을 주지만 shadow는 그렇지 않음
  outline: {
    primary: cn(
      "shadow-[inset_0_0_0_1rem_var(--color-border-brand)] text-[var(--color-text-brand)]",
    ),
    success: cn(
      "shadow-[inset_0_0_0_1rem_var(--color-border-success)] text-[var(--color-text-success)]",
    ),
    error: cn(
      "shadow-[inset_0_0_0_1rem_var(--color-border-danger)] text-[var(--color-text-danger)]",
    ),
    // TODO: 시맨틱 토큰 미정의 — secondary(orange), warning(yellow) outline border/text
    secondary: cn(
      "shadow-[inset_0_0_0_1rem_var(--orange-500)] text-[var(--orange-500)]",
      "dark:shadow-[inset_0_0_0_1rem_var(--orange-300)] dark:text-[var(--orange-300)]",
    ),
    warning: cn(
      "shadow-[inset_0_0_0_1rem_var(--yellow-400)] text-[var(--yellow-400)]",
      "dark:shadow-[inset_0_0_0_1rem_var(--yellow-300)] dark:text-[var(--yellow-300)]",
    ),
    grayscale: cn(
      "shadow-[inset_0_0_0_1rem_var(--color-border-strong)] text-[var(--color-text-placeholder)]",
    ),
  },
  // dot-accent: 점과 레이블 모두 intent 색상
  "dot-accent": {
    primary: cn("text-[var(--color-text-brand)]"),
    success: cn("text-[var(--color-text-success)]"),
    error: cn("text-[var(--color-text-danger)]"),
    // TODO: 시맨틱 토큰 미정의 — secondary(orange), warning(yellow) dot-accent 전용 토큰 없음. 프리미티브 유지.
    secondary: cn("text-[var(--orange-500)]", "dark:text-[var(--orange-300)]"),
    warning: cn("text-[var(--yellow-400)]", "dark:text-[var(--yellow-300)]"),
    grayscale: cn("text-[var(--color-text-placeholder)]"),
  },
  // dot-neutral: 레이블은 secondary(gs-800/gs-100), 점은 intent 색상 (dotNeutralColorStyles로 override)
  "dot-neutral": {
    primary: cn("text-[var(--color-text-secondary)]"),
    success: cn("text-[var(--color-text-secondary)]"),
    error: cn("text-[var(--color-text-secondary)]"),
    secondary: cn("text-[var(--color-text-secondary)]"),
    warning: cn("text-[var(--color-text-secondary)]"),
    grayscale: cn("text-[var(--color-text-secondary)]"),
  },
};

// dot-neutral에서 점 자체의 색상 (wrapper text가 subtle이므로 별도 override)
const dotNeutralColorStyles: Record<BadgeColor, string> = {
  primary: "text-[var(--color-text-brand)]",
  success: "text-[var(--color-text-success)]",
  error: "text-[var(--color-text-danger)]",
  secondary: cn("text-[var(--orange-500)]", "dark:text-[var(--orange-300)]"),
  warning: cn("text-[var(--yellow-400)]", "dark:text-[var(--yellow-300)]"),
  grayscale: "text-[var(--color-text-placeholder)]",
};

/**
 * 라벨 뱃지 컴포넌트
 *
 * 상태나 카테고리를 표시하는 라벨 형태의 뱃지입니다.
 * Round Square / Cylinder 형태, Solid / Solid-Pastel / Outline / Dot-Accent / Dot-Neutral 스타일,
 * 6가지 색상과 XL(36) ~ XS(20) 5단계 크기, 다크모드를 지원합니다.
 *
 * @example
 * <Badge label="뱃지" color="primary" variant="solid" />
 * <Badge label="온라인" color="success" variant="dot-accent" />
 */
export const Badge = ({
  label,
  shape = "round-square",
  variant = "solid",
  color = "primary",
  size = "md",
  leftIcon,
  className,
}: BadgeProps) => {
  // 사이즈별 height / padding / gap / typography / (round-square용) radius — 모든 variant 공통
  const sizeStyles: Record<BadgeSize, string> = {
    xl: "typo-text-lg px-[14rem] h-[36rem] rounded-[6rem] gap-[8rem]",
    lg: "typo-text-md px-[12rem] h-[32rem] rounded-[4rem] gap-[6rem]",
    md: "typo-text-md px-[10rem] h-[28rem] rounded-[4rem] gap-[4rem]",
    sm: "typo-text-sm px-[8rem]  h-[24rem] rounded-[4rem] gap-[4rem]",
    xs: "typo-text-sm px-[6rem]  h-[20rem] rounded-[4rem] gap-[4rem]",
  };

  // leftIcon 사이즈: XL은 20rem, LG/MD는 16rem, 그 외는 12rem
  const iconSizeStyles: Record<BadgeSize, string> = {
    xl: "size-[20rem]",
    lg: "size-[16rem]",
    md: "size-[16rem]",
    sm: "size-[12rem]",
    xs: "size-[12rem]",
  };

  // IconDot size prop — 배지 사이즈별 고정값 (두 dot variant 공통, Figma 슬롯 기준)
  const dotIconSize: Record<BadgeSize, IconSize> = {
    xl: 20,
    lg: 16,
    md: 16,
    sm: 12,
    xs: 12,
  };

  const isDotVariant = variant === "dot-accent" || variant === "dot-neutral";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-normal",
        sizeStyles[size],
        shape === "cylinder" && cylinderRadius,
        badgeColorStyles[variant][color],
        className,
      )}
    >
      {/* dot 변형: IconDot 렌더링 (fill=currentColor로 text 색상 상속, dot-neutral은 별도 색상 override) */}
      {isDotVariant && (
        <IconDot
          size={dotIconSize[size]}
          className={cn(variant === "dot-neutral" && dotNeutralColorStyles[color])}
        />
      )}
      {/* solid / solid-pastel / outline 변형: 왼쪽 아이콘 */}
      {!isDotVariant && leftIcon && (
        <span
          className={cn(
            "flex-shrink-0 flex items-center justify-center [&>*]:w-full [&>*]:h-full",
            iconSizeStyles[size],
          )}
        >
          {leftIcon}
        </span>
      )}
      {label}
    </span>
  );
};
