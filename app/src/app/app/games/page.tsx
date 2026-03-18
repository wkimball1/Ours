import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyData, getSubscriptionInfo } from "@/lib/ours";
import { PaywallGate } from "@/components/paywall-gate";

export default async function GamesHub() {
  const { user, couple } = await getMyData();

  if (!couple || !user) {
    return <p className="text-sm text-stone-600">Set up your couple first.</p>;
  }

  const { premium } = await getSubscriptionInfo(couple.id);
  if (!premium) return <PaywallGate feature="Games" />;

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [drawRow, { count: totAnswered }, ftsRow] = await Promise.all([
    supabase
      .from("drawings")
      .select("id")
      .eq("couple_id", couple.id)
      .eq("user_id", user.id)
      .eq("session_date", today)
      .maybeSingle()
      .then((r) => r.data),
    supabase
      .from("this_or_that_answers")
      .select("*", { count: "exact", head: true })
      .eq("couple_id", couple.id)
      .eq("user_id", user.id),
    supabase
      .from("finish_sentence_answers")
      .select("id")
      .eq("couple_id", couple.id)
      .eq("user_id", user.id)
      .eq("session_date", today)
      .maybeSingle()
      .then((r) => r.data),
  ]);

  const games = [
    {
      href: "/app/games/this-or-that",
      title: "This or That",
      description: "Preferences, hypotheticals, and the occasional curveball. See how well you really know each other.",
      emoji: "⚡",
      status: totAnswered ? `${totAnswered} picks made` : "Get started",
      done: false,
    },
    {
      href: "/app/games/finish-the-sentence",
      title: "Finish the Sentence",
      description: "A daily prompt. Write your ending before your partner does — then compare.",
      emoji: "✍️",
      status: ftsRow ? "Written today ✓" : "New today",
      done: !!ftsRow,
    },
    {
      href: "/app/games/draw",
      title: "Draw Together",
      description: "A daily prompt. Both of you draw, then reveal your creations side by side.",
      emoji: "🎨",
      status: drawRow ? "Drawn today ✓" : "New today",
      done: !!drawRow,
    },
  ];

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Games</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">A little fun goes a long way. Play together, even apart.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {games.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className="group relative rounded-2xl border border-[var(--border)] bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-3xl">{game.emoji}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                game.done
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
              }`}>
                {game.status}
              </span>
            </div>
            <h3 className="mt-3 font-semibold text-stone-900 dark:text-stone-100">{game.title}</h3>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{game.description}</p>
            <span className="mt-4 inline-block text-sm font-medium text-stone-900 underline decoration-stone-300 underline-offset-4 transition group-hover:decoration-stone-900 dark:text-stone-100 dark:decoration-stone-600 dark:group-hover:decoration-stone-100">
              {game.done ? "View →" : "Play now →"}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
