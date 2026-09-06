/**
 * hooks/useImageUrl.ts
 * ---------------------------------------------------------------------------
 * Utility hook and helpers for safe image URL usage in React components.
 *
 * Provides:
 *   - useSafeImageUrl(url, fallback)  — handles missing/broken/loading URLs
 *   - FALLBACK_FOOD_IMAGE             — default fallback for food images
 *   - FALLBACK_WINE_IMAGE             — default fallback for wine images
 *   - ImageState enum                 — 'loading' | 'loaded' | 'error' | 'placeholder'
 * ---------------------------------------------------------------------------
 */

'use client'

import { useState, useCallback, useEffect } from 'react'

// ---------------------------------------------------------------------------
// Fallback images (served from /public)
// ---------------------------------------------------------------------------
export const FALLBACK_FOOD_IMAGE = '/images/food_placeholder.png'
export const FALLBACK_WINE_IMAGE = '/bottle.png'

export type ImageState = 'loading' | 'loaded' | 'error' | 'placeholder'

/**
 * Returns a stable image src, current loading state, and an onError handler.
 *
 * Behaviour:
 *   - If imageUrl is null/empty   → state='placeholder', src=fallback (no network request)
 *   - While image is loading      → state='loading'
 *   - Image loads successfully    → state='loaded'
 *   - Image fails to load         → state='error', src=fallback (no broken <img> icon)
 *
 * @param imageUrl   The URL from the API (may be empty, null, or broken)
 * @param fallback   The local fallback path (from FALLBACK_FOOD_IMAGE / FALLBACK_WINE_IMAGE)
 */
export function useSafeImageUrl(
    imageUrl: string | undefined | null,
    fallback: string
): {
    src: string
    state: ImageState
    handleError: () => void
    handleLoad: () => void
} {
    const hasUrl = Boolean(imageUrl && imageUrl.trim())
    const primary = hasUrl ? imageUrl!.trim() : fallback

    const [src, setSrc]     = useState<string>(primary)
    const [state, setState] = useState<ImageState>(hasUrl ? 'loading' : 'placeholder')

    // If imageUrl changes (e.g. after async enrichment), reset state
    useEffect(() => {
        if (hasUrl) {
            setSrc(imageUrl!.trim())
            setState('loading')
        } else {
            setSrc(fallback)
            setState('placeholder')
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageUrl])

    const handleError = useCallback(() => {
        if (state !== 'error') {
            setState('error')
            setSrc(fallback)
        }
    }, [state, fallback])

    const handleLoad = useCallback(() => {
        setState('loaded')
    }, [])

    return { src, state, handleError, handleLoad }
}
