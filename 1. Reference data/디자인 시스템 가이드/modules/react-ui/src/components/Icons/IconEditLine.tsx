import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconEditLine = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M4.18866 19.7971H5.72072L15.1593 10.3585L13.6272 8.82642L4.18866 18.265V19.7971ZM19.8376 8.7717L15.1867 4.17552L16.7187 2.64346C17.1382 2.22397 17.6536 2.01422 18.265 2.01422C18.8756 2.01422 19.3907 2.22397 19.8102 2.64346L21.3423 4.17552C21.7618 4.59501 21.9806 5.10132 21.9989 5.69445C22.0171 6.28685 21.8165 6.79279 21.397 7.21228L19.8376 8.7717ZM3.09433 21.9857C2.78427 21.9857 2.52455 21.8807 2.31517 21.6706C2.10506 21.4612 2 21.2015 2 20.8914V17.7999C2 17.654 2.02736 17.5128 2.08207 17.3764C2.13679 17.2393 2.21887 17.116 2.3283 17.0065L13.5999 5.73494L18.2508 10.3858L6.9792 21.6574C6.86976 21.7669 6.74683 21.8489 6.61041 21.9036C6.47325 21.9584 6.33172 21.9857 6.18581 21.9857H3.09433Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconEditLine.displayName = "IconEditLine";
