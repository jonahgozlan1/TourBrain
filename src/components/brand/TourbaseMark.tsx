type TourbaseMarkProps = {
  className?: string;
};

/** Solid teal play button — Tourbase mark. */
export function TourbaseMark({ className }: TourbaseMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M10.5 7.5c-.6 0-1 .4-1 1v15c0 .8.9 1.3 1.6.8l12.5-7.5c.6-.4.6-1.2 0-1.6l-12.5-7.7c-.3-.2-.7-.3-1.1-.3Z"
        fill="var(--accent)"
      />
    </svg>
  );
}
