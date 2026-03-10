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

export function ThisOrThatGame({ questions, myAnswers, myGuesses, partnerAnswers, partnerGuesses, hasPartner }: Props) {
  const [pending, startTransition] = useTransition();
  const [guessStep, setGuessStep] = useState<Record<string, string>>({});

  const unanswered = questions.filter((q) => !myAnswers[q.id] && !guessStep[q.id]);
  const awaitingGuess = questions.filter((q) => guessStep[q.id] && !myAnswers[q.id]);
  const answered = questions.filter((q) => myAnswers[q.id]);

  function pick(questionId: string, choice: "a" | "b") {
    if (!hasPartner) {
      const fd = new FormData();
      fd.set("question_id", questionId);
      fd.set("choice", choice);
      startTransition(() => answerThisOrThatAction(fd));
      return;
    }
    setGuessStep((prev) => ({ ...prev, [questionId]: choice }));
  }

  function submitGuess(questionId: string, guess: "a" | "b") {
    const fd = new FormData();
    fd.set("question_id", questionId);
    fd.set("choice", guessStep[questionId]);
    fd.set("guess", guess);
    startTransition(() => answerThisOrThatAction(fd));
  }

  function skipGuess(questionId: string) {
    const fd = new FormData();
    fd.set("question_id", questionId);
    fd.set("choice", guessStep[questionId]);
    startTransition(() => answerThisOrThatAction(fd));
  }

  return (
    <div className="space-y-6">
      {awaitingGuess.length > 0 && (
        <div className="space-y-3">
          {awaitingGuess.map((q) => {
            const myPick = guessStep[q.id];
            return (
              <div key={q.id} className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 shadow-sm dark:border-sky-800 dark:bg-sky-950/50">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-400">{q.category}</p>
                <p className="mb-1 text-sm text-stone-600 dark:text-stone-300">
                  You picked <span className="font-bold text-stone-900 dark:text-stone-100">{myPick === "a" ? q.option_a : q.option_b}</span>
                </p>
                <p className="mb-3 text-sm font-medium text-sky-700 dark:text-sky-300">
                  Now guess — what would your partner pick?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => submitGuess(q.id, "a")}
                    disabled={pending}
                    className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 text-center font-medium text-stone-900 transition hover:-translate-y-0.5 hover:border-sky-400 hover:shadow active:scale-[0.98] dark:border-sky-700 dark:bg-sky-950 dark:text-stone-100 dark:hover:border-sky-500"
                  >
                    {q.option_a}
                  </button>
                  <button
                    onClick={() => submitGuess(q.id, "b")}
                    disabled={pending}
                    className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 text-center font-medium text-stone-900 transition hover:-translate-y-0.5 hover:border-sky-400 hover:shadow active:scale-[0.98] dark:border-sky-700 dark:bg-sky-950 dark:text-stone-100 dark:hover:border-sky-500"
                  >
                    {q.option_b}
                  </button>
                </div>
                <button
                  onClick={() => skipGuess(q.id)}
                  disabled={pending}
                  className="mt-2 text-sm text-stone-500 underline hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                >
                  Skip guessing
                </button>
              </div>
            );
          })}
        </div>
      )}

      {unanswered.length > 0 && (
        <div className="space-y-3">
          {awaitingGuess.length === 0 && (
            <p className="rounded-xl bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
              Pick what <span className="font-bold text-stone-900 dark:text-stone-100">you</span> prefer, then guess your partner&apos;s pick.
            </p>
          )}
          {unanswered.slice(0, 3).map((q) => (
            <div key={q.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">{q.category}</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => pick(q.id, "a")}
                  disabled={pending}
                  className="rounded-xl border-2 border-stone-200 bg-stone-50 p-4 text-center font-medium text-stone-900 transition hover:-translate-y-0.5 hover:border-stone-400 hover:shadow active:scale-[0.98] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:border-stone-400"
                >
                  {q.option_a}
                </button>
                <button
                  onClick={() => pick(q.id, "b")}
                  disabled={pending}
                  className="rounded-xl border-2 border-stone-200 bg-stone-50 p-4 text-center font-medium text-stone-900 transition hover:-translate-y-0.5 hover:border-stone-400 hover:shadow active:scale-[0.98] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:border-stone-400"
                >
                  {q.option_b}
                </button>
              </div>
            </div>
          ))}

          {unanswered.length > 3 && (
            <p className="text-center text-sm text-stone-500 dark:text-stone-400">
              {unanswered.length - 3} more to go. Take your time.
            </p>
          )}
        </div>
      )}

      {answered.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">Your picks</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {answered.map((q) => {
              const mine = myAnswers[q.id];
              const theirs = partnerAnswers[q.id];
              const matched = theirs && mine === theirs;
              const bothDone = !!theirs;
              const myGuess = myGuesses[q.id];
              const theirGuess = partnerGuesses[q.id];

              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-3 text-sm ${
                    bothDone
                      ? matched
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
                        : "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950"
                      : "border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800"
                  }`}
                >
                  <span className="font-medium text-stone-900 dark:text-stone-100">
                    {mine === "a" ? q.option_a : q.option_b}
                  </span>
                  <span className="ml-2 text-stone-500 dark:text-stone-400">
                    over {mine === "a" ? q.option_b : q.option_a}
                  </span>
                  {bothDone && (
                    <span className={`ml-2 text-xs font-semibold ${matched ? "text-emerald-700 dark:text-emerald-300" : "text-purple-700 dark:text-purple-300"}`}>
                      {matched ? "Match!" : "Different"}
                    </span>
                  )}
                  {bothDone && myGuess && (
                    <span className={`ml-1 text-xs ${myGuess === theirs ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                      {myGuess === theirs ? "· guessed right" : "· guess missed"}
                    </span>
                  )}
                  {bothDone && theirGuess && (
                    <span className={`ml-1 text-xs ${theirGuess === mine ? "text-sky-600 dark:text-sky-400" : "text-stone-400 dark:text-stone-500"}`}>
                      {theirGuess === mine ? "· they guessed you" : "· they missed"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {unanswered.length === 0 && awaitingGuess.length === 0 && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-900">
          You&apos;ve answered them all! Check back later for new questions.
        </p>
      )}
    </div>
  );
}
