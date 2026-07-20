import { CreateTourForm } from "@/components/tour/CreateTourForm";
import { SchemaSetupNotice } from "@/components/setup/SchemaSetupNotice";
import { getPrimaryTour } from "@/lib/db/queries";
import { redirect } from "next/navigation";

export default async function NewTourPage() {
  try {
    const existing = await getPrimaryTour();
    if (existing) redirect("/tour");
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

  return (
    <main>
      <h1 className="font-display text-3xl leading-[1.05] tracking-tight text-[var(--ink)] sm:text-4xl">
        Create your tour
      </h1>
      <p className="mt-3 mb-8 max-w-md text-base leading-relaxed text-[var(--muted)] sm:text-lg sm:font-light">
        One tour for now. Add shows next — document import comes in Phase 2.
      </p>
      <CreateTourForm />
    </main>
  );
}
