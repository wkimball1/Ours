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
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const visible = filter === "all" ? items : items.filter((i) => i.type === filter);

  // Group by date label, preserving insertion order (already sorted newest-first)
  const groupEntries: [string, TimelineItem[]][] = [];
  const groupMap: Record<string, TimelineItem[]> = {};
  for (const item of visible) {
    const key = new Date(item.date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groupMap[key]) {
      groupMap[key] = [];
      groupEntries.push([key, groupMap[key]]);
    }
    groupMap[key].push(item);
  }

  function toggleCollapse(dateLabel: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(dateLabel)) next.delete(dateLabel);
      else next.add(dateLabel);
      return next;
    });
  }

  const btnBase = "rounded-full border px-3 py-1.5 text-xs font-semibold transition";
  const btnActive = "btn-accent shadow-sm";
  const btnInactive = "border-stone-300 bg-card text-stone-600 hover:-translate-y-0.5 hover:border-stone-400 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700";

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

      {groupEntries.map(([dateLabel, dayItems], groupIndex) => {
        // Most recent group (index 0) starts expanded; all others start collapsed
        const isCollapsed = collapsed.has(dateLabel) || (groupIndex > 0 && !collapsed.has(`open:${dateLabel}`));

        // Track "explicitly opened" to override the default-collapsed behaviour
        function toggle() {
          setCollapsed((prev) => {
            const next = new Set(prev);
            if (groupIndex > 0) {
              // For older groups: toggle between default-collapsed and explicitly-open
              if (next.has(`open:${dateLabel}`)) {
                next.delete(`open:${dateLabel}`);
              } else {
                next.add(`open:${dateLabel}`);
              }
            } else {
              // For the newest group: toggle collapse
              if (next.has(dateLabel)) next.delete(dateLabel);
              else next.add(dateLabel);
            }
            return next;
          });
        }

        const open = groupIndex === 0
          ? !collapsed.has(dateLabel)
          : collapsed.has(`open:${dateLabel}`);

        return (
          <div key={dateLabel}>
            <button
              onClick={toggle}
              className="mb-3 flex w-full items-center justify-between gap-2 rounded-xl px-1 py-1 text-left transition hover:bg-stone-100 dark:hover:bg-stone-800/60"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                {dateLabel}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
                <span>{dayItems.length} {dayItems.length === 1 ? "memory" : "memories"}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>

            {open && (
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
            )}
          </div>
        );
      })}
    </div>
  );
}
