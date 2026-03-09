"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions";

const navItems = [
  { href: "/app", label: "Home" },
  { href: "/app/daily", label: "Daily" },
  { href: "/app/weekly", label: "Weekly" },
  { href: "/app/reassurance", label: "Reassure" },
  { href: "/app/settings", label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6 sm:pb-10 sm:pt-8">
      <header className="mb-6 rounded-3xl border border-stone-200/80 bg-white/90 p-5 shadow-sm backdrop-blur sm:mb-8 sm:p-6 dark:border-stone-700 dark:bg-stone-900/80">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">Ours</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl dark:text-stone-100">Stay close. Even when apart.</p>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Tiny, steady moments for both of you — with no pressure to be perfect.</p>
          </div>
          <form action={logoutAction}>
            <button className="min-h-11 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:-translate-y-0.5 hover:border-stone-400 hover:text-stone-900 active:scale-[0.98] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200">
              Log out
            </button>
          </form>
        </div>

        <nav aria-label="Primary" className="mt-5 hidden flex-wrap items-center gap-2 text-sm sm:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full border px-3 py-2 font-medium transition ${
                  active
                    ? "border-stone-900 bg-stone-900 text-white shadow-sm dark:border-stone-200 dark:bg-stone-100 dark:text-stone-900"
                    : "border-stone-300 bg-white text-stone-700 hover:-translate-y-0.5 hover:border-stone-400 hover:bg-stone-50 hover:text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                }`}
              >
                {item.label}
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
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`min-h-11 rounded-xl px-2 py-2 text-center text-xs font-semibold transition active:scale-[0.98] ${
                  active
                    ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                    : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
