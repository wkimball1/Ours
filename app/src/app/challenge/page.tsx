import Link from "next/link";
import { joinChallengeWaitlistAction } from "@/app/actions";

export default async function ChallengePage({
  searchParams,
}: {
  searchParams: Promise<{
    source?: string;
    success?: string;
    error?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  }>;
}) {
  const sp = await searchParams;
  const source = sp.source || "direct";
  const success = sp.success === "1";
  const error = sp.error ? decodeURIComponent(sp.error) : null;

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
      <div className="rounded-3xl border border-stone-200/80 bg-white/95 p-6 shadow-sm backdrop-blur sm:p-8 dark:border-stone-700 dark:bg-stone-900/85">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">7-Day Feel Chosen Challenge</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Feel chosen every day — even when life is chaos.</h1>
        <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">
          A calm, practical challenge for long-distance couples: one tiny async ritual per day that takes about a minute.
        </p>

        <ul className="mt-5 space-y-2 text-sm text-stone-700 dark:text-stone-200">
          <li>• 1-minute daily prompt</li>
          <li>• Works across time zones and busy schedules</li>
          <li>• Designed to make your partner feel seen, not pressured</li>
        </ul>

        {success && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">You’re in. We’ll send your invite and challenge starter shortly.</p>}
        {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

        <form action={joinChallengeWaitlistAction} className="mt-6 space-y-3">
          <input type="hidden" name="source" value={source} />
          <input type="hidden" name="utm_source" value={sp.utm_source || ""} />
          <input type="hidden" name="utm_medium" value={sp.utm_medium || ""} />
          <input type="hidden" name="utm_campaign" value={sp.utm_campaign || ""} />
          <input type="hidden" name="utm_content" value={sp.utm_content || ""} />
          <input type="hidden" name="utm_term" value={sp.utm_term || ""} />

          <input name="first_name" placeholder="First name" className="w-full px-3 py-2.5 text-[16px]" />
          <input name="email" type="email" required placeholder="Your email" className="w-full px-3 py-2.5 text-[16px]" />
          <input name="partner_email" type="email" placeholder="Partner email (optional)" className="w-full px-3 py-2.5 text-[16px]" />
          <button className="w-full rounded-xl bg-stone-900 p-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-stone-800 active:scale-[0.99] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200">
            Join the challenge
          </button>
        </form>

        <p className="mt-4 text-xs text-stone-500">By joining, you agree to receive challenge emails. No spam.</p>

        <p className="mt-6 text-sm text-stone-600 dark:text-stone-300">
          Want to explore first? <Link href="/" className="underline">Go back</Link>
        </p>
      </div>
    </main>
  );
}
