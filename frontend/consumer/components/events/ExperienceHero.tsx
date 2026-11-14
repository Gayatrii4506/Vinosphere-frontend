'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, Compass, Sparkles } from 'lucide-react'
import { EXPERIENCE_CATEGORIES } from '@/constants/events'

interface ExperienceHeroProps {
    searchQuery: string
    setSearchQuery: (q: string) => void
    selectedLocation: string
    setSelectedLocation: (loc: string) => void
    selectedCategory: string
    setSelectedCategory: (cat: string) => void
}

export const ExperienceHero: React.FC<ExperienceHeroProps> = ({
    searchQuery,
    setSearchQuery,
    selectedLocation,
    setSelectedLocation,
    selectedCategory,
    setSelectedCategory,
}) => {
    return (
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-vino-cream">
            {/* Ambient Lighting Gradients */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-vino-gold/20 via-vino-accent/10 to-transparent blur-3xl pointer-events-none rounded-full" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-6"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#E8D4A8]/60 shadow-sm text-xs font-semibold text-vino-dark">
                        <Sparkles size={14} className="text-vino-accent" />
                        <span className="tracking-widest uppercase text-[10.5px]">Curated Wine Experiences</span>
                    </div>
                </motion.div>

                {/* Hero Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-center max-w-3xl mx-auto mb-10"
                >
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-vino-darker leading-[1.15] mb-4">
                        Discover & Book <br className="hidden sm:block" />
                        <span className="italic font-normal text-vino-accent">Extraordinary</span> Wine Journeys
                    </h1>
                    <p className="text-vino-dark/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        From sunset harvest galas in Nashik to masterclasses in Nandi Hills. Hosted by certified sommeliers & Michelin chefs.
                    </p>
                </motion.div>

                {/* Floating Search Bar (Airbnb / Stripe Inspired Glass Pill) */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-white/90 backdrop-blur-xl p-3 sm:p-4 rounded-3xl sm:rounded-full shadow-[0_12px_40px_rgba(44,24,16,0.08)] border border-[#E8D4A8]/70 flex flex-col sm:flex-row items-center gap-3">
                        
                        {/* Search Input */}
                        <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full border-b sm:border-b-0 sm:border-r border-vino-dark/10">
                            <Compass size={20} className="text-vino-accent shrink-0" />
                            <div className="w-full">
                                <label htmlFor="experience-search-input" className="block text-[10px] font-bold uppercase tracking-wider text-vino-dark/50">Estate Journey</label>
                                <input
                                    id="experience-search-input"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Harvest gala, jazz, masterclass..."
                                    className="w-full text-sm font-semibold text-vino-darker placeholder:text-vino-dark/40 bg-transparent focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Location Select */}
                        <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full border-b sm:border-b-0 sm:border-r border-vino-dark/10">
                            <MapPin size={20} className="text-vino-accent shrink-0" />
                            <div className="w-full">
                                <label htmlFor="location-select-input" className="block text-[10px] font-bold uppercase tracking-wider text-vino-dark/50">Location</label>
                                <select
                                    id="location-select-input"
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="w-full text-sm font-semibold text-vino-darker bg-transparent focus:outline-none cursor-pointer"
                                >
                                    <option value="All Locations">All Regions</option>
                                    <option value="Nashik">Nashik, Maharashtra</option>
                                    <option value="Bengaluru">Nandi Hills, Karnataka</option>
                                    <option value="Solapur">Akluj, Solapur</option>
                                </select>
                            </div>
                        </div>

                        {/* Category Select */}
                        <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full">
                            <Calendar size={20} className="text-vino-accent shrink-0" />
                            <div className="w-full">
                                <label htmlFor="category-select-input" className="block text-[10px] font-bold uppercase tracking-wider text-vino-dark/50">Category</label>
                                <select
                                    id="category-select-input"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full text-sm font-semibold text-vino-darker bg-transparent focus:outline-none cursor-pointer"
                                >
                                    {EXPERIENCE_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Search Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-auto px-7 py-3.5 bg-vino-accent hover:bg-vino-accent-light text-white font-semibold text-sm rounded-2xl sm:rounded-full flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(139,30,63,0.35)] transition-colors duration-300 shrink-0"
                        >
                            <Search size={18} />
                            <span>Explore</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
