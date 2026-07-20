"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  applyContractExtraction,
  applyHotelExtraction,
  applyTravelExtraction,
} from "@/lib/extraction/applyExtraction";
import type { ContractExtraction } from "@/lib/extraction/schemas";
import { runDocumentExtraction } from "@/lib/extraction/runExtraction";
import { ensureProfile, getPrimaryTour } from "@/lib/db/queries";
import { mapShow } from "@/lib/db/mappers";
import type { ShowRow } from "@/lib/db/mappers";
import type { TravelType } from "@/lib/types/domain";

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

export async function uploadAndExtractAction(formData: FormData) {
  const { supabase, user } = await ensureProfile();
  const tour = await getPrimaryTour();
  if (!tour) {
    return { error: "Create a tour before importing documents." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }

  const documentId = crypto.randomUUID();
  const safeName = file.name.replace(/[^\w.\-()+ ]+/g, "_");
  const storagePath = `${user.id}/${tour.id}/${documentId}/${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("tour-documents")
    .upload(storagePath, file, {
      contentType: file.type || undefined,
      upsert: false,
    });

  if (uploadError) {
    return {
      error: `Upload failed: ${uploadError.message}. Make sure migration 002 (storage bucket) has been run.`,
    };
  }

  const { error: insertError } = await supabase.from("documents").insert({
    id: documentId,
    tour_id: tour.id,
    file_url: storagePath,
    file_name: file.name,
    document_type: "other",
    extraction_status: "pending",
  });

  if (insertError) {
    await supabase.storage.from("tour-documents").remove([storagePath]);
    return { error: insertError.message };
  }

  await runDocumentExtraction({
    supabase,
    documentId,
    tourShows: tour.shows,
  });

  revalidatePath("/tour/import");
  revalidatePath(`/tour/import/${documentId}`);
  redirect(`/tour/import/${documentId}`);
}

export async function retryExtractionAction(documentId: string) {
  const { supabase } = await ensureProfile();
  const tour = await getPrimaryTour();
  if (!tour) return { error: "No tour found." };

  const result = await runDocumentExtraction({
    supabase,
    documentId,
    tourShows: tour.shows,
  });

  revalidatePath("/tour/import");
  revalidatePath(`/tour/import/${documentId}`);

  if (result.status === "ready_for_review") {
    redirect(`/tour/import/${documentId}`);
  }

  return { error: result.message ?? "Extraction failed" };
}

export async function confirmExtractionAction(formData: FormData) {
  const { supabase, user } = await ensureProfile();
  const tour = await getPrimaryTour();
  if (!tour) return { error: "No tour found." };

  const kind = emptyToNull(formData.get("kind")) as
    | "contract"
    | "travel"
    | "hotel"
    | null;
  const documentId = emptyToNull(formData.get("documentId"));
  const reviewId = emptyToNull(formData.get("reviewId"));

  if (!kind || !documentId || !reviewId) {
    return { error: "Missing review data." };
  }

  try {
    let showId: string;

    if (kind === "contract") {
      const action = emptyToNull(formData.get("action")) as
        | "create"
        | "update"
        | null;
      if (!action) return { error: "Missing action." };

      const contactRaw = emptyToNull(formData.get("contactJson"));
      let contact: ContractExtraction["contact"] = null;
      if (contactRaw) {
        try {
          contact = JSON.parse(contactRaw) as ContractExtraction["contact"];
        } catch {
          contact = null;
        }
      }

      ({ showId } = await applyContractExtraction({
        supabase,
        userId: user.id,
        tourId: tour.id,
        documentId,
        reviewId,
        action,
        matchedShowId: emptyToNull(formData.get("matchedShowId")),
        showFields: {
          date: emptyToNull(formData.get("date")) ?? "",
          city: emptyToNull(formData.get("city")),
          country: emptyToNull(formData.get("country")),
          venue: emptyToNull(formData.get("venue")),
          promoter: emptyToNull(formData.get("promoter")),
          loadInTime: emptyToNull(formData.get("loadInTime")),
          soundcheckTime: emptyToNull(formData.get("soundcheckTime")),
          doorsTime: emptyToNull(formData.get("doorsTime")),
          showTime: emptyToNull(formData.get("showTime")),
          curfew: emptyToNull(formData.get("curfew")),
        },
        contact,
      }));
    } else if (kind === "travel") {
      const showIdField = emptyToNull(formData.get("showId"));
      if (!showIdField) return { error: "Select a show to attach travel." };

      const type = (emptyToNull(formData.get("type")) ?? "flight") as TravelType;

      ({ showId } = await applyTravelExtraction({
        supabase,
        tourId: tour.id,
        documentId,
        reviewId,
        showId: showIdField,
        travel: {
          type,
          date: emptyToNull(formData.get("date")),
          departure: emptyToNull(formData.get("departure")),
          arrival: emptyToNull(formData.get("arrival")),
          departureTime: emptyToNull(formData.get("departureTime")),
          arrivalTime: emptyToNull(formData.get("arrivalTime")),
          confirmationNumber: emptyToNull(formData.get("confirmationNumber")),
          notes: emptyToNull(formData.get("notes")),
        },
      }));
    } else {
      const showIdField = emptyToNull(formData.get("showId"));
      if (!showIdField) return { error: "Select a show to attach the hotel." };

      ({ showId } = await applyHotelExtraction({
        supabase,
        tourId: tour.id,
        documentId,
        reviewId,
        showId: showIdField,
        hotel: {
          name: emptyToNull(formData.get("name")),
          address: emptyToNull(formData.get("address")),
          checkIn: emptyToNull(formData.get("checkIn")),
          checkOut: emptyToNull(formData.get("checkOut")),
          confirmationNumber: emptyToNull(formData.get("confirmationNumber")),
          notes: emptyToNull(formData.get("notes")),
        },
      }));
    }

    revalidatePath("/tour");
    revalidatePath("/tour/import");
    revalidatePath(`/tour/shows/${showId}`);
    redirect(`/tour/shows/${showId}`);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to apply extraction",
    };
  }
}

export async function discardExtractionAction(formData: FormData) {
  const { supabase } = await ensureProfile();
  const documentId = emptyToNull(formData.get("documentId"));
  const reviewId = emptyToNull(formData.get("reviewId"));

  if (!documentId || !reviewId) {
    return { error: "Missing review data." };
  }

  await supabase
    .from("extraction_reviews")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

  await supabase
    .from("documents")
    .update({
      extraction_status: "failed",
      extraction_error: "Discarded by user",
    })
    .eq("id", documentId);

  revalidatePath("/tour/import");
  redirect("/tour/import");
}

export async function getDocumentReviewData(documentId: string) {
  const { supabase, user } = await ensureProfile();

  const { data: doc, error } = await supabase
    .from("documents")
    .select("*, tours!inner(user_id)")
    .eq("id", documentId)
    .eq("tours.user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!doc) return null;

  const { data: review } = await supabase
    .from("extraction_reviews")
    .select("*")
    .eq("document_id", documentId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: shows } = await supabase
    .from("shows")
    .select("*")
    .eq("tour_id", doc.tour_id)
    .order("date", { ascending: true });

  return {
    document: doc,
    review,
    shows: (shows ?? []).map((row) => mapShow(row as ShowRow)),
  };
}
