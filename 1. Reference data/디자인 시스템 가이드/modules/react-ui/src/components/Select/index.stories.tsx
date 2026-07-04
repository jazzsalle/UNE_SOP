import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Select } from ".";
import {
  IconSearch,
  IconCalendar,
  IconMail,
  IconHomeLine,
  IconFilter,
  IconFlag,
} from "../Icons";

const FRUITS = [
  { value: "apple", label: "사과" },
  { value: "banana", label: "바나나" },
  { value: "grape", label: "포도" },
  { value: "orange", label: "오렌지" },
  { value: "melon", label: "멜론" },
  { value: "watermelon", label: "수박", disabled: true },
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
  {
    label: "음료",
    options: [
      { value: "coffee", label: "커피" },
      { value: "tea", label: "차", disabled: true },
    ],
  },
];

const meta: Meta<typeof Select> = {
  title: "DATA INPUT (FORM)/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["standard", "inline"],
      description: "셀렉트 variant",
    },
    size: {
      control: { type: "select" },
      options: ["3xl", "2xl", "xl", "lg", "md", "sm", "xs", "2xs"],
      description: "셀렉트 크기",
    },
    intent: {
      control: { type: "radio" },
      options: ["none", "complete", "error"],
      description: "유효성 검증 의도",
    },
    label: {
      control: { type: "text" },
      description: "라벨 텍스트",
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
    leftIcon: {
      control: { type: "select" },
      options: [
        "none",
        "IconSearch",
        "IconCalendar",
        "IconMail",
        "IconHomeLine",
        "IconFilter",
        "IconFlag",
      ],
      description: "왼쪽 아이콘",
      mapping: {
        none: undefined,
        IconSearch: <IconSearch />,
        IconCalendar: <IconCalendar />,
        IconMail: <IconMail />,
        IconHomeLine: <IconHomeLine />,
        IconFilter: <IconFilter />,
        IconFlag: <IconFlag />,
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "드롭다운 셀렉트입니다. Label, Helper Text, Intent(검증 결과), 옵션 그룹, 아이콘을 지원하며, 8단계 크기(3xl~2xs)와 다크모드를 지원합니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  name: "props test",
  args: {
    variant: "standard",
    size: "md",
    intent: "none",
    label: "과일",
    placeholder: "선택하세요",
    helperText: "좋아하는 과일을 선택하세요",
    disabled: false,
    options: FRUITS,
    leftIcon: "none",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320, minHeight: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export const Sizes: Story = {
  name: "size - 3xl / 2xl / xl / lg / md / sm / xs / 2xs",
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px 24px",
        alignItems: "end",
        minHeight: 400,
      }}
    >
      {/* 헤더 */}
      <strong style={{ fontSize: 13, color: "#888" }}>standard</strong>
      <strong style={{ fontSize: 13, color: "#888" }}>inline</strong>

      {/* 3XLarge */}
      <Select size="3xl" label="3XLarge" options={FRUITS} placeholder="선택하세요" />
      <Select variant="inline" size="3xl" label="3XLarge" options={FRUITS} placeholder="선택하세요" />

      {/* 2XLarge */}
      <Select size="2xl" label="2XLarge" options={FRUITS} placeholder="선택하세요" />
      <Select variant="inline" size="2xl" label="2XLarge" options={FRUITS} placeholder="선택하세요" />

      {/* XLarge */}
      <Select size="xl" label="XLarge" options={FRUITS} placeholder="선택하세요" />
      <Select variant="inline" size="xl" label="XLarge" options={FRUITS} placeholder="선택하세요" />

      {/* Large */}
      <Select size="lg" label="Large" options={FRUITS} placeholder="선택하세요" />
      <Select variant="inline" size="lg" label="Large" options={FRUITS} placeholder="선택하세요" />

      {/* Medium */}
      <Select size="md" label="Medium" options={FRUITS} placeholder="선택하세요" />
      <Select variant="inline" size="md" label="Medium" options={FRUITS} placeholder="선택하세요" />

      {/* Small */}
      <Select size="sm" label="Small" options={FRUITS} placeholder="선택하세요" />
      <Select variant="inline" size="sm" label="Small" options={FRUITS} placeholder="선택하세요" />

      {/* XSmall */}
      <Select size="xs" label="XSmall" options={FRUITS} placeholder="선택하세요" />
      <Select variant="inline" size="xs" label="XSmall" options={FRUITS} placeholder="선택하세요" />

      {/* 2XSmall */}
      <Select size="2xs" label="2XSmall" options={FRUITS} placeholder="선택하세요" />
      <Select variant="inline" size="2xs" label="2XSmall" options={FRUITS} placeholder="선택하세요" />
    </div>
  ),
};

export const States: Story = {
  name: "intent & disabled",
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 16,
        minHeight: 320,
      }}
    >
      <Select
        label="Default"
        options={FRUITS}
        placeholder="선택하세요"
        helperText="이것은 도움말이에요"
      />
      <Select
        label="Complete"
        options={FRUITS}
        intent="complete"
        defaultValue="apple"
        helperText="선택 완료"
      />
      <Select
        label="Error"
        options={FRUITS}
        intent="error"
        helperText="필수 선택 항목입니다"
        placeholder="선택하세요"
      />
      <Select
        label="Disabled"
        options={FRUITS}
        disabled
        placeholder="선택하세요"
      />
      <Select
        label="Disabled (선택됨)"
        options={FRUITS}
        defaultValue="banana"
        disabled
      />
      <Select
        label="With Icon"
        options={FRUITS}
        leftIcon={<IconSearch />}
        placeholder="검색"
        helperText="이것은 도움말이에요"
      />
    </div>
  ),
};

