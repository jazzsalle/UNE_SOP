import type { ReactNode, ComponentProps } from "react";

export type NonModalSize = "sm" | "md" | "lg";

export interface NonModalProps extends Omit<ComponentProps<"div">, "title"> {
  /** 열림 여부 */
  open: boolean;
  /** 닫힘 콜백 */
  onClose: () => void;
  /** 제목 (드래그 핸들 역할) */
  title?: ReactNode;
  /** 크기 @default "md" */
  size?: NonModalSize;
  /** ESC 키로 닫기 허용 @default true */
  closeOnEsc?: boolean;
  /** 하단 액션 영역 */
  footer?: ReactNode;
  /** 닫기 버튼 표시 @default true */
  showCloseButton?: boolean;
  /** 드래그 이동 허용 @default true */
  draggable?: boolean;
}
