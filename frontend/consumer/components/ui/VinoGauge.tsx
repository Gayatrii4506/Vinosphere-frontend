import React from 'react'

export interface VinoGaugeProps {
  score: number // 0 - 100
  maxScore?: number
  label?: string
  sublabel?: string
  size?: number
  strokeWidth?: number
  variant?: 'gold' | 'burgundy' | 'quality'
  className?: string
}

/**
 * VinoGauge - Radial SVG metric meter for Wine Quality Scores and Food Pairing Match Scores.
 * Features an SVG track with stroke dash offset animation and central metric typography.
 */
export const VinoGauge: React.FC<VinoGaugeProps> = ({
  score,
  maxScore = 100,
  label = 'Quality Score',
  sublabel,
  size = 140,
  strokeWidth = 10,
  variant = 'quality',
  className = '',
}) => {
  const normalizedScore = Math.min(Math.max(score, 0), maxScore)
  const percentage = (normalizedScore / maxScore) * 100

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Color scheme based on score or variant
  const getGradientColors = () => {
    if (variant === 'gold') {
      return { start: '#D4AF37', end: '#F3E5AB' }
    }
    if (variant === 'burgundy') {
      return { start: '#721832', end: '#A8284F' }
    }
    // Dynamic quality score colors
    if (normalizedScore >= 80) return { start: '#D4AF37', end: '#10B981' } // Gold to emerald
    if (normalizedScore >= 60) return { start: '#F59E0B', end: '#D4AF37' } // Amber to gold
    return { start: '#EF4444', end: '#F59E0B' } // Red to amber
  }

  const { start, end } = getGradientColors()
  const gradientId = `vino-gauge-gradient-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={start} />
              <stop offset="100%" stopColor={end} />
            </linearGradient>
          </defs>
          {/* Track Background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-stone-200 dark:text-stone-800"
            fill="transparent"
          />
          {/* Score Indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
            {normalizedScore}
          </span>
          {maxScore !== 100 && (
            <span className="text-xs text-stone-400">/ {maxScore}</span>
          )}
        </div>
      </div>
      {label && (
        <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="text-xs text-stone-500 dark:text-stone-500">{sublabel}</span>
      )}
    </div>
  )
}
