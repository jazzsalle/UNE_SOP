import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from ".";
import {
  IconCheckFill,
  IconPlus,
  IconWarningFill,
  IconInfoCircleFill,
  IconStarFill,
} from "../../Icons";
import type { ReactNode } from "react";

const iconMap: Record<string, ReactNode> = {
  none: undefined,
  IconPlus: <IconPlus />,
  IconCheckFill: <IconCheckFill />,
  IconWarningFill: <IconWarningFill />,
  IconInfoCircleFill: <IconInfoCircleFill />,
  IconStarFill: <IconStarFill />,
};

const colors = [
  "primary",
  "success",
  "error",
  "secondary",
  "warning",
  "grayscale",
] as const;

const meta: Meta<typeof Badge> = {
  title: "DATA DISPLAY/badges✅/Badge✅",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "상태나 카테고리를 표시하는 라벨 형태의 뱃지입니다. Round Square / Cylinder 형태, Solid / Solid-Pastel / Outline / Dot-Accent / Dot-Neutral 스타일, 6가지 색상과 다크모드를 지원합니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  name: "props test",
  args: {
    label: "뱃지",
    shape: "round-square",
    variant: "solid",
    color: "primary",
    size: "md",
    leftIcon: "IconPlus",
  },
  argTypes: {
    shape: {
      control: { type: "radio" },
      options: ["round-square", "cylinder"],
    },
    variant: {
      control: { type: "radio" },
      options: ["solid", "solid-pastel", "outline", "dot-accent", "dot-neutral"],
    },
    color: {
      control: { type: "radio" },
      options: [
        "primary",
        "success",
        "error",
        "secondary",
        "warning",
        "grayscale",
      ],
    },
    size: {
      control: { type: "radio" },
      options: ["xl", "lg", "md", "sm", "xs"],
    },
    leftIcon: {
      control: { type: "select" },
      options: Object.keys(iconMap),
      description: "왼쪽 아이콘 (solid / solid-pastel / outline variant 전용)",
    },
  },
  render: ({ leftIcon, ...args }) => (
    <Badge {...args} leftIcon={iconMap[leftIcon as string]} />
  ),
};

export const LabelBadge: Story = {
  name: "variant",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-[24rem]">
      <div>
        <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
          Solid
        </p>
        <div className="flex items-center gap-[8rem] flex-wrap">
          {colors.map((color) => (
            <Badge
              key={color}
              label="뱃지"
              color={color}
              variant="solid"
              leftIcon={<IconPlus />}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
          Solid-Pastel
        </p>
        <div className="flex items-center gap-[8rem] flex-wrap">
          {colors.map((color) => (
            <Badge
              key={color}
              label="뱃지"
              color={color}
              variant="solid-pastel"
              leftIcon={<IconPlus />}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
          Outline
        </p>
        <div className="flex items-center gap-[8rem] flex-wrap">
          {colors.map((color) => (
            <Badge
              key={color}
              label="뱃지"
              color={color}
              variant="outline"
              leftIcon={<IconPlus />}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
          Dot-Accent
        </p>
        <div className="flex items-center gap-[8rem] flex-wrap">
          {colors.map((color) => (
            <Badge key={color} label="뱃지" color={color} variant="dot-accent" />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
          Dot-Neutral
        </p>
        <div className="flex items-center gap-[8rem] flex-wrap">
          {colors.map((color) => (
            <Badge key={color} label="뱃지" color={color} variant="dot-neutral" />
          ))}
        </div>
      </div>
    </div>
  ),
};

export const Shapes: Story = {
  name: "shape",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-[16rem]">
      <div className="flex flex-col items-center gap-[4rem]">
        <Badge label="뱃지" shape="round-square" leftIcon={<IconPlus />} />
        <span className="text-[12rem] text-[var(--grayscale-500)]">
          round-square
        </span>
      </div>
      <div className="flex flex-col items-center gap-[4rem]">
        <Badge label="뱃지" shape="cylinder" leftIcon={<IconPlus />} />
        <span className="text-[12rem] text-[var(--grayscale-500)]">
          cylinder
        </span>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: "size - xl / lg / md / sm / xs",
  parameters: { controls: { disable: true } },
  render: () => {
    const sizes = ["xl", "lg", "md", "sm", "xs"] as const;
    const variants = [
      "solid",
      "solid-pastel",
      "outline",
      "dot-accent",
      "dot-neutral",
    ] as const;
    return (
      <div className="flex flex-col gap-[24rem]">
        {/* variant별 사이즈 행 */}
        {variants.map((variant) => (
          <div key={variant}>
            <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem] capitalize">
              {variant}
            </p>
            <div className="flex items-end gap-[12rem]">
              {sizes.map((size) => (
                <div key={size} className="flex flex-col items-center gap-[4rem]">
                  <Badge
                    label="뱃지"
                    size={size}
                    variant={variant}
                    leftIcon={
                      variant !== "dot-accent" && variant !== "dot-neutral"
                        ? <IconPlus />
                        : undefined
                    }
                  />
                  <span className="text-[12rem] text-[var(--grayscale-500)]">
                    {size}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const WithLeftIcon: Story = {
  name: "left icon",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-[16rem]">
      <div>
        <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
          Solid
        </p>
        <div className="flex items-center gap-[8rem] flex-wrap">
          {colors.map((color) => (
            <Badge
              key={color}
              label="뱃지"
              color={color}
              variant="solid"
              leftIcon={<IconCheckFill />}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
          Solid-Pastel
        </p>
        <div className="flex items-center gap-[8rem] flex-wrap">
          {colors.map((color) => (
            <Badge
              key={color}
              label="뱃지"
              color={color}
              variant="solid-pastel"
              leftIcon={<IconCheckFill />}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
          Outline
        </p>
        <div className="flex items-center gap-[8rem] flex-wrap">
          {colors.map((color) => (
            <Badge
              key={color}
              label="뱃지"
              color={color}
              variant="outline"
              leftIcon={<IconCheckFill />}
            />
          ))}
        </div>
      </div>
    </div>
  ),
};
