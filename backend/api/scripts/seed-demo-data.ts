import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load backend environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/api/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// ============================================================================
// CONSTANTS & DETERMINISTIC UUID DEFINITIONS
// ============================================================================

export const DEMO_WINERY_FLAGSHIP_ID = '00000000-0000-4000-d000-000000000999';

// 9 Demo Wineries (6 published, 2 draft/pending approvals, 1 archived)
export const DEMO_WINERIES = [
  {
    id: DEMO_WINERY_FLAGSHIP_ID,
    name: 'Godavari Hills Estate',
    slug: 'godavari-hills-estate',
    description: 'Flagship boutique estate nestled along the high-elevation banks of the upper Godavari River. Renowned for old-vine Shiraz and handcrafted Méthode Traditionnelle sparkling wines. (Official Demo Estate)',
    established_year: 2014,
    email: 'estate@godavarihills.in',
    phone: '+91 253 294 1101',
    website: 'https://godavarihills.demo.vinosphere.in',
    address: 'Gangapur Dam Catchment Road, Post Ganghavare',
    city: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    latitude: 20.0152,
    longitude: 73.7028,
    logo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=85',
    opening_time: '10:30:00',
    closing_time: '21:30:00',
    verified: true,
    status: 'published' as const,
    awards: [
      { year: 2023, title: 'Decanter Asia Wine Awards - Gold', wine: 'Reserve Shiraz 2020' },
      { year: 2024, title: 'Indian Wine Challenge - Best Sparkling Estate', wine: 'Cuvée Royale Brut' }
    ],
    timeline: [
      { year: '2014', title: 'Estate Founded', description: 'Planted first 35 acres of Shiraz and Chenin Blanc on basalt terroir.' },
      { year: '2018', title: 'Gravity-Flow Winery', description: 'Commissioned state-of-the-art temperature-controlled stainless steel cellar.' },
      { year: '2023', title: 'Organic Viticulture', description: 'Achieved 100% solar-powered estate and sustainable certification.' }
    ]
  },
  {
    id: '00000000-0000-4000-d000-000000000002',
    name: 'Sahyadri Valley Wines',
    slug: 'sahyadri-valley-wines',
    description: 'Picturesque hillside estate situated at the foothills of the Western Ghats. Specializing in high-altitude crisp Sauvignon Blanc and elegant Cabernet-Shiraz blends. (Demo Estate)',
    established_year: 2016,
    email: 'concierge@sahyadrivalley.demo.in',
    phone: '+91 253 294 1102',
    website: 'https://sahyadrivalley.demo.vinosphere.in',
    address: 'Girnare Foothills Route, Taluka Dindori',
    city: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    latitude: 20.0842,
    longitude: 73.7421,
    logo_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=1200&q=85',
    opening_time: '11:00:00',
    closing_time: '21:00:00',
    verified: true,
    status: 'published' as const,
    awards: [{ year: 2024, title: 'Sommelier Guild India - Best White Wine', wine: 'Sahyadri Reserve Chenin Blanc' }],
    timeline: [{ year: '2016', title: 'Estate Planted', description: 'Terraced vineyards established on late-ripening hillside slopes.' }]
  },
  {
    id: '00000000-0000-4000-d000-000000000003',
    name: 'Trimbak Vineyards',
    slug: 'trimbak-vineyards',
    description: 'Heritage estate honoring ancestral viticulture traditions near the sacred Brahmagiri hills. Famous for oak-aged full-bodied reds and barrel-fermented Viognier. (Demo Estate)',
    established_year: 2011,
    email: 'visit@trimbakvineyards.demo.in',
    phone: '+91 253 294 1103',
    website: 'https://trimbakvineyards.demo.vinosphere.in',
    address: 'Trimbak Highway, Near Anjaneri Hills',
    city: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    latitude: 19.9324,
    longitude: 73.5412,
    logo_url: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=1200&q=85',
    opening_time: '10:00:00',
    closing_time: '20:30:00',
    verified: true,
    status: 'published' as const,
    awards: [{ year: 2022, title: 'National Wine Trophy - Best Full Bodied Red', wine: 'Brahmagiri Grand Reserve' }],
    timeline: [{ year: '2011', title: 'First Barrel Stored', description: 'French allier oak cellar established for small batch aging.' }]
  },
  {
    id: '00000000-0000-4000-d000-000000000004',
    name: 'Deccan Crest Winery',
    slug: 'deccan-crest-winery',
    description: 'Modern architectural winery situated on a windy plateau overlooking Godavari waters. Celebrated for refreshing Rosés, fruity Zinfandels, and lively tasting pavilions. (Demo Estate)',
    established_year: 2018,
    email: 'hello@deccancrest.demo.in',
    phone: '+91 253 294 1104',
    website: 'https://deccancrest.demo.vinosphere.in',
    address: 'Deccan Plateau Road, Govardhan Village',
    city: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    latitude: 20.0381,
    longitude: 73.6821,
    logo_url: 'https://images.unsplash.com/photo-1553122180-2c700cb75571?w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=1200&q=85',
    opening_time: '11:00:00',
    closing_time: '22:00:00',
    verified: true,
    status: 'published' as const,
    awards: [{ year: 2024, title: 'India Wine Awards - Double Gold Rosé', wine: 'Deccan Crest Blush Zinfandel' }],
    timeline: [{ year: '2018', title: 'Tasting Deck Opened', description: 'Unveiled panoramic tasting deck over the Godavari reservoir.' }]
  },
  {
    id: '00000000-0000-4000-d000-000000000005',
    name: 'Vinewood Estate',
    slug: 'vinewood-estate',
    description: 'Exclusive private estate and boutique cellar offering limited production natural wines and estate-grown Cabernet Franc. (Demo Estate)',
    established_year: 2019,
    email: 'contact@vinewoodestate.demo.in',
    phone: '+91 253 294 1105',
    website: 'https://vinewoodestate.demo.vinosphere.in',
    address: 'Vaitarna Backwaters Route, Igatpuri-Nashik Belt',
    city: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    latitude: 19.8211,
    longitude: 73.5512,
    logo_url: 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1543418219-44e30b057fea?w=1200&q=85',
    opening_time: '11:30:00',
    closing_time: '20:00:00',
    verified: true,
    status: 'published' as const,
    awards: [{ year: 2023, title: 'Boutique Producer of the Year', wine: 'Vinewood Artisanal Red' }],
    timeline: [{ year: '2019', title: 'Estate Planted', description: 'First biodynamic vineyard planted on gravelly volcanic soils.' }]
  },
  {
    id: '00000000-0000-4000-d000-000000000006',
    name: 'Nashik Heritage Wines',
    slug: 'nashik-heritage-wines',
    description: 'Pioneering cooperative estate supporting local grape growers across 12 villages, producing high-value crowd-pleasing Chenin Blanc and sparkling brut. (Demo Estate)',
    established_year: 2012,
    email: 'info@nashikheritage.demo.in',
    phone: '+91 253 294 1106',
    website: 'https://nashikheritage.demo.vinosphere.in',
    address: 'Dindori Wine Highway, Near Pimpalgaon',
    city: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    latitude: 20.1512,
    longitude: 73.8123,
    logo_url: 'https://images.unsplash.com/photo-1614742468798-e7c65d642398?w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&q=85',
    opening_time: '10:00:00',
    closing_time: '21:00:00',
    verified: true,
    status: 'published' as const,
    awards: [{ year: 2022, title: 'Indian Consumer Choice Award', wine: 'Heritage Sparkling Brut' }],
    timeline: [{ year: '2012', title: 'Cooperative Launch', description: 'Partnered with 40 local multi-generational grape farming families.' }]
  },
  // 2 Pending / Draft Wineries (for Superadmin Approvals Page testing)
  {
    id: '00000000-0000-4000-d000-000000000007',
    name: 'Riverstone Vineyards',
    slug: 'riverstone-vineyards-pending',
    description: 'Newly registered artisanal riverfront vineyard applying for VinoSphere Certified Estate status. Focuses on small-batch organic Grenache. (Pending Admin Verification)',
    established_year: 2024,
    email: 'admin@riverstonevineyards.demo.in',
    phone: '+91 253 294 1107',
    website: 'https://riverstone.demo.vinosphere.in',
    address: 'Plot 44, Gangapur Backwaters, Someshwar',
    city: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    latitude: 20.0092,
    longitude: 73.7314,
    logo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=85',
    opening_time: '11:00:00',
    closing_time: '20:00:00',
    verified: false,
    status: 'draft' as const,
    awards: [],
    timeline: [{ year: '2024', title: 'Application Submitted', description: 'Submitted FSSAI and Excise permits for certification.' }]
  },
  {
    id: '00000000-0000-4000-d000-000000000008',
    name: 'Silver Oak Valley',
    slug: 'silver-oak-valley-pending',
    description: 'Upcoming luxury vineyard and wellness resort seeking marketplace listing and sommelier verification. (Pending Admin Verification)',
    established_year: 2024,
    email: 'onboarding@silveroakvalley.demo.in',
    phone: '+91 253 294 1108',
    website: 'https://silveroakvalley.demo.vinosphere.in',
    address: 'Silver Oak Ridge, Trimbakeshwar Road',
    city: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    latitude: 19.9481,
    longitude: 73.5932,
    logo_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=1200&q=85',
    opening_time: '10:00:00',
    closing_time: '21:00:00',
    verified: false,
    status: 'draft' as const,
    awards: [],
    timeline: [{ year: '2024', title: 'Estate Construction', description: 'Cellar facility completed, awaiting final sensory inspection.' }]
  },
  // 1 Archived / Rejected Winery (for Admin historical status coverage)
  {
    id: '00000000-0000-4000-d000-000000000009',
    name: 'Panchavati Cellars',
    slug: 'panchavati-cellars-archived',
    description: 'Historical archive entry for former cooperative cellar whose registration was discontinued. (Archived Record)',
    established_year: 2008,
    email: 'archive@panchavati.demo.in',
    phone: '+91 253 294 1109',
    website: 'https://panchavati.demo.vinosphere.in',
    address: 'Old Agra Road, Panchavati',
    city: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    latitude: 20.0121,
    longitude: 73.8012,
    logo_url: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=200&q=80',
    banner_url: 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=1200&q=85',
    opening_time: '10:00:00',
    closing_time: '18:00:00',
    verified: false,
    status: 'archived' as const,
    awards: [],
    timeline: [{ year: '2008', title: 'Historic Record', description: 'Archived from platform directory.' }]
  }
];

