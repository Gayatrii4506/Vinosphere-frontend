'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
    Search, Star, Wine, MapPin, ChevronDown, ChevronRight,
    Home, Award, CheckCircle2, CheckCircle, Mail, SlidersHorizontal
} from 'lucide-react'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { images } from '@/constants/images'
import { NewsletterFooter } from '@/components/home/NewsletterFooter'

// ─── Data ─────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = ['Most Popular', 'Highest Rated', 'Most Wines', 'Newest', 'Alphabetical']

const ALL_WINERIES = [
    {
        id: 'sula',
        name: 'Sula Vineyards',
        verified: true,
        location: 'Nashik, Maharashtra',
        rating: 4.5,
        totalRatings: 12416,
        wines: 48,
        image: images.categories.card1,
        badge: 'Award Winning',
        description: `India's most celebrated estate — pioneer of modern Indian viticulture since 1999, crafting world-class wines from Nashik's sun-drenched volcanic terroir.`,
    },
    {
        id: 'york',
        name: 'York Winery',
        verified: true,
        location: 'Nashik, Maharashtra',
        rating: 4.4,
        totalRatings: 7821,
        wines: 32,
        image: images.categories.card3,
        badge: 'Premium',
        description: 'Nestled in the Gangapur Hills, York blends European varietals with Indian craftsmanship to produce wines of extraordinary character and finesse.',
    },
    {
        id: 'grover',
        name: 'Grover Zampa Vineyards',
        verified: true,
        location: 'Nandi Hills, Karnataka',
        rating: 4.3,
        totalRatings: 6234,
        wines: 26,
        image: images.categories.card2,
        badge: 'Organic',
        description: 'A trailblazer in sustainable viticulture, crafting wines that reflect the unique volcanic soil and microclimate of the breathtaking Nandi Hills.',
    },
    {
        id: 'fratelli',
        name: 'Fratelli Wines',
        verified: false,
        location: 'Akluj, Maharashtra',
        rating: 4.2,
        totalRatings: 4102,
        wines: 22,
        image: images.gallery.left1,
        badge: 'Boutique',
        description: 'An Italian-Indian collaboration producing some of India\'s most refined and elegant wines from high-altitude vineyards in Solapur district.',
    },
    {
        id: 'krsma',
        name: 'KRSMA Estates',
        verified: true,
        location: 'Hampi, Karnataka',
        rating: 4.6,
        totalRatings: 3189,
        wines: 14,
        image: images.gallery.right1,
        badge: 'Premium',
        description: `Named for its founders Krishna and Shalini, this pioneering estate crafts extraordinary wines from Hampi's dramatic, ancient landscape.`,
    },
    {
        id: 'chandon',
        name: 'Chandon India',
        verified: true,
        location: 'Dindori, Nashik',
        rating: 4.4,
        totalRatings: 8907,
        wines: 12,
        image: images.gallery.right2,
        badge: 'Award Winning',
        description: `Moët Hennessy's Indian expression brings decades of Champagne expertise to Nashik's finest Chenin Blanc for world-class sparkling wines.`,
    },
    {
        id: 'soma',
        name: 'Soma Vine Village',
        verified: false,
        location: 'Dindori, Nashik',
        rating: 4.1,
        totalRatings: 2455,
        wines: 18,
        image: images.gallery.left2,
        badge: 'Boutique',
        description: 'A boutique estate offering immersive vineyard experiences alongside beautifully balanced, terroir-expressive wines from the Dindori highlands.',
    },
    {
        id: 'vallonne',
        name: 'Vallonne Vineyards',
        verified: false,
        location: 'Igatpuri, Nashik',
        rating: 4.0,
        totalRatings: 1876,
        wines: 16,
        image: images.gallery.center,
        badge: 'Organic',
        description: 'Certified organic estate in the cool Igatpuri highlands producing elegant, mineral-driven white wines with a distinct sense of place.',
    },
]

// ─── Winery card — horizontal ─────────────────────────────────────────────────

