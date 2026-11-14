import React from 'react'

export interface VinoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary-gold' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
  children: React.ReactNode
}

/**
 * VinoButton - Unified button element for VinoSphere.
 * Features Burgundy gradients, Champagne Gold accents, and tactile interactive feedback.
 */
export const VinoButton: React.FC<VinoButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 select-none'

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  }

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#721832] to-[#8E1F3F] text-white hover:from-[#8E1F3F] hover:to-[#A8284F] shadow-md hover:shadow-lg shadow-[#721832]/25 focus:ring-[#721832]',
    'secondary-gold':
      'bg-gradient-to-r from-[#D4AF37] to-[#E5C158] text-stone-950 font-semibold hover:from-[#E5C158] hover:to-[#F3E5AB] shadow-md shadow-[#D4AF37]/20 focus:ring-[#D4AF37]',
    outline:
      'border-2 border-[#D4AF37]/60 text-stone-800 dark:text-stone-100 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 focus:ring-[#D4AF37]',
    ghost:
      'text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-white focus:ring-stone-400',
    danger:
      'bg-rose-700 text-white hover:bg-rose-800 shadow-sm focus:ring-rose-500',
  }

  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  )
}