// ============================================================================
// DEMO USERS (Patrons & Winery Admin)
// ============================================================================
export const DEMO_USERS = [
  {
    id: '00000000-0000-4000-ba00-000000000999',
    email: 'estate@godavarihills.in',
    full_name: 'Rajesh Godavari',
    phone: '+91 98230 11999',
    role: 'winery_admin',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    city: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    experience_level: 'Advanced',
    favorite_wine_types: ['Red', 'Sparkling'],
    primary_interest: 'Estate Management'
  },
  {
    id: '00000000-0000-4000-ba00-000000000001',
    email: 'ananya.sharma@demo.vinosphere.in',
    full_name: 'Ananya Sharma',
    phone: '+91 98200 44101',
    role: 'user',
    winery_id: null,
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    experience_level: 'Intermediate',
    favorite_wine_types: ['White', 'Sparkling'],
    primary_interest: 'Tasting & Food Pairing'
  },
  {
    id: '00000000-0000-4000-ba00-000000000002',
    email: 'vikram.singhania@demo.vinosphere.in',
    full_name: 'Vikramaditya Singhania',
    phone: '+91 98110 55202',
    role: 'user',
    winery_id: null,
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    experience_level: 'Connoisseur',
    favorite_wine_types: ['Red'],
    primary_interest: 'Vintage Collecting'
  },
  {
    id: '00000000-0000-4000-ba00-000000000003',
    email: 'meera.kulkarni@demo.vinosphere.in',
    full_name: 'Dr. Meera Kulkarni',
    phone: '+91 98220 66303',
    role: 'user',
    winery_id: null,
    city: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    experience_level: 'Advanced',
    favorite_wine_types: ['Red', 'Rose'],
    primary_interest: 'Vineyard Tourism'
  },
  {
    id: '00000000-0000-4000-ba00-000000000004',
    email: 'rohan.deshmukh@demo.vinosphere.in',
    full_name: 'Rohan Deshmukh',
    phone: '+91 98900 77404',
    role: 'user',
    winery_id: null,
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    experience_level: 'Beginner',
    favorite_wine_types: ['White', 'Dessert'],
    primary_interest: 'Weekend Tours'
  }
];

// ============================================================================
// WINES DATA (35 Realistic Bottles across Red, White, Rose, Sparkling, Dessert)
// ============================================================================
export interface DemoWineDef {
  id: string;
  winery_id: string;
  name: string;
  slug: string;
  wine_type: 'Red' | 'White' | 'Rose' | 'Sparkling' | 'Dessert' | 'Fortified';
  grape_variety: string;
  vintage: number;
  alcohol_percentage: number;
  body: 'Light' | 'Medium' | 'Full';
  sweetness: 'Dry' | 'Off Dry' | 'Sweet';
  acidity: 'Low' | 'Medium' | 'High';
  tannin?: 'Low' | 'Medium' | 'High';
  serving_temperature: string;
  description: string;
  food_pairings: string;
  taste_notes: string;
  // Inventory fields
  price: number;
  stock_quantity: number;
  sku: string;
  featured: boolean;
  // Image
  image_url: string;
}

