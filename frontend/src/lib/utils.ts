export function safeFormatDate(dateStr?: string): string {
  if (!dateStr || typeof dateStr !== 'string') return "Recently";
  const trimmed = dateStr.trim();
  if (trimmed === "Just now" || trimmed === "Recently") return trimmed;

  // Replace space with 'T' for WebKit / Safari ISO format compatibility
  const isoStr = trimmed.replace(" ", "T");
  const parsed = new Date(isoStr);
  return isNaN(parsed.getTime()) ? "Recently" : parsed.toLocaleDateString();
}
