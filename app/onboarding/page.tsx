import React from 'react'
import { OnboardingForm } from '@/components/auth/OnboardingForm'

export default function OnboardingPage() {
    return (
        <div className="min-h-screen bg-vino-dark flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-vino-accent/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-vino-gold/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-4xl z-10">
                <OnboardingForm />
            </div>
        </div>
    )
}
