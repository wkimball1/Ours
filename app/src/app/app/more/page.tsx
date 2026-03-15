import Link from "next/link";
import { logoutAction } from "@/app/actions";

const featureLinks = [
  { href: "/app/love-notes", label: "Love Notes", emoji: "💌", description: "Leave a surprise note for your partner." },
  { href: "/app/bucket-list", label: "Bucket List", emoji: "✨", description: "Things you want to do and experience together." },
  { href: "/app/journal", label: "Journal", emoji: "📓", description: "A shared space for thoughts and memories." },
  { href: "/app/memories", label: "Memories", emoji: "🎞️", description: "Everything you've shared, all in one place." },
  { href: "/app/milestones", label: "Milestones", emoji: "🏅", description: "Celebrate how far you've come together." },
  { href: "/app/reassurance", label: "Reassurance", emoji: "🤗", description: "Ask softly. Respond warmly." },
];

const accountLinks = [
  { href: "/app/settings", label: "Settings", emoji: "⚙️", description: "Name, timezone, and relationship details." },
];

export default function MorePage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">More</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Everything else in one place.</p>
      </div>

      <div className="space-y-2">
        <p className="px-1 text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">Features</p>
        {featureLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-xl dark:bg-stone-800">{item.emoji}</span>
            <div className="min-w-0">
              <p className="font-semibold text-stone-900 dark:text-stone-100">{item.label}</p>
              <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        <p className="px-1 text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">Account</p>
        {accountLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-xl dark:bg-stone-800">{item.emoji}</span>
            <div className="min-w-0">
              <p className="font-semibold text-stone-900 dark:text-stone-100">{item.label}</p>
              <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{item.description}</p>
            </div>
          </Link>
        ))}
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-4 rounded-2xl border border-[var(--border)] bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-xl dark:bg-stone-800">👋</span>
            <div className="min-w-0">
              <p className="font-semibold text-stone-500 dark:text-stone-400">Log out</p>
            </div>
          </button>
        </form>
      </div>
    </section>
  );
}
