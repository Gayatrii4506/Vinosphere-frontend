'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Star,
    MapPin,
    Calendar,
    Clock,
    Users,
    CheckCircle2,
    Wine,
    Utensils,
    Gift,
    Car,
    FileText,
    Award,
    Music,
    Bike,
    ShieldCheck,
    Share2,
    Ticket,
    XCircle,
    Info,
    AlertCircle,
} from 'lucide-react'
import { VinoSphereExperience } from '@/constants/events'
import { useAnalytics } from '@/hooks/useAnalytics'

interface ExperienceDetailDrawerProps {
    experience: VinoSphereExperience | null
    onClose: () => void
    onOpenBooking: (experience: VinoSphereExperience, guests: number) => void
}

export const ExperienceDetailDrawer: React.FC<ExperienceDetailDrawerProps> = ({
    experience,
    onClose,
    onOpenBooking,
}) => {
    const [selectedImage, setSelectedImage] = useState<string>('')
    const [guests, setGuests] = useState<number>(2)
    const { trackEvent } = useAnalytics()

    useEffect(() => {
        if (experience?.id) {
            trackEvent('event_view', { entity_id: experience.id, winery_id: experience.wineryId })
        }
    }, [experience?.id, experience?.wineryId, trackEvent])

    useEffect(() => {
        if (!experience) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            document.body.style.overflow = 'unset'
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [experience, onClose])

    if (!experience) return null

    const activeImage = selectedImage || experience.image
    const totalPrice = experience.price * guests

    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case 'Wine': return <Wine size={16} className="text-vino-accent shrink-0" />
            case 'Utensils': return <Utensils size={16} className="text-vino-accent shrink-0" />
            case 'Gift': return <Gift size={16} className="text-vino-accent shrink-0" />
            case 'Car': return <Car size={16} className="text-vino-accent shrink-0" />
            case 'FileText': return <FileText size={16} className="text-vino-accent shrink-0" />
            case 'Award': return <Award size={16} className="text-vino-accent shrink-0" />
            case 'Music': return <Music size={16} className="text-vino-accent shrink-0" />
            case 'Bike': return <Bike size={16} className="text-vino-accent shrink-0" />
            default: return <Wine size={16} className="text-vino-accent shrink-0" />
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-hidden">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Right Slide-Over Panel */}
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                    className="absolute inset-y-0 right-0 max-w-full lg:max-w-2xl w-full bg-white shadow-2xl flex flex-col z-10"
                >
                    {/* Top Sticky Bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-vino-dark/10 bg-white/90 backdrop-blur-md sticky top-0 z-20">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-vino-accent text-white text-xs font-bold uppercase tracking-wider">
                                {experience.category}
                            </span>
                            {experience.badge && (
                                <span className="px-3 py-1 rounded-full bg-vino-gold text-vino-darker text-xs font-bold uppercase tracking-wider">
                                    {experience.badge}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({ title: experience.title, url: window.location.href })
                                    } else {
                                        navigator.clipboard.writeText(window.location.href)
                                        alert('Link copied to clipboard!')
                                    }
                                }}
                                className="p-2 rounded-full text-vino-dark/60 hover:text-vino-dark hover:bg-vino-cream transition-colors"
                                title="Share Experience"
                            >
                                <Share2 size={18} />
                            </button>

                            <button
                                onClick={onClose}
                                className="p-2 rounded-full text-vino-dark/60 hover:text-vino-dark hover:bg-vino-cream transition-colors"
                            >
                                <X size={22} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
                        
                        {/* Multi-Image Gallery Showcase */}
                        <div>
                            <div className="relative h-72 sm:h-80 w-full rounded-3xl overflow-hidden mb-3 bg-[#1A0810] shadow-md">
                                <Image
                                    src={activeImage}
                                    alt={experience.title}
                                    fill
                                    className="object-cover transition-all duration-500"
                                />
                            </div>

                            {/* Gallery Thumbnails */}
                            <div className="flex gap-3 overflow-x-auto pb-1">
                                {experience.gallery.map((imgUrl, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(imgUrl)}
                                        className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                                            activeImage === imgUrl ? 'border-vino-accent scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <Image src={imgUrl} alt="Thumbnail" fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title & Metadata Header */}
                        <div>
                            <div className="flex items-center gap-2 text-xs text-vino-dark/60 font-medium mb-1">
                                <MapPin size={14} className="text-vino-accent" />
                                <span>{experience.winery} &bull; {experience.location}</span>
                            </div>

                            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-vino-darker leading-snug">
                                {experience.title}
                            </h2>

                            {/* Short Description (Teaser) */}
                            {experience.shortDescription && (
                                <p className="text-sm font-medium text-vino-dark/80 italic mt-2.5 border-l-2 border-vino-accent pl-3.5 leading-relaxed bg-vino-cream/20 py-1 rounded-r-lg">
                                    &ldquo;{experience.shortDescription}&rdquo;
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3.5 text-xs sm:text-sm text-vino-dark/70 font-medium">
                                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200">
                                    <Star size={14} className="fill-amber-400 text-amber-400" />
                                    <span className="font-bold">{experience.rating}</span>
                                    <span className="text-amber-800/60">({experience.reviewCount} reviews)</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Clock size={14} className="text-vino-accent" />
                                    <span>{experience.duration}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Calendar size={14} className="text-vino-accent" />
                                    <span>{experience.date}</span>
                                </div>

                                {experience.time && experience.time !== 'Select Time Slot' && (
                                    <div className="flex items-center gap-1 text-vino-accent font-semibold">
                                        <Clock size={14} />
                                        <span>{experience.time}</span>
                                    </div>
                                )}
                            </div>

                            {experience.bookingDeadline && (
                                <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 mt-3">
                                    <Clock size={14} className="text-amber-700 shrink-0" />
                                    <span>Registration Deadline: <strong>{new Date(experience.bookingDeadline).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</strong></span>
                                </div>
                            )}
                        </div>

                        {/* Past Edition Showcase Callout */}
                        {(experience.status === 'past' || experience.experienceStatus === 'past') && (
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                                <div className="flex items-center justify-between font-bold text-amber-950">
                                    <span className="flex items-center gap-1.5">
                                        <Award size={16} className="text-amber-700" />
                                        <span>Past Edition Showcase &bull; Concluded</span>
                                    </span>
                                    <span>👥 {experience.turnoutCount || 180} Guests Hosted</span>
                                </div>
                                {experience.editionDate && (
                                    <div className="text-[11px] font-semibold text-amber-800">
                                        Edition Date: {experience.editionDate}
                                    </div>
                                )}
                                <p className="text-stone-700 leading-relaxed">
                                    {experience.recapNotes || `This journey edition was successfully held at ${experience.winery}. Explore verified guest feedback and photos below.`}
                                </p>
                            </div>
                        )}

                        {/* Upcoming / Coming Soon Callout */}
                        {(experience.experienceStatus === 'upcoming' || experience.bookingStatus === 'Coming Soon') && (
                            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs space-y-1.5">
                                <div className="flex items-center justify-between font-bold text-indigo-950">
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={15} className="text-indigo-600" />
                                        <span>Upcoming Journey &bull; Coming Soon</span>
                                    </span>
                                    <span className="bg-indigo-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Preview Only</span>
                                </div>
                                <p className="text-indigo-900/80 leading-relaxed">
                                    This estate journey is currently in preparation and will open for reservations soon. Preview the itinerary, wine pairings, and schedule below.
                                </p>
                            </div>
                        )}

                        {/* Schedule & Availability Section */}
                        {(experience.timeSlots?.length || experience.availableDays?.length || experience.startDate || experience.endDate) && (
                            <div className="p-5 rounded-2xl bg-vino-cream/30 border border-vino-dark/10 space-y-3.5">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-vino-accent" />
                                    <h3 className="font-serif text-lg font-bold text-vino-darker">Schedule & Availability</h3>
                                </div>

                                {(experience.startDate || experience.endDate) && (
                                    <div className="text-xs text-vino-dark/80 font-medium flex items-center gap-1.5">
                                        <span className="font-bold text-vino-darker">Journey Season:</span>
                                        <span>{experience.startDate || 'Current Season'} &rarr; {experience.endDate || 'Ongoing'}</span>
                                    </div>
                                )}

                                {experience.availableDays && experience.availableDays.length > 0 && (
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-vino-dark/60 block mb-1.5">Available Days</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {experience.availableDays.map((day, dIdx) => (
                                                <span key={dIdx} className="px-2.5 py-1 rounded-lg bg-white border border-vino-dark/15 text-xs font-semibold text-vino-darker shadow-sm">
                                                    {day}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {experience.timeSlots && experience.timeSlots.length > 0 && (
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-vino-dark/60 block mb-1.5">Configured Time Slots</span>
                                        <div className="flex flex-wrap gap-2">
                                            {experience.timeSlots.map((slot, sIdx) => (
                                                <span key={sIdx} className="px-3 py-1.5 rounded-xl bg-white border border-vino-accent/30 text-xs font-bold text-vino-accent shadow-sm flex items-center gap-1.5">
                                                    <Clock size={12} />
                                                    <span>{slot}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {experience.maxGuestsPerSlot && (
                                    <div className="text-xs text-vino-dark/70 flex items-center gap-1.5 pt-1 border-t border-vino-dark/5">
                                        <Users size={14} className="text-vino-accent" />
                                        <span>Maximum <strong>{experience.maxGuestsPerSlot} guests</strong> hosted per departure slot</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Location & Arrival Card */}
                        {(experience.meetingPoint || experience.arrivalInstructions || experience.location) && (
                            <div className="p-5 rounded-2xl bg-vino-cream/30 border border-vino-dark/10 space-y-3">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-vino-accent" />
                                    <h3 className="font-serif text-lg font-bold text-vino-darker">Location & Arrival Details</h3>
                                </div>
                                <div className="text-xs text-vino-dark/80 space-y-2 leading-relaxed">
                                    <div>
                                        <span className="font-bold text-vino-darker block">Estate Address:</span>
                                        <span>{experience.location}</span>
                                    </div>
                                    {experience.meetingPoint && (
                                        <div>
                                            <span className="font-bold text-vino-darker block">Meeting Point on Estate:</span>
                                            <span>{experience.meetingPoint}</span>
                                        </div>
                                    )}
                                    {experience.arrivalInstructions && (
                                        <div>
                                            <span className="font-bold text-vino-darker block">Arrival Instructions:</span>
                                            <span>{experience.arrivalInstructions}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 pt-1 font-semibold text-vino-darker">
                                        <Car size={14} className="text-vino-accent" />
                                        <span>{experience.parkingAvailable !== false ? "Complimentary on-site guest parking available" : "Limited on-site parking"}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Host Bio Card */}
                        {experience.host && (
                            <div className="p-5 rounded-2xl bg-vino-cream/60 border border-[#E8D4A8]/60 flex items-start gap-4">
                                <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-vino-accent shadow-sm">
                                    <Image src={experience.host.avatar} alt={experience.host.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-vino-darker text-sm flex items-center gap-1.5">
                                                Guided by {experience.host.name}
                                                {experience.host.verified && (
                                                    <ShieldCheck size={16} className="text-vino-accent fill-vino-accent/10" />
                                                )}
                                            </h4>
                                            <p className="text-xs text-vino-dark/60 font-medium">{experience.host.title}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                                            <Star size={11} className="fill-amber-500 text-amber-500" />
                                            <span>{experience.host.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-vino-dark/80 mt-2 leading-relaxed">
                                        {experience.host.bio}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Overview & Highlights */}
                        <div className="space-y-4">
                            <h3 className="font-serif text-lg font-bold text-vino-darker">About this Experience</h3>
                            <p className="text-sm text-vino-dark/80 leading-relaxed">
                                {experience.overview}
                            </p>

                            <div className="pt-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-vino-dark/60 mb-3">Highlights</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {experience.highlights.map((highlight, index) => (
                                        <div key={index} className="flex items-start gap-2 text-xs text-vino-darker font-medium">
                                            <CheckCircle2 size={15} className="text-vino-accent shrink-0 mt-0.5" />
                                            <span>{highlight}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Experience Itinerary Timeline */}
                        {experience.type === 'event' && experience.itinerary && experience.itinerary.length > 0 && (
                            <div>
                                <h3 className="font-serif text-lg font-bold text-vino-darker mb-4">Step-by-Step Itinerary</h3>
                                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-vino-dark/10">
                                    {experience.itinerary.map((step, idx) => (
                                        <div key={idx} className="flex items-start gap-4 relative pl-2">
                                            <div className="w-4 h-4 rounded-full bg-vino-accent text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-vino-accent uppercase tracking-wider">{step.time}</span>
                                                <h4 className="font-serif font-bold text-vino-darker text-sm">{(step as any).activity || step.title}</h4>
                                                <p className="text-xs text-vino-dark/70 mt-0.5">{step.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Included Perks */}
                        <div>
                            <h3 className="font-serif text-lg font-bold text-vino-darker mb-3">What&apos;s Included</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {experience.included.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-vino-cream/40 border border-vino-dark/10">
                                        {renderIcon(item.iconName)}
                                        <span className="text-xs font-semibold text-vino-darker">{item.item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* What's Not Included */}
                        {experience.exclusions && experience.exclusions.length > 0 && (
                            <div>
                                <h3 className="font-serif text-lg font-bold text-vino-darker mb-3">What&apos;s Not Included</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {experience.exclusions.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
                                            <XCircle size={15} className="text-stone-400 shrink-0" />
                                            <span className="text-xs font-medium text-stone-600">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Featured Wines List */}
                        {experience.featuredWines && experience.featuredWines.length > 0 && (
                            <div>
                                <h3 className="font-serif text-lg font-bold text-vino-darker mb-3">Featured Vintages Poured</h3>
                                <div className="space-y-2.5">
                                    {experience.featuredWines.map((wine, idx) => (
                                        <div key={idx} className="p-3.5 rounded-2xl bg-white border border-[#E8D4A8]/70 shadow-sm flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-vino-darker text-sm">{wine.name}</h4>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-vino-accent/10 text-vino-accent">
                                                        {wine.vintage}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-vino-dark/60 mt-0.5">{wine.notes}</p>
                                            </div>
                                            <span className="text-xs font-semibold text-vino-dark/80 px-2.5 py-1 rounded-full bg-vino-cream">
                                                {wine.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Booking Policies & Age Requirements */}
                        {(experience.cancellationPolicy || experience.minAge) && (
                            <div className="p-4 rounded-2xl bg-vino-cream/30 border border-vino-dark/10 text-xs space-y-2">
                                <h4 className="font-bold text-vino-darker uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                    <ShieldCheck size={14} className="text-vino-accent" />
                                    <span>Booking & Guest Policies</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-vino-dark/80">
                                    {experience.minAge && (
                                        <div>
                                            <span className="font-bold text-vino-darker">Minimum Age: </span>
                                            <span>{experience.minAge}</span>
                                        </div>
                                    )}
                                    {experience.bookingStatus && (
                                        <div>
                                            <span className="font-bold text-vino-darker">Status: </span>
                                            <span className="font-semibold text-vino-accent">{experience.bookingStatus}</span>
                                        </div>
                                    )}
                                </div>
                                {experience.cancellationPolicy && (
                                    <p className="text-vino-dark/70 text-[11px] pt-1 border-t border-vino-dark/5 leading-relaxed">
                                        <span className="font-bold">Cancellation Policy: </span>
                                        {experience.cancellationPolicy}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Guest Reviews Section */}
                        <div>
                            <h3 className="font-serif text-lg font-bold text-vino-darker mb-3">Verified Guest Reviews</h3>
                            <div className="space-y-3">
                                {experience.reviews.map((rev) => (
                                    <div key={rev.id} className="p-4 rounded-2xl bg-vino-cream/30 border border-vino-dark/10 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                                    <Image src={rev.avatar} alt={rev.author} fill className="object-cover" />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-xs text-vino-darker">{rev.author}</h5>
                                                    <span className="text-[10px] text-vino-dark/50">{rev.date}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-0.5 text-amber-500">
                                                {Array.from({ length: rev.rating }).map((_, i) => (
                                                    <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-vino-dark/80 italic">
                                            &ldquo;{rev.comment}&rdquo;
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Fixed Bottom Booking / Archive Bar */}
                    <div className="absolute bottom-0 inset-x-0 bg-white border-t border-vino-dark/10 p-4 sm:p-5 flex items-center justify-between z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
                        {experience.status === 'past' || experience.experienceStatus === 'past' ? (
                            <>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Archive Status</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="font-serif text-lg font-bold text-stone-800">
                                            Concluded Showcase
                                        </span>
                                        <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                                            {experience.turnoutCount ? `${experience.turnoutCount} Guests Attended` : 'Concluded'}
                                        </span>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={onClose}
                                    className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm rounded-2xl flex items-center gap-2 shadow-lg transition-colors"
                                >
                                    <span>Browse Upcoming Journeys</span>
                                </motion.button>
                            </>
                        ) : experience.experienceStatus === 'upcoming' || experience.bookingStatus === 'Coming Soon' ? (
                            <>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">Booking Status</span>
                                    <div className="flex items-baseline gap-1 mt-0.5">
                                        <span className="font-serif text-xl font-bold text-indigo-950">
                                            Coming Soon
                                        </span>
                                        <span className="text-xs text-indigo-600 font-medium ml-1">
                                            ({experience.currency}{experience.price.toLocaleString()} / guest)
                                        </span>
                                    </div>
                                </div>
                                <button
                                    disabled
                                    className="px-6 py-3 bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-sm rounded-2xl flex items-center gap-2 cursor-not-allowed opacity-90"
                                >
                                    <Clock size={16} />
                                    <span>Coming Soon</span>
                                </button>
                            </>
                        ) : experience.bookingStatus === 'Sold Out' || (experience.spotsLeft !== undefined && experience.spotsLeft <= 0) ? (
                            <>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Booking Status</span>
                                    <div className="flex items-baseline gap-1 mt-0.5">
                                        <span className="font-serif text-xl font-bold text-rose-950">
                                            Sold Out
                                        </span>
                                        <span className="text-xs text-rose-600 font-medium ml-1">
                                            (All tickets allocated)
                                        </span>
                                    </div>
                                </div>
                                <button
                                    disabled
                                    className="px-6 py-3 bg-rose-100 text-rose-700 border border-rose-200 font-bold text-sm rounded-2xl flex items-center gap-2 cursor-not-allowed opacity-90"
                                >
                                    <span>Sold Out</span>
                                </button>
                            </>
                        ) : experience.bookingStatus === 'Closed' ? (
                            <>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-stone-700 tracking-wider">Booking Status</span>
                                    <div className="flex items-baseline gap-1 mt-0.5">
                                        <span className="font-serif text-xl font-bold text-stone-900">
                                            Bookings Closed
                                        </span>
                                    </div>
                                </div>
                                <button
                                    disabled
                                    className="px-6 py-3 bg-stone-100 text-stone-600 border border-stone-200 font-bold text-sm rounded-2xl flex items-center gap-2 cursor-not-allowed opacity-90"
                                >
                                    <span>Closed</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-vino-dark/50 tracking-wider">Total Amount</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-serif text-2xl font-bold text-vino-darker">
                                            {experience.currency}{totalPrice.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-vino-dark/60">({guests} {guests === 1 ? 'guest' : 'guests'})</span>
                                    </div>
                                </div>

                                {/* Guest Count Switcher */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-vino-cream rounded-xl p-1 border border-vino-dark/10">
                                        <button
                                            onClick={() => setGuests(Math.max(1, guests - 1))}
                                            className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-vino-darker hover:bg-vino-accent hover:text-white transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="px-3 text-xs font-bold text-vino-darker">{guests}</span>
                                        <button
                                            onClick={() => setGuests(Math.min(experience.spotsLeft, guests + 1))}
                                            className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-vino-darker hover:bg-vino-accent hover:text-white transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => onOpenBooking(experience, guests)}
                                        className="px-6 py-3 bg-vino-accent hover:bg-vino-accent-light text-white font-semibold text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-vino-accent/30 transition-colors"
                                    >
                                        <Ticket size={16} />
                                        <span>Reserve Ticket</span>
                                    </motion.button>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
