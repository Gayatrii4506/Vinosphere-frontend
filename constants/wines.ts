export interface Wine {
    id: string
    name: string
    origin: string
    volume: string
    year: number
    rating: number
    reviews: number
    price: number
    currency: string
    imageUrl: string
    type: 'Red' | 'White' | 'Rose' | 'Sparkling'
    sugar: 'Dry' | 'Semi-Dry' | 'Sweet' | 'Semi-Sweet' | string
    country: string
    manufacturer: string
    foodPairing: string[]
    description?: string
    tasteNotes?: string[]
    alcoholPercentage?: number | string
    servingTemperature?: string
    body?: string
    acidity?: string
    tannin?: string
    grapeVariety?: string
}

export const WINES: Wine[] = []
