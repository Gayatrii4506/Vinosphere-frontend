'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Wine as WineIcon, 
  Heart, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Edit3, 
  Search, 
  Bell, 
  Copy, 
  Check, 
  ArrowRight, 
  Plus, 
  Ticket, 
  Compass, 
  LogOut,
  ChevronRight,
  Droplet,
  GlassWater,
  Smile,
  X,
  Loader2,
  PackageOpen,
  History,
  Trash2
} from 'lucide-react'
import { signOutAction } from '@/app/auth/actions'
import { updateUserProfileQuick } from '@/app/profile/actions'
import { useWishlist } from '@/context/WishlistContext'
import { WINES, Wine } from '@/constants/wines'
import { isWineIdMatch } from '@/lib/utils/wine-id'

interface WishlistItem {
  id: string
  name: string
  winery: string
  price: string
  image: string
  type: string
}

interface ExperienceItem {
  id: string
  title: string
  winery: string
  date: string
  image: string
}

interface JourneyEvent {
  id: string
  date: string
  title: string
  iconType: 'wishlist' | 'explored' | 'visited' | 'rated'
}

interface LuxuryUserProfileProps {
  user: {
    id: string
    email?: string
    name?: string
    phone?: string
    city?: string
    state?: string
    country?: string
    avatarUrl?: string
    createdAt?: string
  }
  preferences: {
    experience_level?: string
    favorite_types?: string[]
    sweetness?: string
    body_style?: string
    flavors?: string[]
    grapes?: string[]
    budget_max?: number
    budget_min?: number
    taste_appealing?: string
  }
  metrics?: {
    winesExplored: number
    winesSaved: number
    wineriesVisited: number
    experiences: number
  }
  wishlist?: WishlistItem[]
  experiences?: ExperienceItem[]
  journey?: JourneyEvent[]
}

