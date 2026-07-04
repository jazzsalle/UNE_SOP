import type { ReactNode } from "react";
import type { SelectSize, SelectIntent, SelectVariant } from "./styles";
import type { DroplistOption, DroplistGroup } from "@/components/Droplist";

export type { SelectSize, SelectIntent, SelectVariant };

// Select의 옵션/그룹은 공통 Droplist 타입을 그대로 사용.
// 기존 이름(SelectOption/SelectGroup)은 별칭으로 유지해 backward compat 보장.
export type SelectOption = DroplistOption;
export type SelectGroup = DroplistGroup;

export interface SelectProps {
  /** 셀렉트 variant @default "standard" */
  variant?: SelectVariant;
  /** 셀렉트 크기 @default "lg" */
  size?: SelectSize;
  /** 유효성 검증 의도 @default "none" */
  intent?: SelectIntent;
  /** 옵션 목록 (flat 또는 grouped) */
  options?: SelectOption[];
  /** 그룹 옵션 목록 */
  groups?: SelectGroup[];
  /** 선택된 값 (제어 모드) */
  value?: string;
  /** 기본 선택 값 (비제어 모드) */
  defaultValue?: string;
  /** 값 변경 콜백 */
  onChange?: (value: string) => void;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 라벨 텍스트 */
  label?: string;
  /** 하단 안내/결과 메시지 */
  helperText?: string;
  /**
   * 에러 메시지 (truthy이면 에러 상태)
   * @deprecated intent="error"와 helperText를 사용하세요
   */
  error?: string | boolean;
  /** 비활성화 */
  disabled?: boolean;
  /** 왼쪽 아이콘 */
  leftIcon?: ReactNode;
  /** 드롭다운 포털 z-index @default 50 */
  zIndex?: number;
  /** 추가 className */
  className?: string;
}
