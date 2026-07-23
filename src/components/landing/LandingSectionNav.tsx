"use client";

import { useEffect, useState } from "react";

const links = [
  { id: "example-tour", label: "Tour" },
  { id: "example-import", label: "Import" },
  { id: "example-ask", label: "Ask" },
] as const;

export function LandingSectionNav() {
  const [active, setActive] = useState<(typeof links)[number]["id"]>(
    "example-import",
  );

  useEffect(() => {
    const sections = links
      .map((link) => document.getElementById(link.id))
      .filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActive(visible.target.id as (typeof links)[number]["id"]);
        }
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0, 0.2, 0.5, 1] },
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  function scrollTo(id: (typeof links)[number]["id"]) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActive(id);
  }

  return (
    <nav
      className="flex rounded-[var(--radius-sm)] bg-[var(--ink-soft)] p-1"
      aria-label="Product sections"
    >
      {links.map((link) => {
        const isActive = active === link.id;
        return (
          <button
            key={link.id}
            type="button"
            onClick={() => scrollTo(link.id)}
            className={`rounded-[calc(var(--radius-sm)-1px)] px-4 py-[0.5rem] text-base font-medium transition-colors ${
              isActive
                ? "bg-[var(--surface-2)] text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--ink-soft)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {link.label}
          </button>
        );
      })}
    </nav>
  );
}
