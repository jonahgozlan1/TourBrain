"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu, type UserMenuProps } from "@/components/layout/UserMenu";

const links = [
  { href: "/tour", label: "Tour" },
  { href: "/tour/import", label: "Import" },
  { href: "/tour/ask", label: "Ask" },
] as const;

export function AppNav({ user }: { user: UserMenuProps }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 bg-[var(--surface-glass)] backdrop-blur-md">
      <div className="grid h-[4.5rem] w-full grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8">
        <Link
          href="/tour"
          className="justify-self-start font-display text-[1.35rem] tracking-tight text-[var(--ink)]"
        >
          Tourbase
        </Link>
        <nav
          className="flex rounded-[var(--radius-sm)] bg-[var(--ink-soft)] p-1"
          aria-label="Primary"
        >
          {links.map((link) => {
            const active =
              link.href === "/tour"
                ? pathname === "/tour" ||
                  pathname.startsWith("/tour/shows") ||
                  pathname === "/tour/new"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-[calc(var(--radius-sm)-1px)] px-4 py-[0.5rem] text-base font-medium transition-colors ${
                  active
                    ? "bg-[var(--surface-2)] text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--ink-soft)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="justify-self-end">
          <UserMenu {...user} />
        </div>
      </div>
    </header>
  );
}
