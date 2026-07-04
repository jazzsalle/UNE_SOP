import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconCaretDown = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M10.8352 15.4783L6.50873 10.9565C5.98179 10.4058 5.8642 9.77565 6.15596 9.06609C6.44661 8.35536 6.96634 8 7.71515 8H16.2849C17.0337 8 17.5534 8.35536 17.844 9.06609C18.1358 9.77565 18.0182 10.4058 17.4913 10.9565L13.1648 15.4783C12.9984 15.6522 12.8181 15.7826 12.624 15.8696C12.4299 15.9565 12.2219 16 12 16C11.7781 16 11.5701 15.9565 11.376 15.8696C11.1819 15.7826 11.0016 15.6522 10.8352 15.4783Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconCaretDown.displayName = "IconCaretDown";
