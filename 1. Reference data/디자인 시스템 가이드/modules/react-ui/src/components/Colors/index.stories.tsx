import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  title: "FOUNDATIONS/colors✅",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "디자인 시스템에서 사용하는 컬러 팔레트입니다. `var(--color-name)` 형태로 사용합니다.",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const colorGroups = [
  {
    name: "Grayscale",
    colors: [
      { token: "--grayscale-20", hex: "#f9f9fb" },
      { token: "--grayscale-25", hex: "#f4f5f7" },
      { token: "--grayscale-50", hex: "#ebecf0" },
      { token: "--grayscale-75", hex: "#dadbdd" },
      { token: "--grayscale-100", hex: "#cecfd2" },
      { token: "--grayscale-150", hex: "#bbbcc0" },
      { token: "--grayscale-200", hex: "#a6a9af" },
      { token: "--grayscale-300", hex: "#888c94" },
      { token: "--grayscale-400", hex: "#787c87" },
      { token: "--grayscale-500", hex: "#686d78" },
      { token: "--grayscale-600", hex: "#565b69" },
      { token: "--grayscale-700", hex: "#444a57" },
      { token: "--grayscale-800", hex: "#313644" },
      { token: "--grayscale-850", hex: "#242935" },
      { token: "--grayscale-900", hex: "#1d1f2b" },
    ],
  },
  {
    name: "Light Blue",
    colors: [
      { token: "--light-blue-20", hex: "#f5f8ff" },
      { token: "--light-blue-25", hex: "#f0f4ff" },
      { token: "--light-blue-50", hex: "#e1e9ff" },
      { token: "--light-blue-75", hex: "#d2deff" },
      { token: "--light-blue-100", hex: "#c2d3ff" },
      { token: "--light-blue-150", hex: "#a3baff" },
      { token: "--light-blue-200", hex: "#84a8ff" },
      { token: "--light-blue-300", hex: "#6693ff" },
      { token: "--light-blue-400", hex: "#4d7cff" },
      { token: "--light-blue-500", hex: "#3c69fc" },
      { token: "--light-blue-600", hex: "#345ce0" },
      { token: "--light-blue-700", hex: "#2c4ec4" },
      { token: "--light-blue-800", hex: "#20398f" },
      { token: "--light-blue-900", hex: "#15255c" },
    ],
  },
  {
    name: "Dark Blue",
    colors: [
      { token: "--dark-blue-20", hex: "#0a1128" },
      { token: "--dark-blue-25", hex: "#0e1733" },
      { token: "--dark-blue-50", hex: "#111c3d" },
      { token: "--dark-blue-75", hex: "#15244d" },
      { token: "--dark-blue-100", hex: "#1a2b5c" },
      { token: "--dark-blue-150", hex: "#203470" },
      { token: "--dark-blue-200", hex: "#253d82" },
      { token: "--dark-blue-300", hex: "#477dff" },
      { token: "--dark-blue-400", hex: "#6693ff" },
      { token: "--dark-blue-500", hex: "#84a8ff" },
      { token: "--dark-blue-600", hex: "#a3beff" },
      { token: "--dark-blue-700", hex: "#c2d3ff" },
      { token: "--dark-blue-800", hex: "#e1e9ff" },
      { token: "--dark-blue-900", hex: "#f5f8ff" },
    ],
  },
  {
    name: "Orange",
    colors: [
      { token: "--orange-20", hex: "#fff9f5" },
      { token: "--orange-25", hex: "#fff4ed" },
      { token: "--orange-50", hex: "#ffe8d9" },
      { token: "--orange-75", hex: "#ffdbc2" },
      { token: "--orange-100", hex: "#ffc9a3" },
      { token: "--orange-150", hex: "#ffb07a" },
      { token: "--orange-200", hex: "#ff9a57" },
      { token: "--orange-300", hex: "#ff8433" },
      { token: "--orange-400", hex: "#ff7726" },
      { token: "--orange-500", hex: "#fc6b19" },
      { token: "--orange-600", hex: "#e05a12" },
      { token: "--orange-700", hex: "#b84a0f" },
      { token: "--orange-800", hex: "#8f390c" },
      { token: "--orange-900", hex: "#5c2508" },
    ],
  },
  {
    name: "Red",
    colors: [
      { token: "--red-20", hex: "#fff5f4" },
      { token: "--red-25", hex: "#fef3f2" },
      { token: "--red-50", hex: "#fee4e2" },
      { token: "--red-75", hex: "#fecdca" },
      { token: "--red-100", hex: "#fda29b" },
      { token: "--red-150", hex: "#fb8a81" },
      { token: "--red-200", hex: "#f97066" },
      { token: "--red-300", hex: "#f04438" },
      { token: "--red-400", hex: "#e5352e" },
      { token: "--red-500", hex: "#d92d20" },
      { token: "--red-600", hex: "#c4251b" },
      { token: "--red-700", hex: "#b42318" },
      { token: "--red-800", hex: "#912018" },
      { token: "--red-900", hex: "#55100b" },
    ],
  },
  {
    name: "Yellow",
    colors: [
      { token: "--yellow-20", hex: "#fffaeb" },
      { token: "--yellow-25", hex: "#fff7e0" },
      { token: "--yellow-50", hex: "#ffe6a8" },
      { token: "--yellow-75", hex: "#ffd46b" },
      { token: "--yellow-100", hex: "#ffcc5c" },
      { token: "--yellow-150", hex: "#ffbf3a" },
      { token: "--yellow-200", hex: "#ffb92a" },
      { token: "--yellow-300", hex: "#ffb114" },
      { token: "--yellow-400", hex: "#e89a00" },
      { token: "--yellow-500", hex: "#cc8400" },
      { token: "--yellow-600", hex: "#a86900" },
      { token: "--yellow-700", hex: "#8a5600" },
      { token: "--yellow-800", hex: "#6e4500" },
      { token: "--yellow-900", hex: "#422a00" },
    ],
  },
  {
    name: "Green",
    colors: [
      { token: "--green-20", hex: "#f6fef9" },
      { token: "--green-25", hex: "#ecfdf3" },
      { token: "--green-50", hex: "#d1fadf" },
      { token: "--green-75", hex: "#a9efd0" },
      { token: "--green-100", hex: "#75e0a7" },
      { token: "--green-150", hex: "#32d583" },
      { token: "--green-200", hex: "#47cd82" },
      { token: "--green-300", hex: "#29a33b" },
      { token: "--green-400", hex: "#238e33" },
      { token: "--green-500", hex: "#1d792b" },
      { token: "--green-600", hex: "#186424" },
      { token: "--green-700", hex: "#134f1d" },
      { token: "--green-800", hex: "#0e3a15" },
      { token: "--green-900", hex: "#08210c" },
    ],
  },
  {
    name: "Purple",
    colors: [
      { token: "--purple-20", hex: "#f9f7ff" },
      { token: "--purple-25", hex: "#f5f2ff" },
      { token: "--purple-50", hex: "#ece6ff" },
      { token: "--purple-75", hex: "#ddd3ff" },
      { token: "--purple-100", hex: "#cebfff" },
      { token: "--purple-150", hex: "#bbaaff" },
      { token: "--purple-200", hex: "#ab94ff" },
      { token: "--purple-300", hex: "#9b7dff" },
      { token: "--purple-400", hex: "#8a6bff" },
      { token: "--purple-500", hex: "#985eff" },
      { token: "--purple-600", hex: "#7b47e6" },
      { token: "--purple-700", hex: "#6238b8" },
      { token: "--purple-800", hex: "#492a8a" },
      { token: "--purple-900", hex: "#2c1952" },
    ],
  },
  {
    name: "Teal",
    colors: [
      { token: "--teal-20", hex: "#f0fbfb" },
      { token: "--teal-25", hex: "#e6f7f6" },
      { token: "--teal-50", hex: "#cdf1ee" },
      { token: "--teal-75", hex: "#b4eae5" },
      { token: "--teal-100", hex: "#9ce3dc" },
      { token: "--teal-150", hex: "#83dcd3" },
      { token: "--teal-200", hex: "#69d5ca" },
      { token: "--teal-300", hex: "#4fcfc1" },
      { token: "--teal-400", hex: "#2bc5b7" },
      { token: "--teal-500", hex: "#08bbae" },
      { token: "--teal-600", hex: "#07a69b" },
      { token: "--teal-700", hex: "#068e84" },
      { token: "--teal-800", hex: "#046861" },
      { token: "--teal-900", hex: "#023d39" },
    ],
  },
];

const isLightColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150;
};

const ColorSwatch = ({ token, hex }: { token: string; hex: string }) => {
  const textColor = isLightColor(hex) ? "#1d1f2b" : "#ffffff";
  const label = token.replace(/^--.*-(\d+)$/, "$1");

  return (
    <div className="flex flex-col items-center flex-1 min-w-[60rem]">
      <div
        className="w-full h-[48rem] flex items-center justify-center"
        style={{ backgroundColor: `var(${token})` }}
      >
        <span className="text-[11rem] font-medium" style={{ color: textColor }}>
          {label}
        </span>
      </div>
      <span className="text-[10rem] text-[var(--grayscale-500)] mt-[4rem]">
        {hex.toUpperCase()}
      </span>
    </div>
  );
};

const ColorGroup = ({
  name,
  colors,
}: {
  name: string;
  colors: { token: string; hex: string }[];
}) => (
  <div className="flex flex-col gap-[8rem]">
    <h3 className="text-[14rem] font-semibold text-[var(--grayscale-900)] dark:text-white">
      {name}
    </h3>
    <div className="flex rounded-[8rem] overflow-hidden">
      {colors.map(({ token, hex }) => (
        <ColorSwatch key={token} token={token} hex={hex} />
      ))}
    </div>
  </div>
);

export const AllColors: Story = {
  name: "all colors",
  render: () => (
    <div className="flex flex-col gap-[30rem] p-[24rem]">
      {colorGroups.map(({ name, colors }) => (
        <ColorGroup key={name} name={name} colors={colors} />
      ))}
    </div>
  ),
};
