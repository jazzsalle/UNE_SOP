import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconDonutChartFill = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M11 8.12598C9.27477 8.57002 8 10.1362 8 12C8 14.2091 9.79086 16 12 16C12.8996 16 13.7293 15.7024 14.3975 15.2012L18.9502 19.1777C18.0468 20.0538 16.9892 20.7547 15.8271 21.2373C14.6139 21.7411 13.3132 22 12 22C10.6868 22 9.38611 21.7411 8.17285 21.2373C6.95966 20.7335 5.85725 19.9944 4.92871 19.0635C4.00026 18.1326 3.26324 17.0277 2.76074 15.8115C2.25822 14.5952 2 13.2911 2 11.9746C2.00005 10.6583 2.25832 9.35478 2.76074 8.13867C3.26329 6.92237 4.00013 5.81666 4.92871 4.88574C5.85722 3.95493 6.95973 3.21668 8.17285 2.71289C9.077 2.33744 10.0298 2.09775 11 2V8.12598Z" fill={pathFill ?? "currentColor"}/>
      <path d="M13 2C13.9702 2.09775 14.923 2.33744 15.8271 2.71289C17.0403 3.21668 18.1428 3.95493 19.0713 4.88574C19.9999 5.81666 20.7367 6.92237 21.2393 8.13867C21.7417 9.35478 21.9999 10.6583 22 11.9746C22 13.2911 21.7418 14.5952 21.2393 15.8115C20.9719 16.4586 20.6357 17.0728 20.2422 17.6475L15.6494 13.6357C15.8737 13.1362 16 12.583 16 12C16 10.1362 14.7252 8.57002 13 8.12598V2Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconDonutChartFill.displayName = "IconDonutChartFill";
