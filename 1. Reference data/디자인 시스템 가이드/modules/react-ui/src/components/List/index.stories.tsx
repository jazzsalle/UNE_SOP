import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { ReactNode } from "react";
import { ListItem } from "./components/ListItem";
import type { ListItemOption, ListSize } from "./types";
import { IconHomeLine } from "@/components/Icons/IconHomeLine";
import { IconSearch } from "@/components/Icons/IconSearch";
import { IconSetting } from "@/components/Icons/IconSetting";
import { IconChevronRight } from "@/components/Icons/IconChevronRight";
import { IconArrowRight } from "@/components/Icons/IconArrowRight";
import { IconMoreVertical } from "@/components/Icons/IconMoreVertical";

// 아이콘 선택 맵 (select 컨트롤 → ReactNode 변환)
const leftIconMap: Record<string, ReactNode> = {
  none: undefined,
  IconHomeLine: <IconHomeLine />,
  IconSearch: <IconSearch />,
  IconSetting: <IconSetting />,
};

const rightIconMap: Record<string, ReactNode> = {
  none: undefined,
  IconChevronRight: <IconChevronRight />,
  IconArrowRight: <IconArrowRight />,
  IconMoreVertical: <IconMoreVertical />,
};

// 아이콘 없는 기본 옵션 (아이콘은 args로 주입)
const BASE_OPTIONS: ListItemOption[] = [
  { value: "home", label: "홈", helperText: "도움말" },
  { value: "settings", label: "설정", helperText: "도움말" },
  { value: "profile", label: "프로필", helperText: "도움말" },
  { value: "disabled", label: "비활성화", helperText: "도움말", disabled: true },
];

// 사이즈 비교용 고정 옵션
const FIXED_OPTIONS_LG: ListItemOption[] = [
  { value: "home", label: "홈", helperText: "도움말", leftIcon: <IconHomeLine />, rightIcon: <IconChevronRight /> },
  { value: "settings", label: "설정", helperText: "도움말", leftIcon: <IconHomeLine />, rightIcon: <IconChevronRight /> },
  { value: "profile", label: "프로필", helperText: "도움말", leftIcon: <IconHomeLine />, rightIcon: <IconChevronRight /> },
  { value: "disabled", label: "비활성화", helperText: "도움말", leftIcon: <IconHomeLine />, rightIcon: <IconChevronRight />, disabled: true },
];

const FIXED_OPTIONS_SM: ListItemOption[] = [
  { value: "home", label: "홈", helperText: "도움말", leftIcon: <IconHomeLine />, rightIcon: <IconChevronRight /> },
  { value: "settings", label: "설정", helperText: "도움말", leftIcon: <IconHomeLine />, rightIcon: <IconChevronRight /> },
  { value: "disabled", label: "비활성화", leftIcon: <IconHomeLine />, disabled: true },
];

// Story 전용 args 타입 (ListItem props + 아이콘 선택 키)
type StoryArgs = {
  size: ListSize;
  selected: boolean;
  showCheckbox: boolean;
  disabled: boolean;
  label: string;
  helperText: string;
  leftIcon: string;
  rightIcon: string;
};

const meta: Meta<StoryArgs> = {
  title: "Components/ListItem",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ListItem as any,
  parameters: { layout: "padded" },
  args: {
    size: "lg",
    selected: false,
    showCheckbox: false,
    disabled: false,
    label: "홈",
    helperText: "도움말",
    leftIcon: "IconHomeLine",
    rightIcon: "IconChevronRight",
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["lg", "md", "sm"],
      description: "아이템 크기",
    },
    selected: {
      control: "boolean",
      description: "선택 상태",
    },
    showCheckbox: {
      control: "boolean",
      description: "체크박스 표시",
    },
    disabled: {
      control: "boolean",
      description: "비활성화",
    },
    label: {
      control: "text",
      description: "표시 텍스트",
    },
    helperText: {
      control: "text",
      description: "보조 텍스트",
    },
    leftIcon: {
      control: { type: "select" },
      options: Object.keys(leftIconMap),
      description: "왼쪽 아이콘",
    },
    rightIcon: {
      control: { type: "select" },
      options: Object.keys(rightIconMap),
      description: "오른쪽 아이콘",
    },
  },
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  name: "props test",
  render: (args) => {
    const {
      leftIcon: leftKey,
      rightIcon: rightKey,
      size = "lg",
      selected = false,
      showCheckbox = false,
      disabled = false,
      label = "홈",
      helperText = "도움말",
    } = args;
    const option = {
      value: "item",
      label,
      helperText,
      leftIcon: leftIconMap[leftKey],
      rightIcon: rightIconMap[rightKey],
      disabled,
    };

    return (
      <div className="w-[320rem]">
        <ListItem
          option={option}
          selected={selected}
          size={size}
          showCheckbox={showCheckbox}
          onSelect={() => {}}
        />
      </div>
    );
  },
};

