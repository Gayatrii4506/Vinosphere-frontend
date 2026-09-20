import { API_V1_URL } from '../api-config';
import { createClient } from '../supabase/client';

export type WineInteractionType = 'VIEW' | 'LIKE' | 'DISLIKE' | 'WISHLIST' | 'PURCHASE';

export interface UserWineInteraction {
  id: string;
  userId: string;
  wineId: string;
  interactionType: WineInteractionType;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserInteractionSummary {
  userId: string;
  viewedWineIds: string[];
  likedWineIds: string[];
  dislikedWineIds: string[];
  wishlistedWineIds: string[];
  purchasedWineIds: string[];
  totalInteractions: number;
}

const STORAGE_KEY = 'vinosphere_interaction_summary';
const EVENT_NAME = 'vinosphere_interaction_updated';

/**
 * Helper to get current Supabase session access token for authenticated API requests
 */
async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch (err) {
    // Non-blocking
  }
  return {};
}

/**
 * Helper to get local interaction summary cache
 */
export function getLocalInteractionSummary(): UserInteractionSummary {
  if (typeof window === 'undefined') {
    return {
      userId: 'anonymous',
      viewedWineIds: [],
      likedWineIds: [],
      dislikedWineIds: [],
      wishlistedWineIds: [],
      purchasedWineIds: [],
      totalInteractions: 0,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // Fallback
  }

  return {
    userId: 'anonymous',
    viewedWineIds: [],
    likedWineIds: [],
    dislikedWineIds: [],
    wishlistedWineIds: [],
    purchasedWineIds: [],
    totalInteractions: 0,
  };
}

/**
 * Helper to save and broadcast local interaction summary cache
 */
function saveLocalInteractionSummary(summary: UserInteractionSummary) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(summary));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: summary }));
  } catch (e) {
    // Non-blocking
  }
}

/**
 * Tracks a wine interaction (VIEW, LIKE, DISLIKE, WISHLIST, PURCHASE)
 * for the current user, updating local state instantly and syncing with backend.
 */
export async function trackWineInteraction(
  wineId: string,
  interactionType: WineInteractionType,
  metadata?: Record<string, any>
): Promise<UserWineInteraction | null> {
  if (!wineId) return null;

  const current = getLocalInteractionSummary();
  const wineIdStr = String(wineId);

  // Optimistic local update
  const viewedSet = new Set(current.viewedWineIds);
  const likedSet = new Set(current.likedWineIds);
  const dislikedSet = new Set(current.dislikedWineIds);
  const wishlistedSet = new Set(current.wishlistedWineIds);
  const purchasedSet = new Set(current.purchasedWineIds);

  if (interactionType === 'VIEW') {
    viewedSet.add(wineIdStr);
  } else if (interactionType === 'LIKE') {
    likedSet.add(wineIdStr);
    dislikedSet.delete(wineIdStr); // Mutually exclusive with dislike
  } else if (interactionType === 'DISLIKE') {
    dislikedSet.add(wineIdStr);
    likedSet.delete(wineIdStr);
    wishlistedSet.delete(wineIdStr);
  } else if (interactionType === 'WISHLIST') {
    wishlistedSet.add(wineIdStr);
    dislikedSet.delete(wineIdStr);
  } else if (interactionType === 'PURCHASE') {
    purchasedSet.add(wineIdStr);
    dislikedSet.delete(wineIdStr);
  }

  const updated: UserInteractionSummary = {
    userId: current.userId,
    viewedWineIds: Array.from(viewedSet),
    likedWineIds: Array.from(likedSet),
    dislikedWineIds: Array.from(dislikedSet),
    wishlistedWineIds: Array.from(wishlistedSet),
    purchasedWineIds: Array.from(purchasedSet),
    totalInteractions:
      viewedSet.size + likedSet.size + dislikedSet.size + wishlistedSet.size + purchasedSet.size,
  };

  saveLocalInteractionSummary(updated);

  // Sync with backend API
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_V1_URL}/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        wineId: wineIdStr,
        interactionType,
        metadata,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return result.data || null;
    }
  } catch (error) {
    // Local update succeeded; backend sync failed gracefully
  }

  return null;
}

/**
 * Fetches user's interaction history summary across all 5 interaction categories.
 */
export async function fetchUserInteractionSummary(): Promise<UserInteractionSummary> {
  const localSummary = getLocalInteractionSummary();

  try {
    const headers = await getAuthHeader();
    if (!headers.Authorization) {
      return localSummary;
    }

    const response = await fetch(`${API_V1_URL}/interactions/summary`, {
      headers,
    });

    if (response.ok) {
      const result = await response.json();
      if (result.data) {
        // Merge with local state to ensure no loss of recent clicks
        const backendData: UserInteractionSummary = result.data;
        const merged: UserInteractionSummary = {
          userId: backendData.userId || localSummary.userId,
          viewedWineIds: Array.from(new Set([...backendData.viewedWineIds, ...localSummary.viewedWineIds])),
          likedWineIds: Array.from(new Set([...backendData.likedWineIds, ...localSummary.likedWineIds])),
          dislikedWineIds: Array.from(new Set([...backendData.dislikedWineIds, ...localSummary.dislikedWineIds])),
          wishlistedWineIds: Array.from(new Set([...backendData.wishlistedWineIds, ...localSummary.wishlistedWineIds])),
          purchasedWineIds: Array.from(new Set([...backendData.purchasedWineIds, ...localSummary.purchasedWineIds])),
          totalInteractions: backendData.totalInteractions || localSummary.totalInteractions,
        };
        saveLocalInteractionSummary(merged);
        return merged;
      }
    }
  } catch (error) {
    // Return local fallback
  }

  return localSummary;
}

/**
 * Resets user's recorded behavioral interactions.
 */
export async function resetUserInteractions(): Promise<boolean> {
  const emptySummary: UserInteractionSummary = {
    userId: 'anonymous',
    viewedWineIds: [],
    likedWineIds: [],
    dislikedWineIds: [],
    wishlistedWineIds: [],
    purchasedWineIds: [],
    totalInteractions: 0,
  };

  saveLocalInteractionSummary(emptySummary);

  try {
    const headers = await getAuthHeader();
    if (headers.Authorization) {
      await fetch(`${API_V1_URL}/interactions/me`, {
        method: 'DELETE',
        headers,
      });
    }
  } catch (err) {
    // Non-blocking
  }

  return true;
}
