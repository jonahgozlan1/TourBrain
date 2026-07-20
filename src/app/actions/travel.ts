"use server";

import { revalidatePath } from "next/cache";
import { ensureProfile } from "@/lib/db/queries";
import type { TravelType } from "@/lib/types/domain";

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

export async function addTravelAction(formData: FormData) {
  const { supabase, user } = await ensureProfile();
  const showId = emptyToNull(formData.get("showId"));
  if (!showId) return { error: "Missing show." };

  const { data: show, error: showError } = await supabase
    .from("shows")
    .select("id, tour_id, tours!inner(user_id)")
    .eq("id", showId)
    .eq("tours.user_id", user.id)
    .maybeSingle();

  if (showError) return { error: showError.message };
  if (!show) return { error: "Show not found." };

  const type = (emptyToNull(formData.get("type")) ?? "flight") as TravelType;

  const { error } = await supabase.from("travel").insert({
    show_id: showId,
    type,
    date: emptyToNull(formData.get("date")),
    departure: emptyToNull(formData.get("departure")),
    arrival: emptyToNull(formData.get("arrival")),
    departure_time: emptyToNull(formData.get("departureTime")),
    arrival_time: emptyToNull(formData.get("arrivalTime")),
    confirmation_number: emptyToNull(formData.get("confirmationNumber")),
    notes: emptyToNull(formData.get("notes")),
  });

  if (error) return { error: error.message };

  revalidatePath(`/tour/shows/${showId}`);
  revalidatePath("/tour");
  return { ok: true };
}

export async function addHotelAction(formData: FormData) {
  const { supabase, user } = await ensureProfile();
  const showId = emptyToNull(formData.get("showId"));
  if (!showId) return { error: "Missing show." };

  const { data: show, error: showError } = await supabase
    .from("shows")
    .select("id, tour_id, tours!inner(user_id)")
    .eq("id", showId)
    .eq("tours.user_id", user.id)
    .maybeSingle();

  if (showError) return { error: showError.message };
  if (!show) return { error: "Show not found." };

  const { error } = await supabase.from("hotels").insert({
    show_id: showId,
    name: emptyToNull(formData.get("name")),
    address: emptyToNull(formData.get("address")),
    check_in: emptyToNull(formData.get("checkIn")),
    check_out: emptyToNull(formData.get("checkOut")),
    confirmation_number: emptyToNull(formData.get("confirmationNumber")),
    notes: emptyToNull(formData.get("notes")),
  });

  if (error) return { error: error.message };

  revalidatePath(`/tour/shows/${showId}`);
  revalidatePath("/tour");
  return { ok: true };
}

export async function addContactAction(formData: FormData) {
  const { supabase, user } = await ensureProfile();
  const showId = emptyToNull(formData.get("showId"));
  const name = emptyToNull(formData.get("name"));

  if (!showId) return { error: "Missing show." };
  if (!name) return { error: "Name is required." };

  const { data: show, error: showError } = await supabase
    .from("shows")
    .select("id, tour_id, tours!inner(user_id)")
    .eq("id", showId)
    .eq("tours.user_id", user.id)
    .maybeSingle();

  if (showError) return { error: showError.message };
  if (!show) return { error: "Show not found." };

  const { data: contact, error: contactError } = await supabase
    .from("contacts")
    .insert({
      user_id: user.id,
      name,
      company: emptyToNull(formData.get("company")),
      role: emptyToNull(formData.get("role")),
      email: emptyToNull(formData.get("email")),
      phone: emptyToNull(formData.get("phone")),
    })
    .select("id")
    .single();

  if (contactError) return { error: contactError.message };

  const { error: linkError } = await supabase.from("show_contacts").upsert({
    show_id: showId,
    contact_id: contact.id,
  });

  if (linkError) return { error: linkError.message };

  revalidatePath(`/tour/shows/${showId}`);
  revalidatePath("/tour");
  return { ok: true };
}

async function assertOwnedShow(showId: string) {
  const { supabase, user } = await ensureProfile();

  const { data: show, error } = await supabase
    .from("shows")
    .select("id, tours!inner(user_id)")
    .eq("id", showId)
    .eq("tours.user_id", user.id)
    .maybeSingle();

  if (error) return { supabase, error: error.message as string };
  if (!show) return { supabase, error: "Show not found." as string };
  return { supabase, showId: show.id };
}

export async function deleteTravelAction(formData: FormData) {
  const showId = emptyToNull(formData.get("showId"));
  const travelId = emptyToNull(formData.get("travelId"));
  if (!showId || !travelId) return { error: "Missing travel." };

  const owned = await assertOwnedShow(showId);
  if ("error" in owned && owned.error) return { error: owned.error };

  const { error } = await owned.supabase
    .from("travel")
    .delete()
    .eq("id", travelId)
    .eq("show_id", showId);

  if (error) return { error: error.message };

  revalidatePath(`/tour/shows/${showId}`);
  revalidatePath("/tour");
  return { ok: true };
}

