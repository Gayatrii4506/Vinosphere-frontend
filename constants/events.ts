export interface Host {
    name: string
    title: string
    avatar: string
    rating: number
    bio: string
    verified: boolean
}

export interface ItineraryStep {
    time: string
    title: string
    description: string
}

export interface IncludedItem {
    item: string
    iconName: string
}

export interface FeaturedWine {
    name: string
    type: string
    vintage: string
    notes: string
}

export interface Review {
    id: string
    author: string
    avatar: string
    rating: number
    date: string
    comment: string
}

export interface VinoSphereExperience {
    id: string
    title: string
    wineryId?: string
    tagline: string
    type?: 'event' | 'experience'
    category: 'Wine Tastings' | 'Vineyard Tours' | 'Harvest Festivals' | 'Food Pairing' | 'Sommelier Workshops' | 'Sunset Soirées'
    badge?: 'Featured' | 'Best Seller' | 'Selling Fast' | 'Exclusive' | 'Reserve Collection'
    image: string
    gallery: string[]
    winery: string
    location: string
    region: string
    date: string
    time: string
    duration: string
    rating: number
    reviewCount: number
    price: number
    originalPrice?: number
    currency: string
    spotsLeft: number
    totalSpots: number
    coordinates: {
        lat: number
        lng: number
    }
    overview: string
    description?: string
    highlights: string[]
    host: Host
    itinerary: ItineraryStep[]
    included: IncludedItem[]
    featuredWines: FeaturedWine[]
    reviews: Review[]
    status?: 'upcoming' | 'ongoing' | 'past'
    turnoutCount?: number
    recapNotes?: string
}

export const EXPERIENCE_CATEGORIES = [
    'All Journeys',
    'Wine Tastings',
    'Vineyard Tours',
    'Harvest Festivals',
    'Food Pairing',
    'Sommelier Workshops',
    'Sunset Soirées',
] as const

