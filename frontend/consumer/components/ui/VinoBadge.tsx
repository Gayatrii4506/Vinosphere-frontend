import React from 'react'

export interface VinoBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'burgundy' | 'gold' | 'success' | 'warning' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  dot?: boolean
  children: React.ReactNode
}

/**
 * VinoBadge - Status indicator tag & badge for VinoSphere.
 * Provides clear visual feedback for wine categories, inventory state, and verification status.
 */
export const VinoBadge: React.FC<VinoBadgeProps> = ({
  variant = 'burgundy',
  size = 'md',
  dot = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide transition-colors'

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  }

  const variantStyles = {
    burgundy:
      'bg-[#721832]/10 dark:bg-[#721832]/25 text-[#721832] dark:text-[#E892A8] border border-[#721832]/20 dark:border-[#721832]/40',
    gold:
      'bg-[#D4AF37]/15 dark:bg-[#D4AF37]/25 text-amber-800 dark:text-[#F3E5AB] border border-[#D4AF37]/30 dark:border-[#D4AF37]/40',
    success:
      'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30',
    warning:
      'bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30',
    info:
      'bg-sky-500/10 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/30',
    neutral:
      'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700',
  }

  const dotColors = {
    burgundy: 'bg-[#721832] dark:bg-[#E892A8]',
    gold: 'bg-[#D4AF37] dark:bg-[#F3E5AB]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
    neutral: 'bg-stone-400',
  }

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  )
}
