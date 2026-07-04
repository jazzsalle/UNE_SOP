import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconItalics = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M5.125 22C4.60417 22 4.16167 21.8175 3.7975 21.4525C3.4325 21.0883 3.25 20.6458 3.25 20.125C3.25 19.6042 3.4325 19.1617 3.7975 18.7975C4.16167 18.4325 4.60417 18.25 5.125 18.25H7.46875L12.4688 5.75H10.125C9.60417 5.75 9.16167 5.5675 8.7975 5.2025C8.4325 4.83833 8.25 4.39583 8.25 3.875C8.25 3.35417 8.4325 2.91167 8.7975 2.5475C9.16167 2.1825 9.60417 2 10.125 2H18.875C19.3958 2 19.8383 2.1825 20.2025 2.5475C20.5675 2.91167 20.75 3.35417 20.75 3.875C20.75 4.39583 20.5675 4.83833 20.2025 5.2025C19.8383 5.5675 19.3958 5.75 18.875 5.75H16.5312L11.5312 18.25H13.875C14.3958 18.25 14.8383 18.4325 15.2025 18.7975C15.5675 19.1617 15.75 19.6042 15.75 20.125C15.75 20.6458 15.5675 21.0883 15.2025 21.4525C14.8383 21.8175 14.3958 22 13.875 22H5.125Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconItalics.displayName = "IconItalics";
