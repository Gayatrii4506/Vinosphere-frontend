'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { images } from '@/constants/images'

export const FeaturedCategories: React.FC = () => {
    return (
        <section
            id="featured-wines"
            className="relative w-full bg-[#FAF9F6] text-[#2D2D2D] py-6 lg:py-8 overflow-hidden flex items-center min-h-[80vh] lg:min-h-[85vh]"
        >
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

                    {/* ── Left Column: Visual Stage (Vineyard Background) ── */}
                    <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-start">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="
                                relative w-[85%] sm:w-[78%] lg:w-[82%] aspect-[3/4] sm:aspect-[4/5] max-h-[440px] lg:max-h-[480px] rounded-2xl overflow-hidden
                                shadow-xl border border-black/5
                            "
                        >
                            <Image
                                src="/images/flagship_landscape.png"
                                alt="Golden sunset vineyard rows"
                                fill
                                unoptimized
                                sizes="(max-width: 768px) 85vw, 40vw"
                                className="object-cover object-center"
                                priority
                            />
                        </motion.div>
                    </div>

                    {/* ── Right Column: Editorial Details & Specs ── */}
                    <div className="lg:col-span-6 relative flex flex-col justify-between space-y-3 sm:space-y-4 lg:pl-2 pt-6 sm:pt-8 lg:pt-10">

                        {/* Grape Vine Branch Accent (Straight, Transparent Background) */}
                        <motion.div
                            initial={{ opacity: 0, x: 15 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="absolute -top-12 sm:-top-16 lg:-top-20 -right-2 sm:-right-6 lg:-right-8 pointer-events-none z-20"
                        >
                            <div className="relative w-36 sm:w-48 md:w-52 aspect-[4/3]">
                                <Image
                                    src="/images/grape_vine_branch.png"
                                    alt="Straight grape vine branch with leaves and grapes"
                                    fill
                                    unoptimized
                                    className="object-contain object-right-top drop-shadow-sm"
                                />
                            </div>
                        </motion.div>

                        {/* Title & Headline */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="space-y-1 pr-12 sm:pr-16 lg:pr-20"
                        >
                            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#2A2A2A] leading-[1.12] tracking-tight">
                                A New Era of 
                                Wine Discovery.
                            </h2>
                        </motion.div>

                        {/* Wine Technical & Industry Metrics Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="grid grid-cols-2 gap-4 sm:gap-6 max-w-lg pt-1"
                        >
                            {/* Stat 1: Maharashtra Wine Production */}
                            <div className="space-y-0.5">
                                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#A33845] tracking-tight">
                                    90%
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-semibold text-[#7A7A7A] uppercase tracking-wider leading-snug">
                                    Maharashtra&apos;s Share of India&apos;s Wine Production
                                </div>
                            </div>

                            {/* Stat 2: Annual Wine-Tourism Visitors */}
                            <div className="space-y-0.5">
                                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#A33845] tracking-tight">
                                    3.5 LAKH+
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-semibold text-[#7A7A7A] uppercase tracking-wider leading-snug">
                                    Annual Wine-Tourism Visitors to Nashik
                                </div>
                            </div>
                        </motion.div>

                        {/* Descriptive Paragraph */}
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-md font-sans"
                        >
                            Discover India&apos;s wine ecosystem through Nashik&apos;s vineyards, wineries, wine tourism, and personalized experiences — all connected through one intelligent digital platform.
                        </motion.p>

                        {/* Bottom Actions Row: BUY NOW + EXPLORE WINERIES */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                            className="flex flex-wrap items-center gap-3 pt-2"
                        >
                            <Link
                                href="/discover/wines"
                                className="px-6 py-2.5 rounded bg-[#A33845] hover:bg-[#8B2B37] text-white text-xs font-bold tracking-[0.2em] uppercase transition-colors shadow-sm inline-block"
                            >
                                BUY NOW
                            </Link>

                            {/* Red / Burgundy Explore Wineries Pill Button */}
                            <Link
                                href="/wineries"
                                className="px-5 py-2 rounded-full border border-[#A33845] text-[#A33845] hover:bg-[#A33845] hover:text-white text-xs font-bold tracking-widest uppercase transition-all shadow-sm flex items-center gap-2 group inline-flex"
                            >
                                Explore Wineries
                                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                        </motion.div>

                        {/* Source / Reference Citation */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-[10px] sm:text-[11px] text-[#8A8A8A] pt-3 border-t border-black/5 max-w-md font-sans"
                        >
                            <span className="font-semibold text-[#666666]">Sources:</span>{' '}
                            <a
                                href="https://www.hindustantimes.com/cities/pune-news/maharashtra-produces-90-of-india-s-wine-report-101697740245801.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline hover:text-[#A33845] transition-colors"
                            >
                                ISWAI report (2023)
                            </a>
                            {'; '}
                            <a
                                href="https://nashik.gov.in/en/about-district/economy/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline hover:text-[#A33845] transition-colors"
                            >
                                Nashik District Administration
                            </a>
                            {'; '}
                            <a
                                href="https://maharashtratourism.gov.in/districts/nashik/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline hover:text-[#A33845] transition-colors"
                            >
                                Maharashtra Tourism
                            </a>
                        </motion.div>

                    </div>

                </div>
            </div>
        </section>
    )
}
