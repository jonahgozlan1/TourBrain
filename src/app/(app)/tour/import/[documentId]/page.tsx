import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDocumentReviewData,
  retryExtractionAction,
} from "@/app/actions/documents";
import { ContractReviewForm } from "@/components/import/ContractReviewForm";
import { HotelReviewForm } from "@/components/import/HotelReviewForm";
import { TravelReviewForm } from "@/components/import/TravelReviewForm";
import type { ProposedReviewPayload } from "@/lib/extraction/applyExtraction";
import type { ContractExtraction } from "@/lib/extraction/schemas";
import type { ShowMatchResult } from "@/lib/extraction/matchShow";

type Props = {
  params: Promise<{ documentId: string }>;
};

function normalizePayload(raw: unknown): ProposedReviewPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const payload = raw as Record<string, unknown>;

  if (
    payload.kind === "contract" ||
    payload.kind === "travel" ||
    payload.kind === "hotel"
  ) {
    return payload as ProposedReviewPayload;
  }

  const extraction = payload.extraction as ContractExtraction | undefined;
  if (extraction?.document_type === "contract" && payload.match) {
    return {
      kind: "contract",
      extraction,
      match: payload.match as ShowMatchResult,
    };
  }

  return null;
}

export default async function ImportReviewPage({ params }: Props) {
  const { documentId } = await params;
  const data = await getDocumentReviewData(documentId);
  if (!data) notFound();

  const { document, review, shows } = data;
  const payload = normalizePayload(review?.proposed_payload);

  return (
    <main className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]">
          <Link
            href="/tour/import"
            className="transition-colors hover:text-[var(--ink)]"
          >
            Import
          </Link>
          <span className="mx-2 text-[var(--ink-soft)]">·</span>
          <span className="text-[var(--ink)]">{document.file_name}</span>
        </p>
        <Link
          href="/tour/import"
          className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
        >
          Done
        </Link>
      </div>

      {document.extraction_status === "ready_for_review" &&
      review &&
      payload ? (
        payload.kind === "contract" ? (
          <ContractReviewForm
            documentId={document.id}
            reviewId={review.id}
            fileName={document.file_name}
            extraction={payload.extraction}
            match={payload.match}
          />
        ) : payload.kind === "travel" ? (
          <TravelReviewForm
            documentId={document.id}
            reviewId={review.id}
            fileName={document.file_name}
            extraction={payload.extraction}
            match={payload.match}
            shows={shows}
          />
        ) : (
          <HotelReviewForm
            documentId={document.id}
            reviewId={review.id}
            fileName={document.file_name}
            extraction={payload.extraction}
            match={payload.match}
            shows={shows}
          />
        )
      ) : document.extraction_status === "failed" ? (
        <div className="danger-panel space-y-4">
          <h1 className="font-display text-2xl text-[var(--ink)]">
            Extraction failed
          </h1>
          <p className="text-sm text-[var(--ink)]">{document.file_name}</p>
          <p className="text-sm text-[var(--danger)]">
            {document.extraction_error ?? "Unknown error"}
          </p>
          <form
            action={async () => {
              "use server";
              await retryExtractionAction(documentId);
            }}
          >
            <button
              type="submit"
              className="btn-primary"
            >
              Retry extraction
            </button>
          </form>
        </div>
      ) : document.extraction_status === "applied" ? (
        <div className="space-y-3">
          <h1 className="font-display text-2xl text-[var(--ink)]">
            Already applied
          </h1>
          <p className="text-sm text-[var(--muted)]">{document.file_name}</p>
          {document.show_id ? (
            <Link
              href={`/tour/shows/${document.show_id}`}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              View show
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <h1 className="font-display text-2xl text-[var(--ink)]">
            Processing
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Status: {document.extraction_status}
          </p>
        </div>
      )}
    </main>
  );
}
