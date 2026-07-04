import { cn } from "@/utils/cn";

export type ButtonVariant = "fill" | "outline" | "ghost";
export type ButtonColor = "primary" | "grayscale";

export const baseClass = cn(
  "inline-flex items-center justify-center select-none font-normal cursor-pointer border-none",
  "transition-[color,background-color,border-color,box-shadow] duration-200",
  "disabled:cursor-not-allowed",
  // focus / selected shadow — --selected-shadow 가 light/dark 자동 전환
  "focus:not-active:not-disabled:shadow-[var(--selected-shadow)] focus:outline-none",
  "disabled:shadow-none",
);

export const selectedStyle = "shadow-[var(--selected-shadow)]";

export const variantStyles: Record<
  ButtonVariant,
  Record<ButtonColor, string>
> = {
  fill: {
    primary: cn(
      // fill - primary / 다크모드는 시맨틱 토큰이 자동 처리
      "bg-[var(--color-interactive-brand)] text-white",
      "hover:not-focus:not-[data-selected]:not-disabled:bg-[var(--color-interactive-brand-hover)]",
      "active:bg-[var(--color-interactive-brand-pressed)]",
      "disabled:bg-[var(--color-bg-disabled)] disabled:text-[var(--color-text-disabled)]",
    ),
    grayscale: cn(
      // fill - grayscale / 다크모드는 시맨틱 토큰이 자동 처리
      "bg-[var(--color-interactive-neutral)] text-[var(--color-control-text)]",
      "hover:not-focus:not-[data-selected]:not-disabled:bg-[var(--color-interactive-neutral-hover)]",
      "hover:not-focus:not-[data-selected]:not-disabled:text-[var(--color-text-default)]",
      "active:bg-[var(--color-interactive-neutral-pressed)] active:text-[var(--color-text-default)]",
      "disabled:bg-[var(--color-bg-disabled)] disabled:text-[var(--color-text-disabled)]",
    ),
  },
  outline: {
    primary: cn(
      // outline - primary / 다크모드는 시맨틱 토큰이 자동 처리
      "border-solid border-[1rem] border-[var(--color-border-brand)] text-[var(--color-text-brand)] bg-transparent",
      "hover:not-focus:not-[data-selected]:not-disabled:bg-[var(--color-bg-brand-subtle)]",
      "hover:not-focus:not-[data-selected]:not-disabled:text-[var(--color-interactive-brand-hover)]",
      "hover:not-focus:not-[data-selected]:not-disabled:border-[var(--color-interactive-brand-hover)]",
      "active:bg-[var(--color-bg-brand-subtle-pressed)] active:text-[var(--color-interactive-brand-pressed)] active:border-[var(--color-interactive-brand-pressed)]",
      "disabled:border-[var(--color-border-default)] dark:disabled:border-[var(--color-bg-disabled)] disabled:text-[var(--color-text-disabled)] disabled:bg-transparent",
    ),
    grayscale: cn(
      // outline - grayscale / 다크모드는 시맨틱 토큰이 자동 처리
      "border-solid border-[1rem] border-[var(--color-control-border)] text-[var(--color-control-text)] bg-transparent",
      "hover:not-focus:not-[data-selected]:not-disabled:bg-[var(--color-control-bg-hover)]",
      "hover:not-focus:not-[data-selected]:not-disabled:text-[var(--color-text-default)]",
      "hover:not-focus:not-[data-selected]:not-disabled:border-[var(--color-control-border-pressed)]",
      "active:bg-[var(--color-interactive-neutral)] active:text-[var(--color-text-default)] active:border-[var(--color-control-border-active)]",
      "disabled:border-[var(--color-border-default)] dark:disabled:border-[var(--color-bg-disabled)] disabled:text-[var(--color-text-disabled)] disabled:bg-transparent",
    ),
  },
  ghost: {
    primary: cn(
      // ghost - primary / 다크모드는 시맨틱 토큰이 자동 처리
      "text-[var(--color-text-brand)] bg-transparent",
      "hover:not-focus:not-[data-selected]:not-disabled:bg-[var(--color-bg-brand-subtle)]",
      "hover:not-focus:not-[data-selected]:not-disabled:text-[var(--color-interactive-brand-hover)]",
      "active:bg-[var(--color-bg-brand-subtle-pressed)] active:text-[var(--color-interactive-brand-pressed)]",
      "disabled:text-[var(--color-text-disabled)] disabled:bg-transparent",
    ),
    grayscale: cn(
      // ghost - grayscale / 다크모드는 시맨틱 토큰이 자동 처리
      "text-[var(--color-control-text)] bg-transparent",
      "hover:not-focus:not-[data-selected]:not-disabled:bg-[var(--color-control-bg-hover)]",
      "hover:not-focus:not-[data-selected]:not-disabled:text-[var(--color-text-default)]",
      "active:bg-[var(--color-interactive-neutral)] active:text-[var(--color-text-default)]",
      "disabled:text-[var(--color-text-disabled)] disabled:bg-transparent",
    ),
  },
};
