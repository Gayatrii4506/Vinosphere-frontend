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
        Red: 'bg-red-100 text-red-800 border-red-200',
        White: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        Rosé: 'bg-pink-100 text-pink-700 border-pink-200',
        Sparkling: 'bg-blue-50 text-blue-700 border-blue-200',
        Dessert: 'bg-amber-50 text-amber-700 border-amber-200',
    }
    const typeClass = typeColors[wine.wine_type] ?? 'bg-stone-100 text-stone-600 border-stone-200'

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: rank * 0.07 }}
            className="group flex gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-[#A33845]/40 transition-all duration-300"
        >
            {/* Rank badge */}
            <div className="shrink-0 w-7 h-7 rounded-full bg-[#A33845] flex items-center justify-center text-white text-xs font-bold">
                {rank}
            </div>

            {/* Wine image */}
            <SafeImage
                imageUrl={wine.image_url}
                fallback={FALLBACK_WINE_IMAGE}
                alt={wine.wine_name}
                wrapperClassName="shrink-0 w-16 h-20 rounded-lg bg-stone-100 group-hover:scale-105 transition-transform duration-500"
                objectFit="contain"
                iconSize={20}
            />

            {/* Wine details */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                        <h3 className="font-semibold text-sm text-stone-900 leading-tight line-clamp-1">{wine.wine_name}</h3>
                        <p className="text-xs text-stone-500 mt-0.5">{wine.winery} · {wine.region}</p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeClass}`}>
                        {wine.wine_type}
                    </span>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-stone-600">
                    <span><span className="font-medium text-stone-700">Body:</span> {wine.body}</span>
                    <span><span className="font-medium text-stone-700">Sweetness:</span> {wine.sweetness}</span>
                    <span><span className="font-medium text-stone-700">Tannin:</span> {wine.tannin}</span>
                </div>

                {/* Match score */}
                <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-[#A33845] to-[#c9576a]"
                            style={{ width: `${Math.round(wine.score * 100)}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-semibold text-[#A33845]">
                        {Math.round(wine.score * 100)}% match
                    </span>
                </div>
            </div>
        </motion.div>
    )
}

/** Food result card — uses SafeImage with loading/error/placeholder states */
const FoodResultCard: React.FC<{ food: FoodRecommendation; rank: number }> = ({ food, rank }) => {

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: rank * 0.07 }}
            className="group flex gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-[#A33845]/40 transition-all duration-300"
        >
            <div className="shrink-0 w-7 h-7 rounded-full bg-[#A33845] flex items-center justify-center text-white text-xs font-bold">
                {rank}
            </div>

            {/* Food image */}
            <SafeImage
                imageUrl={food.image_url}
                fallback={FALLBACK_FOOD_IMAGE}
                alt={food.food_name}
                wrapperClassName="shrink-0 w-16 h-16 rounded-lg bg-stone-100 group-hover:scale-105 transition-transform duration-500"
                objectFit="cover"
                iconSize={18}
            />

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-stone-900 leading-tight">{food.food_name}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{food.cuisine} · {food.category}</p>

                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-stone-600">
                    <span><span className="font-medium text-stone-700">Protein:</span> {food.protein}</span>
                    <span><span className="font-medium text-stone-700">Spice:</span> {food.spice_level}</span>
                    <span><span className="font-medium text-stone-700">Wine:</span> {food.recommended_wine_type}</span>
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-[#A33845] to-[#c9576a]"
                            style={{ width: `${Math.round(food.score * 100)}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-semibold text-[#A33845]">
                        {Math.round(food.score * 100)}% match
                    </span>
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

    return (
        <section
            id="food-pairing"
            className="w-full bg-[#FAF9F6] py-12 sm:py-16"
            aria-labelledby="pairing-recommender-heading"
        >
            <div className="max-w-3xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="text-center mb-8">
                    <h2
                        id="pairing-recommender-heading"
                        className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-2"
                    >
                        Wine & Food Pairing Recommender
                    </h2>
                    <p className="text-stone-500 text-sm sm:text-base max-w-md mx-auto">
                        Enter a dish or wine and our sommelier pairing engine will calculate compatibility.
                    </p>
                </div>

                {/* Mode toggle */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <button
                        id="mode-food"
                        onClick={() => switchMode('food')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                            mode === 'food'
                                ? 'bg-[#A33845] text-white shadow-md'
                                : 'bg-white border border-stone-200 text-stone-600 hover:border-[#A33845]/40 hover:text-[#A33845]'
                        }`}
                    >
                        <Utensils size={14} />
                        Food → Wine
                    </button>
                    <button
                        id="mode-wine"
                        onClick={() => switchMode('wine')}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                            mode === 'wine'
                                ? 'bg-[#A33845] text-white shadow-md'
                                : 'bg-white border border-stone-200 text-stone-600 hover:border-[#A33845]/40 hover:text-[#A33845]'
                        }`}
                    >
                        <Wine size={14} />
                        Wine → Food
                    </button>
                </div>

                {/* Search form */}
                <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                    <div className="flex-1 relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
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
                                    : 'e.g. Sula Sauvignon Blanc, Shiraz, Rosé…'
                            }
                            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A33845]/30 focus:border-[#A33845]/60 transition"
                        />
                    </div>
                    <button
                        id="pairing-search-btn"
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="px-5 py-2.5 rounded-lg bg-[#A33845] hover:bg-[#8B2B37] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-sm"
                    >
                        {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                        {loading ? 'Searching…' : 'Find Match'}
                    </button>
                </form>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 mb-6 text-sm text-red-700"
                        >
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
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
                            <p className="text-xs text-stone-400 mb-4 font-medium uppercase tracking-wider">
                                {mode === 'food'
                                    ? `Top wine matches for "${query}"`
                                    : `Top food matches for "${query}"`
                                }
                            </p>
                            <div className="flex flex-col gap-3">
                                {mode === 'food'
                                    ? wineResults.map((w, i) => (
                                          <WineResultCard key={w.wine_name} wine={w} rank={i + 1} />
                                      ))
                                    : foodResults.map((f, i) => (
                                          <FoodResultCard key={f.food_name} food={f} rank={i + 1} />
                                      ))
                                }
                            </div>

                            {/* Unsplash attribution */}
                            <p className="mt-6 text-center text-[10px] text-stone-400">
                                Food &amp; wine photos from{' '}
                                <a
                                    href="https://unsplash.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-stone-600 transition-colors"
                                >
                                    Unsplash
                                </a>
                            </p>
                        </motion.div>
                    )}

                    {searched && !hasResults && !error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-10 text-stone-500 text-sm"
                        >
                            No recommendations found. Try a different dish or wine name.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    )
}
