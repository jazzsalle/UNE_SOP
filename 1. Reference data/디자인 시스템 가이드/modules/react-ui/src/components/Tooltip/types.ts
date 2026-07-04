import type { ReactNode, ComponentProps } from "react";

export interface TooltipListItem {
  /** 리스트 항목 텍스트 */
  text: string;
  /** 리스트 항목 아이콘 (선택) */
  icon?: ReactNode;
}

export type TooltipSize = "sm" | "lg";
export type TooltipDirection = "top" | "bottom" | "left" | "right";
export type TooltipArrow = "start" | "center" | "end";
export type TooltipTrigger = "hover" | "click";

export interface TooltipProps extends Omit<ComponentProps<"div">, "content"> {
  /** 툴팁 콘텐츠 (텍스트 또는 ReactNode) */
  content: ReactNode;
  /** 크기 @default "sm" */
  size?: TooltipSize;
  /** 툴팁 방향 @default "top" */
  direction?: TooltipDirection;
  /** 화살표 위치 @default "center" */
  arrow?: TooltipArrow;
  /** 트리거 방식 @default "hover" */
  trigger?: TooltipTrigger;
  /** 닫기 버튼 표시 여부 (click 트리거 시 자동 true) */
  showCloseButton?: boolean;
  /** 상태 아이콘 (전달 시 아이콘 표시) */
  icon?: ReactNode;
  /** 트리거와 툴팁 사이 간격 (rem 단위) @default 4 */
  gap?: number;
  /** 툴팁 z-index @default 70 */
  zIndex?: number;
  /** 외부에서 열림 상태 제어 */
  open?: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  /** 툴팁을 감쌀 트리거 요소 */
  children: ReactNode;
}

export interface TooltipContentProps {
  content: ReactNode;
  size: TooltipSize;
  direction: TooltipDirection;
  arrow: TooltipArrow;
  showCloseButton: boolean;
  icon?: ReactNode;
  onClose: () => void;
  tooltipRef?: React.Ref<HTMLDivElement>;
  zIndex: number;
  /** hover 트리거 시 툴팁 위 마우스 진입 핸들러 */
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  /** hover 트리거 시 툴팁 위 마우스 이탈 핸들러 */
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
}
