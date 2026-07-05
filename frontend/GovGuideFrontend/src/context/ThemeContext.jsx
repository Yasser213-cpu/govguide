import { createContext, useEffect, useMemo, useState } from "react";

const THEME_STORAGE_KEY = "govguide-theme";
const FONT_SCALE_STORAGE_KEY = "govguide-font-scale";

const FONT_SCALE_OPTIONS = {
  small: 0.9,
  medium: 1,
  large: 1.1,
  xlarge: 1.2,
};

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const getInitialFontScale = () => {
  if (typeof window === "undefined") {
    return "medium";
  }

  const saved = window.localStorage.getItem(FONT_SCALE_STORAGE_KEY);
  return saved && FONT_SCALE_OPTIONS[saved] ? saved : "medium";
};

export const ThemeContext = createContext({
  theme: "light",
  setTheme: () => { },
  toggleTheme: () => { },
  fontScale: "medium",
  setFontScale: () => { },
  fontScaleOptions: [],
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [fontScale, setFontScale] = useState(getInitialFontScale);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const scaleValue = FONT_SCALE_OPTIONS[fontScale] ?? FONT_SCALE_OPTIONS.medium;
    root.style.setProperty("--font-scale", scaleValue.toString());
    window.localStorage.setItem(FONT_SCALE_STORAGE_KEY, fontScale);
  }, [fontScale]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
      fontScale,
      setFontScale,
      fontScaleOptions: [
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
        { value: "xlarge", label: "Extra Large" },
      ],
    }),
    [theme, fontScale],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
