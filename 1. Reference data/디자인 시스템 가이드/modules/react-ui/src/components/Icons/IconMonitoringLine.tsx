import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconMonitoringLine = forwardRef<SVGSVGElement, IconProps>(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H20C20.5304 2 21.0391 2.21071 21.4142 2.58579C21.7893 2.96086 22 3.46957 22 4V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H13V20H17C17.5523 20 18 20.4477 18 21C18 21.5523 17.5523 22 17 22H7C6.44772 22 6 21.5523 6 21C6 20.4477 6.44772 20 7 20H11V18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V4C2 3.46957 2.21071 2.96086 2.58579 2.58579ZM20 16V4L4 4V16H20ZM8 6C8.55228 6 9 6.44772 9 7V12C9 12.5523 8.55228 13 8 13C7.44772 13 7 12.5523 7 12V7C7 6.44772 7.44772 6 8 6ZM16 8C16.5523 8 17 8.44772 17 9V12C17 12.5523 16.5523 13 16 13C15.4477 13 15 12.5523 15 12V9C15 8.44772 15.4477 8 16 8ZM12 9C12.5523 9 13 9.44772 13 10V12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12V10C11 9.44772 11.4477 9 12 9Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconMonitoringLine.displayName = "IconMonitoringLine";
