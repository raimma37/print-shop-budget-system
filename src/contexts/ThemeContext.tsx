"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ColorScheme = "light" | "dark" | "system";

interface ThemeContextValue {
  colorScheme: ColorScheme;
  isDark: boolean;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: "system",
  isDark: false,
  setColorScheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("system");
  const [isDark, setIsDark] = useState(false);

  // Resolve se deve aplicar o dark mode baseado na preferência
  const resolveIsDark = useCallback((scheme: ColorScheme): boolean => {
    if (scheme === "dark") return true;
    if (scheme === "light") return false;
    // "system": usa preferência do SO
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, []);

  const applyTheme = useCallback(
    (scheme: ColorScheme) => {
      const dark = resolveIsDark(scheme);
      setIsDark(dark);
      const html = document.documentElement;
      if (dark) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
    },
    [resolveIsDark]
  );

  // Inicialização: lê do localStorage sem flash
  useEffect(() => {
    const saved = (localStorage.getItem("colorScheme") as ColorScheme) || "system";
    setColorSchemeState(saved);
    applyTheme(saved);

    // Ouvir mudanças na preferência do SO quando em modo "system"
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const current = (localStorage.getItem("colorScheme") as ColorScheme) || "system";
      if (current === "system") applyTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [applyTheme]);

  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setColorSchemeState(scheme);
      localStorage.setItem("colorScheme", scheme);
      applyTheme(scheme);
    },
    [applyTheme]
  );

  return (
    <ThemeContext.Provider value={{ colorScheme, isDark, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
