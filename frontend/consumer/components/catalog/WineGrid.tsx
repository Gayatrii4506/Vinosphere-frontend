'use client'

import React from 'react'
import { Wine as WineIcon, FilterX, RefreshCw, ArrowUpDown } from 'lucide-react'
import { WineCard } from './WineCard'
import { Pagination } from './Pagination'
import { Wine } from '@/constants/wines'

interface WineGridProps {
    wines: Wine[]
    sortBy: string
    setSortBy: (sort: string) => void
    onSelectWine?: (wine: Wine) => void
    hasActiveFilters?: boolean
    onResetFilters?: () => void
    fallbackWines?: Wine[]
}

export const WineGrid: React.FC<WineGridProps> = ({
    wines = [],
    sortBy,
    setSortBy,
    onSelectWine,
    hasActiveFilters = false,
    onResetFilters,
    fallbackWines = []
}) => {
    // When in Recommended mode, split into Recommended (top 4-6) vs More Curated / Similar wines
    const isRecommendedMode = sortBy === 'Recommended'
    const recommendedWines = isRecommendedMode && wines.length > 4 ? wines.slice(0, 6) : wines
    const similarWines = isRecommendedMode && wines.length > 4 ? wines.slice(6) : []

    const sortOptions = [
        { id: 'Recommended', label: 'Recommended' },
        { id: 'Rating', label: 'Highest Rated' },
        { id: 'Popular', label: 'Most Popular' },
        { id: 'Year', label: 'Newest' },
        { id: 'PriceAsc', label: 'Price: Low to High' },
        { id: 'PriceDesc', label: 'Price: High to Low' },
    ]

    return (
        <div className="flex-1">
            {/* Clean & Attractive Top Bar (Sorting) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200/80">
                <p className="text-xs sm:text-sm text-stone-500 font-medium">
                    Showing <span className="text-vino-darker font-bold">{wines.length}</span> wines
                </p>
                
                {/* Elegant Sort Control */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 font-medium uppercase tracking-wider hidden sm:inline">
                        Sort by:
                    </span>
                    
                    {/* Desktop Clean Tabs */}
                    <div className="hidden md:flex items-center gap-1.5 p-1 bg-white border border-stone-200 rounded-lg shadow-sm">
                        {sortOptions.slice(0, 4).map(opt => {
                            const isActive = sortBy === opt.id
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setSortBy(opt.id)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                                        isActive
                                            ? 'bg-vino-accent text-white shadow-xs'
                                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            )
                        })}

                        {/* Price Toggle */}
                        <button
                            type="button"
                            onClick={() => setSortBy(sortBy === 'PriceAsc' ? 'PriceDesc' : 'PriceAsc')}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                                sortBy === 'PriceAsc' || sortBy === 'PriceDesc'
                                    ? 'bg-vino-accent text-white shadow-xs'
                                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                            }`}
                        >
                            <span>Price</span>
                            <ArrowUpDown size={11} />
                        </button>
                    </div>

                    {/* Mobile Select Dropdown */}
                    <div className="md:hidden relative w-full sm:w-auto">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label="Sort wines"
                            className="w-full sm:w-auto text-xs font-medium bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-vino-accent shadow-sm"
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid Content */}
            {wines.length > 0 ? (
                <div>
                    {/* Recommended Section (When sorted by Recommended and multiple wines exist) */}
                    {isRecommendedMode && similarWines.length > 0 ? (
                        <div>
                            {/* Section 1: Recommended for You */}
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="font-serif text-base sm:text-lg font-bold text-vino-darker">
                                    Recommended for You
                                </h3>
                                <span className="text-xs text-stone-400 font-medium">Curated to your taste</span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
                                {recommendedWines.map(wine => (
                                    <WineCard key={wine.id} wine={wine} onSelect={onSelectWine} />
                                ))}
                            </div>

                            {/* Section 2: Explore Similar & More Curated Wines */}
                            <div className="mt-10 mb-4 pt-8 border-t border-stone-200/90">
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-serif text-base sm:text-lg font-bold text-vino-darker">
                                            More Curated Wines
                                        </h3>
                                        <p className="text-xs text-stone-500">Explore additional vintages from artisanal cellars</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
                                    {similarWines.map(wine => (
                                        <WineCard key={wine.id} wine={wine} onSelect={onSelectWine} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Unified Grid for standard sorting */
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
                            {wines.map(wine => (
                                <WineCard key={wine.id} wine={wine} onSelect={onSelectWine} />
                            ))}
                        </div>
                    )}
                </div>
            ) : hasActiveFilters ? (
                /* Restrictive Catalogue Filters State */
                <div className="space-y-8">
                    <div className="py-12 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-stone-200/80 p-8 shadow-sm">
                        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800 mb-4">
                            <FilterX className="w-6 h-6" />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-vino-darker mb-2">No Wines Match All Selected Filters</h3>
                        <p className="text-stone-500 text-xs sm:text-sm max-w-md text-center mb-6 leading-relaxed">
                            Your current combination of price, vintage, and rating is restrictive. Try clearing or broadening your filters to explore available cellars.
                        </p>
                        {onResetFilters && (
                            <button
                                type="button"
                                onClick={onResetFilters}
                                className="px-5 py-2.5 bg-vino-accent hover:bg-vino-accent-light text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                            >
                                <RefreshCw size={14} />
                                Clear All Filters
                            </button>
                        )}
                    </div>

                    {/* Fallback Wines */}
                    {fallbackWines.length > 0 && (
                        <div>
                            <div className="mb-4">
                                <h4 className="font-serif text-base font-bold text-vino-darker">Popular Community Choices You Might Like</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch">
                                {fallbackWines.map(wine => (
                                    <WineCard key={wine.id} wine={wine} onSelect={onSelectWine} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-stone-200/80 p-8 shadow-sm">
                    <WineIcon className="w-12 h-12 text-vino-accent/40 mb-3" />
                    <h3 className="font-serif text-xl font-bold text-vino-darker mb-2">No Wines in Catalog Yet</h3>
                    <p className="text-stone-500 text-sm max-w-md text-center mb-4">
                        Wines added from the Winery Dashboard will automatically appear here in real time.
                    </p>
                </div>
            )}

            {/* Pagination */}
            {wines.length > 0 && (
                <Pagination currentPage={1} totalPages={Math.ceil(wines.length / 9) || 1} onPageChange={() => {}} />
            )}
        </div>
    )
}
