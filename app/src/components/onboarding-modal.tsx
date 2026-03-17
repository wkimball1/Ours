"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "ours_onboarded_v1";
const STORAGE_KEY_P2 = "ours_p2_onboarded_v1";

const partner1Slides = [
  {
    emoji: "💬",
    title: "A tiny ritual, every day",
    body: "Each day you and your partner each get a few short prompts. You answer independently — no peeking allowed. Once you both answer, you unlock each other's responses.",
  },
  {
    emoji: "🔓",
    title: "The unlock is the magic",
    body: "Neither of you can see the other's answers until you've both shown up. It keeps things honest, equal, and genuinely surprising — even after years together.",
  },
  {
    emoji: "🧩",
    title: "More than just prompts",
    body: "Draw together, play Would You Rather, leave love notes, track moods, write in your shared journal. Everything lives here, just between the two of you.",
  },
];

function getPartner2Slides(partnerName: string | null) {
  return [
    {
      emoji: "🤍",
      title: partnerName ? `You've joined ${partnerName}'s space` : "You've joined your partner's space",
      body: "You're now connected. Each day you'll both get a few short prompts — you answer independently, and once you've both shown up, you unlock each other's responses.",
    },
    {
      emoji: "🔓",
      title: "Your first moment is ready",
      body: "Today's daily prompts are waiting for both of you. Answer honestly, in your own time — there's no right answer, just yours.",
    },
  ];
}

export function OnboardingModal({
  hasPartner,
  isPartner2 = false,
  partner1Name = null,
}: {
  hasPartner: boolean;
  isPartner2?: boolean;
  partner1Name?: string | null;
}) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  const slides = isPartner2 ? getPartner2Slides(partner1Name) : partner1Slides;
  const storageKey = isPartner2 ? STORAGE_KEY_P2 : STORAGE_KEY;

  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, [storageKey]);

  function dismiss() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  const slide = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-4 backdrop-blur-sm sm:items-center sm:pb-0">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-card p-6 shadow-2xl sm:p-8">
        {/* Progress dots */}
        <div className="mb-6 flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-stone-900 dark:bg-stone-100" : "w-1.5 bg-stone-300 dark:bg-stone-600"
              }`}
            />
          ))}
        </div>

        {/* Slide content */}
        <div className="text-center">
          <p className="text-4xl">{slide.emoji}</p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            {slide.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{slide.body}</p>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2">
          {isLast ? (
            <>
              {isPartner2 ? (
                <Link
                  href="/app/daily"
                  onClick={dismiss}
                  className="btn-accent flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5"
                >
                  Start today's moment →
                </Link>
              ) : !hasPartner ? (
                <Link
                  href="/app"
                  onClick={dismiss}
                  className="btn-accent flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5"
                >
                  Invite your partner
                </Link>
              ) : null}
              <button
                onClick={dismiss}
                className="min-h-11 w-full rounded-xl border border-stone-300 bg-card px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
              >
                {isPartner2 ? "Explore first" : hasPartner ? "Let's go" : "I'll invite them later"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="btn-accent min-h-11 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5"
            >
              Next
            </button>
          )}
          <button
            onClick={dismiss}
            className="w-full py-1.5 text-xs text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
          >
            Skip intro
          </button>
        </div>
      </div>
    </div>
  );
}
