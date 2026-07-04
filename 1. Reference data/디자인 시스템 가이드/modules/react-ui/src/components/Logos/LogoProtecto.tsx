import { forwardRef } from "react";
import type { LogoProps } from "./types";
import { cn } from "@/utils/cn";

export const LogoProtecto = forwardRef<SVGSVGElement, LogoProps>(
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
        d="M19.7476 11.9976H8.36381C6.5675 11.9976 5.1113 13.4538 5.1113 15.2501C5.1113 17.0464 6.5675 18.5026 8.36381 18.5026H19.7476C21.5439 18.5026 23.0001 17.0464 23.0001 15.2501C23.0001 13.4538 21.5439 11.9976 19.7476 11.9976Z"
        fill="url(#paint0_linear_901_14023)"
      />
      <path
        opacity="0.25"
        d="M23.0001 15.2501C23.0001 13.4538 21.5439 11.9976 19.7476 11.9976C17.9512 11.9976 16.495 13.4538 16.495 15.2501C16.495 17.0464 17.9512 18.5026 19.7476 18.5026C21.5439 18.5026 23.0001 17.0464 23.0001 15.2501Z"
        fill="white"
      />
      <path
        d="M15.6363 5.49243H4.25251C2.4562 5.49243 1 6.94863 1 8.74495C1 10.5413 2.4562 11.9975 4.25251 11.9975H15.6363C17.4326 11.9975 18.8888 10.5413 18.8888 8.74495C18.8888 6.94863 17.4326 5.49243 15.6363 5.49243Z"
        fill="url(#paint1_linear_901_14023)"
      />
      <path
        opacity="0.6"
        d="M13.4699 6.32349L6.19588 12.8272C4.85677 14.0245 4.74181 16.0807 5.93912 17.4198C7.13642 18.7589 9.19258 18.8739 10.5317 17.6766L17.8057 11.1728C19.1448 9.97553 19.2598 7.91937 18.0625 6.58026C16.8652 5.24115 14.809 5.12619 13.4699 6.32349Z"
        fill="#409CFF"
      />
      <path
        opacity="0.25"
        d="M7.50503 8.74495C7.50503 6.94863 6.04883 5.49243 4.25251 5.49243C2.4562 5.49243 1 6.94863 1 8.74495C1 10.5413 2.4562 11.9975 4.25251 11.9975C6.04883 11.9975 7.50503 10.5413 7.50503 8.74495Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_901_14023"
          x1="5.1113"
          y1="15.2501"
          x2="23.0001"
          y2="15.2501"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#61FCFF" />
          <stop offset="0.1" stopColor="#50CBFF" />
          <stop offset="0.23" stopColor="#3E95FF" />
          <stop offset="0.37" stopColor="#2F68FF" />
          <stop offset="0.5" stopColor="#2242FF" />
          <stop offset="0.63" stopColor="#1825FF" />
          <stop offset="0.75" stopColor="#1110FF" />
          <stop offset="0.88" stopColor="#0D04FF" />
          <stop offset="1" stopColor="#0C00FF" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_901_14023"
          x1="1"
          y1="8.74495"
          x2="18.8888"
          y2="8.74495"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF0DBC" />
          <stop offset="1" stopColor="#6300FF" />
        </linearGradient>
      </defs>
    </svg>
  ),
);
LogoProtecto.displayName = "LogoProtecto";
