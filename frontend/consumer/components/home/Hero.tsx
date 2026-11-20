'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { images } from '@/constants/images'
import { useRouter } from 'next/navigation'

export const Hero: React.FC = () => {
    const router = useRouter()

    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.13, delayChildren: 0.25 },
        },
    }

    const itemVariants = {
        hidden: { opacity: 1, y: 0 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        },
    }

    return (
        <section className="relative w-full min-h-screen overflow-hidden bg-[#0A0403]">

            {/* Full-bleed background image across full screen */}
            <div className="absolute inset-0 z-0">
                <CloudinaryImage
                    src={images.hero.background}
                    alt="Premium wine collection — bottles, glasses and grapes"
                    fill
                    priority
                    sizes="100vw"
                    quality={95}
                    className="object-cover object-center"
                />
                {/* Gentle gradient overlay to ensure high text legibility while preserving full background image visibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/20 z-[1]" />
            </div>

            {/* ── Content ── */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
                <div className="w-full lg:max-w-[50%]">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="pt-28 pb-16 space-y-5"
                    >


                        {/* Headline */}
                        <motion.h1
                            variants={itemVariants}
                            className="font-serif font-bold text-white leading-[1.06]"
                        >
                            <span className="block text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] lg:text-[3.5rem] xl:text-[4rem]">
                                Discover Nashik&apos;s
                            </span>
                            <span className="block text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] lg:text-[3.5rem] xl:text-[4rem] bg-gradient-to-r from-vino-gold via-vino-gold-light to-vino-gold bg-clip-text text-transparent">
                                Premier Estates &amp;
                            </span>
                            <span className="block text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] lg:text-[3.5rem] xl:text-[4rem]">
                                Vintages
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            variants={itemVariants}
                            className="text-vino-gray-dark text-sm sm:text-base leading-relaxed max-w-sm sm:max-w-md"
                        >
                            Explore estate-bottled collections, reserve tasting rooms, and discover intelligent food pairings directly from India&apos;s celebrated wine country.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-3 pt-1"
                        >
                            <Button
                                size="lg"
                                variant="primary"
                                className="tracking-wide text-sm sm:text-base w-full sm:w-auto active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-gold transition-all duration-200"
                                onClick={() => router.push('/wineries')}
                            >
                                Explore Wineries
                            </Button>
                            <Button
                                size="lg"
                                variant="outline-light"
                                className="tracking-wide text-sm sm:text-base w-full sm:w-auto active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-gold transition-all duration-200"
                                onClick={() => router.push('/discover/wines')}
                            >
                                Browse Wine Catalog
                            </Button>
                        </motion.div>


                    </motion.div>
                </div>
            </div>

            {/* Scroll indicator */}
            <motion.button
                suppressHydrationWarning
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 7, 0] }}
                transition={{
                    opacity: { delay: 2, duration: 0.5 },
                    y: { delay: 2, duration: 2, repeat: Infinity },
                }}
                aria-label="Scroll down"
                className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 text-vino-gold hover:text-vino-gold-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-gold rounded-full p-1"
                onClick={() =>
                    document.getElementById('featured-wines')?.scrollIntoView({ behavior: 'smooth' })
                }
            >
                <ChevronDown size={24} />
            </motion.button>
        </section>
    )
}
