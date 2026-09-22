'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    ChevronDown,
    ChevronUp,
    X,
    Heart,
    Wine,
    Utensils,
    Sparkles,
    SlidersHorizontal,
    RotateCcw,
    Loader2,
    Info,
    CheckCircle2,
    Flame,
    ArrowRight,
    GlassWater,
    Thermometer,
    Calendar,
    Lightbulb,
} from 'lucide-react'
import { wines as staticWines } from '@/constants/food-pairing/wines'
import { foods as staticFoods } from '@/constants/food-pairing/foods'
import { scorePairing, getTopPairings } from '@/lib/food-pairing/pairingEngine'
import {
    getCategories,
    getFoods,
    fetchFoodRecommendations,
    fetchWineRecommendations,
    FoodCategoryItem,
    WineRecommendation,
    FoodRecommendation,
    resolveWineCloudinaryImage,
} from '@/lib/food-pairing/recommendationApi'
import HeroLanding from './HeroLanding'
import { Button } from '@/components/ui/Button'

// Fallback images
const FALLBACK_DISH_IMG = '/images/dish_isolated.png'
const FALLBACK_WINE_IMG = '/images/wine_isolated.png'

// Build local catalog fallback
const initialPairings = staticWines.map((wine, index) => {
    const topMatch = getTopPairings(wine, staticFoods, 1)[0]
    const food = topMatch ? topMatch.food : staticFoods[index % staticFoods.length]
    const engineResult = topMatch ? { score: topMatch.score, reasons: topMatch.reasons } : scorePairing(wine, food)
    const matchPct = Math.min(99, Math.round(78 + engineResult.score * 2.2))

    return {
        id: `local-${index}`,
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
        sweetnessLabel: wine.sweetness || 'dry',
        acidity: wine.acidity || 'Medium',
        tannin: wine.tannin || 'Medium',
        price: wine.price,
        rating: wine.rating,
        servingTemp: wine.servingTemp,
        country: wine.country,
        flag: wine.flag,
        wineImg: wine.wineImg && !wine.wineImg.includes('wine_isolated') ? wine.wineImg : resolveWineCloudinaryImage(wine.name, wine.type),
        dishName: food.name,
        dishImg: food.dishImg || FALLBACK_DISH_IMG,
        foodTags: [food.cookingMethod, food.richness + ' richness'],
        foodPref: ['Non-Vegetarian'],
        cuisine: 'Curated Pairing',
        spiceLevel: food.spiceLevel === 'high' ? 3 : food.spiceLevel === 'medium' ? 2 : 1,
        occasion: 'Fine Dining',
        mealType: ['Dinner'],
        pairingScore: matchPct,
        matchRating: matchPct >= 90 ? 'Excellent Match' : 'Good Harmony',
        indianPairings: engineResult.reasons[0] || 'Classic sommelier match.',
        reasons: engineResult.reasons,
        wineObj: wine,
        foodObj: food,
        _source: 'local',
    }
})

