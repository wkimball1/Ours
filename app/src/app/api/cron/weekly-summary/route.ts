import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWeeklySummaryEmail } from "@/lib/email";

// Trigger weekly (e.g. every Sunday evening).
// Set CRON_SECRET env var and call with: Authorization: Bearer <CRON_SECRET>
export async function GET(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Admin client unavailable" }, { status: 500 });

  // Week window: last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString();

  // Fetch all couples that have at least one member active in the last 30 days
  const { data: couples } = await admin
    .from("couples")
    .select("id, member1, member2")
    .not("member2", "is", null);

  if (!couples?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;

  for (const couple of couples) {
    const memberIds = [couple.member1, couple.member2].filter(Boolean) as string[];

    const [
      { count: sessions },
      { count: notes },
      { data: wyrAnswers },
      { data: totAnswers },
      { count: journals },
    ] = await Promise.all([
      admin
        .from("sessions")
        .select("*", { count: "exact", head: true })
        .eq("couple_id", couple.id)
        .eq("status", "unlocked")
        .gte("updated_at", weekAgoStr),
      admin
        .from("love_notes")
        .select("*", { count: "exact", head: true })
        .eq("couple_id", couple.id)
        .gte("created_at", weekAgoStr),
      admin
        .from("would_you_rather_answers")
        .select("question_id, user_id")
        .eq("couple_id", couple.id)
        .gte("created_at", weekAgoStr),
      admin
        .from("this_or_that_answers")
        .select("question_id, user_id")
        .eq("couple_id", couple.id)
        .gte("created_at", weekAgoStr),
      admin
        .from("journal_entries")
        .select("*", { count: "exact", head: true })
        .eq("couple_id", couple.id)
        .gte("created_at", weekAgoStr),
    ]);

    // Count unique questions where both members answered this week
    const wyrByQ: Record<string, Set<string>> = {};
    for (const a of wyrAnswers ?? []) {
      if (!wyrByQ[a.question_id]) wyrByQ[a.question_id] = new Set();
      wyrByQ[a.question_id].add(a.user_id);
    }
    const totByQ: Record<string, Set<string>> = {};
    for (const a of totAnswers ?? []) {
      if (!totByQ[a.question_id]) totByQ[a.question_id] = new Set();
      totByQ[a.question_id].add(a.user_id);
    }
    const gamesCount =
      Object.values(wyrByQ).filter((s) => s.size >= 2).length +
      Object.values(totByQ).filter((s) => s.size >= 2).length;

    const stats = {
      sessions: sessions ?? 0,
      notes: notes ?? 0,
      games: gamesCount,
      journal: journals ?? 0,
    };

    const total = stats.sessions + stats.notes + stats.games + stats.journal;
    if (total === 0) continue; // Nothing to report

    const { data: profiles } = await admin
      .from("profiles")
      .select("id, first_name")
      .in("id", memberIds);

    const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.first_name || "Your partner"]));

    for (const memberId of memberIds) {
      const partnerId = memberIds.find((id) => id !== memberId);
      const partnerName = partnerId ? nameMap[partnerId] : "Your partner";
      void sendWeeklySummaryEmail(memberId, partnerName, stats);
      sent++;
    }
  }

  return NextResponse.json({ sent });
}
