import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconWaterDropLine = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M8.78125 14.0244C9.32003 13.9036 9.85462 14.2425 9.97559 14.7812C10.1554 15.5814 10.9775 16.0468 11.9492 15.9971C12.5006 15.969 12.9708 16.3929 12.999 16.9443C13.0272 17.4959 12.6023 17.9659 12.0508 17.9941C10.5602 18.0703 8.50366 17.3534 8.02441 15.2188C7.9036 14.68 8.24247 14.1454 8.78125 14.0244Z" fill={pathFill ?? "currentColor"}/>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.3299 6.54991 19.9999 10.4798 20 13.7998C20 18.7798 16.2 22 12 22C7.8 22 4 18.7798 4 13.7998C4.0001 10.4798 6.6701 6.54991 12 2ZM12 4.66699C10.0781 6.42295 8.64317 8.02943 7.65625 9.48438C6.45433 11.2564 6.00005 12.679 6 13.7998C6 17.614 8.84236 20 12 20C15.1576 20 18 17.614 18 13.7998C17.9999 12.679 17.5457 11.2564 16.3438 9.48438C15.3568 8.02943 13.9219 6.42295 12 4.66699Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconWaterDropLine.displayName = "IconWaterDropLine";
