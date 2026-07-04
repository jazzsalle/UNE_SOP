import type { ComponentProps, ReactNode } from "react";

export type CardVariant = "vertical" | "horizontal";
export type CardStyle = "elevated" | "fill" | "outline";

export interface CardProps extends Omit<ComponentProps<"div">, "onClick"> {
  /** 레이아웃 방향 @default "vertical" */
  variant?: CardVariant;
  /** 시각적 스타일 @default "elevated" */
  cardStyle?: CardStyle;
  /** 선택 상태 @default false */
  selected?: boolean;
  /** 비활성화 @default false */
  disabled?: boolean;
  /** 카드 전체 클릭 핸들러 (제공 시 인터랙티브 상태 활성화) */
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export interface CardHeaderProps {
  /** 제목 */
  title: ReactNode;
  /** 부제목 */
  subtitle?: ReactNode;
  /** 배지 슬롯 (title 위에 표시) */
  badge?: ReactNode;
  /** 우측 액션 영역 (IconButton 등) */
  actions?: ReactNode;
  /** 하단 구분선 @default false */
  divider?: boolean;
  className?: string;
}

export interface CardBodyProps extends ComponentProps<"div"> {
  /** 하단 구분선 @default false */
  divider?: boolean;
  children?: ReactNode;
}

export interface CardFooterProps extends ComponentProps<"div"> {
  children?: ReactNode;
}

export interface CardMediaProps extends ComponentProps<"div"> {
  children?: ReactNode;
}
