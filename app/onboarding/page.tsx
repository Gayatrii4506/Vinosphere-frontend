import React from 'react'
import { OnboardingForm } from '@/components/auth/OnboardingForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface OnboardingPageProps {
    searchParams?: Promise<{ mode?: string }>
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
    const resolvedParams = searchParams ? await searchParams : {}
    const isEditMode = resolvedParams.mode === 'edit'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let initialData: Record<string, any> = {}

    if (user) {
        const metadata = user.user_metadata || {}
        const prefs = metadata.preferences || {}

        // Fetch user from DB if exists
        const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .or(`auth_id.eq.${user.id},email.eq.${user.email}`)
            .maybeSingle()

        // If user is already logged in and completed onboarding, and not edit mode -> redirect
        if (!isEditMode) {
            if (metadata.onboarding_complete || (dbUser && (dbUser.experience_level || dbUser.full_name))) {
                redirect('/discover/wines?mode=for-you')
            }
        }

        initialData = {
            fullName: dbUser?.full_name || metadata.full_name || '',
            phone: dbUser?.phone || metadata.phone || '',
            city: dbUser?.city || metadata.city || '',
            state: dbUser?.state || metadata.state || '',
            country: dbUser?.country || metadata.country || 'India',
            experience: (dbUser?.experience_level || prefs.experience_level || 'beginner').toLowerCase(),
            favoriteTypes: dbUser?.favorite_wine_types || prefs.favorite_types || [],
            tasteAppealing: dbUser?.taste_appealing || prefs.taste_appealing || '',
            sweetness: dbUser?.preferred_sweetness || prefs.sweetness || '',
            bodyStyle: dbUser?.preferred_body || prefs.body_style || '',
            acidity: dbUser?.preferred_acidity || prefs.acidity || '',
            tannin: dbUser?.preferred_tannin || prefs.tannin || '',
            region: dbUser?.preferred_region || prefs.region || '',
            grapes: dbUser?.preferred_grapes || prefs.grapes || [],
            flavors: dbUser?.preferred_flavors || prefs.flavors || [],
            occasion: dbUser?.preferred_occasions?.[0] || prefs.occasion || '',
            budget: prefs.budget || ''
        }
    }

    return (
        <div className="min-h-screen bg-vino-dark flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-vino-accent/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-vino-gold/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-4xl z-10">
                <OnboardingForm initialData={initialData} isEditMode={isEditMode} />
            </div>
        </div>
    )
}
