import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from ".";
import { useState } from "react";

const meta: Meta<typeof Alert> = {
  title: "FEEDBACK/Alert(2차)",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "페이지 내에 고정적으로 표시되는 인라인 알림입니다. Filled / Outlined / Light 스타일과 Info / Success / Warning / Error 4가지 타입을 지원합니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Alert>;

const types = ["info", "success", "warning", "error"] as const;

export const Light: Story = {
  name: "Light",
  render: () => (
    <div className="flex flex-col gap-[12rem]">
      {types.map((type) => (
        <Alert key={type} intent={type} variant="light" title={`${type} 알림`}>
          알림 내용이 표시되는 영역입니다.
        </Alert>
      ))}
    </div>
  ),
};

export const Filled: Story = {
  name: "Filled",
  render: () => (
    <div className="flex flex-col gap-[12rem]">
      {types.map((type) => (
        <Alert key={type} intent={type} variant="filled" title={`${type} 알림`}>
          알림 내용이 표시되는 영역입니다.
        </Alert>
      ))}
    </div>
  ),
};

export const Outlined: Story = {
  name: "Outlined",
  render: () => (
    <div className="flex flex-col gap-[12rem]">
      {types.map((type) => (
        <Alert
          key={type}
          intent={type}
          variant="outlined"
          title={`${type} 알림`}
        >
          알림 내용이 표시되는 영역입니다.
        </Alert>
      ))}
    </div>
  ),
};

export const TitleOnly: Story = {
  name: "제목만",
  render: () => (
    <div className="flex flex-col gap-[12rem]">
      {types.map((type) => (
        <Alert key={type} intent={type} title={`${type} 제목만 표시`} />
      ))}
    </div>
  ),
};

export const DescriptionOnly: Story = {
  name: "본문만",
  render: () => (
    <div className="flex flex-col gap-[12rem]">
      {types.map((type) => (
        <Alert key={type} intent={type}>
          제목 없이 본문 텍스트만 표시됩니다.
        </Alert>
      ))}
    </div>
  ),
};

export const Closable: Story = {
  name: "닫기 가능",
  render: () => {
    const [visible, setVisible] = useState(true);
    return visible ? (
      <Alert
        intent="info"
        title="닫을 수 있는 알림"
        onClose={() => setVisible(false)}
      >
        닫기 버튼을 클릭하면 사라집니다.
      </Alert>
    ) : (
      <button
        type="button"
        className="text-[14rem] text-[var(--light-blue-500)] underline"
        onClick={() => setVisible(true)}
      >
        다시 표시
      </button>
    );
  },
};

export const NoIcon: Story = {
  name: "아이콘 숨김",
  render: () => (
    <Alert intent="info" title="아이콘 없는 알림" hideIcon>
      hideIcon 속성으로 아이콘을 숨길 수 있습니다.
    </Alert>
  ),
};
