"use client";

import { useTransition, useState } from "react";
import { sendThinkingOfYouAction } from "@/app/actions";

export function ThinkingOfYouButton({ partnerName }: { partnerName?: string | null }) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function handleClick() {
    startTransition(async () => {
      await sendThinkingOfYouAction();
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || sent}
      className="min-h-11 rounded-xl border border-stone-300 bg-card px-5 py-2.5 text-sm font-medium text-stone-800 hover:-translate-y-0.5 hover:bg-stone-50 active:scale-[0.99] dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
    >
      <span className={sent ? "heart-pulse" : ""}>🤍</span>{" "}
      {isPending ? "Sending…" : sent ? `Sent to ${partnerName || "your partner"} ✓` : "Send a tap"}
    </button>
  );
}
