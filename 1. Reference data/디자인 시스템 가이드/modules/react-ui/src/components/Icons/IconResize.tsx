import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconResize = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M19.8663 2.36612C20.3544 1.87796 21.1457 1.87796 21.6339 2.36612C22.122 2.85428 22.122 3.64556 21.6339 4.13371L4.13371 21.6339C3.64556 22.122 2.85428 22.122 2.36612 21.6339C1.87796 21.1457 1.87796 20.3544 2.36612 19.8663L19.8663 2.36612Z" fill={pathFill ?? "currentColor"}/>
      <path d="M19.8663 14.616C20.3544 14.128 21.1458 14.1279 21.6339 14.616C22.122 15.1041 22.1219 15.8954 21.6339 16.3836L16.3836 21.6339C15.8954 22.1219 15.1041 22.122 14.616 21.6339C14.1279 21.1458 14.128 20.3544 14.616 19.8663L19.8663 14.616Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconResize.displayName = "IconResize";
