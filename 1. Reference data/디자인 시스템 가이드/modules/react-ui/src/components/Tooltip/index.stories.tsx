import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip } from ".";
import { TooltipList } from "./components/TooltipList";
import { IconSeriousFill } from "../Icons/IconSeriousFill";
import { IconInfoCircleFill } from "../Icons/IconInfoCircleFill";
import { IconCheckFill } from "../Icons/IconCheckFill";
import { IconEmergencyFill } from "../Icons/IconEmergencyFill";

const iconOptions: Record<string, React.ReactNode> = {
  none: undefined as unknown as React.ReactNode,
  IconSeriousFill: <IconSeriousFill size={16} className="text-[var(--red-500)] dark:text-[var(--red-300)]" />,
  IconInfoCircleFill: <IconInfoCircleFill size={16} className="text-[var(--blue-500)] dark:text-[var(--blue-300)]" />,
  IconCheckFill: <IconCheckFill size={16} className="text-[var(--green-500)] dark:text-[var(--green-300)]" />,
  IconEmergencyFill: <IconEmergencyFill size={16} className="text-[var(--red-500)] dark:text-[var(--red-300)]" />,
};

const meta: Meta<typeof Tooltip> = {
  title: "FEEDBACK/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "툴팁은 요소나 본문 텍스트에 제공되는 짧은 부가 설명입니다. 설명이 필요한 대상에 마우스를 올리거나 초점을 이동했을 때 설명 텍스트가 표시됩니다.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-[80rem]">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

// ─── Props Test ───

export const Default: Story = {
  name: "props test",
  args: {
    content: "최대 1줄까지 입력하세요",
    size: "sm",
    direction: "top",
    arrow: "center",
    trigger: "hover",
    gap: 4,
    showCloseButton: false,
    children: (
      <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--grayscale-100)] typo-text-sm">
        호버하세요
      </button>
    ),
  },
  argTypes: {
    content: { control: { type: "text" } },
    size: {
      control: { type: "radio" },
      options: ["sm", "lg"],
    },
    direction: {
      control: { type: "radio" },
      options: ["top", "bottom", "left", "right"],
    },
    arrow: {
      control: { type: "radio" },
      options: ["start", "center", "end"],
    },
    trigger: {
      control: { type: "radio" },
      options: ["hover", "click"],
    },
    gap: { control: { type: "number" } },
    showCloseButton: { control: "boolean" },
    icon: {
      control: "select",
      options: Object.keys(iconOptions),
      mapping: iconOptions,
    },
    open: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
  },
};

// ─── Size ───

export const Size: Story = {
  name: "size",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-[80rem]">
      <Tooltip content="최대 1줄까지 입력하세요" size="sm" open>
        <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--grayscale-100)] typo-text-sm">
          Small
        </button>
      </Tooltip>
      <Tooltip
        content="툴팁은 150자 내외의 텍스트만 제공되어야 합니다. 내부에 닫기 버튼을 포함한 대화형 요소를 사용하지 않습니다."
        size="lg"
        open
      >
        <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--grayscale-100)] typo-text-sm">
          Large
        </button>
      </Tooltip>
    </div>
  ),
};

// ─── Direction ───

const directions = ["top", "bottom", "left", "right"] as const;

export const Direction: Story = {
  name: "direction",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-[80rem]">
      {directions.map((dir) => (
        <Tooltip
          key={dir}
          content="최대 1줄까지 입력하세요"
          direction={dir}
          open
        >
          <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--grayscale-100)] typo-text-sm">
            {dir}
          </button>
        </Tooltip>
      ))}
    </div>
  ),
};

// ─── Arrow ───

const arrows = ["start", "center", "end"] as const;

export const Arrow: Story = {
  name: "arrow",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-[80rem]">
      {arrows.map((a) => (
        <Tooltip key={a} content="최대 1줄까지 입력하세요" arrow={a} open>
          <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--grayscale-100)] typo-text-sm">
            {a}
          </button>
        </Tooltip>
      ))}
    </div>
  ),
};

// ─── Tooltip List ───

export const ListMode: Story = {
  name: "tooltip_list",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col items-start gap-[200rem]">
      <Tooltip
        content={
          <TooltipList
            items={[
              { text: "최대 1줄까지 입력하세요", icon: <IconSeriousFill size={16} /> },
              { text: "최대 1줄까지 입력하세요", icon: <IconSeriousFill size={16} /> },
              { text: "최대 1줄까지 입력하세요", icon: <IconSeriousFill size={16} /> },
            ]}
          />
        }
        size="sm"
        open
      >
        <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--grayscale-100)] typo-text-sm">
          리스트 (3개)
        </button>
      </Tooltip>
      <Tooltip
        content={
          <TooltipList
            items={[
              { text: "최대 1줄까지 입력하세요", icon: <IconSeriousFill size={16} /> },
              { text: "최대 1줄까지 입력하세요", icon: <IconSeriousFill size={16} /> },
              { text: "최대 1줄까지 입력하세요", icon: <IconSeriousFill size={16} /> },
              { text: "최대 1줄까지 입력하세요", icon: <IconSeriousFill size={16} /> },
              { text: "최대 1줄까지 입력하세요", icon: <IconSeriousFill size={16} /> },
              { text: "최대 1줄까지 입력하세요", icon: <IconSeriousFill size={16} /> },
              { text: "최대 1줄까지 입력하세요", icon: <IconSeriousFill size={16} /> },
            ]}
          />
        }
        size="sm"
        open
      >
        <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--grayscale-100)] typo-text-sm">
          리스트 (7개, 스크롤)
        </button>
      </Tooltip>
    </div>
  ),
};

