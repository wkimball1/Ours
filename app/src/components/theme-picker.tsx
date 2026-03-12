"use client";

import { themes, useTheme } from "./theme-provider";

const activeStyles: Record<string, { border: string; bg: string; text: string }> = {
  stone:    { border: "#57534e", bg: "#f5f5f4", text: "#1c1917" },
  rose:     { border: "#e11d48", bg: "#fff1f2", text: "#9f1239" },
  lavender: { border: "#7c3aed", bg: "#f5f3ff", text: "#5b21b6" },
  ocean:    { border: "#0369a1", bg: "#f0f9ff", text: "#075985" },
  sunset:   { border: "#c2410c", bg: "#fff7ed", text: "#9a3412" },
  forest:   { border: "#15803d", bg: "#f0fdf4", text: "#166534" },
  berry:    { border: "#c026d3", bg: "#fdf4ff", text: "#86198f" },
  midnight: { border: "#2563eb", bg: "#eff6ff", text: "#1e3a5f" },
};

export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const colors = activeStyles[theme] || activeStyles.stone;

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
      <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Color theme</h3>
      <p className="text-sm text-stone-600 dark:text-stone-300">Pick a vibe that feels like you two.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {themes.map((t) => {
          const active = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium transition ${
                active
                  ? ""
                  : "border-[var(--border)] bg-card text-stone-700 hover:border-stone-300 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:border-stone-500"
              }`}
              style={active ? { borderColor: colors.border, backgroundColor: colors.bg, color: colors.text } : undefined}
            >
              <span className="flex shrink-0 gap-0.5">
                {t.preview.map((color, i) => (
                  <span
                    key={i}
                    className="block h-4 w-4 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
