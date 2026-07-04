import type { ReactNode } from "react";

export type ListSize = "lg" | "md" | "sm";

export interface ListItemOption {
  /** 옵션 식별자 */
  value: string;
  /** 표시 텍스트 */
  label: string;
  /** 보조 텍스트 */
  helperText?: string;
  /** 왼쪽 아이콘 */
  leftIcon?: ReactNode;
  /** 오른쪽 아이콘 */
  rightIcon?: ReactNode;
  /** 비활성화 여부 */
  disabled?: boolean;
}

export interface ListItemProps {
  /** 옵션 데이터 */
  option: ListItemOption;
  /** 선택 상태 */
  selected?: boolean;
  /** 아이템 크기 @default "md" */
  size?: ListSize;
  /** 체크박스 표시 여부 */
  showCheckbox?: boolean;
  /** 값 선택 콜백 */
  onSelect?: (value: string) => void;
  /** 추가 className */
  className?: string;
}
