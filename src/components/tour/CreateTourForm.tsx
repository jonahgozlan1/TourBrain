"use client";

import { useState, useTransition } from "react";
import { createTourAction } from "@/app/actions/tours";

export function CreateTourForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mx-auto max-w-md space-y-4"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await createTourAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Tour name</span>
        <input
          name="name"
          required
          className="field"
          placeholder="Summer 2026 European Tour"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Artist</span>
        <input
          name="artistName"
          required
          className="field"
          placeholder="Artist name"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">Start date</span>
          <input name="startDate" type="date" className="field" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">End date</span>
          <input name="endDate" type="date" className="field" />
        </label>
      </div>

      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary"
      >
        {pending ? "Creating…" : "Create tour"}
      </button>
    </form>
  );
}