export const EXPERIENCES: VinoSphereExperience[] = [
    {
        id: 'nashik-harvest-gala-2027',
        title: 'Nashik Grape Harvest & Stomp Gala',
        tagline: 'Immerse in the annual grape crushing ritual, live jazz, and barrel tastings at Sula.',
        category: 'Harvest Festivals',
        badge: 'Best Seller',
        image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png',
        gallery: [
            'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png',
            'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif',
            'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png',
        ],
        winery: 'Sula Vineyards',
        location: 'Gangapur Dam Road, Nashik',
        region: 'Nashik, Maharashtra',
        date: 'Sat, 6 Feb 2027',
        time: '3:00 PM - 9:00 PM',
        duration: '6 Hours',
        rating: 4.94,
        reviewCount: 184,
        price: 2500,
        originalPrice: 3200,
        currency: '₹',
        spotsLeft: 12,
        totalSpots: 150,
        coordinates: { lat: 19.9975, lng: 73.7898 },
        overview: 'Step into the vibrant spirit of Nashik harvest season. Join Sommelier-guided vineyard walks, traditional grape crushing in oak barrels, paired artisanal cheeses, and sunset live musical acoustic sessions over the Gangapur lake.',
        highlights: [
            'Traditional Grape Stomping ritual in wooden vats',
            'Exclusive preview tasting of 2026 Reserve Vintages',
            '4-Course Farm-to-Table paired sunset dinner',
            'Commemorative engraved crystal wine glass',
        ],
        host: {
            name: 'Karan Varma',
            title: 'Head Winemaker & Sommelier',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
            rating: 4.98,
            bio: 'Certified WSET Level 4 Sommelier with 14 years crafting award-winning Shiraz and Chenin Blancs across India and Bordeaux.',
            verified: true,
        },
        itinerary: [
            { time: '3:00 PM', title: 'Welcome & Sparkling Wine Toast', description: 'Arrival at Sula Amphitheatre with chilled Tropical Brut.' },
            { time: '4:00 PM', title: 'Grape Harvest Walk & Stomping', description: 'Guided harvesting in the estate vines followed by music-filled grape stomping.' },
            { time: '6:00 PM', title: 'Cellar Vault Barrel Tasting', description: 'Private access to the underground oak aging cellar with direct barrel pours.' },
            { time: '7:30 PM', title: 'Sunset Pairing Dinner', description: 'Gourmet 4-course banquet accompanied by acoustic jazz under the stars.' },
        ],
        included: [
            { item: '5 Premium Wine Tastings', iconName: 'Wine' },
            { item: '4-Course Artisanal Meal', iconName: 'Utensils' },
            { item: 'Souvenir Crystal Glass', iconName: 'Gift' },
            { item: 'Luxury AC Shuttle Option', iconName: 'Car' },
        ],
        featuredWines: [
            { name: 'Sula Dindori Reserve Shiraz', vintage: '2021', type: 'Red', notes: 'Ripe berries, dark chocolate, and subtle oak spices.' },
            { name: 'Rasa Cabernet Sauvignon', vintage: '2020', type: 'Red', notes: 'Full-bodied with structured tannins and cassis.' },
            { name: 'Tropical Brut Sparkling', vintage: '2022', type: 'Sparkling', notes: 'Crisp green apple, passion fruit, and fine bubbles.' },
        ],
        reviews: [
            {
                id: 'r1',
                author: 'Priya Sharma',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
                rating: 5,
                date: 'March 2026',
                comment: 'An unforgettable evening! The sunset view over the lake paired with Dindori Shiraz was absolute magic. Highly recommended!',
            },
            {
                id: 'r2',
                author: 'Rahul Mehta',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
                rating: 5,
                date: 'February 2026',
                comment: 'Karan was an exceptionally knowledgeable host. The barrel tasting in the underground cellar gave me a whole new appreciation for Indian wines.',
            },
        ],
    },
    {
        id: 'york-sunset-chef-pairing',
        title: 'Lakefront Sunset & 5-Course Chef Pairing',
        tagline: 'An intimate culinary journey overlooking Gangapur Lake paired with York Reserve Vintages.',
        category: 'Food Pairing',
        badge: 'Reserve Collection',
        image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png',
        gallery: [
            'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png',
            'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png',
        ],
        winery: 'York Winery',
        location: 'Gangapur Dam Backwaters, Nashik',
        region: 'Nashik, Maharashtra',
        date: 'Sun, 20 Dec 2026',
        time: '5:30 PM - 9:30 PM',
        duration: '4 Hours',
        rating: 4.96,
        reviewCount: 96,
        price: 3500,
        originalPrice: 4200,
        currency: '₹',
        spotsLeft: 6,
        totalSpots: 24,
        coordinates: { lat: 19.988, lng: 73.742 },
        overview: 'Indulge in a boutique fine-dining experience at York Winery’s panoramic lakefront deck. Executive Chef Ananya Roy crafts 5 signature dishes, each paired with a rare reserve vintage curated by York’s lead enologist.',
        highlights: [
            'Intimate seating limited to 24 guests for hyper-personalized service',
            '5-Course tasting menu featuring modern Indian fusion delicacies',
            'Exclusive pouring of York Arros flagship red blend',
            'Sommelier guided flavor profiling masterclass',
        ],
        host: {
            name: 'Chef Ananya Roy',
            title: 'Executive Culinary Director',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
            rating: 4.99,
            bio: 'Michelin-trained chef specializing in pairing regional ingredients with complex cool-climate wines.',
            verified: true,
        },
        itinerary: [
            { time: '5:30 PM', title: 'Lakeview Apertif', description: 'Sparkling Rosé reception on the wooden dock watching the sunset.' },
            { time: '6:15 PM', title: 'Winery & Oak Room Walkthrough', description: 'Private tour of fermentation tanks and barrel rooms.' },
            { time: '7:00 PM', title: '5-Course Pairing Banquet', description: 'Seated multi-course dinner with live sommelier commentary per course.' },
        ],
        included: [
            { item: '5 Reserve Wine Glasses', iconName: 'Wine' },
            { item: '5-Course Chef Menu', iconName: 'Utensils' },
            { item: 'Personalized Menu Card', iconName: 'FileText' },
        ],
        featuredWines: [
            { name: 'York Arros Reserve Red', vintage: '2019', type: 'Red', notes: 'Flagship blend of Shiraz & Cabernet with rich vanilla and oak notes.' },
            { name: 'York Sparkling Rosé', vintage: '2022', type: 'Sparkling', notes: 'Vibrant strawberries, raspberries, and crisp acidity.' },
        ],
        reviews: [
            {
                id: 'r3',
                author: 'Aarav Kapoor',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
                rating: 5,
                date: 'January 2026',
                comment: 'The York Arros pairing with smoked lamb chops was pure heaven. Incredible ambiance!',
            },
        ],
    },
    {
        id: 'grover-zampa-sommelier-masterclass',
        title: 'Grand Sommelier Masterclass & Cellar Tasting',
        tagline: 'Master the art of blind tasting, terroir analysis, and cellaring with Grover Zampa.',
        category: 'Sommelier Workshops',
        badge: 'Exclusive',
        image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif',
        gallery: [
            'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif',
            'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png',
        ],
        winery: 'Grover Zampa Vineyards',
        location: 'Nandi Hills, Bengaluru',
        region: 'Nandi Hills, Karnataka',
        date: 'Sat, 14 Feb 2026',
        time: '11:00 AM - 3:00 PM',
        duration: '4 Hours',
        rating: 4.91,
        reviewCount: 62,
        price: 3200,
        originalPrice: 4000,
        currency: '₹',
        spotsLeft: 4,
        totalSpots: 20,
        coordinates: { lat: 13.3702, lng: 77.6835 },
        overview: 'Elevate your wine knowledge at the picturesque slopes of Nandi Hills. Learn the French technique of sight, aroma, and palette evaluation while tasting award-winning La Réserve vintages inside the aging cellar.',
        highlights: [
            'Blind tasting challenge with digital scorecards',
            'Deep dive into high-altitude Karnataka terroir',
            'Guided tasting of 6 international award-winning wines',
            'Official VinoSphere Masterclass Certificate',
        ],
        host: {
            name: 'Vikramaditya Rao',
            title: 'Senior Cellar Master',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
            rating: 4.95,
            bio: 'Educator and winemaker trained in Piedmont, Italy, passionate about tropical viticulture.',
            verified: true,
        },
        itinerary: [
            { time: '11:00 AM', title: 'Nandi Terroir Intro & Vineyard Walk', description: 'Walk through Cabernet Sauvignon vines at 900m altitude.' },
            { time: '12:00 PM', title: 'Sensory Lab & Aroma Wheel Exercise', description: 'Train your palate using 18 natural aroma essence vials.' },
            { time: '1:15 PM', title: 'Underground Cellar Blind Tasting', description: 'Evaluate 6 masked reserve bottles alongside cheese platters.' },
        ],
        included: [
            { item: '6 Reserve Tastings', iconName: 'Wine' },
            { item: 'Gourmet Cheese Platter', iconName: 'Utensils' },
            { item: 'Certification Certificate', iconName: 'Award' },
        ],
        featuredWines: [
            { name: 'Grover La Réserve Cabernet Shiraz', vintage: '2018', type: 'Red', notes: 'Chocolate, coffee bean, and black pepper accents.' },
            { name: 'Zampa Soirée Brut', vintage: '2021', type: 'Sparkling', notes: 'Brioche notes, yeast, and zesty citrus finish.' },
        ],
        reviews: [
            {
                id: 'r4',
                author: 'Sneha Patel',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
                rating: 5,
                date: 'February 2026',
                comment: 'The sensory aroma exercise opened up my mind! I finally understand how to spot oak notes.',
            },
        ],
    },
    {
        id: 'fratelli-estate-tour-picnic',
        title: 'Akluj Estate Vineyard Tour & Private Picnic',
        tagline: 'Explore 240 acres of rolling vines on electric bikes followed by a luxury vineyard picnic.',
        category: 'Vineyard Tours',
        badge: 'Featured',
        image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png',
        gallery: [
            'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png',
            'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif',
        ],
        winery: 'Fratelli Vineyards',
        location: 'Akluj Estate, Solapur',
        region: 'Solapur, Maharashtra',
        date: 'Sat, 27 Feb 2027',
        time: '10:00 AM - 4:00 PM',
        duration: '6 Hours',
        rating: 4.88,
        reviewCount: 112,
        price: 2800,
        originalPrice: 3500,
        currency: '₹',
        spotsLeft: 18,
        totalSpots: 40,
        coordinates: { lat: 17.892, lng: 75.021 },
        overview: 'Escape city hustle to Fratelli’s sprawling 240-acre estate. Glide through pristine vineyard rows on guided e-bikes, explore Italy-imported stainless steel fermenters, and relax at a private hilltop picnic pavilion.',
        highlights: [
            'Guided E-Bike safari across 240 acres of estate vines',
            'Exclusive tasting of Sette flagship super-premium red',
            'Private hillock picnic hamper with charcuterie & wood-fired pizza',
            'Winemaker Q&A session',
        ],
        host: {
            name: 'Alessio Secci',
            title: 'Co-founder & Master Blender',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250',
            rating: 4.97,
            bio: 'Italian winemaker bringing Tuscan winemaking heritage to Maharashtra soil.',
            verified: true,
        },
        itinerary: [
            { time: '10:00 AM', title: 'Estate Welcome & Espresso Bar', description: 'Fresh Italian coffee & warm croissants on arrival.' },
            { time: '11:00 AM', title: 'Vineyard E-Bike Safari', description: 'Cycle through Sangiovese and Chardonnay blocks.' },
            { time: '1:00 PM', title: 'Hilltop Picnic & Sette Vertical Tasting', description: 'Enjoy wood-fired pizza & reserve wine flights overlooking the valley.' },
        ],
        included: [
            { item: 'E-Bike Rental & Helmet', iconName: 'Bike' },
            { item: '4 Wine Flights', iconName: 'Wine' },
            { item: 'Gourmet Picnic Hamper', iconName: 'Utensils' },
        ],
        featuredWines: [
            { name: 'Fratelli SETTE', vintage: '2020', type: 'Red', notes: 'Sangiovese & Cabernet Franc blend with velvety plum and vanilla.' },
            { name: 'Fratelli Vitae Chardonnay', vintage: '2022', type: 'White', notes: 'Buttery texture with melon and tropical stone fruit aromas.' },
        ],
        reviews: [
            {
                id: 'r5',
                author: 'Devika Nair',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
                rating: 5,
                date: 'December 2025',
                comment: 'The hilltop picnic was like being transported straight to Tuscany. Fratelli SETTE is incredible!',
            },
        ],
    },
    {
        id: 'sula-twilight-soiree',
        title: 'Twilight Jazz & Sparkling Soirée',
        tagline: 'An elegant twilight gathering with bottomless sparkling pours, artisan tapas, and live lounge jazz.',
        category: 'Sunset Soirées',
        badge: 'Selling Fast',
        image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif',
        gallery: [
            'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif',
            'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png',
        ],
        winery: 'Sula Vineyards',
        location: 'The Tuscan Terrace, Nashik',
        region: 'Nashik, Maharashtra',
        date: 'Sat, 13 Mar 2027',
        time: '6:00 PM - 10:00 PM',
        duration: '4 Hours',
        rating: 4.92,
        reviewCount: 145,
        price: 2900,
        originalPrice: 3600,
        currency: '₹',
        spotsLeft: 5,
        totalSpots: 60,
        coordinates: { lat: 19.9975, lng: 73.7898 },
        overview: 'Experience the magic of golden hour at Sula’s elevated Tuscan Terrace. Enjoy free-flowing Methode Champenoise sparkling wines, pass-around gourmet appetizers, and smooth live saxophone melodies as dusk falls.',
        highlights: [
            'Bottomless pours of Sula Seco & Brut Tropical',
            'Live Saxophone & Jazz Quartet performance',
            'Artisanal cheese wheel & charcuterie grazing tables',
            'Stargazing telescoping session over Nashik valley',
        ],
        host: {
            name: 'Rohan Deshmukh',
            title: 'Hospitality & Events Director',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
            rating: 4.94,
            bio: 'Curator of luxury wine lifestyle events and nightlife experiences across India.',
            verified: true,
        },
        itinerary: [
            { time: '6:00 PM', title: 'Golden Hour Welcome', description: 'Chilled sparkling Rosé & sunset photo opportunities.' },
            { time: '7:15 PM', title: 'Live Jazz & Grazing Feast', description: 'Saxophone performance accompanied by hand-crafted warm tapas.' },
            { time: '9:00 PM', title: 'Stargazing & Dessert Wine Flight', description: 'Late harvest Late Harvest Chenin Blanc served with dark chocolates.' },
        ],
        included: [
            { item: 'Unlimited Sparkling Wine', iconName: 'Wine' },
            { item: 'Unlimited Gourmet Tapas', iconName: 'Utensils' },
            { item: 'Live Musical Performance', iconName: 'Music' },
        ],
        featuredWines: [
            { name: 'Sula Brut Tropical', vintage: 'NV', type: 'Sparkling', notes: 'Blend of Pinot Noir & Riesling with elegant effervescence.' },
            { name: 'Late Harvest Chenin Blanc', vintage: '2021', type: 'Sweet', notes: 'Honeyed apricot, orange marmalade, and silky sweetness.' },
        ],
        reviews: [
            {
                id: 'r6',
                author: 'Manish Verma',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
                rating: 5,
                date: 'January 2026',
                comment: 'The vibe at the Tuscan Terrace was unmatched. Great music, endless sparkling wine, and fantastic crowd!',
            },
        ],
    },
    {
        id: 'york-monsoon-barrel-retrospective-2025',
        title: 'Monsoon Reserve Barrel & Cellar Retrospective',
        tagline: 'An intimate library vintage vertical tasting and cellar dinner hosted during the lush monsoon mist.',
        category: 'Sommelier Workshops',
        badge: 'Exclusive',
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1200',
        gallery: [
            'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=1200',
        ],
        winery: 'York Winery & Tasting Room',
        location: 'Gangapur Dam, Nashik',
        region: 'Nashik, Maharashtra',
        date: 'Sat, 16 Aug 2025',
        time: '5:00 PM - 9:30 PM',
        duration: '4.5 Hours',
        rating: 4.96,
        reviewCount: 68,
        price: 3400,
        currency: '₹',
        spotsLeft: 0,
        totalSpots: 45,
        coordinates: { lat: 19.9980, lng: 73.7850 },
        overview: 'A historic retrospective evening at York Winery overlooking the mist-covered Gangapur dam waters. Winemakers and collectors gathered for an exclusive vertical uncorking of York Reserve Cabernet and barrel samples, culminating in a 5-course chef-crafted pairing feast.',
        highlights: [
            'Vertical tasting across 5 consecutive reserve vintages',
            'Direct barrel sampling guided by the Master Winemaker',
            '5-course farm-fresh monsoon culinary dinner pairing',
            'Personalized signed cellar reserve collector bottle',
        ],
        host: {
            name: 'Kailash Gurnani',
            title: 'Chief Winemaker',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
            rating: 4.98,
            bio: 'Australian-trained enologist heading winemaking at York Winery with deep passion for balanced, expressive Indian terroir.',
            verified: true,
        },
        itinerary: [
            { time: '5:00 PM', title: 'Cellar Welcome & Sparkling Toast', description: 'Reception in the underground barrel room with York Sparkling Rosé.' },
            { time: '6:15 PM', title: 'Vertical Library Vintage Masterclass', description: 'Comparative deep-dive into cellared vintages 2018 through 2023.' },
            { time: '8:00 PM', title: 'Candlelit 5-Course Pairing Banquet', description: 'Long-table gourmet feast in the cellar with paired Reserve Shiraz.' },
        ],
        included: [
            { item: '6 Hand-selected Reserve Vintages', iconName: 'Wine' },
            { item: '5-Course Chef Pairing Dinner', iconName: 'Utensils' },
            { item: 'Exclusive Barrel Sample Tastings', iconName: 'Award' },
        ],
        featuredWines: [
            { name: 'York Reserve Cabernet Sauvignon', vintage: '2019', type: 'Red', notes: 'Ripe blackcurrant, cedar wood, elegant velvety tannins.' },
            { name: 'York Arros Shiraz Cabernet', vintage: '2020', type: 'Red Blend', notes: 'Dark plum, toasted vanilla, spices and lingering complex finish.' },
        ],
        reviews: [
            {
                id: 'r-past-1',
                author: 'Aditya Singhania',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
                rating: 5,
                date: 'August 2025',
                comment: 'The vertical tasting was world-class. Being able to taste barrel samples side-by-side with aged vintages was a revelation.',
            },
            {
                id: 'r-past-2',
                author: 'Pooja Kashyap',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
                rating: 5,
                date: 'August 2025',
                comment: 'Incredible atmosphere in the candlelit cellar with the rain pouring outside. Outstanding hospitality and food pairing!',
            },
        ],
        status: 'past',
        turnoutCount: 45,
        recapNotes: 'Concluded with full house capacity. 45 passionate wine connoisseurs experienced an exceptional evening of vintage verticals and cellar pairings.',
    },
]
