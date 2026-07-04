import { forwardRef } from "react";
import type { LogoProps } from "./types";
import { cn } from "@/utils/cn";

export const LogoPptx = forwardRef<SVGSVGElement, LogoProps>(
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
      <g clipPath="url(#clip0_935_1232)">
        <mask
          id="mask0_935_1232"
          style={{ maskType: "luminance" }}
          maskUnits="userSpaceOnUse"
          x="2"
          y="2"
          width="20"
          height="20"
        >
          <path
            d="M12.3216 21.5C17.6657 21.5 21.9979 17.2467 21.9979 12C21.9979 6.75329 17.6657 2.5 12.3216 2.5C6.97744 2.5 2.64517 6.75329 2.64517 12C2.64517 17.2467 6.97744 21.5 12.3216 21.5Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask0_935_1232)">
          <path
            d="M12.3216 21.8801C17.88 21.8801 22.3861 17.4567 22.3861 12.0001C22.3861 6.54354 17.88 2.12012 12.3216 2.12012C6.76309 2.12012 2.25705 6.54354 2.25705 12.0001C2.25705 17.4567 6.76309 21.8801 12.3216 21.8801Z"
            fill="url(#paint0_linear_935_1232)"
          />
          <path
            d="M12.3216 21.8801C17.88 21.8801 22.3861 17.4567 22.3861 12.0001C22.3861 6.54354 17.88 2.12012 12.3216 2.12012C6.76309 2.12012 2.25705 6.54354 2.25705 12.0001C2.25705 17.4567 6.76309 21.8801 12.3216 21.8801Z"
            fill="url(#paint1_radial_935_1232)"
          />
          <path
            d="M12.3216 21.8801C17.88 21.8801 22.3861 17.4567 22.3861 12.0001C22.3861 6.54354 17.88 2.12012 12.3216 2.12012C6.76309 2.12012 2.25705 6.54354 2.25705 12.0001C2.25705 17.4567 6.76309 21.8801 12.3216 21.8801Z"
            fill="url(#paint2_radial_935_1232)"
            fillOpacity="0.5"
          />
          <path
            d="M12.3231 2.50001C17.6671 2.50001 21.9995 6.75348 21.9995 12C21.9995 13.7455 21.5195 15.38 20.6823 16.7855L20.8398 16.4435C21.7972 14.356 20.2411 11.9944 17.9087 11.996L14.0573 11.999C13.5976 11.999 13.1568 11.8198 12.8316 11.5009C12.5064 11.182 12.3235 10.7494 12.3231 10.2981V6.51028C12.3231 4.22015 9.91434 2.69356 7.78841 3.63748L7.47873 3.77428C8.95055 2.93699 10.622 2.49733 12.3231 2.50001Z"
            fill="url(#paint3_linear_935_1232)"
          />
          <path
            d="M12.3231 2.50001C17.6671 2.50001 21.9995 6.75348 21.9995 12C21.9995 13.7455 21.5195 15.38 20.6823 16.7855L20.8398 16.4435C21.7972 14.356 20.2411 11.9944 17.9087 11.996L14.0573 11.999C13.5976 11.999 13.1568 11.8198 12.8316 11.5009C12.5064 11.182 12.3235 10.7494 12.3231 10.2981V6.51028C12.3231 4.22015 9.91434 2.69356 7.78841 3.63748L7.47873 3.77428C8.95055 2.93699 10.622 2.49733 12.3231 2.50001Z"
            fill="url(#paint4_radial_935_1232)"
          />
          <path
            d="M12.3231 2.50001C17.6671 2.50001 21.9995 6.75348 21.9995 12C21.9995 13.7455 21.5195 15.38 20.6823 16.7855L20.8398 16.4435C21.7972 14.356 20.2411 11.9944 17.9087 11.996L14.0573 11.999C13.5976 11.999 13.1568 11.8198 12.8316 11.5009C12.5064 11.182 12.3235 10.7494 12.3231 10.2981V6.51028C12.3231 4.22015 9.91434 2.69356 7.78841 3.63748L7.47873 3.77428C8.95055 2.93699 10.622 2.49733 12.3231 2.50001Z"
            fill="url(#paint5_radial_935_1232)"
            fillOpacity="0.8"
          />
          <path
            d="M12.3231 2.50001C17.6671 2.50001 21.9995 6.75348 21.9995 12C21.9995 13.7455 21.5195 15.38 20.6823 16.7855L20.8398 16.4435C21.7972 14.356 20.2411 11.9944 17.9087 11.996L14.0573 11.999C13.5976 11.999 13.1568 11.8198 12.8316 11.5009C12.5064 11.182 12.3235 10.7494 12.3231 10.2981V6.51028C12.3231 4.22015 9.91434 2.69356 7.78841 3.63748L7.47873 3.77428C8.95055 2.93699 10.622 2.49733 12.3231 2.50001Z"
            fill="url(#paint6_radial_935_1232)"
          />
          <path
            d="M12.3231 2.50001C17.6671 2.50001 21.9995 6.75348 21.9995 12C21.9995 13.7455 21.5195 15.38 20.6823 16.7855L20.8398 16.4435C21.7972 14.356 20.2411 11.9944 17.9087 11.996L14.0573 11.999C13.5976 11.999 13.1568 11.8198 12.8316 11.5009C12.5064 11.182 12.3235 10.7494 12.3231 10.2981V6.51028C12.3231 4.22015 9.91434 2.69356 7.78841 3.63748L7.47873 3.77428C8.95055 2.93699 10.622 2.49733 12.3231 2.50001Z"
            fill="url(#paint7_radial_935_1232)"
          />
        </g>
        <path
          d="M8.58065 11.4934H3.67742C2.75101 11.4934 2 12.2306 2 13.1401V17.9534C2 18.8628 2.75101 19.6001 3.67742 19.6001H8.58065C9.50706 19.6001 10.2581 18.8628 10.2581 17.9534V13.1401C10.2581 12.2306 9.50706 11.4934 8.58065 11.4934Z"
          fill="url(#paint8_radial_935_1232)"
        />
        <path
          d="M8.58065 11.4934H3.67742C2.75101 11.4934 2 12.2306 2 13.1401V17.9534C2 18.8628 2.75101 19.6001 3.67742 19.6001H8.58065C9.50706 19.6001 10.2581 18.8628 10.2581 17.9534V13.1401C10.2581 12.2306 9.50706 11.4934 8.58065 11.4934Z"
          fill="url(#paint9_radial_935_1232)"
          fillOpacity="0.3"
        />
        <path
          d="M5.72646 16.3543V17.8626H4.66324V13.2312H6.30453C6.89223 13.2312 7.33954 13.357 7.64646 13.6087C7.95614 13.8606 8.11081 14.2344 8.11046 14.7299C8.11046 15.24 7.93722 15.6384 7.59072 15.9251C7.24664 16.2116 6.78384 16.3548 6.20234 16.3548L5.72646 16.3543ZM5.72646 14.0317V15.5533H6.17034C6.43356 15.5533 6.6364 15.4854 6.77885 15.3496C6.9213 15.2138 6.99253 15.0189 6.99253 14.7649C6.99253 14.5305 6.92234 14.3496 6.78195 14.2222C6.64363 14.0952 6.44526 14.0317 6.18685 14.0317H5.72646Z"
          fill="white"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_935_1232"
          x1="11.3399"
          y1="1.89516"
          x2="-0.306802"
          y2="13.2455"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.058" stopColor="#FF7F48" />
          <stop offset="1" stopColor="#E5495B" />
        </linearGradient>
        <radialGradient
          id="paint1_radial_935_1232"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-13.739 13.4871 -23.1245 -22.7006 16.1467 8.01259)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.152" stopColor="#AA1D2D" />
          <stop offset="0.381" stopColor="#D12B18" stopOpacity="0.44" />
          <stop offset="0.602" stopColor="#FF3C00" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="paint2_radial_935_1232"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(16.6542 -7.7222 14.2512 29.6183 -0.73237 19.7222)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.407" stopColor="#FF66FB" />
          <stop offset="1" stopColor="#EA3D01" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id="paint3_linear_935_1232"
          x1="14.1543"
          y1="14.1138"
          x2="24.4324"
          y2="6.35415"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.311" stopColor="#FF6E30" />
          <stop offset="0.635" stopColor="#FFA05C" />
        </linearGradient>
        <radialGradient
          id="paint4_radial_935_1232"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(12.2446 2.51879 -2.44612 11.4593 10.6971 13.1361)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.786" stopColor="#FFA05C" stopOpacity="0" />
          <stop offset="0.905" stopColor="#FFCE84" />
        </radialGradient>
        <radialGradient
          id="paint5_radial_935_1232"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(10.5707 -6.78993 6.61455 9.92353 12.6597 11.8573)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.295" stopColor="#FF99E9" />
          <stop offset="0.728" stopColor="#FF99E9" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="paint6_radial_935_1232"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(8.84794 -9.94401 9.25125 7.93247 11.2408 13.3077)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FD6EF9" />
          <stop offset="0.637" stopColor="#FF9944" />
          <stop offset="0.852" stopColor="#FCC479" />
        </radialGradient>
        <radialGradient
          id="paint7_radial_935_1232"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-0.999427 6.64812 -15.3055 -2.21731 10.3608 3.75553)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.144" stopColor="#FF8D13" />
          <stop offset="0.537" stopColor="#FF7F29" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="paint8_radial_935_1232"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(8.25806 8.10666 -8.25806 8.10666 1.99903 11.4932)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F8193E" />
          <stop offset="0.939" stopColor="#920616" />
        </radialGradient>
        <radialGradient
          id="paint9_radial_935_1232"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(6.128 16.3574) rotate(90) scale(5.67467 6.58064)"
        >
          <stop offset="0.576" stopColor="#FFB055" stopOpacity="0" />
          <stop offset="0.974" stopColor="#FFF2BE" />
        </radialGradient>
        <clipPath id="clip0_935_1232">
          <rect width="20" height="19" fill="white" transform="translate(2 2.5)" />
        </clipPath>
      </defs>
    </svg>
  ),
);
LogoPptx.displayName = "LogoPptx";
