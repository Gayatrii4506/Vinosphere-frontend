'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, X, Heart, Wine, Filter } from 'lucide-react'
import { wines } from '@/constants/food-pairing/wines'
import { foods } from '@/constants/food-pairing/foods'
import { scorePairing, getTopPairings } from '@/lib/food-pairing/pairingEngine'
import HeroLanding from './HeroLanding'
import { Button } from '@/components/ui/Button'

// Build initial pairings
const initialPairings = wines.map((wine, index) => {
    const topMatch = getTopPairings(wine, foods, 1)[0]
    const food = topMatch ? topMatch.food : foods[index % foods.length]
    const engineResult = topMatch ? { score: topMatch.score, reasons: topMatch.reasons } : scorePairing(wine, food)
    const matchPct = Math.min(99, Math.round(78 + engineResult.score * 2.2))

    return {
        id: index,
        wineId: wine.id,
        foodId: food.id,
        wineName: wine.name,
        winery: wine.winery,
        region: wine.region,
        wineType: wine.type.charAt(0).toUpperCase() + wine.type.slice(1),
        grape: wine.grape,
        description: wine.description,
        body: wine.body.charAt(0).toUpperCase() + wine.body.slice(1),
        taste: wine.flavorNotes || [],
        sweetness: wine.sweetness === 'sweet' ? 3 : wine.sweetness === 'off-dry' ? 2 : 0,
        price: wine.price,
        rating: wine.rating,
        servingTemp: wine.servingTemp,
        country: wine.country,
        flag: wine.flag,
        wineImg: wine.wineImg || `/images/${wine.id}.png`,
        dishName: food.name,
        dishImg: food.dishImg || "/images/dish_isolated.png",
        foodTags: [food.cookingMethod, food.richness + " richness"],
        foodPref: ["Non-Vegetarian"], // default for mock
        cuisine: "Culinary Pair",
        spiceLevel: food.spiceLevel === 'high' ? 3 : food.spiceLevel === 'medium' ? 2 : 1,
        occasion: "Fine Dining",
        mealType: ["Dinner"],
        pairingScore: matchPct,
        matchRating: matchPct >= 90 ? "Excellent Match" : "Good Harmony",
        indianPairings: engineResult.reasons[0] || "Classic sommelier match.",
        reasons: engineResult.reasons,
        wineObj: wine,
        foodObj: food
    }
})

const foodOptions = ["Chicken", "Lamb & Mutton", "Seafood", "Spicy Curries", "Biryani", "Tandoori", "Salads", "Cheese", "Desserts", "Pasta", "BBQ", "Vegetarian"]
const grapeOptions = ["Cabernet Sauvignon", "Shiraz", "Sauvignon Blanc", "Chenin Blanc", "Sangiovese", "Chardonnay", "Tempranillo", "Pinot Noir", "Syrah", "Malbec", "Riesling", "Merlot"]
const wineTypeOptions = ["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified"]
const flavourProfiles = ["Fruity", "Spicy", "Earthy", "Citrus", "Floral", "Bold", "Smooth", "Dry", "Sweet"]

