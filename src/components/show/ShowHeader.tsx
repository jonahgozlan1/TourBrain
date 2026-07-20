import Link from "next/link";
import type { Show } from "@/lib/types/domain";
import { formatShowDate } from "@/lib/format";

export function ShowHeader({ show }: { show: Show }) {
  return (
    <header>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">
          {formatShowDate(show.date)}
        </p>
        <Link
          href={`/tour/shows/${show.id}/edit`}
          className="text-sm font-medium text-[var(--accent)] transition-opacity hover:opacity-70"
        >
          Edit
        </Link>
      </div>
      <h1 className="mt-2 font-display text-4xl leading-[1.05] tracking-tight text-[var(--ink)] sm:text-5xl sm:leading-[1.02]">
        {show.city ?? "Untitled show"}
      </h1>
      <p className="mt-3 text-lg text-[var(--muted)] sm:text-xl sm:font-light">
        {[show.venue, show.country].filter(Boolean).join(" · ") || "Venue TBD"}
      </p>
    </header>
  );
}
