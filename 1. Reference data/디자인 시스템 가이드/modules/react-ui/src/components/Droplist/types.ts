import type { CSSProperties, ReactNode } from "react";

export interface DroplistConfig {
  /** 이 레벨 드롭리스트의 너비 (number → px, string → CSS 값) */
  width?: number | string;
  /** 하위 드롭리스트 config. 미지정 시 현재 config를 상속 */
  children?: DroplistConfig;
}

export interface DroplistOption {
  /** 옵션 값 */
  value: string;
  /** 옵션 표시 텍스트 */
  label: string;
  /** 왼쪽 아이콘 */
  leftIcon?: ReactNode;
  /** 오른쪽 아이콘 (children이 있으면 자동으로 IconChevronRight 적용) */
  rightIcon?: ReactNode;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 하위 옵션 — hover 시 우측에 서브 Droplist로 자동 표시 */
  children?: DroplistOption[];
}

export interface DroplistGroup {
  /** 그룹 라벨 */
  label: string;
  /** 그룹 내 옵션 목록 */
  options: DroplistOption[];
}

export interface DroplistProps {
  /** 옵션 목록 (flat) */
  options?: DroplistOption[];
  /** 그룹 옵션 목록. 제공 시 options 대신 이것을 렌더. */
  groups?: DroplistGroup[];
  /** 현재 선택된 값 */
  value?: string;
  /** 값 선택 콜백 */
  onSelect?: (value: string) => void;
  /** role 속성. 접근성 컨텍스트에 맞게 변경 가능 @default "listbox" */
  role?: string;
  /** 추가 className */
  className?: string;
  /** 인라인 스타일 (Portal/fixed positioning 등에 사용) */
  style?: CSSProperties;
  /** 너비 등 레이아웃 설정. 하위 드롭리스트 설정은 children 필드로 전달 */
  config?: DroplistConfig;
}