export default function FoodPairingApp() {
    const [showCatalog, setShowCatalog] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("default")

    // Pill filters
    const [selectedFood, setSelectedFood] = useState<string[]>([])
    const [selectedGrapes, setSelectedGrapes] = useState<string[]>([])
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])

    // Sidebar filters
    const [budget, setBudget] = useState(3500)
    const [selectedFlavours, setSelectedFlavours] = useState<string[]>([])
    
    // Selection state
    const [selectedPairing, setSelectedPairing] = useState<any>(null)
    const [favorites, setFavorites] = useState<number[]>([])

    const filteredPairings = useMemo(() => {
        return initialPairings.filter(wine => {
            if (searchQuery.trim() !== "") {
                const q = searchQuery.toLowerCase()
                const matches = wine.wineName.toLowerCase().includes(q) ||
                    wine.winery.toLowerCase().includes(q) ||
                    wine.grape.toLowerCase().includes(q) ||
                    wine.dishName.toLowerCase().includes(q) ||
                    wine.region.toLowerCase().includes(q)
                if (!matches) return false
            }

            if (selectedFood.length > 0) {
                const matches = wine.foodTags.some(tag => selectedFood.includes(tag))
                if (!matches) return false
            }

            if (selectedGrapes.length > 0) {
                const matches = selectedGrapes.some(g => wine.grape.toLowerCase().includes(g.toLowerCase()))
                if (!matches) return false
            }

            if (selectedTypes.length > 0) {
                if (!selectedTypes.includes(wine.wineType)) return false
            }

            if (selectedFlavours.length > 0) {
                const matches = wine.taste.some((t: string) => selectedFlavours.includes(t))
                if (!matches) return false
            }

            if (wine.price > budget) return false

            return true
        })
    }, [searchQuery, selectedFood, selectedGrapes, selectedTypes, selectedFlavours, budget])

    const sortedPairings = useMemo(() => {
        return [...filteredPairings].sort((a, b) => {
            if (sortBy === "rating") return b.rating - a.rating
            if (sortBy === "price-asc") return a.price - b.price
            if (sortBy === "price-desc") return b.price - a.price
            if (sortBy === "name") return a.wineName.localeCompare(b.wineName)
            return 0
        })
    }, [filteredPairings, sortBy])

    const toggleArrayItem = <T,>(item: T, list: T[], setList: (v: T[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item))
        } else {
            setList([...list, item])
        }
    }

    const resetFilters = () => {
        setSearchQuery("")
        setSelectedFood([])
        setSelectedGrapes([])
        setSelectedTypes([])
        setSelectedFlavours([])
        setBudget(3500)
    }

    if (!showCatalog) {
        return <HeroLanding setShowCatalog={setShowCatalog} />
    }

    return (
        <div className="w-full min-h-screen bg-[#FDFBF7] pt-24 pb-20">
            {/* Top Toolbar */}
            <div className="max-w-7xl mx-auto px-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                    <Button variant="outline" size="sm" onClick={() => setShowCatalog(false)}>
                        Back to Home
                    </Button>
                    <select 
                        className="bg-white border border-vino-gold/20 rounded-md px-3 py-2 text-sm font-medium outline-none text-vino-dark"
                        onChange={(e) => {
                            if (e.target.value === 'food') { /* open food modal or similar */ }
                        }}
                    >
                        <option value="">+ Food Pairing</option>
                        {foodOptions.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <select 
                        className="bg-white border border-vino-gold/20 rounded-md px-3 py-2 text-sm font-medium outline-none text-vino-dark"
                    >
                        <option value="">+ Grape</option>
                        {grapeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-vino-brown-light" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search wines, grapes..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-full border border-vino-gold/20 bg-white outline-none focus:border-vino-gold text-sm"
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <aside className="hidden lg:block space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif font-bold text-vino-dark text-lg">Filter Cellar</h3>
                            <button onClick={resetFilters} className="text-xs text-vino-accent font-bold uppercase tracking-wider hover:underline">
                                Reset All
                            </button>
                        </div>

                        {/* Price */}
                        <div className="mb-8">
                            <h4 className="font-bold text-sm text-vino-dark mb-3">Price Range — INR</h4>
                            <div className="flex justify-between text-xs text-vino-brown-light font-bold mb-2">
                                <span>₹500 MIN</span>
                                <span>₹{budget.toLocaleString()} MAX</span>
                            </div>
                            <input 
                                type="range" 
                                min="500" max="3500" step="50" 
                                value={budget}
                                onChange={e => setBudget(parseInt(e.target.value))}
                                className="w-full accent-vino-accent"
                            />
                        </div>

                        {/* Wine Type */}
                        <div className="mb-8">
                            <h4 className="font-bold text-sm text-vino-dark mb-3">Wine Type</h4>
                            <div className="space-y-2">
                                {wineTypeOptions.map(type => (
                                    <label key={type} className="flex items-center gap-2 text-sm cursor-pointer hover:text-vino-accent transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedTypes.includes(type)}
                                            onChange={() => toggleArrayItem(type, selectedTypes, setSelectedTypes)}
                                            className="accent-vino-accent"
                                        />
                                        {type}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Flavours */}
                        <div>
                            <h4 className="font-bold text-sm text-vino-dark mb-3">Flavour Profile</h4>
                            <div className="flex flex-wrap gap-2">
                                {flavourProfiles.map(f => (
                                    <button 
                                        key={f}
                                        onClick={() => toggleArrayItem(f, selectedFlavours, setSelectedFlavours)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                                            selectedFlavours.includes(f) 
                                            ? 'bg-vino-accent border-vino-accent text-white' 
                                            : 'bg-white border-vino-gold/20 text-vino-dark hover:border-vino-gold'
                                        }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-medium text-vino-brown-light">
                            Showing <strong className="text-vino-dark">{sortedPairings.length}</strong> of {initialPairings.length} wines
                        </span>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-vino-brown-light">Sort</span>
                            <select 
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="bg-transparent font-bold outline-none border-b border-vino-gold/20 pb-1"
                            >
                                <option value="default">Default</option>
                                <option value="rating">Rating: High to Low</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {sortedPairings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Wine size={48} className="text-vino-gold/50 mb-4" />
                            <h3 className="font-serif text-2xl text-vino-dark mb-2">No wines match your filters</h3>
                            <p className="text-vino-brown-light mb-6">Try adjusting your budget or selecting different flavor profiles.</p>
                            <Button onClick={resetFilters} variant="outline">Reset Filters</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sortedPairings.map(wine => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={wine.id}
                                    onClick={() => setSelectedPairing(wine)}
                                    className="bg-white rounded-2xl p-4 border border-vino-gold/10 shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-4 relative group"
                                >
                                    <div className="w-24 h-32 shrink-0 bg-[#FDFBF7] rounded-xl flex items-center justify-center p-2 relative overflow-hidden">
                                        <img src={wine.wineImg} alt={wine.wineName} className="object-contain h-full mix-blend-multiply" />
                                    </div>
                                    <div className="flex flex-col flex-1 py-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-vino-gold mb-1">{wine.wineType}</span>
                                        <h4 className="font-serif font-bold text-vino-dark text-lg leading-tight mb-1">{wine.wineName}</h4>
                                        <span className="text-xs text-vino-brown-light mb-2">{wine.region} · {wine.grape}</span>
                                        
                                        <div className="mt-auto flex items-end justify-between">
                                            <div>
                                                <span className="text-xs text-vino-brown-light block uppercase tracking-wider mb-0.5">Average</span>
                                                <span className="font-bold text-vino-accent">₹{wine.price}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm font-bold text-vino-dark">
                                                ★ {wine.rating}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleArrayItem(wine.id, favorites, setFavorites); }}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-sm border border-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Heart size={16} className={favorites.includes(wine.id) ? "fill-vino-accent text-vino-accent" : "text-vino-brown-light"} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedPairing && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedPairing(null)}
                            className="fixed inset-0 z-[100] bg-vino-darker/60"
                        />
                        <motion.div 
                            initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[101] w-full max-w-2xl bg-white md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
                        >
                            {/* Images Pane */}
                            <div className="w-full md:w-2/5 bg-[#FDFBF7] relative min-h-[250px] md:min-h-full flex items-center justify-center p-8">
                                <img src={selectedPairing.dishImg} alt={selectedPairing.dishName} className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-multiply" />
                                <img src={selectedPairing.wineImg} alt={selectedPairing.wineName} className="relative z-10 h-48 md:h-64 object-contain mix-blend-multiply drop-shadow-xl" />
                            </div>

                            {/* Details Pane */}
                            <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto">
                                <button onClick={() => setSelectedPairing(null)} className="absolute top-4 right-4 p-2 bg-black/5 rounded-full hover:bg-black/10 transition-colors">
                                    <X size={20} />
                                </button>

                                <span className="text-xs font-bold uppercase tracking-widest text-vino-gold mb-1 block">
                                    {selectedPairing.winery}
                                </span>
                                <h2 className="font-serif text-3xl font-bold text-vino-dark mb-1">
                                    {selectedPairing.wineName}
                                </h2>
                                <h3 className="text-lg font-medium text-vino-brown-light mb-6">
                                    Paired with <span className="font-bold text-vino-accent">{selectedPairing.dishName}</span>
                                </h3>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-[#FDFBF7] p-3 rounded-xl border border-vino-gold/10">
                                        <span className="text-[10px] uppercase font-bold text-vino-brown-light block mb-1">Pairing Match</span>
                                        <span className="font-bold text-vino-accent">{selectedPairing.pairingScore}%</span>
                                    </div>
                                    <div className="bg-[#FDFBF7] p-3 rounded-xl border border-vino-gold/10">
                                        <span className="text-[10px] uppercase font-bold text-vino-brown-light block mb-1">Price</span>
                                        <span className="font-bold text-vino-dark">₹{selectedPairing.price}</span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="font-bold text-vino-dark text-sm mb-2 flex items-center gap-2">
                                        <Wine size={16} className="text-vino-gold" />
                                        AI Sommelier Notes
                                    </h4>
                                    <p className="text-sm text-vino-brown-light leading-relaxed mb-3">
                                        <strong>{selectedPairing.indianPairings}</strong>
                                    </p>
                                    <ul className="list-disc pl-4 text-xs text-vino-brown-light space-y-1">
                                        {selectedPairing.reasons.map((r: string, i: number) => (
                                            <li key={i}>{r}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-bold text-vino-dark text-sm mb-3">Flavor Profile</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedPairing.taste.map((t: string) => (
                                            <span key={t} className="px-2.5 py-1 bg-vino-accent/10 text-vino-accent rounded-md text-[10px] uppercase font-bold tracking-wider">
                                                {t}
                                            </span>
                                        ))}
                                        {selectedPairing.foodTags.map((t: string) => (
                                            <span key={t} className="px-2.5 py-1 bg-vino-gold/10 text-vino-gold rounded-md text-[10px] uppercase font-bold tracking-wider">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
