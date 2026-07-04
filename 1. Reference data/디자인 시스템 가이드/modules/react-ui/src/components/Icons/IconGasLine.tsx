import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconGasLine = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M12 11.75C14.05 14.13 14.5 14.45 14.5 15.54C14.5 16.9 13.38 18 12 18C10.62 18 9.50002 16.9 9.5 15.54C9.5 14.46 9.93 14.15 12 11.75Z" fill={pathFill ?? "currentColor"}/>
      <path d="M16 8V10H8V8H16Z" fill={pathFill ?? "currentColor"}/>
      <path fillRule="evenodd" clipRule="evenodd" d="M11 4H13V2H15V4H16C18.21 4 20 5.79 20 8V18C20 20.21 18.21 22 16 22H8C5.79 22 4 20.21 4 18V8C4 5.79 5.79 4 8 4H9V2H11V4ZM8 6C6.9 6 6 6.9 6 8V18C6 19.1 6.9 20 8 20H16C17.1 20 18 19.1 18 18V8C18 6.9 17.1 6 16 6H8Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconGasLine.displayName = "IconGasLine";
