/**
 * Normalizes wine IDs for database compatibility (Supabase UUID column requirement).
 */
export function normalizeWineId(id: string | number): string {
  if (!id) return '';
  const strId = String(id).trim();
  
  // If already a valid 36-char UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(strId)) {
    return strId.toLowerCase();
  }

  // For numeric or short IDs (e.g. demo wines '1', '2'), create a deterministic valid UUID:
  // e.g. '1' -> '00000000-0000-0000-0000-000000000001'
  const clean = strId.replace(/[^0-9a-f]/gi, '').toLowerCase();
  const padded = clean.padStart(12, '0').slice(-12);
  return `00000000-0000-0000-0000-${padded}`;
}

/**
 * Checks if two wine IDs match, accounting for original vs UUID-normalized representation.
 */
export function isWineIdMatch(id1: string | number, id2: string | number): boolean {
  if (!id1 || !id2) return false;
  const s1 = String(id1).trim();
  const s2 = String(id2).trim();
  if (s1 === s2) return true;
  return normalizeWineId(s1) === normalizeWineId(s2);
}
