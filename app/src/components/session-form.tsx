import { saveSessionResponsesAction } from "@/app/actions";

type Prompt = { step_index: number; prompt_text: string };

export function SessionForm({
  sessionId,
  prompts,
  existing,
}: {
  sessionId: string;
  prompts: Prompt[];
  existing: Record<number, string>;
}) {
  const completed = prompts.filter((p) => (existing[p.step_index] ?? "").trim().length > 0).length;
  const total = prompts.length || 1;
  const completionPct = Math.round((completed / total) * 100);

  return (
    <form action={saveSessionResponsesAction} className="space-y-5 rounded-3xl border border-[var(--border)]/90 bg-card p-4 shadow-sm sm:p-6">
      <input type="hidden" name="session_id" value={sessionId} />

      <div className="rounded-2xl border border-[var(--border)] bg-stone-50 p-4 dark:bg-stone-800/70">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Progress</p>
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            {completed}/{prompts.length}
          </p>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
          <div
            className="h-full rounded-full bg-stone-900 transition-[width] duration-300 dark:bg-stone-100"
            style={{ width: `${completionPct}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      {prompts.map((p) => {
        const inputId = `response-step-${p.step_index}`;
        return (
          <div
            key={p.step_index}
            className="space-y-3 rounded-2xl border border-[var(--border)] bg-card p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Step {p.step_index}</p>
            <p className="text-sm leading-relaxed text-stone-800 dark:text-stone-200">{p.prompt_text}</p>
            <label htmlFor={inputId} className="sr-only">Response for step {p.step_index}</label>
            <textarea
              id={inputId}
              name={`step_${p.step_index}`}
              defaultValue={existing[p.step_index] ?? ""}
              className="w-full px-3 py-2.5"
              rows={4}
              placeholder="Write what feels true right now."
            />
          </div>
        );
      })}

      <div className="sticky bottom-20 z-10 rounded-2xl border border-[var(--border)] bg-card/95 p-3 backdrop-blur sm:bottom-6">
        <button className="btn-accent w-full min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.99]">
          Send my moment
        </button>
      </div>

      <p className="text-sm text-stone-500 dark:text-stone-400">No perfect words needed — one honest minute is enough.</p>
    </form>
  );
}
