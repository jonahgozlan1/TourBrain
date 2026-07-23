import Link from "next/link";
import { LandingSectionNav } from "@/components/landing/LandingSectionNav";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const EXAMPLE_DOCS = [
  {
    fileName: "Chicago_Riviera_Contract.pdf",
    type: "Contract",
    status: "Ready to review",
    accent: true,
  },
  {
    fileName: "Detroit_travel_confirm.pdf",
    type: "Travel",
    status: "Applied",
    accent: false,
  },
  {
    fileName: "Toronto_hotel.pdf",
    type: "Hotel",
    status: "Ready to review",
    accent: true,
  },
] as const;

const EXAMPLE_SHOWS = [
  {
    date: "Jul 19",
    city: "Chicago",
    detail: "The Riviera · 8:00 PM",
    status: "2 missing",
    missing: true,
  },
  {
    date: "Jul 22",
    city: "Detroit",
    detail: "Fox Theatre · 7:30 PM",
    status: "Ready",
    missing: false,
  },
  {
    date: "Jul 25",
    city: "Toronto",
    detail: "Massey Hall · Venue TBD",
    status: "1 missing",
    missing: true,
  },
] as const;

const EXAMPLE_SUGGESTIONS = [
  "Where are we staying in Chicago?",
  "What time is load-in in Toronto?",
  "Which shows are still missing hotel?",
] as const;

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/tour");
  }

  return (
    <>
      <MarketingNav />
      <main className="relative flex flex-1 flex-col overflow-hidden">
      <div aria-hidden className="brand-atmosphere" />
      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-12 text-center sm:py-16">
        <div className="fade-up flex flex-col items-center">
          <h1 className="max-w-md font-display text-5xl leading-[1.05] tracking-tight text-[var(--ink)] sm:text-6xl sm:leading-[1.02]">
            Messy tour docs become a clean show list.
          </h1>
          <p className="mt-4 text-sm text-[var(--muted)] sm:text-base sm:font-light">
            For artists and tour managers.
          </p>
        </div>

        <div className="fade-up-delay mt-10 sm:mt-12">
          <LandingSectionNav />
        </div>

        <div className="fade-up-delay mt-14 flex w-full flex-col items-center gap-14 sm:mt-16 sm:gap-16">
          <div className="flex w-full flex-col gap-14 sm:gap-16">
            <section
              id="example-import"
              className="scroll-mt-24 flex flex-col items-center"
            >
              <p className="section-label !mb-1">Import</p>
              <p className="font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
                Import information
              </p>
              <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
                Upload contracts, travel, or hotels. Extracted fields wait for
                your review.
              </p>
              <ExamplePreview>
                <div className="flex w-full flex-col items-center justify-center rounded-[var(--radius-lg)] bg-[var(--surface)] px-6 py-12">
                  <p className="font-display text-2xl tracking-tight text-[var(--ink)]">
                    Upload document
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    PDF, TXT, or CSV
                  </p>
                </div>
                <ul className="mt-4 w-full divide-y divide-[var(--ink-soft)] text-left">
                  {EXAMPLE_DOCS.map((doc) => (
                    <li
                      key={doc.fileName}
                      className="flex items-baseline justify-between gap-4 px-1 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--ink)]">
                          {doc.fileName}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{doc.type}</p>
                      </div>
                      <span
                        className={`shrink-0 text-xs ${
                          doc.accent
                            ? "font-medium text-[var(--accent)]"
                            : "text-[var(--muted)]"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </ExamplePreview>
            </section>

            <section
              id="example-tour"
              className="scroll-mt-24 flex flex-col items-center"
            >
              <p className="section-label !mb-1">Tour</p>
              <p className="font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
                Show dashboard
              </p>
              <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
                Every date on the run — with gaps called out before show day.
              </p>
              <ExamplePreview>
                <div className="text-left">
                  <p className="text-sm text-[var(--muted)]">Summer Tour &apos;26</p>
                  <p className="mt-3 text-sm font-medium text-[var(--accent)]">
                    2 shows still need information
                  </p>
                </div>
                <ul className="mt-5 w-full space-y-2.5 text-left">
                  {EXAMPLE_SHOWS.map((show) => (
                    <li
                      key={show.city}
                      className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] bg-[var(--surface)] px-4 py-4 sm:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <span className="w-[4.5rem] shrink-0 text-center text-base font-bold tabular-nums text-[var(--muted)]">
                          {show.date}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--ink)]">
                            {show.city}
                          </p>
                          <p className="mt-0.5 truncate text-sm text-[var(--muted)]">
                            {show.detail}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-sm ${
                          show.missing
                            ? "font-medium text-[var(--accent)]"
                            : "text-[var(--muted)]"
                        }`}
                      >
                        {show.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </ExamplePreview>
            </section>

            <section
              id="example-ask"
              className="scroll-mt-24 flex flex-col items-center"
            >
              <p className="section-label !mb-1">Ask</p>
              <p className="font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
                Ask the tour
              </p>
              <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
                Answers come from your show database — not guesses.
              </p>
              <ExamplePreview className="max-w-lg">
                <ul className="flex w-full flex-col gap-2 text-left">
                  {EXAMPLE_SUGGESTIONS.map((suggestion) => (
                    <li
                      key={suggestion}
                      className="rounded-[var(--radius-lg)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)]"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex w-full items-center gap-2 rounded-[1.25rem] bg-[var(--surface)] p-2 text-left shadow-[inset_0_0_0_1px_var(--border)]">
                  <p className="min-w-0 flex-1 px-3 py-2.5 text-[0.9375rem] text-[var(--muted)]">
                    Ask about a show, flight, hotel, or gap…
                  </p>
                  <span className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--paper)] opacity-35">
                    <SendIcon />
                  </span>
                </div>
              </ExamplePreview>
            </section>
          </div>

          <section className="fade-up-delay-2 flex flex-col items-center pb-8 pt-4">
            <p className="font-display text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
              Ready to clear the inbox?
            </p>
            <p className="mt-3 max-w-sm text-base text-[var(--muted)] sm:font-light">
              Start a tour, import a doc, and see what&apos;s still missing.
            </p>
            <Link
              href="/auth/signup"
              className="btn-primary mt-8 px-5 py-2.5"
            >
              Get started
            </Link>
          </section>
        </div>
      </div>
      </main>
    </>
  );
}

function ExamplePreview({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href="/auth/signup"
      className={`relative mt-6 block w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--ink-softer)] p-3 shadow-[inset_0_0_0_1px_var(--ink-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:p-4 ${className}`}
    >
      <span className="sr-only">Get started with Tourbase</span>
      <div className="scale-[0.99] opacity-90">{children}</div>
    </Link>
  );
}

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 12.5V3.5M8 3.5L3.5 8M8 3.5L12.5 8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
