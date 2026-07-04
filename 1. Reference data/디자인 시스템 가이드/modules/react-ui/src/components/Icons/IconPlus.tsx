import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconPlus = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M12 22C11.5952 22 11.2562 21.8629 10.9829 21.5886C10.7086 21.3152 10.5714 20.9762 10.5714 20.5714V13.4286H3.42857C3.02381 13.4286 2.68429 13.2914 2.41 13.0171C2.13667 12.7438 2 12.4048 2 12C2 11.5952 2.13667 11.2557 2.41 10.9814C2.68429 10.7081 3.02381 10.5714 3.42857 10.5714H10.5714V3.42857C10.5714 3.02381 10.7086 2.68429 10.9829 2.41C11.2562 2.13667 11.5952 2 12 2C12.4048 2 12.7443 2.13667 13.0186 2.41C13.2919 2.68429 13.4286 3.02381 13.4286 3.42857V10.5714H20.5714C20.9762 10.5714 21.3152 10.7081 21.5886 10.9814C21.8629 11.2557 22 11.5952 22 12C22 12.4048 21.8629 12.7438 21.5886 13.0171C21.3152 13.2914 20.9762 13.4286 20.5714 13.4286H13.4286V20.5714C13.4286 20.9762 13.2919 21.3152 13.0186 21.5886C12.7443 21.8629 12.4048 22 12 22Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconPlus.displayName = "IconPlus";
