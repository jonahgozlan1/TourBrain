import type {
  ContractExtraction,
  HotelExtraction,
  TravelExtraction,
} from "@/lib/extraction/schemas";
import type {
  AttachMatchResult,
  ShowMatchResult,
} from "@/lib/extraction/matchShow";
import type { TravelType } from "@/lib/types/domain";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ConfirmContractInput = {
  supabase: SupabaseClient;
  userId: string;
  tourId: string;
  documentId: string;
  reviewId: string;
  action: "create" | "update";
  matchedShowId: string | null;
  showFields: {
    date: string;
    city: string | null;
    country: string | null;
    venue: string | null;
    promoter: string | null;
    loadInTime: string | null;
    soundcheckTime: string | null;
    doorsTime: string | null;
    showTime: string | null;
    curfew: string | null;
  };
  contact: ContractExtraction["contact"];
};

export type ConfirmTravelInput = {
  supabase: SupabaseClient;
  tourId: string;
  documentId: string;
  reviewId: string;
  showId: string;
  travel: {
    type: TravelType;
    date: string | null;
    departure: string | null;
    arrival: string | null;
    departureTime: string | null;
    arrivalTime: string | null;
    confirmationNumber: string | null;
    notes: string | null;
  };
};

export type ConfirmHotelInput = {
  supabase: SupabaseClient;
  tourId: string;
  documentId: string;
  reviewId: string;
  showId: string;
  hotel: {
    name: string | null;
    address: string | null;
    checkIn: string | null;
    checkOut: string | null;
    confirmationNumber: string | null;
    notes: string | null;
  };
};

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const text = value.trim();
  return text.length ? text : null;
}

