import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  title: "FOUNDATIONS/typography✅",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "타이포그래피는 정보를 효과적으로 전달하고 일관된 사용자 경험을 제공하는 데 필수적인 요소입니다. `typo-{category}-{size}` 유틸리티 클래스와 Tailwind의 `font-normal/font-medium/font-bold`를 조합하여 사용합니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const weights = [
  { label: "Regular", className: "font-normal" },
  { label: "Medium", className: "font-medium" },
  { label: "Bold", className: "font-bold" },
] as const;

const titleStyles = [
  {
    name: "Title/Large (32)",
    className: "typo-title-lg",
    spec: "Font size 32px | Line height: 150% | Letter spacing: -3%",
  },
  {
    name: "Title/Medium (24)",
    className: "typo-title-md",
    spec: "Font size 24px | Line height: 150% | Letter spacing: -3%",
  },
  {
    name: "Title/Small (20)",
    className: "typo-title-sm",
    spec: "Font size 20px | Line height: 160% | Letter spacing: -3%",
  },
];

const textStyles = [
  {
    name: "Text/Large (16)",
    className: "typo-text-lg",
    spec: "Font size 16px | Line height: 150% | Letter spacing: -3%",
  },
  {
    name: "Text/Medium (14)",
    className: "typo-text-md",
    spec: "Font size 14px | Line height: 140% | Letter spacing: -3%",
  },
  {
    name: "Text/Small (12)",
    className: "typo-text-sm",
    spec: "Font size 12px | Line height: 150% | Letter spacing: -3%",
  },
];

const usageTable = [
  { style: "Title/Large", usage: "Heading" },
  { style: "Title/Medium", usage: "Heading / List Item Title / Sub Title" },
  { style: "Title/Small", usage: "Heading / List Item Title / Sub Title" },
  { style: "Text/Large", usage: "Body / Label / Sub Title / Sub Text Caption" },
  { style: "Text/Medium", usage: "Body / Label / Sub Text Caption / Badge" },
  { style: "Text/Small", usage: "Body / Label / Sub Text Caption / Badge" },
];

const TypoRow = ({
  name,
  className,
  spec,
}: {
  name: string;
  className: string;
  spec: string;
}) => (
  <div className="flex flex-col gap-[12rem]">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-[8rem]">
        <span className="text-[13rem] font-bold text-[var(--light-blue-500)]">
          {name}
        </span>
        <code className="text-[12rem] px-[6rem] py-[2rem] rounded-[4rem] bg-[var(--grayscale-25)] text-[var(--grayscale-600)] dark:bg-[var(--grayscale-800)] dark:text-[var(--grayscale-300)]">
          {className}
        </code>
      </div>
      <span className="text-[11rem] text-[var(--grayscale-400)]">{spec}</span>
    </div>
    <div className="grid grid-cols-3 gap-[16rem] py-[12rem] border-t border-[var(--grayscale-50)]">
      {weights.map(({ label, className: weightClass }) => (
        <div key={label} className="flex flex-col gap-[4rem]">
          <span
            className={`${className} ${weightClass} text-[var(--grayscale-900)] dark:text-white`}
          >
            {name.split(" ")[0].replace("/", "/")} ({name.match(/\d+/)?.[0]})
          </span>
          <span className="text-[12rem] text-[var(--grayscale-400)]">
            {label}
          </span>
          <code className="text-[11rem] px-[6rem] py-[2rem] rounded-[4rem] bg-[var(--grayscale-25)] text-[var(--grayscale-600)] dark:bg-[var(--grayscale-800)] dark:text-[var(--grayscale-300)]">
            {weightClass}
          </code>
        </div>
      ))}
    </div>
  </div>
);

