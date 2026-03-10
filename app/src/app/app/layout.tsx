import { AppShell } from "@/components/app-shell";
import { ensureProfile, getMyCouple } from "@/lib/ours";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await ensureProfile();
  const supabase = await createClient();
  const couple = await getMyCouple();

  let unreadNotes = 0;
  if (user && couple) {
    const { count } = await supabase
      .from("love_notes")
      .select("*", { count: "exact", head: true })
      .eq("to_user_id", user.id)
      .eq("couple_id", couple.id)
      .is("read_at", null);
    unreadNotes = count ?? 0;
  }

  return <AppShell unreadNotes={unreadNotes}>{children}</AppShell>;
}
