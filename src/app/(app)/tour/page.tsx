import Link from "next/link";
import { redirect } from "next/navigation";
import { ShowList } from "@/components/tour/ShowList";
import { getPrimaryTour } from "@/lib/db/queries";
import { getShowGaps } from "@/lib/gaps/showGaps";
import { SchemaSetupNotice } from "@/components/setup/SchemaSetupNotice";

export default async function TourDashboardPage() {
  let tour;
  try {
    tour = await getPrimaryTour();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes("schema cache") ||
      message.includes("Could not find the table") ||
      message.includes("PGRST205")
    ) {
      return <SchemaSetupNotice />;
    }
    throw err;
  }

  if (!tour) {
    redirect("/tour/new");
  }

  const gapShows = tour.shows.filter((s) => getShowGaps(s).length > 0).length;

  return (
    <main>
      <div>
        <p className="text-sm text-[var(--muted)]">{tour.artistName}</p>
        <div className="mt-1 flex items-center justify-between gap-4">
          <h1 className="min-w-0 font-display text-3xl leading-[1.05] tracking-tight text-[var(--ink)] sm:text-4xl sm:leading-[1.02]">
            {tour.name}
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/tour/shows/new"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-[var(--ink)] transition-colors hover:bg-[var(--ink-soft)]"
              aria-label="Add show"
              title="Add show"
            >
              <PlusIcon />
            </Link>
            <Link
              href="/tour/import"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--ink)] text-[var(--paper)] transition-opacity hover:opacity-90"
              aria-label="Import"
              title="Import"
            >
              <UploadIcon />
            </Link>
          </div>
        </div>
      </div>

      {gapShows > 0 ? (
        <p className="mt-5 text-sm font-medium text-[var(--accent)]">
          {gapShows} show{gapShows === 1 ? "" : "s"} still need information
        </p>
      ) : null}

      <section className="mt-10">
        <h2 className="section-label">Shows</h2>
        {tour.shows.length === 0 ? (
          <div className="empty-state">
            <p className="font-display text-xl tracking-tight text-[var(--ink)]">
              No shows yet
            </p>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[var(--muted)]">
              Add a show manually, or import a contract to get started.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              <Link href="/tour/shows/new" className="btn-primary">
                Add show
              </Link>
              <Link href="/tour/import" className="btn-text">
                Import a document
              </Link>
            </div>
          </div>
        ) : (
          <ShowList shows={tour.shows} />
        )}
      </section>
    </main>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16V4M12 4l-4.5 4.5M12 4l4.5 4.5M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
