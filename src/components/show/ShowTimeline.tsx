import type { Show } from "@/lib/types/domain";
import { formatTime } from "@/lib/format";
import { ShowWidget } from "@/components/show/ShowWidget";

type TimelineItem = { label: string; time: string | null };

export function ShowTimeline({ show }: { show: Show }) {
  const items: TimelineItem[] = [
    { label: "Load-in", time: show.loadInTime },
    { label: "Soundcheck", time: show.soundcheckTime },
    { label: "Doors", time: show.doorsTime },
    { label: "Show", time: show.showTime },
    { label: "Curfew", time: show.curfew },
  ];

  const hasAny = items.some((i) => i.time);

  return (
    <ShowWidget title="Schedule">
      {!hasAny ? (
        <p className="text-sm text-[var(--muted)]">No schedule times yet.</p>
      ) : (
        <ol className="space-y-2.5">
          {items.map((item) => (
            <li
              key={item.label}
              className={`flex gap-4 text-sm ${item.time ? "text-[var(--ink)]" : "text-[var(--muted)]/60"}`}
            >
              <span className="w-20 shrink-0 tabular-nums">
                {formatTime(item.time)}
              </span>
              <span>{item.label}</span>
            </li>
          ))}
        </ol>
      )}
    </ShowWidget>
  );
}
