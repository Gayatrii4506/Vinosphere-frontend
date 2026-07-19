'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { images } from '@/constants/images'

// ─── Types ───────────────────────────────────────────────────────────────────

interface GalleryImage {
    src: string
    alt: string
}

// ─── Gallery data ─────────────────────────────────────────────────────────────

const SIDE_IMAGES: [GalleryImage, GalleryImage, GalleryImage, GalleryImage] = [
    { src: images.gallery.left1, alt: 'Wine glasses on a cellar table' },
    { src: images.gallery.left2, alt: 'Sommelier pouring red wine' },
    { src: images.gallery.right1, alt: 'Vineyard at golden hour' },
    { src: images.gallery.right2, alt: 'Artisan cheese and wine board' },
]

const CENTER_IMAGE: GalleryImage = {
    src: images.gallery.center,
    alt: 'A perfectly poured glass of premium wine',
}

// ─── Animation variants ───────────────────────────────────────────────────────

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.10, delayChildren: 0.05 } },
}

const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
}

const headerVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
}

// ─── Side card ────────────────────────────────────────────────────────────────

const SideCard: React.FC<{ image: GalleryImage; priority?: boolean }> = ({
    image,
    priority = false,
}) => (
    <motion.div
        variants={fadeUp}
        whileHover={{ y: -6, boxShadow: '0 20px 48px rgba(92,64,51,0.18)' }}
        transition={{ duration: 0.3 }}
        className="
      relative w-full overflow-hidden rounded-2xl
      aspect-[3/4]
      bg-vino-parchment
      shadow-[0_4px_20px_rgba(92,64,51,0.10)]
    "
    >
        <CloudinaryImage
            src={image.src}
            alt={image.alt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 16vw"
            quality={85}
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        {/* Subtle bottom scrim */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-vino-brown/20 to-transparent" />
    </motion.div>
)

// ─── Center arch card ─────────────────────────────────────────────────────────

const ArchCard: React.FC = () => (
    <motion.div
        variants={fadeUp}
        className="relative flex flex-col items-center z-10"
    >
        {/* Arch frame */}
        <motion.div
            whileHover={{ scale: 1.025 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="
        relative w-full overflow-hidden
        shadow-[0_12px_48px_rgba(92,64,51,0.22)]
        bg-vino-parchment
      "
            style={{
                /* Arch = rectangle + top border-radius that creates the arch top */
                borderRadius: '50% 50% 12px 12px / 32% 32% 12px 12px',
                aspectRatio: '3/4.6',
            }}
        >
            <CloudinaryImage
                src={CENTER_IMAGE.src}
                alt={CENTER_IMAGE.alt}
                fill
                priority
                sizes="(max-width: 640px) 60vw, (max-width: 1024px) 30vw, 20vw"
                quality={90}
                className="object-cover object-center"
            />
            {/* Inner arch border overlay */}
            <div
                className="absolute inset-[6px] border border-vino-gold/30 pointer-events-none"
                style={{ borderRadius: 'inherit' }}
            />
            {/* Bottom scrim */}
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-vino-brown/25 to-transparent" />
        </motion.div>

        {/* Arch label */}
        <div className="mt-4 flex items-center gap-2">
            <div className="w-8 h-px bg-vino-gold/60" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-vino-brown-light font-medium">
                Featured
            </span>
            <div className="w-8 h-px bg-vino-gold/60" />
        </div>
    </motion.div>
)

// ─── Main section ─────────────────────────────────────────────────────────────

export const WineGallery: React.FC = () => {
    return (
        <section
            id="wine-gallery"
            className="relative w-full overflow-hidden bg-[#F8F5EF]"
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

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28">

                {/* ── Section header ─────────────────────────────────────────── */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex flex-col items-center text-center mb-14 md:mb-16 gap-4"
                >
                    {/* Eyebrow */}
                    <motion.div variants={headerVariant} className="flex items-center gap-3">
                        <div className="w-10 h-px bg-vino-gold" />
                        <span className="text-[10.5px] tracking-[0.26em] uppercase font-semibold text-vino-accent">
                            Curated Collection
                        </span>
                        <div className="w-10 h-px bg-vino-gold" />
                    </motion.div>

                    {/* Heading */}
                    <motion.h2
                        id="gallery-heading"
                        variants={headerVariant}
                        className="font-serif font-bold text-vino-brown leading-[1.08]
                       text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] lg:text-[3.6rem]"
                    >
                        Moments Worth{' '}
                        <span className="italic text-vino-accent">Savoring</span>
                    </motion.h2>

                    {/* Gold rule */}
                    <motion.div variants={headerVariant} className="w-16 h-px bg-vino-gold" />

                    {/* Description */}
                    <motion.p
                        variants={headerVariant}
                        className="text-vino-brown-light text-sm sm:text-base leading-relaxed max-w-xl"
                    >
                        Every bottle tells a story. Explore elegant wine moments, curated
                        pairings, vineyard experiences, and timeless celebrations through
                        our carefully selected collection.
                    </motion.p>
                </motion.div>

                {/* ── Gallery ────────────────────────────────────────────────── */}

                {/* DESKTOP / TABLET — 5 column editorial layout */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    className="hidden sm:grid grid-cols-5 gap-3 md:gap-4 lg:gap-5 items-end"
                >
                    {/* Far left */}
                    <SideCard image={SIDE_IMAGES[0]} />

                    {/* Inner left — slightly taller */}
                    <div className="pb-4">
                        <SideCard image={SIDE_IMAGES[1]} />
                    </div>

                    {/* Center arch — tallest */}
                    <ArchCard />

                    {/* Inner right — slightly taller */}
                    <div className="pb-4">
                        <SideCard image={SIDE_IMAGES[2]} />
                    </div>

                    {/* Far right */}
                    <SideCard image={SIDE_IMAGES[3]} />
                </motion.div>

                {/* MOBILE — 2×2 grid + center arch below */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-40px' }}
                    className="sm:hidden flex flex-col gap-4"
                >
                    {/* Center arch first on mobile */}
                    <div className="max-w-[220px] mx-auto w-full">
                        <ArchCard />
                    </div>

                    {/* 2×2 grid of side images */}
                    <div className="grid grid-cols-2 gap-3">
                        {SIDE_IMAGES.map((img) => (
                            <SideCard key={img.alt} image={img} />
                        ))}
                    </div>
                </motion.div>

                {/* ── CTA ────────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="mt-12 md:mt-14 flex flex-col items-center gap-4"
                >
                    {/* Decorative dots */}
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-px bg-vino-parchment" />
                        <div className="w-1.5 h-1.5 rounded-full bg-vino-gold" />
                        <div className="w-1.5 h-1.5 rounded-full bg-vino-gold/50" />
                        <div className="w-1.5 h-1.5 rounded-full bg-vino-gold" />
                        <div className="w-16 h-px bg-vino-parchment" />
                    </div>

                    <motion.button
                        whileHover={{
                            scale: 1.03,
                            boxShadow: '0 8px 32px rgba(139,30,63,0.25)',
                        }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.22 }}
                        className="
              group inline-flex items-center gap-2.5
              bg-vino-accent hover:bg-vino-accent-light
              text-white font-semibold text-sm tracking-wide
              px-8 py-3.5 rounded-full
              transition-colors duration-300
              shadow-[0_4px_20px_rgba(139,30,63,0.20)]
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-vino-gold
            "
                    >
                        Explore Gallery
                        <ArrowRight
                            size={15}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </motion.button>
                </motion.div>
            </div>
        </section>
    )
}
