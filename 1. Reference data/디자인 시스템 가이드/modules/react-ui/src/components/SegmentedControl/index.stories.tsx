import type { Meta, StoryObj } from "@storybook/react-vite";
import { SegmentedControl, SegmentedControlProps } from ".";
import { useArgs } from "storybook/preview-api";
import { IconLayerFill, IconStorageFill, IconRocketLine } from "../Icons";

const meta: Meta<typeof SegmentedControl> = {
  title: "DATA INPUT (FORM)/SegmentedControl✅", // 그룹 이름
  component: SegmentedControl,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "options 의 label 에 해당하는 값이 Button 내부에 표시되며 글자 뿐아니라 다른 형태도 삽입 가능합니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<SegmentedControlProps<string>>;

const initialArgs: Partial<SegmentedControlProps<string>> = {
  options: [
    { value: "day", label: "일" },
    { value: "month", label: "월" },
    { value: "year", label: "년" },
  ],
  size: "lg",
  fullWidth: false,
};

export const Default: Story = {
  name: "props test",
  render: (args) => {
    const [{ value }, updateArgs] = useArgs();

    const handleSetValue: React.Dispatch<React.SetStateAction<string>> = (
      newValue,
    ) => {
      if (typeof newValue === "function") {
        // prevValue => newValue(prevValue) 형태일 때 처리
        updateArgs({ value: newValue(value as string) });
      } else {
        // 단순 값
        updateArgs({ value: newValue });
      }
    };

    return (
      <SegmentedControl
        {...args}
        setValue={handleSetValue}
        value={value as string}
      />
    );
  },
  args: { ...initialArgs, value: "day" },
};

export const States: Story = {
  name: "states",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        [data-force-state="segmented"] button:nth-child(3) {
          color: var(--grayscale-400) !important;
          background-color: var(--grayscale-20) !important;
        }
        .dark [data-force-state="segmented"] button:nth-child(3) {
          color: var(--grayscale-300) !important;
          background-color: var(--grayscale-700) !important;
        }
      `}</style>

      <div style={{ display: "flex", gap: 4, fontSize: 11, color: "#aaa", width: 400 }}>
        <span style={{ flex: 1, textAlign: "center" }}>Selected</span>
        <span style={{ flex: 1, textAlign: "center" }}>Default</span>
        <span style={{ flex: 1, textAlign: "center" }}>Hover</span>
      </div>

      <div className="pointer-events-none" data-force-state="segmented" style={{ width: 400 }}>
        <SegmentedControl
          value="selected"
          options={[
            { value: "selected", label: "Selected" },
            { value: "default", label: "Default" },
            { value: "hover", label: "Hover" },
          ]}
          setValue={() => {}}
          size="lg"
        />
      </div>

      {/* Disabled */}
      <div>
        <strong style={{ fontSize: 13, color: "#888", marginBottom: 8, display: "block" }}>
          disabled
        </strong>
        <div className="pointer-events-none" style={{ width: 400 }}>
          <SegmentedControl
            value="a"
            options={[
              { value: "a", label: "Selected" },
              { value: "b", label: "Option" },
              { value: "c", label: "Option" },
            ]}
            setValue={() => {}}
            size="lg"
            disabled
          />
        </div>
      </div>
    </div>
  ),
};

export const WithIcon: Story = {
  name: "with icon",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 아이콘 + 텍스트 */}
      <div>
        <strong style={{ fontSize: 13, color: "#888", marginBottom: 8, display: "block" }}>
          icon + label
        </strong>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(["lg", "md", "sm"] as const).map((size) => (
            <SegmentedControl
              key={size}
              value="layer"
              options={[
                { value: "layer", label: <><IconLayerFill /> 레이어</> },
                { value: "storage", label: <><IconStorageFill /> 보관함</> },
                { value: "rocket", label: <><IconRocketLine /> 로켓</> },
              ]}
              setValue={() => {}}
              size={size}
            />
          ))}
        </div>
      </div>

      {/* 아이콘 + 텍스트 (fitContent) */}
      <div>
        <strong style={{ fontSize: 13, color: "#888", marginBottom: 8, display: "block" }}>
          icon + label (fitContent)
        </strong>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(["lg", "md", "sm"] as const).map((size) => (
            <SegmentedControl
              key={size}
              value="layer"
              options={[
                { value: "layer", label: <><IconLayerFill /> 레이어</> },
                { value: "storage", label: <><IconStorageFill /> 보관함</> },
                { value: "rocket", label: <><IconRocketLine /> 로켓</> },
              ]}
              setValue={() => {}}
              size={size}
              fitContent
            />
          ))}
        </div>
      </div>

      {/* 아이콘만 */}
      <div>
        <strong style={{ fontSize: 13, color: "#888", marginBottom: 8, display: "block" }}>
          icon only
        </strong>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(["lg", "md", "sm"] as const).map((size) => (
            <SegmentedControl
              key={size}
              value="layer"
              options={[
                { value: "layer", label: <IconLayerFill /> },
                { value: "storage", label: <IconStorageFill /> },
                { value: "rocket", label: <IconRocketLine /> },
              ]}
              setValue={() => {}}
              size={size}
              fitContent
            />
          ))}
        </div>
      </div>
    </div>
  ),
};
