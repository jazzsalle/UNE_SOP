import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconCctvLine = forwardRef<SVGSVGElement, IconProps>(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M17.9999 3C18.7768 3 19.449 3.4068 19.7802 4H20.9999C22.1044 4 22.9999 3.85614 22.9999 4.91211V8.38379C22.9999 8.89088 22.8974 9.14631 22.5223 9.50488L19.9999 11.4541V12.167C19.9997 13.1794 19.1043 14 17.9999 14H14.9999V15C14.9996 16.1043 14.1043 17 12.9999 17H12.4999L12.4852 17.3066C12.3386 18.8193 11.1192 19.9998 9.6366 20H4.99988V21C4.99968 21.5521 4.55204 22 3.99988 22C3.44772 22 3.00008 21.5521 2.99988 21V17C2.99988 16.4477 3.44759 16 3.99988 16C4.55216 16 4.99988 16.4477 4.99988 17V18H9.6366C10.1306 17.9998 10.5368 17.6065 10.5858 17.1025L10.5907 17H9.99988C8.89547 17 8.00014 16.1043 7.99988 15V14H4.99988C3.89548 13.9999 3.00007 13.1793 2.99988 12.167V4.83301C3.00007 3.82067 3.89548 3.00006 4.99988 3H17.9999ZM9.99988 15H12.9999V14H9.99988V15ZM4.99988 12H17.9999V5H4.99988V12ZM19.9999 9.33984L20.9999 8.38379V5.91211H19.9999V9.33984Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconCctvLine.displayName = "IconCctvLine";