async function assertShowOnTour(
  supabase: SupabaseClient,
  showId: string,
  tourId: string,
) {
  const { data, error } = await supabase
    .from("shows")
    .select("id")
    .eq("id", showId)
    .eq("tour_id", tourId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Selected show not found on this tour.");
}

async function markDocumentApplied(
  supabase: SupabaseClient,
  documentId: string,
  showId: string,
  documentType: string,
) {
  const { error } = await supabase
    .from("documents")
    .update({
      show_id: showId,
      document_type: documentType,
      extraction_status: "applied",
      extraction_error: null,
    })
    .eq("id", documentId);
  if (error) throw error;
}

async function markReviewConfirmed(
  supabase: SupabaseClient,
  reviewId: string,
) {
  const { error } = await supabase
    .from("extraction_reviews")
    .update({
      status: "confirmed",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reviewId);
  if (error) throw error;
}

export async function applyContractExtraction(
  input: ConfirmContractInput,
): Promise<{ showId: string }> {
  const {
    supabase,
    userId,
    tourId,
    documentId,
    reviewId,
    action,
    matchedShowId,
    showFields,
    contact,
  } = input;

  const date = emptyToNull(showFields.date);
  if (!date) {
    throw new Error("Show date is required to confirm.");
  }

  const payload = {
    date,
    city: emptyToNull(showFields.city),
    country: emptyToNull(showFields.country),
    venue: emptyToNull(showFields.venue),
    promoter: emptyToNull(showFields.promoter),
    load_in_time: emptyToNull(showFields.loadInTime),
    soundcheck_time: emptyToNull(showFields.soundcheckTime),
    doors_time: emptyToNull(showFields.doorsTime),
    show_time: emptyToNull(showFields.showTime),
    curfew: emptyToNull(showFields.curfew),
    status: "confirmed" as const,
  };

  let showId: string;

  if (action === "update" && matchedShowId) {
    const { error } = await supabase
      .from("shows")
      .update(payload)
      .eq("id", matchedShowId)
      .eq("tour_id", tourId);
    if (error) throw error;
    showId = matchedShowId;
  } else {
    const { data, error } = await supabase
      .from("shows")
      .insert({ ...payload, tour_id: tourId })
      .select("id")
      .single();
    if (error) throw error;
    showId = data.id;
  }

  const contactName = emptyToNull(contact?.name ?? null);
  if (contactName) {
    const { data: contactRow, error: contactError } = await supabase
      .from("contacts")
      .insert({
        user_id: userId,
        name: contactName,
        company: emptyToNull(contact?.company ?? null),
        role: emptyToNull(contact?.role ?? null),
        email: emptyToNull(contact?.email ?? null),
        phone: emptyToNull(contact?.phone ?? null),
      })
      .select("id")
      .single();

    if (contactError) throw contactError;

    const { error: linkError } = await supabase.from("show_contacts").upsert({
      show_id: showId,
      contact_id: contactRow.id,
    });
    if (linkError) throw linkError;
  }

  await markDocumentApplied(supabase, documentId, showId, "contract");
  await markReviewConfirmed(supabase, reviewId);

  return { showId };
}

export async function applyTravelExtraction(
  input: ConfirmTravelInput,
): Promise<{ showId: string }> {
  const { supabase, tourId, documentId, reviewId, showId, travel } = input;

  await assertShowOnTour(supabase, showId, tourId);

  const conf = emptyToNull(travel.confirmationNumber);
  if (conf) {
    const { data: existing } = await supabase
      .from("travel")
      .select("id")
      .eq("show_id", showId)
      .eq("confirmation_number", conf)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("travel")
        .update({
          type: travel.type,
          date: emptyToNull(travel.date),
          departure: emptyToNull(travel.departure),
          arrival: emptyToNull(travel.arrival),
          departure_time: emptyToNull(travel.departureTime),
          arrival_time: emptyToNull(travel.arrivalTime),
          notes: emptyToNull(travel.notes),
        })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("travel").insert({
        show_id: showId,
        type: travel.type,
        date: emptyToNull(travel.date),
        departure: emptyToNull(travel.departure),
        arrival: emptyToNull(travel.arrival),
        departure_time: emptyToNull(travel.departureTime),
        arrival_time: emptyToNull(travel.arrivalTime),
        confirmation_number: conf,
        notes: emptyToNull(travel.notes),
      });
      if (error) throw error;
    }
  } else {
    const { error } = await supabase.from("travel").insert({
      show_id: showId,
      type: travel.type,
      date: emptyToNull(travel.date),
      departure: emptyToNull(travel.departure),
      arrival: emptyToNull(travel.arrival),
      departure_time: emptyToNull(travel.departureTime),
      arrival_time: emptyToNull(travel.arrivalTime),
      confirmation_number: null,
      notes: emptyToNull(travel.notes),
    });
    if (error) throw error;
  }

  await markDocumentApplied(supabase, documentId, showId, "travel");
  await markReviewConfirmed(supabase, reviewId);

  return { showId };
}

export async function applyHotelExtraction(
  input: ConfirmHotelInput,
): Promise<{ showId: string }> {
  const { supabase, tourId, documentId, reviewId, showId, hotel } = input;

  await assertShowOnTour(supabase, showId, tourId);

  const conf = emptyToNull(hotel.confirmationNumber);
  if (conf) {
    const { data: existing } = await supabase
      .from("hotels")
      .select("id")
      .eq("show_id", showId)
      .eq("confirmation_number", conf)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("hotels")
        .update({
          name: emptyToNull(hotel.name),
          address: emptyToNull(hotel.address),
          check_in: emptyToNull(hotel.checkIn),
          check_out: emptyToNull(hotel.checkOut),
          notes: emptyToNull(hotel.notes),
        })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("hotels").insert({
        show_id: showId,
        name: emptyToNull(hotel.name),
        address: emptyToNull(hotel.address),
        check_in: emptyToNull(hotel.checkIn),
        check_out: emptyToNull(hotel.checkOut),
        confirmation_number: conf,
        notes: emptyToNull(hotel.notes),
      });
      if (error) throw error;
    }
  } else {
    const { error } = await supabase.from("hotels").insert({
      show_id: showId,
      name: emptyToNull(hotel.name),
      address: emptyToNull(hotel.address),
      check_in: emptyToNull(hotel.checkIn),
      check_out: emptyToNull(hotel.checkOut),
      confirmation_number: null,
      notes: emptyToNull(hotel.notes),
    });
    if (error) throw error;
  }

  await markDocumentApplied(supabase, documentId, showId, "hotel");
  await markReviewConfirmed(supabase, reviewId);

  return { showId };
}

export type ProposedReviewPayload =
  | {
      kind: "contract";
      extraction: ContractExtraction;
      match: ShowMatchResult;
    }
  | {
      kind: "travel";
      extraction: TravelExtraction;
      match: AttachMatchResult;
    }
  | {
      kind: "hotel";
      extraction: HotelExtraction;
      match: AttachMatchResult;
    };
