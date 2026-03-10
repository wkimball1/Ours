"use client";

import { useTheme } from "./theme-provider";

const accentColors: Record<string, string> = {
  stone: "#57534e",
  rose: "#e11d48",
  lavender: "#7c3aed",
  ocean: "#0369a1",
  sunset: "#c2410c",
  forest: "#15803d",
  berry: "#c026d3",
  midnight: "#2563eb",
};

export function AccentButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  const { theme } = useTheme();
  const bg = accentColors[theme] || accentColors.stone;

  return (
    <button
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 ${className}`}
      style={{ backgroundColor: bg }}
      {...props}
    >
      {children}
    </button>
  );
}
