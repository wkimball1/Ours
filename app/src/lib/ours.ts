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
      timezone: "America/New_York",
      last_active_at: new Date().toISOString(),
    });
  } else {
    await supabase
      .from("profiles")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", user.id);
  }

  return user;
}

export async function getMyCouple() {
  const supabase = await createClient();
  const user = await getMe();
  if (!user) return null;

  const { data } = await supabase
    .from("couples")
    .select("*")
    .or(`member1.eq.${user.id},member2.eq.${user.id}`)
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getPartnerId(couple: { member1: string; member2: string | null }, userId: string) {
  if (!couple.member2) return null;
  return couple.member1 === userId ? couple.member2 : couple.member1;
}

export async function ensureDailySession(coupleId: string) {
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

  // Primary lookup by day index; fallback to any active daily set
  let { data: set } = await supabase
    .from("content_sets")
    .select("id")
    .eq("type", "daily")
    .eq("day_index", dayIndex)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (!set?.id) {
    const fallback = await supabase
      .from("content_sets")
      .select("id")
      .eq("type", "daily")
      .eq("is_active", true)
      .order("day_index", { ascending: true })
      .limit(1)
      .maybeSingle();
    set = fallback.data ?? null;
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

export async function ensureWeeklySession(coupleId: string) {
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

  const { data: set } = await supabase
    .from("content_sets")
    .select("id")
    .eq("type", "weekly")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

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

export async function refreshSessionUnlock(sessionId: string, couple: { member1: string; member2: string | null }) {
  if (!couple.member2) return;
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("id, content_set_id")
    .eq("id", sessionId)
    .single();
  if (!session) return;

  const { data: promptRows } = await supabase
    .from("prompts")
    .select("step_index")
    .eq("content_set_id", session.content_set_id);

  const required = promptRows?.length ?? 0;
  if (!required) return;

  const { count: c1 } = await supabase
    .from("responses")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("user_id", couple.member1);

  const { count: c2 } = await supabase
    .from("responses")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("user_id", couple.member2);

  if ((c1 ?? 0) >= required && (c2 ?? 0) >= required) {
    await supabase.from("sessions").update({ status: "unlocked" }).eq("id", sessionId);
  }
}
