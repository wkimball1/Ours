import Link from "next/link";
import { loginAction, magicLinkAction } from "@/app/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    sent?: string;
    source?: string;
    invite?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  }>;
}) {
  const params = await searchParams;
  const error = params.error ? decodeURIComponent(params.error) : null;
  const sent = params.sent === "1";
  const source = params.source || (params.invite ? "invite" : "login");
  const magicLinksEnabled = process.env.NEXT_PUBLIC_ENABLE_MAGIC_LINKS === "true";

  return (
    <main className="mx-auto max-w-md px-5 py-10 sm:py-16">
      <div className="rounded-3xl border border-stone-200/80 bg-white/95 p-6 shadow-sm backdrop-blur sm:p-8 dark:border-stone-700 dark:bg-stone-900/85">
        <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em]">Welcome back</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Glad you’re here.</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">A quiet moment with your person is waiting whenever you’re ready.</p>

        {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        {sent && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Magic link sent. Take your time checking your inbox.</p>}

        <form action={loginAction} className="mt-6 space-y-3" aria-label="Login form">
          <input type="hidden" name="source" value={source} />
          <input type="hidden" name="invite_token" value={params.invite || ""} />
          <input type="hidden" name="utm_source" value={params.utm_source || ""} />
          <input type="hidden" name="utm_medium" value={params.utm_medium || ""} />
          <input type="hidden" name="utm_campaign" value={params.utm_campaign || ""} />
          <input type="hidden" name="utm_content" value={params.utm_content || ""} />
          <input type="hidden" name="utm_term" value={params.utm_term || ""} />

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-stone-700 dark:text-stone-200">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="w-full px-3 py-2.5" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-stone-700 dark:text-stone-200">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="Your password" className="w-full px-3 py-2.5" />
          </div>
          <button className="btn-accent min-h-11 w-full rounded-xl p-2.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 active:scale-[0.99]">Log in</button>
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-stone-500 underline underline-offset-2 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200">
              Forgot password?
            </Link>
          </div>
        </form>

        {magicLinksEnabled ? (
          <form action={magicLinkAction} className="mt-4 space-y-2 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/70" aria-label="Magic link form">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Prefer a magic link?</p>
            <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="w-full bg-white px-3 py-2.5 dark:bg-stone-900" />
            <button className="min-h-11 w-full rounded-xl border border-stone-300 bg-white p-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-700">Send magic link</button>
          </form>
        ) : (
          <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800/70 dark:text-stone-300">
            Magic links are temporarily paused in development to avoid email rate limits.
          </div>
        )}

        <p className="mt-5 text-sm text-stone-600 dark:text-stone-300">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-stone-900 underline underline-offset-2 hover:text-stone-700 dark:text-stone-100 dark:hover:text-stone-300">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
