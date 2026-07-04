import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconDivider = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M13.4286 20.5714C13.4286 20.9762 13.2914 21.3157 13.0171 21.59C12.7438 21.8633 12.4047 22 12 22C11.5952 22 11.2557 21.8633 10.9814 21.59C10.7081 21.3157 10.5714 20.9762 10.5714 20.5714L10.5714 3.42857C10.5714 3.02381 10.7081 2.68476 10.9814 2.41143C11.2557 2.13714 11.5952 2 12 2C12.4047 2 12.7438 2.13714 13.0171 2.41143C13.2914 2.68476 13.4286 3.02381 13.4286 3.42857L13.4286 20.5714Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconDivider.displayName = "IconDivider";
