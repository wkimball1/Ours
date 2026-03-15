import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ensureDailySession, getMyData, getPartnerId } from "@/lib/ours";
import { SessionForm } from "@/components/session-form";

export default async function DailyPage() {
  const supabase = await createClient();
  const { user, couple } = await getMyData();

  if (!user || !couple) return <p>Set up your couple first.</p>;

  const session = await ensureDailySession(couple.id);
  if (!session) return <p className="text-sm text-stone-600">Today&apos;s daily prompts are being prepared. Check back in a little while!</p>;

  const partnerId = getPartnerId(couple, user.id);

  const { data: prompts } = await supabase
    .from("prompts")
    .select("step_index, prompt_text")
    .eq("content_set_id", session.content_set_id)
    .order("step_index");

  const [{ data: mine }, { data: partnerRows }] = await Promise.all([
    supabase.from("responses").select("step_index, response_text").eq("session_id", session.id).eq("user_id", user.id),
    partnerId
      ? supabase.from("responses").select("step_index, response_text").eq("session_id", session.id).eq("user_id", partnerId).order("step_index")
      : Promise.resolve({ data: [] }),
  ]);

  const existing = Object.fromEntries((mine ?? []).map((r) => [r.step_index, r.response_text]));

  const totalPrompts = prompts?.length ?? 0;
  const mineCount = (mine ?? []).filter((r) => (r.response_text ?? "").trim().length > 0).length;
  const partnerCount = (partnerRows ?? []).filter((r) => (r.response_text ?? "").trim().length > 0).length;

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Today’s tiny moment</h2>
          <span className="text-xs font-medium text-stone-400 dark:text-stone-500">~2 min</span>
        </div>
        <p className="text-sm text-stone-600 dark:text-stone-300">No perfect words needed — one honest minute is enough.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <p className="rounded-xl border border-[var(--border)] bg-card p-3 text-sm text-stone-700 shadow-sm dark:text-stone-200">
          Status: <strong className="font-semibold text-stone-900 dark:text-stone-100">{session.status}</strong>
        </p>
        <p className="rounded-xl border border-[var(--border)] bg-card p-3 text-sm text-stone-700 shadow-sm dark:text-stone-200">
          You: <strong className="text-stone-900 dark:text-stone-100">{mineCount}/{totalPrompts}</strong>
        </p>
        <p className="rounded-xl border border-[var(--border)] bg-card p-3 text-sm text-stone-700 shadow-sm dark:text-stone-200">
          Partner: <strong className="text-stone-900 dark:text-stone-100">{partnerCount}/{totalPrompts}</strong>
        </p>
      </div>

      <SessionForm sessionId={session.id} prompts={prompts ?? []} existing={existing} />

      {session.status !== "unlocked" && mineCount >= totalPrompts && totalPrompts > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Your note is in ✨ We&apos;ll let you know when your person&apos;s note arrives.</p>
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">While you wait…</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href="/app/love-notes" className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 transition hover:bg-amber-50 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100">
              Leave a love note
            </Link>
            <Link href="/app/games" className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 transition hover:bg-amber-50 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100">
              Play a game
            </Link>
            <Link href="/app/reassurance" className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 transition hover:bg-amber-50 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100">
              Check your mood
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Your reflections</p>
            <div className="mt-3 space-y-2 text-sm text-stone-700 dark:text-stone-200">
              {(mine ?? []).map((r) => (
                <p key={r.step_index}><span className="font-semibold text-stone-900 dark:text-stone-100">Step {r.step_index}:</span> {r.response_text}</p>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Partner reflections</p>
            <div className="mt-3 space-y-2 text-sm text-stone-700 dark:text-stone-200">
              {(partnerRows ?? []).map((r) => (
                <p key={r.step_index}><span className="font-semibold text-stone-900 dark:text-stone-100">Step {r.step_index}:</span> {r.response_text}</p>
              ))}
            </div>
          </div>
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-900 md:col-span-2">You both showed up for each other today.</p>
        </div>
      )}
    </section>
  );
}
