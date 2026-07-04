import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { Pagination } from ".";

const meta: Meta<typeof Pagination> = {
  title: "NAVIGATION/Pagination✅",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "많은 양의 콘텐츠를 탐색하기 쉽도록 여러 화면에 나누고, 분할된 화면을 탐색하는 데 사용합니다.",
      },
    },
  },
  argTypes: {
    totalPages: {
      control: { type: "number", min: 1 },
      description: "전체 페이지 수",
    },
    value: {
      control: { type: "number", min: 1 },
      description: "현재 페이지",
    },
    setValue: {
      table: { disable: true },
    },
    jumpSize: {
      control: { type: "number", min: 1 },
      description: "말줄임(...) 클릭 시 이동할 페이지 수",
      table: { defaultValue: { summary: "5" } },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Pagination>;

export const PropsTest: Story = {
  name: "props test",
  render: () => {
    const [{ value, totalPages, jumpSize }, updateArgs] = useArgs();

    return (
      <Pagination
        totalPages={totalPages as number}
        value={value as number}
        setValue={(page: number) => updateArgs({ value: page })}
        jumpSize={jumpSize as number}
      />
    );
  },
  args: {
    value: 1,
    totalPages: 50,
    jumpSize: 5,
  },
};

export const States: Story = {
  name: "states",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        [data-force-state="page-states"] nav > div:nth-child(2) > button:nth-child(2) {
          background-color: var(--grayscale-25) !important;
          color: var(--grayscale-900) !important;
        }
        [data-force-state="page-states"] nav > div:nth-child(2) > button:nth-child(4) {
          background-color: var(--grayscale-50) !important;
          color: var(--grayscale-900) !important;
        }
        .dark [data-force-state="page-states"] nav > div:nth-child(2) > button:nth-child(2) {
          background-color: var(--grayscale-800) !important;
          color: var(--grayscale-25) !important;
        }
        .dark [data-force-state="page-states"] nav > div:nth-child(2) > button:nth-child(4) {
          background-color: var(--grayscale-700) !important;
          color: white !important;
        }
      `}</style>

      <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#aaa", justifyContent: "center" }}>
        <span>각 페이지 버튼: 1=Default, 2=Hover, 3=Selected, 4=Active</span>
      </div>

      <div className="pointer-events-none" data-force-state="page-states">
        <Pagination totalPages={5} value={3} setValue={() => {}} />
      </div>
    </div>
  ),
};
