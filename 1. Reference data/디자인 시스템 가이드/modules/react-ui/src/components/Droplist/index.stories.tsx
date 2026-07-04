import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Droplist } from ".";
import { Modal } from "../Modal";
import { Button } from "../buttons/Button";
import {
  IconHomeLine,
  IconMail,
  IconCalendar,
  IconSearch,
  IconFilter,
} from "../Icons";

const FRUITS = [
  { value: "apple", label: "사과" },
  { value: "banana", label: "바나나" },
  { value: "grape", label: "포도" },
  { value: "orange", label: "오렌지" },
  { value: "melon", label: "멜론" },
  { value: "watermelon", label: "수박", disabled: true },
];

const ICON_OPTIONS = [
  { value: "home", label: "홈", leftIcon: <IconHomeLine /> },
  { value: "mail", label: "메일", leftIcon: <IconMail /> },
  { value: "calendar", label: "캘린더", leftIcon: <IconCalendar /> },
  { value: "search", label: "검색", leftIcon: <IconSearch /> },
  { value: "filter", label: "필터", leftIcon: <IconFilter />, disabled: true },
];

const GROUPS = [
  {
    label: "과일",
    options: [
      { value: "apple", label: "사과" },
      { value: "banana", label: "바나나" },
      { value: "grape", label: "포도" },
    ],
  },
  {
    label: "채소",
    options: [
      { value: "carrot", label: "당근" },
      { value: "tomato", label: "토마토" },
      { value: "cucumber", label: "오이" },
    ],
  },
];

// depth 스토리용 — children이 있는 옵션은 자동으로 서브 드롭리스트 표시
const DEPTH_OPTIONS = [
  {
    value: "dashboard",
    label: "대시보드",
    leftIcon: <IconHomeLine />,
    children: [
      { value: "overview", label: "개요", leftIcon: <IconHomeLine /> },
      { value: "analytics", label: "분석", leftIcon: <IconHomeLine /> },
      { value: "reports", label: "리포트", leftIcon: <IconHomeLine /> },
    ],
  },
  {
    value: "mail",
    label: "메일",
    leftIcon: <IconMail />,
    children: [
      { value: "inbox", label: "받은편지함", leftIcon: <IconMail /> },
      { value: "sent", label: "보낸편지함", leftIcon: <IconMail /> },
      { value: "drafts", label: "임시저장", leftIcon: <IconMail /> },
    ],
  },
  {
    value: "calendar",
    label: "캘린더",
    leftIcon: <IconCalendar />,
    children: [
      { value: "today", label: "오늘", leftIcon: <IconCalendar /> },
      { value: "week", label: "이번 주", leftIcon: <IconCalendar /> },
      { value: "month", label: "이번 달", leftIcon: <IconCalendar /> },
    ],
  },
  { value: "search", label: "검색", leftIcon: <IconSearch /> },
  { value: "filter", label: "필터", leftIcon: <IconFilter /> },
  { value: "settings", label: "설정", leftIcon: <IconHomeLine /> },
];

const meta: Meta<typeof Droplist> = {
  component: Droplist,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Select, Autocomplete 등에서 재사용하는 공통 드롭다운 목록 컴포넌트입니다. 아이템 렌더링은 ListItem을 공유합니다.",
      },
    },
  },
  argTypes: {
    config: {
      control: { type: "object" },
      description: "너비 등 레이아웃 설정. children 필드로 하위 드롭리스트 설정 전달",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Droplist>;

export const Default: Story = {
  name: "props test",
  args: {
    config: { width: "240rem" },
  },
  render: (args) => {
    const [value, setValue] = useState("banana");
    return <Droplist options={FRUITS} value={value} onSelect={setValue} config={args.config} />;
  },
};

export const WithIcons: Story = {
  name: "options icon",
  parameters: { controls: { disable: true } },
  render: () => {
    const [value, setValue] = useState("home");
    return (
      <div style={{ width: 240 }}>
        <Droplist options={ICON_OPTIONS} value={value} onSelect={setValue} />
      </div>
    );
  },
};

export const Grouped: Story = {
  name: "groups",
  parameters: { controls: { disable: true } },
  render: () => {
    const [value, setValue] = useState("apple");
    return (
      <div style={{ width: 240 }}>
        <Droplist groups={GROUPS} value={value} onSelect={setValue} />
      </div>
    );
  },
};

export const WithDepth: Story = {
  name: "with depth",
  parameters: { controls: { disable: true } },
  render: () => {
    const [value, setValue] = useState<string | undefined>(undefined);
    const [jsonOpen, setJsonOpen] = useState(false);
    const [configOpen, setConfigOpen] = useState(false);

    const storyConfig = { width: "240rem", children: { width: "180rem" } };

    const optionsJson = JSON.stringify(
      DEPTH_OPTIONS.map(({ leftIcon: _, children, ...rest }) => ({
        ...rest,
        ...(children ? { children: children.map(({ leftIcon: __, ...c }) => c) } : {}),
      })),
      null,
      2,
    );

    const configJson = JSON.stringify(storyConfig, null, 2);

    return (
      // 서브 드롭리스트가 오른쪽으로 펼쳐지므로 여유 공간 확보
      <div style={{ width: 480, height: 360 }}>
        <div>
          <Droplist
            options={DEPTH_OPTIONS}
            value={value}
            onSelect={setValue}
            config={storyConfig}
          />
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <Button size="sm" color="grayscale" onClick={() => setJsonOpen(true)}>
            options JSON 확인하기
          </Button>
          <Button size="sm" color="grayscale" onClick={() => setConfigOpen(true)}>
            config JSON 확인하기
          </Button>
        </div>
        <Modal
          open={jsonOpen}
          onClose={() => setJsonOpen(false)}
          title="options JSON"
          className="!h-[320rem]"
          footer={
            <Button size="md" onClick={() => setJsonOpen(false)}>
              닫기
            </Button>
          }
        >
          <pre style={{ fontSize: 12, whiteSpace: "pre-wrap", margin: 0 }}>{optionsJson}</pre>
        </Modal>
        <Modal
          open={configOpen}
          onClose={() => setConfigOpen(false)}
          title="config JSON"
          className="!h-[320rem]"
          footer={
            <Button size="md" onClick={() => setConfigOpen(false)}>
              닫기
            </Button>
          }
        >
          <pre style={{ fontSize: 12, whiteSpace: "pre-wrap", margin: 0 }}>{configJson}</pre>
        </Modal>
      </div>
    );
  },
};

export const LongList: Story = {
  name: "long list (scroll 동작)",
  parameters: { controls: { disable: true } },
  render: () => {
    const items = Array.from({ length: 30 }, (_, i) => ({
      value: `opt-${i + 1}`,
      label: `옵션 ${i + 1}`,
    }));
    const [value, setValue] = useState("opt-5");
    return (
      <div style={{ width: 240, height: 280 }}>
        <Droplist
          options={items}
          value={value}
          onSelect={setValue}
          style={{ maxHeight: 240 }}
        />
      </div>
    );
  },
};
