import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconThumbsUpLine = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M6.7619 21.2383V8.85732L12.4762 3.19066C12.7143 2.95256 12.9959 2.81351 13.321 2.77351C13.6467 2.73415 13.9603 2.79383 14.2619 2.95256C14.5635 3.11129 14.7857 3.33351 14.9286 3.61923C15.0714 3.90494 15.1032 4.19859 15.0238 4.50018L13.9524 8.85732H20.0952C20.6032 8.85732 21.0476 9.0478 21.4286 9.42875C21.8095 9.8097 22 10.2541 22 10.7621V12.6668C22 12.778 21.9841 12.897 21.9524 13.024C21.9206 13.151 21.8889 13.27 21.8571 13.3811L19 20.0954C18.8571 20.4129 18.619 20.6827 18.2857 20.9049C17.9524 21.1272 17.6032 21.2383 17.2381 21.2383H6.7619ZM8.66667 9.66685V19.3335H17.2381L20.0952 12.6668V10.7621H11.5238L12.8095 5.52399L8.66667 9.66685ZM3.90476 21.2383C3.38095 21.2383 2.9327 21.0519 2.56 20.6792C2.18667 20.3059 2 19.8573 2 19.3335V10.7621C2 10.2383 2.18667 9.7897 2.56 9.41637C2.9327 9.04367 3.38095 8.85732 3.90476 8.85732H6.7619V10.7621H3.90476V19.3335H6.7619V21.2383H3.90476Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconThumbsUpLine.displayName = "IconThumbsUpLine";
