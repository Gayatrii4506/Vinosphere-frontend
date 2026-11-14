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
    hidden: { opacity: 1, y: 0 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
}

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

// ─── Footer Nav Data ──────────────────────────────────────────────────────────

const footerNav = [
    {
        heading: 'Explore',
        links: [
            { label: 'Discover Wines', href: '/discover' },
            { label: 'Collections', href: '/discover' },
            { label: 'Wine Regions', href: '/wineries' },
            { label: 'Pairings', href: '/food-pairing' },
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
    <div className="flex items-center gap-2">
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
        <div className="relative w-full overflow-hidden">

            {/* ═══════════════════════════════════════════════════════════════
                NEWSLETTER & NAV FOOTER SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <section
                id="newsletter"
                aria-labelledby="newsletter-heading"
                className="relative w-full overflow-hidden"
            >
                {/* Vineyard background image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://res.cloudinary.com/xfklkvdc/image/upload/v1785060878/e9bfab5c-378c-4c5f-8020-2dcc6342eb24.png"
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
                    {/* Gradient overlay */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(to bottom, rgba(255,255,255,0.97) 0%, rgba(255,252,248,0.90) 25%, rgba(245,240,232,0.95) 70%, #F5F0E8 100%)',
                        }}
                    />
                </div>

                {/* ── Wine Glass — left overflow decoration (Increased Height) ── */}
                <div
                    className="pointer-events-none absolute z-0 select-none hidden sm:block opacity-90"
                    style={{
                        bottom: '-35px',
                        left: '-35px',
                        width: 'clamp(250px, 22vw, 340px)',
                    }}
                >

                    <img
                        src="https://res.cloudinary.com/xfklkvdc/image/upload/v1784516499/glass_gryp4q.png"
                        alt="Luxury wine glass"
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            filter: 'drop-shadow(0 20px 40px rgba(92,20,40,0.20))',
                        }}
                    />
                </div>









                {/* ── Grape Bunch — right overflow decoration (Enlarged) ── */}
                <div
                    className="pointer-events-none absolute z-0 select-none hidden sm:block opacity-90"
                    style={{
                        bottom: '0px',
                        right: '-10px',
                        width: 'clamp(200px, 20vw, 300px)',
                    }}
                >
                    <img
                        src="https://res.cloudinary.com/xfklkvdc/image/upload/v1784516217/grapes_iiv9cv.png"
                        alt="Luxurious wine grapes"
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            filter: 'drop-shadow(0 24px 48px rgba(50,20,80,0.22))',
                        }}
                    />
                </div>


                {/* ── Compact Content Container ── */}
                <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-6 pb-6">

                    {/* Newsletter center content */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="flex flex-col items-center text-center gap-3.5 max-w-xl w-full mb-8 sm:mb-10"
                    >

                        {/* Heading */}
                        <motion.h2
                            id="newsletter-heading"
                            variants={fadeUp}
                            className="font-serif font-bold leading-tight text-[#2C1810] text-2xl sm:text-3xl"
                        >
                            Stay Connected with{' '}
                            <span className="italic text-[#8B1E3F]">VinoSphere</span>
                        </motion.h2>

                        {/* Gold rule */}
                        <motion.div
                            variants={fadeUp}
                            className="w-12 h-px bg-[#C89B3C]"
                        />

                        {/* Description */}
                        <motion.p
                            variants={fadeUp}
                            className="text-[#5C4033] text-xs sm:text-sm leading-relaxed max-w-lg"
                        >
                            Curated collections, exclusive tasting events, and expert wine insights delivered to your inbox.
                        </motion.p>

                        {/* Newsletter Form */}
                        <motion.div variants={fadeUp} className="w-full max-w-md pt-1">
                            {!submitted ? (
                                <form
                                    onSubmit={handleSubmit}
                                    className="flex flex-col sm:flex-row gap-2.5"
                                    aria-label="Newsletter subscription form"
                                >
                                    <div className="relative flex-1">
                                        <Mail
                                            size={15}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B6E5A] pointer-events-none"
                                        />
                                        <input
                                            id="newsletter-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Your email address"
                                            required
                                            aria-label="Email address for newsletter"
                                            suppressHydrationWarning
                                            className="
                                                w-full pl-10 pr-3.5 py-2.5
                                                bg-white/90 backdrop-blur-sm
                                                border border-[#E8D4A8]/70
                                                rounded-full
                                                text-[#2C1810] text-xs font-medium
                                                placeholder:text-[#8B6E5A]/70
                                                focus:outline-none focus:border-[#C89B3C]
                                                focus:ring-2 focus:ring-[#C89B3C]/25
                                                shadow-[0_2px_12px_rgba(200,155,60,0.1)]
                                                transition-all duration-300
                                            "
                                        />
                                    </div>
                                    <motion.button
                                        type="submit"
                                        id="newsletter-submit"
                                        disabled={loading}
                                        suppressHydrationWarning
                                        whileHover={{
                                            scale: 1.03,
                                            boxShadow: '0 6px 24px rgba(139,30,63,0.35)',
                                        }}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ duration: 0.2 }}
                                        className="
                                            group flex items-center justify-center gap-1.5
                                            bg-[#8B1E3F] hover:bg-[#A8304F]
                                            text-white font-semibold text-xs tracking-wider
                                            px-6 py-2.5 rounded-full
                                            shadow-[0_4px_16px_rgba(139,30,63,0.25)]
                                            transition-colors duration-300
                                            whitespace-nowrap
                                            disabled:opacity-60
                                        "
                                    >
                                        {loading ? (
                                            <svg
                                                className="animate-spin w-3.5 h-3.5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v8z"
                                                />
                                            </svg>
                                        ) : (
                                            <>
                                                Subscribe
                                                <Send
                                                    size={13}
                                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                                />
                                            </>
                                        )}
                                    </motion.button>
                                </form>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                    className="
                                        flex items-center justify-center gap-2.5
                                        bg-white/90 backdrop-blur-sm
                                        border border-[#C89B3C]/40
                                        rounded-full px-6 py-2.5
                                        shadow-[0_4px_16px_rgba(200,155,60,0.15)]
                                    "
                                >
                                    <div className="w-4 h-4 rounded-full bg-[#8B1E3F] flex items-center justify-center shrink-0">
                                        <svg
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            className="w-2.5 h-2.5 text-white"
                                        >
                                            <path
                                                d="M3 8l3.5 3.5L13 4"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-[#2C1810] font-semibold text-xs tracking-wide">
                                        Welcome to the VinoSphere Journal!
                                    </span>
                                </motion.div>
                            )}

                            <p className="mt-2 text-[10.5px] text-[#8B6E5A]/70 tracking-wide">
                                No spam. Unsubscribe anytime. We respect your privacy.
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* ── Three-Column Nav Grid: Exact Equal Spacing Across (VinoSphere | Explore | Contact) ── */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 lg:gap-16 w-full max-w-5xl items-start pt-6 border-t border-[#C89B3C]/30"
                    >
                        {/* Column 1 — VinoSphere Brand */}
                        <motion.div variants={fadeUp} className="flex flex-col gap-3">





                            <VinoSphereLogo />
                            <p className="text-[#5C4033] text-xs leading-relaxed">
                                VinoSphere is your gateway to fine wines — curated collections, expert insights, and exclusive experiences.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                {socialLinks.map(({ icon: Icon, label, href }) => (
                                    <motion.a
                                        key={label}
                                        href={href}
                                        aria-label={label}
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.94 }}
                                        transition={{ duration: 0.2 }}
                                        className="
                                            flex items-center justify-center
                                            w-7 h-7 rounded-full
                                            bg-[#EDE4D6] hover:bg-[#8B1E3F]
                                            text-[#5C4033] hover:text-white
                                            transition-colors duration-300
                                            shadow-sm
                                        "
                                    >
                                        <Icon size={13} />
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>

                        {/* Columns 2 & 3 — Nav links */}
                        {footerNav.map((col) => (
                            <motion.div
                                key={col.heading}
                                variants={fadeUp}
                                className="flex flex-col gap-2.5"
                            >
                                <h3 className="font-serif font-bold text-[#2C1810] text-sm tracking-tight">
                                    {col.heading}
                                </h3>
                                <ul className="flex flex-col gap-1.5">
                                    {col.links.map(({ label, href }) => (
                                        <li key={label}>
                                            <motion.a
                                                href={href}
                                                whileHover={{ x: 3 }}
                                                transition={{ duration: 0.2 }}
                                                className="
                                                    group inline-flex items-center gap-1.5
                                                    text-[#5C4033] hover:text-[#8B1E3F]
                                                    text-xs font-medium
                                                    transition-colors duration-300
                                                "
                                            >
                                                <ArrowRight
                                                    size={11}
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
                        <motion.div variants={fadeUp} className="flex flex-col gap-2.5">
                            <h3 className="font-serif font-bold text-[#2C1810] text-sm tracking-tight">
                                Contact
                            </h3>
                            <ul className="flex flex-col gap-2">
                                <li>
                                    <a
                                        href="mailto:hello@vinosphere.com"
                                        className="flex items-center gap-2.5 text-[#5C4033] hover:text-[#8B1E3F] transition-colors duration-300 group text-xs"
                                    >
                                        <span className="w-6 h-6 rounded-full bg-[#EDE4D6] group-hover:bg-[#8B1E3F]/10 flex items-center justify-center shrink-0">
                                            <Mail size={12} className="text-[#8B1E3F]" />
                                        </span>
                                        <span>hello@vinosphere.com</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="tel:+917757803073"
                                        className="flex items-center gap-2.5 text-[#5C4033] hover:text-[#8B1E3F] transition-colors duration-300 group text-xs"
                                    >
                                        <span className="w-6 h-6 rounded-full bg-[#EDE4D6] group-hover:bg-[#8B1E3F]/10 flex items-center justify-center shrink-0">
                                            <Phone size={12} className="text-[#8B1E3F]" />
                                        </span>
                                        <span>+91 77578 03073</span>
                                    </a>
                                </li>
                                <li>
                                    <div className="flex items-center gap-2.5 text-[#5C4033] text-xs">
                                        <span className="w-6 h-6 rounded-full bg-[#EDE4D6] flex items-center justify-center shrink-0">
                                            <MapPin size={12} className="text-[#8B1E3F]" />
                                        </span>
                                        <span>Nashik, Maharashtra</span>
                                    </div>
                                </li>
                            </ul>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FOOTER BOTTOM BAR — sleek & compact
            ═══════════════════════════════════════════════════════════════ */}
            <footer
                id="site-footer"
                aria-label="VinoSphere site footer"
                className="relative z-10 bg-[#F5F0E8] border-t border-[#C89B3C]/20"
            >
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                        <p className="text-[#8B6E5A] text-[11px] tracking-wide text-center sm:text-left">
                            © 2026 VinoSphere.{' '}
                            <span className="italic">Crafted for wine lovers.</span>
                        </p>
                        <div className="flex items-center gap-1 text-[11px]">
                            <a
                                href="#"
                                className="text-[#8B6E5A] hover:text-[#8B1E3F] transition-colors duration-300"
                            >
                                Privacy Policy
                            </a>
                            <span className="text-[#C89B3C]/60 mx-2">·</span>
                            <a
                                href="#"
                                className="text-[#8B6E5A] hover:text-[#8B1E3F] transition-colors duration-300"
                            >
                                Terms of Service
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
