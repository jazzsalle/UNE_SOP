import type { Meta, StoryObj } from "@storybook/react-vite";
import { NonModal } from ".";
import { Button } from "../buttons/Button";
import { useState } from "react";

const meta: Meta<typeof NonModal> = {
  title: "OVERLAY/NonModal(2차)",
  component: NonModal,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "백드롭 없이 페이지 위에 떠 있는 논모달 다이얼로그입니다. 뒤의 콘텐츠와 상호작용이 가능하며, 헤더를 드래그하여 위치를 이동할 수 있습니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof NonModal>;

export const Default: Story = {
  name: "기본 논모달",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>논모달 열기</Button>
        <p className="mt-[16rem] text-[14rem] text-[var(--grayscale-500)]">
          논모달이 열려도 이 텍스트를 클릭하거나 선택할 수 있습니다.
        </p>
        <NonModal
          open={open}
          onClose={() => setOpen(false)}
          title="논모달 제목"
          footer={
            <>
              <Button
                variant="outline"
                color="grayscale"
                size="2xs"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button size="2xs" onClick={() => setOpen(false)}>
                확인
              </Button>
            </>
          }
        >
          <p>헤더를 드래그하여 위치를 이동할 수 있습니다.</p>
          <p className="mt-[8rem]">뒤의 콘텐츠와 상호작용이 가능합니다.</p>
        </NonModal>
      </>
    );
  },
};

export const Sizes: Story = {
  name: "크기별 비교",
  render: () => {
    const [openSize, setOpenSize] = useState<string | null>(null);
    const sizes = ["sm", "md", "lg"] as const;

    return (
      <div className="flex gap-[8rem]">
        {sizes.map((size) => (
          <Button key={size} size="2xs" onClick={() => setOpenSize(size)}>
            {size.toUpperCase()}
          </Button>
        ))}
        {sizes.map((size) => (
          <NonModal
            key={size}
            open={openSize === size}
            onClose={() => setOpenSize(null)}
            title={`${size.toUpperCase()} 논모달`}
            size={size}
            footer={
              <Button size="2xs" onClick={() => setOpenSize(null)}>
                닫기
              </Button>
            }
          >
            <p>size=&quot;{size}&quot; 논모달입니다.</p>
          </NonModal>
        ))}
      </div>
    );
  },
};

export const NoDrag: Story = {
  name: "드래그 비활성화",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>드래그 불가</Button>
        <NonModal
          open={open}
          onClose={() => setOpen(false)}
          title="고정 위치"
          draggable={false}
          footer={
            <Button size="2xs" onClick={() => setOpen(false)}>
              닫기
            </Button>
          }
        >
          <p>드래그가 비활성화된 논모달입니다.</p>
        </NonModal>
      </>
    );
  },
};
