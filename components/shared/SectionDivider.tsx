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
    /** Optional explicit hex fill color — use when Tailwind JIT won't generate the arbitrary fill class */
    fillColor?: string
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
    fromFill = 'fill-vino-dark',
    toBg = 'bg-vino-cream',
    flip = false,
    height = 90,
    className = '',
    fillColor,
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
          ${fillColor ? '' : fromFill}
          ${flip ? 'scale-x-[-1]' : ''}
        `}
                style={fillColor ? { fill: fillColor } : undefined}
            >
                {/*
          Asymmetrical cubic-bezier curve:
          - Starts at top-left (0,0)
          - Drops to a trough around x=300 (left-heavy dip)
          - Sweeps back up through x=900 (gentle rise)
          - Ends at bottom-right (1440,90)
          This creates an organic, off-centre editorial S-feel.
        */}
<path
d="
M0 0,
C180,25 250,90 540,55
C720,20 900,90 1080,50
C1230,25 1340,65 1440,40
L1440,0
"
/>         </svg>
        </div>
    )
}
