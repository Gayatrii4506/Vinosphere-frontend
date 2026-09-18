'use client'

import React, { useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
    MapPin, Star, Award, Clock, Phone, Mail, ChevronLeft,
    ChevronRight, Calendar, Wine, ArrowRight, ExternalLink, X,
    CheckCircle2
} from 'lucide-react'
import type { WineryDetails } from '@/constants/winery-details'

// ─── Utility ──────────────────────────────────────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
}

const stagger = {
    visible: { transition: { staggerChildren: 0.08 } },
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    size={size}
                    className={i <= Math.round(rating)
                        ? 'text-[#C89B3C] fill-[#C89B3C]'
                        : 'text-[#D9CCBA] fill-[#D9CCBA]'}
                />
            ))}
        </div>
    )
}

// ─── Medal Badge ──────────────────────────────────────────────────────────────
function MedalBadge({ medal }: { medal: string }) {
    const colors: Record<string, string> = {
        'Platinum': 'bg-[#E8E0D0] text-[#5C5040] border-[#C0B090]',
        'Double Gold': 'bg-[#FDF0D0] text-[#7A5C00] border-[#D4A800]',
        'Gold': 'bg-[#FEF5DC] text-[#8B6A00] border-[#C89B3C]',
        'Silver': 'bg-[#F0F4F8] text-[#4A6080] border-[#9AB0C8]',
        'Bronze': 'bg-[#FDF4EE] text-[#8A4A28] border-[#CD7F32]',
    }
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${colors[medal] ?? 'bg-[#F9F6F0] text-[#7A1F3D] border-[#7A1F3D]/30'}`}>
            <Award size={9} />
            {medal}
        </span>
    )
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#C89B3C]" />
            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#C89B3C]">{children}</span>
            <div className="w-8 h-px bg-[#C89B3C]" />
        </div>
    )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ winery }: { winery: WineryDetails }) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
    const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

    const awards = winery?.awards || []
    const heroImage = winery?.heroImage || 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&q=80'

    return (
        <section ref={ref} className="relative h-[92vh] min-h-[620px] overflow-hidden">
            {/* Parallax Image */}
            <motion.div style={{ y }} className="absolute inset-0 scale-110">
                <Image
                    src={heroImage}
                    alt={winery?.name || 'Winery'}
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
            </motion.div>

            {/* Gradient overlay — bottom heavy */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0408]/90 via-[#0B0408]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0408]/60 via-transparent to-transparent" />

            {/* Floating vine SVG decorative */}
            <svg className="absolute top-10 right-10 w-32 h-32 opacity-10 text-[#C89B3C]" viewBox="0 0 120 120" fill="none">
                <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="50" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="80" cy="25" r="7" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="100" cy="60" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M20 20 Q35 5 50 10 Q65 15 80 25 Q95 40 100 60" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M20 20 L18 35 M50 10 L48 24 M80 25 L78 40 M100 60 L95 73" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
            </svg>

            {/* Content */}
            <motion.div style={{ opacity }} className="absolute inset-0 flex items-end pb-14 md:pb-20">
                <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
                    {/* Award badges */}
                    {awards.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                            className="flex flex-wrap gap-2 mb-6"
                        >
                            {awards.slice(0, 3).map((award, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-[#C89B3C]/40 text-[#E8D49C] text-[10px] font-semibold tracking-wider px-3 py-1.5 rounded-full"
                                >
                                    <Award size={9} className="text-[#C89B3C]" />
                                    {award.title} {award.year}
                                </span>
                            ))}
                        </motion.div>
                    )}

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-3"
                    >
                        {winery?.name}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.7 }}
                        className="text-lg md:text-xl text-[#E8D49C] font-light tracking-wide italic mb-2"
                    >
                        {winery?.tagline}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.7 }}
                        className="flex flex-wrap items-center gap-4 mb-8 text-[#C8B898] text-sm"
                    >
                        <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-[#C89B3C]" />
                            {winery?.location || 'India'}
                        </span>
                        {winery?.established && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-[#C89B3C]/60" />
                                <span>Est. {winery.established}</span>
                            </>
                        )}
                        <span className="w-1 h-1 rounded-full bg-[#C89B3C]/60" />
                        <StarRating rating={4.5} size={12} />
                        <span>4.5 · Highly Rated</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.72, duration: 0.7 }}
                        className="flex flex-wrap gap-3"
                    >
                        <motion.a
                            href="#packages"
                            whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(200,155,60,0.4)' }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2 bg-[#C89B3C] hover:bg-[#D4AA50] text-[#1A0A0E] font-bold text-sm px-7 py-3.5 rounded-full transition-colors shadow-lg"
                        >
                            <Calendar size={14} />
                            Book a Visit
                        </motion.a>
                        <motion.a
                            href="#wines"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/30 text-white font-semibold text-sm px-7 py-3.5 rounded-full transition-all"
                        >
                            <Wine size={14} />
                            Explore Wines
                        </motion.a>
                    </motion.div>
                </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-6 right-8 flex flex-col items-center gap-1.5"
            >
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 rotate-90 origin-center">Scroll</span>
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                    className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent"
                />
            </motion.div>
        </section>
    )
}

// ─── Story Timeline ───────────────────────────────────────────────────────────
function StorySection({ winery }: { winery: WineryDetails }) {
    const timeline = winery?.storyTimeline || []
    if (timeline.length === 0) return null

    return (
        <section className="bg-[#F8F4EE] py-24 lg:py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    className="text-center mb-16"
                >
                    <motion.div variants={fadeUp}>
                        <SectionLabel>Our Heritage</SectionLabel>
                    </motion.div>
                    <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold text-[#1A0A10] leading-tight">
                        A Story Written in <span className="italic text-[#7A1F3D]">Every Vintage</span>
                    </motion.h2>
                </motion.div>

                <div className="relative">
                    {/* Timeline spine */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#C89B3C]/30 via-[#C89B3C] to-[#C89B3C]/30 hidden md:block" />

                    <div className="space-y-16 md:space-y-24">
                        {timeline.map((item, index) => (
                            <motion.div
                                key={item.year || index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                                className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                            >
                                {/* Content */}
                                <div className="flex-1 md:max-w-[45%]">
                                    <div className="bg-white rounded-3xl p-8 shadow-[0_4px_32px_rgba(122,31,61,0.08)] border border-[#EDE5D8]">
                                        <div className="inline-flex items-center gap-2 bg-[#7A1F3D]/8 text-[#7A1F3D] text-xs font-bold tracking-[0.18em] uppercase px-3 py-1 rounded-full mb-4">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#C89B3C]" />
                                            {item.year}
                                        </div>
                                        <h3 className="font-serif text-2xl font-bold text-[#1A0A10] mb-3">{item.title}</h3>
                                        <p className="text-[#8B6E5A] leading-relaxed text-sm">{item.text}</p>
                                    </div>
                                </div>

                                {/* Timeline node */}
                                <div className="hidden md:flex w-10 h-10 rounded-full bg-[#7A1F3D] border-4 border-[#F8F4EE] items-center justify-center shadow-lg z-10 shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-[#C89B3C]" />
                                </div>

                                {/* Image */}
                                <div className="flex-1 md:max-w-[45%]">
                                    <div className="relative h-60 md:h-72 rounded-3xl overflow-hidden shadow-xl">
                                        <Image
                                            src={item.image || 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80'}
                                            alt={item.title || 'Heritage'}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 45vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A10]/20 to-transparent" />
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

// ─── Estate Experience ────────────────────────────────────────────────────────
function EstateSection({ winery }: { winery: WineryDetails }) {
    const experiences = winery?.estateExperiences || []
    if (experiences.length === 0) return null

    return (
        <section className="bg-white py-24 lg:py-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <motion.div variants={fadeUp}><SectionLabel>The Estate</SectionLabel></motion.div>
                    <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold text-[#1A0A10]">
                        An Immersive <span className="italic text-[#7A1F3D]">Wine Estate</span>
                    </motion.h2>
                </motion.div>

                <div className="space-y-24">
                    {experiences.map((exp, i) => (
                        <motion.div
                            key={exp.title || i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${exp.align === 'left' ? 'lg:flex-row-reverse' : ''}`}
                        >
                            {/* Image */}
                            <div className="w-full lg:w-1/2">
                                <div className="relative h-80 lg:h-[420px] rounded-[2rem] overflow-hidden shadow-2xl group">
                                    <Image
                                        src={exp.image || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80'}
                                        alt={exp.title || 'Estate Experience'}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#7A1F3D]/10 to-transparent" />
                                    {/* Number badge */}
                                    <div className="absolute top-6 left-6 w-12 h-12 rounded-full bg-[#C89B3C]/90 backdrop-blur-sm flex items-center justify-center">
                                        <span className="font-serif text-white font-bold text-lg">{String(i + 1).padStart(2, '0')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Text */}
                            <div className="w-full lg:w-1/2 space-y-6">
                                <div className="w-10 h-px bg-[#C89B3C]" />
                                <h3 className="font-serif text-3xl lg:text-4xl font-bold text-[#1A0A10] leading-tight">{exp.title}</h3>
                                <p className="text-[#8B6E5A] text-base leading-relaxed max-w-md">{exp.description}</p>
                                <motion.a
                                    href="#packages"
                                    whileHover={{ x: 4 }}
                                    className="inline-flex items-center gap-2 text-[#7A1F3D] font-semibold text-sm hover:gap-3 transition-all duration-200"
                                >
                                    Learn more <ArrowRight size={14} />
                                </motion.a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ─── Signature Wine Collection ─────────────────────────────────────────────────
function WineCollectionSection({ winery }: { winery: WineryDetails }) {
    const wines = winery?.signatureWines || []
    const [active, setActive] = useState(0)

    if (wines.length === 0) return null
    const safeActive = active < wines.length ? active : 0
    const wine = wines[safeActive]
    if (!wine) return null

    return (
        <section id="wines" className="bg-[#F8F4EE] py-24 lg:py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <motion.div variants={fadeUp}><SectionLabel>Signature Collection</SectionLabel></motion.div>
                    <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold text-[#1A0A10]">
                        Our Finest <span className="italic text-[#7A1F3D]">Expressions</span>
                    </motion.h2>
                </motion.div>

                {/* Featured wine display */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={safeActive}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="grid lg:grid-cols-2 gap-12 items-center mb-12"
                    >
                        {/* Wine bottle image */}
                        <div className="flex justify-center">
                            <div className="relative w-64 h-80 lg:w-80 lg:h-[400px]">
                                {/* Glow */}
                                <div className="absolute inset-0 scale-75 rounded-full bg-[#C89B3C]/10 blur-3xl" />
                                <div className="relative h-full rounded-3xl overflow-hidden shadow-2xl border border-[#EDE5D8]">
                                    <Image
                                        src={wine.image || 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600&q=80'}
                                        alt={wine.name}
                                        fill
                                        className="object-cover"
                                        sizes="320px"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A10]/30 to-transparent" />
                                    {/* Type badge */}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                                        <span className="text-[10px] font-bold text-[#7A1F3D] tracking-wider uppercase">{wine.type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Wine details */}
                        <div className="space-y-6">
                            <div>
                                <p className="text-[#C89B3C] text-sm font-semibold tracking-wider uppercase mb-2">{wine.vintage} Vintage · {wine.grapes}</p>
                                <h3 className="font-serif text-4xl font-bold text-[#1A0A10] mb-2">{wine.name}</h3>
                                <p className="text-[#8B6E5A] text-sm">{wine.region}</p>
                            </div>

                            {/* Score */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-[#7A1F3D] flex flex-col items-center justify-center shadow-lg">
                                    <span className="font-serif text-2xl font-bold text-white">{wine.rating || 92}</span>
                                    <span className="text-[8px] text-[#C89B3C] tracking-wider uppercase">pts</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#1A0A10]">Critic Score</p>
                                    <p className="text-xs text-[#8B6E5A]">Sommelier Evaluation</p>
                                </div>
                            </div>

                            {/* Tasting notes */}
                            <div className="bg-white rounded-2xl p-5 border border-[#EDE5D8]">
                                <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#C89B3C] mb-2">Tasting Notes</p>
                                <p className="text-[#5C4033] text-sm italic leading-relaxed">&ldquo;{wine.notes}&rdquo;</p>
                            </div>

                            {/* Price + CTA */}
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="text-[10px] text-[#A08070] uppercase tracking-wider">From</p>
                                    <p className="font-serif text-3xl font-bold text-[#1A0A10]">{wine.currency || '₹'}{(wine.price || 0).toLocaleString()}</p>
                                </div>
                                <motion.a
                                    href="/wines"
                                    whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(122,31,61,0.3)' }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex-1 text-center bg-[#7A1F3D] hover:bg-[#9A2F52] text-white font-bold text-sm py-3.5 rounded-2xl transition-colors shadow-lg"
                                >
                                    View Wine Catalog
                                </motion.a>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Wine selector tabs */}
                {wines.length > 1 && (
                    <div className="flex flex-wrap gap-3 justify-center">
                        {wines.map((w, i) => (
                            <motion.button
                                key={w.id || i}
                                onClick={() => setActive(i)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 ${safeActive === i
                                    ? 'bg-[#7A1F3D] border-[#7A1F3D] text-white shadow-lg'
                                    : 'bg-white border-[#EDE5D8] text-[#5C4033] hover:border-[#C89B3C]'
                                    }`}
                            >
                                <div className="relative w-8 h-10 rounded-lg overflow-hidden shrink-0">
                                    <Image src={w.image || 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600&q=80'} alt={w.name} fill className="object-cover" sizes="32px" />
                                </div>
                                <div className="text-left">
                                    <p className={`text-xs font-bold leading-tight ${safeActive === i ? 'text-white' : 'text-[#1A0A10]'}`}>{w.name}</p>
                                    <p className={`text-[10px] ${safeActive === i ? 'text-[#E8D49C]' : 'text-[#A08070]'}`}>{w.vintage} · {w.type}</p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

// ─── Virtual Tour / Estate Map ─────────────────────────────────────────────────
function VirtualTourSection() {
    const spots = [
        { id: 1, label: 'Vineyards', icon: '🍇', x: '15%', y: '35%', desc: 'Over 1,600 acres of sun-drenched volcanic terroir, hand-tended with sustainable methods.' },
        { id: 2, label: 'Wine Cellar', icon: '🪣', x: '35%', y: '55%', desc: 'Temperature-controlled underground aging cellars housing 2,000+ French oak barrels.' },
        { id: 3, label: 'Tasting Room', icon: '🍷', x: '55%', y: '30%', desc: 'Panoramic glass-walled lounge for immersive sommelier-guided tasting sessions.' },
        { id: 4, label: 'Restaurant', icon: '🍽️', x: '72%', y: '50%', desc: 'Award-winning Little Italy restaurant with seasonal menus and vineyard views.' },
        { id: 5, label: 'Gift Shop', icon: '🎁', x: '85%', y: '25%', desc: 'Curate your personal collection and take home the finest Sula expressions.' },
    ]
    const [hoveredSpot, setHoveredSpot] = useState<number | null>(null)

    return (
        <section className="bg-[#1A0A10] py-24 lg:py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <motion.div variants={fadeUp}>
                        <SectionLabel>Explore the Estate</SectionLabel>
                    </motion.div>
                    <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold text-white">
                        Your Virtual <span className="italic text-[#C89B3C]">Vineyard Tour</span>
                    </motion.h2>
                    <motion.p variants={fadeUp} className="mt-3 text-[#8B6E5A] max-w-lg mx-auto text-sm">
                        Hover over each location to discover what awaits you at the estate
                    </motion.p>
                </motion.div>

                {/* Map container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative rounded-[2.5rem] overflow-hidden border border-[#C89B3C]/20 shadow-2xl"
                    style={{ height: '480px' }}
                >
                    <Image
                        src="https://res.cloudinary.com/xfklkvdc/image/upload/v1784636572/wineries_siqmmn.webp"
                        alt="Estate map"
                        fill
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-[#1A0A10]/50" />

                    {/* Hotspots */}
                    {spots.map((spot) => (
                        <div
                            key={spot.id}
                            className="absolute"
                            style={{ left: spot.x, top: spot.y, transform: 'translate(-50%, -50%)' }}
                            onMouseEnter={() => setHoveredSpot(spot.id)}
                            onMouseLeave={() => setHoveredSpot(null)}
                        >
                            {/* Pulsing ring */}
                            <div className="relative cursor-pointer group">
                                <div className="absolute inset-0 rounded-full bg-[#C89B3C] animate-ping opacity-30" />
                                <motion.div
                                    whileHover={{ scale: 1.2 }}
                                    className="relative w-11 h-11 rounded-full bg-[#C89B3C]/90 backdrop-blur-sm border-2 border-[#F5DCA0] flex items-center justify-center shadow-lg shadow-[#C89B3C]/30"
                                >
                                    <span className="text-lg">{spot.icon}</span>
                                </motion.div>

                                {/* Label */}
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                    <span className="text-[10px] font-bold text-[#E8D49C] tracking-wider uppercase">{spot.label}</span>
                                </div>

                                {/* Tooltip */}
                                <AnimatePresence>
                                    {hoveredSpot === spot.id && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-[#EDE5D8] z-50"
                                        >
                                            <p className="text-[10px] font-bold text-[#C89B3C] uppercase tracking-wider mb-1">{spot.label}</p>
                                            <p className="text-[11px] text-[#5C4033] leading-relaxed">{spot.desc}</p>
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                                                <div className="border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/95" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}

                    {/* Bottom legend */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-[#C89B3C] animate-pulse" />
                        <span className="text-[10px] text-white/70 tracking-wider">Hover over locations to explore</span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

// ─── Awards & Recognition ─────────────────────────────────────────────────────
function AwardsSection({ winery }: { winery: WineryDetails }) {
    const awards = winery?.awards || []
    if (awards.length === 0) return null

    return (
        <section className="bg-[#F8F4EE] py-24 lg:py-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <motion.div variants={fadeUp}><SectionLabel>Recognition</SectionLabel></motion.div>
                    <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold text-[#1A0A10]">
                        Awards & <span className="italic text-[#7A1F3D]">Honours</span>
                    </motion.h2>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {awards.map((award, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.6 }}
                            whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(122,31,61,0.12)' }}
                            className="bg-white rounded-3xl p-6 border border-[#EDE5D8] transition-all duration-300 group"
                        >
                            {/* Gold accent bar */}
                            <div className="w-full h-0.5 bg-gradient-to-r from-[#C89B3C] via-[#E8D49C] to-[#C89B3C] rounded-full mb-5" />

                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#C89B3C]/10 flex items-center justify-center">
                                    <Award size={22} className="text-[#C89B3C]" />
                                </div>
                                <MedalBadge medal={award.medal || 'Gold'} />
                            </div>

                            <h4 className="font-serif text-lg font-bold text-[#1A0A10] mb-1 group-hover:text-[#7A1F3D] transition-colors">{award.title}</h4>
                            <p className="text-xs text-[#A08070] mb-3">{award.competition}</p>

                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-px bg-[#EDE5D8]" />
                                <span className="font-serif text-lg font-bold text-[#C89B3C]">{award.year}</span>
                                <div className="flex-1 h-px bg-[#EDE5D8]" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ─── Visitor Experience Packages ──────────────────────────────────────────────
function VisitorSection({ winery }: { winery: WineryDetails }) {
    const packages = winery?.packages || []
    if (packages.length === 0 && !winery?.timings && !winery?.phone && !winery?.email) return null

    return (
        <section id="packages" className="bg-white py-24 lg:py-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <motion.div variants={fadeUp}><SectionLabel>Plan Your Visit</SectionLabel></motion.div>
                    <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold text-[#1A0A10]">
                        Tasting <span className="italic text-[#7A1F3D]">Experiences</span>
                    </motion.h2>
                    <motion.div variants={fadeUp} className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-[#8B6E5A]">
                        {winery?.timings && <span className="flex items-center gap-1.5"><Clock size={13} className="text-[#C89B3C]" />{winery.timings}</span>}
                        {winery?.phone && <span className="flex items-center gap-1.5"><Phone size={13} className="text-[#C89B3C]" />{winery.phone}</span>}
                        {winery?.email && <span className="flex items-center gap-1.5"><Mail size={13} className="text-[#C89B3C]" />{winery.email}</span>}
                    </motion.div>
                </motion.div>

                {packages.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-6">
                        {packages.map((pkg, i) => (
                            <motion.div
                                key={pkg.id || i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12, duration: 0.65 }}
                                className={`relative rounded-3xl overflow-hidden border transition-all duration-300 ${pkg.highlight
                                    ? 'border-[#C89B3C] shadow-2xl shadow-[#C89B3C]/15 scale-[1.02]'
                                    : 'border-[#EDE5D8] hover:border-[#C89B3C]/50 hover:shadow-xl'
                                    }`}
                            >
                                {pkg.highlight && (
                                    <div className="absolute top-0 left-0 right-0 bg-[#C89B3C] text-[#1A0A10] text-[10px] font-bold tracking-[0.2em] uppercase py-1.5 text-center">
                                        Most Popular
                                    </div>
                                )}
                                <div className={`p-8 ${pkg.highlight ? 'bg-[#FDF8EE] pt-10' : 'bg-white'}`}>
                                    <div className="mb-6">
                                        <p className="text-xs text-[#A08070] uppercase tracking-wider mb-1">{pkg.duration}</p>
                                        <h3 className="font-serif text-2xl font-bold text-[#1A0A10] mb-3">{pkg.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-serif text-4xl font-bold text-[#7A1F3D]">{pkg.currency || '₹'}{(pkg.price || 0).toLocaleString()}</span>
                                            <span className="text-xs text-[#A08070]">per person</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 mb-8">
                                        {(pkg.includes || []).map((item, j) => (
                                            <div key={j} className="flex items-start gap-2.5">
                                                <CheckCircle2 size={14} className="text-[#C89B3C] shrink-0 mt-0.5" />
                                                <span className="text-xs text-[#5C4033] leading-relaxed">{item}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href="/experiences"
                                        className={`w-full block text-center py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.03] active:scale-[0.97] ${pkg.highlight
                                            ? 'bg-[#7A1F3D] text-white shadow-lg hover:bg-[#9A2F52]'
                                            : 'border-2 border-[#7A1F3D] text-[#7A1F3D] hover:bg-[#7A1F3D] hover:text-white'
                                            }`}
                                    >
                                        Book This Experience
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
function GallerySection({ winery }: { winery: WineryDetails }) {
    const gallery = winery?.gallery || []
    const [lightbox, setLightbox] = useState<string | null>(null)

    if (gallery.length === 0) return null

    return (
        <section className="bg-[#F8F4EE] py-24 lg:py-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <motion.div variants={fadeUp}><SectionLabel>Gallery</SectionLabel></motion.div>
                    <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold text-[#1A0A10]">
                        Moments <span className="italic text-[#7A1F3D]">Worth Savouring</span>
                    </motion.h2>
                </motion.div>

                {/* Masonry grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[200px]">
                    {gallery.map((img, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.97 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07, duration: 0.5 }}
                            onClick={() => setLightbox(img.src)}
                            className={`relative rounded-2xl overflow-hidden cursor-pointer group ${img.span === 'wide' ? 'col-span-2' : img.span === 'tall' ? 'row-span-2' : ''}`}
                        >
                            <Image
                                src={img.src || 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80'}
                                alt={img.alt || 'Gallery photo'}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-[#1A0A10]/0 group-hover:bg-[#1A0A10]/40 transition-all duration-300" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <ExternalLink size={16} className="text-white" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#0B0408]/95 flex items-center justify-center p-4"
                        onClick={() => setLightbox(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="relative max-w-4xl w-full max-h-[80vh] aspect-video rounded-3xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <Image src={lightbox} alt="Gallery" fill className="object-cover" sizes="100vw" />
                        </motion.div>
                        <button
                            onClick={() => setLightbox(null)}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <X size={18} className="text-white" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
function ReviewsSection({ winery }: { winery: WineryDetails }) {
    const reviews = winery?.reviews || []
    const [current, setCurrent] = useState(0)

    if (reviews.length === 0) return null
    const safeCurrent = current < reviews.length ? current : 0
    const activeReview = reviews[safeCurrent]
    if (!activeReview) return null

    return (
        <section className="bg-[#7A1F3D] py-24 lg:py-32 overflow-hidden relative">
            {/* Vine decorative */}
            <svg className="absolute left-0 top-0 h-full w-24 opacity-10 text-[#C89B3C]" viewBox="0 0 100 600" preserveAspectRatio="none">
                <path d="M 50 0 Q 20 100 50 200 Q 80 300 50 400 Q 20 500 50 600" stroke="currentColor" strokeWidth="2" fill="none" />
                {[100, 200, 300, 400, 500].map(y => (
                    <circle key={y} cx={y % 2 === 0 ? 30 : 70} cy={y} r="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
                ))}
            </svg>

            <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.div variants={fadeUp}>
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-8 h-px bg-[#C89B3C]/60" />
                            <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#C89B3C]">Guest Stories</span>
                            <div className="w-8 h-px bg-[#C89B3C]/60" />
                        </div>
                    </motion.div>
                    <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold text-white mb-12">
                        What Our <span className="italic text-[#E8D49C]">Guests Say</span>
                    </motion.h2>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={safeCurrent}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.5 }}
                        className="mb-10"
                    >
                        <div className="relative inline-block mb-6">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C89B3C] mx-auto">
                                <Image
                                    src={activeReview.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80'}
                                    alt={activeReview.author || 'Guest'}
                                    width={64} height={64}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center mb-4">
                            <StarRating rating={activeReview.rating || 5} size={18} />
                        </div>

                        <blockquote className="font-serif text-xl md:text-2xl text-white/90 italic leading-relaxed mb-6 max-w-2xl mx-auto">
                            &ldquo;{activeReview.text}&rdquo;
                        </blockquote>

                        <div>
                            <p className="font-semibold text-[#E8D49C] text-sm">{activeReview.author}</p>
                            <p className="text-xs text-[#C89B3C]/70 mt-0.5">{activeReview.visit || 'Estate Visit'} · {activeReview.date || 'Recent'}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                {reviews.length > 1 && (
                    <div className="flex items-center justify-center gap-6">
                        <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrent((c) => (c - 1 + reviews.length) % reviews.length)}
                            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </motion.button>
                        <div className="flex gap-2">
                            {reviews.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`transition-all duration-300 rounded-full ${i === safeCurrent ? 'w-6 h-2 bg-[#C89B3C]' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`}
                                />
                            ))}
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrent((c) => (c + 1) % reviews.length)}
                            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </motion.button>
                    </div>
                )}
            </div>
        </section>
    )
}

// ─── Related Wineries ─────────────────────────────────────────────────────────
function RelatedWineriesSection({ winery }: { winery: WineryDetails }) {
    const related = winery?.relatedWineries || []
    if (related.length === 0) return null

    return (
        <section className="bg-[#F8F4EE] py-24 lg:py-28">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex items-end justify-between mb-12"
                >
                    <div>
                        <motion.div variants={fadeUp}><SectionLabel>Explore More</SectionLabel></motion.div>
                        <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-4xl font-bold text-[#1A0A10]">
                            You May Also <span className="italic text-[#7A1F3D]">Love</span>
                        </motion.h2>
                    </div>
                    <Link href="/wineries">
                        <motion.span
                            whileHover={{ x: 4 }}
                            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-[#7A1F3D] hover:gap-3 transition-all"
                        >
                            All Wineries <ArrowRight size={14} />
                        </motion.span>
                    </Link>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {related.map((rel, i) => (
                        <motion.div
                            key={rel.id || i}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.65 }}
                        >
                            <Link href={`/wineries/${rel.id}`} className="group block">
                                <div className="relative h-56 rounded-3xl overflow-hidden mb-4 shadow-lg">
                                    <Image
                                        src={rel.image || 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&q=80'}
                                        alt={rel.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-108"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A10]/60 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="font-serif text-lg font-bold text-white">{rel.name}</h3>
                                        <p className="text-xs text-[#E8D49C] flex items-center gap-1 mt-0.5">
                                            <MapPin size={9} />{rel.location}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between px-1">
                                    <StarRating rating={rel.rating || 4.5} size={12} />
                                    <span className="text-sm font-bold text-[#1A0A10]">{(rel.rating || 4.5).toFixed(1)}</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ─── Main Client Component ─────────────────────────────────────────────────────
export function WineryDetailClient({ winery }: { winery: WineryDetails }) {
    if (!winery) return null

    return (
        <main className="font-sans bg-[#F8F4EE]">
            {/* Breadcrumb nav */}
            <nav className="fixed top-[72px] left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-b border-[#EDE5D8]">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-2.5 flex items-center gap-2 text-[11px] text-[#A08070]">
                    <Link href="/" className="hover:text-[#7A1F3D] transition-colors">Home</Link>
                    <ChevronRight size={10} />
                    <Link href="/wineries" className="hover:text-[#7A1F3D] transition-colors">Wineries</Link>
                    <ChevronRight size={10} />
                    <span className="text-[#7A1F3D] font-semibold">{winery?.name || 'Winery'}</span>
                </div>
            </nav>

            <div className="pt-[108px]">
                <HeroSection winery={winery} />
                <StorySection winery={winery} />
                <EstateSection winery={winery} />
                <WineCollectionSection winery={winery} />
                <VirtualTourSection />
                <AwardsSection winery={winery} />
                <VisitorSection winery={winery} />
                <GallerySection winery={winery} />
                <ReviewsSection winery={winery} />
                <RelatedWineriesSection winery={winery} />
            </div>
        </main>
    )
}
