'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Wine, Compass, SlidersHorizontal, RotateCcw, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
    fetchUserInteractionSummary,
    resetUserInteractions,
    getLocalInteractionSummary,
    UserInteractionSummary
} from '@/lib/interactions/trackInteraction'
import { WinePreferencesWizard, UserPreferencesData } from './WinePreferencesWizard'

export type ExperienceLevelValue = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERIENCED'

interface TasteProfileEditorProps {
    initialExperience?: string
    initialFavoriteTypes?: string[]
    initialInterest?: string
    onUpdated?: (newLevel: ExperienceLevelValue) => void
}

export const TasteProfileEditor: React.FC<TasteProfileEditorProps> = ({
    initialExperience = 'BEGINNER',
    initialFavoriteTypes = [],
    initialInterest = 'tastings',
    onUpdated
}) => {
    const [isWizardOpen, setIsWizardOpen] = useState(false)
    const [preferences, setPreferences] = useState<UserPreferencesData>({
        experience_level: initialExperience,
        favorite_types: initialFavoriteTypes,
    })
    const [interactionSummary, setInteractionSummary] = useState<UserInteractionSummary>(getLocalInteractionSummary())
    const [isResettingInteractions, setIsResettingInteractions] = useState(false)
    const [statusMessage, setStatusMessage] = useState<string | null>(null)

    // Load active preferences from Supabase session or localStorage
    useEffect(() => {
        async function loadPreferences() {
            try {
                const supabase = createClient()
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user?.user_metadata?.preferences) {
                    setPreferences(session.user.user_metadata.preferences)
                } else if (typeof window !== 'undefined') {
                    const local = localStorage.getItem('vinosphere_user_preferences')
                    if (local) {
                        try {
                            setPreferences(JSON.parse(local))
                        } catch (e) {
                            // Fallback
                        }
                    }
                }
            } catch (err) {
                console.warn('Could not load profile preferences:', err)
            }
        }
        loadPreferences()

        fetchUserInteractionSummary().then(setInteractionSummary)

        const handleInteractionUpdated = (e: Event) => {
            const customEvent = e as CustomEvent<UserInteractionSummary>
            if (customEvent.detail) {
                setInteractionSummary(customEvent.detail)
            }
        }

        const handlePreferencesUpdated = (e: Event) => {
            const customEvent = e as CustomEvent<UserPreferencesData>
            if (customEvent.detail) {
                setPreferences(customEvent.detail)
                if (customEvent.detail.experience_level && onUpdated) {
                    onUpdated(customEvent.detail.experience_level as ExperienceLevelValue)
                }
            }
        }

        window.addEventListener('vinosphere_interaction_updated', handleInteractionUpdated)
        window.addEventListener('vinosphere_preferences_updated', handlePreferencesUpdated)
        return () => {
            window.removeEventListener('vinosphere_interaction_updated', handleInteractionUpdated)
            window.removeEventListener('vinosphere_preferences_updated', handlePreferencesUpdated)
        }
    }, [onUpdated])

    const handleResetInteractions = async () => {
        setIsResettingInteractions(true)
        try {
            await resetUserInteractions()
            setInteractionSummary(getLocalInteractionSummary())
            setStatusMessage('Interaction history cleared')
            setTimeout(() => setStatusMessage(null), 3000)
        } catch (err) {
            console.warn('Failed to reset interactions:', err)
        } finally {
            setIsResettingInteractions(false)
        }
    }

    // Format experience label
    const formatExperience = (exp?: string) => {
        const lower = (exp || 'BEGINNER').toLowerCase()
        if (lower.includes('expert') || lower.includes('experienced')) return 'Experienced Connoisseur'
        if (lower.includes('intermediate')) return 'Intermediate Explorer'
        return 'Beginner'
    }

    // Format wine types
    const formatWineTypes = (types?: string[]) => {
        if (!types || types.length === 0 || types.includes('Anything')) return 'All Varietals'
        return types.join(' · ')
    }

    // Format taste/palate
    const formatTaste = () => {
        const parts: string[] = []
        if (preferences.taste_appealing && preferences.taste_appealing !== 'not_sure') {
            parts.push(preferences.taste_appealing.replace('_', ' '))
        }
        if (preferences.sweetness && preferences.sweetness !== 'no_preference' && preferences.sweetness !== 'ALL') {
            parts.push(preferences.sweetness.toLowerCase())
        }
        if (preferences.body_style && preferences.body_style !== 'no_preference' && preferences.body_style !== 'ALL') {
            parts.push(`${preferences.body_style.toLowerCase()} body`)
        }
        if (preferences.flavors && preferences.flavors.length > 0) {
            parts.push(preferences.flavors.slice(0, 2).join(' · '))
        }
        return parts.length > 0 ? parts.join(' · ') : 'Open & exploring'
    }

    // Format budget
    const formatBudget = () => {
        if (preferences.budget) return preferences.budget
        if (preferences.budget_min !== null && preferences.budget_max !== null && preferences.budget_min !== undefined && preferences.budget_max !== undefined) {
            return `₹${preferences.budget_min.toLocaleString()} – ₹${preferences.budget_max.toLocaleString()}`
        }
        if (preferences.budget_max) return `Under ₹${preferences.budget_max.toLocaleString()}`
        return 'No preference'
    }

    return (
        <div className="space-y-4">
            {/* Compact Your Wine Style Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-vino-accent/20 border border-vino-accent/40 flex items-center justify-center text-vino-gold shrink-0 shadow-sm">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <h2 className="text-base font-serif text-white font-bold tracking-tight">
                            Your Wine Style
                        </h2>
                        <p className="text-[11px] text-vino-gray/60">
                            Personalized recommendations based on your palate
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsWizardOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-800/90 hover:bg-vino-accent text-stone-200 hover:text-white border border-stone-700/80 hover:border-vino-accent transition-all text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                    <SlidersHorizontal size={13} className="text-vino-gold" />
                    <span>Edit Preferences</span>
                </button>
            </div>

            {/* Concise Preference Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {/* Experience */}
                <div className="p-3 rounded-xl bg-stone-950/40 border border-stone-800/50 flex flex-col justify-between">
                    <span className="text-[10px] text-vino-gray/50 uppercase tracking-widest font-semibold mb-1">
                        Experience
                    </span>
                    <span className="text-xs text-white font-medium capitalize">
                        {formatExperience(preferences.experience_level)}
                    </span>
                </div>

                {/* Wine Types */}
                <div className="p-3 rounded-xl bg-stone-950/40 border border-stone-800/50 flex flex-col justify-between">
                    <span className="text-[10px] text-vino-gray/50 uppercase tracking-widest font-semibold mb-1">
                        Wine Types
                    </span>
                    <span className="text-xs text-amber-100 font-medium truncate" title={formatWineTypes(preferences.favorite_types)}>
                        {formatWineTypes(preferences.favorite_types)}
                    </span>
                </div>

                {/* Taste Profile */}
                <div className="p-3 rounded-xl bg-stone-950/40 border border-stone-800/50 flex flex-col justify-between">
                    <span className="text-[10px] text-vino-gray/50 uppercase tracking-widest font-semibold mb-1">
                        Taste & Palate
                    </span>
                    <span className="text-xs text-stone-300 font-medium capitalize truncate" title={formatTaste()}>
                        {formatTaste()}
                    </span>
                </div>

                {/* Budget */}
                <div className="p-3 rounded-xl bg-stone-950/40 border border-stone-800/50 flex flex-col justify-between">
                    <span className="text-[10px] text-vino-gray/50 uppercase tracking-widest font-semibold mb-1">
                        Target Budget
                    </span>
                    <span className="text-xs text-white font-medium">
                        {formatBudget()}
                    </span>
                </div>
            </div>

            {/* Subtle Behavioral Feedback Row */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400">
                <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>
                        Active taste tuning ({interactionSummary.totalInteractions} interactions recorded)
                    </span>
                </span>

                <div className="flex items-center gap-2">
                    {statusMessage && (
                        <span className="text-emerald-400 font-medium text-[11px]">{statusMessage}</span>
                    )}
                    {interactionSummary.totalInteractions > 0 && (
                        <button
                            type="button"
                            onClick={handleResetInteractions}
                            disabled={isResettingInteractions}
                            title="Reset learned interaction preferences"
                            className="p-1 text-stone-500 hover:text-stone-300 rounded transition-colors"
                        >
                            <RotateCcw size={12} className={isResettingInteractions ? 'animate-spin' : ''} />
                        </button>
                    )}
                </div>
            </div>

            {/* Dedicated Preference Questionnaire Flow (Modal Wizard) */}
            <WinePreferencesWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                initialPreferences={preferences}
                onSaved={(updated) => {
                    setPreferences(updated)
                    if (updated.experience_level && onUpdated) {
                        onUpdated(updated.experience_level as ExperienceLevelValue)
                    }
                }}
            />
        </div>
    )
}
