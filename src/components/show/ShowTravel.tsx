import type { Travel } from "@/lib/types/domain";
import { formatTime } from "@/lib/format";
import { EntryMenu } from "@/components/show/EntryMenu";
import { ShowWidget } from "@/components/show/ShowWidget";

function travelTypeLabel(type: Travel["type"]): string {
  if (type === "bus") return "Bus";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function ShowTravel({
  travel,
  action,
}: {
  travel: Travel[];
  action?: React.ReactNode;
}) {
  return (
    <ShowWidget title="Travel" action={action}>
      {travel.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No travel added yet.</p>
      ) : (
        <ul className="space-y-3">
          {travel.map((leg) => (
            <li
              key={leg.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--ink)]">
                  {travelTypeLabel(leg.type)}
                  {leg.departure && leg.arrival
                    ? `: ${leg.departure} → ${leg.arrival}`
                    : ""}
                </p>
                <p className="text-[var(--muted)]">
                  {[
                    leg.date,
                    leg.departureTime
                      ? `Dep ${formatTime(leg.departureTime)}`
                      : null,
                    leg.confirmationNumber
                      ? `Conf ${leg.confirmationNumber}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <EntryMenu kind="travel" entry={leg} />
            </li>
          ))}
        </ul>
      )}
    </ShowWidget>
  );
}
