import { createClient } from "@/lib/supabase/server";
import { getMyData } from "@/lib/ours";
import { saveJournalEntryAction, deleteJournalEntryAction } from "@/app/actions";
import { LocalTime } from "@/components/local-time";

export default async function JournalPage() {
  const supabase = await createClient();
  const { user, couple } = await getMyData();

  if (!user || !couple) return <p className="text-sm text-stone-600">Set up your couple first.</p>;

  const { data: entries } = await supabase
    .from("journal_entries")
    .select("id, user_id, content, created_at")
    .eq("couple_id", couple.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name")
    .in("id", [couple.member1, couple.member2].filter(Boolean) as string[]);

  const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.first_name || "Partner"]));

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Our Journal</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">A shared space to write what&apos;s on your mind. No rules, no prompts — just you two.</p>
      </div>

      <form action={saveJournalEntryAction} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <label htmlFor="journal-content" className="text-sm font-semibold text-stone-900 dark:text-stone-100">Write something</label>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">It could be a thought, a feeling, a memory, or a plan. Whatever feels right.</p>
        <textarea
          id="journal-content"
          name="content"
          rows={4}
          required
          maxLength={5000}
          placeholder="Today I was thinking about..."
          className="mt-3 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        />
        <button className="btn-accent mt-3 min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold transition active:scale-[0.99]">
          Add to our journal
        </button>
      </form>

      {(entries ?? []).length === 0 && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 text-center dark:border-stone-700 dark:bg-stone-800">
          <p className="text-base font-medium text-stone-700 dark:text-stone-200">Your journal is waiting for its first page</p>
          <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">Some couples write about their favorite memory together. Others share what they&apos;re grateful for today. There&apos;s no wrong way to start — just say what&apos;s on your heart.</p>
        </div>
      )}

      <div className="space-y-3">
        {(entries ?? []).map((entry) => {
          const isMe = entry.user_id === user.id;
          const name = nameMap[entry.user_id] || "Partner";
          return (
            <div
              key={entry.id}
              className={`rounded-2xl border p-5 shadow-sm ${
                isMe
                  ? "border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900"
                  : "border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  isMe
                    ? "btn-accent"
                    : "bg-sky-600 text-white dark:bg-sky-400 dark:text-sky-950"
                }`}>
                  {name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">{name}</span>
                <span className="text-xs text-stone-400 dark:text-stone-500">
                  <LocalTime dateStr={entry.created_at} />
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-700 dark:text-stone-200">
                {entry.content}
              </p>
              {isMe && (
                <form action={deleteJournalEntryAction} className="mt-3">
                  <input type="hidden" name="entry_id" value={entry.id} />
                  <button
                    type="submit"
                    className="text-xs font-medium text-stone-400 transition hover:text-red-500 dark:text-stone-500 dark:hover:text-red-400"
                  >
                    Delete
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
