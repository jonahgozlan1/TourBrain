"use client";

import { useState, useTransition } from "react";
import { updateTourAction } from "@/app/actions/tours";
import type { Tour } from "@/lib/types/domain";

export function EditTourForm({ tour }: { tour: Tour }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="max-w-md space-y-4"
      action={(formData) => {
        setError(null);
        setSaved(false);
        startTransition(async () => {
          const result = await updateTourAction(formData);
          if (result?.error) setError(result.error);
          else setSaved(true);
        });
      }}
    >
      <input type="hidden" name="tourId" value={tour.id} />

      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Tour name</span>
        <input
          name="name"
          required
          defaultValue={tour.name}
          className="field"
          placeholder="Summer 2026 European Tour"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Artist</span>
        <input
          name="artistName"
          required
          defaultValue={tour.artistName}
          className="field"
          placeholder="Artist name"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">Start date</span>
          <input
            name="startDate"
            type="date"
            defaultValue={tour.startDate ?? ""}
            className="field"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">End date</span>
          <input
            name="endDate"
            type="date"
            defaultValue={tour.endDate ?? ""}
            className="field"
          />
        </label>
      </div>

      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm text-[var(--accent)]" role="status">
          Tour updated.
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Saving…" : "Save tour"}
      </button>
    </form>
  );
}
