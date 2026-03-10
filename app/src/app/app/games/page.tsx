import Link from "next/link";

const games = [
  {
    href: "/app/games/would-you-rather",
    title: "Would You Rather",
    description: "A new question each day. Answer independently, then see if you matched.",
    emoji: "🤔",
  },
  {
    href: "/app/games/draw",
    title: "Draw Together",
    description: "A daily prompt. Both of you draw, then reveal your creations side by side.",
    emoji: "🎨",
  },
  {
    href: "/app/games/this-or-that",
    title: "This or That",
    description: "Quick picks that reveal how alike (or different) you really are.",
    emoji: "⚡",
  },
];

export default function GamesHub() {
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
            className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-stone-700 dark:bg-stone-900"
          >
            <span className="text-3xl">{game.emoji}</span>
            <h3 className="mt-3 font-semibold text-stone-900 dark:text-stone-100">{game.title}</h3>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{game.description}</p>
            <span className="mt-4 inline-block text-sm font-medium text-stone-900 underline decoration-stone-300 underline-offset-4 transition group-hover:decoration-stone-900 dark:text-stone-100 dark:decoration-stone-600 dark:group-hover:decoration-stone-100">
              Play now
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
