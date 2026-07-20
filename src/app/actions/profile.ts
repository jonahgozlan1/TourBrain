"use server";

import { revalidatePath } from "next/cache";
import { ensureProfile } from "@/lib/db/queries";

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

export async function updateProfileAction(formData: FormData) {
  const { supabase, user } = await ensureProfile();

  const name = emptyToNull(formData.get("name"));
  const email = emptyToNull(formData.get("email"));

  if (!name) {
    return { error: "Name is required." };
  }
  if (!email) {
    return { error: "Email is required." };
  }

  const emailChanged =
    email.toLowerCase() !== (user.email ?? "").toLowerCase();

  if (emailChanged) {
    const { error: authError } = await supabase.auth.updateUser({
      email,
      data: { name },
    });
    if (authError) {
      return { error: authError.message };
    }
  } else {
    const { error: metaError } = await supabase.auth.updateUser({
      data: { name },
    });
    if (metaError) {
      return { error: metaError.message };
    }
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name,
      email: emailChanged ? email : (user.email ?? email),
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/settings/account");
  revalidatePath("/tour");

  if (emailChanged) {
    return {
      success: true,
      message:
        "Saved. Check your inbox to confirm the new email before it fully updates.",
    };
  }

  return { success: true, message: "Account updated." };
}
