import Link from "next/link";
import { signUpAction } from "@/app/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
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
  const source = params.source || (params.invite ? "invite" : "signup");

  return (
    <main className="mx-auto max-w-md px-5 py-10 sm:py-16">
      <div className="rounded-3xl border border-stone-200/80 bg-white/95 p-6 shadow-sm backdrop-blur sm:p-8 dark:border-stone-700 dark:bg-stone-900/85">
        <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em]">Start together</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Create your Ours space.</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">No pressure and no rush — just a warm place for both of you to check in.</p>

        {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

        <form action={signUpAction} className="mt-6 space-y-3" aria-label="Sign up form">
          <input type="hidden" name="source" value={source} />
          <input type="hidden" name="invite_token" value={params.invite || ""} />
          <input type="hidden" name="utm_source" value={params.utm_source || ""} />
          <input type="hidden" name="utm_medium" value={params.utm_medium || ""} />
          <input type="hidden" name="utm_campaign" value={params.utm_campaign || ""} />
          <input type="hidden" name="utm_content" value={params.utm_content || ""} />
          <input type="hidden" name="utm_term" value={params.utm_term || ""} />

          <div className="space-y-1.5">
            <label htmlFor="first_name" className="text-sm font-medium text-stone-700 dark:text-stone-200">First name</label>
            <input id="first_name" name="first_name" required autoComplete="given-name" placeholder="First name" className="w-full px-3 py-2.5" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-stone-700 dark:text-stone-200">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="w-full px-3 py-2.5" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-stone-700 dark:text-stone-200">Password</label>
            <input id="password" name="password" type="password" required autoComplete="new-password" placeholder="Create a password" className="w-full px-3 py-2.5" />
          </div>
          <button className="btn-accent min-h-11 w-full rounded-xl p-2.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 active:scale-[0.99]">Create account</button>
        </form>

        <p className="mt-5 text-sm text-stone-600 dark:text-stone-300">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-stone-900 underline underline-offset-2 hover:text-stone-700 dark:text-stone-100 dark:hover:text-stone-300">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
