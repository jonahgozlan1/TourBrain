export function SchemaSetupNotice() {
  return (
    <main className="soft-panel space-y-4 !p-6 sm:!p-8">
      <h1 className="font-display text-2xl tracking-tight text-[var(--ink)]">
        Database setup needed
      </h1>
      <p className="text-[var(--muted)]">
        Your Supabase project is connected, but Loadin tables are missing or
        incomplete.
      </p>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-[var(--ink)]">
        <li>
          Open the{" "}
          <a
            href="https://supabase.com/dashboard/project/xdbzclrsfqzzuldcgvgz/sql/new"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            Supabase SQL editor
          </a>
        </li>
        <li>
          Run{" "}
          <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-xs">
            001
          </code>
          ,{" "}
          <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-xs">
            002
          </code>
          , then{" "}
          <code className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-xs">
            003_phase3_travel_document_type.sql
          </code>
        </li>
        <li>Refresh this page</li>
      </ol>
    </main>
  );
}
