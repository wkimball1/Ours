import { Resend } from "resend";
import { createAdminClient } from "./supabase/admin";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL ?? "Ours <noreply@getours.app>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

async function getUserEmail(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin.auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}

async function send(to: string, subject: string, html: string) {
  if (!resend) return;
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] send failed", err);
  }
}

function wrap(body: string) {
  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px 20px;color:#1c1917;background:#fafaf9">
${body}
<p style="margin-top:32px;font-size:12px;color:#78716c">You're receiving this because you use Ours. <a href="${SITE_URL}/app/settings" style="color:#78716c">Manage preferences</a></p>
</body></html>`;
}

function btn(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#1c1917;color:#fff;border-radius:12px;text-decoration:none;font-size:14px;font-weight:600">${label}</a>`;
}

export async function sendLoveNoteEmail(toUserId: string, fromName: string) {
  if (!(await checkEmailPref(toUserId, "email_love_note"))) return;
  const email = await getUserEmail(toUserId);
  if (!email) return;
  await send(
    email,
    `${fromName} left you a love note 💌`,
    wrap(`
      <h2 style="font-size:22px;font-weight:600;margin:0">You have a new love note</h2>
      <p style="margin-top:8px;color:#57534e">${fromName} left you something. Open the app to read it.</p>
      ${btn(`${SITE_URL}/app/love-notes`, "Read your note")}
    `)
  );
}

export async function sendReassuranceRequestEmail(toUserId: string, fromName: string) {
  if (!(await checkEmailPref(toUserId, "email_reassurance"))) return;
  const email = await getUserEmail(toUserId);
  if (!email) return;
  await send(
    email,
    `${fromName} could use your care right now`,
    wrap(`
      <h2 style="font-size:22px;font-weight:600;margin:0">${fromName} asked for a little extra care</h2>
      <p style="margin-top:8px;color:#57534e">Sometimes a few words go a long way. When you have a moment, head over to Reassurance.</p>
      ${btn(`${SITE_URL}/app/reassurance`, "Send some care")}
    `)
  );
}

export async function sendReassuranceMessageEmail(toUserId: string, fromName: string, message: string) {
  const email = await getUserEmail(toUserId);
  if (!email) return;
  await send(
    email,
    `A note from ${fromName} 🤍`,
    wrap(`
      <h2 style="font-size:22px;font-weight:600;margin:0">A reassurance note from ${fromName}</h2>
      <blockquote style="margin:16px 0;padding:14px 18px;background:#f5f5f4;border-radius:12px;border-left:3px solid #d6d3d1;font-size:15px;color:#292524">${message}</blockquote>
      ${btn(`${SITE_URL}/app/reassurance`, "Open Ours")}
    `)
  );
}

export async function checkEmailPref(userId: string, key: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return true;
  const { data } = await admin.from("profiles").select("notification_prefs").eq("id", userId).single();
  const prefs = (data?.notification_prefs ?? {}) as Record<string, boolean>;
  // Default true if key is absent
  return prefs[key] !== false;
}

export async function sendAnniversaryEmail(toUserId: string, partnerName: string, years: number) {
  const email = await getUserEmail(toUserId);
  if (!email) return;
  const label = years === 1 ? "1 year" : `${years} years`;
  await send(
    email,
    `Happy anniversary — ${label} together 🎉`,
    wrap(`
      <h2 style="font-size:22px;font-weight:600;margin:0">Happy anniversary! 🎊</h2>
      <p style="margin-top:8px;color:#57534e">You and ${partnerName} have been together for <strong>${label}</strong>. That's something worth celebrating.</p>
      <p style="margin-top:8px;color:#57534e">Open Ours and share a moment together today.</p>
      ${btn(`${SITE_URL}/app`, "Celebrate together")}
    `)
  );
}

export async function sendWeeklySummaryEmail(
  toUserId: string,
  partnerName: string,
  stats: { sessions: number; notes: number; games: number; journal: number }
) {
  const email = await getUserEmail(toUserId);
  if (!email) return;
  const total = stats.sessions + stats.notes + stats.games + stats.journal;
  if (total === 0) return; // Don't send if nothing happened
  const lines = [
    stats.sessions > 0 && `${stats.sessions} shared moment${stats.sessions > 1 ? "s" : ""} unlocked`,
    stats.notes > 0 && `${stats.notes} love note${stats.notes > 1 ? "s" : ""} exchanged`,
    stats.games > 0 && `${stats.games} game${stats.games > 1 ? "s" : ""} played`,
    stats.journal > 0 && `${stats.journal} journal entr${stats.journal > 1 ? "ies" : "y"} written`,
  ].filter(Boolean) as string[];

  await send(
    email,
    `Your week with ${partnerName} — a look back 🌸`,
    wrap(`
      <h2 style="font-size:22px;font-weight:600;margin:0">This week with ${partnerName}</h2>
      <p style="margin-top:8px;color:#57534e">Here's a little summary of what you two shared this week:</p>
      <ul style="margin:16px 0;padding:0 0 0 20px;color:#292524;font-size:15px;line-height:1.8">
        ${lines.map((l) => `<li>${l}</li>`).join("")}
      </ul>
      <p style="color:#57534e">Keep showing up — it adds up more than you know.</p>
      ${btn(`${SITE_URL}/app`, "Open Ours")}
    `)
  );
}

export async function sendSessionUnlockedEmail(
  toUserId: string,
  partnerName: string,
  sessionType: "daily" | "weekly"
) {
  if (!(await checkEmailPref(toUserId, "email_session_unlocked"))) return;
  const email = await getUserEmail(toUserId);
  if (!email) return;
  const label = sessionType === "daily" ? "Today's Daily Moment" : "This week's Weekly Reset";
  const path = sessionType === "daily" ? "/app/daily" : "/app/weekly";
  await send(
    email,
    `You're both here — ${label} is unlocked 🔓`,
    wrap(`
      <h2 style="font-size:22px;font-weight:600;margin:0">You both showed up</h2>
      <p style="margin-top:8px;color:#57534e">${partnerName} answered their prompts. ${label} is now unlocked — you can see each other's responses.</p>
      ${btn(`${SITE_URL}${path}`, `Open ${label}`)}
    `)
  );
}
