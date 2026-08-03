'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wine, Sparkles, Grape, Compass, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { completeOnboarding } from '@/app/onboarding/actions'

const questions = [
    {
        id: 'experience',
        title: 'What is your wine experience level?',
        subtitle: 'This helps us tailor our recommendations.',
        options: [
            { id: 'beginner', label: 'Novice', desc: 'Just starting my journey', icon: Sparkles },
            { id: 'intermediate', label: 'Enthusiast', desc: 'I know my favorites', icon: Wine },
            { id: 'expert', label: 'Connoisseur', desc: 'Experienced collector', icon: Grape }
        ]
    },
    {
        id: 'wine_types',
        title: 'Which wines do you typically enjoy?',
        subtitle: 'Select all that apply.',
        options: [
            { id: 'red', label: 'Bold Reds' },
            { id: 'white', label: 'Crisp Whites' },
            { id: 'rose', label: 'Rosé' },
            { id: 'sparkling', label: 'Sparkling & Champagne' },
            { id: 'dessert', label: 'Sweet & Dessert' }
        ],
        multi: true
    },
    {
        id: 'interest',
        title: 'What brings you to VinoSphere?',
        subtitle: 'Choose your primary interest.',
        options: [
            { id: 'collecting', label: 'Cellar Building & Collecting', icon: Wine },
            { id: 'tastings', label: 'Exclusive Events & Tastings', icon: Compass },
            { id: 'pairing', label: 'Food & Wine Pairing', icon: Sparkles }
        ]
    }
]

export const OnboardingForm = () => {
    const [step, setStep] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // State for answers
    const [experience, setExperience] = useState('')
    const [wineTypes, setWineTypes] = useState<string[]>([])
    const [interest, setInterest] = useState('')

    const handleNext = () => {
        if (step < questions.length - 1) {
            setStep(prev => prev + 1)
        }
    }

    const toggleMultiSelect = (id: string) => {
        setWineTypes(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const isCurrentStepValid = () => {
        if (step === 0) return experience !== ''
        if (step === 1) return wineTypes.length > 0
        if (step === 2) return interest !== ''
        return false
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (step < questions.length - 1) {
            handleNext()
            return
        }

        setIsLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append('experience', experience)
        wineTypes.forEach(type => formData.append('wine_types', type))
        formData.append('interest', interest)

        const res = await completeOnboarding(formData)
        if (res?.error) {
            setError(res.error)
            setIsLoading(false)
        }
    }

    const currentQ = questions[step]

    return (
        <div className="w-full max-w-xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-12">
                <div className="flex justify-between mb-3">
                    {questions.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1.5 rounded-full flex-1 mx-1 transition-colors duration-500 ${
                                i <= step ? 'bg-vino-accent' : 'bg-stone-800'
                            }`}
                        />
                    ))}
                </div>
                <p className="text-center text-xs text-vino-gray/50 uppercase tracking-widest">
                    Step {step + 1} of {questions.length}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-red-200">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        <div className="text-center">
                            <h2 className="text-2xl sm:text-3xl font-serif text-white mb-2">
                                {currentQ.title}
                            </h2>
                            <p className="text-vino-gray/70">
                                {currentQ.subtitle}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {currentQ.options.map((opt) => {
                                const Icon = (opt as any).icon
                                let isSelected = false
                                if (step === 0) isSelected = experience === opt.id
                                if (step === 1) isSelected = wineTypes.includes(opt.id)
                                if (step === 2) isSelected = interest === opt.id

                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => {
                                            if (currentQ.multi) toggleMultiSelect(opt.id)
                                            else {
                                                if (step === 0) setExperience(opt.id)
                                                if (step === 2) setInterest(opt.id)
                                            }
                                        }}
                                        className={`w-full p-4 sm:p-5 rounded-xl border text-left transition-all duration-300 flex items-center gap-4 ${
                                            isSelected 
                                            ? 'bg-vino-accent/10 border-vino-accent shadow-[0_0_15px_rgba(139,30,63,0.15)]' 
                                            : 'bg-stone-900/40 border-stone-800 hover:border-stone-600 hover:bg-stone-900/80'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                            isSelected ? 'border-vino-accent' : 'border-stone-600'
                                        }`}>
                                            {isSelected && (
                                                <div className={`w-2.5 h-2.5 rounded-full ${currentQ.multi ? 'bg-vino-accent rounded-sm' : 'bg-vino-accent'}`} />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <p className={`font-medium text-lg ${isSelected ? 'text-white' : 'text-stone-300'}`}>
                                                {opt.label}
                                            </p>
                                            {(opt as any).desc && (
                                                <p className="text-sm text-stone-500 mt-0.5">{(opt as any).desc}</p>
                                            )}
                                        </div>

                                        {Icon && (
                                            <Icon className={isSelected ? 'text-vino-accent' : 'text-stone-600'} size={24} />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-12 flex justify-end">
                    <button
                        type="submit"
                        disabled={!isCurrentStepValid() || isLoading}
                        className="py-3 px-8 bg-vino-accent hover:bg-vino-accent-light text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(139,30,63,0.3)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : step === questions.length - 1 ? (
                            'Complete Profile'
                        ) : (
                            <>
                                Next Step
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
