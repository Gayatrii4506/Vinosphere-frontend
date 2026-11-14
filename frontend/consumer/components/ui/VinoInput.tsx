import React from 'react'

export interface VinoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
}

/**
 * VinoInput - Standardized accessible form field input component for VinoSphere.
 * Provides rich focus states with Champagne Gold highlights, clear error hints, and optional icon triggers.
 */
export const VinoInput = React.forwardRef<HTMLInputElement, VinoInputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-stone-400 pointer-events-none shrink-0">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl bg-white dark:bg-[#0A0609] border text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm transition-all duration-200 focus:outline-none ${
              icon ? 'pl-10 pr-4' : 'px-4'
            } py-2.5 ${
              error
                ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-stone-300 dark:border-stone-800 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 dark:focus:border-[#D4AF37]'
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

VinoInput.displayName = 'VinoInput'
