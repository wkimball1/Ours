import Link from "next/link";
import { createCoupleAction, generateInviteAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { ensureDailySession, ensureWeeklySession, getMyData, getPartnerId } from "@/lib/ours";
import { InviteShare } from "@/components/invite-share";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 2) return "Active now";
  if (mins < 60) return `Last seen ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Last seen ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Last seen ${days}d ago`;
}

type SessionState = "not started" | "waiting" | "unlocked";

export default async function AppHomePage() {
  const supabase = await createClient();
  const { user, couple } = await getMyData();

  if (!couple || !user) {
    return (
      <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Let’s create your space</h2>
        <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">Start your shared home, then invite your partner with a private link when it feels right.</p>
        <form action={createCoupleAction}>
          <button className="min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold btn-accent transition">Create couple space</button>
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
        <p className="text-sm text-amber-800">Today’s prompts are still being prepared. Check back in a little while — we’ll have something meaningful waiting for you both.</p>
      </section>
    );
  }

  const partnerId = getPartnerId(couple, user.id);

  let partnerPresence: { first_name: string; last_active_at: string | null; avatar_url: string | null } | null = null;
  if (partnerId) {
    const { data: partnerProfile } = await supabase
      .from("profiles")
      .select("first_name, last_active_at, avatar_url")
      .eq("id", partnerId)
      .single();
    partnerPresence = partnerProfile;
  }

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
      <div className="hero-card rounded-3xl border border-white/10 p-6 text-white md:col-span-2 sm:p-7">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Today</p>
          {partnerPresence?.last_active_at && (
            <div className="flex items-center gap-2">
              {partnerPresence.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partnerPresence.avatar_url} alt={partnerPresence.first_name ?? "Partner"} className="h-7 w-7 rounded-full object-cover ring-2 ring-white/30" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-card/20 text-sm">🤍</div>
              )}
              <p className={`text-xs font-medium ${timeAgo(partnerPresence.last_active_at) === "Active now" ? "text-emerald-300" : "text-stone-400"}`}>
                {partnerPresence.first_name ? `${partnerPresence.first_name}: ` : ""}{timeAgo(partnerPresence.last_active_at)}
              </p>
            </div>
          )}
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">A tiny moment for us</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">One honest minute can shift the whole day. No pressure, just connection.</p>
      </div>

      {!couple.member2 && (
        <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm md:col-span-2">
          <p className="text-base font-semibold text-stone-900 dark:text-stone-100">Invite your partner</p>
          <p className="text-sm text-stone-600 dark:text-stone-300">Most couples connect faster when this is sent right after signup. Use the ready-to-send text to remove friction.</p>

          <form
            action={async () => {
              "use server";
              await generateInviteAction();
            }}
          >
            <button className="min-h-11 rounded-xl border border-stone-300 bg-card px-3 py-2 text-sm font-medium text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700">Generate or refresh invite link</button>
          </form>

          <InviteShare inviteLink={inviteLink} />
        </div>
      )}

      <Card title="Next visit" subtitle="Optional — add this in Settings when plans become clearer.">
        {couple.next_visit_date ? (() => {
          const d = new Date(couple.next_visit_date + "T00:00:00");
          const formatted = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
          const isClose = diff > 0 && diff <= 7;
          return (
            <>
              <p className={`font-semibold ${isClose ? "text-2xl text-amber-700 dark:text-amber-400" : "text-xl text-stone-900 dark:text-stone-100"}`}>{formatted}</p>
              {diff > 7 && <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{diff} days from now</p>}
              {isClose && diff > 1 && <p className="mt-1 text-sm font-semibold text-amber-600 dark:text-amber-400">Only {diff} days away — almost there!</p>}
              {diff === 1 && <p className="mt-1 text-sm font-semibold text-amber-600 dark:text-amber-400">Tomorrow! One more sleep.</p>}
              {diff === 0 && <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">Today! You made it.</p>}
            </>
          );
        })() : <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">Plan something to look forward to — even a video call counts. Add a date in Settings whenever you&apos;re ready.</p>}
      </Card>

      <Card title="Connection rhythm" subtitle="No streak pressure. Every completed moment still counts.">
        <p className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">{unlockedCount ?? 0}</p>
        <p className="text-sm text-stone-600 dark:text-stone-300">shared moments completed</p>
      </Card>

      <Card title="Today’s Daily Moment" subtitle="Three gentle prompts to reconnect.">
        <StatusBadge state={dailyState} />
        <Link href="/app/daily" className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-stone-300 bg-card px-3 py-2 text-sm font-medium text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700">
          Open Daily Moment
        </Link>
      </Card>

      <Card title="Weekly Reset" subtitle="A longer check-in for bigger feelings and plans.">
        <StatusBadge state={weeklyState} />
        <Link href="/app/weekly" className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-stone-300 bg-card px-3 py-2 text-sm font-medium text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700">
          Open Weekly Reset
        </Link>
      </Card>

      <Card title="Reassurance" subtitle="Ask softly, answer warmly, and lower the temperature together.">
        <Link href="/app/reassurance" className="mt-1 inline-flex min-h-11 items-center rounded-xl border border-stone-300 bg-card px-3 py-2 text-sm font-medium text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700">
          Open Reassurance
        </Link>
      </Card>

      <Card title="Love Notes" subtitle="Leave a surprise note for your partner to find whenever they open the app.">
        <Link href="/app/love-notes" className="mt-1 inline-flex min-h-11 items-center rounded-xl border border-stone-300 bg-card px-3 py-2 text-sm font-medium text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700">
          Open Love Notes
        </Link>
      </Card>

      <Card title="Our Journal" subtitle="A shared space for thoughts, feelings, and memories — no prompts needed.">
        <Link href="/app/journal" className="mt-1 inline-flex min-h-11 items-center rounded-xl border border-stone-300 bg-card px-3 py-2 text-sm font-medium text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700">
          Open Journal
        </Link>
      </Card>

      <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm md:col-span-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-stone-900 dark:text-stone-100">Your story so far</p>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Look back on everything you&apos;ve shared, or celebrate how far you&apos;ve come.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/app/memories" className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 bg-card px-3 py-2 text-sm font-medium text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700">
              Memories
            </Link>
            <Link href="/app/milestones" className="inline-flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-semibold btn-accent transition">
              Milestones
            </Link>
          </div>
        </div>
      </div>
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
    <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
      <p className="text-base font-semibold text-stone-900 dark:text-stone-100">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function StatusBadge({ state }: { state: SessionState }) {
  const style =
    state === "waiting"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200";

  if (state === "unlocked") {
    return (
      <p className="btn-accent inline-flex rounded-full border border-transparent px-2.5 py-1 text-xs font-semibold">
        you’re both here
      </p>
    );
  }

  const label =
    state === "waiting"
      ? "waiting for your person"
      : "your note is ready";

  return <p className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>{label}</p>;
}
