import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconProfileFill = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M12 12C10.625 12 9.44792 11.5104 8.46875 10.5312C7.48958 9.55208 7 8.375 7 7C7 5.625 7.48958 4.44792 8.46875 3.46875C9.44792 2.48958 10.625 2 12 2C13.375 2 14.5521 2.48958 15.5312 3.46875C16.5104 4.44792 17 5.625 17 7C17 8.375 16.5104 9.55208 15.5312 10.5312C14.5521 11.5104 13.375 12 12 12ZM19.5 22H4.5C3.8125 22 3.22417 21.7554 2.735 21.2663C2.245 20.7763 2 20.1875 2 19.5V18.5C2 17.7917 2.1825 17.1404 2.5475 16.5463C2.91167 15.9529 3.39583 15.5 4 15.1875C5.29167 14.5417 6.60417 14.0571 7.9375 13.7338C9.27083 13.4113 10.625 13.25 12 13.25C13.375 13.25 14.7292 13.4113 16.0625 13.7338C17.3958 14.0571 18.7083 14.5417 20 15.1875C20.6042 15.5 21.0883 15.9529 21.4525 16.5463C21.8175 17.1404 22 17.7917 22 18.5V19.5C22 20.1875 21.7554 20.7763 21.2663 21.2663C20.7763 21.7554 20.1875 22 19.5 22Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconProfileFill.displayName = "IconProfileFill";
