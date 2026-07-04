import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconPowerTray = forwardRef<SVGSVGElement, IconProps>(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M16.5993 3.03406C17.7037 3.03406 18.5999 3.83714 18.6001 4.82723V19.1726C18.5998 20.1627 17.7037 20.9658 16.5993 20.9658H7.60037C6.49601 20.9658 5.59987 20.1627 5.59958 19.1726V4.82723C5.59981 3.83714 6.49598 3.03406 7.60037 3.03406H16.5993ZM13.2193 7.90975C13.2761 7.71188 12.9788 7.59673 12.8569 7.76958L9.59455 12.398C9.5105 12.5172 9.6053 12.6727 9.7625 12.673H11.3414C11.4793 12.673 11.5762 12.7958 11.5305 12.9124L10.3007 16.0505C10.2244 16.2452 10.5154 16.3825 10.6512 16.2158L14.5681 11.4022C14.664 11.2838 14.57 11.1181 14.4068 11.1179H12.5514C12.4206 11.1179 12.3242 11.0066 12.357 10.8931L13.2193 7.90975Z" fill={pathFill ?? "currentColor"}/>
      <path d="M4.79952 17.9164H2.80005C2.35829 17.9163 2 17.5957 2 17.1996C2.00009 16.8036 2.35834 16.4829 2.80005 16.4829H4.79952V17.9164Z" fill={pathFill ?? "currentColor"}/>
      <path d="M21.1999 16.4829C21.6416 16.483 21.9999 16.8036 22 17.1996C22 17.5957 21.6417 17.9163 21.1999 17.9164H19.4002V16.4829H21.1999Z" fill={pathFill ?? "currentColor"}/>
      <path d="M4.79952 12.7167H2.80005C2.35829 12.7166 2.00001 12.396 2 11.9999C2 11.6039 2.35829 11.2832 2.80005 11.2832H4.79952V12.7167Z" fill={pathFill ?? "currentColor"}/>
      <path d="M21.1999 11.2832C21.6417 11.2833 22 11.6039 22 11.9999C22 12.396 21.6417 12.7166 21.1999 12.7167H19.4002V11.2832H21.1999Z" fill={pathFill ?? "currentColor"}/>
      <path d="M4.79952 7.517H2.80005C2.35835 7.51695 2.00011 7.19625 2 6.80026C2 6.40418 2.35829 6.08356 2.80005 6.08352H4.79952V7.517Z" fill={pathFill ?? "currentColor"}/>
      <path d="M21.1999 6.08352C21.6417 6.08359 22 6.4042 22 6.80026C21.9999 7.19624 21.6416 7.51692 21.1999 7.517H19.4002V6.08352H21.1999Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconPowerTray.displayName = "IconPowerTray";
