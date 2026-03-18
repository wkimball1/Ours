import { createClient } from "@/lib/supabase/server";
import { getMyData, getPartnerId, getSubscriptionInfo } from "@/lib/ours";
import { MemoriesTimeline, type TimelineItem } from "@/components/memories-timeline";
import { PaywallGate } from "@/components/paywall-gate";

export default async function MemoriesPage() {
  const supabase = await createClient();
  const { user, couple } = await getMyData();

  if (!user || !couple) return <p className="text-sm text-stone-600">Set up your couple first.</p>;

  const { premium } = await getSubscriptionInfo(couple.id);
  if (!premium) return <PaywallGate feature="Memories" />;

  const timeline: TimelineItem[] = [];

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, type, session_date, week_start_date, status, created_at")
    .eq("couple_id", couple.id)
    .eq("status", "unlocked")
    .order("created_at", { ascending: false })
    .limit(30);

  for (const s of sessions ?? []) {
    const dateStr = s.session_date || s.week_start_date || s.created_at;
    const label = s.session_date
      ? ` on ${new Date(s.session_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
      : "";
    timeline.push({
      type: "session",
      date: dateStr,
      title: s.type === "daily" ? "Daily Moment" : "Weekly Reset",
      subtitle: `You both showed up${label}.`,
    });
  }

  const partnerId = getPartnerId(couple, user.id);

  if (partnerId) {
    const [{ data: myDrawings }, { data: partnerDrawings }, { data: wyrAnswers }, { data: totAnswers }] = await Promise.all([
      supabase.from("drawings").select("session_date, drawing_data, created_at").eq("couple_id", couple.id).eq("user_id", user.id).order("session_date", { ascending: false }).limit(20),
      supabase.from("drawings").select("session_date, drawing_data").eq("couple_id", couple.id).eq("user_id", partnerId).order("session_date", { ascending: false }).limit(20),
      supabase.from("would_you_rather_answers").select("question_id, choice, created_at, user_id").eq("couple_id", couple.id).order("created_at", { ascending: false }).limit(60),
      supabase.from("this_or_that_answers").select("question_id, choice, created_at, user_id").eq("couple_id", couple.id).order("created_at", { ascending: false }).limit(60),
    ]);

    const partnerDrawingMap = Object.fromEntries(
      (partnerDrawings ?? []).map((d) => [d.session_date, d.drawing_data])
    );

    for (const d of myDrawings ?? []) {
      if (partnerDrawingMap[d.session_date]) {
        timeline.push({
          type: "drawing",
          date: d.created_at,
          title: "Draw Together",
          subtitle: `Both drew on ${new Date(d.session_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}.`,
          imageUrl: d.drawing_data,
        });
      }
    }

    const wyrByQ: Record<string, { mine?: string; theirs?: string; date: string }> = {};
    for (const a of wyrAnswers ?? []) {
      if (!wyrByQ[a.question_id]) wyrByQ[a.question_id] = { date: a.created_at };
      if (a.user_id === user.id) wyrByQ[a.question_id].mine = a.choice;
      else wyrByQ[a.question_id].theirs = a.choice;
    }

    for (const [, v] of Object.entries(wyrByQ)) {
      if (v.mine && v.theirs) {
        timeline.push({
          type: "game",
          date: v.date,
          title: "Would You Rather",
          subtitle: v.mine === v.theirs ? "You picked the same thing!" : "Different picks — opposites attract.",
          matchResult: v.mine === v.theirs ? "matched" : "different",
        });
      }
    }

    const totByQ: Record<string, { mine?: string; theirs?: string; date: string }> = {};
    for (const a of totAnswers ?? []) {
      if (!totByQ[a.question_id]) totByQ[a.question_id] = { date: a.created_at };
      if (a.user_id === user.id) totByQ[a.question_id].mine = a.choice;
      else totByQ[a.question_id].theirs = a.choice;
    }

    for (const [, v] of Object.entries(totByQ)) {
      if (v.mine && v.theirs) {
        timeline.push({
          type: "game",
          date: v.date,
          title: "This or That",
          subtitle: v.mine === v.theirs ? "Same wavelength!" : "You see things differently — and that's okay.",
          matchResult: v.mine === v.theirs ? "matched" : "different",
        });
      }
    }
  }

  const { data: notes } = await supabase
    .from("love_notes")
    .select("message, created_at, from_user_id")
    .eq("couple_id", couple.id)
    .order("created_at", { ascending: false })
    .limit(20);

  for (const n of notes ?? []) {
    timeline.push({
      type: "note",
      date: n.created_at,
      title: n.from_user_id === user.id ? "Note you sent" : "Note from your partner",
      subtitle: `"${n.message.length > 80 ? n.message.slice(0, 80) + "…" : n.message}"`,
    });
  }

  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Memories</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Everything you&apos;ve shared together, all in one place.</p>
      </div>

      {timeline.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-stone-50 p-6 text-center dark:bg-stone-800/50">
          <p className="text-3xl">🎞️</p>
          <p className="mt-3 text-base font-semibold text-stone-800 dark:text-stone-100">Your story starts here</p>
          <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">Every love note, game, drawing, and daily moment you share shows up here as your timeline together. Start anywhere — it all counts.</p>
        </div>
      ) : (
        <MemoriesTimeline items={timeline} />
      )}
    </section>
  );
}
