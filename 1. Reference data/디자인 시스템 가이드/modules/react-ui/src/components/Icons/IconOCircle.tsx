import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconOCircle = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M12.003 6.24764C8.83663 6.24764 6.24769 8.83658 6.24769 12.003C6.24769 15.1694 8.83663 17.7523 12.003 17.7523C15.1694 17.7523 17.7523 15.1694 17.7523 12.003C17.7523 8.83658 15.1694 6.24764 12.003 6.24764ZM12.003 7.89116C14.2814 7.89116 16.1088 9.72459 16.1088 12.003C16.1088 14.2814 14.2814 16.1087 12.003 16.1087C9.72463 16.1087 7.8912 14.2814 7.8912 12.003C7.8912 9.72459 9.72463 7.89116 12.003 7.89116Z" fill={pathFill ?? "currentColor"}/>
      <path d="M12.0034 2C6.49263 2 2 6.49263 2 12.0034C2 17.5141 6.49263 22 12.0034 22C17.5141 22 22 17.5141 22 12.0034C22 6.49263 17.5141 2 12.0034 2ZM12.0034 3.81818C16.5317 3.81818 20.1818 7.47501 20.1818 12.0034C20.1818 16.5317 16.5317 20.1818 12.0034 20.1818C7.47501 20.1818 3.81818 16.5317 3.81818 12.0034C3.81818 7.47501 7.47501 3.81818 12.0034 3.81818Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconOCircle.displayName = "IconOCircle";
