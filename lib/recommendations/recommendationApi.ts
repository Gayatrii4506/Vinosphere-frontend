import { API_V1_URL } from '@/lib/api-config';
import { Wine } from '@/constants/wines';
import { RecommendationResponse } from './recommendationTypes';

/**
 * Client-Side Recommendation & Discovery API Client
 */
export async function fetchRecommendedCatalogue(params: {
    page?: number;
    limit?: number;
    sort?: string;
    type?: string;
    priceRange?: string;
    rating?: number;
    token?: string;
}): Promise<RecommendationResponse | null> {
    try {
        const query = new URLSearchParams();
        query.set('sort', params.sort || 'recommended');
        if (params.page) query.set('page', String(params.page));
        if (params.limit) query.set('limit', String(params.limit));
        if (params.type && params.type !== 'all') query.set('type', params.type);
        if (params.priceRange) query.set('priceRange', params.priceRange);
        if (params.rating) query.set('rating', String(params.rating));

        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (params.token) {
            headers['Authorization'] = `Bearer ${params.token}`;
        }

        const res = await fetch(`${API_V1_URL}/wines?${query.toString()}`, {
            method: 'GET',
            headers,
            cache: 'no-store'
        });

        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.warn('Failed to fetch recommended catalogue:', err);
        return null;
    }
}

/**
 * Fetches similar wines for a given bottle ID
 */
export async function fetchSimilarWines(wineId: string, limit = 4): Promise<Wine[]> {
    try {
        const res = await fetch(`${API_V1_URL}/wines/${wineId}/similar?limit=${limit}`);
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch {
        return [];
    }
}

/**
 * Fetches popular crowd-favorite wines (cold-start baseline)
 */
export async function fetchPopularWines(limit = 8): Promise<Wine[]> {
    try {
        const res = await fetch(`${API_V1_URL}/wines/popular?limit=${limit}`);
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch {
        return [];
    }
}
