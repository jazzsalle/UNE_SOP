import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconMinus = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M3.42857 13.4286C3.02381 13.4286 2.68429 13.2914 2.41 13.0171C2.13667 12.7438 2 12.4047 2 12C2 11.5952 2.13667 11.2557 2.41 10.9814C2.68429 10.7081 3.02381 10.5714 3.42857 10.5714H20.5714C20.9762 10.5714 21.3152 10.7081 21.5886 10.9814C21.8629 11.2557 22 11.5952 22 12C22 12.4047 21.8629 12.7438 21.5886 13.0171C21.3152 13.2914 20.9762 13.4286 20.5714 13.4286H3.42857Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconMinus.displayName = "IconMinus";
