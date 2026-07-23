/** Shorten long filenames for narrow layouts; keeps extension when possible. */
export function formatFileName(name: string, maxLength = 40): string {
  if (name.length <= maxLength) return name;

  const dotIndex = name.lastIndexOf(".");
  const ext = dotIndex > 0 ? name.slice(dotIndex) : "";
  const base = ext ? name.slice(0, dotIndex) : name;
  const budget = maxLength - ext.length - 1;

  if (budget <= 4) return `${name.slice(0, maxLength - 1)}…`;
  return `${base.slice(0, budget)}…${ext}`;
}

/** Display helpers for show dates and local wall-clock times. */

export function formatShowDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** "14:00" → "2:00 PM" */
export function formatTime(time: string | null): string {
  if (!time) return "—";
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
