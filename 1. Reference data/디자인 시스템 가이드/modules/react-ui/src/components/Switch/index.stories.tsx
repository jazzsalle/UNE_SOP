import { useArgs } from "storybook/preview-api";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from ".";
import { ThemeProvider } from "@/theme/ThemeProvider";

const CenterDecorator: Decorator = (Story) => (
  <ThemeProvider>
    <Story />
  </ThemeProvider>
);

const meta: Meta<typeof Switch> = {
  title: "DATA INPUT (FORM)/Switch✅",
  component: Switch,
  decorators: [CenterDecorator],
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: (args) => {
    const [, updateArgs] = useArgs(); // ⚡ args를 업데이트할 수 있는 훅

    return (
      <Switch
        {...args}
        setValue={(v: boolean) => {
          updateArgs({ value: v }); // ⚡ 컨트롤과 UI 동시에 업데이트
          args.setValue?.(v); // ⚡ Action 로그 기록
        }}
      />
    );
  },
  args: {
    size: "md",
    value: true,
  },
  argTypes: {
    setValue: { action: "changed" },
  },
};

export const States: Story = {
  name: "states",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        [data-force-state="off-hover"] label > div {
          background-color: var(--grayscale-400) !important;
        }
        [data-force-state="on-hover"] label > div {
          background-color: var(--light-blue-600) !important;
          box-shadow: none !important;
        }
        .dark [data-force-state="off-hover"] label > div {
          background-color: var(--grayscale-400) !important;
        }
        .dark [data-force-state="on-hover"] label > div {
          background-color: var(--dark-blue-400) !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* Off */}
      <div>
        <strong style={{ fontSize: 13, color: "#888", marginBottom: 8, display: "block" }}>off</strong>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11, color: "#aaa" }}>Default</span>
            <div className="pointer-events-none">
              <Switch value={false} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11, color: "#aaa" }}>Hover</span>
            <div className="pointer-events-none" data-force-state="off-hover">
              <Switch value={false} />
            </div>
          </div>
        </div>
      </div>

      {/* On */}
      <div>
        <strong style={{ fontSize: 13, color: "#888", marginBottom: 8, display: "block" }}>on</strong>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11, color: "#aaa" }}>Default</span>
            <div className="pointer-events-none">
              <Switch value={true} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11, color: "#aaa" }}>Hover</span>
            <div className="pointer-events-none" data-force-state="on-hover">
              <Switch value={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Disabled */}
      <div>
        <strong style={{ fontSize: 13, color: "#888", marginBottom: 8, display: "block" }}>disabled</strong>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11, color: "#aaa" }}>Off</span>
            <div className="pointer-events-none">
              <Switch value={false} disabled />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11, color: "#aaa" }}>On</span>
            <div className="pointer-events-none">
              <Switch value={true} disabled />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
