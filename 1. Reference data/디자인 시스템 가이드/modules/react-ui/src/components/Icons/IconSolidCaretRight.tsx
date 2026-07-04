import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconSolidCaretRight = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M6.29199 21.7217C5.75413 22.0714 5.20955 22.0915 4.65825 21.7823C4.10695 21.473 3.8313 20.9956 3.8313 20.3502V3.64979C3.8313 3.00436 4.10695 2.52702 4.65825 2.21775C5.20955 1.90848 5.75413 1.92865 6.29199 2.27826L19.4426 10.6285C19.9266 10.9512 20.1687 11.4084 20.1687 12C20.1687 12.5916 19.9266 13.0488 19.4426 13.3715L6.29199 21.7217ZM7.05843 17.4055L15.5297 12L7.05843 6.59455V17.4055Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconSolidCaretRight.displayName = "IconSolidCaretRight";
