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
            transition: { staggerChildren: 0.15, delayChildren: 0.3 },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        },
    }

    return (
        <section className="relative w-full min-h-screen overflow-hidden bg-vino-dark">

            {/* ── Two-column grid ── */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen">

                {/* ─────────────────────────────────────
            LEFT COLUMN — text content
        ───────────────────────────────────── */}
                <div className="relative flex flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 pt-36 pb-12 lg:pt-36 lg:pb-0 bg-vino-dark z-10">

                    {/* Ambient glows */}
                    <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-vino-accent/10 blur-3xl pointer-events-none" />
                    <div className="absolute top-1/3 left-0 w-56 h-56 rounded-full bg-vino-gold/5 blur-3xl pointer-events-none" />

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="relative space-y-6 max-w-xl w-full"
                    >
                        {/* Headline */}
                        <motion.div variants={itemVariants} className="space-y-1">
                            <p className="text-vino-gray-dark text-sm sm:text-base font-light tracking-wide">
                                The finest collections of 2025
                            </p>
                            <h1 className="font-serif font-bold text-white leading-[1.05]">
                                <span className="block text-3xl sm:text-4xl md:text-5xl xl:text-6xl">
                                    Discover the
                                </span>
                                <span className="block text-3xl sm:text-4xl md:text-5xl xl:text-6xl bg-gradient-to-r from-vino-gold via-vino-gold-light to-vino-gold bg-clip-text text-transparent">
                                    World&apos;s Finest
                                </span>
                                <span className="block text-3xl sm:text-4xl md:text-5xl xl:text-6xl">
                                    Wines
                                </span>
                            </h1>
                        </motion.div>

                        {/* Description */}
                        <motion.p
                            variants={itemVariants}
                            className="text-vino-gray-dark text-sm sm:text-base leading-relaxed max-w-md"
                        >
                            Explore curated collections from the world&apos;s most prestigious
                            vineyards. Discover your perfect wine, attend exclusive tastings,
                            and elevate every occasion.
                        </motion.p>

                        {/* Stats row */}
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center gap-5 sm:gap-8 py-1"
                        >
                            {[
                                { value: '500+', label: 'Curated Wines' },
                                { value: '40+', label: 'Regions' },
                                { value: '12k+', label: 'Enthusiasts' },
                            ].map((stat, i) => (
                                <React.Fragment key={stat.label}>
                                    <div className="flex flex-col">
                                        <span className="font-serif text-lg sm:text-xl font-bold text-vino-gold">
                                            {stat.value}
                                        </span>
                                        <span className="text-xs text-vino-gray-dark tracking-wide">
                                            {stat.label}
                                        </span>
                                    </div>
                                    {i < 2 && (
                                        <div className="w-px h-8 bg-vino-accent/30" />
                                    )}
                                </React.Fragment>
                            ))}
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-3 pt-1"
                        >
                            <Button size="lg" variant="primary" className="tracking-wide w-full sm:w-auto">
                                Explore Collection
                            </Button>
                            <Button size="lg" variant="outline" className="tracking-wide w-full sm:w-auto">
                                Book a Tasting
                            </Button>
                        </motion.div>

                        {/* Rating strip */}
                        <motion.div
                            variants={itemVariants}
                            className="flex items-center gap-2"
                        >
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={13} className="text-vino-gold fill-vino-gold" />
                                ))}
                            </div>
                            <span className="text-xs sm:text-sm text-vino-gray-dark">
                                Trusted by{' '}
                                <span className="text-white font-medium">12,000+</span> wine lovers
                            </span>
                        </motion.div>
                    </motion.div>
                </div>

                {/* ─────────────────────────────────────
            RIGHT COLUMN — hero image (desktop)
        ───────────────────────────────────── */}
                <div className="relative hidden lg:block">
                    <CloudinaryImage
                        src={images.hero.background}
                        alt="Premium wine collection — bottles, glasses and grapes"
                        fill
                        priority
                        sizes="50vw"
                        quality={90}
                        className="object-cover object-center"
                    />

                    {/* Blend left edge into dark column */}
                    <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-vino-dark to-transparent z-10" />
                    {/* Bottom depth */}
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-vino-dark/50 to-transparent z-10" />
                </div>

                {/* ─────────────────────────────────────
            MOBILE IMAGE — stacks below text
        ───────────────────────────────────── */}
                <div className="relative lg:hidden w-full h-64 sm:h-80 md:h-96">
                    <CloudinaryImage
                        src={images.hero.background}
                        alt="Premium wine collection"
                        fill
                        priority
                        sizes="100vw"
                        quality={85}
                        className="object-cover object-center"
                    />
                    <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-vino-dark to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-vino-dark to-transparent" />
                </div>
            </div>

            {/* ── Scroll indicator ── */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 8, 0] }}
                transition={{
                    opacity: { delay: 2, duration: 0.5 },
                    y: { delay: 2, duration: 2, repeat: Infinity },
                }}
                aria-label="Scroll down to explore"
                className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 text-vino-gold hover:text-vino-gold-light transition-colors"
                onClick={() =>
                    document.getElementById('featured-wines')?.scrollIntoView({ behavior: 'smooth' })
                }
            >
                <ChevronDown size={26} />
            </motion.button>
        </section>
    )
}
