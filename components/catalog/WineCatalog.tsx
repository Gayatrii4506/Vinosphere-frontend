'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { WineFilterSidebar, FilterState } from './WineFilterSidebar'
import { WineGrid } from './WineGrid'
import { Wine } from '@/constants/wines'

interface WineCatalogProps {
    initialWines: Wine[]
}

export const WineCatalog: React.FC<WineCatalogProps> = ({ initialWines }) => {
    const searchParams = useSearchParams()
    const typeParam = searchParams ? searchParams.get('type') : null

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
            if (sortBy === 'Price') return a.price - b.price
            if (sortBy === 'Year') return b.year - a.year // newest first
            if (sortBy === 'New') return b.year - a.year // mock 'New' as newest year
            if (sortBy === 'Popular') return b.reviews - a.reviews // most reviews = popular
            return 0
        })

        return result
    }, [initialWines, filters, sortBy])

    return (
        <section className="bg-vino-cream min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 border-b border-vino-dark/10 pb-8 flex items-end justify-between">
                    <h1 className="font-serif text-4xl md:text-5xl text-vino-darker">
                        Wine Catalog
                    </h1>
                    <div className="hidden md:flex items-center gap-4 text-sm text-vino-dark/60">
                        <span className="cursor-pointer hover:text-vino-accent transition-colors">By categories</span>
                        <span className="text-vino-accent">&bull;</span>
                        <span className="text-vino-accent border-b border-vino-accent pb-1 cursor-pointer">All</span>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    <WineFilterSidebar filters={filters} setFilters={setFilters} />
                    <WineGrid wines={filteredAndSortedWines} sortBy={sortBy} setSortBy={setSortBy} />
                </div>
            </div>
        </section>
    )
}
