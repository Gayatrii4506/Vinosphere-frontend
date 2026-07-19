'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { images } from '@/constants/images'

export const Hero: React.FC = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.13, delayChildren: 0.25 },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        },
    }

    return (
        <section className="relative w-full min-h-screen overflow-hidden bg-vino-dark">

            {/* ─────────────────────────────────────────────────────────
          RIGHT-SIDE image — absolute, fills the right half on
          desktop, full section on mobile (behind content).
          This way the image NEVER shifts or reflows.
      ───────────────────────────────────────────────────────── */}
            <div className="absolute inset-0 lg:left-[50%] z-0">
                <CloudinaryImage
                    src={images.hero.background}
                    alt="Premium wine collection — bottles, glasses and grapes"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    quality={90}
                    className="object-cover object-center"
                />
                {/* Left-edge fade so image blends into dark left column on desktop */}
                <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-vino-dark to-transparent z-10 hidden lg:block" />
                {/* Bottom depth */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-vino-dark/60 to-transparent z-10" />
            </div>

            {/* Mobile overlay — darkens the bg image so text is readable on small screens */}
            <div className="absolute inset-0 bg-vino-dark/70 z-[1] lg:hidden" />

            {/* Desktop left-column background so text always sits on dark */}
            <div className="absolute inset-y-0 left-0 w-1/2 bg-vino-dark z-[1] hidden lg:block" />

            {/* Ambient glows */}
            <div className="absolute bottom-1/4 left-0 w-72 h-72 rounded-full bg-vino-accent/10 blur-3xl pointer-events-none z-[2]" />
            <div className="absolute top-1/3 left-0 w-56 h-56 rounded-full bg-vino-gold/5 blur-3xl pointer-events-none z-[2]" />

            {/* ── Content ── */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
                <div className="w-full lg:max-w-[50%]">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="pt-28 pb-16 space-y-5"
                    >
                        {/* Sub-label */}
                        <motion.p
                            variants={itemVariants}
                            className="text-vino-gray-dark text-xs sm:text-sm font-light tracking-widest uppercase"
                        >
                            The finest collections of 2025
                        </motion.p>

                        {/* Headline */}
                        <motion.h1
                            variants={itemVariants}
                            className="font-serif font-bold text-white leading-[1.06]"
                        >
                            <span className="block text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] lg:text-[3.5rem] xl:text-[4rem]">
                                Discover the
                            </span>
                            <span className="block text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] lg:text-[3.5rem] xl:text-[4rem] bg-gradient-to-r from-vino-gold via-vino-gold-light to-vino-gold bg-clip-text text-transparent">
                                World&apos;s Finest
                            </span>
                            <span className="block text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] lg:text-[3.5rem] xl:text-[4rem]">
                                Wines
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            variants={itemVariants}
                            className="text-vino-gray-dark text-sm sm:text-base leading-relaxed max-w-sm sm:max-w-md"
                        >
                            Explore curated collections from the world&apos;s most prestigious
                            vineyards. Discover your perfect wine, attend exclusive tastings,
                            and elevate every occasion.
                        </motion.p>

                        {/* Stats */}
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center gap-4 sm:gap-7"
                        >
                            {[
                                { value: '500+', label: 'Curated Wines' },
                                { value: '40+', label: 'Regions' },
                                { value: '12k+', label: 'Enthusiasts' },
                            ].map((stat, i) => (
                                <React.Fragment key={stat.label}>
                                    <div className="flex flex-col">
                                        <span className="font-serif text-base sm:text-lg font-bold text-vino-gold">
                                            {stat.value}
                                        </span>
                                        <span className="text-[11px] sm:text-xs text-vino-gray-dark tracking-wide">
                                            {stat.label}
                                        </span>
                                    </div>
                                    {i < 2 && <div className="w-px h-7 bg-vino-accent/30" />}
                                </React.Fragment>
                            ))}
                        </motion.div>

                        {/* CTAs */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-3 pt-1"
                        >
                            <Button
                                size="lg"
                                variant="primary"
                                className="tracking-wide text-sm sm:text-base w-full sm:w-auto"
                            >
                                Explore Collection
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="tracking-wide text-sm sm:text-base w-full sm:w-auto"
                            >
                                Book a Tasting
                            </Button>
                        </motion.div>

                        {/* Rating */}
                        <motion.div variants={itemVariants} className="flex items-center gap-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} className="text-vino-gold fill-vino-gold" />
                                ))}
                            </div>
                            <span className="text-xs text-vino-gray-dark">
                                Trusted by{' '}
                                <span className="text-white font-medium">12,000+</span> wine lovers
                            </span>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll indicator */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 7, 0] }}
                transition={{
                    opacity: { delay: 2, duration: 0.5 },
                    y: { delay: 2, duration: 2, repeat: Infinity },
                }}
                aria-label="Scroll down"
                className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 text-vino-gold hover:text-vino-gold-light transition-colors"
                onClick={() =>
                    document.getElementById('featured-wines')?.scrollIntoView({ behavior: 'smooth' })
                }
            >
                <ChevronDown size={24} />
            </motion.button>
        </section>
    )
}
