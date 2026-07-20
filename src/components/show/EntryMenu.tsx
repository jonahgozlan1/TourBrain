"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  deleteHotelAction,
  deleteTravelAction,
  removeContactFromShowAction,
  updateContactAction,
  updateHotelAction,
  updateTravelAction,
} from "@/app/actions/travel";
import { Modal } from "@/components/ui/Modal";
import type { Contact, Hotel, Travel } from "@/lib/types/domain";

type EntryMenuProps =
  | { kind: "travel"; entry: Travel }
  | { kind: "hotel"; entry: Hotel }
  | { kind: "contact"; showId: string; entry: Contact };

function timeInputValue(value: string | null) {
  if (!value) return "";
  return value.slice(0, 5);
}

function entryLabel(props: EntryMenuProps): string {
  if (props.kind === "travel") {
    const { entry } = props;
    if (entry.departure && entry.arrival) {
      return `${entry.departure} → ${entry.arrival}`;
    }
    return entry.type.charAt(0).toUpperCase() + entry.type.slice(1);
  }
  if (props.kind === "hotel") return props.entry.name ?? "Hotel";
  return props.entry.name;
}

export function EntryMenu(props: EntryMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<"edit" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const label = entryLabel(props);
  const showId = props.kind === "contact" ? props.showId : props.entry.showId;

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function closePanel() {
    setPanel(null);
    setError(null);
  }

  function openPanel(next: "edit" | "delete") {
    setMenuOpen(false);
    setError(null);
    setPanel(next);
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`Actions for ${label}`}
        onClick={() => setMenuOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--ink-soft)] hover:text-[var(--ink)]"
      >
        <MoreIcon />
      </button>

      {menuOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 min-w-[8.5rem] overflow-hidden rounded-[var(--radius-md)] bg-[var(--surface)] py-1 shadow-[0_12px_32px_rgba(0,0,0,0.4)] ring-1 ring-[var(--ink-soft)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => openPanel("edit")}
            className="block w-full px-3.5 py-2 text-left text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--ink-soft)]"
          >
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => openPanel("delete")}
            className="block w-full px-3.5 py-2 text-left text-sm font-medium text-[var(--danger)] transition-colors hover:bg-[var(--ink-soft)]"
          >
            Delete
          </button>
        </div>
      ) : null}

      <Modal
        open={panel === "edit"}
        title={
          props.kind === "travel"
            ? "Edit travel"
            : props.kind === "hotel"
              ? "Edit hotel"
              : "Edit person"
        }
        onClose={closePanel}
      >
        {props.kind === "travel" ? (
          <TravelEditForm
            entry={props.entry}
            error={error}
            pending={pending}
            onCancel={closePanel}
            onSubmit={(formData) => {
              setError(null);
              startTransition(async () => {
                const result = await updateTravelAction(formData);
                if (result?.error) setError(result.error);
                else closePanel();
              });
            }}
          />
        ) : props.kind === "hotel" ? (
          <HotelEditForm
            entry={props.entry}
            error={error}
            pending={pending}
            onCancel={closePanel}
            onSubmit={(formData) => {
              setError(null);
              startTransition(async () => {
                const result = await updateHotelAction(formData);
                if (result?.error) setError(result.error);
                else closePanel();
              });
            }}
          />
        ) : (
          <ContactEditForm
            showId={props.showId}
            entry={props.entry}
            error={error}
            pending={pending}
            onCancel={closePanel}
            onSubmit={(formData) => {
              setError(null);
              startTransition(async () => {
                const result = await updateContactAction(formData);
                if (result?.error) setError(result.error);
                else closePanel();
              });
            }}
          />
        )}
      </Modal>

      <Modal
        open={panel === "delete"}
        title={
          props.kind === "travel"
            ? "Delete travel"
            : props.kind === "hotel"
              ? "Delete hotel"
              : "Delete person"
        }
        onClose={closePanel}
      >
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          {props.kind === "contact"
            ? "Remove this person from the show?"
            : `Delete this ${props.kind} from the show?`}{" "}
          <span className="font-medium text-[var(--ink)]">{label}</span>
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
                const action =
                  props.kind === "travel"
                    ? deleteTravelAction
                    : props.kind === "hotel"
                      ? deleteHotelAction
                      : removeContactFromShowAction;
                const result = await action(formData);
                if (result?.error) setError(result.error);
                else closePanel();
              });
            }}
          >
            <input type="hidden" name="showId" value={showId} />
            <input
              type="hidden"
              name={
                props.kind === "travel"
                  ? "travelId"
                  : props.kind === "hotel"
                    ? "hotelId"
                    : "contactId"
              }
              value={props.entry.id}
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-[var(--radius-sm)] bg-[var(--danger)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Delete"}
            </button>
          </form>
          <button
            type="button"
            onClick={closePanel}
            className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

function FormActions({
  pending,
  onCancel,
}: {
  pending: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 pt-2">
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Saving…" : "Save"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
      >
        Cancel
      </button>
    </div>
  );
}

function TravelEditForm({
  entry,
  error,
  pending,
  onCancel,
  onSubmit,
}: {
  entry: Travel;
  error: string | null;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  return (
    <form className="space-y-3" action={onSubmit}>
      <input type="hidden" name="showId" value={entry.showId} />
      <input type="hidden" name="travelId" value={entry.id} />
      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Type</span>
        <select name="type" defaultValue={entry.type} className="field">
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
          <input
            name="date"
            type="date"
            defaultValue={entry.date ?? ""}
            className="field"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">Confirmation</span>
          <input
            name="confirmationNumber"
            defaultValue={entry.confirmationNumber ?? ""}
            className="field"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">From</span>
          <input
            name="departure"
            defaultValue={entry.departure ?? ""}
            className="field"
            placeholder="Paris"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">To</span>
          <input
            name="arrival"
            defaultValue={entry.arrival ?? ""}
            className="field"
            placeholder="Berlin"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">Dep time</span>
          <input
            name="departureTime"
            type="time"
            defaultValue={timeInputValue(entry.departureTime)}
            className="field"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">Arr time</span>
          <input
            name="arrivalTime"
            type="time"
            defaultValue={timeInputValue(entry.arrivalTime)}
            className="field"
          />
        </label>
      </div>
      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <FormActions pending={pending} onCancel={onCancel} />
    </form>
  );
}

function HotelEditForm({
  entry,
  error,
  pending,
  onCancel,
  onSubmit,
}: {
  entry: Hotel;
  error: string | null;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  return (
    <form className="space-y-3" action={onSubmit}>
      <input type="hidden" name="showId" value={entry.showId} />
      <input type="hidden" name="hotelId" value={entry.id} />
      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Name</span>
        <input
          name="name"
          defaultValue={entry.name ?? ""}
          className="field"
          placeholder="Hotel name"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Address</span>
        <input
          name="address"
          defaultValue={entry.address ?? ""}
          className="field"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">Check-in</span>
          <input
            name="checkIn"
            type="date"
            defaultValue={entry.checkIn ?? ""}
            className="field"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">Check-out</span>
          <input
            name="checkOut"
            type="date"
            defaultValue={entry.checkOut ?? ""}
            className="field"
          />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Confirmation</span>
        <input
          name="confirmationNumber"
          defaultValue={entry.confirmationNumber ?? ""}
          className="field"
        />
      </label>
      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <FormActions pending={pending} onCancel={onCancel} />
    </form>
  );
}

function ContactEditForm({
  showId,
  entry,
  error,
  pending,
  onCancel,
  onSubmit,
}: {
  showId: string;
  entry: Contact;
  error: string | null;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  return (
    <form className="space-y-3" action={onSubmit}>
      <input type="hidden" name="showId" value={showId} />
      <input type="hidden" name="contactId" value={entry.id} />
      <label className="block space-y-1.5">
        <span className="text-sm text-[var(--muted)]">Name</span>
        <input
          name="name"
          required
          defaultValue={entry.name}
          className="field"
          placeholder="Sarah Johnson"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">Role</span>
          <input
            name="role"
            defaultValue={entry.role ?? ""}
            className="field"
            placeholder="Promoter"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">Company</span>
          <input
            name="company"
            defaultValue={entry.company ?? ""}
            className="field"
            placeholder="XYZ Events"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={entry.email ?? ""}
            className="field"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-[var(--muted)]">Phone</span>
          <input
            name="phone"
            type="tel"
            defaultValue={entry.phone ?? ""}
            className="field"
          />
        </label>
      </div>
      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <FormActions pending={pending} onCancel={onCancel} />
    </form>
  );
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}
