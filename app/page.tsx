import { Hero } from '@/components/home/Hero'
import { FeaturedCategories } from '@/components/home/FeaturedCategories'
import { SectionDivider } from '@/components/shared/SectionDivider'

export default function Home() {
    return (
        <>
            {/* ── Dark hero ── */}
            <Hero />

            {/* ── Wave transition: dark → cream ── */}
            <SectionDivider
                fromFill="fill-vino-dark"
                toBg="bg-vino-cream"
            />

            {/* ── Light categories section ── */}
            <FeaturedCategories />
        </>
    )
}
