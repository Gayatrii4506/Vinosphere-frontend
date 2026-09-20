'use client'

import React, { useState } from 'react'
import { Heart, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Wine } from '@/constants/wines'
import { useWishlist } from '@/context/WishlistContext'
import { useAnalytics } from '@/hooks/useAnalytics'

interface WineCardProps {
    wine: Wine
    onSelect?: (wine: Wine) => void
}

export const WineCard: React.FC<WineCardProps> = ({ wine, onSelect }) => {
    const router = useRouter()
    const { isWishlisted, toggleWishlist } = useWishlist()
    const isLiked = isWishlisted(wine.id)
    const [imgError, setImgError] = useState(false)
    const { trackEvent } = useAnalytics()

    // Fallback image if custom URL fails to load
    const displayImg = imgError || !wine.imageUrl ? '/bottle.png' : wine.imageUrl

    const rating = wine.rating || 85
    const reviews = wine.reviews ?? 0
    const price = wine.price ?? 0
    const currency = wine.currency || '₹'
    const name = wine.name || 'Artisanal Estate Selection'
    const origin = wine.origin || 'Nashik Valley'
    const volume = wine.volume || '750ml'
    const year = wine.year || 'NV'

    return (
        <div 
            onClick={() => {
                trackEvent?.('wine_view', { wine_id: wine.id, winery_id: (wine as any).wineryId })
                onSelect?.(wine)
            }}
            className="group relative flex flex-col justify-between rounded-xl bg-white border border-stone-200/90 p-3.5 shadow-sm hover:shadow-lg hover:border-vino-accent/40 cursor-pointer transition-all duration-300"
        >
            {/* Wine Bottle Image */}
            <div className="relative w-full h-44 sm:h-48 mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-[#FAF8F5]">
                <img
                    src={displayImg}
                    alt={name}
                    onError={() => setImgError(true)}
                    className="object-contain h-full max-h-full w-auto group-hover:scale-105 transition-transform duration-500 ease-out"
                />
            </div>

            {/* Wine Metadata */}
            <div className="flex flex-col justify-between flex-1">
                <div>
                    <h3 className="font-serif text-sm font-bold text-vino-darker mb-1 line-clamp-1 group-hover:text-vino-accent transition-colors" title={name}>
                        {name}
                    </h3>
                    <p className="text-[10px] text-stone-500 tracking-wider uppercase font-medium mb-2">
                        {origin} &bull; {volume} &bull; {year}
                    </p>
                </div>

                {/* Rating & Reviews */}
                <div className="flex justify-between items-center mb-2.5 text-xs border-t border-b border-stone-100 py-1.5">
                    <div className="flex items-center gap-0.5 text-vino-accent">
                        {Array.from({ length: 5 }).map((_, i) => {
                            const isFilled = rating >= (i + 1) * 20 - 10
                            return (
                                <Star 
                                    key={i} 
                                    size={10} 
                                    className={isFilled ? "fill-vino-accent" : "fill-transparent opacity-25"} 
                                />
                            )
                        })}
                    </div>
                    <span className="text-[10px] text-stone-500 font-medium">
                        {reviews} {reviews === 1 ? 'review' : 'reviews'}
                    </span>
                </div>

                {/* Price & Wishlist */}
                <div className="flex items-center justify-between pt-0.5">
                    <div className="text-base font-bold text-vino-darker">
                        <span className="text-vino-dark/50 text-xs mr-0.5">{currency}</span>
                        {price.toLocaleString()}
                    </div>
                    <button 
                        type="button"
                        onClick={async (e) => {
                            e.stopPropagation()
                            const res = await toggleWishlist(wine)
                            if (res?.requiresAuth) {
                                router.push('/welcome?redirect=/discover/wines')
                            }
                        }}
                        aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                        className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-400 hover:text-vino-accent hover:border-vino-accent/30 hover:bg-vino-accent/5 transition-all group/btn"
                    >
                        <Heart 
                            size={14} 
                            className={`group-hover/btn:scale-110 transition-transform ${isLiked ? 'fill-vino-accent text-vino-accent' : ''}`} 
                        />
                    </button>
                </div>
            </div>
        </div>
    )
}
