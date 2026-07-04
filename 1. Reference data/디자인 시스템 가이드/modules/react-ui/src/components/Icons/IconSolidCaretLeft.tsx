import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconSolidCaretLeft = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M17.708 2.27826C18.2459 1.92865 18.7904 1.90848 19.3417 2.21775C19.8931 2.52702 20.1687 3.00436 20.1687 3.64979L20.1687 20.3502C20.1687 20.9956 19.8931 21.473 19.3417 21.7823C18.7904 22.0915 18.2459 22.0713 17.708 21.7217L4.55744 13.3715C4.07337 13.0488 3.83133 12.5916 3.83133 12C3.83133 11.4084 4.07337 10.9512 4.55744 10.6285L17.708 2.27826ZM16.9416 6.59455L8.47034 12L16.9416 17.4054L16.9416 6.59455Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconSolidCaretLeft.displayName = "IconSolidCaretLeft";
