import { cn } from "@/utils/cn";

type BadgeDotVariant = "primary" | "new";
type BadgeDotSize = "xl" | "lg" | "md" | "sm";

export interface BadgeDotProps {
  /** 점 스타일 @default "primary" */
  variant?: BadgeDotVariant;
  /** 점 크기 @default "md" */
  size?: BadgeDotSize;
  className?: string;
}

/**
 * 점 형태 뱃지
 *
 * 알림이나 새로운 콘텐츠가 있음을 나타내는 작은 점 표시입니다.
 *
 * @example
 * <BadgeDot variant="primary" size="md" />
 */
export const BadgeDot = ({
  variant = "primary",
  size = "md",
  className,
}: BadgeDotProps) => {
  const sizeStyles: Record<BadgeDotSize, string> = {
    xl: "size-[8rem]",
    lg: "size-[6rem]",
    md: "size-[4rem]",
    sm: "size-[2rem]",
  };

  const variantStyles: Record<BadgeDotVariant, string> = {
    primary: cn("bg-[var(--color-bg-brand)]"),
    // TODO: 시맨틱 토큰 미정의 — "new" dot (orange) 전용 시맨틱 토큰 없음. 프리미티브 유지.
    new: cn("bg-[var(--orange-500)]", "dark:bg-[var(--orange-300)]"),
  };

  return (
    <span
      className={cn(
        "inline-block rounded-full flex-shrink-0",
        sizeStyles[size],
        variantStyles[variant],
        className,
      )}
    />
  );
};
