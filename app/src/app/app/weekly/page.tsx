import { createClient } from "@/lib/supabase/server";
import { ensureWeeklySession, getMe, getMyCouple, getPartnerId } from "@/lib/ours";
import { SessionForm } from "@/components/session-form";

export default async function WeeklyPage() {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();
  if (!user || !couple) return <p>Set up your couple first.</p>;

  const session = await ensureWeeklySession(couple.id);
  if (!session) return <p className="text-sm text-stone-600">This week&apos;s check-in is being prepared. Check back soon!</p>;

  const partnerId = await getPartnerId(couple, user.id);

  const { data: prompts } = await supabase
    .from("prompts")
    .select("step_index, prompt_text")
    .eq("content_set_id", session.content_set_id)
    .order("step_index");

  const { data: mine } = await supabase
    .from("responses")
    .select("step_index, response_text")
    .eq("session_id", session.id)
    .eq("user_id", user.id);

  const existing = Object.fromEntries((mine ?? []).map((r) => [r.step_index, r.response_text]));

  const { data: partnerRows } = partnerId
    ? await supabase
        .from("responses")
        .select("step_index, response_text")
        .eq("session_id", session.id)
        .eq("user_id", partnerId)
        .order("step_index")
    : { data: [] };

  const totalPrompts = prompts?.length ?? 6;
  const mineCount = (mine ?? []).filter((r) => (r.response_text ?? "").trim().length > 0).length;
  const partnerCount = (partnerRows ?? []).filter((r) => (r.response_text ?? "").trim().length > 0).length;

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Weekly reset</h2>
        <p className="text-sm text-stone-600 dark:text-stone-300">A gentle reset for your relationship, any day that works this week.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <p className="rounded-xl border border-stone-200 bg-white p-3 text-sm text-stone-700 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
          Status: <strong className="font-semibold text-stone-900 dark:text-stone-100">{session.status}</strong>
        </p>
        <p className="rounded-xl border border-stone-200 bg-white p-3 text-sm text-stone-700 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
          You: <strong className="text-stone-900 dark:text-stone-100">{mineCount}/{totalPrompts}</strong>
        </p>
        <p className="rounded-xl border border-stone-200 bg-white p-3 text-sm text-stone-700 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
          Partner: <strong className="text-stone-900 dark:text-stone-100">{partnerCount}/{totalPrompts}</strong>
        </p>
      </div>

      <SessionForm sessionId={session.id} prompts={prompts ?? []} existing={existing} />

      {session.status === "unlocked" && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Your weekly reset</p>
            <div className="mt-3 space-y-2 text-sm text-stone-700 dark:text-stone-200">
              {(mine ?? []).map((r) => (
                <p key={r.step_index}><span className="font-semibold text-stone-900 dark:text-stone-100">Step {r.step_index}:</span> {r.response_text}</p>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Partner weekly reset</p>
            <div className="mt-3 space-y-2 text-sm text-stone-700 dark:text-stone-200">
              {(partnerRows ?? []).map((r) => (
                <p key={r.step_index}><span className="font-semibold text-stone-900 dark:text-stone-100">Step {r.step_index}:</span> {r.response_text}</p>
              ))}
            </div>
          </div>
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-900 md:col-span-2">Reset complete — you both made room for each other this week.</p>
        </div>
      )}
    </section>
  );
}
