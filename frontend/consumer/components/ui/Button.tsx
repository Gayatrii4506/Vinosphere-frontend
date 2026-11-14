'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    children: React.ReactNode
    href?: string
    asChild?: boolean
}

const variants = {
    primary: 'bg-vino-accent text-white hover:bg-vino-accent/90',
    secondary: 'bg-vino-gold text-vino-dark hover:bg-vino-gold-light',
    outline: 'border border-vino-accent text-vino-accent hover:bg-vino-accent/10',
    ghost: 'text-vino-gold hover:text-vino-gold-light',
}

const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    ...props
}) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            suppressHydrationWarning
            className={`
        font-medium rounded-sm transition-all duration-300 ease-out
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            {...(props as any)}
        >
            {children}
        </motion.button>
    )
}
