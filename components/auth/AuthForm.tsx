'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Loader2, Wine, AlertCircle } from 'lucide-react'
import { login, signup, signInWithGoogle } from '@/app/auth/actions'
import { useSearchParams } from 'next/navigation'

export const AuthForm = () => {
    const searchParams = useSearchParams()
    const errorParam = searchParams.get('error')
    const messageParam = searchParams.get('message')

    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)

        if (isLogin) {
            await login(formData)
        } else {
            await signup(formData)
        }
        
        // Note: we don&apos;t necessarily setIsLoading(false) here because 
        // the server actions use redirect(), which will navigate away.
        // If it doesn't navigate (e.g. error handled client side in future), we would.
        // For now, the page will either redirect or the URL will update with an error param.
        setIsLoading(false)
    }

    // Stop loading state if we got an error back in the URL
    useEffect(() => {
        if (errorParam || messageParam) {
            setIsLoading(false)
        }
    }, [errorParam, messageParam])

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {errorParam && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                    >
                        <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-red-200">{errorParam}</p>
                    </motion.div>
                )}
                
                {messageParam && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3"
                    >
                        <AlertCircle className="text-green-400 shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-green-200">{messageParam}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                    {/* Email Input */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail size={18} className="text-vino-gray/40 group-focus-within:text-vino-accent transition-colors" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-stone-900/50 border border-stone-800 rounded-xl text-white placeholder:text-stone-500 focus:outline-none focus:border-vino-accent/50 focus:ring-1 focus:ring-vino-accent/50 transition-all duration-300"
                            placeholder="Email address"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock size={18} className="text-vino-gray/40 group-focus-within:text-vino-accent transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                            className="w-full pl-11 pr-4 py-3.5 bg-stone-900/50 border border-stone-800 rounded-xl text-white placeholder:text-stone-500 focus:outline-none focus:border-vino-accent/50 focus:ring-1 focus:ring-vino-accent/50 transition-all duration-300"
                            placeholder="Password (min. 6 characters)"
                        />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-vino-accent hover:bg-vino-accent-light text-white font-semibold rounded-xl transition-colors duration-300 shadow-[0_4px_20px_rgba(139,30,63,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <>
                            {isLogin ? 'Sign In' : 'Create Account'}
                            <Wine size={16} />
                        </>
                    )}
                </motion.button>
            </form>

            <div className="mt-6 mb-6 relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-800"></div>
                </div>
                <div className="relative px-4 bg-vino-dark text-xs text-stone-500 uppercase tracking-widest font-medium">
                    Or
                </div>
            </div>

            <form action={signInWithGoogle}>
                <motion.button
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="w-full py-3.5 bg-stone-900 border border-stone-800 hover:border-stone-700 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                        </g>
                    </svg>
                    Continue with Google
                </motion.button>
            </form>

            <div className="mt-8 text-center">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-vino-gray/70 hover:text-white transition-colors"
                >
                    {isLogin ? (
                        <>Don&apos;t have an account? <span className="text-vino-accent font-medium hover:underline underline-offset-4">Sign Up</span></>
                    ) : (
                        <>Already have an account? <span className="text-vino-accent font-medium hover:underline underline-offset-4">Sign In</span></>
                    )}
                </button>
            </div>
        </div>
    )
}
