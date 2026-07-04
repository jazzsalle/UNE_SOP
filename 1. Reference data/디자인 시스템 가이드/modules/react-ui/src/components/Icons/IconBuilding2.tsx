import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconBuilding2 = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M4 21C3.45 21 2.97933 20.8043 2.588 20.413C2.196 20.021 2 19.55 2 19V5C2 4.45 2.196 3.979 2.588 3.587C2.97933 3.19567 3.45 3 4 3H10C10.55 3 11.021 3.19567 11.413 3.587C11.8043 3.979 12 4.45 12 5V7H20C20.55 7 21.021 7.19567 21.413 7.587C21.8043 7.979 22 8.45 22 9V19C22 19.55 21.8043 20.021 21.413 20.413C21.021 20.8043 20.55 21 20 21H4ZM4 19H6V17H4V19ZM4 15H6V13H4V15ZM4 11H6V9H4V11ZM4 7H6V5H4V7ZM8 19H10V17H8V19ZM8 15H10V13H8V15ZM8 11H10V9H8V11ZM8 7H10V5H8V7ZM12 19H20V9H12V11H14V13H12V15H14V17H12V19ZM16 13V11H18V13H16ZM16 17V15H18V17H16Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconBuilding2.displayName = "IconBuilding2";
