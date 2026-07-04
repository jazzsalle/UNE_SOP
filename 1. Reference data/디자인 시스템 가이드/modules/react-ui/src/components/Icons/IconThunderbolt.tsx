import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconThunderbolt = forwardRef<SVGSVGElement, IconProps>(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M19.3959 2.58896C19.4974 2.49034 19.528 2.34207 19.4729 2.2131C19.4179 2.08414 19.2886 2 19.1448 2H9.5665C9.42624 2 9.29946 2.08 9.24229 2.20414L4.53107 12.4317C4.48171 12.5382 4.49166 12.662 4.55735 12.7599C4.62269 12.8579 4.73491 12.9172 4.85529 12.9172H9.05479L5.45329 21.5254C5.38937 21.6782 5.44583 21.8537 5.58787 21.9437C5.73027 22.034 5.91813 22.014 6.03673 21.8957L18.0284 9.93823C18.1278 9.83926 18.1566 9.69202 18.1015 9.56444C18.0461 9.43685 17.9179 9.3534 17.7755 9.35271L12.4468 9.32892L19.3959 2.58896Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconThunderbolt.displayName = "IconThunderbolt";
