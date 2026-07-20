"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/db/queries";

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

export async function createTourAction(formData: FormData) {
  const { supabase, user } = await ensureProfile();

  const name = emptyToNull(formData.get("name"));
  const artistName = emptyToNull(formData.get("artistName"));

  if (!name || !artistName) {
    return { error: "Tour name and artist are required." };
  }

  const { error } = await supabase.from("tours").insert({
    user_id: user.id,
    name,
    artist_name: artistName,
    start_date: emptyToNull(formData.get("startDate")),
    end_date: emptyToNull(formData.get("endDate")),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tour");
  redirect("/tour");
}

export async function updateTourAction(formData: FormData) {
  const { supabase, user } = await ensureProfile();

  const tourId = emptyToNull(formData.get("tourId"));
  const name = emptyToNull(formData.get("name"));
  const artistName = emptyToNull(formData.get("artistName"));

  if (!tourId) {
    return { error: "Tour not found." };
  }
  if (!name || !artistName) {
    return { error: "Tour name and artist are required." };
  }

  const { data: existing, error: lookupError } = await supabase
    .from("tours")
    .select("id")
    .eq("id", tourId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError) return { error: lookupError.message };
  if (!existing) return { error: "Tour not found." };

  const { error } = await supabase
    .from("tours")
    .update({
      name,
      artist_name: artistName,
      start_date: emptyToNull(formData.get("startDate")),
      end_date: emptyToNull(formData.get("endDate")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", tourId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tour");
  revalidatePath("/settings/tour");
  return { success: true };
}
