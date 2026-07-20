"use client";

import { useState, useTransition } from "react";
import {
  confirmExtractionAction,
  discardExtractionAction,
} from "@/app/actions/documents";
import type { AttachMatchResult } from "@/lib/extraction/matchShow";
import type { HotelExtraction } from "@/lib/extraction/schemas";
import type { Show } from "@/lib/types/domain";

type Props = {
  documentId: string;
  reviewId: string;
  fileName: string;
  extraction: HotelExtraction;
  match: AttachMatchResult;
  shows: Show[];
};

export function HotelReviewForm({
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
        Add a show first, then attach this hotel document.
      </div>
    );
  }

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
      <input type="hidden" name="kind" value="hotel" />
      <input type="hidden" name="documentId" value={documentId} />
      <input type="hidden" name="reviewId" value={reviewId} />

      <div>
        <p className="text-sm text-[var(--muted)]">{fileName}</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight text-[var(--ink)]">
          Attach hotel
          {extraction.hotel.name ? ` — ${extraction.hotel.name}` : ""}
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
        <h2 className="section-label !mt-0">Hotel details</h2>
        {(
          [
            ["name", "Name", extraction.hotel.name, "text"],
            ["address", "Address", extraction.hotel.address, "text"],
            ["checkIn", "Check-in", extraction.hotel.check_in, "date"],
            ["checkOut", "Check-out", extraction.hotel.check_out, "date"],
            [
              "confirmationNumber",
              "Confirmation",
              extraction.hotel.confirmation_number,
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
            defaultValue={extraction.hotel.notes ?? ""}
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