function mapApiRec(rec: WineRecommendation, index: number, selectedDishName: string) {
    const bodyStr = (rec.body || '').toLowerCase()
    const sweetnessStr = (rec.sweetness || '').toLowerCase()
    const sweetnessNum =
        sweetnessStr === 'sweet' ? 3 :
        sweetnessStr === 'off-dry' ? 2 :
        sweetnessStr === 'medium' ? 1 : 0

    const matchPct = Math.min(99, Math.round((rec.score || 0.85) * 100))
    const wineImg = rec.image_url && rec.image_url.trim() && !rec.image_url.includes('wine_isolated') ? rec.image_url.trim() : resolveWineCloudinaryImage(rec.wine_name || '', rec.wine_type || '')

    return {
        id: `api-${index}`,
        wineName: rec.wine_name || 'Curated Estate Wine',
        winery: rec.winery || 'Selected Winery',
        region: rec.region || 'Premier Wine Region',
        wineType: rec.wine_type ? rec.wine_type.charAt(0).toUpperCase() + rec.wine_type.slice(1) : 'Wine',
        grape: rec.variety || '',
        description: [
            rec.body ? `Body: ${rec.body}` : '',
            rec.acidity ? `Acidity: ${rec.acidity}` : '',
            rec.tannin ? `Tannin: ${rec.tannin}` : '',
        ].filter(Boolean).join(' · ') || 'Recommended by sommelier pairing engine based on flavor affinity.',
        body: rec.body ? rec.body.charAt(0).toUpperCase() + rec.body.slice(1) : 'Medium',
        acidity: rec.acidity || 'Medium',
        tannin: rec.tannin || 'Medium',
        taste: ['Balanced', 'Aromatic'],
        sweetness: sweetnessNum,
        sweetnessLabel: rec.sweetness || 'Dry',
        price: rec.price || 1800,
        rating: rec.rating || 4.5,
        servingTemp: rec.serving_temp || '12-16°C',
        country: 'India / International',
        flag: '',
        wineImg,
        dishName: selectedDishName,
        dishImg: FALLBACK_DISH_IMG,
        foodTags: ['AI Recommended', 'Flavor Matched'],
        foodPref: ['Gourmet'],
        cuisine: 'Culinary Pairing',
        spiceLevel: 2,
        occasion: 'Sommelier Recommended',
        mealType: ['Dinner'],
        pairingScore: matchPct,
        matchRating: matchPct >= 90 ? 'Exceptional Match' : matchPct >= 80 ? 'Very High Affinity' : 'Harmonious Pairing',
        indianPairings: `AI-ranked pairing score: ${matchPct}%`,
        reasons: [
            rec.body ? `Body: ${rec.body}` : null,
            rec.sweetness ? `Sweetness: ${rec.sweetness}` : null,
            rec.acidity ? `Acidity: ${rec.acidity}` : null,
            rec.tannin ? `Tannin: ${rec.tannin}` : null,
        ].filter(Boolean) as string[],
        _source: 'api',
    }
}

function generatePairingExplanation(wine: any, dishName: string) {
    const body = (wine.body || 'medium').toLowerCase()
    const acidity = (wine.acidity || 'medium').toLowerCase()
    const tannin = (wine.tannin || 'medium').toLowerCase()
    const type = (wine.wineType || 'Wine').toLowerCase()
    const sweetness = (wine.sweetnessLabel || 'dry').toLowerCase()

    const whyWine = type.includes('white')
        ? `${wine.wineName} is a ${body}-bodied white wine that beautifully balances the richness of ${dishName || 'your dish'} without overpowering it. Its crisp character and aromatic freshness make it an ideal pairing.`
        : type.includes('ros')
        ? `${wine.wineName} offers the refreshing balance of a rosé — enough body to elevate ${dishName || 'your dish'}, while remaining versatile and palate-cleansing.`
        : `${wine.wineName} is a ${body}-bodied red wine whose depth, fruit notes, and structure harmonize with ${dishName || 'your dish'}, rounding out every bite.`

    const servingTemp = type.includes('white') || type.includes('ros')
        ? '8–12°C (Chilled)'
        : type.includes('sparkling')
        ? '6–8°C (Well Chilled)'
        : '16–18°C (Slightly below room temperature)'

    const occasion = body === 'full'
        ? 'Celebratory dinners, formal banquets, or weekend culinary feasts'
        : body === 'light'
        ? 'Casual dining, outdoor gatherings, or light gourmet lunches'
        : 'Intimate dinners, family feasts, or fine dining experiences'

    const perfectWith = dishName
        ? `${dishName}, as well as related regional recipes with harmonious spice and richness levels.`
        : 'Flavourful culinary courses with balanced richness and aromatic spice notes.'

    const chefTip = acidity === 'high'
        ? `Serve alongside a touch of fresh citrus or herbs over ${dishName || 'the dish'} — high acidity highlights freshness and cleanses the palate.`
        : tannin === 'high'
        ? `Pair with rich culinary proteins or buttery textures — natural fats soften tannins and create a velvety finish.`
        : sweetness === 'off-dry' || sweetness === 'sweet'
        ? `The gentle sweetness offsets spices and aromatic heat effortlessly. Serve slightly chilled for optimal taste.`
        : `Allow the wine to aerate in the glass for 5-10 minutes to release its complete aromatic bouquet before tasting.`

    return { whyWine, servingTemp, occasion, perfectWith, chefTip }
}

const grapeOptions = [
    'Cabernet Sauvignon',
    'Shiraz',
    'Sauvignon Blanc',
    'Chenin Blanc',
    'Sangiovese',
    'Chardonnay',
    'Tempranillo',
    'Pinot Noir',
    'Syrah',
    'Malbec',
    'Riesling',
    'Merlot',
]
const wineTypeOptions = ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert']
const flavourProfiles = ['Fruity', 'Spicy', 'Earthy', 'Citrus', 'Floral', 'Bold', 'Smooth', 'Dry', 'Sweet']

