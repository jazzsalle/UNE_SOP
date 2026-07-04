import type { SwitchProps } from ".";
import { cn } from "../../utils/cn";

/** 스위치의 트랙(배경) 영역. ON/OFF 상태에 따라 배경색이 변경됩니다. */
export default function SwitchTrack({
  value,
  setValue,
  disabled,
  size = "md",
  ref,
  ...props
}: SwitchProps) {
  // 다크모드는 시맨틱 토큰이 자동 처리
  const switchTrackStyles = {
    on: `
        bg-[var(--color-interactive-brand)]
        hover:bg-[var(--color-interactive-brand-hover)]
        `,
    off: `
        bg-[var(--color-bg-neutral)]
        hover:bg-[var(--color-bg-neutral-hover)]
        `,
    disabled: `
        pointer-events-none
        cursor-not-allowed
        bg-[var(--color-bg-disabled)]
        `,
  };

  // 현재 트랙 상태
  const trackState = disabled ? "disabled" : value ? "on" : "off";

  return (
    <div
      ref={ref}
      className={cn(
        "relative box-border flex items-center transition-colors duration-500",
        "rounded-full",
        {
          // size
          "h-[24rem] w-[40rem] p-[2rem]": size === "lg",
          "h-[20rem] w-[32rem] p-[2rem]": size === "md",
          "h-[16rem] w-[24rem] p-[2rem]": size === "sm",
        },
        switchTrackStyles[trackState],
        // focus-visible (키보드 포커스 링)
        !disabled && "peer-focus-visible:shadow-[var(--selected-shadow)]",
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}
