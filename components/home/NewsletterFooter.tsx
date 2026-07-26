'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Instagram,
    Facebook,
    Twitter,
    Youtube,
    Mail,
    Phone,
    MapPin,
    ArrowRight,
    Send,
    Wine,
} from 'lucide-react'

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
    },
}

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const floatGlass = {
    animate: {
        y: [0, -14, 0],
        rotate: [-1, 1, -1],
        transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
    },
}

const floatGrapes = {
    animate: {
        y: [0, -10, 0],
        rotate: [1, -1, 1],
        transition: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 },
    },
}

// ─── Footer Nav Data ──────────────────────────────────────────────────────────

const footerNav = [
    {
        heading: 'Explore',
        links: [
            { label: 'Discover Wines', href: '#' },
            { label: 'Collections', href: '#' },
            { label: 'Wine Regions', href: '#' },
            { label: 'Pairings', href: '#' },
        ],
    },
    {
        heading: 'Experiences',
        links: [
            { label: 'Tastings', href: '#' },
            { label: 'Events', href: '#' },
            { label: 'Wine Journal', href: '#' },
            { label: 'Gift Cards', href: '#' },
        ],
    },
]

const socialLinks = [
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Youtube, label: 'YouTube', href: '#' },
]

// ─── VinoSphere Logo Mark ─────────────────────────────────────────────────────

