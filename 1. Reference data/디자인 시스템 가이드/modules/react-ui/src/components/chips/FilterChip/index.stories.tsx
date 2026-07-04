import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { FilterChip } from ".";
import { IconHomeLine, IconListLine, IconSearch, IconStarFill } from "../../Icons";

const leftIconMap: Record<string, ReactNode> = {
  none: undefined,
  IconHomeLine: <IconHomeLine />,
  IconListLine: <IconListLine />,
  IconSearch: <IconSearch />,
  IconStarFill: <IconStarFill />,
};

const meta: Meta<typeof FilterChip> = {
  title: "DATA DISPLAY/chips/FilterChip",
  component: FilterChip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "콘텐츠를 필터링하는 멀티 선택 칩입니다. 선택 시 체크 아이콘이 표시됩니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof FilterChip>;

export const Default: Story = {
  name: "props test",
  args: {
    label: "필터",
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
    <FilterChip {...args} leftIcon={leftIconMap[leftIcon as string]} onClick={() => {}} />
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
                <FilterChip label="미선택" variant={variant} size={size} onClick={() => {}} />
                <FilterChip label="선택됨" variant={variant} size={size} selected onClick={() => {}} />
                <FilterChip label="비활성화" variant={variant} size={size} disabled onClick={() => {}} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

export const Interactive: Story = {
  name: "interactive (multi-select)",
  parameters: { controls: { disable: true } },
  render: () => {
    const options = ["전체", "진행중", "완료", "대기", "취소"];
    const variants = ["fill", "outline", "ghost"] as const;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selected, setSelected] = useState<Set<string>>(new Set(["전체"]));

    // 선택 토글
    const toggle = (label: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(label)) next.delete(label);
        else next.add(label);
        return next;
      });
    };

    return (
      <div className="flex flex-col gap-[28rem]">
        {variants.map((variant) => (
          <div key={variant} className="flex items-center gap-[16rem]">
            <span className="w-[48rem] shrink-0 text-[11rem] text-[var(--grayscale-500)]">{variant}</span>
            <div className="flex gap-[8rem]">
              {options.map((opt) => (
                <FilterChip
                  key={opt}
                  label={opt}
                  variant={variant}
                  selected={selected.has(opt)}
                  onClick={() => toggle(opt)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
