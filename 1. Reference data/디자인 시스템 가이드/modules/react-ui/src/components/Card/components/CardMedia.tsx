import { useContext } from "react";
import { cn } from "@/utils/cn";
import { CardContext } from "../context";
import type { CardMediaProps } from "../types";

export const CardMedia = ({ className, children, ...rest }: CardMediaProps) => {
  // 카드 variant에 따라 미디어 영역 크기 결정
  const { variant } = useContext(CardContext);

  return (
    <div
      className={cn(
        "relative overflow-hidden shrink-0",
        variant === "vertical"
          ? "w-full h-[160rem] rounded-t-[8rem]"
          : "w-[210rem] self-stretch rounded-l-[8rem]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
