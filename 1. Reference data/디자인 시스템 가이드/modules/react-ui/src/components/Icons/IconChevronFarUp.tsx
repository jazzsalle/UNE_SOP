import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconChevronFarUp = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M2 5.61255C2 4.92219 2.55964 4.36255 3.25 4.36255H20.75C21.4403 4.36255 22 4.92219 22 5.61255C22 6.3029 21.4403 6.86255 20.75 6.86255H3.25C2.55964 6.86255 2 6.3029 2 5.61255Z" fill={pathFill ?? "currentColor"}/>
      <path fillRule="evenodd" clipRule="evenodd" d="M11.1697 9.67813C11.6433 9.25735 12.3567 9.25735 12.8303 9.67813L21.5803 17.4531C22.0963 17.9117 22.143 18.7018 21.6844 19.2178C21.2258 19.7339 20.4358 19.7805 19.9197 19.3219L12 12.2847L4.0803 19.3219C3.56424 19.7805 2.77416 19.7339 2.3156 19.2178C1.85705 18.7018 1.90366 17.9117 2.41972 17.4531L11.1697 9.67813Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconChevronFarUp.displayName = "IconChevronFarUp";
