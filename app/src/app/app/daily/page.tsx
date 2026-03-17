import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ensureDailySession, getMyData, getPartnerId } from "@/lib/ours";
import { SessionForm } from "@/components/session-form";
import { SessionRefresher } from "@/components/session-refresher";

export default async function DailyPage() {
  const supabase = await createClient();
  const { user, couple } = await getMyData();

  if (!user || !couple) return <p>Set up your couple first.</p>;

  const session = await ensureDailySession(couple.id);
  if (!session) return <p className="text-sm text-stone-600 dark:text-stone-400">Today&apos;s daily prompts are being prepared. Check back in a little while!</p>;

  const partnerId = getPartnerId(couple, user.id);

  const [
    { data: prompts },
    { data: contentSet },
    { data: partnerProfile },
    { count: momentNumber },
  ] = await Promise.all([
    supabase.from("prompts").select("step_index, prompt_text").eq("content_set_id", session.content_set_id).order("step_index"),
    supabase.from("content_sets").select("theme").eq("id", session.content_set_id).single(),
    partnerId ? supabase.from("profiles").select("first_name").eq("id", partnerId).single() : Promise.resolve({ data: null }),
    supabase.from("sessions").select("*", { count: "exact", head: true }).eq("couple_id", couple.id).eq("type", "daily"),
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

  // Format the session date server-side
  const sessionDate = new Date(session.session_date + "T00:00:00");
  const dateLabel = sessionDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // Warm single-line status replacing the clinical 3-card grid
  const statusLine =
    session.status === "unlocked"
      ? `You and ${partnerName} both showed up today ✓`
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
          <p className="text-xs font-medium text-stone-400 dark:text-stone-500">{dateLabel}</p>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Today&apos;s moment</h2>
          {contentSet?.theme && (
            <p className="text-sm italic text-stone-500 dark:text-stone-400">&ldquo;{contentSet.theme}&rdquo;</p>
          )}
        </div>
        {(momentNumber ?? 0) > 0 && (
          <div className="shrink-0 text-right">
            <p className="text-2xl font-semibold tabular-nums text-stone-900 dark:text-stone-100">#{momentNumber}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500">together</p>
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

      <SessionForm sessionId={session.id} prompts={prompts ?? []} existing={existing} theme={contentSet?.theme ?? undefined} />

      {session.status !== "unlocked" && mineCount >= totalPrompts && totalPrompts > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Your note is in ✨ We&apos;ll let you know when {partnerName}&apos;s note arrives.</p>
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
        <div
          className="grid gap-4 md:grid-cols-2"
          style={session.status === "unlocked" ? { animation: "fadeIn 0.4s ease both" } : undefined}
        >
          <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Your reflections</p>
            <div className="mt-3 space-y-4 text-sm text-stone-700 dark:text-stone-200">
              {(mine ?? []).map((r) => (
                <div
                  key={r.step_index}
                  className="unlock-card space-y-1"
                  style={session.status === "unlocked" ? { animationDelay: `${r.step_index * 120}ms` } : undefined}
                >
                  {promptMap[r.step_index] && <p className="text-xs text-stone-400 dark:text-stone-500">{promptMap[r.step_index]}</p>}
                  <p>{r.response_text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
            <p className="font-semibold text-stone-900 dark:text-stone-100">{partnerName}&apos;s reflections</p>
            <div className="mt-3 space-y-4 text-sm text-stone-700 dark:text-stone-200">
              {(partnerRows ?? []).map((r) => (
                <div
                  key={r.step_index}
                  className="unlock-card space-y-1"
                  style={session.status === "unlocked" ? { animationDelay: `${(r.step_index + totalPrompts) * 120}ms` } : undefined}
                >
                  {promptMap[r.step_index] && <p className="text-xs text-stone-400 dark:text-stone-500">{promptMap[r.step_index]}</p>}
                  <p>{r.response_text}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100 md:col-span-2">
            You both showed up for each other today.
          </p>
        </div>
      )}
    </section>
  );
}
