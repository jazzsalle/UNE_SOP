import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconScreenAdjustment = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M20 3C21.1046 3 22 3.92859 22 5.07407V18.9259C22 20.0714 21.1046 21 20 21H14.5279C14.0546 20.9999 13.6708 20.6019 13.6708 20.1111C13.6708 19.6203 14.0546 19.2224 14.5279 19.2222H20C20.1578 19.2222 20.2857 19.0896 20.2857 18.9259V5.07407C20.2857 4.91043 20.1578 4.77778 20 4.77778H4C3.8422 4.77778 3.71429 4.91043 3.71429 5.07407V8.373C3.71429 8.86392 3.33053 9.26189 2.85714 9.26189C2.38376 9.26189 2 8.86392 2 8.373V5.07407C2 3.92859 2.89543 3 4 3H20Z" fill={pathFill ?? "currentColor"}/>
      <path fillRule="evenodd" clipRule="evenodd" d="M11.1429 10.7037C11.774 10.7037 12.2857 11.2343 12.2857 11.8889V19.8148L12.2801 19.9363C12.2215 20.5338 11.7345 21 11.1429 21H3.14286C2.55123 21 2.06425 20.5338 2.00558 19.9363L2 19.8148V11.8889C2 11.2343 2.51167 10.7037 3.14286 10.7037H11.1429ZM3.71429 19.2222H10.5714V12.4815H3.71429V19.2222Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconScreenAdjustment.displayName = "IconScreenAdjustment";
