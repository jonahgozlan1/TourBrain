"use client";

import { useState, useTransition } from "react";
import {
  confirmExtractionAction,
  discardExtractionAction,
} from "@/app/actions/documents";
import type { ShowMatchResult } from "@/lib/extraction/matchShow";
import type { ContractExtraction } from "@/lib/extraction/schemas";

type Props = {
  documentId: string;
  reviewId: string;
  fileName: string;
  extraction: ContractExtraction;
  match: ShowMatchResult;
};

export function ContractReviewForm({
  documentId,
  reviewId,
  fileName,
  extraction,
  match,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<"create" | "update">(
    match.action === "update" && match.matchedShowId ? "update" : "create",
  );

  const title =
    action === "update" && match.matchedShowLabel
      ? `Update show — ${match.matchedShowLabel}`
      : `Create show — ${extraction.show.city ?? extraction.show.venue ?? "New"}`;

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
      <input type="hidden" name="kind" value="contract" />
      <input type="hidden" name="documentId" value={documentId} />
      <input type="hidden" name="reviewId" value={reviewId} />
      <input type="hidden" name="action" value={action} />
      <input
        type="hidden"
        name="matchedShowId"
        value={action === "update" ? (match.matchedShowId ?? "") : ""}
      />
      <input
        type="hidden"
        name="contactJson"
        value={JSON.stringify(extraction.contact)}
      />

      <div>
        <p className="text-sm text-[var(--muted)]">{fileName}</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight text-[var(--ink)]">
          {title}
        </h1>
      </div>

      {match.matchedShowId ? (
        <fieldset className="space-y-2">
          <legend className="section-label !mb-2">Match</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={action === "update"}
              onChange={() => setAction("update")}
            />
            Update existing: {match.matchedShowLabel}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={action === "create"}
              onChange={() => setAction("create")}
            />
            Create a new show instead
          </label>
        </fieldset>
      ) : null}

      <div className="soft-panel !p-5">
        <h2 className="section-label !mt-0">Extracted fields</h2>
        <div className="mt-2 space-y-3">
          {(
            [
              ["date", "Date", extraction.show.date, "date"],
              ["city", "City", extraction.show.city, "text"],
              ["country", "Country", extraction.show.country, "text"],
              ["venue", "Venue", extraction.show.venue, "text"],
              ["promoter", "Promoter", extraction.show.promoter, "text"],
              ["loadInTime", "Load-in", extraction.show.load_in_time, "time"],
              [
                "soundcheckTime",
                "Soundcheck",
                extraction.show.soundcheck_time,
                "time",
              ],
              ["doorsTime", "Doors", extraction.show.doors_time, "time"],
              ["showTime", "Show time", extraction.show.show_time, "time"],
              ["curfew", "Curfew", extraction.show.curfew, "time"],
            ] as const
          ).map(([name, label, value, type]) => (
            <label key={name} className="block space-y-1">
              <span className="flex justify-between text-sm text-[var(--muted)]">
                <span>{label}</span>
                {!value ? (
                  <span className="text-xs text-[var(--accent)]">missing</span>
                ) : null}
              </span>
              <input
                name={name}
                type={type}
                defaultValue={value ?? ""}
                required={name === "date"}
                className="field"
              />
            </label>
          ))}
        </div>
      </div>

      {extraction.contact?.name ? (
        <div className="soft-panel !p-5 text-sm">
          <h2 className="section-label !mt-0">Contact</h2>
          <p className="font-medium text-[var(--ink)]">
            {extraction.contact.name}
          </p>
          <p className="text-[var(--muted)]">
            {[extraction.contact.role, extraction.contact.company]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      ) : null}

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
