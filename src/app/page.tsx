import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16 sm:py-20">
        <div className="fade-up">
          <p className="font-display text-5xl leading-[1.05] tracking-tight text-[var(--ink)] sm:text-6xl sm:leading-[1.02]">
            Loadin
          </p>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-[var(--muted)] sm:text-xl sm:font-light">
            Upload messy tour docs. Get a clean show dashboard — and see
            what&apos;s still missing.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link href="/auth/signup" className="btn-primary px-5 py-2.5">
              Get started
            </Link>
            <Link href="/auth/login" className="btn-text">
              Sign in
            </Link>
          </div>
        </div>

        <div
          aria-hidden
          className="fade-up-delay mt-14 overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface)] px-5 py-5 sm:mt-16 sm:px-6 sm:py-6"
        >
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-xs text-[var(--muted)]">North American Run</p>
                <p className="font-display text-xl tracking-tight text-[var(--ink)] sm:text-2xl">
                  Summer Tour &apos;26
                </p>
              </div>
              <span className="shrink-0 text-xs font-medium text-[var(--accent)]">
                2 shows need info
              </span>
            </div>

            <div className="mt-5 divide-y divide-[var(--ink-soft)]">
              <div className="flex items-baseline justify-between gap-3 py-3">
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="w-12 shrink-0 tabular-nums text-sm text-[var(--muted)]">
                    Jul 19
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--ink)]">Chicago</p>
                    <p className="truncate text-sm text-[var(--muted)]">
                      The Riviera · 8:00 PM
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-[var(--accent)]">
                  2 missing
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-3">
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="w-12 shrink-0 tabular-nums text-sm text-[var(--muted)]">
                    Jul 22
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--ink)]">Detroit</p>
                    <p className="truncate text-sm text-[var(--muted)]">
                      Fox Theatre · 7:30 PM
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-[var(--muted)]">Ready</span>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-3">
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="w-12 shrink-0 tabular-nums text-sm text-[var(--muted)]">
                    Jul 25
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--ink)]">Toronto</p>
                    <p className="truncate text-sm text-[var(--muted)]">
                      Massey Hall · Venue TBD
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-[var(--accent)]">
                  1 missing
                </span>
              </div>
            </div>

            <div className="soft-panel-accent mt-4 !p-3.5">
              <p className="section-label !mb-1.5 !text-[var(--accent)]">
                Still needed
              </p>
              <ul className="space-y-0.5 text-sm text-[var(--ink)]">
                <li>· Hotel confirmation — Chicago</li>
                <li>· Load-in time — Toronto</li>
              </ul>
            </div>
        </div>

        <p className="fade-up-delay-2 mt-10 text-xs text-[var(--muted)]">
          Phase 1 · Manual tours &amp; shows on Supabase
        </p>
      </div>
    </main>
  );
}
