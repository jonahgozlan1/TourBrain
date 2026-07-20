import { notFound } from "next/navigation";
import { DeleteShowButton } from "@/components/show/DeleteShowButton";
import { ShowForm } from "@/components/show/ShowForm";
import { getShowDetail } from "@/lib/db/queries";

type Props = {
  params: Promise<{ showId: string }>;
};

export default async function EditShowPage({ params }: Props) {
  const { showId } = await params;
  const show = await getShowDetail(showId);
  if (!show) notFound();

  const label = show.city ?? "this show";

  return (
    <main className="space-y-8">
      <div>
        <p className="text-sm text-[var(--muted)]">
          {show.city ?? "Untitled show"}
        </p>
        <h1 className="mt-1 font-display text-3xl leading-[1.05] tracking-tight text-[var(--ink)] sm:text-4xl">
          Edit show
        </h1>
      </div>
      <ShowForm
        tourId={show.tourId}
        show={show}
        cancelHref={`/tour/shows/${show.id}`}
      />

      <div className="border-t border-[var(--ink-soft)] pt-6">
        <p className="section-label">Danger zone</p>
        <p className="mb-3 text-sm text-[var(--muted)]">
          Permanently remove this show from the tour.
        </p>
        <DeleteShowButton showId={show.id} label={label} />
      </div>
    </main>
  );
}
