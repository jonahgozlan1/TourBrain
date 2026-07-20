"use client";

import { useState, useTransition } from "react";
import { addContactAction } from "@/app/actions/travel";
import { Modal } from "@/components/ui/Modal";

export function AddContactForm({ showId }: { showId: string }) {
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
        + Add people
      </button>

      <Modal open={open} title="Add people" onClose={close}>
        <form
          className="space-y-3"
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              const result = await addContactAction(formData);
              if (result?.error) setError(result.error);
              else close();
            });
          }}
        >
          <input type="hidden" name="showId" value={showId} />
          <label className="block space-y-1.5">
            <span className="text-sm text-[var(--muted)]">Name</span>
            <input
              name="name"
              required
              className="field"
              placeholder="Sarah Johnson"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">Role</span>
              <input name="role" className="field" placeholder="Promoter" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">Company</span>
              <input name="company" className="field" placeholder="XYZ Events" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">Email</span>
              <input name="email" type="email" className="field" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm text-[var(--muted)]">Phone</span>
              <input name="phone" type="tel" className="field" />
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
