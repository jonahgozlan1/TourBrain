import type { ShowGap } from "@/lib/types/domain";
import Link from "next/link";
import { ShowWidget } from "@/components/show/ShowWidget";

export function ShowGaps({ gaps }: { gaps: ShowGap[] }) {
  if (gaps.length === 0) {
    return (
      <ShowWidget title="Still needed">
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Core show-day info looks complete.
        </p>
      </ShowWidget>
    );
  }

  return (
    <ShowWidget
      title="Still needed"
      accent
      action={
        <Link href="/tour/import" className="btn-text text-[var(--accent)]">
          Import a document to fill gaps
        </Link>
      }
    >
      <ul className="space-y-1.5">
        {gaps.map((gap) => (
          <li key={gap.field} className="text-sm text-[var(--ink)]">
            · {gap.label}
          </li>
        ))}
      </ul>
    </ShowWidget>
  );
}
