import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconEditFill = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M15.1867 4.17552L19.8376 8.7717L21.397 7.21228C21.8165 6.79279 22.0171 6.28685 21.9989 5.69445C21.9806 5.10132 21.7618 4.59501 21.3423 4.17552L19.8102 2.64346C19.3907 2.22397 18.8756 2.01422 18.265 2.01422C17.6536 2.01422 17.1382 2.22397 16.7187 2.64346L15.1867 4.17552Z" fill={pathFill ?? "currentColor"}/>
      <path d="M2.31517 21.6706C2.52455 21.8807 2.78427 21.9857 3.09433 21.9857H6.18581C6.33172 21.9857 6.47325 21.9584 6.61041 21.9036C6.74683 21.8489 6.86976 21.7669 6.9792 21.6574L18.2508 10.3858L13.5999 5.73494L2.3283 17.0065C2.21887 17.116 2.13679 17.2393 2.08207 17.3764C2.02736 17.5128 2 17.654 2 17.7999V20.8914C2 21.2015 2.10506 21.4612 2.31517 21.6706Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconEditFill.displayName = "IconEditFill";
