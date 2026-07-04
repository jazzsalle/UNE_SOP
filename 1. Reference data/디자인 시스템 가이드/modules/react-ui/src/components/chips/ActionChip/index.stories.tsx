import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { ActionChip } from ".";
import { IconPlus, IconSearch, IconStarFill, IconStarLine } from "../../Icons";

const leftIconMap: Record<string, ReactNode> = {
  none: undefined,
  IconPlus: <IconPlus />,
  IconSearch: <IconSearch />,
  IconStarFill: <IconStarFill />,
  IconStarLine: <IconStarLine />,
};

const meta: Meta<typeof ActionChip> = {
  title: "DATA DISPLAY/chips/ActionChip",
  component: ActionChip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "특정 액션을 실행하는 버튼 형태의 칩입니다. neutral(기본) 또는 primary(브랜드) 색상을 지원합니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ActionChip>;

export const Default: Story = {
  name: "props test",
  args: {
    label: "액션",
    size: "md",
    variant: "fill",
    color: "neutral",
    disabled: false,
    leftIcon: "none",
  },
  argTypes: {
    size: {
      control: { type: "radio" },
      options: ["lg", "md", "sm"],
    },
    variant: {
      control: { type: "radio" },
      options: ["fill", "outline", "ghost"],
    },
    color: {
      control: { type: "radio" },
      options: ["neutral", "primary"],
    },
    disabled: { control: { type: "boolean" } },
    leftIcon: {
      control: { type: "select" },
      options: Object.keys(leftIconMap),
      description: "왼쪽 아이콘",
    },
    onClick: { action: "clicked" },
  },
  render: ({ leftIcon, ...args }) => (
    <ActionChip {...args} leftIcon={leftIconMap[leftIcon as string]} onClick={() => {}} />
  ),
};

export const VariantAndSize: Story = {
  name: "variant × size",
  parameters: { controls: { disable: true } },
  render: () => {
    const variants = ["fill", "outline", "ghost"] as const;
    const sizes = ["lg", "md", "sm"] as const;
    return (
      <div className="flex flex-col gap-[28rem]">
        {variants.map((variant) => (
          <div key={variant} className="flex items-center gap-[24rem]">
            <div className="w-[48rem] shrink-0 text-[11rem] text-[var(--grayscale-500)]">{variant}</div>
            {sizes.map((size) => (
              <div key={size} className="flex items-center gap-[6rem]">
                <span className="text-[11rem] text-[var(--grayscale-400)] shrink-0">{size}</span>
                <ActionChip label="neutral" variant={variant} size={size} color="neutral" onClick={() => {}} />
                <ActionChip label="primary" variant={variant} size={size} color="primary" onClick={() => {}} />
                <ActionChip label="비활성화" variant={variant} size={size} disabled onClick={() => {}} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};
