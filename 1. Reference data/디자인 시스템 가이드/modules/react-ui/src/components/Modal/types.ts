import type { ReactNode, ComponentProps } from "react";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
export type ModalIntent = "none" | "info" | "success" | "warning" | "delete";

export interface ModalProps extends Omit<ComponentProps<"div">, "title"> {
  /** 모달 열림 여부 */
  open: boolean;
  /** 닫힘 콜백 */
  onClose: () => void;
  /** 모달 제목 */
  title?: ReactNode;
  /** 의도 아이콘 표시 @default "none" */
  intent?: ModalIntent;
  /** 백드롭 클릭으로 닫기 허용 @default true */
  closeOnBackdrop?: boolean;
  /** ESC 키로 닫기 허용 @default true */
  closeOnEsc?: boolean;
  /** 하단 액션 영역 */
  footer?: ReactNode;
}
