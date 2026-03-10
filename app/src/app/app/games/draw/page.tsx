import { createClient } from "@/lib/supabase/server";
import { getMyData, getPartnerId, getDayOfYear } from "@/lib/ours";
import { DrawingCanvas } from "@/components/drawing-canvas";

export default async function DrawPage() {
  const supabase = await createClient();
  const { user, couple } = await getMyData();

  if (!user || !couple) return <p className="text-sm text-stone-600">Set up your couple first.</p>;

  const today = new Date().toISOString().slice(0, 10);
  const dayOfYear = getDayOfYear();

  const { data: prompts } = await supabase
    .from("drawing_prompts")
    .select("*")
    .eq("is_active", true)
    .order("day_index");

  if (!prompts?.length) {
    return (
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Draw Together</h2>
        <p className="text-sm text-stone-600 dark:text-stone-300">Drawing prompts are being prepared! Check back soon for your first creative challenge together.</p>
      </section>
    );
  }

  const todaysPrompt = prompts[(dayOfYear - 1) % prompts.length];
  const partnerId = getPartnerId(couple, user.id);

  const [{ data: myDrawing }, { data: partnerDrawing }] = await Promise.all([
    supabase.from("drawings").select("drawing_data").eq("couple_id", couple.id).eq("user_id", user.id).eq("session_date", today).maybeSingle(),
    partnerId
      ? supabase.from("drawings").select("drawing_data").eq("couple_id", couple.id).eq("user_id", partnerId).eq("session_date", today).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const bothDone = !!myDrawing && !!partnerDrawing;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">Draw Together</h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">No artistic skill needed. Just have fun with it.</p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Today&apos;s prompt</p>
        <p className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-100">{todaysPrompt.prompt_text}</p>
      </div>

      {!myDrawing && (
        <p className="rounded-xl bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
          Draw <span className="font-bold text-stone-900 dark:text-stone-100">your</span> version — your partner draws theirs separately. You&apos;ll reveal both when you&apos;re done.
        </p>
      )}

      {!bothDone && (
        <DrawingCanvas promptId={todaysPrompt.id} existingDrawing={myDrawing?.drawing_data ?? null} />
      )}

      {myDrawing && !partnerDrawing && partnerId && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Your masterpiece is saved! Waiting for your partner to draw theirs...
        </p>
      )}

      {myDrawing && !partnerId && (
        <p className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-600">
          Invite your partner to draw together.
        </p>
      )}

      {bothDone && (
        <div className="space-y-4">
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-900">
            You both drew today! Here&apos;s what you each created.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Yours</p>
              <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-sm dark:border-stone-700">
                <img src={myDrawing.drawing_data} alt="Your drawing" className="w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Theirs</p>
              <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-sm dark:border-stone-700">
                <img src={partnerDrawing.drawing_data} alt="Partner drawing" className="w-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
