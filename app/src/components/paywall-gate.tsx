import Link from "next/link";

export function PaywallGate({ feature }: { feature: string }) {
  return (
    <section className="flex flex-col items-center gap-5 rounded-3xl border border-[var(--border)] bg-card p-10 text-center shadow-sm">
      <div className="text-5xl">✨</div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
          {feature} is a premium feature
        </h2>
        <p className="mx-auto max-w-xs text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          Your free trial has ended. Subscribe to keep connecting with your person.
        </p>
      </div>
      <Link
        href="/app/settings/billing"
        className="btn-accent inline-flex min-h-11 items-center rounded-xl px-6 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5"
      >
        See plans →
      </Link>
    </section>
  );
}
