import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconCheck = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M8.41256 15.3857L18.9955 4.80272C19.3244 4.47387 19.7429 4.30945 20.2511 4.30945C20.7593 4.30945 21.1779 4.47387 21.5067 4.80272C21.8356 5.13157 22 5.5501 22 6.05833C22 6.56655 21.8356 6.98508 21.5067 7.31393L9.66816 19.1525C9.30942 19.5112 8.89088 19.6906 8.41256 19.6906C7.93423 19.6906 7.5157 19.5112 7.15695 19.1525L2.49327 14.4888C2.16442 14.16 2 13.7414 2 13.2332C2 12.725 2.16442 12.3065 2.49327 11.9776C2.82212 11.6488 3.24066 11.4843 3.74888 11.4843C4.2571 11.4843 4.67564 11.6488 5.00448 11.9776L8.41256 15.3857Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconCheck.displayName = "IconCheck";
