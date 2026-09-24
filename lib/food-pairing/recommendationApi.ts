// lib/food-pairing/recommendationApi.ts
// ---------------------------------------------------------------------------
// Resilient Sommelier & Recommendation API Service Layer for VinoSphere
// Works seamlessly both online (with FastAPI / ML microservice) and offline
// (with built-in Sommelier-grade pairing engine and curated Indian cuisine catalog).
// ---------------------------------------------------------------------------

import { wines as staticWines } from '@/constants/food-pairing/wines'
import { foods as staticFoods } from '@/constants/food-pairing/foods'
import { scorePairing } from './pairingEngine'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export interface FoodCategoryItem {
  food_name: string
  cuisine?: string
  category?: string
  vegetarian?: string
  spice_level?: string
  image_url?: string | null
}

export interface WineRecommendation {
  wine_name: string
  winery?: string
  wine_type?: string
  variety?: string
  region?: string
  body?: string
  sweetness?: string
  acidity?: string
  tannin?: string
  score: number
  price?: number
  rating?: number
  serving_temp?: string
  image_url?: string | null
  _foodName?: string
}

export interface FoodRecommendation {
  food_name: string
  cuisine?: string
  category?: string
  vegetarian?: string
  spice_level?: string
  score: number
  image_url?: string | null
  _wineName?: string
}

// ---------------------------------------------------------------------------
// Cloudinary Wine Asset Library
// ---------------------------------------------------------------------------
export const CLOUDINARY_WINE_MAP: Record<string, string> = {
  "rasa shiraz": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956204/wb102_wtbr_0411_q_01_do6saj.jpg",
  "rasa cabernet sauvignon": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956204/wb102_wtbr_0411_q_01_do6saj.jpg",
  "arros reserve": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956322/Bottle-of-Valdespino-Fino-Sherry-Inocente-375ml-Fortified-Wine-Flatiron-SF_q87qom.jpg",
  "york arros": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956322/Bottle-of-Valdespino-Fino-Sherry-Inocente-375ml-Fortified-Wine-Flatiron-SF_q87qom.jpg",
  "la réserve red": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956311/WB06ZZWC_hgi1dh.jpg",
  "la reserve red": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956311/WB06ZZWC_hgi1dh.jpg",
  "fratelli sette": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956308/SV-VR-Reserve-Diamond-Mountain-Distrcit-Cabernet-Sauvignon-750_cuu6bk.png",
  "sula dindori reserve shiraz": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956328/3445-0_l0nbqq.jpg",
  "dindori reserve shiraz": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956328/3445-0_l0nbqq.jpg",
  "vallonné malbec": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956319/2022_Donum_Pinot_Noir_Single_Vineyard_Carneros_oin8i3.jpg",
  "vallonne malbec": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956319/2022_Donum_Pinot_Noir_Single_Vineyard_Carneros_oin8i3.jpg",
  "charosa tempranillo reserve": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956176/pngtree-red-wine-png-image_2399218_hxj4qs.jpg",
  "charosa reserve tempranillo": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956176/pngtree-red-wine-png-image_2399218_hxj4qs.jpg",
  "sula sauvignon blanc": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956330/pngtree-red-wine-png-image_2399218_fkqedx.jpg",
  "sula chenin blanc": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956470/large_83d24c47-fa24-4880-b9a4-6162f893b49f_qbrdha.jpg",
  "chandon brut": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956316/26590246-single-glass-wine-bottle-with-blank-label-on-white-background_hdolwg.jpg",
  "chandon rosé": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956222/2022_Donum_Pinot_Noir_Single_Vineyard_Carneros_ycgzr2.jpg",
  "chandon rose": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956222/2022_Donum_Pinot_Noir_Single_Vineyard_Carneros_ycgzr2.jpg",
  "york sparkling brut": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956160/COL83055_5_m1934d___b04e857d7f6a556d_pkypkh.webp",
  "grover zampa soirée brut": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955883/Screenshot_2026-07-24_142359_ba6ezc.png",
  "grover zampa soiree brut": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955883/Screenshot_2026-07-24_142359_ba6ezc.png",
  "fratelli gran cuvée brut": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955843/Screenshot_2026-07-24_142422_gvfbfc.png",
  "fratelli gran cuvee brut": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955843/Screenshot_2026-07-24_142422_gvfbfc.png",
  "sula late harvest chenin blanc": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955804/Screenshot_2026-07-24_142628_x5rxjw.png",
  "vallonné vin de passerille": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955777/Screenshot_2026-07-24_143729_tdfluo.png",
  "grover art collection sauvignon blanc": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955909/Screenshot_2026-07-24_142300_jb7ora.png",
  "york chenin blanc": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955708/Screenshot_2026-07-24_144653_xehv3q.png",
  "fratelli sangiovese bianco": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955685/Screenshot_2026-07-24_145056_ooa7nx.png",
  "charosa selections sauvignon blanc": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955649/Screenshot_2026-07-24_145317_digkzn.png",
  "vallonné viognier": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955728/Screenshot_2026-07-24_144407_fzdci0.png",
  "sula source grenache rosé": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955804/Screenshot_2026-07-24_142628_x5rxjw.png",
  "york zinfandel rosé": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956324/623744-inn-mv-chardonnay-2022-750ml_mxvale.png",
  "grover art collection rosé": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956485/16229-87036-240815122202_hdzcje.jpg",
  "grover art collection rose": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956485/16229-87036-240815122202_hdzcje.jpg",
  "vallonné rosé": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956483/10892_lqgftz.jpg",
  "charosa selections viognier": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956481/15777_p0381r.jpg",
  "reveilo syrah reserve": "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956328/3445-0_l0nbqq.jpg"
}

