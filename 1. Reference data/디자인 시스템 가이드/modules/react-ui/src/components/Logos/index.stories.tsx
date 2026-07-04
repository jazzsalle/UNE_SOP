import type { Meta, StoryObj } from "@storybook/react-vite";
import * as Logos from ".";
import type { LogoProps, LogoSize } from "./types";
import { cn } from "@/utils/cn";

const meta: Meta = {
  title: "FOUNDATIONS/logos✅",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "서비스 및 파일 형식 로고 컴포넌트입니다. size prop으로 크기를 변경할 수 있습니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const logoEntries: [string, string, React.FC<LogoProps>][] = [
  ["LogoProtecto", "로고_메인", Logos.LogoProtecto],
  ["LogoManagement", "로고_관리", Logos.LogoManagement],
  ["LogoMonitoring", "로고_관제", Logos.LogoMonitoring],
  ["LogoBuilder", "로고_빌더", Logos.LogoBuilder],
  ["LogoSop", "로고_sop", Logos.LogoSop],
  ["LogoXlsx", "파일포맷_xlsx", Logos.LogoXlsx],
  ["LogoPptx", "파일포맷_pptx", Logos.LogoPptx],
  ["LogoDocx", "파일포맷_docx", Logos.LogoDocx],
  ["LogoHwpx", "파일포맷_hwpx", Logos.LogoHwpx],
  ["LogoPdf", "파일포맷_pdf", Logos.LogoPdf],
  ["LogoPng", "파일포맷_png", Logos.LogoPng],
  ["LogoJpeg", "파일포맷_jqeg", Logos.LogoJpeg],
];

export const AllLogos: Story = {
  name: "all logos",
  args: {
    size: 24,
  },
  argTypes: {
    size: {
      control: { type: "inline-radio" },
      options: [12, 16, 20, 24, 28, 32, 36, 40],
      description: "로고 크기 (px = rem)",
    },
  },
  render: (args: { size?: LogoSize }) => (
    <div className="flex flex-wrap gap-[16rem]">
      {logoEntries.map(([name, figmaName, LogoComponent]) => (
        <div
          key={name}
          className="flex flex-col items-center gap-[6rem] w-[80rem]"
        >
          <div
            className={cn(
              "flex items-center justify-center w-[40rem] h-[40rem] rounded-[8rem]",
              "bg-[var(--grayscale-25)] dark:bg-[var(--grayscale-800)]",
            )}
          >
            <LogoComponent size={args.size} />
          </div>
          <p className="text-[10rem] text-[var(--grayscale-500)] text-center leading-tight break-all">
            {name.replace("Logo", "")}
          </p>
          <p className="text-[10rem] text-[var(--grayscale-400)] text-center leading-tight break-all">
            {figmaName}
          </p>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex items-end gap-[16rem]">
      {([12, 16, 20, 24, 28, 32, 36, 40] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-[8rem]">
          <Logos.LogoProtecto size={size} />
          <span className="text-[11rem] text-[var(--grayscale-500)]">
            {size}px
          </span>
        </div>
      ))}
    </div>
  ),
};
