import { createContext, useContext, useEffect, useState } from "react";

export type ThemeName = "dark" | "snow-white" | "pastel-dream" | "morning-sky";

export interface ThemeTokens {
  bg: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  headerBg: string;
  isDark: boolean;
}

export const THEMES: Record<
  ThemeName,
  ThemeTokens & { label: string; circle: string }
> = {
  dark: {
    label: "Dark",
    circle: "#1a1040",
    bg: "oklch(0.08 0.025 260)",
    surface: "oklch(0.12 0.035 275)",
    border: "oklch(0.22 0.06 280 / 0.5)",
    text: "oklch(0.92 0.04 280)",
    textMuted: "oklch(0.6 0.06 280)",
    accent: "oklch(0.65 0.28 305)",
    headerBg: "oklch(0.1 0.03 275 / 0.95)",
    isDark: true,
  },
  "snow-white": {
    label: "Snow White",
    circle: "#f0f4ff",
    bg: "#f8f9fc",
    surface: "#ffffff",
    border: "#e2e8f0",
    text: "#1a1a2e",
    textMuted: "#64748b",
    accent: "oklch(0.65 0.28 305)",
    headerBg: "rgba(255,255,255,0.97)",
    isDark: false,
  },
  "pastel-dream": {
    label: "Pastel Dream",
    circle: "#fde8ff",
    bg: "#fdf4ff",
    surface: "#fff0fb",
    border: "#e8c8f0",
    text: "#3b1f5e",
    textMuted: "#8b5fa0",
    accent: "oklch(0.72 0.22 320)",
    headerBg: "rgba(253,244,255,0.97)",
    isDark: false,
  },
  "morning-sky": {
    label: "Morning Sky",
    circle: "#deeeff",
    bg: "#f0f8ff",
    surface: "#e8f4fd",
    border: "#b3d4ed",
    text: "#0d2b45",
    textMuted: "#4a7fa0",
    accent: "oklch(0.65 0.25 220)",
    headerBg: "rgba(240,248,255,0.97)",
    isDark: false,
  },
};

const STORAGE_KEY = "fl_theme";

interface ThemeContextValue {
  theme: ThemeName;
  tokens: ThemeTokens;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  tokens: THEMES.dark,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    return stored && THEMES[stored] ? stored : "dark";
  });

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  };

  useEffect(() => {
    const t = THEMES[theme];
    const root = document.documentElement;
    root.style.setProperty("--fl-bg", t.bg);
    root.style.setProperty("--fl-surface", t.surface);
    root.style.setProperty("--fl-border", t.border);
    root.style.setProperty("--fl-text", t.text);
    root.style.setProperty("--fl-text-muted", t.textMuted);
    root.style.setProperty("--fl-accent", t.accent);
    root.style.setProperty("--fl-header-bg", t.headerBg);
    root.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, tokens: THEMES[theme], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