export const CLOUDINARY_TYPE_FALLBACKS: Record<string, string> = {
  red: "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956330/pngtree-red-wine-png-image_2399218_fkqedx.jpg",
  white: "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956470/large_83d24c47-fa24-4880-b9a4-6162f893b49f_qbrdha.jpg",
  rosé: "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956222/2022_Donum_Pinot_Noir_Single_Vineyard_Carneros_ycgzr2.jpg",
  rose: "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956222/2022_Donum_Pinot_Noir_Single_Vineyard_Carneros_ycgzr2.jpg",
  sparkling: "https://res.cloudinary.com/xfklkvdc/image/upload/v1784956316/26590246-single-glass-wine-bottle-with-blank-label-on-white-background_hdolwg.jpg",
  dessert: "https://res.cloudinary.com/xfklkvdc/image/upload/v1784955992/Screenshot_2026-07-24_142422_un7uur.png",
}

export function resolveWineCloudinaryImage(wineName: string, wineType: string = ''): string {
  const clean = (wineName || '').toLowerCase().trim()
  if (CLOUDINARY_WINE_MAP[clean]) return CLOUDINARY_WINE_MAP[clean]

  for (const [key, url] of Object.entries(CLOUDINARY_WINE_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return url
    }
  }

  const typeClean = (wineType || '').toLowerCase().trim()
  if (CLOUDINARY_TYPE_FALLBACKS[typeClean]) return CLOUDINARY_TYPE_FALLBACKS[typeClean]

  return CLOUDINARY_TYPE_FALLBACKS.red
}

// ---------------------------------------------------------------------------
// Curated Fallback Catalogs
// ---------------------------------------------------------------------------
export const FALLBACK_CATEGORIES: string[] = [
  'Chicken',
  'Biryani',
  'Curry',
  'Paneer',
  'Seafood',
  'Lamb & Mutton',
  'Tandoori',
  'Vegetarian',
  'Pasta & Continental',
  'Dessert',
]

