'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { images } from '@/constants/images'

interface GalleryItem {
    id: number
    name: string
    region: string
    src: string
    alt: string
}

const GALLERY_ITEMS: GalleryItem[] = [
    { id: 1, name: 'Kim Crawford Sauvignon Blanc', region: 'Marlborough, NZ', src: images.gallery.left1, alt: 'Kim Crawford Sauvignon Blanc' },
    { id: 2, name: 'Josh Cellars Reserve', region: 'California, USA', src: images.gallery.left2, alt: 'Josh Cellars Reserve' },
    { id: 3, name: 'Sula Vineyards Late Harvest', region: 'Nashik Valley, India', src: images.gallery.center, alt: 'Sula Vineyards Late Harvest' },
    { id: 4, name: 'Aurora Varietal Merlot', region: 'Tuscany, Italy', src: images.gallery.right1, alt: 'Aurora Varietal Merlot' },
    { id: 5, name: 'La Bellevue des Bois', region: 'Bordeaux, France', src: images.gallery.right2, alt: 'La Bellevue des Bois' },
    { id: 6, name: 'Estate Sauvignon Blanc', region: 'Marlborough, NZ', src: images.gallery.left1, alt: 'Estate Sauvignon Blanc' },
    { id: 7, name: 'Josh Estate Cabernet', region: 'California, USA', src: images.gallery.left2, alt: 'Josh Estate Cabernet' },
    { id: 8, name: 'Sula Reserve Harvest', region: 'Nashik Valley, India', src: images.gallery.center, alt: 'Sula Reserve Harvest' },
]

// Duplicate array for seamless infinite scroll loop
const DOUBLE_ITEMS = [...GALLERY_ITEMS, ...GALLERY_ITEMS]

export const WineGallery: React.FC = () => {
    return (
        <section
            id="wine-gallery"
            className="relative w-full overflow-hidden bg-[#F8F5EF] lg:min-h-[82vh] lg:max-h-[740px] flex items-center justify-center py-6 sm:py-8 lg:py-4"
            aria-labelledby="gallery-heading"
        >
            {/* Paper texture dots */}
            <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #5C4033 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="relative z-10 w-full mx-auto py-4 sm:py-6">

                {/* ── Section header ─────────────────────────────────────────── */}
                <div className="flex flex-col items-center text-center mb-6 sm:mb-8 gap-2 px-4">
                    {/* Eyebrow */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-px bg-vino-gold" />
                        <span className="text-[10px] sm:text-[10.5px] tracking-[0.24em] uppercase font-semibold text-vino-accent">
                            Curated Collection
                        </span>
                        <div className="w-7 h-px bg-vino-gold" />
                    </div>

                    {/* Heading */}
                    <h2
                        id="gallery-heading"
                        className="font-serif font-bold text-vino-brown leading-[1.08] text-2xl sm:text-3xl lg:text-[2.2rem]"
                    >
                        Moments Worth{' '}
                        <span className="italic text-vino-accent">Savoring</span>
                    </h2>

                    {/* Gold rule */}
                    <div className="w-10 h-px bg-vino-gold" />

                    {/* Description */}
                    <p className="text-vino-brown-light text-xs sm:text-sm leading-relaxed max-w-xl">
                        Every bottle tells a story. Explore elegant wine moments, curated
                        pairings, vineyard experiences, and timeless celebrations through
                        our carefully selected collection.
                    </p>
                </div>

                {/* ── Infinite Smooth Gliding Marquee Ticker ─────────────────── */}
                <div className="relative w-full overflow-hidden group">
                    {/* Gradient fade masks on left and right edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-[#F8F5EF] to-transparent pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-[#F8F5EF] to-transparent pointer-events-none" />

                    {/* Smooth Continuous Gliding Track (Faster continuous glide speed) */}
                    <motion.div
                        className="flex gap-4 sm:gap-6 w-max py-2"
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{
                            repeat: Infinity,
                            repeatType: 'loop',
                            ease: 'linear',
                            duration: 14, // Faster continuous glide speed
                        }}
                    >
                        {DOUBLE_ITEMS.map((item, index) => (
                            <div
                                key={`${item.id}-${index}`}
                                className="
                                    group/card relative shrink-0
                                    w-[180px] sm:w-[220px] lg:w-[240px]
                                    aspect-[3/3.8]
                                    overflow-hidden rounded-2xl
                                    bg-vino-parchment
                                    shadow-[0_6px_20px_rgba(92,64,51,0.12)]
                                    hover:shadow-[0_12px_32px_rgba(139,30,63,0.22)]
                                    hover:ring-2 hover:ring-vino-accent
                                    flex flex-col items-center justify-center
                                    transition-all duration-300
                                "
                            >
                                <CloudinaryImage
                                    src={item.src}
                                    alt={item.alt}
                                    width={400}
                                    height={600}
                                    priority={false}
                                    sizes="(max-width: 640px) 180px, 240px"
                                    quality={88}
                                    className="object-contain object-center px-3 py-4 transition-transform duration-500 ease-out group-hover/card:scale-[1.06]"
                                />

                                {/* Inner gold border frame */}
                                <div
                                    className="
                                        absolute inset-[5px] rounded-[calc(1rem-5px)] pointer-events-none
                                        border border-[rgba(201,170,113,0.32)]
                                        transition-all duration-300
                                        group-hover/card:border-vino-accent/50
                                    "
                                />

                                {/* Subtle bottom gradient scrim */}
                                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-vino-brown/15 to-transparent pointer-events-none" />
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* ── CTA ────────────────────────────────────────────────────── */}
                <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3">
                    {/* Decorative dots */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-px bg-vino-parchment" />
                        <div className="w-1.5 h-1.5 rounded-full bg-vino-gold" />
                        <div className="w-1.5 h-1.5 rounded-full bg-vino-accent" />
                        <div className="w-1.5 h-1.5 rounded-full bg-vino-gold" />
                        <div className="w-10 h-px bg-vino-parchment" />
                    </div>

                    <Link href="/discover">
                        <motion.button
                            whileHover={{
                                scale: 1.02,
                                boxShadow: '0 6px 24px rgba(139,30,63,0.25)',
                            }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="
                                group inline-flex items-center gap-2
                                bg-vino-accent hover:bg-vino-accent-light
                                text-white font-semibold text-xs sm:text-sm tracking-wide
                                px-6 py-2.5 rounded-full
                                transition-colors duration-300
                                shadow-[0_4px_16px_rgba(139,30,63,0.20)]
                                focus-visible:outline-none focus-visible:ring-2
                                focus-visible:ring-vino-gold
                            "
                        >
                            Explore Gallery
                            <ArrowRight
                                size={14}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </motion.button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
