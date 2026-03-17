import { createClient } from "@/lib/supabase/server";
import { ensureWeeklySession, getMyData, getPartnerId } from "@/lib/ours";
import { SessionForm } from "@/components/session-form";
import { SessionRefresher } from "@/components/session-refresher";

export default async function WeeklyPage() {
  const supabase = await createClient();
  const { user, couple } = await getMyData();
  if (!user || !couple) return <p>Set up your couple first.</p>;

  const session = await ensureWeeklySession(couple.id);
  if (!session) return <p className="text-sm text-stone-600">This week&apos;s check-in is being prepared. Check back soon!</p>;

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
  const promptMap = Object.fromEntries((prompts ?? []).map((p) => [p.step_index, p.prompt_text]));

  const totalPrompts = prompts?.length ?? 0;
  const mineCount = (mine ?? []).filter((r) => (r.response_text ?? "").trim().length > 0).length;
  const partnerCount = (partnerRows ?? []).filter((r) => (r.response_text ?? "").trim().length > 0).length;

  return (
    <section className="space-y-5">
      <SessionRefresher sessionStatus={session.status} />
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Weekly reset</h2>
          <span className="text-xs font-medium text-stone-400 dark:text-stone-500">~8 min</span>
        </div>
        <p className="text-sm text-stone-600 dark:text-stone-300">A gentle reset for your relationship, any day that works this week.</p>
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

      {session.status === "unlocked" && (
        <div className="grid gap-4 md:grid-cols-2" style={{ animation: "fadeIn 0.4s ease both" }}>
          <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Your weekly reset</p>
            <div className="mt-3 space-y-4 text-sm text-stone-700 dark:text-stone-200">
              {(mine ?? []).map((r) => (
                <div
                  key={r.step_index}
                  className="unlock-card space-y-1"
                  style={{ animationDelay: `${r.step_index * 100}ms` }}
                >
                  {promptMap[r.step_index] && <p className="text-xs text-stone-400 dark:text-stone-500">{promptMap[r.step_index]}</p>}
                  <p>{r.response_text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Partner weekly reset</p>
            <div className="mt-3 space-y-4 text-sm text-stone-700 dark:text-stone-200">
              {(partnerRows ?? []).map((r) => (
                <div
                  key={r.step_index}
                  className="unlock-card space-y-1"
                  style={{ animationDelay: `${(r.step_index + totalPrompts) * 100}ms` }}
                >
                  {promptMap[r.step_index] && <p className="text-xs text-stone-400 dark:text-stone-500">{promptMap[r.step_index]}</p>}
                  <p>{r.response_text}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-900 md:col-span-2">Reset complete — you both made room for each other this week.</p>
        </div>
      )}
    </section>
  );
}
