import React, { useState, useEffect } from 'react';
import HeroLanding from './components/HeroLanding';
import WinePairing from './components/WinePairing';
import { wines } from './data/wines';
import { foods } from './data/foods';
import { getTopPairings } from './utils/pairingEngine';
import {
  getCategories,
  getFoods,
  fetchFoodRecommendations,
  fetchWineRecommendations,
} from './utils/recommendationApi';

function normalizeWineName(name) {
  if (!name) return '';
  return name
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\.\w{2,4}$/, '')
    .replace(/[\s\-\.–—]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}


// ---------------------------------------------------------------------------
// LOCAL CATALOG — built from wines.js using the rule engine.
// Used ONLY for the "browse" state (no food pill selected) so the Wine→Food
// direction keeps working exactly as before, and sidebar badge counts remain
// accurate.
// ---------------------------------------------------------------------------
const localCatalog = wines.map((wine, index) => {
  const topMatch = getTopPairings(wine, foods, 1)[0];
  const food = topMatch ? topMatch.food : foods[index % foods.length];
  const engineResult = topMatch
    ? { score: topMatch.score, reasons: topMatch.reasons }
    : { score: 0, reasons: ["Classic sommelier match."] };
  const matchPct = Math.min(99, Math.round(78 + engineResult.score * 2.2));

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
    acidity: wine.acidity || "",
    tannin: wine.tannin || "",
    taste: wine.flavorNotes || [],
    sweetness: wine.sweetness === 'sweet' ? 3 : wine.sweetness === 'off-dry' ? 2 : 0,
    sweetnessLabel: wine.sweetness || "",
    price: wine.price,
    rating: wine.rating,
    servingTemp: wine.servingTemp,
    country: wine.country,
    flag: wine.flag,
    wineImg: wine.customPairingImg || wine.wineImg || `/images/${wine.id}.png`,
    dishName: food.name,
    dishImg: food.dishImg || "/images/dish_isolated.png",
    foodTags: [food.cookingMethod, food.richness + " richness"],
    foodPref: ["Non-Vegetarian"],
    cuisine: "Culinary Pair",
    spiceLevel: food.spiceLevel === 'high' ? 3 : food.spiceLevel === 'medium' ? 2 : 1,
    occasion: "Fine Dining",
    mealType: ["Dinner"],
    pairingScore: matchPct,
    matchRating: matchPct >= 90 ? "Excellent Match" : "Good Harmony",
    indianPairings: engineResult.reasons[0] || "Classic sommelier match.",
    reasons: engineResult.reasons,
    wineObj: wine,
    foodObj: food,
    _source: "local",
  };
});

// Map a single backend recommendation record to the card shape the UI expects.
function mapApiRec(rec, index) {
  const bodyStr = (rec.body || "").toLowerCase();
  const sweetnessStr = (rec.sweetness || "").toLowerCase();

  const sweetnessNum =
    sweetnessStr === 'sweet' ? 3 :
    sweetnessStr === 'off-dry' ? 2 :
    sweetnessStr === 'medium' ? 1 : 0;

  const matchPct = Math.min(99, Math.round(rec.score * 100));

  // Use image_url from the enriched CSV if available; fall back to static asset
  const wineImg = (rec.image_url && rec.image_url.trim())
    ? rec.image_url.trim()
    : "/images/wine_isolated.png";

  return {
    id: `api-${index}`,
    wineName: rec.wine_name || "Unknown Wine",
    winery: rec.winery || "",
    region: rec.region || "",
    wineType: rec.wine_type
      ? rec.wine_type.charAt(0).toUpperCase() + rec.wine_type.slice(1)
      : "Wine",
    grape: rec.variety || "",
    description: [
      rec.body ? `Body: ${rec.body}` : "",
      rec.acidity ? `Acidity: ${rec.acidity}` : "",
      rec.tannin ? `Tannin: ${rec.tannin}` : "",
    ]
      .filter(Boolean)
      .join(" · ") || "Recommended by sommelier pairing engine.",
    body: rec.body
      ? rec.body.charAt(0).toUpperCase() + rec.body.slice(1)
      : "",
    acidity: rec.acidity || "",
    tannin: rec.tannin || "",
    taste: [],
    sweetness: sweetnessNum,
    sweetnessLabel: rec.sweetness || "",
    price: rec.price || 0,
    rating: rec.rating || 0,
    servingTemp: rec.serving_temp || "",
    country: "",
    flag: "",
    wineImg,
    dishName: rec._foodName || "",
    // Use Cloudinary food/dish image if available
    dishImg: (rec._dish_image_url && rec._dish_image_url.trim())
      ? rec._dish_image_url
      : (rec.dishImg || "/images/dish_isolated.png"),
    foodTags: [],
    foodPref: ["Non-Vegetarian"],
    cuisine: "Culinary Pair",
    spiceLevel: 2,
    occasion: "Fine Dining",
    mealType: ["Dinner"],
    pairingScore: matchPct,
    matchRating: matchPct >= 90 ? "Excellent Match" : matchPct >= 80 ? "Very Good Match" : "Good Harmony",
    indianPairings: `AI-ranked pairing score: ${matchPct}%`,
    reasons: [
      rec.body     ? `Body: ${rec.body}`         : null,
      rec.sweetness ? `Sweetness: ${rec.sweetness}` : null,
      rec.acidity  ? `Acidity: ${rec.acidity}`   : null,
      rec.tannin   ? `Tannin: ${rec.tannin}`     : null,
    ].filter(Boolean),
    _bodyRaw: bodyStr,
    _sweetnessRaw: sweetnessStr,
    _source: "api",
  };
}


const grapeOptions = [
  "Cabernet Sauvignon", "Shiraz", "Sauvignon Blanc", "Chenin Blanc",
  "Sangiovese", "Chardonnay", "Tempranillo", "Pinot Noir",
  "Syrah", "Malbec", "Riesling", "Merlot"
];

const wineTypeOptions = [
  "Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified"
];

function deriveProfileTags(dishName, category) {
  const tags = [];
  const d = (dishName || "").toLowerCase();
  const c = (category || "").toLowerCase();

  if (category) tags.push(category);
  if (d.includes("butter") || d.includes("makhani") || d.includes("cream")) {
    tags.push("Rich");
    tags.push("Creamy Texture");
  }
  if (d.includes("tikka") || d.includes("tandoor") || d.includes("masala")) {
    tags.push("Medium Spice");
  }
  if (d.includes("biryani") || d.includes("fried rice")) {
    tags.push("Aromatic");
    tags.push("Layered Flavours");
  }
  if (d.includes("palak") || d.includes("dal") || d.includes("aloo")) {
    tags.push("Earthy");
    tags.push("Mild");
  }
  if (d.includes("vindaloo") || d.includes("chettinad") || d.includes("kolhapuri")) {
    tags.push("High Spice");
    tags.push("Bold");
  }
  if (c.includes("seafood") || d.includes("fish") || d.includes("prawn")) {
    tags.push("Delicate");
    tags.push("Oceanic");
  }
  if (c.includes("vegetarian") || c.includes("vegan")) {
    tags.push("Plant-Based");
  }
  if (tags.length < 2) tags.push("Savoury");
  return tags.slice(0, 5);
}

