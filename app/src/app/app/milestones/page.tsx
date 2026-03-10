import { createClient } from "@/lib/supabase/server";
import { getMe, getMyCouple } from "@/lib/ours";

interface Milestone {
  title: string;
  value: string;
  description: string;
  achieved: boolean;
  icon: string;
}

export default async function MilestonesPage() {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();

  if (!user || !couple) return <p className="text-sm text-stone-600">Set up your couple first.</p>;

  const { count: unlockedSessions } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("couple_id", couple.id)
    .eq("status", "unlocked");

  const { count: totalNotes } = await supabase
    .from("love_notes")
    .select("*", { count: "exact", head: true })
    .eq("couple_id", couple.id);

  const { count: totalDrawings } = await supabase
    .from("drawings")
    .select("*", { count: "exact", head: true })
    .eq("couple_id", couple.id);

  const { data: wyrAnswers } = await supabase
    .from("would_you_rather_answers")
    .select("question_id, user_id")
    .eq("couple_id", couple.id);

  const wyrQuestions = new Set<string>();
  const wyrByQ: Record<string, Set<string>> = {};
  for (const a of wyrAnswers ?? []) {
    if (!wyrByQ[a.question_id]) wyrByQ[a.question_id] = new Set();
    wyrByQ[a.question_id].add(a.user_id);
    if (wyrByQ[a.question_id].size >= 2) wyrQuestions.add(a.question_id);
  }

  const { data: totAnswers } = await supabase
    .from("this_or_that_answers")
    .select("question_id, user_id")
    .eq("couple_id", couple.id);

  const totQuestions = new Set<string>();
  const totByQ: Record<string, Set<string>> = {};
  for (const a of totAnswers ?? []) {
    if (!totByQ[a.question_id]) totByQ[a.question_id] = new Set();
    totByQ[a.question_id].add(a.user_id);
    if (totByQ[a.question_id].size >= 2) totQuestions.add(a.question_id);
  }

  const { count: journalCount } = await supabase
    .from("journal_entries")
    .select("*", { count: "exact", head: true })
    .eq("couple_id", couple.id);

  const { count: moodCount } = await supabase
    .from("moods")
    .select("*", { count: "exact", head: true })
    .eq("couple_id", couple.id);

  const sharedMoments = unlockedSessions ?? 0;
  const notes = totalNotes ?? 0;
  const drawings = totalDrawings ?? 0;
  const gamesPlayed = wyrQuestions.size + totQuestions.size;
  const journals = journalCount ?? 0;
  const moods = moodCount ?? 0;

  let daysTogether: number | null = null;
  if (couple.relationship_start_date) {
    const start = new Date(couple.relationship_start_date);
    daysTogether = Math.floor((Date.now() - start.getTime()) / 86400000);
  }

  const milestones: Milestone[] = [
    ...(daysTogether !== null
      ? [{
          title: "Days together",
          value: daysTogether.toLocaleString(),
          description: daysTogether >= 365
            ? `That's ${Math.floor(daysTogether / 365)} year${Math.floor(daysTogether / 365) > 1 ? "s" : ""} of choosing each other. Incredible.`
            : daysTogether >= 100
              ? "Triple digits. You've built something real."
              : daysTogether >= 30
                ? "A whole month and counting. You're in this."
                : "Every day you choose each other matters.",
          achieved: true,
          icon: "❤️",
        }]
      : [{
          title: "Days together",
          value: "Not set",
          description: "Add your relationship start date in Settings — it's a small thing, but it unlocks a beautiful way to see how far you've come.",
          achieved: false,
          icon: "❤️",
        }]),
    {
      title: "Shared moments",
      value: sharedMoments.toString(),
      description: sharedMoments === 0
        ? "Your first shared moment is waiting. Open a Daily Moment or Weekly Reset and show up for each other — that's all it takes."
        : sharedMoments >= 50
          ? "50+ moments of choosing to show up. That's extraordinary."
          : sharedMoments >= 10
            ? "Double digits! Every moment builds the foundation."
            : "You're building something beautiful, one moment at a time.",
      achieved: sharedMoments > 0,
      icon: "✨",
    },
    {
      title: "Love notes sent",
      value: notes.toString(),
      description: notes === 0
        ? "Leave your first note — even two words like \"miss you\" can make their whole day brighter."
        : notes >= 20
          ? "20+ notes exchanged. You keep each other close."
          : "Every note is a small reminder: I'm thinking of you.",
      achieved: notes > 0,
      icon: "💌",
    },
    {
      title: "Drawings shared",
      value: drawings.toString(),
      description: drawings === 0
        ? "It doesn't have to be pretty — head to Draw Together and make something silly, sweet, or meaningful. That's the fun part."
        : "Art doesn't have to be perfect — it just has to be yours.",
      achieved: drawings > 0,
      icon: "🎨",
    },
    {
      title: "Games played",
      value: gamesPlayed.toString(),
      description: gamesPlayed === 0
        ? "Play Would You Rather or This or That and discover something new about each other — you might be surprised how much you still have to learn."
        : gamesPlayed >= 30
          ? "30+ game answers! You know each other pretty well by now."
          : "Keep playing. You'll be surprised what you discover.",
      achieved: gamesPlayed > 0,
      icon: "🎮",
    },
    {
      title: "Journal entries",
      value: journals.toString(),
      description: journals === 0
        ? "Open the journal and write whatever's on your heart. It could be a favorite memory, a feeling, or something you've been meaning to say."
        : "Your shared story, written in your own words.",
      achieved: journals > 0,
      icon: "📖",
    },
    {
      title: "Mood check-ins",
      value: moods.toString(),
      description: moods === 0
        ? "Letting your partner know how you're feeling takes courage. Head to Reassurance and take that first step — they'll be glad you did."
        : "Checking in takes courage. You're doing great.",
      achieved: moods > 0,
      icon: "🌡️",
    },
  ];

  const achievedCount = milestones.filter((m) => m.achieved).length;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Milestones</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">A celebration of everything you&apos;ve built together. No pressure — just appreciation.</p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-stone-950 via-slate-900 to-slate-700 p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">Your journey</p>
        <p className="mt-2 text-3xl font-bold">{achievedCount} of {milestones.length}</p>
        <p className="mt-1 text-sm text-stone-200">milestones unlocked</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {milestones.map((m) => (
          <div
            key={m.title}
            className={`rounded-2xl border p-5 shadow-sm transition ${
              m.achieved
                ? "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
                : "border-dashed border-stone-300 bg-stone-50 opacity-70 dark:border-stone-600 dark:bg-stone-800/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{m.icon}</span>
              <div>
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{m.title}</p>
                <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{m.value}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{m.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
