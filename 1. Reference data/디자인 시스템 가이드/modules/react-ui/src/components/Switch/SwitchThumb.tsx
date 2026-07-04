import { cn } from "../../utils/cn";

/** 스위치의 원형 핸들. ON/OFF에 따라 좌우로 슬라이드됩니다. */
export default function SwitchThumb({
  value,
  size,
  disabled,
}: {
  value?: boolean;
  size: "lg" | "md" | "sm";
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute inset-y-0 my-auto left-[2rem] rounded-full",
        "transition-transform duration-200 ease-out",
        value ? "translate-x-[calc(100%_-_4rem)]" : "translate-x-0",
        // elevation
        disabled
          ? "bg-[var(--color-text-disabled)]"
          : "bg-white shadow-[var(--elevation-01)]",
        {
          // size
          "size-[20rem]": size === "lg",
          "size-[16rem]": size === "md",
          "size-[12rem]": size === "sm",
        },
      )}
    />
  );
}