function matchStars(score) {
  if (score >= 90) return { stars: "★★★★★", label: "Excellent Match" };
  if (score >= 80) return { stars: "★★★★☆", label: "Very Good Match" };
  if (score >= 70) return { stars: "★★★☆☆", label: "Good Match" };
  return { stars: "★★☆☆☆", label: "Decent Match" };
}

function generatePairingExplanation(wine, dishName) {
  const body = (wine.body || "medium").toLowerCase();
  const acidity = (wine.acidity || "medium").toLowerCase();
  const tannin = (wine.tannin || "medium").toLowerCase();
  const type = (wine.wineType || "Wine").toLowerCase();
  const sweetness = (wine.sweetnessLabel || wine._sweetnessRaw || "dry").toLowerCase();

  const whyWine = type.includes("white")
    ? `${wine.wineName} is a ${body}-bodied white wine that complements the richness of ${dishName} without overpowering it. Its crisp character and vibrant profile make it a natural pairing.`
    : type.includes("rosé") || type.includes("rose")
    ? `${wine.wineName} offers the delicate balance of a rosé — enough body to stand up to the flavours of ${dishName}, while remaining refreshing and versatile.`
    : `${wine.wineName} is a ${body}-bodied red wine whose depth and structure pair elegantly with ${dishName}. The wine's complexity enhances every bite.`;

  const servingTemp = type.includes("white") || type.includes("rosé")
    ? "8–12°C (chilled, remove from refrigerator 20 minutes before serving)"
    : type.includes("sparkling")
    ? "6–8°C (well chilled)"
    : "16–18°C (slightly below room temperature)";

  const occasion = body === "full"
    ? "Celebratory dinners, formal meals, or festive occasions"
    : body === "light"
    ? "Casual dining, outdoor gatherings, or light lunches"
    : "Weekend dinners, family feasts, or entertaining guests";

  const perfectWith = dishName
    ? `${dishName}, as well as other dishes with similar richness and spice levels.`
    : "Rich, flavourful Indian cuisine with medium-to-high spice levels.";

  const chefTip = acidity === "high"
    ? `Serve alongside a squeeze of lemon or lime over ${dishName} — the high acidity mirrors the freshness and brightens the palate between bites.`
    : tannin === "high"
    ? `Pair with a small side of yoghurt-based raita or cooling cucumber — the fat softens the tannins and creates a harmonious balance.`
    : sweetness === "off-dry" || sweetness === "sweet"
    ? `The slight sweetness in this wine elegantly offsets any heat in ${dishName}. Serve slightly chilled for best results.`
    : `Let the wine breathe for 10 minutes before serving. A small water cracker between sips refreshes the palate and lets you appreciate each nuance.`;

  return { whyWine, servingTemp, occasion, perfectWith, chefTip };
}

