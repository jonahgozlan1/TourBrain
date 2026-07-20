"use client";

import { useState, useTransition } from "react";
import { addHotelAction } from "@/app/actions/travel";
import { Modal } from "@/components/ui/Modal";

export function AddHotelForm({ showId }: { showId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-[var(--accent)] transition-opacity hover:opacity-70"
      >
        + Add hotel
      </button>

      <Modal open={open} title="Add hotel" onClose={close}>
        <form
          className="space-y-3"
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              const result = await addHotelAction(formData);
              if (result?.error) setError(result.error);
              else close();
            });
          }}
        >
          <input type="hidden" name="showId" value={showId} />
          <label className="block space-y-1.5">
            <span className="text-sm text-[var(--muted)]">Name</span>
            <input name="name" className="field" placeholder="Hotel name" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm text-[var(--muted)]">Address</span>
            <input name="address" className="field" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">Check-in</span>
              <input name="checkIn" type="date" className="field" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">Check-out</span>
              <input name="checkOut" type="date" className="field" />
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm text-[var(--muted)]">Confirmation</span>
            <input name="confirmationNumber" className="field" />
          </label>
          {error ? (
            <p className="text-sm text-[var(--danger)]" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={close}
              className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
