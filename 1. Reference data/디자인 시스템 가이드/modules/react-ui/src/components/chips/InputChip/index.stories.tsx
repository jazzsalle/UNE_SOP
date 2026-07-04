import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { InputChip } from ".";
import { IconHomeLine, IconSearch, IconStarFill, IconStarLine } from "../../Icons";

const leftIconMap: Record<string, ReactNode> = {
  none: undefined,
  IconHomeLine: <IconHomeLine />,
  IconSearch: <IconSearch />,
  IconStarFill: <IconStarFill />,
  IconStarLine: <IconStarLine />,
};

const meta: Meta<typeof InputChip> = {
  title: "DATA DISPLAY/chips/InputChip",
  component: InputChip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "태그나 선택된 항목을 표시하며 X 버튼으로 삭제할 수 있는 입력 칩입니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof InputChip>;

export const Default: Story = {
  name: "props test",
  args: {
    label: "칩 레이블",
    size: "md",
    variant: "fill",
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
    leftIcon: {
      control: { type: "select" },
      options: Object.keys(leftIconMap),
      description: "왼쪽 아이콘",
    },
    disabled: { control: { type: "boolean" } },
    onClick: { action: "clicked" },
    onDelete: { action: "deleted" },
  },
  render: ({ leftIcon, ...args }) => (
    <InputChip
      {...args}
      leftIcon={leftIconMap[leftIcon as string]}
      onClick={() => {}}
      onDelete={() => {}}
    />
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
                <InputChip label="기본" variant={variant} size={size} onDelete={() => {}} />
                <InputChip label="아이콘" variant={variant} size={size} leftIcon={<IconHomeLine />} onDelete={() => {}} />
                <InputChip label="비활성화" variant={variant} size={size} disabled onDelete={() => {}} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

export const Interactive: Story = {
  name: "interactive (add / remove)",
  parameters: { controls: { disable: true } },
  render: () => {
    const variants = ["fill", "outline", "ghost"] as const;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [tags, setTags] = useState(["React", "TypeScript", "Tailwind", "Storybook"]);

    const remove = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

    return (
      <div className="flex flex-col gap-[28rem]">
        {variants.map((variant) => (
          <div key={variant} className="flex items-center gap-[16rem]">
            <span className="w-[48rem] shrink-0 text-[11rem] text-[var(--grayscale-500)]">{variant}</span>
            <div className="flex flex-wrap gap-[8rem]">
              {/* 태그 목록 */}
              {tags.map((tag) => (
                <InputChip key={tag} label={tag} variant={variant} onDelete={() => remove(tag)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
