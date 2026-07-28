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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82Z" />
    </svg>
  );
}