const VinoSphereLogo: React.FC = () => (
    <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#8B1E3F] to-[#5C1428] shadow-[0_4px_16px_rgba(139,30,63,0.45)]">
            <Wine size={18} className="text-[#C89B3C]" />
        </div>
        <span className="font-serif font-bold text-xl tracking-tight text-[#2C1810]">
            Vino<span className="text-[#8B1E3F]">Sphere</span>
        </span>
    </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────

export const NewsletterFooter: React.FC = () => {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return
        setLoading(true)
        await new Promise((r) => setTimeout(r, 900))
        setLoading(false)
        setSubmitted(true)
    }

    return (
        <div className="relative w-full overflow-visible">

            {/* ═══════════════════════════════════════════════════════════════
                NEWSLETTER SECTION  — vineyard background + cutouts
            ═══════════════════════════════════════════════════════════════ */}
            <section
                id="newsletter"
                aria-labelledby="newsletter-heading"
                className="relative w-full overflow-hidden"
            >
                {/* Vineyard background image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/vineyard-bg.png"
                        alt="Luxury vineyard at golden hour"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                        }}
                    />
                    {/* White-to-cream gradient: bright at top (newsletter form), solid cream at bottom (footer nav) */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(to bottom, rgba(255,255,255,0.97) 0%, rgba(255,252,248,0.88) 22%, rgba(254,250,245,0.65) 42%, rgba(245,240,232,0.92) 65%, #F5F0E8 80%)',
                        }}
                    />
                    {/* Warm cream vignette sides */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(to right, rgba(250,247,242,0.5) 0%, transparent 20%, transparent 80%, rgba(250,247,242,0.5) 100%)',
                        }}
                    />
                </div>

                {/* ── Wine Glass — far-left overflow decoration ── */}
                <div
                    className="pointer-events-none absolute z-20 select-none hidden sm:block"
                    style={{
                        bottom: '-80px',
                        left: '-40px',
                        width: 'clamp(180px, 19vw, 300px)',
                    }}
                >
                    <img
                        src="https://res.cloudinary.com/xfklkvdc/image/upload/v1784516499/glass_gryp4q.png"
                        alt="Luxury wine glass"
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            filter: 'drop-shadow(0 30px 60px rgba(92,20,40,0.25)) drop-shadow(0 8px 24px rgba(0,0,0,0.20))',
                        }}
                    />
                </div>

                {/* ── Grape Bunch — bottom-right editorial overflow ── */}
                <div
                    className="pointer-events-none absolute z-10 select-none hidden sm:block"
                    style={{
                        bottom: '20px',
                        right: '-10px',
                        width: 'clamp(140px, 14vw, 240px)',
                    }}
                >
                    <img
                        src="https://res.cloudinary.com/xfklkvdc/image/upload/v1784516217/grapes_iiv9cv.png"
                        alt="Luxurious wine grapes"
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            filter: 'drop-shadow(0 28px 50px rgba(50,20,80,0.22)) drop-shadow(0 8px 20px rgba(0,0,0,0.18))',
                        }}
                    />
                </div>

                {/* ── All content ── */}
                <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 pb-16">

                    {/* Newsletter center content */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        className="flex flex-col items-center text-center gap-6 max-w-2xl w-full pt-12"
                    >

                        {/* Heading */}
                        <motion.h2
                            id="newsletter-heading"
                            variants={fadeUp}
                            className="font-serif font-bold leading-[1.08] text-[#2C1810]"
                            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
                        >
                            Stay Connected with{' '}
                            <span className="italic text-[#8B1E3F]">VinoSphere</span>
                        </motion.h2>

                        {/* Gold rule */}
                        <motion.div
                            variants={fadeUp}
                            className="w-16 h-px bg-[#C89B3C]"
                        />

                        {/* Description */}
                        <motion.p
                            variants={fadeUp}
                            className="text-[#5C4033] text-sm sm:text-base leading-relaxed max-w-xl"
                        >
                            Be the first to discover curated collections, exclusive tasting events,
                            expert wine insights, seasonal recommendations, and member-only offer.
                        </motion.p>

                        {/* Newsletter Form */}
                        
                    </motion.div>




                    {/* ── Footer Four-Column Nav Grid ── */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-60px' }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 w-full max-w-screen-xl items-start"
                    >
                        {/* Column 1 — Brand (padded left so glass doesn't overlap) */}
                        <motion.div variants={fadeUp} className="flex flex-col gap-5 pl-16 sm:pl-20 lg:pl-24 lg:pr-4">
                            <VinoSphereLogo />
                            <p className="text-[#5C4033] text-sm leading-relaxed">
                                VinoSphere is your gateway to the world&apos;s finest wines — curated
                                collections, expert insights, and exclusive experiences crafted
                                for true connoisseurs.
                            </p>
                            <div className="w-12 h-px bg-[#C89B3C]" />
                            <div className="flex items-center gap-3">
                                {socialLinks.map(({ icon: Icon, label, href }) => (
                                    <motion.a
                                        key={label}
                                        href={href}
                                        aria-label={label}
                                        whileHover={{ scale: 1.12, y: -2 }}
                                        whileTap={{ scale: 0.94 }}
                                        transition={{ duration: 0.2 }}
                                        className="
                                            flex items-center justify-center
                                            w-8 h-8 rounded-full
                                            bg-[#EDE4D6] hover:bg-[#8B1E3F]
                                            text-[#5C4033] hover:text-white
                                            transition-colors duration-300
                                            shadow-[0_2px_8px_rgba(92,64,51,0.12)]
                                        "
                                    >
                                        <Icon size={14} />
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>

                        {/* Columns 2 & 3 — Nav links */}
                        {footerNav.map((col) => (
                            <motion.div
                                key={col.heading}
                                variants={fadeUp}
                                className="flex flex-col gap-6"
                            >
                                <h3 className="font-serif font-bold text-[#2C1810] text-lg tracking-tight">
                                    {col.heading}
                                </h3>
                                <div className="w-8 h-px bg-[#C89B3C]/60" />
                                <ul className="flex flex-col gap-3">
                                    {col.links.map(({ label, href }) => (
                                        <li key={label}>
                                            <motion.a
                                                href={href}
                                                whileHover={{ x: 5 }}
                                                transition={{ duration: 0.2 }}
                                                className="
                                                    group inline-flex items-center gap-1.5
                                                    text-[#5C4033] hover:text-[#8B1E3F]
                                                    text-sm font-medium
                                                    transition-colors duration-300
                                                "
                                            >
                                                <ArrowRight
                                                    size={12}
                                                    className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300 text-[#C89B3C]"
                                                />
                                                {label}
                                            </motion.a>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}

                        {/* Column 4 — Contact */}
                        <motion.div variants={fadeUp} className="flex flex-col gap-6 pr-10 sm:pr-16 lg:pr-20">
                            <h3 className="font-serif font-bold text-[#2C1810] text-lg tracking-tight">
                                Contact
                            </h3>
                            <div className="w-8 h-px bg-[#C89B3C]/60" />
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <a
                                        href="mailto:hello@vinosphere.com"
                                        className="flex items-start gap-3 text-[#5C4033] hover:text-[#8B1E3F] transition-colors duration-300 group"
                                    >
                                        <span className="w-7 h-7 rounded-full bg-[#EDE4D6] group-hover:bg-[#8B1E3F]/10 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                                            <Mail size={13} className="text-[#8B1E3F]" />
                                        </span>
                                        <span className="text-sm leading-tight pt-1">
                                            hello@vinosphere.com
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="tel:+18005555678"
                                        className="flex items-start gap-3 text-[#5C4033] hover:text-[#8B1E3F] transition-colors duration-300 group"
                                    >
                                        <span className="w-7 h-7 rounded-full bg-[#EDE4D6] group-hover:bg-[#8B1E3F]/10 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                                            <Phone size={13} className="text-[#8B1E3F]" />
                                        </span>
                                        <span className="text-sm leading-tight pt-1">
                                            +91 77578 03073
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <div className="flex items-start gap-3 text-[#5C4033]">
                                        <span className="w-7 h-7 rounded-full bg-[#EDE4D6] flex items-center justify-center flex-shrink-0">
                                            <MapPin size={13} className="text-[#8B1E3F]" />
                                        </span>
                                        <span className="text-sm leading-snug pt-1">
                                            Nashik
                                        </span>
                                    </div>
                                </li>
                            </ul>
                            
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FOOTER  — cream & beige editorial layout
            ═══════════════════════════════════════════════════════════════ */}
            <footer
                id="site-footer"
                aria-label="VinoSphere site footer"
                className="relative z-10 bg-[#F5F0E8] overflow-hidden"
            >
                {/* Subtle paper texture overlay */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.025] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #5C4033 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* ── Gold divider ── */}
                   

                    {/* ── Bottom footer bar ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-between gap-4 py-7"
                    >
                        <p className="text-[#8B6E5A] text-xs tracking-wide text-center sm:text-left">
                            © 2026 VinoSphere.{' '}
                            <span className="italic">Crafted for wine lovers.</span>
                        </p>
                        <div className="flex items-center gap-1">
                            {/* Decorative dots */}
                            <div className="w-1 h-1 rounded-full bg-[#C89B3C]/50 hidden sm:block" />
                            <div className="w-1 h-1 rounded-full bg-[#C89B3C] hidden sm:block mx-1" />
                            <div className="w-1 h-1 rounded-full bg-[#C89B3C]/50 hidden sm:block mr-3" />
                            <a
                                href="#"
                                className="text-[#8B6E5A] hover:text-[#8B1E3F] text-xs tracking-wide transition-colors duration-300"
                            >
                                Privacy Policy
                            </a>
                            <span className="text-[#C89B3C]/60 mx-3 text-xs">·</span>
                            <a
                                href="#"
                                className="text-[#8B6E5A] hover:text-[#8B1E3F] text-xs tracking-wide transition-colors duration-300"
                            >
                                Terms of Service
                            </a>
                        </div>
                    </motion.div>
                </div>
            </footer>
        </div>
    )
}
