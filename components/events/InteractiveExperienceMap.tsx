'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Sparkles, Star } from 'lucide-react'
import { VinoSphereExperience } from '@/constants/events'

interface MapProps {
    experiences: VinoSphereExperience[]
    onSelect: (experience: VinoSphereExperience) => void
}

export const InteractiveExperienceMap: React.FC<MapProps> = ({ experiences, onSelect }) => {
    const [hoveredExp, setHoveredExp] = useState<VinoSphereExperience | null>(null)

    return (
        <section className="py-12 bg-white border-y border-vino-dark/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-vino-accent text-xs font-bold uppercase tracking-widest mb-1">
                            <Navigation size={14} />
                            <span>Terroir Location Explorer</span>
                        </div>
                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-vino-darker">
                            Nearby Vineyard Experiences
                        </h2>
                    </div>
                    <p className="text-xs text-vino-dark/60 max-w-sm">
                        Hover over interactive location pins to explore premier winery destinations across India.
                    </p>
                </div>

                {/* Simulated Interactive Map Display Container */}
                <div className="relative w-full h-[450px] sm:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#F5F2EB] to-[#E8E2D5] border border-[#E8D4A8]/70 shadow-inner flex items-center justify-center p-6">
                    
                    {/* SVG Topography Grid Simulation */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#8B1E3F_1px,transparent_1px)] [background-size:24px_24px]" />

                    {/* Regional Map Labels */}
                    <div className="absolute top-8 left-8 text-xs font-serif font-bold text-vino-darker/40 uppercase tracking-widest">
                        Western Ghats Wine Corridor
                    </div>
                    <div className="absolute bottom-8 right-8 text-xs font-serif font-bold text-vino-darker/40 uppercase tracking-widest">
                        Deccan Plateau Terroir
                    </div>

                    {/* Interactive Pins Positioned relative */}
                    <div className="relative w-full max-w-4xl h-full flex items-center justify-around">
                        {experiences.map((exp, idx) => {
                            // Custom relative offsets for visual simulation
                            const positions = [
                                { top: '35%', left: '25%' },
                                { top: '55%', left: '45%' },
                                { top: '70%', left: '75%' },
                                { top: '25%', left: '65%' },
                                { top: '45%', left: '80%' },
                            ]
                            const pos = positions[idx % positions.length]

                            return (
                                <div
                                    key={exp.id}
                                    style={{ position: 'absolute', top: pos.top, left: pos.left }}
                                    className="relative group z-20"
                                >
                                    {/* Pulse Animation */}
                                    <span className="absolute -inset-2 rounded-full bg-vino-accent/30 animate-ping" />

                                    {/* Pin Button */}
                                    <button
                                        onClick={() => onSelect(exp)}
                                        onMouseEnter={() => setHoveredExp(exp)}
                                        onMouseLeave={() => setHoveredExp(null)}
                                        className="relative px-3.5 py-2 rounded-2xl bg-vino-darker text-white text-xs font-bold flex items-center gap-2 shadow-xl border border-vino-gold hover:scale-110 transition-transform cursor-pointer"
                                    >
                                        <MapPin size={15} className="text-vino-gold fill-vino-gold/20" />
                                        <span>{exp.currency}{exp.price}</span>
                                    </button>

                                    {/* Hover Preview Card */}
                                    {hoveredExp?.id === exp.id && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-white p-3 rounded-2xl shadow-2xl border border-vino-gold/40 z-30 pointer-events-none"
                                        >
                                            <div className="flex items-center gap-1.5 text-[10px] text-vino-accent font-bold uppercase tracking-wider mb-1">
                                                <span>{exp.category}</span>
                                            </div>
                                            <h4 className="font-serif text-sm font-bold text-vino-darker line-clamp-1">
                                                {exp.title}
                                            </h4>
                                            <div className="flex items-center justify-between mt-2 text-xs text-vino-dark/70">
                                                <span>{exp.winery}</span>
                                                <div className="flex items-center gap-1 font-bold text-amber-600">
                                                    <Star size={11} className="fill-amber-400 text-amber-400" />
                                                    <span>{exp.rating}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                </div>
            </div>
        </section>
    )
}
