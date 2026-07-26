'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { WineFilterSidebar, FilterState } from './WineFilterSidebar'
import { WineGrid } from './WineGrid'
import { WineDetailModal } from './WineDetailModal'
import { Wine } from '@/constants/wines'

interface WineCatalogProps {
    initialWines: Wine[]
}

export const WineCatalog: React.FC<WineCatalogProps> = ({ initialWines }) => {
    const searchParams = useSearchParams()
    const typeParam = searchParams ? searchParams.get('type') : null

    const [selectedWine, setSelectedWine] = useState<Wine | null>(null)

    const [filters, setFilters] = useState<FilterState>({
        priceRange: null,
        selectedType: typeParam || null,
        selectedRating: null,
        selectedFoodPairing: null,
    })

    useEffect(() => {
        if (typeParam) {
            setFilters(prev => ({ ...prev, selectedType: typeParam }))
        }
    }, [typeParam])
    
    const [sortBy, setSortBy] = useState<string>('Popular')

    const filteredAndSortedWines = useMemo(() => {
        // 1. Filter
        let result = initialWines.filter(wine => {
            // Price check
            if (filters.priceRange) {
                const [min, max] = filters.priceRange.split('-').map(Number)
                if (wine.price < min || wine.price > max) return false
            }
            
            // Type check
            if (filters.selectedType && wine.type !== filters.selectedType) {
                return false
            }
            
            // Rating check
            if (filters.selectedRating) {
                const minRating = Number(filters.selectedRating)
                if (wine.rating < minRating) return false
            }
            
            // Food Pairing check
            if (filters.selectedFoodPairing && !wine.foodPairing.includes(filters.selectedFoodPairing)) {
                return false
            }
            
            return true
        })

        // 2. Sort
        result.sort((a, b) => {
            if (sortBy === 'PriceAsc') return a.price - b.price
            if (sortBy === 'PriceDesc') return b.price - a.price
            if (sortBy === 'Year') return b.year - a.year // newest first
            if (sortBy === 'Popular') return b.reviews - a.reviews // most reviews = popular
            return 0
        })

        return result
    }, [initialWines, filters, sortBy])

    return (
        <section className="bg-[#F8F5EF] min-h-screen pt-20 sm:pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* ── Wine Catalog Header Banner Box - Sleek & Compact ── */}
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[#3d0b1d] via-[#63142e] to-[#290613] py-4 px-6 sm:px-8 mb-8 shadow-md border border-[#8B1E3F]/40 flex items-center justify-between gap-4">
                    {/* Rich Dark Watercolor Texture Overlay */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 opacity-[0.45] bg-cover bg-center pointer-events-none mix-blend-overlay"
                        style={{
                            backgroundImage: 'url(/images/catalog_wine_bg.png)',
                        }}
                    />

                    {/* Deep Burgundy Accent */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />

                    <div className="relative z-10 flex items-center gap-4 sm:gap-6">
                        <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl text-white font-bold tracking-tight">
                            Wine Catalog
                        </h1>
                        <div className="hidden sm:block w-px h-5 bg-white/25" />
                        <p className="hidden md:block text-amber-100/80 text-xs font-light">
                            Explore rare vintages, artisanal cellars, and estate reserves.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-3 text-xs text-white/80 shrink-0">
                        <span className="cursor-pointer hover:text-vino-gold transition-colors font-medium">By categories</span>
                        <span className="text-vino-gold font-bold">&bull;</span>
                        <span className="text-vino-gold font-bold border-b border-vino-gold pb-0.5 cursor-pointer">All</span>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    <WineFilterSidebar filters={filters} setFilters={setFilters} />
                    <WineGrid wines={filteredAndSortedWines} sortBy={sortBy} setSortBy={setSortBy} onSelectWine={setSelectedWine} />
                </div>
            </div>

            {/* Interactive Wine Detail Modal */}
            <WineDetailModal wine={selectedWine} onClose={() => setSelectedWine(null)} />
        </section>
    )
}
