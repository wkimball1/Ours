import { createClient } from "@/lib/supabase/server";
import { getMyData } from "@/lib/ours";
import { sendLoveNoteAction, markNoteReadAction, reactToNoteAction } from "@/app/actions";
import { LocalTime } from "@/components/local-time";
import { SubmitButton } from "@/components/submit-button";

const REACTIONS = ["💛", "🥹", "😂"] as const;

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
        <form action={sendLoveNoteAction} className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
          <label htmlFor="note-message" className="text-sm font-semibold text-stone-900 dark:text-stone-100">Write a note</label>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">It could be a compliment, a memory, or just &ldquo;thinking of you.&rdquo;</p>
          <textarea
            id="note-message"
            name="message"
            rows={3}
            placeholder="Hey you..."
            required
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
          <SubmitButton
            pendingText="Sending…"
            className="btn-accent mt-3 min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold active:scale-[0.99]"
          >
            Leave note
          </SubmitButton>
        </form>
      )}

      {!hasPartner && (
        <div className="rounded-2xl border border-[var(--border)] bg-stone-50 p-6 text-center dark:bg-stone-800/50">
          <p className="text-3xl">💌</p>
          <p className="mt-3 text-base font-semibold text-stone-800 dark:text-stone-100">Notes are better with two</p>
          <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">Even two words can change someone&apos;s whole day. Invite your partner so you can start surprising each other.</p>
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
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  <LocalTime dateStr={note.created_at} />
                </p>
                <div className="flex items-center gap-2">
                  {/* Emoji reactions */}
                  <div className="flex gap-1">
                    {REACTIONS.map((emoji) => (
                      <form key={emoji} action={reactToNoteAction}>
                        <input type="hidden" name="note_id" value={note.id} />
                        <input type="hidden" name="reaction" value={emoji} />
                        <button
                          className={`rounded-lg border px-2 py-1 text-sm transition hover:-translate-y-0.5 active:scale-95 ${
                            note.reaction === emoji
                              ? "border-rose-400 bg-rose-200 dark:border-rose-600 dark:bg-rose-900"
                              : "border-stone-200 bg-white hover:border-rose-300 dark:border-stone-700 dark:bg-stone-800"
                          }`}
                        >
                          {emoji}
                        </button>
                      </form>
                    ))}
                  </div>
                  <form action={markNoteReadAction}>
                    <input type="hidden" name="note_id" value={note.id} />
                    <button className="text-xs font-medium text-rose-700 underline underline-offset-2 transition hover:text-rose-900 dark:text-rose-300 dark:hover:text-rose-100">
                      Mark as read
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(receivedNotes ?? []).filter((n) => n.read_at).length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">Past notes received</p>
          {(receivedNotes ?? []).filter((n) => n.read_at).map((note) => (
            <div key={note.id} className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
              <p className="text-stone-700 dark:text-stone-200">&ldquo;{note.message}&rdquo;</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-stone-400">
                  <LocalTime dateStr={note.created_at} />
                </p>
                {note.reaction && (
                  <span className="text-lg leading-none" title="Your reaction">{note.reaction}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(sentNotes ?? []).length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">Notes you&apos;ve sent</p>
          {(sentNotes ?? []).map((note) => (
            <div key={note.id} className="rounded-2xl border border-[var(--border)] bg-stone-50 p-5 dark:bg-stone-800">
              <p className="text-sm text-stone-600 dark:text-stone-300">&ldquo;{note.message}&rdquo;</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-stone-400">
                  <LocalTime dateStr={note.created_at} />
                  {note.read_at ? " · Read" : " · Not yet read"}
                </p>
                {note.reaction && (
                  <span className="text-lg leading-none" title="Their reaction">{note.reaction}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
