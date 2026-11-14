import React, { Suspense } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { images } from '@/constants/images'

export default function WelcomePage() {
    return (
        <div className="min-h-screen bg-vino-dark flex">
            {/* Left Column - Image (Hidden on mobile) */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <CloudinaryImage
                    src={images.hero.background}
                    alt="Luxury Wine Cellar"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-vino-dark" />
                <div className="absolute bottom-12 left-12 max-w-md">
                    <h2 className="text-4xl font-serif text-white mb-4">
                        Discover the Extraordinary
                    </h2>
                    <p className="text-vino-gray/80 text-lg font-light leading-relaxed">
                        Join our exclusive community of wine enthusiasts. Curated selections, private events, and intelligent pairings await.
                    </p>
                </div>
            </div>

            {/* Right Column - Auth Form */}
            <div className="w-full lg:w-1/2 flex flex-col px-6 py-8 sm:px-12 md:px-24 justify-center relative">
                
                {/* Back Link */}
                <div className="absolute top-8 left-6 sm:left-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-vino-gray/60 hover:text-vino-accent transition-colors text-sm font-medium">
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>

                <div className="max-w-md w-full mx-auto">
                    <div className="mb-10 text-center lg:text-left mt-8 lg:mt-0">
                        <h1 className="text-3xl sm:text-4xl font-serif text-white mb-3">
                            Welcome to VinoSphere
                        </h1>
                        <p className="text-vino-gray/70">
                            Enter your details to continue your journey.
                        </p>
                    </div>

                    <Suspense fallback={<div className="text-white/60 text-sm text-center py-4">Loading form...</div>}>
                        <AuthForm />
                    </Suspense>
                    
                    <p className="mt-8 text-center text-xs text-vino-gray/50 max-w-sm mx-auto lg:mx-0">
                        By continuing, you agree to VinoSphere's Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    )
}