// ─── Auto Flip 테스트 ───

export const AutoFlip: Story = {
  name: "auto flip (방향 자동 전환)",
  parameters: { controls: { disable: true } },
  decorators: [(Story) => <Story />],
  render: () => (
    <>
      {/* 좌상단 — left 지정 → right flip */}
      <div className="absolute top-0 left-0">
        <Tooltip content="left → right flip" direction="left" open>
          <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--primary-100)] typo-text-sm">
            좌상단 (left)
          </button>
        </Tooltip>
      </div>

      {/* 상단 중앙 — top 지정 → bottom flip */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <Tooltip content="top → bottom flip" direction="top" open>
          <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--primary-100)] typo-text-sm">
            상단 (top)
          </button>
        </Tooltip>
      </div>

      {/* 우상단 — right 지정 → left flip */}
      <div className="absolute top-0 right-0">
        <Tooltip content="right → left flip" direction="right" open>
          <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--primary-100)] typo-text-sm">
            우상단 (right)
          </button>
        </Tooltip>
      </div>

      {/* 좌측 중앙 — left 지정 → right flip */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2">
        <Tooltip content="left → right flip" direction="left" open>
          <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--primary-100)] typo-text-sm">
            좌측 (left)
          </button>
        </Tooltip>
      </div>

      {/* 중앙 — 공간 충분, flip 없음 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Tooltip content="공간 충분 → flip 없음" direction="top" open>
          <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--grayscale-100)] typo-text-sm">
            중앙 (flip 없음)
          </button>
        </Tooltip>
      </div>

      {/* 우측 중앙 — right 지정 → left flip */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2">
        <Tooltip content="right → left flip" direction="right" open>
          <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--primary-100)] typo-text-sm">
            우측 (right)
          </button>
        </Tooltip>
      </div>

      {/* 좌하단 — left 지정 → right flip */}
      <div className="absolute bottom-0 left-0">
        <Tooltip content="left → right flip" direction="left" open>
          <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--primary-100)] typo-text-sm">
            좌하단 (left)
          </button>
        </Tooltip>
      </div>

      {/* 하단 중앙 — bottom 지정 → top flip */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <Tooltip content="bottom → top flip" direction="bottom" open>
          <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--primary-100)] typo-text-sm">
            하단 (bottom)
          </button>
        </Tooltip>
      </div>

      {/* 우하단 — right 지정 → left flip */}
      <div className="absolute bottom-0 right-0">
        <Tooltip content="right → left flip" direction="right" open>
          <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--primary-100)] typo-text-sm">
            우하단 (right)
          </button>
        </Tooltip>
      </div>
    </>
  ),
};

// ─── Overflow Hidden 테스트 ───

export const OverflowHidden: Story = {
  name: "overflow: hidden 부모 내 렌더링",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-[40rem]">
      {/* overflow: hidden 컨테이너 */}
      <div>
        <p className="typo-text-sm mb-[8rem] text-[var(--grayscale-500)]">
          overflow: hidden 부모
        </p>
        <div
          className="overflow-hidden border border-dashed border-[var(--grayscale-300)] rounded-[8rem] p-[24rem]"
          style={{ width: 300, height: 80 }}
        >
          <Tooltip content="overflow: hidden이어도 잘리지 않습니다" direction="top" open>
            <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--primary-100)] typo-text-sm">
              호버하세요
            </button>
          </Tooltip>
        </div>
      </div>

      {/* overflow: auto 스크롤 컨테이너 */}
      <div>
        <p className="typo-text-sm mb-[8rem] text-[var(--grayscale-500)]">
          overflow: auto 스크롤 컨테이너
        </p>
        <div
          className="overflow-auto border border-dashed border-[var(--grayscale-300)] rounded-[8rem] p-[24rem]"
          style={{ width: 300, height: 80 }}
        >
          <Tooltip content="스크롤 컨테이너에서도 정상 표시" direction="bottom" open>
            <button className="px-[12rem] py-[8rem] rounded-[6rem] bg-[var(--primary-100)] typo-text-sm">
              호버하세요
            </button>
          </Tooltip>
        </div>
      </div>

      {/* text-overflow: ellipsis + overflow: hidden */}
      <div>
        <p className="typo-text-sm mb-[8rem] text-[var(--grayscale-500)]">
          말줄임(ellipsis) + overflow: hidden
        </p>
        <div
          className="overflow-hidden border border-dashed border-[var(--grayscale-300)] rounded-[8rem] p-[24rem]"
          style={{ width: 200 }}
        >
          <Tooltip content="말줄임 텍스트에 Tooltip 적용" direction="top" open>
            <p
              className="typo-text-sm"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              아주 긴 텍스트가 말줄임으로 잘려도 툴팁은 정상적으로 표시됩니다
            </p>
          </Tooltip>
        </div>
      </div>
    </div>
  ),
};
