import { useContext } from "react";
import { TabsContext } from "./context";

/** Tabs Context에서 현재 값, setter, size를 가져오는 훅. Tabs 내부에서만 사용 가능 */
export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs 내부에서만 사용해야 합니다.");
  }
  return context;
};
