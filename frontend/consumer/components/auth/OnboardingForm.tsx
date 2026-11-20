'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wine, Sparkles, Compass, ArrowRight, ArrowLeft, Loader2, AlertCircle, Check, Flame, Compass as CompassIcon, Sparkle } from 'lucide-react'
import { completeOnboarding } from '@/app/onboarding/actions'

export type ExperienceLevelKey = 'beginner' | 'intermediate' | 'experienced'
export type BeginnerPathKey = 'popular' | 'discover' | 'explore'

type QuestionOption = {
    id: string
    label: string
    desc?: string
    icon?: React.ComponentType<{ className?: string; size?: number }>
}

type QuestionType = {
    id: string
    title: string
    subtitle: string
    options: QuestionOption[]
    multi?: boolean
    allowSkip?: boolean
}

// STEP 1 — EXPERIENCE LEVEL
const experienceQuestion: QuestionType = {
    id: 'experience',
    title: 'How familiar are you with wine?',
    subtitle: 'No quiz, no pressure — just let us know where you are on your wine journey.',
    options: [
        {
            id: 'beginner',
            label: "Exploring First Vintages",
            desc: "New to wine tasting and cellar discovery.",
            icon: Sparkles
        },
        {
            id: 'intermediate',
            label: "Familiar with Essentials",
            desc: "Familiar with popular styles and developing personal taste.",
            icon: Wine
        },
        {
            id: 'experienced',
            label: "Seasoned Enthusiast",
            desc: "Comfortable with varietals, regions, and balance.",
            icon: Compass
        }
    ]
}

// STEP 5 — COMPLETE BEGINNER OPTIONS
const beginnerChoiceQuestion: QuestionType = {
    id: 'beginner_path',
    title: 'How would you like to start?',
    subtitle: 'Choose the path that fits you best. We will never force taste assumptions.',
    options: [
        {
            id: 'popular',
            label: 'Browse Approachable Vintages',
            desc: 'View highly rated bottles recommended for newcomers.',
            icon: Flame
        },
        {
            id: 'discover',
            label: 'Personalize Tasting Palate',
            desc: 'Answer a few guided questions on flavors and sweetness.',
            icon: Sparkles
        },
        {
            id: 'explore',
            label: "Browse Complete Catalog",
            desc: 'Go directly to the comprehensive wine catalogue.',
            icon: CompassIcon
        }
    ]
}

