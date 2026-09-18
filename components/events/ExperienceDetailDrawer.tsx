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

                            <div className="flex items-center gap-4 mt-3 text-xs sm:text-sm text-vino-dark/70 font-medium">
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
                            </div>
                        </div>

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
                                                Hosted by {experience.host.name}
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
                                                <h4 className="font-serif font-bold text-vino-darker text-sm">{step.title}</h4>
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

                        {/* Featured Wines List */}
                        {experience.type === 'experience' && experience.featuredWines && experience.featuredWines.length > 0 && (
                            <div>
                                <h3 className="font-serif text-lg font-bold text-vino-darker mb-3">Featured Vintages Served</h3>
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

                    {/* Fixed Bottom Booking Bar */}
                    <div className="absolute bottom-0 inset-x-0 bg-white border-t border-vino-dark/10 p-4 sm:p-5 flex items-center justify-between z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
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
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
