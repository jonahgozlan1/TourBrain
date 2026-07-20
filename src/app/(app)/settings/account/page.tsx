import { EditAccountForm } from "@/components/settings/EditAccountForm";
import { ensureProfile } from "@/lib/db/queries";

export default async function AccountSettingsPage() {
  const { supabase, user } = await ensureProfile();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", user.id)
    .maybeSingle();

  const name =
    profile?.name?.trim() ||
    (user.user_metadata?.name as string | undefined)?.trim() ||
    "";
  const email = profile?.email ?? user.email ?? "";

  return (
    <main className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
          Account
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Update your name and email for Tourbase.
        </p>
      </div>

      <div className="soft-panel">
        <EditAccountForm name={name} email={email} />
      </div>
    </main>
  );
}
