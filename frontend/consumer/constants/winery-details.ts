// ─── Winery Details Data ─────────────────────────────────────────────────────

export interface WineryAward {
    year: string
    title: string
    competition: string
    medal: 'Gold' | 'Silver' | 'Platinum' | 'Double Gold'
}

export interface WineryPackage {
    id: string
    name: string
    duration: string
    price: number
    currency: string
    includes: string[]
    highlight?: boolean
}

export interface WineryGalleryImage {
    src: string
    alt: string
    span?: 'wide' | 'tall' | 'normal'
}

export interface WinerySignatureWine {
    id: string
    name: string
    type: string
    vintage: number
    rating: number
    price: number
    currency: string
    image: string
    notes: string
    grapes: string
    region: string
}

export interface WineryReview {
    id: string
    author: string
    avatar: string
    rating: number
    date: string
    text: string
    visit: string
}

export interface WineryDetails {
    id: string
    name: string
    tagline: string
    established: number
    location: string
    region: string
    heroImage: string
    logo: string
    awards: WineryAward[]
    storyTimeline: { year: string; title: string; text: string; image: string }[]
    estateExperiences: { title: string; description: string; image: string; align: 'left' | 'right' }[]
    signatureWines: WinerySignatureWine[]
    packages: WineryPackage[]
    gallery: WineryGalleryImage[]
    reviews: WineryReview[]
    relatedWineries: { id: string; name: string; location: string; image: string; rating: number }[]
    timings: string
    phone: string
    email: string
    website: string
    coordinates?: { lat: number; lng: number } | null
}

