"use client";

import { useState } from "react";
import { saveJournalEntryAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";

const MAX = 5000;

export function JournalForm() {
  const [content, setContent] = useState("");
  const remaining = MAX - content.length;
  const nearLimit = remaining <= 200;

  return (
    <form action={saveJournalEntryAction} className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
      <label htmlFor="journal-content" className="text-sm font-semibold text-stone-900 dark:text-stone-100">
        Write something
      </label>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        It could be a thought, a feeling, a memory, or a plan. Whatever feels right.
      </p>
      <textarea
        id="journal-content"
        name="content"
        rows={4}
        required
        maxLength={MAX}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Today I was thinking about..."
        className="mt-3 w-full rounded-xl border border-[var(--border)] bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
      />
      <div className="mt-1.5 flex items-center justify-between">
        <SubmitButton
          pendingText="Saving…"
          className="btn-accent min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold active:scale-[0.99]"
        >
          Add to our journal
        </SubmitButton>
        <span className={`text-xs tabular-nums ${nearLimit ? "text-amber-600 dark:text-amber-400" : "text-stone-400 dark:text-stone-500"}`}>
          {remaining.toLocaleString()} left
        </span>
      </div>
    </form>
  );
}
