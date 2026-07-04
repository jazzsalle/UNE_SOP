import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconEqualCircle = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M16 13C16.5523 13 17 13.4477 17 14C17 14.5523 16.5523 15 16 15H8C7.44772 15 7 14.5523 7 14C7 13.4477 7.44772 13 8 13H16Z" fill={pathFill ?? "currentColor"}/>
      <path d="M16 9C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H8C7.44772 11 7 10.5523 7 10C7 9.44772 7.44772 9 8 9H16Z" fill={pathFill ?? "currentColor"}/>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconEqualCircle.displayName = "IconEqualCircle";
