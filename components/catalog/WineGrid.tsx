'use client'

import React from 'react'
import { WineCard } from './WineCard'
import { Pagination } from './Pagination'
import { Wine } from '@/constants/wines'

interface WineGridProps {
    wines: Wine[]
    sortBy: string
    setSortBy: (sort: string) => void
}

export const WineGrid: React.FC<WineGridProps> = ({ wines, sortBy, setSortBy }) => {
    return (
        <div className="flex-1">
            {/* Top Bar (Sorting) */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <p className="text-sm text-vino-dark/60">
                    Showing <span className="text-vino-darker font-medium">{wines.length}</span> wines
                </p>
                
                <div className="flex items-center gap-6 text-sm text-vino-dark/60">
                    <span 
                        onClick={() => setSortBy('New')}
                        className={`cursor-pointer transition-colors ${sortBy === 'New' ? 'text-vino-accent font-medium' : 'hover:text-vino-accent'}`}
                    >
                        New
                    </span>
                    <span 
                        onClick={() => setSortBy('Popular')}
                        className={`cursor-pointer transition-colors ${sortBy === 'Popular' ? 'text-vino-accent font-medium' : 'hover:text-vino-accent'}`}
                    >
                        Popular
                    </span>
                    <div 
                        onClick={() => setSortBy('Price')}
                        className={`flex items-center gap-1 cursor-pointer transition-colors ${sortBy === 'Price' ? 'text-vino-accent font-medium' : 'hover:text-vino-accent'}`}
                    >
                        Price
                        <span className="text-xs">&uarr;</span>
                    </div>
                    <span 
                        onClick={() => setSortBy('Year')}
                        className={`cursor-pointer transition-colors ${sortBy === 'Year' ? 'text-vino-accent font-medium' : 'hover:text-vino-accent'}`}
                    >
                        Year
                    </span>
                </div>
            </div>

            {/* Grid */}
            {wines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                    {wines.map(wine => (
                        <WineCard key={wine.id} wine={wine} />
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
