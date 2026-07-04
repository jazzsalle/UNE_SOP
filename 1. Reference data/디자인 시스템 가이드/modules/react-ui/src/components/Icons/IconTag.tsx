import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconTag = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M21.5727 13.3106L17.5556 19.0086C17.3466 19.3125 17.076 19.5499 16.7436 19.7208C16.4112 19.8918 16.0551 19.9772 15.6752 19.9772H4.2792C3.65242 19.9772 3.11586 19.7541 2.66952 19.3077C2.22317 18.8614 2 18.3248 2 17.698V6.30203C2 5.67525 2.22317 5.13869 2.66952 4.69234C3.11586 4.246 3.65242 4.02283 4.2792 4.02283H15.6752C16.0551 4.02283 16.4112 4.1083 16.7436 4.27924C17.076 4.45018 17.3466 4.68759 17.5556 4.99149L21.5727 10.6895C21.8576 11.0884 22 11.5252 22 12C22 12.4749 21.8576 12.9117 21.5727 13.3106ZM15.6752 17.698L19.7208 12L15.6752 6.30203H4.2792V17.698H15.6752Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconTag.displayName = "IconTag";
