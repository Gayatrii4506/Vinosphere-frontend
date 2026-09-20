import { Wine } from '@/constants/wines';
import { UserPreferences } from './recommendationTypes';

/**
 * Client-Side Palate Matching & Fallback Scoring Helper
 */
export function calculatePalateScore(wine: Wine, prefs: UserPreferences | null): number {
    if (!prefs) return (wine.rating || 85);

    let score = (wine.rating || 85);
    const wineType = (wine.type || '').toUpperCase();
    const prefTypes = (prefs.favorite_types || []).map(t => t.toUpperCase());

    if (prefTypes.length > 0 && !prefTypes.includes('ANYTHING') && !prefTypes.includes('ALL')) {
        if (prefTypes.some(t => wineType.includes(t))) {
            score += 20;
        }
    }

    if (prefs.sweetness && prefs.sweetness !== 'all') {
        const wSweet = (wine.sugar || wine.normalizedSweetness || '').toLowerCase();
        if (wSweet.includes(prefs.sweetness.toLowerCase())) {
            score += 15;
        }
    }

    if (prefs.body_style && prefs.body_style !== 'all') {
        const wBody = (wine.body || wine.normalizedBody || '').toLowerCase();
        if (wBody.includes(prefs.body_style.toLowerCase())) {
            score += 15;
        }
    }

    return score;
}
