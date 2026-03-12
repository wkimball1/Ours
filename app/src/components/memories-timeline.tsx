"use client";

import { useState } from "react";

export interface TimelineItem {
  type: "session" | "drawing" | "game" | "note";
  date: string; // ISO string (serializable from server)
  title: string;
  subtitle: string;
  detail?: string;
  imageUrl?: string;
  matchResult?: "matched" | "different";
}

const typeStyles: Record<string, { border: string; bg: string; icon: string }> = {
  session: { border: "border-emerald-200 dark:border-emerald-800", bg: "bg-emerald-50 dark:bg-emerald-950", icon: "💬" },
  drawing: { border: "border-violet-200 dark:border-violet-800", bg: "bg-violet-50 dark:bg-violet-950", icon: "🎨" },
  game:    { border: "border-amber-200 dark:border-amber-800",   bg: "bg-amber-50 dark:bg-amber-950",   icon: "🎮" },
  note:    { border: "border-rose-200 dark:border-rose-800",     bg: "bg-rose-50 dark:bg-rose-950",     icon: "💌" },
};

const filters = [
  { key: "all",     label: "All" },
  { key: "session", label: "Moments" },
  { key: "game",    label: "Games" },
  { key: "note",    label: "Notes" },
  { key: "drawing", label: "Drawings" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

export function MemoriesTimeline({ items }: { items: TimelineItem[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const visible = filter === "all" ? items : items.filter((i) => i.type === filter);

  const grouped: Record<string, TimelineItem[]> = {};
  for (const item of visible) {
    const key = new Date(item.date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  const btnBase = "rounded-full border px-3 py-1.5 text-xs font-semibold transition";
  const btnActive = "btn-accent shadow-sm";
  const btnInactive = "border-stone-300 bg-white text-stone-600 hover:-translate-y-0.5 hover:border-stone-400 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700";

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const count = f.key === "all" ? items.length : items.filter((i) => i.type === f.key).length;
          if (f.key !== "all" && count === 0) return null;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`${btnBase} ${filter === f.key ? btnActive : btnInactive}`}
            >
              {f.label}
              {count > 0 && (
                <span className={`ml-1.5 text-[10px] ${filter === f.key ? "opacity-80" : "text-stone-400 dark:text-stone-500"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {visible.length === 0 && (
        <p className="py-6 text-center text-sm text-stone-400 dark:text-stone-500">
          Nothing here yet.
        </p>
      )}

      {Object.entries(grouped).map(([dateLabel, dayItems]) => (
        <div key={dateLabel}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {dateLabel}
          </p>
          <div className="space-y-3">
            {dayItems.map((item, i) => {
              const style = typeStyles[item.type];
              return (
                <div key={i} className={`rounded-2xl border ${style.border} ${style.bg} p-4`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl leading-none">{style.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-stone-900 dark:text-stone-100">{item.title}</p>
                      <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-300">{item.subtitle}</p>
                      {item.matchResult && (
                        <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          item.matchResult === "matched"
                            ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
                            : "bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200"
                        }`}>
                          {item.matchResult === "matched" ? "Same choice" : "Different choices"}
                        </span>
                      )}
                      {item.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt="Drawing"
                          className="mt-3 max-h-48 rounded-xl border border-violet-200 object-contain dark:border-violet-800"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