export const WINERY_DETAILS: Record<string, WineryDetails> = {
    sula: {
        id: 'sula',
        name: 'Sula Vineyards',
        tagline: "Where India's Wine Story Began",
        established: 1999,
        location: 'Nashik, Maharashtra, India',
        region: 'Nashik Valley',
        heroImage: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/sula_x7fqkh.jpg',
        logo: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/sula_x7fqkh.jpg',
        awards: [
            { year: '2023', title: 'Best Indian Winery', competition: 'Decanter World Wine Awards', medal: 'Gold' },
            { year: '2022', title: 'Sauvignon Blanc Gold', competition: 'International Wine Challenge', medal: 'Gold' },
            { year: '2021', title: 'Pioneer of Indian Wine', competition: 'Asia Wine Trophy', medal: 'Platinum' },
            { year: '2020', title: 'Best Red Wine', competition: 'Sommelier India Awards', medal: 'Double Gold' },
            { year: '2019', title: 'Estate of the Year', competition: 'Indian Wine Academy', medal: 'Gold' },
            { year: '2018', title: 'Rasa Shiraz Gold', competition: 'IWSC London', medal: 'Gold' },
        ],
        storyTimeline: [
            {
                year: '1999',
                title: 'A Dream Takes Root',
                text: 'Rajeev Samant returned from Silicon Valley with a vision: to transform the sun-baked volcanic soils of Nashik into India\'s premier wine country. He planted the first Sauvignon Blanc vines on a barren hillside, igniting a revolution.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/sula_x7fqkh.jpg',
            },
            {
                year: '2000',
                title: 'First Harvest',
                text: 'The inaugural vintage of Sula Sauvignon Blanc was produced — crisp, aromatic, and utterly unlike any wine Indians had tasted from their homeland. Critics took notice. A new chapter in Indian viticulture had begun.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/sula_x7fqkh.jpg',
            },
            {
                year: '2008',
                title: 'SulaFest is Born',
                text: 'The winery launched India\'s first and largest wine and music festival, drawing thousands to the vineyard every February. SulaFest became a cultural institution — a celebration of wine, art, and community under open skies.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png',
            },
            {
                year: '2015',
                title: 'Global Recognition',
                text: 'Sula wines earned their first Decanter medal, placing Indian viticulture firmly on the world stage. The estate expanded its vineyard holdings across three states, cementing its position as India\'s largest wine producer.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/sula_x7fqkh.jpg',
            },
        ],
        estateExperiences: [
            {
                title: 'The Vineyards',
                description: 'Sprawling across 1,600 acres of Nashik\'s volcanic basalt terrain, our vineyards are meticulously tended through sustainable viticulture. Walk between rows of Sauvignon Blanc, Shiraz, and Chenin Blanc as the morning sun bathes the valley in golden light.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/sula_x7fqkh.jpg',
                align: 'right',
            },
            {
                title: 'The Wine Cellar',
                description: 'Descend into our temperature-controlled underground cellar, where French and American oak barrels age our finest reserve wines. The cellar holds over 2,000 barrels at any given time — each one a patient promise of extraordinary wine.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784636572/wineries_siqmmn.webp',
                align: 'left',
            },
            {
                title: 'The Tasting Lounge',
                description: 'Our glass-walled tasting lounge frames panoramic vineyard vistas. Sink into a plush chair, swirl your glass, and let our sommeliers guide you through Sula\'s finest expressions — from zesty whites to velvety reds.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif',
                align: 'right',
            },
            {
                title: 'Little Italy Restaurant',
                description: 'Perched above the vineyards, our signature restaurant pairs artisanal wood-fired cuisine with estate wines. The menu changes with the seasons, celebrating the finest local produce alongside our award-winning bottles.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png',
                align: 'left',
            },
        ],
        signatureWines: [
            {
                id: 'w1',
                name: 'Rasa Shiraz',
                type: 'Red',
                vintage: 2020,
                rating: 94,
                price: 3500,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956328/3445-0_l0nbqq.jpg',
                notes: 'Dark plum, blackberry, smoked meat, vanilla oak. Silky finish with firm, polished tannins.',
                grapes: 'Shiraz',
                region: 'Nashik',
            },
            {
                id: 'w2',
                name: 'The Source Chenin Blanc',
                type: 'White',
                vintage: 2022,
                rating: 92,
                price: 2800,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956470/large_83d24c47-fa24-4880-b9a4-6162f893b49f_qbrdha.jpg',
                notes: 'Honey, peach, toasted almond. Lush mouthfeel with bright acidity and a lingering mineral finish.',
                grapes: 'Chenin Blanc',
                region: 'Nashik',
            },
            {
                id: 'w3',
                name: 'Sauvignon Blanc Reserve',
                type: 'White',
                vintage: 2023,
                rating: 91,
                price: 2200,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956330/pngtree-red-wine-png-image_2399218_fkqedx.jpg',
                notes: 'Grassy, gooseberry, citrus blossom. Crisp and refreshing with a clean, vibrant finish.',
                grapes: 'Sauvignon Blanc',
                region: 'Nashik',
            },
        ],
        packages: [
            {
                id: 'p1',
                name: 'Classic Tasting',
                duration: '45 min',
                price: 699,
                currency: '₹',
                includes: ['4 wine pours', 'Charcuterie platter', 'Vineyard overview', 'Guided by staff'],
                highlight: false,
            },
            {
                id: 'p2',
                name: 'Reserve Experience',
                duration: '90 min',
                price: 1499,
                currency: '₹',
                includes: ['6 premium pours', 'Artisan cheese board', 'Cellar tour', 'Sommelier-led session', 'Tasting notes booklet'],
                highlight: true,
            },
            {
                id: 'p3',
                name: 'Estate Grand Tour',
                duration: '3 hrs',
                price: 3499,
                currency: '₹',
                includes: ['8 wines incl. reserves', 'Vineyard walk', 'Barrel cellar access', '3-course pairing lunch', 'Personal sommelier', 'Take-home bottle'],
                highlight: false,
            },
        ],
        gallery: [
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/sula_x7fqkh.jpg', alt: 'Sula Vineyards aerial view', span: 'wide' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png', alt: 'SulaFest', span: 'normal' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif', alt: 'Amphitheater', span: 'tall' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png', alt: 'Wine & Dine', span: 'normal' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784636572/wineries_siqmmn.webp', alt: 'Winery landscape', span: 'wide' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784485224/86f83964-a90e-43ad-84f7-bad5cb60e12f_jzc8yi.png', alt: 'Wine tasting', span: 'normal' },
        ],
        reviews: [
            {
                id: 'r1',
                author: 'Priya Mehta',
                avatar: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784483745/f58b5c96-5c23-4790-a137-a8976ce38001_dznmwz.png',
                rating: 5,
                date: 'January 2024',
                text: 'An absolutely magical experience. The reserve tasting with the sommelier was worth every rupee. The Rasa Shiraz alone made the trip worthwhile — I still dream about it.',
                visit: 'Reserve Experience',
            },
            {
                id: 'r2',
                author: 'Arjun Kapoor',
                avatar: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784484036/2e1bf6f7-4696-49d5-a3d0-e7873c698e02_rhqwee.png',
                rating: 5,
                date: 'February 2024',
                text: 'SulaFest weekend was beyond words. Great music, world-class wine, and sunsets over the vineyards. Sula has created something truly unique for India.',
                visit: 'Estate Grand Tour',
            },
            {
                id: 'r3',
                author: 'Sonia Rathore',
                avatar: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784483831/1382e241-cbcc-450f-9f45-5be9c2fc4d11_ajfk5v.png',
                rating: 4,
                date: 'March 2024',
                text: 'The cellar tour was incredibly educational and the staff were warm and knowledgeable. The Little Italy restaurant has phenomenal food too. Highly recommended.',
                visit: 'Classic Tasting',
            },
        ],
        relatedWineries: [
            { id: 'york', name: 'York Winery', location: 'Nashik, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639378/york_sns47h.jpg', rating: 4.4 },
            { id: 'grover', name: 'Grover Zampa Vineyards', location: 'Dindori, Nashik', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640413/grover_no7o8s.jpg', rating: 4.4 },
            { id: 'vallonne', name: 'Vallonné Vineyards', location: 'Dindori, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640301/vallone_nft49p.jpg', rating: 4.2 },
        ],
        timings: 'Mon – Sun: 10:30 AM – 6:30 PM',
        phone: '+91 253 230 9000',
        email: 'visit@sulawines.com',
        website: 'www.sulawines.com',
    },
    york: {
        id: 'york',
        name: 'York Winery',
        tagline: 'Crafted with Gangapur Passion',
        established: 2008,
        location: 'Nashik, Maharashtra, India',
        region: 'Gangapur Hills',
        heroImage: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639378/york_sns47h.jpg',
        logo: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639378/york_sns47h.jpg',
        awards: [
            { year: '2023', title: 'Best Boutique Winery', competition: 'India Wine Awards', medal: 'Gold' },
            { year: '2022', title: 'Cabernet Shiraz Gold', competition: 'IWSC London', medal: 'Gold' },
            { year: '2021', title: 'Heritage Estate Award', competition: 'Asia Wine Trophy', medal: 'Platinum' },
        ],
        storyTimeline: [
            {
                year: '2008',
                title: 'Hillside Origins',
                text: 'York was founded on the belief that Nashik\'s Gangapur Hills possessed the perfect microclimate for world-class wine. The founders brought French viticulture expertise to Indian terroir.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639378/york_sns47h.jpg',
            },
        ],
        estateExperiences: [
            {
                title: 'The Vineyards',
                description: 'Perched on Gangapur Hills at 700m elevation, York\'s vineyards enjoy cool breezes and rich basalt soils that define the unique character of every bottle.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639378/york_sns47h.jpg',
                align: 'right',
            },
        ],
        signatureWines: [
            {
                id: 'yw1',
                name: 'York Arros Red',
                type: 'Red',
                vintage: 2020,
                rating: 91,
                price: 2800,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956328/3445-0_l0nbqq.jpg',
                notes: 'Rich blackcurrant, cedar, and spice with velvety tannins.',
                grapes: 'Cabernet Sauvignon, Shiraz',
                region: 'Nashik',
            },
        ],
        packages: [
            {
                id: 'yp1',
                name: 'York Tasting Experience',
                duration: '60 min',
                price: 899,
                currency: '₹',
                includes: ['5 wine pours', 'Cheese board', 'Vineyard walk', 'Guided tasting'],
                highlight: true,
            },
        ],
        gallery: [
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639378/york_sns47h.jpg', alt: 'York Winery', span: 'wide' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif', alt: 'Estate view', span: 'normal' },
        ],
        reviews: [
            {
                id: 'yr1',
                author: 'Aditya Singh',
                avatar: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784483745/f58b5c96-5c23-4790-a137-a8976ce38001_dznmwz.png',
                rating: 5,
                date: 'March 2024',
                text: 'York is a hidden gem in Nashik. The Arros is one of the finest Indian reds I\'ve tasted.',
                visit: 'York Tasting Experience',
            },
        ],
        relatedWineries: [
            { id: 'sula', name: 'Sula Vineyards', location: 'Nashik, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/sula_x7fqkh.jpg', rating: 4.5 },
            { id: 'grover', name: 'Grover Zampa', location: 'Dindori, Nashik', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640413/grover_no7o8s.jpg', rating: 4.4 },
            { id: 'vallonne', name: 'Vallonné Vineyards', location: 'Dindori, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640301/vallone_nft49p.jpg', rating: 4.2 },
        ],
        timings: 'Mon – Sun: 11:00 AM – 6:00 PM',
        phone: '+91 253 232 5555',
        email: 'visit@yorkwinery.com',
        website: 'www.yorkwinery.com',
    },

    soma: {
        id: 'soma',
        name: 'Soma Vine Village',
        tagline: 'Where Volcanic Soil Meets Organic Passion',
        established: 2005,
        location: 'Nandi Hills, Karnataka, India',
        region: 'Nandi Hills',
        heroImage: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639611/soma_2_x6h949.jpg',
        logo: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639611/soma_2_x6h949.jpg',
        awards: [
            { year: '2023', title: 'Best Organic Winery', competition: 'India Wine Awards', medal: 'Gold' },
            { year: '2022', title: 'Sustainable Estate Award', competition: 'Asia Wine Trophy', medal: 'Platinum' },
            { year: '2021', title: 'Syrah Excellence', competition: 'Sommelier India Awards', medal: 'Gold' },
            { year: '2020', title: 'Rising Star Winery', competition: 'Decanter Asia', medal: 'Silver' },
        ],
        storyTimeline: [
            {
                year: '2005',
                title: 'Roots in Volcanic Soil',
                text: 'Soma Vine Village was born from a passionate belief that Karnataka\'s Nandi Hills held untapped potential for world-class organic viticulture. The founders planted their first Cabernet Sauvignon vines in the rich volcanic basalt terrain at 900m elevation.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639611/soma_2_x6h949.jpg',
            },
            {
                year: '2010',
                title: 'Organic Certification',
                text: 'After five years of meticulous farming without synthetic chemicals, Soma became one of India\'s first fully certified organic wineries. A milestone that cemented our philosophy: great wine begins in the soil.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784636572/wineries_siqmmn.webp',
            },
            {
                year: '2017',
                title: 'Award-Winning Recognition',
                text: 'Soma\'s Syrah earned its first international gold medal, placing Nandi Hills firmly on the global wine map. The wine\'s distinctive volcanic minerality and deep fruit character astonished judges worldwide.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif',
            },
        ],
        estateExperiences: [
            {
                title: 'Organic Vineyards',
                description: 'Nestled at 900m above sea level on Nandi Hills, our certified organic vineyards are tended entirely by hand. The volcanic basalt soil, combined with cool night breezes, creates wines of extraordinary mineral complexity and freshness.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639611/soma_2_x6h949.jpg',
                align: 'right',
            },
            {
                title: 'The Barrel Cave',
                description: 'Carved into the hillside rock, our natural cave cellar maintains a constant 16°C year-round — the ideal temperature for barrel aging. Here our finest Syrah and Cabernet Sauvignon mature slowly in French Allier oak.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png',
                align: 'left',
            },
            {
                title: 'Farm-to-Table Restaurant',
                description: 'Our open-air terrace restaurant overlooks the vineyard valley and serves a seasonal menu grown entirely on the estate. Wine pairings are curated by our resident sommelier to create a seamless farm-to-table experience.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png',
                align: 'right',
            },
        ],
        signatureWines: [
            {
                id: 'sw1',
                name: 'Soma Organic Syrah',
                type: 'Red',
                vintage: 2021,
                rating: 90,
                price: 2600,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956328/3445-0_l0nbqq.jpg',
                notes: 'Volcanic minerality, dark cherry, smoked pepper, wild herbs. Elegant tannins with a long mineral finish.',
                grapes: 'Syrah',
                region: 'Nandi Hills',
            },
            {
                id: 'sw2',
                name: 'Nandi White',
                type: 'White',
                vintage: 2022,
                rating: 88,
                price: 1800,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956470/large_83d24c47-fa24-4880-b9a4-6162f893b49f_qbrdha.jpg',
                notes: 'Fresh pear, white peach, floral notes. Light and refreshing with crisp natural acidity.',
                grapes: 'Chenin Blanc, Viognier',
                region: 'Nandi Hills',
            },
        ],
        packages: [
            {
                id: 'sp1',
                name: 'Organic Tasting',
                duration: '60 min',
                price: 799,
                currency: '₹',
                includes: ['4 organic wine pours', 'Farm cheese board', 'Vineyard walk', 'Organic farming talk'],
                highlight: false,
            },
            {
                id: 'sp2',
                name: 'Vine Village Experience',
                duration: '2 hrs',
                price: 1799,
                currency: '₹',
                includes: ['6 wine pours', 'Barrel cave tour', 'Farm-to-table snacks', 'Sommelier session', 'Harvest activity (seasonal)'],
                highlight: true,
            },
            {
                id: 'sp3',
                name: 'Full Estate Day',
                duration: '4 hrs',
                price: 3999,
                currency: '₹',
                includes: ['8 wines incl. reserves', 'Full cave tour', '3-course organic lunch', 'Vineyard trek', 'Winemaker meet', 'Take-home bottle'],
                highlight: false,
            },
        ],
        gallery: [
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639611/soma_2_x6h949.jpg', alt: 'Soma Vineyards', span: 'wide' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png', alt: 'Wine Festival', span: 'normal' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif', alt: 'Estate view', span: 'tall' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png', alt: 'Dining experience', span: 'normal' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784636572/wineries_siqmmn.webp', alt: 'Winery landscape', span: 'wide' },
        ],
        reviews: [
            {
                id: 'sr1',
                author: 'Kavitha Reddy',
                avatar: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784483745/f58b5c96-5c23-4790-a137-a8976ce38001_dznmwz.png',
                rating: 5,
                date: 'February 2024',
                text: 'The organic wines at Soma are unlike anything else in India. The Syrah has a mineral depth that reminds you of great Rhône wines. The cave tasting was magical.',
                visit: 'Vine Village Experience',
            },
            {
                id: 'sr2',
                author: 'Rahul Menon',
                avatar: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784484036/2e1bf6f7-4696-49d5-a3d0-e7873c698e02_rhqwee.png',
                rating: 5,
                date: 'March 2024',
                text: 'A truly immersive experience. The farm-to-table lunch with their organic wines was the highlight of our Karnataka trip. Will be back every year.',
                visit: 'Full Estate Day',
            },
        ],
        relatedWineries: [
            { id: 'sula', name: 'Sula Vineyards', location: 'Nashik, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/sula_x7fqkh.jpg', rating: 4.5 },
            { id: 'grover', name: 'Grover Zampa', location: 'Dindori, Nashik', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640413/grover_no7o8s.jpg', rating: 4.4 },
            { id: 'charosa', name: 'Charosa Vineyards', location: 'Nashik, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640507/charosa_liy3a7.jpg', rating: 4.1 },
        ],
        timings: 'Tue – Sun: 10:00 AM – 5:30 PM',
        phone: '+91 80 2356 7890',
        email: 'visit@somavinevillage.com',
        website: 'www.somavinevillage.com',
    },

    vallonne: {
        id: 'vallonne',
        name: 'Vallonné Vineyards',
        tagline: 'An Italian Soul in Indian Terroir',
        established: 2007,
        location: 'Dindori, Maharashtra, India',
        region: 'Solapur Highlands',
        heroImage: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640301/vallone_nft49p.jpg',
        logo: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640301/vallone_nft49p.jpg',
        awards: [
            { year: '2023', title: 'Best Boutique Estate', competition: 'India Wine Awards', medal: 'Gold' },
            { year: '2022', title: 'Malbec Excellence', competition: 'IWSC London', medal: 'Gold' },
            { year: '2021', title: 'Italian-Indian Fusion Award', competition: 'Asia Wine Trophy', medal: 'Silver' },
            { year: '2020', title: 'Best New Winery', competition: 'Sommelier India', medal: 'Double Gold' },
        ],
        storyTimeline: [
            {
                year: '2007',
                title: 'Italian Roots, Indian Dreams',
                text: 'Vallonné was born from a unique Italian-Indian partnership — blending centuries of European winemaking expertise with the rugged highland terroir of Dindori. The founders planted Sangiovese, Malbec, and Viognier at 750m altitude.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640301/vallone_nft49p.jpg',
            },
            {
                year: '2013',
                title: 'First International Awards',
                text: 'Vallonné\'s Malbec Reserve won gold at the IWSC London — a remarkable achievement for an Indian boutique winery. This recognition validated the estate\'s philosophy of elevation viticulture and European grape varieties.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784636572/wineries_siqmmn.webp',
            },
            {
                year: '2019',
                title: 'The Boutique Expansion',
                text: 'Vallonné expanded its estate with a luxurious tasting villa, barrel library, and curated guest experiences — cementing its reputation as India\'s premier boutique wine destination.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif',
            },
        ],
        estateExperiences: [
            {
                title: 'High-Altitude Vineyards',
                description: 'At 750m above sea level in the Solapur highlands, Vallonné\'s vineyards experience dramatic day-night temperature variations — the hallmark of great wine terroir. Italian varietals like Sangiovese thrive alongside Malbec and Viognier.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640301/vallone_nft49p.jpg',
                align: 'right',
            },
            {
                title: 'The Barrel Library',
                description: 'Our curated barrel library is a temple of patience and craft. Select barrels are individually tagged and tracked through their maturation journey. Guests can adopt a barrel and receive quarterly updates on their wine\'s evolution.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png',
                align: 'left',
            },
            {
                title: 'The Tasting Villa',
                description: 'Inspired by Tuscan farmhouse architecture, our villa offers an intimate setting for premium tastings. Stone floors, terracotta walls, and views across the valley create an atmosphere that transports guests to the Italian countryside.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png',
                align: 'right',
            },
        ],
        signatureWines: [
            {
                id: 'vw1',
                name: 'Malbec Reserve',
                type: 'Red',
                vintage: 2021,
                rating: 92,
                price: 3200,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956328/3445-0_l0nbqq.jpg',
                notes: 'Ripe plum, violet, chocolate, spice. Plush tannins with a velvety, lingering finish of remarkable elegance.',
                grapes: 'Malbec',
                region: 'Solapur Highlands',
            },
            {
                id: 'vw2',
                name: 'Sangiovese Rosé',
                type: 'Rose',
                vintage: 2023,
                rating: 89,
                price: 2100,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956470/large_83d24c47-fa24-4880-b9a4-6162f893b49f_qbrdha.jpg',
                notes: 'Fresh strawberry, rose petal, mandarin zest. Crisp and elegant with a soft dry finish.',
                grapes: 'Sangiovese',
                region: 'Solapur Highlands',
            },
            {
                id: 'vw3',
                name: 'Vallonné Viognier',
                type: 'White',
                vintage: 2022,
                rating: 88,
                price: 2400,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956330/pngtree-red-wine-png-image_2399218_fkqedx.jpg',
                notes: 'Apricot, jasmine, honeysuckle, cream. Full-bodied with a lush, perfumed texture.',
                grapes: 'Viognier',
                region: 'Solapur Highlands',
            },
        ],
        packages: [
            {
                id: 'vp1',
                name: 'Villa Tasting',
                duration: '75 min',
                price: 1299,
                currency: '₹',
                includes: ['5 wine pours', 'Italian antipasto board', 'Vineyard overview', 'Villa access'],
                highlight: false,
            },
            {
                id: 'vp2',
                name: 'Barrel Adoption Experience',
                duration: '2 hrs',
                price: 2499,
                currency: '₹',
                includes: ['7 wines incl. reserves', 'Barrel library tour', 'Adopt-a-barrel ceremony', 'Sommelier guidance', 'Certificate of adoption'],
                highlight: true,
            },
            {
                id: 'vp3',
                name: 'Tuscan Estate Day',
                duration: '5 hrs',
                price: 4999,
                currency: '₹',
                includes: ['Full portfolio tasting', 'Barrel library', 'Italian 4-course lunch', 'Private sommelier', 'Barrel adoption', 'Take-home 2 bottles'],
                highlight: false,
            },
        ],
        gallery: [
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640301/vallone_nft49p.jpg', alt: 'Vallonné Estate', span: 'wide' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png', alt: 'Vineyard celebration', span: 'normal' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784636572/wineries_siqmmn.webp', alt: 'Estate landscape', span: 'tall' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png', alt: 'Tasting villa', span: 'normal' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif', alt: 'Outdoor experience', span: 'wide' },
        ],
        reviews: [
            {
                id: 'vr1',
                author: 'Ananya Sharma',
                avatar: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784483831/1382e241-cbcc-450f-9f45-5be9c2fc4d11_ajfk5v.png',
                rating: 5,
                date: 'January 2024',
                text: 'The Malbec Reserve is extraordinary — better than many Argentinian Malbecs I\'ve tasted. The barrel adoption experience was completely unique. Cannot recommend enough.',
                visit: 'Barrel Adoption Experience',
            },
            {
                id: 'vr2',
                author: 'Vikram Nair',
                avatar: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784484413/img5_fpcepx.png',
                rating: 5,
                date: 'April 2024',
                text: 'The most intimate and luxurious wine experience I\'ve had in India. The Tuscan villa setting, the Italian-inspired food, and exceptional wines made for a perfect day.',
                visit: 'Tuscan Estate Day',
            },
        ],
        relatedWineries: [
            { id: 'york', name: 'York Winery', location: 'Nashik, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639378/york_sns47h.jpg', rating: 4.4 },
            { id: 'soma', name: 'Soma Vine Village', location: 'Nandi Hills, Karnataka', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639611/soma_2_x6h949.jpg', rating: 4.3 },
            { id: 'grover', name: 'Grover Zampa', location: 'Dindori, Nashik', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640413/grover_no7o8s.jpg', rating: 4.4 },
        ],
        timings: 'Wed – Mon: 10:30 AM – 6:00 PM',
        phone: '+91 240 678 9012',
        email: 'reservations@vallonnevineyards.com',
        website: 'www.vallonnevineyards.com',
    },

    chandon: {
        id: 'chandon',
        name: 'Chandon India Winery',
        tagline: "Champagne Expertise, India's Finest Terroir",
        established: 2012,
        location: 'Dindori, Maharashtra, India',
        region: 'Dindori Valley',
        heroImage: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640201/chandon_tdkuru.webp',
        logo: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640201/chandon_tdkuru.webp',
        awards: [
            { year: '2023', title: 'Best Sparkling Wine', competition: 'India Wine Awards', medal: 'Double Gold' },
            { year: '2022', title: 'Brut Excellence', competition: 'Decanter World Wine Awards', medal: 'Gold' },
            { year: '2021', title: 'International Sparkling Award', competition: 'IWSC London', medal: 'Platinum' },
            { year: '2020', title: 'Best Premium Winery', competition: 'Asia Wine Trophy', medal: 'Gold' },
        ],
        storyTimeline: [
            {
                year: '2012',
                title: "Moët Hennessy's Indian Chapter",
                text: 'Chandon India was established as part of the legendary Moët Hennessy family, bringing over a century of Champagne expertise to the volcanic soils of Nashik. The mission: create world-class sparkling wines that express the unique character of Indian terroir.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640201/chandon_tdkuru.webp',
            },
            {
                year: '2015',
                title: 'First Brut Release',
                text: "Chandon India's inaugural sparkling wine — crafted from hand-selected Chenin Blanc — was an instant sensation. Its fine persistent bubbles, crisp acidity, and delicate brioche notes set a new benchmark for Indian sparkling wine.",
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif',
            },
            {
                year: '2020',
                title: 'Global Recognition',
                text: "Chandon India's Brut earned Platinum at the IWSC London — the first Indian sparkling wine to achieve this distinction. A historic moment that validated the estate's world-class ambitions.",
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png',
            },
        ],
        estateExperiences: [
            {
                title: 'Chenin Blanc Vineyards',
                description: "Chandon's estate vineyards focus on Chenin Blanc — the noble grape of the Loire Valley and Nashik's undisputed white wine champion. The vines are trained using the traditional Double Guyot method from Champagne.",
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640201/chandon_tdkuru.webp',
                align: 'right',
            },
            {
                title: 'The Riddling Room',
                description: 'Inspired by traditional Champagne production, our riddling room houses thousands of bottles undergoing the painstaking méthode traditionnelle. Watch as each bottle is hand-turned daily over months to collect its lees.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784636572/wineries_siqmmn.webp',
                align: 'left',
            },
            {
                title: 'The Sparkling Lounge',
                description: 'Sip Chandon sparkling wines in our elegant lounge inspired by Parisian champagne bars. Floor-to-ceiling glass walls frame vineyard panoramas, and our sommelier team guides guests through the art of sparkling wine appreciation.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png',
                align: 'right',
            },
        ],
        signatureWines: [
            {
                id: 'cw1',
                name: 'Chandon Brut',
                type: 'Sparkling',
                vintage: 2022,
                rating: 93,
                price: 1800,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956330/pngtree-red-wine-png-image_2399218_fkqedx.jpg',
                notes: 'Fine persistent bubbles, brioche, green apple, lemon curd. Crisp and refreshing with an elegant dry finish.',
                grapes: 'Chenin Blanc, Chardonnay',
                region: 'Nashik',
            },
            {
                id: 'cw2',
                name: 'Chandon Rosé',
                type: 'Sparkling',
                vintage: 2022,
                rating: 91,
                price: 2100,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956470/large_83d24c47-fa24-4880-b9a4-6162f893b49f_qbrdha.jpg',
                notes: 'Delicate salmon hue, wild strawberry, raspberry, rose water. Elegant and refined with fine mousse.',
                grapes: 'Shiraz, Chenin Blanc',
                region: 'Nashik',
            },
            {
                id: 'cw3',
                name: 'Chandon Delice',
                type: 'Sparkling',
                vintage: 2023,
                rating: 90,
                price: 1600,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956328/3445-0_l0nbqq.jpg',
                notes: 'Off-dry, lychee, peach, honeysuckle. Smooth, round, and joyfully celebratory.',
                grapes: 'Chenin Blanc',
                region: 'Nashik',
            },
        ],
        packages: [
            {
                id: 'cp1',
                name: 'Sparkling Discovery',
                duration: '45 min',
                price: 999,
                currency: '₹',
                includes: ['3 sparkling wine pours', 'Canape platter', 'Méthode Traditionelle overview'],
                highlight: false,
            },
            {
                id: 'cp2',
                name: 'Chandon Prestige',
                duration: '90 min',
                price: 2299,
                currency: '₹',
                includes: ['5 sparkling wines', 'Riddling room tour', 'Gourmet cheese & charcuterie', 'Sommelier guided tasting', 'Flute to take home'],
                highlight: true,
            },
            {
                id: 'cp3',
                name: 'Champagne Masterclass',
                duration: '3 hrs',
                price: 4499,
                currency: '₹',
                includes: ['Full portfolio', 'Production tour', 'Winemaker talk', 'Paired 3-course lunch', 'Blend your own sparkling', '2 bottles take-home'],
                highlight: false,
            },
        ],
        gallery: [
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640201/chandon_tdkuru.webp', alt: 'Chandon Winery', span: 'wide' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png', alt: 'Estate event', span: 'normal' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif', alt: 'Outdoor tasting', span: 'tall' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png', alt: 'Sparkling lounge', span: 'normal' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784636572/wineries_siqmmn.webp', alt: 'Vineyard panorama', span: 'wide' },
        ],
        reviews: [
            {
                id: 'cr1',
                author: 'Siddharth Joshi',
                avatar: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784484413/img5_fpcepx.png',
                rating: 5,
                date: 'December 2023',
                text: 'The Chandon Brut is simply outstanding — on par with some of the European sparklings I\'ve had. The riddling room tour was fascinating. Highly recommended for special occasions.',
                visit: 'Chandon Prestige',
            },
            {
                id: 'cr2',
                author: 'Meera Pillai',
                avatar: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784483831/1382e241-cbcc-450f-9f45-5be9c2fc4d11_ajfk5v.png',
                rating: 5,
                date: 'February 2024',
                text: 'We held our anniversary celebration at Chandon and it was magical. The sparkling lounge, the wines, the service — absolutely world-class. India\'s finest sparkling wine estate without a doubt.',
                visit: 'Champagne Masterclass',
            },
        ],
        relatedWineries: [
            { id: 'sula', name: 'Sula Vineyards', location: 'Nashik, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/sula_x7fqkh.jpg', rating: 4.5 },
            { id: 'york', name: 'York Winery', location: 'Nashik, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639378/york_sns47h.jpg', rating: 4.4 },
            { id: 'grover', name: 'Grover Zampa', location: 'Dindori, Nashik', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640413/grover_no7o8s.jpg', rating: 4.4 },
        ],
        timings: 'Mon – Sun: 11:00 AM – 7:00 PM',
        phone: '+91 253 245 6789',
        email: 'india@chandon.com',
        website: 'www.chandon.com/india',
    },

    grover: {
        id: 'grover',
        name: 'Grover Zampa Vineyards',
        tagline: 'Three Decades of Indian Wine Excellence',
        established: 1988,
        location: 'Dindori, Nashik, India',
        region: 'Nandi Hills & Nashik',
        heroImage: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640413/grover_no7o8s.jpg',
        logo: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640413/grover_no7o8s.jpg',
        awards: [
            { year: '2023', title: 'Pioneer Award — 35 Years', competition: 'India Wine Academy', medal: 'Platinum' },
            { year: '2022', title: 'La Réserve Shiraz Gold', competition: 'Decanter World Wine Awards', medal: 'Gold' },
            { year: '2021', title: 'Best Cabernet Sauvignon', competition: 'Asia Wine Trophy', medal: 'Double Gold' },
            { year: '2020', title: 'Heritage Estate Award', competition: 'IWSC London', medal: 'Gold' },
            { year: '2019', title: 'Icon of Indian Wine', competition: 'Sommelier India Awards', medal: 'Platinum' },
        ],
        storyTimeline: [
            {
                year: '1988',
                title: 'The Pioneer',
                text: "Kanwal Grover planted India's first commercial Cabernet Sauvignon vines on the volcanic slopes of Nandi Hills — a bold gamble that paid off spectacularly. Grover Zampa became the grandfather of India's modern wine industry.",
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640413/grover_no7o8s.jpg',
            },
            {
                year: '1999',
                title: 'French Partnership',
                text: 'A landmark collaboration with legendary French winemaker Georges Vesselle brought Champagne-level expertise to Grover\'s cellars. This partnership elevated Indian winemaking to an entirely new level of quality and sophistication.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784636572/wineries_siqmmn.webp',
            },
            {
                year: '2012',
                title: 'The Zampa Chapter',
                text: 'The merger with Nashik\'s Zampa Vineyards created India\'s second-largest wine company. Two pioneering estates united under one banner — combining decades of expertise across multiple terroirs.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif',
            },
            {
                year: '2020',
                title: '35 Years of Excellence',
                text: 'Grover Zampa celebrated over three decades of Indian winemaking with a landmark Platinum anniversary release — La Réserve 35, a limited-edition Cabernet Sauvignon that became one of India\'s most sought-after collectible wines.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png',
            },
        ],
        estateExperiences: [
            {
                title: 'Heritage Vineyards',
                description: 'The oldest commercial vineyards in India — planted over 35 years ago on the volcanic Nandi Hills. Walking among these old vines is a journey through the entire history of Indian viticulture. The roots run deep — both literally and historically.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640413/grover_no7o8s.jpg',
                align: 'right',
            },
            {
                title: 'The French-Style Cellar',
                description: 'Built in collaboration with French winemakers, our gravity-flow cellar minimises pump handling for the finest wine quality. Rows of French Nevers oak barrels age our flagship La Réserve and Art Collection wines in silence.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png',
                align: 'left',
            },
            {
                title: 'The Art Collection Gallery',
                description: 'Grover Zampa is unique in the wine world for its Art Collection — each vintage labelled by a celebrated Indian artist. Our gallery showcases original artworks alongside the wines they inspired, creating a unique intersection of wine and art.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif',
                align: 'right',
            },
            {
                title: 'Heritage Tasting Room',
                description: 'Our colonial-era tasting room features original stone architecture, antique wine presses, and a 35-year archive of Grover vintages. The space tells the complete story of Indian viticulture through both wine and artefact.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784636572/wineries_siqmmn.webp',
                align: 'left',
            },
        ],
        signatureWines: [
            {
                id: 'gw1',
                name: 'La Réserve',
                type: 'Red',
                vintage: 2020,
                rating: 95,
                price: 4500,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956328/3445-0_l0nbqq.jpg',
                notes: 'Cassis, graphite, cedar, dark chocolate. Structured and aristocratic with extraordinary length and complexity.',
                grapes: 'Cabernet Sauvignon, Shiraz',
                region: 'Nandi Hills',
            },
            {
                id: 'gw2',
                name: 'Art Collection Viognier',
                type: 'White',
                vintage: 2022,
                rating: 91,
                price: 2800,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956470/large_83d24c47-fa24-4880-b9a4-6162f893b49f_qbrdha.jpg',
                notes: 'Apricot blossom, peach, cream, ginger. Opulent and aromatic with a satisfying mineral backbone.',
                grapes: 'Viognier',
                region: 'Nandi Hills',
            },
            {
                id: 'gw3',
                name: 'Vijay Amritraj Selection',
                type: 'Red',
                vintage: 2021,
                rating: 90,
                price: 2200,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956330/pngtree-red-wine-png-image_2399218_fkqedx.jpg',
                notes: 'Blackberry, mint, mocha, soft spice. Approachable and generous with smooth, ripe tannins.',
                grapes: 'Cabernet Sauvignon',
                region: 'Nashik',
            },
        ],
        packages: [
            {
                id: 'gp1',
                name: 'Heritage Tasting',
                duration: '60 min',
                price: 899,
                currency: '₹',
                includes: ['4 wine pours', 'Cheese platter', 'Vineyard history tour', 'Art Collection overview'],
                highlight: false,
            },
            {
                id: 'gp2',
                name: 'La Réserve Experience',
                duration: '2 hrs',
                price: 2599,
                currency: '₹',
                includes: ['7 wines incl. La Réserve', 'French cellar tour', 'Art gallery visit', 'Gourmet paired snacks', 'Sommelier session', 'Tasting notes booklet'],
                highlight: true,
            },
            {
                id: 'gp3',
                name: 'Pioneer Grand Tour',
                duration: '4 hrs',
                price: 5499,
                currency: '₹',
                includes: ['Full portfolio', 'Heritage vineyard walk', 'Cellar & art gallery', '4-course wine lunch', 'Winemaker meet', 'Vintage archive access', '2 bottles take-home'],
                highlight: false,
            },
        ],
        gallery: [
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640413/grover_no7o8s.jpg', alt: 'Grover Zampa Estate', span: 'wide' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png', alt: 'Heritage event', span: 'normal' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784636572/wineries_siqmmn.webp', alt: 'Estate panorama', span: 'tall' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif', alt: 'Art gallery', span: 'normal' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png', alt: 'Tasting room', span: 'wide' },
        ],
        reviews: [
            {
                id: 'gr1',
                author: 'Rohini Verma',
                avatar: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784485224/86f83964-a90e-43ad-84f7-bad5cb60e12f_jzc8yi.png',
                rating: 5,
                date: 'November 2023',
                text: 'La Réserve is in a league of its own — complex, structured, and absolutely world-class. The heritage vineyard tour was a moving journey through Indian wine history. A must-visit.',
                visit: 'La Réserve Experience',
            },
            {
                id: 'gr2',
                author: 'Suresh Krishnan',
                avatar: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784484036/2e1bf6f7-4696-49d5-a3d0-e7873c698e02_rhqwee.png',
                rating: 5,
                date: 'January 2024',
                text: 'If you love Indian wine, Grover Zampa is a pilgrimage. Walking through the 35-year-old vines and tasting the La Réserve vertical was one of the finest wine experiences of my life.',
                visit: 'Pioneer Grand Tour',
            },
            {
                id: 'gr3',
                author: 'Preethi Nair',
                avatar: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784483745/f58b5c96-5c23-4790-a137-a8976ce38001_dznmwz.png',
                rating: 4,
                date: 'March 2024',
                text: 'The Art Collection wines are spectacular and the gallery is a beautiful touch. A truly unique Indian wine estate experience with genuine historical depth.',
                visit: 'Heritage Tasting',
            },
        ],
        relatedWineries: [
            { id: 'sula', name: 'Sula Vineyards', location: 'Nashik, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/sula_x7fqkh.jpg', rating: 4.5 },
            { id: 'chandon', name: 'Chandon India', location: 'Dindori, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640201/chandon_tdkuru.webp', rating: 4.6 },
            { id: 'vallonne', name: 'Vallonné Vineyards', location: 'Dindori, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640301/vallone_nft49p.jpg', rating: 4.2 },
        ],
        timings: 'Mon – Sun: 10:00 AM – 5:30 PM',
        phone: '+91 11 4567 8900',
        email: 'visit@groverzampa.in',
        website: 'www.groverzampa.in',
    },

    charosa: {
        id: 'charosa',
        name: 'Charosa Vineyards',
        tagline: 'Small Estate, Big Wines',
        established: 2010,
        location: 'Charose, Nashik, India',
        region: 'Dindori Highlands',
        heroImage: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640507/charosa_liy3a7.jpg',
        logo: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640507/charosa_liy3a7.jpg',
        awards: [
            { year: '2023', title: 'Best Boutique Estate India', competition: 'Sommelier India Awards', medal: 'Gold' },
            { year: '2022', title: 'Terroir Expression Award', competition: 'India Wine Awards', medal: 'Gold' },
            { year: '2021', title: 'Rising Star Winery', competition: 'Asia Wine Trophy', medal: 'Silver' },
        ],
        storyTimeline: [
            {
                year: '2010',
                title: 'Born from Passion',
                text: "Charosa was founded on a simple but powerful philosophy: let the Dindori highlands speak through every bottle. The estate's small size is its greatest strength — allowing obsessive attention to detail from vine to glass.",
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640507/charosa_liy3a7.jpg',
            },
            {
                year: '2016',
                title: 'The Terroir Wines',
                text: "Charosa launched its signature 'Terroir Series' — wines that express specific vineyard blocks with minimum intervention. The approach resonated with wine lovers seeking authentic, site-specific Indian wines.",
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784636572/wineries_siqmmn.webp',
            },
            {
                year: '2021',
                title: 'Boutique Recognition',
                text: 'Despite its small size, Charosa earned a gold at Sommelier India — beating many larger estates. The win proved that quality of passion and precision, not scale, defines great winemaking.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png',
            },
        ],
        estateExperiences: [
            {
                title: 'The Boutique Vineyard',
                description: "Charosa's intimate 40-acre estate is meticulously hand-farmed, with every vine receiving individual attention. Walk through the rows of Shiraz, Riesling, and Cabernet Sauvignon as the winemaker explains his philosophy of minimum intervention.",
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640507/charosa_liy3a7.jpg',
                align: 'right',
            },
            {
                title: 'Open-Air Tasting Deck',
                description: 'Our signature open-air tasting deck sits elevated above the vineyard, offering 360-degree views of the Dindori Valley. Sip estate wines as the sun sets over the vines — there is no better way to experience Charosa.',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif',
                align: 'left',
            },
            {
                title: 'Vineyard Picnic Experience',
                description: "Charosa's most popular offering — a curated picnic basket with artisan foods and estate wines, set up directly in the vineyard between the vines. An intimate, relaxed, and utterly magical way to enjoy wine in its birthplace.",
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png',
                align: 'right',
            },
        ],
        signatureWines: [
            {
                id: 'chw1',
                name: 'Charosa Shiraz',
                type: 'Red',
                vintage: 2021,
                rating: 88,
                price: 2000,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956328/3445-0_l0nbqq.jpg',
                notes: 'Black pepper, ripe plum, leather, coffee bean. Full-bodied and characterful with a warm, spiced finish.',
                grapes: 'Shiraz',
                region: 'Dindori',
            },
            {
                id: 'chw2',
                name: 'Charosa Riesling',
                type: 'White',
                vintage: 2023,
                rating: 87,
                price: 1900,
                currency: '₹',
                image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784956470/large_83d24c47-fa24-4880-b9a4-6162f893b49f_qbrdha.jpg',
                notes: 'Lime blossom, green apple, petrol note, refreshing acidity. India\'s most distinctive Riesling.',
                grapes: 'Riesling',
                region: 'Dindori',
            },
        ],
        packages: [
            {
                id: 'chp1',
                name: 'Boutique Tasting',
                duration: '60 min',
                price: 699,
                currency: '₹',
                includes: ['4 wine pours', 'Artisan snacks', 'Winemaker intro', 'Vineyard walk'],
                highlight: false,
            },
            {
                id: 'chp2',
                name: 'Vineyard Picnic',
                duration: '2 hrs',
                price: 1799,
                currency: '₹',
                includes: ['5 wine pours', 'Curated picnic basket', 'In-vineyard setting', 'Harvest activity (seasonal)', 'Photography spots'],
                highlight: true,
            },
            {
                id: 'chp3',
                name: 'Winemaker Encounter',
                duration: '3 hrs',
                price: 3499,
                currency: '₹',
                includes: ['Full portfolio tasting', 'Winery behind-the-scenes', 'Private winemaker session', 'Estate lunch', 'Take-home bottle'],
                highlight: false,
            },
        ],
        gallery: [
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640507/charosa_liy3a7.jpg', alt: 'Charosa Vineyards', span: 'wide' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png', alt: 'Vineyard celebration', span: 'normal' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629602/amphitheater_n1oqwo.avif', alt: 'Tasting deck', span: 'tall' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784631705/wine_dine_exnqpf.png', alt: 'Vineyard picnic', span: 'normal' },
            { src: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784636572/wineries_siqmmn.webp', alt: 'Estate view', span: 'wide' },
        ],
        reviews: [
            {
                id: 'chr1',
                author: 'Deepika Rao',
                avatar: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784483831/1382e241-cbcc-450f-9f45-5be9c2fc4d11_ajfk5v.png',
                rating: 5,
                date: 'October 2023',
                text: 'The vineyard picnic was the most romantic wine experience I\'ve ever had. Sitting among the vines with a glass of Charosa Shiraz at sunset — absolutely unforgettable.',
                visit: 'Vineyard Picnic',
            },
            {
                id: 'chr2',
                author: 'Arnav Gupta',
                avatar: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784484036/2e1bf6f7-4696-49d5-a3d0-e7873c698e02_rhqwee.png',
                rating: 5,
                date: 'January 2024',
                text: 'Charosa proves that boutique is better. The winemaker\'s passion shows in every glass. The Riesling is genuinely world-class and utterly unique to India.',
                visit: 'Winemaker Encounter',
            },
        ],
        relatedWineries: [
            { id: 'sula', name: 'Sula Vineyards', location: 'Nashik, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/sula_x7fqkh.jpg', rating: 4.5 },
            { id: 'york', name: 'York Winery', location: 'Nashik, Maharashtra', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639378/york_sns47h.jpg', rating: 4.4 },
            { id: 'soma', name: 'Soma Vine Village', location: 'Nandi Hills, Karnataka', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639611/soma_2_x6h949.jpg', rating: 4.3 },
        ],
        timings: 'Thu – Tue: 10:00 AM – 5:00 PM',
        phone: '+91 253 289 1234',
        email: 'hello@charosavineyards.com',
        website: 'www.charosavineyards.com',
    },
}
