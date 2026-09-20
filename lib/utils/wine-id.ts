/**
 * Normalizes wine IDs for database and catalog consistency.
 */
export function normalizeWineId(id: string | number): string {
  if (!id) return '';
  return String(id).trim();
}

/**
 * Checks if two wine IDs match, safely handling string numbers, UUIDs, and slugs.
 */
export function isWineIdMatch(id1: string | number | undefined | null, id2: string | number | undefined | null): boolean {
  if (!id1 || !id2) return false;
  const s1 = String(id1).trim().toLowerCase();
  const s2 = String(id2).trim().toLowerCase();
  
  if (s1 === s2) return true;

  // Check if one is a UUID with leading zeroes matching a numeric ID
  const clean1 = s1.replace(/^0+/, '').replace(/-/g, '');
  const clean2 = s2.replace(/^0+/, '').replace(/-/g, '');
  if (clean1 && clean2 && clean1 === clean2) return true;

  return false;
}
