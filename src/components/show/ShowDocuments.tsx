import type { Document } from "@/lib/types/domain";
import { formatFileName } from "@/lib/format";
import { ShowWidget } from "@/components/show/ShowWidget";

export function ShowDocuments({ documents }: { documents: Document[] }) {
  return (
    <ShowWidget title="Documents">
      {documents.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No documents attached.</p>
      ) : (
        <ul className="min-w-0 space-y-2.5">
          {documents.map((doc) => (
            <li key={doc.id} className="min-w-0">
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={doc.fileName}
                className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-sm)] -mx-1 px-1 py-0.5 transition-colors hover:bg-[var(--ink-softer)]"
              >
                <span className="min-w-0 truncate text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline">
                  {formatFileName(doc.fileName)}
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
