import type { ReactNode } from "react";

/** 세그먼트 크기 */
export type SegmentedSize = "sm" | "md" | "lg";

/** 세그먼트 옵션 항목 */
export type SegmentedOption<T extends string> = {
  /** 옵션 값 */
  value: T;
  /** 표시 라벨 (텍스트 또는 ReactNode) */
  label: ReactNode;
  /** 개별 옵션 비활성화 */
  disabled?: boolean;
};
