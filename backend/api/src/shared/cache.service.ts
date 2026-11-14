interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Retrieves an item from cache if not expired.
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Sets an item in cache with a TTL in seconds.
   */
  set<T>(key: string, data: T, ttlSeconds: number = 30): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Invalidates a specific cache key.
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidates keys matching a prefix.
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clears entire cache.
   */
  clearAll(): void {
    this.cache.clear();
  }

  // --- Domain-Specific Convenience Methods ---

  getPreferences(userId: string) {
    return this.get<any>(`user_pref:${userId}`);
  }

  setPreferences(userId: string, data: any, ttlSeconds = 30) {
    this.set(`user_pref:${userId}`, data, ttlSeconds);
  }

  invalidatePreferences(userId: string) {
    this.invalidate(`user_pref:${userId}`);
  }

  getInteractionSummary(userId: string) {
    return this.get<any>(`user_interactions:${userId}`);
  }

  setInteractionSummary(userId: string, data: any, ttlSeconds = 15) {
    this.set(`user_interactions:${userId}`, data, ttlSeconds);
  }

  invalidateInteractionSummary(userId: string) {
    this.invalidate(`user_interactions:${userId}`);
  }

  getNormalizedWines() {
    return this.get<any[]>('normalized_wines_catalog');
  }

  setNormalizedWines(data: any[], ttlSeconds = 60) {
    this.set('normalized_wines_catalog', data, ttlSeconds);
  }

  invalidateWines() {
    this.invalidate('normalized_wines_catalog');
  }
}

export const cacheService = new CacheService();
