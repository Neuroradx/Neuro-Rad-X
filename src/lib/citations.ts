/**
 * Removes citation markers from text.
 * Matches: [cite: 171], [cite:123], [****], [**], [*], etc.
 */
export function stripCitationsFromText(text: string): string {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/\[\s*cite:\s*\d+\s*\]/gi, '')
    .replace(/\[\*+\]/g, '')
    .replace(/  +/g, ' ')
    .trim();
}
