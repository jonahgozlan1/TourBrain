import type { ContractExtraction } from "@/lib/extraction/schemas";
import type { Show } from "@/lib/types/domain";

export type MatchAction = "create" | "update";

export type FieldDiffStatus = "new" | "unchanged" | "conflict" | "missing";

export type FieldDiff = {
  key: string;
  label: string;
  proposed: string | null;
  current: string | null;
  status: FieldDiffStatus;
};

export type ShowMatchResult = {
  action: MatchAction;
  matchedShowId: string | null;
  matchedShowLabel: string | null;
  score: number;
  fieldDiffs: FieldDiff[];
};

export type ShowCandidate = {
  id: string;
  label: string;
  score: number;
};

/** Attach travel/hotel to an existing show — never auto-creates. */
export type AttachMatchResult = {
  matchedShowId: string | null;
  matchedShowLabel: string | null;
  score: number;
  confidence: "high" | "low" | "none";
  candidates: ShowCandidate[];
  requiresShow: true;
};

function norm(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function datesClose(a: string | null, b: string | null, days = 1): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const da = Date.parse(a);
  const db = Date.parse(b);
  if (Number.isNaN(da) || Number.isNaN(db)) return false;
  return Math.abs(da - db) <= 1000 * 60 * 60 * 24 * days;
}

function labelShow(show: Show): string {
  return (
    [show.city, show.venue, show.date].filter(Boolean).join(" · ") || show.id
  );
}

function scoreContractShow(
  show: Show,
  hint: ContractExtraction["matched_show_hint"],
  extracted: ContractExtraction["show"],
): number {
  const date = hint?.date ?? extracted.date;
  const city = hint?.city ?? extracted.city;
  const venue = hint?.venue ?? extracted.venue;

  let score = 0;
  if (date && show.date === date) score += 50;
  else if (datesClose(date, show.date)) score += 35;

  if (city && norm(city) === norm(show.city)) score += 25;
  else if (city && show.city && norm(show.city).includes(norm(city)))
    score += 15;

  if (venue && norm(venue) === norm(show.venue)) score += 25;
  else if (venue && show.venue && norm(show.venue).includes(norm(venue)))
    score += 12;

  return score;
}

const SHOW_FIELDS: Array<{
  key: keyof ContractExtraction["show"];
  label: string;
  fromShow: (show: Show) => string | null;
}> = [
  { key: "date", label: "Date", fromShow: (s) => s.date },
  { key: "city", label: "City", fromShow: (s) => s.city },
  { key: "country", label: "Country", fromShow: (s) => s.country },
  { key: "venue", label: "Venue", fromShow: (s) => s.venue },
  { key: "promoter", label: "Promoter", fromShow: (s) => s.promoter },
  { key: "load_in_time", label: "Load-in", fromShow: (s) => s.loadInTime },
  {
    key: "soundcheck_time",
    label: "Soundcheck",
    fromShow: (s) => s.soundcheckTime,
  },
  { key: "doors_time", label: "Doors", fromShow: (s) => s.doorsTime },
  { key: "show_time", label: "Show time", fromShow: (s) => s.showTime },
  { key: "curfew", label: "Curfew", fromShow: (s) => s.curfew },
];

function buildFieldDiffs(
  extracted: ContractExtraction["show"],
  current: Show | null,
): FieldDiff[] {
  return SHOW_FIELDS.map(({ key, label, fromShow }) => {
    const proposed = extracted[key];
    const existing = current ? fromShow(current) : null;

    let status: FieldDiffStatus;
    if (!proposed) status = "missing";
    else if (!current || !existing) status = "new";
    else if (norm(proposed) === norm(existing)) status = "unchanged";
    else status = "conflict";

    return { key, label, proposed, current: existing, status };
  });
}

const MATCH_THRESHOLD = 50;
const ATTACH_HIGH = 50;
const ATTACH_LOW = 25;

export function matchShowToTour(
  extraction: ContractExtraction,
  shows: Show[],
): ShowMatchResult {
  let best: { show: Show; score: number } | null = null;

  for (const show of shows) {
    const score = scoreContractShow(
      show,
      extraction.matched_show_hint,
      extraction.show,
    );
    if (!best || score > best.score) best = { show, score };
  }

  if (best && best.score >= MATCH_THRESHOLD) {
    return {
      action: "update",
      matchedShowId: best.show.id,
      matchedShowLabel: labelShow(best.show),
      score: best.score,
      fieldDiffs: buildFieldDiffs(extraction.show, best.show),
    };
  }

  return {
    action: "create",
    matchedShowId: null,
    matchedShowLabel: null,
    score: best?.score ?? 0,
    fieldDiffs: buildFieldDiffs(extraction.show, null),
  };
}

function scoreAttachShow(
  show: Show,
  hint: { date: string | null; city: string | null } | null,
): number {
  const date = hint?.date ?? null;
  const city = hint?.city ?? null;

  let score = 0;
  if (date && show.date === date) score += 50;
  else if (datesClose(date, show.date, 1)) score += 35;
  else if (datesClose(date, show.date, 2)) score += 20;

  if (city && norm(city) === norm(show.city)) score += 30;
  else if (city && show.city && norm(show.city).includes(norm(city)))
    score += 18;
  else if (city && show.city && norm(city).includes(norm(show.city)))
    score += 12;

  return score;
}

/**
 * Match travel/hotel to existing shows. Never creates a show.
 * Returns ranked candidates for the review picker.
 */
export function matchShowForAttach(
  shows: Show[],
  hint: { date: string | null; city: string | null } | null,
): AttachMatchResult {
  if (shows.length === 0) {
    return {
      matchedShowId: null,
      matchedShowLabel: null,
      score: 0,
      confidence: "none",
      candidates: [],
      requiresShow: true,
    };
  }

  const ranked = shows
    .map((show) => ({
      show,
      score: scoreAttachShow(show, hint),
    }))
    .sort((a, b) => b.score - a.score);

  const candidates: ShowCandidate[] = ranked.slice(0, 5).map(({ show, score }) => ({
    id: show.id,
    label: labelShow(show),
    score,
  }));

  const best = ranked[0];

  if (best.score >= ATTACH_HIGH) {
    return {
      matchedShowId: best.show.id,
      matchedShowLabel: labelShow(best.show),
      score: best.score,
      confidence: "high",
      candidates,
      requiresShow: true,
    };
  }

  if (best.score >= ATTACH_LOW) {
    return {
      matchedShowId: best.show.id,
      matchedShowLabel: labelShow(best.show),
      score: best.score,
      confidence: "low",
      candidates,
      requiresShow: true,
    };
  }

  return {
    matchedShowId: null,
    matchedShowLabel: null,
    score: best.score,
    confidence: "none",
    candidates,
    requiresShow: true,
  };
}
