import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconWarningFill = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M2.725 21C2.34167 21 2.05834 20.8333 1.875 20.5C1.69167 20.1667 1.69167 19.8333 1.875 19.5L11.125 3.5C11.3083 3.16667 11.6 3 12 3C12.4 3 12.6917 3.16667 12.875 3.5L22.125 19.5C22.3083 19.8333 22.3083 20.1667 22.125 20.5C21.9417 20.8333 21.6583 21 21.275 21H2.725ZM12 10C11.7167 10 11.4793 10.0957 11.288 10.287C11.096 10.479 11 10.7167 11 11V14C11 14.2833 11.096 14.5207 11.288 14.712C11.4793 14.904 11.7167 15 12 15C12.2833 15 12.521 14.904 12.713 14.712C12.9043 14.5207 13 14.2833 13 14V11C13 10.7167 12.9043 10.479 12.713 10.287C12.521 10.0957 12.2833 10 12 10ZM12 18C12.2833 18 12.521 17.904 12.713 17.712C12.9043 17.5207 13 17.2833 13 17C13 16.7167 12.9043 16.4793 12.713 16.288C12.521 16.096 12.2833 16 12 16C11.7167 16 11.4793 16.096 11.288 16.288C11.096 16.4793 11 16.7167 11 17C11 17.2833 11.096 17.5207 11.288 17.712C11.4793 17.904 11.7167 18 12 18Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconWarningFill.displayName = "IconWarningFill";
