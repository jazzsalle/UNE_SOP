import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconLayerFill = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M12 22L2.5 14.6509L4.24167 13.3386L12 19.3228L19.7583 13.3386L21.5 14.6509L12 22ZM12 16.6982L2.5 9.34908L12 2L21.5 9.34908L12 16.6982Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconLayerFill.displayName = "IconLayerFill";
