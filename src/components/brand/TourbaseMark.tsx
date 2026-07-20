type TourbaseMarkProps = {
  className?: string;
  /** Use accent on the center stop (default true). */
  accent?: boolean;
};

/** T monogram that also reads as a short tour route. */
export function TourbaseMark({ className, accent = true }: TourbaseMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M8 9h16"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
      />
      <path
        d="M16 9v15"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
      />
      <circle cx="8" cy="9" r="2.35" fill="currentColor" />
      <circle
        cx="16"
        cy="9"
        r="2.35"
        fill={accent ? "var(--accent)" : "currentColor"}
      />
      <circle cx="24" cy="9" r="2.35" fill="currentColor" />
    </svg>
  );
}
