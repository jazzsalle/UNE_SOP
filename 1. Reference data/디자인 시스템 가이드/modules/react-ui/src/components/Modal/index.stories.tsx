import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { Modal } from ".";
import { Button } from "../buttons/Button";

const meta: Meta<typeof Modal> = {
  title: "OVERLAY/Modal(2차)",
  component: Modal,
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: { type: "boolean" },
      description: "모달 열림 여부",
    },
    title: {
      control: { type: "text" },
      description: "모달 제목",
    },
    intent: {
      control: { type: "radio" },
      options: ["none", "info", "success", "warning", "delete"],
      description: "의도 아이콘 표시",
    },
    closeOnBackdrop: {
      control: { type: "boolean" },
      description: "백드롭 클릭으로 닫기 허용",
    },
    closeOnEsc: {
      control: { type: "boolean" },
      description: "ESC 키로 닫기 허용",
    },
    children: {
      control: { type: "text" },
      description: "모달 본문 내용",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "백드롭 위에 중앙 정렬되는 모달 대화 상자입니다. ESC 닫기, 백드롭 클릭 닫기, 포커스 트랩을 지원합니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  name: "props test",
  render: () => {
    const [args, updateArgs] = useArgs();
    const close = () => updateArgs({ open: false });

    return (
      <>
        <Button onClick={() => updateArgs({ open: true })}>모달 열기</Button>
        <Modal
          {...args}
          open={args.open as boolean}
          onClose={close}
          footer={
            <>
              <Button size="md" color="grayscale" onClick={close}>
                취소
              </Button>
              <Button size="md" onClick={close}>
                확인
              </Button>
            </>
          }
        >
          <p>{args.children as string}</p>
        </Modal>
      </>
    );
  },
  args: {
    open: false,
    title: "모달 제목",
    intent: "none",
    // size: "md",
    closeOnBackdrop: true,
    closeOnEsc: true,
    children: "모달 본문 영역입니다. 여기에 원하는 콘텐츠를 넣을 수 있습니다.",
  },
};
