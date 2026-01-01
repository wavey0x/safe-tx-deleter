import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "safe-deleter:theme";

type ThemeMode = "system" | "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedTheme: "light" | "dark";
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return stored ?? "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    mode === "system" ? getSystemTheme() : mode
  );

  useEffect(() => {
    if (mode === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const update = () => setResolvedTheme(getSystemTheme());
      update();
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    setResolvedTheme(mode);
    return undefined;
  }, [mode]);

  useEffect(() => {
    const theme = mode === "system" ? resolvedTheme : mode;
    document.documentElement.dataset.theme = theme;
    if (mode === "system") {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, mode);
    }
  }, [mode, resolvedTheme]);

  const toggleTheme = () => {
    setMode((prev) => {
      const nextTheme =
        prev === "system"
          ? resolvedTheme === "dark"
            ? "light"
            : "dark"
          : prev === "dark"
            ? "light"
            : "dark";
      return nextTheme;
    });
  };

  const value = useMemo(
    () => ({ mode, resolvedTheme, toggleTheme }),
    [mode, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
