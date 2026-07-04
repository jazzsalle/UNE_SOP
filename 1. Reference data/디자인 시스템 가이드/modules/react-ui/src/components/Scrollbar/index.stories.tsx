import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  title: "FOUNDATIONS/scrollbar✅",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "글로벌 커스텀 스크롤바 스타일입니다. 별도 클래스 없이 overflow 속성만 지정하면 자동 적용됩니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const dummyItems = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`);

export const Vertical: Story = {
  name: "vertical",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 14, color: "var(--grayscale-500)" }}>
        overflow-y: auto — 세로 스크롤바 (width: 4rem)
      </p>
      <div
        style={{
          width: 300,
          height: 200,
          overflowY: "auto",
          border: "1px solid var(--grayscale-100)",
          borderRadius: 8,
          padding: 16,
        }}
      >
        {dummyItems.map((item) => (
          <div
            key={item}
            style={{
              padding: "8px 0",
              borderBottom: "1px solid var(--grayscale-75)",
              fontSize: 14,
              color: "var(--grayscale-700)",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Horizontal: Story = {
  name: "horizontal",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 14, color: "var(--grayscale-500)" }}>
        overflow-x: auto — 가로 스크롤바 (height: 4rem)
      </p>
      <div
        style={{
          width: 300,
          overflowX: "auto",
          border: "1px solid var(--grayscale-100)",
          borderRadius: 8,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", gap: 12, width: 800 }}>
          {dummyItems.slice(0, 15).map((item) => (
            <div
              key={item}
              style={{
                flexShrink: 0,
                width: 80,
                height: 80,
                borderRadius: 8,
                background: "var(--grayscale-50)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "var(--grayscale-700)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const States: Story = {
  name: "states",
  render: () => {
    const lightStates = [
      { label: "Default", color: "var(--grayscale-100)" },
      { label: "Hover", color: "var(--grayscale-150)" },
      { label: "Active", color: "var(--grayscale-200)" },
      { label: "Track", color: "transparent" },
    ];

    const darkStates = [
      { label: "Default", color: "var(--grayscale-800)" },
      { label: "Hover", color: "var(--grayscale-700)" },
      { label: "Active", color: "var(--grayscale-600)" },
      { label: "Track", color: "transparent" },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Light */}
        <div>
          <strong
            style={{
              fontSize: 13,
              color: "#888",
              marginBottom: 12,
              display: "block",
            }}
          >
            light
          </strong>
          <div style={{ display: "flex", gap: 24 }}>
            {lightStates.map((state) => (
              <div
                key={state.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 11, color: "#aaa" }}>
                  {state.label}
                </span>
                <div
                  style={{
                    width: 4,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: state.color,
                    border:
                      state.color === "transparent"
                        ? "1px dashed var(--grayscale-200)"
                        : undefined,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dark */}
        <div>
          <strong
            style={{
              fontSize: 13,
              color: "#888",
              marginBottom: 12,
              display: "block",
            }}
          >
            dark
          </strong>
          <div
            style={{
              display: "flex",
              gap: 24,
              backgroundColor: "var(--grayscale-900)",
              padding: 16,
              borderRadius: 8,
            }}
          >
            {darkStates.map((state) => (
              <div
                key={state.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 11, color: "#888" }}>
                  {state.label}
                </span>
                <div
                  style={{
                    width: 4,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: state.color,
                    border:
                      state.color === "transparent"
                        ? "1px dashed var(--grayscale-600)"
                        : undefined,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 실제 스크롤바 미리보기 */}
        <div>
          <strong
            style={{
              fontSize: 13,
              color: "#888",
              marginBottom: 12,
              display: "block",
            }}
          >
            실제 스크롤바 (hover / drag 해보세요)
          </strong>
          <div
            style={{
              width: 200,
              height: 120,
              overflowY: "auto",
              border: "1px solid var(--grayscale-100)",
              borderRadius: 8,
              padding: 12,
            }}
          >
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                style={{
                  padding: "6px 0",
                  fontSize: 13,
                  color: "var(--grayscale-500)",
                }}
              >
                Item {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

export const Both: Story = {
  name: "both",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 14, color: "var(--grayscale-500)" }}>
        overflow: auto — 세로 + 가로 스크롤바 동시 표시
      </p>
      <div
        style={{
          width: 300,
          height: 200,
          overflow: "auto",
          border: "1px solid var(--grayscale-100)",
          borderRadius: 8,
          padding: 16,
        }}
      >
        <div style={{ width: 600 }}>
          {dummyItems.map((item) => (
            <div
              key={item}
              style={{
                padding: "8px 0",
                borderBottom: "1px solid var(--grayscale-75)",
                fontSize: 14,
                color: "var(--grayscale-700)",
                whiteSpace: "nowrap",
              }}
            >
              {item} — 가로로 긴 콘텐츠가 포함된 항목입니다. 스크롤하여
              확인하세요.
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};
