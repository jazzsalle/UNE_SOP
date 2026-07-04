import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconFullScreen = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M3.15039 14.8896C3.78533 14.8899 4.29978 15.4051 4.2998 16.04V19.7002H7.95996C8.59494 19.7002 9.11013 20.2147 9.11035 20.8496C9.11035 21.4847 8.59507 22 7.95996 22H3.15039C2.51526 22 2 21.4847 2 20.8496V16.04C2.00002 15.4049 2.51528 14.8896 3.15039 14.8896Z" fill={pathFill ?? "currentColor"}/>
      <path d="M20.8496 14.8896C21.4847 14.8896 22 15.4049 22 16.04V20.8496C22 21.4847 21.4847 22 20.8496 22H16.04C15.4049 22 14.8896 21.4847 14.8896 20.8496C14.8899 20.2147 15.4051 19.7002 16.04 19.7002H19.7002V16.04C19.7002 15.4051 20.2147 14.8899 20.8496 14.8896Z" fill={pathFill ?? "currentColor"}/>
      <path d="M7.95996 2C8.59507 2.00002 9.11035 2.51528 9.11035 3.15039C9.11013 3.78532 8.59494 4.29978 7.95996 4.2998H4.2998V7.95996C4.29978 8.59494 3.78533 9.11014 3.15039 9.11035C2.51528 9.11035 2.00002 8.59507 2 7.95996V3.15039C2 2.51526 2.51526 2 3.15039 2H7.95996Z" fill={pathFill ?? "currentColor"}/>
      <path d="M20.8496 2C21.4847 2 22 2.51526 22 3.15039V7.95996C22 8.59507 21.4847 9.11035 20.8496 9.11035C20.2147 9.11014 19.7002 8.59494 19.7002 7.95996V4.2998H16.04C15.4051 4.29978 14.8899 3.78532 14.8896 3.15039C14.8896 2.51528 15.4049 2.00002 16.04 2H20.8496Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconFullScreen.displayName = "IconFullScreen";