export const FALLBACK_FOODS_BY_CATEGORY: Record<string, FoodCategoryItem[]> = {
  Chicken: [
    { food_name: 'Butter Chicken', cuisine: 'Mughlai', category: 'Chicken', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Chicken Tikka Masala', cuisine: 'North Indian', category: 'Chicken', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Chettinad Chicken', cuisine: 'South Indian', category: 'Chicken', vegetarian: 'No', spice_level: 'Very Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Herb Roast Chicken', cuisine: 'Continental', category: 'Chicken', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Chicken Korma', cuisine: 'Awadhi', category: 'Chicken', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Spicy Buffalo Wings', cuisine: 'American', category: 'Chicken', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Chicken 65', cuisine: 'South Indian', category: 'Chicken', vegetarian: 'No', spice_level: 'Very Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Murgh Malai Tikka', cuisine: 'Mughlai', category: 'Chicken', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Kadai Chicken Masala', cuisine: 'Punjabi', category: 'Chicken', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Tandoori Roast Chicken', cuisine: 'North Indian', category: 'Chicken', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Chicken Sukka', cuisine: 'Mangalorean', category: 'Chicken', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Chicken Cafreal', cuisine: 'Goan', category: 'Chicken', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
  ],
  Biryani: [
    { food_name: 'Hyderabadi Dum Mutton Biryani', cuisine: 'Hyderabadi', category: 'Biryani', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Awadhi Chicken Biryani', cuisine: 'Lucknowi', category: 'Biryani', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Royal Vegetable Dum Biryani', cuisine: 'Mughlai', category: 'Biryani', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Malabar Prawn Biryani', cuisine: 'Kerala Coastal', category: 'Biryani', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Kolkatta Mutton Biryani', cuisine: 'Bengali', category: 'Biryani', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Ambur Chicken Biryani', cuisine: 'Tamil Nadu', category: 'Biryani', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Thalassery Fish Biryani', cuisine: 'Kerala', category: 'Biryani', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Chettinad Mushroom Biryani', cuisine: 'South Indian', category: 'Biryani', vegetarian: 'Yes', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Egg Dum Biryani', cuisine: 'Hyderabadi', category: 'Biryani', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Lucknowi Kathal (Jackfruit) Biryani', cuisine: 'Awadhi', category: 'Biryani', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
  ],
  Curry: [
    { food_name: 'Dal Makhani', cuisine: 'North Indian', category: 'Curry', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Mutton Rogan Josh', cuisine: 'Kashmiri', category: 'Curry', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Goan Fish Curry', cuisine: 'Goan Coastal', category: 'Curry', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Thai Green Curry', cuisine: 'Pan-Asian', category: 'Curry', vegetarian: 'Yes', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Palak Paneer', cuisine: 'North Indian', category: 'Curry', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Paneer Butter Masala', cuisine: 'North Indian', category: 'Curry', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Chana Masala', cuisine: 'Punjabi', category: 'Curry', vegetarian: 'Yes', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Malai Kofta Curry', cuisine: 'Mughlai', category: 'Curry', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Rajma Masala', cuisine: 'Punjabi', category: 'Curry', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Kadai Mushroom Gravy', cuisine: 'North Indian', category: 'Curry', vegetarian: 'Yes', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'South Indian Meen Curry', cuisine: 'Kerala', category: 'Curry', vegetarian: 'No', spice_level: 'Very Spicy', image_url: '/images/dish_isolated.png' },
  ],
  Paneer: [
    { food_name: 'Paneer Tikka', cuisine: 'North Indian', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Paneer Butter Masala', cuisine: 'North Indian', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Kadai Paneer', cuisine: 'North Indian', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Palak Paneer', cuisine: 'North Indian', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Shahi Paneer', cuisine: 'Mughlai', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Tawa Paneer Masala', cuisine: 'Punjabi', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Paneer Lababdar', cuisine: 'North Indian', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Matar Paneer', cuisine: 'Punjabi', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Achari Paneer Tikka', cuisine: 'Rajasthani', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Paneer Bhurji Gravy', cuisine: 'North Indian', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
  ],
  Seafood: [
    { food_name: 'Goan Prawn Curry', cuisine: 'Goan Coastal', category: 'Seafood', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Tawa Fried Pomfret', cuisine: 'Maharashtrian', category: 'Seafood', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Grilled Salmon with Lemon Butter', cuisine: 'Continental', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Fresh Oysters with Mignonette', cuisine: 'French', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Garlic Butter Prawns', cuisine: 'Continental', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Crispy Fish & Chips', cuisine: 'British', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Malabar Fish Curry', cuisine: 'Kerala', category: 'Seafood', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Lobster Thermidor', cuisine: 'French', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Seared Tuna Tartare', cuisine: 'International', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Prawn Koliwada Fry', cuisine: 'Mumbai Coastal', category: 'Seafood', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
  ],
  'Lamb & Mutton': [
    { food_name: 'Mutton Rogan Josh', cuisine: 'Kashmiri', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Roasted Lamb Chops with Rosemary', cuisine: 'Continental', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Lucknowi Galouti Kebab', cuisine: 'Awadhi', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Rajasthani Laal Maas', cuisine: 'Rajasthani', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Very Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Seekh Kebab', cuisine: 'Mughlai', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Mutton Sukka Fry', cuisine: 'South Indian', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Very Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Kashmiri Gushtaba', cuisine: 'Kashmiri', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Bhuna Gosht Masala', cuisine: 'North Indian', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Braised Lamb Shank', cuisine: 'Continental', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Dhaba Mutton Curry', cuisine: 'Punjabi', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
  ],
  Tandoori: [
    { food_name: 'Tandoori Chicken', cuisine: 'North Indian', category: 'Tandoori', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Paneer Tikka', cuisine: 'North Indian', category: 'Tandoori', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Murgh Malai Tikka', cuisine: 'Mughlai', category: 'Tandoori', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Tandoori Prawns', cuisine: 'Coastal Indian', category: 'Tandoori', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Seekh Kebab', cuisine: 'Mughlai', category: 'Tandoori', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Tandoori Soya Chaap', cuisine: 'North Indian', category: 'Tandoori', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Tandoori Fish Tikka', cuisine: 'Punjabi', category: 'Tandoori', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Tandoori Mushroom Skewers', cuisine: 'North Indian', category: 'Tandoori', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Afghani Murgh Kebab', cuisine: 'Mughlai', category: 'Tandoori', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Tandoori Tangdi Kebab', cuisine: 'North Indian', category: 'Tandoori', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
  ],
  Vegetarian: [
    { food_name: 'Dal Tadka with Cumin Basmati', cuisine: 'North Indian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Wild Mushroom Risotto with Truffle', cuisine: 'Italian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Caprese Salad with Buffalo Mozzarella', cuisine: 'Italian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Baingan Bharta', cuisine: 'North Indian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Eggplant Parmesan', cuisine: 'Italian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Chana Masala', cuisine: 'Punjabi', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Veg Kolhapuri Curry', cuisine: 'Maharashtrian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Very Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Bhindi Masala Fry', cuisine: 'North Indian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Crispy Vegetable Stir-Fry', cuisine: 'Pan-Asian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Creamy Corn & Spinach Bake', cuisine: 'Continental', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
  ],
  'Pasta & Continental': [
    { food_name: 'Spaghetti Carbonara', cuisine: 'Italian', category: 'Pasta & Continental', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: "Penne all'Arrabbiata", cuisine: 'Italian', category: 'Pasta & Continental', vegetarian: 'Yes', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Pasta al Pesto Genovese', cuisine: 'Italian', category: 'Pasta & Continental', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Classic Cheeseburger', cuisine: 'American', category: 'Pasta & Continental', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Grilled Ribeye Steak', cuisine: 'Continental', category: 'Pasta & Continental', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Fettuccine Alfredo with Truffle', cuisine: 'Italian', category: 'Pasta & Continental', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Four-Cheese Baked Lasagna', cuisine: 'Italian', category: 'Pasta & Continental', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Truffle Macaroni & Cheese', cuisine: 'American', category: 'Pasta & Continental', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Classic Caesar Salad with Chicken', cuisine: 'Continental', category: 'Pasta & Continental', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Garlic Butter Crust Focaccia', cuisine: 'Italian', category: 'Pasta & Continental', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
  ],
  Dessert: [
    { food_name: 'Dark Chocolate Fondant Cake', cuisine: 'French', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Shahi Tukda with Rabdi', cuisine: 'Awadhi', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Classic Crème Brûlée', cuisine: 'French', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Gulab Jamun with Roasted Pistachio', cuisine: 'North Indian', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Fresh Berry Fruit Tart', cuisine: 'French', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Saffron Rasmalai', cuisine: 'North Indian', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Classic Italian Tiramisu', cuisine: 'Italian', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Almond & Pistachio Kulfi', cuisine: 'North Indian', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Warm Cinnamon Apple Pie', cuisine: 'American', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'New York Baked Cheesecake', cuisine: 'American', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
  ],
}


// Fast safe fetch with timeout to avoid browser hang or unhandled exceptions
async function safeFetchJson(url: string, options?: RequestInit, timeoutMs = 1500): Promise<any | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const response = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timer)
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// GET /food-categories
// ---------------------------------------------------------------------------
export async function getCategories(): Promise<string[]> {
  const data = await safeFetchJson(`${API_BASE_URL}/food-categories`)
  if (data && Array.isArray(data.categories) && data.categories.length > 0) {
    return data.categories
  }
  return FALLBACK_CATEGORIES
}

// ---------------------------------------------------------------------------
// GET /foods?category=...
// ---------------------------------------------------------------------------
export async function getFoods(category: string): Promise<FoodCategoryItem[]> {
  const params = new URLSearchParams({ category })
  const data = await safeFetchJson(`${API_BASE_URL}/foods?${params}`)
  if (data && Array.isArray(data.foods) && data.foods.length > 0) {
    return data.foods
  }

  // Fallback match by category key
  if (FALLBACK_FOODS_BY_CATEGORY[category]) {
    return FALLBACK_FOODS_BY_CATEGORY[category]
  }

  // Fuzzy match category
  const lowerCat = (category || '').toLowerCase()
  for (const [key, items] of Object.entries(FALLBACK_FOODS_BY_CATEGORY)) {
    if (lowerCat.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCat)) {
      return items
    }
  }

  // Default slice across popular dishes
  return [
    ...FALLBACK_FOODS_BY_CATEGORY.Chicken.slice(0, 2),
    ...FALLBACK_FOODS_BY_CATEGORY.Biryani.slice(0, 2),
    ...FALLBACK_FOODS_BY_CATEGORY.Paneer.slice(0, 2),
  ]
}

// ---------------------------------------------------------------------------
// GET /wine-types
// ---------------------------------------------------------------------------
export async function getWineTypes(): Promise<string[]> {
  const data = await safeFetchJson(`${API_BASE_URL}/wine-types`)
  if (data && Array.isArray(data.wine_types) && data.wine_types.length > 0) {
    return data.wine_types
  }
  return ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert']
}

// ---------------------------------------------------------------------------
// GET /wines?wine_type=...
// ---------------------------------------------------------------------------
export async function getWinesByType(wineType?: string): Promise<any[]> {
  const url = wineType
    ? `${API_BASE_URL}/wines?${new URLSearchParams({ wine_type: wineType })}`
    : `${API_BASE_URL}/wines`
  const data = await safeFetchJson(url)
  if (data && Array.isArray(data.wines) && data.wines.length > 0) {
    return data.wines
  }

  if (wineType) {
    const target = wineType.toLowerCase()
    return staticWines.filter((w) => w.type.toLowerCase() === target)
  }
  return staticWines
}

// ---------------------------------------------------------------------------
export function isValidFoodQuery(foodName: string): boolean {
  if (!foodName || typeof foodName !== 'string') return false
  const normalized = foodName.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  const clean = normalized.trim()
  if (clean.length < 2 || clean.length > 100) return false

  const letters = clean.replace(/[^a-zA-Z]/g, '')
  if (letters.length < 2) return false

  const vowels = new Set(['a', 'e', 'i', 'o', 'u', 'y', 'A', 'E', 'I', 'O', 'U', 'Y'])
  let vowelCount = 0
  for (const c of letters) {
    if (vowels.has(c)) vowelCount++
  }
  if (letters.length >= 3 && vowelCount === 0) return false

  const cleanLower = clean.toLowerCase()
  const smashes = ['asdfgh', 'sdfghj', 'dfghjk', 'fghjkl', 'qwerty', 'wertyu', 'zxcvbn', 'asdfasdf']
  for (const s of smashes) {
    if (cleanLower.includes(s)) return false
  }

  if (/(.)\1{4,}/i.test(cleanLower)) return false

  const words = clean.match(/[a-zA-Z]+/g) || []
  for (const w of words) {
    const wLower = w.toLowerCase()
    let wVowels = 0
    for (const c of wLower) {
      if (vowels.has(c)) wVowels++
    }
    if (w.length >= 4 && wVowels === 0) return false
    if (w.length >= 8 && (wVowels / w.length) < 0.18) return false
  }

  return true
}



// ---------------------------------------------------------------------------
// POST /recommend (Food → Wine)
// ---------------------------------------------------------------------------
export async function fetchFoodRecommendations(foodName: string): Promise<WineRecommendation[]> {
  if (!isValidFoodQuery(foodName)) {
    throw new Error('Invalid food name. Please enter a valid dish name.')
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 2000)
    const res = await fetch(`${API_BASE_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ food_name: foodName }),
      signal: controller.signal
    })
    clearTimeout(timer)

    if (res.status === 400) {
      const errData = await res.json().catch(() => null)
      const detailMsg = typeof errData?.detail === 'string' ? errData.detail : typeof errData?.detail?.error === 'string' ? errData.detail.error : 'Invalid food name. Please enter a valid dish name.'
      throw new Error(detailMsg)
    }

    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        return data.recommendations
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes('Invalid food name')) {
      throw err
    }
  }

  // Sommelier pairing engine fallback based on culinary affinities
  return computeFallbackWineRecommendations(foodName)
}


function inferFoodAttributes(foodName: string) {
  const query = (foodName || '').toLowerCase()

  // 1. Try exact or partial match in staticFoods
  const foundInStatic = staticFoods.find((f: any) =>
    f.name.toLowerCase() === query || f.name.toLowerCase().includes(query) || query.includes(f.name.toLowerCase())
  )
  if (foundInStatic) return foundInStatic

  // 2. Infer attributes based on dish semantics
  let fat: 'low' | 'medium' | 'high' = 'medium'
  let richness: 'low' | 'medium' | 'high' = 'medium'
  let spiceLevel: 'low' | 'medium' | 'high' = 'low'
  let saltLevel: 'low' | 'medium' | 'high' = 'medium'
  let sweetness: 'low' | 'medium' | 'high' = 'low'
  let flavorProfile: string[] = ['savory']

  // Red Meats / Lamb / Mutton / Steak / Ribeye / Kebabs / Laal Maas
  if (query.match(/lamb|mutton|rogan|steak|ribeye|beef|kebab|seekh|laal maas|pork|ribs|burger/i)) {
    fat = 'high'
    richness = 'high'
    flavorProfile = ['savory', 'charred', 'beefy', 'peppery']
    if (query.match(/spicy|laal|chettinad|chili/i)) spiceLevel = 'high'
  }
  // Rich Butter / Creamy / Makhani / Korma / Alfredo / Paneer Butter
  else if (query.match(/butter|makhani|korma|creamy|cream|alfredo|carbonara|paneer butter|shahi/i)) {
    fat = 'high'
    richness = 'high'
    flavorProfile = ['creamy', 'buttery', 'savory', 'rich']
    if (query.match(/tikka|masala|spicy/i)) spiceLevel = 'medium'
  }
  // Seafood / Fish / Prawn / Salmon / Oyster / Pomfret / Sushi
  else if (query.match(/fish|prawn|seafood|salmon|oyster|pomfret|crab|lobster|sushi|tuna/i)) {
    fat = query.match(/salmon|tuna/i) ? 'medium' : 'low'
    richness = 'medium'
    flavorProfile = ['citrus', 'buttery', 'delicate', 'mineral']
    if (query.match(/spicy|chettinad|goan|tawa/i)) spiceLevel = 'high'
  }
  // Biryani & Fragrant Rice
  else if (query.match(/biryani|pulao|rice/i)) {
    richness = 'medium'
    fat = 'medium'
    spiceLevel = query.match(/spicy|hyderabadi/i) ? 'high' : 'medium'
    flavorProfile = ['savory', 'peppery', 'spicy', 'herb']
  }
  // Spicy / Chettinad / Vindaloo / Thai / Wings / Kadai
  else if (query.match(/chettinad|spicy|chili|wings|vindaloo|thai green|kadai|tikka/i)) {
    spiceLevel = 'high'
    richness = 'medium'
    fat = 'medium'
    flavorProfile = ['spicy', 'tangy', 'savory', 'peppery']
  }
  // Desserts / Sweets / Chocolate / Cake / Brulee / Tart / Gulab / Shahi Tukda
  else if (query.match(/chocolate|dessert|cake|brulee|tart|tukda|gulab|sweet|pie|fondant/i)) {
    sweetness = 'high'
    richness = 'high'
    fat = 'high'
    flavorProfile = ['sweet', 'chocolate', 'vanilla', 'caramel']
  }
  // Vegetarian / Salad / Mushroom / Risotto / Pasta / Pesto
  else if (query.match(/paneer|vegetarian|mushroom|risotto|pasta|salad|eggplant|dal|pesto|caprese/i)) {
    richness = query.match(/risotto|paneer|dal/i) ? 'high' : 'medium'
    fat = query.match(/risotto|paneer/i) ? 'medium' : 'low'
    flavorProfile = ['herb', 'earthy', 'fresh', 'savory']
  }

  return {
    name: foodName,
    richness,
    fat,
    spiceLevel,
    saltLevel,
    sweetness,
    flavorProfile,
  }
}

function computeFallbackWineRecommendations(foodName: string): WineRecommendation[] {
  const foodObj = inferFoodAttributes(foodName)

  const scored = staticWines.map((wine) => {
    const { score: matchScore, reasons } = scorePairing(wine, foodObj)
    const normalizedScore = Math.min(0.98, Math.max(0.75, Math.round((0.78 + matchScore * 0.03) * 100) / 100))
    return { wine, score: normalizedScore, reasons }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, 6).map(({ wine, score }) => ({
    wine_name: wine.name,
    winery: wine.winery,
    wine_type: wine.type.charAt(0).toUpperCase() + wine.type.slice(1),
    variety: wine.grape,
    region: wine.region,
    body: wine.body ? wine.body.charAt(0).toUpperCase() + wine.body.slice(1) : 'Medium',
    sweetness: wine.sweetness ? wine.sweetness.charAt(0).toUpperCase() + wine.sweetness.slice(1) : 'Dry',
    acidity: wine.acidity ? wine.acidity.charAt(0).toUpperCase() + wine.acidity.slice(1) : 'Medium',
    tannin: wine.tannin ? wine.tannin.charAt(0).toUpperCase() + wine.tannin.slice(1) : 'Medium',
    score,
    price: wine.price,
    rating: wine.rating,
    serving_temp: wine.servingTemp,
    image_url: resolveWineCloudinaryImage(wine.name, wine.type),
    _foodName: foodName,
  }))
}

// ---------------------------------------------------------------------------
// POST /recommend-food (Wine → Food)
// ---------------------------------------------------------------------------
export async function fetchWineRecommendations(wineName: string): Promise<FoodRecommendation[]> {
  const data = await safeFetchJson(`${API_BASE_URL}/recommend-food`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wine_name: wineName }),
  })

  if (data && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
    return data.recommendations
  }

  // Sommelier pairing engine fallback for Wine -> Food
  return computeFallbackFoodRecommendations(wineName)
}

function computeFallbackFoodRecommendations(wineName: string): FoodRecommendation[] {
  const q = (wineName || '').toLowerCase()

  // 1. Match wine from static list
  const matchedWine = staticWines.find(
    (w) => w.name.toLowerCase().includes(q) || q.includes(w.name.toLowerCase())
  ) || {
    id: 'generic',
    name: wineName,
    winery: 'Estate Winery',
    type: q.includes('red') || q.includes('shiraz') || q.includes('cabernet') ? 'red' : q.includes('white') || q.includes('chenin') || q.includes('sauvignon') ? 'white' : q.includes('sparkling') || q.includes('brut') ? 'sparkling' : q.includes('rose') || q.includes('rosé') ? 'rosé' : q.includes('dessert') ? 'dessert' : 'red',
    body: q.includes('full') ? 'full' : q.includes('light') ? 'light' : 'medium',
    acidity: q.includes('high') ? 'high' : 'medium',
    tannin: q.includes('high') ? 'high' : 'medium',
    sweetness: q.includes('sweet') ? 'sweet' : q.includes('off-dry') ? 'off-dry' : 'dry',
    flavorNotes: ['balanced', 'aromatic']
  }

  // 2. Score across all fallback foods (from staticFoods and FALLBACK_FOODS_BY_CATEGORY)
  const allFoodsMap = new Map<string, any>()

  staticFoods.forEach((f: any) => {
    allFoodsMap.set(f.name.toLowerCase(), f)
  })

  Object.values(FALLBACK_FOODS_BY_CATEGORY).flat().forEach((f) => {
    if (!allFoodsMap.has(f.food_name.toLowerCase())) {
      const inferred = inferFoodAttributes(f.food_name)
      allFoodsMap.set(f.food_name.toLowerCase(), {
        ...inferred,
        name: f.food_name,
        cuisine: f.cuisine || 'Curated',
        category: f.category || 'Gourmet',
        vegetarian: f.vegetarian || 'No',
        spice_level: f.spice_level || 'Medium',
        image_url: f.image_url || '/images/dish_isolated.png'
      })
    }
  })

  const scoredFoods = Array.from(allFoodsMap.values()).map((food) => {
    const { score: matchScore } = scorePairing(matchedWine, food)
    const normalizedScore = Math.min(0.98, Math.max(0.75, Math.round((0.78 + matchScore * 0.03) * 100) / 100))
    return { food, score: normalizedScore }
  })

  scoredFoods.sort((a, b) => b.score - a.score)

  return scoredFoods.slice(0, 6).map(({ food, score }) => ({
    food_name: food.name,
    cuisine: food.cuisine || 'Gourmet Cuisine',
    category: food.category || 'Specialty Dish',
    vegetarian: food.vegetarian || (food.richness === 'low' ? 'Yes' : 'No'),
    spice_level: food.spice_level || (food.spiceLevel === 'high' ? 'Spicy' : food.spiceLevel === 'medium' ? 'Medium' : 'Mild'),
    score,
    image_url: food.image_url || '/images/dish_isolated.png',
    _wineName: wineName,
  }))
}
