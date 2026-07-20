import Link from "next/link";
import { redirect } from "next/navigation";
import { EditTourForm } from "@/components/settings/EditTourForm";
import { getPrimaryTour } from "@/lib/db/queries";

export default async function TourSettingsPage() {
  let tour;
  try {
    tour = await getPrimaryTour();
  } catch {
    redirect("/tour/new");
  }

  if (!tour) redirect("/tour/new");

  return (
    <main className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
          Tour settings
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Edit the tour you&apos;re managing in Loadin.
        </p>
      </div>

      <div className="soft-panel">
        <EditTourForm tour={tour} />
      </div>

      <p className="text-sm text-[var(--muted)]">
        Need to change shows?{" "}
        <Link
          href="/tour"
          className="text-[var(--ink)] underline-offset-2 hover:underline"
        >
          Open the tour dashboard
        </Link>
        .
      </p>
    </main>
  );
}
