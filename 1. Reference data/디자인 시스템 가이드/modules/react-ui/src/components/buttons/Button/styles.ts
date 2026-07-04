export type ButtonSize =
  | "3xl"
  | "2xl"
  | "xl"
  | "lg"
  | "md"
  | "sm"
  | "xs"
  | "2xs"
  | "3xs"
  | "4xs";

export const buttonSizeStyles: Record<ButtonSize, string> = {
  "3xl": "h-[56rem] px-[24rem] gap-[4rem] typo-text-lg rounded-[8rem]",
  "2xl": "h-[52rem] px-[20rem] gap-[4rem] typo-text-lg rounded-[8rem]",
  xl: "h-[48rem] px-[16rem] gap-[4rem] typo-text-lg rounded-[6rem]",
  lg: "h-[44rem] px-[16rem] gap-[4rem] typo-text-md rounded-[6rem]",
  md: "h-[40rem] px-[16rem] gap-[4rem] typo-text-md rounded-[6rem]",
  sm: "h-[36rem] px-[12rem] gap-[4rem] typo-text-md rounded-[6rem]",
  xs: "h-[32rem] px-[12rem] gap-[4rem] typo-text-md rounded-[4rem]",
  "2xs": "h-[28rem] px-[12rem] gap-[4rem] typo-text-sm rounded-[4rem]",
  "3xs": "h-[24rem] px-[8rem] gap-[4rem] typo-text-sm rounded-[4rem]",
  "4xs": "h-[20rem] px-[8rem] gap-[4rem] typo-text-sm rounded-[4rem]",
};

export const buttonIconSizeStyles: Record<ButtonSize, string> = {
  "3xl": "size-[20rem]",
  "2xl": "size-[20rem]",
  xl: "size-[20rem]",
  lg: "size-[16rem]",
  md: "size-[16rem]",
  sm: "size-[16rem]",
  xs: "size-[16rem]",
  "2xs": "size-[12rem]",
  "3xs": "size-[12rem]",
  "4xs": "size-[12rem]",
};
