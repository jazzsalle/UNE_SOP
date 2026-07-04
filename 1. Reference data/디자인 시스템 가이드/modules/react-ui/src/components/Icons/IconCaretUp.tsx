import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconCaretUp = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M13.1648 8.52174L17.4913 13.0435C18.0182 13.5942 18.1358 14.2243 17.844 14.9339C17.5534 15.6446 17.0337 16 16.2849 16L7.71515 16C6.96634 16 6.44661 15.6446 6.15596 14.9339C5.8642 14.2243 5.98179 13.5942 6.50873 13.0435L10.8352 8.52174C11.0016 8.34783 11.1819 8.21739 11.376 8.13044C11.5701 8.04348 11.7781 8 12 8C12.2219 8 12.4299 8.04348 12.624 8.13044C12.8181 8.21739 12.9984 8.34783 13.1648 8.52174Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconCaretUp.displayName = "IconCaretUp";
