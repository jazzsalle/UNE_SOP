import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconChevronUp = forwardRef<SVGSVGElement, IconProps>(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M11.1697 7.17814C11.6433 6.75735 12.3567 6.75735 12.8303 7.17814L21.5803 14.9531C22.0963 15.4117 22.143 16.2018 21.6844 16.7178C21.2258 17.2339 20.4358 17.2805 19.9197 16.8219L12 9.78472L4.0803 16.8219C3.56424 17.2805 2.77416 17.2339 2.3156 16.7178C1.85705 16.2018 1.90366 15.4117 2.41972 14.9531L11.1697 7.17814Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconChevronUp.displayName = "IconChevronUp";
