import { createClient } from "@/lib/supabase/server";
import { getMyData } from "@/lib/ours";
import { addBucketItemAction, toggleBucketItemAction, deleteBucketItemAction } from "@/app/actions";
import { LocalTime } from "@/components/local-time";
import { SubmitButton } from "@/components/submit-button";

export default async function BucketListPage() {
  const supabase = await createClient();
  const { user, couple } = await getMyData();

  if (!user || !couple) return <p className="text-sm text-stone-600">Set up your couple first.</p>;

  const { data: items } = await supabase
    .from("bucket_list_items")
    .select("*")
    .eq("couple_id", couple.id)
    .order("created_at", { ascending: false });

  const pending = (items ?? []).filter((i) => !i.completed_at);
  const done = (items ?? []).filter((i) => !!i.completed_at);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Bucket List</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Things you want to do, visit, or experience together. Dream freely.</p>
      </div>

      {/* Add item */}
      <form action={addBucketItemAction} className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
        <label htmlFor="bucket-content" className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Add something to dream about
        </label>
        <div className="mt-3 flex gap-2">
          <input
            id="bucket-content"
            name="content"
            type="text"
            required
            maxLength={500}
            placeholder="e.g. See the northern lights together"
            className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
          <SubmitButton
            pendingText="Adding…"
            className="btn-accent shrink-0 min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold active:scale-[0.99]"
          >
            Add
          </SubmitButton>
        </div>
      </form>

      {/* Pending items */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
            Still to do ({pending.length})
          </p>
          {pending.map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-card p-4 shadow-sm">
              <form action={toggleBucketItemAction} className="mt-0.5 shrink-0">
                <input type="hidden" name="item_id" value={item.id} />
                <input type="hidden" name="completed" value="false" />
                <button
                  className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-stone-300 bg-white transition hover:border-[var(--accent)] dark:border-stone-600 dark:bg-stone-800"
                  title="Mark as done"
                />
              </form>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-stone-800 dark:text-stone-100">{item.content}</p>
                <p className="mt-0.5 text-xs text-stone-400">
                  Added <LocalTime dateStr={item.created_at} />
                </p>
              </div>
              {item.created_by === user.id && (
                <form action={deleteBucketItemAction}>
                  <input type="hidden" name="item_id" value={item.id} />
                  <button className="text-xs text-stone-400 transition hover:text-red-500 dark:hover:text-red-400">
                    Remove
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {pending.length === 0 && done.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center dark:border-stone-600 dark:bg-stone-800/50">
          <p className="text-3xl">✨</p>
          <p className="mt-3 text-base font-semibold text-stone-800 dark:text-stone-100">Your list is wide open</p>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Add places to visit, things to try, or small moments you want to share. No idea is too big or too small.
          </p>
        </div>
      )}

      {/* Completed items */}
      {done.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
            Done together ({done.length}) ✅
          </p>
          {done.map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-card p-4 opacity-60 shadow-sm">
              <form action={toggleBucketItemAction} className="mt-0.5 shrink-0">
                <input type="hidden" name="item_id" value={item.id} />
                <input type="hidden" name="completed" value="true" />
                <button
                  className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-[var(--accent-soft)] text-[10px] text-[var(--accent-dark)] transition hover:opacity-70"
                  title="Mark as not done"
                >
                  ✓
                </button>
              </form>
              <div className="min-w-0 flex-1">
                <p className="text-sm line-through text-stone-500 dark:text-stone-400">{item.content}</p>
                <p className="mt-0.5 text-xs text-stone-400">
                  Done <LocalTime dateStr={item.completed_at!} />
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
