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

export const extractNameAndNumber = (input: string): { name: string; number: string } => {
  const match = input.match(/^(.+?)\s*\((\d+)\)$/);
  
  if (match) {
    return {
      name: match[1].trim(),     // "Test"
      number: match[2].trim()    // "51651"
    };
  }
  
  // Fallback if pattern doesn't match
  return {
    name: input,
    number: ""
  };
};
