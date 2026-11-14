import { Hero } from '@/components/home/Hero'
import { FeaturedCategories } from '@/components/home/FeaturedCategories'
import { VinoExperience } from '@/components/home/VinoExperience'
import { WineGallery } from '@/components/home/WineGallery'
import { UpcomingEvents } from '@/components/home/UpcomingEvents'
import { NewsletterFooter } from '@/components/home/NewsletterFooter'
import { SectionDivider } from '@/components/shared/SectionDivider'

export default function Home() {
    return (
        <>
            {/* 1 ── Dark hero */}
            <Hero />

            {/* dark → cream */}
            <SectionDivider fromFill="fill-vino-dark" toBg="bg-vino-cream" height={45} />

            {/* 2 ── Light featured categories */}
            <FeaturedCategories />

            {/* 3 ── Editorial experience */}
            <VinoExperience />

            {/* 4 ── Cream wine gallery */}
            <WineGallery />

            {/* gallery-cream → events (transparent/dark bg) */}
            <SectionDivider fromFill="fill-[#F8F5EF]" toBg="bg-transparent" height={45} />

            {/* 5 ── Upcoming Events */}
            <UpcomingEvents />

            {/* events dark → footer cream/white */}
            <SectionDivider fillColor="#0d0407" toBg="bg-white" height={45} />


            {/* 6 ── Newsletter + Footer */}
            <NewsletterFooter />
        </>
    )
}
