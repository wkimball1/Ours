import { resetPasswordAction } from "@/app/actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? decodeURIComponent(params.error) : null;

  return (
    <main className="mx-auto max-w-md px-5 py-10 sm:py-16">
      <div className="rounded-3xl border border-stone-200/80 bg-white/95 p-6 shadow-sm backdrop-blur sm:p-8 dark:border-stone-700 dark:bg-stone-900/85">
        <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em]">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Choose a new password.</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
          Pick something you'll remember — at least 6 characters.
        </p>

        {error && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200">
            {error}
          </p>
        )}

        <form action={resetPasswordAction} className="mt-6 space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-stone-700 dark:text-stone-200">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="w-full px-3 py-2.5"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirm_password" className="text-sm font-medium text-stone-700 dark:text-stone-200">
              Confirm new password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Type it again"
              className="w-full px-3 py-2.5"
            />
          </div>
          <button className="btn-accent min-h-11 w-full rounded-xl p-2.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 active:scale-[0.99]">
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}
