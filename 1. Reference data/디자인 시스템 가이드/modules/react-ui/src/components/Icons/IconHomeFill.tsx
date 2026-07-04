import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconHomeFill = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M5.14125 22C4.51253 22 3.97431 21.7762 3.52658 21.3286C3.07886 20.881 2.855 20.3429 2.855 19.7143V9.42857C2.855 9.06667 2.93597 8.72381 3.09791 8.4C3.25985 8.07619 3.48371 7.80952 3.7695 7.6L10.6282 2.45714C10.8378 2.30476 11.0569 2.19048 11.2855 2.11429C11.5142 2.0381 11.7523 2 12 2C12.2477 2 12.4858 2.0381 12.7144 2.11429C12.9431 2.19048 13.1622 2.30476 13.3717 2.45714L20.2305 7.6C20.5163 7.80952 20.7401 8.07619 20.9021 8.4C21.064 8.72381 21.145 9.06667 21.145 9.42857V19.7143C21.145 20.3429 20.9211 20.881 20.4734 21.3286C20.0257 21.7762 19.4875 22 18.8587 22H14.2862V14H9.71375V22H5.14125Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconHomeFill.displayName = "IconHomeFill";
