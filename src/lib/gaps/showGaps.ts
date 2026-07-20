import type { Hotel, Show, ShowDetail, ShowGap, Travel } from "@/lib/types/domain";

const FIELD_LABELS: Record<ShowGap["field"], string> = {
  date: "Show date",
  city: "City",
  venue: "Venue",
  showTime: "Show time",
  loadInTime: "Load-in time",
  soundcheckTime: "Soundcheck time",
  doorsTime: "Doors time",
  curfew: "Curfew",
  promoter: "Promoter",
  hotel: "Hotel",
  travel: "Travel",
};

/**
 * Surfaces what's still unknown for a show day.
 * Gaps are a first-class product feature — not just empty UI.
 */
export function getShowGaps(
  show: Show,
  travel: Travel[] = [],
  hotels: Hotel[] = [],
): ShowGap[] {
  const gaps: ShowGap[] = [];

  const checks: Array<{ field: ShowGap["field"]; empty: boolean }> = [
    { field: "date", empty: !show.date },
    { field: "city", empty: !show.city },
    { field: "venue", empty: !show.venue },
    { field: "showTime", empty: !show.showTime },
    { field: "loadInTime", empty: !show.loadInTime },
    { field: "soundcheckTime", empty: !show.soundcheckTime },
    { field: "doorsTime", empty: !show.doorsTime },
    { field: "curfew", empty: !show.curfew },
    { field: "promoter", empty: !show.promoter },
    { field: "travel", empty: travel.length === 0 },
    { field: "hotel", empty: hotels.length === 0 },
  ];

  for (const check of checks) {
    if (check.empty) {
      gaps.push({ field: check.field, label: FIELD_LABELS[check.field] });
    }
  }

  return gaps;
}

export function getShowDetailGaps(show: ShowDetail): ShowGap[] {
  return getShowGaps(show, show.travel, show.hotels);
}
