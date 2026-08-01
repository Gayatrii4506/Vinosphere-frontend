'use client'

import React from 'react'
import { WineCard } from './WineCard'
import { Pagination } from './Pagination'
import { Wine } from '@/constants/wines'

interface WineGridProps {
    wines: Wine[]
    sortBy: string
    setSortBy: (sort: string) => void
    onSelectWine?: (wine: Wine) => void
}

export const WineGrid: React.FC<WineGridProps> = ({ wines, sortBy, setSortBy, onSelectWine }) => {
    return (
        <div className="flex-1">
            {/* Top Bar (Sorting) */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <p className="text-sm text-vino-dark/60">
                    Showing <span className="text-vino-darker font-medium">{wines.length}</span> wines
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-vino-dark/70">
                    <span className="font-semibold text-vino-darker">Sort by:</span>
                    <span 
                        onClick={() => setSortBy('Popular')}
                        className={`cursor-pointer transition-colors ${sortBy === 'Popular' ? 'text-vino-accent font-bold border-b border-vino-accent pb-0.5' : 'hover:text-vino-accent'}`}
                    >
                        Popular
                    </span>
                    <span 
                        onClick={() => setSortBy('PriceAsc')}
                        className={`flex items-center gap-0.5 cursor-pointer transition-colors ${sortBy === 'PriceAsc' ? 'text-vino-accent font-bold border-b border-vino-accent pb-0.5' : 'hover:text-vino-accent'}`}
                    >
                        Price: Low &rarr; High
                    </span>
                    <span 
                        onClick={() => setSortBy('PriceDesc')}
                        className={`flex items-center gap-0.5 cursor-pointer transition-colors ${sortBy === 'PriceDesc' ? 'text-vino-accent font-bold border-b border-vino-accent pb-0.5' : 'hover:text-vino-accent'}`}
                    >
                        Price: High &rarr; Low
                    </span>
                    <span 
                        onClick={() => setSortBy('Year')}
                        className={`cursor-pointer transition-colors ${sortBy === 'Year' ? 'text-vino-accent font-bold border-b border-vino-accent pb-0.5' : 'hover:text-vino-accent'}`}
                    >
                        Newest Vintage
                    </span>
                </div>
            </div>

            {/* Grid - 4 cards per row on desktop */}
            {wines.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-5 items-stretch">
                    {wines.map(wine => (
                        <WineCard key={wine.id} wine={wine} onSelect={onSelectWine} />
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                    <p className="text-vino-dark/60 text-lg mb-4">No wines found matching your filters.</p>
                    <button className="text-vino-accent hover:underline">Clear Filters</button>
                </div>
            )}

            {/* Pagination (Hidden if no wines) */}
            {wines.length > 0 && (
                <Pagination currentPage={1} totalPages={Math.ceil(wines.length / 9) || 1} onPageChange={() => {}} />
            )}
        </div>
    )
}
