'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Wine } from '@/constants/wines'
import { createClient } from '@/lib/supabase/client'
import { API_V1_URL } from '@/lib/api-config'
import { normalizeWineId, isWineIdMatch } from '@/lib/utils/wine-id'

interface WishlistContextType {
    wishlistIds: string[]
    wishlistCount: number
    isLoading: boolean
    isWishlisted: (wineId: string | number) => boolean
    toggleWishlist: (wine: Wine) => Promise<{ success: boolean; requiresAuth?: boolean; newlyLiked?: boolean }>
    refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType>({
    wishlistIds: [],
    wishlistCount: 0,
    isLoading: false,
    isWishlisted: () => false,
    toggleWishlist: async () => ({ success: false }),
    refreshWishlist: async () => {},
})

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlistIds, setWishlistIds] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [userId, setUserId] = useState<string | null>(null)

    const fetchUserWishlist = useCallback(async (uid: string, token?: string) => {
        try {
            // 1. Check local cache first for instant UI response
            try {
                const cached = localStorage.getItem(`vinosphere_wishlist_${uid}`)
                if (cached) {
                    const parsed = JSON.parse(cached)
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setWishlistIds(parsed)
                    }
                }
            } catch {}

            const supabase = createClient()
            let fetchedFromDb = false

            // 2. Direct Supabase Query
            try {
                const { data, error } = await supabase
                    .from('wishlist')
                    .select('wine_id')
                    .eq('user_id', uid)

                if (!error && data) {
                    const ids = data.map((item: any) => String(item.wine_id)).filter(Boolean)
                    setWishlistIds(ids)
                    fetchedFromDb = true
                    try {
                        localStorage.setItem(`vinosphere_wishlist_${uid}`, JSON.stringify(ids))
                    } catch {}
                } else if (error) {
                    console.warn('Supabase wishlist read notice:', error.message)
                }
            } catch (err) {
                console.warn('Direct Supabase fetch error:', err)
            }

            // 3. If Supabase had no data or errored, try backend API
            if (!fetchedFromDb && token) {
                try {
                    const res = await fetch(`${API_V1_URL}/wishlist`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                        cache: 'no-store'
                    })
                    if (res.ok) {
                        const json = await res.json()
                        const ids: string[] = (json.data || []).map((item: any) => String(item.wine_id || item.id)).filter(Boolean)
                        if (ids.length > 0) {
                            setWishlistIds(ids)
                            try {
                                localStorage.setItem(`vinosphere_wishlist_${uid}`, JSON.stringify(ids))
                            } catch {}
                        }
                    }
                } catch (backendErr) {
                    console.warn('Backend wishlist fetch failed:', backendErr)
                }
            }
        } catch (err) {
            console.error('Failed to load wishlist:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        const supabase = createClient()

        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUserId(session.user.id)
                fetchUserWishlist(session.user.id, session.access_token)
            } else {
                setUserId(null)
                setWishlistIds([])
                setIsLoading(false)
            }
        })

        // Listen for login / logout
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUserId(session.user.id)
                fetchUserWishlist(session.user.id, session.access_token)
            } else {
                setUserId(null)
                setWishlistIds([])
                setIsLoading(false)
            }
        })

        // Listen for live cross-component wishlist update events
        const handleCustomUpdate = (e: any) => {
            if (e.detail?.wishlistIds) {
                setWishlistIds(e.detail.wishlistIds)
            }
        }

        window.addEventListener('vinosphere_wishlist_updated', handleCustomUpdate)

        return () => {
            subscription.unsubscribe()
            window.removeEventListener('vinosphere_wishlist_updated', handleCustomUpdate)
        }
    }, [fetchUserWishlist])

    const isWishlisted = useCallback((wineId: string | number): boolean => {
        if (!wineId) return false
        return wishlistIds.some(id => isWineIdMatch(id, wineId))
    }, [wishlistIds])

    const toggleWishlist = useCallback(async (wine: Wine): Promise<{ success: boolean; requiresAuth?: boolean; newlyLiked?: boolean }> => {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
            // Guest user: requires authentication!
            return { success: false, requiresAuth: true }
        }

        const rawId = String(wine.id).trim()
        const currentlyLiked = wishlistIds.some(id => isWineIdMatch(id, wine.id))
        const newlyLiked = !currentlyLiked

        // Optimistic UI update
        const updatedIds = newlyLiked
            ? Array.from(new Set([...wishlistIds, rawId]))
            : wishlistIds.filter(id => !isWineIdMatch(id, wine.id))

        setWishlistIds(updatedIds)

        // Save to local storage and broadcast to all components
        try {
            localStorage.setItem(`vinosphere_wishlist_${session.user.id}`, JSON.stringify(updatedIds))
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('vinosphere_wishlist_updated', { 
                    detail: { wishlistIds: updatedIds, wineId: rawId, newlyLiked } 
                }))
            }
        } catch {}

        // Perform Database operations asynchronously
        try {
            if (newlyLiked) {
                // 1. Direct Supabase insert / upsert
                const { error: sbError } = await supabase
                    .from('wishlist')
                    .upsert({ user_id: session.user.id, wine_id: rawId }, { onConflict: 'user_id,wine_id' })

                if (sbError) {
                    console.warn('Supabase wishlist insert notice:', sbError.message)
                    // If upsert failed, try plain insert
                    try {
                        await supabase
                            .from('wishlist')
                            .insert({ user_id: session.user.id, wine_id: rawId })
                    } catch {}
                }

                // 2. Track interaction for ML recommender & user journey
                try {
                    await fetch(`${API_V1_URL}/wines/${encodeURIComponent(rawId)}/interactions`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({ interactionType: 'WISHLIST' })
                    })
                } catch {}

                // 3. Optional backend API sync
                try {
                    await fetch(`${API_V1_URL}/wishlist`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({ wineId: rawId })
                    })
                } catch {}
            } else {
                // 1. Direct Supabase delete
                const { error: sbDelError } = await supabase
                    .from('wishlist')
                    .delete()
                    .eq('user_id', session.user.id)
                    .eq('wine_id', rawId)

                if (sbDelError) {
                    console.warn('Supabase wishlist delete notice:', sbDelError.message)
                }

                // 2. Optional backend API sync
                try {
                    await fetch(`${API_V1_URL}/wishlist/${encodeURIComponent(rawId)}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${session.access_token}`
                        }
                    })
                } catch {}
            }

            return { success: true, newlyLiked }
        } catch (error) {
            console.warn('Non-blocking server sync note:', error)
            // Do not revert optimistic update - keep user's active state
            return { success: true, newlyLiked }
        }
    }, [wishlistIds])

    const refreshWishlist = useCallback(async () => {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
            await fetchUserWishlist(session.user.id, session.access_token)
        }
    }, [fetchUserWishlist])

    return (
        <WishlistContext.Provider
            value={{
                wishlistIds,
                wishlistCount: wishlistIds.length,
                isLoading,
                isWishlisted,
                toggleWishlist,
                refreshWishlist
            }}
        >
            {children}
        </WishlistContext.Provider>
    )
}

export const useWishlist = () => useContext(WishlistContext)
