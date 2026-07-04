import type { Meta, StoryObj } from "@storybook/react-vite";
import { cn } from "@/utils/cn";
import EmptyPageLight from "../../../../assets/src/images/EmptyPageLight.svg";
import EmptyPageDark from "../../../../assets/src/images/EmptyPageDark.svg";

const meta: Meta = {
  title: "FOUNDATIONS/images✅",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "@une-front/assets 패키지에서 제공하는 이미지 에셋입니다. img 태그의 src로 사용합니다. 사이즈는 img 태그에 width, height 등을 자유롭게 지정하면 됩니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const images: [string, string, string][] = [
  ["EmptyPageLight", "빈 페이지_Light", EmptyPageLight],
  ["EmptyPageDark", "빈 페이지_Dark", EmptyPageDark],
];

export const AllImages: Story = {
  name: "all images",
  render: () => (
    <div className="flex flex-wrap gap-[24rem]">
      {images.map(([name, figmaName, src]) => (
        <div key={name} className="flex flex-col items-center gap-[8rem]">
          <div
            className={cn(
              "flex items-center justify-center w-[120rem] h-[120rem] rounded-[8rem]",
              "bg-[var(--grayscale-25)] dark:bg-[var(--grayscale-800)]",
            )}
          >
            <img src={src} alt={name} width={80} height={80} />
          </div>
          <p className="text-[11rem] text-[var(--grayscale-500)] text-center">
            {name}
          </p>
          <p className="text-[10rem] text-[var(--grayscale-400)] text-center">
            {figmaName}
          </p>
        </div>
      ))}
    </div>
  ),
};
