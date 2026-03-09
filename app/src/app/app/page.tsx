import Link from "next/link";
import { createCoupleAction, generateInviteAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { ensureDailySession, ensureWeeklySession, getMe, getMyCouple, getPartnerId } from "@/lib/ours";
import { InviteShare } from "@/components/invite-share";

type SessionState = "not started" | "waiting" | "unlocked";

export default async function AppHomePage() {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();

  if (!couple || !user) {
    return (
      <section className="space-y-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Let’s create your space</h2>
        <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">Start your shared home, then invite your partner with a private link when it feels right.</p>
        <form action={createCoupleAction}>
          <button className="min-h-11 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200">Create couple space</button>
        </form>
      </section>
    );
  }

  const [daily, weekly] = await Promise.all([
    ensureDailySession(couple.id),
    ensureWeeklySession(couple.id),
  ]);

  if (!daily || !weekly) {
    return (
      <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-xl font-semibold text-amber-900">We’re almost ready</h2>
        <p className="text-sm text-amber-800">Session content is missing for today. Please run the prompt seed script in Supabase (`seed_week1.sql`) and refresh.</p>
      </section>
    );
  }

  const partnerId = getPartnerId(couple, user.id);

  const { count: unlockedCount } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("couple_id", couple.id)
    .eq("status", "unlocked");

  const [dailyState, weeklyState] = await Promise.all([
    getSessionState(supabase, daily.id, user.id, partnerId, 3),
    getSessionState(supabase, weekly.id, user.id, partnerId, 6),
  ]);

  const { data: latestInvite } = await supabase
    .from("invites")
    .select("token, used_at")
    .eq("couple_id", couple.id)
    .is("used_at", null)
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const inviteLink = latestInvite?.token
    ? `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"}/invite/${latestInvite.token}`
    : null;

  return (
    <section className="grid gap-4 sm:gap-5 md:grid-cols-2">
      <div className="rounded-3xl bg-gradient-to-br from-stone-950 via-slate-900 to-slate-700 p-6 text-white shadow-lg md:col-span-2 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">Today</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">A tiny moment for us</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-200">One honest minute can shift the whole day. No pressure, just connection.</p>
      </div>

      {!couple.member2 && (
        <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm md:col-span-2 dark:border-stone-700 dark:bg-stone-900">
          <p className="text-base font-semibold text-stone-900 dark:text-stone-100">Invite your partner</p>
          <p className="text-sm text-stone-600 dark:text-stone-300">Most couples connect faster when this is sent right after signup. Use the ready-to-send text to remove friction.</p>

          <form
            action={async () => {
              "use server";
              await generateInviteAction();
            }}
          >
            <button className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700">Generate or refresh invite link</button>
          </form>

          <InviteShare inviteLink={inviteLink} />
        </div>
      )}

      <Card title="Next visit" subtitle="Optional — add this in Settings when plans become clearer.">
        {couple.next_visit_date ? <p className="text-xl font-semibold text-stone-900 dark:text-stone-100">{couple.next_visit_date}</p> : <p className="text-sm text-stone-600 dark:text-stone-300">No date set yet.</p>}
      </Card>

      <Card title="Connection rhythm" subtitle="No streak pressure. Every completed moment still counts.">
        <p className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">{unlockedCount ?? 0}</p>
        <p className="text-sm text-stone-600 dark:text-stone-300">shared moments completed</p>
      </Card>

      <Card title="Today’s Daily Moment" subtitle="Three gentle prompts to reconnect.">
        <StatusBadge state={dailyState} />
        <Link href="/app/daily" className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700">
          Open Daily Moment
        </Link>
      </Card>

      <Card title="Weekly Reset" subtitle="A longer check-in for bigger feelings and plans.">
        <StatusBadge state={weeklyState} />
        <Link href="/app/weekly" className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700">
          Open Weekly Reset
        </Link>
      </Card>

      <Card title="Reassurance" subtitle="Ask softly, answer warmly, and lower the temperature together.">
        <Link href="/app/reassurance" className="mt-1 inline-flex min-h-11 items-center rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700">
          Open Reassurance
        </Link>
      </Card>
    </section>
  );
}

async function getSessionState(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  userId: string,
  partnerId: string | null,
  requiredSteps: number
): Promise<SessionState> {
  const { count: mine } = await supabase
    .from("responses")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("user_id", userId);

  if (!mine) return "not started";
  if (!partnerId) return "waiting";

  const { count: partner } = await supabase
    .from("responses")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("user_id", partnerId);

  if ((mine ?? 0) >= requiredSteps && (partner ?? 0) >= requiredSteps) return "unlocked";
  return "waiting";
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <p className="text-base font-semibold text-stone-900 dark:text-stone-100">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function StatusBadge({ state }: { state: SessionState }) {
  const style =
    state === "unlocked"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : state === "waiting"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-stone-200 bg-stone-100 text-stone-700 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-200";

  const label =
    state === "unlocked"
      ? "you’re both here"
      : state === "waiting"
        ? "waiting for your person"
        : "your note is ready";

  return <p className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>{label}</p>;
}
