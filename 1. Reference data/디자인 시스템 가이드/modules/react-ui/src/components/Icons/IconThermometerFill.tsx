import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconThermometerFill = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M15 13V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V13C7.79 13.91 7 15.37 7 17C7 19.76 9.24 22 12 22C14.76 22 17 19.76 17 17C17 15.37 16.21 13.91 15 13ZM11 11V5C11 4.45 11.45 4 12 4C12.55 4 13 4.45 13 5V6H12V7H13V8V9H12V10H13V11H11Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconThermometerFill.displayName = "IconThermometerFill";