export const Grouped: Story = {
  name: "groups",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 320, minHeight: 360 }}>
      <Select
        label="카테고리별 선택"
        groups={GROUPS}
        placeholder="항목을 선택하세요"
        helperText="그룹으로 분류된 옵션 목록"
      />
    </div>
  ),
};

export const WithOptionIcons: Story = {
  name: "options icon",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ width: 320, minHeight: 360 }}>
      <Select
        label="아이콘 옵션"
        options={[
          { value: "home", label: "홈", leftIcon: <IconHomeLine /> },
          { value: "mail", label: "메일", leftIcon: <IconMail /> },
          { value: "calendar", label: "캘린더", leftIcon: <IconCalendar /> },
          { value: "search", label: "검색", leftIcon: <IconSearch /> },
          { value: "filter", label: "필터", leftIcon: <IconFilter /> },
          {
            value: "flag",
            label: "플래그",
            leftIcon: <IconFlag />,
            disabled: true,
          },
        ]}
        placeholder="선택하세요"
      />
    </div>
  ),
};

export const Controlled: Story = {
  name: "example - reset value",
  parameters: { controls: { disable: true } },
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: 320,
          minHeight: 320,
        }}
      >
        <Select
          label="제어 컴포넌트"
          options={FRUITS}
          value={value}
          onChange={setValue}
          placeholder="선택하세요"
          intent={!value ? "error" : "complete"}
          helperText={!value ? "필수 선택 항목입니다" : `선택된 값: ${value}`}
        />
        <button
          onClick={() => setValue("")}
          style={{
            padding: "6px 12px",
            fontSize: 12,
            border: "1px solid #ddd",
            borderRadius: 4,
            cursor: "pointer",
            width: "fit-content",
          }}
        >
          선택 초기화
        </button>
      </div>
    );
  },
};

export const Inline: Story = {
  name: "variant - inline",
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: 400,
        minHeight: 320,
      }}
    >
      {/* inline variant 크기별 */}
      {(["3xl", "2xl", "xl", "lg", "md", "sm", "xs", "2xs"] as const).map((size) => (
        <Select
          key={size}
          variant="inline"
          size={size}
          label="레이블"
          options={FRUITS}
          placeholder="선택하세요"
        />
      ))}
      {/* inline + disabled */}
      <Select
        variant="inline"
        label="레이블"
        options={FRUITS}
        placeholder="선택하세요"
        disabled
      />
    </div>
  ),
};

