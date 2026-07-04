import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps, ReactNode } from "react";
import { useArgs } from "storybook/preview-api";
import { expect, within } from "storybook/test";
import { Tabs } from "./components/Tabs";
import { TabList } from "./components/TabList";
import { TabButton } from "./components/TabButton";
import { TabPanel } from "./components/TabPanel";
import type { TabSize } from "./context";
import type { BadgeProps } from "../badges/Badge";
import { IconHomeLine } from "../Icons/IconHomeLine";
import { IconSearch } from "../Icons/IconSearch";
import { IconHeartLine } from "../Icons/IconHeartLine";

// 아이콘 선택지 — className="size-full"로 탭 사이즈별 wrapper에 맞게 채움
const iconMap: Record<string, ReactNode> = {
  none: undefined,
  IconHomeLine: <IconHomeLine className="size-full" />,
  IconSearch: <IconSearch className="size-full" />,
  IconHeartLine: <IconHeartLine className="size-full" />,
};

type TabStoryArgs = ComponentProps<typeof Tabs> & {
  leftIcon: string;
  badge: boolean;
};

const meta: Meta<TabStoryArgs> = {
  title: "NAVIGATION/Tab✅",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "상황에 따라 여러 가지 콘텐츠를 전환할 수 있는 탭 컴포넌트입니다.",
      },
    },
  },
  argTypes: {
    size: {
      control: { type: "radio" },
      options: ["lg", "md", "sm"],
      description: "탭 크기",
    },
    leftIcon: {
      control: { type: "select" },
      options: Object.keys(iconMap),
      description: "왼쪽 아이콘",
    },
    badge: {
      control: { type: "boolean" },
      description: "뱃지 표시",
    },
  },
};
export default meta;

type Story = StoryObj<TabStoryArgs>;

export const Default: Story = {
  name: "props test",
  render: () => {
    const [{ value, size, leftIcon: leftIconKey, badge: showBadge }, updateArgs] = useArgs<TabStoryArgs>();

    const icon = iconMap[leftIconKey ?? "none"];
    // size는 TabButton이 컨텍스트에서 자동 결정하므로 생략
    const badgeProps: BadgeProps | undefined = showBadge
      ? { label: "1", color: "secondary", variant: "solid-pastel" }
      : undefined;

    return (
      <div>
        <Tabs
          value={value}
          setValue={(v: string) => updateArgs({ value: v })}
          size={size as TabSize}
        >
          <TabList>
            {/* 탭 버튼 목록 — icon/badge는 Controls에서 일괄 제어 */}
            <TabButton value="tab1" label="레이블" icon={icon} badge={badgeProps} />
            <TabButton value="tab2" label="레이블" icon={icon} badge={badgeProps} />
            <TabButton value="tab3" label="레이블" icon={icon} badge={badgeProps} />
            <TabButton value="tab4" label="레이블" icon={icon} badge={badgeProps} />
            <TabButton value="tab5" label="레이블" icon={icon} badge={badgeProps} />
          </TabList>

          <TabPanel value="tab1">탭 1 컨텐츠</TabPanel>
          <TabPanel value="tab2">탭 2 컨텐츠</TabPanel>
          <TabPanel value="tab3">탭 3 컨텐츠</TabPanel>
          <TabPanel value="tab4">탭 4 컨텐츠</TabPanel>
          <TabPanel value="tab5">탭 5 컨텐츠</TabPanel>
        </Tabs>
      </div>
    );
  },
  args: {
    value: "tab1",
    size: "lg",
    leftIcon: "none",
    badge: false,
  },
};

