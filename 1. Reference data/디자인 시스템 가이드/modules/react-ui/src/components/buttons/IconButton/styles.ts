export type IconButtonSize =
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

export const iconSizeStyles: Record<IconButtonSize, string> = {
  "3xl": "size-[56rem] rounded-[8rem]",
  "2xl": "size-[52rem] rounded-[8rem]",
  xl: "size-[48rem] rounded-[6rem]",
  lg: "size-[44rem] rounded-[6rem]",
  md: "size-[40rem] rounded-[6rem]",
  sm: "size-[36rem] rounded-[6rem]",
  xs: "size-[32rem] rounded-[4rem]",
  "2xs": "size-[28rem] rounded-[4rem]",
  "3xs": "size-[24rem] rounded-[4rem]",
  "4xs": "size-[20rem] rounded-[4rem]",
};

export const iconButtonIconSizeStyles: Record<IconButtonSize, string> = {
  "3xl": "size-[28rem]",
  "2xl": "size-[24rem]",
  xl: "size-[24rem]",
  lg: "size-[20rem]",
  md: "size-[20rem]",
  sm: "size-[20rem]",
  xs: "size-[16rem]",
  "2xs": "size-[16rem]",
  "3xs": "size-[12rem]",
  "4xs": "size-[12rem]",
};
