import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { RadioGroup, RadioButton } from ".";

const meta: Meta<typeof RadioGroup> = {
  title: "DATA INPUT (FORM)/Radio✅",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "라디오 버튼은 사용자가 여러 개의 옵션 중 한 개의 값을 선택하도록 하는 경우에 사용합니다.",
      },
    },
  },
  argTypes: {
    size: {
      control: { type: "radio" },
      options: ["lg", "md", "sm"],
      description: "라디오 크기",
    },
    direction: {
      control: { type: "radio" },
      options: ["vertical", "horizontal"],
      description: "배치 방향",
    },
    disabled: {
      control: { type: "boolean" },
      description: "비활성화 상태",
    },
  },
};
export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  name: "props test",
  render: () => {
    const [{ value, size, disabled, direction }, updateArgs] = useArgs();

    return (
      <RadioGroup
        value={value as string}
        setValue={(v: string) => updateArgs({ value: v })}
        size={size as "lg" | "md" | "sm"}
        direction={direction as "vertical" | "horizontal"}
        disabled={disabled as boolean}
      >
        <RadioButton value="a" label="라디오버튼" />
        <RadioButton value="b" label="라디오버튼" />
        <RadioButton value="c" label="라디오버튼" />
      </RadioGroup>
    );
  },
  args: {
    value: "a",
    size: "md",
    direction: "vertical",
    disabled: false,
  },
};

export const AllSizes: Story = {
  name: "size - lg / md / sm",
  render: () => {
    const [{ value }, updateArgs] = useArgs();

    return (
      <div className="flex gap-[32rem]">
        {(["lg", "md", "sm"] as const).map((size) => (
          <div key={size} className="flex flex-col gap-[8rem]">
            <p className="text-[12rem] text-[var(--grayscale-500)] mb-[4rem]">
              {size}
            </p>
            <RadioGroup
              value={value as string}
              setValue={(v: string) => updateArgs({ value: v })}
              size={size}
            >
              <RadioButton value={`${size}-a`} label="라디오버튼" />
            </RadioGroup>
          </div>
        ))}
      </div>
    );
  },
  args: {
    value: "lg-a",
  },
  argTypes: {
    size: { table: { disable: true } },
    disabled: { table: { disable: true } },
    direction: { table: { disable: true } },
  },
};

export const States: Story = {
  name: "state - on / off",
  render: () => {
    return (
      <div className="flex flex-col gap-[24rem]">
        <div>
          <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
            Off
          </p>
          <div className="flex items-center gap-[16rem]">
            <RadioGroup value="" setValue={() => {}}>
              <RadioButton value="x" label="Default" />
            </RadioGroup>
            <RadioGroup value="" setValue={() => {}} disabled>
              <RadioButton value="x" label="Disabled" />
            </RadioGroup>
          </div>
        </div>
        <div>
          <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
            On
          </p>
          <div className="flex items-center gap-[16rem]">
            <RadioGroup value="x" setValue={() => {}}>
              <RadioButton value="x" label="Default" />
            </RadioGroup>
            <RadioGroup value="x" setValue={() => {}} disabled>
              <RadioButton value="x" label="Disabled" />
            </RadioGroup>
          </div>
        </div>
      </div>
    );
  },
  argTypes: {
    size: { table: { disable: true } },
    disabled: { table: { disable: true } },
    direction: { table: { disable: true } },
  },
};

export const Layout: Story = {
  name: "direction - horizontal / vertical",
  render: () => {
    const [{ value }, updateArgs] = useArgs();

    return (
      <div className="flex gap-[32rem]">
        <div>
          <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
            vertical
          </p>
          <RadioGroup
            value={value as string}
            setValue={(v: string) => updateArgs({ value: v })}
            direction="vertical"
          >
            <RadioButton value="a" label="리스트형" />
            <RadioButton value="b" label="리스트형" />
            <RadioButton value="c" label="리스트형" />
          </RadioGroup>
        </div>
        <div>
          <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
            horizontal
          </p>
          <RadioGroup
            value={value as string}
            setValue={(v: string) => updateArgs({ value: v })}
            direction="horizontal"
          >
            <RadioButton value="a" label="가로형" />
            <RadioButton value="b" label="가로형" />
            <RadioButton value="c" label="가로형" />
          </RadioGroup>
        </div>
      </div>
    );
  },
  args: {
    value: "a",
  },
  argTypes: {
    size: { table: { disable: true } },
    disabled: { table: { disable: true } },
    direction: { table: { disable: true } },
  },
};

