import type { Show } from "@/lib/types/domain";
import { ShowWidget } from "@/components/show/ShowWidget";

export function ShowNotes({ notes }: { notes: string }) {
  return (
    <ShowWidget title="Notes">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">
        {notes}
      </p>
    </ShowWidget>
  );
}
