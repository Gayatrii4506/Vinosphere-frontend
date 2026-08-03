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

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(44,24,16,0.12)' }}
            transition={{ duration: 0.3 }}
            onClick={() => onSelect(experience)}
            className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-[#E8D4A8]/60 shadow-[0_4px_24px_rgba(44,24,16,0.04)] flex flex-col h-full transition-all duration-300 relative"
        >
            {/* Image Header */}
            <div className="relative h-60 w-full overflow-hidden bg-[#1A0810]">
                <Image
                    src={experience.image}
                    alt={experience.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Top Row: Category Badge & Wishlist/Status */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="px-3 py-1 rounded-full bg-vino-accent text-white text-[11px] font-bold tracking-wider uppercase shadow-md backdrop-blur-md">
                        {experience.category}
                    </span>

                    {experience.badge && (
                        <span className="px-3 py-1 rounded-full bg-vino-gold text-vino-darker text-[11px] font-bold tracking-wider uppercase shadow-md">
                            {experience.badge}
                        </span>
                    )}
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white z-10">
                    <div className="flex items-center gap-1.5 text-xs bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                        <Calendar size={13} className="text-vino-gold" />
                        <span className="font-medium">{experience.date}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold bg-white/90 text-vino-darker backdrop-blur-md px-2.5 py-1 rounded-lg">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span>{experience.rating}</span>
                        <span className="text-vino-dark/40 font-normal">({experience.reviewCount})</span>
                    </div>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                <div>
                    {/* Location & Winery */}
                    <div className="flex items-center gap-1.5 text-xs text-vino-dark/60 font-medium mb-1.5">
                        <MapPin size={13} className="text-vino-accent shrink-0" />
                        <span>{experience.winery} &bull; {experience.region}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-xl font-bold text-vino-darker group-hover:text-vino-accent transition-colors duration-300 leading-snug line-clamp-2">
                        {experience.title}
                    </h3>

                    {/* Tagline */}
                    <p className="text-xs text-vino-dark/70 mt-2 line-clamp-2 leading-relaxed">
                        {experience.tagline}
                    </p>
                </div>

                {/* Duration & Availability Progress Bar */}
                <div className="pt-3 border-t border-vino-dark/10">
                    <div className="flex items-center justify-between text-xs text-vino-dark/70 mb-2">
                        <div className="flex items-center gap-1">
                            <Clock size={13} className="text-vino-accent" />
                            <span>{experience.duration}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <Users size={13} className="text-vino-accent" />
                            <span className={isSpotsLow ? 'text-rose-600 font-bold' : ''}>
                                {experience.spotsLeft} spots left
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-vino-dark/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isSpotsLow ? 'bg-rose-500' : 'bg-vino-gold'}`}
                            style={{ width: `${spotsPct}%` }}
                        />
                    </div>
                </div>

                {/* Price & CTA Button */}
                <div className="flex items-center justify-between pt-2">
                    <div>
                        <span className="text-[10px] text-vino-dark/50 uppercase tracking-widest font-semibold block">Price per guest</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-serif font-bold text-vino-darker">
                                {experience.currency}{experience.price.toLocaleString()}
                            </span>
                            {experience.originalPrice && (
                                <span className="text-xs text-vino-dark/40 line-through">
                                    {experience.currency}{experience.originalPrice.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-vino-cream flex items-center justify-center text-vino-accent group-hover:bg-vino-accent group-hover:text-white transition-all duration-300 shadow-sm">
                        <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </div>
        </motion.article>
    )
}
