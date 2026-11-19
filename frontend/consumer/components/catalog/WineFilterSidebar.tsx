'use client'

import React from 'react'

export interface FilterState {
    priceRange: string | null
    selectedType: string | null
    selectedRating: string | null
    selectedFoodPairing: string | null
    selectedVintage: string | null
}

interface WineFilterSidebarProps {
    filters: FilterState
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>
}

export const WineFilterSidebar: React.FC<WineFilterSidebarProps> = ({ filters, setFilters }) => {

    const toggleFilter = (category: keyof FilterState, value: string) => {
        setFilters(prev => ({
            ...prev,
            // If already selected, deselect it (allow null). Otherwise, select it.
            [category]: prev[category] === value ? null : value
        }))
    }

    const priceOptions = [
        { label: 'Under ₹1,500', value: '0-1500' },
        { label: '₹1,500 - ₹3,000', value: '1500-3000' },
        { label: '₹3,000 - ₹5,000', value: '3000-5000' },
        { label: 'Over ₹5,000', value: '5000-999999' }
    ]

    const ratingOptions = [
        { label: '4.5+ Stars ★', value: '90' },
        { label: '4.0+ Stars ★', value: '80' },
        { label: '3.5+ Stars ★', value: '70' }
    ]

    const vintageOptions = [
        { label: '2024 Vintages', value: '2024' },
        { label: '2023 Vintages', value: '2023' },
        { label: '2022 Vintages', value: '2022' },
        { label: '2021 & Older', value: '2021-older' }
    ]

    return (
        <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-28 self-start space-y-8 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-sm">
            {/* Price Filter */}
            <div>
                <h4 className="text-xs font-bold text-vino-darker tracking-wider uppercase mb-3 flex justify-between items-center border-b border-stone-100 pb-2">
                    Price Range
                    <span className="text-vino-accent font-light text-xs">-</span>
                </h4>
                <div className="space-y-2">
                    {priceOptions.map(option => {
                        const isActive = filters.priceRange === option.value
                        return (
                            <label 
                                key={option.value} 
                                tabIndex={0}
                                role="button"
                                aria-pressed={isActive}
                                className="flex items-center gap-3 cursor-pointer group rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent" 
                                onClick={() => toggleFilter('priceRange', option.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        toggleFilter('priceRange', option.value)
                                    }
                                }}
                            >
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isActive ? 'border-vino-accent bg-vino-accent/5' : 'border-stone-300 group-hover:border-vino-accent'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-vino-accent' : 'bg-transparent group-hover:bg-vino-accent/30'}`} />
                                </div>
                                <span className={`text-xs transition-colors ${isActive ? 'text-vino-accent font-semibold' : 'text-stone-600 group-hover:text-vino-accent'}`}>{option.label}</span>
                            </label>
                        )
                    })}
                </div>
            </div>

            {/* Type Filter */}
            <div>
                <h4 className="text-xs font-bold text-vino-darker tracking-wider uppercase mb-3 flex justify-between items-center border-b border-stone-100 pb-2">
                    Wine Types
                    <span className="text-vino-accent font-light text-xs">-</span>
                </h4>
                <div className="space-y-2">
                    {['Red', 'White', 'Rose', 'Sparkling'].map(type => {
                        const isActive = filters.selectedType === type
                        return (
                            <label 
                                key={type} 
                                tabIndex={0}
                                role="button"
                                aria-pressed={isActive}
                                className="flex items-center gap-3 cursor-pointer group rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent" 
                                onClick={() => toggleFilter('selectedType', type)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        toggleFilter('selectedType', type)
                                    }
                                }}
                            >
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isActive ? 'border-vino-accent bg-vino-accent/5' : 'border-stone-300 group-hover:border-vino-accent'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-vino-accent' : 'bg-transparent group-hover:bg-vino-accent/30'}`} />
                                </div>
                                <span className={`text-xs transition-colors ${isActive ? 'text-vino-accent font-semibold' : 'text-stone-600 group-hover:text-vino-accent'}`}>{type}</span>
                            </label>
                        )
                    })}
                </div>
            </div>

            {/* Rating Filter */}
            <div>
                <h4 className="text-xs font-bold text-vino-darker tracking-wider uppercase mb-3 flex justify-between items-center border-b border-stone-100 pb-2">
                    Minimum Rating
                    <span className="text-vino-accent font-light text-xs">-</span>
                </h4>
                <div className="space-y-2">
                    {ratingOptions.map(option => {
                        const isActive = filters.selectedRating === option.value
                        return (
                            <label 
                                key={option.value} 
                                tabIndex={0}
                                role="button"
                                aria-pressed={isActive}
                                className="flex items-center gap-3 cursor-pointer group rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent" 
                                onClick={() => toggleFilter('selectedRating', option.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        toggleFilter('selectedRating', option.value)
                                    }
                                }}
                            >
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isActive ? 'border-vino-accent bg-vino-accent/5' : 'border-stone-300 group-hover:border-vino-accent'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-vino-accent' : 'bg-transparent group-hover:bg-vino-accent/30'}`} />
                                </div>
                                <span className={`text-xs transition-colors ${isActive ? 'text-vino-accent font-semibold' : 'text-stone-600 group-hover:text-vino-accent'}`}>{option.label}</span>
                            </label>
                        )
                    })}
                </div>
            </div>

            {/* Vintage Filter */}
            <div>
                <h4 className="text-xs font-bold text-vino-darker tracking-wider uppercase mb-3 flex justify-between items-center border-b border-stone-100 pb-2">
                    Vintage Year
                    <span className="text-vino-accent font-light text-xs">-</span>
                </h4>
                <div className="space-y-2">
                    {vintageOptions.map(option => {
                        const isActive = filters.selectedVintage === option.value
                        return (
                            <label 
                                key={option.value} 
                                tabIndex={0}
                                role="button"
                                aria-pressed={isActive}
                                className="flex items-center gap-3 cursor-pointer group rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent" 
                                onClick={() => toggleFilter('selectedVintage', option.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        toggleFilter('selectedVintage', option.value)
                                    }
                                }}
                            >
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isActive ? 'border-vino-accent bg-vino-accent/5' : 'border-stone-300 group-hover:border-vino-accent'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-vino-accent' : 'bg-transparent group-hover:bg-vino-accent/30'}`} />
                                </div>
                                <span className={`text-xs transition-colors ${isActive ? 'text-vino-accent font-semibold' : 'text-stone-600 group-hover:text-vino-accent'}`}>{option.label}</span>
                            </label>
                        )
                    })}
                </div>
            </div>
            
            <button 
                onClick={() => setFilters({ priceRange: null, selectedType: null, selectedRating: null, selectedFoodPairing: null, selectedVintage: null })}
                className="w-full py-2 mt-2 text-[10px] tracking-widest uppercase text-stone-500 hover:text-vino-accent border border-stone-200 rounded-full hover:border-vino-accent bg-stone-50 hover:bg-white transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent font-semibold"
            >
                Reset Filters
            </button>
        </aside>
    )
}
