'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Search, Heart, User, ChevronDown, Wine, MapPin } from 'lucide-react'

import { NAVIGATION_ITEMS } from '@/constants/navigation'
import { useWishlist } from '@/context/WishlistContext'

export const Navbar: React.FC<{ user?: any }> = ({ user }) => {
    const { wishlistCount } = useWishlist()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isDiscoverOpen, setIsDiscoverOpen] = useState(false)
    const [isMobileDiscoverOpen, setIsMobileDiscoverOpen] = useState(true)

    const dropdownRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)

    const pathname = usePathname()
    if (pathname && pathname.startsWith('/admin')) {
        return null
    }

    const isHome = pathname === '/'

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 30)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsDiscoverOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close dropdown on Escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isDiscoverOpen) {
                setIsDiscoverOpen(false)
                triggerRef.current?.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isDiscoverOpen])

    // Close dropdown when route changes
    useEffect(() => {
        setIsDiscoverOpen(false)
        setIsMobileMenuOpen(false)
    }, [pathname])

    // Home page before scroll has transparent header over dark hero
    const isTransparent = isHome && !isScrolled

    // Navigation Text Colors
    const navText = isTransparent
        ? 'text-white/90 hover:text-vino-gold'
        : 'text-stone-700 hover:text-vino-accent'

    const iconColor = isTransparent
        ? 'text-white/90 hover:text-vino-gold'
        : 'text-stone-700 hover:text-vino-accent'

    const logoText = isTransparent
        ? 'text-white'
        : 'text-vino-darker'

    return (
        <motion.header
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
                isTransparent
                    ? 'bg-transparent py-2'
                    : 'bg-white/92 backdrop-blur-md shadow-[0_1px_16px_rgba(44,24,16,0.06)] border-b border-[#EDE5D8]/80 py-0'
            }`}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3 hover:opacity-95 transition-opacity group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-gold rounded-lg p-1"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vino-gold via-[#A8304F] to-vino-accent flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                            <span className="text-white font-serif font-bold text-lg tracking-wider">
                                V
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span
                                className={`hidden sm:block font-serif text-2xl font-bold tracking-tight transition-colors ${logoText}`}
                            >
                                VinoSphere
                            </span>
                            <span className={`hidden sm:block text-[9px] uppercase tracking-[0.2em] font-semibold transition-colors ${isTransparent ? 'text-vino-gold-light/80' : 'text-[#8B6E5A]'}`}>
                                Fine Wine Concierge
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-7">
                        {NAVIGATION_ITEMS.map((item) => {
                            if (item.items) {
                                // Dropdown navigation item (e.g. Discover)
                                const isChildActive = item.items.some(
                                    (child) => pathname === child.href || (child.href !== '/' && pathname?.startsWith(child.href))
                                )

                                return (
                                    <div key={item.label} className="relative">
                                        <button
                                            ref={triggerRef}
                                            type="button"
                                            id="discover-dropdown-trigger"
                                            aria-expanded={isDiscoverOpen}
                                            aria-haspopup="true"
                                            aria-controls="discover-dropdown-menu"
                                            onClick={() => setIsDiscoverOpen((prev) => !prev)}
                                            className={`relative inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide transition-colors duration-200 py-1 ${
                                                isChildActive || isDiscoverOpen
                                                    ? (isTransparent ? 'text-vino-gold font-bold' : 'text-vino-accent font-bold')
                                                    : navText
                                            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent rounded-sm`}
                                        >
                                            <span>{item.label}</span>
                                            <ChevronDown
                                                size={14}
                                                className={`transition-transform duration-200 ${
                                                    isDiscoverOpen ? 'rotate-180 text-vino-accent' : 'opacity-75'
                                                }`}
                                            />
                                            {isChildActive && (
                                                <motion.div
                                                    layoutId="activeNavIndicator"
                                                    className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${isTransparent ? 'bg-vino-gold' : 'bg-vino-accent'}`}
                                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                                />
                                            )}
                                        </button>

                                        {/* Dropdown Menu Panel */}
                                        <AnimatePresence>
                                            {isDiscoverOpen && (
                                                <motion.div
                                                    ref={dropdownRef}
                                                    id="discover-dropdown-menu"
                                                    role="menu"
                                                    aria-labelledby="discover-dropdown-trigger"
                                                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                                                    className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl border border-[#EDE5D8] shadow-[0_16px_36px_rgba(44,24,16,0.12)] p-2 z-50"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        {item.items.map((subItem) => {
                                                            const isSubActive = pathname === subItem.href || (subItem.href !== '/' && pathname?.startsWith(subItem.href))
                                                            const isWine = subItem.href.includes('wines')

                                                            return (
                                                                <Link
                                                                    key={subItem.label}
                                                                    href={subItem.href}
                                                                    role="menuitem"
                                                                    onClick={() => setIsDiscoverOpen(false)}
                                                                    className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-150 ${
                                                                        isSubActive
                                                                            ? 'bg-[#FAF7F2] text-vino-accent'
                                                                            : 'hover:bg-[#FAF7F2] text-[#1A0A10]'
                                                                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent`}
                                                                >
                                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                                                        isSubActive 
                                                                            ? 'bg-vino-accent text-white' 
                                                                            : 'bg-[#FAF7F2] text-[#8B1E3F] group-hover:bg-vino-accent group-hover:text-white border border-[#EDE5D8]/80'
                                                                    }`}>
                                                                        {isWine ? <Wine size={16} /> : <MapPin size={16} />}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className={`text-sm font-semibold transition-colors ${
                                                                            isSubActive ? 'text-vino-accent font-bold' : 'text-[#1A0A10] group-hover:text-vino-accent'
                                                                        }`}>
                                                                            {subItem.label}
                                                                        </span>
                                                                        <span className="text-[11px] text-[#8B6E5A] font-medium leading-snug mt-0.5">
                                                                            {subItem.description}
                                                                        </span>
                                                                    </div>
                                                                </Link>
                                                            )
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )
                            }

                            // Standard Nav Links
                            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href || ''))

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href || '/'}
                                    className={`relative text-sm font-semibold tracking-wide transition-colors duration-200 py-1 ${
                                        isActive 
                                            ? (isTransparent ? 'text-vino-gold font-bold' : 'text-vino-accent font-bold') 
                                            : navText
                                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent rounded-sm`}
                                >
                                    {item.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNavIndicator"
                                            className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${isTransparent ? 'bg-vino-gold' : 'bg-vino-accent'}`}
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right Section */}
                    <div className="hidden lg:flex items-center gap-5">
                        <Link
                            href="/discover/wines"
                            aria-label="Search wines and catalog"
                            className={`${iconColor} p-2 rounded-full hover:bg-black/5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent`}
                        >
                            <Search size={19} />
                        </Link>

                        <Link
                            href="/cellar"
                            title="My Cellar / Wishlist"
                            aria-label={`My Cellar with ${wishlistCount} saved items`}
                            className={`${iconColor} p-2 rounded-full hover:bg-black/5 transition-all duration-200 relative flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent`}
                        >
                            <Heart size={19} className={wishlistCount > 0 ? "fill-vino-accent text-vino-accent" : ""} />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-vino-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        <div className={`h-5 w-px ${isTransparent ? 'bg-white/20' : 'bg-[#EDE5D8]'}`} />

                        {user ? (
                            <Link 
                                href="/profile" 
                                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all duration-200 ${
                                    isTransparent 
                                        ? 'border-white/20 hover:bg-white/10 text-white' 
                                        : 'border-[#EDE5D8] hover:border-vino-accent/40 bg-[#FAF7F2] text-stone-800'
                                } text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent`}
                            >
                                <div className="w-6 h-6 rounded-full bg-vino-accent/15 flex items-center justify-center border border-vino-accent/30 text-vino-accent">
                                    <User size={13} />
                                </div>
                                <span className="max-w-[100px] truncate">{user.email?.split('@')[0] || 'My Account'}</span>
                            </Link>
                        ) : (
                            <Link 
                                href="/welcome" 
                                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                                    isTransparent
                                        ? 'bg-vino-gold hover:bg-vino-gold-light text-vino-darker shadow-sm'
                                        : 'bg-vino-accent hover:bg-vino-accent-light text-white shadow-sm'
                                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-vino-accent active:scale-95`}
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        suppressHydrationWarning
                        aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`lg:hidden p-2 rounded-lg ${iconColor} hover:bg-black/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vino-accent`}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="lg:hidden bg-white rounded-2xl mt-2 shadow-xl border border-[#EDE5D8] overflow-hidden"
                    >
                        <div className="py-3 px-3 space-y-1">
                            {NAVIGATION_ITEMS.map((item) => {
                                if (item.items) {
                                    return (
                                        <div key={item.label} className="border-b border-[#F2ECE1] pb-2 mb-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsMobileDiscoverOpen(!isMobileDiscoverOpen)}
                                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#8B6E5A] hover:text-vino-accent"
                                            >
                                                <span>{item.label}</span>
                                                <ChevronDown size={14} className={`transition-transform duration-200 ${isMobileDiscoverOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            
                                            {isMobileDiscoverOpen && (
                                                <div className="space-y-1 pl-2 pt-1">
                                                    {item.items.map((subItem) => {
                                                        const isWine = subItem.href.includes('wines')
                                                        const isSubActive = pathname === subItem.href || (subItem.href !== '/' && pathname?.startsWith(subItem.href))

                                                        return (
                                                            <Link
                                                                key={subItem.label}
                                                                href={subItem.href}
                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                                className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                                                                    isSubActive ? 'bg-[#FAF7F2] text-vino-accent' : 'hover:bg-[#FAF7F2] text-[#1A0A10]'
                                                                }`}
                                                            >
                                                                <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#EDE5D8] text-vino-accent flex items-center justify-center shrink-0 mt-0.5">
                                                                    {isWine ? <Wine size={14} /> : <MapPin size={14} />}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-semibold">{subItem.label}</span>
                                                                    <span className="text-[11px] text-[#8B6E5A]">{subItem.description}</span>
                                                                </div>
                                                            </Link>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )
                                }

                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href || '/'}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                            isActive
                                                ? 'bg-[#FAF7F2] text-vino-accent font-bold'
                                                : 'text-[#1A0A10] hover:bg-[#FAF7F2] hover:text-vino-accent'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                )
                            })}

                            <Link
                                href="/cellar"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1A0A10] hover:bg-[#FAF7F2] hover:text-vino-accent transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Heart size={16} className="text-vino-accent" />
                                    My Cellar (Wishlist)
                                </span>
                                {wishlistCount > 0 && (
                                    <span className="bg-vino-accent text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>
                        </div>

                        <div className="border-t border-[#EDE5D8] p-3 bg-[#FAF7F2]/60">
                            {user ? (
                                <Link
                                    href="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 py-2 text-center text-sm font-semibold text-[#1A0A10] hover:text-vino-accent transition-colors"
                                >
                                    <User size={16} />
                                    Profile ({user.email?.split('@')[0]})
                                </Link>
                            ) : (
                                <Link
                                    href="/welcome"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block w-full py-2.5 text-center text-xs font-bold uppercase tracking-wider bg-vino-accent text-white rounded-xl hover:bg-vino-accent-light transition-colors shadow-sm"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </nav>
        </motion.header>
    )
}