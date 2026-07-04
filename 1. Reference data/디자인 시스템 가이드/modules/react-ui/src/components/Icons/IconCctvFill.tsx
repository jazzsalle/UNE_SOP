import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconCctvFill = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M14 16C14 16.5523 13.5523 17 13 17H12V17.082C12 18.6936 10.7787 20 9.27246 20H5V21C5 21.5523 4.55228 22 4 22C3.44772 22 3 21.5523 3 21V17C3 16.4477 3.44772 16 4 16C4.55228 16 5 16.4477 5 17V18.0547H9.27246C9.77454 18.0547 10.1816 17.6192 10.1816 17.082V17H9C8.44772 17 8 16.5523 8 16V15H14V16Z" fill={pathFill ?? "currentColor"}/>
      <path d="M18 3C18.5522 3 18.9998 3.49228 19 4.09961V12.9004C18.9998 13.5077 18.5522 14 18 14H4C3.44783 14 3.00019 13.5077 3 12.9004V4.09961C3.00019 3.49228 3.44783 3 4 3H18Z" fill={pathFill ?? "currentColor"}/>
      <path d="M21 4C22.1045 3.99999 23 3.85618 23 4.91211V8.38379C23 8.89088 22.8975 9.14632 22.5225 9.50488L20 11.4941V4H21Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconCctvFill.displayName = "IconCctvFill";
