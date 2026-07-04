import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconChevronDown = forwardRef<SVGSVGElement, IconProps>(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M2.3156 7.28227C2.77416 6.76621 3.56424 6.7196 4.0803 7.17815L12 14.2154L19.9197 7.17815C20.4358 6.7196 21.2258 6.76621 21.6844 7.28227C22.143 7.79833 22.0963 8.58841 21.5803 9.04697L12.8303 16.822C12.3567 17.2427 11.6433 17.2427 11.1697 16.822L2.41972 9.04697C1.90366 8.58841 1.85705 7.79833 2.3156 7.28227Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconChevronDown.displayName = "IconChevronDown";
