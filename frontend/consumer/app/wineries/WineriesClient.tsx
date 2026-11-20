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
        image: images.wineries.sula,
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
        image: images.wineries.york,
        badge: 'Premium',
        description: 'Nestled in the Gangapur Hills, York blends European varietals with Indian craftsmanship to produce wines of extraordinary character and finesse.',
    },
    {
        id: 'soma',
        name: 'Soma Vine Village',
        verified: true,
        location: 'Gangapur Dam, Nashik',
        rating: 4.3,
        totalRatings: 6234,
        wines: 26,
        image: images.wineries.soma,
        badge: 'Resort & Vineyard',
        description: 'A scenic vineyard retreat and winery on the backwaters of Gangapur Dam, known for approachable Chenin Blanc, dessert wines, and boutique cellar stays.',
    },
    {
        id: 'vallonne',
        name: 'Vallonné Vineyards',
        verified: true,
        location: 'Igatpuri, Maharashtra',
        rating: 4.5,
        totalRatings: 4102,
        wines: 22,
        image: images.wineries.vallonne,
        badge: 'Boutique',
        description: `India's premier French-style boutique estate on the slopes of Kavnai in Igatpuri, pioneering barrel-fermented Chardonnay, Cabernet Grand Reserve, and Malbec.`,
    },
    {
        id: 'chandon',
        name: 'Chandon India Winery',
        verified: true,
        location: 'Dindori, Nashik',
        rating: 4.6,
        totalRatings: 3189,
        wines: 14,
        image: images.wineries.chandon,
        badge: 'Sparkling Specialist',
        description: `Moët Hennessy's Domaine Chandon in Dindori, Nashik, bringing centuries of Champagne heritage to craft exceptional méthode traditionnelle sparkling wines.`,
    },
    {
        id: 'grover',
        name: 'Grover Zampa Vineyards',
        verified: true,
        location: 'Dindori, Nashik',
        rating: 4.4,
        totalRatings: 8907,
        wines: 12,
        image: images.wineries.grover,
        badge: 'Award Winning',
        description: `Pioneering estate with vineyards across the Sahyadri hills of Dindori, famous for introducing La Réserve and fine barrel-aged red blends to Indian wine culture.`,
    },
    {
        id: 'charosa',
        name: 'Charosa Vineyards',
        verified: true,
        location: 'Dindori, Nashik',
        rating: 4.3,
        totalRatings: 2455,
        wines: 18,
        image: images.wineries.charosa,
        badge: 'Boutique',
        description: `Contemporary estate situated amidst Tuscan-like hills in Dindori, celebrated for innovative open-canopy viticulture, Tempranillo, and crisp Sauvignon Blanc.`,
    },
]
// ─── Winery card — horizontal & responsive ───────────────────────────────────

