"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createShowAction, updateShowAction } from "@/app/actions/shows";
import type { Show } from "@/lib/types/domain";

type ShowFormProps = {
  tourId: string;
  show?: Show;
  cancelHref: string;
};

export function ShowForm({ tourId, show, cancelHref }: ShowFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(show);

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = isEdit
            ? await updateShowAction(formData)
            : await createShowAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <input type="hidden" name="tourId" value={tourId} />
      {show ? <input type="hidden" name="showId" value={show.id} /> : null}

      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Date</span>
        <input
          name="date"
          type="date"
          required
          defaultValue={show?.date ?? ""}
          className="field"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">City</span>
          <input
            name="city"
            defaultValue={show?.city ?? ""}
            className="field"
            placeholder="Berlin"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">Country</span>
          <input
            name="country"
            defaultValue={show?.country ?? ""}
            className="field"
            placeholder="Germany"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Venue</span>
        <input
          name="venue"
          defaultValue={show?.venue ?? ""}
          className="field"
          placeholder="Lido Berlin"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Promoter</span>
        <input
          name="promoter"
          defaultValue={show?.promoter ?? ""}
          className="field"
          placeholder="XYZ Events"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Status</span>
        <select
          name="status"
          defaultValue={show?.status ?? "draft"}
          className="field"
        >
          <option value="draft">Draft</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(
          [
            ["loadInTime", "Load-in", show?.loadInTime],
            ["soundcheckTime", "Soundcheck", show?.soundcheckTime],
            ["doorsTime", "Doors", show?.doorsTime],
            ["showTime", "Show", show?.showTime],
            ["curfew", "Curfew", show?.curfew],
          ] as const
        ).map(([name, label, value]) => (
          <label key={name} className="block space-y-1.5">
            <span className="text-sm text-[var(--muted)]">{label}</span>
            <input
              name={name}
              type="time"
              defaultValue={value ?? ""}
              className="field"
            />
          </label>
        ))}
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Notes</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={show?.notes ?? ""}
          className="field"
          placeholder="Anything else for this show day"
        />
      </label>

      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Saving…" : isEdit ? "Save show" : "Add show"}
        </button>
        <Link
          href={cancelHref}
          className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
