'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Wine, Compass, Check, ArrowRight, ArrowLeft, X, Heart, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { API_V1_URL } from '@/lib/api-config'

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERIENCED'

export interface UserPreferencesData {
    experience_level?: ExperienceLevel | string
    taste_appealing?: string
    favorite_types?: string[]
    sweetness?: string
    body_style?: string
    acidity?: string
    tannin?: string
    grapes?: string[]
    flavors?: string[]
    occasion?: string
    budget?: string
    budget_min?: number | null
    budget_max?: number | null
}

interface WinePreferencesWizardProps {
    isOpen: boolean
    onClose: () => void
    initialPreferences?: UserPreferencesData
    onSaved?: (updatedPrefs: UserPreferencesData) => void
}

export const WinePreferencesWizard: React.FC<WinePreferencesWizardProps> = ({
    isOpen,
    onClose,
    initialPreferences = {},
    onSaved,
}) => {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isSaving, setIsSaving] = useState(false)
    const [isComplete, setIsComplete] = useState(false)

    // Form state
    const [level, setLevel] = useState<ExperienceLevel>(
        (initialPreferences.experience_level as ExperienceLevel) || 'BEGINNER'
    )
    const [tasteAppealing, setTasteAppealing] = useState<string>(
        initialPreferences.taste_appealing || ''
    )
    const [wineTypes, setWineTypes] = useState<string[]>(
        initialPreferences.favorite_types || []
    )
    const [sweetness, setSweetness] = useState<string>(
        initialPreferences.sweetness || ''
    )
    const [bodyStyle, setBodyStyle] = useState<string>(
        initialPreferences.body_style || ''
    )
    const [acidity, setAcidity] = useState<string>(
        initialPreferences.acidity || ''
    )
    const [tannin, setTannin] = useState<string>(
        initialPreferences.tannin || ''
    )
    const [grapes, setGrapes] = useState<string[]>(
        initialPreferences.grapes || []
    )
    const [flavors, setFlavors] = useState<string[]>(
        initialPreferences.flavors || []
    )
    const [occasion, setOccasion] = useState<string>(
        initialPreferences.occasion || ''
    )
    const [budget, setBudget] = useState<string>(
        initialPreferences.budget || ''
    )

    useEffect(() => {
        if (isOpen) {
            setStep(1)
            setIsComplete(false)
            if (initialPreferences.experience_level) {
                const lvl = String(initialPreferences.experience_level).toUpperCase()
                if (lvl.includes('EXP') || lvl.includes('CONNOISSEUR')) setLevel('EXPERIENCED')
                else if (lvl.includes('INTER')) setLevel('INTERMEDIATE')
                else setLevel('BEGINNER')
            }
            if (initialPreferences.taste_appealing) setTasteAppealing(initialPreferences.taste_appealing)
            if (initialPreferences.favorite_types) setWineTypes(initialPreferences.favorite_types)
            if (initialPreferences.sweetness) setSweetness(initialPreferences.sweetness)
            if (initialPreferences.body_style) setBodyStyle(initialPreferences.body_style)
            if (initialPreferences.acidity) setAcidity(initialPreferences.acidity)
            if (initialPreferences.tannin) setTannin(initialPreferences.tannin)
            if (initialPreferences.grapes) setGrapes(initialPreferences.grapes)
            if (initialPreferences.flavors) setFlavors(initialPreferences.flavors)
            if (initialPreferences.occasion) setOccasion(initialPreferences.occasion)
            if (initialPreferences.budget) setBudget(initialPreferences.budget)
        }
    }, [isOpen, initialPreferences])

    if (!isOpen) return null

    // Determine total steps based on flow
    const totalSteps = level === 'BEGINNER' ? 5 : level === 'INTERMEDIATE' ? 6 : 7

    const handleToggleType = (type: string) => {
        if (type === 'Anything') {
            setWineTypes(['Anything'])
            return
        }
        setWineTypes(prev => {
            const filtered = prev.filter(t => t !== 'Anything')
            if (filtered.includes(type)) return filtered.filter(t => t !== type)
            return [...filtered, type]
        })
    }

    const handleToggleFlavor = (flavor: string) => {
        setFlavors(prev => {
            if (prev.includes(flavor)) return prev.filter(f => f !== flavor)
            return [...prev, flavor]
        })
    }

    const handleToggleGrape = (grape: string) => {
        if (grape === 'no_preference') {
            setGrapes(['no_preference'])
            return
        }
        setGrapes(prev => {
            const filtered = prev.filter(g => g !== 'no_preference')
            if (filtered.includes(grape)) return filtered.filter(g => g !== grape)
            return [...filtered, grape]
        })
    }

    const parseBudgetMinMax = (b: string): { min: number | null; max: number | null } => {
        if (b.includes('500') && !b.includes('1000') && !b.includes('1500')) return { min: 0, max: 500 }
        if (b.includes('500') && (b.includes('1000') || b.includes('1500'))) return { min: 500, max: 1500 }
        if (b.includes('1000') && b.includes('2000')) return { min: 1000, max: 2000 }
        if (b.includes('1500') && b.includes('3000')) return { min: 1500, max: 3000 }
        if (b.includes('2000') || b.includes('3000') || b.includes('5000')) return { min: 2000, max: 5000 }
        return { min: null, max: null }
    }

    const handleSavePreferences = async () => {
        setIsSaving(true)
        const budgetRange = parseBudgetMinMax(budget)

        const finalPrefs: UserPreferencesData = {
            experience_level: level,
            taste_appealing: tasteAppealing,
            favorite_types: wineTypes,
            sweetness,
            body_style: bodyStyle,
            acidity,
            tannin,
            grapes,
            flavors,
            occasion,
            budget,
            budget_min: budgetRange.min,
            budget_max: budgetRange.max,
        }

        try {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
                // Update Supabase auth user metadata
                await supabase.auth.updateUser({
                    data: { preferences: finalPrefs }
                })

                // Sync with backend API
                await fetch(`${API_V1_URL}/users/me/preferences`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({
                        experienceLevel: level,
                        preferredWineTypes: wineTypes.map(t => t.toUpperCase()),
                        preferredSweetness: sweetness || 'ALL',
                        preferredBody: bodyStyle || 'ALL',
                        preferredAcidity: acidity || 'ALL',
                        preferredTannin: tannin || 'ALL',
                        preferredGrapes: grapes,
                        preferredFlavors: flavors,
                        preferredOccasions: occasion ? [occasion] : [],
                        budgetMin: budgetRange.min,
                        budgetMax: budgetRange.max,
                    })
                }).catch(e => console.warn('Could not sync preferences with API endpoint:', e))
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('vinosphere_experience_level', level)
                localStorage.setItem('vinosphere_user_preferences', JSON.stringify(finalPrefs))
                window.dispatchEvent(new CustomEvent('vinosphere_preferences_updated', { detail: finalPrefs }))
            }

            if (onSaved) onSaved(finalPrefs)
            setIsComplete(true)
        } catch (err) {
            console.error('Failed to save preferences:', err)
            setIsComplete(true)
        } finally {
            setIsSaving(false)
        }
    }

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(s => s + 1)
        } else {
            handleSavePreferences()
        }
    }

    const handleBack = () => {
        if (step > 1) {
            setStep(s => s - 1)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-xl bg-[#1C060E] border border-stone-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
                {/* Subtle Ambient Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-vino-accent/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header with Close */}
                <div className="relative z-10 px-6 py-4 border-b border-stone-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-vino-gold font-semibold tracking-wider uppercase">
                        <Sparkles size={14} className="text-vino-gold" />
                        <span>Wine Style Finder</span>
                    </div>

                    {!isComplete && (
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-stone-400 font-medium">
                                Step {step} of {totalSteps}
                            </span>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Progress Dots */}
                {!isComplete && (
                    <div className="px-6 pt-3 flex gap-1.5 justify-center">
                        {Array.from({ length: totalSteps }).map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 rounded-full transition-all duration-300 ${
                                    idx + 1 === step
                                        ? 'w-6 bg-vino-gold'
                                        : idx + 1 < step
                                        ? 'w-2 bg-vino-accent'
                                        : 'w-2 bg-stone-800'
                                }`}
                            />
                        ))}
                    </div>
                )}

                {/* Content Container */}
                <div className="relative z-10 p-6 sm:p-8 flex-1">
                    {/* Completion Screen */}
                    {isComplete ? (
                        <div className="py-6 text-center space-y-6 animate-fadeIn">
                            <div className="w-14 h-14 mx-auto rounded-full bg-vino-accent/20 border border-vino-accent/50 flex items-center justify-center text-vino-gold shadow-[0_0_20px_rgba(139,30,63,0.3)]">
                                <Check size={28} />
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-serif text-2xl font-bold text-white">
                                    Your wine style is ready.
                                </h3>
                                <p className="text-xs sm:text-sm text-stone-300 max-w-sm mx-auto leading-relaxed">
                                    We’ve tuned the Wine Catalog to match your taste profile, flavor notes, and budget.
                                </p>
                            </div>

                            {/* Summary Badge Row */}
                            <div className="p-4 rounded-xl bg-stone-900/70 border border-stone-800 text-left space-y-2 text-xs">
                                <div className="flex justify-between border-b border-stone-800 pb-1.5">
                                    <span className="text-stone-400">Experience</span>
                                    <span className="text-white font-medium capitalize">{level.toLowerCase()}</span>
                                </div>
                                <div className="flex justify-between border-b border-stone-800 pb-1.5">
                                    <span className="text-stone-400">Wine Types</span>
                                    <span className="text-white font-medium">{wineTypes.length > 0 ? wineTypes.join(' · ') : 'All Varietals'}</span>
                                </div>
                                {tasteAppealing && (
                                    <div className="flex justify-between border-b border-stone-800 pb-1.5">
                                        <span className="text-stone-400">Taste Preference</span>
                                        <span className="text-white font-medium capitalize">{tasteAppealing}</span>
                                    </div>
                                )}
                                {budget && (
                                    <div className="flex justify-between">
                                        <span className="text-stone-400">Budget</span>
                                        <span className="text-white font-medium">{budget}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose()
                                        router.push('/discover/wines?sort=recommended')
                                    }}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-vino-accent hover:bg-vino-accent-light text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                                >
                                    <Sparkles size={14} className="text-amber-300" />
                                    Explore My Wines
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl transition-all"
                                >
                                    Return to Profile
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* STEP 1: Experience Level */}
                            {step === 1 && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="space-y-1">
                                        <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                                            How familiar are you with wine?
                                        </h2>
                                        <p className="text-xs text-stone-400">
                                            A few quick questions will help us personalize your wine discovery. You can change your preferences anytime.
                                        </p>
                                    </div>

                                    <div className="space-y-2.5 pt-2">
                                        {[
                                            {
                                                id: 'BEGINNER' as ExperienceLevel,
                                                icon: '🌱',
                                                title: "I'm new to wine",
                                                desc: 'Simple, approachable questions without technical jargon.'
                                            },
                                            {
                                                id: 'INTERMEDIATE' as ExperienceLevel,
                                                icon: '🍷',
                                                title: "I've tried a few",
                                                desc: 'Explore balanced styles, flavor notes, and food pairings.'
                                            },
                                            {
                                                id: 'EXPERIENCED' as ExperienceLevel,
                                                icon: '🍇',
                                                title: 'I know what I like',
                                                desc: 'Specify grapes, body, tannin, acidity, and cellar reserves.'
                                            }
                                        ].map(opt => {
                                            const isSelected = level === opt.id
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => setLevel(opt.id)}
                                                    className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between border ${
                                                        isSelected
                                                            ? 'bg-vino-accent/20 border-vino-accent text-white ring-1 ring-vino-accent shadow-md'
                                                            : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-800/40'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">{opt.icon}</span>
                                                        <div>
                                                            <p className="text-sm font-semibold text-white">{opt.title}</p>
                                                            <p className="text-xs text-stone-400 mt-0.5">{opt.desc}</p>
                                                        </div>
                                                    </div>
                                                    {isSelected && <Check size={18} className="text-vino-gold shrink-0" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* BEGINNER FLOW */}
                            {level === 'BEGINNER' && (
                                <>
                                    {/* Step 2: Palate / Taste */}
                                    {step === 2 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="space-y-1">
                                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                                                    What sounds good to you?
                                                </h2>
                                                <p className="text-xs text-stone-400">
                                                    Select the taste profile that feels most inviting.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                                                {[
                                                    { id: 'fruity', icon: '🍓', label: 'Fruity & Juicy' },
                                                    { id: 'light', icon: '🌿', label: 'Light & refreshing' },
                                                    { id: 'rich', icon: '🍫', label: 'Rich & smooth' },
                                                    { id: 'sweet', icon: '🍯', label: 'Sweet & Luscious' },
                                                    { id: 'not_sure', icon: '🤍', label: 'Not sure yet' },
                                                ].map(opt => {
                                                    const isSelected = tasteAppealing === opt.id
                                                    return (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => setTasteAppealing(opt.id)}
                                                            className={`p-3.5 rounded-xl text-left transition-all flex items-center justify-between border ${
                                                                isSelected
                                                                    ? 'bg-vino-accent/20 border-vino-accent text-white ring-1 ring-vino-accent shadow-sm'
                                                                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <span>{opt.icon}</span>
                                                                <span className="text-xs font-semibold">{opt.label}</span>
                                                            </div>
                                                            {isSelected && <Check size={14} className="text-vino-gold" />}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Wine Types */}
                                    {step === 3 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="space-y-1">
                                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                                                    What would you like to explore?
                                                </h2>
                                                <p className="text-xs text-stone-400">
                                                    Select one or more categories, or choose Anything.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                                                {['Red', 'White', 'Rosé', 'Sparkling', 'Anything'].map(type => {
                                                    const isSelected = wineTypes.includes(type)
                                                    return (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => handleToggleType(type)}
                                                            className={`p-3.5 rounded-xl text-center transition-all border ${
                                                                isSelected
                                                                    ? 'bg-vino-accent/20 border-vino-accent text-white ring-1 ring-vino-accent font-semibold shadow-sm'
                                                                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                            }`}
                                                        >
                                                            <span className="text-xs">{type}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Occasion */}
                                    {step === 4 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="space-y-1">
                                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                                                    When would you enjoy wine?
                                                </h2>
                                                <p className="text-xs text-stone-400">
                                                    Help us tailor pairings for your favorite moments.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                                                {[
                                                    { id: 'dinner', label: 'Dinner & Food Pairing' },
                                                    { id: 'celebration', label: 'Celebration & Parties' },
                                                    { id: 'evening', label: 'Evening Relaxation' },
                                                    { id: 'exploring', label: 'Casual Tasting & Exploration' },
                                                ].map(opt => {
                                                    const isSelected = occasion === opt.id
                                                    return (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => setOccasion(opt.id)}
                                                            className={`p-3.5 rounded-xl text-left transition-all flex items-center justify-between border ${
                                                                isSelected
                                                                    ? 'bg-vino-accent/20 border-vino-accent text-white ring-1 ring-vino-accent shadow-sm'
                                                                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                            }`}
                                                        >
                                                            <span className="text-xs font-semibold">{opt.label}</span>
                                                            {isSelected && <Check size={14} className="text-vino-gold" />}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 5: Budget */}
                                    {step === 5 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="space-y-1">
                                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                                                    What&apos;s your usual budget?
                                                </h2>
                                                <p className="text-xs text-stone-400">
                                                    We will prioritize bottles in your comfortable price range.
                                                </p>
                                            </div>

                                            <div className="space-y-2.5 pt-2">
                                                {[
                                                    { id: 'under_500', label: 'Under ₹500' },
                                                    { id: '500_1000', label: '₹500 – ₹1,000' },
                                                    { id: '1000_2000', label: '₹1,000 – ₹2,000' },
                                                    { id: 'above_2000', label: '₹2,000+' },
                                                    { id: 'no_preference', label: 'No preference' },
                                                ].map(opt => {
                                                    const isSelected = budget === opt.id
                                                    return (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => setBudget(opt.id)}
                                                            className={`w-full p-3.5 rounded-xl text-left transition-all flex items-center justify-between border ${
                                                                isSelected
                                                                    ? 'bg-vino-accent/20 border-vino-accent text-white ring-1 ring-vino-accent shadow-sm'
                                                                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                            }`}
                                                        >
                                                            <span className="text-xs font-semibold">{opt.label}</span>
                                                            {isSelected && <Check size={14} className="text-vino-gold" />}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* INTERMEDIATE FLOW */}
                            {level === 'INTERMEDIATE' && (
                                <>
                                    {/* Step 2: Types */}
                                    {step === 2 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="space-y-1">
                                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                                                    Preferred Wine Types
                                                </h2>
                                                <p className="text-xs text-stone-400">Select categories you enjoy.</p>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                                                {['Red', 'White', 'Rosé', 'Sparkling', 'Anything'].map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => handleToggleType(type)}
                                                        className={`p-3.5 rounded-xl text-center border text-xs ${
                                                            wineTypes.includes(type)
                                                                ? 'bg-vino-accent/20 border-vino-accent text-white ring-1 ring-vino-accent font-semibold'
                                                                : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                        }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Sweetness & Body */}
                                    {step === 3 && (
                                        <div className="space-y-5 animate-fadeIn">
                                            <div>
                                                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Sweetness Level</h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { id: 'DRY', label: 'Crisp Dry' },
                                                        { id: 'SEMI_DRY', label: 'Off-Dry / Semi' },
                                                        { id: 'SWEET', label: 'Luscious Sweet' },
                                                        { id: 'no_preference', label: 'No Preference' },
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => setSweetness(opt.id)}
                                                            className={`p-2.5 rounded-lg border text-xs text-left ${
                                                                sweetness === opt.id
                                                                    ? 'bg-vino-accent/20 border-vino-accent text-white font-semibold'
                                                                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                            }`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Body & Texture</h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { id: 'LIGHT', label: 'Light & Refreshing' },
                                                        { id: 'MEDIUM', label: 'Medium & Balanced' },
                                                        { id: 'FULL', label: 'Full & Robust' },
                                                        { id: 'no_preference', label: 'No Preference' },
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => setBodyStyle(opt.id)}
                                                            className={`p-2.5 rounded-lg border text-xs text-left ${
                                                                bodyStyle === opt.id
                                                                    ? 'bg-vino-accent/20 border-vino-accent text-white font-semibold'
                                                                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                            }`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Flavor Notes */}
                                    {step === 4 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="space-y-1">
                                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">Flavor Profile</h2>
                                                <p className="text-xs text-stone-400">Select flavor notes that catch your interest.</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2.5 pt-2">
                                                {['Berry & Fruit', 'Oak & Vanilla', 'Citrus & Tropical', 'Floral & Herbal', 'Earthy & Mineral'].map(f => (
                                                    <button
                                                        key={f}
                                                        type="button"
                                                        onClick={() => handleToggleFlavor(f)}
                                                        className={`p-3 rounded-xl border text-xs text-left ${
                                                            flavors.includes(f)
                                                                ? 'bg-vino-accent/20 border-vino-accent text-white font-semibold'
                                                                : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                        }`}
                                                    >
                                                        {f}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 5: Occasions */}
                                    {step === 5 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="space-y-1">
                                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">Primary Occasions</h2>
                                                <p className="text-xs text-stone-400">When do you open a bottle?</p>
                                            </div>
                                            <div className="space-y-2 pt-2">
                                                {['Dinner Pairing', 'Celebrations', 'Casual Evening', 'Gifting'].map(o => (
                                                    <button
                                                        key={o}
                                                        type="button"
                                                        onClick={() => setOccasion(o)}
                                                        className={`w-full p-3 rounded-xl border text-xs text-left ${
                                                            occasion === o
                                                                ? 'bg-vino-accent/20 border-vino-accent text-white font-semibold'
                                                                : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                        }`}
                                                    >
                                                        {o}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 6: Budget */}
                                    {step === 6 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="space-y-1">
                                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">Budget Range</h2>
                                                <p className="text-xs text-stone-400">Preferred bottle price.</p>
                                            </div>
                                            <div className="space-y-2 pt-2">
                                                {['Under ₹1,000', '₹1,000 – ₹2,000', '₹2,000 – ₹3,500', '₹3,500+', 'No preference'].map(b => (
                                                    <button
                                                        key={b}
                                                        type="button"
                                                        onClick={() => setBudget(b)}
                                                        className={`w-full p-3.5 rounded-xl border text-xs text-left ${
                                                            budget === b
                                                                ? 'bg-vino-accent/20 border-vino-accent text-white font-semibold'
                                                                : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                        }`}
                                                    >
                                                        {b}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* EXPERIENCED FLOW */}
                            {level === 'EXPERIENCED' && (
                                <>
                                    {/* Step 2: Types & Varietals */}
                                    {step === 2 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="space-y-1">
                                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">Varietals & Grapes</h2>
                                                <p className="text-xs text-stone-400">Select grapes you prefer to explore.</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 pt-2">
                                                {[
                                                    'Cabernet Sauvignon', 'Shiraz / Syrah', 'Chenin Blanc',
                                                    'Chardonnay', 'Sauvignon Blanc', 'Sangiovese Blend',
                                                    'Pinot Noir', 'no_preference'
                                                ].map(g => (
                                                    <button
                                                        key={g}
                                                        type="button"
                                                        onClick={() => handleToggleGrape(g)}
                                                        className={`p-2.5 rounded-lg border text-xs text-left ${
                                                            grapes.includes(g)
                                                                ? 'bg-vino-accent/20 border-vino-accent text-white font-semibold'
                                                                : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                        }`}
                                                    >
                                                        {g === 'no_preference' ? 'No Preference' : g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Body & Structure */}
                                    {step === 3 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="space-y-1">
                                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">Body & Depth</h2>
                                                <p className="text-xs text-stone-400">Preferred palate weight.</p>
                                            </div>
                                            <div className="space-y-2 pt-2">
                                                {[
                                                    { id: 'LIGHT', label: 'Light-Bodied Precision' },
                                                    { id: 'MEDIUM', label: 'Medium-Bodied Harmony' },
                                                    { id: 'FULL', label: 'Full-Bodied Concentration & Depth' },
                                                    { id: 'no_preference', label: 'No Preference' },
                                                ].map(opt => (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() => setBodyStyle(opt.id)}
                                                        className={`w-full p-3 rounded-xl border text-xs text-left ${
                                                            bodyStyle === opt.id
                                                                ? 'bg-vino-accent/20 border-vino-accent text-white font-semibold'
                                                                : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                        }`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Tannin & Acidity */}
                                    {step === 4 && (
                                        <div className="space-y-5 animate-fadeIn">
                                            <div>
                                                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Tannin Structure</h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['LOW', 'MEDIUM', 'HIGH', 'no_preference'].map(t => (
                                                        <button
                                                            key={t}
                                                            type="button"
                                                            onClick={() => setTannin(t)}
                                                            className={`p-2.5 rounded-lg border text-xs text-left ${
                                                                tannin === t
                                                                    ? 'bg-vino-accent/20 border-vino-accent text-white font-semibold'
                                                                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                            }`}
                                                        >
                                                            {t === 'no_preference' ? 'Any Tannin' : `${t} Tannin`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Acidity Level</h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {['LOW', 'MEDIUM', 'HIGH', 'no_preference'].map(a => (
                                                        <button
                                                            key={a}
                                                            type="button"
                                                            onClick={() => setAcidity(a)}
                                                            className={`p-2.5 rounded-lg border text-xs text-left ${
                                                                acidity === a
                                                                    ? 'bg-vino-accent/20 border-vino-accent text-white font-semibold'
                                                                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                            }`}
                                                        >
                                                            {a === 'no_preference' ? 'Any Acidity' : `${a} Acidity`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 5: Sweetness & Flavor */}
                                    {step === 5 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="space-y-1">
                                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">Sweetness & Flavors</h2>
                                                <p className="text-xs text-stone-400">Specify tasting note notes.</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 pt-2">
                                                {['Dark Berry', 'Oak & Smoke', 'Vanilla & Spice', 'Citrus & Tropical', 'Earthy & Terroir', 'Bone Dry', 'Off-Dry'].map(f => (
                                                    <button
                                                        key={f}
                                                        type="button"
                                                        onClick={() => handleToggleFlavor(f)}
                                                        className={`p-2.5 rounded-lg border text-xs text-left ${
                                                            flavors.includes(f)
                                                                ? 'bg-vino-accent/20 border-vino-accent text-white font-semibold'
                                                                : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                        }`}
                                                    >
                                                        {f}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 6: Terroir / Region */}
                                    {step === 6 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="space-y-1">
                                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">Terroir Expression</h2>
                                                <p className="text-xs text-stone-400">Indian wine regions of interest.</p>
                                            </div>
                                            <div className="space-y-2 pt-2">
                                                {['Nashik Valley (Maharashtra)', 'Nandi Hills (Karnataka)', 'Akluj & Baramati (Solapur)', 'No Terroir Preference'].map(r => (
                                                    <button
                                                        key={r}
                                                        type="button"
                                                        onClick={() => setOccasion(r)}
                                                        className={`w-full p-3 rounded-xl border text-xs text-left ${
                                                            occasion === r
                                                                ? 'bg-vino-accent/20 border-vino-accent text-white font-semibold'
                                                                : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                        }`}
                                                    >
                                                        {r}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 7: Budget */}
                                    {step === 7 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="space-y-1">
                                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">Reserve Budget</h2>
                                                <p className="text-xs text-stone-400">Target price bracket for estate selections.</p>
                                            </div>
                                            <div className="space-y-2 pt-2">
                                                {['Under ₹1,500', '₹1,500 – ₹3,000', '₹3,000 – ₹5,000', '₹5,000+ Reserve', 'No preference'].map(b => (
                                                    <button
                                                        key={b}
                                                        type="button"
                                                        onClick={() => setBudget(b)}
                                                        className={`w-full p-3.5 rounded-xl border text-xs text-left ${
                                                            budget === b
                                                                ? 'bg-vino-accent/20 border-vino-accent text-white font-semibold'
                                                                : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                        }`}
                                                    >
                                                        {b}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                {!isComplete && (
                    <div className="px-6 py-4 border-t border-stone-800/80 flex items-center justify-between bg-stone-950/40">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-3.5 py-2 text-stone-400 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                            >
                                <ArrowLeft size={14} />
                                Back
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-2 text-stone-500 hover:text-stone-300 text-xs font-medium transition-colors"
                            >
                                Skip for now
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={isSaving}
                            className="px-5 py-2.5 bg-vino-accent hover:bg-vino-accent-light text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Saving...
                                </>
                            ) : step === totalSteps ? (
                                <>
                                    Save Preferences
                                    <Check size={14} className="text-amber-300" />
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