export const HoverActiveStates: Story = {
  name: "states",
  render: () => {
    const uncheckedStates = [
      { label: "Default", state: "" },
      { label: "Hover", state: "unchecked-hover" },
      { label: "Active", state: "unchecked-active" },
    ];

    const checkedStates = [
      { label: "Default", state: "" },
      { label: "Hover", state: "checked-hover" },
      { label: "Active", state: "checked-active" },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <style>{`
          [data-force-state="unchecked-hover"] label > span:first-of-type {
            border-color: var(--grayscale-400) !important;
            background-color: var(--grayscale-25) !important;
          }
          [data-force-state="unchecked-active"] label > span:first-of-type {
            border-color: var(--grayscale-500) !important;
            background-color: var(--grayscale-50) !important;
          }
          [data-force-state="checked-hover"] label > span:first-of-type {
            background-color: var(--light-blue-600) !important;
            box-shadow: none !important;
          }
          [data-force-state="checked-active"] label > span:first-of-type {
            background-color: var(--light-blue-700) !important;
            box-shadow: none !important;
          }
          .dark [data-force-state="unchecked-hover"] label > span:first-of-type {
            border-color: var(--grayscale-400) !important;
            background-color: var(--grayscale-800) !important;
          }
          .dark [data-force-state="unchecked-active"] label > span:first-of-type {
            border-color: var(--grayscale-300) !important;
            background-color: var(--grayscale-700) !important;
          }
          .dark [data-force-state="checked-hover"] label > span:first-of-type {
            background-color: var(--dark-blue-400) !important;
            box-shadow: none !important;
          }
          .dark [data-force-state="checked-active"] label > span:first-of-type {
            background-color: var(--dark-blue-500) !important;
            box-shadow: none !important;
          }
        `}</style>

        {/* Unchecked */}
        <div>
          <strong
            style={{
              fontSize: 13,
              color: "#888",
              marginBottom: 8,
              display: "block",
            }}
          >
            unchecked
          </strong>
          <div style={{ display: "flex", gap: 24 }}>
            {uncheckedStates.map((state) => (
              <div
                key={state.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 11, color: "#aaa" }}>
                  {state.label}
                </span>
                <div
                  className="pointer-events-none"
                  data-force-state={state.state || undefined}
                >
                  <RadioGroup value="" setValue={() => {}}>
                    <RadioButton value="a" label="Label" />
                  </RadioGroup>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checked */}
        <div>
          <strong
            style={{
              fontSize: 13,
              color: "#888",
              marginBottom: 8,
              display: "block",
            }}
          >
            checked
          </strong>
          <div style={{ display: "flex", gap: 24 }}>
            {checkedStates.map((state) => (
              <div
                key={state.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 11, color: "#aaa" }}>
                  {state.label}
                </span>
                <div
                  className="pointer-events-none"
                  data-force-state={state.state || undefined}
                >
                  <RadioGroup value="a" setValue={() => {}}>
                    <RadioButton value="a" label="Label" />
                  </RadioGroup>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disabled */}
        <div>
          <strong
            style={{
              fontSize: 13,
              color: "#888",
              marginBottom: 8,
              display: "block",
            }}
          >
            disabled
          </strong>
          <div style={{ display: "flex", gap: 24 }}>
            <div className="pointer-events-none">
              <RadioGroup value="" setValue={() => {}} disabled>
                <RadioButton value="a" label="Unchecked" />
              </RadioGroup>
            </div>
            <div className="pointer-events-none">
              <RadioGroup value="a" setValue={() => {}} disabled>
                <RadioButton value="a" label="Checked" />
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
