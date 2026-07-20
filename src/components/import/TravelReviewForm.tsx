"use client";

import { useState, useTransition } from "react";
import {
  confirmExtractionAction,
  discardExtractionAction,
} from "@/app/actions/documents";
import type { AttachMatchResult } from "@/lib/extraction/matchShow";
import type { TravelExtraction } from "@/lib/extraction/schemas";
import type { Show } from "@/lib/types/domain";

type Props = {
  documentId: string;
  reviewId: string;
  fileName: string;
  extraction: TravelExtraction;
  match: AttachMatchResult;
  shows: Show[];
};

export function TravelReviewForm({
  documentId,
  reviewId,
  fileName,
  extraction,
  match,
  shows,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const defaultShowId =
    match.matchedShowId ?? match.candidates[0]?.id ?? shows[0]?.id ?? "";

  if (shows.length === 0) {
    return (
      <div className="danger-panel text-sm">
        Add a show first, then attach this travel document.
      </div>
    );
  }

  const travelLabel =
    extraction.travel.type === "bus"
      ? "Tour bus / coach"
      : extraction.travel.type.charAt(0).toUpperCase() +
        extraction.travel.type.slice(1);

  return (
    <form
      className="space-y-6"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await confirmExtractionAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <input type="hidden" name="kind" value="travel" />
      <input type="hidden" name="documentId" value={documentId} />
      <input type="hidden" name="reviewId" value={reviewId} />

      <div>
        <p className="text-sm text-[var(--muted)]">{fileName}</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight text-[var(--ink)]">
          Attach travel — {travelLabel}
        </h1>
        {match.confidence === "low" ? (
          <p className="mt-2 text-sm text-[var(--accent)]">
            Match is uncertain — confirm the show below.
          </p>
        ) : null}
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Attach to show</span>
        <select
          name="showId"
          required
          defaultValue={defaultShowId}
          className="field"
        >
          {shows.map((show) => (
            <option key={show.id} value={show.id}>
              {[show.date, show.city, show.venue].filter(Boolean).join(" · ")}
            </option>
          ))}
        </select>
      </label>

      <div className="soft-panel !p-5 space-y-3">
        <h2 className="section-label !mt-0">Travel details</h2>

        <label className="block space-y-1">
          <span className="text-sm text-[var(--muted)]">Type</span>
          <select
            name="type"
            defaultValue={extraction.travel.type}
            className="field"
          >
            <option value="flight">Flight</option>
            <option value="bus">Bus / tour bus</option>
            <option value="train">Train</option>
            <option value="car">Car / van</option>
            <option value="other">Other</option>
          </select>
        </label>

        {(
          [
            ["date", "Date", extraction.travel.date, "date"],
            ["departure", "Departure", extraction.travel.departure, "text"],
            ["arrival", "Arrival", extraction.travel.arrival, "text"],
            [
              "departureTime",
              "Departure time",
              extraction.travel.departure_time,
              "time",
            ],
            [
              "arrivalTime",
              "Arrival time",
              extraction.travel.arrival_time,
              "time",
            ],
            [
              "confirmationNumber",
              "Confirmation",
              extraction.travel.confirmation_number,
              "text",
            ],
          ] as const
        ).map(([name, label, value, type]) => (
          <label key={name} className="block space-y-1">
            <span className="text-sm text-[var(--muted)]">{label}</span>
            <input
              name={name}
              type={type}
              defaultValue={value ?? ""}
              className="field"
            />
          </label>
        ))}

        <label className="block space-y-1">
          <span className="text-sm text-[var(--muted)]">Notes</span>
          <textarea
            name="notes"
            rows={2}
            defaultValue={extraction.travel.notes ?? ""}
            className="field"
          />
        </label>
      </div>

      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary"
        >
          {pending ? "Saving…" : "Confirm"}
        </button>
        <button
          type="submit"
          formAction={(fd) => {
            setError(null);
            startTransition(async () => {
              const result = await discardExtractionAction(fd);
              if (result?.error) setError(result.error);
            });
          }}
          disabled={pending}
          className="rounded-md border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--muted)] disabled:opacity-60"
        >
          Discard
        </button>
      </div>
    </form>
  );
}