const getAdaptiveQuestions = (level: string, beginnerPath: BeginnerPathKey): QuestionType[] => {
    if (level === 'beginner') {
        // If beginner chooses popular or explore, no extra questions needed
        if (beginnerPath === 'popular' || beginnerPath === 'explore') {
            return []
        }

        // STEP 2 — BEGINNER QUESTIONS (Non-technical)
        return [
            {
                id: 'taste_appealing',
                title: 'What sounds most appealing?',
                subtitle: 'Pick the taste vibe you enjoy the most.',
                allowSkip: true,
                options: [
                    { id: 'fruity', label: 'Fruity', desc: 'Fresh berries, crisp apple, and stone fruit' },
                    { id: 'rich_smooth', label: 'Rich & smooth', desc: 'Warm vanilla, velvety texture, and soft finish' },
                    { id: 'light_refreshing', label: 'Light & refreshing', desc: 'Crisp, vibrant, and thirst-quenching' },
                    { id: 'sweet', label: 'Sweet', desc: 'Luscious, honeyed, and delightfully easy-drinking' },
                    { id: 'not_sure', label: 'Not sure', desc: 'Surprise me with popular crowd-pleasers' }
                ]
            },
            {
                id: 'wine_types',
                title: 'What would you like to explore?',
                subtitle: 'Select any styles that catch your eye.',
                multi: true,
                allowSkip: true,
                options: [
                    { id: 'red', label: 'Red' },
                    { id: 'white', label: 'White' },
                    { id: 'rose', label: 'Rosé' },
                    { id: 'sparkling', label: 'Sparkling' },
                    { id: 'anything', label: 'Anything' }
                ]
            },
            {
                id: 'occasion',
                title: 'When would you enjoy wine?',
                subtitle: "Choose the moments you're looking forward to.",
                allowSkip: true,
                options: [
                    { id: 'with_food', label: 'With food' },
                    { id: 'celebration', label: 'Celebration' },
                    { id: 'date_evening', label: 'Date / evening' },
                    { id: 'relaxing', label: 'Relaxing' },
                    { id: 'gift', label: 'Gift' },
                    { id: 'just_exploring', label: 'Just exploring' }
                ]
            },
            {
                id: 'budget',
                title: 'What is your usual budget?',
                subtitle: "We'll highlight great values in your comfort zone.",
                allowSkip: true,
                options: [
                    { id: 'under_500', label: 'Under ₹500' },
                    { id: '500_1000', label: '₹500–₹1,000' },
                    { id: '1000_2000', label: '₹1,000–₹2,000' },
                    { id: 'above_2000', label: '₹2,000+' },
                    { id: 'no_preference', label: 'No preference' }
                ]
            }
        ]
    }

    if (level === 'intermediate') {
        // STEP 3 — INTERMEDIATE QUESTIONS
        return [
            {
                id: 'wine_types',
                title: 'Which wine styles do you prefer?',
                subtitle: 'Select all styles that you enjoy or are excited to explore.',
                multi: true,
                allowSkip: true,
                options: [
                    { id: 'red', label: 'Red Wine', desc: 'From vibrant fruit to rich, bold, and structured reds' },
                    { id: 'white', label: 'White Wine', desc: 'Crisp, aromatic, citrusy, or gently oaked whites' },
                    { id: 'rose', label: 'Rosé Wine', desc: 'Fresh, floral, and versatile with meals' },
                    { id: 'sparkling', label: 'Sparkling Wine', desc: 'Lively bubbles, Brut, and celebratory cuvées' },
                    { id: 'dessert', label: 'Dessert & Sweet', desc: 'Honeyed late-harvest and luscious varieties' }
                ]
            },
            {
                id: 'sweetness',
                title: 'What level of sweetness do you prefer?',
                subtitle: 'Choose the sweetness level that best matches your palate.',
                allowSkip: true,
                options: [
                    { id: 'dry', label: 'Crisp & Dry', desc: 'Clean, refreshing finish with no noticeable sweetness' },
                    { id: 'semi_dry', label: 'A Touch of Sweetness (Off-Dry)', desc: 'Subtle, gentle fruit sweetness balancing natural acidity' },
                    { id: 'sweet', label: 'Rich & Sweet', desc: 'Luscious, fruity, and delightfully sweet' },
                    { id: 'no_preference', label: 'No Preference / Open to All', desc: 'Enjoy exploring across dry, off-dry, and sweet' }
                ]
            },
            {
                id: 'body_style',
                title: 'What style do you prefer?',
                subtitle: 'How full and structured do you like your wine to feel in the mouth?',
                allowSkip: true,
                options: [
                    { id: 'light', label: 'Light & refreshing', desc: 'Crisp, lively, and easy to sip on any afternoon' },
                    { id: 'medium', label: 'Smooth & balanced', desc: 'Harmonious fruit and gentle texture, easy to pair' },
                    { id: 'bold', label: 'Rich & bold', desc: 'Full-bodied, deep flavor structure, and lingering finish' },
                    { id: 'all', label: 'Versatile / A mix of styles', desc: 'Enjoy light whites as well as bold reds' }
                ]
            },
            {
                id: 'flavors',
                title: 'Which flavor notes appeal to you most?',
                subtitle: 'Select all flavor notes you gravitate towards.',
                multi: true,
                allowSkip: true,
                options: [
                    { id: 'berry', label: 'Fresh Berries & Dark Fruit', desc: 'Blackberry, plum, cherry, and juicy red berries' },
                    { id: 'citrus_tropical', label: 'Citrus & Tropical Fruits', desc: 'Crisp green apple, citrus, peach, and passion fruit' },
                    { id: 'oak_vanilla_spice', label: 'Warm Oak, Vanilla & Spice', desc: 'Toasted oak, vanilla bean, cinnamon, and pepper' },
                    { id: 'floral_herbal', label: 'Floral & Garden Herbs', desc: 'Jasmine, elderflower, and fresh garden herbs' },
                    { id: 'earthy_mineral', label: 'Earthy & Mineral Notes', desc: 'Flint, slate minerality, and forest floor depth' }
                ]
            },
            {
                id: 'occasion',
                title: 'When would you enjoy wine most?',
                subtitle: 'Tell us the moments you are planning for.',
                allowSkip: true,
                options: [
                    { id: 'pairing', label: 'Dining & Food Pairing', desc: 'Pairing with home-cooked dinners or gourmet meals' },
                    { id: 'celebration', label: 'Celebrations & Gatherings', desc: 'Parties, milestones, and shared toasts' },
                    { id: 'relaxing', label: 'Casual Evenings & Unwinding', desc: 'A quiet glass after work or relaxing with friends' },
                    { id: 'tastings', label: 'Tasting & Discovery', desc: 'Exploring new estates, regions, and varietals' },
                    { id: 'gift', label: 'Gifting & Hosting', desc: 'Bringing to dinner parties or gifting wine lovers' }
                ]
            },
            {
                id: 'budget',
                title: 'What is your usual budget per bottle?',
                subtitle: "We'll prioritize the best value recommendations in your comfort zone.",
                allowSkip: true,
                options: [
                    { id: 'under_1000', label: 'Under ₹1,000', desc: 'Great value everyday bottles' },
                    { id: '1000_1800', label: '₹1,000–₹1,800', desc: 'Premium estate varietals and reserves' },
                    { id: 'above_1800', label: '₹1,800+', desc: 'Artisanal, single-vineyard, and collector bottles' },
                    { id: 'no_preference', label: 'No preference', desc: 'Focus on taste profile over price' }
                ]
            }
        ]
    }

    // STEP 4 — EXPERIENCED USER QUESTIONS (Technical Multi-Attribute)
    return [
        {
            id: 'wine_types',
            title: 'Preferred Wine Categories',
            subtitle: 'Select the wine types you want prioritized in your cellar recommendations.',
            multi: true,
            allowSkip: true,
            options: [
                { id: 'red', label: 'Structured Reds', desc: 'Cabernet Sauvignon, Shiraz, Pinot Noir, Merlot' },
                { id: 'white', label: 'Reserve Whites', desc: 'Chardonnay, Sauvignon Blanc, Chenin Blanc, Viognier' },
                { id: 'sparkling', label: 'Méthode Traditionnelle Sparkling', desc: 'Extended lees ageing, Brut & Brut Nature' },
                { id: 'rose', label: 'Gastronomic Rosé', desc: 'Dry, crisp, structured rosé wines' },
                { id: 'dessert', label: 'Late Harvest & Fortified', desc: 'Botrytis, ice wine style, and luscious reserves' },
                { id: 'no_preference', label: 'All Styles / Open Palate', desc: 'Include the best across all categories' }
            ]
        },
        {
            id: 'grapes',
            title: 'Grape Varietals & Blends',
            subtitle: 'Which noble or indigenous grape varieties do you prioritize?',
            multi: true,
            allowSkip: true,
            options: [
                { id: 'cabernet_shiraz', label: 'Cabernet Sauvignon & Shiraz / Syrah', desc: 'Bold structure, dark cassis, black pepper, firm tannins' },
                { id: 'pinot_zinfandel', label: 'Pinot Noir & Zinfandel', desc: 'Red berry finesse, savory undertones, refined acidity' },
                { id: 'sauvignon_chenin', label: 'Sauvignon Blanc & Chenin Blanc', desc: 'Vibrant acidity, lemongrass, green apple, flinty minerality' },
                { id: 'chardonnay_viognier', label: 'Chardonnay & Viognier', desc: 'Stone fruit, creamy texture, toasted oak, floral aromatics' },
                { id: 'sangiovese_merlot', label: 'Sangiovese, Merlot & Tempranillo', desc: 'Plum, tobacco, balanced acidity, and food-friendly structure' },
                { id: 'no_preference', label: 'No Preference / All Varietals', desc: 'Explore all available noble and indigenous grapes' }
            ]
        },
        {
            id: 'body_style',
            title: 'Body & Extraction Level',
            subtitle: 'Select your preferred weight and concentration on the palate.',
            allowSkip: true,
            options: [
                { id: 'light', label: 'Light-Bodied', desc: 'Delicate extraction, high drinkability and lift' },
                { id: 'medium', label: 'Medium-Bodied', desc: 'Harmonious weight, rounded fruit, and classic balance' },
                { id: 'full', label: 'Full-Bodied', desc: 'Rich, dense, mouth-coating viscosity and concentration' },
                { id: 'no_preference', label: 'No Preference / Vintage Dependent', desc: 'Open to various body weights' }
            ]
        },
        {
            id: 'acidity',
            title: 'Acidity Profile',
            subtitle: 'What acidity level do you look for in your glass?',
            allowSkip: true,
            options: [
                { id: 'high', label: 'High / Crisp & Vibrant', desc: 'Racy, bright, and energetic spine' },
                { id: 'medium', label: 'Medium / Balanced', desc: 'Fresh, harmonious, food-friendly acidity' },
                { id: 'low', label: 'Low / Soft & Round', desc: 'Gentle, mellow acidity with softer finish' },
                { id: 'no_preference', label: 'No Preference / Not Sure', desc: 'Flexible acidity profile' }
            ]
        },
        {
            id: 'tannin',
            title: 'Tannin Structure (For Reds)',
            subtitle: 'How structured and firm do you prefer the phenolic tannins?',
            allowSkip: true,
            options: [
                { id: 'high', label: 'High / Structured & Firm Tannins', desc: 'Cellar-worthy grip, ageable phenolic backbone' },
                { id: 'medium', label: 'Medium / Balanced Tannins', desc: 'Well-integrated grip, excellent with food' },
                { id: 'low', label: 'Low / Silky Tannins', desc: 'Velvety, smooth, and gentle on the gums' },
                { id: 'no_preference', label: 'No Preference / Not Sure', desc: 'Flexible tannin preference' }
            ]
        },
        {
            id: 'sweetness',
            title: 'Sweetness & Residual Sugar',
            subtitle: 'Target residual sugar level.',
            allowSkip: true,
            options: [
                { id: 'dry', label: 'Bone Dry / Dry (< 4g/L)', desc: 'Clean, crisp, zero noticeable sweetness' },
                { id: 'semi_dry', label: 'Off-Dry / Semi-Dry (4–12g/L)', desc: 'Subtle fruit sweetness softening crisp natural acidity' },
                { id: 'sweet', label: 'Sweet / Dessert (> 45g/L)', desc: 'Luscious, honeyed, late-harvest concentration' },
                { id: 'no_preference', label: 'No Preference / Open Palate', desc: 'Open across dry and sweet spectrum' }
            ]
        },
        {
            id: 'flavors',
            title: 'Dominant Aromatic & Flavor Notes',
            subtitle: 'Select your preferred primary, secondary, and oak profiles.',
            multi: true,
            allowSkip: true,
            options: [
                { id: 'oak_vanilla_spice', label: 'Toasted Oak, Vanilla & Spice', desc: 'French/American barrel maturation, clove, cedar, vanilla' },
                { id: 'berry', label: 'Dark Berries & Cassis', desc: 'Blackberry, plum, dark cherry, and wild bramble' },
                { id: 'earthy_mineral', label: 'Earthy, Mineral & Terroir Notes', desc: 'Wet stone, graphite, forest floor, and leather' },
                { id: 'citrus_tropical', label: 'Citrus, Stone Fruit & Green Apple', desc: 'Zesty lemon, white peach, green apple, and passion fruit' },
                { id: 'floral_herbal', label: 'Floral & Garden Herbs', desc: 'Jasmine, rose petal, dried herbs, and eucalyptus' },
                { id: 'no_preference', label: 'No Preference / Complex Blends', desc: 'Enjoy layered, diverse aromatic profiles' }
            ]
        },
        {
            id: 'region',
            title: 'Terroir & Winemaking Region',
            subtitle: 'Preferred vineyard regions and microclimates.',
            allowSkip: true,
            options: [
                { id: 'nashik', label: 'Nashik Valley & Dindori', desc: 'High elevation, volcanic soils, Maharashtra' },
                { id: 'nandi_hills', label: 'Nandi Hills & Bangalore', desc: 'Granitic soils, steady moderate climate, Karnataka' },
                { id: 'akluj_baramati', label: 'Akluj & Baramati', desc: 'Arid gravel and limestone plains, Maharashtra' },
                { id: 'international', label: 'International & Boutique Estates', desc: 'Curated global parcels and import reserves' },
                { id: 'no_preference', label: 'No Preference / All Terroirs', desc: 'Explore all exceptional estates' }
            ]
        },
        {
            id: 'budget',
            title: 'Bottle Allocation Range',
            subtitle: 'Target price bracket for recommendations.',
            allowSkip: true,
            options: [
                { id: 'under_1000', label: 'Under ₹1,000', desc: 'Approachable everyday cellar staples' },
                { id: '1000_2000', label: '₹1,000–₹2,000', desc: 'Estate varietals and reserve bottlings' },
                { id: '2000_3500', label: '₹2,000–₹3,500', desc: 'Grand reserves and limited single-vineyard parcels' },
                { id: 'above_3500', label: '₹3,500+', desc: 'Prestige cuvées and collector allocations' },
                { id: 'no_preference', label: 'Flexible / Vintage-driven', desc: 'Prioritize exceptional quality over price bracket' }
            ]
        }
    ]
}

