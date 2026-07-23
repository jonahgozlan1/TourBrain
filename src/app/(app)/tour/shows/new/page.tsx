import { redirect } from "next/navigation";
import { ShowForm } from "@/components/show/ShowForm";
import { getPrimaryTour } from "@/lib/db/queries";

export default async function NewShowPage() {
  const tour = await getPrimaryTour();
  if (!tour) redirect("/tour/new");

  return (
    <main className="min-w-0 space-y-6">
      <div>
        <p className="text-sm text-[var(--muted)]">{tour.name}</p>
        <h1 className="mt-1 font-display text-3xl leading-[1.05] tracking-tight text-[var(--ink)] sm:text-4xl">
          Add show
        </h1>
      </div>
      <ShowForm tourId={tour.id} cancelHref="/tour" />
    </main>
  );
}
