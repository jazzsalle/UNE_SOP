import { forwardRef } from "react";
import type { LogoProps } from "./types";
import { cn } from "@/utils/cn";

export const LogoDocx = forwardRef<SVGSVGElement, LogoProps>(
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
      <g clipPath="url(#clip0_935_1230)">
        <path
          d="M4.85721 17.0501L12.8572 7.55566L22 13.7253V20.0557C22 21.1297 21.1045 22.0001 20 22.0001H8.2856C6.39219 22.0001 4.85721 20.5077 4.85721 18.6669V17.0501Z"
          fill="url(#paint0_radial_935_1230)"
        />
        <path
          d="M4.85721 10.3547C4.85721 8.97394 6.00865 7.85474 7.42881 7.85474H19.0794L22 6.44434V13.3887C22 14.4627 21.1045 15.3331 20 15.3331H8.2856C6.39219 15.3331 4.85721 16.8255 4.85721 18.6663V10.3543V10.3547Z"
          fill="url(#paint1_linear_935_1230)"
        />
        <path
          d="M4.85721 10.3547C4.85721 8.97394 6.00865 7.85474 7.42881 7.85474H19.0794L22 6.44434V13.3887C22 14.4627 21.1045 15.3331 20 15.3331H8.2856C6.39219 15.3331 4.85721 16.8255 4.85721 18.6663V10.3543V10.3547Z"
          fill="url(#paint2_radial_935_1230)"
          fillOpacity="0.6"
        />
        <path
          d="M4.85721 10.3547C4.85721 8.97394 6.00865 7.85474 7.42881 7.85474H19.0794L22 6.44434V13.3887C22 14.4627 21.1045 15.3331 20 15.3331H8.2856C6.39219 15.3331 4.85721 16.8255 4.85721 18.6663V10.3543V10.3547Z"
          fill="url(#paint3_radial_935_1230)"
          fillOpacity="0.1"
        />
        <path
          d="M4.85721 5.3332C4.85721 3.4924 6.39219 2 8.2856 2H20C21.1045 2 22 2.8704 22 3.9444V6.722C22 7.796 21.1045 8.6664 20 8.6664H8.2856C6.39219 8.6664 4.85721 10.1588 4.85721 11.9996V5.3332Z"
          fill="url(#paint4_linear_935_1230)"
        />
        <path
          d="M4.85721 5.3332C4.85721 3.4924 6.39219 2 8.2856 2H20C21.1045 2 22 2.8704 22 3.9444V6.722C22 7.796 21.1045 8.6664 20 8.6664H8.2856C6.39219 8.6664 4.85721 10.1588 4.85721 11.9996V5.3332Z"
          fill="url(#paint5_radial_935_1230)"
          fillOpacity="0.8"
        />
        <path
          d="M9.2856 11.4443H3.8572C2.8315 11.4443 2 12.2526 2 13.2495V18.5279C2 19.5249 2.8315 20.3331 3.8572 20.3331H9.2856C10.3113 20.3331 11.1428 19.5249 11.1428 18.5279V13.2495C11.1428 12.2526 10.3113 11.4443 9.2856 11.4443Z"
          fill="url(#paint6_radial_935_1230)"
        />
        <path
          d="M9.2856 11.4443H3.8572C2.8315 11.4443 2 12.2526 2 13.2495V18.5279C2 19.5249 2.8315 20.3331 3.8572 20.3331H9.2856C10.3113 20.3331 11.1428 19.5249 11.1428 18.5279V13.2495C11.1428 12.2526 10.3113 11.4443 9.2856 11.4443Z"
          fill="url(#paint7_radial_935_1230)"
          fillOpacity="0.65"
        />
        <path
          d="M9.70616 13.3491L8.58106 18.4279L7.23579 18.4287L6.57159 15.3811L5.87612 18.4287H4.5181L3.43661 13.3499H4.54567L5.21275 16.7015L5.87571 13.3499H7.23538L7.92962 16.7015L8.58065 13.3499L9.70575 13.3491H9.70616Z"
          fill="white"
        />
      </g>
      <defs>
        <radialGradient
          id="paint0_radial_935_1230"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(21.5728 21.9797) scale(27.1855 11.1953)"
        >
          <stop offset="0.18" stopColor="#1657F4" />
          <stop offset="0.57" stopColor="#0036C4" />
        </radialGradient>
        <linearGradient
          id="paint1_linear_935_1230"
          x1="4.85721"
          y1="12.5555"
          x2="17.9856"
          y2="12.5555"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#66C0FF" />
          <stop offset="0.26" stopColor="#0094F0" />
        </linearGradient>
        <radialGradient
          id="paint2_radial_935_1230"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-11.5607 11.8248 29.9558 27.6815 21.9708 6.85971)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.14" stopColor="#D471FF" />
          <stop offset="0.83" stopColor="#509DF5" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="paint3_radial_935_1230"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(19.3635 14.7827) rotate(90) scale(10.3453 58.0865)"
        >
          <stop offset="0.28" stopColor="#4F006F" stopOpacity="0" />
          <stop offset="1" stopColor="#4F006F" />
        </radialGradient>
        <linearGradient
          id="paint4_linear_935_1230"
          x1="4.85927"
          y1="6.8784"
          x2="21.9973"
          y2="7.16968"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9DEAFF" />
          <stop offset="0.2" stopColor="#3BD5FF" />
        </linearGradient>
        <radialGradient
          id="paint5_radial_935_1230"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-16.4146 3.72753 9.18322 38.2191 22.1674 2.16353)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.06" stopColor="#E4A7FE" />
          <stop offset="0.54" stopColor="#E4A7FE" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="paint6_radial_935_1230"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(9.14108 8.88824 9.14268 -8.88669 2.06969 11.6757)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.08" stopColor="#367AF2" />
          <stop offset="0.87" stopColor="#001A8F" />
        </radialGradient>
        <radialGradient
          id="paint7_radial_935_1230"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(6.49564 16.7782) rotate(90) scale(6.22272 7.29368)"
        >
          <stop offset="0.59" stopColor="#2763E5" stopOpacity="0" />
          <stop offset="0.97" stopColor="#58AAFE" />
        </radialGradient>
        <clipPath id="clip0_935_1230">
          <rect width="20" height="20" fill="white" transform="translate(2 2)" />
        </clipPath>
      </defs>
    </svg>
  ),
);
LogoDocx.displayName = "LogoDocx";
