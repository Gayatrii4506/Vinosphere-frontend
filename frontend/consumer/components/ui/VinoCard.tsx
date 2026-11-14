import React from 'react'

export interface VinoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'glass' | 'bordered' | 'gold-accent'
  hoverEffect?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

/**
 * VinoCard - Premium card surface container for VinoSphere.
 * Supports clean surfaces, subtle gold accents, and selective glassmorphic blur.
 */
export const VinoCard: React.FC<VinoCardProps> = ({
  variant = 'surface',
  hoverEffect = false,
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300 relative overflow-hidden'
  
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const variantStyles = {
    surface: 'bg-white dark:bg-[#140D12] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-800 shadow-sm',
    glass: 'bg-white/80 dark:bg-[#140D12]/80 backdrop-blur-md text-stone-900 dark:text-stone-100 border border-stone-200/50 dark:border-stone-800/60 shadow-md',
    bordered: 'bg-stone-50/50 dark:bg-[#0A0609]/50 text-stone-900 dark:text-stone-100 border-2 border-stone-200 dark:border-stone-800',
    'gold-accent': 'bg-white dark:bg-[#140D12] text-stone-900 dark:text-stone-100 border border-[#D4AF37]/30 shadow-md ring-1 ring-[#D4AF37]/20',
  }

  const hoverStyles = hoverEffect
    ? 'hover:-translate-y-1 hover:shadow-xl hover:border-[#D4AF37]/50 cursor-pointer'
    : ''

  return (
    <div
      className={`${baseStyles} ${paddingStyles[padding]} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
