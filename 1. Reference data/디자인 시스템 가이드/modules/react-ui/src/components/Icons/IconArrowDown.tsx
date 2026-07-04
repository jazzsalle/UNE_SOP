import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconArrowDown = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M10.7075 17.634V3.28411C10.7075 2.92028 10.8306 2.6153 11.0767 2.36918C11.3228 2.12306 11.6278 2 11.9917 2C12.3555 2 12.6605 2.12306 12.9066 2.36918C13.1527 2.6153 13.2758 2.92028 13.2758 3.28411V17.634L19.5679 11.3419C19.8247 11.0851 20.1243 10.962 20.4668 10.9727C20.8092 10.9834 21.1088 11.1172 21.3657 11.374C21.6011 11.6308 21.7241 11.9304 21.7348 12.2729C21.7455 12.6153 21.6225 12.9149 21.3657 13.1717L12.8905 21.6469C12.7621 21.7753 12.623 21.8662 12.4732 21.9197C12.3234 21.9732 12.1629 22 11.9917 22C11.8204 22 11.6599 21.9732 11.5101 21.9197C11.3603 21.8662 11.2212 21.7753 11.0928 21.6469L2.61766 13.1717C2.38224 12.9363 2.26453 12.6421 2.26453 12.2889C2.26453 11.9358 2.38224 11.6308 2.61766 11.374C2.87448 11.1172 3.17945 10.9888 3.53258 10.9888C3.88571 10.9888 4.19069 11.1172 4.44751 11.374L10.7075 17.634Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconArrowDown.displayName = "IconArrowDown";
