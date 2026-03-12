import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMe, getMyCouple } from "@/lib/ours";

export async function GET() {
  const user = await getMe();
  const couple = await getMyCouple();
  if (!user || !couple) return NextResponse.json({ count: 0, unreadNotes: 0, notifications: [] });

  const supabase = await createClient();

  const [{ data: notifications }, { count: unreadNotes }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, type, payload, created_at, from_user_id")
      .eq("to_user_id", user.id)
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("love_notes")
      .select("*", { count: "exact", head: true })
      .eq("to_user_id", user.id)
      .eq("couple_id", couple.id)
      .is("read_at", null),
  ]);

  const items = notifications ?? [];
  const notes = unreadNotes ?? 0;

  return NextResponse.json({
    count: items.length + notes,
    unreadNotes: notes,
    notifications: items,
  });
}

export async function POST() {
  const user = await getMe();
  if (!user) return NextResponse.json({ ok: false });

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("to_user_id", user.id)
    .is("read_at", null);

  return NextResponse.json({ ok: true });
}