export const DEMO_WINES: DemoWineDef[] = [
  // --- GODAVARI HILLS ESTATE (Flagship Demo Winery: 12 wines) ---
  {
    id: '00000000-0000-4000-ca00-000000000001',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    name: 'Godavari Reserve Shiraz',
    slug: 'godavari-reserve-shiraz-2021',
    wine_type: 'Red',
    grape_variety: 'Shiraz',
    vintage: 2021,
    alcohol_percentage: 13.8,
    body: 'Full',
    sweetness: 'Dry',
    acidity: 'Medium',
    tannin: 'High',
    serving_temperature: '16-18°C',
    description: 'Aged for 14 months in medium-toasted French oak barriques. Rich aromas of crushed black pepper, dark ripe plum, and subtle hints of mocha with velvety, structural tannins.',
    food_pairings: 'Tandoori Lamb Chops, Rogan Josh, Aged Cheddar, Grilled Portobello Mushrooms',
    taste_notes: 'Black Pepper, Ripe Blackberry, Dark Chocolate, Toasted Vanilla',
    price: 1850,
    stock_quantity: 240,
    sku: 'GHE-SHZ-2021',
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000002',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    name: 'Godavari Estate Chenin Blanc',
    slug: 'godavari-estate-chenin-blanc-2023',
    wine_type: 'White',
    grape_variety: 'Chenin Blanc',
    vintage: 2023,
    alcohol_percentage: 12.5,
    body: 'Medium',
    sweetness: 'Off Dry',
    acidity: 'High',
    serving_temperature: '8-10°C',
    description: 'Cool-fermented in stainless steel tanks to preserve crisp minerality and vibrant fruit expression. Tropical passion fruit, green apple, and fragrant jasmine notes.',
    food_pairings: 'Butter Garlic Prawns, Paneer Tikka, Goan Fish Curry, Mild Asian Salads',
    taste_notes: 'Green Apple, Passion Fruit, Guava, White Jasmine',
    price: 950,
    stock_quantity: 380,
    sku: 'GHE-CHB-2023',
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000003',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    name: 'Cuvée Royale Brut Sparkling',
    slug: 'cuvee-royale-brut-sparkling',
    wine_type: 'Sparkling',
    grape_variety: 'Chenin Blanc & Chardonnay',
    vintage: 2022,
    alcohol_percentage: 12.0,
    body: 'Medium',
    sweetness: 'Dry',
    acidity: 'High',
    serving_temperature: '6-8°C',
    description: 'Traditional bottle-fermented Méthode Cap Classique aged on yeast lees for 18 months. Delicate persistent perlage with notes of toasted brioche, lemon zest, and crisp pear.',
    food_pairings: 'Fresh Oysters, Sushi, Canapés, Calamari Fritters, Brie Cheese',
    taste_notes: 'Toasted Brioche, Crisp Green Pear, Meyer Lemon, Fresh Mineral',
    price: 1950,
    stock_quantity: 180,
    sku: 'GHE-BRT-2022',
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000004',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    name: 'Godavari Valley Cabernet Sauvignon',
    slug: 'godavari-cabernet-sauvignon-2020',
    wine_type: 'Red',
    grape_variety: 'Cabernet Sauvignon',
    vintage: 2020,
    alcohol_percentage: 14.0,
    body: 'Full',
    sweetness: 'Dry',
    acidity: 'Medium',
    tannin: 'High',
    serving_temperature: '16-18°C',
    description: 'Selected from low-yield hilltop blocks. Shows dark cassis, cedar wood, graphite, and dried herbs with firm aging potential.',
    food_pairings: 'Grilled Ribeye Steak, Mutton Biryani, Roasted Duck, Blue Cheese',
    taste_notes: 'Blackcurrant, Cedar Wood, Tobacco Leaf, Black Cherry',
    price: 2200,
    stock_quantity: 150,
    sku: 'GHE-CS-2020',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000005',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    name: 'Blush Horizon Zinfandel Rosé',
    slug: 'blush-horizon-zinfandel-rose-2023',
    wine_type: 'Rose',
    grape_variety: 'Zinfandel',
    vintage: 2023,
    alcohol_percentage: 11.5,
    body: 'Light',
    sweetness: 'Off Dry',
    acidity: 'Medium',
    tannin: 'Low',
    serving_temperature: '8-10°C',
    description: 'Captivating coral pink blush bursting with fresh wild strawberries, cranberry, and hint of rose petals. Refreshing and playful on the palate.',
    food_pairings: 'Spicy Thai Noodles, Caprese Salad, Grilled Chicken Satay, Fruit Tarts',
    taste_notes: 'Wild Strawberry, Cranberry, Rose Water, Red Currant',
    price: 850,
    stock_quantity: 320,
    sku: 'GHE-ROS-2023',
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1553122180-2c700cb75571?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000006',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    name: 'Godavari Late Harvest Golden Nectar',
    slug: 'godavari-late-harvest-chenin-2022',
    wine_type: 'Dessert',
    grape_variety: 'Chenin Blanc',
    vintage: 2022,
    alcohol_percentage: 12.0,
    body: 'Full',
    sweetness: 'Sweet',
    acidity: 'High',
    tannin: 'Low',
    serving_temperature: '6-8°C',
    description: 'Harvested in late February under warm sunshine. Concentrated golden hues with honeyed apricot, dried mango, and candied ginger balanced by brisk natural acidity.',
    food_pairings: 'Lemon Cheesecake, Baklava, Gorgonzola, Mango Panna Cotta',
    taste_notes: 'Honeyed Apricot, Dried Fig, Candied Orange Peel, Wild Honey',
    price: 1450,
    stock_quantity: 110,
    sku: 'GHE-LH-2022',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1614742468798-e7c65d642398?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000007',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    name: 'Godavari Barrel Select Merlot',
    slug: 'godavari-barrel-select-merlot-2021',
    wine_type: 'Red',
    grape_variety: 'Merlot',
    vintage: 2021,
    alcohol_percentage: 13.5,
    body: 'Medium',
    sweetness: 'Dry',
    acidity: 'Medium',
    tannin: 'Medium',
    serving_temperature: '15-17°C',
    description: 'Plum and ripe red cherry driven palate with subtle hints of sweet clove and French vanilla. Smooth, rounded tannins provide instant drinkability.',
    food_pairings: 'Roast Chicken with Herbs, Mushroom Risotto, Sheekh Kebabs, Gouda Cheese',
    taste_notes: 'Ripe Plum, Sweet Clove, Red Cherry, French Oak',
    price: 1350,
    stock_quantity: 210,
    sku: 'GHE-MER-2021',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000008',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    name: 'Godavari Artisanal Sauvignon Blanc',
    slug: 'godavari-artisanal-sauvignon-blanc-2023',
    wine_type: 'White',
    grape_variety: 'Sauvignon Blanc',
    vintage: 2023,
    alcohol_percentage: 12.8,
    body: 'Medium',
    sweetness: 'Dry',
    acidity: 'High',
    tannin: 'Low',
    serving_temperature: '8-10°C',
    description: 'Zesty lemongrass, gooseberry, and flinty gunsmoke notes from alluvial river silt soils. Crisp and invigorating finish.',
    food_pairings: 'Goat Cheese Crostini, Grilled Seabass, Tabbouleh, Asparagus Tart',
    taste_notes: 'Lemongrass, Gooseberry, Cut Grass, Flint Mineral',
    price: 1150,
    stock_quantity: 290,
    sku: 'GHE-SB-2023',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000009',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    name: 'Godavari Signature Viognier',
    slug: 'godavari-signature-viognier-2022',
    wine_type: 'White',
    grape_variety: 'Viognier',
    vintage: 2022,
    alcohol_percentage: 13.2,
    body: 'Full',
    sweetness: 'Dry',
    acidity: 'Medium',
    tannin: 'Low',
    serving_temperature: '10-12°C',
    description: 'Voluptuous aromas of white peach, honeysuckle, and orange blossom with a creamy, textured mouthfeel from lees stirring.',
    food_pairings: 'Chicken Korma, Lobster Thermidor, Moroccan Tagine, Brie',
    taste_notes: 'White Peach, Honeysuckle, Orange Blossom, Almond Paste',
    price: 1650,
    stock_quantity: 95,
    sku: 'GHE-VIO-2022',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000010',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    name: 'Sparkling Rosé Méthode Champenoise',
    slug: 'godavari-sparkling-rose-2022',
    wine_type: 'Sparkling',
    grape_variety: 'Pinot Noir & Shiraz',
    vintage: 2022,
    alcohol_percentage: 12.0,
    body: 'Medium',
    sweetness: 'Dry',
    acidity: 'High',
    tannin: 'Low',
    serving_temperature: '6-8°C',
    description: 'Pale salmon pink with fine continuous effervescence. Aromas of pomegranate, wild raspberry, and subtle brioche crust.',
    food_pairings: 'Smoked Salmon, Dim Sum, Berry Tartlets, Charcuterie Boards',
    taste_notes: 'Pomegranate, Red Raspberry, Brioche, Lemon Curd',
    price: 2150,
    stock_quantity: 140,
    sku: 'GHE-SROS-2022',
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000011',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    name: 'Godavari Founders Heritage Red Blend',
    slug: 'godavari-founders-heritage-red-2019',
    wine_type: 'Red',
    grape_variety: 'Shiraz & Cabernet Sauvignon',
    vintage: 2019,
    alcohol_percentage: 14.2,
    body: 'Full',
    sweetness: 'Dry',
    acidity: 'Medium',
    tannin: 'High',
    serving_temperature: '16-18°C',
    description: 'Flagship limited library release aged 20 months in French barriques. Intense complexity of blackcurrant, dark chocolate, tobacco, and balsamic notes.',
    food_pairings: 'Prime Beef Tenderloin, Lamb Shank Nihari, Truffle Risotto',
    taste_notes: 'Cassis, Dark Chocolate, Dried Herbs, Balsamic',
    price: 2950,
    stock_quantity: 65,
    sku: 'GHE-FND-2019',
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000012',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    name: 'Godavari Fortified Tawny Reserve',
    slug: 'godavari-fortified-tawny-reserve',
    wine_type: 'Fortified',
    grape_variety: 'Shiraz',
    vintage: 2018,
    alcohol_percentage: 18.5,
    body: 'Full',
    sweetness: 'Sweet',
    acidity: 'Medium',
    tannin: 'Medium',
    serving_temperature: '12-14°C',
    description: 'Solera-aged dessert wine in seasoned oak casks. Deep mahogany color with decadent notes of walnut, dried raisins, caramel, and warm allspice.',
    food_pairings: 'Dark Chocolate Fondant, Roasted Walnuts, Blue Stilton, Espresso Truffles',
    taste_notes: 'Walnut, Raisins, Caramel, Allspice, Dark Toffee',
    price: 2400,
    stock_quantity: 80,
    sku: 'GHE-TWN-2018',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&auto=format&fit=crop&q=80'
  },

  // --- SAHYADRI VALLEY WINES (5 wines) ---
  {
    id: '00000000-0000-4000-ca00-000000000013',
    winery_id: '00000000-0000-4000-d000-000000000002',
    name: 'Sahyadri High Altitude Sauvignon Blanc',
    slug: 'sahyadri-sauvignon-blanc-2023',
    wine_type: 'White',
    grape_variety: 'Sauvignon Blanc',
    vintage: 2023,
    alcohol_percentage: 12.5,
    body: 'Light',
    sweetness: 'Dry',
    acidity: 'High',
    tannin: 'Low',
    serving_temperature: '7-9°C',
    description: 'Cultivated at 650 meters altitude. Crisp notes of green apple, crushed lime leaves, and vibrant flinty mineral finish.',
    food_pairings: 'Fish Tikka, Greek Salad, Lemon Butter Calamari',
    taste_notes: 'Green Apple, Lime Zest, Crushed Slate, Fresh Herbs',
    price: 990,
    stock_quantity: 310,
    sku: 'SVW-SB-2023',
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000014',
    winery_id: '00000000-0000-4000-d000-000000000002',
    name: 'Sahyadri Hillside Cabernet-Shiraz',
    slug: 'sahyadri-hillside-cab-shiraz-2022',
    wine_type: 'Red',
    grape_variety: 'Cabernet Sauvignon & Shiraz',
    vintage: 2022,
    alcohol_percentage: 13.5,
    body: 'Full',
    sweetness: 'Dry',
    acidity: 'Medium',
    tannin: 'Medium',
    serving_temperature: '16-18°C',
    description: 'Harmonious blend displaying spiced blackberry, dark cherry, and gentle oak vanilla with soft approachable tannins.',
    food_pairings: 'Mutton Seekh Kebab, Grilled Lamb Chops, Lasagna',
    taste_notes: 'Spiced Blackberry, Red Cherry, Oak Vanilla, Black Pepper',
    price: 1250,
    stock_quantity: 260,
    sku: 'SVW-CS-2022',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000015',
    winery_id: '00000000-0000-4000-d000-000000000002',
    name: 'Sahyadri Valley Grenache Rosé',
    slug: 'sahyadri-grenache-rose-2023',
    wine_type: 'Rose',
    grape_variety: 'Grenache',
    vintage: 2023,
    alcohol_percentage: 12.0,
    body: 'Light',
    sweetness: 'Dry',
    acidity: 'High',
    tannin: 'Low',
    serving_temperature: '8-10°C',
    description: 'Dry Mediterranean-style rosé with wild strawberry, dried herbs, and pink grapefruit aromas.',
    food_pairings: 'Mediterranean Mezze, Grilled Prawns, Watermelon Feta Salad',
    taste_notes: 'Pink Grapefruit, Wild Strawberry, Thyme, Mineral',
    price: 890,
    stock_quantity: 280,
    sku: 'SVW-ROS-2023',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1553122180-2c700cb75571?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000016',
    winery_id: '00000000-0000-4000-d000-000000000002',
    name: 'Sahyadri Reserve Chardonnay',
    slug: 'sahyadri-reserve-chardonnay-2022',
    wine_type: 'White',
    grape_variety: 'Chardonnay',
    vintage: 2022,
    alcohol_percentage: 13.0,
    body: 'Full',
    sweetness: 'Dry',
    acidity: 'Medium',
    tannin: 'Low',
    serving_temperature: '10-12°C',
    description: 'Lightly oaked with buttery brioche, yellow apple, and toasted macadamia notes with a silky finish.',
    food_pairings: 'Grilled Salmon, Butter Chicken, Creamy Pasta, Brie',
    taste_notes: 'Yellow Apple, Brioche, Macadamia Nut, Sweet Butter',
    price: 1550,
    stock_quantity: 130,
    sku: 'SVW-CHD-2022',
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000017',
    winery_id: '00000000-0000-4000-d000-000000000002',
    name: 'Sahyadri Noble Rot Riesling',
    slug: 'sahyadri-noble-rot-riesling-2021',
    wine_type: 'Dessert',
    grape_variety: 'Riesling',
    vintage: 2021,
    alcohol_percentage: 10.5,
    body: 'Medium',
    sweetness: 'Sweet',
    acidity: 'High',
    tannin: 'Low',
    serving_temperature: '6-8°C',
    description: 'Rare botrytis-affected sweet Riesling showing wild honey, candied pineapple, and lime marmalade.',
    food_pairings: 'Blue Cheese, Fruit Tarts, Crème Brûlée, Roasted Figs',
    taste_notes: 'Candied Pineapple, Wild Honey, Lime Marmalade, Beeswax',
    price: 2100,
    stock_quantity: 75,
    sku: 'SVW-DES-2021',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1614742468798-e7c65d642398?w=600&auto=format&fit=crop&q=80'
  },

  // --- TRIMBAK VINEYARDS (5 wines) ---
  {
    id: '00000000-0000-4000-ca00-000000000018',
    winery_id: '00000000-0000-4000-d000-000000000003',
    name: 'Brahmagiri Grand Reserve Shiraz',
    slug: 'brahmagiri-grand-reserve-shiraz-2020',
    wine_type: 'Red',
    grape_variety: 'Shiraz',
    vintage: 2020,
    alcohol_percentage: 14.2,
    body: 'Full',
    sweetness: 'Dry',
    acidity: 'Medium',
    tannin: 'High',
    serving_temperature: '17-19°C',
    description: 'Aged 18 months in new French Allier oak. Opaque ruby red with ripe dark forest fruit, clove, roasted coffee bean, and dark chocolate.',
    food_pairings: 'Braised Beef Short Ribs, Venison, Smoked Meats, Aged Gouda',
    taste_notes: 'Dark Plum, Clove, Roasted Coffee, Dark Cocoa',
    price: 2600,
    stock_quantity: 110,
    sku: 'TBV-SHZ-2020',
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000019',
    winery_id: '00000000-0000-4000-d000-000000000003',
    name: 'Trimbak Heritage Cabernet Franc',
    slug: 'trimbak-heritage-cabernet-franc-2021',
    wine_type: 'Red',
    grape_variety: 'Cabernet Franc',
    vintage: 2021,
    alcohol_percentage: 13.6,
    body: 'Medium',
    sweetness: 'Dry',
    acidity: 'High',
    tannin: 'Medium',
    serving_temperature: '15-17°C',
    description: 'Vibrant red currant, roasted red bell pepper, and graphite minerality with firm acidity.',
    food_pairings: 'Herb-Crusted Pork Loin, Duck Confit, Grilled Vegetables',
    taste_notes: 'Red Currant, Roasted Bell Pepper, Graphite, Dried Herbs',
    price: 1750,
    stock_quantity: 140,
    sku: 'TBV-CF-2021',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000020',
    winery_id: '00000000-0000-4000-d000-000000000003',
    name: 'Trimbak Oak Barrel Viognier',
    slug: 'trimbak-barrel-viognier-2022',
    wine_type: 'White',
    grape_variety: 'Viognier',
    vintage: 2022,
    alcohol_percentage: 13.5,
    body: 'Full',
    sweetness: 'Dry',
    acidity: 'Medium',
    tannin: 'Low',
    serving_temperature: '10-12°C',
    description: 'Barrel fermented with wild native yeast. Rich aromas of apricot jam, gardenia blossoms, and toasted almond.',
    food_pairings: 'Crab Curry, Roasted Turkey, Thai Yellow Curry',
    taste_notes: 'Apricot Jam, Gardenia, Vanilla Bean, Toasted Almond',
    price: 1550,
    stock_quantity: 160,
    sku: 'TBV-VIO-2022',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000021',
    winery_id: '00000000-0000-4000-d000-000000000003',
    name: 'Trimbak Valley Blanc de Blancs Brut',
    slug: 'trimbak-blanc-de-blancs-brut',
    wine_type: 'Sparkling',
    grape_variety: 'Chardonnay',
    vintage: 2021,
    alcohol_percentage: 12.2,
    body: 'Medium',
    sweetness: 'Dry',
    acidity: 'High',
    tannin: 'Low',
    serving_temperature: '6-8°C',
    description: '100% Chardonnay sparkling wine aged 24 months on fine lees. Brioche, green apple, and creamy chalky finish.',
    food_pairings: 'Caviar, Lobster Roll, Truffle Popcorn, Parmesan Crisps',
    taste_notes: 'Brioche, Green Apple, Chalky Mineral, Lemon Curd',
    price: 2450,
    stock_quantity: 90,
    sku: 'TBV-BDB-2021',
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000022',
    winery_id: '00000000-0000-4000-d000-000000000003',
    name: 'Trimbak Estate Zinfandel',
    slug: 'trimbak-estate-zinfandel-2022',
    wine_type: 'Red',
    grape_variety: 'Zinfandel',
    vintage: 2022,
    alcohol_percentage: 14.5,
    body: 'Full',
    sweetness: 'Off Dry',
    acidity: 'Medium',
    tannin: 'Medium',
    serving_temperature: '16-18°C',
    description: 'Generous ripe blackberry jam, black pepper spice, and dark fig with warm comforting finish.',
    food_pairings: 'Barbecue Pulled Pork, Spicy Sausage Pizza, Grilled Burgers',
    taste_notes: 'Blackberry Jam, Fig, Black Pepper, Cinnamon',
    price: 1390,
    stock_quantity: 220,
    sku: 'TBV-ZIN-2022',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80'
  },

  // --- DECCAN CREST WINERY (4 wines) ---
  {
    id: '00000000-0000-4000-ca00-000000000023',
    winery_id: '00000000-0000-4000-d000-000000000004',
    name: 'Deccan Crest Blush Zinfandel',
    slug: 'deccan-crest-blush-zinfandel-2023',
    wine_type: 'Rose',
    grape_variety: 'Zinfandel',
    vintage: 2023,
    alcohol_percentage: 11.5,
    body: 'Light',
    sweetness: 'Off Dry',
    acidity: 'Medium',
    tannin: 'Low',
    serving_temperature: '7-9°C',
    description: 'India Wine Awards Double Gold winner. Bright watermelon, ripe strawberry, and cotton candy aromas with balanced sweetness.',
    food_pairings: 'Spicy Chicken Wings, Dim Sum, Fresh Fruit Platter',
    taste_notes: 'Watermelon, Strawberry, Cotton Candy, Citrus',
    price: 790,
    stock_quantity: 450,
    sku: 'DCW-BLU-2023',
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1553122180-2c700cb75571?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000024',
    winery_id: '00000000-0000-4000-d000-000000000004',
    name: 'Deccan Crest Plateau Chenin Blanc',
    slug: 'deccan-crest-plateau-chenin-2023',
    wine_type: 'White',
    grape_variety: 'Chenin Blanc',
    vintage: 2023,
    alcohol_percentage: 12.0,
    body: 'Light',
    sweetness: 'Off Dry',
    acidity: 'Medium',
    tannin: 'Low',
    serving_temperature: '8-10°C',
    description: 'Crisp and fruit-forward with juicy pineapple, sweet lime, and white floral fragrance.',
    food_pairings: 'Paneer Makhani, Vegetable Biryani, Fried Calamari',
    taste_notes: 'Juicy Pineapple, Sweet Lime, White Jasmine, Honey',
    price: 750,
    stock_quantity: 520,
    sku: 'DCW-CHB-2023',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000025',
    winery_id: '00000000-0000-4000-d000-000000000004',
    name: 'Deccan Crest Smooth Shiraz',
    slug: 'deccan-crest-smooth-shiraz-2022',
    wine_type: 'Red',
    grape_variety: 'Shiraz',
    vintage: 2022,
    alcohol_percentage: 13.0,
    body: 'Medium',
    sweetness: 'Dry',
    acidity: 'Medium',
    tannin: 'Medium',
    serving_temperature: '16-18°C',
    description: 'Ripe mulberry, crushed pepper, and subtle mocha notes designed for everyday celebration.',
    food_pairings: 'Chicken Tikka, Pepperoni Pizza, Kebabs',
    taste_notes: 'Mulberry, Red Cherry, Black Pepper, Mocha',
    price: 990,
    stock_quantity: 340,
    sku: 'DCW-SHZ-2022',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000026',
    winery_id: '00000000-0000-4000-d000-000000000004',
    name: 'Deccan Crest Sparkling Moscato',
    slug: 'deccan-crest-sparkling-moscato-2023',
    wine_type: 'Sparkling',
    grape_variety: 'Moscato',
    vintage: 2023,
    alcohol_percentage: 8.5,
    body: 'Light',
    sweetness: 'Sweet',
    acidity: 'High',
    tannin: 'Low',
    serving_temperature: '5-7°C',
    description: 'Low-alcohol, fragrant sweet sparkling wine brimming with peach, orange blossom, and honeydew melon.',
    food_pairings: 'Fruit Salads, Fruit Tarts, Mild Cheeses, Light Pastries',
    taste_notes: 'Peach, Orange Blossom, Honeydew, Citrus Fizz',
    price: 1100,
    stock_quantity: 260,
    sku: 'DCW-MOS-2023',
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=600&auto=format&fit=crop&q=80'
  },

  // --- VINEWOOD ESTATE (4 wines) ---
  {
    id: '00000000-0000-4000-ca00-000000000027',
    winery_id: '00000000-0000-4000-d000-000000000005',
    name: 'Vinewood Biodynamic Pinot Noir',
    slug: 'vinewood-biodynamic-pinot-noir-2022',
    wine_type: 'Red',
    grape_variety: 'Pinot Noir',
    vintage: 2022,
    alcohol_percentage: 13.0,
    body: 'Light',
    sweetness: 'Dry',
    acidity: 'High',
    tannin: 'Low',
    serving_temperature: '14-16°C',
    description: 'Delicate cool-climate Pinot Noir with wild cherry, forest floor, and damp earth notes with silky fine tannins.',
    food_pairings: 'Pan-Seared Duck Breast, Wild Mushroom Pasta, Roasted Beetroot',
    taste_notes: 'Wild Cherry, Forest Floor, Rose Petals, Earth',
    price: 2400,
    stock_quantity: 110,
    sku: 'VWE-PN-2022',
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000028',
    winery_id: '00000000-0000-4000-d000-000000000005',
    name: 'Vinewood Natural Pet-Nat Sparkling',
    slug: 'vinewood-natural-pet-nat-2023',
    wine_type: 'Sparkling',
    grape_variety: 'Chenin Blanc',
    vintage: 2023,
    alcohol_percentage: 11.0,
    body: 'Light',
    sweetness: 'Dry',
    acidity: 'High',
    tannin: 'Low',
    serving_temperature: '7-9°C',
    description: 'Ancestral method Pétillant Naturel unfiltered sparkling with cloudy golden sheen, raw pear, and cider apple notes.',
    food_pairings: 'Artisanal Charcuterie, Sourdough Bread, Fermented Cheeses',
    taste_notes: 'Raw Pear, Cider Apple, Lemon Yeast, Saline Mineral',
    price: 1800,
    stock_quantity: 95,
    sku: 'VWE-PET-2023',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000029',
    winery_id: '00000000-0000-4000-d000-000000000005',
    name: 'Vinewood Artisanal Cabernet Franc',
    slug: 'vinewood-artisanal-cab-franc-2021',
    wine_type: 'Red',
    grape_variety: 'Cabernet Franc',
    vintage: 2021,
    alcohol_percentage: 13.8,
    body: 'Medium',
    sweetness: 'Dry',
    acidity: 'Medium',
    tannin: 'Medium',
    serving_temperature: '16-18°C',
    description: 'Small-batch basket pressed red with black raspberry, crushed stones, and delicate violet notes.',
    food_pairings: 'Roast Lamb, Grilled Eggplant, Truffle Gnocchi',
    taste_notes: 'Black Raspberry, Violet, Crushed Stones, Tobacco',
    price: 2100,
    stock_quantity: 85,
    sku: 'VWE-CF-2021',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000030',
    winery_id: '00000000-0000-4000-d000-000000000005',
    name: 'Vinewood Skin-Contact Orange Wine',
    slug: 'vinewood-skin-contact-orange-2022',
    wine_type: 'White',
    grape_variety: 'Chenin Blanc & Viognier',
    vintage: 2022,
    alcohol_percentage: 12.5,
    body: 'Medium',
    sweetness: 'Dry',
    acidity: 'High',
    tannin: 'Medium',
    serving_temperature: '11-13°C',
    description: 'White grapes fermented on skins for 28 days in terracotta amphorae. Dried apricot, bergamot tea, and structural tannic grip.',
    food_pairings: 'Indian Spiced Mutton, Korean Kimchi Fried Rice, Aged Hard Cheeses',
    taste_notes: 'Dried Apricot, Bergamot Tea, Dried Orange, Almond',
    price: 2250,
    stock_quantity: 70,
    sku: 'VWE-ORG-2022',
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80'
  },

  // --- NASHIK HERITAGE WINES (5 wines) ---
  {
    id: '00000000-0000-4000-ca00-000000000031',
    winery_id: '00000000-0000-4000-d000-000000000006',
    name: 'Heritage Classic Chenin Blanc',
    slug: 'heritage-classic-chenin-blanc-2023',
    wine_type: 'White',
    grape_variety: 'Chenin Blanc',
    vintage: 2023,
    alcohol_percentage: 12.0,
    body: 'Medium',
    sweetness: 'Off Dry',
    acidity: 'Medium',
    tannin: 'Low',
    serving_temperature: '8-10°C',
    description: 'Refreshing aromas of green apple, lime cordial, and tropical pineapple. Smooth, crowd-pleasing finish.',
    food_pairings: 'Vegetable Pakoras, Fish Amritsari, Chicken Tikka',
    taste_notes: 'Green Apple, Lime Cordial, Pineapple, Honey',
    price: 780,
    stock_quantity: 480,
    sku: 'NHW-CHB-2023',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000032',
    winery_id: '00000000-0000-4000-d000-000000000006',
    name: 'Heritage Reserve Shiraz-Cabernet',
    slug: 'heritage-reserve-shiraz-cabernet-2022',
    wine_type: 'Red',
    grape_variety: 'Shiraz & Cabernet Sauvignon',
    vintage: 2022,
    alcohol_percentage: 13.5,
    body: 'Medium',
    sweetness: 'Dry',
    acidity: 'Medium',
    tannin: 'Medium',
    serving_temperature: '16-18°C',
    description: 'Ripe blackberry, black pepper, and subtle oak spice. Well structured and easy drinking.',
    food_pairings: 'Tandoori Chicken, Mutton Curry, Grilled Burgers',
    taste_notes: 'Blackberry, Black Pepper, Oak Spice, Vanilla',
    price: 1100,
    stock_quantity: 360,
    sku: 'NHW-SRC-2022',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000033',
    winery_id: '00000000-0000-4000-d000-000000000006',
    name: 'Heritage Sparkling Brut',
    slug: 'heritage-sparkling-brut-2022',
    wine_type: 'Sparkling',
    grape_variety: 'Chenin Blanc & Ugni Blanc',
    vintage: 2022,
    alcohol_percentage: 12.0,
    body: 'Medium',
    sweetness: 'Dry',
    acidity: 'High',
    tannin: 'Low',
    serving_temperature: '6-8°C',
    description: 'Award-winning celebratory sparkling with fine bubbles, toasted yeast, and lemon pear flavors.',
    food_pairings: 'Paneer Pakora, Samosas, Salted Cashews, Canapés',
    taste_notes: 'Toasted Yeast, Crisp Pear, Lemon Zest, Green Apple',
    price: 1350,
    stock_quantity: 220,
    sku: 'NHW-BRT-2022',
    featured: true,
    image_url: 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000034',
    winery_id: '00000000-0000-4000-d000-000000000006',
    name: 'Heritage Valley Zinfandel Rosé',
    slug: 'heritage-valley-zinfandel-rose-2023',
    wine_type: 'Rose',
    grape_variety: 'Zinfandel',
    vintage: 2023,
    alcohol_percentage: 11.5,
    body: 'Light',
    sweetness: 'Off Dry',
    acidity: 'Medium',
    tannin: 'Low',
    serving_temperature: '7-9°C',
    description: 'Vibrant salmon pink with juicy raspberry, red cherry, and a hint of mint.',
    food_pairings: 'Prawn Biryani, Spring Rolls, Goat Cheese Salad',
    taste_notes: 'Raspberry, Red Cherry, Mint, Fresh Strawberry',
    price: 820,
    stock_quantity: 390,
    sku: 'NHW-ROS-2023',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1553122180-2c700cb75571?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: '00000000-0000-4000-ca00-000000000035',
    winery_id: '00000000-0000-4000-d000-000000000006',
    name: 'Heritage Golden Harvest Dessert Wine',
    slug: 'heritage-golden-harvest-2022',
    wine_type: 'Dessert',
    grape_variety: 'Chenin Blanc',
    vintage: 2022,
    alcohol_percentage: 11.5,
    body: 'Full',
    sweetness: 'Sweet',
    acidity: 'High',
    tannin: 'Low',
    serving_temperature: '6-8°C',
    description: 'Sweet golden late harvest nectar with dried peach, honey, and orange zest.',
    food_pairings: 'Gulab Jamun with Ice Cream, Apple Pie, Blue Cheese',
    taste_notes: 'Dried Peach, Honey, Orange Zest, Caramel',
    price: 1250,
    stock_quantity: 110,
    sku: 'NHW-DES-2022',
    featured: false,
    image_url: 'https://images.unsplash.com/photo-1614742468798-e7c65d642398?w=600&auto=format&fit=crop&q=80'
  }
];