export const TriggerStates: Story = {
  name: "trigger states",
  parameters: { controls: { disable: true } },
  render: () => {
    const intents = ["none", "error", "complete"] as const;
    const states = [
      { label: "Default", forceState: "" },
      {
        label: "Hover",
        forceState: {
          none: "none-hover",
          error: "error-hover",
          complete: "complete-hover",
        },
      },
      {
        label: "Open (Focus)",
        forceState: {
          none: "none-open",
          error: "error-open",
          complete: "complete-open",
        },
      },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <style>{`
          [data-force-state="none-hover"] [role="combobox"] { border-color: var(--light-blue-500) !important; }
          [data-force-state="none-open"] [role="combobox"] { border-color: var(--light-blue-500) !important; box-shadow: var(--selected-shadow) !important; }
          [data-force-state="error-hover"] [role="combobox"] { border-color: var(--red-600) !important; }
          [data-force-state="error-open"] [role="combobox"] { border-color: var(--red-500) !important; box-shadow: var(--selected-shadow) !important; }
          [data-force-state="complete-hover"] [role="combobox"] { border-color: var(--light-blue-500) !important; }
          [data-force-state="complete-open"] [role="combobox"] { border-color: var(--light-blue-500) !important; box-shadow: var(--selected-shadow) !important; }
          .dark [data-force-state="none-hover"] [role="combobox"] { border-color: var(--dark-blue-300) !important; }
          .dark [data-force-state="none-open"] [role="combobox"] { border-color: var(--dark-blue-300) !important; }
          .dark [data-force-state="error-hover"] [role="combobox"] { border-color: var(--red-400) !important; }
          .dark [data-force-state="error-open"] [role="combobox"] { border-color: var(--red-300) !important; }
          .dark [data-force-state="complete-hover"] [role="combobox"] { border-color: var(--dark-blue-300) !important; }
          .dark [data-force-state="complete-open"] [role="combobox"] { border-color: var(--dark-blue-300) !important; }
        `}</style>

        {/* intent별 트리거 상태 그리드 */}
        {intents.map((intent) => (
          <div key={intent}>
            <strong
              style={{
                fontSize: 13,
                color: "#888",
                marginBottom: 12,
                display: "block",
              }}
            >
              intent: {intent}
            </strong>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 240px)",
                gap: 16,
              }}
            >
              {states.map((state) => (
                <div
                  key={state.label}
                  data-force-state={typeof state.forceState === "string" ? state.forceState : state.forceState[intent]}
                  className="pointer-events-none"
                >
                  <Select
                    label={state.label}
                    intent={intent}
                    options={FRUITS}
                    placeholder="선택하세요"
                    defaultValue={intent === "complete" ? "apple" : undefined}
                    helperText={
                      intent === "error"
                        ? "필수 선택 항목입니다"
                        : intent === "complete"
                          ? "선택 완료"
                          : "도움말 텍스트"
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Disabled */}
        <div>
          <strong
            style={{
              fontSize: 13,
              color: "#888",
              marginBottom: 12,
              display: "block",
            }}
          >
            disabled
          </strong>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 240px)",
              gap: 16,
            }}
          >
            <Select
              label="Disabled (empty)"
              options={FRUITS}
              placeholder="선택하세요"
              disabled
            />
            <Select
              label="Disabled (with value)"
              options={FRUITS}
              defaultValue="banana"
              disabled
            />
          </div>
        </div>
      </div>
    );
  },
};

// 드롭다운 옵션 상태 스토리는 공통 Droplist 컴포넌트 스토리로 이관:
// → Droplist > item states

/* ──────────────────────────────────────────────
 * 드롭다운 위치 보정 테스트
 * ────────────────────────────────────────────── */

const LONG_OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  value: `opt-${i + 1}`,
  label: `옵션 ${i + 1}`,
}));

