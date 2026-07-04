import { cn } from "@/utils/cn";
import { IconCheck } from "@/components/Icons";
import {
  listItemBase,
  listItemInteractiveStyles,
  listItemDefaultTextStyles,
  listItemSelectedTextStyles,
  listItemDisabledStyles,
  listItemSizeStyles,
  listItemTypoStyles,
  listCheckboxStyles,
  listItemIconSizeStyles,
  listItemIconWrapperStyles,
} from "../styles";
import type { ListItemProps } from "../types";

export const ListItem = ({
  option,
  selected = false,
  size = "md",
  showCheckbox = false,
  onSelect,
  className,
}: ListItemProps) => {
  // 선택 이벤트 핸들러 (비활성화 시 무시)
  const handleSelect = () => {
    if (!option.disabled) onSelect?.(option.value);
  };

  const disabled = !!option.disabled;
  const { box, iconSize } = listCheckboxStyles[size];

  return (
    <div
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        listItemBase,
        listItemSizeStyles[size],
        listItemTypoStyles[size],
        disabled
          ? listItemDisabledStyles
          : cn(
              listItemInteractiveStyles,
              selected ? listItemSelectedTextStyles : listItemDefaultTextStyles,
            ),
        className,
      )}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelect();
        }
      }}
    >
      {/* 체크박스 시각 표시 (선택 상태 전용, 자체 이벤트 없음) */}
      {showCheckbox && (
        <span
          aria-hidden="true"
          className={cn(
            "flex-shrink-0 inline-flex items-center justify-center",
            "border-[1rem] transition-colors",
            box,
            disabled
              ? "bg-[var(--color-bg-disabled)] border-[var(--color-border-disabled)]"
              : selected
              ? "bg-[var(--color-interactive-brand)] border-[var(--color-interactive-brand)]"
              : "border-[var(--color-control-border)]",
          )}
        >
          {selected && (
            <IconCheck
              size={iconSize}
              className={disabled ? "text-[var(--color-text-disabled)]" : "text-white"}
            />
          )}
        </span>
      )}

      {/* 왼쪽 아이콘 */}
      {option.leftIcon && (
        <span
          className={cn(
            listItemIconWrapperStyles,
            listItemIconSizeStyles[size],
            disabled
              ? "text-[var(--color-icon-disabled)]"
              : selected
              ? "text-[var(--color-icon-brand)]"
              : "text-[var(--color-icon-default)]",
          )}
        >
          {option.leftIcon}
        </span>
      )}

      {/* 레이블 */}
      <span className="flex-1 min-w-0 truncate">{option.label}</span>

      {/* 보조 텍스트 */}
      {option.helperText && (
        <span className="text-[var(--color-text-disabled)] shrink-0 whitespace-nowrap">
          {option.helperText}
        </span>
      )}

      {/* 오른쪽 아이콘 */}
      {option.rightIcon && (
        <span
          className={cn(
            listItemIconWrapperStyles,
            listItemIconSizeStyles[size],
            disabled
              ? "text-[var(--color-icon-disabled)]"
              : selected
              ? "text-[var(--color-icon-brand)]"
              : "text-[var(--color-icon-default)]",
          )}
        >
          {option.rightIcon}
        </span>
      )}
    </div>
  );
};
