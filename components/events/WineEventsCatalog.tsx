'use client'

import React, { useState, useMemo } from 'react'
import { VinoSphereExperience } from '@/constants/events'
import { ExperienceHero } from './ExperienceHero'
import { FeaturedExperiencesCarousel } from './FeaturedExperiencesCarousel'
import { ExperienceFilterBar } from './ExperienceFilterBar'
import { ExperienceCard } from './ExperienceCard'
import { ExperienceDetailDrawer } from './ExperienceDetailDrawer'
import { InteractiveExperienceMap } from './InteractiveExperienceMap'
import { BookingModal } from './BookingModal'
import { CustomerReviewsSection } from './CustomerReviewsSection'

interface WineEventsCatalogProps {
    initialExperiences: VinoSphereExperience[]
}

export const WineEventsCatalog: React.FC<WineEventsCatalogProps> = ({
    initialExperiences,
}) => {
    // Filter & Search state
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [selectedLocation, setSelectedLocation] = useState<string>('All Locations')
    const [selectedCategory, setSelectedCategory] = useState<string>('All Experiences')
    const [sortBy, setSortBy] = useState<string>('Upcoming Date')
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')

    // Modal & Drawer State
    const [activeExperience, setActiveExperience] = useState<VinoSphereExperience | null>(null)
    const [bookingExperience, setBookingExperience] = useState<VinoSphereExperience | null>(null)
    const [bookingGuestsCount, setBookingGuestsCount] = useState<number>(2)

    // Filter & Sort Logic
    const filteredExperiences = useMemo(() => {
        return initialExperiences
            .filter((exp) => {
                // Search query match
                if (searchQuery.trim() !== '') {
                    const q = searchQuery.toLowerCase()
                    const matchTitle = exp.title.toLowerCase().includes(q)
                    const matchWinery = exp.winery.toLowerCase().includes(q)
                    const matchTagline = exp.tagline.toLowerCase().includes(q)
                    if (!matchTitle && !matchWinery && !matchTagline) return false
                }

                // Location match
                if (selectedLocation !== 'All Locations') {
                    if (!exp.region.toLowerCase().includes(selectedLocation.toLowerCase())) {
                        return false
                    }
                }

                // Category match
                if (selectedCategory !== 'All Experiences') {
                    if (exp.category !== selectedCategory) {
                        return false
                    }
                }

                return true
            })
            .sort((a, b) => {
                if (sortBy === 'Price: Low to High') return a.price - b.price
                if (sortBy === 'Rating: High to Low') return b.rating - a.rating
                return 0 // default upcoming
            })
    }, [initialExperiences, searchQuery, selectedLocation, selectedCategory, sortBy])

    const handleOpenBooking = (exp: VinoSphereExperience, guests: number) => {
        setActiveExperience(null)
        setBookingExperience(exp)
        setBookingGuestsCount(guests)
    }

    return (
        <div className="bg-vino-cream min-h-screen">
            {/* 1. Hero Section */}
            <ExperienceHero
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />

            {/* 2. Sticky Category & Filter Bar (Positioned directly below Hero) */}
            <ExperienceFilterBar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
                viewMode={viewMode}
                setViewMode={setViewMode}
                totalResults={filteredExperiences.length}
            />

            {/* 3. Featured Experiences Carousel */}
            <FeaturedExperiencesCarousel
                experiences={initialExperiences}
                onSelect={(exp) => setActiveExperience(exp)}
            />

            {/* 4. Main Section: Grid View OR Split Map View */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {viewMode === 'grid' ? (
                    filteredExperiences.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredExperiences.map((exp) => (
                                <ExperienceCard
                                    key={exp.id}
                                    experience={exp}
                                    onSelect={(selected) => setActiveExperience(selected)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-white rounded-3xl border border-vino-dark/10 p-8 max-w-lg mx-auto">
                            <h3 className="font-serif text-xl font-bold text-vino-darker">No experiences found</h3>
                            <p className="text-xs text-vino-dark/60 mt-2">
                                Try clearing your search query or selecting a different location filter.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('')
                                    setSelectedLocation('All Locations')
                                    setSelectedCategory('All Experiences')
                                }}
                                className="mt-4 px-4 py-2 bg-vino-accent text-white text-xs font-semibold rounded-xl hover:bg-vino-accent-light transition-colors"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    )
                ) : (
                    /* Map Mode Split View */
                    <InteractiveExperienceMap
                        experiences={filteredExperiences}
                        onSelect={(exp) => setActiveExperience(exp)}
                    />
                )}
            </section>

            {/* 5. Terroir Location Map Banner */}
            {viewMode === 'grid' && (
                <InteractiveExperienceMap
                    experiences={initialExperiences}
                    onSelect={(exp) => setActiveExperience(exp)}
                />
            )}

            {/* 6. Customer Testimonials */}
            <CustomerReviewsSection />

            {/* 7. Slide-over Right Drawer (Sheet) */}
            <ExperienceDetailDrawer
                experience={activeExperience}
                onClose={() => setActiveExperience(null)}
                onOpenBooking={handleOpenBooking}
            />

            {/* 8. Booking Modal Window */}
            <BookingModal
                experience={bookingExperience}
                initialGuests={bookingGuestsCount}
                onClose={() => setBookingExperience(null)}
            />
        </div>
    )
}
