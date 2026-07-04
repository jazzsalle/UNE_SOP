import { cn } from "@/utils/cn";
import { IconButton } from "@/components/buttons/IconButton";
import { IconX } from "@/components/Icons/IconX";
import type { TooltipContentProps } from "../types";
import {
  tooltipBaseStyles,
  sizeStyles,
  getArrowStyles,
  closeButtonWrapperStyles,
} from "../styles";

export const TooltipContent = ({
  content,
  size,
  direction,
  arrow,
  showCloseButton,
  icon,
  onClose,
  tooltipRef,
  zIndex,
  onMouseEnter,
  onMouseLeave,
}: TooltipContentProps) => {
  return (
    <div
      ref={tooltipRef}
      role="tooltip"
      style={{ zIndex, visibility: "hidden" }}
      className={cn(tooltipBaseStyles, sizeStyles[size])}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 화살표 */}
      <div className={getArrowStyles(direction, arrow)} />

      <div className="flex items-start gap-[8rem]">
        {/* 아이콘 */}
        {icon && (
          <span className="flex-shrink-0 mt-[1rem]">
            {icon}
          </span>
        )}
        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0 break-words">{content}</div>
        {/* 닫기 버튼 */}
        {showCloseButton && (
          <div className={closeButtonWrapperStyles}>
            <IconButton
              variant="ghost"
              color="grayscale"
              size="4xs"
              icon={<IconX size={16} />}
              onClick={onClose}
              className="text-[var(--color-text-default)] hover:bg-black/10 dark:hover:bg-white/20"
              aria-label="닫기"
            />
          </div>
        )}
      </div>
    </div>
  );
};
