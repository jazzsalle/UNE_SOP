import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { Input, type InputSize } from ".";
import {
  IconSearch,
  IconMail,
  IconCalendar,
  IconCall,
  IconLink,
  IconDollar,
  IconHidePassword,
  IconViewPassword,
  IconSetting,
  IconProfileFill,
} from "../Icons";
import { IconButton } from "../buttons/IconButton";
import type { IconButtonSize } from "../buttons/IconButton/styles";

const iconMap: Record<string, ReactNode> = {
  none: undefined,
  IconSearch: <IconSearch />,
  IconMail: <IconMail />,
  IconCalendar: <IconCalendar />,
  IconCall: <IconCall />,
  IconLink: <IconLink />,
  IconDollar: <IconDollar />,
  IconProfileFill: <IconProfileFill />,
};

const rightButtonIcons: Record<string, ReactNode> = {
  none: undefined,
  IconHidePassword: <IconHidePassword />,
  IconViewPassword: <IconViewPassword />,
  IconSearch: <IconSearch />,
  IconSetting: <IconSetting />,
};

const slotButtonSize: Record<InputSize, IconButtonSize> = {
  "3xl": "md",
  "2xl": "sm",
  xl:    "xs",
  lg:    "xs",
  md:    "2xs",
  sm:    "3xs",
  xs:    "3xs",
  "2xs": "4xs",
};

const meta: Meta<typeof Input> = {
  title: "DATA INPUT (FORM)/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "radio" },
      options: ["3xl", "2xl", "xl", "lg", "md", "sm", "xs", "2xs"],
      description: "입력 필드 크기",
    },
    variant: {
      control: { type: "radio" },
      options: ["standard", "inline"],
      description: "레이아웃 변형 — standard: 레이블 위, inline: 레이블 왼쪽",
    },
    intent: {
      control: { type: "radio" },
      options: ["default", "complete", "error"],
      description: "유효성 검증 의도",
    },
    label: {
      control: { type: "text" },
      description: "레이블 텍스트",
    },
    placeholder: {
      control: { type: "text" },
      description: "플레이스홀더",
    },
    helperText: {
      control: { type: "text" },
      description: "하단 안내 문구",
    },
    disabled: {
      control: { type: "boolean" },
      description: "비활성화",
    },
    clearable: {
      control: { type: "boolean" },
      description: "초기화 버튼 표시",
    },
    leftIcon: {
      control: { type: "select" },
      options: Object.keys(iconMap),
      description: "왼쪽 슬롯 (아이콘)",
      mapping: iconMap,
    },
    rightButton: {
      control: { type: "select" },
      options: Object.keys(rightButtonIcons),
      description: "오른쪽 슬롯 (아이콘 버튼)",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "텍스트 입력 필드입니다. Standard(레이블 위) / Inline(레이블 왼쪽) 변형, Label, Helper Text, Intent, 좌우 슬롯, Clear 버튼을 지원하며, 8단계 크기(3xl ~ 2xs)와 다크모드를 지원합니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  name: "props test",
  args: {
    size: "md",
    variant: "standard",
    intent: "default",
    label: "레이블",
    placeholder: "텍스트를 입력하세요",
    helperText: "도움말 텍스트",
    disabled: false,
    clearable: true,
    leftIcon: "none" as any,
    rightButton: "none" as any,
  },
  render: ({ rightButton, size = "md", ...args }) => {
    const rightButtonNode =
      rightButton && rightButtonIcons[rightButton as string] ? (
        <IconButton
          variant="ghost"
          color="grayscale"
          size={slotButtonSize[size]}
          icon={rightButtonIcons[rightButton as string]}
        />
      ) : undefined;
    return <Input {...args} size={size} rightButton={rightButtonNode} />;
  },
};

const noControls = { parameters: { controls: { disable: true } } };

export const Sizes: Story = {
  ...noControls,
  name: "size - 3xl / 2xl / xl / lg / md / sm / xs / 2xs",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 360 }}>
      <Input size="3xl" label="3XL" placeholder="3xl 크기 입력" />
      <Input size="2xl" label="2XL" placeholder="2xl 크기 입력" />
      <Input size="xl"  label="XL"  placeholder="xl 크기 입력" />
      <Input size="lg"  label="LG"  placeholder="lg 크기 입력" />
      <Input size="md"  label="MD"  placeholder="md 크기 입력" />
      <Input size="sm"  label="SM"  placeholder="sm 크기 입력" />
      <Input size="xs"  label="XS"  placeholder="xs 크기 입력" />
      <Input size="2xs" label="2XS" placeholder="2xs 크기 입력" />
    </div>
  ),
};

