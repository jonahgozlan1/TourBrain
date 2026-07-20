export default function HelpPage() {
  return (
    <main className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
          Help
        </h1>
        <p className="mt-2 max-w-lg text-[var(--muted)]">
          Loadin turns messy tour docs into a clean show dashboard — and shows
          you what&apos;s still missing.
        </p>
      </div>

      <div className="soft-panel space-y-4 text-sm leading-relaxed text-[var(--ink)]">
        <p>
          <span className="font-medium">1. Add shows</span> — build the tour
          shell with city, venue, and schedule.
        </p>
        <p>
          <span className="font-medium">2. Import documents</span> — upload
          contracts, travel, or hotels. AI extracts fields; you review before
          anything is saved.
        </p>
        <p>
          <span className="font-medium">3. Close gaps</span> — each show surfaces
          what&apos;s still needed so nothing slips before load-in.
        </p>
      </div>

      <p className="text-sm text-[var(--muted)]">
        Questions? Email{" "}
        <a
          href="mailto:hello@loadin.app"
          className="text-[var(--ink)] underline-offset-2 hover:underline"
        >
          hello@loadin.app
        </a>
        .
      </p>
    </main>
  );
}
