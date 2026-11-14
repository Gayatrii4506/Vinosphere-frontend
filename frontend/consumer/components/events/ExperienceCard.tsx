'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, MapPin, Calendar, Users, Clock, ArrowRight } from 'lucide-react'
import { VinoSphereExperience } from '@/constants/events'

interface ExperienceCardProps {
    experience: VinoSphereExperience
    onSelect: (experience: VinoSphereExperience) => void
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, onSelect }) => {
    const isSpotsLow = experience.spotsLeft <= 8
    const spotsPct = Math.round(((experience.totalSpots - experience.spotsLeft) / experience.totalSpots) * 100)
    const cardImage = experience.image || (experience as any).imageUrl || (experience as any).image_url || 'https://images.unsplash.com/photo-1543418219-44e2bf85a630?w=800&q=80'

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            whileHover={{ y: -5, boxShadow: '0 16px 36px rgba(44,24,16,0.1)' }}
            transition={{ duration: 0.28 }}
            onClick={() => onSelect(experience)}
            className="group cursor-pointer bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-[#EDE5D8] shadow-[0_2px_16px_rgba(44,24,16,0.04)] flex flex-col h-full transition-all duration-300 relative focus-within:ring-2 focus-within:ring-[#8B1E3F]"
        >
            {/* Image Header */}
            <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-[#1A0810]">
                <Image
                    src={cardImage}
                    alt={experience.title || 'Estate Experience'}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                {/* Top Row: Category Badge & Status */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                    <div className="flex gap-1.5 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full bg-[#8B1E3F]/95 text-white text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shadow-sm backdrop-blur-md">
                            {experience.category}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shadow-sm border ${
                            experience.status === 'past' || experience.experienceStatus === 'past'
                                ? 'bg-stone-900/90 text-amber-300 border-amber-500/40'
                                : experience.bookingStatus === 'Sold Out' || (experience.spotsLeft !== undefined && experience.spotsLeft <= 0)
                                    ? 'bg-rose-950/90 text-rose-200 border-rose-500/40'
                                    : experience.bookingStatus === 'Closed'
                                        ? 'bg-stone-800 text-stone-300 border-stone-600'
                                        : experience.experienceStatus === 'upcoming' || experience.bookingStatus === 'Coming Soon'
                                            ? 'bg-indigo-900/90 text-indigo-200 border-indigo-400/50'
                                            : experience.status === 'ongoing'
                                                ? 'bg-amber-800/90 text-amber-200 border-amber-400/50'
                                                : experience.type === 'event' 
                                                    ? 'bg-[#8B1E3F] text-white border-white/20' 
                                                    : 'bg-white/95 text-[#8B1E3F] border-[#E8D4A8]/80'
                        }`}>
                            {experience.status === 'past' || experience.experienceStatus === 'past'
                                ? (experience.type === 'event' ? 'Past Event' : 'Past Journey')
                                : experience.bookingStatus === 'Sold Out' || (experience.spotsLeft !== undefined && experience.spotsLeft <= 0)
                                    ? 'Sold Out'
                                    : experience.bookingStatus === 'Closed'
                                        ? 'Closed'
                                        : experience.status === 'ongoing'
                                            ? 'Ongoing'
                                            : experience.experienceStatus === 'upcoming' || experience.bookingStatus === 'Coming Soon'
                                                ? 'Coming Soon'
                                                : (experience.type === 'event' ? 'Event' : 'Journey')}
                        </span>
                    </div>

                    {experience.badge ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#C89B3C] text-[#1A0A10] text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shadow-sm">
                            {experience.badge}
                        </span>
                    ) : experience.bookingStatus === 'Sold Out' || (experience.spotsLeft !== undefined && experience.spotsLeft <= 0) ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                            Sold Out
                        </span>
                    ) : experience.bookingStatus === 'Closed' ? (
                        <span className="px-2.5 py-1 rounded-full bg-stone-700 text-stone-200 text-[10px] font-bold tracking-wider uppercase shadow-sm">
                            Closed
                        </span>
                    ) : experience.experienceStatus === 'upcoming' || experience.bookingStatus === 'Coming Soon' ? (
                        <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                            Preview Only
                        </span>
                    ) : experience.status === 'past' || experience.experienceStatus === 'past' ? (
                        <span className="px-2.5 py-1 rounded-full bg-stone-900/80 text-stone-200 border border-stone-700 text-[10px] font-bold tracking-wider uppercase shadow-sm">
                            Concluded
                        </span>
                    ) : null}
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white z-10">
                    <div className="flex items-center gap-1.5 text-xs bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15">
                        <Calendar size={12} className="text-[#C89B3C]" />
                        <span className="font-medium text-[11px] sm:text-xs">{experience.date}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold bg-white/95 text-[#1A0A10] backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm">
                        <Star size={12} className="fill-[#C89B3C] text-[#C89B3C]" />
                        <span className="text-[11px] sm:text-xs">{experience.rating}</span>
                        <span className="text-[#8B6E5A] font-normal text-[10px]">({experience.reviewCount})</span>
                    </div>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 sm:gap-4">
                <div>
                    {/* Location & Winery */}
                    <div className="flex items-center gap-1.5 text-xs text-[#8B6E5A] font-medium mb-1.5">
                        <MapPin size={12} className="text-[#8B1E3F] shrink-0" />
                        <span className="line-clamp-1">{experience.winery} &bull; {experience.region}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A0A10] group-hover:text-[#8B1E3F] transition-colors duration-300 leading-snug line-clamp-2">
                        {experience.title}
                    </h3>

                    {/* Tagline / Short Description */}
                    <p className="text-xs text-[#6B5546] mt-1.5 line-clamp-2 leading-relaxed">
                        {experience.shortDescription || experience.tagline}
                    </p>
                </div>

                {/* Duration & Availability Progress Bar */}
                <div className="pt-2.5 border-t border-[#F2ECE1]">
                    <div className="flex items-center justify-between text-xs text-[#8B6E5A] mb-2">
                        <div className="flex items-center gap-1">
                            <Clock size={12} className="text-[#8B1E3F]" />
                            <span className="text-[11px]">{experience.duration}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <Users size={12} className="text-[#8B1E3F]" />
                            <span className={`text-[11px] ${
                                experience.status === 'past' || experience.experienceStatus === 'past' 
                                    ? 'text-stone-800 font-bold' 
                                    : experience.bookingStatus === 'Sold Out' || (experience.spotsLeft !== undefined && experience.spotsLeft <= 0)
                                    ? 'text-rose-600 font-bold'
                                    : experience.experienceStatus === 'upcoming' || experience.bookingStatus === 'Coming Soon'
                                    ? 'text-indigo-600 font-bold'
                                    : (isSpotsLow ? 'text-rose-600 font-bold' : 'text-[#6B5546]')
                            }`}>
                                {experience.status === 'past' || experience.experienceStatus === 'past'
                                    ? `${experience.turnoutCount || 180} Guests Hosted` 
                                    : experience.bookingStatus === 'Sold Out' || (experience.spotsLeft !== undefined && experience.spotsLeft <= 0)
                                    ? 'Sold Out (0 spots)'
                                    : experience.bookingStatus === 'Closed'
                                    ? 'Closed'
                                    : experience.experienceStatus === 'upcoming' || experience.bookingStatus === 'Coming Soon'
                                    ? `Max ${experience.maxGuestsPerSlot || experience.totalSpots || 15}/slot`
                                    : `${experience.spotsLeft} spots left`}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#FAF7F2] border border-[#E8DDD0]/50 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                experience.status === 'past' || experience.experienceStatus === 'past' 
                                    ? 'bg-amber-500' 
                                    : experience.bookingStatus === 'Sold Out' || (experience.spotsLeft !== undefined && experience.spotsLeft <= 0)
                                    ? 'bg-rose-500'
                                    : experience.experienceStatus === 'upcoming' || experience.bookingStatus === 'Coming Soon'
                                    ? 'bg-indigo-500'
                                    : (isSpotsLow ? 'bg-rose-500' : 'bg-[#C89B3C]')
                            }`}
                            style={{ width: `${experience.status === 'past' || experience.experienceStatus === 'past' ? 100 : spotsPct}%` }}
                        />
                    </div>
                </div>

                {/* Price & CTA Button */}
                <div className="flex items-center justify-between pt-1.5">
                    <div>
                        <span className="text-[10px] text-[#A08070] uppercase tracking-wider font-semibold block">
                            {experience.status === 'past' || experience.experienceStatus === 'past' 
                                ? 'Past Edition' 
                                : experience.experienceStatus === 'upcoming' || experience.bookingStatus === 'Coming Soon'
                                ? 'Estimated Fare'
                                : 'Price per guest'}
                        </span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xl sm:text-2xl font-serif font-bold text-[#1A0A10]">
                                {experience.currency}{experience.price.toLocaleString()}
                            </span>
                            {experience.originalPrice && (
                                <span className="text-xs text-[#A08070] line-through">
                                    {experience.currency}{experience.originalPrice.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>

                    {experience.status === 'past' || experience.experienceStatus === 'past' ? (
                        <div className="px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs group-hover:bg-amber-700 group-hover:text-white group-hover:border-amber-700 transition-all duration-300 flex items-center gap-1.5 shadow-sm">
                            <span>View Showcase</span>
                            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    ) : experience.bookingStatus === 'Sold Out' || (experience.spotsLeft !== undefined && experience.spotsLeft <= 0) ? (
                        <div className="px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 flex items-center gap-1.5 shadow-sm">
                            <span>Sold Out</span>
                            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    ) : experience.bookingStatus === 'Closed' ? (
                        <div className="px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 font-bold text-xs group-hover:bg-stone-700 group-hover:text-white transition-all duration-300 flex items-center gap-1.5 shadow-sm">
                            <span>Closed</span>
                            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    ) : experience.experienceStatus === 'upcoming' || experience.bookingStatus === 'Coming Soon' ? (
                        <div className="px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300 flex items-center gap-1.5 shadow-sm">
                            <span>Coming Soon</span>
                            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    ) : (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FAF7F2] border border-[#E8DDD0] flex items-center justify-center text-[#8B1E3F] group-hover:bg-[#8B1E3F] group-hover:text-white group-hover:border-[#8B1E3F] transition-all duration-300 shadow-sm">
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    )}
                </div>
            </div>
        </motion.article>
    )
}
