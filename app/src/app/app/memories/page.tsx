import { createClient } from "@/lib/supabase/server";
import { getMe, getMyCouple, getPartnerId } from "@/lib/ours";

interface TimelineItem {
  type: "session" | "drawing" | "game" | "note";
  date: Date;
  title: string;
  subtitle: string;
  detail?: string;
  imageUrl?: string;
  matchResult?: "matched" | "different";
}

export default async function MemoriesPage() {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();

  if (!user || !couple) return <p className="text-sm text-stone-600">Set up your couple first.</p>;

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
    timeline.push({
      type: "session",
      date: new Date(dateStr),
      title: s.type === "daily" ? "Daily Moment" : "Weekly Reset",
      subtitle: `You both showed up${s.session_date ? ` on ${new Date(s.session_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : ""}.`,
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
          date: new Date(d.created_at),
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
          date: new Date(v.date),
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
          date: new Date(v.date),
          title: "This or That",
          subtitle: v.mine === v.theirs ? "Same wavelength!" : "You see things differently — and that's okay.",
          matchResult: v.mine === v.theirs ? "matched" : "different",
        });
      }
    }
  }

  const { data: notes } = await supabase.from("love_notes").select("message, created_at, from_user_id").eq("couple_id", couple.id).order("created_at", { ascending: false }).limit(20);

  for (const n of notes ?? []) {
    timeline.push({
      type: "note",
      date: new Date(n.created_at),
      title: n.from_user_id === user.id ? "Note you sent" : "Note from your partner",
      subtitle: `"${n.message.length > 80 ? n.message.slice(0, 80) + "..." : n.message}"`,
    });
  }

  timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

  const grouped: Record<string, TimelineItem[]> = {};
  for (const item of timeline) {
    const key = item.date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  const typeStyles: Record<string, { border: string; bg: string; icon: string }> = {
    session: { border: "border-emerald-200 dark:border-emerald-800", bg: "bg-emerald-50 dark:bg-emerald-950", icon: "💬" },
    drawing: { border: "border-violet-200 dark:border-violet-800", bg: "bg-violet-50 dark:bg-violet-950", icon: "🎨" },
    game: { border: "border-amber-200 dark:border-amber-800", bg: "bg-amber-50 dark:bg-amber-950", icon: "🎮" },
    note: { border: "border-rose-200 dark:border-rose-800", bg: "bg-rose-50 dark:bg-rose-950", icon: "💌" },
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Memories</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Everything you&apos;ve shared together, all in one place.</p>
      </div>

      {timeline.length === 0 && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 text-center dark:border-stone-700 dark:bg-stone-800">
          <p className="text-base font-medium text-stone-700 dark:text-stone-200">Your story starts here</p>
          <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">Every love note you send, every game you play, every moment you share — it all shows up here as your timeline together. Start with something small and watch your story grow.</p>
        </div>
      )}

      {Object.entries(grouped).map(([dateLabel, items]) => (
        <div key={dateLabel}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">{dateLabel}</p>
          <div className="space-y-3">
            {items.map((item, i) => {
              const style = typeStyles[item.type];
              return (
                <div key={`${dateLabel}-${i}`} className={`rounded-2xl border ${style.border} ${style.bg} p-4`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{style.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-stone-900 dark:text-stone-100">{item.title}</p>
                      <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-300">{item.subtitle}</p>
                      {item.matchResult && (
                        <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          item.matchResult === "matched"
                            ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
                            : "bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200"
                        }`}>
                          {item.matchResult === "matched" ? "Same choice" : "Different choices"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
