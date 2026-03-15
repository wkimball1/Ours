"use client";

import { useTheme, type DarkMode } from "./theme-provider";

const options: { value: DarkMode; label: string; icon: string }[] = [
  { value: "system", label: "System", icon: "💻" },
  { value: "light", label: "Light", icon: "☀️" },
  { value: "dark", label: "Dark", icon: "🌙" },
];

export function DarkModeToggle() {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
      <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Appearance</h3>
      <p className="text-sm text-stone-600 dark:text-stone-300">Choose light, dark, or follow your device.</p>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDarkMode(opt.value)}
            className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-sm font-medium transition ${
              darkMode === opt.value
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-dark)]"
                : "border-[var(--border)] bg-card text-stone-600 hover:border-stone-300 dark:text-stone-300 dark:hover:border-stone-500"
            }`}
          >
            <span className="text-xl leading-none">{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
