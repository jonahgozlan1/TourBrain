import type { Document } from "@/lib/types/domain";
import { ShowWidget } from "@/components/show/ShowWidget";

export function ShowDocuments({ documents }: { documents: Document[] }) {
  return (
    <ShowWidget title="Documents">
      {documents.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No documents attached.</p>
      ) : (
        <ul className="space-y-2.5">
          {documents.map((doc) => (
            <li key={doc.id}>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-baseline justify-between gap-3 rounded-[var(--radius-sm)] -mx-1 px-1 py-0.5 transition-colors hover:bg-[var(--ink-softer)]"
              >
                <span className="min-w-0 truncate text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline">
                  {doc.fileName}
                </span>
                <span className="shrink-0 text-xs capitalize text-[var(--muted)]">
                  {doc.documentType.replace("_", " ")}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </ShowWidget>
  );
}
