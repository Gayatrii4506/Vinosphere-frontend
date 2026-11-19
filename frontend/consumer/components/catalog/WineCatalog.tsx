'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Compass, X, Info } from 'lucide-react'
import { WineFilterSidebar, FilterState } from './WineFilterSidebar'
import { WineGrid } from './WineGrid'
import { WineDetailModal } from './WineDetailModal'
import { Wine } from '@/constants/wines'
import { createClient } from '@/lib/supabase/client'
import {
    fetchUserInteractionSummary,
    getLocalInteractionSummary,
    UserInteractionSummary
} from '@/lib/interactions/trackInteraction'

interface WineCatalogProps {
    initialWines: Wine[]
    hideHeaderBanner?: boolean
}

interface UserPreferencesState {
    experience_level?: string
    taste_appealing?: string
    sweetness?: string
    body_style?: string
    acidity?: string
    tannin?: string
    region?: string
    grapes?: string[]
    flavors?: string[]
    favorite_types?: string[]
    occasion?: string
    budget?: string
    budget_min?: number | null
    budget_max?: number | null
}

export const WineCatalog: React.FC<WineCatalogProps> = ({ initialWines = [], hideHeaderBanner = false }) => {
    const searchParams = useSearchParams()
    const typeParam = searchParams ? searchParams.get('type') : null
    const modeParam = searchParams ? searchParams.get('mode') : null

    const [selectedWine, setSelectedWine] = useState<Wine | null>(null)
    const [isMounted, setIsMounted] = useState(false)
    const [userPreferences, setUserPreferences] = useState<UserPreferencesState | null>(null)
    const [hasPreferences, setHasPreferences] = useState(false)
    const [dismissedColdStartPrompt, setDismissedColdStartPrompt] = useState(false)
    const [dismissedInsufficientNotice, setDismissedInsufficientNotice] = useState(false)
    const [interactionSummary, setInteractionSummary] = useState<UserInteractionSummary>(getLocalInteractionSummary())

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Initial Sort: 'Recommended' by default, or mapped from mode query param
    const [sortBy, setSortBy] = useState<string>(
        modeParam === 'popular'
            ? 'Popular'
            : modeParam === 'all'
            ? 'BrowseAll'
            : 'Recommended'
    )

    const [filters, setFilters] = useState<FilterState>({
        priceRange: null,
        selectedType: typeParam || null,
        selectedRating: null,
        selectedFoodPairing: null,
        selectedVintage: null,
    })

    const hasActiveFilters = Boolean(
        filters.priceRange ||
        filters.selectedType ||
        filters.selectedRating ||
        filters.selectedFoodPairing ||
        filters.selectedVintage
    )

    const handleResetFilters = () => {
        setFilters({
            priceRange: null,
            selectedType: null,
            selectedRating: null,
            selectedFoodPairing: null,
            selectedVintage: null,
        })
    }

    useEffect(() => {
        if (typeParam) {
            setFilters(prev => ({ ...prev, selectedType: typeParam }))
        }
    }, [typeParam])

    // Load active user preferences & interaction history with edge case fallback
    useEffect(() => {
        async function loadUserPrefs() {
            try {
                const supabase = createClient()
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user?.user_metadata?.preferences) {
                    const prefs = session.user.user_metadata.preferences
                    setUserPreferences(prefs)
                    
                    // Edge Case 3 & 4: Check if preferences contain actual discriminative taste choices
                    // or if user chose "Not sure" / "Anything" for everything
                    const isAllNotSureOrAnything = (
                        (!prefs.favorite_types || prefs.favorite_types.length === 0 || prefs.favorite_types.every((t: string) => t.toUpperCase() === 'ANYTHING' || t.toUpperCase() === 'NO_PREFERENCE')) &&
                        (!prefs.sweetness || prefs.sweetness === 'no_preference' || prefs.sweetness === 'all' || prefs.sweetness === 'not_sure') &&
                        (!prefs.body_style || prefs.body_style === 'no_preference' || prefs.body_style === 'all' || prefs.body_style === 'not_sure') &&
                        (!prefs.grapes || prefs.grapes.length === 0 || prefs.grapes.every((g: string) => g === 'no_preference' || g === 'not_sure')) &&
                        (!prefs.flavors || prefs.flavors.length === 0)
                    )

                    const hasValidPrefs = Boolean(
                        prefs.experience_level ||
                        prefs.taste_appealing ||
                        (!isAllNotSureOrAnything) ||
                        prefs.budget
                    )
                    setHasPreferences(hasValidPrefs)
                } else if (typeof window !== 'undefined') {
                    // Check local storage fallback for guest preferences
                    const storedExp = localStorage.getItem('vinosphere_experience_level')
                    if (storedExp) {
                        setUserPreferences({ experience_level: storedExp })
                        setHasPreferences(true)
                    }
                }
            } catch (err) {
                console.warn('Could not load user preferences for catalogue (graceful fallback):', err)
            }
        }
        loadUserPrefs()

        // Fetch user interactions and listen for live updates
        fetchUserInteractionSummary()
            .then(setInteractionSummary)
            .catch(() => setInteractionSummary(getLocalInteractionSummary()))

        const handleInteractionUpdated = (e: Event) => {
            const customEvent = e as CustomEvent<UserInteractionSummary>
            if (customEvent.detail) {
                setInteractionSummary(customEvent.detail)
            }
        }

        const handlePreferencesUpdated = (e: Event) => {
            const customEvent = e as CustomEvent<any>
            if (customEvent.detail) {
                setUserPreferences(customEvent.detail)
                setHasPreferences(true)
            }
        }

        window.addEventListener('vinosphere_interaction_updated', handleInteractionUpdated)
        window.addEventListener('vinosphere_preferences_updated', handlePreferencesUpdated)
        return () => {
            window.removeEventListener('vinosphere_interaction_updated', handleInteractionUpdated)
            window.removeEventListener('vinosphere_preferences_updated', handlePreferencesUpdated)
        }
    }, [])

    // Behavioral signal weight calculation
    const behavioralWeights = useMemo(() => {
        const likedSet = new Set((interactionSummary.likedWineIds || []).map(String))
        const dislikedSet = new Set((interactionSummary.dislikedWineIds || []).map(String))
        const wishlistedSet = new Set((interactionSummary.wishlistedWineIds || []).map(String))
        const purchasedSet = new Set((interactionSummary.purchasedWineIds || []).map(String))
        const viewedSet = new Set((interactionSummary.viewedWineIds || []).map(String))

        const grapeWeights: Record<string, number> = {}
        const flavorWeights: Record<string, number> = {}
        const typeWeights: Record<string, number> = {}
        let totalPositiveWeight = 0

        initialWines.forEach(w => {
            if (!w) return
            const idStr = String(w.id)
            let wWeight = 0
            if (purchasedSet.has(idStr)) wWeight += 3.0
            if (wishlistedSet.has(idStr)) wWeight += 2.0
            if (likedSet.has(idStr)) wWeight += 2.0
            if (viewedSet.has(idStr) && viewedSet.size >= 3) wWeight += 0.3

            if (wWeight > 0) {
                totalPositiveWeight += wWeight
                if (w.grapeVariety) {
                    const g = w.grapeVariety.toLowerCase()
                    grapeWeights[g] = (grapeWeights[g] || 0) + wWeight
                }
                if (w.type) {
                    const t = w.type.toUpperCase()
                    typeWeights[t] = (typeWeights[t] || 0) + wWeight
                }
                w.tasteNotes?.forEach(f => {
                    const fl = f.toLowerCase()
                    flavorWeights[fl] = (flavorWeights[fl] || 0) + wWeight
                })
            }

            if (dislikedSet.has(idStr) && w.type) {
                const t = w.type.toUpperCase()
                typeWeights[t] = (typeWeights[t] || 0) - 2.0
            }
        })

        return {
            likedSet,
            dislikedSet,
            wishlistedSet,
            purchasedSet,
            viewedSet,
            grapeWeights,
            flavorWeights,
            typeWeights,
            totalPositiveWeight,
            hasSufficientInteractions: totalPositiveWeight >= 2.0
        }
    }, [initialWines, interactionSummary])

    // Edge Cases 1, 2, 3, 4, 11: Detect if personalization has insufficient data
    const isPersonalizationInsufficient = useMemo(() => {
        if (!hasPreferences || !userPreferences) {
            return behavioralWeights.totalPositiveWeight < 2.0
        }
        const hasExplicitData = Boolean(
            (userPreferences.favorite_types && userPreferences.favorite_types.length > 0 && !userPreferences.favorite_types.every(t => t.toUpperCase() === 'ANYTHING' || t.toUpperCase() === 'NO_PREFERENCE')) ||
            (userPreferences.grapes && userPreferences.grapes.length > 0 && !userPreferences.grapes.every(g => g === 'no_preference' || g === 'not_sure')) ||
            (userPreferences.flavors && userPreferences.flavors.length > 0) ||
            (userPreferences.sweetness && userPreferences.sweetness !== 'no_preference' && userPreferences.sweetness !== 'all' && userPreferences.sweetness !== 'not_sure') ||
            (userPreferences.body_style && userPreferences.body_style !== 'no_preference' && userPreferences.body_style !== 'all' && userPreferences.body_style !== 'not_sure')
        )
        return !hasExplicitData && behavioralWeights.totalPositiveWeight < 2.0
    }, [hasPreferences, userPreferences, behavioralWeights])

    const filteredAndSortedWines = useMemo(() => {
        try {
            // 1. MANDATORY CATALOGUE FILTERS
            const candidates = initialWines.filter(wine => {
                if (!wine) return false

                // Price check
                if (filters.priceRange) {
                    const [min, max] = filters.priceRange.split('-').map(Number)
                    const winePrice = wine.price ?? 0
                    if (winePrice < min || winePrice > max) return false
                }
                
                // Type check
                if (filters.selectedType && (wine.type || '').toLowerCase() !== filters.selectedType.toLowerCase()) {
                    return false
                }
                
                // Rating check (Edge Case 8: Safe null rating fallback)
                if (filters.selectedRating) {
                    const minRating = Number(filters.selectedRating)
                    const wineRating = wine.rating || 85
                    if (wineRating < minRating) return false
                }

                // Vintage check
                if (filters.selectedVintage) {
                    const wineYear = wine.year || 2023
                    if (filters.selectedVintage === '2021-older') {
                        if (wineYear > 2021) return false
                    } else {
                        if (wineYear !== Number(filters.selectedVintage)) return false
                    }
                }
                
                // Food Pairing check (Edge Case 16: Safe null array)
                if (filters.selectedFoodPairing) {
                    const pairings = wine.foodPairing || []
                    if (!pairings.some(fp => fp.toLowerCase().includes(filters.selectedFoodPairing!.toLowerCase()))) {
                        return false
                    }
                }
                
                return true
            })

            // 2. Sorting & Personalization (Edge Cases 1-18)
            if (sortBy === 'PriceAsc') {
                return [...candidates].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
            }
            if (sortBy === 'PriceDesc') {
                return [...candidates].sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
            }
            if (sortBy === 'Year') {
                return [...candidates].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
            }
            if (sortBy === 'Popular') {
                return [...candidates].sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0))
            }
            if (sortBy === 'Rating') {
                return [...candidates].sort((a, b) => (b.rating ?? 85) - (a.rating ?? 85))
            }
            if (sortBy === 'BrowseAll') {
                // Edge Case 14: User disables personalization / Browses All
                return [...candidates].map(w => ({
                    ...w,
                    recommendationBadge: undefined,
                    recommendationReasons: undefined
                })).sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0))
            }

            // =========================================================================
            // RECOMMENDED FOR YOU (PERSONALIZED RANKING & TIERED FALLBACK STRATEGY)
            // =========================================================================
            if (sortBy === 'Recommended') {
                const {
                    likedSet,
                    dislikedSet,
                    wishlistedSet,
                    purchasedSet,
                    viewedSet,
                    grapeWeights,
                    flavorWeights,
                    typeWeights,
                    totalPositiveWeight,
                    hasSufficientInteractions
                } = behavioralWeights

                if (hasPreferences && userPreferences && !isPersonalizationInsufficient) {
                    const preferredTypes = (userPreferences.favorite_types || []).map((t: string) => t.toUpperCase())
                    const preferredTaste = (userPreferences.taste_appealing || '').toLowerCase()
                    const preferredSweetness = (userPreferences.sweetness || '').toLowerCase()
                    const preferredBody = (userPreferences.body_style || '').toLowerCase()
                    const preferredFlavors = (userPreferences.flavors || []).map((f: string) => f.toLowerCase())
                    const budgetMin = userPreferences.budget_min ?? 0
                    const budgetMax = userPreferences.budget_max ?? Infinity
                    const preferredGrapes = (userPreferences.grapes || []).map((g: string) => g.toLowerCase())
                    const isBeginner = (userPreferences.experience_level || '').toUpperCase() === 'BEGINNER'
                    const hasExplicitPreferences = preferredTypes.length > 0 || !!preferredTaste || !!preferredSweetness || !!preferredBody || preferredGrapes.length > 0 || preferredFlavors.length > 0

                    // Edge Case 6: Check if budget has matching wines
                    const budgetMatchesExist = candidates.some(w => (w.price ?? 0) >= budgetMin && (w.price ?? 0) <= budgetMax)

                    // Score candidate wines
                    const scored = candidates.map(wine => {
                        const wineIdStr = String(wine.id)
                        const reasons: string[] = []
                        const reviews = wine.reviews ?? 0
                        const rating = wine.rating || 85
                        let explicitMatchesCount = 0

                        // Bayesian popularity baseline
                        const popScore = (reviews * rating + 15 * 88) / (reviews + 15)
                        let score = popScore

                        // Edge Case 4: Balanced multi-type handling
                        const wineTypeStr = (wine.type || '').toUpperCase()
                        const matchesPreferredType = preferredTypes.length === 0 || 
                            preferredTypes.includes('ALL') || 
                            preferredTypes.includes('ANYTHING') ||
                            preferredTypes.some((t: string) => wineTypeStr.includes(t) || t.includes(wineTypeStr))

                        const isTrySomethingNew = !matchesPreferredType && preferredTypes.length > 0 && !preferredTypes.includes('ANYTHING')
                        const isPartialMatch = !matchesPreferredType && (rating >= 88 || preferredFlavors.length > 0)

                        if (matchesPreferredType) {
                            if (preferredTypes.length > 0 && !preferredTypes.includes('ANYTHING') && !preferredTypes.includes('ALL')) {
                                score += 25
                                explicitMatchesCount++
                                reasons.push(`Features your preferred ${wine.type} style`)
                            }
                        } else if (isTrySomethingNew) {
                            score += 10
                        }

                        // Palate / Taste Preference Matching
                        if (preferredTaste && preferredTaste !== 'not_sure') {
                            if (preferredTaste.includes('fruit') && (wine.tasteNotes?.some(n => n.toLowerCase().includes('fruit') || n.toLowerCase().includes('berry')) || wine.isBeginnerFriendly)) {
                                score += 18
                                explicitMatchesCount++
                                reasons.push('Fruity and vibrant flavor profile')
                            } else if (preferredTaste.includes('rich') && (wine.body?.toLowerCase().includes('full') || wine.tasteNotes?.some(n => n.toLowerCase().includes('oak') || n.toLowerCase().includes('vanilla')))) {
                                score += 18
                                explicitMatchesCount++
                                reasons.push('Rich, full-bodied with smooth depth')
                            } else if (preferredTaste.includes('light') && (wine.body?.toLowerCase().includes('light') || wine.type === 'White' || wine.type === 'Sparkling')) {
                                score += 18
                                explicitMatchesCount++
                                reasons.push('Crisp, light, and refreshing finish')
                            } else if (preferredTaste.includes('sweet') && (wine.sugar?.toLowerCase().includes('sweet') || wine.sugar?.toLowerCase().includes('semi'))) {
                                score += 18
                                explicitMatchesCount++
                                reasons.push('Luscious and accessible sweetness')
                            }
                        }

                        // Sweetness Matching
                        if (preferredSweetness && preferredSweetness !== 'no_preference' && preferredSweetness !== 'all' && preferredSweetness !== 'not_sure') {
                            const wineSugar = (wine.sugar || '').toLowerCase()
                            if (preferredSweetness.includes('dry') && !preferredSweetness.includes('semi') && wineSugar.includes('dry') && !wineSugar.includes('semi')) {
                                score += 16
                                explicitMatchesCount++
                                reasons.push('Crisp dry finish')
                            } else if (preferredSweetness.includes('semi') && wineSugar.includes('semi')) {
                                score += 16
                                explicitMatchesCount++
                                reasons.push('Balanced off-dry sweetness')
                            } else if (preferredSweetness.includes('sweet') && wineSugar.includes('sweet')) {
                                score += 16
                                explicitMatchesCount++
                                reasons.push('Luscious dessert sweetness')
                            }
                        }

                        // Body Matching
                        if (preferredBody && preferredBody !== 'no_preference' && preferredBody !== 'all' && preferredBody !== 'not_sure') {
                            const wineBody = (wine.body || '').toLowerCase()
                            if (preferredBody.includes('light') && wineBody.includes('light')) {
                                score += 16
                                explicitMatchesCount++
                                reasons.push('Light & refreshing palate')
                            } else if (preferredBody.includes('medium') && (wineBody.includes('medium') || !wineBody)) {
                                score += 16
                                explicitMatchesCount++
                                reasons.push('Smooth & balanced texture')
                            } else if ((preferredBody.includes('bold') || preferredBody.includes('rich') || preferredBody.includes('full')) && (wineBody.includes('full') || wine.type === 'Red')) {
                                score += 16
                                explicitMatchesCount++
                                reasons.push('Rich & bold full-bodied depth')
                            }
                        }

                        // Flavor Matching (Edge Case 16: Safe null tasteNotes)
                        if (preferredFlavors.length > 0 && wine.tasteNotes && wine.tasteNotes.length > 0) {
                            const matchedNotes: string[] = []
                            preferredFlavors.forEach(f => {
                                wine.tasteNotes?.forEach(note => {
                                    if (note && (note.toLowerCase().includes(f) || f.includes(note.toLowerCase()))) {
                                        matchedNotes.push(note)
                                    }
                                })
                            })
                            if (matchedNotes.length > 0) {
                                score += Math.min(24, matchedNotes.length * 8)
                                explicitMatchesCount++
                                reasons.push(`Notes of ${Array.from(new Set(matchedNotes)).slice(0, 2).join(', ')}`)
                            }
                        }

                        // Grape / Varietal Matching
                        if (preferredGrapes.length > 0 && wine.grapeVariety) {
                            const wineGrape = wine.grapeVariety.toLowerCase()
                            const matched = preferredGrapes.some(g => wineGrape.includes(g) || g.includes(wineGrape))
                            if (matched) {
                                score += 20
                                explicitMatchesCount++
                                reasons.push(`Showcases authentic ${wine.grapeVariety}`)
                            }
                        }

                        // Edge Case 6: Budget Matching & Closest Budget Fallback
                        const winePrice = wine.price ?? 0
                        if (budgetMax !== Infinity && budgetMax > 0) {
                            if (winePrice >= budgetMin && winePrice <= budgetMax) {
                                score += 15
                                explicitMatchesCount++
                                reasons.push(`Within preferred budget (₹${winePrice.toLocaleString()})`)
                            } else if (!budgetMatchesExist) {
                                score += 8
                                reasons.push(`Closest value match (₹${winePrice.toLocaleString()})`)
                            }
                        } else if (winePrice <= 1500 && isBeginner) {
                            score += 8
                            reasons.push(`Accessible value: ₹${winePrice.toLocaleString()}`)
                        }

                        // Beginner Friendliness
                        if (isBeginner && wine.isBeginnerFriendly) {
                            score += 18
                            reasons.push('Approachable crowd-pleaser for newcomers')
                        }

                        // Edge Cases 11 & 12: Direct Behavioral Interaction Signals (Safe thresholds)
                        const hasInteractionMatch = purchasedSet.has(wineIdStr) || wishlistedSet.has(wineIdStr) || likedSet.has(wineIdStr)
                        if (purchasedSet.has(wineIdStr)) {
                            score += 30
                            reasons.unshift('Previously ordered & enjoyed by you')
                        } else if (wishlistedSet.has(wineIdStr)) {
                            score += 22
                            reasons.unshift('Saved in your wishlist favorites')
                        } else if (likedSet.has(wineIdStr)) {
                            score += 18
                            reasons.unshift('Liked in your tasting profile')
                        } else if (viewedSet.has(wineIdStr)) {
                            score += 4
                        }

                        if (dislikedSet.has(wineIdStr)) {
                            score -= 40
                        }

                        // Edge Case 12: Aggregated Implicit Preferences (Requires totalPositiveWeight >= 2.0)
                        if (hasSufficientInteractions && !dislikedSet.has(wineIdStr)) {
                            if (wine.grapeVariety) {
                                const g = wine.grapeVariety.toLowerCase()
                                if ((grapeWeights[g] || 0) >= 2.0 && preferredGrapes.length === 0) {
                                    score += 12
                                    reasons.push(`Showcases ${wine.grapeVariety}, matching styles you've enjoyed`)
                                }
                            }

                            let implicitFlavorMatches = 0
                            wine.tasteNotes?.forEach(note => {
                                if (note && (flavorWeights[note.toLowerCase()] || 0) >= 2.0) {
                                    implicitFlavorMatches++
                                }
                            })
                            if (implicitFlavorMatches > 0 && preferredFlavors.length === 0) {
                                score += Math.min(12, implicitFlavorMatches * 6)
                                reasons.push('Features flavor profile aligned with your recent favorites')
                            }

                            if (wine.type && (typeWeights[wine.type.toUpperCase()] || 0) <= -4.0) {
                                score -= 18
                            }
                        }

                        // Edge Cases 8 & 9: Fallback reasons for unrated or low-review bottles
                        if (reasons.length === 0) {
                            if (reviews >= 20) reasons.push(`Popular community choice (${reviews} reviews)`)
                            else if (wine.isBeginnerFriendly) reasons.push('Smooth and approachable palate')
                            else reasons.push('Curated estate bottle matching your exploration vibe')
                        }

                        // Accurate, selective recommendation badges
                        let badge: string | undefined = undefined
                        if (dislikedSet.has(wineIdStr)) {
                            badge = '👎 Marked Not for You'
                        } else if ((explicitMatchesCount >= 2 && score >= 75) || (hasInteractionMatch && score >= 70)) {
                            badge = '✨ Matches Your Taste'
                        } else if (isTrySomethingNew) {
                            badge = '🌱 Try Something New'
                            reasons.unshift('Explore outside your usual style with matching flavor notes')
                        } else if (isPartialMatch || (hasExplicitPreferences && explicitMatchesCount >= 1 && score >= 55)) {
                            badge = '✨ Partial Taste Match'
                        } else if (reviews >= 25 || rating >= 92) {
                            badge = '⭐ Popular Choice'
                        } else if (wine.isBeginnerFriendly && isBeginner) {
                            badge = '🌱 Beginner Friendly'
                        } else {
                            badge = undefined // Clean standard inventory
                        }

                        return {
                            ...wine,
                            relevanceScore: score,
                            recommendationBadge: badge,
                            recommendationReasons: Array.from(new Set(reasons)),
                            isTrySomethingNew
                        }
                    })

                    // Sort by relevance score descending
                    scored.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))

                    // Fallback Tiering & Serendipity
                    const coreMatches = scored.filter(w => !w.isTrySomethingNew)
                    const trySomethingNew = scored.filter(w => w.isTrySomethingNew)

                    const finalResult: Wine[] = []
                    let coreIdx = 0
                    let newIdx = 0

                    while (coreIdx < coreMatches.length || newIdx < trySomethingNew.length) {
                        if (finalResult.length === 3 && newIdx < trySomethingNew.length && newIdx < 2) {
                            finalResult.push(trySomethingNew[newIdx++])
                        } else if (coreIdx < coreMatches.length) {
                            finalResult.push(coreMatches[coreIdx++])
                        } else if (newIdx < trySomethingNew.length) {
                            finalResult.push(trySomethingNew[newIdx++])
                        }
                    }

                    // FALLBACK STRATEGY (Never show empty catalogue if eligible wines exist)
                    if (finalResult.length > 0) {
                        return finalResult
                    }
                }

                // =========================================================================
                // COLD-START / INSUFFICIENT DATA FALLBACK (Edge Cases 1, 2, 3, 4, 11, 18)
                // =========================================================================
                return [...candidates].map(wine => {
                    const reviews = wine.reviews ?? 0
                    const rating = wine.rating || 85
                    const popScore = (reviews * rating + 15 * 88) / (reviews + 15)
                    const beginnerBonus = wine.isBeginnerFriendly ? 5 : 0
                    let totalScore = popScore + beginnerBonus
                    const wineIdStr = String(wine.id)

                    const reasons: string[] = []

                    // Include behavioral signals if guest/user interacted with wines
                    if (purchasedSet.has(wineIdStr)) {
                        totalScore += 25
                        reasons.unshift('Previously ordered & enjoyed by you')
                    } else if (wishlistedSet.has(wineIdStr)) {
                        totalScore += 20
                        reasons.unshift('Saved in your wishlist')
                    } else if (likedSet.has(wineIdStr)) {
                        totalScore += 16
                        reasons.unshift('Liked in your tasting profile')
                    } else if (viewedSet.has(wineIdStr)) {
                        totalScore += 3
                    }

                    if (dislikedSet.has(wineIdStr)) {
                        totalScore -= 40
                    }

                    if (reasons.length === 0) {
                        if (reviews >= 20) {
                            reasons.push(`Crowd favorite with ${reviews} verified reviews`)
                        } else if (wine.isBeginnerFriendly) {
                            reasons.push('Highly approachable, smooth fruit profile')
                        } else {
                            reasons.push(`Rated ${(rating / 10).toFixed(1)}/10 by sommeliers`)
                        }
                    }

                    let badge: string | undefined = undefined
                    if (likedSet.has(wineIdStr) || wishlistedSet.has(wineIdStr) || purchasedSet.has(wineIdStr)) {
                        badge = '✨ Matches Your Taste'
                    } else if (dislikedSet.has(wineIdStr)) {
                        badge = '👎 Marked Not for You'
                    } else if (wine.isBeginnerFriendly) {
                        badge = '🌱 Beginner Friendly'
                    } else if (reviews >= 25 || rating >= 92) {
                        badge = '⭐ Popular Choice'
                    } else {
                        badge = undefined
                    }

                    return {
                        ...wine,
                        relevanceScore: totalScore,
                        recommendationBadge: badge,
                        recommendationReasons: reasons
                    }
                }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
            }

            return candidates
        } catch (err) {
            // Edge Case 15: Recommendation service / ranking fails silently without exposing technical errors
            console.warn('Catalogue ranking fallback engaged:', err)
            return [...initialWines].sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0))
        }
    }, [initialWines, filters, sortBy, hasPreferences, userPreferences, behavioralWeights, isPersonalizationInsufficient])

    return (
        <section className={`bg-[#F8F5EF] min-h-screen ${hideHeaderBanner ? 'pt-6 pb-16' : 'pt-20 sm:pt-24 pb-16'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Wine Catalog Header Banner Box */}
                {!hideHeaderBanner && (
                    <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[#3d0b1d] via-[#63142e] to-[#290613] py-4 px-6 sm:px-8 mb-6 shadow-md border border-[#8B1E3F]/40 flex items-center justify-between gap-4">
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 opacity-[0.45] bg-cover bg-center pointer-events-none mix-blend-overlay"
                            style={{
                                backgroundImage: 'url(/images/catalog_wine_bg.png)',
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />

                        <div className="relative z-10 flex items-center gap-4 sm:gap-6">
                            <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl text-white font-bold tracking-tight">
                                Wine Catalog
                            </h1>
                            <div className="hidden sm:block w-px h-5 bg-white/25" />
                            <p className="hidden md:block text-amber-100/80 text-xs font-light">
                                Explore rare vintages, artisanal cellars, and recommendation-curated estate reserves.
                            </p>
                        </div>

                        <div className="relative z-10 flex items-center gap-3 text-xs text-white/80 shrink-0">
                            {isMounted && (
                                hasPreferences && !isPersonalizationInsufficient ? (
                                    <Link href="/profile" className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full hover:bg-amber-500/30 transition-all font-semibold">
                                        <Sparkles size={12} />
                                        Taste Profile Active
                                    </Link>
                                ) : (
                                    <Link href="/onboarding?mode=edit" className="flex items-center gap-1.5 px-3 py-1 bg-vino-accent text-white rounded-full hover:bg-vino-accent-light transition-all font-semibold shadow-sm">
                                        <Sparkles size={12} className="text-amber-300" />
                                        Take Taste Quiz
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* Edge Case 1 & 3 & 4 Notice: Insufficient Data Alert Banner */}
                {isMounted && isPersonalizationInsufficient && sortBy === 'Recommended' && !dismissedInsufficientNotice && (
                    <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-400/30 text-stone-800 flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                                <Info size={18} />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-stone-800">
                                    Not enough information to personalize your wines yet. Here are some popular choices to get you started.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Link
                                href="/onboarding?mode=edit"
                                className="px-3 py-1.5 bg-vino-accent hover:bg-vino-accent-light text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1"
                            >
                                <Sparkles size={12} className="text-amber-300" />
                                Set Preferences
                            </Link>
                            <button
                                type="button"
                                onClick={() => setDismissedInsufficientNotice(true)}
                                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                                aria-label="Dismiss notice"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Cold Start Discovery Prompt (Requirement 2 & Edge Case 18) */}
                {isMounted && !hasPreferences && !dismissedColdStartPrompt && (
                    <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 text-white border border-stone-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-400/40 text-amber-300 uppercase tracking-wider">
                                    New to Wine?
                                </span>
                            </div>
                            <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                                Take a 1-minute quiz to discover wines suited to your taste.
                            </h3>
                            <p className="text-xs text-stone-300">
                                We will customize this catalogue to your flavor notes, sweetness preferences, and budget.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                            <Link
                                href="/onboarding?mode=edit"
                                className="px-4 py-2 bg-vino-accent hover:bg-vino-accent-light text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                            >
                                <Sparkles size={14} className="text-amber-300" />
                                Discover My Taste
                            </Link>
                            <button
                                type="button"
                                onClick={() => {
                                    setSortBy('BrowseAll')
                                    setDismissedColdStartPrompt(true)
                                }}
                                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-300 text-xs font-semibold rounded-xl transition-all"
                            >
                                Browse All Wines
                            </button>
                            <button
                                type="button"
                                onClick={() => setDismissedColdStartPrompt(true)}
                                className="p-1.5 text-stone-400 hover:text-white rounded-lg"
                                aria-label="Dismiss banner"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    <WineFilterSidebar filters={filters} setFilters={setFilters} />
                    <WineGrid 
                        wines={filteredAndSortedWines} 
                        sortBy={sortBy} 
                        setSortBy={setSortBy} 
                        onSelectWine={setSelectedWine}
                        hasActiveFilters={hasActiveFilters}
                        onResetFilters={handleResetFilters}
                        fallbackWines={initialWines.slice(0, 4)}
                    />
                </div>
            </div>

            {/* Interactive Wine Detail Modal */}
            <WineDetailModal wine={selectedWine} onClose={() => setSelectedWine(null)} />
        </section>
    )
}


