import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconPoiFill = forwardRef<SVGSVGElement, IconProps>(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C14.1166 2 15.979 2.74142 17.5869 4.22461C19.1956 5.70794 20 7.7002 20 10.2002C19.9999 11.8668 19.3373 13.6788 18.0127 15.6367C16.6874 17.5954 14.6833 19.7167 12 22C9.31667 19.7167 7.31295 17.5954 5.98828 15.6367C4.66303 13.6788 4.00005 11.8668 4 10.2002C4 7.7002 4.80442 5.70794 6.41309 4.22461C8.02103 2.74142 9.88344 2 12 2ZM12 7C11.175 7 10.4688 7.29386 9.88184 7.88086C9.29401 8.46881 9 9.17512 9 10C9 10.825 9.29384 11.5312 9.88184 12.1182C10.4688 12.7062 11.175 13 12 13C12.8249 13 13.5312 12.706 14.1191 12.1182C14.7061 11.5312 15 10.825 15 10C15 9.175 14.7061 8.46886 14.1191 7.88086C13.5311 7.29386 12.825 7 12 7Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconPoiFill.displayName = "IconPoiFill";
