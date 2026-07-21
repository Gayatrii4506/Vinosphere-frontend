'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Heart, Star } from 'lucide-react'
import { Wine } from '@/constants/wines'

interface WineCardProps {
    wine: Wine
}

export const WineCard: React.FC<WineCardProps> = ({ wine }) => {
    const [isLiked, setIsLiked] = useState(false)

    return (
        <div className="group rounded-2xl flex flex-col relative transition-all duration-300">
            {/* Framed Image Container */}
            <div className="relative mb-6 rounded-2xl p-2 bg-gradient-to-br from-vino-cream to-[#e8e2d8] shadow-sm border border-[#e2dccf] overflow-hidden group-hover:shadow-md transition-shadow duration-500">
                <div className="relative rounded-xl border border-[#d6cfc1]/50 bg-gradient-to-t from-[#f0ebe3] to-[#fcfbf9] h-80 flex items-center justify-center p-8">
                    {/* Abstract texture/noise overlay for premium feel */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                    
                    <Image
                        src={wine.imageUrl}
                        alt={wine.name}
                        width={140}
                        height={400}
                        className="object-contain h-full w-auto drop-shadow-xl group-hover:scale-105 transition-transform duration-700 ease-out z-10 mix-blend-multiply"
                    />
                </div>
            </div>

            {/* Metadata (Below Image) */}
            <div className="px-2">
                <div className="text-center mb-5">
                    <h3 className="font-serif text-xl text-vino-darker mb-1 group-hover:text-vino-accent transition-colors">{wine.name}</h3>
                    <p className="text-[11px] text-vino-dark/50 tracking-widest uppercase font-medium">
                        {wine.origin} &bull; {wine.volume} &bull; {wine.year}
                    </p>
                </div>

                {/* Stats */}
                <div className="flex justify-center items-center gap-6 mb-5 text-sm">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-[1px] text-vino-accent">
                            {Array.from({ length: 5 }).map((_, i) => {
                                // Convert 100-point scale to 5 stars roughly
                                const isFilled = wine.rating >= (i + 1) * 20 - 10
                                return (
                                    <Star 
                                        key={i} 
                                        size={12} 
                                        className={isFilled ? "fill-vino-accent" : "fill-transparent opacity-30"} 
                                    />
                                )
                            })}
                        </div>
                        <span className="text-[9px] text-vino-dark/40 uppercase tracking-widest mt-1">Rating</span>
                    </div>
                    <div className="w-px h-6 bg-vino-dark/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-vino-darker font-semibold">{wine.reviews}</span>
                        <span className="text-[9px] text-vino-dark/40 uppercase tracking-widest mt-1">Reviews</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-vino-dark/10 pt-4">
                    <div className="text-xl font-medium text-vino-darker">
                        <span className="text-vino-dark/50 text-lg mr-1">{wine.currency}</span>{wine.price.toLocaleString()}
                    </div>
                    <button 
                        onClick={() => setIsLiked(!isLiked)}
                        className="w-10 h-10 rounded-full bg-vino-cream-dark flex items-center justify-center text-vino-accent hover:bg-vino-accent hover:text-white transition-colors group/btn"
                    >
                        <Heart 
                            size={18} 
                            className={`group-hover/btn:scale-110 transition-all duration-300 ${isLiked ? 'fill-vino-accent text-vino-accent group-hover/btn:text-white' : ''}`} 
                        />
                    </button>
                </div>
            </div>
        </div>
    )
}
