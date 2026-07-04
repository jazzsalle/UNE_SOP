import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconFolderLine = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M9.17006 6L11.1701 8H20.0001V18H4.00006V6H9.17006ZM10.0001 4H4.00006C2.90006 4 2.01006 4.9 2.01006 6L2.00006 18C2.00006 19.1 2.90006 20 4.00006 20H20.0001C21.1001 20 22.0001 19.1 22.0001 18V8C22.0001 6.9 21.1001 6 20.0001 6H12.0001L10.0001 4Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconFolderLine.displayName = "IconFolderLine";
