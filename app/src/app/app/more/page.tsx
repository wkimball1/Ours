import Link from "next/link";
import { logoutAction } from "@/app/actions";

const links = [
  { href: "/app/love-notes", label: "Love Notes", description: "Leave a surprise note for your partner." },
  { href: "/app/journal", label: "Journal", description: "A shared space for thoughts and memories." },
  { href: "/app/memories", label: "Memories", description: "Everything you've shared, all in one place." },
  { href: "/app/milestones", label: "Milestones", description: "Celebrate how far you've come together." },
  { href: "/app/reassurance", label: "Reassurance", description: "Ask softly. Respond warmly." },
  { href: "/app/settings", label: "Settings", description: "Name, timezone, and relationship details." },
];

export default function MorePage() {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">More</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Everything else in one place.</p>
      </div>

      <div className="space-y-2">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] dark:border-stone-700 dark:bg-stone-900"
          >
            <p className="font-semibold text-stone-900 dark:text-stone-100">{item.label}</p>
            <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{item.description}</p>
          </Link>
        ))}
      </div>

      <form action={logoutAction}>
        <button className="w-full rounded-2xl border border-stone-200 bg-white p-4 text-left text-sm font-medium text-stone-500 shadow-sm transition hover:bg-stone-50 hover:text-stone-700 active:scale-[0.99] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200">
          Log out
        </button>
      </form>
    </section>
  );
}
