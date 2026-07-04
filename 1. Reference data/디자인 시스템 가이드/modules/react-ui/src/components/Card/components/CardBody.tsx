import { cn } from "@/utils/cn";
import type { CardBodyProps } from "../types";

export const CardBody = ({
  divider = false,
  className,
  children,
  ...rest
}: CardBodyProps) => {
  return (
    <div
      className={cn(
        "flex flex-col px-[20rem] py-[12rem] w-full shrink-0 box-border",
        divider && "border-b border-[var(--color-border-default)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
