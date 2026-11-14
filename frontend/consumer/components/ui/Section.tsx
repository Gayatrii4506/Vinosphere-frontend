import React from 'react'

interface SectionProps {
    children: React.ReactNode
    className?: string
    id?: string
    yPadding?: 'sm' | 'md' | 'lg' | 'xl'
}

const paddingVariants = {
    sm: 'py-12 md:py-16',
    md: 'py-16 md:py-24',
    lg: 'py-24 md:py-32',
    xl: 'py-32 md:py-40',
}

export const Section: React.FC<SectionProps> = ({
    children,
    className = '',
    id,
    yPadding = 'lg',
}) => {
    return (
        <section
            id={id}
            className={`
        w-full overflow-hidden
        ${paddingVariants[yPadding]}
        ${className}
      `}
        >
            {children}
        </section>
    )
}
