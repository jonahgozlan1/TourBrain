import Link from "next/link";
import { TourbaseMark } from "@/components/brand/TourbaseMark";
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
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div aria-hidden className="brand-atmosphere" />
      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-12 text-center sm:py-16">
        <div className="fade-up flex flex-col items-center">
          <TourbaseMark className="mb-5 h-12 w-12 text-[var(--ink)] sm:mb-6 sm:h-14 sm:w-14" />
          <p className="font-display text-5xl leading-[1.05] tracking-tight text-[var(--ink)] sm:text-6xl sm:leading-[1.02]">
            Tourbase
          </p>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-[var(--muted)] sm:text-xl sm:font-light">
            Messy tour docs become a clean show list.
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            For artists and tour managers.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
            <Link href="/auth/signup" className="btn-primary px-5 py-2.5">
              Get started
            </Link>
            <Link href="/auth/login" className="btn-text">
              Sign in
            </Link>
          </div>
        </div>

        <div className="fade-up-delay mt-14 flex w-full flex-col items-center gap-14 sm:mt-16 sm:gap-16">
          <div
            aria-hidden
            className="flex w-full flex-col gap-14 sm:gap-16"
          >
            <section className="flex flex-col items-center">
              <p className="section-label !mb-1">Import</p>
              <p className="font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
                Import information
              </p>
              <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
                Upload contracts, travel, or hotels. Extracted fields wait for
                your review.
              </p>
              <div className="mt-6 flex w-full flex-col items-center justify-center rounded-[var(--radius-lg)] bg-[var(--surface)] px-6 py-12">
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
            </section>

            <section className="flex flex-col items-center">
              <p className="section-label !mb-1">Tour</p>
              <p className="text-sm text-[var(--muted)]">Summer Tour &apos;26</p>
              <p className="mt-3 text-sm font-medium text-[var(--accent)]">
                2 shows still need information
              </p>
              <ul className="mt-6 w-full space-y-2.5 text-left">
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
            </section>

            <section className="flex flex-col items-center">
              <p className="section-label !mb-1">Ask</p>
              <p className="font-display text-2xl tracking-tight text-[var(--ink)] sm:text-3xl">
                Ask the tour
              </p>
              <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
                Answers come from your show database — not guesses.
              </p>
              <ul className="mt-6 flex w-full max-w-lg flex-col gap-2 text-left">
                {EXAMPLE_SUGGESTIONS.map((suggestion) => (
                  <li
                    key={suggestion}
                    className="rounded-[var(--radius-lg)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)]"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex w-full max-w-lg items-center gap-2 rounded-[1.25rem] bg-[var(--surface)] p-2 text-left shadow-[inset_0_0_0_1px_var(--border)]">
                <p className="min-w-0 flex-1 px-3 py-2.5 text-[0.9375rem] text-[var(--muted)]">
                  Ask about a show, flight, hotel, or gap…
                </p>
                <span className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--paper)] opacity-35">
                  <SendIcon />
                </span>
              </div>
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
