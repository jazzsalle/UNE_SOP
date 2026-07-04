import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconStrikeThrough = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M13.875 20.125C13.875 20.6458 13.6921 21.088 13.3271 21.4521C12.963 21.8171 12.5208 22 12 22C11.4792 22 11.037 21.8171 10.6729 21.4521C10.3079 21.088 10.125 20.6458 10.125 20.125V14.3652H13.875V20.125Z" fill={pathFill ?? "currentColor"}/>
      <path d="M19.6504 11.165C20.2577 11.1652 20.7499 11.6583 20.75 12.2656C20.7498 12.8728 20.2576 13.365 19.6504 13.3652H4.34961C3.74241 13.365 3.25021 12.8728 3.25 12.2656C3.2501 11.6583 3.74234 11.1652 4.34961 11.165H19.6504Z" fill={pathFill ?? "currentColor"}/>
      <path d="M18.875 2C19.3958 2 19.838 2.18285 20.2021 2.54785C20.5671 2.91202 20.75 3.35417 20.75 3.875C20.75 4.39583 20.5671 4.83798 20.2021 5.20215C19.838 5.56715 19.3958 5.75 18.875 5.75H13.875V10.165H10.125V5.75H5.125C4.60417 5.75 4.16202 5.56715 3.79785 5.20215C3.43285 4.83798 3.25 4.39583 3.25 3.875C3.25 3.35417 3.43285 2.91202 3.79785 2.54785C4.16202 2.18285 4.60417 2 5.125 2H18.875Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconStrikeThrough.displayName = "IconStrikeThrough";
