'use client'

/**
 * components/recommend/FoodPairingRecommender.tsx
 * ---------------------------------------------------------------------------
 * Interactive food-wine pairing recommender that calls the FastAPI backend.
 *
 * Features
 * ─────────
 * - User types a food name → calls POST /recommend
 * - Displays top 5 wine recommendations with:
 *     • wine image (from image_url in API response)
 *     • wine name, winery, type, region, score
 * - Falls back to /bottle.png if image_url is missing or fails to load
 * - Also supports wine → food direction via POST /recommend-food
 * - Shows food images from image_url field in food results
 *
 * Architecture
 * ─────────────
 * Frontend → FastAPI /recommend → RecommendationEngine → CSV image_url
 *
 * Attribution
 * ───────────
 * Food/Wine images sourced via Unsplash. See footer note.
 * ---------------------------------------------------------------------------
 */

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Wine, Utensils, Star, ExternalLink, AlertCircle, Loader2, ChevronDown, ImageOff } from 'lucide-react'
import { useSafeImageUrl, FALLBACK_FOOD_IMAGE, FALLBACK_WINE_IMAGE } from '@/hooks/useImageUrl'

// ---------------------------------------------------------------------------
// API configuration
// ---------------------------------------------------------------------------
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ---------------------------------------------------------------------------
// SafeImage — universal image component with loading/error/placeholder states
// ---------------------------------------------------------------------------
interface SafeImageProps {
    imageUrl: string | null | undefined
    fallback: string
    alt: string
    className?: string
    /** Extra classes for the wrapper div */
    wrapperClassName?: string
    /** Icon size for placeholder */
    iconSize?: number
    objectFit?: 'cover' | 'contain'
}

