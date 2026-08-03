'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: FormData) {
    const supabase = await createClient()
    
    const preferences = {
        experience_level: formData.get('experience'),
        favorite_types: formData.getAll('wine_types'), // returns array of checked checkboxes
        primary_interest: formData.get('interest')
    }

    // Update user metadata in Supabase
    const { error } = await supabase.auth.updateUser({
        data: {
            onboarding_complete: true,
            preferences: preferences
        }
    })

    if (error) {
        return { error: error.message }
    }

    // Redirect to home or dashboard after successful onboarding
    redirect('/')
}
