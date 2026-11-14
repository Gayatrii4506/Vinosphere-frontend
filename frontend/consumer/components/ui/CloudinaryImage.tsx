import React from 'react'
import Image, { ImageProps } from 'next/image'
import { blurPlaceholderUrl } from '@/lib/cloudinary'

/**
 * CloudinaryImage
 *
 * A thin wrapper around Next.js <Image> that:
 *  - Enforces the Cloudinary src shape
 *  - Adds a Cloudinary-generated blur placeholder automatically
 *  - Provides sensible defaults (sizes, quality)
 *  - Accepts all standard Next Image props as overrides
 *
 * Usage:
 *   import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
 *   import { images } from '@/constants/images'
 *
 *   <CloudinaryImage
 *     src={images.hero.background}
 *     alt="Hero background"
 *     fill
 *     objectFit="cover"
 *   />
 */

interface CloudinaryImageProps extends Omit<ImageProps, 'src'> {
    /** Full Cloudinary delivery URL — always from constants/images.ts */
    src: string
    alt: string
    /**
     * Supply a separate public ID (without transforms) for the blur preview.
     * If omitted the component strips known Cloudinary transforms from `src`
     * and builds the blur URL automatically.
     */
    blurPublicId?: string
}

export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
    src,
    alt,
    blurPublicId,
    placeholder = 'blur',
    quality = 90,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    ...rest
}) => {
    /**
     * Derive the blur data URL.
     * If a blurPublicId is given we use that directly; otherwise we call
     * blurPlaceholderUrl with the same src string (Cloudinary ignores any
     * existing transforms and overlays the blur ones).
     */
    const isCloudinary = src && src.includes('res.cloudinary.com');
    const blurDataURL = isCloudinary
        ? (blurPublicId ? blurPlaceholderUrl(blurPublicId) : blurPlaceholderUrl(src))
        : undefined;
    const resolvedPlaceholder = isCloudinary ? placeholder : undefined;

    return (
        <Image
            src={src}
            alt={alt}
            placeholder={resolvedPlaceholder}
            blurDataURL={blurDataURL}
            quality={quality}
            sizes={sizes}
            unoptimized={!isCloudinary ? true : rest.unoptimized}
            {...rest}
        />
    )
}
