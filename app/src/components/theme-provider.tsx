"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const themes = [
  { id: "stone", name: "Classic", preview: ["#1c1917", "#78716c", "#d6d3d1"] },
  { id: "rose", name: "Rose", preview: ["#be123c", "#f43f5e", "#fecdd3"] },
  { id: "lavender", name: "Lavender", preview: ["#7c3aed", "#a78bfa", "#ede9fe"] },
  { id: "ocean", name: "Ocean", preview: ["#0369a1", "#38bdf8", "#bae6fd"] },
  { id: "sunset", name: "Sunset", preview: ["#c2410c", "#f97316", "#fed7aa"] },
  { id: "forest", name: "Forest", preview: ["#15803d", "#4ade80", "#bbf7d0"] },
  { id: "berry", name: "Berry", preview: ["#a21caf", "#e879f9", "#f5d0fe"] },
  { id: "midnight", name: "Midnight", preview: ["#1e3a5f", "#60a5fa", "#dbeafe"] },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

const ThemeContext = createContext<{
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}>({ theme: "stone", setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("stone");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ours-theme") as ThemeId | null;
    if (saved && themes.some((t) => t.id === saved)) {
      setThemeState(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("ours-theme", theme);
  }, [theme, mounted]);

  function setTheme(t: ThemeId) {
    setThemeState(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