export const LuxuryUserProfile: React.FC<LuxuryUserProfileProps> = ({ 
  user, 
  preferences, 
  metrics = { winesExplored: 0, winesSaved: 0, wineriesVisited: 0, experiences: 0 },
  wishlist: initialWishlist = [],
  experiences = [],
  journey: initialJourney = []
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'wishlist' | 'cellar' | 'history' | 'experiences' | 'preferences' | 'settings'>('overview')
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Real-time Wishlist Context Integration
  const { wishlistIds, toggleWishlist, isWishlisted } = useWishlist()
  const [dbWines, setDbWines] = useState<WishlistItem[]>([])

  // Fetch any custom winery-added wines from Supabase DB for wishlisted IDs
  useEffect(() => {
    if (wishlistIds.length === 0) {
      setDbWines([])
      return
    }

    const fetchCustomWines = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data, error } = await supabase
          .from('wines')
          .select('*, wineries(name, city, country), wine_inventory(price, stock_quantity), wine_images(image_url, is_primary)')
          .in('id', wishlistIds)

        if (!error && data && data.length > 0) {
          const mapped: WishlistItem[] = data.map((cw: any) => {
            const inventory = Array.isArray(cw.wine_inventory) ? cw.wine_inventory[0] : cw.wine_inventory
            const images = cw.wine_images || []
            const primaryImage = images.find((img: any) => img.is_primary) || images[0]

            return {
              id: String(cw.id),
              name: cw.name,
              winery: cw.wineries ? `${cw.wineries.city || ''}, ${cw.wineries.country || ''}`.replace(/^, /, '') : 'Nashik Valley',
              price: inventory?.price ? `₹${Number(inventory.price).toLocaleString()}` : '₹1,200',
              image: primaryImage?.image_url || '/bottle.png',
              type: cw.wine_type || 'Red'
            }
          })
          setDbWines(mapped)
        }
      } catch {}
    }

    fetchCustomWines()
  }, [wishlistIds])

  // Compute live wishlist items by resolving context wishlistIds against catalogue + db + initial
  const liveWishlist = useMemo(() => {
    const matchedWines: WishlistItem[] = []
    const processedIds = new Set<string>()

    // 1. Resolve from current client wishlistIds
    if (wishlistIds.length > 0) {
      wishlistIds.forEach(wId => {
        // Find in static catalogue
        const found = WINES.find(w => isWineIdMatch(w.id, wId))
        if (found && !processedIds.has(String(found.id))) {
          processedIds.add(String(found.id))
          matchedWines.push({
            id: String(found.id),
            name: found.name,
            winery: found.origin || 'Nashik Valley',
            price: `₹${Number(found.price).toLocaleString()}`,
            image: found.imageUrl || '/bottle.png',
            type: found.type || 'Red'
          })
        }

        // Find in DB fetched custom wines
        const dbFound = dbWines.find(w => isWineIdMatch(w.id, wId))
        if (dbFound && !processedIds.has(String(dbFound.id))) {
          processedIds.add(String(dbFound.id))
          matchedWines.push(dbFound)
        }
      })
    }

    // 2. Include any from initialWishlist not already found
    initialWishlist.forEach(w => {
      if (!processedIds.has(String(w.id))) {
        // If user is logged in and wishlistIds is populated, only include if in wishlistIds
        if (wishlistIds.length === 0 || wishlistIds.some(id => isWineIdMatch(id, w.id))) {
          processedIds.add(String(w.id))
          matchedWines.push(w)
        }
      }
    })

    return matchedWines
  }, [wishlistIds, dbWines, initialWishlist])

  // Edit Modal Form State
  const [editFullName, setEditFullName] = useState(user.name || '')
  const [editPhone, setEditPhone] = useState(user.phone || '')
  const [editCity, setEditCity] = useState(user.city || '')
  const [editState, setEditState] = useState(user.state || '')
  const [editCountry, setEditCountry] = useState(user.country || 'India')

  // Recommendation preferences in modal
  const [editType, setEditType] = useState(preferences.favorite_types?.[0] || 'Rosé')
  const [editSweetness, setEditSweetness] = useState(preferences.sweetness || 'Semi-dry')
  const [editBody, setEditBody] = useState(preferences.body_style || 'Light')
  const [editFlavour, setEditFlavour] = useState(preferences.taste_appealing || 'Fruity')

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCoupon(code)
    setTimeout(() => setCopiedCoupon(null), 2500)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)

    try {
      const res = await updateUserProfileQuick({
        fullName: editFullName,
        phone: editPhone,
        city: editCity,
        state: editState,
        country: editCountry,
        favoriteType: editType,
        sweetness: editSweetness,
        bodyStyle: editBody,
        flavour: editFlavour
      })

      if (res.error) {
        setErrorMessage(res.error)
      } else {
        setSaveSuccess(true)
        setTimeout(() => {
          setSaveSuccess(false)
          setIsEditModalOpen(false)
        }, 1200)
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while saving.')
    } finally {
      setIsSaving(false)
    }
  }

  const memberSinceYear = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '2026'
  const userName = editFullName || user.name || (user.email ? user.email.split('@')[0].replace(/[0-9]/g, '') : 'Wine Connoisseur')
  const capitalizedName = userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : 'Wine Connoisseur'

  const expLevel = preferences.experience_level || 'BEGINNER'
  const memberTitle = expLevel === 'EXPERIENCED' ? 'Wine Connoisseur' : expLevel === 'INTERMEDIATE' ? 'Wine Enthusiast' : 'Wine Explorer'

  const preferredType = editType || preferences.favorite_types?.[0] || 'Exploring Styles'
  const preferredSweetness = editSweetness || preferences.sweetness || 'Open Palate'
  const preferredBody = editBody ? (editBody.toLowerCase().includes('bodied') ? editBody : `${editBody}-bodied`) : 'Balanced Body'
  const preferredFlavour = editFlavour || preferences.taste_appealing || 'Fruity & Fresh'

  const budgetLabel = preferences.budget_max 
    ? (preferences.budget_max <= 1500 ? '₹ Budget Friendly' : preferences.budget_max <= 3500 ? '₹₹ Moderate' : '₹₹₹ Premium Reserve')
    : 'Flexible Allocation'

  const totalSavedCount = Math.max(metrics.winesSaved, liveWishlist.length, wishlistIds.length)

  return (
    <div className="min-h-screen bg-[#0E0B0C] text-[#EDE8E3] pt-16 sm:pt-20 pb-24 font-sans selection:bg-vino-accent selection:text-white">
      {/* 1. HERO BANNER WITH VINEYARD SUNSET */}
      <div className="relative w-full border-b border-stone-800/80 overflow-hidden">
        {/* Background Image with Ambient Overlays */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 filter brightness-[0.45] contrast-110 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=1800&auto=format&fit=crop')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0B0C] via-[#0E0B0C]/60 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A060E]/80 via-transparent to-[#1A060E]/80 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
          {/* Top Bar inside Hero */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="hidden sm:block" />
            
            {/* Watermark Cursive */}
            <div className="text-right ml-auto mr-4 hidden md:block">
              <span className="font-serif italic text-2xl lg:text-3xl text-amber-100/30 tracking-wider">
                A more flavourful you
              </span>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                aria-label="Search wines and experiences"
                className="w-9 h-9 rounded-full bg-stone-900/80 border border-stone-700/60 text-stone-300 hover:text-white hover:border-amber-400/40 flex items-center justify-center transition-all shadow-sm"
              >
                <Search size={16} />
              </button>
              <button 
                type="button" 
                aria-label="Notifications"
                className="relative w-9 h-9 rounded-full bg-stone-900/80 border border-stone-700/60 text-stone-300 hover:text-white hover:border-amber-400/40 flex items-center justify-center transition-all shadow-sm"
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-vino-accent ring-2 ring-stone-900" />
              </button>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-1.5 rounded-full bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 hover:border-amber-400/40 text-stone-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Edit3 size={13} className="text-amber-300" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* User Profile Overview Row */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Avatar & Identity */}
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-2 ring-amber-400/40 p-0.5 bg-gradient-to-br from-amber-400/30 to-vino-accent/30 shadow-[0_0_25px_rgba(217,119,6,0.2)]">
                  <img
                    src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"}
                    alt={capitalizedName}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  aria-label="Edit Profile Avatar"
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-stone-900 border border-amber-400/50 text-amber-300 flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                >
                  <Edit3 size={12} />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 border border-amber-400/30 text-amber-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    VinoSphere Member
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-0.5">
                  {capitalizedName}
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 font-medium mb-1">
                  {memberTitle} &bull; <span className="text-stone-400">Member since {memberSinceYear}</span>
                </p>
                <p className="text-xs text-stone-400 italic">
                  {user.city && user.state ? `${user.city}, ${user.state} • ` : ''}&ldquo;Exploring new wines, one sip at a time.&rdquo;
                </p>
              </div>
            </div>

            {/* Quick 4 Stats Grid with Live Real-Time Counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full lg:w-auto p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 backdrop-blur-md">
              <div className="flex flex-col items-center justify-center text-center px-2">
                <div className="w-8 h-8 rounded-full bg-vino-accent/15 border border-vino-accent/30 flex items-center justify-center text-vino-accent-light mb-1">
                  <WineIcon size={15} />
                </div>
                <span className="font-serif text-lg sm:text-xl font-bold text-white">{metrics.winesExplored}</span>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">Wines Explored</span>
              </div>

              <div className="flex flex-col items-center justify-center text-center px-2">
                <div className="w-8 h-8 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 mb-1">
                  <Heart size={15} />
                </div>
                <span className="font-serif text-lg sm:text-xl font-bold text-white">{totalSavedCount}</span>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">Wines Saved</span>
              </div>

              <div className="flex flex-col items-center justify-center text-center px-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-1">
                  <MapPin size={15} />
                </div>
                <span className="font-serif text-lg sm:text-xl font-bold text-white">{metrics.wineriesVisited}</span>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">Wineries Visited</span>
              </div>

              <div className="flex flex-col items-center justify-center text-center px-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 mb-1">
                  <Calendar size={15} />
                </div>
                <span className="font-serif text-lg sm:text-xl font-bold text-white">{metrics.experiences}</span>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">Experiences</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. NAVIGATION TABS BAR */}
        <div className="bg-[#120D0F] border-t border-stone-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'wishlist', label: `Wishlist (${totalSavedCount})` },
                { id: 'cellar', label: 'My Cellar' },
                { id: 'history', label: 'History' },
                { id: 'experiences', label: 'Experiences' },
                { id: 'preferences', label: 'Preferences' }
              ].map(tab => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-3 text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap transition-all border-b-2 ${
                      isActive 
                        ? 'border-vino-accent text-white font-bold' 
                        : 'border-transparent text-stone-400 hover:text-stone-200 hover:border-stone-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* VIEW A: WISHLIST TAB */}
        {activeTab === 'wishlist' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#161113] border border-stone-800/90 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                  <Heart size={22} className="text-rose-400 fill-rose-400" />
                  Your Saved Wines ({liveWishlist.length})
                </h2>
                <p className="text-xs text-stone-400 mt-1">Real-time cellar wishlist synced with your palate profile</p>
              </div>
              <a
                href="/discover/wines"
                className="px-4 py-2 rounded-xl bg-vino-accent hover:bg-vino-accent-light text-white text-xs font-bold transition-all shadow-sm"
              >
                + Browse More Wines
              </a>
            </div>

            {liveWishlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {liveWishlist.map(w => {
                  const rawWine = WINES.find(item => isWineIdMatch(item.id, w.id))
                  return (
                    <div key={w.id} className="group p-4 rounded-2xl bg-[#1D1619] border border-stone-800/80 hover:border-vino-accent/50 transition-all flex flex-col justify-between">
                      <div className="relative w-full h-36 mb-3 flex items-center justify-center overflow-hidden rounded-xl bg-stone-950/40">
                        <img 
                          src={w.image} 
                          alt={w.name} 
                          className="object-contain h-full max-h-full group-hover:scale-105 transition-transform" 
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (rawWine) {
                              await toggleWishlist(rawWine)
                            }
                          }}
                          aria-label="Remove from wishlist"
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-stone-900/90 text-rose-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-md"
                        >
                          <Heart size={13} className="fill-rose-400" />
                        </button>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-amber-400/90 mb-1 block">
                          {w.type} Wine
                        </span>
                        <h4 className="font-serif text-sm font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                          {w.name}
                        </h4>
                        <p className="text-[11px] text-stone-400 mb-2 line-clamp-1">{w.winery}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
                          <span className="text-sm font-bold text-white">{w.price}</span>
                          <a
                            href={`/discover/wines?id=${w.id}`}
                            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                          >
                            View Details &rarr;
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-16 text-center rounded-2xl bg-stone-950/40 border border-stone-800/60">
                <PackageOpen size={40} className="text-stone-600 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-white mb-1">No wines saved yet</h3>
                <p className="text-xs text-stone-400 mb-4">Click the heart icon on any wine in the catalogue to save it to your cellar wishlist.</p>
                <a
                  href="/discover/wines"
                  className="px-5 py-2.5 rounded-xl bg-vino-accent hover:bg-vino-accent-light text-white text-xs font-bold transition-all shadow-md inline-block"
                >
                  Explore Wine Catalogue &rarr;
                </a>
              </div>
            )}
          </div>
        )}

        {/* VIEW B: MY CELLAR TAB */}
        {activeTab === 'cellar' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#161113] border border-stone-800/90 shadow-lg space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                  <WineIcon size={22} className="text-amber-400" />
                  My Personal Cellar Collection
                </h2>
                <p className="text-xs text-stone-400 mt-1">Live tracking of your saved and collected bottles</p>
              </div>
              <a
                href="/discover/wines"
                className="px-4 py-2 rounded-xl bg-vino-accent hover:bg-vino-accent-light text-white text-xs font-bold transition-all shadow-sm"
              >
                + Add Bottles
              </a>
            </div>

            {/* Cellar Stats Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#1D1619] border border-stone-800/80 text-center">
              <div>
                <span className="font-serif text-2xl font-bold text-white block">{totalSavedCount}</span>
                <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Total Bottles</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-rose-400 block">
                  {liveWishlist.filter(w => w.type?.toLowerCase().includes('red')).length}
                </span>
                <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Red Wines</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-amber-300 block">
                  {liveWishlist.filter(w => w.type?.toLowerCase().includes('white')).length}
                </span>
                <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">White Wines</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-pink-300 block">
                  {liveWishlist.filter(w => w.type?.toLowerCase().includes('ros')).length}
                </span>
                <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">Rosé Wines</span>
              </div>
            </div>

            {/* Visual Bottle Shelf */}
            <div className="p-6 rounded-2xl bg-stone-950/60 border border-stone-800/80">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-4">Cellar Rack Display</h3>
              <div className="flex items-end justify-start gap-5 overflow-x-auto pb-2">
                {liveWishlist.map((w, idx) => (
                  <div key={idx} className="w-16 h-36 flex flex-col items-center justify-end bg-stone-900/50 rounded-xl p-2 shrink-0 border border-stone-800 hover:border-amber-400/40 transition-all">
                    <img src={w.image} alt={w.name} className="h-24 object-contain mb-1" />
                    <span className="text-[9px] text-stone-300 font-medium truncate w-full text-center">{w.name}</span>
                  </div>
                ))}

                <a
                  href="/discover/wines"
                  className="w-28 h-36 rounded-xl border-2 border-dashed border-stone-700/80 hover:border-amber-400/60 text-stone-400 hover:text-amber-300 flex flex-col items-center justify-center gap-2 transition-all group shrink-0"
                >
                  <Plus size={22} className="group-hover:scale-110 transition-transform text-amber-400" />
                  <span className="text-xs font-bold">Add to Cellar</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* VIEW C: OVERVIEW (DEFAULT DASHBOARD GRID) */}
        {activeTab === 'overview' && (
          <>
            {/* ROW 1: Your Wine Identity (2/3) + Editorial Wine Glass Quote (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {/* Your Wine Identity Card */}
              <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-[#161113] border border-stone-800/90 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-vino-accent/20 text-vino-accent-light flex items-center justify-center">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <h2 className="font-serif text-lg sm:text-xl font-bold text-white">Your Wine Identity</h2>
                        <p className="text-xs text-stone-400">Based on your taste preferences</p>
                      </div>
                    </div>

                    <span className="text-[11px] text-amber-400 font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                      Profile Active
                    </span>
                  </div>

                  {/* 4 Dimension Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
                    <div className="p-3.5 rounded-2xl bg-[#1D1619] border border-stone-800/80 flex flex-col">
                      <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-300 flex items-center justify-center mb-2">
                        <WineIcon size={14} />
                      </div>
                      <span className="font-serif text-sm font-bold text-white mb-0.5 line-clamp-1">{preferredType}</span>
                      <span className="text-[10px] text-stone-400">Preferred Type</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#1D1619] border border-stone-800/80 flex flex-col">
                      <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-300 flex items-center justify-center mb-2">
                        <Droplet size={14} />
                      </div>
                      <span className="font-serif text-sm font-bold text-white mb-0.5 line-clamp-1">{preferredSweetness}</span>
                      <span className="text-[10px] text-stone-400">Sweetness</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#1D1619] border border-stone-800/80 flex flex-col">
                      <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-300 flex items-center justify-center mb-2">
                        <GlassWater size={14} />
                      </div>
                      <span className="font-serif text-sm font-bold text-white mb-0.5 line-clamp-1">{preferredBody}</span>
                      <span className="text-[10px] text-stone-400">Body</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#1D1619] border border-stone-800/80 flex flex-col">
                      <div className="w-7 h-7 rounded-full bg-pink-500/10 text-pink-300 flex items-center justify-center mb-2">
                        <Smile size={14} />
                      </div>
                      <span className="font-serif text-sm font-bold text-white mb-0.5 line-clamp-1">{preferredFlavour}</span>
                      <span className="text-[10px] text-stone-400">Flavour Profile</span>
                    </div>
                  </div>

                  {/* Bottom Details Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-t border-stone-800/80 text-xs">
                    <div>
                      <span className="text-stone-400 block mb-0.5">Typical Budget</span>
                      <span className="font-semibold text-stone-200">{budgetLabel}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block mb-0.5">Perfect For</span>
                      <span className="font-semibold text-stone-200">Casual evenings, dining, social occasions</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-vino-accent hover:bg-vino-accent-light text-white text-xs font-bold transition-all shadow-md"
                  >
                    Edit Preferences
                    <ArrowRight size={13} />
                  </button>

                  <a
                    href="/onboarding?mode=edit"
                    className="text-xs text-stone-400 hover:text-amber-300 transition-colors"
                  >
                    Retake Full Quiz &rarr;
                  </a>
                </div>
              </div>

              {/* Editorial Wine Glass Quote Card */}
              <div className="relative rounded-3xl overflow-hidden min-h-[260px] border border-stone-800/90 shadow-lg group flex flex-col justify-end p-7">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.55]"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop')`
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                <div className="relative z-10 space-y-2">
                  <p className="font-serif italic text-xl sm:text-2xl text-amber-100 font-light leading-snug">
                    &ldquo;Wine is a journey of self-discovery.&rdquo;
                  </p>
                  <div className="w-12 h-0.5 bg-amber-400/60" />
                </div>
              </div>
            </div>

            {/* ROW 2: Your Wishlist (2/3) + Your Coupons & Offers (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {/* Your Real Wishlist Strip */}
              <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-[#161113] border border-stone-800/90 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Heart size={18} className="text-rose-400 fill-rose-400/20" />
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-white">Your Wishlist</h3>
                      <span className="text-xs text-stone-400 ml-1">({liveWishlist.length} saved wines)</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('wishlist')}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                    >
                      View All <ChevronRight size={13} />
                    </button>
                  </div>

                  {/* Dynamic Real Wishlist Cards */}
                  {liveWishlist.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      {liveWishlist.slice(0, 4).map(w => {
                        const rawWine = WINES.find(item => isWineIdMatch(item.id, w.id))
                        return (
                          <div key={w.id} className="group p-3 rounded-2xl bg-[#1D1619] border border-stone-800/80 hover:border-vino-accent/50 transition-all flex flex-col justify-between">
                            <div className="relative w-full h-28 mb-2 flex items-center justify-center overflow-hidden rounded-xl bg-stone-950/40">
                              <img 
                                src={w.image} 
                                alt={w.name} 
                                className="object-contain h-full max-h-full group-hover:scale-105 transition-transform" 
                              />
                              <button
                                type="button"
                                onClick={async () => {
                                  if (rawWine) {
                                    await toggleWishlist(rawWine)
                                  }
                                }}
                                aria-label="Toggle wishlist"
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-stone-900/90 text-rose-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                              >
                                <Heart size={11} className="fill-rose-400" />
                              </button>
                            </div>

                            <div>
                              <h4 className="font-serif text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                                {w.name}
                              </h4>
                              <p className="text-[10px] text-stone-400 mb-1.5 line-clamp-1">{w.winery}</p>
                              <span className="text-xs font-bold text-stone-200">{w.price}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-8 px-4 rounded-2xl bg-stone-950/40 border border-stone-800/60 flex flex-col items-center justify-center text-center">
                      <PackageOpen className="w-8 h-8 text-stone-600 mb-2" />
                      <p className="text-xs font-medium text-stone-300 mb-1">Your wishlist is currently empty</p>
                      <p className="text-[11px] text-stone-500 mb-3">Save bottles while exploring the wine catalog to track them here.</p>
                      <a
                        href="/discover/wines"
                        className="px-3.5 py-1.5 rounded-xl bg-vino-accent hover:bg-vino-accent-light text-white text-xs font-bold transition-all shadow-sm"
                      >
                        Browse Catalog &rarr;
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Your Coupons & Offers */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#161113] border border-stone-800/90 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Ticket size={18} className="text-amber-400" />
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-white">Coupons & Offers</h3>
                    </div>
                    <span className="text-xs text-amber-400/80 font-medium">2 Active</span>
                  </div>

                  {/* Coupons List */}
                  <div className="space-y-3.5">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-vino-accent/25 via-[#2A0B17] to-[#1D1619] border border-vino-accent/40 relative overflow-hidden">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono font-bold text-amber-300 tracking-wider">
                            VINO10
                          </span>
                          <h4 className="font-serif text-base font-bold text-white mt-1">₹100 OFF</h4>
                          <p className="text-[11px] text-stone-300 leading-tight">on your next wine purchase</p>
                          <p className="text-[9px] text-stone-400 mt-1">Valid for member accounts</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyCode('VINO10')}
                          className="px-3 py-1.5 rounded-xl bg-amber-400 text-stone-950 hover:bg-amber-300 text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-sm"
                        >
                          {copiedCoupon === 'VINO10' ? <Check size={12} /> : <Copy size={12} />}
                          {copiedCoupon === 'VINO10' ? 'Copied!' : 'Copy Code'}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#22170D] to-[#1D1619] border border-amber-500/30 relative overflow-hidden">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono font-bold text-amber-300 tracking-wider">
                            EXPERIENCE20
                          </span>
                          <h4 className="font-serif text-base font-bold text-white mt-1">20% OFF</h4>
                          <p className="text-[11px] text-stone-300 leading-tight">on winery tasting tours</p>
                          <p className="text-[9px] text-stone-400 mt-1">Valid on all estate bookings</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyCode('EXPERIENCE20')}
                          className="px-3 py-1.5 rounded-xl bg-amber-400 text-stone-950 hover:bg-amber-300 text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-sm"
                        >
                          {copiedCoupon === 'EXPERIENCE20' ? <Check size={12} /> : <Copy size={12} />}
                          {copiedCoupon === 'EXPERIENCE20' ? 'Copied!' : 'Copy Code'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: My Cellar (1/2) + Your Wine Journey Timeline (1/2) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* My Cellar Shelf Card */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#161113] border border-stone-800/90 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <WineIcon size={18} className="text-amber-400" />
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-white">My Cellar</h3>
                      <span className="text-xs text-stone-400 ml-1">Your collection</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setActiveTab('cellar')}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                    >
                      View Cellar <ChevronRight size={13} />
                    </button>
                  </div>

                  {/* Real Counters */}
                  <div className="grid grid-cols-4 gap-2 mb-6 p-4 rounded-2xl bg-[#1D1619] border border-stone-800/80 text-center">
                    <div>
                      <span className="font-serif text-xl font-bold text-white block">{totalSavedCount}</span>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider">Total</span>
                    </div>
                    <div>
                      <span className="font-serif text-xl font-bold text-rose-400 block">{liveWishlist.filter(w => w.type?.toLowerCase().includes('red')).length}</span>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider">Reds</span>
                    </div>
                    <div>
                      <span className="font-serif text-xl font-bold text-amber-300 block">{liveWishlist.filter(w => w.type?.toLowerCase().includes('white')).length}</span>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider">Whites</span>
                    </div>
                    <div>
                      <span className="font-serif text-xl font-bold text-pink-300 block">{liveWishlist.filter(w => w.type?.toLowerCase().includes('ros')).length}</span>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider">Rosés</span>
                    </div>
                  </div>

                  {/* Visual Bottle Shelf */}
                  <div className="flex items-end justify-start gap-4 p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 overflow-x-auto">
                    {liveWishlist.slice(0, 3).map((w, idx) => (
                      <div key={idx} className="w-12 h-28 flex items-center justify-center bg-stone-900/50 rounded-xl p-1 shrink-0">
                        <img src={w.image} alt={w.name} className="h-full object-contain" />
                      </div>
                    ))}

                    <a
                      href="/discover/wines"
                      className="w-24 h-28 rounded-xl border-2 border-dashed border-stone-700/80 hover:border-amber-400/60 text-stone-400 hover:text-amber-300 flex flex-col items-center justify-center gap-1.5 transition-all group shrink-0"
                    >
                      <Plus size={20} className="group-hover:scale-110 transition-transform text-amber-400" />
                      <span className="text-[10px] font-bold">Add a Wine</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Your Wine Journey Interactive Timeline */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#161113] border border-stone-800/90 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Compass size={18} className="text-amber-400" />
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-white">Your Wine Journey</h3>
                    </div>
                    <span className="text-xs text-stone-400">{initialJourney.length > 0 ? 'Live Timeline' : 'Starting Out'}</span>
                  </div>

                  {/* Dynamic Real Journey Timeline */}
                  {initialJourney.length > 0 ? (
                    <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-800">
                      {initialJourney.map(item => (
                        <div key={item.id} className="relative">
                          <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-[#161113] ${
                            item.iconType === 'wishlist' ? 'bg-rose-400' : item.iconType === 'rated' ? 'bg-amber-400' : 'bg-emerald-400'
                          }`} />
                          <div className="flex items-start justify-between gap-2 text-xs">
                            <div>
                              <p className="font-semibold text-white">{item.title}</p>
                            </div>
                            <span className="text-[10px] text-stone-500 whitespace-nowrap">{item.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 px-4 rounded-2xl bg-stone-950/40 border border-stone-800/60 flex flex-col items-center justify-center text-center">
                      <History className="w-8 h-8 text-stone-600 mb-2" />
                      <p className="text-xs font-medium text-stone-300 mb-1">Your journey starts here</p>
                      <p className="text-[11px] text-stone-500 mb-3">Tastings, wishlist additions, and winery visits will be automatically logged.</p>
                      <a
                        href="/discover/wines"
                        className="px-3.5 py-1.5 rounded-xl bg-vino-accent hover:bg-vino-accent-light text-white text-xs font-bold transition-all shadow-sm"
                      >
                        Start Exploring &rarr;
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-stone-800/80 mt-4 flex items-center justify-between">
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold transition-colors"
                    >
                      <LogOut size={13} />
                      Sign Out of Account
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* ROW 4: Your Experiences (2/3) + Barrel Editorial Quote (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {/* Real Experiences Grid */}
              <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-[#161113] border border-stone-800/90 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-amber-400" />
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-white">Your Experiences</h3>
                      <span className="text-xs text-stone-400 ml-1">({experiences.length} booked)</span>
                    </div>
                    <a href="/experiences" className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors">
                      Explore More <ChevronRight size={13} />
                    </a>
                  </div>

                  {/* Dynamic Experiences */}
                  {experiences.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {experiences.map(exp => (
                        <div key={exp.id} className="group rounded-2xl bg-[#1D1619] border border-stone-800/80 overflow-hidden hover:border-amber-400/40 transition-all flex flex-col">
                          <div className="relative h-28 w-full overflow-hidden">
                            <img 
                              src={exp.image} 
                              alt={exp.winery} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          </div>
                          <div className="p-3 flex flex-col justify-between flex-1">
                            <div>
                              <h4 className="font-serif text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                                {exp.winery}
                              </h4>
                              <p className="text-[11px] text-stone-400">{exp.title}</p>
                            </div>
                            <span className="text-[10px] text-amber-400/80 font-medium mt-2">{exp.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 px-4 rounded-2xl bg-stone-950/40 border border-stone-800/60 flex flex-col items-center justify-center text-center">
                      <Calendar className="w-8 h-8 text-stone-600 mb-2" />
                      <p className="text-xs font-medium text-stone-300 mb-1">No winery experiences booked yet</p>
                      <p className="text-[11px] text-stone-500 mb-3">Book vineyard tours, barrel tastings, and estate masterclasses.</p>
                      <a
                        href="/experiences"
                        className="px-3.5 py-1.5 rounded-xl bg-vino-accent hover:bg-vino-accent-light text-white text-xs font-bold transition-all shadow-sm"
                      >
                        Browse Winery Experiences &rarr;
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Editorial Barrel Cellar Quote */}
              <div className="relative rounded-3xl overflow-hidden min-h-[220px] border border-stone-800/90 shadow-lg group flex flex-col justify-end p-7">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.55]"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=800&auto=format&fit=crop')`
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                <div className="relative z-10 space-y-2">
                  <p className="font-serif italic text-xl sm:text-2xl text-amber-100 font-light leading-snug">
                    &ldquo;Collect experiences, not just bottles.&rdquo;
                  </p>
                  <div className="w-12 h-0.5 bg-amber-400/60" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 4. INLINE EDIT PROFILE & OPTIONAL RECOMMENDATIONS MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-xl rounded-3xl bg-[#181215] border border-stone-700/80 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-white">Edit Your Profile</h3>
                <p className="text-xs text-stone-400">Update your details and personalized taste preferences</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-900 text-stone-400 hover:text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Section 1: Personal Details */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  1. Personal Information
                </span>

                <div>
                  <label className="text-[11px] text-stone-300 font-medium block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full text-xs bg-stone-900/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-300 font-medium block mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs bg-stone-900/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-300 font-medium block mb-1">City (Optional)</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full text-xs bg-stone-900/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-300 font-medium block mb-1">State (Optional)</label>
                    <input
                      type="text"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      placeholder="Maharashtra"
                      className="w-full text-xs bg-stone-900/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-300 font-medium block mb-1">Country *</label>
                    <input
                      type="text"
                      required
                      value={editCountry}
                      onChange={(e) => setEditCountry(e.target.value)}
                      placeholder="India"
                      className="w-full text-xs bg-stone-900/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Optional Recommendation Preferences */}
              <div className="space-y-3 pt-4 border-t border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                    2. Recommendation & Taste Preferences (Optional)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-300 font-medium block mb-1">Preferred Wine Style</label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full text-xs bg-stone-900/90 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Red">Red Wine</option>
                      <option value="White">White Wine</option>
                      <option value="Rosé">Rosé Wine</option>
                      <option value="Sparkling">Sparkling Wine</option>
                      <option value="Dessert">Dessert Wine</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-300 font-medium block mb-1">Sweetness Preference</label>
                    <select
                      value={editSweetness}
                      onChange={(e) => setEditSweetness(e.target.value)}
                      className="w-full text-xs bg-stone-900/90 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Dry">Dry</option>
                      <option value="Semi-dry">Semi-dry</option>
                      <option value="Sweet">Sweet</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-300 font-medium block mb-1">Body Structure</label>
                    <select
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="w-full text-xs bg-stone-900/90 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Light">Light-bodied</option>
                      <option value="Medium">Medium-bodied</option>
                      <option value="Full">Full-bodied</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-300 font-medium block mb-1">Tasting Vibe</label>
                    <select
                      value={editFlavour}
                      onChange={(e) => setEditFlavour(e.target.value)}
                      className="w-full text-xs bg-stone-900/90 border border-stone-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Fruity">Fruity & Berries</option>
                      <option value="Rich & smooth">Rich & Smooth</option>
                      <option value="Light & refreshing">Light & Refreshing</option>
                      <option value="Sweet">Sweet & Luscious</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-5 border-t border-stone-800 flex items-center justify-between">
                <a
                  href="/onboarding?mode=edit"
                  className="text-xs text-stone-400 hover:text-amber-300 underline font-medium"
                >
                  Or retake the full taste quiz &rarr;
                </a>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-vino-accent hover:bg-vino-accent-light text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 size={13} className="animate-spin" />}
                    {saveSuccess ? (
                      <span className="flex items-center gap-1 text-emerald-300">
                        <Check size={13} /> Saved!
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
