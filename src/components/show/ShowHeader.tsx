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
          className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-[var(--ink)] transition-colors hover:bg-[var(--ink-soft)]"
          aria-label="Edit show"
          title="Edit show"
        >
          <EditIcon />
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

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m13.5 6.5 3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
