import { type SetStateAction } from "react";
import { TabsContext, type TabSize } from "../context";

/** Tabs 루트 컴포넌트 Props */
interface TabsProps {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: React.Dispatch<SetStateAction<any>>;
  size?: TabSize;
}

/**
 * 탭 네비게이션 루트 컴포넌트
 *
 * Context를 통해 하위 컴포넌트(TabList, TabButton, TabPanel)에
 * 현재 값과 size를 전달합니다.
 *
 * @example
 * <Tabs value={tab} setValue={setTab} size="lg">
 *   <TabList>
 *     <TabButton value="home" label="홈" />
 *   </TabList>
 *   <TabPanel value="home">홈 컨텐츠</TabPanel>
 * </Tabs>
 */
export const Tabs = ({
  children,
  value,
  setValue,
  size = "lg",
}: TabsProps) => {
  return (
    <TabsContext.Provider value={{ value, setValue, size }}>
      {children}
    </TabsContext.Provider>
  );
};