export const Positioning: Story = {
  name: "positioning - portal / auto-flip / scroll",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "드롭다운이 Portal로 document.body에 렌더되어 overflow:hidden 부모에 잘리지 않고, 뷰포트 하단 근처에서는 위로 뒤집히며, 스크롤/리사이즈 시 트리거 위치를 추적합니다.",
      },
    },
    layout: "fullscreen",
  },
  render: () => (
    <div
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 48,
      }}
    >
      {/* 케이스 1: overflow hidden 부모 안에서 잘리지 않는지 */}
      <section>
        <strong style={{ fontSize: 14, color: "#444", display: "block", marginBottom: 8 }}>
          1. overflow: hidden 부모 — 드롭다운이 잘리지 않아야 함
        </strong>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
          빨간 테두리가 <code>overflow: hidden</code>이고 Select 높이보다 짧습니다. 열었을 때 드롭다운이 빨간 박스를 넘어가도 잘리지 않으면 성공.
        </p>
        <div
          style={{
            width: 320,
            height: 80,
            padding: 12,
            overflow: "hidden",
            border: "2px dashed #ff5c5c",
            borderRadius: 8,
          }}
        >
          <Select
            label="부모가 overflow:hidden"
            options={FRUITS}
            placeholder="열어보세요"
          />
        </div>
      </section>

      {/* 케이스 2: 뷰포트 하단 근처에서 위로 뒤집히는지 */}
      <section>
        <strong style={{ fontSize: 14, color: "#444", display: "block", marginBottom: 8 }}>
          2. 뷰포트 하단 근처 — 드롭다운이 위로 뒤집혀야 함
        </strong>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
          Select 아래에 큰 빈 공간이 있어 트리거가 뷰포트 하단에 위치합니다. 열었을 때 옵션 목록이 <strong>트리거 위쪽으로</strong> 뜨면 성공.
        </p>
        <div style={{ height: "calc(100vh - 160px)" }} />
        <div style={{ width: 320 }}>
          <Select
            label="하단 근접"
            options={LONG_OPTIONS}
            placeholder="여기서 열면 위로 뒤집힘"
          />
        </div>
      </section>

      {/* 케이스 3: 스크롤 컨테이너 안에서 스크롤 추적 */}
      <section>
        <strong style={{ fontSize: 14, color: "#444", display: "block", marginBottom: 8 }}>
          3. 스크롤 시 위치 추적 — 드롭다운이 트리거를 따라가야 함
        </strong>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
          드롭다운을 연 상태에서 아래 스크롤 박스를 스크롤하세요. 드롭다운이 트리거에 붙어서 같이 움직이면 성공.
        </p>
        <div
          style={{
            width: 360,
            height: 240,
            overflow: "auto",
            border: "1px solid var(--grayscale-200)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div style={{ height: 120 }} />
          <Select
            label="스크롤 컨테이너 안"
            options={FRUITS}
            placeholder="열고 스크롤해보세요"
          />
          <div style={{ height: 600 }} />
        </div>
      </section>

      {/* 케이스 4: 여러 개 Select 가까이 — 각자 위치 계산 */}
      <section>
        <strong style={{ fontSize: 14, color: "#444", display: "block", marginBottom: 8 }}>
          4. 여러 Select 동시 배치 — 각자 독립적으로 동작해야 함
        </strong>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
          하나를 열고 다른 트리거를 클릭하면 이전은 닫히고 새로 열린 드롭다운이 각자 올바른 위치에 뜨면 성공.
        </p>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ width: 220 }}>
            <Select size="xl" options={FRUITS} placeholder="XL (48px)" />
          </div>
          <div style={{ width: 220 }}>
            <Select size="md" options={FRUITS} placeholder="MD (40px)" />
          </div>
          <div style={{ width: 220 }}>
            <Select size="xs" options={FRUITS} placeholder="XS (32px)" />
          </div>
        </div>
      </section>
    </div>
  ),
};
