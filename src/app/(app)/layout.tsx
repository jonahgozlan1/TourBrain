import { AppNav } from "@/components/layout/AppNav";
import { ensureProfile, getPrimaryTour } from "@/lib/db/queries";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await ensureProfile();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", user.id)
    .maybeSingle();

  let tourName: string | null = null;
  try {
    const tour = await getPrimaryTour();
    tourName = tour?.name ?? null;
  } catch {
    tourName = null;
  }

  const name =
    profile?.name?.trim() ||
    (user.user_metadata?.name as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "Account";
  const email = profile?.email ?? user.email ?? "";

  return (
    <div className="app-atmosphere flex min-h-full flex-1 flex-col">
      <AppNav user={{ name, email, tourName }} />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:py-12">
        {children}
      </div>
    </div>
  );
}
