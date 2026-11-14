'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface QuickProfileUpdatePayload {
    fullName: string
    phone?: string
    city?: string
    state?: string
    country: string
    favoriteType?: string
    sweetness?: string
    bodyStyle?: string
    flavour?: string
    budgetMax?: number
}

export async function updateUserProfileQuick(payload: QuickProfileUpdatePayload) {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'You must be logged in to update your profile.' }
    }

    try {
        const metadata = user.user_metadata || {}
        const existingPrefs = metadata.preferences || {}

        const updatedPrefs = {
            ...existingPrefs,
            favorite_types: payload.favoriteType ? [payload.favoriteType] : existingPrefs.favorite_types,
            sweetness: payload.sweetness || existingPrefs.sweetness,
            body_style: payload.bodyStyle || existingPrefs.body_style,
            taste_appealing: payload.flavour || existingPrefs.taste_appealing,
            budget_max: payload.budgetMax || existingPrefs.budget_max
        }

        // 1. Update Supabase Auth metadata
        const { error: metadataError } = await supabase.auth.updateUser({
            data: {
                full_name: payload.fullName,
                preferences: updatedPrefs
            }
        })

        if (metadataError) {
            return { error: metadataError.message }
        }

        // 2. Update Database users table
        const { error: dbError } = await supabase
            .from('users')
            .upsert({
                auth_id: user.id,
                email: user.email,
                full_name: payload.fullName,
                phone: payload.phone || null,
                city: payload.city || null,
                state: payload.state || null,
                country: payload.country || 'India',
                favorite_wine_types: payload.favoriteType ? [payload.favoriteType] : undefined,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'auth_id'
            })

        if (dbError) {
            console.warn('DB upsert non-critical notice:', dbError.message)
        }

        revalidatePath('/profile')
        return { success: true }
    } catch (err: any) {
        return { error: err?.message || 'Failed to update profile.' }
    }
}
