import { createContext } from "react";
import type { CardVariant } from "./types";

export const CardContext = createContext<{ variant: CardVariant }>({
  variant: "vertical",
});
