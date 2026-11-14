'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
    children: React.ReactNode
    className?: string
    hover?: boolean
    onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = true,
    onClick,
}) => {
    return (
        <motion.div
            whileHover={hover ? { y: -4 } : undefined}
            transition={{ duration: 0.3 }}
            onClick={onClick}
            className={`
        bg-vino-darker border border-vino-darkest rounded-lg overflow-hidden
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
        >
            {children}
        </motion.div>
    )
}
