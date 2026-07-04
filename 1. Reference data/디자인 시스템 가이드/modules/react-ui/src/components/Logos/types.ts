import type { SVGProps } from "react";

export type LogoSize = 12 | 16 | 20 | 24 | 28 | 32 | 36 | 40;

export interface LogoProps extends SVGProps<SVGSVGElement> {
  /** 로고 크기 (px = rem) @default 24 */
  size?: LogoSize;
  className?: string;
}
