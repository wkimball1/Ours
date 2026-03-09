import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <p className="text-sm uppercase tracking-wide text-stone-500">Ours</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-6xl">Feel chosen every day — even when life is chaos.</h1>
      <p className="mt-6 max-w-2xl text-lg text-stone-600 dark:text-stone-300">
        A calm, grounding connection app for long-distance couples. No guilt, no pressure — just tiny async moments that keep you close.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/challenge?source=landing_hero" className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white">
          Start 7-Day Challenge
        </Link>
        <Link href="/signup?source=landing_hero" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium">
          Create account
        </Link>
        <Link href="/login?source=landing_hero" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium">
          Log in
        </Link>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-stone-900/80">
          <h3 className="font-medium">Daily Moment</h3>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Three thoughtful steps. Unlock once both complete.</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-stone-900/80">
          <h3 className="font-medium">Weekly Reset</h3>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">A flexible weekly check-in. When you’re ready.</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-stone-900/80">
          <h3 className="font-medium">Reassurance</h3>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Ask softly. Respond warmly. No pressure.</p>
        </div>
      </div>
    </main>
  );
}