function WhyThisPairingModal({ wine, dishName, onClose }) {
  if (!wine) return null;
  const { whyWine, servingTemp, occasion, perfectWith, chefTip } =
    generatePairingExplanation(wine, dishName || wine.dishName);

  return (
    <div className="pairing-modal-overlay open" onClick={onClose}>
      <div className="pairing-modal-card" onClick={e => e.stopPropagation()}>
        <div className="pm-header">
          <button className="pm-close" onClick={onClose}>✕</button>
          <div className="pm-badge">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            Sommelier Pairing Analysis
          </div>
          <h2 className="pm-wine-name">{wine.wineName}</h2>
          {dishName && (
            <p className="pm-paired-with">
              Paired with <strong>{dishName}</strong>
            </p>
          )}
        </div>

        <div className="pm-body">
          <div className="pm-section">
            <div className="pm-section-label">
                  <img src="/images/wine-glass-sketch.png" alt="wine" style={{ width: '20px', height: '24px', objectFit: 'contain', filter: 'invert(1)', verticalAlign: 'middle', marginRight: '6px' }} /> WINE → FOOD RECOMMENDATION ENGINE
            </div>
            <p className="pm-section-value">{whyWine}</p>
          </div>

          <div className="pm-section">
            <div className="pm-section-label">
              <i className="fa-solid fa-chart-bar"></i>
              Wine Profile
            </div>
            <div className="pm-specs-grid">
              <div className="pm-spec-item">
                <span className="pm-spec-key">Body</span>
                <span className="pm-spec-val">{wine.body || "—"}</span>
              </div>
              <div className="pm-spec-item">
                <span className="pm-spec-key">Acidity</span>
                <span className="pm-spec-val">{wine.acidity || "—"}</span>
              </div>
              <div className="pm-spec-item">
                <span className="pm-spec-key">Tannin</span>
                <span className="pm-spec-val">{wine.tannin || "—"}</span>
              </div>
            </div>
          </div>

          <div className="pm-section">
            <div className="pm-section-label">
              <i className="fa-solid fa-temperature-three-quarters"></i>
              Ideal Serving Temperature
            </div>
            <p className="pm-section-value">{servingTemp}</p>
          </div>

          <div className="pm-section">
            <div className="pm-section-label">
              <i className="fa-solid fa-champagne-glasses"></i>
              Best Occasion
            </div>
            <p className="pm-section-value">{occasion}</p>
          </div>

          <div className="pm-section">
            <div className="pm-section-label">
              <i className="fa-solid fa-utensils"></i>
              Pairs Well With
            </div>
            <p className="pm-section-value">{perfectWith}</p>
          </div>

          <div className="pm-section pm-section-tip">
            <div className="pm-section-label pm-label-gold">
              <i className="fa-solid fa-lightbulb"></i>
              Sommelier Serving Tip
            </div>
            <p className="pm-section-value pm-value-italic">{chefTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [showCatalog, setShowCatalog] = useState(false);

  // Active view mode: 'foodToWine' | 'wineToFood'
  const [activeViewMode, setActiveViewMode] = useState('foodToWine');

  // Top header tab / dropdown state
  const [hoveredTab, setHoveredTab] = useState(null);
  const [pinnedTab, setPinnedTab] = useState(null);
  const activeDropdown = hoveredTab || pinnedTab;

  // Sidebar filters & state
  const [selectedFood, setSelectedFood] = useState([]);
  const [selectedGrapes, setSelectedGrapes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({
    budget: false,
    wineType: false,
    region: false,
    matchQuality: false,
  });
  const [budgetPreset, setBudgetPreset] = useState("all");
  const [sidebarWineTypes, setSidebarWineTypes] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [matchQuality, setMatchQuality] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // Favorites & Modals
  const [favorites, setFavorites] = useState([]);
  const [selectedPairing, setSelectedPairing] = useState(null);
  const [pairingExplainWine, setPairingExplainWine] = useState(null);

  // ---------------------------------------------------------------------------
  // Food → Wine state
  // ---------------------------------------------------------------------------
  const [categories, setCategories]         = useState([]);
  const [catLoading, setCatLoading]         = useState(false);
  const [catError,   setCatError]           = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dishes,     setDishes]             = useState([]);
  const [dishLoading, setDishLoading]       = useState(false);
  const [dishError,  setDishError]          = useState(null);

  const [selectedDish, setSelectedDish]     = useState(null);
  const [customDishInput, setCustomDishInput] = useState('');
  const [retryCount,   setRetryCount]       = useState(0);

  const [apiResults, setApiResults]         = useState([]);
  const [isLoading, setIsLoading]           = useState(false);
  const [apiError, setApiError]             = useState(null);

  // ---------------------------------------------------------------------------
  // Wine → Food state (Wine Pairings mode)
  // ---------------------------------------------------------------------------
  const [selectedWineForFood, setSelectedWineForFood] = useState(null);
  const [customWineInput, setCustomWineInput] = useState('');
  const [wineToFoodResults, setWineToFoodResults] = useState([]);
  const [wineToFoodLoading, setWineToFoodLoading] = useState(false);
  const [wineToFoodError, setWineToFoodError] = useState(null);

  // Load all Cloudinary wine image URLs dynamically on mount
  const [wineImageMap, setWineImageMap] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function loadWineImages() {
      try {
        const response = await fetch("http://127.0.0.1:8000/wines");
        if (response.ok) {
          const data = await response.json();
          const map = { ...(data.image_map || {}) };
          (data.wines || []).forEach(w => {
            if (w.image_url) {
              const norm = normalizeWineName(w.name);
              map[norm] = w.image_url;
            }
          });
          if (!cancelled) setWineImageMap(map);
        }
      } catch (e) {}
    }
    loadWineImages();
    return () => { cancelled = true; };
  }, []);

  const WINERY_PREFIXES_REGEX = /^(sula_vineyards_|sula_|grover_zampa_vineyards_|grover_zampa_|grover_|fratelli_wines_|fratelli_|vallonne_vineyards_|vallonne_|vinsura_winery_|vinsura_|charosa_vineyards_|charosa_|york_winery_|york_|krsma_estates_|krsma_|chateau_indage_|four_seasons_vineyards_|four_seasons_|good_earth_winery_|good_earth_|reveilo_wines_|reveilo_|soul_tree_wines_|soul_tree_|seven_peaks_winery_|seven_peaks_|pinnacle_vineyards_|pinnacle_|chandon_india_|domaine_chandon_|chandon_|big_banyan_wines_|big_banyan_|arra_wines_|arra_|renaissance_wines_|renaissance_|nine_hills_|flamingo_wines_|flamingo_)/;

  const localCatalogWithImages = React.useMemo(() => {
    return localCatalog.map(item => {
      const norm = normalizeWineName(item.wineName || "");
      const stripped = norm.replace(WINERY_PREFIXES_REGEX, "");
      const wineryNorm = normalizeWineName(item.winery || "");
      const prefixed = `${wineryNorm}_${norm}`;
      const dynamicImg =
        wineImageMap[norm] ||
        wineImageMap[stripped] ||
        wineImageMap[prefixed] ||
        wineImageMap[`sula_${norm}`] ||
        wineImageMap[`grover_${norm}`] ||
        wineImageMap[`grover_zampa_${norm}`] ||
        wineImageMap[`vallonne_${norm}`] ||
        wineImageMap[`charosa_${norm}`] ||
        wineImageMap[`york_${norm}`] ||
        wineImageMap[`krsma_${norm}`] ||
        wineImageMap[`big_banyan_${norm}`] ||
        wineImageMap[`good_earth_${norm}`] ||
        wineImageMap[`reveilo_${norm}`] ||
        wineImageMap[`fratelli_${norm}`];

      if (dynamicImg) {
        return { ...item, wineImg: dynamicImg };
      }
      return item;
    });
  }, [wineImageMap]);


  // Load food categories once on mount

  useEffect(() => {
    if (!showCatalog) return;
    let cancelled = false;
    async function loadCats() {
      setCatLoading(true);
      setCatError(null);
      try {
        const cats = await getCategories();
        if (!cancelled) setCategories(cats);
      } catch (err) {
        if (!cancelled) setCatError(err.message || 'Could not load food categories.');
      } finally {
        if (!cancelled) setCatLoading(false);
      }
    }
    loadCats();
    return () => { cancelled = true; };
  }, [showCatalog]);

  // Load dishes whenever selectedCategory changes
  useEffect(() => {
    if (!selectedCategory) { setDishes([]); return; }
    let cancelled = false;
    async function loadDishes() {
      setDishLoading(true);
      setDishError(null);
      setDishes([]);
      setSelectedDish(null);
      setApiResults([]);
      setApiError(null);
      try {
        const list = await getFoods(selectedCategory);
        if (!cancelled) setDishes(list);
      } catch (err) {
        if (!cancelled) setDishError(err.message || 'Could not load dishes for category.');
      } finally {
        if (!cancelled) setDishLoading(false);
      }
    }
    loadDishes();
    return () => { cancelled = true; };
  }, [selectedCategory]);

  // Fetch wine recommendations (Food → Wine) when selectedDish changes
  useEffect(() => {
    if (!selectedDish) { setApiResults([]); return; }
    let cancelled = false;
    async function loadRecs() {
      setIsLoading(true);
      setApiError(null);
      try {
        const recs = await fetchFoodRecommendations(selectedDish);
        if (!cancelled) setApiResults(recs);
      } catch (err) {
        if (!cancelled) setApiError(err.message || 'Recommendation API failed.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadRecs();
    return () => { cancelled = true; };
  }, [selectedDish, retryCount]);

  // Fetch food recommendations (Wine → Food) when selectedWineForFood changes
  useEffect(() => {
    if (!selectedWineForFood) { setWineToFoodResults([]); return; }
    let cancelled = false;
    async function loadFoodRecs() {
      setWineToFoodLoading(true);
      setWineToFoodError(null);
      try {
        const recs = await fetchWineRecommendations(selectedWineForFood);
        if (!cancelled) setWineToFoodResults(recs);
      } catch (err) {
        if (!cancelled) {
          setWineToFoodError(err.message || 'Failed to fetch food recommendations.');
          setWineToFoodResults([]);
        }
      } finally {
        if (!cancelled) setWineToFoodLoading(false);
      }
    }
    loadFoodRecs();
    return () => { cancelled = true; };
  }, [selectedWineForFood]);

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxChange = (value, state, setState) => {
    setState(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const toggleFavorite = (pairingId) => {
    setFavorites(prev =>
      prev.includes(pairingId) ? prev.filter(id => id !== pairingId) : [...prev, pairingId]
    );
  };

  const getGrapeCount = (grape) => {
    return localCatalog.filter(c =>
      c.grape && c.grape.toLowerCase().includes(grape.toLowerCase())
    ).length;
  };

  const getTypeCount = (type) => {
    return localCatalog.filter(c =>
      c.wineType && c.wineType.toLowerCase().includes(type.toLowerCase())
    ).length;
  };

  const toggleGrape = (grape) => {
    setSelectedGrapes(prev =>
      prev.includes(grape) ? prev.filter(g => g !== grape) : [...prev, grape]
    );
  };

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const resetAllFilters = () => {
    setSelectedFood([]);
    setSelectedGrapes([]);
    setSelectedTypes([]);
    setBudgetPreset("all");
    setSidebarWineTypes([]);
    setSelectedRegions([]);
    setMatchQuality("all");
    setSearchQuery("");
    setSortBy("default");
    setSelectedDish(null);
    setCustomDishInput('');
    setSelectedCategory(null);
    setDishes([]);
    setApiResults([]);
    setApiError(null);
    setSelectedWineForFood(null);
    setCustomWineInput('');
    setWineToFoodResults([]);
  };

  const handleHomeClick = () => {
    setShowCatalog(false);
    resetAllFilters();
  };

  const pairingsToDisplay = selectedDish
    ? apiResults.map((rec, i) => {
        const matchedDish = dishes.find(d => 
          (typeof d === 'object' ? d.name : d).toLowerCase() === selectedDish.toLowerCase()
        );
        const dishImgUrl = (typeof matchedDish === 'object' && matchedDish?.image_url)
          ? matchedDish.image_url
          : '';
        return mapApiRec({ 
          ...rec, 
          _foodName: selectedDish, 
          _dish_image_url: dishImgUrl,
          image_url: rec.image_url || ''
        }, i);
      })
    : localCatalogWithImages;

  const filteredPairings = pairingsToDisplay.filter(pairing => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (pairing.wineName || "").toLowerCase();
      const winery = (pairing.winery || "").toLowerCase();
      const grape = (pairing.grape || "").toLowerCase();
      const dish = (pairing.dishName || "").toLowerCase();
      const region = (pairing.region || "").toLowerCase();
      if (!name.includes(q) && !winery.includes(q) && !grape.includes(q) && !dish.includes(q) && !region.includes(q)) {
        return false;
      }
    }

    if (selectedGrapes.length > 0) {
      const pGrape = (pairing.grape || "").toLowerCase();
      const match = selectedGrapes.some(g => pGrape.includes(g.toLowerCase()));
      if (!match) return false;
    }

    if (selectedTypes.length > 0) {
      const pType = (pairing.wineType || "").toLowerCase();
      const match = selectedTypes.some(t => pType.includes(t.toLowerCase()));
      if (!match) return false;
    }

    if (sidebarWineTypes.length > 0) {
      const pType = (pairing.wineType || "").toLowerCase();
      const match = sidebarWineTypes.some(t => pType.includes(t.toLowerCase()));
      if (!match) return false;
    }

    if (selectedRegions.length > 0 && !selectedRegions.includes("Any")) {
      const pRegion = (pairing.region || "").toLowerCase();
      const match = selectedRegions.some(r => pRegion.includes(r.toLowerCase()));
      if (!match) return false;
    }

    if (budgetPreset === "under1000") {
      if (pairing.price > 0 && pairing.price > 1000) return false;
    } else if (budgetPreset === "1000-2000") {
      if (pairing.price > 0 && (pairing.price < 1000 || pairing.price > 2000)) return false;
    } else if (budgetPreset === "premium") {
      if (pairing.price > 0 && pairing.price < 2000) return false;
    }

    if (matchQuality === "best") {
      if (pairing.pairingScore < 85) return false;
    } else if (matchQuality === "good") {
      if (pairing.pairingScore < 70) return false;
    }

    return true;
  });

  const sortedPairings = [...filteredPairings].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name") return a.wineName.localeCompare(b.wineName);
    if (sortBy === "default" && selectedDish) {
      return b.pairingScore - a.pairingScore;
    }
    return 0;
  });

  const profileTags = deriveProfileTags(selectedDish, selectedCategory);

  if (!showCatalog) {
    return <HeroLanding setShowCatalog={setShowCatalog} />;
  }

  return (
    <div className="vivino-app animate-fade-in">

      {/* ── Top Navigation Header ── */}
      <header className="vivino-top-header-wrapper" onMouseLeave={() => setHoveredTab(null)}>
        <div className="vivino-header-bar">
            <div className="vivino-nav-tabs">
              <button
                className="vivino-tab"
                onClick={handleHomeClick}
              >
                Home
              </button>

              <button
                className={`vivino-tab ${activeViewMode === 'foodToWine' && activeDropdown === 'food' ? 'active' : activeViewMode === 'foodToWine' ? 'active-mode' : ''}`}
                onMouseEnter={() => setHoveredTab('food')}
                onClick={() => {
                  setActiveViewMode('foodToWine');
                  setPinnedTab(pinnedTab === 'food' ? null : 'food');
                }}
              >
                Food Pairings
                {selectedDish && <span className="vivino-badge">1</span>}
              </button>

              <button
                className={`vivino-tab ${activeViewMode === 'wineToFood' ? 'active' : ''}`}
                onMouseEnter={() => setHoveredTab('wineToFood')}
                onClick={() => {
                  setActiveViewMode('wineToFood');
                  setPinnedTab(pinnedTab === 'wineToFood' ? null : 'wineToFood');
                }}
              >
                Wine Pairings
                {selectedWineForFood && <span className="vivino-badge">1</span>}
              </button>
            </div>


          {/* Search Input */}
          <div className="vivino-search-wrapper">
            <i className="fa-solid fa-search"></i>
            <input
              type="text"
              className="vivino-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search wines, grapes, wineries..."
            />
          </div>
        </div>

        {/* Floating Dropdown Filter Panel */}
        <div className="vivino-filter-panel-container">
          {activeDropdown === 'food' && (
            <section className="vivino-filter-panel">
              <div className="vivino-panel-subtitle">
                SEARCH ANY DISH (TYPE OR SELECT BELOW)
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!customDishInput.trim()) return;
                  setSelectedDish(customDishInput.trim());
                  setActiveViewMode('foodToWine');
                  setPinnedTab(null);
                  setHoveredTab(null);
                }}
                style={{ marginBottom: '14px' }}
              >
                <div className="dish-search-input-group" style={{ padding: '4px 6px 4px 12px' }}>
                  <i className="fa-solid fa-utensils dish-search-input-icon" style={{ fontSize: '15px' }}></i>
                  <input
                    type="text"
                    className="dish-search-main-input"
                    placeholder="Search any dish (e.g. Pasta Alfredo, Dal Makhani)..."
                    value={customDishInput}
                    onChange={(e) => setCustomDishInput(e.target.value)}
                    style={{ fontSize: '14px', padding: '6px 4px' }}
                  />
                  {customDishInput && (
                    <button
                      type="button"
                      className="dish-search-clear-btn"
                      onClick={() => setCustomDishInput('')}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                  <button type="submit" className="dish-search-submit-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    Pair Dish
                  </button>
                </div>
              </form>

              <div className="dish-search-examples-row" style={{ marginTop: '0', paddingTop: '0', borderTop: 'none', marginBottom: '16px' }}>
                <span className="examples-tag">Examples:</span>
                {["Butter Chicken", "Paneer Tikka", "Dal Makhani", "Chicken Tikka", "Pasta Alfredo"].map(ex => (
                  <button
                    key={ex}
                    type="button"
                    className={`example-pill-btn ${selectedDish === ex ? 'active' : ''}`}
                    onClick={() => {
                      setCustomDishInput(ex);
                      setSelectedDish(ex);
                      setActiveViewMode('foodToWine');
                      setPinnedTab(null);
                      setHoveredTab(null);
                    }}
                  >
                    {ex}
                  </button>
                ))}
              </div>

              <div className="vivino-panel-subtitle" style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '14px' }}>
                OR BROWSE BY CATEGORY
              </div>

              {catLoading && (
                <div style={{ padding: '12px 0', color: '#888', fontSize: '13px' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px', color: '#6B1D2F' }}></i>
                  Loading categories…
                </div>
              )}

              {catError && (
                <div style={{ padding: '8px 0', color: '#c0392b', fontSize: '13px' }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                  {catError}
                </div>
              )}

              {!catLoading && !catError && (
                <div className="vivino-pills-grid">
                  {categories.map(cat => (
                    <div
                      key={cat}
                      className={`vivino-pill ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCategory(prev => prev === cat ? null : cat);
                      }}
                    >
                      <span>{cat}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedCategory && (
                <>
                  <div className="vivino-panel-subtitle" style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '14px' }}>
                    SELECT A DISH FROM &ldquo;{selectedCategory}&rdquo;
                  </div>

                  {dishLoading && (
                    <div style={{ padding: '12px 0', color: '#888', fontSize: '13px' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px', color: '#6B1D2F' }}></i>
                      Loading dishes…
                    </div>
                  )}

                  {dishError && (
                    <div style={{ padding: '8px 0', color: '#c0392b', fontSize: '13px' }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                      {dishError}
                    </div>
                  )}

                  {!dishLoading && !dishError && dishes.length === 0 && (
                    <div style={{ padding: '8px 0', color: '#888', fontSize: '13px' }}>
                      No dishes found for this category.
                    </div>
                  )}

                  {!dishLoading && !dishError && dishes.length > 0 && (
                    <div className="vivino-pills-grid">
                      {dishes.map(dish => {
                        // The /foods API now returns objects {food_name, cuisine, image_url, ...}.
                        // Extract the string name so it can be used as key, display text,
                        // and the value passed to fetchFoodRecommendations.
                        const dishName = typeof dish === 'string' ? dish : (dish.food_name || String(dish));
                        return (
                          <div
                            key={dishName}
                            className={`vivino-pill ${selectedDish === dishName ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedDish(dishName);
                              setCustomDishInput(dishName);
                              setActiveViewMode('foodToWine');
                              setPinnedTab(null);
                              setHoveredTab(null);
                            }}
                          >
                            <span>{dishName}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {(selectedCategory || selectedDish || customDishInput) && (
                <span
                  className="vivino-clear-link"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedDish(null);
                    setCustomDishInput('');
                    setDishes([]);
                    setApiResults([]);
                    setApiError(null);
                  }}
                >
                  Clear food selection
                </span>
              )}

            </section>
          )}

          {/* ── WINE PAIRINGS DROPDOWN (Wine → Food) ── */}
          {activeDropdown === 'wineToFood' && (
            <section className="vivino-filter-panel">
              <div className="vivino-panel-subtitle">
                SELECT A WINE TYPE TO GET RECOMMENDED FOODS
              </div>

              <div className="vivino-pills-grid" style={{ marginBottom: '16px' }}>
                {[
                  { name: "Red Wine", label: "🍷 Red Wine" },
                  { name: "White Wine", label: "🥂 White Wine" },
                  { name: "Rosé Wine", label: "🌸 Rosé Wine" },
                  { name: "Sparkling Wine", label: "✨ Sparkling Wine" },
                  { name: "Dessert Wine", label: "🍯 Dessert Wine" },
                ].map(wt => (
                  <div
                    key={wt.name}
                    className={`vivino-pill ${selectedWineForFood === wt.name ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedWineForFood(wt.name);
                      setCustomWineInput(wt.name);
                      setActiveViewMode('wineToFood');
                      setPinnedTab(null);
                      setHoveredTab(null);
                    }}
                  >
                    <span>{wt.label}</span>
                  </div>
                ))}
              </div>

              <div className="vivino-panel-subtitle" style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '14px' }}>
                OR SEARCH CUSTOM WINE / BOTTLE
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!customWineInput.trim()) return;
                  setSelectedWineForFood(customWineInput.trim());
                  setActiveViewMode('wineToFood');
                  setPinnedTab(null);
                  setHoveredTab(null);
                }}
              >
                <div className="dish-search-input-group" style={{ padding: '4px 6px 4px 12px' }}>
                  <i className="fa-solid fa-wine-bottle dish-search-input-icon" style={{ fontSize: '15px' }}></i>
                  <input
                    type="text"
                    className="dish-search-main-input"
                    placeholder="Search any wine (e.g. Sula Riesling, Fratelli Sette)..."
                    value={customWineInput}
                    onChange={(e) => setCustomWineInput(e.target.value)}
                    style={{ fontSize: '14px', padding: '6px 4px' }}
                  />
                  {customWineInput && (
                    <button
                      type="button"
                      className="dish-search-clear-btn"
                      onClick={() => setCustomWineInput('')}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                  <button type="submit" className="dish-search-submit-btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    Recommend Foods
                  </button>
                </div>
              </form>

              {(selectedWineForFood || customWineInput) && (
                <span
                  className="vivino-clear-link"
                  style={{ marginTop: '12px', display: 'inline-block' }}
                  onClick={() => {
                    setSelectedWineForFood(null);
                    setCustomWineInput('');
                    setWineToFoodResults([]);
                    setWineToFoodError(null);
                  }}
                >
                  Clear wine selection
                </span>
              )}
            </section>
          )}
        </div>
      </header>


      {/* ── Dual Layout: Left Sidebar + Right Main Content ── */}
      <div className="vivino-catalog-layout">

        {/* SIDEBAR */}
        <aside className="vivino-sidebar">
          <div className="vivino-sidebar-header">
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#3F0C1A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-sliders"></i>
              Refine Recommendations
            </h3>
            <button className="vivino-sidebar-reset" onClick={resetAllFilters}>Reset All</button>
          </div>

          {/* Budget */}
          <div className={`sidebar-section ${collapsedSections.budget ? 'collapsed' : ''}`}>
            <div className="sidebar-title" onClick={() => toggleSection('budget')}>
              <span>Budget</span>
              <i className="fa-solid fa-chevron-up"></i>
            </div>
            <div className="sidebar-content">
              <div className="sidebar-radio-group">
                {[
                  { value: "all",       label: "All Budgets" },
                  { value: "under1000", label: "Under ₹1,000" },
                  { value: "1000-2000", label: "₹1,000 – ₹2,000" },
                  { value: "premium",   label: "Premium (₹2,000+)" },
                ].map(opt => (
                  <label
                    key={opt.value}
                    className={`sidebar-radio-row ${budgetPreset === opt.value ? 'selected-budget' : ''}`}
                  >
                    <input
                      type="radio"
                      name="budget"
                      value={opt.value}
                      checked={budgetPreset === opt.value}
                      onChange={() => setBudgetPreset(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Wine Type */}
          <div className={`sidebar-section ${collapsedSections.wineType ? 'collapsed' : ''}`}>
            <div className="sidebar-title" onClick={() => toggleSection('wineType')}>
              <span>Wine Type</span>
              <i className="fa-solid fa-chevron-up"></i>
            </div>
            <div className="sidebar-content">
              <div className="sidebar-checkbox-grid">
                {["White", "Red", "Rosé", "Sparkling"].map(type => (
                  <label key={type} className="sidebar-checkbox-item">
                    <input
                      type="checkbox"
                      checked={sidebarWineTypes.includes(type)}
                      onChange={() => handleCheckboxChange(type, sidebarWineTypes, setSidebarWineTypes)}
                    />
                    {type}
                  </label>
                ))}
              </div>
              {sidebarWineTypes.length > 0 && (
                <span
                  className="vivino-clear-link"
                  style={{ fontSize: '12px', marginTop: '6px', display: 'inline-block' }}
                  onClick={() => setSidebarWineTypes([])}
                >
                  Clear ({sidebarWineTypes.length})
                </span>
              )}
            </div>
          </div>

          {/* Region */}
          <div className={`sidebar-section ${collapsedSections.region ? 'collapsed' : ''}`}>
            <div className="sidebar-title" onClick={() => toggleSection('region')}>
              <span>Region</span>
              <i className="fa-solid fa-chevron-up"></i>
            </div>
            <div className="sidebar-content">
              <div className="sidebar-region-list">
                {["Any", "Nashik", "Karnataka", "Hampi Hills", "Nandi Hills", "Dindori"].map(region => (
                  <label key={region} className="sidebar-checkbox-item" style={{ display: 'flex' }}>
                    <input
                      type="checkbox"
                      checked={selectedRegions.includes(region)}
                      onChange={() => handleCheckboxChange(region, selectedRegions, setSelectedRegions)}
                    />
                    {region}
                  </label>
                ))}
              </div>
              {selectedRegions.length > 0 && (
                <span
                  className="vivino-clear-link"
                  style={{ fontSize: '12px', marginTop: '6px', display: 'inline-block' }}
                  onClick={() => setSelectedRegions([])}
                >
                  Clear ({selectedRegions.length})
                </span>
              )}
            </div>
          </div>

        </aside>

        {/* RIGHT MAIN CONTENT */}
        <main className="vivino-main-content">

          {/* MODE 1: WINE → FOOD EXPERIENCE */}
          {activeViewMode === 'wineToFood' && (
            <div className="wine-to-food-mode-container animate-fade-in">
              {/* DISH SEARCH HERO CARD */}
              <section className="dish-search-hero-card dish-search-hero-card--with-image">
                {/* Left column */}
                <div className="dish-search-hero-left">
                  <span className="dish-search-badge">
                    <i className="fa-solid fa-wand-magic-sparkles"></i> SOMMELIER-GUIDED PAIRING ENGINE
                  </span>
                  <h2 className="dish-search-title">Food &amp; Wine<br/>Pairing</h2>
                  <p className="dish-search-desc">
                    Compute culinary compatibility scores using structured taste attributes and sommelier pairing principles. Evaluate spices, richness, acidity, and tannins.
                  </p>
                  <div className="dish-search-mode-btns">
                    <form className="dish-search-form" onSubmit={(e) => {
                      e.preventDefault();
                      if (!customWineInput.trim()) return;
                      setSelectedWineForFood(customWineInput.trim());
                    }}>
                      <div className="dish-search-input-group">
                        <i className="fa-solid fa-wine-bottle dish-search-input-icon"></i>
                        <input
                          type="text"
                          className="dish-search-main-input"
                          placeholder="Search any wine (e.g. Sula Riesling, Fratelli Sette)..."
                          value={customWineInput}
                          onChange={(e) => setCustomWineInput(e.target.value)}
                        />
                        {customWineInput && (
                          <button type="button" className="dish-search-clear-btn" onClick={() => setCustomWineInput('')}>
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        )}
                        <button type="submit" className="dish-search-submit-btn">
                          <i className="fa-solid fa-utensils"></i> Food → Wine Recommender
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="dish-search-examples-row">
                    <span className="examples-tag">Examples:</span>
                    {[
                      { name: "Red Wine", label: "Red Wine", icon: "🍷" },
                      { name: "White Wine", label: "White Wine", icon: "🥂" },
                      { name: "Rosé Wine", label: "Rosé Wine", icon: "🌸" },
                      { name: "Sparkling Wine", label: "Sparkling", icon: "✨" },
                      { name: "Dessert Wine", label: "Dessert Wine", icon: "🍯" },
                    ].map(({ name, label, icon }) => (
                      <button
                        key={name}
                        type="button"
                        className={`example-pill-btn ${selectedWineForFood === name ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedWineForFood(name);
                          setCustomWineInput(name);
                        }}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Right column */}
                <div className="dish-search-hero-img-col">
                  <img src="/images/wine-glass-sketch.png" alt="Wine glass illustration" className="dish-search-hero-wine-img" />
                </div>
              </section>

              {/* ACTIVE WINE PAIRING BANNER */}
              {selectedWineForFood && (
                <section className="active-dish-banner" style={{ background: 'linear-gradient(135deg, #1A0A10 0%, #2D0D18 100%)', borderColor: '#8B263E', margin: '24px 0' }}>
                  <div>
                    <span className="active-dish-label" style={{ color: '#E8C170' }}>ACTIVE WINE SELECTION</span>
                    <h3 className="active-dish-title" style={{ color: '#FFFFFF' }}>
                      <i className="fa-solid fa-wine-glass" style={{ color: '#E8C170' }}></i> {selectedWineForFood}
                    </h3>
                    <span className="active-dish-status-badge" style={{ background: 'rgba(232, 193, 112, 0.15)', color: '#E8C170' }}>
                      <i className="fa-solid fa-wand-magic-sparkles"></i> Sommelier Palate Compatibility Matched
                    </span>

                  </div>
                  <button
                    className="btn-clear-dish"
                    style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF' }}
                    onClick={() => {
                      setSelectedWineForFood(null);
                      setCustomWineInput('');
                      setWineToFoodResults([]);
                    }}
                  >
                    <i className="fa-solid fa-xmark"></i> Clear Wine Selection
                  </button>
                </section>
              )}

              {/* RECOMMENDED FOOD DISH CARDS GRID */}
              {selectedWineForFood && (
                <section className="wine-to-food-results-section" style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1A0A10', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-utensils" style={{ color: '#7B1E3A' }}></i>
                    Top 5 Recommended Food Dishes for <span style={{ color: '#7B1E3A' }}>{selectedWineForFood}</span>
                  </h3>

                  {wineToFoodLoading ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#666', background: '#FFF', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#7B1E3A', marginBottom: '12px' }}></i>
                      <p style={{ fontWeight: '600' }}>Analyzing wine attributes & searching compatible dishes…</p>
                    </div>
                  ) : wineToFoodError ? (
                    <div style={{ padding: '16px', color: '#c0392b', background: '#fdf2f2', borderRadius: '8px' }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i>
                      {wineToFoodError}
                    </div>
                  ) : wineToFoodResults.length === 0 ? (
                    <div style={{ padding: '16px', color: '#666' }}>No recommendations found.</div>
                  ) : (
                    <div className="vivino-cards-grid">
                      {wineToFoodResults.map((rec, i) => (
                        <div key={`${rec.food_name}-${i}`} className="vivino-card animate-card-in" style={{ borderTop: '4px solid #7B1E3A' }}>
                          <div className="vivino-card-badge">
                            <span className="vivino-score">{(rec.score * 100).toFixed(0)}% Match</span>
                            <span className="vivino-match-label">Sommelier Recommendation</span>
                          </div>
                          {/* Dish image with graceful fallback */}
                          <div className="vivino-card-image-wrapper" style={{ background: '#1A0A10' }}>
                            {rec.image_url ? (
                              <img
                                src={rec.image_url}
                                alt={rec.food_name}
                                className="vivino-card-wine-img"
                                style={{ objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                                }}
                              />
                            ) : null}
                            <div style={{
                              display: rec.image_url ? 'none' : 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '160px',
                              color: '#555',
                              fontSize: '48px',
                            }}>
                              🍽️
                            </div>
                          </div>
                          <div className="vivino-card-body">
                            <div>
                              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#7B1E3A', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                                {rec.cuisine} Cuisine · {rec.category}
                              </span>
                              <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#1A0A10', margin: '0 0 10px 0', lineHeight: '1.25' }}>
                                {rec.food_name}
                              </h4>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                                <span style={{ background: '#F4EAEF', color: '#6B1D2F', padding: '3px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                                  Protein: {rec.protein}
                                </span>
                                <span style={{ background: '#F4EAEF', color: '#6B1D2F', padding: '3px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                                  Spice: {rec.spice_level}
                                </span>
                                <span style={{ background: '#F4EAEF', color: '#6B1D2F', padding: '3px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                                  Richness: {rec.richness}
                                </span>
                              </div>
                            </div>
                            <div style={{ background: '#F8F4F5', padding: '9px 12px', borderRadius: '8px', fontSize: '12px', color: '#333', borderLeft: '3px solid #27ae60', marginTop: 'auto' }}>
                              <i className="fa-solid fa-circle-check" style={{ color: '#27ae60', marginRight: '6px' }}></i>
                              Ideal Wine Type: <strong>{rec.recommended_wine_type}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          )}

          {/* MODE 2: FOOD → WINE EXPERIENCE */}
          {activeViewMode === 'foodToWine' && (
            <div className="food-to-wine-mode-container animate-fade-in">
              {/* DISH SEARCH HERO CARD */}
              <section className="dish-search-hero-card dish-search-hero-card--with-image">
                {/* Left: text + form */}
                <div className="dish-search-hero-left">
                  <span className="dish-search-badge">
                    <i className="fa-solid fa-wand-magic-sparkles"></i> SOMMELIER-GUIDED PAIRING ENGINE
                  </span>
                  <h2 className="dish-search-title">Food &amp; Wine<br/>Pairing</h2>
                  <p className="dish-search-desc">
                    Compute culinary compatibility scores using structured taste attributes and sommelier pairing principles. Evaluate spices, richness, acidity, and tannins.
                  </p>

                  <div className="dish-search-mode-btns">
                    <form
                      className="dish-search-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!customDishInput.trim()) return;
                        setSelectedDish(customDishInput.trim());
                      }}
                    >
                      <div className="dish-search-input-group">
                        <i className="fa-solid fa-utensils dish-search-input-icon"></i>
                        <input
                          type="text"
                          className="dish-search-main-input"
                          placeholder="Search any dish (e.g. Butter Chicken, Paneer Tikka, Dal Makhani, Pasta Alfredo)..."
                          value={customDishInput}
                          onChange={(e) => setCustomDishInput(e.target.value)}
                        />
                        {customDishInput && (
                          <button
                            type="button"
                            className="dish-search-clear-btn"
                            onClick={() => setCustomDishInput('')}
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        )}
                        <button type="submit" className="dish-search-submit-btn">
                          <i className="fa-solid fa-utensils"></i> Food → Wine Recommender
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="dish-search-examples-row">
                    <span className="examples-tag">Examples:</span>
                    {["Butter Chicken", "Paneer Tikka", "Dal Makhani", "Chicken Tikka", "Pasta Alfredo"].map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        className={`example-pill-btn ${selectedDish === ex ? 'active' : ''}`}
                        onClick={() => {
                          setCustomDishInput(ex);
                          setSelectedDish(ex);
                        }}
                      >
                        <i className="fa-solid fa-bowl-food" style={{ fontSize: '11px', color: selectedDish === ex ? '#1A050B' : '#D4AF37' }}></i>
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: wine glass sketch image */}
                <div className="dish-search-hero-img-col">
                  <img
                    src="/images/wine-glass-sketch.png"
                    alt="Wine glass illustration"
                    className="dish-search-hero-wine-img"
                  />
                </div>
              </section>

              {/* ACTIVE DISH SELECTION BANNER */}
              {selectedDish && (
                <div className="active-dish-banner">
                  <div>
                    <span className="active-dish-label">ACTIVE FOOD PAIRING</span>
                    <h3 className="active-dish-title">
                      <i className="fa-solid fa-utensils" style={{ color: '#7B1E3A' }}></i> {selectedDish}
                    </h3>
                    <span className="active-dish-status-badge">
                      <i className="fa-solid fa-circle-check"></i> Sommelier Selected Pairing
                    </span>
                  </div>
                  <button
                    className="btn-clear-dish"
                    onClick={() => {
                      setSelectedDish(null);
                      setCustomDishInput('');
                      setSelectedCategory(null);
                      setDishes([]);
                      setApiResults([]);
                    }}
                  >
                    <i className="fa-solid fa-xmark"></i> Clear Dish Selection
                  </button>
                </div>
              )}

              {/* Active Dish Profile Tags Card */}
              {selectedDish && (
                <div className="active-dish-profile-card">
                  <div className="adp-header">
                    <i className="fa-solid fa-tags"></i>
                    <span>Dish Characteristics & Profile</span>
                  </div>
                  <div className="adp-tags-list">
                    {profileTags.map(tag => (
                      <span key={tag} className="adp-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations Header */}
              <div className="vivino-catalog-header">
                <div>
                  <h2 className="vivino-results-count">
                    {isLoading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin" style={{ color: '#7B1E3A', marginRight: '8px' }}></i>
                        Analyzing dish & generating recommendations…
                      </>
                    ) : selectedDish ? (
                      <>
                        <i className="fa-solid fa-sparkles" style={{ color: '#D4AF37', marginRight: '8px' }}></i>
                        {filteredPairings.length} Wine Recommendations for &ldquo;{selectedDish}&rdquo;
                      </>
                    ) : (
                      <>Showing {filteredPairings.length} Curated Wine Pairings</>
                    )}
                  </h2>
                  {selectedDish && !isLoading && (
                    <p className="vivino-results-sub">
                      Ranked by attribute compatibility and complementary flavor notes.
                    </p>
                  )}
                </div>

                <div className="vivino-sort-wrapper">
                  <label>Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="vivino-sort-select"
                  >
                    <option value="default">Match Score (High to Low)</option>
                    <option value="rating">Rating (High to Low)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                    <option value="name">Wine Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Loading Indicator */}
              {isLoading && (
                <div className="ai-loading-container">
                  <div className="ai-loading-spinner"></div>
                  <p className="ai-loading-text">
                    Sommelier is analyzing flavor profiles for &ldquo;{selectedDish}&rdquo;…
                  </p>
                  <p className="ai-loading-subtext">
                    Evaluating palate harmony, acidity, tannins, and aroma balance.
                  </p>
                </div>
              )}


              {/* API Error Message */}
              {apiError && !isLoading && (
                <div className="ai-error-banner">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>{apiError}</span>
                  <button
                    className="ai-retry-btn"
                    onClick={() => setRetryCount(c => c + 1)}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Cards Grid */}
              {!isLoading && !apiError && (
                <div className="vivino-cards-grid">
                  {sortedPairings.map((pairing) => {
                    const isFav = favorites.includes(pairing.id);
                    const { stars, label: matchLabel } = matchStars(pairing.pairingScore);

                    return (
                      <div
                        key={pairing.id}
                        className="vivino-card animate-card-in"
                      >
                        <div className="vivino-card-top-bar">
                          <div className="vivino-card-badge">
                            <span className="vivino-score">{pairing.pairingScore}% Match</span>
                            <span className="vivino-match-label">{matchLabel}</span>
                          </div>

                          <button
                            className={`vivino-fav-btn ${isFav ? 'active' : ''}`}
                            onClick={() => toggleFavorite(pairing.id)}
                            title={isFav ? "Remove from Favorites" : "Save to Favorites"}
                          >
                            <i className={`fa-${isFav ? 'solid' : 'regular'} fa-heart`}></i>
                          </button>
                        </div>

                        <div className="vivino-card-wine-image-wrapper">
                          <img
                            src={pairing.wineImg}
                            alt={pairing.wineName}
                            className="vivino-card-wine-img"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/wine_isolated.png';
                            }}
                          />
                        </div>

                        <div className="vivino-card-body">
                          <div>
                            <span className="vivino-winery-name">{pairing.winery}</span>
                            <h3 className="vivino-wine-title">{pairing.wineName}</h3>

                            <div className="vivino-wine-meta">
                              <span className="vivino-type-pill">{pairing.wineType}</span>
                              {pairing.grape && <span className="vivino-grape-pill">{pairing.grape}</span>}
                              {pairing.region && <span className="vivino-region-text">{pairing.region}</span>}
                            </div>

                            <div className="vivino-rating-row">
                              <span className="vivino-stars-gold">{stars}</span>
                              {pairing.rating > 0 && (
                                <span className="vivino-rating-num">★ {pairing.rating}</span>
                              )}
                            </div>

                            {/* Food Pairing Info & Cloudinary Food Image */}
                            {pairing.dishName && (
                              <div className="vivino-card-paired-dish">
                                <div className="vivino-card-paired-dish-header">
                                  <span className="vivino-paired-label">
                                    <i className="fa-solid fa-utensils"></i> Paired Dish
                                  </span>
                                  <span className="vivino-paired-dish-name">{pairing.dishName}</span>
                                </div>
                                {pairing.dishImg && pairing.dishImg !== '/images/dish_isolated.png' && (
                                  <div className="vivino-card-food-image-wrapper">
                                    <img
                                      src={pairing.dishImg}
                                      alt={pairing.dishName}
                                      className="vivino-card-food-image"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            <p className="vivino-pairing-reason">
                              <i className="fa-solid fa-quote-left"></i>
                              {pairing.indianPairings}
                            </p>
                          </div>

                          <div className="vivino-card-footer">
                            <div className="vivino-price-box">
                              {pairing.price > 0 ? (
                                <>
                                  <span className="vivino-price-label">EST. PRICE</span>
                                  <span className="vivino-price-val">₹{pairing.price}</span>
                                </>
                              ) : (
                                <span className="vivino-price-val" style={{ fontSize: '13px', color: '#888' }}>
                                  Price N/A
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn-why-pairing"
                                onClick={() => setPairingExplainWine(pairing)}
                                title="Automated Explanation"
                              >
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                                Why Pairing?
                              </button>
                              <button
                                className="vivino-details-btn"
                                onClick={() => setSelectedPairing(pairing)}
                              >
                                Details
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !apiError && sortedPairings.length === 0 && (
                <div className="ai-empty-state">
                  <div className="ai-empty-icon">🍷</div>
                  <h3 className="ai-empty-title">
                    {selectedDish
                      ? "AI couldn't find an exact match."
                      : "No wines match your selected filters."}
                  </h3>
                  <p className="ai-empty-subtitle">
                    {selectedDish
                      ? "Try changing your budget or wine type filter to see more results."
                      : "Try resetting filters or selecting a different food category."}
                  </p>
                  <button className="ai-empty-action" onClick={resetAllFilters}>
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── INTERACTIVE WINE & CULINARY MATCHER SECTION ── */}
          <div style={{ marginTop: '48px', borderTop: '2px solid rgba(123, 30, 58, 0.1)', paddingTop: '32px' }}>
            <WinePairing />
          </div>

        </main>
      </div>

      {/* VIEW DETAILS Modal */}
      {selectedPairing && (
        <div className="modal-overlay open" onClick={() => setSelectedPairing(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPairing(null)} title="Close Details">
              ✕
            </button>
            <div className="modal-body">
              <div className="modal-images-pane">
                <div className="combined-image-wrapper">
                  <img
                    src={selectedPairing.wineImg || '/images/wine_isolated.png'}
                    alt={selectedPairing.wineName}
                    className="m-wine-image"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/wine_isolated.png'; }}
                  />
                  <img
                    src={selectedPairing.dishImg || '/images/dish_isolated.png'}
                    alt={selectedPairing.dishName}
                    className="m-dish-image"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/dish_isolated.png'; }}
                  />
                </div>
              </div>
              <div className="modal-content-pane">
                <div className="modal-header-info">
                  <h2>{selectedPairing.wineName}</h2>
                  {selectedPairing.dishName && (
                    <h3>Paired with {selectedPairing.dishName}</h3>
                  )}
                  <p className="modal-winery">
                    {selectedPairing.winery}
                    {selectedPairing.region ? ` • ${selectedPairing.region}` : ''}
                    {selectedPairing.flag ? ` ${selectedPairing.flag}` : ''}
                  </p>
                </div>

                <hr className="modal-divider" />

                <div className="modal-details-grid">
                  <div className="detail-item">
                    <span className="label">Pairing Match</span>
                    <span className="value" style={{ color: '#D4AF37', fontWeight: '700' }}>
                      {selectedPairing.pairingScore}% ({selectedPairing.matchRating})
                    </span>
                  </div>
                  {selectedPairing.rating > 0 && (
                    <div className="detail-item">
                      <span className="label">Rating</span>
                      <span className="value">★ {selectedPairing.rating}</span>
                    </div>
                  )}
                  {selectedPairing.price > 0 && (
                    <div className="detail-item">
                      <span className="label">Average Price</span>
                      <span className="value">₹{selectedPairing.price}</span>
                    </div>
                  )}
                  {selectedPairing.grape && (
                    <div className="detail-item">
                      <span className="label">Grape Variety</span>
                      <span className="value">{selectedPairing.grape}</span>
                    </div>
                  )}
                </div>

                <div className="modal-ai-report">
                  <h4><i className="fa-solid fa-utensils"></i> Recommendation Engine Analysis</h4>
                  <p style={{ fontWeight: '600', marginBottom: '8px' }}>{selectedPairing.indianPairings}</p>
                  {selectedPairing.reasons && selectedPairing.reasons.length > 0 && (
                    <ul style={{ paddingLeft: '18px', marginTop: '6px', fontSize: '13px', color: '#555', lineHeight: '1.5' }}>
                      {selectedPairing.reasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {selectedPairing.taste && selectedPairing.taste.length > 0 && (
                  <div className="modal-chips-container">
                    <h4>Flavor &amp; Food Tags</h4>
                    <div className="chips-list">
                      {selectedPairing.taste.map(t => (
                        <span key={t} className="chip">{t}</span>
                      ))}
                      {selectedPairing.foodTags && selectedPairing.foodTags.map(ft => (
                        <span key={ft} className="chip">{ft}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WHY THIS PAIRING Modal */}
      {pairingExplainWine && (
        <WhyThisPairingModal
          wine={pairingExplainWine}
          dishName={selectedDish || pairingExplainWine.dishName}
          onClose={() => setPairingExplainWine(null)}
        />
      )}

    </div>
  );
}

export default App;
