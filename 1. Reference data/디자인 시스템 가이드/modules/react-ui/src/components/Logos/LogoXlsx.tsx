import { forwardRef } from "react";
import type { LogoProps } from "./types";
import { cn } from "@/utils/cn";

export const LogoXlsx = forwardRef<SVGSVGElement, LogoProps>(
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
      <g clipPath="url(#clip0_935_1231)">
        <path
          d="M4.85721 8.38892C4.85721 7.00812 6.00865 5.88892 7.42881 5.88892H22.0004V20.3333C22.0004 21.2537 21.2329 22.0001 20.286 22.0001H8.2856C6.39219 22.0001 4.85721 20.5077 4.85721 18.6669V8.38892Z"
          fill="url(#paint0_radial_935_1231)"
        />
        <path
          d="M4.85721 8.38892C4.85721 7.00812 6.00865 5.88892 7.42881 5.88892H22.0004V20.3333C22.0004 21.2537 21.2329 22.0001 20.286 22.0001H8.2856C6.39219 22.0001 4.85721 20.5077 4.85721 18.6669V8.38892Z"
          fill="url(#paint1_radial_935_1231)"
          fillOpacity="0.7"
        />
        <path
          d="M4.85721 11.1667C4.85721 9.78595 6.00865 8.66675 7.42881 8.66675H15.1432C14.1963 8.66675 13.4288 9.41315 13.4288 10.3335V13.6667C13.4288 14.5871 12.6613 15.3335 11.7144 15.3335H8.28602C6.3926 15.3335 4.85762 16.8259 4.85762 18.6667V11.1667H4.85721Z"
          fill="url(#paint2_linear_935_1231)"
        />
        <path
          d="M4.85721 11.1667C4.85721 9.78595 6.00865 8.66675 7.42881 8.66675H15.1432C14.1963 8.66675 13.4288 9.41315 13.4288 10.3335V13.6667C13.4288 14.5871 12.6613 15.3335 11.7144 15.3335H8.28602C6.3926 15.3335 4.85762 16.8259 4.85762 18.6667V11.1667H4.85721Z"
          fill="url(#paint3_linear_935_1231)"
          fillOpacity="0.3"
        />
        <path
          d="M4.85721 5.3332C4.85721 3.4924 6.39219 2 8.2856 2H15.1428V8.6668H8.2856C6.39219 8.6668 4.85721 10.1592 4.85721 12V5.3332Z"
          fill="url(#paint4_linear_935_1231)"
        />
        <path
          d="M4.85721 5.3332C4.85721 3.4924 6.39219 2 8.2856 2H15.1428V8.6668H8.2856C6.39219 8.6668 4.85721 10.1592 4.85721 12V5.3332Z"
          fill="url(#paint5_radial_935_1231)"
        />
        <path
          d="M4.85721 5.3332C4.85721 3.4924 6.39219 2 8.2856 2H15.1428V8.6668H8.2856C6.39219 8.6668 4.85721 10.1592 4.85721 12V5.3332Z"
          fill="url(#paint6_linear_935_1231)"
        />
        <path
          d="M20.2856 2H15.1428C14.196 2 13.4284 2.74607 13.4284 3.6664V7.0004C13.4284 7.92073 14.196 8.6668 15.1428 8.6668H20.2856C21.2324 8.6668 22 7.92073 22 7.0004V3.6664C22 2.74607 21.2324 2 20.2856 2Z"
          fill="url(#paint7_radial_935_1231)"
        />
        <path
          d="M9.2856 11.4443H3.8572C2.8315 11.4443 2 12.2526 2 13.2495V18.5279C2 19.5249 2.8315 20.3331 3.8572 20.3331H9.2856C10.3113 20.3331 11.1428 19.5249 11.1428 18.5279V13.2495C11.1428 12.2526 10.3113 11.4443 9.2856 11.4443Z"
          fill="url(#paint8_radial_935_1231)"
        />
        <path
          d="M9.2856 11.4443H3.8572C2.8315 11.4443 2 12.2526 2 13.2495V18.5279C2 19.5249 2.8315 20.3331 3.8572 20.3331H9.2856C10.3113 20.3331 11.1428 19.5249 11.1428 18.5279V13.2495C11.1428 12.2526 10.3113 11.4443 9.2856 11.4443Z"
          fill="url(#paint9_radial_935_1231)"
          fillOpacity="0.3"
        />
        <path
          d="M8.97449 18.4285H7.56503L6.68025 16.8097C6.64857 16.7529 6.62429 16.7081 6.60741 16.6749C6.59301 16.6397 6.57696 16.5993 6.56009 16.5545H6.54569C6.52387 16.6113 6.5033 16.6573 6.48396 16.6925C6.46462 16.7281 6.44157 16.7717 6.41482 16.8237L5.49713 18.4281H4.16791L5.76297 15.8849L4.27737 13.3489H5.66832L6.45474 14.7941C6.48643 14.8533 6.51318 14.9053 6.53499 14.9501C6.55927 14.9925 6.58355 15.0433 6.60783 15.1025H6.62223L6.70248 14.9397C6.72429 14.8997 6.7535 14.8465 6.78972 14.7805L7.60536 13.3497H8.93087L7.42346 15.8469L8.9749 18.4289L8.97449 18.4285Z"
          fill="white"
        />
      </g>
      <defs>
        <radialGradient
          id="paint0_radial_935_1231"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-16.1913 -16.5611 -13.215 12.212 22.0508 23.272)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.06" stopColor="#379539" />
          <stop offset="0.42" stopColor="#297C2D" />
          <stop offset="0.7" stopColor="#15561C" />
        </radialGradient>
        <radialGradient
          id="paint1_radial_935_1231"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-6.84561 -6.43461 -5.12074 5.14933 10.0424 11.7485)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#073B10" />
          <stop offset="0.99" stopColor="#084A13" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id="paint2_linear_935_1231"
          x1="4.85721"
          y1="13.6667"
          x2="12.7342"
          y2="13.6667"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#52D17C" />
          <stop offset="0.33" stopColor="#4AA647" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_935_1231"
          x1="10"
          y1="8.66675"
          x2="10"
          y2="15.6127"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#29852F" />
          <stop offset="0.5" stopColor="#4AA647" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_935_1231"
          x1="5.31235"
          y1="10.1912"
          x2="14.5842"
          y2="1.91769"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#66D052" />
          <stop offset="1" stopColor="#85E972" />
        </linearGradient>
        <radialGradient
          id="paint5_radial_935_1231"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(14.8836 6.12436) rotate(180) scale(5.15588 10.6064)"
        >
          <stop offset="0.29" stopColor="#4EB43B" />
          <stop offset="1" stopColor="#72CC61" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id="paint6_linear_935_1231"
          x1="9.49425"
          y1="7"
          x2="4.85721"
          y2="7"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.18" stopColor="#C0E075" stopOpacity="0" />
          <stop offset="1" stopColor="#D1EB95" />
        </linearGradient>
        <radialGradient
          id="paint7_radial_935_1231"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-9.66452 -7.60162 7.79733 -9.36933 23.2066 9.68401)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.44" stopColor="#79E96D" />
          <stop offset="1" stopColor="#D0EB76" />
        </radialGradient>
        <radialGradient
          id="paint8_radial_935_1231"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(9.14108 8.88824 26.0318 -25.3065 2.2686 11.492)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#20A85E" />
          <stop offset="0.94" stopColor="#09442A" />
        </radialGradient>
        <radialGradient
          id="paint9_radial_935_1231"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(6.67576 16.7782) rotate(90) scale(6.22272 7.3737)"
        >
          <stop offset="0.58" stopColor="#33A662" stopOpacity="0" />
          <stop offset="0.97" stopColor="#98F0B0" />
        </radialGradient>
        <clipPath id="clip0_935_1231">
          <rect width="20" height="20" fill="white" transform="translate(2 2)" />
        </clipPath>
      </defs>
    </svg>
  ),
);
LogoXlsx.displayName = "LogoXlsx";
