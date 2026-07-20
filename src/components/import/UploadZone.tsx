"use client";

import { useState, useTransition } from "react";
import { uploadAndExtractAction } from "@/app/actions/documents";

export function UploadZone() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <form
      className="space-y-3"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await uploadAndExtractAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <label
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={() => setDragging(false)}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] bg-[var(--surface)] px-6 py-16 transition-[background-color,box-shadow] duration-200 hover:bg-[var(--surface-2)] ${
          dragging
            ? "bg-[var(--accent-soft)] shadow-[inset_0_0_0_1.5px_var(--accent)]"
            : ""
        } ${pending ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          type="file"
          name="file"
          className="sr-only"
          accept=".pdf,.txt,.csv,application/pdf,text/plain,text/csv"
          required
          disabled={pending}
          onChange={(e) => {
            const file = e.target.files?.[0];
            setFileName(file?.name ?? null);
            if (file) {
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <span className="font-display text-2xl tracking-tight text-[var(--ink)]">
          {pending ? "Extracting…" : "Upload document"}
        </span>
        {fileName ? (
          <span className="max-w-sm text-center text-sm text-[var(--muted)]">
            {fileName}
          </span>
        ) : (
          <span className="text-xs text-[var(--muted)]">PDF or text</span>
        )}
      </label>

      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
