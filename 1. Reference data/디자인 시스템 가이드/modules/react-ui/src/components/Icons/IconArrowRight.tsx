import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconArrowRight = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, pathFill, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}rem`}
      height={`${size}rem`}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("inline-block flex-shrink-0", className)}
      {...props}
    >
      <path d="M17.634 13.2925H3.28411C2.92028 13.2925 2.6153 13.1694 2.36918 12.9233C2.12306 12.6772 2 12.3722 2 12.0083C2 11.6445 2.12306 11.3395 2.36918 11.0934C2.6153 10.8473 2.92028 10.7242 3.28411 10.7242H17.634L11.3419 4.4321C11.0851 4.17528 10.962 3.87566 10.9727 3.53323C10.9834 3.1908 11.1172 2.89117 11.374 2.63435C11.6308 2.39893 11.9304 2.27587 12.2729 2.26517C12.6153 2.25447 12.9149 2.37753 13.1717 2.63435L21.6469 11.1095C21.7753 11.2379 21.8662 11.377 21.9197 11.5268C21.9732 11.6766 22 11.8371 22 12.0083C22 12.1796 21.9732 12.3401 21.9197 12.4899C21.8662 12.6397 21.7753 12.7788 21.6469 12.9072L13.1717 21.3823C12.9363 21.6178 12.6421 21.7355 12.2889 21.7355C11.9358 21.7355 11.6308 21.6178 11.374 21.3823C11.1172 21.1255 10.9888 20.8205 10.9888 20.4674C10.9888 20.1143 11.1172 19.8093 11.374 19.5525L17.634 13.2925Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconArrowRight.displayName = "IconArrowRight";
