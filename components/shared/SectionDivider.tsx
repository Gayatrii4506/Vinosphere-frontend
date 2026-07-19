import React from 'react'

interface SectionDividerProps {
    fromFill?: string   // Tailwind fill class matching the section above
    toBg?: string       // Tailwind bg class matching the section below
    flip?: boolean      // Mirror vertically for light → dark
    className?: string
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
    fromFill = 'fill-vino-dark',
    toBg = 'bg-vino-cream',
    flip = false,
    className = '',
}) => {
    return (
        <div
            className={`relative w-full overflow-hidden leading-none line-height-0 ${toBg} ${className}`}
            style={{ height: '72px', marginTop: '-1px' }}
        >
            <svg
                viewBox="0 0 1440 72"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`absolute inset-0 w-full h-full ${fromFill} ${flip ? 'scale-y-[-1]' : ''}`}
            >
                {/* Single clean wave — no secondary path, no grey ghost */}
                <path d="M0,0 L0,48 C360,80 1080,16 1440,48 L1440,0 Z" />
            </svg>
        </div>
    )
}
