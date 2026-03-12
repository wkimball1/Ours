import Link from "next/link";
import { requestPasswordResetAction } from "@/app/actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? decodeURIComponent(params.error) : null;
  const sent = params.sent === "1";

  return (
    <main className="mx-auto max-w-md px-5 py-10 sm:py-16">
      <div className="rounded-3xl border border-[var(--border)]/80 bg-card/95 p-6 shadow-sm backdrop-blur sm:p-8">
        <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em]">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Reset your password.</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
          Enter your email and we'll send a reset link. It'll be waiting whenever you're ready.
        </p>

        {error && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200">
            {error}
          </p>
        )}

        {sent ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            <p className="font-semibold">Check your inbox.</p>
            <p className="mt-1">We sent a reset link to your email. It expires in an hour.</p>
          </div>
        ) : (
          <form action={requestPasswordResetAction} className="mt-6 space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-stone-700 dark:text-stone-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-3 py-2.5"
              />
            </div>
            <button className="btn-accent min-h-11 w-full rounded-xl p-2.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 active:scale-[0.99]">
              Send reset link
            </button>
          </form>
        )}

        <p className="mt-5 text-sm text-stone-600 dark:text-stone-300">
          Remember it?{" "}
          <Link
            href="/login"
            className="font-semibold text-stone-900 underline underline-offset-2 hover:text-stone-700 dark:text-stone-100 dark:hover:text-stone-300"
          >
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}
