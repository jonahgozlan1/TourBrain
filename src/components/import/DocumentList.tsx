import Link from "next/link";
import type { Document } from "@/lib/types/domain";

const STATUS_LABEL: Record<Document["extractionStatus"], string> = {
  pending: "Pending",
  processing: "Processing",
  ready_for_review: "Ready to review",
  applied: "Applied",
  failed: "Failed",
};

export function DocumentList({ documents }: { documents: Document[] }) {
  if (documents.length === 0) {
    return (
      <div className="empty-state !py-8">
        <p className="font-display text-lg tracking-tight text-[var(--ink)]">
          No documents yet
        </p>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-[var(--muted)]">
          Uploaded contracts and travel docs will show up here.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[var(--ink-soft)]">
      {documents.map((doc) => {
        const href =
          doc.extractionStatus === "ready_for_review" ||
          doc.extractionStatus === "failed"
            ? `/tour/import/${doc.id}`
            : doc.showId
              ? `/tour/shows/${doc.showId}`
              : `/tour/import/${doc.id}`;

        return (
          <li key={doc.id}>
            <Link
              href={href}
              className="-mx-2 flex items-baseline justify-between gap-4 rounded-[var(--radius-sm)] px-2 py-3.5 transition-colors hover:bg-[var(--ink-softer)]"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[var(--ink)]">
                  {doc.fileName}
                </p>
                <p className="text-xs capitalize text-[var(--muted)]">
                  {doc.documentType.replace("_", " ")}
                  {doc.extractionError ? ` · ${doc.extractionError}` : ""}
                </p>
              </div>
              <span
                className={`shrink-0 text-xs ${
                  doc.extractionStatus === "failed"
                    ? "text-[var(--danger)]"
                    : doc.extractionStatus === "ready_for_review"
                      ? "font-medium text-[var(--accent)]"
                      : "text-[var(--muted)]"
                }`}
              >
                {STATUS_LABEL[doc.extractionStatus]}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
