'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
    {
        id: 't1',
        name: 'Dr. Siddharth Kapoor',
        role: 'Wine Collector & Enthusiast',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        content: 'Booking the Grover Zampa Sommelier Masterclass through VinoSphere was seamless. The blind tasting session inside the cellar vault was world-class!',
        rating: 5,
        experience: 'Grand Sommelier Masterclass',
    },
    {
        id: 't2',
        name: 'Rhea Sen',
        role: 'Food & Lifestyle Journalist',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        content: 'The Nashik Harvest Gala experience exceeded all expectations. Live jazz under the sunset with Sula Dindori Shiraz was unforgettable.',
        rating: 5,
        experience: 'Nashik Grape Harvest & Stomp Gala',
    },
    {
        id: 't3',
        name: 'Arjun & Meera Singhania',
        role: 'VinoSphere Club Members',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        content: 'The 5-course chef pairing at York Winery was a highlight of our year. Exquisite wines, panoramic lake views, and impeccable service.',
        rating: 5,
        experience: 'Lakefront Sunset & 5-Course Chef Pairing',
    },
]

export const CustomerReviewsSection: React.FC = () => {
    return (
        <section className="py-20 bg-vino-cream/60 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <span className="text-xs font-bold uppercase tracking-widest text-vino-accent">Verified Guest Stories</span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-vino-darker mt-2">
                        Loved by Wine Connoisseurs
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.15 }}
                            className="bg-white p-8 rounded-3xl border border-[#E8D4A8]/70 shadow-[0_4px_24px_rgba(44,24,16,0.04)] flex flex-col justify-between relative"
                        >
                            <Quote size={32} className="text-vino-accent/15 absolute top-6 right-6" />

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-1 text-amber-400">
                                    {Array.from({ length: item.rating }).map((_, i) => (
                                        <Star key={i} size={14} className="fill-amber-400" />
                                    ))}
                                </div>

                                <p className="text-xs sm:text-sm text-vino-dark/80 italic leading-relaxed">
                                    &ldquo;{item.content}&rdquo;
                                </p>
                            </div>

                            <div className="pt-6 border-t border-vino-dark/10 flex items-center gap-3.5 mt-6">
                                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-vino-accent/30">
                                    <Image src={item.avatar} alt={item.name} fill className="object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-vino-darker">{item.name}</h4>
                                    <p className="text-[11px] text-vino-dark/50 font-medium">{item.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