interface OnboardingFormProps {
    initialData?: Record<string, any>
    isEditMode?: boolean
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ initialData = {}, isEditMode: initialIsEditMode = false }) => {
    const [step, setStep] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isEditMode, setIsEditMode] = useState(initialIsEditMode)

    // Profile state with smart prefill from database
    const [fullName, setFullName] = useState(initialData.fullName || '')
    const [phone, setPhone] = useState(initialData.phone || '')
    const [city, setCity] = useState(initialData.city || '')
    const [stateLocation, setStateLocation] = useState(initialData.state || '')
    const [country, setCountry] = useState(initialData.country || 'India')

    // Preference state with smart prefill from database
    const [experience, setExperience] = useState<string>(initialData.experience || 'beginner')
    const [beginnerPath, setBeginnerPath] = useState<BeginnerPathKey>('discover')
    const [tasteAppealing, setTasteAppealing] = useState<string>(initialData.tasteAppealing || '')
    const [wineTypes, setWineTypes] = useState<string[]>(initialData.favoriteTypes || [])
    const [grapes, setGrapes] = useState<string[]>(initialData.grapes || [])
    const [sweetness, setSweetness] = useState<string>(initialData.sweetness || '')
    const [bodyStyle, setBodyStyle] = useState<string>(initialData.bodyStyle || '')
    const [acidity, setAcidity] = useState<string>(initialData.acidity || '')
    const [tannin, setTannin] = useState<string>(initialData.tannin || '')
    const [region, setRegion] = useState<string>(initialData.region || '')
    const [flavors, setFlavors] = useState<string[]>(initialData.flavors || [])
    const [occasion, setOccasion] = useState<string>(initialData.occasion || '')
    const [budget, setBudget] = useState<string>(initialData.budget || '')

    // Check edit mode and prefill if available
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            if (params.get('mode') === 'edit' || initialIsEditMode) {
                setIsEditMode(true)
            }
        }
    }, [initialIsEditMode])

    const isBeginner = experience === 'beginner'

    // Compute step layout:
    // Step 0: Profile
    // Step 1: Experience Level
    // If Beginner: Step 2 is Beginner Choice ("How would you like to start?")
    // If Beginner chose "popular" or "explore", Step 2 is the final question.
    // If Beginner chose "discover", subsequent steps are the 4 beginner questions.
    // If Intermediate / Experienced: Step 2+ are the adaptive questions directly.
    const adaptiveQuestions = useMemo(() => {
        return getAdaptiveQuestions(experience || 'beginner', beginnerPath)
    }, [experience, beginnerPath])

    const totalSteps = useMemo(() => {
        if (isBeginner) {
            if (beginnerPath === 'popular' || beginnerPath === 'explore') {
                return 3 // Profile (0) -> Experience (1) -> Beginner Choice (2)
            }
            return 3 + adaptiveQuestions.length // Profile (0) -> Experience (1) -> Choice (2) -> 4 Questions (3,4,5,6)
        }
        return 2 + adaptiveQuestions.length // Profile (0) -> Experience (1) -> Questions (2,3,4,...)
    }, [isBeginner, beginnerPath, adaptiveQuestions.length])

    const handleNext = () => {
        if (step < totalSteps - 1) {
            setStep((prev) => prev + 1)
        }
    }

    const handleBack = () => {
        if (step > 0) {
            setStep((prev) => prev - 1)
        }
    }

    const handleSkipCurrentQuestion = () => {
        if (step < totalSteps - 1) {
            handleNext()
        } else {
            // Last step, submit with what we have
            const syntheticEvent = { preventDefault: () => {} } as React.FormEvent
            handleSubmit(syntheticEvent)
        }
    }

    const toggleMultiSelect = (qId: string, optId: string) => {
        if (qId === 'wine_types') {
            if (optId === 'anything' || optId === 'no_preference') {
                setWineTypes(['no_preference'])
                return
            }
            setWineTypes((prev) => {
                const filtered = prev.filter((x) => x !== 'anything' && x !== 'no_preference')
                if (filtered.includes(optId)) {
                    return filtered.filter((x) => x !== optId)
                } else {
                    return [...filtered, optId]
                }
            })
        } else if (qId === 'grapes') {
            if (optId === 'no_preference') {
                setGrapes(['no_preference'])
                return
            }
            setGrapes((prev) => {
                const filtered = prev.filter((x) => x !== 'no_preference')
                if (filtered.includes(optId)) {
                    return filtered.filter((x) => x !== optId)
                } else {
                    return [...filtered, optId]
                }
            })
        } else if (qId === 'flavors') {
            if (optId === 'no_preference') {
                setFlavors(['no_preference'])
                return
            }
            setFlavors((prev) => {
                const filtered = prev.filter((x) => x !== 'no_preference')
                if (prev.includes(optId)) {
                    return prev.filter((x) => x !== optId)
                } else {
                    return [...prev, optId]
                }
            })
        }
    }

    const isCurrentStepValid = () => {
        if (step === 0) return fullName.trim() !== '' && country.trim() !== ''
        if (step === 1) return experience !== ''
        if (isBeginner && step === 2) return Boolean(beginnerPath)

        // All adaptive preference questions can be answered OR skipped
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (step < totalSteps - 1) {
            handleNext()
            return
        }

        setIsLoading(true)
        setError(null)

        const formData = new FormData()
        // Profile Data
        formData.append('full_name', fullName)
        formData.append('phone', phone)
        formData.append('city', city)
        formData.append('state', stateLocation)
        formData.append('country', country)

        // Preference Data
        formData.append('experience', experience)
        formData.append('beginner_path', isBeginner ? beginnerPath : 'discover')

        // Clean values — do not store "not_sure" or "no_preference" as fake preferences
        if (tasteAppealing && tasteAppealing !== 'not_sure') {
            formData.append('taste_appealing', tasteAppealing)
        }
        if (sweetness && sweetness !== 'no_preference' && sweetness !== 'all') {
            formData.append('sweetness', sweetness)
        }
        if (bodyStyle && bodyStyle !== 'no_preference' && bodyStyle !== 'all') {
            formData.append('body_style', bodyStyle)
        }
        if (acidity && acidity !== 'no_preference' && acidity !== 'not_sure') {
            formData.append('acidity', acidity)
        }
        if (tannin && tannin !== 'no_preference' && tannin !== 'not_sure') {
            formData.append('tannin', tannin)
        }
        if (region && region !== 'no_preference') {
            formData.append('region', region)
        }

        const validGrapes = grapes.filter((g) => g !== 'no_preference' && g !== 'not_sure')
        validGrapes.forEach((g) => formData.append('grapes', g))

        const validFlavors = flavors.filter((f) => f !== 'no_preference' && f !== 'not_sure')
        validFlavors.forEach((f) => formData.append('flavors', f))

        const validTypes = wineTypes.filter((t) => t !== 'anything' && t !== 'no_preference')
        validTypes.forEach((type) => formData.append('wine_types', type))

        if (occasion && occasion !== 'no_preference' && occasion !== 'just_exploring') {
            formData.append('occasion', occasion)
        }
        if (budget && budget !== 'no_preference') {
            formData.append('budget', budget)
        }
        formData.append('interest', occasion || 'tastings')
        if (isEditMode) {
            formData.append('is_edit_mode', 'true')
        }

        const res = await completeOnboarding(formData)
        if (res?.error) {
            setError(res.error)
            setIsLoading(false)
        }
    }

    // Determine current step content
    let currentTitle = ''
    let currentSubtitle = ''
    let currentQuestion: QuestionType | null = null

    if (step === 0) {
        currentTitle = isEditMode ? 'Update Your Profile' : 'Complete Your Profile'
        currentSubtitle = 'Tell us a bit about yourself to personalize your estate journey.'
    } else if (step === 1) {
        currentTitle = experienceQuestion.title
        currentSubtitle = experienceQuestion.subtitle
        currentQuestion = experienceQuestion
    } else if (isBeginner && step === 2) {
        currentTitle = beginnerChoiceQuestion.title
        currentSubtitle = beginnerChoiceQuestion.subtitle
        currentQuestion = beginnerChoiceQuestion
    } else {
        const qIndex = isBeginner ? step - 3 : step - 2
        currentQuestion = adaptiveQuestions[qIndex]
        if (currentQuestion) {
            currentTitle = currentQuestion.title
            currentSubtitle = currentQuestion.subtitle
        }
    }

    const isQuestionnaireStep = (isBeginner && step >= 3) || (!isBeginner && step >= 2)

    return (
        <div className="w-full max-w-xl mx-auto">
            {/* Progress Bar & Back Navigation */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-3">
                    {step > 0 ? (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="text-xs text-vino-gray/70 hover:text-white flex items-center gap-1.5 transition-colors font-medium"
                        >
                            <ArrowLeft size={14} />
                            Back
                        </button>
                    ) : (
                        <div />
                    )}
                    <span className="text-[11px] font-semibold text-vino-gold uppercase tracking-widest">
                        Step {step + 1} of {totalSteps}
                    </span>
                    {isQuestionnaireStep ? (
                        <button
                            type="button"
                            onClick={handleSkipCurrentQuestion}
                            className="text-xs text-stone-400 hover:text-stone-200 transition-colors"
                        >
                            Skip question
                        </button>
                    ) : (
                        <div />
                    )}
                </div>

                <div className="flex justify-between gap-1.5">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                                i <= step ? 'bg-vino-accent shadow-[0_0_8px_rgba(139,30,63,0.5)]' : 'bg-stone-800'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-red-200">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-6"
                    >
                        <div className="text-center space-y-1.5 mb-6">
                            <h2 className="text-2xl sm:text-3xl font-serif text-white font-bold tracking-tight">
                                {currentTitle}
                            </h2>
                            <p className="text-sm text-vino-gray/70 max-w-md mx-auto">
                                {currentSubtitle}
                            </p>
                        </div>

                        {/* Step 0: Profile Info */}
                        {step === 0 && (
                            <div className="space-y-4 bg-stone-900/40 p-6 rounded-3xl border border-stone-800/80 backdrop-blur-md">
                                <div>
                                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full px-4 py-3 bg-stone-950/70 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:border-vino-accent focus:ring-1 focus:ring-vino-accent outline-none text-sm transition-all"
                                        placeholder="e.g. Priya Sharma"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                                        Phone Number (Optional)
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 bg-stone-950/70 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:border-vino-accent focus:ring-1 focus:ring-vino-accent outline-none text-sm transition-all"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                                            City (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-full px-4 py-3 bg-stone-950/70 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:border-vino-accent focus:ring-1 focus:ring-vino-accent outline-none text-sm transition-all"
                                            placeholder="Mumbai"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                                            State (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={stateLocation}
                                            onChange={(e) => setStateLocation(e.target.value)}
                                            className="w-full px-4 py-3 bg-stone-950/70 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:border-vino-accent focus:ring-1 focus:ring-vino-accent outline-none text-sm transition-all"
                                            placeholder="Maharashtra"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                                        Country *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full px-4 py-3 bg-stone-950/70 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:border-vino-accent focus:ring-1 focus:ring-vino-accent outline-none text-sm transition-all"
                                        placeholder="India"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 1: Experience Question */}
                        {step === 1 && currentQuestion && (
                            <div className="space-y-3">
                                {currentQuestion.options.map((opt) => {
                                    const isSelected = experience === opt.id
                                    const Icon = opt.icon

                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => {
                                                setExperience(opt.id)
                                                // Reset lower answers when experience level switches
                                                setBeginnerPath('discover')
                                                setTasteAppealing('')
                                                setWineTypes([])
                                                setGrapes([])
                                                setSweetness('')
                                                setBodyStyle('')
                                                setAcidity('')
                                                setTannin('')
                                                setRegion('')
                                                setFlavors([])
                                                setOccasion('')
                                                setBudget('')
                                            }}
                                            className={`w-full p-5 rounded-2xl border text-left transition-all duration-300 flex items-center gap-4 ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-vino-accent/20 to-vino-accent/10 border-vino-accent shadow-[0_0_20px_rgba(139,30,63,0.25)] ring-1 ring-vino-accent'
                                                    : 'bg-stone-900/40 border-stone-800 hover:border-stone-700 hover:bg-stone-900/80'
                                            }`}
                                        >
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                                    isSelected ? 'bg-vino-accent text-white' : 'bg-stone-800 text-stone-400'
                                                }`}
                                            >
                                                {Icon ? <Icon size={20} /> : <Sparkles size={20} />}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-serif font-bold text-base sm:text-lg ${isSelected ? 'text-white' : 'text-stone-200'}`}>
                                                        {opt.label}
                                                    </p>
                                                    {isSelected && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-vino-accent text-white uppercase tracking-wider">
                                                            Selected
                                                        </span>
                                                    )}
                                                </div>
                                                {opt.desc && (
                                                    <p className="text-xs sm:text-sm text-stone-400 mt-1">
                                                        &ldquo;{opt.desc}&rdquo;
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {/* Step 2 for Beginners: 3 Beginner Paths (Popular / Discover / Explore) */}
                        {isBeginner && step === 2 && currentQuestion && (
                            <div className="space-y-3">
                                {currentQuestion.options.map((opt) => {
                                    const isSelected = beginnerPath === opt.id
                                    const Icon = opt.icon

                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setBeginnerPath(opt.id as BeginnerPathKey)}
                                            className={`w-full p-5 rounded-2xl border text-left transition-all duration-300 flex items-center gap-4 ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-vino-gold/20 to-vino-accent/15 border-vino-gold shadow-[0_0_20px_rgba(212,175,55,0.2)] ring-1 ring-vino-gold'
                                                    : 'bg-stone-900/40 border-stone-800 hover:border-stone-700 hover:bg-stone-900/80'
                                            }`}
                                        >
                                            <div
                                                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                                    isSelected ? 'bg-vino-gold text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'
                                                }`}
                                            >
                                                {Icon ? <Icon size={22} /> : <Sparkles size={22} />}
                                            </div>

                                            <div className="flex-1">
                                                <p className={`font-serif font-bold text-base sm:text-lg ${isSelected ? 'text-white' : 'text-stone-200'}`}>
                                                    {opt.label}
                                                </p>
                                                {opt.desc && (
                                                    <p className="text-xs sm:text-sm text-stone-400 mt-1 leading-relaxed">
                                                        {opt.desc}
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {/* Adaptive Questionnaire Steps */}
                        {((!isBeginner && step >= 2) || (isBeginner && step >= 3)) && currentQuestion && (
                            <div className="space-y-3">
                                {currentQuestion.options.map((opt) => {
                                    let isSelected = false
                                    if (currentQuestion!.id === 'taste_appealing') isSelected = tasteAppealing === opt.id
                                    if (currentQuestion!.id === 'wine_types') isSelected = wineTypes.includes(opt.id)
                                    if (currentQuestion!.id === 'grapes') isSelected = grapes.includes(opt.id)
                                    if (currentQuestion!.id === 'sweetness') isSelected = sweetness === opt.id
                                    if (currentQuestion!.id === 'body_style') isSelected = bodyStyle === opt.id
                                    if (currentQuestion!.id === 'acidity') isSelected = acidity === opt.id
                                    if (currentQuestion!.id === 'tannin') isSelected = tannin === opt.id
                                    if (currentQuestion!.id === 'region') isSelected = region === opt.id
                                    if (currentQuestion!.id === 'flavors') isSelected = flavors.includes(opt.id)
                                    if (currentQuestion!.id === 'occasion') isSelected = occasion === opt.id
                                    if (currentQuestion!.id === 'budget') isSelected = budget === opt.id

                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => {
                                                if (currentQuestion!.multi) {
                                                    toggleMultiSelect(currentQuestion!.id, opt.id)
                                                } else {
                                                    if (currentQuestion!.id === 'taste_appealing') setTasteAppealing(opt.id)
                                                    if (currentQuestion!.id === 'sweetness') setSweetness(opt.id)
                                                    if (currentQuestion!.id === 'body_style') setBodyStyle(opt.id)
                                                    if (currentQuestion!.id === 'acidity') setAcidity(opt.id)
                                                    if (currentQuestion!.id === 'tannin') setTannin(opt.id)
                                                    if (currentQuestion!.id === 'region') setRegion(opt.id)
                                                    if (currentQuestion!.id === 'occasion') setOccasion(opt.id)
                                                    if (currentQuestion!.id === 'budget') setBudget(opt.id)
                                                }
                                            }}
                                            className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all duration-300 flex items-center gap-4 ${
                                                isSelected
                                                    ? 'bg-vino-accent/15 border-vino-accent shadow-[0_0_15px_rgba(139,30,63,0.2)] ring-1 ring-vino-accent'
                                                    : 'bg-stone-900/40 border-stone-800 hover:border-stone-700 hover:bg-stone-900/80'
                                            }`}
                                        >
                                            <div
                                                className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                                    isSelected ? 'border-vino-accent bg-vino-accent text-white' : 'border-stone-600 bg-stone-950/50'
                                                }`}
                                            >
                                                {isSelected && <Check size={14} className="stroke-[3]" />}
                                            </div>

                                            <div className="flex-1">
                                                <p className={`font-medium text-sm sm:text-base ${isSelected ? 'text-white font-semibold' : 'text-stone-300'}`}>
                                                    {opt.label}
                                                </p>
                                                {opt.desc && (
                                                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                                                        {opt.desc}
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Button */}
                <div className="mt-10 flex items-center justify-between gap-4">
                    {isQuestionnaireStep ? (
                        <button
                            type="button"
                            onClick={handleSkipCurrentQuestion}
                            className="px-4 py-2.5 text-xs text-stone-400 hover:text-stone-200 transition-colors"
                        >
                            Skip to finish
                        </button>
                    ) : (
                        <div />
                    )}

                    <button
                        type="submit"
                        disabled={!isCurrentStepValid() || isLoading}
                        className="py-3.5 px-8 bg-vino-accent hover:bg-vino-accent-light text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(139,30,63,0.35)] flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-sm ml-auto"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Saving Preferences...
                            </>
                        ) : step === totalSteps - 1 ? (
                            isBeginner && beginnerPath === 'popular'
                                ? 'Show Me Popular Wines'
                                : isBeginner && beginnerPath === 'explore'
                                ? 'Explore Wine Catalog'
                                : 'Complete & Discover Wines'
                        ) : (
                            <>
                                Next Step
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
