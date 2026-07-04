import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  title: "FOUNDATIONS/elevations✅",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Elevation(고도)은 UI 요소의 깊이감과 계층 구조를 표현하는 box-shadow 디자인 토큰입니다. `shadow-[var(--elevation-XX)]` 형태로 사용합니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const elevations = [
  { token: "--elevation-01", desc: "미세한 구분선 대체" },
  { token: "--elevation-02", desc: "카드, 입력 필드" },
  { token: "--elevation-03", desc: "호버 상태 카드" },
  { token: "--elevation-04", desc: "드롭다운, 팝오버" },
  { token: "--elevation-05", desc: "플로팅 버튼" },
  { token: "--elevation-06", desc: "토스트, 스낵바" },
  { token: "--elevation-07", desc: "바텀시트, 드로어" },
  { token: "--elevation-08", desc: "모달, 다이얼로그" },
];

export const AllElevations: Story = {
  name: "all elevations",
  render: () => (
    <div className="flex flex-wrap gap-[24rem] px-[50rem]">
      {elevations.map(({ token, desc }) => (
        <div
          key={token}
          className="flex flex-col items-center gap-[12rem] w-[120rem]"
        >
          <div
            className="w-[120rem] h-[120rem] rounded-[12rem] bg-white dark:bg-[var(--grayscale-900)]"
            style={{ boxShadow: `var(${token})` }}
          />
          <div className="text-center">
            <p className="text-[12rem] font-medium text-[var(--grayscale-900)] dark:text-white">
              {token.replace("--", "")}
            </p>
            <p className="text-[10rem] text-[var(--grayscale-400)]">{desc}</p>
            <code className="text-[11rem] text-[var(--grayscale-500)] mt-[4rem] block">
              {`shadow-[var(${token})]`}
            </code>
          </div>
        </div>
      ))}
    </div>
  ),
};
