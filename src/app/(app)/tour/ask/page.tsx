import Link from "next/link";
import { redirect } from "next/navigation";
import { AskForm } from "@/components/ask/AskForm";
import { SchemaSetupNotice } from "@/components/setup/SchemaSetupNotice";
import {
  buildAskSuggestions,
  getTourAskContext,
} from "@/lib/ask/context";

export default async function AskPage() {
  let context;
  try {
    context = await getTourAskContext();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes("schema cache") ||
      message.includes("Could not find the table") ||
      message.includes("PGRST205")
    ) {
      return <SchemaSetupNotice />;
    }
    throw err;
  }

  if (!context) {
    redirect("/tour/new");
  }

  const suggestions = buildAskSuggestions(context);
  const tourLabel = `${context.tour.artistName} · ${context.tour.name}`;

  if (context.shows.length === 0) {
    return (
      <main>
        <div>
          <p className="text-sm text-[var(--muted)]">{tourLabel}</p>
          <h1 className="mt-1 font-display text-3xl leading-[1.05] tracking-tight text-[var(--ink)] sm:text-4xl sm:leading-[1.02]">
            Ask the tour
          </h1>
        </div>
        <div className="empty-state mt-10">
          <p className="font-display text-xl tracking-tight text-[var(--ink)]">
            No shows to ask about yet
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Add a show or import a contract first.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/tour/shows/new" className="btn-secondary">
              Add show
            </Link>
            <Link href="/tour/import" className="btn-primary">
              Import
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="-mx-4 -my-10 flex h-[calc(100dvh-3.75rem)] flex-col px-4 sm:-my-12">
      <AskForm suggestions={suggestions} tourLabel={tourLabel} />
    </main>
  );
}
