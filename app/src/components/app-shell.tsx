"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions";
import { useState, useRef, useEffect } from "react";

const navItems = [
  { href: "/app", label: "Home" },
  { href: "/app/daily", label: "Daily" },
  { href: "/app/weekly", label: "Weekly" },
  { href: "/app/games", label: "Games" },
  { href: "/app/love-notes", label: "Notes" },
  { href: "/app/journal", label: "Journal" },
  { href: "/app/memories", label: "Memories" },
];

const menuItems = [
  { href: "/app/milestones", label: "Milestones" },
  { href: "/app/reassurance", label: "Reassurance" },
  { href: "/app/settings", label: "Settings" },
];

const mobileItems = [
  { href: "/app", label: "Home" },
  { href: "/app/daily", label: "Daily" },
  { href: "/app/weekly", label: "Weekly" },
  { href: "/app/games", label: "Games" },
];

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname.startsWith(href);
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const menuActive = menuItems.some((item) => isActive(pathname, item.href));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 active:scale-[0.98] ${
          menuActive
            ? "btn-accent shadow-sm"
            : "border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <span className="hidden sm:inline">More</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-2xl border border-stone-200 bg-white py-2 shadow-lg sm:left-auto sm:right-0 dark:border-stone-700 dark:bg-stone-900">
          {menuItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="my-1 border-t border-stone-200 dark:border-stone-700" />
          <form action={logoutAction}>
            <button className="block w-full px-4 py-2.5 text-left text-sm font-medium text-stone-500 transition hover:bg-stone-50 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200">
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const mobileMoreHref = "/app/more";

export function AppShell({ children, unreadNotes = 0 }: { children: React.ReactNode; unreadNotes?: number }) {
  const pathname = usePathname();

  const moreActive = isActive(pathname, mobileMoreHref) || ["/app/love-notes", "/app/journal", "/app/memories", "/app/milestones", "/app/reassurance", "/app/settings"].some((h) => isActive(pathname, h));

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6 sm:pb-10 sm:pt-8">
      <header className="mb-6 rounded-3xl border border-stone-200/80 bg-white/90 p-5 shadow-sm backdrop-blur sm:mb-8 sm:p-6 dark:border-stone-700 dark:bg-stone-900/80">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-accent text-xs font-semibold uppercase tracking-[0.22em]">Ours</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl dark:text-stone-100">Stay close. Even when apart.</p>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Tiny, steady moments for both of you — with no pressure to be perfect.</p>
          </div>
          <UserMenu />
        </div>

        <nav aria-label="Primary" className="mt-5 hidden flex-wrap items-center gap-2 text-sm sm:flex">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const showBadge = item.href === "/app/love-notes" && unreadNotes > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-full border px-3 py-2 font-medium transition ${
                  active
                    ? "btn-accent shadow-sm"
                    : "border-stone-300 bg-white text-stone-700 hover:-translate-y-0.5 hover:border-stone-400 hover:bg-stone-50 hover:text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                }`}
              >
                {item.label}
                {showBadge && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadNotes > 9 ? "9+" : unreadNotes}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="animate-[fadeIn_.25s_ease-out] space-y-5">{children}</div>

      <nav
        aria-label="Primary mobile"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 px-3 py-2 backdrop-blur sm:hidden dark:border-stone-700 dark:bg-stone-900/90"
      >
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-2">
          {mobileItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`min-h-11 rounded-xl px-2 py-2 text-center text-xs font-semibold transition active:scale-[0.98] ${
                  active
                    ? "btn-accent"
                    : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href={mobileMoreHref}
            aria-current={moreActive ? "page" : undefined}
            className={`relative min-h-11 rounded-xl px-2 py-2 text-center text-xs font-semibold transition active:scale-[0.98] ${
              moreActive
                ? "btn-accent"
                : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
            }`}
          >
            More
            {unreadNotes > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Link>
        </div>
      </nav>
    </main>
  );
}
