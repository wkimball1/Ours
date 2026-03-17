"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Polls for session updates every 15 seconds while the session is in "waiting" state.
 * When both partners complete their prompts, the server will flip the session to
 * "unlocked" and the next refresh will reveal the responses automatically.
 */
export function SessionRefresher({ sessionStatus }: { sessionStatus: string }) {
  const router = useRouter();

  useEffect(() => {
    if (sessionStatus !== "waiting") return;
    const id = setInterval(() => router.refresh(), 15_000);
    return () => clearInterval(id);
  }, [sessionStatus, router]);

  return null;
}
