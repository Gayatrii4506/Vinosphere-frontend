'use client'

import React, { useState, useMemo } from 'react'
import { Calendar, Award, Compass } from 'lucide-react'
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
    const [timelineFilter, setTimelineFilter] = useState<'all' | 'upcoming' | 'past'>('all')

    // Modal & Drawer State
    const [activeExperience, setActiveExperience] = useState<VinoSphereExperience | null>(null)
    const [bookingExperience, setBookingExperience] = useState<VinoSphereExperience | null>(null)
    const [bookingGuestsCount, setBookingGuestsCount] = useState<number>(2)

    // Quick counts
    const upcomingCount = useMemo(() => {
        return initialExperiences.filter(exp => exp.status !== 'past').length
    }, [initialExperiences])

    const pastCount = useMemo(() => {
        return initialExperiences.filter(exp => exp.status === 'past').length
    }, [initialExperiences])

    // Filter & Sort Logic
    const filteredExperiences = useMemo(() => {
        return initialExperiences
            .filter((exp) => {
                // Timeline status match
                if (timelineFilter === 'upcoming' && exp.status === 'past') return false
                if (timelineFilter === 'past' && exp.status !== 'past') return false

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
    }, [initialExperiences, timelineFilter, searchQuery, selectedLocation, selectedCategory, sortBy])

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
            <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Timeline Sub-Navigation Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[#E8D4A8]/60">
                    <div>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-vino-darker">
                            {timelineFilter === 'past' 
                                ? 'Estate Archive & Past Showcases' 
                                : timelineFilter === 'upcoming' 
                                    ? 'Upcoming & Live Journeys' 
                                    : 'All Estate Journeys & Events'}
                        </h2>
                        <p className="text-xs sm:text-sm text-vino-dark/60 mt-1">
                            {timelineFilter === 'past'
                                ? 'Explore verified attendee turnout, community reviews, and photographic recaps from previous gatherings.'
                                : 'Handcrafted vineyard masterclasses, harvest festivals, and sommelier dinners ready to reserve.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-2xl border border-[#E8D4A8]/70 shadow-sm shrink-0 self-start sm:self-auto">
                        <button
                            onClick={() => setTimelineFilter('all')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                timelineFilter === 'all'
                                    ? 'bg-vino-darker text-white shadow-sm'
                                    : 'text-vino-dark/70 hover:text-vino-darker hover:bg-vino-cream/50'
                            }`}
                        >
                            All ({initialExperiences.length})
                        </button>
                        <button
                            onClick={() => setTimelineFilter('upcoming')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                timelineFilter === 'upcoming'
                                    ? 'bg-vino-accent text-white shadow-sm'
                                    : 'text-vino-dark/70 hover:text-vino-accent hover:bg-vino-cream/50'
                            }`}
                        >
                            <Calendar size={13} />
                            <span>Upcoming ({upcomingCount})</span>
                        </button>
                        <button
                            onClick={() => setTimelineFilter('past')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                timelineFilter === 'past'
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'text-stone-600 hover:text-amber-700 hover:bg-amber-50/60'
                            }`}
                        >
                            <Award size={13} />
                            <span>Previous & Recaps ({pastCount})</span>
                        </button>
                    </div>
                </div>
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
                    ) : initialExperiences.length === 0 ? (
                        <div className="py-20 text-center bg-white/80 backdrop-blur-md rounded-3xl border border-[#E8D4A8]/70 p-10 max-w-lg mx-auto shadow-sm">
                            <div className="w-16 h-16 bg-vino-cream rounded-full flex items-center justify-center mx-auto mb-4 text-vino-accent border border-vino-gold/30">
                                <Compass size={28} />
                            </div>
                            <h3 className="font-serif text-2xl font-bold text-vino-darker">No Estate Journeys Scheduled Yet</h3>
                            <p className="text-xs sm:text-sm text-vino-dark/70 mt-2 max-w-md mx-auto leading-relaxed">
                                Partner wineries are currently preparing seasonal tastings, vineyard tours, and festival editions. Check back shortly, or wineries can publish new events from the Winery Dashboard.
                            </p>
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
                                    setTimelineFilter('all')
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
            {viewMode === 'grid' && initialExperiences.length > 0 && (
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
