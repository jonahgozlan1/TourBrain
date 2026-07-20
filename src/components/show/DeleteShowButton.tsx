"use client";

import { useState, useTransition } from "react";
import { deleteShowAction } from "@/app/actions/shows";
import { Modal } from "@/components/ui/Modal";

export function DeleteShowButton({
  showId,
  label,
}: {
  showId: string;
  label: string;
}) {
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
        className="text-sm font-medium text-[var(--danger)] transition-opacity hover:opacity-70"
      >
        Delete show
      </button>

      <Modal open={open} title="Delete show" onClose={close}>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Delete{" "}
          <span className="font-medium text-[var(--ink)]">{label}</span>? This
          removes the show and its travel, hotel, and people links. Documents
          stay in Import.
        </p>
        {error ? (
          <p className="mt-3 text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <form
            action={(formData) => {
              setError(null);
              startTransition(async () => {
                const result = await deleteShowAction(formData);
                if (result?.error) setError(result.error);
              });
            }}
          >
            <input type="hidden" name="showId" value={showId} />
            <button
              type="submit"
              disabled={pending}
              className="rounded-[var(--radius-sm)] bg-[var(--danger)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Delete show"}
            </button>
          </form>
          <button
            type="button"
            onClick={close}
            className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
}
