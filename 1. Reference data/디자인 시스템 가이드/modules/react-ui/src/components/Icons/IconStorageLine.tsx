import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconStorageLine = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M12 18.6667L16.4444 14.2222L14.8889 12.6667L13.1111 14.4444V9.77778H10.8889V14.4444L9.11111 12.6667L7.55556 14.2222L12 18.6667ZM4.22222 7.55556V19.7778H19.7778V7.55556H4.22222ZM4.22222 22C3.61111 22 3.08796 21.7824 2.65278 21.3472C2.21759 20.912 2 20.3889 2 19.7778V5.91667C2 5.65741 2.04167 5.40741 2.125 5.16667C2.20833 4.92593 2.33333 4.7037 2.5 4.5L3.88889 2.80556C4.09259 2.5463 4.34722 2.34722 4.65278 2.20833C4.95833 2.06944 5.27778 2 5.61111 2H18.3889C18.7222 2 19.0417 2.06944 19.3472 2.20833C19.6528 2.34722 19.9074 2.5463 20.1111 2.80556L21.5 4.5C21.6667 4.7037 21.7917 4.92593 21.875 5.16667C21.9583 5.40741 22 5.65741 22 5.91667V19.7778C22 20.3889 21.7824 20.912 21.3472 21.3472C20.912 21.7824 20.3889 22 19.7778 22H4.22222ZM4.66667 5.33333H19.3333L18.3889 4.22222H5.61111L4.66667 5.33333Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconStorageLine.displayName = "IconStorageLine";
