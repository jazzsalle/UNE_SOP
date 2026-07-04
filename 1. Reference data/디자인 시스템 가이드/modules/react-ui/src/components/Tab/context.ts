import { createContext } from "react";

/** 탭 크기 */
export type TabSize = "lg" | "md" | "sm";

export interface TabsContextType {
  value: string;
  setValue: (value: string) => void;
  size: TabSize;
}

export const TabsContext = createContext<TabsContextType | null>(null);
