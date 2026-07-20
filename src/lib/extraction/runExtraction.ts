import { classifyDocument, isTravelDocumentType } from "@/lib/extraction/classify";
import { extractContract } from "@/lib/extraction/extractContract";
import { extractHotel } from "@/lib/extraction/extractHotel";
import { extractTravel } from "@/lib/extraction/extractTravel";
import { matchShowForAttach, matchShowToTour } from "@/lib/extraction/matchShow";
import { extractDocumentText } from "@/lib/extraction/pdfText";
import type { ProposedReviewPayload } from "@/lib/extraction/applyExtraction";
import type { Show } from "@/lib/types/domain";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function runDocumentExtraction(input: {
  supabase: SupabaseClient;
  documentId: string;
  tourShows: Show[];
}): Promise<{ status: "ready_for_review" | "failed"; message?: string }> {
  const { supabase, documentId, tourShows } = input;

  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (docError || !doc) {
    throw new Error(docError?.message ?? "Document not found");
  }

  await supabase
    .from("documents")
    .update({
      extraction_status: "processing",
      extraction_error: null,
    })
    .eq("id", documentId);

  try {
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("tour-documents")
      .download(doc.file_url);

    if (downloadError || !fileData) {
      throw new Error(downloadError?.message ?? "Could not download file");
    }

    const buffer = await fileData.arrayBuffer();
    const mimeType = fileData.type || guessMime(doc.file_name);
    const { text, empty } = await extractDocumentText(
      buffer,
      mimeType,
      doc.file_name,
    );

    if (empty) {
      await failDoc(
        supabase,
        documentId,
        "No readable text found. Upload a text-based PDF or .txt file (scanned images need OCR later).",
      );
      return { status: "failed", message: "No readable text" };
    }

    await supabase
      .from("documents")
      .update({ raw_text: text })
      .eq("id", documentId);

    const classification = await classifyDocument(text, doc.file_name);

    await supabase
      .from("documents")
      .update({ document_type: classification.documentType })
      .eq("id", documentId);

    let proposed: ProposedReviewPayload;

    if (classification.documentType === "contract") {
      const extraction = await extractContract(text, doc.file_name);
      const match = matchShowToTour(extraction, tourShows);
      proposed = { kind: "contract", extraction, match };
    } else if (isTravelDocumentType(classification.documentType)) {
      if (tourShows.length === 0) {
        await failDoc(
          supabase,
          documentId,
          "Add or import a show first, then attach travel to it.",
        );
        return { status: "failed", message: "No shows on tour" };
      }
      const extraction = await extractTravel(text, doc.file_name);
      const match = matchShowForAttach(tourShows, extraction.matched_show_hint);
      proposed = { kind: "travel", extraction, match };
    } else if (classification.documentType === "hotel") {
      if (tourShows.length === 0) {
        await failDoc(
          supabase,
          documentId,
          "Add or import a show first, then attach a hotel to it.",
        );
        return { status: "failed", message: "No shows on tour" };
      }
      const extraction = await extractHotel(text, doc.file_name);
      const match = matchShowForAttach(tourShows, extraction.matched_show_hint);
      proposed = { kind: "hotel", extraction, match };
    } else {
      await failDoc(
        supabase,
        documentId,
        `Detected as ${classification.documentType}. Supported types: contract, travel (flight/bus/train), hotel.`,
      );
      return {
        status: "failed",
        message: `Unsupported type: ${classification.documentType}`,
      };
    }

    await supabase
      .from("extraction_reviews")
      .delete()
      .eq("document_id", documentId)
      .eq("status", "pending");

    const { error: reviewError } = await supabase
      .from("extraction_reviews")
      .insert({
        document_id: documentId,
        proposed_payload: proposed,
        status: "pending",
      });

    if (reviewError) throw reviewError;

    const { error: updateError } = await supabase
      .from("documents")
      .update({
        extracted_json: proposed.extraction,
        extraction_status: "ready_for_review",
        extraction_error: null,
        document_type:
          proposed.kind === "travel"
            ? "travel"
            : proposed.kind === "hotel"
              ? "hotel"
              : "contract",
      })
      .eq("id", documentId);

    if (updateError) {
      // Fallback if travel enum not migrated yet — store as flight
      if (
        proposed.kind === "travel" &&
        updateError.message.toLowerCase().includes("travel")
      ) {
        const { error: fallbackError } = await supabase
          .from("documents")
          .update({
            extracted_json: proposed.extraction,
            extraction_status: "ready_for_review",
            extraction_error: null,
            document_type: "flight",
          })
          .eq("id", documentId);
        if (fallbackError) throw fallbackError;
      } else {
        throw updateError;
      }
    }

    return { status: "ready_for_review" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";
    await failDoc(supabase, documentId, message);
    return { status: "failed", message };
  }
}

async function failDoc(
  supabase: SupabaseClient,
  documentId: string,
  message: string,
) {
  await supabase
    .from("documents")
    .update({
      extraction_status: "failed",
      extraction_error: message,
    })
    .eq("id", documentId);
}

function guessMime(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".txt")) return "text/plain";
  if (lower.endsWith(".csv")) return "text/csv";
  return "application/octet-stream";
}
