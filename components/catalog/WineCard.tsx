'use client'

import React, { useState } from 'react'
import { Heart, Star } from 'lucide-react'
import { Wine } from '@/constants/wines'
import { createClient } from '@/lib/supabase/client'

interface WineCardProps {
    wine: Wine
    onSelect?: (wine: Wine) => void
}

export const WineCard: React.FC<WineCardProps> = ({ wine, onSelect }) => {
    const [isLiked, setIsLiked] = useState(false)
    const [imgError, setImgError] = useState(false)

    // Fallback image if custom Cloudinary URL fails to load
    const displayImg = imgError || !wine.imageUrl ? '/bottle.png' : wine.imageUrl

    return (
        <div 
            onClick={() => onSelect?.(wine)}
            className="group relative flex flex-col justify-between rounded-xl bg-white border border-stone-200/90 p-3 shadow-sm hover:shadow-lg hover:border-vino-accent/50 cursor-pointer transition-all duration-300"
        >
            {/* Direct Image - Compact Height */}
            <div className="relative w-full h-40 sm:h-44 mb-2 flex items-center justify-center overflow-hidden">
                <img
                    src={displayImg}
                    alt={wine.name}
                    onError={() => setImgError(true)}
                    className="object-contain h-full max-h-full w-auto group-hover:scale-105 transition-transform duration-500 ease-out"
                />
            </div>

            {/* Metadata (Below Image) */}
            <div className="flex flex-col justify-between flex-1">
                <div>
                    <h3 className="font-serif text-xs sm:text-sm font-bold text-vino-darker mb-0.5 line-clamp-1 group-hover:text-vino-accent transition-colors" title={wine.name}>
                        {wine.name}
                    </h3>
                    <p className="text-[9px] text-stone-500 tracking-wider uppercase font-medium mb-2">
                        {wine.origin} &bull; {wine.volume} &bull; {wine.year}
                    </p>
                </div>

                {/* Rating & Reviews */}
                <div className="flex justify-between items-center mb-2 text-xs border-t border-b border-stone-100 py-1">
                    <div className="flex items-center gap-0.5 text-vino-accent">
                        {Array.from({ length: 5 }).map((_, i) => {
                            const isFilled = wine.rating >= (i + 1) * 20 - 10
                            return (
                                <Star 
                                    key={i} 
                                    size={9} 
                                    className={isFilled ? "fill-vino-accent" : "fill-transparent opacity-30"} 
                                />
                            )
                        })}
                    </div>
                    <span className="text-[9px] text-stone-500 font-medium">
                        {wine.reviews} reviews
                    </span>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                    <div className="text-sm sm:text-base font-bold text-vino-darker">
                        <span className="text-vino-dark/50 text-xs mr-0.5">{wine.currency}</span>{wine.price.toLocaleString()}
                    </div>
                    <button 
                        onClick={async (e) => {
                            e.stopPropagation()
                            // Optimistic UI update
                            const newlyLiked = !isLiked;
                            setIsLiked(newlyLiked);
                            
                            try {
                                const supabase = createClient();
                                const { data: { session } } = await supabase.auth.getSession();
                                
                                if (!session) {
                                    alert('Please log in to save wines to your cellar.');
                                    setIsLiked(isLiked); // Revert
                                    return;
                                }

                                if (newlyLiked) {
                                    // Add to wishlist
                                    await fetch('http://localhost:5000/api/v1/wishlist', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${session.access_token}`
                                        },
                                        body: JSON.stringify({ wineId: wine.id })
                                    });
                                } else {
                                    // Remove from wishlist
                                    await fetch(`http://localhost:5000/api/v1/wishlist/${wine.id}`, {
                                        method: 'DELETE',
                                        headers: {
                                            'Authorization': `Bearer ${session.access_token}`
                                        }
                                    });
                                }
                            } catch (error) {
                                console.error('Failed to update wishlist:', error);
                                setIsLiked(isLiked); // Revert on failure
                            }
                        }}
                        aria-label="Save to favorites"
                        className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-vino-accent hover:bg-vino-accent hover:text-white transition-colors group/btn"
                    >
                        <Heart 
                            size={12} 
                            className={`group-hover/btn:scale-110 transition-all duration-300 ${isLiked ? 'fill-vino-accent text-vino-accent group-hover/btn:text-white' : ''}`} 
                        />
                    </button>
                </div>
            </div>
        </div>
    )
}
