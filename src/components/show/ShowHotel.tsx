import type { Hotel } from "@/lib/types/domain";
import { EntryMenu } from "@/components/show/EntryMenu";
import { ShowWidget } from "@/components/show/ShowWidget";

export function ShowHotel({
  hotels,
  action,
}: {
  hotels: Hotel[];
  action?: React.ReactNode;
}) {
  return (
    <ShowWidget title="Hotel" action={action}>
      {hotels.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No hotel added yet.</p>
      ) : (
        <ul className="space-y-3">
          {hotels.map((hotel) => (
            <li
              key={hotel.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--ink)]">
                  {hotel.name ?? "Hotel"}
                </p>
                {hotel.address ? (
                  <p className="text-[var(--muted)]">{hotel.address}</p>
                ) : null}
                <p className="text-[var(--muted)]">
                  {[
                    hotel.checkIn ? `In ${hotel.checkIn}` : null,
                    hotel.checkOut ? `Out ${hotel.checkOut}` : null,
                    hotel.confirmationNumber
                      ? `Conf ${hotel.confirmationNumber}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <EntryMenu kind="hotel" entry={hotel} />
            </li>
          ))}
        </ul>
      )}
    </ShowWidget>
  );
}
