import { createContext } from "react";

import { Theme } from "@/utils/enums";

export type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  theme: Theme.System,
  setTheme: () => null,
});
