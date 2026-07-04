import { forwardRef } from "react";
import type { LogoProps } from "./types";
import { cn } from "@/utils/cn";

export const LogoSop = forwardRef<SVGSVGElement, LogoProps>(
  ({ size = 24, className, ...props }, ref) => (
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
      <path
        d="M14.8573 4.85718V10.5715L20.5716 13.4286V7.71432L14.8573 4.85718Z"
        fill="#FFC73A"
      />
      <path
        d="M14.857 10.5713L9.14269 13.4284L14.857 16.2856L20.5713 13.4284L14.857 10.5713Z"
        fill="#FFC73A"
      />
      <path
        d="M9.14271 2L3.42842 4.85714L9.14271 7.71429L14.857 4.85714L9.14271 2Z"
        fill="#4AD3FF"
      />
      <path
        d="M3.42842 4.85718V22L9.14271 19.1429V7.71432L3.42842 4.85718Z"
        fill="#0663FF"
      />
    </svg>
  ),
);
LogoSop.displayName = "LogoSop";