// ============================================================================
// EVENTS (7 Upcoming Authentically Scheduled Events with Future Dates)
// ============================================================================
export const DEMO_EVENTS = [
  {
    id: '00000000-0000-4000-e000-000000000001',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    title: 'Nashik Winter Harvest & Grape Stomping Festival 2026',
    description: 'Celebrate the commencement of the 2026-27 harvest season at Godavari Hills Estate. Traditional wooden vat grape stomping, live acoustic vineyard music, unlimited estate tasting, and lavish buffet.',
    event_date: '2026-12-20',
    start_time: '11:00:00',
    end_time: '18:00:00',
    capacity: 150,
    available_slots: 85,
    price: 2499,
    banner_image: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=1200&q=85',
    publish_status: 'published' as const,
    event_status: 'upcoming',
    tags: ['Harvest Festival', 'Grape Stomping', 'Live Music', 'Family Friendly'],
    gallery_images: [
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
      'https://images.unsplash.com/photo-1543418219-44e30b057fea?w=800&q=80'
    ],
    highlights: ['Traditional Wooden Tub Grape Stomping', 'Guided Cellar Tasting of 6 Vintages', 'Farm-to-Fork Harvest Lunch'],
    inclusions: ['Souvenir Tasting Glass', 'Buffet Lunch & High Tea', 'All Tasting Flights', 'Harvest Hat'],
    turnout_count: null,
    rating: 4.9,
    host_info: {
      host_name: 'Rajesh Godavari',
      contact_phone: '+91 253 294 1101',
      booking_status: 'Open',
      booking_deadline: '2026-12-18'
    }
  },
  {
    id: '00000000-0000-4000-e000-000000000002',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    title: 'Sunset Jazz & Reserve Shiraz Soirée',
    description: 'An intimate evening of live jazz quartet performances on the panoramic amphitheater lawn overlooking the Godavari reservoir, paired with aged reserve reds and gourmet tapas.',
    event_date: '2027-01-09',
    start_time: '17:30:00',
    end_time: '22:00:00',
    capacity: 80,
    available_slots: 42,
    price: 3200,
    banner_image: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=1200&q=85',
    publish_status: 'published' as const,
    event_status: 'upcoming',
    tags: ['Live Jazz', 'Reserve Shiraz', 'Sunset View', 'Gourmet Tapas'],
    gallery_images: [
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80'
    ],
    highlights: ['Live Jazz Quartet Performance', 'Exclusive 2019 Library Vintage Pour', 'Artisanal Cheese & Tapas Bar'],
    inclusions: ['Welcome Glass of Sparkling Brut', '4 Premium Wine Tastings', 'Gourmet Dinner Tapas'],
    turnout_count: null,
    rating: 5.0,
    host_info: {
      host_name: 'Sommelier Team',
      contact_phone: '+91 253 294 1101',
      booking_status: 'Open',
      booking_deadline: '2027-01-07'
    }
  },
  {
    id: '00000000-0000-4000-e000-000000000003',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    title: 'French Oak Barrel Tasting Masterclass',
    description: 'Rare opportunity to taste unfinished vintages straight from French and American oak barrels alongside Chief Winemaker, exploring the alchemy of wood aging.',
    event_date: '2027-01-23',
    start_time: '14:00:00',
    end_time: '17:30:00',
    capacity: 35,
    available_slots: 18,
    price: 4500,
    banner_image: 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=1200&q=85',
    publish_status: 'published' as const,
    event_status: 'upcoming',
    tags: ['Masterclass', 'Barrel Tasting', 'Winemaker Guided', 'VIP Exclusive'],
    gallery_images: [],
    highlights: ['Direct Barrel Extraction with Wine Thief', 'Comparative French vs American Oak Profiling', 'Charcuterie Pairing'],
    inclusions: ['Winemaker Certificate', '5 Barrel Samples + 3 Finished Vintages', 'Artisanal Charcuterie Board'],
    turnout_count: null,
    rating: 4.95,
    host_info: {
      host_name: 'Chief Winemaker',
      booking_status: 'Open',
      booking_deadline: '2027-01-21'
    }
  },
  {
    id: '00000000-0000-4000-e000-000000000004',
    winery_id: '00000000-0000-4000-d000-000000000002',
    title: 'Sahyadri High-Altitude Wine & Barbecue Fair',
    description: 'Crisp mountain breezes and sizzling grill specialties paired with Sahyadri Valley Sauvignon Blanc and hillside Cabernet-Shiraz.',
    event_date: '2027-02-06',
    start_time: '12:00:00',
    end_time: '19:00:00',
    capacity: 120,
    available_slots: 64,
    price: 1999,
    banner_image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=85',
    publish_status: 'published' as const,
    event_status: 'upcoming',
    tags: ['Barbecue', 'Mountain View', 'Outdoor', 'Tasting'],
    gallery_images: [],
    highlights: ['Live Charcoal Grills', 'Hilltop Vineyard Views', 'Guided Tasting Pavilion'],
    inclusions: ['4 Wine Tasting Tokens', 'Unlimited Barbecue Skewers & Salads'],
    turnout_count: null,
    rating: 4.8,
    host_info: {
      booking_status: 'Open',
      booking_deadline: '2027-02-04'
    }
  },
  {
    id: '00000000-0000-4000-e000-000000000005',
    winery_id: '00000000-0000-4000-d000-000000000003',
    title: 'Valentine’s Sparkling Romance Dinner',
    description: 'Candlelit 5-course gourmet dinner beneath starlit Brahmagiri hills, featuring vintage Blanc de Blancs brut and chocolate pairings for couples.',
    event_date: '2027-02-14',
    start_time: '19:30:00',
    end_time: '23:00:00',
    capacity: 50,
    available_slots: 22,
    price: 4999,
    banner_image: 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=1200&q=85',
    publish_status: 'published' as const,
    event_status: 'upcoming',
    tags: ['Valentines', 'Romance', '5-Course Dinner', 'Sparkling Wine'],
    gallery_images: [],
    highlights: ['5-Course Degustation Menu', 'Champagne Sabre Demonstration', 'Live Harp Performance'],
    inclusions: ['Bottle of Vintage Sparkling Brut per Couple', '5-Course Dinner', 'Handcrafted Chocolate Box'],
    turnout_count: null,
    rating: 5.0,
    host_info: {
      booking_status: 'Open',
      booking_deadline: '2027-02-12'
    }
  },
  {
    id: '00000000-0000-4000-e000-000000000006',
    winery_id: '00000000-0000-4000-d000-000000000004',
    title: 'Deccan Sunset Rosé & Salsa Evening',
    description: 'Celebrate lively weekend vibes with introductory salsa dancing lessons on the Deccan Crest terrace, chilled Blush Zinfandel, and woodfired pizzas.',
    event_date: '2027-02-27',
    start_time: '18:00:00',
    end_time: '22:30:00',
    capacity: 100,
    available_slots: 50,
    price: 1499,
    banner_image: 'https://images.unsplash.com/photo-1553122180-2c700cb75571?w=1200&q=85',
    publish_status: 'published' as const,
    event_status: 'upcoming',
    tags: ['Rosé', 'Salsa Dancing', 'Woodfired Pizza', 'Party'],
    gallery_images: [],
    highlights: ['Salsa Instructor Workshop', 'Chilled Rosé Fountain', 'Woodfired Neapolitan Pizza'],
    inclusions: ['3 Glasses of Rosé', 'Individual Artisanal Pizza', 'Dance Session Entry'],
    turnout_count: null,
    rating: 4.85,
    host_info: {
      booking_status: 'Open',
      booking_deadline: '2027-02-25'
    }
  },
  {
    id: '00000000-0000-4000-e000-000000000007',
    winery_id: '00000000-0000-4000-d000-000000000005',
    title: 'Spring Equinox Biodynamic Vineyard Walk & Brunch',
    description: 'An educational walking tour exploring lunar planting cycles, organic compost preparation, and cover crops at Vinewood Estate, followed by natural wine pairing brunch.',
    event_date: '2027-03-20',
    start_time: '09:30:00',
    end_time: '14:00:00',
    capacity: 40,
    available_slots: 25,
    price: 2799,
    banner_image: 'https://images.unsplash.com/photo-1543418219-44e30b057fea?w=1200&q=85',
    publish_status: 'published' as const,
    event_status: 'upcoming',
    tags: ['Biodynamic', 'Vineyard Walk', 'Organic Brunch', 'Natural Wine'],
    gallery_images: [],
    highlights: ['Hands-on Biodynamic Soil Exploration', 'Pet-Nat Tasting in the Vines', 'Organic Farm-to-Table Brunch'],
    inclusions: ['Guided Viticulture Tour', 'Full Organic Brunch', '3 Natural Wine Tastings'],
    turnout_count: null,
    rating: 4.9,
    host_info: {
      booking_status: 'Open',
      booking_deadline: '2027-03-18'
    }
  }
];

