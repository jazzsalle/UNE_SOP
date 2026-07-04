import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconPin = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M16 11L18 13V15H13V21L12 22L11 21V15H6V13L8 11V4H7V2H17V4H16V11ZM8.85 13H15.15L14 11.85V4H10V11.85L8.85 13Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconPin.displayName = "IconPin";
