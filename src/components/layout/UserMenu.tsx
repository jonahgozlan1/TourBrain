"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";
import { type ThemePreference } from "@/lib/theme-boot";

export type UserMenuProps = {
  name: string;
  email: string;
  tourName?: string | null;
};

function initialsFrom(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  if (parts.length === 1 && parts[0]!.length >= 2) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 1).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase() || "?";
}

export function UserMenu({ name, email, tourName }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initials = initialsFrom(name, email);
  const { preference, setPreference } = useTheme();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)] text-sm font-semibold tracking-wide text-[var(--ink)] ring-1 ring-[var(--ink-soft)] transition-colors hover:bg-[var(--border)]"
      >
        {initials}
      </button>

      {open ? (
        <div
          role="menu"
          className="force-dark absolute right-0 z-50 mt-3.5 w-52 overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface)] py-2 shadow-[0_16px_48px_rgba(0,0,0,0.45)] ring-1 ring-[var(--ink-soft)]"
        >
          <div className="px-4 pb-3.5 pt-2.5">
            <p className="truncate text-base font-semibold text-[var(--ink)]">
              {name}
            </p>
            <p className="truncate text-sm text-[var(--muted)]">{email}</p>
            {tourName ? (
              <p className="mt-1 truncate text-sm text-[var(--muted)]">
                {tourName}
              </p>
            ) : null}
          </div>

          <div className="mx-3 h-px bg-[var(--ink-soft)]" />

          <div className="space-y-0.5 px-2 py-1.5">
            <MenuLink href="/settings/account" onNavigate={() => setOpen(false)}>
              Account
            </MenuLink>
            <MenuLink href="/settings/tour" onNavigate={() => setOpen(false)}>
              Tour settings
            </MenuLink>
          </div>

          <div className="mx-3 h-px bg-[var(--ink-soft)]" />

          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
            <span className="text-base font-semibold text-[var(--ink)]">
              Theme
            </span>
            <div className="flex rounded-full bg-[var(--ink-soft)] p-0.5">
              {(
                [
                  { id: "light", label: "Light", icon: <SunIcon /> },
                  { id: "dark", label: "Dark", icon: <MoonIcon /> },
                  { id: "system", label: "System", icon: <SystemIcon /> },
                ] as const
              ).map((option) => {
                const active = preference === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-label={option.label}
                    aria-pressed={active}
                    onClick={() => setPreference(option.id as ThemePreference)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                      active
                        ? "bg-[var(--surface)] text-[var(--ink)] shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
                        : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {option.icon}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-3 h-px bg-[var(--ink-soft)]" />

          <div className="space-y-0.5 px-2 py-1.5">
            <MenuLink href="/settings/help" onNavigate={() => setOpen(false)}>
              Help
            </MenuLink>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                role="menuitem"
                className="w-full rounded-[var(--radius-sm)] px-3 py-2.5 text-left text-base font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--ink-soft)]"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  children,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onNavigate}
      className="block rounded-[var(--radius-sm)] px-3 py-2.5 text-base font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--ink-soft)]"
    >
      {children}
    </Link>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 3a9 9 0 0 0 0 18V3Z" fill="currentColor" />
    </svg>
  );
}