// ============================================================================
// EXPERIENCES (6 Curated Estate Journeys / Tastings)
// ============================================================================
export const DEMO_EXPERIENCES = [
  {
    id: '00000000-0000-4000-fa00-000000000001',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    title: 'Signature Cellar Tour & Guided Sommelier Tasting',
    description: 'Comprehensive guided walkthrough of Godavari Hills Estate gravity-flow fermentation tanks, barrel aging cellar, and automated bottling line, followed by a tutored tasting of 5 flagship wines.',
    experience_type: 'Cellar Tour & Tasting',
    duration_minutes: 75,
    capacity: 25,
    price: 1200,
    cover_image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
    publish_status: 'published' as const,
    tags: ['Cellar Tour', 'Sommelier Led', 'Tasting Flight', 'Bestseller'],
    gallery_images: [
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
      'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=800&q=80'
    ],
    highlights: ['Exclusive access to underground barrel vault', 'Sensory tasting wheel guidance', 'Q&A with certified sommelier'],
    inclusions: ['Tasting flight of 5 award-winning wines', 'Fresh water crackers & pallete cleansers', '10% discount voucher at estate shop']
  },
  {
    id: '00000000-0000-4000-fa00-000000000002',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    title: 'Master Sensory Blending Workshop',
    description: 'Become a winemaker for an afternoon! Learn the intricate art of blending Shiraz, Cabernet, and Merlot under winemaker guidance, bottle your own custom vintage, and cork it to take home.',
    experience_type: 'Interactive Workshop',
    duration_minutes: 120,
    capacity: 15,
    price: 2800,
    cover_image: 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800&q=80',
    publish_status: 'published' as const,
    tags: ['Hands-on', 'Blending Workshop', 'Take-Home Bottle', 'Masterclass'],
    gallery_images: [],
    highlights: ['Hands-on measuring cylinders and barrel samples', 'Personalized custom label printing', 'Hand-corking and wax dipping'],
    inclusions: ['Personal 750ml custom blend bottle', 'Workshop booklet & aroma kit access', 'Gourmet cheese platter']
  },
  {
    id: '00000000-0000-4000-fa00-000000000003',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    title: 'Private Hilltop Vineyard Walk & Sunset Picnic',
    description: 'An exclusive couple or family experience. Stroll through the lush vines to a secluded hilltop pavilion overlooking the Godavari reservoir, featuring a curated wicker picnic basket.',
    experience_type: 'Private Experience',
    duration_minutes: 90,
    capacity: 6,
    price: 3500,
    cover_image: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800&q=80',
    publish_status: 'published' as const,
    tags: ['Private', 'Romantic', 'Picnic Basket', 'Sunset'],
    gallery_images: [],
    highlights: ['Private reserved hilltop pavilion', 'Chilled bottle of Cuvée Royale Brut', 'Artisanal cheese, sourdough, and charcuterie'],
    inclusions: ['Full bottle of Sparkling Wine', 'Deluxe picnic basket for 2-4', 'Dedicated estate concierge service']
  },
  {
    id: '00000000-0000-4000-fa00-000000000004',
    winery_id: '00000000-0000-4000-d000-000000000002',
    title: 'Sahyadri Terrace Tasting & Cheese Harmony',
    description: 'Relax on the terraced stone patio with panoramic mountain vistas while tasting 4 high-altitude whites and rosés matched with artisanal Maharashtra cheeses.',
    experience_type: 'Wine & Cheese Pairing',
    duration_minutes: 60,
    capacity: 20,
    price: 1500,
    cover_image: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=800&q=80',
    publish_status: 'published' as const,
    tags: ['Wine & Cheese', 'Scenic View', 'Relaxed'],
    gallery_images: [],
    highlights: ['4 artisanal cheese selections', 'Panoramic mountain view deck', 'Sommelier flavor matching'],
    inclusions: ['4 Wine Tastings', 'Artisanal Cheese Board with preserves']
  },
  {
    id: '00000000-0000-4000-fa00-000000000005',
    winery_id: '00000000-0000-4000-d000-000000000003',
    title: 'Brahmagiri Heritage Barrel & Cellar Vault Tour',
    description: 'Discover the heritage of Trimbak viticulture with a private tour of subterranean stone cellar vaults and tasting of aged reserve vintages.',
    experience_type: 'Heritage Tour',
    duration_minutes: 75,
    capacity: 18,
    price: 1800,
    cover_image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
    publish_status: 'published' as const,
    tags: ['Heritage Cellar', 'Aged Reds', 'Stone Vaults'],
    gallery_images: [],
    highlights: ['Ancient subterranean vault access', '3 Reserve Vintage Tastings', 'Historical estate storytelling'],
    inclusions: ['Tasting flight of 4 wines', 'Tasting notes journal', 'Estate crystal glass']
  },
  {
    id: '00000000-0000-4000-fa00-000000000006',
    winery_id: '00000000-0000-4000-d000-000000000005',
    title: 'Vinewood Amphora & Natural Wine Tasting',
    description: 'Explore the natural and biodynamic winemaking movement. Sample unfiltered wines poured directly from terracotta amphora vessels.',
    experience_type: 'Natural Wine Discovery',
    duration_minutes: 60,
    capacity: 12,
    price: 2200,
    cover_image: 'https://images.unsplash.com/photo-1543418219-44e30b057fea?w=800&q=80',
    publish_status: 'published' as const,
    tags: ['Natural Wine', 'Amphora', 'Biodynamic', 'Orange Wine'],
    gallery_images: [],
    highlights: ['Terracotta amphora room inspection', 'Orange wine tasting', 'Biodynamic viticulture tutorial'],
    inclusions: ['4 Natural & Amphora wine pours', 'Fermented pairing snacks']
  }
];

