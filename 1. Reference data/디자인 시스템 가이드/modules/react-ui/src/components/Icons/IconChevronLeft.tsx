import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconChevronLeft = forwardRef<SVGSVGElement, IconProps>(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M16.7178 2.3156C17.2338 2.77416 17.2804 3.56424 16.8219 4.0803L9.78466 12L16.8219 19.9197C17.2804 20.4358 17.2338 21.2258 16.7178 21.6844C16.2017 22.143 15.4116 22.0963 14.9531 21.5803L7.17808 12.8303C6.75729 12.3567 6.75729 11.6433 7.17808 11.1697L14.9531 2.41972C15.4116 1.90366 16.2017 1.85705 16.7178 2.3156Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconChevronLeft.displayName = "IconChevronLeft";
