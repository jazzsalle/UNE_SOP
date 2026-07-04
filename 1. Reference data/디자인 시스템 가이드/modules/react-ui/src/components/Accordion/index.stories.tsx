import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import type { ReactNode } from "react";
import { Accordion } from "./index";
import type { AccordionSize, AccordionVariant } from "./index";
import { ListItem } from "@/components/List";
import type { ListItemOption } from "@/components/List";
import { IconHomeLine } from "@/components/Icons/IconHomeLine";
import { IconSearch } from "@/components/Icons/IconSearch";
import { IconInfoCircleLine } from "@/components/Icons/IconInfoCircleLine";

const iconMap: Record<string, ReactNode> = {
  none: undefined,
  IconHomeLine: <IconHomeLine size={20} />,
  IconSearch: <IconSearch size={20} />,
  IconInfoCircleLine: <IconInfoCircleLine size={20} />,
};

const SAMPLE_LIST_ITEMS: ListItemOption[] = [
  { value: "item1", label: "메뉴 항목 1" },
  { value: "item2", label: "메뉴 항목 2" },
  { value: "item3", label: "메뉴 항목 3" },
  { value: "item4", label: "메뉴 항목 4 (비활성화)", disabled: true },
];

const SAMPLE_CONTENT = "아코디언이 펼쳐지면 자세한 설명 본문 또는 UI 요소가 이 영역에 노출됩니다.";

const meta: Meta<typeof Accordion> = {
  title: "NAVIGATION/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "헤더 클릭으로 콘텐츠 영역을 열고 닫을 수 있는 아코디언 컴포넌트입니다.",
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["line", "selecte"] as AccordionVariant[],
      description: "컨테이너 스타일 변형",
    },
    size: {
      control: { type: "radio" },
      options: ["lg", "md", "sm"] as AccordionSize[],
      description: "헤더 크기",
    },
    open: {
      control: { type: "boolean" },
      description: "열림 상태 (제어 모드)",
    },
    disabled: {
      control: { type: "boolean" },
      description: "비활성화 상태",
    },
    title: {
      control: { type: "text" },
      description: "헤더 타이틀 텍스트",
    },
    leftIcon: {
      control: { type: "select" },
      options: Object.keys(iconMap),
      description: "헤더 왼쪽 아이콘",
    },
    showBodyText: {
      control: { type: "boolean" },
      description: "열림 시 본문 텍스트 영역 표시 여부",
    },
    showList: {
      control: { type: "boolean" },
      description: "열림 시 리스트 콘텐츠 표시 여부",
    },
    headerCheckbox: {
      control: { type: "boolean" },
      description: "헤더 체크박스 표시 여부",
    },
    checked: {
      control: { type: "boolean" },
      description: "헤더 체크박스 선택 상태",
    },
    helperText: {
      control: { type: "text" },
      description: "헤더 우측 보조 텍스트",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  name: "props test",
  render: () => {
    const [args, updateArgs] = useArgs();
    const leftIcon = iconMap[args.leftIcon as string];
    const size = args.size as AccordionSize;

    return (
      <div style={{ width: 480 }}>
        <Accordion
          variant={args.variant as AccordionVariant}
          size={size}
          open={args.open as boolean}
          disabled={args.disabled as boolean}
          title={args.title as string}
          leftIcon={leftIcon}
          headerCheckbox={args.headerCheckbox as boolean}
          checked={args.checked as boolean}
          onCheckedChange={(v) => updateArgs({ checked: v })}
          helperText={args.helperText as string}
          showBodyText={args.showBodyText as boolean}
          showList={args.showList as boolean}
          list={
            <>
              {/* 리스트 항목 */}
              {SAMPLE_LIST_ITEMS.map((item) => (
                <ListItem key={item.value} option={item} size={size} />
              ))}
            </>
          }
          onToggle={(v) => updateArgs({ open: v })}
        >
          {SAMPLE_CONTENT}
        </Accordion>
      </div>
    );
  },
  args: {
    variant: "selecte",
    size: "lg",
    open: false,
    disabled: false,
    title: "아코디언 타이틀 영역",
    leftIcon: "none",
    showBodyText: true,
    showList: false,
    headerCheckbox: false,
    checked: false,
    helperText: "",
  },
};

