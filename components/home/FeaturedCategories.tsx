'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { images } from '@/constants/images'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Category {
    id: string
    badge: string       // small label above title e.g. "Light Taste"
    title: string       // e.g. "WHITE WINE"
    description: string
    href: string
    image: string       // Cloudinary URL from constants/images
    /**
     * Optional per-image scale multiplier (default 1.0).
     * Nudge this between ~0.90–1.10 to visually normalise bottles
     * whose source dimensions differ, without touching the layout.
     */
    imageScale?: number
}

// ─── Data ───────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
    {
        id: 'white-wine',
        badge: 'Light & Crisp',
        title: 'White Wine',
        description: 'Delicate aromas of citrus and stone fruit with a refreshing finish.',
        href: '/discover/wines?type=White',
        image: images.categories.card1,
        imageScale: 1.0,
    },
    {
        id: 'winter-spirit',
        badge: 'Special Choice',
        title: 'Winter Spirit',
        description: 'Warm, full-bodied selections perfect for intimate evenings by the fire.',
        href: '/discover/wines?type=Red',
        image: images.categories.card2,
        imageScale: 1.0,
    },
    {
        id: 'tasting-day',
        badge: 'Experience',
        title: 'Tasting Day',
        description: 'Curated flights guided by our sommeliers in an exclusive setting.',
        href: '/discover/wines',
        image: images.categories.card3,
        imageScale: 1.0,
    },
]

// ─── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
}

// ─── Sub-components ─────────────────────────────────────────────────────────

const CategoryCard: React.FC<{ category: Category; index: number }> = ({
    category,
    index,
}) => {
    const scale = category.imageScale ?? 1.0

    return (
        <Link href={category.href} className="block group">
            <motion.article
                variants={cardVariants}
                className="flex flex-col cursor-pointer"
            >
                {/* ── Image container ── */}
                <div
                    className="
                        group relative w-full overflow-hidden rounded-2xl
                        aspect-[3/3.8] sm:aspect-[3/4] lg:aspect-[3/4.2]
                        bg-gradient-to-b from-vino-cream-dark via-vino-parchment to-vino-cream-dark
                        shadow-sm group-hover:shadow-lg transition-shadow duration-500
                    "
                >
                    {/*
                     * Bottle stage — a flex container that occupies the card
                     * height and is centred both axes. This guarantees every bottle
                     * renders at the same visual height regardless of source dimensions.
                     */}
                    <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ padding: '6% 8%' }}
                    >
                        <div
                            className="relative w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                            style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
                        >
                            <CloudinaryImage
                                src={category.image}
                                alt={category.title}
                                fill
                                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                                quality={90}
                                className="object-contain object-center"
                            />
                        </div>
                    </div>

                    {/* Soft radial glow behind bottle */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_65%_at_50%_48%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />

                    {/* Inner border — consistent with WineGallery cards */}
                    <div
                        className="
                            absolute inset-[5px] rounded-[calc(1rem-5px)] pointer-events-none
                            border border-[rgba(201,170,113,0.22)]
                            transition-all duration-300
                            group-hover:border-[rgba(201,170,113,0.42)]
                        "
                    />
                </div>

                {/* ── Text content ── */}
                <div className="pt-5 pb-2 px-1 space-y-1.5">
                    {/* Badge — small caps label */}
                    <p className="text-[11px] tracking-[0.22em] uppercase text-vino-brown-light font-semibold">
                        {category.badge}
                    </p>

                    {/* Title */}
                    <h3 className="font-serif text-2xl sm:text-[1.6rem] md:text-3xl font-bold text-vino-brown tracking-tight leading-snug group-hover:text-vino-accent transition-colors duration-300">
                        {category.title}
                    </h3>

                    {/* Thin gold divider */}
                    <div className="w-8 h-px bg-vino-gold mt-1" />

                    {/* Description */}
                    <p className="text-sm text-vino-brown-light leading-relaxed pt-0.5">
                        {category.description}
                    </p>

                    {/* CTA link */}
                    <div className="flex items-center gap-1.5 pt-2">
                        <span className="text-sm font-semibold text-vino-accent tracking-wide group-hover:underline">
                            Explore
                        </span>
                        <ArrowRight
                            size={14}
                            className="text-vino-accent transition-transform duration-300 group-hover:translate-x-1.5"
                        />
                    </div>
                </div>
            </motion.article>
        </Link>
    )
}

// ─── Main Section ────────────────────────────────────────────────────────────

export const FeaturedCategories: React.FC = () => {
    return (
        <section
            id="featured-wines"
            className="relative w-full bg-vino-cream overflow-hidden"
        >
            {/* Subtle background texture dots */}
            <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, #5C4033 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

                {/* ── Section header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10"
                >
                    <div className="space-y-2">
                        {/* Eyebrow */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-px bg-vino-accent" />
                            <span className="text-xs tracking-[0.2em] uppercase text-vino-accent font-semibold">
                                Explore by Style
                            </span>
                        </div>

                        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-vino-brown leading-tight">
                            Curated for Every
                            <br />
                            <span className="text-vino-accent">Palate</span>
                        </h2>
                    </div>

                    {/* Decorative gold line */}
                    <div className="hidden sm:flex flex-col items-end gap-1 text-right">
                        <div className="w-24 h-px bg-vino-gold" />
                        <p className="text-sm text-vino-brown-light max-w-xs leading-relaxed">
                            From crisp whites to bold reds — discover wines that tell a story.
                        </p>
                    </div>
                </motion.div>

                {/* ── Cards grid ── */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 lg:gap-12"
                >
                    {CATEGORIES.map((category, index) => (
                        <CategoryCard key={category.id} category={category} index={index} />
                    ))}
                </motion.div>

                {/* ── Bottom decorative strip ── */}
                <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
                    className="mt-16 md:mt-20 flex items-center gap-4"
                >
                    <div className="flex-1 h-px bg-vino-parchment" />
                    <div className="flex items-center gap-2 px-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-vino-gold" />
                        <span className="text-xs tracking-[0.15em] uppercase text-vino-brown-light font-medium">
                            VinoSphere Curated
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-vino-gold" />
                    </div>
                    <div className="flex-1 h-px bg-vino-parchment" />
                </motion.div>
            </div>
        </section>
    )
}
