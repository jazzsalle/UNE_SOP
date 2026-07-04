import { cn } from "@/utils/cn";
import type { CardHeaderProps } from "../types";

export const CardHeader = ({
  title,
  subtitle,
  badge,
  actions,
  divider = false,
  className,
}: CardHeaderProps) => {
  return (
    <div
      className={cn(
        "flex items-center px-[20rem] py-[12rem] w-full shrink-0 box-border",
        divider && "border-b border-[var(--color-border-default)]",
        className,
      )}
    >
      {/* 헤더 콘텐츠 (배지 + 제목행 + 부제목) */}
      <div className="flex flex-col gap-[4rem] items-start justify-center flex-1 min-w-0">
        {badge && <div className="shrink-0">{badge}</div>}

        {/* 제목 + 우측 액션 버튼 행 */}
        <div className="flex gap-[8rem] items-start w-full">
          <div className="flex-1 min-w-0 typo-text-lg font-medium text-[var(--color-text-default)] truncate">
            {title}
          </div>
          {actions && (
            <div className="flex gap-[8rem] items-start shrink-0">{actions}</div>
          )}
        </div>

        {subtitle && (
          <div className="typo-text-sm text-[var(--color-text-secondary)] w-full">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
