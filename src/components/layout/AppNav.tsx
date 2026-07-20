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
      <div className="mx-auto grid h-[3.75rem] max-w-3xl grid-cols-[1fr_auto_1fr] items-center px-4">
        <Link
          href="/tour"
          className="justify-self-start font-display text-[1.125rem] tracking-tight text-[var(--ink)]"
        >
          Loadin
        </Link>
        <nav
          className="flex rounded-[var(--radius-sm)] bg-[var(--ink-soft)] p-0.5"
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
                className={`rounded-[calc(var(--radius-sm)-1px)] px-3.5 py-[0.4rem] text-[0.9375rem] font-medium transition-colors ${
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