function WineryCard({ winery, index }: { winery: typeof ALL_WINERIES[0]; index: number }) {
    const badgeColors: Record<string, string> = {
        'Award Winning': 'bg-amber-50 text-amber-700 border-amber-200',
        'Premium': 'bg-[#C89B3C]/10 text-[#8B6A10] border-[#C89B3C]/30',
        'Organic': 'bg-green-50 text-green-700 border-green-200',
        'Boutique': 'bg-[#7A1E3A]/8 text-[#7A1E3A] border-[#7A1E3A]/20',
    }

    return (
        <motion.article
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.07, duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            className="group flex items-center gap-6 py-5 px-5 -mx-5 rounded-2xl
                border-b border-[#EDE5D8] last:border-0
                hover:bg-[#FAF7F2] hover:shadow-[0_4px_24px_rgba(122,30,58,0.08)]
                transition-all duration-250 cursor-pointer"
        >
            {/* Image */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0
                border border-[#E8DDD0] shadow-sm">
                <CloudinaryImage
                    src={winery.image}
                    alt={winery.name}
                    fill
                    sizes="112px"
                    quality={75}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.07]"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-serif text-[1.1rem] font-bold text-[#1A0A10]
                        group-hover:text-[#7A1E3A] transition-colors duration-200">
                        {winery.name}
                    </h3>
                    {winery.verified && (
                        <CheckCircle2 size={15} className="text-[#7A1E3A] shrink-0" strokeWidth={2.5} />
                    )}
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColors[winery.badge] ?? ''}`}>
                        {winery.badge}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 text-[12px] text-[#8B6E5A] mb-2.5">
                    <MapPin size={11} className="text-[#C89B3C] shrink-0" />
                    <span>Winery in {winery.location}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-2.5">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12}
                                className={i < Math.round(winery.rating) ? 'text-[#C89B3C] fill-[#C89B3C]' : 'text-[#DDD] fill-[#DDD]'} />
                        ))}
                    </div>
                    <span className="text-[13px] font-bold text-[#3D1A24]">{winery.rating.toFixed(1)}</span>
                    <span className="text-[12px] text-[#A08070]">{winery.totalRatings.toLocaleString()} ratings</span>
                </div>

                <p className="hidden sm:block text-[13px] text-[#8B6E5A] leading-relaxed line-clamp-2 max-w-xl">
                    {winery.description}
                </p>
            </div>

            {/* Right: wines + CTA */}
            <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="text-right">
                    <div className="font-serif text-[1.4rem] font-bold text-[#1A0A10] leading-none">{winery.wines}</div>
                    <div className="text-[11px] text-[#A08070] mt-0.5">wines</div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 6px 20px rgba(122,30,58,0.25)' }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2.5 rounded-full
                        bg-[#1A0A10] hover:bg-[#7A1E3A] text-white
                        text-[13px] font-semibold whitespace-nowrap
                        transition-colors duration-200"
                >
                    Discover the Winery
                </motion.button>
            </div>
        </motion.article>
    )
}

// ─── Newsletter CTA ───────────────────────────────────────────────────────────

function NewsletterCTA() {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    return (
        <section className="relative overflow-hidden py-20 bg-[#1A0A10]">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #C89B3C 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(122,30,58,0.35), transparent)' }} />

            <div className="relative z-10 max-w-xl mx-auto px-4 text-center flex flex-col items-center gap-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-px bg-[#C89B3C]" />
                    <span className="text-[10px] tracking-[0.28em] uppercase font-semibold text-[#C89B3C]">VinoSphere Journal</span>
                    <div className="w-10 h-px bg-[#C89B3C]" />
                </div>
                <h2 className="font-serif font-bold text-white text-[1.9rem] sm:text-[2.2rem] leading-tight">
                    Join the <span className="italic text-[#C89B3C]">VinoSphere Journal</span>
                </h2>
                <p className="text-[#B0A090] text-[14px] leading-relaxed">
                    Receive winery stories, tasting guides, and exclusive recommendations directly to your inbox.
                </p>
                <AnimatePresence mode="wait">
                    {sent ? (
                        <motion.div key="ok"
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 px-5 py-3 rounded-full
                                bg-[#C89B3C]/20 border border-[#C89B3C]/40 text-[#C89B3C] font-semibold text-sm">
                            <CheckCircle size={15} /> You're on the list!
                        </motion.div>
                    ) : (
                        <motion.form key="form"
                            onSubmit={e => { e.preventDefault(); if (email) setSent(true) }}
                            className="flex w-full max-w-sm gap-2">
                            <div className="relative flex-1">
                                <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707070]" />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                    placeholder="Your email address"
                                    className="w-full pl-10 pr-3 py-3 rounded-full bg-white/10 backdrop-blur-sm
                                        border border-white/15 text-white placeholder-[#707070] text-sm
                                        focus:outline-none focus:border-[#C89B3C] transition-colors" />
                            </div>
                            <motion.button type="submit"
                                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                className="px-5 py-3 rounded-full bg-[#C89B3C] hover:bg-[#D4AB50]
                                    text-[#0B0B0B] font-bold text-sm transition-colors whitespace-nowrap">
                                Subscribe
                            </motion.button>
                        </motion.form>
                    )}
                </AnimatePresence>
                <p className="text-[11px] text-white/25">No spam. Unsubscribe anytime.</p>
            </div>
        </section>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function WineriesClient() {
    const [query, setQuery] = useState('')
    const [activeSort, setActiveSort] = useState('Most Popular')
    const [sortOpen, setSortOpen] = useState(false)
    const [visible, setVisible] = useState(6)

    const filtered = useMemo(() =>
        ALL_WINERIES.filter(w =>
            !query ||
            w.name.toLowerCase().includes(query.toLowerCase()) ||
            w.location.toLowerCase().includes(query.toLowerCase())
        ), [query])

    return (
        <div className="min-h-screen bg-white">

            {/* ── Compact editorial header ─────────────────────────────── */}
            <div className="bg-[#FAF7F3] border-b border-[#EDE5D8] pt-24 pb-6">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 text-[12px] text-[#A08070] mb-3">
                        <Link href="/" className="hover:text-[#7A1E3A] transition-colors inline-flex items-center gap-1">
                            <Home size={11} /> Home
                        </Link>
                        <ChevronRight size={10} className="text-[#C89B3C]/50" />
                        <span className="text-[#7A1E3A] font-semibold">Wineries</span>
                    </nav>

                    

                    {/* Heading */}
                    <h1 className="font-serif font-bold text-[#1A0A10] leading-[1.1]
                        text-4xl lg:text-5xl mb-4">
                        Discover Exceptional{' '}
                        <span className="italic text-[#7A1E3A]">Wineries</span>
                    </h1>

                    <p className="text-base text-[#8B6E5A] max-w-xl  leading-relaxed max-w-2xl mb">
Explore award-winning wineries from India and around the world.
                    </p>

                   
                </div>
            </div>

            {/* ── Search + Sort bar ───────────────────────────────────── */}
            <div className="bg-white border-b border-[#EDE5D8] sticky top-[80px] z-30
                shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A08070]" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search wineries or regions…"
                            className="w-full pl-10 pr-4 py-2 rounded-xl
                                border border-[#DDD5C5] bg-[#FAF7F3]
                                text-sm text-[#1A0A10] placeholder-[#B0907A]
                                focus:outline-none focus:border-[#7A1E3A]
                                transition-colors duration-200"
                        />
                    </div>

                    {/* Sort */}
                    <div className="relative shrink-0">
                        <button
                            onClick={() => setSortOpen(!sortOpen)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                                border border-[#DDD5C5] bg-[#FAF7F3] text-sm text-[#3D1A24]
                                hover:border-[#7A1E3A]/40 transition-colors whitespace-nowrap"
                        >
                            <SlidersHorizontal size={13} />
                            {activeSort}
                            <ChevronDown size={12} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {sortOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                    transition={{ duration: 0.13 }}
                                    className="absolute right-0 top-full mt-1 z-50 w-52 bg-white
                                        rounded-xl border border-[#E0D8CC]
                                        shadow-[0_8px_32px_rgba(122,30,58,0.14)] overflow-hidden"
                                >
                                    {SORT_OPTIONS.map(opt => (
                                        <button key={opt}
                                            onClick={() => { setActiveSort(opt); setSortOpen(false) }}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                                                ${activeSort === opt
                                                    ? 'bg-[#7A1E3A] text-white font-medium'
                                                    : 'text-[#3D1A24] hover:bg-[#FAF7F3] hover:text-[#7A1E3A]'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── Winery list ─────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Result count */}
                <div className="flex items-center gap-4 mb-3">
                    <p className="text-[13px] text-[#8B6E5A] shrink-0">
                        Showing <span className="font-semibold text-[#1A0A10]">{filtered.length}</span> wineries
                    </p>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#E8DDD0] via-[#C89B3C]/20 to-transparent" />
                </div>

                {filtered.length > 0 ? (
                    <>
                        <div className="flex flex-col">
                            {filtered.slice(0, visible).map((w, i) => (
                                <WineryCard key={w.id} winery={w} index={i} />
                            ))}
                        </div>

                        {visible < filtered.length && (
                            <div className="mt-10 text-center">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setVisible(v => v + 6)}
                                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full
                                        border-2 border-[#7A1E3A] text-[#7A1E3A] font-semibold text-sm
                                        hover:bg-[#7A1E3A] hover:text-white transition-all duration-200"
                                >
                                    Show more wineries
                                    <ChevronDown size={15} />
                                </motion.button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-16 text-center">
                        <Wine size={36} className="text-[#C89B3C]/40 mx-auto mb-3" />
                        <p className="text-[#A08070] text-sm font-medium">No wineries found for "{query}".</p>
                        <button onClick={() => setQuery('')}
                            className="mt-3 text-[#7A1E3A] text-sm font-semibold hover:underline">
                            Clear search
                        </button>
                    </div>
                )}
            </div>

            <NewsletterCTA />
            <NewsletterFooter />
        </div>
    )
}
