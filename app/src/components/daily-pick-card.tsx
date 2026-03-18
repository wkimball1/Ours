"use client";

import { answerThisOrThatAction } from "@/app/actions";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  option_a: string;
  option_b: string;
  category: string;
  type: string;
}

interface Props {
  question: Question;
  myChoice: string | null;
  myGuess: string | null;
  partnerChoice: string | null;
  partnerName: string;
  hasPartner: boolean;
}

export function DailyPickCard({ question, myChoice, myGuess, partnerChoice, partnerName, hasPartner }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [localChoice, setLocalChoice] = useState<"a" | "b" | null>(null);
  const [step, setStep] = useState<"pick" | "guess" | "waiting" | "revealed">(
    myChoice && partnerChoice ? "revealed"
    : myChoice ? "waiting"
    : "pick"
  );

  const bothAnswered = !!myChoice && !!partnerChoice;
  const matched = bothAnswered && myChoice === partnerChoice;

  // Poll while waiting for partner
  useEffect(() => {
    if (step !== "waiting") return;
    const id = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(id);
  }, [step, router]);

  function pick(choice: "a" | "b") {
    if (myChoice || pending) return;
    setLocalChoice(choice);
    if (!hasPartner) {
      submit(choice, null);
      return;
    }
    setStep("guess");
  }

  function submitGuess(guess: "a" | "b") {
    const choice = localChoice!;
    const fd = new FormData();
    fd.set("question_id", question.id);
    fd.set("choice", choice);
    fd.set("guess", guess);
    startTransition(() => answerThisOrThatAction(fd));
    setStep("waiting");
  }

  function skipGuess() {
    submit(localChoice!, null);
  }

  function submit(choice: "a" | "b", guess: "a" | "b" | null) {
    const fd = new FormData();
    fd.set("question_id", question.id);
    fd.set("choice", choice);
    if (guess) fd.set("guess", guess);
    startTransition(() => answerThisOrThatAction(fd));
    setStep("waiting");
  }

  const effectiveChoice = myChoice ?? localChoice;
  const label = question.type === "hypothetical" ? "Would you rather" : null;

  const btnBase = "rounded-2xl border-2 p-5 text-left font-medium transition";
  const btnActive = "border-[var(--border)] bg-card text-stone-900 hover:-translate-y-0.5 hover:border-stone-400 hover:shadow active:scale-[0.98] dark:text-stone-100";
  const btnSelected = "btn-accent border-transparent";
  const btnFaded = "border-[var(--border)] bg-stone-50 text-stone-400 dark:bg-stone-800/50 dark:text-stone-500";
  const btnGuess = "border-sky-200 bg-sky-50 p-5 text-stone-900 hover:-translate-y-0.5 hover:border-sky-400 hover:shadow active:scale-[0.98] dark:border-sky-700 dark:bg-sky-950 dark:text-stone-100";

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-card p-5 shadow-sm">
      <div className="space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Today&apos;s pick{label ? ` — ${label}…` : ""}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400">{question.category}</p>
      </div>

      {/* Pick step */}
      {step === "pick" && (
        <div className="space-y-3">
          <p className="text-sm text-stone-600 dark:text-stone-300">
            Pick yours first. {hasPartner && "Then guess what your partner would pick."}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["a", "b"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => pick(opt)}
                disabled={pending}
                className={`${btnBase} ${btnActive}`}
              >
                {opt === "a" ? question.option_a : question.option_b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Guess step */}
      {step === "guess" && (
        <div className="space-y-3">
          <p className="text-sm text-stone-600 dark:text-stone-300">
            You picked <strong className="text-stone-900 dark:text-stone-100">
              {localChoice === "a" ? question.option_a : question.option_b}
            </strong>. What do you think {partnerName} would pick?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["a", "b"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => submitGuess(opt)}
                disabled={pending}
                className={`${btnBase} ${btnGuess}`}
              >
                {opt === "a" ? question.option_a : question.option_b}
              </button>
            ))}
          </div>
          <button
            onClick={skipGuess}
            disabled={pending}
            className="text-sm text-stone-400 underline hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
          >
            Skip guessing
          </button>
        </div>
      )}

      {/* Waiting */}
      {step === "waiting" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {(["a", "b"] as const).map((opt) => (
              <div
                key={opt}
                className={`${btnBase} ${effectiveChoice === opt ? btnSelected : btnFaded}`}
              >
                {opt === "a" ? question.option_a : question.option_b}
              </div>
            ))}
          </div>
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            Your pick is in. Waiting for {partnerName} to choose…
          </p>
        </div>
      )}

      {/* Revealed */}
      {step === "revealed" && myChoice && partnerChoice && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {(["a", "b"] as const).map((opt) => {
              const iMine = myChoice === opt;
              const isPartners = partnerChoice === opt;
              return (
                <div
                  key={opt}
                  className={`${btnBase} ${iMine || isPartners ? btnSelected : btnFaded}`}
                >
                  {opt === "a" ? question.option_a : question.option_b}
                  <div className="mt-2 space-y-0.5 text-xs font-normal opacity-90">
                    {iMine && <p>You</p>}
                    {isPartners && <p>{partnerName}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <p className={`rounded-xl border p-3 text-center text-sm font-medium ${
            matched
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
              : "border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-200"
          }`}>
            {matched ? "You both picked the same! Great minds." : "Different picks — that's what makes it interesting."}
          </p>
          {myGuess && (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              You guessed {partnerName} would pick{" "}
              <span className="font-medium text-stone-700 dark:text-stone-300">
                {myGuess === "a" ? question.option_a : question.option_b}
              </span>{" "}
              —{" "}
              <span className={`font-semibold ${myGuess === partnerChoice ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-400"}`}>
                {myGuess === partnerChoice ? "you were right!" : "not this time"}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
