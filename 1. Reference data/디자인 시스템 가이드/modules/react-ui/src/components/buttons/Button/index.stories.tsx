import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { useArgs } from "storybook/preview-api";
import { Button } from ".";
import {
  IconHomeLine,
  IconPlus,
  IconCheckFill,
  IconSearch,
  IconSetting,
  IconChevronDown,
} from "../../Icons";

const iconMap: Record<string, ReactNode> = {
  none: undefined,
  IconHomeLine: <IconHomeLine />,
  IconPlus: <IconPlus />,
  IconCheckFill: <IconCheckFill />,
  IconSearch: <IconSearch />,
  IconSetting: <IconSetting />,
  IconChevronDown: <IconChevronDown />,
};

const meta: Meta<typeof Button> = {
  title: "DATA INPUT (FORM)/buttons✅/Button✅",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "텍스트 + 아이콘 조합의 버튼입니다. 사용자로 하여금 명령을 실행하거나 선택/결정을 할 때 사용합니다.",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/oMm0nhTOiYl6EoqhcVlBJf/My-Design-System-v0.1?node-id=63:2",
    },
  },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["fill", "outline", "ghost"],
      description: "버튼 스타일",
    },
    color: {
      control: { type: "radio" },
      options: ["primary", "grayscale"],
      description: "버튼 색상",
    },
    size: {
      control: { type: "radio" },
      options: ["3xl", "2xl", "xl", "lg", "md", "sm", "xs", "2xs", "3xs", "4xs"],
      description: "버튼 크기",
    },
    selected: {
      control: { type: "boolean" },
      description: "선택 상태",
    },
    disabled: {
      control: { type: "boolean" },
      description: "비활성화 상태",
    },
    leftIcon: {
      control: { type: "select" },
      options: Object.keys(iconMap),
      description: "왼쪽 아이콘",
    },
    rightIcon: {
      control: { type: "select" },
      options: Object.keys(iconMap),
      description: "오른쪽 아이콘",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  name: "props test",
  render: () => {
    const [args] = useArgs();
    const { leftIcon, rightIcon, ...rest } = args;
    return (
      <Button
        {...rest}
        leftIcon={iconMap[leftIcon as string]}
        rightIcon={iconMap[rightIcon as string]}
      >
        버튼이름
      </Button>
    );
  },
  args: {
    variant: "fill",
    color: "primary",
    size: "md",
    selected: false,
    disabled: false,
    leftIcon: "IconHomeLine",
    rightIcon: "none",
  },
};

export const AllSizes: Story = {
  name: "size - 3xl / 2xl / xl / lg / md / sm / xs / 2xs / 3xs / 4xs",
  render: () => {
    const [args] = useArgs();
    const sizes = ["3xl", "2xl", "xl", "lg", "md", "sm", "xs", "2xs", "3xs", "4xs"] as const;

    return (
      <div className="flex items-end gap-[8rem]">
        {sizes.map((size) => (
          <Button
            key={size}
            {...args}
            size={size}
            leftIcon={<IconHomeLine />}
            rightIcon={<IconHomeLine />}
          >
            버튼이름
          </Button>
        ))}
      </div>
    );
  },
  args: {
    variant: "fill",
    color: "primary",
    disabled: false,
  },
  argTypes: {
    variant: { table: { disable: true } },
    color: { table: { disable: true } },
    selected: { table: { disable: true } },
    leftIcon: { table: { disable: true } },
    rightIcon: { table: { disable: true } },
    size: { table: { disable: true } },
    disabled: { table: { disable: true } },
    children: { table: { disable: true } },
  },
};

