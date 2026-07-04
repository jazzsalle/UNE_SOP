import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconMemo = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M20 4V14.44H14.44V20H4V4H20ZM19.7778 2H4.22222C3 2 2 3 2 4.22222V19.7778C2 21 3 22 4.22222 22H15.3333L22 15.3333V4.22222C22 3 21 2 19.7778 2ZM12 14.2222H6.44444V12.22H12V14.2222ZM17.5556 9.56H6.44444V7.55556H17.5556V9.56Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconMemo.displayName = "IconMemo";
