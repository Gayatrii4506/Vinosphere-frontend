'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    Calendar,
    MapPin,
    Users,
    Ticket,
    ArrowRight,
} from 'lucide-react'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'

// ─── Types ───────────────────────────────────────────────────────────────────

interface EventItem {
    id: string
    badge: string
    image: string
    title: string
    venue: string
    date: string
    location: string
    spotsLeft: number
    totalSpots: number
    fromPrice: string
}

// ─── Events data ─────────────────────────────────────────────────────────────

const EVENTS: EventItem[] = [
    {
        id: 'sulafest-2027',
        badge: 'Festival',
        image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png',
        title: 'SulaFest 2027',
        venue: 'Sula Vineyards',
        date: '6 Feb 2027',
        location: 'Nashik, Maharashtra',
        spotsLeft: 250,
        totalSpots: 7200,
        fromPrice: '\u20b92,500',
    },
    {
        id: 'harvest',
        badge: 'Concert',
        image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif',
        title: 'Amphitheatre ',
        venue: 'Sula Vineyards',
        date: '14 Feb 2026',
        location: 'Nashik, Maharashtra',
        spotsLeft: 44,
        totalSpots: 200,
        fromPrice: '\u20b92,500',
    },
    {
        id: 'wine-dine-2026',
        badge: 'Dinner',
        image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png',
        title: 'Nashik Wine & Dine Experience',
        venue: 'York Winery',
        date: '20 Dec 2026',
        location: 'Gangapur, Nashik',
        spotsLeft: 8,
        totalSpots: 40,
        fromPrice: '\u20b91500',
    },
]

// ─── Animation variants ───────────────────────────────────────────────────────

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
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
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

const SoldBar: React.FC<{ spotsLeft: number; totalSpots: number }> = ({
    spotsLeft,
    totalSpots,
}) => {
    const soldPct = Math.round(((totalSpots - spotsLeft) / totalSpots) * 100)
    return (
        <div className="mt-3">
            <div className="w-full h-1.5 bg-[rgba(255,255,255,0.15)] rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${soldPct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                    className="h-full rounded-full bg-vino-gold"
                />
            </div>
            <p className="mt-1.5 text-[11px] text-vino-gold/80 font-medium">{soldPct}% sold</p>
        </div>
    )
}

// ─── Event card ───────────────────────────────────────────────────────────────

const EventCard: React.FC<{ event: EventItem }> = ({ event }) => (
    <motion.article
        variants={fadeUp}
        whileHover={{ y: -6, boxShadow: '0 24px 56px rgba(139,30,63,0.28)' }}
        transition={{ duration: 0.28 }}
        className="
            group relative flex flex-col overflow-hidden rounded-2xl
            bg-[#1A0810]
            border border-[rgba(255, 233, 91, 0.35)]
            shadow-[0_8px_32px_rgba(0,0,0,0.30)]
        "
    >
        {/* Image header */}
        <div className="relative h-52 sm:h-56 overflow-hidden">
            <CloudinaryImage
                src={event.image}
                alt={event.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={85}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
            {/* Gradient scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A0810]/90 via-[#1A0810]/30 to-transparent" />

            {/* Badge */}
            <span className="
                absolute top-3 left-3
                inline-flex items-center px-2.5 py-1 rounded-full
                bg-vino-gold text-[#1A0810] text-[10px] font-bold tracking-wide
                shadow-sm
            ">
                {event.badge}
            </span>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 px-5 pt-4 pb-5 gap-3">
            {/* Title & venue */}
            <div>
                <h3 className="font-serif text-lg font-bold text-white leading-snug group-hover:text-vino-gold transition-colors duration-300">
                    {event.title}
                </h3>
                <p className="text-[12px] text-vino-gray-dark mt-0.5">{event.venue}</p>
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] text-vino-gray-dark">
                <div className="flex items-center gap-1.5">
                    <Calendar size={11} className="text-vino-gold shrink-0" />
                    <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <MapPin size={11} className="text-vino-gold shrink-0" />
                    <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Users size={11} className="text-vino-gold shrink-0" />
                    <span>{event.spotsLeft.toLocaleString()} spots left</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Ticket size={11} className="text-vino-gold shrink-0" />
                    <span>From {event.fromPrice}</span>
                </div>
            </div>

            
            {/* CTA */}
            <motion.button
                whileHover={{ scale: 1.025, boxShadow: '0 8px 28px rgba(139,30,63,0.45)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="
                    mt-1 w-full flex items-center justify-center gap-2
                    bg-vino-accent hover:bg-vino-accent-light
                    text-white font-semibold text-sm tracking-wide
                    py-3 rounded-xl
                    transition-colors duration-300
                    shadow-[0_4px_20px_rgba(139,30,63,0.30)]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-gold
                "
            >
                <Ticket size={14} />
                Book Tickets
            </motion.button>
        </div>
    </motion.article>
)

// ─── Main section ─────────────────────────────────────────────────────────────

export const UpcomingEvents: React.FC = () => {
    return (
        <section
            id="upcoming-events"
            className="relative w-full overflow-hidden"
            aria-labelledby="events-heading"
        >
            {/* Background image */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'url(https://res.cloudinary.com/xfklkvdc/image/upload/v1784628931/bg_vamk3x.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            />
            {/* Dark overlay for readability */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none bg-[#0d0407]/60"
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28">

                {/* ── Section header ──────────────────────────────────────────── */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 md:mb-14"
                >
                    <div className="flex flex-col gap-3">
                        {/* Eyebrow */}
                        <motion.div variants={headerVariant} className="flex items-center gap-2">
                            <span className="text-[10.5px] tracking-[0.28em] uppercase font-semibold text-vino-gold">
                                Don&apos;t Miss Out
                            </span>
                        </motion.div>

                        {/* Heading */}
                        <motion.h2
                            id="events-heading"
                            variants={headerVariant}
                            className="font-serif font-bold text-white leading-[1.08]
                                       text-[2rem] sm:text-[2.6rem] md:text-[3rem]"
                        >
                            Upcoming{' '}
                            <span className="italic text-vino-gold">Events</span>
                        </motion.h2>

                        {/* Sub */}
                        <motion.p
                            variants={headerVariant}
                            className="text-vino-gray-dark text-sm sm:text-base leading-relaxed"
                        >
                            Festivals, dinners, workshops, and more
                        </motion.p>
                    </div>

                    {/* All events link */}
                    <motion.a
                        variants={headerVariant}
                        href="/events"
                        className="
                            group inline-flex items-center gap-1.5 shrink-0
                            text-vino-accent hover:text-vino-accent-light
                            font-semibold text-sm tracking-wide
                            transition-colors duration-200
                        "
                    >
                        All events
                        <ArrowRight
                            size={14}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </motion.a>
                </motion.div>

                {/* ── Cards grid ──────────────────────────────────────────────── */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {EVENTS.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