export async function deleteHotelAction(formData: FormData) {
  const showId = emptyToNull(formData.get("showId"));
  const hotelId = emptyToNull(formData.get("hotelId"));
  if (!showId || !hotelId) return { error: "Missing hotel." };

  const owned = await assertOwnedShow(showId);
  if ("error" in owned && owned.error) return { error: owned.error };

  const { error } = await owned.supabase
    .from("hotels")
    .delete()
    .eq("id", hotelId)
    .eq("show_id", showId);

  if (error) return { error: error.message };

  revalidatePath(`/tour/shows/${showId}`);
  revalidatePath("/tour");
  return { ok: true };
}

export async function removeContactFromShowAction(formData: FormData) {
  const showId = emptyToNull(formData.get("showId"));
  const contactId = emptyToNull(formData.get("contactId"));
  if (!showId || !contactId) return { error: "Missing contact." };

  const owned = await assertOwnedShow(showId);
  if ("error" in owned && owned.error) return { error: owned.error };

  const { error: unlinkError } = await owned.supabase
    .from("show_contacts")
    .delete()
    .eq("show_id", showId)
    .eq("contact_id", contactId);

  if (unlinkError) return { error: unlinkError.message };

  const { count } = await owned.supabase
    .from("show_contacts")
    .select("*", { count: "exact", head: true })
    .eq("contact_id", contactId);

  if (count === 0) {
    await owned.supabase.from("contacts").delete().eq("id", contactId);
  }

  revalidatePath(`/tour/shows/${showId}`);
  revalidatePath("/tour");
  return { ok: true };
}

export async function updateTravelAction(formData: FormData) {
  const showId = emptyToNull(formData.get("showId"));
  const travelId = emptyToNull(formData.get("travelId"));
  if (!showId || !travelId) return { error: "Missing travel." };

  const owned = await assertOwnedShow(showId);
  if ("error" in owned && owned.error) return { error: owned.error };

  const type = (emptyToNull(formData.get("type")) ?? "flight") as TravelType;

  const { error } = await owned.supabase
    .from("travel")
    .update({
      type,
      date: emptyToNull(formData.get("date")),
      departure: emptyToNull(formData.get("departure")),
      arrival: emptyToNull(formData.get("arrival")),
      departure_time: emptyToNull(formData.get("departureTime")),
      arrival_time: emptyToNull(formData.get("arrivalTime")),
      confirmation_number: emptyToNull(formData.get("confirmationNumber")),
      notes: emptyToNull(formData.get("notes")),
    })
    .eq("id", travelId)
    .eq("show_id", showId);

  if (error) return { error: error.message };

  revalidatePath(`/tour/shows/${showId}`);
  revalidatePath("/tour");
  return { ok: true };
}

export async function updateHotelAction(formData: FormData) {
  const showId = emptyToNull(formData.get("showId"));
  const hotelId = emptyToNull(formData.get("hotelId"));
  if (!showId || !hotelId) return { error: "Missing hotel." };

  const owned = await assertOwnedShow(showId);
  if ("error" in owned && owned.error) return { error: owned.error };

  const { error } = await owned.supabase
    .from("hotels")
    .update({
      name: emptyToNull(formData.get("name")),
      address: emptyToNull(formData.get("address")),
      check_in: emptyToNull(formData.get("checkIn")),
      check_out: emptyToNull(formData.get("checkOut")),
      confirmation_number: emptyToNull(formData.get("confirmationNumber")),
      notes: emptyToNull(formData.get("notes")),
    })
    .eq("id", hotelId)
    .eq("show_id", showId);

  if (error) return { error: error.message };

  revalidatePath(`/tour/shows/${showId}`);
  revalidatePath("/tour");
  return { ok: true };
}

export async function updateContactAction(formData: FormData) {
  const showId = emptyToNull(formData.get("showId"));
  const contactId = emptyToNull(formData.get("contactId"));
  const name = emptyToNull(formData.get("name"));
  if (!showId || !contactId) return { error: "Missing contact." };
  if (!name) return { error: "Name is required." };

  const owned = await assertOwnedShow(showId);
  if ("error" in owned && owned.error) return { error: owned.error };

  const { data: link, error: linkError } = await owned.supabase
    .from("show_contacts")
    .select("contact_id")
    .eq("show_id", showId)
    .eq("contact_id", contactId)
    .maybeSingle();

  if (linkError) return { error: linkError.message };
  if (!link) return { error: "Contact not found on this show." };

  const { error } = await owned.supabase
    .from("contacts")
    .update({
      name,
      company: emptyToNull(formData.get("company")),
      role: emptyToNull(formData.get("role")),
      email: emptyToNull(formData.get("email")),
      phone: emptyToNull(formData.get("phone")),
    })
    .eq("id", contactId);

  if (error) return { error: error.message };

  revalidatePath(`/tour/shows/${showId}`);
  revalidatePath("/tour");
  return { ok: true };
}
