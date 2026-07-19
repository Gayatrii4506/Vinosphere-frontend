import React from 'react'

interface ContainerProps {
    children: React.ReactNode
    className?: string
    size?: 'default' | 'lg' | 'xl'
}

const sizes = {
    default: 'max-w-7xl',
    lg: 'max-w-6xl',
    xl: 'max-w-full',
}

export const Container: React.FC<ContainerProps> = ({
    children,
    className = '',
    size = 'default',
}) => {
    return (
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizes[size]} ${className}`}>
            {children}
        </div>
    )
}