export const WithCheckbox: Story = {
  name: "with checkbox",
  parameters: { controls: { disable: true } },
  render: () => {
    const [value, setValue] = useState("home");
    const options = BASE_OPTIONS.map((opt) => ({
      ...opt,
      leftIcon: <IconHomeLine />,
      rightIcon: <IconChevronRight />,
    }));

    return (
      <div className="w-[320rem]">
        {/* 체크박스 포함 옵션 목록 */}
        {options.map((opt) => (
          <ListItem
            key={opt.value}
            option={opt}
            selected={opt.value === value}
            size="lg"
            showCheckbox
            onSelect={setValue}
          />
        ))}
      </div>
    );
  },
};

export const Sizes: Story = {
  name: "sizes",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-[32rem]">
      {/* lg */}
      <div>
        <p className="typo-text-sm font-medium mb-[8rem] text-[var(--color-text-subtle)]">lg (56rem)</p>
        <div className="w-[320rem]">
          {FIXED_OPTIONS_LG.map((opt) => (
            <ListItem key={opt.value} option={opt} size="lg" selected={opt.value === "home"} onSelect={() => {}} />
          ))}
        </div>
      </div>
      {/* md */}
      <div>
        <p className="typo-text-sm font-medium mb-[8rem] text-[var(--color-text-subtle)]">md (48rem)</p>
        <div className="w-[300rem]">
          {FIXED_OPTIONS_LG.map((opt) => (
            <ListItem key={opt.value} option={opt} size="md" selected={opt.value === "settings"} onSelect={() => {}} />
          ))}
        </div>
      </div>
      {/* sm */}
      <div>
        <p className="typo-text-sm font-medium mb-[8rem] text-[var(--color-text-subtle)]">sm (40rem)</p>
        <div className="w-[280rem]">
          {FIXED_OPTIONS_SM.map((opt) => (
            <ListItem key={opt.value} option={opt} size="sm" selected={opt.value === "home"} onSelect={() => {}} />
          ))}
        </div>
      </div>
    </div>
  ),
};

export const States: Story = {
  name: "states",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col w-[320rem]">
      <ListItem option={{ value: "default", label: "기본 (Default)" }} size="lg" onSelect={() => {}} />
      <ListItem option={{ value: "selected", label: "선택됨 (Selected)", helperText: "도움말" }} selected size="lg" onSelect={() => {}} />
      <ListItem option={{ value: "disabled", label: "비활성화 (Disabled)", helperText: "도움말", disabled: true }} size="lg" onSelect={() => {}} />
    </div>
  ),
};

export const WithCheckboxStates: Story = {
  name: "with checkbox states",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col w-[320rem]">
      <ListItem option={{ value: "default", label: "미선택" }} showCheckbox size="lg" onSelect={() => {}} />
      <ListItem option={{ value: "selected", label: "선택됨" }} selected showCheckbox size="lg" onSelect={() => {}} />
      <ListItem option={{ value: "disabled", label: "비활성화", disabled: true }} showCheckbox size="lg" onSelect={() => {}} />
      <ListItem option={{ value: "disabled-selected", label: "선택+비활성화", disabled: true }} selected showCheckbox size="lg" onSelect={() => {}} />
    </div>
  ),
};

export const IconVariants: Story = {
  name: "icon variants",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col w-[360rem]">
      <ListItem option={{ value: "1", label: "아이콘 없음" }} size="lg" onSelect={() => {}} />
      <ListItem option={{ value: "2", label: "왼쪽 아이콘", leftIcon: <IconHomeLine /> }} size="lg" onSelect={() => {}} />
      <ListItem option={{ value: "3", label: "오른쪽 아이콘", rightIcon: <IconChevronRight /> }} size="lg" onSelect={() => {}} />
      <ListItem
        option={{ value: "4", label: "양쪽 아이콘", helperText: "도움말", leftIcon: <IconHomeLine />, rightIcon: <IconChevronRight /> }}
        selected
        size="lg"
        onSelect={() => {}}
      />
    </div>
  ),
};
