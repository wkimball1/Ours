"use client";

import { useState } from "react";

export function InviteShare({ inviteLink }: { inviteLink: string | null }) {
  const [copied, setCopied] = useState(false);

  const suggestedText = inviteLink
    ? `Want to try Ours with me? It's a calm daily connection app for us. Join here: ${inviteLink}`
    : "";

  async function copyText(text: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Invite toolkit</p>
      <div className="rounded-lg border border-stone-200 bg-white p-2 text-xs text-stone-700 break-all">{inviteLink || "Generate your private invite link to unlock this."}</div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => copyText(inviteLink || "")}
          disabled={!inviteLink}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Copy link
        </button>
        <button
          type="button"
          onClick={() => copyText(suggestedText)}
          disabled={!inviteLink}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Copy ready-to-send text
        </button>
        {copied && <span className="text-xs font-medium text-emerald-700">Copied</span>}
      </div>
    </div>
  );
}
