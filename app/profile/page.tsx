import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOutAction } from '@/app/auth/actions'
import { User, LogOut, Wine, Compass, Sparkles, Settings } from 'lucide-react'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { images } from '@/constants/images'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/welcome')
    }

    const metadata = user.user_metadata
    const preferences = metadata?.preferences || {}

    return (
        <div className="min-h-screen bg-vino-dark pt-28 pb-20 relative">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-vino-accent/10 to-transparent pointer-events-none" />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between bg-stone-900/40 border border-stone-800 rounded-3xl p-8 backdrop-blur-md mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-vino-accent/20 border-2 border-vino-accent/50 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(139,30,63,0.3)]">
                            <User size={40} className="text-vino-accent" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif text-white font-bold mb-2">My Profile</h1>
                            <p className="text-vino-gray/70 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <form action={signOutAction}>
                        <button type="submit" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-800/80 hover:bg-red-500/10 text-stone-300 hover:text-red-400 border border-stone-700 hover:border-red-500/30 transition-all duration-300 font-semibold text-sm">
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </form>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Preferences Column */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-8 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-serif text-white flex items-center gap-3">
                                    <Sparkles size={20} className="text-vino-gold" />
                                    Tasting Profile
                                </h2>
                                <button className="text-vino-gray/50 hover:text-vino-accent transition-colors">
                                    <Settings size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-5 rounded-2xl bg-stone-950/50 border border-stone-800/50">
                                    <p className="text-xs text-vino-gray/50 uppercase tracking-widest mb-2">Experience Level</p>
                                    <p className="text-lg text-white font-medium capitalize">
                                        {preferences.experience_level || 'Not set'}
                                    </p>
                                </div>
                                <div className="p-5 rounded-2xl bg-stone-950/50 border border-stone-800/50">
                                    <p className="text-xs text-vino-gray/50 uppercase tracking-widest mb-2">Primary Interest</p>
                                    <p className="text-lg text-white font-medium capitalize">
                                        {preferences.primary_interest || 'Not set'}
                                    </p>
                                </div>
                                <div className="p-5 rounded-2xl bg-stone-950/50 border border-stone-800/50 sm:col-span-2">
                                    <p className="text-xs text-vino-gray/50 uppercase tracking-widest mb-3">Favorite Wines</p>
                                    <div className="flex flex-wrap gap-2">
                                        {preferences.favorite_types?.length > 0 ? (
                                            preferences.favorite_types.map((type: string) => (
                                                <span key={type} className="px-3 py-1.5 rounded-lg bg-vino-accent/10 border border-vino-accent/20 text-vino-accent-light text-sm capitalize">
                                                    {type}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-stone-500 text-sm">No preferences set.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity / Reserved */}
                        <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-8 backdrop-blur-md">
                            <h2 className="text-xl font-serif text-white flex items-center gap-3 mb-6">
                                <Wine size={20} className="text-vino-gold" />
                                My Cellar
                            </h2>
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-stone-800 rounded-2xl">
                                <div className="w-16 h-16 rounded-full bg-stone-800/50 flex items-center justify-center mb-4">
                                    <Wine size={24} className="text-stone-500" />
                                </div>
                                <h3 className="text-lg text-white font-medium mb-2">Your cellar is empty</h3>
                                <p className="text-sm text-vino-gray/70 max-w-sm mb-6">
                                    Start exploring our collection and adding your favorite wines to your personal cellar.
                                </p>
                                <a href="/discover/wines" className="px-6 py-2.5 rounded-xl bg-vino-accent hover:bg-vino-accent-light text-white font-semibold text-sm transition-colors">
                                    Explore Wines
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="relative rounded-3xl overflow-hidden aspect-[3/4] group">
                            <CloudinaryImage 
                                src={images.hero.background} 
                                alt="Premium Membership"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-vino-dark via-vino-dark/50 to-transparent" />
                            
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <div className="w-12 h-12 rounded-full bg-vino-gold/20 flex items-center justify-center mb-4 backdrop-blur-md border border-vino-gold/30">
                                    <Compass size={24} className="text-vino-gold" />
                                </div>
                                <h3 className="text-xl font-serif text-white font-bold mb-2">Join The Club</h3>
                                <p className="text-sm text-stone-300 mb-6 line-clamp-2">
                                    Unlock exclusive access to limited-edition wines and private tasting events.
                                </p>
                                <button className="w-full py-3 rounded-xl bg-vino-gold hover:bg-white text-vino-darker font-bold text-sm transition-colors shadow-lg shadow-vino-gold/20">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
