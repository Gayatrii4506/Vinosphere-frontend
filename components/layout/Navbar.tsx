'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, Search, ShoppingBag, Heart } from 'lucide-react'
import { NAVIGATION_ITEMS } from '@/constants/navigation'
import { Button } from '@/components/ui/Button'

export const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <motion.header
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-vino-dark/80 backdrop-blur-md border-b border-vino-accent/10'
                    : 'bg-transparent'
                }`}
        >
            <nav className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-vino-gold to-vino-accent rounded-sm flex items-center justify-center">
                            <span className="text-white font-serif font-bold text-sm">V</span>
                        </div>
                        <span className="font-serif text-xl font-bold text-white hidden sm:block">
                            VinoSphere
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {NAVIGATION_ITEMS.map((item) => (
                            <div
                                key={item.label}
                                className="relative group"
                                onMouseEnter={() => setActiveDropdown(item.label)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <Link
                                    href={item.href}
                                    className="text-vino-gray hover:text-vino-gold transition-colors text-sm font-medium"
                                >
                                    {item.label}
                                </Link>

                                {item.submenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={
                                            activeDropdown === item.label
                                                ? { opacity: 1, y: 0 }
                                                : { opacity: 0, y: -10 }
                                        }
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full left-0 pt-4 hidden group-hover:block"
                                    >
                                        <div className="bg-vino-darker border border-vino-accent/20 rounded-lg overflow-hidden min-w-48 py-2">
                                            {item.submenu.map((subitem) => (
                                                <Link
                                                    key={subitem.label}
                                                    href={subitem.href}
                                                    className="block px-4 py-2 text-sm text-vino-gray hover:text-vino-gold hover:bg-vino-darkest/50 transition-all"
                                                >
                                                    {subitem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right Icons */}
                    <div className="hidden lg:flex items-center gap-6">
                        <button className="text-vino-gray hover:text-vino-gold transition-colors">
                            <Search size={20} />
                        </button>
                        <button className="text-vino-gray hover:text-vino-gold transition-colors">
                            <Heart size={20} />
                        </button>
                        <button className="text-vino-gray hover:text-vino-gold transition-colors">
                            <ShoppingBag size={20} />
                        </button>
                        <Button size="sm" variant="primary">
                            Sign In
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden text-vino-gray hover:text-vino-gold transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden border-t border-vino-accent/10 py-4"
                    >
                        {NAVIGATION_ITEMS.map((item) => (
                            <div key={item.label}>
                                <Link
                                    href={item.href}
                                    className="block px-4 py-2 text-sm text-vino-gray hover:text-vino-gold"
                                >
                                    {item.label}
                                </Link>
                                {item.submenu && (
                                    <div className="pl-4">
                                        {item.submenu.map((subitem) => (
                                            <Link
                                                key={subitem.label}
                                                href={subitem.href}
                                                className="block px-4 py-2 text-xs text-vino-gray-dark hover:text-vino-gold"
                                            >
                                                {subitem.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="px-4 py-4 border-t border-vino-accent/10 mt-4 flex gap-2">
                            <Button size="sm" variant="primary" className="flex-1">
                                Sign In
                            </Button>
                        </div>
                    </motion.div>
                )}
            </nav>
        </motion.header>
    )
}