const UsageTable = ({ rows }: { rows: { style: string; usage: string }[] }) => (
  <table className="w-full text-[13rem] border-collapse">
    <thead>
      <tr className="border-b border-[var(--grayscale-100)]">
        <th className="text-left py-[8rem] pr-[16rem] font-semibold text-[var(--grayscale-700)] dark:text-[var(--grayscale-200)]">
          Style
        </th>
        <th className="text-left py-[8rem] font-semibold text-[var(--grayscale-700)] dark:text-[var(--grayscale-200)]">
          Usage
        </th>
      </tr>
    </thead>
    <tbody>
      {rows.map(({ style, usage }) => (
        <tr key={style} className="border-b border-[var(--grayscale-50)]">
          <td className="py-[8rem] pr-[16rem] text-[var(--grayscale-600)] dark:text-[var(--grayscale-300)]">
            {style}
          </td>
          <td className="py-[8rem] text-[var(--grayscale-500)]">{usage}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const AllTypography: Story = {
  name: "all typography",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-[48rem] p-[24rem] max-w-[800rem]">
      <div>
        <h1 className="text-[24rem] font-bold text-[var(--grayscale-900)] dark:text-white mb-[4rem]">
          Typography (타이포그래피)
        </h1>
        <p className="text-[13rem] text-[var(--grayscale-500)] mb-[8rem]">
          타이포그래피는 정보를 효과적으로 전달하고 일관된 사용자 경험을
          제공하는 데 필수적인 요소입니다.
        </p>
        <p className="text-[13rem] text-[var(--grayscale-500)]">
          글꼴, 크기, 두께, 간격, 계층 구조를 정의하여 가독성을 높이고, 내용을
          중요도에 따라 시각적으로 표현한다.
        </p>
      </div>

      <div className="flex items-baseline gap-[40rem]">
        <h2 className="text-[24rem] font-normal text-[var(--grayscale-900)] dark:text-white">
          Spoqa Han Sans Neo
        </h2>
        <div className="flex gap-[24rem] text-[14rem] text-[var(--grayscale-500)]">
          <span className="font-normal">Regular</span>
          <span className="font-medium">Medium</span>
          <span className="font-bold">Bold</span>
        </div>
      </div>

      <div>
        <h2 className="text-[20rem] font-bold text-[var(--grayscale-900)] dark:text-white mb-[24rem]">
          Title
        </h2>
        <div className="flex flex-col gap-[32rem]">
          {titleStyles.map((style) => (
            <TypoRow key={style.name} {...style} />
          ))}
        </div>
        <div className="mt-[24rem]">
          <UsageTable rows={usageTable.slice(0, 3)} />
        </div>
      </div>

      <div>
        <h2 className="text-[20rem] font-bold text-[var(--grayscale-900)] dark:text-white mb-[24rem]">
          Text
        </h2>
        <div className="flex flex-col gap-[32rem]">
          {textStyles.map((style) => (
            <TypoRow key={style.name} {...style} />
          ))}
        </div>
        <div className="mt-[24rem]">
          <UsageTable rows={usageTable.slice(3)} />
        </div>
      </div>
    </div>
  ),
};

export const Title: Story = {
  name: "title",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-[32rem] p-[24rem] max-w-[800rem]">
      <div>
        <h2 className="text-[20rem] font-bold text-[var(--grayscale-900)] dark:text-white mb-[4rem]">
          Title
        </h2>
        <p className="text-[13rem] text-[var(--grayscale-400)] mb-[24rem]">
          Heading 영역에 사용되는 타이포그래피입니다.
        </p>
      </div>
      {titleStyles.map((style) => (
        <TypoRow key={style.name} {...style} />
      ))}
      <UsageTable rows={usageTable.slice(0, 3)} />
    </div>
  ),
};

export const Text: Story = {
  name: "text",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-[32rem] p-[24rem] max-w-[800rem]">
      <div>
        <h2 className="text-[20rem] font-bold text-[var(--grayscale-900)] dark:text-white mb-[4rem]">
          Text
        </h2>
        <p className="text-[13rem] text-[var(--grayscale-400)] mb-[24rem]">
          Body, Label, Caption, Badge 영역에 사용되는 타이포그래피입니다.
        </p>
      </div>
      {textStyles.map((style) => (
        <TypoRow key={style.name} {...style} />
      ))}
      <UsageTable rows={usageTable.slice(3)} />
    </div>
  ),
};