export const AllVariants: Story = {
  name: "variant - fill / outline / ghost",
  render: () => {
    const [args] = useArgs();
    const variants = ["fill", "outline", "ghost"] as const;

    return (
      <div className="flex flex-col gap-[24rem]">
        <div>
          <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
            Primary Color
          </p>
          <div className="flex items-center gap-[8rem]">
            {variants.map((v) => (
              <Button
                key={v}
                {...args}
                variant={v}
                color="primary"
                leftIcon={<IconHomeLine />}
              >
                버튼이름
              </Button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
            Grayscale Color
          </p>
          <div className="flex items-center gap-[8rem]">
            {variants.map((v) => (
              <Button
                key={v}
                {...args}
                variant={v}
                color="grayscale"
                leftIcon={<IconHomeLine />}
              >
                버튼이름
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  },
  args: {
    size: "md",
    disabled: false,
  },
  argTypes: {
    variant: { table: { disable: true } },
    color: { table: { disable: true } },
    selected: { table: { disable: true } },
    leftIcon: { table: { disable: true } },
    rightIcon: { table: { disable: true } },
    size: { table: { disable: true } },
    // disabled: { table: { disable: true } },
    children: { table: { disable: true } },
  },
};

export const States: Story = {
  name: "states",
  render: () => {
    const variants = ["fill", "outline", "ghost"] as const;
    const colors = ["primary", "grayscale"] as const;
    const states = ["Default", "Hover", "Active", "Focus", "Disabled"] as const;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <style>{`
          /* ── fill / primary ── */
          [data-force-state="fill-primary-hover"] button { background-color: var(--light-blue-600) !important; }
          [data-force-state="fill-primary-active"] button { background-color: var(--light-blue-700) !important; }
          [data-force-state="fill-primary-focus"] button { box-shadow: 0 0 0 2rem #C2D3FF !important; }
          .dark [data-force-state="fill-primary-hover"] button { background-color: var(--dark-blue-400) !important; }
          .dark [data-force-state="fill-primary-active"] button { background-color: var(--dark-blue-500) !important; }
          .dark [data-force-state="fill-primary-focus"] button { box-shadow: 0 0 0 2rem rgba(132,168,255,0.5) !important; }

          /* ── fill / grayscale ── */
          [data-force-state="fill-grayscale-hover"] button { background-color: var(--grayscale-75) !important; color: var(--grayscale-900) !important; }
          [data-force-state="fill-grayscale-active"] button { background-color: var(--grayscale-100) !important; color: var(--grayscale-900) !important; }
          [data-force-state="fill-grayscale-focus"] button { box-shadow: 0 0 0 2rem #C2D3FF !important; }
          .dark [data-force-state="fill-grayscale-hover"] button { background-color: var(--grayscale-500) !important; color: white !important; }
          .dark [data-force-state="fill-grayscale-active"] button { background-color: var(--grayscale-400) !important; color: white !important; }
          .dark [data-force-state="fill-grayscale-focus"] button { box-shadow: 0 0 0 2rem rgba(132,168,255,0.5) !important; }

          /* ── outline / primary ── */
          [data-force-state="outline-primary-hover"] button { background-color: var(--light-blue-25) !important; color: var(--light-blue-600) !important; border-color: var(--light-blue-600) !important; }
          [data-force-state="outline-primary-active"] button { background-color: var(--light-blue-50) !important; color: var(--light-blue-700) !important; border-color: var(--light-blue-700) !important; }
          [data-force-state="outline-primary-focus"] button { box-shadow: 0 0 0 2rem #C2D3FF !important; }
          .dark [data-force-state="outline-primary-hover"] button { background-color: var(--dark-blue-20) !important; color: var(--dark-blue-400) !important; border-color: var(--dark-blue-400) !important; }
          .dark [data-force-state="outline-primary-active"] button { background-color: var(--dark-blue-25) !important; color: var(--dark-blue-500) !important; border-color: var(--dark-blue-500) !important; }
          .dark [data-force-state="outline-primary-focus"] button { box-shadow: 0 0 0 2rem rgba(132,168,255,0.5) !important; }

          /* ── outline / grayscale ── */
          [data-force-state="outline-grayscale-hover"] button { background-color: var(--grayscale-50) !important; color: var(--grayscale-900) !important; border-color: var(--grayscale-500) !important; }
          [data-force-state="outline-grayscale-active"] button { background-color: var(--grayscale-100) !important; color: var(--grayscale-900) !important; border-color: var(--grayscale-600) !important; }
          [data-force-state="outline-grayscale-focus"] button { box-shadow: 0 0 0 2rem #C2D3FF !important; }
          .dark [data-force-state="outline-grayscale-hover"] button { background-color: var(--grayscale-700) !important; color: var(--grayscale-50) !important; border-color: var(--grayscale-300) !important; }
          .dark [data-force-state="outline-grayscale-active"] button { background-color: var(--grayscale-600) !important; color: white !important; border-color: var(--grayscale-100) !important; }
          .dark [data-force-state="outline-grayscale-focus"] button { box-shadow: 0 0 0 2rem rgba(132,168,255,0.5) !important; }

          /* ── ghost / primary ── */
          [data-force-state="ghost-primary-hover"] button { background-color: var(--light-blue-25) !important; color: var(--light-blue-600) !important; }
          [data-force-state="ghost-primary-active"] button { background-color: var(--light-blue-50) !important; color: var(--light-blue-700) !important; }
          [data-force-state="ghost-primary-focus"] button { box-shadow: 0 0 0 2rem #C2D3FF !important; }
          .dark [data-force-state="ghost-primary-hover"] button { background-color: var(--dark-blue-50) !important; color: var(--dark-blue-400) !important; }
          .dark [data-force-state="ghost-primary-active"] button { background-color: var(--dark-blue-75) !important; color: var(--dark-blue-500) !important; }
          .dark [data-force-state="ghost-primary-focus"] button { box-shadow: 0 0 0 2rem rgba(132,168,255,0.5) !important; }

          /* ── ghost / grayscale ── */
          [data-force-state="ghost-grayscale-hover"] button { background-color: var(--grayscale-50) !important; }
          [data-force-state="ghost-grayscale-active"] button { background-color: var(--grayscale-100) !important; }
          [data-force-state="ghost-grayscale-focus"] button { box-shadow: 0 0 0 2rem #C2D3FF !important; }
          .dark [data-force-state="ghost-grayscale-hover"] button { background-color: var(--grayscale-700) !important; color: var(--grayscale-50) !important; }
          .dark [data-force-state="ghost-grayscale-active"] button { background-color: var(--grayscale-600) !important; color: white !important; }
          .dark [data-force-state="ghost-grayscale-focus"] button { box-shadow: 0 0 0 2rem rgba(132,168,255,0.5) !important; }
        `}</style>

        {/* 상태 헤더 */}
        <div style={{ display: "flex", gap: 8, paddingLeft: 120 }}>
          {states.map((s) => (
            <span
              key={s}
              style={{
                width: 80,
                fontSize: 11,
                color: "#aaa",
                textAlign: "center",
              }}
            >
              {s}
            </span>
          ))}
        </div>

        {/* variant / color 조합별 상태 버튼 행 */}
        {variants.map((variant) =>
          colors.map((color) => (
            <div
              key={`${variant}-${color}`}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span
                style={{
                  width: 112,
                  fontSize: 13,
                  color: "#888",
                  flexShrink: 0,
                }}
              >
                {variant} / {color}
              </span>
              {states.map((state) => {
                const forceState =
                  state !== "Default" && state !== "Disabled"
                    ? `${variant}-${color}-${state.toLowerCase()}`
                    : undefined;

                return (
                  <div
                    key={state}
                    style={{
                      width: 80,
                      display: "flex",
                      justifyContent: "center",
                    }}
                    className="pointer-events-none"
                    data-force-state={forceState}
                  >
                    <Button
                      variant={variant}
                      color={color}
                      size="md"
                      disabled={state === "Disabled"}
                    >
                      Label
                    </Button>
                  </div>
                );
              })}
            </div>
          )),
        )}
      </div>
    );
  },
};