// ============================================================================
// BOOKINGS (24 Realistic Bookings with Completed, Upcoming, Cancelled Statuses)
// ============================================================================
export const DEMO_BOOKINGS = [
  // Flagship Demo Winery: Past Completed Revenue-Generating Bookings (Last 30 Days)
  {
    id: '00000000-0000-4000-bb00-000000000001',
    user_id: '00000000-0000-4000-ba00-000000000001', // Ananya
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    event_id: null,
    experience_id: '00000000-0000-4000-fa00-000000000001',
    booking_date: '2026-11-02',
    booking_time: '11:30:00',
    guests: 2,
    total_amount: 2400,
    payment_status: 'paid' as const,
    booking_status: 'completed' as const,
    special_requests: 'Anniversary celebration, prefer window table'
  },
  {
    id: '00000000-0000-4000-bb00-000000000002',
    user_id: '00000000-0000-4000-ba00-000000000002', // Vikram
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    event_id: null,
    experience_id: '00000000-0000-4000-fa00-000000000002',
    booking_date: '2026-11-05',
    booking_time: '14:00:00',
    guests: 4,
    total_amount: 11200,
    payment_status: 'paid' as const,
    booking_status: 'completed' as const,
    special_requests: 'Executive tasting group from Pune'
  },
  {
    id: '00000000-0000-4000-bb00-000000000003',
    user_id: '00000000-0000-4000-ba00-000000000003', // Meera
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    event_id: null,
    experience_id: '00000000-0000-4000-fa00-000000000003',
    booking_date: '2026-11-08',
    booking_time: '16:30:00',
    guests: 2,
    total_amount: 7000,
    payment_status: 'paid' as const,
    booking_status: 'completed' as const,
    special_requests: 'Sunset picnic setup'
  },
  {
    id: '00000000-0000-4000-bb00-000000000004',
    user_id: '00000000-0000-4000-ba00-000000000004', // Rohan
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    event_id: null,
    experience_id: '00000000-0000-4000-fa00-000000000001',
    booking_date: '2026-11-12',
    booking_time: '12:00:00',
    guests: 3,
    total_amount: 3600,
    payment_status: 'paid' as const,
    booking_status: 'completed' as const,
    special_requests: 'First time wine visitors'
  },
  {
    id: '00000000-0000-4000-bb00-000000000005',
    user_id: '00000000-0000-4000-ba00-000000000001',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    event_id: null,
    experience_id: '00000000-0000-4000-fa00-000000000001',
    booking_date: '2026-11-15',
    booking_time: '15:00:00',
    guests: 4,
    total_amount: 4800,
    payment_status: 'paid' as const,
    booking_status: 'completed' as const,
    special_requests: 'Vegetarian cheese platter'
  },
  {
    id: '00000000-0000-4000-bb00-000000000006',
    user_id: '00000000-0000-4000-ba00-000000000002',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    event_id: null,
    experience_id: '00000000-0000-4000-fa00-000000000002',
    booking_date: '2026-11-16',
    booking_time: '14:00:00',
    guests: 2,
    total_amount: 5600,
    payment_status: 'paid' as const,
    booking_status: 'completed' as const,
    special_requests: 'Custom label for birthday gift'
  },

  // Flagship Demo Winery: Upcoming Confirmed Bookings (Next 60 Days)
  {
    id: '00000000-0000-4000-bb00-000000000007',
    user_id: '00000000-0000-4000-ba00-000000000001',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    event_id: '00000000-0000-4000-e000-000000000001', // Harvest Fest
    experience_id: null,
    booking_date: '2026-12-20',
    booking_time: '11:00:00',
    guests: 2,
    total_amount: 4998,
    payment_status: 'paid' as const,
    booking_status: 'confirmed' as const,
    special_requests: 'Harvest fest VIP front row seating'
  },
  {
    id: '00000000-0000-4000-bb00-000000000008',
    user_id: '00000000-0000-4000-ba00-000000000002',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    event_id: '00000000-0000-4000-e000-000000000001',
    experience_id: null,
    booking_date: '2026-12-20',
    booking_time: '11:00:00',
    guests: 4,
    total_amount: 9996,
    payment_status: 'paid' as const,
    booking_status: 'confirmed' as const,
    special_requests: 'Family group attending grape stomping'
  },
  {
    id: '00000000-0000-4000-bb00-000000000009',
    user_id: '00000000-0000-4000-ba00-000000000003',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    event_id: '00000000-0000-4000-e000-000000000002', // Jazz
    experience_id: null,
    booking_date: '2027-01-09',
    booking_time: '17:30:00',
    guests: 2,
    total_amount: 6400,
    payment_status: 'paid' as const,
    booking_status: 'confirmed' as const,
    special_requests: 'Outdoor amphitheater table'
  },
  {
    id: '00000000-0000-4000-bb00-000000000010',
    user_id: '00000000-0000-4000-ba00-000000000004',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    event_id: null,
    experience_id: '00000000-0000-4000-fa00-000000000001',
    booking_date: '2026-12-05',
    booking_time: '14:30:00',
    guests: 2,
    total_amount: 2400,
    payment_status: 'paid' as const,
    booking_status: 'confirmed' as const,
    special_requests: 'Tour in English'
  },
  {
    id: '00000000-0000-4000-bb00-000000000011',
    user_id: '00000000-0000-4000-ba00-000000000002',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    event_id: '00000000-0000-4000-e000-000000000003', // Barrel masterclass
    experience_id: null,
    booking_date: '2027-01-23',
    booking_time: '14:00:00',
    guests: 2,
    total_amount: 9000,
    payment_status: 'paid' as const,
    booking_status: 'confirmed' as const,
    special_requests: 'Sommelier certificate requested'
  },

  // Flagship Demo Winery: Pending & Cancelled Bookings
  {
    id: '00000000-0000-4000-bb00-000000000012',
    user_id: '00000000-0000-4000-ba00-000000000004',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    event_id: null,
    experience_id: '00000000-0000-4000-fa00-000000000003',
    booking_date: '2026-12-12',
    booking_time: '16:00:00',
    guests: 2,
    total_amount: 7000,
    payment_status: 'pending' as const,
    booking_status: 'pending' as const,
    special_requests: 'Awaiting corporate credit card approval'
  },
  {
    id: '00000000-0000-4000-bb00-000000000013',
    user_id: '00000000-0000-4000-ba00-000000000001',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    event_id: null,
    experience_id: '00000000-0000-4000-fa00-000000000001',
    booking_date: '2026-11-20',
    booking_time: '11:00:00',
    guests: 4,
    total_amount: 4800,
    payment_status: 'refunded' as const,
    booking_status: 'cancelled' as const,
    special_requests: 'Flight delayed, rescheduled for December'
  },

  // Other Wineries Bookings
  {
    id: '00000000-0000-4000-bb00-000000000014',
    user_id: '00000000-0000-4000-ba00-000000000003',
    winery_id: '00000000-0000-4000-d000-000000000002',
    event_id: '00000000-0000-4000-e000-000000000004',
    experience_id: null,
    booking_date: '2027-02-06',
    booking_time: '12:00:00',
    guests: 4,
    total_amount: 7996,
    payment_status: 'paid' as const,
    booking_status: 'confirmed' as const,
    special_requests: 'Outdoor BBQ table'
  },
  {
    id: '00000000-0000-4000-bb00-000000000015',
    user_id: '00000000-0000-4000-ba00-000000000002',
    winery_id: '00000000-0000-4000-d000-000000000003',
    event_id: '00000000-0000-4000-e000-000000000005',
    experience_id: null,
    booking_date: '2027-02-14',
    booking_time: '19:30:00',
    guests: 2,
    total_amount: 4999,
    payment_status: 'paid' as const,
    booking_status: 'confirmed' as const,
    special_requests: 'Couples celebration'
  }
];

