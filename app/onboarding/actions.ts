'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function parseBudgetNumbers(rawBudget: string): { min: number | null; max: number | null } {
    if (!rawBudget || rawBudget === 'no_preference' || rawBudget === 'not_sure') {
        return { min: null, max: null }
    }
    const b = rawBudget.toLowerCase()
    if (b.includes('under_500')) return { min: 0, max: 500 }
    if (b.includes('500_1000')) return { min: 500, max: 1000 }
    if (b.includes('1000_2000')) return { min: 1000, max: 2000 }
    if (b.includes('above_2000')) return { min: 2000, max: null }
    if (b.includes('under_1000')) return { min: 0, max: 1000 }
    if (b.includes('1000_1800')) return { min: 1000, max: 1800 }
    if (b.includes('above_1800')) return { min: 1800, max: null }
    if (b.includes('2000_3500')) return { min: 2000, max: 3500 }
    if (b.includes('above_3500')) return { min: 3500, max: null }
    return { min: null, max: null }
}

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
    
    const experienceLevel = (formData.get('experience') as string) || 'beginner'
    const tasteAppealing = (formData.get('taste_appealing') as string) || null
    const sweetness = (formData.get('sweetness') as string) || null
    const bodyStyle = (formData.get('body_style') as string) || null
    const acidity = (formData.get('acidity') as string) || null
    const tannin = (formData.get('tannin') as string) || null
    const region = (formData.get('region') as string) || null
    const grapes = (formData.getAll('grapes') as string[]).filter(g => g && g !== 'no_preference' && g !== 'not_sure')
    const flavors = (formData.getAll('flavors') as string[]).filter(f => f && f !== 'no_preference' && f !== 'not_sure')
    const favoriteTypes = (formData.getAll('wine_types') as string[]).filter(t => t && t !== 'anything' && t !== 'no_preference')
    const occasion = (formData.get('occasion') as string) || null
    const budget = (formData.get('budget') as string) || null
    const primaryInterest = (formData.get('interest') as string) || 'tastings'
    const isEditMode = formData.get('is_edit_mode') === 'true'

    const { min: budgetMin, max: budgetMax } = parseBudgetNumbers(budget || '')

    const preferencesData = {
        experience_level: experienceLevel.toUpperCase(),
        taste_appealing: tasteAppealing,
        sweetness: sweetness,
        body_style: bodyStyle,
        acidity: acidity,
        tannin: tannin,
        region: region,
        grapes: grapes,
        flavors: flavors,
        favorite_types: favoriteTypes,
        occasion: occasion,
        budget: budget,
        budget_min: budgetMin,
        budget_max: budgetMax,
        primary_interest: primaryInterest
    }

    // 1. Update user metadata in Supabase
    const { error: metadataError } = await supabase.auth.updateUser({
        data: {
            onboarding_complete: true,
            full_name: fullName,
            preferences: preferencesData
        }
    })

    if (metadataError) {
        return { error: metadataError.message }
    }

    // 2. Upsert into the users table in public schema
    const { error: dbError } = await supabase
        .from('users')
        .upsert({
            auth_id: user.id,
            email: user.email,
            full_name: fullName,
            phone: phone || null,
            city: city || null,
            state: state || null,
            country: country,
            experience_level: experienceLevel.toUpperCase(),
            favorite_wine_types: favoriteTypes,
            primary_interest: primaryInterest,
            role: 'user'
        }, { onConflict: 'auth_id' })

    if (dbError) {
        console.error("Database Upsert Error:", dbError)
        // Fallback check by email if auth_id didn't match
        const { error: fallbackError } = await supabase
            .from('users')
            .upsert({
                auth_id: user.id,
                email: user.email,
                full_name: fullName,
                phone: phone || null,
                city: city || null,
                state: state || null,
                country: country,
                experience_level: experienceLevel.toUpperCase(),
                favorite_wine_types: favoriteTypes,
                primary_interest: primaryInterest,
                role: 'user'
            }, { onConflict: 'email' })

        if (fallbackError) {
            console.error("Database Fallback Error:", fallbackError)
        }
    }

    if (isEditMode) {
        redirect('/profile')
    }

    const beginnerPath = (formData.get('beginner_path') as string) || 'discover'

    if (experienceLevel.toLowerCase() === 'beginner') {
        if (beginnerPath === 'popular') {
            redirect('/discover/wines?mode=popular')
        } else if (beginnerPath === 'explore') {
            redirect('/discover/wines?mode=all')
        }
    }

    // Redirect to discover wines with personalized recommendations
    redirect('/discover/wines?mode=for-you')
}

