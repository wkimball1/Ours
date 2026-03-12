"use client";

import { answerThisOrThatAction } from "@/app/actions";
import { useState, useTransition } from "react";

interface Question {
  id: string;
  option_a: string;
  option_b: string;
  category: string;
}

interface Props {
  questions: Question[];
  myAnswers: Record<string, string>;
  myGuesses: Record<string, string>;
  partnerAnswers: Record<string, string>;
  partnerGuesses: Record<string, string>;
  hasPartner: boolean;
}

type Step =
  | { type: "pick"; question: Question }
  | { type: "guess"; question: Question; myChoice: "a" | "b" }
  | { type: "done" };

export function ThisOrThatGame({ questions, myAnswers, myGuesses, partnerAnswers, partnerGuesses, hasPartner }: Props) {
  const [pending, startTransition] = useTransition();

  const unanswered = questions.filter((q) => !myAnswers[q.id]);
  const answered = questions.filter((q) => myAnswers[q.id]);

  const [step, setStep] = useState<Step>(
    unanswered.length > 0 ? { type: "pick", question: unanswered[0] } : { type: "done" }
  );

  function advanceToNext() {
    // unanswered is based on prop data; after submitting, the question will be gone next render
    // For now, move to the next unanswered question in the list
    const remaining = unanswered.filter(
      (q) => step.type !== "done" && q.id !== (step as { question: Question }).question?.id
    );
    if (remaining.length > 0) {
      setStep({ type: "pick", question: remaining[0] });
    } else {
      setStep({ type: "done" });
    }
  }

  function pick(choice: "a" | "b") {
    if (step.type !== "pick") return;
    if (!hasPartner) {
      const fd = new FormData();
      fd.set("question_id", step.question.id);
      fd.set("choice", choice);
      startTransition(() => answerThisOrThatAction(fd));
      advanceToNext();
      return;
    }
    setStep({ type: "guess", question: step.question, myChoice: choice });
  }

  function submitGuess(guess: "a" | "b") {
    if (step.type !== "guess") return;
    const fd = new FormData();
    fd.set("question_id", step.question.id);
    fd.set("choice", step.myChoice);
    fd.set("guess", guess);
    startTransition(() => answerThisOrThatAction(fd));
    advanceToNext();
  }

  function skipGuess() {
    if (step.type !== "guess") return;
    const fd = new FormData();
    fd.set("question_id", step.question.id);
    fd.set("choice", step.myChoice);
    startTransition(() => answerThisOrThatAction(fd));
    advanceToNext();
  }

  const progress = answered.length;
  const total = questions.length;

  return (
    <div className="space-y-6">
      {/* Progress */}
      {total > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>{progress} of {total} answered</span>
            {unanswered.length > 0 && <span>{unanswered.length} left</span>}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
            <div
              className="h-full rounded-full bg-stone-800 transition-all dark:bg-stone-200"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Pick step */}
      {step.type === "pick" && (
        <div className="space-y-3">
          <p className="rounded-xl bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
            Pick what <span className="font-bold text-stone-900 dark:text-stone-100">you</span> prefer.
            {hasPartner && " Then guess your partner's pick."}
          </p>
          <div className="rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400">{step.question.category}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => pick("a")}
                disabled={pending}
                className="rounded-xl border-2 border-[var(--border)] bg-stone-50 p-4 text-center font-medium text-stone-900 transition hover:-translate-y-0.5 hover:border-stone-400 hover:shadow active:scale-[0.98] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:border-stone-400"
              >
                {step.question.option_a}
              </button>
              <button
                onClick={() => pick("b")}
                disabled={pending}
                className="rounded-xl border-2 border-[var(--border)] bg-stone-50 p-4 text-center font-medium text-stone-900 transition hover:-translate-y-0.5 hover:border-stone-400 hover:shadow active:scale-[0.98] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:border-stone-400"
              >
                {step.question.option_b}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guess step */}
      {step.type === "guess" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-5 shadow-sm dark:border-sky-800 dark:bg-sky-950/50">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-400">{step.question.category}</p>
            <p className="mb-1 text-sm text-stone-600 dark:text-stone-300">
              Your pick: <span className="font-bold text-stone-900 dark:text-stone-100">
                {step.myChoice === "a" ? step.question.option_a : step.question.option_b}
              </span>
            </p>
            <p className="mb-4 text-sm font-medium text-sky-700 dark:text-sky-300">
              What would your partner pick?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => submitGuess("a")}
                disabled={pending}
                className="rounded-xl border-2 border-sky-200 bg-sky-50 p-4 text-center font-medium text-stone-900 transition hover:-translate-y-0.5 hover:border-sky-400 hover:shadow active:scale-[0.98] dark:border-sky-700 dark:bg-sky-950 dark:text-stone-100 dark:hover:border-sky-500"
              >
                {step.question.option_a}
              </button>
              <button
                onClick={() => submitGuess("b")}
                disabled={pending}
                className="rounded-xl border-2 border-sky-200 bg-sky-50 p-4 text-center font-medium text-stone-900 transition hover:-translate-y-0.5 hover:border-sky-400 hover:shadow active:scale-[0.98] dark:border-sky-700 dark:bg-sky-950 dark:text-stone-100 dark:hover:border-sky-500"
              >
                {step.question.option_b}
              </button>
            </div>
            <button
              onClick={skipGuess}
              disabled={pending}
              className="mt-3 text-sm text-stone-400 underline hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
            >
              Skip guess
            </button>
          </div>
        </div>
      )}

      {/* All done */}
      {step.type === "done" && unanswered.length === 0 && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          You&apos;ve answered them all! Check back later for new questions.
        </p>
      )}

      {/* Answered history */}
      {answered.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">Your picks</p>
          <div className="space-y-2">
            {answered.map((q) => {
              const mine = myAnswers[q.id];
              const theirs = partnerAnswers[q.id];
              const myGuess = myGuesses[q.id];
              const theirGuess = partnerGuesses[q.id];
              const matched = theirs && mine === theirs;
              const guessedRight = myGuess && theirs && myGuess === theirs;
              const theyGuessedRight = theirGuess && theirGuess === mine;

              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-3 text-sm ${
                    theirs
                      ? matched
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
                        : "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950"
                      : "border-[var(--border)] bg-stone-50 dark:bg-stone-800"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500 mb-1">{q.category}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      <span className="text-xs text-stone-500 dark:text-stone-400">You: </span>
                      <span className="font-medium text-stone-900 dark:text-stone-100">{mine === "a" ? q.option_a : q.option_b}</span>
                    </span>
                    {myGuess && (
                      <span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">You guessed: </span>
                        <span className={`font-medium ${guessedRight ? "text-emerald-700 dark:text-emerald-300" : theirs ? "text-rose-600 dark:text-rose-400" : "text-stone-700 dark:text-stone-300"}`}>
                          {myGuess === "a" ? q.option_a : q.option_b}
                          {theirs ? (guessedRight ? " ✓" : " ✗") : ""}
                        </span>
                      </span>
                    )}
                    {theirs && (
                      <span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">They picked: </span>
                        <span className="font-medium text-stone-900 dark:text-stone-100">{theirs === "a" ? q.option_a : q.option_b}</span>
                      </span>
                    )}
                  </div>
                  {theirs && theirGuess && (
                    <p className={`mt-1 text-xs ${theyGuessedRight ? "text-sky-600 dark:text-sky-400" : "text-stone-400 dark:text-stone-500"}`}>
                      {theyGuessedRight ? "They guessed you correctly" : "They guessed wrong for you"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
