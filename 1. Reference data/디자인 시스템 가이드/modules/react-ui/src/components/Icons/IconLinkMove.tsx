import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconLinkMove = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M17.9041 8.28767L5.65753 20.5342C5.34703 20.8447 4.98174 21 4.56164 21C4.14155 21 3.77626 20.8447 3.46575 20.5342C3.15525 20.2237 3 19.8584 3 19.4384C3 19.0183 3.15525 18.653 3.46575 18.3425L15.7123 6.09589L4.9726 6.09589C4.53425 6.09589 4.17352 5.94521 3.89041 5.64384C3.60731 5.34247 3.46575 4.9726 3.46575 4.53425C3.48402 4.11416 3.6347 3.75342 3.91781 3.45205C4.20091 3.15069 4.56164 3 5 3L19.4658 3C19.6849 3 19.8813 3.0411 20.0548 3.12329C20.2283 3.20548 20.3881 3.31963 20.5342 3.46575C20.6804 3.61187 20.7945 3.77169 20.8767 3.94521C20.9589 4.11872 21 4.31507 21 4.53425V19C21 19.4018 20.8493 19.7534 20.5479 20.0548C20.2466 20.3562 19.8858 20.516 19.4658 20.5342C19.0274 20.5342 18.6575 20.3836 18.3562 20.0822C18.0548 19.7808 17.9041 19.411 17.9041 18.9726V8.28767Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconLinkMove.displayName = "IconLinkMove";
