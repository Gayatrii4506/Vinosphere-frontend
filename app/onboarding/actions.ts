'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: FormData) {
    const supabase = await createClient()
    
    // Check if user is logged in
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'You must be logged in to complete onboarding.' }
    }

    const fullName = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const country = formData.get('country') as string
    
    const experienceLevel = formData.get('experience') as string
    const favoriteTypes = formData.getAll('wine_types') as string[]
    const primaryInterest = formData.get('interest') as string

    // 1. Update user metadata in Supabase (we can keep this for fast access to onboarding status)
    const { error: metadataError } = await supabase.auth.updateUser({
        data: {
            onboarding_complete: true,
            full_name: fullName
        }
    })

    if (metadataError) {
        return { error: metadataError.message }
    }

    // 2. Insert into the new users table in the public schema
    const { error: dbError } = await supabase
        .from('users')
        .insert({
            auth_id: user.id,
            email: user.email,
            full_name: fullName,
            phone: phone || null,
            city: city || null,
            state: state || null,
            country: country,
            experience_level: experienceLevel,
            favorite_wine_types: favoriteTypes,
            primary_interest: primaryInterest,
            role: 'user'
        })

    if (dbError) {
        console.error("Database Insert Error:", dbError)
        return { error: 'Failed to save profile data to database. ' + dbError.message }
    }

    // Redirect to home or dashboard after successful onboarding
    redirect('/')
}
