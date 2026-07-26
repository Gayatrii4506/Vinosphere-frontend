'use client'

import React from 'react'

export interface FilterState {
    priceRange: string | null
    selectedType: string | null
    selectedRating: string | null
    selectedFoodPairing: string | null
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
        { label: 'Under ₹2000', value: '0-2000' },
        { label: '₹2000 - ₹3000', value: '2000-3000' },
        { label: '₹3000 - ₹4000', value: '3000-4000' },
        { label: 'Over ₹4000', value: '4000-999999' }
    ]

    return (
        <aside className="w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-28 self-start space-y-10">
            {/* Price Filter */}
            <div>
                <h4 className="text-sm font-serif text-vino-darker tracking-wider uppercase mb-4 flex justify-between items-center">
                    Price
                    <span className="text-vino-accent text-xs">-</span>
                </h4>
                <div className="space-y-3">
                    {priceOptions.map(option => {
                        const isActive = filters.priceRange === option.value
                        return (
                            <label key={option.value} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter('priceRange', option.value)}>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isActive ? 'border-vino-accent' : 'border-vino-dark/20 group-hover:border-vino-accent'}`}>
                                    <div className={`w-2 h-2 rounded-full transition-colors ${isActive ? 'bg-vino-accent' : 'bg-transparent group-hover:bg-vino-accent/50'}`} />
                                </div>
                                <span className={`text-sm transition-colors ${isActive ? 'text-vino-accent font-medium' : 'text-vino-dark/60 group-hover:text-vino-accent'}`}>{option.label}</span>
                            </label>
                        )
                    })}
                </div>
            </div>

            {/* Type Filter */}
            <div>
                <h4 className="text-sm font-serif text-vino-darker tracking-wider uppercase mb-4 flex justify-between items-center">
                    Types
                    <span className="text-vino-accent text-xs">-</span>
                </h4>
                <div className="space-y-3">
                    {['Red', 'White', 'Rose', 'Sparkling'].map(type => {
                        const isActive = filters.selectedType === type
                        return (
                            <label key={type} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleFilter('selectedType', type)}>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isActive ? 'border-vino-accent' : 'border-vino-dark/20 group-hover:border-vino-accent'}`}>
                                    <div className={`w-2 h-2 rounded-full transition-colors ${isActive ? 'bg-vino-accent' : 'bg-transparent group-hover:bg-vino-accent/50'}`} />
                                </div>
                                <span className={`text-sm transition-colors ${isActive ? 'text-vino-accent font-medium' : 'text-vino-dark/60 group-hover:text-vino-accent'}`}>{type}</span>
                            </label>
                        )
                    })}
                </div>
            </div>

            
            <button 
                onClick={() => setFilters({ priceRange: null, selectedType: null, selectedRating: null, selectedFoodPairing: null })}
                className="w-full py-2 mt-4 text-xs tracking-widest uppercase text-vino-dark/60 hover:text-vino-accent border border-vino-dark/10 rounded-full hover:border-vino-accent transition-colors"
            >
                Reset Filters
            </button>
        </aside>
    )
}
