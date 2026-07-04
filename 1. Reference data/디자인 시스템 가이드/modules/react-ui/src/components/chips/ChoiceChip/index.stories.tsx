import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { ChoiceChip } from ".";
import { IconHomeLine, IconListLine, IconSearch, IconStarFill } from "../../Icons";

const leftIconMap: Record<string, ReactNode> = {
  none: undefined,
  IconHomeLine: <IconHomeLine />,
  IconListLine: <IconListLine />,
  IconSearch: <IconSearch />,
  IconStarFill: <IconStarFill />,
};

const meta: Meta<typeof ChoiceChip> = {
  title: "DATA DISPLAY/chips/ChoiceChip",
  component: ChoiceChip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "라디오 버튼처럼 하나의 선택지를 고르는 단일 선택 칩입니다. 선택 시 체크 아이콘이 표시됩니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ChoiceChip>;

export const Default: Story = {
  name: "props test",
  args: {
    label: "선택지",
    size: "md",
    variant: "fill",
    selected: false,
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
    selected: { control: { type: "boolean" } },
    disabled: { control: { type: "boolean" } },
    leftIcon: {
      control: { type: "select" },
      options: Object.keys(leftIconMap),
      description: "왼쪽 아이콘 (미선택 상태 전용)",
    },
    onClick: { action: "clicked" },
  },
  render: ({ leftIcon, ...args }) => (
    <ChoiceChip {...args} leftIcon={leftIconMap[leftIcon as string]} onClick={() => {}} />
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
                <ChoiceChip label="미선택" variant={variant} size={size} onClick={() => {}} />
                <ChoiceChip label="선택됨" variant={variant} size={size} selected onClick={() => {}} />
                <ChoiceChip label="비활성화" variant={variant} size={size} disabled onClick={() => {}} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

export const Interactive: Story = {
  name: "interactive (single-select)",
  parameters: { controls: { disable: true } },
  render: () => {
    const options = ["소형", "중형", "대형", "특대형"];
    const variants = ["fill", "outline", "ghost"] as const;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selected, setSelected] = useState("중형");

    return (
      <div className="flex flex-col gap-[28rem]">
        {variants.map((variant) => (
          <div key={variant} className="flex items-center gap-[16rem]">
            <span className="w-[48rem] shrink-0 text-[11rem] text-[var(--grayscale-500)]">{variant}</span>
            <div className="flex gap-[8rem]">
              {/* 단일 선택 칩 그룹 */}
              {options.map((opt) => (
                <ChoiceChip
                  key={opt}
                  label={opt}
                  variant={variant}
                  selected={selected === opt}
                  onClick={() => setSelected(opt)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
