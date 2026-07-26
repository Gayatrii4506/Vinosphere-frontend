'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { images } from '@/constants/images'
import { Button } from '@/components/ui/Button'

interface HeroLandingProps {
    setShowCatalog: (show: boolean) => void
}

export default function HeroLanding({ setShowCatalog }: HeroLandingProps) {
    return (
        <div className="w-full flex flex-col items-center bg-[#FDFBF7]">
            {/* Hero Section */}
            <section className="relative w-full min-h-[60vh] flex items-center justify-center pt-24 pb-16 px-6">
                <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-bold text-vino-gold tracking-[0.2em] uppercase"
                    >
                        Experience Fine Wine
                    </motion.span>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-serif text-5xl md:text-7xl font-bold text-vino-dark leading-tight"
                    >
                        Exquisite Wines,<br />
                        Unforgettable <span className="text-vino-gold italic">Moments</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-vino-brown-light max-w-2xl mx-auto text-lg"
                    >
                        A perfect blend of taste, art, and ambiance. Crafted to delight your senses with artisanal wine and food pairings.
                    </motion.p>
                </div>
            </section>

            {/* Featured Section */}
            <section className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24">
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full md:w-1/2 relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <CloudinaryImage
                            src={images.events.tasting}
                            alt="Curated Wine Pairings"
                            fill
                            className="object-cover"
                        />
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full md:w-1/2 flex flex-col items-start gap-6"
                    >
                        <span className="text-xs font-bold text-vino-gold tracking-widest uppercase">
                            Curated Selections
                        </span>
                        
                        <h2 className="font-serif text-4xl lg:text-5xl font-bold text-vino-dark leading-tight">
                            Discover the Perfect Match
                        </h2>
                        
                        <p className="text-vino-brown-light leading-relaxed">
                            Whether you are enjoying a rich Paneer Makhani or a fragrant Vegetable Biryani, the right wine elevates the entire culinary experience. 
                            Our AI Sommelier analyzes flavor profiles, spice levels, and regional ingredients to recommend matches that bring out the best in both your glass and your plate.
                        </p>
                        
                        <Button 
                            variant="primary" 
                            size="lg" 
                            className="mt-4 bg-vino-accent hover:bg-vino-accent/90"
                            onClick={() => setShowCatalog(true)}
                        >
                            EXPLORE OUR COLLECTION
                        </Button>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
