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
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
        id: 'amphitheatre-acoustic',
        badge: 'Concert',
        image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif',
        title: 'Sunset Amphitheatre Sessions',
        venue: 'Sula Amphitheatre',
        date: '28 Nov 2026',
        location: 'Nashik, Maharashtra',
        spotsLeft: 44,
        totalSpots: 200,
        fromPrice: '\u20b92,500',
    },
    {
        id: 'wine-dine-2026',
        badge: 'Dinner',
        image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png',
        title: 'Nashik Lakeview Wine & Dine',
        venue: 'York Winery',
        date: '20 Dec 2026',
        location: 'Gangapur Dam, Nashik',
        spotsLeft: 8,
        totalSpots: 40,
        fromPrice: '\u20b91,500',
    },
]

// ─── Animation variants ───────────────────────────────────────────────────────

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.04 } },
}

const fadeUp = {
    hidden: { opacity: 1, y: 0 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
}

const headerVariant = {
    hidden: { opacity: 1, y: 0 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
}

// ─── Event card ───────────────────────────────────────────────────────────────

const EventCard: React.FC<{ event: EventItem }> = ({ event }) => {
    const router = useRouter()
    
    return (
    <motion.article
        variants={fadeUp}
        whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(139,30,63,0.35)' }}
        transition={{ duration: 0.25 }}
        className="
            group relative flex flex-col overflow-hidden rounded-2xl
            bg-[#1A0810]/95 backdrop-blur-md
            border border-white/10 hover:border-vino-gold/40
            shadow-[0_8px_32px_rgba(0,0,0,0.35)]
        "
    >
        {/* Image header */}
        <div className="relative h-36 sm:h-40 overflow-hidden">
            <CloudinaryImage
                src={event.image}
                alt={event.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={85}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
            {/* Gradient scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A0810] via-[#1A0810]/20 to-transparent" />

            {/* Badge */}
            <span className="
                absolute top-2.5 left-2.5
                inline-flex items-center px-2 py-0.5 rounded-full
                bg-vino-gold text-[#1A0810] text-[9.5px] font-bold tracking-wide
                shadow-sm
            ">
                {event.badge}
            </span>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-2.5">
            {/* Title & venue */}
            <div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-white leading-snug group-hover:text-vino-gold transition-colors duration-300">
                    {event.title}
                </h3>
                <p className="text-[11px] text-vino-gray-dark mt-0.5">{event.venue}</p>
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-vino-gray-dark">
                <div className="flex items-center gap-1.5">
                    <Calendar size={10} className="text-vino-gold shrink-0" />
                    <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <MapPin size={10} className="text-vino-gold shrink-0" />
                    <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Users size={10} className="text-vino-gold shrink-0" />
                    <span>{event.spotsLeft.toLocaleString()} spots left</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Ticket size={10} className="text-vino-gold shrink-0" />
                    <span>From {event.fromPrice}</span>
                </div>
            </div>

            {/* CTA */}
            <Link
                href="/events"
                className="
                    mt-1 w-full flex items-center justify-center gap-1.5
                    bg-vino-accent hover:bg-vino-accent-light
                    text-white font-semibold text-xs tracking-wide
                    py-2.5 rounded-xl
                    transition-all duration-300
                    shadow-[0_4px_16px_rgba(139,30,63,0.30)]
                    hover:shadow-[0_6px_24px_rgba(139,30,63,0.45)]
                    hover:scale-[1.02] active:scale-[0.98]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-gold
                "
            >
                <Ticket size={13} />
                Book Tickets
            </Link>
        </div>
    </motion.article>
    )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export const UpcomingEvents: React.FC = () => {
    const router = useRouter()
    
    return (
        <section
            id="upcoming-events"
            className="relative w-full overflow-hidden lg:min-h-[82vh] lg:max-h-[750px] flex items-center justify-center py-8 sm:py-12 lg:py-6"
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
                className="absolute inset-0 pointer-events-none bg-[#0d0407]/70"
            />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ── Section header ──────────────────────────────────────────── */}
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 sm:mb-8"
                >
                    <div className="flex flex-col gap-1.5">
                        {/* Eyebrow */}
                        <motion.div variants={headerVariant} className="flex items-center gap-2">
                            <span className="text-[10px] tracking-[0.26em] uppercase font-semibold text-vino-gold">
                                Estate Calendar
                            </span>
                        </motion.div>

                        {/* Heading */}
                        <motion.h2
                            id="events-heading"
                            variants={headerVariant}
                            className="font-serif font-bold text-white leading-tight
                                       text-2xl sm:text-3xl lg:text-[2.2rem]"
                        >
                            Upcoming{' '}
                            <span className="italic text-vino-gold">Events</span>
                        </motion.h2>

                        {/* Sub */}
                        <motion.p
                            variants={headerVariant}
                            className="text-vino-gray-dark text-xs sm:text-sm leading-relaxed"
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
                            font-semibold text-xs sm:text-sm tracking-wide
                            transition-colors duration-200
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent rounded-sm
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
                    viewport={{ once: true, margin: '-40px' }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    {EVENTS.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
