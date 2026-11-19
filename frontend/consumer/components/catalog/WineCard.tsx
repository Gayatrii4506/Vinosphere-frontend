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

    // Compute star score (0 to 5) from 100-point scale or 5-point scale
    const starCount = rating > 5 ? (rating / 20).toFixed(1) : Number(rating).toFixed(1)

    return (
        <div 
            tabIndex={0}
            role="button"
            onClick={() => {
                trackEvent?.('wine_view', { wine_id: wine.id, winery_id: (wine as any).wineryId })
                onSelect?.(wine)
            }}
            onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    trackEvent?.('wine_view', { wine_id: wine.id, winery_id: (wine as any).wineryId })
                    onSelect?.(wine)
                }
            }}
            className="group relative flex flex-col justify-between rounded-2xl bg-white border border-[#EDE5D8]/80 p-3.5 sm:p-4 shadow-[0_2px_12px_rgba(44,24,16,0.03)] hover:shadow-[0_12px_28px_rgba(122,30,58,0.08)] hover:border-[#8B1E3F]/30 cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E3F]"
        >
            {/* Wine Bottle Image Stage */}
            <div className="relative w-full h-44 sm:h-52 mb-3 flex items-center justify-center overflow-hidden rounded-xl bg-[#FAF8F5] border border-[#F2ECE1]/60">
                {(wine as any).recommendationBadge && (
                    <div className="absolute top-2 left-2 z-10 max-w-[85%] truncate px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-white/95 backdrop-blur-md text-[#8B1E3F] border border-[#8B1E3F]/20 shadow-xs">
                        {(wine as any).recommendationBadge}
                    </div>
                )}
                <img
                    src={displayImg}
                    alt={name}
                    onError={() => setImgError(true)}
                    className="object-contain h-full max-h-[90%] w-auto group-hover:scale-105 transition-transform duration-500 ease-out"
                />
            </div>

            {/* Wine Metadata */}
            <div className="flex flex-col justify-between flex-1">
                <div>
                    <h3 className="font-serif text-[0.95rem] sm:text-base font-bold text-[#1A0A10] mb-1 line-clamp-1 group-hover:text-[#8B1E3F] transition-colors" title={name}>
                        {name}
                    </h3>
                    <p className="text-[11px] text-[#8B6E5A] tracking-wide font-medium mb-2.5 line-clamp-1">
                        {origin} &bull; {volume} &bull; {year}
                    </p>
                </div>

                {/* Rating & Reviews */}
                <div className="flex justify-between items-center mb-3 text-xs border-t border-b border-[#F2EDE4] py-1.5">
                    <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5 text-[#C89B3C]">
                            {Array.from({ length: 5 }).map((_, i) => {
                                const isFilled = rating > 5 ? rating >= (i + 1) * 20 - 10 : rating >= (i + 1)
                                return (
                                    <Star 
                                        key={i} 
                                        size={11} 
                                        className={isFilled ? "fill-[#C89B3C]" : "fill-transparent text-[#D8CFBF]"} 
                                    />
                                )
                            })}
                        </div>
                        <span className="text-[11px] font-bold text-[#1A0A10] ml-0.5">{starCount}</span>
                    </div>
                    <span className="text-[11px] text-[#A08070] font-medium">
                        {reviews} {reviews === 1 ? 'review' : 'reviews'}
                    </span>
                </div>

                {/* Price & Wishlist */}
                <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-baseline gap-0.5 text-[#1A0A10]">
                        <span className="text-[#8B1E3F] text-xs font-semibold">{currency}</span>
                        <span className="text-base sm:text-lg font-bold font-serif leading-none tracking-tight">
                            {(price || 0).toLocaleString()}
                        </span>
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
                        onKeyDown={(e) => e.stopPropagation()}
                        aria-label={isLiked ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
                        className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8DDD0] flex items-center justify-center text-[#A08070] hover:text-[#8B1E3F] hover:border-[#8B1E3F]/30 hover:bg-[#8B1E3F]/5 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E3F] group/btn"
                    >
                        <Heart 
                            size={14} 
                            className={`group-hover/btn:scale-110 transition-transform ${isLiked ? 'fill-[#8B1E3F] text-[#8B1E3F]' : ''}`} 
                        />
                    </button>
                </div>
            </div>
        </div>
    )
}
