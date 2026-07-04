import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconListLine = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M4.22222 10.8889C3.61111 10.8889 3.08778 10.6711 2.65222 10.2356C2.21741 9.80074 2 9.27778 2 8.66667V4.22222C2 3.61111 2.21741 3.08778 2.65222 2.65222C3.08778 2.21741 3.61111 2 4.22222 2H19.7778C20.3889 2 20.9122 2.21741 21.3478 2.65222C21.7826 3.08778 22 3.61111 22 4.22222V8.66667C22 9.27778 21.7826 9.80074 21.3478 10.2356C20.9122 10.6711 20.3889 10.8889 19.7778 10.8889H4.22222ZM4.22222 8.66667H19.7778V4.22222H4.22222V8.66667ZM4.22222 22C3.61111 22 3.08778 21.7826 2.65222 21.3478C2.21741 20.9122 2 20.3889 2 19.7778V15.3333C2 14.7222 2.21741 14.1989 2.65222 13.7633C3.08778 13.3285 3.61111 13.1111 4.22222 13.1111H19.7778C20.3889 13.1111 20.9122 13.3285 21.3478 13.7633C21.7826 14.1989 22 14.7222 22 15.3333V19.7778C22 20.3889 21.7826 20.9122 21.3478 21.3478C20.9122 21.7826 20.3889 22 19.7778 22H4.22222ZM4.22222 19.7778H19.7778V15.3333H4.22222V19.7778Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconListLine.displayName = "IconListLine";
