"use client";

import { useRef, useState } from "react";
import { saveResponseAction } from "@/app/actions";

type Prompt = { step_index: number; prompt_text: string };

export function SessionForm({
  sessionId,
  prompts,
  existing,
  theme,
}: {
  sessionId: string;
  prompts: Prompt[];
  existing: Record<number, string>;
  theme?: string;
}) {
  const firstUnanswered = prompts.findIndex((p) => !(existing[p.step_index] ?? "").trim());

  // All prompts already answered — let the page's waiting/unlock section take over
  if (prompts.length > 0 && firstUnanswered === -1) return null;

  return <SteppedForm sessionId={sessionId} prompts={prompts} existing={existing} initialStep={Math.max(0, firstUnanswered)} theme={theme} />;
}

function SteppedForm({
  sessionId,
  prompts,
  existing,
  initialStep,
  theme,
}: {
  sessionId: string;
  prompts: Prompt[];
  existing: Record<number, string>;
  initialStep: number;
  theme?: string;
}) {
  const [step, setStep] = useState(initialStep);
  const [responses, setResponses] = useState<Record<number, string>>({ ...existing });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (done) return null;
  if (!prompts.length) return null;

  const prompt = prompts[step];
  const isLast = step === prompts.length - 1;
  const currentValue = responses[prompt.step_index] ?? "";
  const canAdvance = currentValue.trim().length > 0;

  async function saveCurrentStep() {
    const fd = new FormData();
    fd.set("session_id", sessionId);
    fd.set("step_index", String(prompt.step_index));
    fd.set("response_text", currentValue.trim());
    await saveResponseAction(fd);
  }

  async function handleNext() {
    if (!canAdvance || saving) return;
    setSaving(true);
    await saveCurrentStep();
    setSaving(false);
    setStep((s) => s + 1);
    // Autofocus the new textarea on next tick
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  async function handleSubmit() {
    if (!canAdvance || saving) return;
    setSaving(true);
    await saveCurrentStep();
    setSaving(false);
    setDone(true);
  }

  function handleBack() {
    setStep((s) => s - 1);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  return (
    <div className="space-y-5 rounded-3xl border border-[var(--border)]/90 bg-card p-4 shadow-sm sm:p-6">
      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {prompts.map((p, i) => (
          <div
            key={p.step_index}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < step
                ? "bg-stone-900 dark:bg-stone-100"
                : i === step
                ? "bg-stone-500 dark:bg-stone-400"
                : "bg-stone-200 dark:bg-stone-700"
            }`}
          />
        ))}
      </div>
      <p className="text-xs font-medium text-stone-400 dark:text-stone-500">
        {step + 1} of {prompts.length}
        {theme && <span className="ml-2 italic">&ldquo;{theme}&rdquo;</span>}
      </p>

      {/* Prompt text */}
      <p className="text-base leading-relaxed text-stone-900 dark:text-stone-100">{prompt.prompt_text}</p>

      {/* Response textarea */}
      <div>
        <label htmlFor={`response-step-${prompt.step_index}`} className="sr-only">
          Response for prompt {step + 1}
        </label>
        <textarea
          ref={textareaRef}
          id={`response-step-${prompt.step_index}`}
          value={currentValue}
          onChange={(e) => setResponses((r) => ({ ...r, [prompt.step_index]: e.target.value }))}
          className="w-full px-3 py-2.5"
          rows={5}
          placeholder="Write what feels true right now."
          autoFocus={step === initialStep}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="min-h-11 rounded-xl border border-stone-300 bg-card px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            ← Back
          </button>
        )}
        <button
          type="button"
          onClick={isLast ? handleSubmit : handleNext}
          disabled={!canAdvance || saving}
          className="btn-accent min-h-11 flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {saving
            ? isLast ? "Sending…" : "Saving…"
            : isLast ? "Send my moment" : "Next →"}
        </button>
      </div>
    </div>
  );
}
