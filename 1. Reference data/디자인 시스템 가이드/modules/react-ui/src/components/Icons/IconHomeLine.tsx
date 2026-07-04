import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconHomeLine = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, pathFill, className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}rem`}
      height={`${size}rem`}
      viewBox="0 0 32 32"
      fill="none"
      className={cn("inline-block flex-shrink-0", className)}
      {...props}
    >
      <path d="M6.85713 26.2857H11.4286V17.1428H20.5714V26.2857H25.1428V12.5714L16 5.71428L6.85713 12.5714V26.2857ZM6.85713 29.3333C6.01903 29.3333 5.30183 29.0352 4.70551 28.4388C4.10818 27.8415 3.80951 27.1238 3.80951 26.2857V12.5714C3.80951 12.0889 3.9177 11.6317 4.13408 11.2C4.34945 10.7682 4.6476 10.4127 5.02856 10.1333L14.1714 3.27618C14.4508 3.07301 14.7428 2.92062 15.0476 2.81904C15.3524 2.71745 15.6698 2.66666 16 2.66666C16.3301 2.66666 16.6476 2.71745 16.9524 2.81904C17.2571 2.92062 17.5492 3.07301 17.8286 3.27618L26.9714 10.1333C27.3524 10.4127 27.651 10.7682 27.8674 11.2C28.0828 11.6317 28.1905 12.0889 28.1905 12.5714V26.2857C28.1905 27.1238 27.8923 27.8415 27.296 28.4388C26.6987 29.0352 25.9809 29.3333 25.1428 29.3333H17.5238V20.1905H14.4762V29.3333H6.85713Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconHomeLine.displayName = "IconHomeLine";