export default function FoodPairingApp() {
    const [showCatalog, setShowCatalog] = useState(true)
    const [pairingMode, setPairingMode] = useState<'foodToWine' | 'wineToFood'>('foodToWine')

    // AI Food -> Wine State
    const [categories, setCategories] = useState<string[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [dishes, setDishes] = useState<FoodCategoryItem[]>([])
    const [showAllDishes, setShowAllDishes] = useState(false)
    const [selectedDish, setSelectedDish] = useState<string>('')
    const [customDishInput, setCustomDishInput] = useState<string>('')
    const [apiRecommendations, setApiRecommendations] = useState<WineRecommendation[]>([])
    
    // AI Wine -> Food State
    const [selectedWineForFood, setSelectedWineForFood] = useState<string>('')
    const [customWineInput, setCustomWineInput] = useState<string>('')
    const [foodRecResults, setFoodRecResults] = useState<FoodRecommendation[]>([])
    const [wineList, setWineList] = useState<string[]>([])

    // Status
    const [loadingCategories, setLoadingCategories] = useState(false)
    const [loadingDishes, setLoadingDishes] = useState(false)
    const [isRecommending, setIsRecommending] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)

    // Filters & UI
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('default')
    const [selectedGrapes, setSelectedGrapes] = useState<string[]>([])
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [selectedFlavours, setSelectedFlavours] = useState<string[]>([])
    const [budget, setBudget] = useState(4500)

    // Modals & Favs
    const [selectedPairing, setSelectedPairing] = useState<any>(null)
    const [sommelierModalWine, setSommelierModalWine] = useState<any>(null)
    const [favorites, setFavorites] = useState<string[]>([])

    // Lock body scroll when sommelier modal is active
    useEffect(() => {
        if (sommelierModalWine) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [sommelierModalWine])

    // 1. Fetch categories on mount
    useEffect(() => {
        let isMounted = true
        async function fetchCats() {
            setLoadingCategories(true)
            try {
                const cats = await getCategories()
                if (isMounted && cats.length > 0) {
                    setCategories(cats)
                    setSelectedCategory(cats[0])
                }
            } catch (err: any) {
                console.warn('Backend categories fetch notice:', err.message)
                // Fallback categories if API is starting up
                if (isMounted) {
                    setCategories(['Chicken', 'Biryani', 'Curry', 'Paneer', 'Seafood', 'Lamb & Mutton', 'Tandoori', 'Vegetarian'])
                    setSelectedCategory('Chicken')
                }
            } finally {
                if (isMounted) setLoadingCategories(false)
            }
        }
        fetchCats()
        return () => { isMounted = false }
    }, [])

    // 2. Fetch dishes when category changes
    useEffect(() => {
        if (!selectedCategory) return
        let isMounted = true
        async function fetchDishesForCat() {
            setLoadingDishes(true)
            setApiError(null)
            setShowAllDishes(false)
            try {
                const dishList = await getFoods(selectedCategory)
                if (isMounted) {
                    setDishes(dishList)
                    if (dishList.length > 0) {
                        const firstDishName = dishList[0].food_name
                        setSelectedDish(firstDishName)
                        loadWineRecommendations(firstDishName)
                    }
                }
            } catch (err: any) {
                console.warn('Dishes fetch error:', err.message)
                if (isMounted) {
                    setDishes([])
                }
            } finally {
                if (isMounted) setLoadingDishes(false)
            }
        }
        fetchDishesForCat()
        return () => { isMounted = false }
    }, [selectedCategory])

    // Helper: Trigger food -> wine recommendation
    async function loadWineRecommendations(dishName: string) {
        if (!dishName.trim()) return
        setIsRecommending(true)
        setApiError(null)
        try {
            const recs = await fetchFoodRecommendations(dishName)
            setApiRecommendations(recs)
        } catch (err: any) {
            const errMsg = err?.message || ''
            if (errMsg.includes('Invalid food name')) {
                setApiError(errMsg)
            } else {
                console.warn('Recommendation API notice:', errMsg)
                setApiError('Unable to connect to recommendation engine. Displaying sommelier curated cellar matches.')
            }
            setApiRecommendations([])
        }
 finally {
            setIsRecommending(false)
        }
    }

    // Helper: Trigger wine -> food recommendation
    async function loadFoodRecommendations(wineName: string) {
        if (!wineName.trim()) return
        setIsRecommending(true)
        setApiError(null)
        try {
            const recs = await fetchWineRecommendations(wineName)
            setFoodRecResults(recs)
        } catch (err: any) {
            console.error('Failed to get food recommendations:', err)
            setApiError('Unable to compute food pairings for this wine. Please try another selection.')
            setFoodRecResults([])
        } finally {
            setIsRecommending(false)
        }
    }

    // Dynamic pairings display
    const activePairings = useMemo(() => {
        if (pairingMode === 'foodToWine' && apiRecommendations.length > 0) {
            return apiRecommendations.map((rec, i) => mapApiRec(rec, i, selectedDish || customDishInput || 'Culinary Dish'))
        }
        return initialPairings
    }, [pairingMode, apiRecommendations, selectedDish, customDishInput])

    // Filter & sort
    const filteredPairings = useMemo(() => {
        return activePairings.filter(wine => {
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase()
                const matches =
                    wine.wineName.toLowerCase().includes(q) ||
                    wine.winery.toLowerCase().includes(q) ||
                    wine.grape.toLowerCase().includes(q) ||
                    wine.dishName.toLowerCase().includes(q) ||
                    wine.region.toLowerCase().includes(q)
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
    }, [activePairings, searchQuery, selectedGrapes, selectedTypes, selectedFlavours, budget])

    const sortedPairings = useMemo(() => {
        return [...filteredPairings].sort((a, b) => {
            if (sortBy === 'rating') return b.rating - a.rating
            if (sortBy === 'price-asc') return a.price - b.price
            if (sortBy === 'price-desc') return b.price - a.price
            if (sortBy === 'score') return b.pairingScore - a.pairingScore
            if (sortBy === 'name') return a.wineName.localeCompare(b.wineName)
            return 0
        })
    }, [filteredPairings, sortBy])

    const toggleArrayItem = <T,>(item: T, list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item))
        } else {
            setList([...list, item])
        }
    }

    const resetFilters = () => {
        setSearchQuery('')
        setSelectedGrapes([])
        setSelectedTypes([])
        setSelectedFlavours([])
        setBudget(4500)
        setSortBy('default')
    }

    if (!showCatalog) {
        return <HeroLanding setShowCatalog={setShowCatalog} />
    }

    return (
        <div className="w-full min-h-screen bg-[#FAF7F2] pt-24 pb-24 text-[#2C2523]">
            {/* Header Hero Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="bg-gradient-to-r from-[#7B1E3A] via-[#8B1E3F] to-[#5C1428] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">

                    <div className="relative z-10 max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-amber-200 mb-4 border border-white/20">
                            <Sparkles size={14} className="text-amber-300 animate-pulse" />
                            SOMMELIER-GUIDED PAIRING ENGINE
                        </div>

                        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight text-white">
                            Food & Wine Pairing
                        </h1>

                        <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                            Compute culinary compatibility scores using structured taste attributes and sommelier pairing principles. Evaluate spices, richness, acidity, and tannins.
                        </p>

                        {/* Mode Switcher Tabs */}
                        <div className="inline-flex p-1.5 bg-black/25 backdrop-blur-md rounded-2xl border border-white/15 gap-2">
                            <button
                                onClick={() => setPairingMode('foodToWine')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                                    pairingMode === 'foodToWine'
                                        ? 'bg-white text-[#7B1E3A] shadow-md'
                                        : 'text-white/80 hover:text-white'
                                }`}
                            >
                                <Utensils size={15} />
                                Food → Wine Recommender
                            </button>

                            <button
                                onClick={() => setPairingMode('wineToFood')}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                                    pairingMode === 'wineToFood'
                                        ? 'bg-white text-[#7B1E3A] shadow-md'
                                        : 'text-white/80 hover:text-white'
                                }`}
                            >
                                <Wine size={15} />
                                Wine → Food Matcher
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Mode 1: Food → Wine Interactive Recommender Bar ─── */}
            {pairingMode === 'foodToWine' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-md">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-100">
                            <div>
                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1E1610] flex items-center gap-2">
                                    <Utensils size={20} className="text-[#8B1E3F]" />
                                    Step 1: Choose Food Category
                                </h2>
                                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                                    Select a cuisine group from our curated catalogue of 499+ dishes
                                </p>
                            </div>

                            {/* Custom Dish Search Box */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    if (customDishInput.trim()) {
                                        setSelectedDish(customDishInput.trim())
                                        loadWineRecommendations(customDishInput.trim())
                                    }
                                }}
                                className="flex items-center gap-2 w-full md:w-80"
                            >
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Type custom dish (e.g. Butter Chicken)..."
                                        value={customDishInput}
                                        onChange={(e) => setCustomDishInput(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-[#8B1E3F] focus:bg-white transition-all"
                                    />
                                </div>
                                <Button type="submit" size="sm" className="bg-[#8B1E3F] hover:bg-[#721532] text-white shrink-0">
                                    Match
                                </Button>
                            </form>
                        </div>

                        {/* Category Pills */}
                        <div className="pt-6">
                            {loadingCategories ? (
                                <div className="flex items-center gap-2 text-stone-500 text-xs py-3">
                                    <Loader2 size={16} className="animate-spin text-[#8B1E3F]" />
                                    Loading categories...
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2.5">
                                    {categories.map((cat, idx) => (
                                        <button
                                            key={`${cat}-${idx}`}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                                                selectedCategory === cat
                                                    ? 'bg-[#8B1E3F] text-white shadow-sm ring-2 ring-[#8B1E3F]/30 scale-[1.02]'
                                                    : 'bg-stone-100/80 hover:bg-stone-200/80 text-stone-700'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Step 2: Dish Selection from Category */}
                        {selectedCategory && (
                            <div className="pt-6 mt-6 border-t border-stone-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-serif text-lg font-bold text-[#1E1610] flex items-center gap-2">
                                        <CheckCircle2 size={18} className="text-emerald-600" />
                                        Step 2: Pick a Dish in &ldquo;{selectedCategory}&rdquo;
                                    </h3>
                                    {dishes.length > 0 && (
                                        <span className="text-xs text-stone-500 font-medium">
                                            {dishes.length} dishes available
                                        </span>
                                    )}
                                </div>

                                {loadingDishes ? (
                                    <div className="flex items-center gap-2 text-stone-500 text-xs py-4">
                                        <Loader2 size={16} className="animate-spin text-[#8B1E3F]" />
                                        Loading dishes in {selectedCategory}...
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                        {(showAllDishes ? dishes : dishes.slice(0, 6)).map((d, idx) => (
                                            <button
                                                key={`${d.food_name}-${idx}`}
                                                onClick={() => {
                                                    setSelectedDish(d.food_name)
                                                    setCustomDishInput('')
                                                    loadWineRecommendations(d.food_name)
                                                }}
                                                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 ${
                                                    selectedDish === d.food_name
                                                        ? 'border-[#8B1E3F] bg-[#8B1E3F]/5 ring-2 ring-[#8B1E3F]/20 shadow-sm'
                                                        : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
                                                }`}
                                            >
                                                <div className="font-bold text-xs sm:text-sm text-stone-800 line-clamp-2 mb-1">
                                                    {d.food_name}
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2">
                                                    <span>{d.cuisine || selectedCategory}</span>
                                                    {d.spice_level && (
                                                        <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                                                            <Flame size={11} /> {d.spice_level}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {!loadingDishes && dishes.length > 6 && (
                                    <div className="mt-6 flex justify-center">
                                        <button
                                            onClick={() => setShowAllDishes(!showAllDishes)}
                                            className="inline-flex items-center gap-2 text-xs font-bold text-[#8B1E3F] border border-[#8B1E3F]/40 hover:border-[#8B1E3F] bg-[#8B1E3F]/5 hover:bg-[#8B1E3F] hover:text-white transition-all duration-200 px-6 py-2.5 rounded-xl shadow-xs group"
                                        >
                                            {showAllDishes ? (
                                                <>
                                                    <ChevronUp size={15} className="group-hover:-translate-y-0.5 transition-transform" />
                                                    Show Less Dishes
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown size={15} className="group-hover:translate-y-0.5 transition-transform" />
                                                    Show More Dishes ({dishes.length - 6} more)
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── Mode 2: Wine → Food Interactive Matcher ─── */}
            {pairingMode === 'wineToFood' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-md">
                        <div className="pb-6 border-b border-stone-100">
                            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1E1610] flex items-center gap-2">
                                <Wine size={20} className="text-[#8B1E3F]" />
                                Wine → Food Sommelier Pairing
                            </h2>
                            <p className="text-xs sm:text-sm text-stone-500 mt-1">
                                Select or enter any wine from your cellar to find dishes that complement its structure, acidity & aromas
                            </p>
                        </div>

                        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                                    Select from Featured Wines
                                </label>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {staticWines.map((w, idx) => (
                                        <button
                                            key={`${w.id}-${idx}`}
                                            onClick={() => {
                                                setSelectedWineForFood(w.name)
                                                setCustomWineInput('')
                                                loadFoodRecommendations(w.name)
                                            }}
                                            className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                                                selectedWineForFood === w.name
                                                    ? 'border-[#8B1E3F] bg-[#8B1E3F]/5 font-bold text-[#8B1E3F]'
                                                    : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                                            }`}
                                        >
                                            <div>
                                                <div className="text-xs sm:text-sm font-semibold">{w.name}</div>
                                                <div className="text-[11px] text-stone-400 font-normal">{w.winery} · {w.type}</div>
                                            </div>
                                            <ArrowRight size={14} className="text-stone-400" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                                    Or Type Any Wine / Grape
                                </label>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        if (customWineInput.trim()) {
                                            setSelectedWineForFood(customWineInput.trim())
                                            loadFoodRecommendations(customWineInput.trim())
                                        }
                                    }}
                                    className="flex gap-2"
                                >
                                    <input
                                        type="text"
                                        placeholder="e.g. Sula Dindori Reserve Shiraz..."
                                        value={customWineInput}
                                        onChange={(e) => setCustomWineInput(e.target.value)}
                                        className="flex-1 px-4 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-[#8B1E3F] focus:bg-white"
                                    />
                                    <Button type="submit" size="sm" className="bg-[#8B1E3F] hover:bg-[#721532] text-white">
                                        Find Dishes
                                    </Button>
                                </form>

                                {foodRecResults.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
                                            Top Recommended Dishes for {selectedWineForFood}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {foodRecResults.map((dish, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between"
                                                >
                                                    <div>
                                                        <div className="font-bold text-xs sm:text-sm text-stone-800">{dish.food_name}</div>
                                                        <div className="text-[11px] text-stone-500">{dish.cuisine || dish.category}</div>
                                                    </div>
                                                    <span className="text-xs font-bold text-[#8B1E3F] bg-[#8B1E3F]/10 px-2 py-0.5 rounded-full">
                                                        {Math.round((dish.score || 0.85) * 100)}% Match
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification / Error Banner if any */}
            {apiError && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm">
                        <Info size={18} className="text-amber-600 shrink-0" />
                        <span>{apiError}</span>
                    </div>
                </div>
            )}

            {/* ─── Main Content Grid: Sidebar Filters + Wine Cards ─── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Active Match Status Heading */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
                    <div>
                        <span className="text-xs font-bold text-[#8B1E3F] tracking-widest uppercase block mb-1">
                            {apiRecommendations.length > 0 ? 'AI Live Sommelier Recommendations' : 'Curated Wine Cellar'}
                        </span>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1610]">
                            {selectedDish ? (
                                <>
                                    Top Wine Pairings for <span className="text-[#8B1E3F]">{selectedDish}</span>
                                </>
                            ) : (
                                'Explore All Wines & Pairings'
                            )}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="text-xs text-stone-500 font-medium">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            aria-label="Sort wines"
                            className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-800 outline-none focus:border-[#8B1E3F]"
                        >
                            <option value="default">AI Score (Best First)</option>
                            <option value="score">Highest Match %</option>
                            <option value="rating">Rating: High to Low</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar Filters */}
                    <aside className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
                                <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                                    <SlidersHorizontal size={16} className="text-[#8B1E3F]" />
                                    Filter Cellar
                                </h3>
                                <button
                                    onClick={resetFilters}
                                    className="text-[11px] text-[#8B1E3F] hover:text-[#721532] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                >
                                    <RotateCcw size={12} /> Reset
                                </button>
                            </div>

                            {/* Search */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                    Search Wines & Grapes
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search wine, grape, region..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs outline-none focus:border-[#8B1E3F] focus:bg-white"
                                    />
                                </div>
                            </div>

                            {/* Budget Slider */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                                        Max Price (INR)
                                    </label>
                                    <span className="text-xs font-bold text-[#8B1E3F]">₹{budget.toLocaleString()}</span>
                                </div>
                                <input
                                    type="range"
                                    min="500"
                                    max="6000"
                                    step="100"
                                    value={budget}
                                    onChange={(e) => setBudget(parseInt(e.target.value))}
                                    className="w-full accent-[#8B1E3F]"
                                />
                                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                                    <span>₹500</span>
                                    <span>₹6,000+</span>
                                </div>
                            </div>

                            {/* Wine Type Filter */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                    Wine Style
                                </label>
                                <div className="space-y-1.5">
                                    {wineTypeOptions.map((type, idx) => (
                                        <label
                                            key={`${type}-${idx}`}
                                            className="flex items-center gap-2.5 text-xs text-stone-700 hover:text-[#8B1E3F] cursor-pointer py-1"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedTypes.includes(type)}
                                                onChange={() => toggleArrayItem(type, selectedTypes, setSelectedTypes)}
                                                className="rounded border-stone-300 text-[#8B1E3F] focus:ring-[#8B1E3F] accent-[#8B1E3F]"
                                            />
                                            <span>{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Grape Varieties */}
                            <div>
                                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                                    Grape Varieties
                                </label>
                                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                    {grapeOptions.map((grape, idx) => (
                                        <button
                                            key={`${grape}-${idx}`}
                                            onClick={() => toggleArrayItem(grape, selectedGrapes, setSelectedGrapes)}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                                                selectedGrapes.includes(grape)
                                                    ? 'bg-[#8B1E3F] text-white shadow-sm'
                                                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                                            }`}
                                        >
                                            {grape}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Wine Pairing Cards Grid */}
                    <main className="lg:col-span-3">
                        {isRecommending ? (
                            <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-center border border-stone-200 shadow-sm">
                                <Loader2 size={40} className="animate-spin text-[#8B1E3F] mb-4" />
                                <h3 className="font-serif text-xl font-bold text-stone-800 mb-1">
                                    Analyzing Flavour Chemistry...
                                </h3>
                                <p className="text-xs text-stone-500 max-w-sm">
                                    Evaluating acidity, spice thresholds, tannins, and aroma harmonies with our sommelier pairing engine.
                                </p>
                            </div>
                        ) : sortedPairings.length === 0 ? (
                            <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-center border border-stone-200">
                                <Wine size={48} className="text-stone-300 mb-4" />
                                <h3 className="font-serif text-xl font-bold text-stone-800 mb-2">
                                    No Wines Match Your Filters
                                </h3>
                                <p className="text-xs text-stone-500 max-w-sm mb-6">
                                    Try adjusting your budget or clearing grape and style filters.
                                </p>
                                <Button onClick={resetFilters} size="sm" variant="outline">
                                    Reset Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sortedPairings.map((wine, idx) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25, delay: idx * 0.05 }}
                                        key={`${wine.id}-${idx}`}
                                        className="bg-white rounded-3xl p-5 border border-stone-200/90 hover:border-[#8B1E3F]/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
                                    >
                                        {/* Top Card Section: Image + Wine Details */}
                                        <div className="flex gap-4">
                                            {/* Wine Bottle Image */}
                                            <div className="w-24 h-36 bg-[#FAF7F2] rounded-2xl p-2 shrink-0 flex items-center justify-center overflow-hidden border border-stone-100 relative">
                                                <img
                                                    src={wine.wineImg}
                                                    alt={wine.wineName}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = FALLBACK_WINE_IMG
                                                    }}
                                                    className="h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B1E3F] bg-[#8B1E3F]/10 px-2 py-0.5 rounded-full">
                                                            {wine.wineType}
                                                        </span>
                                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                            {wine.pairingScore}% Match
                                                        </span>
                                                    </div>

                                                    <h3 className="font-serif font-bold text-base text-stone-900 leading-snug line-clamp-2">
                                                        {wine.wineName}
                                                    </h3>

                                                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                                                        {wine.winery} · {wine.region}
                                                    </p>

                                                    {wine.grape && (
                                                        <p className="text-[11px] text-stone-400 italic mt-0.5">
                                                            {wine.grape}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-end justify-between pt-2 border-t border-stone-100 mt-2">
                                                    <div>
                                                        <span className="text-[10px] text-stone-400 block font-bold uppercase">Price</span>
                                                        <span className="font-bold text-stone-900 text-sm">₹{wine.price}</span>
                                                    </div>
                                                    <div className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                                                        ★ {wine.rating}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reasons / Sommelier Note snippet */}
                                        <div className="bg-[#FAF7F2] rounded-2xl p-3 mt-4 border border-stone-100">
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8B1E3F] mb-1">
                                                <Sparkles size={12} />
                                                Why This Pairing Works:
                                            </div>
                                            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                                                {wine.description}
                                            </p>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSommelierModalWine(wine)}
                                                className="flex-1 text-xs border-[#8B1E3F] text-[#8B1E3F] hover:bg-[#8B1E3F] hover:text-white rounded-xl py-2 font-semibold"
                                            >
                                                Sommelier Analysis
                                            </Button>

                                            <button
                                                onClick={() => toggleArrayItem(wine.id, favorites, setFavorites)}
                                                className="p-2 rounded-xl border border-stone-200 hover:border-stone-300 text-stone-400 hover:text-[#8B1E3F] transition-colors"
                                                title="Save Pairing"
                                            >
                                                <Heart
                                                    size={16}
                                                    className={favorites.includes(wine.id) ? 'fill-[#8B1E3F] text-[#8B1E3F]' : ''}
                                                />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* ─── Sommelier Analysis Deep Dive Modal ─── */}
            <AnimatePresence>
                {sommelierModalWine && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSommelierModalWine(null)}
                            className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.2 }}
                            className="relative z-10 w-full max-w-2xl max-h-[88vh] bg-white rounded-3xl shadow-2xl overflow-y-auto border border-stone-200/80 p-6 sm:p-8 my-auto"
                        >
                            {/* Modal Header */}
                            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8B1E3F] bg-[#8B1E3F]/10 px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                                        <Sparkles size={13} />
                                        Sommelier Detailed Tasting Report
                                    </div>
                                    <h3 className="font-serif text-2xl font-bold text-stone-900">
                                        {sommelierModalWine.wineName}
                                    </h3>
                                    <p className="text-xs text-stone-500">
                                        Paired with <strong>{selectedDish || sommelierModalWine.dishName || 'Selected Course'}</strong>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSommelierModalWine(null)}
                                    aria-label="Close modal"
                                    className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            {(() => {
                                const explanation = generatePairingExplanation(
                                    sommelierModalWine,
                                    selectedDish || sommelierModalWine.dishName
                                )
                                return (
                                    <div className="space-y-6 pt-6">
                                        {/* Score Banner */}
                                        <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-stone-200 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                                                    Compatibility Score
                                                </span>
                                                <span className="text-2xl font-bold text-[#8B1E3F]">
                                                    {sommelierModalWine.pairingScore}%
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                                                    Harmonization Level
                                                </span>
                                                <span className="text-sm font-bold text-emerald-700">
                                                    {sommelierModalWine.matchRating}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Why This Wine Section */}
                                        <div>
                                            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-800 mb-2 flex items-center gap-1.5">
                                                <Wine size={15} className="text-[#8B1E3F]" />
                                                Why This Wine Pairs Perfectly
                                            </h4>
                                            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                                                {explanation.whyWine}
                                            </p>
                                        </div>

                                        {/* Profile Breakdown Grid */}
                                        <div>
                                            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-800 mb-2 flex items-center gap-1.5">
                                                <GlassWater size={15} className="text-[#8B1E3F]" />
                                                Wine Profile & Structure
                                            </h4>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-center">
                                                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">Body</span>
                                                    <span className="text-xs font-bold text-stone-800">{sommelierModalWine.body}</span>
                                                </div>
                                                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-center">
                                                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">Acidity</span>
                                                    <span className="text-xs font-bold text-stone-800">{sommelierModalWine.acidity}</span>
                                                </div>
                                                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-center">
                                                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">Tannins</span>
                                                    <span className="text-xs font-bold text-stone-800">{sommelierModalWine.tannin}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Serving Specs */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-1">
                                                    <Thermometer size={14} className="text-amber-600" />
                                                    Serving Temperature
                                                </div>
                                                <p className="text-xs text-stone-600 font-medium">
                                                    {explanation.servingTemp}
                                                </p>
                                            </div>

                                            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-1">
                                                    <Calendar size={14} className="text-indigo-600" />
                                                    Recommended Occasion
                                                </div>
                                                <p className="text-xs text-stone-600 font-medium">
                                                    {explanation.occasion}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Chef Tip */}
                                        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                                                <Lightbulb size={15} className="text-amber-600" />
                                                Chef & Sommelier Serving Tip
                                            </div>
                                            <p className="text-xs text-amber-800 leading-relaxed">
                                                {explanation.chefTip}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })()}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