export const InlineVariant: Story = {
  ...noControls,
  name: "inline variant",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 480 }}>
      <Input variant="inline" size="3xl" label="항목명" placeholder="값을 입력하세요" />
      <Input variant="inline" size="2xl" label="항목명" placeholder="값을 입력하세요" />
      <Input variant="inline" size="xl"  label="항목명" placeholder="값을 입력하세요" />
      <Input variant="inline" size="lg"  label="항목명" placeholder="값을 입력하세요" />
      <Input variant="inline" size="md"  label="항목명" placeholder="값을 입력하세요" />
      <Input variant="inline" size="sm"  label="항목명" placeholder="값을 입력하세요" />
      <Input variant="inline" size="xs"  label="항목명" placeholder="값을 입력하세요" />
      <Input variant="inline" size="2xs" label="항목명" placeholder="값을 입력하세요" />
    </div>
  ),
};

export const Intent: Story = {
  ...noControls,
  name: "intent - none / complete / error",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 360 }}>
      <Input
        label="Default"
        placeholder="기본 상태"
        helperText="메시지를 입력하세요"
      />
      <Input
        label="Complete"
        defaultValue="protecto@email.com"
        intent="complete"
        helperText="사용 가능한 이메일입니다"
      />
      <Input
        label="Error"
        defaultValue="잘못된 입력"
        intent="error"
        helperText="필수 입력 항목입니다"
      />
    </div>
  ),
};

export const Controlled: Story = {
  ...noControls,
  name: "intent test",
  render: () => {
    const [value, setValue] = useState("");
    const intent =
      value.length === 0
        ? ("default" as const)
        : value.length < 5
        ? ("error" as const)
        : ("complete" as const);
    const helperText =
      value.length === 0
        ? "글자 수에 따라 intent가 변경됩니다"
        : value.length < 5
        ? "5자 이상 입력해주세요"
        : "입력이 완료되었습니다";
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 360 }}>
        <Input
          label="제어 컴포넌트"
          placeholder="5자 이상 입력하세요"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          clearable
          onClear={() => setValue("")}
          intent={intent}
          helperText={helperText}
        />
        <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
          조건: 0자 = default / 1~4자 = error / 5자 이상 = complete
        </p>
      </div>
    );
  },
};

export const States: Story = {
  name: "states",
  ...noControls,
  render: () => {
    const intents = ["default", "error", "complete"] as const;
    const states = [
      { label: "Default", forceClass: "" },
      { label: "Hover", forceClass: {
          default: "force-default-hover",
          error: "force-error-hover",
          complete: "force-complete-hover",
        }
      },
      { label: "Focus", forceClass: {
          default: "force-default-focus",
          error: "force-error-focus",
          complete: "force-complete-focus",
        }
      },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32, width: "fit-content" }}>
        <style>{`
          .force-default-hover { border-color: var(--light-blue-500) !important; }
          .force-default-focus { border-color: var(--light-blue-500) !important; box-shadow: var(--selected-shadow) !important; }
          .force-error-hover { border-color: var(--red-600) !important; }
          .force-error-focus { border-color: var(--red-500) !important; box-shadow: var(--selected-shadow) !important; }
          .force-complete-hover { border-color: var(--light-blue-500) !important; }
          .force-complete-focus { border-color: var(--light-blue-500) !important; box-shadow: var(--selected-shadow) !important; }
          .dark .force-default-hover { border-color: var(--dark-blue-300) !important; }
          .dark .force-default-focus { border-color: var(--dark-blue-300) !important; }
          .dark .force-error-hover { border-color: var(--red-400) !important; }
          .dark .force-error-focus { border-color: var(--red-300) !important; }
          .dark .force-complete-hover { border-color: var(--dark-blue-300) !important; }
          .dark .force-complete-focus { border-color: var(--dark-blue-300) !important; }
        `}</style>

        {/* intent별 상태 그리드 */}
        {intents.map((intent) => (
          <div key={intent}>
            <strong style={{ fontSize: 13, color: "#888", marginBottom: 12, display: "block" }}>
              intent: {intent}
            </strong>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {states.map((state) => (
                <Input
                  key={state.label}
                  size="lg"
                  label={state.label}
                  intent={intent}
                  placeholder="입력하세요"
                  helperText={
                    intent === "error" ? "필수 입력 항목입니다" :
                    intent === "complete" ? "사용 가능합니다" :
                    "도움말 텍스트"
                  }
                  defaultValue={intent === "complete" ? "입력값" : undefined}
                  className={`pointer-events-none ${typeof state.forceClass === "string" ? state.forceClass : state.forceClass[intent]}`}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Disabled */}
        <div>
          <strong style={{ fontSize: 13, color: "#888", marginBottom: 12, display: "block" }}>
            disabled
          </strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <Input size="lg" label="Disabled (empty)" placeholder="입력하세요" disabled />
            <Input size="lg" label="Disabled (with value)" defaultValue="입력된 값" disabled />
          </div>
        </div>
      </div>
    );
  },
};
