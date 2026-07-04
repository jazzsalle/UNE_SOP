import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Textarea } from ".";

const meta: Meta<typeof Textarea> = {
  title: "DATA INPUT (FORM)/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "radio" },
      options: ["lg", "md", "sm"],
      description: "입력 필드 크기",
    },
    label: {
      control: { type: "text" },
      description: "라벨 텍스트",
    },
    placeholder: {
      control: { type: "text" },
      description: "플레이스홀더",
    },
    intent: {
      control: { type: "radio" },
      options: ["default", "complete", "error"],
      description: "유효성 검증 의도",
    },
    helperText: {
      control: { type: "text" },
      description: "하단 안내/결과 메시지",
    },
    maxLength: {
      control: { type: "number" },
      description: "글자 수 제한",
    },
    showCounter: {
      control: { type: "boolean" },
      description: "카운터 표시",
    },
    disabled: {
      control: { type: "boolean" },
      description: "비활성화",
    },
    resize: {
      control: { type: "radio" },
      options: ["none", "vertical", "auto"],
      description: "리사이즈 동작",
    },
    minHeight: {
      control: { type: "number" },
      description: "최소 높이 (rem)",
    },
    maxHeight: {
      control: { type: "number" },
      description: "최대 높이 (rem)",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "텍스트 영역 입력 필드입니다. Label, Helper Text, Intent(검증 결과), Counter(글자 수), 자동 높이 조절을 지원하며, 다크모드를 지원합니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  name: "props test",
  args: {
    size: "md",
    label: "레이블",
    placeholder: "입력하세요",
    intent: "default",
    helperText: "메시지를 입력하세요",
    maxLength: 100,
    showCounter: true,
    disabled: false,
    resize: "none",
    minHeight: 100,
    maxHeight: 176,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
};

const noControls = { parameters: { controls: { disable: true } } };

export const Sizes: Story = {
  name: "sizes",
  ...noControls,
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {(["lg", "md", "sm"] as const).map((size) => (
        <div key={size} style={{ flex: 1 }}>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>{size}</p>
          <Textarea
            size={size}
            label="레이블"
            placeholder="입력하세요"
            showCounter
            maxLength={100}
            helperText="메시지를 입력하세요"
            intent="complete"
          />
        </div>
      ))}
    </div>
  ),
};

export const Intent: Story = {
  name: "intent",
  ...noControls,
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 24,
        rowGap: 40,
      }}
    >
      {/* Default 행 */}
      <Textarea
        label="레이블"
        placeholder="입력하세요"
        showCounter
        maxLength={100}
        helperText="메시지를 입력하세요"
      />
      <Textarea
        label="레이블"
        placeholder="입력하세요"
        intent="complete"
        showCounter
        maxLength={100}
        helperText="메시지를 입력하세요"
      />
      <Textarea
        label="레이블"
        placeholder="입력하세요"
        intent="error"
        showCounter
        maxLength={100}
        helperText="메시지를 입력하세요"
        defaultValue="입력하세요"
      />
      <Textarea
        label="레이블"
        placeholder="입력하세요"
        showCounter
        maxLength={100}
        disabled
      />
    </div>
  ),
};

export const IntentTest: Story = {
  name: "intent test",
  ...noControls,
  render: () => {
    const [value, setValue] = useState("");
    const intent =
      value.length > 200 ? "error" : value.length > 0 ? "complete" : "default";

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: 400,
        }}
      >
        <Textarea
          label="내용"
          placeholder="200자 이내로 입력하세요"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={200}
          resize="auto"
          showCounter
          intent={intent}
          helperText={
            value.length > 200
              ? "200자를 초과했습니다"
              : value.length > 0
              ? "입력이 완료되었습니다"
              : "글자 수 제한이 있는 입력 필드"
          }
        />
        <table
          style={{
            fontSize: 13,
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              {["조건", "intent", "helperText"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "6px 8px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["빈 값", "default", "글자 수 제한이 있는 입력 필드"],
              ["1자 이상", "complete", "입력이 완료되었습니다"],
              ["200자 초과", "error", "200자를 초과했습니다"],
            ].map(([condition, i, msg]) => (
              <tr
                key={condition}
                style={{
                  fontWeight: i === intent ? 700 : 400,
                  opacity: i === intent ? 1 : 0.4,
                }}
              >
                <td style={{ padding: "4px 8px" }}>{condition}</td>
                <td style={{ padding: "4px 8px" }}>{i}</td>
                <td style={{ padding: "4px 8px" }}>{msg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
};

const SAMPLE_TEXT =
  "이곳은 예시를 위한 더미 텍스트입니다. 특별한 의미 없이 문장의 길이와 흐름을 확인하기 위해 작성되었으며, 디자인이나 레이아웃 테스트에 활용할 수 있습니다.이곳은 예시를 위한 더미 텍스트입니다. 특별한 의미 없이 문장의 길이와 흐름을 확인하기 위해 작성되었으며, 디자인이나 레이아웃 테스트에 활용할 수 있습니다.이곳은 예시를 위한 더미 텍스트입니다.특별한 의미 없이 문장의 길이와 흐름을 확인하기 위해 작성되었으며, 디자인이나 레이아웃 테스트에 활용할 수 있습니다. 이곳은 예시를 위한 더미 텍스트입니다. 특별한 의미 없이 문장의 길이와 흐름을 확인하기 위해 작성되었으며, 디자인이나 레이아웃 테스트에 활용할 수 있습니다.이곳은 예시를 위한 더미 텍스트입니다.";

export const Height: Story = {
  name: "height",
  ...noControls,
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
        <p>
          ① Text area field의 min-height는 100px(4줄)로 고정하여 일관된 레이아웃
          유지
        </p>
        <p>
          ② Text area field의 max-height는 176px(8줄)로 고정하여 일관된 레이아웃
          유지
        </p>
        <p>③ 최대 길이를 초과할 경우 스크롤로 처리</p>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          width: 400,
        }}
      >
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
            min-height
          </p>
          <Textarea
            label="레이블"
            defaultValue={SAMPLE_TEXT.slice(0, 120)}
            showCounter
            maxLength={100}
            resize="auto"
          />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
            max-height
          </p>
          <Textarea
            label="레이블"
            defaultValue={SAMPLE_TEXT.slice(0, 300)}
            showCounter
            maxLength={100}
            resize="auto"
          />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
            max-height(scroll)
          </p>
          <Textarea
            label="레이블"
            defaultValue={SAMPLE_TEXT}
            showCounter
            maxLength={100}
            resize="auto"
          />
        </div>
      </div>
    </div>
  ),
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
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 280px)", gap: 16 }}>
              {states.map((state) => (
                <Textarea
                  key={state.label}
                  label={state.label}
                  intent={intent}
                  placeholder="텍스트를 입력하세요"
                  helperText={
                    intent === "error" ? "필수 입력 항목입니다" :
                    intent === "complete" ? "사용 가능합니다" :
                    "도움말 텍스트"
                  }
                  defaultValue={intent === "complete" ? "입력된 텍스트" : undefined}
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 280px)", gap: 16 }}>
            <Textarea label="Disabled (empty)" placeholder="텍스트를 입력하세요" disabled />
            <Textarea label="Disabled (with value)" defaultValue="입력된 텍스트" disabled />
          </div>
        </div>
      </div>
    );
  },
};
