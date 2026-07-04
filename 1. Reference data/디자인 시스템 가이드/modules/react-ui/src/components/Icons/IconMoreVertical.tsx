import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconMoreVertical = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M12 18C12.55 18 13.0211 18.1956 13.4131 18.5869C13.8044 18.9789 14 19.45 14 20C14 20.55 13.8044 21.0211 13.4131 21.4131C13.0211 21.8044 12.55 22 12 22C11.45 22 10.9792 21.8044 10.5879 21.4131C10.1959 21.0211 10 20.55 10 20C10 19.45 10.1959 18.9789 10.5879 18.5869C10.9792 18.1956 11.45 18 12 18Z" fill={pathFill ?? "currentColor"}/>
      <path d="M12 10C12.55 10 13.0211 10.1956 13.4131 10.5869C13.8044 10.9789 14 11.45 14 12C14 12.55 13.8044 13.0208 13.4131 13.4121C13.0211 13.8041 12.55 14 12 14C11.45 14 10.9792 13.8041 10.5879 13.4121C10.1959 13.0208 10 12.55 10 12C10 11.45 10.1959 10.9789 10.5879 10.5869C10.9792 10.1956 11.45 10 12 10Z" fill={pathFill ?? "currentColor"}/>
      <path d="M12 2C12.55 2 13.0211 2.1959 13.4131 2.58789C13.8044 2.97922 14 3.45 14 4C14 4.55 13.8044 5.02078 13.4131 5.41211C13.0211 5.8041 12.55 6 12 6C11.45 6 10.9792 5.80411 10.5879 5.41211C10.1959 5.02078 10 4.55 10 4C10 3.45 10.1959 2.97922 10.5879 2.58789C10.9792 2.19589 11.45 2 12 2Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconMoreVertical.displayName = "IconMoreVertical";
