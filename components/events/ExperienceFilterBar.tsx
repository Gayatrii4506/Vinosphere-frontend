'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, Map, ArrowUpDown, Sparkles, Filter, Wine, Compass, Utensils, Award, Sunset, Tent } from 'lucide-react'
import { EXPERIENCE_CATEGORIES } from '@/constants/events'

interface ExperienceFilterBarProps {
    selectedCategory: string
    setSelectedCategory: (cat: string) => void
    sortBy: string
    setSortBy: (sort: string) => void
    viewMode: 'grid' | 'map'
    setViewMode: (mode: 'grid' | 'map') => void
    totalResults: number
}

export const ExperienceFilterBar: React.FC<ExperienceFilterBarProps> = ({
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    totalResults,
}) => {
    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'All Experiences': return <Compass size={14} className="shrink-0" />
            case 'Wine Tastings': return <Wine size={14} className="shrink-0" />
            case 'Vineyard Tours': return <Tent size={14} className="shrink-0" />
            case 'Harvest Festivals': return <Sparkles size={14} className="shrink-0" />
            case 'Food Pairing': return <Utensils size={14} className="shrink-0" />
            case 'Sommelier Workshops': return <Award size={14} className="shrink-0" />
            case 'Sunset Soirées': return <Sunset size={14} className="shrink-0" />
            default: return <Wine size={14} className="shrink-0" />
        }
    }

    return (
        <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-xl border-y border-[#E8D4A8]/70 shadow-[0_4px_20px_rgba(44,24,16,0.06)] py-3.5 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Horizontal Luxury Category Chips */}
                <div className="flex items-center gap-2.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none py-1">
                    {EXPERIENCE_CATEGORIES.map((category) => {
                        const isActive = selectedCategory === category
                        return (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`group flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                                    isActive
                                        ? 'bg-vino-accent text-white shadow-lg shadow-vino-accent/25 border border-vino-gold/50 scale-105'
                                        : 'bg-white/80 text-vino-dark border border-[#E8D4A8]/70 hover:border-vino-accent/40 hover:bg-vino-cream/50'
                                }`}
                            >
                                <span className={isActive ? 'text-vino-gold' : 'text-vino-accent opacity-75 group-hover:opacity-100'}>
                                    {getCategoryIcon(category)}
                                </span>
                                <span>{category}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Right Controls: Filter Count, Sort & View Mode */}
                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-vino-dark/10">
                    <div className="text-xs text-vino-dark/70 font-medium flex items-center gap-1.5">
                        <Filter size={13} className="text-vino-accent" />
                        <span>Showing <strong className="text-vino-darker">{totalResults}</strong> curated events</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Sort Selector */}
                        <div className="flex items-center gap-1.5 bg-vino-cream/80 px-3 py-2 rounded-2xl border border-[#E8D4A8]/70 text-xs font-semibold text-vino-darker shadow-sm">
                            <ArrowUpDown size={13} className="text-vino-accent shrink-0" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent focus:outline-none cursor-pointer text-xs font-semibold text-vino-darker"
                            >
                                <option value="Upcoming Date">Upcoming Date</option>
                                <option value="Price: Low to High">Price: Low to High</option>
                                <option value="Rating: High to Low">Rating: High to Low</option>
                            </select>
                        </div>

                        {/* Grid / Map View Switcher */}
                        <div className="flex items-center bg-vino-cream/80 p-1 rounded-2xl border border-[#E8D4A8]/70 shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-white text-vino-accent shadow-md border border-vino-gold/30'
                                        : 'text-vino-dark/60 hover:text-vino-dark'
                                }`}
                                title="Grid View"
                            >
                                <LayoutGrid size={15} />
                                <span className="hidden sm:inline">Grid</span>
                            </button>

                            <button
                                onClick={() => setViewMode('map')}
                                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                    viewMode === 'map'
                                        ? 'bg-white text-vino-accent shadow-md border border-vino-gold/30'
                                        : 'text-vino-dark/60 hover:text-vino-dark'
                                }`}
                                title="Interactive Map View"
                            >
                                <Map size={15} />
                                <span className="hidden sm:inline">Map</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
