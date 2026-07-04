import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconMonitoringFill = forwardRef<SVGSVGElement, IconProps>(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M20 2C21.1046 2 22 2.89543 22 4V15C22 16.1046 21.1046 17 20 17H13V20H17C17.2652 20 17.5195 20.1055 17.707 20.293C17.8945 20.4804 17.9999 20.7349 18 21C18 21.2652 17.8945 21.5195 17.707 21.707C17.5195 21.8946 17.2652 22 17 22H7C6.73478 22 6.4805 21.8946 6.29297 21.707C6.10551 21.5195 6 21.2652 6 21C6.00006 20.7349 6.10549 20.4804 6.29297 20.293C6.48049 20.1055 6.73484 20 7 20H11V17H4C2.89543 17 2 16.1046 2 15V4C2 2.89543 2.89543 2 4 2H20ZM8 6C7.44772 6 7 6.44772 7 7V12C7 12.5523 7.44772 13 8 13C8.55228 13 9 12.5523 9 12V7C9 6.44772 8.55228 6 8 6ZM12 9C11.4477 9 11 9.44772 11 10V12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12V10C13 9.44772 12.5523 9 12 9ZM16 8C15.4477 8 15 8.44772 15 9V12C15 12.5523 15.4477 13 16 13C16.5523 13 17 12.5523 17 12V9C17 8.44772 16.5523 8 16 8Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconMonitoringFill.displayName = "IconMonitoringFill";
