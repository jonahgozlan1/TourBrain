import type { Contact } from "@/lib/types/domain";
import { EntryMenu } from "@/components/show/EntryMenu";
import { ShowWidget } from "@/components/show/ShowWidget";

export function ShowContacts({
  showId,
  contacts,
  action,
}: {
  showId: string;
  contacts: Contact[];
  action?: React.ReactNode;
}) {
  return (
    <ShowWidget title="People" action={action}>
      {contacts.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No contacts linked yet.</p>
      ) : (
        <ul className="space-y-3">
          {contacts.map((contact) => {
            const meta = [contact.role, contact.company]
              .filter(Boolean)
              .join(" · ");
            return (
              <li
                key={contact.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--ink)]">
                    {contact.name}
                  </p>
                  {meta ? (
                    <p className="truncate text-sm text-[var(--muted)]">
                      {meta}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {contact.email ? (
                    <a
                      href={`mailto:${contact.email}`}
                      aria-label={`Email ${contact.name}`}
                      title={contact.email}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--ink-soft)] hover:text-[var(--accent)]"
                    >
                      <MailIcon />
                    </a>
                  ) : null}
                  {contact.phone ? (
                    <a
                      href={`tel:${contact.phone}`}
                      aria-label={`Call ${contact.name}`}
                      title={contact.phone}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--ink-soft)] hover:text-[var(--accent)]"
                    >
                      <PhoneIcon />
                    </a>
                  ) : null}
                  <EntryMenu
                    kind="contact"
                    showId={showId}
                    entry={contact}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ShowWidget>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="m5 7 7 5.5L19 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.5 4.75h2.2c.4 0 .76.24.92.61l1.05 2.5a1 1 0 0 1-.23 1.1l-1.2 1.2a12.5 12.5 0 0 0 4.6 4.6l1.2-1.2a1 1 0 0 1 1.1-.23l2.5 1.05c.37.16.61.52.61.92v2.2a1.75 1.75 0 0 1-1.9 1.74A15.25 15.25 0 0 1 4.76 6.65 1.75 1.75 0 0 1 6.5 4.75h2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}
