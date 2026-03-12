"use client";

/**
 * Renders a timestamp in the user's local browser timezone.
 * Using a client component avoids the server/UTC mismatch.
 */
export function LocalTime({
  dateStr,
  options = { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
}: {
  dateStr: string;
  options?: Intl.DateTimeFormatOptions;
}) {
  return (
    <time dateTime={dateStr} suppressHydrationWarning>
      {new Date(dateStr).toLocaleString(undefined, options)}
    </time>
  );
}
