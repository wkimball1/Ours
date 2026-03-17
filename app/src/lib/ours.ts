import { createClient } from "@/lib/supabase/server";

export async function getMe() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function ensureProfile() {
  const supabase = await createClient();
  const user = await getMe();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    await supabase.from("profiles").insert({
      id: user.id,
      first_name: user.user_metadata?.first_name ?? "",
      timezone: user.user_metadata?.timezone ?? "America/New_York",
      last_active_at: new Date().toISOString(),
    });
  } else {
    const lastActive = profile.last_active_at ? new Date(profile.last_active_at).getTime() : 0;
    if (Date.now() - lastActive > 5 * 60 * 1000) {
      await supabase
        .from("profiles")
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", user.id);
    }
  }

  return user;
}

export async function getMyCouple(userId?: string) {
  const supabase = await createClient();
  const id = userId ?? (await getMe())?.id;
  if (!id) return null;

  const { data } = await supabase
    .from("couples")
    .select("*")
    .or(`member1.eq.${id},member2.eq.${id}`)
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getMyData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, couple: null };

  const { data: couple } = await supabase
    .from("couples")
    .select("*")
    .or(`member1.eq.${user.id},member2.eq.${user.id}`)
    .limit(1)
    .maybeSingle();

  return { user, couple };
}

export function getDayOfYear(): number {
  return Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
}

export function getPartnerId(couple: { member1: string; member2: string | null }, userId: string) {
  if (!couple.member2) return null;
  return couple.member1 === userId ? couple.member2 : couple.member1;
}

// Returns the 1-indexed week number for a couple based on their joined_date.
// Uses UTC calendar dates on both sides to avoid timezone drift.
function coupleWeekNumber(joinedDate: string): number {
  const msPerDay = 86_400_000;
  const joined = new Date(joinedDate + "T00:00:00Z").getTime();
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z").getTime();
  const daysSinceJoined = Math.floor((today - joined) / msPerDay);
  return Math.floor(daysSinceJoined / 7) + 1;
}

export async function ensureDailySession(coupleId: string, coupleJoinedDate: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const dow = new Date().getDay(); // 0-6, Sunday=0
  const dayIndex = ((dow + 6) % 7) + 1; // Monday=1

  const { data: existing } = await supabase
    .from("sessions")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("type", "daily")
    .eq("session_date", today)
    .maybeSingle();

  if (existing) return existing;

  // Determine the highest week_number available so we can cycle gracefully
  const { data: maxRow } = await supabase
    .from("content_sets")
    .select("week_number")
    .eq("type", "daily")
    .eq("is_active", true)
    .order("week_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const maxWeek = maxRow?.week_number ?? 1;
  const rawWeek = coupleWeekNumber(coupleJoinedDate);
  const effectiveWeek = ((rawWeek - 1) % maxWeek) + 1; // 1-indexed cycle

  // Primary lookup: exact week + day
  let { data: set } = await supabase
    .from("content_sets")
    .select("id")
    .eq("type", "daily")
    .eq("day_index", dayIndex)
    .eq("week_number", effectiveWeek)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  // Fallback: same week, any day
  if (!set?.id) {
    const fallback = await supabase
      .from("content_sets")
      .select("id")
      .eq("type", "daily")
      .eq("week_number", effectiveWeek)
      .eq("is_active", true)
      .order("day_index", { ascending: true })
      .limit(1)
      .maybeSingle();
    set = fallback.data ?? null;
  }

  // Last resort: any active daily set
  if (!set?.id) {
    const lastResort = await supabase
      .from("content_sets")
      .select("id")
      .eq("type", "daily")
      .eq("is_active", true)
      .order("week_number", { ascending: true })
      .order("day_index", { ascending: true })
      .limit(1)
      .maybeSingle();
    set = lastResort.data ?? null;
  }

  if (!set?.id) return null;

  const { data: created } = await supabase
    .from("sessions")
    .insert({
      couple_id: coupleId,
      type: "daily",
      session_date: today,
      content_set_id: set.id,
      status: "open",
    })
    .select("*")
    .single();

  return created;
}

export async function ensureWeeklySession(coupleId: string, coupleJoinedDate: string) {
  const supabase = await createClient();
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  const weekStart = monday.toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from("sessions")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("type", "weekly")
    .eq("week_start_date", weekStart)
    .maybeSingle();

  if (existing) return existing;

  // Determine the highest week_number available for weekly sets
  const { data: maxRow } = await supabase
    .from("content_sets")
    .select("week_number")
    .eq("type", "weekly")
    .eq("is_active", true)
    .order("week_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const maxWeek = maxRow?.week_number ?? 1;
  const rawWeek = coupleWeekNumber(coupleJoinedDate);
  const effectiveWeek = ((rawWeek - 1) % maxWeek) + 1;

  // Primary lookup: matching week
  let { data: set } = await supabase
    .from("content_sets")
    .select("id")
    .eq("type", "weekly")
    .eq("week_number", effectiveWeek)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  // Fallback: any active weekly set
  if (!set?.id) {
    const fallback = await supabase
      .from("content_sets")
      .select("id")
      .eq("type", "weekly")
      .eq("is_active", true)
      .order("week_number", { ascending: true })
      .limit(1)
      .maybeSingle();
    set = fallback.data ?? null;
  }

  if (!set?.id) return null;

  const { data: created } = await supabase
    .from("sessions")
    .insert({
      couple_id: coupleId,
      type: "weekly",
      week_start_date: weekStart,
      content_set_id: set.id,
      status: "open",
    })
    .select("*")
    .single();

  return created;
}

export async function refreshSessionUnlock(sessionId: string, couple: { member1: string; member2: string | null }): Promise<boolean> {
  if (!couple.member2) return false;
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("id, content_set_id, status, type")
    .eq("id", sessionId)
    .single();
  if (!session) return false;
  if (session.status === "unlocked") return false;

  const { data: promptRows } = await supabase
    .from("prompts")
    .select("step_index")
    .eq("content_set_id", session.content_set_id);

  const required = promptRows?.length ?? 0;
  if (!required) return false;

  const [{ count: c1 }, { count: c2 }] = await Promise.all([
    supabase
      .from("responses")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("user_id", couple.member1),
    supabase
      .from("responses")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("user_id", couple.member2),
  ]);

  if ((c1 ?? 0) >= required && (c2 ?? 0) >= required) {
    await supabase.from("sessions").update({ status: "unlocked" }).eq("id", sessionId);
    return true;
  }
  return false;
}
