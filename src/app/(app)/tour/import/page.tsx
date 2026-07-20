import { redirect } from "next/navigation";
import { DocumentList } from "@/components/import/DocumentList";
import { UploadZone } from "@/components/import/UploadZone";
import { SchemaSetupNotice } from "@/components/setup/SchemaSetupNotice";
import { getPrimaryTour, listTourDocuments } from "@/lib/db/queries";

export default async function ImportPage() {
  let tour;
  let documents;
  try {
    tour = await getPrimaryTour();
    if (!tour) redirect("/tour/new");
    documents = await listTourDocuments();
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
    <main className="space-y-10">
      <div>
        <h1 className="font-display text-3xl leading-[1.05] tracking-tight text-[var(--ink)] sm:text-4xl">
          Import information
        </h1>
        <p className="mt-3 max-w-lg text-base leading-relaxed text-[var(--muted)] sm:text-lg sm:font-light">
          Upload contracts, travel, or hotels. Tourbase extracts structured
          fields &amp; you review before anything is saved.
        </p>
      </div>

      <UploadZone />

      <section>
        <h2 className="section-label">Documents</h2>
        <DocumentList documents={documents} />
      </section>
    </main>
  );
}
