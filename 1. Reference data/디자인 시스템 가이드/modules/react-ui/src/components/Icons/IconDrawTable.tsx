import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconDrawTable = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M2 19.7778V4.22222C2 3.61111 2.21741 3.08778 2.65222 2.65222C3.08778 2.21741 3.61111 2 4.22222 2H19.7778C20.3889 2 20.9122 2.21741 21.3478 2.65222C21.7826 3.08778 22 3.61111 22 4.22222V19.7778C22 20.3889 21.7826 20.9122 21.3478 21.3478C20.9122 21.7826 20.3889 22 19.7778 22H4.22222C3.61111 22 3.08778 21.7826 2.65222 21.3478C2.21741 20.9122 2 20.3889 2 19.7778ZM13.1111 13.1111V19.7778H19.7778V13.1111H13.1111ZM13.1111 10.8889H19.7778V4.22222H13.1111V10.8889ZM10.8889 10.8889V4.22222H4.22222V10.8889H10.8889ZM10.8889 13.1111H4.22222V19.7778H10.8889V13.1111Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconDrawTable.displayName = "IconDrawTable";
