"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type NotificationItem = {
  id: string;
  type: string;
  payload: Record<string, string> | null;
  created_at: string;
  from_user_id: string | null;
};

type NotifData = {
  count: number;
  unreadNotes: number;
  notifications: NotificationItem[];
};

function notifMeta(type: string, payload: Record<string, string> | null): { label: string; href: string } {
  const p = payload ?? {};
  switch (type) {
    case "session_unlocked":
      return {
        label: `✨ Your ${p.session_type ?? "daily"} session unlocked!`,
        href: p.session_type === "weekly" ? "/app/weekly" : "/app/daily",
      };
    case "game_answered":
      return {
        label: `🎮 Your partner answered ${p.game ?? "a game"}`,
        href: p.href ?? "/app/games",
      };
    case "reassurance_request":
      return { label: "🤗 Your partner needs reassurance", href: "/app/reassurance" };
    case "reassurance_message":
      return {
        label: `💬 ${p.message ? p.message.slice(0, 60) + (p.message.length > 60 ? "…" : "") : "A message from your partner"}`,
        href: "/app/reassurance",
      };
    case "thinking_of_you":
      return {
        label: `🤍 ${p.from_name ?? "Your partner"} is thinking of you`,
        href: "/app",
      };
    case "note_reaction":
      return {
        label: `${p.reaction ?? "💛"} ${p.from_name ?? "Your partner"} reacted to your note`,
        href: "/app/love-notes",
      };
    default:
      return { label: "New notification", href: "/app" };
  }
}

export function NotificationBell() {
  const [data, setData] = useState<NotifData | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function fetchNotifs() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) setData(await res.json());
    } catch {
      // silently ignore network errors
    }
  }

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Mark as read and clear badge only when the dropdown closes
  function closeAndMarkRead() {
    setOpen(false);
    if (data && data.notifications.length > 0) {
      fetch("/api/notifications", { method: "POST" }).catch(() => {});
      setData((prev) => prev ? { ...prev, count: prev.unreadNotes, notifications: [] } : prev);
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) closeAndMarkRead();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const count = data?.count ?? 0;
  const hasItems = data && (data.unreadNotes > 0 || data.notifications.length > 0);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => (open ? closeAndMarkRead() : setOpen(true))}
        aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
        className="relative flex min-h-11 items-center gap-1.5 rounded-full border border-stone-300 bg-card px-3 py-2 text-stone-700 transition hover:-translate-y-0.5 hover:border-stone-400 hover:text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[var(--border)] bg-card shadow-lg">
          <div className="border-b border-stone-100 px-4 py-3 dark:border-stone-800">
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Notifications</p>
          </div>

          {data && data.unreadNotes > 0 && (
            <Link
              href="/app/love-notes"
              onClick={closeAndMarkRead}
              className="flex items-center gap-3 border-b border-stone-100 px-4 py-3 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800"
            >
              <span className="text-lg leading-none">💌</span>
              <span className="text-sm text-stone-700 dark:text-stone-300">
                {data.unreadNotes === 1 ? "1 unread love note" : `${data.unreadNotes} unread love notes`}
              </span>
            </Link>
          )}

          {data?.notifications && data.notifications.length > 0 && (
            data.notifications.map((notif) => {
              const { label, href } = notifMeta(notif.type, notif.payload);
              return (
                <Link
                  key={notif.id}
                  href={href}
                  onClick={closeAndMarkRead}
                  className="flex items-center gap-3 border-b border-stone-100 px-4 py-3 last:border-0 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800"
                >
                  <span className="text-sm text-stone-700 dark:text-stone-300">{label}</span>
                </Link>
              );
            })
          )}

          {!hasItems && (
            <p className="px-4 py-6 text-center text-sm text-stone-500 dark:text-stone-400">
              All caught up! 🎉
            </p>
          )}
        </div>
      )}
    </div>
  );
}
