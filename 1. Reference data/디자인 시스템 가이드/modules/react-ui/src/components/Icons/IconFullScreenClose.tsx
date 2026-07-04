import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconFullScreenClose = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M7.95996 14.8896C8.59497 14.8896 9.11015 15.4051 9.11035 16.04V20.8496C9.11033 21.4847 8.59508 22 7.95996 22C7.32503 21.9998 6.81057 21.4846 6.81055 20.8496V17.1895H3.15039C2.51541 17.1894 2.00022 16.675 2 16.04C2.0002 15.4051 2.5154 14.8897 3.15039 14.8896H7.95996Z" fill={pathFill ?? "currentColor"}/>
      <path d="M20.8496 14.8896C21.4846 14.8897 21.9998 15.4051 22 16.04C21.9998 16.675 21.4846 17.1894 20.8496 17.1895H17.1895V20.8496C17.1894 21.4846 16.675 21.9998 16.04 22C15.4049 22 14.8897 21.4847 14.8896 20.8496V16.04C14.8898 15.4051 15.405 14.8896 16.04 14.8896H20.8496Z" fill={pathFill ?? "currentColor"}/>
      <path d="M7.95996 2C8.59495 2 9.11013 2.51545 9.11035 3.15039V7.95996C9.11035 8.59509 8.59509 9.11035 7.95996 9.11035H3.15039C2.51528 9.11033 2 8.59508 2 7.95996C2.00042 7.3252 2.51554 6.81057 3.15039 6.81055H6.81055V3.15039C6.81076 2.51558 7.32515 2.00021 7.95996 2Z" fill={pathFill ?? "currentColor"}/>
      <path d="M16.04 2C16.6749 2.00021 17.1892 2.51558 17.1895 3.15039V6.81055H20.8496C21.4845 6.81057 21.9996 7.3252 22 7.95996C22 8.59508 21.4847 9.11033 20.8496 9.11035H16.04C15.4049 9.11035 14.8896 8.59509 14.8896 7.95996V3.15039C14.8899 2.51545 15.405 2 16.04 2Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconFullScreenClose.displayName = "IconFullScreenClose";