// ============================================================================
// CORPORATE LEADS (5 Realistic B2B Enquiries)
// ============================================================================
export const DEMO_CORPORATE_LEADS = [
  {
    id: '00000000-0000-4000-cb00-000000000001',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    company_name: 'TechMatrix Global Solutions Pvt Ltd',
    contact_person: 'Siddharth Roy (VP Operations)',
    email: 'siddharth.roy@techmatrix.example.com',
    phone: '+91 98201 98765',
    event_type: 'Annual Leadership Retreat',
    expected_guests: 45,
    message: 'Seeking a private estate buyout for our Senior Leadership offsite on Jan 16-17. Require full conference AV setup, cellar tour, and gala dinner.',
    status: 'pending' as const
  },
  {
    id: '00000000-0000-4000-cb00-000000000002',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    company_name: 'Apex Wealth Partners Mumbai',
    contact_person: 'Priyamvada Deshpande (Head of Client Relations)',
    email: 'priyamvada@apexwealth.example.com',
    phone: '+91 98199 87654',
    event_type: 'Ultra-HNI Client Appreciation Evening',
    expected_guests: 60,
    message: 'Planning an exclusive vintage reserve tasting and 4-course dinner for our private wealth clients on Feb 12. Need customized gift hampers.',
    status: 'approved' as const
  },
  {
    id: '00000000-0000-4000-cb00-000000000003',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    company_name: 'Zenith Life Sciences Research',
    contact_person: 'Dr. Alok Verma',
    email: 'alok.verma@zenithbio.example.com',
    phone: '+91 98233 45678',
    event_type: 'National Advisory Board Dinner',
    expected_guests: 28,
    message: 'Looking for sunset wine tasting session followed by private indoor dining for advisory doctors visiting Nashik.',
    status: 'pending' as const
  },
  {
    id: '00000000-0000-4000-cb00-000000000004',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    company_name: 'Indo-French Chamber of Commerce',
    contact_person: 'Camille Dubois',
    email: 'c.dubois@ifcci.example.org',
    phone: '+91 98200 12345',
    event_type: 'Bilateral Viticulture Symposium',
    expected_guests: 110,
    message: 'Hosting delegates from Bordeaux and Nashik for technical exchange and Indo-French wine networking dinner in late January.',
    status: 'approved' as const
  },
  {
    id: '00000000-0000-4000-cb00-000000000005',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    company_name: 'Starlight Media Productions',
    contact_person: 'Karan Mehta',
    email: 'karan@starlightmedia.example.com',
    phone: '+91 98900 99887',
    event_type: 'Commercial Web Series Shoot',
    expected_guests: 70,
    message: 'Requested 3-day full vineyard closure for filming. Declined due to weekend public tasting schedule conflicts.',
    status: 'rejected' as const
  }
];

// ============================================================================
// DOCUMENTS (4 Official Verification Documents for Godavari Hills Estate)
// ============================================================================
export const DEMO_DOCUMENTS = [
  {
    id: '00000000-0000-4000-d00c-000000000001',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    document_name: 'FSSAI Central Manufacturing License - Wine & Beverages',
    document_type: 'FSSAI' as const,
    document_url: 'https://vinosphere.demo.s3.amazonaws.com/compliance/GHE_FSSAI_License_2026.pdf',
    verification_status: 'approved' as const,
    remarks: 'Verified by State Food Safety Commissioner. Valid through Dec 2028.'
  },
  {
    id: '00000000-0000-4000-d00c-000000000002',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    document_name: 'Maharashtra State Excise Winery Commercial License',
    document_type: 'Wine License' as const,
    document_url: 'https://vinosphere.demo.s3.amazonaws.com/compliance/GHE_Excise_Commercial_Permit.pdf',
    verification_status: 'approved' as const,
    remarks: 'Excise Division Nashik approved for bonded warehouse and on-premise tasting room.'
  },
  {
    id: '00000000-0000-4000-d00c-000000000003',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    document_name: 'GSTIN Registration Certificate - Nashik Division',
    document_type: 'GST' as const,
    document_url: 'https://vinosphere.demo.s3.amazonaws.com/compliance/GHE_GSTIN_Certificate.pdf',
    verification_status: 'approved' as const,
    remarks: 'Active GST registration verified.'
  },
  {
    id: '00000000-0000-4000-d00c-000000000004',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    document_name: 'Certificate of Incorporation - Godavari Hills Estate Pvt Ltd',
    document_type: 'Business Registration' as const,
    document_url: 'https://vinosphere.demo.s3.amazonaws.com/compliance/GHE_MCA_COI.pdf',
    verification_status: 'approved' as const,
    remarks: 'Ministry of Corporate Affairs CIN verified.'
  }
];

// ============================================================================
// REVIEWS (12 High-Quality Sommelier & Patron Reviews)
// ============================================================================
export const DEMO_REVIEWS = [
  {
    id: '00000000-0000-4000-fb00-000000000001',
    user_id: '00000000-0000-4000-ba00-000000000002', // Vikramaditya
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    wine_id: '00000000-0000-4000-ca00-000000000001', // Reserve Shiraz
    experience_id: null,
    event_id: null,
    rating: 5.0,
    review: 'Extraordinary depth for an Indian Shiraz. The 14-month French oak aging brings elegant nuances of toasted clove and dark chocolate that seamlessly complement the peppery black fruit.'
  },
  {
    id: '00000000-0000-4000-fb00-000000000002',
    user_id: '00000000-0000-4000-ba00-000000000001', // Ananya
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    wine_id: '00000000-0000-4000-ca00-000000000002', // Chenin Blanc
    experience_id: null,
    event_id: null,
    rating: 4.8,
    review: 'Crisp, aromatic, and superbly refreshing. Passion fruit and green apple notes shine brightly. Paired flawlessly with butter garlic prawns at the tasting pavilion!'
  },
  {
    id: '00000000-0000-4000-fb00-000000000003',
    user_id: '00000000-0000-4000-ba00-000000000003', // Meera
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    wine_id: '00000000-0000-4000-ca00-000000000003', // Cuvée Royale Brut
    experience_id: null,
    event_id: null,
    rating: 5.0,
    review: 'A true benchmark for Indian traditional method sparkling. Incredibly fine perlage with toasted brioche and Meyer lemon. Easily rivals international crémants.'
  },
  {
    id: '00000000-0000-4000-fb00-000000000004',
    user_id: '00000000-0000-4000-ba00-000000000004', // Rohan
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    wine_id: '00000000-0000-4000-ca00-000000000005', // Blush Zinfandel Rose
    experience_id: null,
    event_id: null,
    rating: 4.6,
    review: 'Delightfully fruit-forward with juicy strawberry and floral notes. Very easy to enjoy chilled on a warm afternoon. Great beginner-friendly bottle!'
  },
  {
    id: '00000000-0000-4000-fb00-000000000005',
    user_id: '00000000-0000-4000-ba00-000000000002',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    wine_id: null,
    experience_id: '00000000-0000-4000-fa00-000000000002', // Blending Workshop
    event_id: null,
    rating: 5.0,
    review: 'The blending workshop was the absolute highlight of our Nashik trip. Winemaker Rajesh explained barrel aging with immense passion, and corking our custom bottle was unforgettable.'
  },
  {
    id: '00000000-0000-4000-fb00-000000000006',
    user_id: '00000000-0000-4000-ba00-000000000001',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    wine_id: null,
    experience_id: '00000000-0000-4000-fa00-000000000001', // Cellar Tour
    event_id: null,
    rating: 4.9,
    review: 'Immaculately maintained gravity-flow cellar and professional sommelier guidance. The tasting flight was generous and educational.'
  },
  {
    id: '00000000-0000-4000-fb00-000000000007',
    user_id: '00000000-0000-4000-ba00-000000000003',
    winery_id: '00000000-0000-4000-d000-000000000002', // Sahyadri
    wine_id: '00000000-0000-4000-ca00-000000000013',
    experience_id: null,
    event_id: null,
    rating: 4.8,
    review: 'Vibrant flinty minerality and mouthwatering citrus acidity. A stellar expression of high-elevation Dindori terroir.'
  },
  {
    id: '00000000-0000-4000-fb00-000000000008',
    user_id: '00000000-0000-4000-ba00-000000000002',
    winery_id: '00000000-0000-4000-d000-000000000003', // Trimbak
    wine_id: '00000000-0000-4000-ca00-000000000018',
    experience_id: null,
    event_id: null,
    rating: 4.9,
    review: 'Brahmagiri Grand Reserve has serious aging pedigree. Intense dark plum, clove, and roasted coffee. Needs decanting for an hour to open up completely.'
  },
  {
    id: '00000000-0000-4000-fb00-000000000009',
    user_id: '00000000-0000-4000-ba00-000000000004',
    winery_id: '00000000-0000-4000-d000-000000000004', // Deccan Crest
    wine_id: '00000000-0000-4000-ca00-000000000023',
    experience_id: null,
    event_id: null,
    rating: 4.7,
    review: 'The Blush Zinfandel is so refreshing on a sunny afternoon! Perfect balance of light sweetness and fruity acidity. Everyone in our group loved it.'
  },
  {
    id: '00000000-0000-4000-fb00-000000000010',
    user_id: '00000000-0000-4000-ba00-000000000001',
    winery_id: '00000000-0000-4000-d000-000000000005', // Vinewood
    wine_id: '00000000-0000-4000-ca00-000000000030',
    experience_id: null,
    event_id: null,
    rating: 4.9,
    review: 'Skin-contact orange wine fermented in amphorae is a revelation for Indian viticulture. Dried apricot and bergamot tea with intriguing tannic grip.'
  },
  {
    id: '00000000-0000-4000-fb00-000000000011',
    user_id: '00000000-0000-4000-ba00-000000000003',
    winery_id: '00000000-0000-4000-d000-000000000006', // Nashik Heritage
    wine_id: '00000000-0000-4000-ca00-000000000033',
    experience_id: null,
    event_id: null,
    rating: 4.8,
    review: 'Heritage Sparkling Brut delivers incredible quality for value. Fine, persistent bubbles and crisp lemon-brioche flavor profile.'
  },
  {
    id: '00000000-0000-4000-fb00-000000000012',
    user_id: '00000000-0000-4000-ba00-000000000002',
    winery_id: DEMO_WINERY_FLAGSHIP_ID,
    wine_id: '00000000-0000-4000-ca00-000000000011', // Founders Heritage Red
    experience_id: null,
    event_id: null,
    rating: 5.0,
    review: 'A collector’s treasure. The 2019 Founders Heritage red blend has layers of cassis, balsamic, and dark cocoa with immense longevity. World-class winemaking in Nashik.'
  }
];

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

