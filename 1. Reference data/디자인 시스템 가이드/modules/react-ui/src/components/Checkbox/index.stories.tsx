import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { Checkbox } from ".";

const meta: Meta<typeof Checkbox> = {
  title: "DATA INPUT (FORM)/Checkbox✅",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "체크박스는 사용자가 여러 개의 옵션 중 한 개 이상의 값을 선택할 수 있도록 하는 경우에 사용합니다.",
      },
    },
  },
  argTypes: {
    size: {
      control: { type: "radio" },
      options: ["lg", "md", "sm"],
      description: "체크박스 크기",
    },
    checked: {
      control: { type: "boolean" },
      description: "체크 상태",
    },
    indeterminate: {
      control: { type: "boolean" },
      description: "중간 선택 상태 (일부 항목만 선택됐을 때)",
    },
    disabled: {
      control: { type: "boolean" },
      description: "비활성화 상태",
    },
    label: {
      control: { type: "text" },
      description: "라벨 텍스트",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  name: "props test",
  render: () => {
    const [{ checked, indeterminate, size, disabled, label }, updateArgs] = useArgs();

    return (
      <Checkbox
        checked={checked as boolean}
        indeterminate={indeterminate as boolean}
        onCheckedChange={(v: boolean) => updateArgs({ checked: v, indeterminate: false })}
        size={size as "lg" | "md" | "sm"}
        disabled={disabled as boolean}
        label={label as string}
      />
    );
  },
  args: {
    checked: false,
    indeterminate: false,
    size: "md",
    disabled: false,
    label: "체크박스",
  },
};

export const AllSizes: Story = {
  name: "size - lg / md / sm",
  render: () => {
    const [{ checked }, updateArgs] = useArgs();
    const sizes = ["lg", "md", "sm"] as const;

    return (
      <div className="flex flex-col gap-[16rem]">
        {sizes.map((size) => (
          <Checkbox
            key={size}
            checked={checked as boolean}
            onCheckedChange={(v: boolean) => updateArgs({ checked: v })}
            size={size}
            label="체크박스"
          />
        ))}
      </div>
    );
  },
  args: {
    checked: false,
  },
  argTypes: {
    size: { table: { disable: true } },
    disabled: { table: { disable: true } },
    label: { table: { disable: true } },
    checked: { table: { disable: true } },
  },
};

export const States: Story = {
  name: "state - on / off / indeterminate",
  render: () => {
    return (
      <div className="flex flex-col gap-[24rem]">
        <div>
          <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
            Off
          </p>
          <div className="flex items-center gap-[16rem]">
            <Checkbox label="Default" />
            <Checkbox label="Disabled" disabled />
          </div>
        </div>
        <div>
          <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
            Indeterminate
          </p>
          <div className="flex items-center gap-[16rem]">
            <Checkbox indeterminate label="Default" />
            <Checkbox indeterminate label="Disabled" disabled />
          </div>
        </div>
        <div>
          <p className="text-[12rem] text-[var(--grayscale-500)] mb-[8rem]">
            On
          </p>
          <div className="flex items-center gap-[16rem]">
            <Checkbox checked label="Default" />
            <Checkbox checked label="Disabled" disabled />
          </div>
        </div>
      </div>
    );
  },
  argTypes: {
    size: { table: { disable: true } },
    disabled: { table: { disable: true } },
    label: { table: { disable: true } },
    checked: { table: { disable: true } },
    indeterminate: { table: { disable: true } },
  },
};

export const ListLayout: Story = {
  name: "direction - horizontal / vertical",
  render: () => {
    return (
      <div className="flex gap-[32rem]">
        <div className="flex flex-col gap-[8rem]">
          <p className="text-[12rem] text-[var(--grayscale-500)] mb-[4rem]">
            리스트형 (세로)
          </p>
          <Checkbox label="리스트형" checked />
          <Checkbox label="리스트형" />
          <Checkbox label="리스트형" />
        </div>
        <div className="flex flex-col gap-[8rem]">
          <p className="text-[12rem] text-[var(--grayscale-500)] mb-[4rem]">
            가로형
          </p>
          <div className="flex items-center gap-[16rem]">
            <Checkbox label="가로형" checked />
            <Checkbox label="가로형" />
            <Checkbox label="가로형" />
          </div>
        </div>
      </div>
    );
  },
  argTypes: {
    size: { table: { disable: true } },
    disabled: { table: { disable: true } },
    label: { table: { disable: true } },
    checked: { table: { disable: true } },
  },
};

export const HoverActiveStates: Story = {
  name: "states",
  render: () => {
    const uncheckedStates = [
      { label: "Default", state: "" },
      { label: "Hover", state: "unchecked-hover" },
      { label: "Active", state: "unchecked-active" },
      { label: "Focus-visible", state: "focus-visible" },
    ];

    const checkedStates = [
      { label: "Default", state: "" },
      { label: "Hover", state: "checked-hover" },
      { label: "Active", state: "checked-active" },
      { label: "Focus-visible", state: "checked-focus-visible" },
    ];

    const indeterminateStates = [
      { label: "Default", state: "" },
      { label: "Hover", state: "indeterminate-hover" },
      { label: "Active", state: "indeterminate-active" },
      { label: "Focus-visible", state: "indeterminate-focus-visible" },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <style>{`
          [data-force-state="unchecked-hover"] label > span:first-of-type {
            border-color: var(--color-control-border-hover) !important;
            background-color: var(--color-control-bg-hover) !important;
          }
          [data-force-state="unchecked-active"] label > span:first-of-type {
            border-color: var(--color-control-border-pressed) !important;
            background-color: var(--color-control-bg-pressed) !important;
          }
          [data-force-state="focus-visible"] label > span:first-of-type {
            box-shadow: var(--selected-shadow) !important;
          }
          [data-force-state="checked-hover"] label > span:first-of-type {
            background-color: var(--color-interactive-brand-hover) !important;
            border-color: var(--color-interactive-brand-hover) !important;
          }
          [data-force-state="checked-active"] label > span:first-of-type {
            background-color: var(--color-interactive-brand-pressed) !important;
            border-color: var(--color-interactive-brand-pressed) !important;
          }
          [data-force-state="checked-focus-visible"] label > span:first-of-type {
            box-shadow: var(--selected-shadow) !important;
          }
          [data-force-state="indeterminate-hover"] label > span:first-of-type {
            background-color: var(--color-interactive-brand-hover) !important;
            border-color: var(--color-interactive-brand-hover) !important;
          }
          [data-force-state="indeterminate-active"] label > span:first-of-type {
            background-color: var(--color-interactive-brand-pressed) !important;
            border-color: var(--color-interactive-brand-pressed) !important;
          }
          [data-force-state="indeterminate-focus-visible"] label > span:first-of-type {
            box-shadow: var(--selected-shadow) !important;
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
                  <Checkbox label="Label" />
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
                  <Checkbox checked label="Label" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indeterminate */}
        <div>
          <strong
            style={{
              fontSize: 13,
              color: "#888",
              marginBottom: 8,
              display: "block",
            }}
          >
            indeterminate
          </strong>
          <div style={{ display: "flex", gap: 24 }}>
            {indeterminateStates.map((state) => (
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
                  <Checkbox indeterminate label="Label" />
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
              <Checkbox label="Unchecked" disabled />
            </div>
            <div className="pointer-events-none">
              <Checkbox indeterminate label="Indeterminate" disabled />
            </div>
            <div className="pointer-events-none">
              <Checkbox checked label="Checked" disabled />
            </div>
          </div>
        </div>
      </div>
    );
  },
};
