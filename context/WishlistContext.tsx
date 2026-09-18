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
            // Check local cache first for instant UI response
            try {
                const cached = localStorage.getItem(`vinosphere_wishlist_${uid}`)
                if (cached) {
                    setWishlistIds(JSON.parse(cached))
                }
            } catch {}

            // Try backend API first
            if (token) {
                try {
                    const res = await fetch(`${API_V1_URL}/wishlist`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                        cache: 'no-store'
                    })
                    if (res.ok) {
                        const json = await res.json()
                        const ids: string[] = (json.data || []).map((item: any) => item.wine_id).filter(Boolean)
                        setWishlistIds(ids)
                        try {
                            localStorage.setItem(`vinosphere_wishlist_${uid}`, JSON.stringify(ids))
                        } catch {}
                        return
                    }
                } catch (backendErr) {
                    console.warn('Backend wishlist fetch failed, trying direct Supabase fallback:', backendErr)
                }
            }

            // Direct Supabase fallback
            const supabase = createClient()
            const { data, error } = await supabase
                .from('wishlist')
                .select('wine_id')
                .eq('user_id', uid)

            if (!error && data) {
                const ids = data.map(item => item.wine_id)
                setWishlistIds(ids)
                try {
                    localStorage.setItem(`vinosphere_wishlist_${uid}`, JSON.stringify(ids))
                } catch {}
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

        return () => {
            subscription.unsubscribe()
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

        const normalizedId = normalizeWineId(wine.id)
        const currentlyLiked = wishlistIds.some(id => isWineIdMatch(id, wine.id))
        const newlyLiked = !currentlyLiked

        // Optimistic UI update
        const updatedIds = newlyLiked
            ? [...wishlistIds, normalizedId, wine.id]
            : wishlistIds.filter(id => !isWineIdMatch(id, wine.id))

        setWishlistIds(updatedIds)
        try {
            localStorage.setItem(`vinosphere_wishlist_${session.user.id}`, JSON.stringify(updatedIds))
        } catch {}

        try {
            if (newlyLiked) {
                // Try backend API
                let apiSuccess = false
                try {
                    const res = await fetch(`${API_V1_URL}/wishlist`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({ wineId: normalizedId })
                    })
                    apiSuccess = res.ok
                } catch {}

                // If backend API wasn't successful, try direct Supabase insert
                if (!apiSuccess) {
                    await supabase
                        .from('wishlist')
                        .insert({ user_id: session.user.id, wine_id: normalizedId })
                }
            } else {
                // Remove from wishlist
                let apiSuccess = false
                try {
                    const res = await fetch(`${API_V1_URL}/wishlist/${normalizedId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${session.access_token}`
                        }
                    })
                    apiSuccess = res.ok
                } catch {}

                // If backend API wasn't successful, try direct Supabase delete
                if (!apiSuccess) {
                    await supabase
                        .from('wishlist')
                        .delete()
                        .eq('user_id', session.user.id)
                        .eq('wine_id', normalizedId)
                }
            }

            return { success: true, newlyLiked }
        } catch (error) {
            console.error('Failed to sync wishlist with server:', error)
            // Revert optimistic update
            setWishlistIds(wishlistIds)
            return { success: false, newlyLiked: currentlyLiked }
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
