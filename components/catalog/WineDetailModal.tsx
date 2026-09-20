'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Heart, Wine as WineIcon, Utensils, MapPin, Award, CheckCircle2, ShieldCheck, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Wine } from '@/constants/wines'
import { useWishlist } from '@/context/WishlistContext'
import { trackWineInteraction, getLocalInteractionSummary } from '@/lib/interactions/trackInteraction'

interface WineDetailModalProps {
    wine: Wine | null
    onClose: () => void
}

export const WineDetailModal: React.FC<WineDetailModalProps> = ({ wine, onClose }) => {
    const { isWishlisted, toggleWishlist } = useWishlist()
    const isLikedWishlist = wine ? isWishlisted(wine.id) : false
    const [imgError, setImgError] = useState(false)
    const [userReaction, setUserReaction] = useState<'LIKE' | 'DISLIKE' | null>(null)
    const [purchaseRequested, setPurchaseRequested] = useState(false)
    const router = useRouter()

    // Sync initial reaction from local summary
    useEffect(() => {
        if (wine) {
            const summary = getLocalInteractionSummary()
            const idStr = String(wine.id)
            if (summary.likedWineIds.includes(idStr)) {
                setUserReaction('LIKE')
            } else if (summary.dislikedWineIds.includes(idStr)) {
                setUserReaction('DISLIKE')
            } else {
                setUserReaction(null)
            }
            setPurchaseRequested(summary.purchasedWineIds.includes(idStr))

            // Record VIEW interaction
            trackWineInteraction(idStr, 'VIEW', { wineName: wine.name, wineType: wine.type })
        }
    }, [wine])

    // Lock body scroll when modal is active
    useEffect(() => {
        if (wine) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [wine])

    const handleReaction = async (type: 'LIKE' | 'DISLIKE') => {
        if (!wine) return
        if (userReaction === type) {
            setUserReaction(null)
        } else {
            setUserReaction(type)
            await trackWineInteraction(String(wine.id), type, { wineName: wine.name })
        }
    }

    const handlePurchaseIntent = async () => {
        if (!wine) return
        setPurchaseRequested(true)
        await trackWineInteraction(String(wine.id), 'PURCHASE', { wineName: wine.name, price: wine.price })
        router.push('/welcome')
    }

    if (!wine) return null

    const displayImg = imgError || !wine.imageUrl ? '/bottle.png' : wine.imageUrl

    // Sommelier description helper (uses winery description if provided)
    const getSommelierNotes = (wine: Wine) => {
        if (wine.description && wine.description.trim()) {
            return wine.description.trim()
        }
        const typeDesc: Record<string, string> = {
            Red: 'Richly structured with ripe dark plum notes, velvety tannins, and a hint of French oak spice.',
            White: 'Crisp and refreshing with vibrant citrus blossom aromas, minerality, and a smooth balanced finish.',
            Rose: 'Delicate summer berry aromas with vibrant acidity, subtle floral notes, and a clean, refreshing palate.',
            Sparkling: 'Effervescent with fine persistent bubbles, crisp green apple, brioche nuances, and a lively finish.'
        }
        return `${wine.name} is handcrafted by ${wine.manufacturer} in ${wine.origin}. ${typeDesc[wine.type] || 'A distinguished vintage representing fine Indian viticulture.'}`
    }

    // Food pairing icon mapper
    const getFoodEmoji = (food: string) => {
        const lower = food.toLowerCase()
        if (lower.includes('seafood') || lower.includes('fish') || lower.includes('prawn') || lower.includes('salmon')) return '🐟'
        if (lower.includes('poultry') || lower.includes('chicken') || lower.includes('duck')) return '🍗'
        if (lower.includes('beef') || lower.includes('meat') || lower.includes('steak')) return '🥩'
        if (lower.includes('lamb') || lower.includes('mutton') || lower.includes('bbq') || lower.includes('roast') || lower.includes('grill')) return '🍖'
        if (lower.includes('paneer') || lower.includes('cheese')) return '🧀'
        if (lower.includes('pasta') || lower.includes('pizza') || lower.includes('risotto')) return '🍝'
        if (lower.includes('curry') || lower.includes('tikka') || lower.includes('spice') || lower.includes('indian')) return '🍛'
        if (lower.includes('dessert') || lower.includes('chocolate') || lower.includes('cake')) return '🍫'
        return '🍷'
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                {/* Backdrop Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
                />

                {/* Modal Window */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-4xl bg-[#FCFAF6] rounded-3xl shadow-2xl border border-[#e2dccf] overflow-hidden z-10 my-auto"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-stone-600 hover:text-vino-darker flex items-center justify-center shadow-md transition-all duration-200"
                        title="Close"
                    >
                        <X size={20} />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-12">
                        {/* Left Column - Bottle Showcase Frame */}
                        <div className="md:col-span-5 relative bg-gradient-to-br from-[#f4efe8] via-[#e9e1d5] to-[#dfd5c5] p-8 flex flex-col items-center justify-center min-h-[320px] md:min-h-[500px]">
                            {/* Subtle Ambient Background Watermark */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#8B1E3F_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                            {/* Type Pill Badge */}
                            <div className="absolute top-5 left-5 z-10 bg-vino-darker/90 text-vino-gold text-[10px] uppercase font-bold tracking-[0.2em] px-3 py-1 rounded-full shadow-sm">
                                {wine.type} Wine
                            </div>

                            {/* Wine Bottle Image */}
                            <div className="relative w-full h-64 md:h-80 flex items-center justify-center">
                                <img
                                    src={displayImg}
                                    alt={wine.name}
                                    onError={() => setImgError(true)}
                                    className="object-contain h-full max-h-full w-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500 ease-out"
                                />
                            </div>

                            {/* Winery Info Footer Badge */}
                            <div className="mt-4 flex items-center gap-2 text-xs text-stone-700 bg-white/75 backdrop-blur-sm px-4 py-1.5 rounded-full border border-stone-300/60 shadow-sm">
                                <MapPin size={13} className="text-vino-accent" />
                                <span className="font-semibold">{wine.manufacturer}</span>
                            </div>
                        </div>

                        {/* Right Column - Wine Details & Specifications */}
                        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                            <div>
                                {/* Header Winery & Region */}
                                <div className="flex items-center gap-2 text-xs font-semibold text-vino-accent uppercase tracking-wider mb-2">
                                    <WineIcon size={14} />
                                    <span>{wine.origin} &bull; {wine.country}</span>
                                </div>

                                {/* Title */}
                                <h2 className="font-serif text-2xl sm:text-3xl text-vino-darker font-bold leading-tight mb-3">
                                    {wine.name}
                                </h2>

                                {/* Rating & Price Banner */}
                                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-4 mb-5">
                                    {/* Star Rating */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-amber-500">
                                            {Array.from({ length: 5 }).map((_, i) => {
                                                const isFilled = wine.rating >= (i + 1) * 20 - 10
                                                return (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        className={isFilled ? "fill-amber-500 text-amber-500" : "fill-stone-200 text-stone-300"}
                                                    />
                                                )
                                            })}
                                        </div>
                                        <span className="text-xs font-bold text-stone-800">
                                            {wine.rating / 10} / 10
                                        </span>
                                        <span className="text-xs text-stone-400">
                                            ({wine.reviews} verified reviews)
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="text-2xl font-serif font-bold text-vino-darker">
                                        <span className="text-sm text-stone-500 mr-1">{wine.currency}</span>
                                        {wine.price.toLocaleString()}
                                    </div>
                                </div>

                                {/* Quick Spec Grid */}
                                <div className="grid grid-cols-4 gap-2 text-center mb-4">
                                    <div className="bg-stone-100/80 p-2.5 rounded-xl border border-stone-200/60">
                                        <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-semibold mb-0.5">Vintage</span>
                                        <span className="text-xs font-bold text-vino-darker">{wine.year}</span>
                                    </div>
                                    <div className="bg-stone-100/80 p-2.5 rounded-xl border border-stone-200/60">
                                        <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-semibold mb-0.5">Volume</span>
                                        <span className="text-xs font-bold text-vino-darker">{wine.volume}</span>
                                    </div>
                                    <div className="bg-stone-100/80 p-2.5 rounded-xl border border-stone-200/60">
                                        <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-semibold mb-0.5">Taste</span>
                                        <span className="text-xs font-bold text-vino-darker">{wine.sugar}</span>
                                    </div>
                                    <div className="bg-stone-100/80 p-2.5 rounded-xl border border-stone-200/60">
                                        <span className="block text-[9px] uppercase tracking-wider text-stone-400 font-semibold mb-0.5">Category</span>
                                        <span className="text-xs font-bold text-vino-darker">{wine.type}</span>
                                    </div>
                                </div>

                                {/* Supplementary Sensory Bar */}
                                {(wine.alcoholPercentage || wine.servingTemperature || wine.body || wine.grapeVariety) && (
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-600 bg-stone-100/60 border border-stone-200/60 rounded-xl px-3.5 py-2 mb-5">
                                        {wine.alcoholPercentage && (
                                            <span className="flex items-center gap-1 font-medium">
                                                <span className="text-stone-400">ABV:</span>
                                                <span className="text-vino-darker font-semibold">{wine.alcoholPercentage}%</span>
                                            </span>
                                        )}
                                        {wine.servingTemperature && (
                                            <span className="flex items-center gap-1 font-medium">
                                                <span className="text-stone-400">Serving:</span>
                                                <span className="text-vino-darker font-semibold">{wine.servingTemperature}</span>
                                            </span>
                                        )}
                                        {wine.body && (
                                            <span className="flex items-center gap-1 font-medium">
                                                <span className="text-stone-400">Body:</span>
                                                <span className="text-vino-darker font-semibold">{wine.body}</span>
                                            </span>
                                        )}
                                        {wine.grapeVariety && (
                                            <span className="flex items-center gap-1 font-medium">
                                                <span className="text-stone-400">Grape:</span>
                                                <span className="text-vino-darker font-semibold">{wine.grapeVariety}</span>
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Why this wine? (Explainable Recommendation) */}
                                {wine.recommendationReasons && wine.recommendationReasons.length > 0 && (
                                    <div className="mb-5 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                                        <h4 className="text-xs uppercase tracking-wider font-bold text-amber-950 mb-2 flex items-center gap-1.5">
                                            <Award size={14} className="text-amber-700" />
                                            <span>Why this wine?</span>
                                        </h4>
                                        <ul className="space-y-1">
                                            {wine.recommendationReasons.map((reason, idx) => (
                                                <li key={idx} className="flex items-start gap-1.5 text-xs text-stone-700 font-medium">
                                                    <span className="text-emerald-700 font-bold shrink-0">✓</span>
                                                    <span>{reason}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Sommelier Notes / Description */}
                                <div className="mb-5">
                                    <h4 className="text-xs uppercase tracking-wider font-bold text-stone-700 mb-2 flex items-center gap-1.5">
                                        <Award size={14} className="text-vino-accent" />
                                        <span>Sommelier Notes & Profile</span>
                                    </h4>
                                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans bg-white/60 p-3.5 rounded-xl border border-stone-200/70">
                                        {getSommelierNotes(wine)}
                                    </p>
                                </div>

                                {/* Tasting Notes */}
                                {wine.tasteNotes && wine.tasteNotes.length > 0 && (
                                    <div className="mb-5">
                                        <h4 className="text-xs uppercase tracking-wider font-bold text-stone-700 mb-2 flex items-center gap-1.5">
                                            <Sparkles size={14} className="text-amber-600" />
                                            <span>Aroma & Tasting Notes</span>
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {wine.tasteNotes.map((note, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-medium"
                                                >
                                                    {note}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Food Pairing Recommendations */}
                                {wine.foodPairing && wine.foodPairing.length > 0 && (
                                    <div className="mb-5">
                                        <h4 className="text-xs uppercase tracking-wider font-bold text-stone-700 mb-2 flex items-center gap-1.5">
                                            <Utensils size={14} className="text-vino-accent" />
                                            <span>Recommended Food Pairings</span>
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {wine.foodPairing.map((food, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vino-accent/10 border border-vino-accent/20 text-vino-accent text-xs font-semibold"
                                                >
                                                    <span>{getFoodEmoji(food)}</span>
                                                    <span>{food}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Taste Reaction Feedback & Modal Action Buttons */}
                            <div className="pt-4 border-t border-stone-200/80 space-y-3">
                                <div className="flex items-center justify-between text-xs text-stone-600 bg-stone-100/60 p-2.5 rounded-xl border border-stone-200/70">
                                    <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                                        <Sparkles size={13} className="text-amber-600" />
                                        <span>Taste Feedback:</span>
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleReaction('LIKE')}
                                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                                                userReaction === 'LIKE'
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-white text-stone-700 hover:bg-emerald-50 hover:text-emerald-700 border border-stone-200'
                                            }`}
                                        >
                                            <ThumbsUp size={12} className={userReaction === 'LIKE' ? 'fill-white' : ''} />
                                            <span>Like</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleReaction('DISLIKE')}
                                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                                                userReaction === 'DISLIKE'
                                                    ? 'bg-rose-600 text-white'
                                                    : 'bg-white text-stone-700 hover:bg-rose-50 hover:text-rose-700 border border-stone-200'
                                            }`}
                                        >
                                            <ThumbsDown size={12} className={userReaction === 'DISLIKE' ? 'fill-white' : ''} />
                                            <span>Not for me</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={handlePurchaseIntent}
                                        className="flex-1 bg-vino-accent hover:bg-vino-darker text-white font-bold py-3 px-6 rounded-xl transition-colors duration-300 shadow-md flex items-center justify-center gap-2 text-sm"
                                    >
                                        <ShieldCheck size={16} />
                                        <span>{purchaseRequested ? 'Order / Reservation Initiated ✓' : 'Reserve / Request Bottle'}</span>
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!wine) return
                                            const res = await toggleWishlist(wine)
                                            if (res.newlyLiked) {
                                                await trackWineInteraction(String(wine.id), 'WISHLIST', { wineName: wine.name })
                                            }
                                            if (res.requiresAuth) {
                                                router.push('/welcome?redirect=/discover/wines')
                                            }
                                        }}
                                        className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                                            isLikedWishlist 
                                                ? 'bg-vino-accent text-white border-vino-accent' 
                                                : 'bg-white text-stone-600 border-stone-300 hover:border-vino-accent hover:text-vino-accent'
                                        }`}
                                        title={isLikedWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                    >
                                        <Heart size={18} className={isLikedWishlist ? 'fill-white' : ''} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
