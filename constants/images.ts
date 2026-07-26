/**
 * VinoSphere – Centralized Cloudinary Image URLs
 *
 * HOW TO USE:
 *   import { images } from '@/constants/images'
 *   <Image src={images.hero.background} ... />
 *
 * HOW TO UPDATE:
 *   1. Upload your image to Cloudinary.
 *   2. Copy the secure URL (https://res.cloudinary.com/...).
 *   3. Paste it into the matching key below.
 *   4. Every component that imports this file picks up the change automatically.
 *
 * URL FORMAT:
 *   https://res.cloudinary.com/<cloud-name>/image/upload/<transformations>/<public-id>.<ext>
 *
 * CLOUDINARY CLOUD NAME: xfklkvdc
 */

const CLOUD = 'xfklkvdc'

/** Build a Cloudinary URL with optional transformation string. */
function cloud(publicId: string, transforms = ''): string {
    const t = transforms ? `${transforms}/` : ''
    return `https://res.cloudinary.com/${CLOUD}/image/upload/${t}${publicId}`
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
export const heroImages = {
    /** Full-width background for the hero section */
    background: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784398109/hero_dldojr.webp',
    /** Secondary atmospheric overlay / parallax layer */
    overlay: cloud('hero_overlay'),
}

// ---------------------------------------------------------------------------
// Wine Categories
// ---------------------------------------------------------------------------
export const categoryImages = {
    redWine: cloud('vinosphere/categories/red-wine'),
    whiteWine: cloud('vinosphere/categories/white-wine'),
    roseWine: cloud('vinosphere/categories/rose-wine'),
    sparklingWine: cloud('vinosphere/categories/sparkling-wine'),
    dessertWine: cloud('vinosphere/categories/dessert-wine'),
    naturalWine: cloud('vinosphere/categories/natural-wine'),

    // Featured category cards for the "Explore by Style" section
    card1: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784451472/Untitled_design_9_zaycm1.png',
    card2: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784452012/Firefly_Gemini_Flash_generate_the_same_image_as_this_but_just_with_premium_quality_689030_sfdlf4.png',
    card3: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784452545/york_qkkn2y.png',
}

export const wineries = {
    sula: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/sula_x7fqkh.jpg',
    york: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639378/york_sns47h.jpg',
    soma: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784639611/soma_2_x6h949.jpg',
    chandon: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640201/chandon_tdkuru.webp',
    vallonne: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640301/vallone_nft49p.jpg',
    grover: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640413/grover_no7o8s.jpg',
    charosa: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784640507/charosa_liy3a7.jpg'
}
// ---------------------------------------------------------------------------
// Featured Wine Bottles / Collections
// ---------------------------------------------------------------------------
export const wineImages = {
    /** Individual wine bottles for collection cards */
    bottle1: cloud('vinosphere/wines/bottle-1'),
    bottle2: cloud('vinosphere/wines/bottle-2'),
    bottle3: cloud('vinosphere/wines/bottle-3'),
    bottle4: cloud('vinosphere/wines/bottle-4'),
    bottle5: cloud('vinosphere/wines/bottle-5'),
    bottle6: cloud('vinosphere/wines/bottle-6'),

    /** Collection hero banners */
    collectionPremium: cloud('vinosphere/wines/collection-premium'),
    collectionReserve: cloud('vinosphere/wines/collection-reserve'),
    collectionEstate: cloud('vinosphere/wines/collection-estate'),
    collectionLimited: cloud('vinosphere/wines/collection-limited'),
}

// ---------------------------------------------------------------------------
// Wine Regions
// ---------------------------------------------------------------------------
export const regionImages = {
    bordeaux: cloud('vinosphere/regions/bordeaux'),
    tuscany: cloud('vinosphere/regions/tuscany'),
    napa: cloud('vinosphere/regions/napa-valley'),
    rioja: cloud('vinosphere/regions/rioja'),
    champagne: cloud('vinosphere/regions/champagne'),
    burgundy: cloud('vinosphere/regions/burgundy'),
}

// ---------------------------------------------------------------------------
// Wine Learning / Education
// ---------------------------------------------------------------------------
export const learningImages = {
    wineGuide: cloud('vinosphere/learning/wine-guide'),
    tastingNotes: cloud('vinosphere/learning/tasting-notes'),
    pairingGuide: cloud('vinosphere/learning/pairing-guide'),
    vineyardTour: cloud('vinosphere/learning/vineyard-tour'),
}

// ---------------------------------------------------------------------------
// Events / Tastings
// ---------------------------------------------------------------------------
export const eventImages = {
    event1: cloud('vinosphere/events/event-1'),
    event2: cloud('vinosphere/events/event-2'),
    event3: cloud('vinosphere/events/event-3'),
    masterclass: cloud('vinosphere/events/masterclass'),
    privateTasting: cloud('vinosphere/events/private-tasting'),
}

// ---------------------------------------------------------------------------
// Corporate Services
// ---------------------------------------------------------------------------
export const corporateImages = {
    giftingBanner: cloud('vinosphere/corporate/gifting-banner'),
    corporateEvent: cloud('vinosphere/corporate/corporate-event'),
    bulkOrder: cloud('vinosphere/corporate/bulk-order'),
}

// ---------------------------------------------------------------------------
// Blog Posts
// ---------------------------------------------------------------------------
export const blogImages = {
    post1: cloud('vinosphere/blog/post-1'),
    post2: cloud('vinosphere/blog/post-2'),
    post3: cloud('vinosphere/blog/post-3'),
    post4: cloud('vinosphere/blog/post-4'),
    post5: cloud('vinosphere/blog/post-5'),
    post6: cloud('vinosopher/blog/post-6'),
}

// ---------------------------------------------------------------------------
// Testimonials / Avatars
// ---------------------------------------------------------------------------
export const avatarImages = {
    avatar1: cloud('vinosphere/avatars/avatar-1'),
    avatar2: cloud('vinosphere/avatars/avatar-2'),
    avatar3: cloud('vinosphere/avatars/avatar-3'),
    avatar4: cloud('vinosphere/avatars/avatar-4'),
    avatar5: cloud('vinosphere/avatars/avatar-5'),
}

// ---------------------------------------------------------------------------
// Wine Gallery  (Moments Worth Savoring section)
// ---------------------------------------------------------------------------
export const galleryImages = {
    /** Center arch — tallest, most prominent image */
    center: "https://res.cloudinary.com/xfklkvdc/image/upload/v1784485224/86f83964-a90e-43ad-84f7-bad5cb60e12f_jzc8yi.png",
    /** Far left card */
    left1: "https://res.cloudinary.com/xfklkvdc/image/upload/v1784483745/f58b5c96-5c23-4790-a137-a8976ce38001_dznmwz.png",
    /** Inner left card */
    left2: "https://res.cloudinary.com/xfklkvdc/image/upload/v1784483831/1382e241-cbcc-450f-9f45-5be9c2fc4d11_ajfk5v.png",
    /** Inner right card */
    right1: "https://res.cloudinary.com/xfklkvdc/image/upload/v1784484413/img5_fpcepx.png",
    /** Far right card */
    right2: "https://res.cloudinary.com/xfklkvdc/image/upload/v1784484036/2e1bf6f7-4696-49d5-a3d0-e7873c698e02_rhqwee.png",
}

// ---------------------------------------------------------------------------
// Experience Section
// ---------------------------------------------------------------------------
export const experienceImages = {
    /** Full-bleed background for the "Discover Wine Like Never Before" section */
    background: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784479192/sec_2bg_kf4e8v.png',
}

// ---------------------------------------------------------------------------
// Brand / Misc
// ---------------------------------------------------------------------------
export const brandImages = {
    /** VinoSphere logo (light version for dark background) */
    logoLight: cloud('vinosphere/brand/logo-light'),
    /** VinoSphere logo (dark version for light backgrounds) */
    logoDark: cloud('vinosphere/brand/logo-dark'),
    /** Open Graph / social preview */
    ogImage: cloud('vinosphere/brand/og-image'),
    /** Newsletter or CTA decorative image */
    newsletterBg: cloud('vinosphere/brand/newsletter-bg'),
}

// ---------------------------------------------------------------------------
// Master re-export  (import { images } from '@/constants/images')
// ---------------------------------------------------------------------------
export const images = {
    hero: heroImages,
    categories: categoryImages,
    wineries:wineries,
    wines: wineImages,
    regions: regionImages,
    learning: learningImages,
    events: eventImages,
    corporate: corporateImages,
    blogs: blogImages,
    avatars: avatarImages,
    brand: brandImages,
    experience: experienceImages,
    gallery: galleryImages,
} as const

export type Images = typeof images