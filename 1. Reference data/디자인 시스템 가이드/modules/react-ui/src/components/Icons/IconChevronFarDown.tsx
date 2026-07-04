import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconChevronFarDown = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M2 18.3875C2 17.6971 2.55964 17.1375 3.25 17.1375H20.75C21.4403 17.1375 22 17.6971 22 18.3875C22 19.0778 21.4403 19.6375 20.75 19.6375H3.25C2.55964 19.6375 2 19.0778 2 18.3875Z" fill={pathFill ?? "currentColor"}/>
      <path fillRule="evenodd" clipRule="evenodd" d="M2.3156 4.78227C2.77416 4.26621 3.56424 4.2196 4.0803 4.67815L12 11.7154L19.9197 4.67815C20.4358 4.2196 21.2258 4.26621 21.6844 4.78227C22.143 5.29833 22.0963 6.08841 21.5803 6.54697L12.8303 14.322C12.3567 14.7427 11.6433 14.7427 11.1697 14.322L2.41972 6.54697C1.90366 6.08841 1.85705 5.29833 2.3156 4.78227Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconChevronFarDown.displayName = "IconChevronFarDown";
