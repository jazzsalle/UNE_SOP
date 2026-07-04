import type { SVGProps } from "react";

export type IconSize = 12 | 16 | 20 | 24 | 28 | 32 | 36 | 40;

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** 아이콘 크기 (px = rem) @default 24 */
  size?: IconSize;
  /** SVG path 요소의 fill 색상 @default "currentColor" */
  pathFill?: string;
  className?: string;
}
