import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconThermalCamera = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M12 13.1436C12.9389 13.1436 13.7002 13.9049 13.7002 14.8438C13.7002 15.7826 12.9389 16.5439 12 16.5439C11.0611 16.5439 10.2998 15.7826 10.2998 14.8438C10.2998 13.9049 11.0611 13.1436 12 13.1436Z" fill={pathFill ?? "currentColor"}/>
      <path fillRule="evenodd" clipRule="evenodd" d="M20.5 12.5C20.5 17.1944 16.6944 21 12 21C7.30558 21 3.5 17.1944 3.5 12.5V9H20.5V12.5ZM12 10.5938C9.65279 10.5938 7.75 12.4965 7.75 14.8438C7.75 17.191 9.65279 19.0938 12 19.0938C14.3472 19.0938 16.25 17.191 16.25 14.8438C16.25 12.4965 14.3472 10.5938 12 10.5938Z" fill={pathFill ?? "currentColor"}/>
      <path fillRule="evenodd" clipRule="evenodd" d="M21 3C21.5523 3 22 3.44772 22 4V6C22 6.55228 21.5523 7 21 7H3C2.44772 7 2 6.55228 2 6V4C2 3.44772 2.44772 3 3 3H21ZM16 4C15.4477 4 15 4.44772 15 5C15 5.55228 15.4477 6 16 6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4ZM19 4C18.4477 4 18 4.44772 18 5C18 5.55228 18.4477 6 19 6C19.5523 6 20 5.55228 20 5C20 4.44772 19.5523 4 19 4Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconThermalCamera.displayName = "IconThermalCamera";
