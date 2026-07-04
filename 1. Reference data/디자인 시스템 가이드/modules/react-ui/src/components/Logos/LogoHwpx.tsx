import { forwardRef } from "react";
import type { LogoProps } from "./types";
import { cn } from "@/utils/cn";

export const LogoHwpx = forwardRef<SVGSVGElement, LogoProps>(
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
        d="M12 21.9992H20.1818C21.186 21.9992 22 21.1852 22 20.181V16.9985H12V21.9992Z"
        fill="#98D0F5"
      />
      <path
        d="M12 17.0021H22V12.0015H12V17.0021Z"
        fill="url(#paint0_linear_935_1226)"
      />
      <path
        d="M12 12.0007H22V7H12V12.0007Z"
        fill="url(#paint1_linear_935_1226)"
      />
      <path
        d="M12 7.00067H22V3.81817C22 2.814 21.186 2 20.1818 2H12V7.00067Z"
        fill="url(#paint2_linear_935_1226)"
      />
      <path
        d="M12 22V2H15.6364C15.3752 3.52667 14.7595 7.30675 14.3148 11.4808C13.8426 15.9132 13.6273 20.4725 13.564 22H12Z"
        fill="url(#paint3_linear_935_1226)"
      />
      <path
        d="M4.54542 2H12V22H4.5455C3.86867 22 3.53025 22 3.25633 21.911C2.98344 21.8223 2.73541 21.6703 2.53253 21.4674C2.32964 21.2645 2.17765 21.0165 2.089 20.7436C2 20.4698 2 20.1314 2 19.4545V4.54542C2 3.86858 2 3.53017 2.089 3.25633C2.17767 2.98345 2.32966 2.73543 2.53255 2.53255C2.73543 2.32966 2.98345 2.17767 3.25633 2.089C3.53025 2 3.86867 2 4.5455 2H4.54542Z"
        fill="url(#paint4_linear_935_1226)"
      />
      <path
        d="M10.0375 6.06857H7.52242C7.53234 5.94307 7.54225 5.72824 7.54225 5.46715V4.87549H6.46142V5.46715C6.46142 5.72824 6.47475 5.94299 6.48134 6.06857H3.96292V7.08657H5.21542C4.809 7.38741 4.59084 7.88649 4.59084 8.51441C4.59084 9.72074 5.54934 10.7089 7.00017 10.7089C8.451 10.7089 9.40959 9.72399 9.40959 8.51441C9.40959 7.88316 9.15842 7.36749 8.78492 7.08657H10.0375V6.06857ZM7.00017 9.69424C6.21692 9.69424 5.67159 9.08274 5.67159 8.36232C5.67159 7.64182 6.21692 7.03032 7.00017 7.03032C7.7835 7.03032 8.32875 7.64182 8.32875 8.36232C8.32875 9.08274 7.7835 9.69424 7.00017 9.69424Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_935_1226"
          x1="17"
          y1="17.0021"
          x2="17"
          y2="12.0015"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#37A5FA" />
          <stop offset="0.115015" stopColor="#42ADFF" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_935_1226"
          x1="17"
          y1="12.0007"
          x2="17"
          y2="7"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#007BD9" />
          <stop offset="0.125267" stopColor="#0082E5" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_935_1226"
          x1="17"
          y1="7.00077"
          x2="17"
          y2="2.00009"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00458A" />
          <stop offset="0.114689" stopColor="#004D99" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_935_1226"
          x1="12.2236"
          y1="7.21738"
          x2="14.4041"
          y2="7.43608"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopOpacity="0.49" />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_935_1226"
          x1="7"
          y1="2"
          x2="7"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#42ADFF" />
          <stop offset="1" stopColor="#33A7FF" />
        </linearGradient>
      </defs>
    </svg>
  ),
);
LogoHwpx.displayName = "LogoHwpx";
