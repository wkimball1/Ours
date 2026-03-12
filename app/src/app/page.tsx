import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-16">
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-accent text-sm uppercase tracking-wide">Ours</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-6xl">Feel chosen every day — even when life is chaos.</h1>
        <p className="mt-6 max-w-2xl text-lg text-stone-600 dark:text-stone-300">
          A calm, grounding connection app for long-distance couples. No guilt, no pressure — just tiny async moments that keep you close.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/challenge?source=landing_hero" className="rounded-full px-5 py-3 text-sm font-medium btn-accent transition">
            Start 7-Day Challenge
          </Link>
          <Link href="/signup?source=landing_hero" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium transition hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-800">
            Create account
          </Link>
          <Link href="/login?source=landing_hero" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium transition hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-800">
            Log in
          </Link>
        </div>
      </div>

      <div className="mt-16 space-y-10">
        <div>
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em]">Daily rituals</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <FeatureCard title="Daily Moment" description="Three thoughtful prompts. You each answer on your own, then unlock each other's responses." />
            <FeatureCard title="Weekly Reset" description="A longer check-in for bigger feelings, plans, and appreciation. When you're ready." />
            <FeatureCard title="Reassurance" description="Ask softly. Respond warmly. Lower the temperature together. No pressure." />
          </div>
        </div>

        <div>
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em]">Fun together</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <FeatureCard title="Would You Rather" description="A daily question. Pick for yourself, then guess what your partner chose." />
            <FeatureCard title="Draw Together" description="Same prompt, separate canvases. Reveal both drawings when you're done." />
            <FeatureCard title="This or That" description="Quick binary picks with a compatibility score. How well do you know each other?" />
            <FeatureCard title="Love Notes" description="Leave a surprise note for your partner to find. Short, sweet, and theirs to keep." />
          </div>
        </div>

        <div>
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em]">Your story</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <FeatureCard title="Shared Journal" description="A free-form space for thoughts, feelings, and memories. No prompts needed." />
            <FeatureCard title="Memories" description="A timeline of everything you've shared — moments, drawings, games, and notes." />
            <FeatureCard title="Milestones" description="Celebrate how far you've come. Days together, moments shared, notes exchanged." />
          </div>
        </div>
      </div>

      <footer className="mt-16 border-t border-[var(--border)] pt-6 text-center text-xs text-stone-400">
        Ours — built for couples who choose each other, every day.
      </footer>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
      <h3 className="font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{description}</p>
    </div>
  );
}
