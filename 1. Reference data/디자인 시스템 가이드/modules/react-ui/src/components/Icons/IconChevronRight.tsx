import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconChevronRight = forwardRef<SVGSVGElement, IconProps>(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M7.28221 2.3156C7.79827 1.85705 8.58835 1.90366 9.04691 2.41972L16.8219 11.1697C17.2427 11.6433 17.2427 12.3567 16.8219 12.8303L9.04691 21.5803C8.58835 22.0963 7.79827 22.143 7.28221 21.6844C6.76615 21.2258 6.71954 20.4358 7.17809 19.9197L14.2153 12L7.17809 4.0803C6.71954 3.56424 6.76615 2.77416 7.28221 2.3156Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconChevronRight.displayName = "IconChevronRight";
