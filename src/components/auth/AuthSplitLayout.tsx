import Link from "next/link";

const MOCK_SHOWS = [
  { city: "Chicago", venue: "The Riviera", date: "Jul 19", status: "2 missing" },
  { city: "Detroit", venue: "Fox Theatre", date: "Jul 22", status: "Ready" },
  { city: "Toronto", venue: "Massey Hall", date: "Jul 25", status: "1 missing" },
  { city: "Montreal", venue: "MTELUS", date: "Jul 27", status: "Ready" },
  { city: "Boston", venue: "House of Blues", date: "Jul 30", status: "3 missing" },
  { city: "Brooklyn", venue: "Brooklyn Steel", date: "Aug 1", status: "Ready" },
  { city: "Philly", venue: "Union Transfer", date: "Aug 3", status: "Ready" },
  { city: "DC", venue: "9:30 Club", date: "Aug 5", status: "1 missing" },
  { city: "Atlanta", venue: "Tabernacle", date: "Aug 8", status: "Ready" },
] as const;

function ShowTile({
  city,
  venue,
  date,
  status,
}: {
  city: string;
  venue: string;
  date: string;
  status: string;
}) {
  const missing = status !== "Ready";
  return (
    <div className="w-[220px] shrink-0 rounded-[var(--radius-lg)] bg-[var(--surface)] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
        {date}
      </p>
      <p className="mt-1 font-display text-xl text-[var(--ink)]">{city}</p>
      <p className="mt-0.5 truncate text-sm text-[var(--muted)]">{venue}</p>
      <p
        className={`mt-3 text-xs ${missing ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}
      >
        {status}
      </p>
    </div>
  );
}

function AuthVisualPanel() {
  const tiles = [...MOCK_SHOWS, ...MOCK_SHOWS];

  return (
    <div
      aria-hidden
      className="relative hidden min-h-full overflow-hidden bg-[#0c0c0c] lg:block"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,212,191,0.08)_0%,_transparent_55%)]" />
      <div className="absolute left-1/2 top-1/2 flex w-[160%] -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] flex-col gap-4 opacity-90">
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className={`flex gap-4 ${row % 2 === 1 ? "translate-x-16" : ""}`}
          >
            {tiles.slice(row * 3, row * 3 + 6).map((show, i) => (
              <ShowTile key={`${row}-${i}-${show.city}`} {...show} />
            ))}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[var(--paper)]/40" />
    </div>
  );
}

export function AuthSplitLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-full flex-1 lg:grid-cols-2">
      <div className="relative flex flex-col justify-center bg-[var(--paper)] px-6 py-16 sm:px-10">
        <div className="mx-auto w-full max-w-[360px]">
          <div className="text-center">
            <Link
              href="/"
              className="inline-block font-display text-2xl text-[var(--ink)]"
            >
              Loadin
            </Link>
            <h1 className="mt-10 font-display text-4xl text-[var(--ink)] sm:text-[2.75rem] sm:leading-[1.1]">
              {title}
            </h1>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <AuthVisualPanel />
    </main>
  );
}
