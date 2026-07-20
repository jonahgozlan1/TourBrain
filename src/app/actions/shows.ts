"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/db/queries";

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

export async function createShowAction(formData: FormData) {
  const { supabase, user } = await ensureProfile();

  const tourId = emptyToNull(formData.get("tourId"));
  const date = emptyToNull(formData.get("date"));

  if (!tourId || !date) {
    return { error: "Tour and date are required." };
  }

  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select("id")
    .eq("id", tourId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (tourError) return { error: tourError.message };
  if (!tour) return { error: "Tour not found." };

  const { data, error } = await supabase
    .from("shows")
    .insert({
      tour_id: tourId,
      date,
      city: emptyToNull(formData.get("city")),
      country: emptyToNull(formData.get("country")),
      venue: emptyToNull(formData.get("venue")),
      promoter: emptyToNull(formData.get("promoter")),
      status: emptyToNull(formData.get("status")) ?? "draft",
      load_in_time: emptyToNull(formData.get("loadInTime")),
      soundcheck_time: emptyToNull(formData.get("soundcheckTime")),
      doors_time: emptyToNull(formData.get("doorsTime")),
      show_time: emptyToNull(formData.get("showTime")),
      curfew: emptyToNull(formData.get("curfew")),
      notes: emptyToNull(formData.get("notes")),
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tour");
  revalidatePath(`/tour/shows/${data.id}`);
  redirect(`/tour/shows/${data.id}`);
}

export async function updateShowAction(formData: FormData) {
  const { supabase, user } = await ensureProfile();

  const showId = emptyToNull(formData.get("showId"));
  const date = emptyToNull(formData.get("date"));

  if (!showId || !date) {
    return { error: "Show and date are required." };
  }

  const { data: existing, error: existingError } = await supabase
    .from("shows")
    .select("id, tour_id, tours!inner(user_id)")
    .eq("id", showId)
    .eq("tours.user_id", user.id)
    .maybeSingle();

  if (existingError) return { error: existingError.message };
  if (!existing) return { error: "Show not found." };

  const { error } = await supabase
    .from("shows")
    .update({
      date,
      city: emptyToNull(formData.get("city")),
      country: emptyToNull(formData.get("country")),
      venue: emptyToNull(formData.get("venue")),
      promoter: emptyToNull(formData.get("promoter")),
      status: emptyToNull(formData.get("status")) ?? "draft",
      load_in_time: emptyToNull(formData.get("loadInTime")),
      soundcheck_time: emptyToNull(formData.get("soundcheckTime")),
      doors_time: emptyToNull(formData.get("doorsTime")),
      show_time: emptyToNull(formData.get("showTime")),
      curfew: emptyToNull(formData.get("curfew")),
      notes: emptyToNull(formData.get("notes")),
    })
    .eq("id", showId);

  if (error) return { error: error.message };

  revalidatePath("/tour");
  revalidatePath(`/tour/shows/${showId}`);
  redirect(`/tour/shows/${showId}`);
}

export async function deleteShowAction(formData: FormData) {
  const { supabase, user } = await ensureProfile();

  const showId = emptyToNull(formData.get("showId"));
  if (!showId) {
    return { error: "Show not found." };
  }

  const { data: existing, error: existingError } = await supabase
    .from("shows")
    .select("id, tours!inner(user_id)")
    .eq("id", showId)
    .eq("tours.user_id", user.id)
    .maybeSingle();

  if (existingError) return { error: existingError.message };
  if (!existing) return { error: "Show not found." };

  const { error } = await supabase.from("shows").delete().eq("id", showId);

  if (error) return { error: error.message };

  revalidatePath("/tour");
  redirect("/tour");
}
