import { cn } from "@/utils/cn";
import type { CardFooterProps } from "../types";

export const CardFooter = ({
  className,
  children,
  ...rest
}: CardFooterProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-end px-[20rem] py-[12rem] w-full shrink-0 box-border",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
