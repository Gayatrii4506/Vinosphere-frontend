'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Sparkles, Star, Wine, Compass, ArrowRight, X, Utensils, BedDouble, GlassWater, Award } from 'lucide-react'
import { VinoSphereExperience } from '@/constants/events'
import { images } from '@/constants/images'

interface MapProps {
    experiences?: VinoSphereExperience[]
    onSelect?: (experience: VinoSphereExperience) => void
}

type TrailCategory = 'All' | 'Wineries' | 'Tastings' | 'Stays' | 'Experiences'

interface WineTrailStop {
    id: string
    name: string
    category: 'Wineries' | 'Tastings' | 'Stays' | 'Experiences'
    typeLabel: string
    location: string
    region: string
    rating: number
    reviewCount: number
    startingPrice: number
    image: string
    x: number // percentage
    y: number // percentage
    description: string
    experienceRef?: VinoSphereExperience
}

export const InteractiveExperienceMap: React.FC<MapProps> = ({ experiences = [], onSelect }) => {
    const [selectedCategory, setSelectedCategory] = useState<TrailCategory>('All')
    const [activeStop, setActiveStop] = useState<WineTrailStop | null>(null)
    const [hoveredStop, setHoveredStop] = useState<WineTrailStop | null>(null)

    // Predefined Nashik Wine Trail Stops
    const trailStops: WineTrailStop[] = useMemo(() => [
        {
            id: 'stop-sula',
            name: 'Sula Vineyards',
            category: 'Wineries',
            typeLabel: 'Estate Cellar Tour & Tasting',
            location: 'Gangapur Hills, Nashik',
            region: 'Western Ghats',
            rating: 4.8,
            reviewCount: 12416,
            startingPrice: 1200,
            image: images.wineries.sula || '/images/featured-pairings.png',
            x: 22,
            y: 45,
            description: 'Pioneer of modern Indian viticulture since 1999, crafting world-class wines along Gangapur Lake.',
            experienceRef: experiences.find(e => e.winery?.toLowerCase().includes('sula')) || experiences[0],
        },
        {
            id: 'stop-york',
            name: 'York Winery',
            category: 'Tastings',
            typeLabel: 'Sunset Reserve Tasting',
            location: 'Gangapur Dam, Nashik',
            region: 'Gangapur Hills',
            rating: 4.7,
            reviewCount: 7821,
            startingPrice: 1500,
            image: images.wineries.york || '/images/featured-pairings.png',
            x: 36,
            y: 32,
            description: 'Boutique hill-slope estate overlooking Gangapur Dam, specializing in Shiraz and sparkling wines.',
            experienceRef: experiences.find(e => e.winery?.toLowerCase().includes('york')) || experiences[1],
        },
        {
            id: 'stop-soma',
            name: 'Soma Vine Village',
            category: 'Stays',
            typeLabel: 'Luxury Vineyard Villa & Resort',
            location: 'Gangapur Backwaters, Nashik',
            region: 'Sanjegaon Valley',
            rating: 4.6,
            reviewCount: 6234,
            startingPrice: 4500,
            image: images.wineries.soma || '/images/featured-pairings.png',
            x: 52,
            y: 54,
            description: 'Serene lakeside resort and spa embedded within lush vineyards and infinity pool views.',
            experienceRef: experiences.find(e => e.winery?.toLowerCase().includes('soma')) || experiences[2],
        },
        {
            id: 'stop-vallonne',
            name: 'Vallonné Vineyards',
            category: 'Experiences',
            typeLabel: "Sommelier Chef's Masterclass",
            location: 'Kavnai, Igatpuri',
            region: 'Igatpuri Ridge',
            rating: 4.9,
            reviewCount: 4102,
            startingPrice: 3200,
            image: images.wineries.vallonne || '/images/featured-pairings.png',
            x: 66,
            y: 38,
            description: 'High-elevation boutique winery producing classic French-style barrel-aged reserve vintages.',
            experienceRef: experiences.find(e => e.winery?.toLowerCase().includes('vallonne')) || experiences[3],
        },
        {
            id: 'stop-grover',
            name: 'Grover Zampa Vineyards',
            category: 'Wineries',
            typeLabel: 'Sparkling Wine Laboratory Tour',
            location: 'Sanpuri, Dindori',
            region: 'Dindori Plateau',
            rating: 4.7,
            reviewCount: 8907,
            startingPrice: 1800,
            image: images.wineries.grover || '/images/featured-pairings.png',
            x: 78,
            y: 64,
            description: 'Moët Hennessy partner winery crafting vintage Methode Traditionnelle sparkling wines in Dindori.',
            experienceRef: experiences.find(e => e.winery?.toLowerCase().includes('grover')) || experiences[4],
        },
        {
            id: 'stop-chandon',
            name: 'Chandon India Winery',
            category: 'Experiences',
            typeLabel: 'Chandon Sunset Gala & Stomp',
            location: 'Dindori Valley, Nashik',
            region: 'Dindori Terroir',
            rating: 4.8,
            reviewCount: 3189,
            startingPrice: 2800,
            image: images.wineries.chandon || '/images/featured-pairings.png',
            x: 88,
            y: 28,
            description: 'State-of-the-art sparkling winery surrounded by manicured grounds and private tasting lounges.',
            experienceRef: experiences.find(e => e.winery?.toLowerCase().includes('chandon')) || experiences[5],
        },
    ], [experiences])

    // Filter stops based on category
    const filteredStops = useMemo(() => {
        if (selectedCategory === 'All') return trailStops
        return trailStops.filter(s => s.category === selectedCategory)
    }, [selectedCategory, trailStops])

    // Categories filter options
    const filterCategories: { label: TrailCategory; icon: any }[] = [
        { label: 'All', icon: Compass },
        { label: 'Wineries', icon: Wine },
        { label: 'Tastings', icon: GlassWater },
        { label: 'Stays', icon: BedDouble },
        { label: 'Experiences', icon: Sparkles },
    ]

    const handleSelectStop = (stop: WineTrailStop) => {
        setActiveStop(stop)
        if (onSelect && stop.experienceRef) {
            onSelect(stop.experienceRef)
        }
    }

    return (
        <section className="py-12 bg-[#FAF7F2] border-y border-[#EDE5D8]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header & Compact Filter Bar Container */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-[#7A1E3A] text-xs font-bold uppercase tracking-widest mb-1.5">
                            <Navigation size={14} className="text-[#C89B3C]" />
                            <span>INTERACTIVE TERROIR EXPLORER</span>
                        </div>
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A0A10]">
                            The Nashik Wine Trail
                        </h2>
                        <p className="text-xs sm:text-sm text-[#6C5B52] mt-1 max-w-xl">
                            Explore premier estates, tastings, vineyard stays, and cellar journeys connected along Nashik's sun-drenched valley.
                        </p>
                    </div>

                    {/* Compact Filter Bar */}
                    <div className="inline-flex items-center p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5DCD0] shadow-sm gap-1 self-start lg:self-auto flex-wrap sm:flex-nowrap">
                        {filterCategories.map(({ label, icon: Icon }) => {
                            const active = selectedCategory === label
                            return (
                                <button
                                    key={label}
                                    onClick={() => {
                                        setSelectedCategory(label)
                                        setActiveStop(null)
                                    }}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                        active
                                            ? 'bg-[#7A1E3A] text-white shadow-md'
                                            : 'text-[#5C4033] hover:text-[#7A1E3A] hover:bg-[#F5EFE6]'
                                    }`}
                                >
                                    <Icon size={13} className={active ? 'text-[#F5DCA0]' : 'text-[#8B6E5A]'} />
                                    <span>{label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Main Interactive Map Canvas */}
                <div className="relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden bg-[#180B13] border border-[#C89B3C]/30 shadow-2xl relative select-none">
                    
                    {/* SVG Western Ghats Terrain, Contours, Rivers & Trail Route */}
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 1000 580"
                        preserveAspectRatio="none"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            {/* Gold/Burgundy Trail Path Gradient */}
                            <linearGradient id="trail-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#7A1E3A" stopOpacity="0.9" />
                                <stop offset="40%" stopColor="#C89B3C" stopOpacity="1" />
                                <stop offset="75%" stopColor="#E5C07B" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#7A1E3A" stopOpacity="0.9" />
                            </linearGradient>

                            {/* Trail Glow Filter */}
                            <filter id="trail-glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Topographic Elevation Contour Lines */}
                        <path d="M 0 80 Q 250 30 500 90 T 1000 60" stroke="#C89B3C" strokeWidth="1" strokeDasharray="3 4" opacity="0.12" />
                        <path d="M 0 160 Q 300 110 600 180 T 1000 130" stroke="#C89B3C" strokeWidth="1" opacity="0.09" />
                        <path d="M 0 260 Q 280 200 650 290 T 1000 220" stroke="#C89B3C" strokeWidth="1" strokeDasharray="4 4" opacity="0.11" />
                        <path d="M 0 380 Q 380 300 720 400 T 1000 340" stroke="#C89B3C" strokeWidth="1" opacity="0.08" />
                        <path d="M 0 490 Q 420 410 820 510 T 1000 450" stroke="#C89B3C" strokeWidth="1" opacity="0.12" />

                        {/* Secondary Terrain Hills & Ridges */}
                        <path d="M 150 0 Q 220 180 180 380 T 260 580" stroke="#C89B3C" strokeWidth="1" opacity="0.06" fill="none" />
                        <path d="M 520 0 Q 580 220 540 420 T 620 580" stroke="#C89B3C" strokeWidth="1" opacity="0.06" fill="none" />
                        <path d="M 820 0 Q 880 200 840 400 T 910 580" stroke="#C89B3C" strokeWidth="1" opacity="0.06" fill="none" />

                        {/* Water Feature: Gangapur Lake & Godavari River Pathway */}
                        <path
                            d="M 80 540 C 180 430, 290 320, 440 370 C 580 420, 680 310, 840 270 C 920 250, 970 210, 1000 180"
                            stroke="#2C4E4B"
                            strokeWidth="24"
                            strokeLinecap="round"
                            opacity="0.3"
                        />
                        <path
                            d="M 80 540 C 180 430, 290 320, 440 370 C 580 420, 680 310, 840 270 C 920 250, 970 210, 1000 180"
                            stroke="#487873"
                            strokeWidth="8"
                            strokeLinecap="round"
                            opacity="0.45"
                        />

                        {/* Connected Burgundy / Gold Wine Trail Route Line */}
                        <path
                            d="M 220 261 Q 290 200 360 185 T 520 313 T 660 220 T 780 371 T 880 162"
                            stroke="url(#trail-gradient)"
                            strokeWidth="2.5"
                            strokeDasharray="6 4"
                            filter="url(#trail-glow)"
                            fill="none"
                        />
                        <path
                            d="M 220 261 Q 290 200 360 185 T 520 313 T 660 220 T 780 371 T 880 162"
                            stroke="#FFFDF9"
                            strokeWidth="1"
                            opacity="0.4"
                            fill="none"
                        />

                        {/* Trail Stop SVG Anchors */}
                        {trailStops.map((stop, idx) => (
                            <circle
                                key={`anchor-${stop.id}`}
                                cx={`${stop.x * 10}`}
                                cy={`${stop.y * 5.8}`}
                                r="4"
                                fill="#C89B3C"
                                opacity="0.6"
                            />
                        ))}
                    </svg>

                    {/* Regional Terroir & Terrain Labels */}
                    <div className="absolute top-6 left-8 text-[11px] font-serif tracking-widest text-[#E5C07B]/40 uppercase pointer-events-none">
                        WESTERN GHATS SAHYADRI RANGE
                    </div>
                    <div className="absolute top-6 right-8 text-[11px] font-serif tracking-widest text-[#E5C07B]/40 uppercase pointer-events-none">
                        DINDORI VALLEY HIGH-ELEVATION TERROIR
                    </div>
                    <div className="absolute bottom-6 left-8 text-[10px] font-serif tracking-widest text-[#E5C07B]/40 uppercase pointer-events-none flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#487873] inline-block" />
                        <span>GANGAPUR LAKE & GODAVARI RIVER</span>
                    </div>
                    <div className="absolute bottom-6 right-8 text-[11px] font-mono text-[#E5C07B]/50 tracking-wider pointer-events-none">
                        ✦ NASHIK WINE TRAIL • 24 KM CORRIDOR
                    </div>

                    {/* Interactive Wine-Location Pins Layer */}
                    <div className="absolute inset-0 w-full h-full">
                        {filteredStops.map((stop) => {
                            const isSelected = activeStop?.id === stop.id
                            const isHovered = hoveredStop?.id === stop.id
                            const isHighlighted = isSelected || isHovered

                            return (
                                <div
                                    key={stop.id}
                                    style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                                >
                                    {/* Pulse Animation for selected/active pin */}
                                    <span className="absolute -inset-3 rounded-full bg-[#C89B3C]/30 animate-ping pointer-events-none" />

                                    {/* Elegant Wine-Location Pin Button */}
                                    <button
                                        onClick={() => handleSelectStop(stop)}
                                        onMouseEnter={() => setHoveredStop(stop)}
                                        onMouseLeave={() => setHoveredStop(null)}
                                        className={`relative group flex items-center justify-center transition-transform duration-300 cursor-pointer ${
                                            isHighlighted ? 'scale-125 z-30' : 'scale-100 hover:scale-110 z-20'
                                        }`}
                                    >
                                        <div className={`relative flex items-center justify-center w-9 h-9 rounded-full shadow-xl transition-all duration-300 ${
                                            isHighlighted 
                                                ? 'bg-[#C89B3C] border-2 border-white ring-4 ring-[#7A1E3A]/80 shadow-[0_0_20px_rgba(200,155,60,0.8)]' 
                                                : 'bg-[#7A1E3A] border-2 border-[#C89B3C] hover:border-white shadow-[0_4px_16px_rgba(122,30,58,0.6)]'
                                        }`}>
                                            <Wine size={16} className={isHighlighted ? 'text-[#1A0A10]' : 'text-[#F5DCA0]'} />
                                        </div>

                                        {/* Pin Label Badge Below */}
                                        <div className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap tracking-wider uppercase transition-all duration-200 shadow-md ${
                                            isHighlighted
                                                ? 'bg-[#C89B3C] text-[#1A0A10] border border-white'
                                                : 'bg-[#1A0A10]/90 text-[#F5DCA0] border border-[#C89B3C]/30 backdrop-blur-sm'
                                        }`}>
                                            {stop.name}
                                        </div>
                                    </button>

                                    {/* Small Winery Card on Hover / Click */}
                                    <AnimatePresence>
                                        {isHighlighted && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.94 }}
                                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-white rounded-2xl p-4 shadow-2xl border border-[#C89B3C]/40 z-40 text-left"
                                            >
                                                {/* Header Row with Badge */}
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#7A1E3A]/10 text-[#7A1E3A] border border-[#7A1E3A]/20">
                                                        <Sparkles size={11} className="text-[#C89B3C]" />
                                                        {stop.category}
                                                    </span>
                                                    <div className="flex items-center gap-1 font-bold text-amber-600 text-xs">
                                                        <Star size={12} className="fill-amber-400 text-amber-400" />
                                                        <span>{stop.rating}</span>
                                                        <span className="text-[10px] text-stone-400 font-normal">({stop.reviewCount.toLocaleString()})</span>
                                                    </div>
                                                </div>

                                                {/* Winery Title & Type */}
                                                <h4 className="font-serif text-base font-bold text-[#1A0A10] leading-snug">
                                                    {stop.name}
                                                </h4>
                                                <p className="text-xs font-medium text-[#7A1E3A] mt-0.5">
                                                    {stop.typeLabel}
                                                </p>
                                                <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-1">
                                                    <MapPin size={11} className="text-[#C89B3C] shrink-0" />
                                                    <span>{stop.location}</span>
                                                </p>

                                                {/* Description snippet */}
                                                <p className="text-[11px] text-stone-600 leading-relaxed mt-2 line-clamp-2">
                                                    {stop.description}
                                                </p>

                                                {/* Bottom Footer: Price & Action */}
                                                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
                                                    <div>
                                                        <span className="text-[10px] uppercase text-stone-400 font-semibold block">Starting Price</span>
                                                        <span className="font-serif text-sm font-bold text-[#1A0A10]">From ₹{stop.startingPrice.toLocaleString()}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSelectStop(stop)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7A1E3A] hover:bg-[#5C1428] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                                                    >
                                                        <span>Explore</span>
                                                        <ArrowRight size={13} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )
                        })}
                    </div>

                </div>
            </div>
        </section>
    )
}

