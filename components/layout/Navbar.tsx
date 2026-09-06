'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, Search, ShoppingBag, Heart, User } from 'lucide-react'

import { NAVIGATION_ITEMS } from '@/constants/navigation'
import { Button } from '@/components/ui/Button'

export const Navbar: React.FC<{ user?: any }> = ({ user }) => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const pathname = usePathname()
    const isHome = pathname === '/'
    const isLightMode = pathname === '/discover/wines' || pathname === '/discover' || pathname === '/events'

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }

        window.addEventListener('scroll', handleScroll)

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Home page before scroll
    const isTransparent = isHome && !isScrolled

    // Dynamic Colors
    const navText = isTransparent
        ? 'text-white hover:text-vino-gold'
        : 'text-vino-dark hover:text-vino-accent'

    const iconColor = isTransparent
        ? 'text-white hover:text-vino-gold'
        : 'text-vino-dark hover:text-vino-accent'

    const logoText = isTransparent
        ? 'text-white'
        : (isLightMode ? 'text-vino-darker' : 'text-vino-dark')

    return (
        <motion.header
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
                isTransparent
                    ? 'bg-transparent'
                    : (isLightMode ? 'bg-vino-cream/90 backdrop-blur-md border-b border-vino-dark/10' : 'bg-white/95 backdrop-blur-md shadow-sm')
            }`}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 hover:opacity-90 transition-opacity"
                    >
                        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-vino-gold to-vino-accent flex items-center justify-center">
                            <span className="text-white font-serif font-bold text-lg">
                                V
                            </span>
                        </div>
                        <span
                            className={`hidden sm:block font-serif text-2xl font-bold transition-colors ${logoText}`}
                        >
                            VinoSphere
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-10">
                        {NAVIGATION_ITEMS.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`${navText} text-sm font-semibold transition-colors duration-300`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="hidden lg:flex items-center gap-6">
                        <button
                            className={`${iconColor} transition-colors duration-300`}
                        >
                            <Search size={20} />
                        </button>

                        <button
                            className={`${iconColor} transition-colors duration-300`}
                        >
                            <Heart size={20} />
                        </button>

                       

                        {user ? (
                            <Link href="/profile" className={`${navText} flex items-center gap-2 text-sm font-semibold transition-colors duration-300`}>
                                <div className="w-8 h-8 rounded-full bg-vino-accent/20 flex items-center justify-center border border-vino-accent/30">
                                    <User size={16} className="text-vino-accent" />
                                </div>
                                <span className="hidden sm:inline">Profile</span>
                            </Link>
                        ) : (
                            <Link href="/welcome" className={`${navText} text-sm font-semibold transition-colors duration-300`}>
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Button */}
                    <button
                        onClick={() =>
                            setIsMobileMenuOpen(!isMobileMenuOpen)
                        }
                        className={`lg:hidden ${iconColor} transition-colors`}
                    >
                        {isMobileMenuOpen ? (
                            <X size={26} />
                        ) : (
                            <Menu size={26} />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden bg-white rounded-xl mt-2 shadow-lg overflow-hidden"
                    >
                        <div className="py-4">
                            {NAVIGATION_ITEMS.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() =>
                                        setIsMobileMenuOpen(false)
                                    }
                                    className="block px-6 py-3 text-vino-dark hover:bg-vino-cream hover:text-vino-accent transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 p-4">
                            {user ? (
                                <Link href="/profile" className="w-full flex items-center justify-center gap-2 py-2 text-center text-sm font-semibold text-vino-dark hover:text-vino-accent transition-colors">
                                    <User size={18} />
                                    Profile
                                </Link>
                            ) : (
                                <Link href="/welcome" className="block w-full py-2 text-center text-sm font-semibold text-vino-dark hover:text-vino-accent transition-colors">
                                    Login
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </nav>
        </motion.header>
    )
}