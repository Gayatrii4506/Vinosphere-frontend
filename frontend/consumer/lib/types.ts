// Common Types
export interface BaseEntity {
    id: string
    createdAt: Date
    updatedAt: Date
}

export interface ImageData {
    src: string
    alt: string
    width?: number
    height?: number
}

export interface CTAButton {
    label: string
    href?: string
    onClick?: () => void
    variant?: 'primary' | 'secondary' | 'outline'
}

// Wine Related
export interface Wine extends BaseEntity {
    name: string
    region: string
    vintage: number
    type: 'red' | 'white' | 'rosé' | 'sparkling' | 'dessert'
    description: string
    image: ImageData
}

export interface WineCollection extends BaseEntity {
    name: string
    description: string
    wines: Wine[]
    image: ImageData
}

export interface WineRegion extends BaseEntity {
    name: string
    country: string
    description: string
    image: ImageData
}

// Event Related
export interface Event extends BaseEntity {
    title: string
    description: string
    date: Date
    location: string
    capacity: number
    registered: number
    image: ImageData
    price?: number
}

// Blog Related
export interface BlogPost extends BaseEntity {
    title: string
    excerpt: string
    content: string
    author: string
    date: Date
    image: ImageData
    category: string
}

// Testimonial
export interface Testimonial extends BaseEntity {
    name: string
    role: string
    content: string
    image: ImageData
    rating: number
}