export async function seedCompleteDemoData() {
  console.log('🚀 Starting VinoSphere Complete Demo Data Seeding...\n');

  // 1. Seed Demo Users
  console.log('👤 [1/9] Seeding Demo Patron & Estate Users...');
  const { error: userErr } = await supabase.from('users').upsert(
    DEMO_USERS.map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      phone: u.phone,
      role: u.role,
      winery_id: u.winery_id,
      city: u.city,
      state: u.state,
      country: u.country,
      experience_level: u.experience_level,
      favorite_wine_types: u.favorite_wine_types,
      primary_interest: u.primary_interest
    })),
    { onConflict: 'id' }
  );
  if (userErr) throw new Error(`Users seeding failed: ${userErr.message}`);
  console.log(`   ✅ Seeded ${DEMO_USERS.length} demo user profiles.`);

  // 2. Seed Wineries
  console.log('🏰 [2/9] Seeding 9 Fictional Nashik Wineries (6 Published, 2 Draft/Pending, 1 Archived)...');
  const { error: wineryErr } = await supabase.from('wineries').upsert(
    DEMO_WINERIES.map(w => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      description: w.description,
      established_year: w.established_year,
      email: w.email,
      phone: w.phone,
      website: w.website,
      address: w.address,
      city: w.city,
      state: w.state,
      country: w.country,
      latitude: w.latitude,
      longitude: w.longitude,
      logo_url: w.logo_url,
      banner_url: w.banner_url,
      opening_time: w.opening_time,
      closing_time: w.closing_time,
      verified: w.verified,
      status: w.status,
      awards: w.awards,
      timeline: w.timeline
    })),
    { onConflict: 'id' }
  );
  if (wineryErr) throw new Error(`Wineries seeding failed: ${wineryErr.message}`);
  console.log(`   ✅ Seeded ${DEMO_WINERIES.length} winery records.`);

  // 3. Seed Wines
  console.log('🍷 [3/9] Seeding 35 Authentic Wine Records across Red, White, Rosé, Sparkling, Dessert...');
  const winesPayload = DEMO_WINES.map(w => ({
    id: w.id,
    winery_id: w.winery_id,
    name: w.name,
    slug: w.slug,
    wine_type: w.wine_type,
    grape_variety: w.grape_variety,
    vintage: w.vintage,
    alcohol_percentage: w.alcohol_percentage,
    body: w.body,
    sweetness: w.sweetness,
    acidity: w.acidity,
    tannin: w.tannin || 'Medium',
    serving_temperature: w.serving_temperature,
    description: w.description,
    food_pairings: w.food_pairings,
    taste_notes: w.taste_notes
  }));
  const { error: winesErr } = await supabase.from('wines').upsert(winesPayload, { onConflict: 'id' });
  if (winesErr) throw new Error(`Wines seeding failed: ${winesErr.message}`);
  console.log(`   ✅ Seeded ${DEMO_WINES.length} wine records.`);

  // 4. Seed Wine Inventory (Price in INR, Stock, SKU, Featured)
  console.log('📦 [4/9] Seeding Wine Inventory (Prices, Stock Quantity, SKUs)...');
  const inventoryPayload = DEMO_WINES.map((w, idx) => ({
    id: `00000000-0000-4000-da00-${String(idx + 1).padStart(12, '0')}`,
    wine_id: w.id,
    sku: w.sku,
    price: w.price,
    stock_quantity: w.stock_quantity,
    featured: w.featured,
    publish_status: 'published'
  }));
  const { error: invErr } = await supabase.from('wine_inventory').upsert(inventoryPayload, { onConflict: 'id' });
  if (invErr) throw new Error(`Inventory seeding failed: ${invErr.message}`);
  console.log(`   ✅ Seeded ${inventoryPayload.length} inventory records.`);

  // 5. Seed Wine Images (Unsplash bottle photography with is_primary: true)
  console.log('📸 [5/9] Seeding Wine Images (Primary bottle imagery)...');
  const imagesPayload = DEMO_WINES.map((w, idx) => ({
    id: `00000000-0000-4000-db00-${String(idx + 1).padStart(12, '0')}`,
    wine_id: w.id,
    image_url: w.image_url,
    public_id: `demo_wine_img_${idx + 1}`,
    display_order: 1,
    is_primary: true
  }));
  const { error: imgErr } = await supabase.from('wine_images').upsert(imagesPayload, { onConflict: 'id' });
  if (imgErr) throw new Error(`Images seeding failed: ${imgErr.message}`);
  console.log(`   ✅ Seeded ${imagesPayload.length} wine primary images.`);

  // 6. Seed Events & Experiences (Future Dates, Capacities, Inclusions)
  console.log('🎉 [6/9] Seeding Upcoming Events & Curated Experiences...');
  const { error: eventsErr } = await supabase.from('events').upsert(DEMO_EVENTS, { onConflict: 'id' });
  if (eventsErr) throw new Error(`Events seeding failed: ${eventsErr.message}`);
  console.log(`   ✅ Seeded ${DEMO_EVENTS.length} upcoming events (scheduled Dec 2026 - Mar 2027).`);

  const { error: expErr } = await supabase.from('experiences').upsert(DEMO_EXPERIENCES, { onConflict: 'id' });
  if (expErr) throw new Error(`Experiences seeding failed: ${expErr.message}`);
  console.log(`   ✅ Seeded ${DEMO_EXPERIENCES.length} estate experiences.`);

  // 7. Seed Bookings (Completed, Confirmed, Pending, Cancelled with matching revenue)
  console.log('🎟️ [7/9] Seeding Bookings History (Mathematically consistent revenue & guest counts)...');
  const { error: bookErr } = await supabase.from('bookings').upsert(DEMO_BOOKINGS, { onConflict: 'id' });
  if (bookErr) throw new Error(`Bookings seeding failed: ${bookErr.message}`);
  console.log(`   ✅ Seeded ${DEMO_BOOKINGS.length} booking records.`);

  // 8. Seed Corporate Leads & Documents
  console.log('🏢 [8/9] Seeding Corporate Enquiries & Estate Compliance Documents...');
  const { error: leadErr } = await supabase.from('corporate_leads').upsert(DEMO_CORPORATE_LEADS, { onConflict: 'id' });
  if (leadErr) throw new Error(`Corporate leads seeding failed: ${leadErr.message}`);
  console.log(`   ✅ Seeded ${DEMO_CORPORATE_LEADS.length} corporate leads.`);

  const { error: docErr } = await supabase.from('documents').upsert(DEMO_DOCUMENTS, { onConflict: 'id' });
  if (docErr) throw new Error(`Documents seeding failed: ${docErr.message}`);
  console.log(`   ✅ Seeded ${DEMO_DOCUMENTS.length} official compliance documents.`);

  // 9. Seed Reviews (Ratings & Sommelier Notes)
  console.log('⭐ [9/9] Seeding Sommelier Reviews & Patron Ratings...');
  const { error: revErr } = await supabase.from('reviews').upsert(DEMO_REVIEWS, { onConflict: 'id' });
  if (revErr) throw new Error(`Reviews seeding failed: ${revErr.message}`);
  console.log(`   ✅ Seeded ${DEMO_REVIEWS.length} verified tasting reviews.`);

  console.log('\n✨ COMPLETE DEMO DATASET SEEDING FINISHED SUCCESSFULLY! ✨\n');
  console.log('Summary of Seeded Demo Assets:');
  console.log(`- Wineries:            ${DEMO_WINERIES.length} (Flagship: ${DEMO_WINERY_FLAGSHIP_ID})`);
  console.log(`- Wine Catalog:        ${DEMO_WINES.length} (linked with price & primary image)`);
  console.log(`- Events:              ${DEMO_EVENTS.length}`);
  console.log(`- Experiences:         ${DEMO_EXPERIENCES.length}`);
  console.log(`- Bookings:            ${DEMO_BOOKINGS.length}`);
  console.log(`- Corporate Leads:     ${DEMO_CORPORATE_LEADS.length}`);
  console.log(`- Documents:           ${DEMO_DOCUMENTS.length}`);
  console.log(`- Member Reviews:      ${DEMO_REVIEWS.length}`);
  console.log(`- Patron/Admin Users:  ${DEMO_USERS.length}`);
}

if (require.main === module) {
  seedCompleteDemoData()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Seeding Fatal Error:', err);
      process.exit(1);
    });
}
