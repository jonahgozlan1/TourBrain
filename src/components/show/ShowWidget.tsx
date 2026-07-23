export function ShowWidget({
  title,
  accent = false,
  children,
  action,
}: {
  title: string;
  accent?: boolean;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section
      className={`flex h-full min-w-0 flex-col overflow-hidden ${accent ? "soft-panel-accent" : "soft-panel"}`}
    >
      <h2
        className={`section-label !mt-0 !mb-3 ${accent ? "!text-[var(--accent)]" : ""}`}
      >
        {title}
      </h2>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
