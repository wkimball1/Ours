import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAnniversaryEmail } from "@/lib/email";

// Triggered daily by a cron job (e.g. Vercel cron or external scheduler).
// Set CRON_SECRET env var and call with: Authorization: Bearer <CRON_SECRET>
export async function GET(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Admin client unavailable" }, { status: 500 });

  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const monthDay = `${mm}-${dd}`; // e.g. "03-15"

  // Find couples whose relationship_start_date falls on today's month/day
  const { data: couples } = await admin
    .from("couples")
    .select("id, member1, member2, relationship_start_date")
    .not("relationship_start_date", "is", null)
    .like("relationship_start_date", `%-${monthDay}`);

  if (!couples?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;

  for (const couple of couples) {
    const startYear = new Date(couple.relationship_start_date).getFullYear();
    const years = today.getFullYear() - startYear;
    if (years <= 0) continue; // Skip same year (not an anniversary yet)

    // Get partner names
    const memberIds = [couple.member1, couple.member2].filter(Boolean) as string[];
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, first_name")
      .in("id", memberIds);

    const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.first_name || "Your partner"]));

    for (const memberId of memberIds) {
      const partnerId = memberIds.find((id) => id !== memberId);
      const partnerName = partnerId ? nameMap[partnerId] : "Your partner";
      void sendAnniversaryEmail(memberId, partnerName, years);
      sent++;
    }
  }

  return NextResponse.json({ sent });
}
