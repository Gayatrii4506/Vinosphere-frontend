import { Hero } from '@/components/home/Hero'
import { FeaturedCategories } from '@/components/home/FeaturedCategories'
import { VinoExperience } from '@/components/home/VinoExperience'
import { WineGallery } from '@/components/home/WineGallery'
import { NewsletterFooter } from '@/components/home/NewsletterFooter'
import { SectionDivider } from '@/components/shared/SectionDivider'

export default function Home() {
    return (
        <>
            {/* 1 ── Dark hero */}
            <Hero />

            {/* dark → cream  (dips left, rides right) */}
            <SectionDivider fromFill="fill-vino-dark" toBg="bg-vino-cream" height={90} />

            {/* 2 ── Light featured categories */}
            <FeaturedCategories />

            {/* cream → dark  (rides left, dips right) */}
            <SectionDivider fromFill="fill-vino-cream" toBg="bg-vino-dark" flip height={90} />

            {/* 3 ── Dark editorial experience */}
            <VinoExperience />

            {/* dark → gallery-cream  (dips left, rides right) */}
            <SectionDivider fromFill="fill-vino-dark" toBg="bg-[#F8F5EF]" height={90} />

            {/* 4 ── Cream wine gallery */}
            <WineGallery />

            {/* 5 ── Newsletter + Footer */}
            <NewsletterFooter />
        </>
    )
}
