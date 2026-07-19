'use client'

import React from 'react'
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
}

// ─── Data ───────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
    {
        id: 'white-wine',
        badge: 'Light & Crisp',
        title: 'White Wine',
        description: 'Delicate aromas of citrus and stone fruit with a refreshing finish.',
        href: '/discover/white-wine',
        image: images.categories.card1,
    },
    {
        id: 'winter-spirit',
        badge: 'Special Choice',
        title: 'Winter Spirit',
        description: 'Warm, full-bodied selections perfect for intimate evenings by the fire.',
        href: '/discover/winter-spirit',
        image: images.categories.card2,
    },
    {
        id: 'tasting-day',
        badge: 'Experience',
        title: 'Tasting Day',
        description: 'Curated flights guided by our sommeliers in an exclusive setting.',
        href: '/experiences/tastings',
        image: images.categories.card3,
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
    return (
        <motion.article
            variants={cardVariants}
            className="group flex flex-col cursor-pointer"
        >
            {/* ── Image container ── */}
            {/*
                Tall portrait frame — matches the screenshot's bottle proportions.
                - aspect-[3/4] on mobile, forced min-h on desktop so bottles are generous
                - bg gradient mimics the soft vignette in the reference image
                - object-contain keeps the full bottle visible (no cropping)
            */}
            <div
                className="
                    relative w-full overflow-hidden rounded-2xl
                    aspect-[3/4] sm:aspect-[2/3] lg:aspect-[3/5]
                    bg-gradient-to-b from-vino-cream-dark via-vino-parchment to-vino-cream-dark
                    shadow-sm group-hover:shadow-lg transition-shadow duration-500
                "
            >
                <CloudinaryImage
                    src={category.image}
                    alt={category.title}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                    quality={90}
                    className="
                        object-contain object-center
                        px-6 py-8
                        transition-transform duration-700 ease-out
                        group-hover:scale-[1.04]
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
                    <span className="text-sm font-semibold text-vino-accent tracking-wide">
                        Explore
                    </span>
                    <ArrowRight
                        size={14}
                        className="text-vino-accent transition-transform duration-300 group-hover:translate-x-1.5"
                    />
                </div>
            </div>
        </motion.article>
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

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">

                {/* ── Section header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14 md:mb-16"
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
