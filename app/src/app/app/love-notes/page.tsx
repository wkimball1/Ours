import { createClient } from "@/lib/supabase/server";
import { getMyData } from "@/lib/ours";
import { sendLoveNoteAction, markNoteReadAction } from "@/app/actions";

export default async function LoveNotesPage() {
  const supabase = await createClient();
  const { user, couple } = await getMyData();

  if (!user || !couple) return <p className="text-sm text-stone-600">Set up your couple first.</p>;

  const hasPartner = !!couple.member2;

  const [{ data: receivedNotes }, { data: sentNotes }] = await Promise.all([
    supabase.from("love_notes").select("*").eq("to_user_id", user.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("love_notes").select("*").eq("from_user_id", user.id).order("created_at", { ascending: false }).limit(20),
  ]);

  const unreadNotes = (receivedNotes ?? []).filter((n) => !n.read_at);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Love Notes</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Leave a little surprise for your partner to find.</p>
      </div>

      {hasPartner && (
        <form action={sendLoveNoteAction} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <label htmlFor="note-message" className="text-sm font-semibold text-stone-900 dark:text-stone-100">Write a note</label>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">It could be a compliment, a memory, or just &ldquo;thinking of you.&rdquo;</p>
          <textarea
            id="note-message"
            name="message"
            rows={3}
            placeholder="Hey you..."
            required
            className="mt-3 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
          <button className="btn-accent mt-3 min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold transition active:scale-[0.99]">
            Leave note
          </button>
        </form>
      )}

      {!hasPartner && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-700 dark:bg-stone-800">
          <p className="text-base font-medium text-stone-700 dark:text-stone-200">Notes are better with two</p>
          <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">Even a two-word note can change someone&apos;s whole day. Invite your partner so you can start surprising each other.</p>
        </div>
      )}

      {unreadNotes.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
            New notes for you ({unreadNotes.length})
          </p>
          {unreadNotes.map((note) => (
            <div key={note.id} className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-5 shadow-sm dark:border-rose-800 dark:bg-rose-950">
              <p className="text-stone-900 dark:text-stone-100">&ldquo;{note.message}&rdquo;</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {new Date(note.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
                <form action={markNoteReadAction}>
                  <input type="hidden" name="note_id" value={note.id} />
                  <button className="text-xs font-medium text-rose-700 underline underline-offset-2 transition hover:text-rose-900 dark:text-rose-300 dark:hover:text-rose-100">
                    Mark as read
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {(receivedNotes ?? []).filter((n) => n.read_at).length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">Past notes received</p>
          {(receivedNotes ?? []).filter((n) => n.read_at).map((note) => (
            <div key={note.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
              <p className="text-stone-700 dark:text-stone-200">&ldquo;{note.message}&rdquo;</p>
              <p className="mt-2 text-xs text-stone-400">
                {new Date(note.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          ))}
        </div>
      )}

      {(sentNotes ?? []).length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">Notes you&apos;ve sent</p>
          {(sentNotes ?? []).map((note) => (
            <div key={note.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-700 dark:bg-stone-800">
              <p className="text-sm text-stone-600 dark:text-stone-300">&ldquo;{note.message}&rdquo;</p>
              <p className="mt-2 text-xs text-stone-400">
                {new Date(note.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                {note.read_at ? " · Read" : " · Not yet read"}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
