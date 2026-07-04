import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconFootprint = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M10.1106 11.9784L4.90559 13.0141C4.33648 10.3762 3.41775 10.3948 3.07781 8.34835C2.62086 5.59402 4.23817 2.45112 6.31311 2.06325C8.12843 1.72325 9.6315 2.71969 10.157 5.88688C10.5052 7.98049 9.60589 8.25835 10.1106 11.9784Z" fill={pathFill ?? "currentColor"}/>
      <path d="M5.09737 14.067L10.2747 13.037L10.5828 14.8942C10.7849 16.1106 10.0199 17.2713 8.87339 17.4856L7.83557 17.6799C6.68975 17.8942 5.59654 17.0821 5.39507 15.8649L5.09737 14.067Z" fill={pathFill ?? "currentColor"}/>
      <path d="M19.0951 17.2999L13.8901 16.2642C14.3948 12.5448 13.4955 12.2663 13.843 10.1727C14.3692 7.00547 15.8716 6.00903 17.6869 6.34903C19.7618 6.73761 21.3791 9.8798 20.9222 12.6341C20.5829 14.6806 19.6642 14.662 19.0951 17.2999Z" fill={pathFill ?? "currentColor"}/>
      <path d="M13.4179 19.1799L13.726 17.3228L18.9033 18.3528L18.6049 20.1507C18.4028 21.3678 17.3103 22.18 16.1644 21.9657L15.1266 21.7714C13.9808 21.5571 13.2158 20.3964 13.4179 19.1799Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconFootprint.displayName = "IconFootprint";