function WineryCard({ winery, index }: { winery: typeof ALL_WINERIES[0]; index: number }) {
    const badgeColors: Record<string, string> = {
        'Award Winning': 'bg-amber-50 text-amber-800 border-amber-200/80',
        'Premium': 'bg-[#C89B3C]/10 text-[#8B6A10] border-[#C89B3C]/30',
        'Organic': 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        'Boutique': 'bg-[#8B1E3F]/10 text-[#8B1E3F] border-[#8B1E3F]/20',
    }

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 py-5 px-4 sm:px-5 -mx-2 sm:-mx-5 rounded-2xl
                border-b border-[#EDE5D8] last:border-0
                hover:bg-[#FAF7F2] hover:shadow-[0_4px_24px_rgba(122,30,58,0.06)]
                transition-all duration-200 cursor-pointer"
        >
            
            {/* Image */}
            <div className="relative w-full sm:w-28 h-36 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden shrink-0
                border border-[#E8DDD0] shadow-sm bg-[#1A0810]">
                <CloudinaryImage
                    src={winery.image}
                    alt={winery.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 112px"
                    quality={75}
                    placeholder="empty"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-serif text-lg sm:text-[1.15rem] font-bold text-[#1A0A10]
                        group-hover:text-[#8B1E3F] transition-colors duration-200">
                        {winery.name}
                    </h3>
                    {winery.verified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B1E3F]">
                            <CheckCircle2 size={14} className="text-[#8B1E3F] shrink-0" strokeWidth={2.5} />
                            <span className="hidden md:inline">Verified Estate</span>
                        </span>
                    )}
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColors[winery.badge] ?? 'bg-stone-100 text-stone-700 border-stone-200'}`}>
                        {winery.badge}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#8B6E5A] mb-2">
                    <MapPin size={12} className="text-[#C89B3C] shrink-0" />
                    <span>Winery in {winery.location}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12}
                                className={i < Math.round(winery.rating) ? 'text-[#C89B3C] fill-[#C89B3C]' : 'text-[#E0D8CC] fill-[#E0D8CC]'} />
                        ))}
                    </div>
                    <span className="text-xs font-bold text-[#1A0A10]">{winery.rating.toFixed(1)}</span>
                    <span className="text-xs text-[#A08070]">({winery.totalRatings.toLocaleString()} ratings)</span>
                </div>

                <p className="text-xs sm:text-[13px] text-[#6B5546] leading-relaxed line-clamp-2 max-w-xl">
                    {winery.description}
                </p>
            </div>

            {/* Right: wines + CTA */}
            <div className="flex items-center sm:flex-col justify-between sm:justify-center sm:items-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t border-[#EDE5D8]/50 sm:border-t-0">
                <div className="text-left sm:text-right">
                    <div className="font-serif text-lg sm:text-2xl font-bold text-[#1A0A10] leading-none">{winery.wines}</div>
                    <div className="text-[11px] text-[#A08070] mt-0.5">wines in collection</div>
                </div>
                <Link href={`/wineries/${winery.id}`} className="shrink-0">
                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 4px 16px rgba(139,30,63,0.2)' }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full
                            bg-[#1A0A10] hover:bg-[#8B1E3F] text-white
                            text-xs sm:text-[13px] font-semibold whitespace-nowrap
                            transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E3F]"
                    >
                        Discover Estate
                    </motion.button>
                </Link>
            </div>
        </motion.article>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function WineriesClient({ dbWineries = [] }: { dbWineries?: any[] }) {
    const [query, setQuery] = useState('')
    const [activeSort, setActiveSort] = useState('Most Popular')
    const [sortOpen, setSortOpen] = useState(false)
    const [visible, setVisible] = useState(6)

    const mergedWineries = useMemo(() => {
        // Filter out draft/unpublished database records to avoid duplicates and show only active listings
        const publishedDb = (dbWineries || []).filter(w => w.status === 'published');

        if (publishedDb.length === 0) {
            return ALL_WINERIES;
        }

        // Map database wineries only
        return publishedDb.map((dbW) => {
            const staticMatch = ALL_WINERIES.find(sw => {
                const cleanDbSlug = dbW.slug?.toLowerCase().replace('-winery', '').replace('-vineyards', '').replace('-village', '').trim() || '';
                const cleanStaticId = sw.id.toLowerCase();
                return cleanDbSlug.includes(cleanStaticId) || cleanStaticId.includes(cleanDbSlug);
            });
            return {
                id: dbW.slug || dbW.id,
                name: dbW.name,
                verified: dbW.verified || staticMatch?.verified || false,
                location: dbW.city ? `${dbW.city}, ${dbW.state || ''}` : (staticMatch?.location || 'Nashik, Maharashtra'),
                rating: dbW.average_rating ? Number(dbW.average_rating) : (staticMatch?.rating || 4.0),
                totalRatings: staticMatch?.totalRatings || 100,
                wines: staticMatch?.wines || 5,
                image: dbW.banner_url || dbW.logo_url || staticMatch?.image || 'https://images.unsplash.com/photo-1543418219-44e30b057fc5?w=800&q=80',
                badge: dbW.verified ? 'Premium' : (staticMatch?.badge || 'Boutique'),
                description: dbW.description || staticMatch?.description || '',
            };
        });
    }, [dbWineries]);

    const filtered = useMemo(() => {
        const list = mergedWineries.filter(w =>
            !query ||
            w.name.toLowerCase().includes(query.toLowerCase()) ||
            w.location.toLowerCase().includes(query.toLowerCase())
        )

        // Apply sorting
        return list.slice().sort((a, b) => {
            if (activeSort === 'Highest Rated') return b.rating - a.rating
            if (activeSort === 'Most Wines') return b.wines - a.wines
            if (activeSort === 'Alphabetical') return a.name.localeCompare(b.name)
            if (activeSort === 'Most Popular') return b.totalRatings - a.totalRatings
            return 0
        })
    }, [query, activeSort, mergedWineries])

    return (
        <div className="min-h-screen bg-white">

            {/* ── Compact editorial header ─────────────────────────────── */}
            <div className="relative overflow-hidden bg-[#FAF7F3] border-b border-[#EDE5D8] pt-24 pb-8">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://res.cloudinary.com/xfklkvdc/image/upload/v1784636572/wineries_siqmmn.webp')",
                    }}
                />

                {/* Overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(90deg, rgba(250,247,243,0.98) 0%, rgba(250,247,243,0.85) 45%, rgba(250,247,243,0.4) 75%, rgba(250,247,243,0.4) 100%)",
                    }}
                />

                {/* Content */}
                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 text-xs text-[#8B6E5A] mb-3 font-medium">
                        <Link href="/" className="hover:text-[#8B1E3F] transition-colors">Home</Link>
                        <ChevronRight size={12} className="text-[#C89B3C]" />
                        <span className="text-[#1A0A10] font-semibold">Wineries</span>
                    </nav>

                    <h1 className="font-serif font-bold text-[#1A0A10] leading-[1.1] text-3xl sm:text-4xl lg:text-5xl mb-3">
                        Discover Exceptional{" "}
                        <span className="italic text-[#8B1E3F]">Wineries</span>
                    </h1>

                    <p className="text-sm sm:text-base text-[#6B5546] max-w-xl leading-relaxed">
                        Explore award-winning heritage estates and boutique vineyards crafting world-class Indian wines.
                    </p>
                </div>
            </div>

            {/* ── Search + Sort bar ───────────────────────────────────── */}
            <div className="bg-white border-b border-[#EDE5D8] sticky top-[72px] sm:top-[80px] z-30
                shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A08070]" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search wineries, regions, or appellations…"
                            className="w-full pl-10 pr-4 py-2 rounded-xl
                                border border-[#DDD5C5] bg-[#FAF7F3]
                                text-sm text-[#1A0A10] placeholder-[#B0907A]
                                focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] focus:border-[#8B1E3F]
                                transition-colors duration-200"
                        />
                    </div>

                    {/* Sort */}
                    <div className="relative shrink-0">
                        <button
                            type="button"
                            onClick={() => setSortOpen(!sortOpen)}
                            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl
                                border border-[#DDD5C5] bg-[#FAF7F3] text-xs sm:text-sm text-[#1A0A10] font-medium
                                hover:border-[#8B1E3F]/40 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E3F]"
                        >
                            <SlidersHorizontal size={13} className="text-[#8B1E3F]" />
                            <span className="hidden sm:inline">Sort:</span>
                            {activeSort}
                            <ChevronDown size={12} className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {sortOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                    transition={{ duration: 0.13 }}
                                    className="absolute right-0 top-full mt-1.5 z-50 w-48 sm:w-52 bg-white
                                        rounded-xl border border-[#EDE5D8]
                                        shadow-[0_8px_32px_rgba(122,30,58,0.12)] overflow-hidden"
                                >
                                    {SORT_OPTIONS.map(opt => (
                                        <button key={opt}
                                            type="button"
                                            onClick={() => { setActiveSort(opt); setSortOpen(false) }}
                                            className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E3F]
                                                ${activeSort === opt
                                                    ? 'bg-[#8B1E3F] text-white font-medium'
                                                    : 'text-[#1A0A10] hover:bg-[#FAF7F3] hover:text-[#8B1E3F]'
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
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                {/* Result count */}
                <div className="flex items-center gap-4 mb-4">
                    <p className="text-xs sm:text-[13px] text-[#8B6E5A] shrink-0">
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
                            <div className="mt-8 sm:mt-10 text-center">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setVisible(v => v + 4)}
                                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full
                                        border-2 border-[#8B1E3F] text-[#8B1E3F] font-semibold text-sm
                                        hover:bg-[#8B1E3F] hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E3F]"
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
                        <p className="text-[#8B6E5A] text-sm font-medium">No wineries found for &quot;{query}&quot;.</p>
                        <button 
                            type="button"
                            onClick={() => setQuery('')}
                            className="mt-3 text-[#8B1E3F] text-sm font-semibold hover:underline">
                            Clear search
                        </button>
                    </div>
                )}
            </div>

            <NewsletterFooter />
        </div>
    )
}
