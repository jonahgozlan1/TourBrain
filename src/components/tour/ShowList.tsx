import Link from "next/link";
import type { Show } from "@/lib/types/domain";
import { formatShortDate, formatTime } from "@/lib/format";
import { getShowGaps } from "@/lib/gaps/showGaps";

export function ShowList({ shows }: { shows: Show[] }) {
  const sorted = [...shows].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <ul className="space-y-2.5">
      {sorted.map((show) => {
        const gapCount = getShowGaps(show).length;
        return (
          <li key={show.id}>
            <Link
              href={`/tour/shows/${show.id}`}
              className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] bg-[var(--surface)] px-4 py-4 transition-colors hover:bg-[var(--surface-2)] sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <span className="w-[4.5rem] shrink-0 text-center text-base font-bold tabular-nums text-[var(--muted)]">
                  {formatShortDate(show.date)}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-[var(--ink)]">
                    {show.city ?? "TBD"}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-[var(--muted)]">
                    {show.venue ?? "Venue TBD"}
                    {show.showTime ? ` · ${formatTime(show.showTime)}` : ""}
                  </p>
                </div>
              </div>
              {gapCount > 0 ? (
                <span className="shrink-0 text-sm font-medium text-[var(--accent)]">
                  {gapCount} missing
                </span>
              ) : (
                <span className="shrink-0 text-sm text-[var(--muted)]">Ready</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
