import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconFlashlightOff = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M7.84242 2H17.5394L15.6 8.78788H19.4788L16.6424 12.8848L15.2606 11.503L15.7939 10.7273H14.4848L13.3455 9.58788L14.9697 3.93939H9.78182V6.02424L7.84242 4.08485V2ZM10.7515 21.3939V13.6364H7.84242V9.61212L2.38788 4.15758L3.7697 2.77576L21.6121 20.6182L20.2303 22L14.3879 16.1576L10.7515 21.3939Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconFlashlightOff.displayName = "IconFlashlightOff";
