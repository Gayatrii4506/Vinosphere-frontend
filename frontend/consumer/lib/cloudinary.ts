/**
 * Cloudinary utility helpers for VinoSphere
 *
 * These are lightweight client-safe helpers; they only build URL strings —
 * no server SDK is required.
 */

/** Your Cloudinary cloud name — keep in sync with constants/images.ts */
export const CLOUDINARY_CLOUD_NAME = 'xfklkvdc'

/** Base delivery URL */
const BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CloudinaryTransforms {
    /** Width in pixels */
    width?: number
    /** Height in pixels */
    height?: number
    /** Crop mode: fill | fit | pad | scale | thumb | crop | auto */
    crop?: 'fill' | 'fit' | 'pad' | 'scale' | 'thumb' | 'crop' | 'auto'
    /** Image quality 1-100 or "auto" */
    quality?: number | 'auto'
    /** Output format: webp | avif | jpg | png | auto */
    format?: 'webp' | 'avif' | 'jpg' | 'png' | 'auto'
    /** Gravity / focal point for cropping */
    gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west'
    /** Border-radius for rounded images (px) */
    radius?: number | 'max'
    /** Blur strength 1-2000 */
    blur?: number
    /** Brightness -99 to 100 */
    brightness?: number
    /** Opacity 0-100 */
    opacity?: number
}

// ---------------------------------------------------------------------------
// Core builder
// ---------------------------------------------------------------------------

/**
 * Build a Cloudinary delivery URL from a public ID and optional transforms.
 *
 * @example
 * buildCloudinaryUrl('vinosphere/hero/hero-background', { width: 1920, quality: 'auto', format: 'webp' })
 * // → https://res.cloudinary.com/vinosphere/image/upload/w_1920,q_auto,f_webp/vinosphere/hero/hero-background
 */
export function buildCloudinaryUrl(
    publicId: string,
    transforms: CloudinaryTransforms = {}
): string {
    const parts: string[] = []

    if (transforms.width) parts.push(`w_${transforms.width}`)
    if (transforms.height) parts.push(`h_${transforms.height}`)
    if (transforms.crop) parts.push(`c_${transforms.crop}`)
    if (transforms.quality !== undefined) parts.push(`q_${transforms.quality}`)
    if (transforms.format) parts.push(`f_${transforms.format}`)
    if (transforms.gravity) parts.push(`g_${transforms.gravity}`)
    if (transforms.radius !== undefined) parts.push(`r_${transforms.radius}`)
    if (transforms.blur !== undefined) parts.push(`e_blur:${transforms.blur}`)
    if (transforms.brightness !== undefined) parts.push(`e_brightness:${transforms.brightness}`)
    if (transforms.opacity !== undefined) parts.push(`o_${transforms.opacity}`)

    const transformString = parts.length > 0 ? `${parts.join(',')}/` : ''
    return `${BASE_URL}/${transformString}${publicId}`
}

// ---------------------------------------------------------------------------
// Preset helpers  (DX shortcuts for common sizes)
// ---------------------------------------------------------------------------

/** Hero full-bleed background: 1920 × 1080 WebP, auto quality, fill crop */
export function heroUrl(publicId: string): string {
    return buildCloudinaryUrl(publicId, {
        width: 1920,
        height: 1080,
        crop: 'fill',
        quality: 'auto',
        format: 'webp',
        gravity: 'auto',
    })
}

/** Wine card thumbnail: 600 × 750 WebP, fill crop */
export function wineCardUrl(publicId: string): string {
    return buildCloudinaryUrl(publicId, {
        width: 600,
        height: 750,
        crop: 'fill',
        quality: 'auto',
        format: 'webp',
        gravity: 'auto',
    })
}

/** Blog cover: 800 × 500 WebP */
export function blogCoverUrl(publicId: string): string {
    return buildCloudinaryUrl(publicId, {
        width: 800,
        height: 500,
        crop: 'fill',
        quality: 'auto',
        format: 'webp',
        gravity: 'auto',
    })
}

/** Region landscape: 1200 × 800 WebP */
export function regionUrl(publicId: string): string {
    return buildCloudinaryUrl(publicId, {
        width: 1200,
        height: 800,
        crop: 'fill',
        quality: 'auto',
        format: 'webp',
        gravity: 'auto',
    })
}

/** Round avatar: 200 × 200 WebP, circle crop */
export function avatarUrl(publicId: string): string {
    return buildCloudinaryUrl(publicId, {
        width: 200,
        height: 200,
        crop: 'fill',
        gravity: 'face',
        radius: 'max',
        quality: 'auto',
        format: 'webp',
    })
}

/** Category card: 600 × 600 WebP */
export function categoryUrl(publicId: string): string {
    return buildCloudinaryUrl(publicId, {
        width: 600,
        height: 600,
        crop: 'fill',
        quality: 'auto',
        format: 'webp',
        gravity: 'auto',
    })
}

/** Event card: 800 × 600 WebP */
export function eventCardUrl(publicId: string): string {
    return buildCloudinaryUrl(publicId, {
        width: 800,
        height: 600,
        crop: 'fill',
        quality: 'auto',
        format: 'webp',
        gravity: 'auto',
    })
}

// ---------------------------------------------------------------------------
// Blur placeholder (tiny 32×32 base64 preview)
// ---------------------------------------------------------------------------

/**
 * Returns a tiny 32px Cloudinary URL suitable for Next Image's blurDataURL prop.
 * Use this with placeholder="blur" to get a smooth loading experience.
 */
export function blurPlaceholderUrl(publicId: string): string {
    if (publicId && publicId.startsWith('http')) {
        if (!publicId.includes('res.cloudinary.com')) {
            // Not a Cloudinary URL, return original to avoid breaks
            return publicId;
        }
        // Extract public ID from full Cloudinary URL
        // e.g. https://res.cloudinary.com/xfklkvdc/image/upload/v1784639253/sula_x7fqkh.jpg
        const match = publicId.match(/\/image\/upload\/(?:v\d+\/)?(.+)$/);
        if (match) {
            // Strip extension
            publicId = match[1].replace(/\.[^/.]+$/, "");
        }
    }
    return buildCloudinaryUrl(publicId, {
        width: 32,
        height: 32,
        crop: 'fill',
        quality: 1,
        format: 'webp',
        blur: 1000,
    })
}
