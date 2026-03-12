"use client";

import { answerWouldYouRatherAction } from "@/app/actions";
import { useState, useTransition } from "react";

interface Props {
  question: { id: string; question_a: string; question_b: string };
  myChoice: string | null;
  myGuess: string | null;
  partnerChoice: string | null;
  partnerGuess: string | null;
  hasPartner: boolean;
}

export function WouldYouRatherCard({ question, myChoice, myGuess, partnerChoice, partnerGuess, hasPartner }: Props) {
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<"pick" | "guess">(myChoice ? "guess" : "pick");
  const [selectedChoice, setSelectedChoice] = useState<"a" | "b" | null>(null);
  const bothAnswered = myChoice !== null && partnerChoice !== null;
  const matched = bothAnswered && myChoice === partnerChoice;

  function pickForSelf(choice: "a" | "b") {
    if (myChoice || pending) return;
    setSelectedChoice(choice);
    setStep("guess");
  }

  function pickGuess(guess: "a" | "b") {
    if (pending) return;
    const fd = new FormData();
    fd.set("question_id", question.id);
    fd.set("choice", selectedChoice ?? myChoice ?? "");
    fd.set("guess", guess);
    startTransition(() => answerWouldYouRatherAction(fd));
  }

  function skipGuess() {
    if (pending) return;
    const fd = new FormData();
    fd.set("question_id", question.id);
    fd.set("choice", selectedChoice ?? myChoice ?? "");
    startTransition(() => answerWouldYouRatherAction(fd));
  }

  const alreadySubmitted = myChoice !== null;
  const showGuessStep = step === "guess" && !alreadySubmitted;
  const showWaiting = alreadySubmitted && !bothAnswered;

  const btnBase = "rounded-2xl border-2 p-6 text-left text-lg font-medium transition";
  const btnSelected = "btn-accent border-transparent";
  const btnUnselected = "border-[var(--border)] bg-stone-50 text-stone-400 dark:bg-stone-800/50 dark:text-stone-500";
  const btnActive = "border-[var(--border)] bg-card text-stone-900 hover:-translate-y-1 hover:border-stone-400 hover:shadow-md active:scale-[0.98] dark:text-stone-100 dark:hover:border-stone-500";
  const btnGuessActive = "border-sky-200 bg-sky-50 text-stone-900 hover:-translate-y-1 hover:border-sky-400 hover:shadow-md active:scale-[0.98] dark:border-sky-700 dark:bg-sky-950 dark:text-stone-100 dark:hover:border-sky-500";

  function choiceStyle(opt: "a" | "b") {
    const chosen = alreadySubmitted ? myChoice : selectedChoice;
    if (chosen === opt) return btnSelected;
    if (chosen) return btnUnselected;
    return btnActive;
  }

  return (
    <div className="space-y-4">
      {!alreadySubmitted && step === "pick" && (
        <p className="rounded-xl bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
          <span className="font-bold text-stone-900 dark:text-stone-100">Step 1:</span> What would <span className="font-bold text-stone-900 dark:text-stone-100">you</span> rather do?
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => pickForSelf("a")}
          disabled={!!alreadySubmitted || !!selectedChoice || pending}
          className={`${btnBase} ${choiceStyle("a")}`}
        >
          {question.question_a}
          {bothAnswered && partnerChoice === "a" && (
            <span className="mt-2 block text-sm font-normal opacity-80">Your partner chose this</span>
          )}
        </button>

        <button
          onClick={() => pickForSelf("b")}
          disabled={!!alreadySubmitted || !!selectedChoice || pending}
          className={`${btnBase} ${choiceStyle("b")}`}
        >
          {question.question_b}
          {bothAnswered && partnerChoice === "b" && (
            <span className="mt-2 block text-sm font-normal opacity-80">Your partner chose this</span>
          )}
        </button>
      </div>

      {showGuessStep && hasPartner && (
        <div className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50/50 p-5 dark:border-sky-800 dark:bg-sky-950/50">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
            <span className="font-bold text-sky-700 dark:text-sky-300">Step 2:</span> Now guess — what do you think your <span className="font-bold text-sky-700 dark:text-sky-300">partner</span> would pick?
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => pickGuess("a")}
              disabled={pending}
              className={`${btnBase} ${btnGuessActive}`}
            >
              {question.question_a}
            </button>
            <button
              onClick={() => pickGuess("b")}
              disabled={pending}
              className={`${btnBase} ${btnGuessActive}`}
            >
              {question.question_b}
            </button>
          </div>
          <button
            onClick={skipGuess}
            disabled={pending}
            className="text-sm text-stone-500 underline hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
          >
            Skip guessing
          </button>
        </div>
      )}

      {showGuessStep && !hasPartner && (
        <div className="flex gap-3">
          <button
            onClick={skipGuess}
            disabled={pending}
            className="min-h-11 rounded-xl px-4 py-2 text-sm font-semibold btn-accent transition"
          >
            Submit my pick
          </button>
        </div>
      )}

      {showWaiting && hasPartner && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          You&apos;ve picked{myGuess ? " and guessed" : ""}. Waiting for your partner to choose...
        </p>
      )}

      {showWaiting && !hasPartner && (
        <p className="rounded-xl border border-[var(--border)] bg-stone-50 p-3 text-sm text-stone-600">
          Invite your partner to see how you compare.
        </p>
      )}

      {bothAnswered && (
        <div className="space-y-3">
          <p className={`rounded-xl border p-3 text-center text-sm font-medium ${
            matched
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-purple-200 bg-purple-50 text-purple-900"
          }`}>
            {matched ? "You both chose the same thing! Great minds think alike." : "Opposites attract! You each bring something different."}
          </p>

          {(myGuess || partnerGuess) && (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-950">
              <p className="mb-2 text-sm font-semibold text-sky-800 dark:text-sky-200">Guess results</p>
              <div className="space-y-1.5 text-sm">
                {myGuess && (
                  <p className="text-stone-700 dark:text-stone-300">
                    You guessed your partner would pick {myGuess === "a" ? question.question_a : question.question_b}
                    {" — "}
                    <span className={`font-bold ${myGuess === partnerChoice ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-400"}`}>
                      {myGuess === partnerChoice ? "correct!" : "not this time"}
                    </span>
                  </p>
                )}
                {partnerGuess && (
                  <p className="text-stone-700 dark:text-stone-300">
                    Your partner guessed you&apos;d pick {partnerGuess === "a" ? question.question_a : question.question_b}
                    {" — "}
                    <span className={`font-bold ${partnerGuess === myChoice ? "text-emerald-700 dark:text-emerald-300" : "text-rose-600 dark:text-rose-400"}`}>
                      {partnerGuess === myChoice ? "they know you well!" : "not quite"}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
