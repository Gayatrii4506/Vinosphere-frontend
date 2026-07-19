import React from 'react'

/**
 * SectionDivider — asymmetrical curved SVG transition
 *
 * The curve is intentionally off-centre: it dips deep on the left and
 * rides high on the right, giving an editorial, organic feel.
 *
 * Props:
 *  fromFill  – Tailwind `fill-*` class for the colour of the section above
 *  toBg      – Tailwind `bg-*`   class for the colour of the section below
 *  flip      – flip the curve horizontally (high-left / low-right)
 *  height    – pixel height of the divider band (default 90)
 */

interface SectionDividerProps {
    fromFill?: string
    toBg?: string
    flip?: boolean
    height?: number
    className?: string
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
    fromFill = 'fill-vino-dark',
    toBg = 'bg-vino-cream',
    flip = false,
    height = 90,
    className = '',
}) => {
    return (
        <div
            aria-hidden="true"
            className={`relative w-full overflow-hidden leading-[0] ${toBg} ${className}`}
            style={{ height, marginTop: '-1px' }}
        >
            <svg
                viewBox="0 0 1440 90"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`
          absolute inset-0 w-full h-full
          ${fromFill}
          ${flip ? 'scale-x-[-1]' : ''}
        `}
            >
                {/*
          Asymmetrical cubic-bezier curve:
          - Starts at top-left (0,0)
          - Drops to a trough around x=300 (left-heavy dip)
          - Sweeps back up through x=900 (gentle rise)
          - Ends at bottom-right (1440,90)
          This creates an organic, off-centre editorial S-feel.
        */}
                <path d="M0,0 L0,0 C200,90 400,10 720,55 C1020,95 1260,20 1440,60 L1440,0 Z" />
            </svg>
        </div>
    )
}
