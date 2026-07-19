'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SectionTitleProps {
    title: string
    subtitle?: string
    className?: string
    centered?: boolean
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
    title,
    subtitle,
    className = '',
    centered = true,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`
        ${centered ? 'text-center' : ''}
        ${className}
      `}
        >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
                {title}
            </h2>
            {subtitle && (
                <p className="text-vino-gray-dark max-w-2xl mx-auto text-lg leading-relaxed">
                    {subtitle}
                </p>
            )}
        </motion.div>
    )
}
