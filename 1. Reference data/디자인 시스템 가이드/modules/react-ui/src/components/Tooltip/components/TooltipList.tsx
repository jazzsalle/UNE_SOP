import { listContainerStyles, listItemStyles } from "../styles";
import type { TooltipListItem } from "../types";

interface TooltipListProps {
  items: TooltipListItem[];
}

export const TooltipList = ({ items }: TooltipListProps) => (
  <div className={listContainerStyles}>
    {/* 리스트 항목 */}
    {items.map((item, index) => (
      <div key={index} className={listItemStyles}>
        <span className="flex-shrink-0 mt-[1rem]">{item.icon}</span>
        <span>{item.text}</span>
      </div>
    ))}
  </div>
);
