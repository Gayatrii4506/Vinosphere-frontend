'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    UtensilsCrossed,
    BookOpen,
    ArrowRight,
} from 'lucide-react'
import { images } from '@/constants/images'

// ─── Animation variants ───────────────────────────────────────────────────────

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
}

const fadeRight = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
}

// ─── Main section ─────────────────────────────────────────────────────────────

export const VinoExperience: React.FC = () => {
    return (
        <section
            className="relative w-full overflow-hidden bg-[#eeeef0] h-[520px] sm:h-[550px] lg:h-[580px] flex items-center justify-center py-3 sm:py-5"
            aria-labelledby="vino-experience-heading"
        >
            {/* ── 3D HD Background Image ── */}
            <Image
                src={images.experience.background}
                alt="VinoSphere Experience"
                fill
                priority
                unoptimized
                className="object-fill pointer-events-none"
            />

            {/* ── Overlaid Content (Shifted higher & made larger) ── */}
            <div className="relative z-10 w-full max-w-xl lg:max-w-2xl mx-auto px-4 lg:ml-auto lg:mr-8 xl:mr-16 -mt-3 sm:-mt-6">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex flex-col items-center lg:items-start text-center lg:text-left gap-3 sm:gap-4"
                >
                    {/* Eyebrow - Larger & Dark Pink / Burgundy (text-vino-accent) */}
                    <motion.div variants={fadeRight} className="flex items-center justify-center lg:justify-start gap-3">
                        <div className="h-[2px] w-8 sm:w-12 bg-vino-accent" />
                        <span className="text-sm sm:text-base lg:text-lg tracking-[0.25em] uppercase font-extrabold text-vino-accent">
                            The VinoSphere Experience
                        </span>
                        <div className="h-[2px] w-8 sm:w-12 bg-vino-accent hidden lg:block" />
                    </motion.div>

                    {/* Main Heading - Larger & Bolder */}
                    <motion.h2
                        id="vino-experience-heading"
                        variants={fadeRight}
                        className="font-serif font-bold text-[#1e1610] text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-tight max-w-xl"
                    >
                        More Than Wine. A Journey of Discovery.
                    </motion.h2>

                    {/* ── Two Featured Cards with Dark Burgundy Border & Visible Soft Pink Interior ── */}
                    <motion.div
                        variants={stagger}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full text-left pt-1"
                    >
                        {/* Box 1: Food Pairing Recommendations */}
                        <motion.div
                            variants={fadeUp}
                            whileHover={{ y: -3, boxShadow: '0 16px 36px rgba(139,30,63,0.2)' }}
                            transition={{ duration: 0.2 }}
                            className="
                                group flex flex-col justify-between gap-2 sm:gap-2.5
                                rounded-xl p-3.5 sm:p-4.5
                                bg-[#f9dbe1]/95 hover:bg-[#f5cad4]
                                backdrop-blur-md
                                border border-vino-accent/80 hover:border-vino-accent
                                shadow-[0_8px_24px_rgba(139,30,63,0.12)]
                                transition-all duration-300
                            "
                        >
                            <div className="flex flex-col gap-1.5 sm:gap-2">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-vino-accent text-white group-hover:bg-vino-accent-light transition-colors duration-300 shadow-sm">
                                    <UtensilsCrossed size={16} />
                                </div>

                                <h3 className="font-serif font-bold text-[#1e1610] text-sm sm:text-base leading-snug">
                                    Food Pairing Recommendations
                                </h3>

                                <p className="text-stone-700 text-xs sm:text-xs leading-relaxed font-normal">
                                    Discover intelligent culinary pairings expertly matched to elevate every bottle in your cellar.
                                </p>
                            </div>

                            <Link
                                href="/food-pairing"
                                className="inline-flex items-center gap-1.5 text-vino-accent hover:text-vino-accent-light text-xs font-bold tracking-wide transition-colors pt-1"
                            >
                                Explore Pairings
                                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                        </motion.div>

                        {/* Box 2: Explore Wines Catalog */}
                        <motion.div
                            variants={fadeUp}
                            whileHover={{ y: -3, boxShadow: '0 16px 36px rgba(139,30,63,0.2)' }}
                            transition={{ duration: 0.2 }}
                            className="
                                group flex flex-col justify-between gap-2 sm:gap-2.5
                                rounded-xl p-3.5 sm:p-4.5
                                bg-[#f9dbe1]/95 hover:bg-[#f5cad4]
                                backdrop-blur-md
                                border border-vino-accent/80 hover:border-vino-accent
                                shadow-[0_8px_24px_rgba(139,30,63,0.12)]
                                transition-all duration-300
                            "
                        >
                            <div className="flex flex-col gap-1.5 sm:gap-2">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-vino-accent text-white group-hover:bg-vino-accent-light transition-colors duration-300 shadow-sm">
                                    <BookOpen size={16} />
                                </div>

                                <h3 className="font-serif font-bold text-[#1e1610] text-sm sm:text-base leading-snug">
                                    Explore Wines Catalog
                                </h3>

                                <p className="text-stone-700 text-xs sm:text-xs leading-relaxed font-normal">
                                    Hand-selected bottles, estate reserves, and rare vintages curated from the world&apos;s finest estates.
                                </p>
                            </div>

                            <Link
                                href="/discover"
                                className="inline-flex items-center gap-1.5 text-vino-accent hover:text-vino-accent-light text-xs font-bold tracking-wide transition-colors pt-1"
                            >
                                Browse Catalog
                                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* CTA button */}
                    <motion.div variants={fadeRight} className="pt-1 sm:pt-2">
                        <Link
                            href="/discover"
                            className="
                                group inline-flex items-center gap-2
                                bg-vino-accent hover:bg-vino-accent-light
                                text-white font-semibold text-xs sm:text-sm tracking-wide
                                px-6 sm:px-7 py-2.5 sm:py-3 rounded-full
                                shadow-[0_5px_18px_rgba(139,30,63,0.3)]
                                hover:shadow-[0_8px_24px_rgba(139,30,63,0.4)]
                                hover:scale-[1.03] active:scale-[0.98]
                                transition-all duration-300
                                focus-visible:outline-none focus-visible:ring-2
                                focus-visible:ring-vino-accent
                            "
                        >
                            Begin Your Wine Journey
                            <ArrowRight
                                size={15}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </Link>
                    </motion.div>

                </motion.div>
            </div>
        </section>
    )
}
