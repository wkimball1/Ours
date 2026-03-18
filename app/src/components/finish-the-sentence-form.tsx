"use client";

import { saveFinishSentenceAction } from "@/app/actions";
import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Props {
  promptId: string;
  promptText: string;
  myAnswer: string | null;
  partnerAnswer: string | null;
  partnerName: string;
  hasPartner: boolean;
  myName: string;
}

export function FinishTheSentenceForm({ promptId, promptText, myAnswer, partnerAnswer, partnerName, hasPartner, myName }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const waiting = !!myAnswer && !partnerAnswer && hasPartner;
  const bothAnswered = !!myAnswer && !!partnerAnswer;

  // Poll while waiting for partner
  useEffect(() => {
    if (!waiting) return;
    const id = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(id);
  }, [waiting, router]);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const fd = new FormData();
    fd.set("prompt_id", promptId);
    fd.set("answer_text", trimmed);
    startTransition(() => saveFinishSentenceAction(fd));
  }

  // ── Both answered: reveal ──────────────────────────────────────────────────
  if (bothAnswered) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {myName}
          </p>
          <p className="mt-2 text-base font-medium text-stone-900 dark:text-stone-100">
            <span className="text-stone-400 dark:text-stone-500">{promptText} </span>
            {myAnswer}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {partnerName}
          </p>
          <p className="mt-2 text-base font-medium text-stone-900 dark:text-stone-100">
            <span className="text-stone-400 dark:text-stone-500">{promptText} </span>
            {partnerAnswer}
          </p>
        </div>
      </div>
    );
  }

  // ── Waiting for partner ────────────────────────────────────────────────────
  if (waiting) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Your answer
          </p>
          <p className="mt-2 text-base font-medium text-stone-900 dark:text-stone-100">
            <span className="text-stone-400 dark:text-stone-500">{promptText} </span>
            {myAnswer}
          </p>
        </div>
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Waiting for {partnerName} to finish the sentence…
        </p>
      </div>
    );
  }

  // ── Already answered solo (no partner) ────────────────────────────────────
  if (myAnswer && !hasPartner) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Your answer
        </p>
        <p className="mt-2 text-base font-medium text-stone-900 dark:text-stone-100">
          <span className="text-stone-400 dark:text-stone-500">{promptText} </span>
          {myAnswer}
        </p>
      </div>
    );
  }

  // ── Write your answer ──────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-3">
          {hasPartner
            ? `Write yours first — ${partnerName} can't see it until they write theirs.`
            : "Write your completion below."}
        </p>
        <p className="mb-2 text-base font-medium text-stone-900 dark:text-stone-100">
          {promptText}&hellip;
        </p>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="continue the sentence…"
          rows={3}
          maxLength={1000}
          className="w-full resize-none rounded-xl border border-[var(--border)] bg-background p-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-stone-400 dark:text-stone-500">{text.length}/1000</span>
          <button
            onClick={submit}
            disabled={pending || !text.trim()}
            className="btn-accent rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-40"
          >
            {pending ? "Saving…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
