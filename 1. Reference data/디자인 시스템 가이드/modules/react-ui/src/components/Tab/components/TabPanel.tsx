import { useTabs } from "../useTabs";

interface TabPanelProps {
  /** 이 패널이 표시될 탭 값 */
  value: string;
  /** 패널 내용 */
  children: React.ReactNode;
}

/** 탭 패널. 현재 선택된 탭의 value와 일치할 때만 렌더링됩니다. */
export const TabPanel = ({ value: panelValue, children }: TabPanelProps) => {
  const { value } = useTabs();

  if (value !== panelValue) return null;

  return <div className="p-4 text-[16rem]">{children}</div>;
};
