import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconWarningLightFill = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M18.4167 21.1667H5.58333V19.3334H18.4167V21.1667Z" fill={pathFill ?? "currentColor"}/>
      <path d="M14.2917 10.1667C14.6889 10.1667 15.0523 10.2847 15.3811 10.5212C15.7091 10.7583 15.9339 11.0757 16.0561 11.4728L16.7937 17.9584H7.2063L7.94393 11.4728C8.06615 11.0757 8.29088 10.7583 8.6189 10.5212C8.94767 10.2847 9.31111 10.1667 9.70833 10.1667H14.2917Z" fill={pathFill ?? "currentColor"}/>
      <path d="M4.66667 13.8334H1V12H4.66667V13.8334Z" fill={pathFill ?? "currentColor"}/>
      <path d="M23 13.8334H19.3333V12H23V13.8334Z" fill={pathFill ?? "currentColor"}/>
      <path d="M7.44084 8.14181L6.16699 9.46041L3.52979 6.91362L4.80273 5.59501L7.44084 8.14181Z" fill={pathFill ?? "currentColor"}/>
      <path d="M20.4836 6.91362L17.8455 9.46041L16.5726 8.14181L19.2098 5.59501L20.4836 6.91362Z" fill={pathFill ?? "currentColor"}/>
      <path d="M12.9167 6.50004H11.0833V2.83337H12.9167V6.50004Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconWarningLightFill.displayName = "IconWarningLightFill";
