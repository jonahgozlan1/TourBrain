"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/app/actions/profile";

export function EditAccountForm({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="max-w-md space-y-4"
      action={(formData) => {
        setError(null);
        setMessage(null);
        startTransition(async () => {
          const result = await updateProfileAction(formData);
          if (result?.error) setError(result.error);
          else if (result?.message) setMessage(result.message);
        });
      }}
    >
      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Name</span>
        <input
          name="name"
          required
          defaultValue={name}
          className="field"
          placeholder="Your name"
          autoComplete="name"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Email</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={email}
          className="field"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>

      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-[var(--accent)]" role="status">
          {message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Saving…" : "Save account"}
      </button>
    </form>
  );
}
