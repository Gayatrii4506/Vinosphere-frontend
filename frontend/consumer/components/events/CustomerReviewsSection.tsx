'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Wine, Calendar, Clock, Compass, ShieldCheck } from 'lucide-react'

const GUIDELINES = [
    {
        id: 'g1',
        title: 'Tasting Progression',
        icon: Wine,
        content: 'Begin with crisp Méthode Traditionnelle sparklings, progress through aromatic whites like Chenin Blanc, and conclude with full-bodied oaked reds such as Dindori Reserve Shiraz.',
        tip: 'Rinse with room-temperature water between varietals to keep your palate fresh.',
    },
    {
        id: 'g2',
        title: 'Harvest Season & Timing',
        icon: Calendar,
        content: 'The prime Nashik harvest and grape-stomping season spans January through March. Late afternoon tastings (3:30 PM to 6:00 PM) offer panoramic sunsets over the Gangapur hills.',
        tip: 'Book 3–5 days ahead for weekend barrel-room tastings and vineyard picnics.',
    },
    {
        id: 'g3',
        title: 'Cellar Door Etiquette',
        icon: Compass,
        content: 'Estate tours involve active crush pads, barrel halls, and cellar cellars. Wear closed-toe footwear and avoid heavy colognes or perfumes that mask delicate vintage bouquets.',
        tip: 'Cellar temperature is maintained around 14°C–16°C; bring a light layer.',
    },
]

export const CustomerReviewsSection: React.FC = () => {
    return (
        <section className="py-20 bg-vino-cream/60 overflow-hidden border-t border-[#EDE5D8]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-vino-accent">Visitor Guidelines</span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-vino-darker">
                        Cellar Door &amp; Tasting Etiquette
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600">
                        Essential advice for planning authentic estate visits across Nashik and Maharashtra wine country.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {GUIDELINES.map((item, idx) => {
                        const Icon = item.icon
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.15 }}
                                className="bg-white p-7 rounded-2xl border border-[#E8D4A8]/70 shadow-[0_4px_24px_rgba(44,24,16,0.04)] flex flex-col justify-between space-y-5"
                            >
                                <div className="space-y-4">
                                    <div className="w-10 h-10 rounded-xl bg-vino-cream text-vino-accent border border-[#E8D4A8]/80 flex items-center justify-center">
                                        <Icon size={18} />
                                    </div>

                                    <h3 className="font-serif text-lg font-bold text-vino-darker">
                                        {item.title}
                                    </h3>

                                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                                        {item.content}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-stone-200/80 text-[11px] text-stone-500 bg-[#FAF7F2] p-3 rounded-xl border border-stone-100">
                                    <span className="font-bold text-vino-accent">Sommelier Tip: </span>
                                    {item.tip}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