// [regression] 스크린리더가 탭 선택 상태를 인식할 수 있도록
// TabList에는 role="tablist", TabButton에는 role="tab" + aria-selected가 노출되어야 한다.
// Storybook 사이드바에는 노출하지 않고, npm run test 시에만 실행되는 테스트 전용 스토리
export const A11yRolesAndAriaSelected: Story = {
  tags: ["!autodocs", "!dev"],
  name: "[a11y] role=tab/tablist + aria-selected 노출",
  render: () => (
    <Tabs value="tab2" setValue={() => {}} size="lg">
      <TabList>
        <TabButton value="tab1" label="첫 번째" />
        <TabButton value="tab2" label="두 번째" />
        <TabButton value="tab3" label="세 번째" />
      </TabList>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // tablist 컨테이너 존재
    const tablist = canvas.getByRole("tablist");
    expect(tablist).toBeInTheDocument();

    // 모든 탭이 role="tab"으로 노출되고 라벨로 찾을 수 있어야 함
    const tab1 = canvas.getByRole("tab", { name: "첫 번째" });
    const tab2 = canvas.getByRole("tab", { name: "두 번째" });
    const tab3 = canvas.getByRole("tab", { name: "세 번째" });

    // 선택 상태가 aria-selected로 노출되어야 함
    expect(tab1).toHaveAttribute("aria-selected", "false");
    expect(tab2).toHaveAttribute("aria-selected", "true");
    expect(tab3).toHaveAttribute("aria-selected", "false");
  },
};

export const Sizes: Story = {
  name: "sizes",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* lg */}
      <div>
        <strong style={{ fontSize: 13, color: "#888", marginBottom: 8, display: "block" }}>lg (56px)</strong>
        <Tabs value="tab2" setValue={() => {}} size="lg">
          <TabList>
            <TabButton value="tab1" label="레이블" />
            <TabButton value="tab2" label="레이블" />
            <TabButton value="tab3" label="레이블" />
            <TabButton value="tab4" label="레이블" />
          </TabList>
        </Tabs>
      </div>

      {/* md */}
      <div>
        <strong style={{ fontSize: 13, color: "#888", marginBottom: 8, display: "block" }}>md (48px)</strong>
        <Tabs value="tab2" setValue={() => {}} size="md">
          <TabList>
            <TabButton value="tab1" label="레이블" />
            <TabButton value="tab2" label="레이블" />
            <TabButton value="tab3" label="레이블" />
            <TabButton value="tab4" label="레이블" />
          </TabList>
        </Tabs>
      </div>

      {/* sm */}
      <div>
        <strong style={{ fontSize: 13, color: "#888", marginBottom: 8, display: "block" }}>sm (40px)</strong>
        <Tabs value="tab2" setValue={() => {}} size="sm">
          <TabList>
            <TabButton value="tab1" label="레이블" />
            <TabButton value="tab2" label="레이블" />
            <TabButton value="tab3" label="레이블" />
            <TabButton value="tab4" label="레이블" />
          </TabList>
        </Tabs>
      </div>
    </div>
  ),
};

export const States: Story = {
  name: "states",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <style>{`
        [data-force-state] button:nth-child(2) > div:first-child {
          background-color: var(--color-bg-muted) !important;
        }
        [data-force-state] button:nth-child(3) > div:first-child {
          background-color: var(--color-bg-muted) !important;
        }
      `}</style>

      <div>
        <div style={{ display: "flex", gap: 4, fontSize: 11, color: "#aaa", marginBottom: 4 }}>
          <span style={{ flex: 1, textAlign: "center" }}>Default</span>
          <span style={{ flex: 1, textAlign: "center" }}>Hover</span>
          <span style={{ flex: 1, textAlign: "center" }}>Active</span>
          <span style={{ flex: 1, textAlign: "center" }}>Selected</span>
        </div>
        <div className="pointer-events-none" data-force-state="line" style={{ width: 480 }}>
          <Tabs value="tab4" setValue={() => {}} size="lg">
            <TabList>
              <TabButton value="tab1" label="Default" />
              <TabButton value="tab2" label="Hover" />
              <TabButton value="tab3" label="Active" />
              <TabButton value="tab4" label="Selected" />
            </TabList>
          </Tabs>
        </div>
      </div>
    </div>
  ),
};
