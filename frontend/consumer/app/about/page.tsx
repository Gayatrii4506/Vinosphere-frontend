import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Wine, MapPin, Award, Compass, Sparkles } from 'lucide-react'
import { NewsletterFooter } from '@/components/home/NewsletterFooter'

export const metadata: Metadata = {
    title: 'About VinoSphere | Premier Wine Discovery & Terroir',
    description:
        'VinoSphere is the dedicated digital platform connecting wine enthusiasts, collectors, and travelers with Nashik’s premier estates, winemakers, and tasting rooms.',
}

export default function AboutPage() {
    return (
        <div className="bg-[#FAF7F2] min-h-screen text-[#222222]">
            {/* 1. Hero Section */}
            <section className="relative pt-32 sm:pt-40 pb-20 bg-[#0B0408] text-white overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40">
                    <Image
                        src="/images/flagship_landscape.png"
                        alt="Nashik vineyard hills at golden hour"
                        fill
                        priority
                        className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0408] via-[#0B0408]/60 to-transparent" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold uppercase tracking-widest">
                        <MapPin size={13} />
                        <span>The Wine Capital of India</span>
                    </div>

                    <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                        Rooted in Terroir. <br />
                        <span className="italic font-normal text-[#D4AF37]">Dedicated to Fine Wine.</span>
                    </h1>

                    <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                        VinoSphere connects discerning wine enthusiasts, collectors, and travelers with premier estates across Nashik, Dindori, and Maharashtra’s historic wine country.
                    </p>
                </div>
            </section>

            {/* 2. Terroir Story */}
            <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-6 space-y-6">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B1E3F]">
                            <Wine size={16} />
                            <span>Viticulture & Heritage</span>
                        </div>

                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A0A10] leading-snug">
                            Where Volcanic Soils Meet Tropical Highlands
                        </h2>

                        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                            Nestled between 600 and 800 meters above sea level in the Western Ghats, the Nashik Valley benefits from warm sunny days and cooling nighttime breezes from the Gangapur Dam. This high diurnal temperature variation allows classic European varietals — from Chenin Blanc and Sauvignon Blanc to Shiraz and Cabernet Sauvignon — to retain vibrant natural acidity while achieving optimal phenolic ripeness.
                        </p>

                        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                            Maharashtra produces over 90% of India&apos;s domestic wine, welcoming over 350,000 wine travelers each harvest season. VinoSphere bridges cellar doors with contemporary wine culture.
                        </p>
                    </div>

                    <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-[#EDE5D8] shadow-sm space-y-2">
                            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#8B1E3F]">600m+</span>
                            <h3 className="font-serif font-bold text-sm text-[#1A0A10]">High-Altitude Vineyards</h3>
                            <p className="text-xs text-stone-500">Cool Sahyadri microclimates preserving aromatics and crisp structure.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-[#EDE5D8] shadow-sm space-y-2">
                            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#8B1E3F]">90%</span>
                            <h3 className="font-serif font-bold text-sm text-[#1A0A10]">National Production</h3>
                            <p className="text-xs text-stone-500">The epicenter of modern Indian winemaking and viticultural research.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-[#EDE5D8] shadow-sm space-y-2">
                            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#8B1E3F]">1999</span>
                            <h3 className="font-serif font-bold text-sm text-[#1A0A10]">Viticultural Awakening</h3>
                            <p className="text-xs text-stone-500">From table grapes to estate-bottled award-winning reserve vintages.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-[#EDE5D8] shadow-sm space-y-2">
                            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#8B1E3F]">100%</span>
                            <h3 className="font-serif font-bold text-sm text-[#1A0A10]">Verified Estates</h3>
                            <p className="text-xs text-stone-500">Authentic cellar records, real winemaker notes, and direct reservations.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Platform Pillars */}
            <section className="py-16 bg-white border-y border-[#ECECEC]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#8B1E3F]">Platform Purpose</span>
                        <h2 className="font-serif text-3xl font-bold text-[#1A0A10]">What Sets VinoSphere Apart</h2>
                        <p className="text-xs sm:text-sm text-stone-500">Thoughtfully crafted for wine lovers, cellar managers, and winery proprietors.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#EDE5D8] space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-[#8B1E3F] text-white flex items-center justify-center">
                                <Wine size={20} />
                            </div>
                            <h3 className="font-serif font-bold text-base text-[#1A0A10]">Estate-Direct Catalog</h3>
                            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                                Detailed vintage specs, enological analysis, sensory profiles, and tasting notes verified directly by estate winemakers.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#EDE5D8] space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-[#8B1E3F] text-white flex items-center justify-center">
                                <Compass size={20} />
                            </div>
                            <h3 className="font-serif font-bold text-base text-[#1A0A10]">Indian Cuisine Pairings</h3>
                            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                                Specialized sommelier engine balancing spice, richness, and acidity across regional dishes from Paneer Makhani to Biryani.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#EDE5D8] space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-[#8B1E3F] text-white flex items-center justify-center">
                                <Sparkles size={20} />
                            </div>
                            <h3 className="font-serif font-bold text-base text-[#1A0A10]">Cellar Door Reservations</h3>
                            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                                Seamless booking for vineyard tours, harvest stomping, private barrel tastings, and lakeview estate experiences.
                            </p>
                        </div>
                    </div>

                    <div className="text-center pt-4">
                        <Link
                            href="/discover/wines"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#8B1E3F] hover:bg-[#A8304F] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                        >
                            <span>Explore Wine Catalog</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 4. Footer */}
            <NewsletterFooter />
        </div>
    )
}
