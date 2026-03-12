"use client";

import { useState, useRef } from "react";

interface Props {
  /** Text shown on the primary trigger button */
  buttonLabel: string;
  /** Text shown on the final confirm button */
  confirmLabel: string;
  /** If set, the user must type this exact string before confirming */
  requireTyping?: string;
  /** Form action to submit when confirmed */
  action: (formData: FormData) => Promise<void>;
  /** Hidden fields to include in the form */
  hiddenFields?: Record<string, string>;
  /** Style variant */
  variant?: "red" | "amber";
}

export function ConfirmDangerAction({
  buttonLabel,
  confirmLabel,
  requireTyping,
  action,
  hiddenFields,
  variant = "red",
}: Props) {
  const [step, setStep] = useState<"idle" | "confirm">("idle");
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const colors =
    variant === "amber"
      ? {
          trigger: "border-amber-300 bg-white text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:bg-stone-800 dark:text-amber-400 dark:hover:bg-amber-950",
          confirm: "bg-amber-600 text-white hover:bg-amber-700",
          box: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40",
          hint: "text-amber-700 dark:text-amber-400",
          input: "border-amber-300 focus:border-amber-500 dark:border-amber-700",
        }
      : {
          trigger: "border-red-300 bg-white text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-stone-800 dark:text-red-400 dark:hover:bg-red-950",
          confirm: "bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed",
          box: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
          hint: "text-red-700 dark:text-red-400",
          input: "border-red-300 focus:border-red-500 dark:border-red-700",
        };

  const canConfirm = !requireTyping || typed === requireTyping;

  function handleTrigger() {
    setStep("confirm");
    setTyped("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  if (step === "idle") {
    return (
      <button
        type="button"
        onClick={handleTrigger}
        className={`min-h-11 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.99] ${colors.trigger}`}
      >
        {buttonLabel}
      </button>
    );
  }

  return (
    <div className={`rounded-xl border p-4 ${colors.box}`}>
      <p className={`text-sm font-semibold ${colors.hint}`}>Are you sure?</p>
      {requireTyping && (
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Type <strong>{requireTyping}</strong> to confirm.
        </p>
      )}
      {requireTyping && (
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={requireTyping}
          className={`mt-3 w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none dark:bg-stone-900 dark:text-stone-100 ${colors.input}`}
        />
      )}
      <div className="mt-3 flex gap-2">
        <form action={action}>
          {hiddenFields &&
            Object.entries(hiddenFields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
          <button
            type="submit"
            disabled={!canConfirm}
            className={`min-h-10 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99] ${colors.confirm}`}
          >
            {confirmLabel}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setStep("idle")}
          className="min-h-10 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