export const Variants: Story = {
  name: "variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, width: 480 }}>
      {/* 기본형 */}
      <div>
        <strong style={{ fontSize: 12, color: "#888", marginBottom: 8, display: "block" }}>selecte (기본형)</strong>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Accordion variant="selecte" size="lg" title="닫힌 상태 타이틀">
            {SAMPLE_CONTENT}
          </Accordion>
          <Accordion variant="selecte" size="lg" defaultOpen title="열린 상태 타이틀">
            {SAMPLE_CONTENT}
          </Accordion>
        </div>
      </div>

      {/* 라인형 */}
      <div>
        <strong style={{ fontSize: 12, color: "#888", marginBottom: 8, display: "block" }}>line (라인형)</strong>
        <Accordion variant="line" size="lg" title="닫힌 상태 타이틀">
          {SAMPLE_CONTENT}
        </Accordion>
        <Accordion variant="line" size="lg" defaultOpen title="열린 상태 타이틀">
          {SAMPLE_CONTENT}
        </Accordion>
        <Accordion variant="line" size="lg" title="세 번째 타이틀">
          {SAMPLE_CONTENT}
        </Accordion>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: "sizes",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 480 }}>
      {/* LG */}
      <div>
        <strong style={{ fontSize: 12, color: "#888", marginBottom: 8, display: "block" }}>lg (64px)</strong>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Accordion size="lg" title="닫힌 상태">
            {SAMPLE_CONTENT}
          </Accordion>
          <Accordion size="lg" defaultOpen title="열린 상태">
            {SAMPLE_CONTENT}
          </Accordion>
        </div>
      </div>

      {/* MD */}
      <div>
        <strong style={{ fontSize: 12, color: "#888", marginBottom: 8, display: "block" }}>md (56px)</strong>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Accordion size="md" title="닫힌 상태">
            {SAMPLE_CONTENT}
          </Accordion>
          <Accordion size="md" defaultOpen title="열린 상태">
            {SAMPLE_CONTENT}
          </Accordion>
        </div>
      </div>

      {/* SM */}
      <div>
        <strong style={{ fontSize: 12, color: "#888", marginBottom: 8, display: "block" }}>sm (48px)</strong>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Accordion size="sm" title="닫힌 상태">
            {SAMPLE_CONTENT}
          </Accordion>
          <Accordion size="sm" defaultOpen title="열린 상태">
            {SAMPLE_CONTENT}
          </Accordion>
        </div>
      </div>
    </div>
  ),
};

export const States: Story = {
  name: "states",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, width: 480 }}>
      <div>
        <div style={{ display: "flex", gap: 4, fontSize: 11, color: "#aaa", marginBottom: 4 }}>
          <span style={{ flex: 1, textAlign: "center" }}>Default (closed)</span>
          <span style={{ flex: 1, textAlign: "center" }}>Open</span>
          <span style={{ flex: 1, textAlign: "center" }}>Disabled</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Accordion size="lg" title="타이틀">
              {SAMPLE_CONTENT}
            </Accordion>
          </div>
          <div style={{ flex: 1 }}>
            <Accordion size="lg" defaultOpen title="타이틀">
              {SAMPLE_CONTENT}
            </Accordion>
          </div>
          <div style={{ flex: 1 }}>
            <Accordion size="lg" disabled title="타이틀">
              {SAMPLE_CONTENT}
            </Accordion>
          </div>
        </div>
      </div>

      {/* 아이콘 포함 */}
      <div>
        <strong style={{ fontSize: 12, color: "#888", marginBottom: 8, display: "block" }}>with icon</strong>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Accordion size="lg" leftIcon={<IconHomeLine />} title="아이콘 포함 닫힌 상태">
            {SAMPLE_CONTENT}
          </Accordion>
          <Accordion size="lg" leftIcon={<IconHomeLine />} defaultOpen title="아이콘 포함 열린 상태">
            {SAMPLE_CONTENT}
          </Accordion>
        </div>
      </div>
    </div>
  ),
};
