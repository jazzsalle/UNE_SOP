import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconWaterDropFill = forwardRef<SVGSVGElement, IconProps>(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.3299 6.54991 19.9999 10.4798 20 13.7998C20 18.7798 16.2 22 12 22C7.8 22 4 18.7798 4 13.7998C4.0001 10.4798 6.6701 6.54991 12 2ZM9.18359 14.7998C9.07309 14.1464 8.45322 13.706 7.7998 13.8164C7.14644 13.9269 6.70601 14.5468 6.81641 15.2002C6.93643 15.9103 7.32437 16.8981 8.14648 17.7227C8.99987 18.5784 10.2657 19.2002 12 19.2002C12.6627 19.2002 13.2002 18.6627 13.2002 18C13.2002 17.3373 12.6627 16.7998 12 16.7998C10.8888 16.7998 10.2387 16.4215 9.8457 16.0273C9.42178 15.602 9.23256 15.0896 9.18359 14.7998Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconWaterDropFill.displayName = "IconWaterDropFill";
