'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles, Calendar, ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { VinoSphereExperience } from '@/constants/events'

interface FeaturedCarouselProps {
    experiences: VinoSphereExperience[]
    onSelect: (experience: VinoSphereExperience) => void
}

export const FeaturedExperiencesCarousel: React.FC<FeaturedCarouselProps> = ({
    experiences,
    onSelect,
}) => {
    const scrollTrackRef = useRef<HTMLDivElement>(null)
    const featuredList = experiences.filter(
        (exp) => exp.badge === 'Best Seller' || exp.badge === 'Exclusive' || exp.badge === 'Reserve Collection' || exp.badge === 'Featured'
    )

    const scrollLeft = () => {
        if (scrollTrackRef.current) {
            scrollTrackRef.current.scrollBy({ left: -420, behavior: 'smooth' })
        }
    }

    const scrollRight = () => {
        if (scrollTrackRef.current) {
            scrollTrackRef.current.scrollBy({ left: 420, behavior: 'smooth' })
        }
    }

    return (
        <section className="py-14 bg-gradient-to-b from-vino-cream to-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                
                {/* Header with Navigation Arrow Controls */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-vino-accent text-xs font-bold uppercase tracking-widest mb-1.5">
                            <Sparkles size={14} />
                            <span>VinoSphere Reserve Collection</span>
                        </div>
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-vino-darker">
                            Featured Masterclasses & Galas
                        </h2>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <p className="text-xs text-vino-dark/60 max-w-xs hidden md:block">
                            Handpicked signature experiences hosted by master winemakers.
                        </p>

                        {/* Navigation Arrow Buttons */}
                        <div className="flex items-center gap-3 shrink-0">
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                onClick={scrollLeft}
                                className="w-12 h-12 rounded-full bg-white border border-[#E8D4A8]/80 text-vino-darker shadow-md hover:bg-vino-accent hover:text-white hover:border-vino-accent transition-all duration-300 flex items-center justify-center group"
                                aria-label="Previous Slide"
                            >
                                <ChevronLeft size={24} className="stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                onClick={scrollRight}
                                className="w-12 h-12 rounded-full bg-white border border-[#E8D4A8]/80 text-vino-darker shadow-md hover:bg-vino-accent hover:text-white hover:border-vino-accent transition-all duration-300 flex items-center justify-center group"
                                aria-label="Next Slide"
                            >
                                <ChevronRight size={24} className="stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Carousel Container with Side Flanking Navigation Arrows */}
                <div className="relative group/carousel">
                    
                    {/* Left Flanking Arrow (Overlay on Large Screens) */}
                    <button
                        onClick={scrollLeft}
                        className="hidden lg:flex absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border border-[#E8D4A8] text-vino-darker shadow-xl hover:bg-vino-accent hover:text-white hover:scale-110 transition-all duration-300 items-center justify-center opacity-0 group-hover/carousel:opacity-100"
                        aria-label="Scroll Left"
                    >
                        <ChevronLeft size={26} className="stroke-[2.5]" />
                    </button>

                    {/* Right Flanking Arrow (Overlay on Large Screens) */}
                    <button
                        onClick={scrollRight}
                        className="hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md border border-[#E8D4A8] text-vino-darker shadow-xl hover:bg-vino-accent hover:text-white hover:scale-110 transition-all duration-300 items-center justify-center opacity-0 group-hover/carousel:opacity-100"
                        aria-label="Scroll Right"
                    >
                        <ChevronRight size={26} className="stroke-[2.5]" />
                    </button>

                    {/* Horizontal Scroll Track */}
                    <div
                        ref={scrollTrackRef}
                        className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-none scroll-smooth"
                    >
                        {featuredList.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ y: -6 }}
                                onClick={() => onSelect(item)}
                                className="snap-start shrink-0 w-[300px] sm:w-[360px] bg-white rounded-3xl overflow-hidden border border-[#E8D4A8]/70 shadow-[0_8px_30px_rgba(44,24,16,0.06)] cursor-pointer group flex flex-col justify-between"
                            >
                                {/* Image Header */}
                                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#1A0810]">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                                        <span className="px-3 py-1 rounded-full bg-vino-gold text-vino-darker text-[10px] font-bold tracking-wider uppercase shadow-md">
                                            {item.badge}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white z-10">
                                        <span className="text-xs font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                                            {item.winery}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs font-semibold bg-white/90 text-vino-darker px-2 py-0.5 rounded-md">
                                            <Star size={12} className="fill-amber-400 text-amber-400" />
                                            <span>{item.rating}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-vino-darker group-hover:text-vino-accent transition-colors leading-snug">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-vino-dark/70 mt-2 line-clamp-2 leading-relaxed">
                                            {item.tagline}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-vino-dark/10">
                                        <div className="flex items-center gap-1.5 text-xs text-vino-dark/60 font-medium">
                                            <Calendar size={13} className="text-vino-accent" />
                                            <span>{item.date}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="font-serif font-bold text-lg text-vino-darker">
                                                {item.currency}{item.price.toLocaleString()}
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-vino-cream flex items-center justify-center text-vino-accent group-hover:bg-vino-accent group-hover:text-white transition-colors">
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    )
}
