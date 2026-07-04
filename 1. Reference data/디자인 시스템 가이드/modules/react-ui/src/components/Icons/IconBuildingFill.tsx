import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconBuildingFill = forwardRef<SVGSVGElement, IconProps>(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M20 20V5C20 4.20435 19.6839 3.44129 19.1213 2.87868C18.5587 2.31607 17.7956 2 17 2H7C6.20435 2 5.44129 2.31607 4.87868 2.87868C4.31607 3.44129 4 4.20435 4 5V20H3C2.44772 20 2 20.4477 2 21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21C22 20.4477 21.5523 20 21 20H20ZM8 8C8 7.44772 8.44772 7 9 7H10C10.5523 7 11 7.44772 11 8C11 8.55228 10.5523 9 10 9H9C8.44772 9 8 8.55228 8 8ZM13 8C13 7.44772 13.4477 7 14 7H15C15.5523 7 16 7.44772 16 8C16 8.55228 15.5523 9 15 9H14C13.4477 9 13 8.55228 13 8ZM8 12C8 11.4477 8.44772 11 9 11H10C10.5523 11 11 11.4477 11 12C11 12.5523 10.5523 13 10 13H9C8.44772 13 8 12.5523 8 12ZM13 12C13 11.4477 13.4477 11 14 11H15C15.5523 11 16 11.4477 16 12C16 12.5523 15.5523 13 15 13H14C13.4477 13 13 12.5523 13 12ZM8 16C8 15.4477 8.44772 15 9 15H10C10.5523 15 11 15.4477 11 16C11 16.5523 10.5523 17 10 17H9C8.44772 17 8 16.5523 8 16ZM13 16C13 15.4477 13.4477 15 14 15H15C15.5523 15 16 15.4477 16 16C16 16.5523 15.5523 17 15 17H14C13.4477 17 13 16.5523 13 16Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconBuildingFill.displayName = "IconBuildingFill";
