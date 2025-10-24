export function formatReadableDate(isoString: string): string {
  if (!isoString) return "";

  const date = new Date(isoString);

  // Use Intl.DateTimeFormat for locale-aware formatting
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}