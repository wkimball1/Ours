import { requestReassuranceAction, saveMoodAction, sendReassuranceMessageAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { getMe, getMyCouple } from "@/lib/ours";

const templates = [
  "I’m right here with you. We’ll move through this together.",
  "I choose us, even on the hard days.",
  "Thank you for sharing how you feel. I’m listening.",
  "No pressure. We can take this one breath at a time.",
];

export default async function ReassurancePage() {
  const supabase = await createClient();
  const user = await getMe();
  const couple = await getMyCouple();
  if (!user || !couple) return <p>Set up your couple first.</p>;

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, payload, created_at")
    .eq("to_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(15);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Reassurance</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">A calm place to ask for support and offer comfort quickly.</p>
      </div>

      <form action={saveMoodAction} className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <label htmlFor="mood-level" className="text-sm font-semibold text-stone-800 dark:text-stone-100">How are you feeling right now?</label>
        <input id="mood-level" name="mood_level" type="range" min={0} max={100} defaultValue={50} className="w-full accent-stone-900 dark:accent-stone-100" />
        <textarea name="note" rows={2} placeholder="Optional note (e.g., what would help most right now)" className="w-full px-3 py-2.5" />
        <button className="min-h-11 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700">Save mood</button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        <form action={requestReassuranceAction} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <p className="text-sm text-stone-600 dark:text-stone-300">Need a little extra care right now?</p>
          <button className="mt-3 min-h-11 w-full rounded-xl bg-stone-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 active:scale-[0.99] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200">Ask for care</button>
        </form>

        <form action={sendReassuranceMessageAction} className="space-y-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <label htmlFor="custom-message" className="text-sm font-semibold text-stone-900 dark:text-stone-100">Send a custom reassurance note</label>
          <textarea id="custom-message" name="message" rows={3} placeholder="Write a short comforting note" className="w-full px-3 py-2.5" />
          <button className="min-h-11 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:-translate-y-0.5 hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700">Send message</button>
        </form>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Quick reassurance templates</p>
        <div className="mt-3 space-y-2">
          {templates.map((t) => (
            <form key={t} action={sendReassuranceMessageAction}>
              <input type="hidden" name="message" value={t} />
              <button className="min-h-11 w-full rounded-xl border border-stone-300 bg-white p-2.5 text-left text-sm text-stone-800 transition hover:bg-stone-100 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700">{t}</button>
            </form>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Recent in-app notifications</p>
        <ul className="mt-2 space-y-2 text-sm text-stone-700 dark:text-stone-200">
          {(notifications ?? []).map((n) => {
            const payload = (n.payload ?? {}) as { message?: string };
            const line =
              n.type === "reassurance_request"
                ? "Your partner asked for a little extra care."
                : payload.message || "You received a reassurance note.";

            return (
              <li key={n.id} className="rounded-xl border border-stone-200 bg-stone-50 p-2.5 dark:border-stone-700 dark:bg-stone-800/70">
                <span className="font-semibold text-stone-900 dark:text-stone-100">{line}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
