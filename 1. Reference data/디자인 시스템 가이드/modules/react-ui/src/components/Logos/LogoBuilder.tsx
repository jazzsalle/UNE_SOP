import { forwardRef } from "react";
import type { LogoProps } from "./types";
import { cn } from "@/utils/cn";

export const LogoBuilder = forwardRef<SVGSVGElement, LogoProps>(
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
        d="M19.2727 9.27271H11.9999C10.4937 9.27271 9.27267 10.4937 9.27267 12V19.2727C9.27267 20.7789 10.4937 22 11.9999 22H19.2727C20.7789 22 21.9999 20.7789 21.9999 19.2727V12C21.9999 10.4937 20.7789 9.27271 19.2727 9.27271Z"
        fill="url(#paint0_linear_901_14025)"
      />
      <path
        opacity="0.8"
        d="M15.6364 5.63647H8.36363C6.85739 5.63647 5.63635 6.85752 5.63635 8.36375V15.6365C5.63635 17.1427 6.85739 18.3637 8.36363 18.3637H15.6364C17.1426 18.3637 18.3636 17.1427 18.3636 15.6365V8.36375C18.3636 6.85752 17.1426 5.63647 15.6364 5.63647Z"
        fill="url(#paint1_linear_901_14025)"
      />
      <path
        opacity="0.8"
        d="M12 2H4.72727C3.22104 2 2 3.22104 2 4.72727V12C2 13.5062 3.22104 14.7273 4.72727 14.7273H12C13.5062 14.7273 14.7273 13.5062 14.7273 12V4.72727C14.7273 3.22104 13.5062 2 12 2Z"
        fill="url(#paint2_linear_901_14025)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_901_14025"
          x1="9.27267"
          y1="15.6363"
          x2="21.9999"
          y2="15.6363"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF0DBC" />
          <stop offset="1" stopColor="#6300FF" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_901_14025"
          x1="5.63635"
          y1="12.0001"
          x2="18.3636"
          y2="12.0001"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF0DBC" />
          <stop offset="1" stopColor="#FFABEB" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_901_14025"
          x1="2"
          y1="8.36364"
          x2="14.7273"
          y2="8.36364"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#409CFF" />
          <stop offset="1" stopColor="#B8DDFF" />
        </linearGradient>
      </defs>
    </svg>
  ),
);
LogoBuilder.displayName = "LogoBuilder";
