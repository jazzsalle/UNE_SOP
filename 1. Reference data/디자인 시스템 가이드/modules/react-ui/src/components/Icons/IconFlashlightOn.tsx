import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconFlashlightOn = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M12 15.6L15.2 11H12.35L14.35 4H9V12H12V15.6ZM10 22V14H7V2H17L15 9H19L10 22Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconFlashlightOn.displayName = "IconFlashlightOn";
