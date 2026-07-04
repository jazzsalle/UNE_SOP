import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconPause = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M15.7132 22C15.4371 22 15.2132 21.7761 15.2132 21.5V2.5C15.2132 2.22386 15.4371 2 15.7132 2H19.7154C19.9915 2 20.2154 2.22386 20.2154 2.5V21.5C20.2154 21.7761 19.9915 22 19.7154 22H15.7132ZM4.28467 22C4.00852 22 3.78467 21.7761 3.78467 21.5V2.5C3.78467 2.22386 4.00853 2 4.28467 2H8.28536C8.56151 2 8.78536 2.22386 8.78536 2.5V21.5C8.78536 21.7761 8.56151 22 8.28536 22H4.28467Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconPause.displayName = "IconPause";
