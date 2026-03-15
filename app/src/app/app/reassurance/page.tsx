import { requestReassuranceAction, saveMoodAction, sendReassuranceMessageAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { getMyData } from "@/lib/ours";
import { MoodSlider } from "@/components/mood-slider";
import { LocalTime } from "@/components/local-time";
import { SubmitButton } from "@/components/submit-button";

const templates = [
  "I'm right here with you. We'll move through this together.",
  "I choose us, even on the hard days.",
  "Thank you for sharing how you feel. I'm listening.",
  "No pressure. We can take this one breath at a time.",
];

const textareaClass =
  "w-full rounded-xl border border-[var(--border)] bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100";

export default async function ReassurancePage() {
  const supabase = await createClient();
  const { user, couple } = await getMyData();
  if (!user || !couple) return <p>Set up your couple first.</p>;

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, payload, created_at")
    .eq("to_user_id", user.id)
    .in("type", ["reassurance_request", "reassurance_message"])
    .order("created_at", { ascending: false })
    .limit(10);

  const hasPartner = !!couple.member2;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Reassurance</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">A calm place to check in, ask for support, and offer comfort.</p>
      </div>

      {/* Mood check-in */}
      <form action={saveMoodAction} className="space-y-4 rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
        <MoodSlider />
        <textarea
          name="note"
          rows={2}
          placeholder="Optional — what would help most right now?"
          className={textareaClass}
        />
        <SubmitButton
          pendingText="Saving…"
          className="min-h-11 rounded-xl border border-stone-300 bg-card px-4 py-2 text-sm font-medium text-stone-800 hover:-translate-y-0.5 hover:bg-stone-50 active:scale-[0.99] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
        >
          Save mood check-in
        </SubmitButton>
      </form>

      {hasPartner ? (
        <>
          {/* Ask for care */}
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 shadow-sm dark:border-rose-900 dark:bg-rose-950">
            <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">Need a little extra care?</p>
            <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">Send your partner a quiet signal that you could use some support.</p>
            <form action={requestReassuranceAction}>
              <SubmitButton
                pendingText="Sending…"
                className="mt-3 min-h-11 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 active:scale-[0.99]"
              >
                Ask for care
              </SubmitButton>
            </form>
          </div>

          {/* Send a note */}
          <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Send your partner a comforting note</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Write your own or pick from the templates below.</p>

            <form action={sendReassuranceMessageAction} className="mt-4 space-y-3">
              <textarea
                name="message"
                rows={3}
                placeholder="Write something warm..."
                className={textareaClass}
              />
              <SubmitButton
                pendingText="Sending…"
                className="min-h-11 rounded-xl border border-stone-300 bg-card px-4 py-2 text-sm font-medium text-stone-800 hover:-translate-y-0.5 hover:bg-stone-50 active:scale-[0.99] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
              >
                Send note
              </SubmitButton>
            </form>

            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">Quick templates</p>
              {templates.map((t) => (
                <form key={t} action={sendReassuranceMessageAction}>
                  <input type="hidden" name="message" value={t} />
                  <SubmitButton
                    pendingText="Sending…"
                    className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-stone-50 p-3 text-left text-sm text-stone-700 hover:border-stone-300 hover:bg-stone-100 active:scale-[0.99] dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                  >
                    {t}
                  </SubmitButton>
                </form>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-stone-50 p-5 dark:bg-stone-800">
          <p className="text-base font-medium text-stone-700 dark:text-stone-200">Connect with a partner to send support</p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Once your partner joins, you can ask for care and send reassurance notes to each other.</p>
        </div>
      )}

      {/* Recent reassurance activity */}
      {(notifications ?? []).length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Recent reassurance activity</p>
          <ul className="mt-3 space-y-2">
            {(notifications ?? []).map((n) => {
              const payload = (n.payload ?? {}) as { message?: string };
              const isRequest = n.type === "reassurance_request";
              return (
                <li key={n.id} className="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50 p-3 dark:bg-stone-800/70">
                  <span className="mt-0.5 text-base leading-none">{isRequest ? "🤗" : "💬"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-stone-800 dark:text-stone-100">
                      {isRequest ? "Your partner asked for a little extra care." : payload.message}
                    </p>
                    <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                      <LocalTime dateStr={n.created_at} />
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
