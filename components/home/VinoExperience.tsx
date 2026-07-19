'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    Sparkles,
    BookOpen,
    UtensilsCrossed,
    GlassWater,
    ArrowRight,
} from 'lucide-react'
import { images } from '@/constants/images'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feature {
    icon: React.ReactNode
    title: string
    description: string
}

// ─── Feature data ─────────────────────────────────────────────────────────────

const FEATURES: Feature[] = [
    {
        icon: <Sparkles size={18} />,
        title: 'AI Wine Recommendations',
        description:
            'Intelligent, personalised pairings built around your unique palate.',
    },
    {
        icon: <BookOpen size={18} />,
        title: 'Curated Collections',
        description:
            "Hand-selected bottles from the world's most prestigious estates.",
  },
    {
        icon: <UtensilsCrossed size={18} />,
        title: 'Food Pairings',
        description:
            'Discover the perfect culinary match for every bottle in your cellar.',
    },
    {
        icon: <GlassWater size={18} />,
        title: 'Exclusive Wine Experiences',
        description:
            'Private tastings, vineyard tours, and sommelier-led masterclasses.',
    },
]

// ─── Animation variants ───────────────────────────────────────────────────────

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
}

const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
}

const fadeRight = {
    hidden: { opacity: 0, x: 30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
}

// ─── Feature card ─────────────────────────────────────────────────────────────

const FeatureCard: React.FC<Feature> = ({ icon, title, description }) => (
    <motion.div
        variants={fadeUp}
        whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.45)' }}
        transition={{ duration: 0.25 }}
        className="
      group flex flex-col gap-3
      rounded-2xl p-5
      bg-white/[0.05] backdrop-blur-lg
      border border-white/[0.09]
      shadow-[0_4px_20px_rgba(0,0,0,0.28)]
      cursor-default select-none
    "
    >
        {/* Icon chip */}
        <div
            className="
        w-10 h-10 rounded-xl flex items-center justify-center shrink-0
        bg-vino-accent/20 text-vino-gold
        group-hover:bg-vino-accent/35 transition-colors duration-300
      "
        >
            {icon}
        </div>

        {/* Title */}
        <h4 className="font-semibold text-white text-[13.5px] leading-snug tracking-tight">
            {title}
        </h4>

        {/* Thin gold rule */}
        <div className="w-6 h-px bg-vino-gold/50" />

        {/* Description */}
        <p className="text-white/52 text-xs leading-relaxed">
            {description}
        </p>
    </motion.div>
)

// ─── Main section ─────────────────────────────────────────────────────────────

export const VinoExperience: React.FC = () => {
    return (
        <section
            className="relative w-full overflow-hidden bg-vino-dark"
            aria-labelledby="vino-experience-heading"
        >
            {/* ── Background image ──────────────────────────────────────────────
          Desktop: image pinned to the left at natural proportions
          Mobile:  image covers the full section (separate layer)
      ─────────────────────────────────────────────────────────────────── */}

            {/* Desktop bg — left-anchored, natural height */}
            <div
                aria-hidden="true"
                className="absolute inset-0 z-0 hidden lg:block"
                style={{
                    backgroundImage: `url('${images.experience.background}')`,
                    backgroundSize: 'auto 100%',
                    backgroundPosition: 'left center',
                    backgroundRepeat: 'no-repeat',
                }}
            />

            {/* Mobile bg — cover so small screens don't show a sliver */}
            <div
                aria-hidden="true"
                className="absolute inset-0 z-0 lg:hidden"
                style={{
                    backgroundImage: `url('${images.experience.background}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                }}
            />

            {/* ── Overlays ──────────────────────────────────────────────────────
          Desktop: gradient from transparent (left/bottle) → dark (right/text)
          Mobile:  heavy uniform tint so text is always readable
      ─────────────────────────────────────────────────────────────────── */}

            {/* Base tint — both viewports */}
            <div className="absolute inset-0 z-[1] bg-black/45" />

            {/* Desktop directional gradient */}
            <div className="absolute inset-0 z-[2] hidden lg:block bg-gradient-to-r from-black/5 via-black/35 to-black/82" />

            {/* Mobile heavier uniform overlay */}
            <div className="absolute inset-0 z-[2] lg:hidden bg-black/30" />

            {/* ── Content ──────────────────────────────────────────────────────── */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28">

                {/*
          Layout:
            Desktop  → 2 columns, left col is empty (bottle shows through),
                        right col holds all content
            Tablet+  → single column, centered
        */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-0">

                    {/* Left spacer — desktop only, keeps bottle unobstructed */}
                    <div className="hidden lg:block" aria-hidden="true" />

                    {/* Right content column */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-70px' }}
                        className="flex flex-col gap-6 lg:pl-6 xl:pl-10"
                    >

                        {/* ── Eyebrow ── */}
                        <motion.div variants={fadeRight} className="flex items-center gap-3">
                            <div className="h-px w-7 bg-vino-gold" />
                            <span className="text-[10.5px] tracking-[0.24em] uppercase font-semibold text-vino-gold">
                                The VinoSphere Experience
                            </span>
                        </motion.div>

                        {/* ── Heading ── */}
                        <motion.h2
                            id="vino-experience-heading"
                            variants={fadeRight}
                            className="font-serif font-bold leading-[1.08] text-vino-cream"
                        >
                            <span className="block text-[1.85rem] sm:text-[2.3rem] lg:text-[2.65rem] xl:text-[3.1rem]">
                                More Than Wine.
                            </span>
                            <span className="block text-[1.85rem] sm:text-[2.3rem] lg:text-[2.65rem] xl:text-[3.1rem]">
                                A Journey of{' '}
                                <span className="bg-gradient-to-r from-vino-gold via-vino-gold-light to-vino-gold bg-clip-text text-transparent">
                                    Discovery.
                                </span>
                            </span>
                        </motion.h2>

                        {/* ── Description ── */}
                        <motion.p
                            variants={fadeRight}
                            className="text-white/62 text-sm sm:text-[15px] leading-[1.8] max-w-[460px]"
                        >
                            Discover wine like never before with AI-powered recommendations,
                            curated collections, perfect food pairings, and exclusive tasting
                            experiences — all tailored to your personal taste.
                        </motion.p>

                        {/* ── 2×2 Feature grid ── */}
                        <motion.div
                            variants={stagger}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        >
                            {FEATURES.map((f) => (
                                <FeatureCard key={f.title} {...f} />
                            ))}
                        </motion.div>

                        {/* ── CTA button ── */}
                        <motion.div variants={fadeRight} className="pt-1">
                            <motion.button
                                whileHover={{
                                    scale: 1.03,
                                    boxShadow: '0 0 28px rgba(200,155,60,0.28)',
                                }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ duration: 0.22 }}
                                className="
                  group inline-flex items-center gap-2.5
                  bg-vino-accent hover:bg-vino-accent-light
                  text-white font-semibold text-[13.5px] tracking-wide
                  px-7 py-3.5 rounded-full
                  transition-colors duration-300
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-vino-gold focus-visible:ring-offset-2
                  focus-visible:ring-offset-transparent
                "
                            >
                                Begin Your Wine Journey
                                <ArrowRight
                                    size={15}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </motion.button>
                        </motion.div>

                    </motion.div>
                </div>
            </div>
        </section>
    )
}
