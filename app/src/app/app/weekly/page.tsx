import { createClient } from "@/lib/supabase/server";
import { ensureWeeklySession, getMyData, getPartnerId } from "@/lib/ours";
import { SessionForm } from "@/components/session-form";
import { SessionRefresher } from "@/components/session-refresher";

export default async function WeeklyPage() {
  const supabase = await createClient();
  const { user, couple } = await getMyData();
  if (!user || !couple) return <p>Set up your couple first.</p>;

  const session = await ensureWeeklySession(couple.id);
  if (!session) return <p className="text-sm text-stone-600 dark:text-stone-400">This week&apos;s check-in is being prepared. Check back soon!</p>;

  const partnerId = getPartnerId(couple, user.id);

  const [
    { data: prompts },
    { data: contentSet },
    { data: partnerProfile },
    { count: resetNumber },
  ] = await Promise.all([
    supabase.from("prompts").select("step_index, prompt_text").eq("content_set_id", session.content_set_id).order("step_index"),
    supabase.from("content_sets").select("theme").eq("id", session.content_set_id).single(),
    partnerId ? supabase.from("profiles").select("first_name").eq("id", partnerId).single() : Promise.resolve({ data: null }),
    supabase.from("sessions").select("*", { count: "exact", head: true }).eq("couple_id", couple.id).eq("type", "weekly"),
  ]);

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
  const partnerName = partnerProfile?.first_name || "your person";

  // Format week range: "Week of March 16"
  const weekStart = new Date(session.week_start_date + "T00:00:00");
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekLabel = `Week of ${weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;

  const statusLine =
    session.status === "unlocked"
      ? `You and ${partnerName} both completed this week's reset ✓`
      : mineCount >= totalPrompts && totalPrompts > 0
      ? `Your answers are in ✨ Waiting for ${partnerName}…`
      : mineCount > 0
      ? `${mineCount} of ${totalPrompts} answered — keep going`
      : null;

  return (
    <section className="space-y-5">
      <SessionRefresher sessionStatus={session.status} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-stone-400 dark:text-stone-500">{weekLabel}</p>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Weekly reset</h2>
          {contentSet?.theme && (
            <p className="text-sm italic text-stone-500 dark:text-stone-400">&ldquo;{contentSet.theme}&rdquo;</p>
          )}
        </div>
        {(resetNumber ?? 0) > 0 && (
          <div className="shrink-0 text-right">
            <p className="text-2xl font-semibold tabular-nums text-stone-900 dark:text-stone-100">#{resetNumber}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500">resets</p>
          </div>
        )}
      </div>

      {/* Warm status line */}
      {statusLine && (
        <p className={`text-sm font-medium ${
          session.status === "unlocked"
            ? "text-emerald-700 dark:text-emerald-400"
            : mineCount >= totalPrompts
            ? "text-amber-700 dark:text-amber-400"
            : "text-stone-500 dark:text-stone-400"
        }`}>
          {statusLine}
        </p>
      )}

      <SessionForm sessionId={session.id} prompts={prompts ?? []} existing={existing} />

      {session.status === "unlocked" && (
        <div className="grid gap-4 md:grid-cols-2" style={{ animation: "fadeIn 0.4s ease both" }}>
          <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Your reset</p>
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
            <p className="font-semibold text-stone-900 dark:text-stone-100">{partnerName}&apos;s reset</p>
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
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100 md:col-span-2">
            Reset complete — you both made room for each other this week.
          </p>
        </div>
      )}
    </section>
  );
}
