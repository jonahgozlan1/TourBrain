import Link from "next/link";
import { TourbaseMark } from "@/components/brand/TourbaseMark";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-20 bg-[var(--surface-glass)] backdrop-blur-md">
      <div className="flex h-[4.5rem] w-full items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2 text-[var(--ink)]">
          <TourbaseMark className="h-7 w-7 sm:h-6 sm:w-6" />
          <span className="font-display text-[1.35rem] tracking-tight">
            Tourbase
          </span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-5">
          <Link href="/auth/login" className="btn-text">
            Sign in
          </Link>
          <Link href="/auth/signup" className="btn-primary px-5 py-2.5">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