const SafeImage: React.FC<SafeImageProps> = ({
    imageUrl,
    fallback,
    alt,
    className = '',
    wrapperClassName = '',
    iconSize = 20,
    objectFit = 'cover',
}) => {
    const { src, state, handleError, handleLoad } = useSafeImageUrl(imageUrl, fallback)

    return (
        <div className={`relative overflow-hidden ${wrapperClassName}`}>
            {/* Shimmer skeleton while loading */}
            {state === 'loading' && (
                <div className="absolute inset-0 bg-stone-100 animate-pulse" aria-hidden="true" />
            )}

            {/* Placeholder icon when image_url is null */}
            {state === 'placeholder' && (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
                    <ImageOff size={iconSize} className="text-stone-300" aria-hidden="true" />
                </div>
            )}

            {/* Actual image — hidden while loading to avoid flash */}
            {state !== 'placeholder' && (
                <img
                    src={src}
                    alt={alt}
                    onError={handleError}
                    onLoad={handleLoad}
                    className={`w-full h-full transition-opacity duration-300 ${
                        state === 'loading' ? 'opacity-0' : 'opacity-100'
                    } ${objectFit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
                />
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Types (matching FastAPI response shapes)
// ---------------------------------------------------------------------------
interface WineRecommendation {
    wine_name: string
    winery: string
    wine_type: string
    variety: string
    region: string
    body: string
    sweetness: string
    acidity: string
    tannin: string
    score: number
    image_url: string
}

interface FoodRecommendation {
    food_name: string
    cuisine: string
    category: string
    protein: string
    spice_level: string
    richness: string
    recommended_wine_type: string
    score: number
    image_url: string
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Wine result card — uses SafeImage with loading/error/placeholder states */
const WineResultCard: React.FC<{ wine: WineRecommendation; rank: number }> = ({ wine, rank }) => {
    const typeColors: Record<string, string> = {
        Red: 'bg-rose-50 text-rose-800 border-rose-200/80',
        White: 'bg-amber-50 text-amber-800 border-amber-200/80',
        Rosé: 'bg-pink-50 text-pink-800 border-pink-200/80',
        Sparkling: 'bg-sky-50 text-sky-800 border-sky-200/80',
        Dessert: 'bg-amber-100/70 text-amber-900 border-amber-300/80',
    }
    const typeClass = typeColors[wine.wine_type] ?? 'bg-stone-100 text-stone-700 border-stone-200'
    const matchPct = Math.min(100, Math.max(0, Math.round(wine.score * 100)))

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: rank * 0.05 }}
            className={`group relative flex gap-4 sm:gap-5 rounded-2xl border ${
                rank === 1 
                    ? 'border-vino-gold/60 bg-gradient-to-r from-[#FAF8F5] via-white to-white shadow-md ring-1 ring-vino-gold/20' 
                    : 'border-stone-200/90 bg-white shadow-sm hover:shadow-md hover:border-vino-accent/40'
            } p-4 sm:p-5 transition-all duration-300`}
        >
            {/* Rank badge */}
            <div className="shrink-0 flex flex-col items-center justify-start pt-0.5">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-xs ${
                    rank === 1 
                        ? 'bg-gradient-to-br from-vino-gold to-amber-600 text-white font-serif' 
                        : rank === 2 
                        ? 'bg-stone-700 text-white font-serif'
                        : 'bg-stone-200 text-stone-700 font-serif'
                }`}>
                    #{rank}
                </div>
                {rank === 1 && (
                    <span className="text-[9px] uppercase tracking-wider font-bold text-vino-gold mt-1.5 hidden sm:block">
                        Top Pick
                    </span>
                )}
            </div>

            {/* Wine bottle image */}
            <SafeImage
                imageUrl={wine.image_url}
                fallback={FALLBACK_WINE_IMAGE}
                alt={wine.wine_name}
                wrapperClassName="shrink-0 w-16 sm:w-20 h-24 sm:h-28 rounded-xl bg-[#FBF9F6] border border-stone-200/60 p-1.5 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center"
                objectFit="contain"
                iconSize={22}
            />

            {/* Wine details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                        <div>
                            <h3 className="font-serif font-bold text-base sm:text-lg text-vino-darker leading-snug line-clamp-1 group-hover:text-vino-accent transition-colors">
                                {wine.wine_name}
                            </h3>
                            <p className="text-xs text-stone-500 font-medium">
                                {wine.winery} &bull; <span className="text-stone-400">{wine.region}</span>
                            </p>
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${typeClass}`}>
                            {wine.wine_type}
                        </span>
                    </div>

                    {/* Sommelier Tasting Structural Traits */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {wine.body && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-stone-50 border border-stone-200/70 text-stone-700 font-medium">
                                <span className="text-stone-400 mr-1 font-normal">Body:</span>{wine.body}
                            </span>
                        )}
                        {wine.sweetness && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-stone-50 border border-stone-200/70 text-stone-700 font-medium">
                                <span className="text-stone-400 mr-1 font-normal">Sweetness:</span>{wine.sweetness}
                            </span>
                        )}
                        {wine.tannin && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-stone-50 border border-stone-200/70 text-stone-700 font-medium">
                                <span className="text-stone-400 mr-1 font-normal">Tannin:</span>{wine.tannin}
                            </span>
                        )}
                    </div>
                </div>

                {/* Match score bar */}
                <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-stone-100">
                    <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${
                                rank === 1 
                                    ? 'bg-gradient-to-r from-vino-gold via-vino-accent-light to-vino-accent' 
                                    : 'bg-gradient-to-r from-vino-accent/80 to-vino-accent'
                            }`}
                            style={{ width: `${matchPct}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-xs font-bold ${rank === 1 ? 'text-vino-gold' : 'text-vino-accent'}`}>
                            {matchPct}%
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                            Compatibility
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

/** Food result card — uses SafeImage with loading/error/placeholder states */
const FoodResultCard: React.FC<{ food: FoodRecommendation; rank: number }> = ({ food, rank }) => {
    const matchPct = Math.min(100, Math.max(0, Math.round(food.score * 100)))

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: rank * 0.05 }}
            className={`group relative flex gap-4 sm:gap-5 rounded-2xl border ${
                rank === 1 
                    ? 'border-vino-gold/60 bg-gradient-to-r from-[#FAF8F5] via-white to-white shadow-md ring-1 ring-vino-gold/20' 
                    : 'border-stone-200/90 bg-white shadow-sm hover:shadow-md hover:border-vino-accent/40'
            } p-4 sm:p-5 transition-all duration-300`}
        >
            <div className="shrink-0 flex flex-col items-center justify-start pt-0.5">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-xs ${
                    rank === 1 
                        ? 'bg-gradient-to-br from-vino-gold to-amber-600 text-white font-serif' 
                        : rank === 2 
                        ? 'bg-stone-700 text-white font-serif'
                        : 'bg-stone-200 text-stone-700 font-serif'
                }`}>
                    #{rank}
                </div>
                {rank === 1 && (
                    <span className="text-[9px] uppercase tracking-wider font-bold text-vino-gold mt-1.5 hidden sm:block">
                        Top Pairing
                    </span>
                )}
            </div>

            {/* Food image */}
            <SafeImage
                imageUrl={food.image_url}
                fallback={FALLBACK_FOOD_IMAGE}
                alt={food.food_name}
                wrapperClassName="shrink-0 w-16 sm:w-20 h-20 sm:h-24 rounded-xl bg-stone-100 border border-stone-200/60 group-hover:scale-105 transition-transform duration-500 overflow-hidden"
                objectFit="cover"
                iconSize={20}
            />

            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                        <div>
                            <h3 className="font-serif font-bold text-base sm:text-lg text-vino-darker leading-snug line-clamp-1 group-hover:text-vino-accent transition-colors">
                                {food.food_name}
                            </h3>
                            <p className="text-xs text-stone-500 font-medium">
                                {food.cuisine} &bull; <span className="text-stone-400">{food.category}</span>
                            </p>
                        </div>
                        {food.recommended_wine_type && (
                            <span className="shrink-0 text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border bg-vino-cream text-vino-accent border-vino-accent/30 shadow-2xs">
                                Pairs with {food.recommended_wine_type}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {food.protein && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-stone-50 border border-stone-200/70 text-stone-700 font-medium">
                                <span className="text-stone-400 mr-1 font-normal">Base:</span>{food.protein}
                            </span>
                        )}
                        {food.spice_level && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-stone-50 border border-stone-200/70 text-stone-700 font-medium">
                                <span className="text-stone-400 mr-1 font-normal">Spice:</span>{food.spice_level}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-stone-100">
                    <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${
                                rank === 1 
                                    ? 'bg-gradient-to-r from-vino-gold via-vino-accent-light to-vino-accent' 
                                    : 'bg-gradient-to-r from-vino-accent/80 to-vino-accent'
                            }`}
                            style={{ width: `${matchPct}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-xs font-bold ${rank === 1 ? 'text-vino-gold' : 'text-vino-accent'}`}>
                            {matchPct}%
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                            Harmony
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export const FoodPairingRecommender: React.FC = () => {
    const [mode, setMode] = useState<'food' | 'wine'>('food')
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [wineResults, setWineResults] = useState<WineRecommendation[]>([])
    const [foodResults, setFoodResults] = useState<FoodRecommendation[]>([])
    const [error, setError] = useState<string | null>(null)
    const [searched, setSearched] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        const q = query.trim()
        if (!q) return

        setLoading(true)
        setError(null)
        setWineResults([])
        setFoodResults([])
        setSearched(false)

        try {
            if (mode === 'food') {
                // Food → Wine
                const res = await fetch(`${API_BASE}/recommend`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ food_name: q }),
                })
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}))
                    throw new Error(err?.detail?.error ?? `API error ${res.status}`)
                }
                const data = await res.json()
                setWineResults(data.recommendations ?? [])
            } else {
                // Wine → Food
                const res = await fetch(`${API_BASE}/recommend-food`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ wine_name: q }),
                })
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}))
                    throw new Error(err?.detail?.error ?? `API error ${res.status}`)
                }
                const data = await res.json()
                setFoodResults(data.recommendations ?? [])
            }
            setSearched(true)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    const switchMode = (newMode: 'food' | 'wine') => {
        setMode(newMode)
        setQuery('')
        setWineResults([])
        setFoodResults([])
        setError(null)
        setSearched(false)
        setTimeout(() => inputRef.current?.focus(), 50)
    }

    const hasResults = mode === 'food' ? wineResults.length > 0 : foodResults.length > 0
    const foodSuggestions = ['Butter Chicken', 'Grilled Salmon', 'Rogan Josh', 'Margherita Pizza', 'Tiramisu']
    const wineSuggestions = ['Sula Cabernet Shiraz', 'York Chardonnay', 'Soma Chenin Blanc', 'Fratelli Sangiovese']

    return (
        <section
            id="food-pairing"
            className="w-full bg-[#FAF9F6] py-14 sm:py-20 border-t border-stone-200/60"
            aria-labelledby="pairing-recommender-heading"
        >
            <div className="max-w-3xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="text-center mb-8">
                    <span className="text-[11px] font-bold tracking-[0.2em] text-vino-accent uppercase mb-2 block">
                        Sommelier Pairing Intelligence
                    </span>
                    <h2
                        id="pairing-recommender-heading"
                        className="font-serif text-3xl sm:text-4xl font-bold text-vino-darker mb-3"
                    >
                        Wine & Food Pairing Recommender
                    </h2>
                    <p className="text-stone-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                        Enter a dish or wine to calculate chemical compatibility, palate balance, and harmonic Indian estate pairings.
                    </p>
                </div>

                {/* Mode toggle */}
                <div className="flex items-center justify-center gap-2.5 mb-7">
                    <button
                        id="mode-food"
                        onClick={() => switchMode('food')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent ${
                            mode === 'food'
                                ? 'bg-vino-accent text-white shadow-md'
                                : 'bg-white border border-stone-200 text-stone-600 hover:border-vino-accent/40 hover:text-vino-accent'
                        }`}
                    >
                        <Utensils size={14} />
                        Food → Wine
                    </button>
                    <button
                        id="mode-wine"
                        onClick={() => switchMode('wine')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent ${
                            mode === 'wine'
                                ? 'bg-vino-accent text-white shadow-md'
                                : 'bg-white border border-stone-200 text-stone-600 hover:border-vino-accent/40 hover:text-vino-accent'
                        }`}
                    >
                        <Wine size={14} />
                        Wine → Food
                    </button>
                </div>

                {/* Search form */}
                <form onSubmit={handleSearch} className="flex gap-2.5 mb-4">
                    <div className="flex-1 relative">
                        <Search
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                        />
                        <input
                            ref={inputRef}
                            id="pairing-search-input"
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={
                                mode === 'food'
                                    ? 'e.g. Butter Chicken, Grilled Salmon, Tiramisu…'
                                    : 'e.g. Sula Cabernet Shiraz, Chardonnay, Rosé…'
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-vino-accent/30 focus:border-vino-accent transition shadow-2xs"
                        />
                    </div>
                    <button
                        id="pairing-search-btn"
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="px-6 py-3 rounded-xl bg-vino-accent hover:bg-vino-accent-light text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        {loading ? 'Pairing…' : 'Find Match'}
                    </button>
                </form>

                {/* Quick Suggestion Pills */}
                <div className="flex items-center gap-1.5 flex-wrap mb-8">
                    <span className="text-[11px] text-stone-400 font-medium mr-1">Popular:</span>
                    {(mode === 'food' ? foodSuggestions : wineSuggestions).map((sugg) => (
                        <button
                            key={sugg}
                            type="button"
                            onClick={() => {
                                setQuery(sugg)
                                setTimeout(() => {
                                    const btn = document.getElementById('pairing-search-btn')
                                    btn?.click()
                                }, 20)
                            }}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-stone-200/80 hover:border-vino-accent/40 text-stone-600 hover:text-vino-accent transition-colors shadow-2xs"
                        >
                            {sugg}
                        </button>
                    ))}
                </div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 mb-6 text-sm text-red-700 shadow-2xs"
                        >
                            <AlertCircle size={17} className="shrink-0 mt-0.5 text-red-600" />
                            <div>
                                <p className="font-semibold text-xs">Pairing Lookup Issue</p>
                                <p className="text-xs text-red-600/90 mt-0.5">{error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results */}
                <AnimatePresence>
                    {searched && hasResults && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                                    {mode === 'food'
                                        ? `Sommelier Matches for "${query}"`
                                        : `Culinary Pairings for "${query}"`
                                    }
                                </p>
                                <span className="text-[11px] text-vino-gold font-semibold">
                                    {mode === 'food' ? wineResults.length : foodResults.length} pairings ranked
                                </span>
                            </div>

                            <div className="flex flex-col gap-3.5">
                                {mode === 'food'
                                    ? wineResults.map((w, i) => (
                                          <WineResultCard key={w.wine_name} wine={w} rank={i + 1} />
                                      ))
                                    : foodResults.map((f, i) => (
                                          <FoodResultCard key={f.food_name} food={f} rank={i + 1} />
                                      ))
                                }
                            </div>

                            {/* Attribution note */}
                            <p className="mt-6 text-center text-[10px] text-stone-400">
                                Curated Indian wine estate and culinary dataset &bull; Powered by VinoSphere Recommendation Engine
                            </p>
                        </motion.div>
                    )}

                    {searched && !hasResults && !error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 shadow-2xs max-w-md mx-auto"
                        >
                            <Wine size={28} className="text-vino-gold mx-auto mb-2 opacity-80" />
                            <h4 className="font-serif font-bold text-base text-vino-darker">No Exact Flavor Matches Found</h4>
                            <p className="text-stone-500 text-xs mt-1 max-w-xs mx-auto">
                                Try searching for another popular dish (e.g. "Butter Chicken", "Grilled Salmon") or a varietal ("Shiraz", "Sauvignon Blanc").
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    )
}
