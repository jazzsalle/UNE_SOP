import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconStarFill = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M12 17.9772L17.1041 21.8118C17.472 22.0552 17.8399 22.0625 18.2077 21.8337C18.5756 21.606 18.6829 21.2792 18.5296 20.8531L16.5983 14.5079L21.6105 10.9472C21.9784 10.6734 22.0857 10.3307 21.9324 9.91922C21.7791 9.50899 21.4879 9.30387 21.0587 9.30387H14.9429L12.8737 2.63909C12.7204 2.21303 12.4292 2 12 2C11.5708 2 11.2796 2.21303 11.1263 2.63909L9.05707 9.30387H2.9413C2.51213 9.30387 2.2209 9.50899 2.06762 9.91922C1.91434 10.3307 2.02164 10.6734 2.38951 10.9472L7.40168 14.5079L5.47038 20.8531C5.3171 21.2792 5.4244 21.606 5.79226 21.8337C6.16013 22.0625 6.528 22.0552 6.89586 21.8118L12 17.9772Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconStarFill.displayName = "IconStarFill";
