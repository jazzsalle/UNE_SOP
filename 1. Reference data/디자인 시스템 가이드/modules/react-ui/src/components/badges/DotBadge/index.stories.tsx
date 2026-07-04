import type { Meta, StoryObj } from "@storybook/react-vite";
import { BadgeDot } from ".";

const meta: Meta<typeof BadgeDot> = {
  title: "DATA DISPLAY/badges✅/DotBadge✅",
  component: BadgeDot,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "알림이나 새로운 콘텐츠가 있음을 나타내는 점 형태 뱃지입니다. Primary / New 타입과 XL(8) ~ SM(2) 4가지 크기를 지원합니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof BadgeDot>;

export const Default: Story = {
  name: "props test",
  args: {
    variant: "primary",
    size: "md",
  },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["primary", "new"],
    },
    size: {
      control: { type: "radio" },
      options: ["xl", "lg", "md", "sm"],
    },
  },
};

export const Variant: Story = {
  name: "variant",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-[12rem]">
      <div className="flex flex-col items-center gap-[4rem]">
        <BadgeDot variant="primary" size="lg" />
        <span className="text-[12rem] text-[var(--grayscale-500)]">
          primary
        </span>
      </div>
      <div className="flex flex-col items-center gap-[4rem]">
        <BadgeDot variant="new" size="lg" />
        <span className="text-[12rem] text-[var(--grayscale-500)]">new</span>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: "size - xl / lg / md / sm",
  parameters: { controls: { disable: true } },
  render: () => {
    const sizes = ["xl", "lg", "md", "sm"] as const;
    return (
      <div className="flex items-center gap-[12rem]">
        {sizes.map((size) => (
          <div
            key={size}
            className="flex flex-col items-center gap-[4rem]"
          >
            <BadgeDot variant="primary" size={size} />
            <span className="text-[12rem] text-[var(--grayscale-500)]">
              {size}
            </span>
          </div>
        ))}
      </div>
    );
  },
};
