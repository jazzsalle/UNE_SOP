import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconSend = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M2 19.4606V4.53951C2 4.11866 2.17217 3.79805 2.5165 3.57767C2.86083 3.35807 3.22429 3.32478 3.60689 3.47782L21.2826 10.9384C21.7609 11.1488 22 11.5027 22 12.0001C22 12.4974 21.7609 12.8513 21.2826 13.0617L3.60689 20.5223C3.22429 20.6753 2.86083 20.6417 2.5165 20.4213C2.17217 20.2017 2 19.8815 2 19.4606ZM4.29555 17.7389L17.8967 12.0001L4.29555 6.26118V10.2784L11.1822 12.0001L4.29555 13.7217V17.7389Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconSend.displayName = "IconSend";
