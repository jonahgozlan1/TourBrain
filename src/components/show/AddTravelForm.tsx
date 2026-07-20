"use client";

import { useState, useTransition } from "react";
import { addTravelAction } from "@/app/actions/travel";
import { Modal } from "@/components/ui/Modal";

export function AddTravelForm({ showId }: { showId: string }) {
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
        + Add travel
      </button>

      <Modal open={open} title="Add travel" onClose={close}>
        <form
          className="space-y-3"
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              const result = await addTravelAction(formData);
              if (result?.error) setError(result.error);
              else close();
            });
          }}
        >
          <input type="hidden" name="showId" value={showId} />
          <label className="block space-y-1.5">
            <span className="text-sm text-[var(--muted)]">Type</span>
            <select name="type" defaultValue="flight" className="field">
              <option value="flight">Flight</option>
              <option value="bus">Bus / tour bus</option>
              <option value="train">Train</option>
              <option value="car">Car / van</option>
              <option value="other">Other</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">Date</span>
              <input name="date" type="date" className="field" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">Confirmation</span>
              <input name="confirmationNumber" className="field" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">From</span>
              <input name="departure" className="field" placeholder="Paris" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">To</span>
              <input name="arrival" className="field" placeholder="Berlin" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">Dep time</span>
              <input name="departureTime" type="time" className="field" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">Arr time</span>
              <input name="arrivalTime" type="time" className="field" />
            </label>
          </div>
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
