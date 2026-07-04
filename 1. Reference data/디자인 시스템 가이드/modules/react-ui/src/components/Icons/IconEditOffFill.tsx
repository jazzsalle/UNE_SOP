import { forwardRef } from "react";
import type { IconProps } from "./types";
import { cn } from "@/utils/cn";

export const IconEditOffFill = forwardRef<SVGSVGElement, IconProps>(
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
      <path d="M2.35059 2.51471C2.76057 2.10493 3.42496 2.10496 3.83496 2.51471L10.3203 9.00006L13.5996 5.72174L18.251 10.3721L14.9717 13.6514L21.5273 20.2071C21.9373 20.6171 21.9372 21.2814 21.5273 21.6915C21.1173 22.1015 20.453 22.1015 20.043 21.6915L13.4873 15.1358L6.97949 21.6436C6.87008 21.753 6.74675 21.835 6.61035 21.8897C6.4732 21.9444 6.33146 21.9717 6.18555 21.9717H3.09473C2.78482 21.9717 2.52476 21.8672 2.31543 21.6573C2.10537 21.448 2.00005 21.188 2 20.878V17.7862C2.00001 17.6403 2.02733 17.4988 2.08203 17.3624C2.13671 17.2255 2.21891 17.1025 2.32812 16.9932L8.83594 10.4844L2.35059 3.99908C1.94077 3.58902 1.94061 2.92468 2.35059 2.51471Z" fill={pathFill ?? "currentColor"}/>
      <path d="M18.2646 2.00104C18.8753 2.00104 19.3911 2.21045 19.8105 2.62994L21.3418 4.16217C21.7613 4.58164 21.9808 5.08765 21.999 5.68073C22.0173 6.27292 21.8167 6.77889 21.3975 7.1983L19.8379 8.75787L15.1865 4.16217L16.7188 2.62994C17.1382 2.21053 17.6534 2.00112 18.2646 2.00104Z" fill={pathFill ?? "currentColor"}/>
    </svg>
  ),
);
IconEditOffFill.displayName = "IconEditOffFill";
