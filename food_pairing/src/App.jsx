import React, { useState } from 'react';
import HeroLanding from './components/HeroLanding';
import { wines } from './data/wines';
import { foods } from './data/foods';
import { scorePairing, getTopPairings } from './utils/pairingEngine';

// Build pairings dynamically from wines and foods dataset using rule-based recommendation engine
const initialPairings = wines.map((wine, index) => {
  const topMatch = getTopPairings(wine, foods, 1)[0];
  const food = topMatch ? topMatch.food : foods[index % foods.length];
  const engineResult = topMatch ? { score: topMatch.score, reasons: topMatch.reasons } : scorePairing(wine, food);
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
    taste: wine.flavorNotes || [],
    sweetness: wine.sweetness === 'sweet' ? 3 : wine.sweetness === 'off-dry' ? 2 : 0,
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
    foodObj: food
  };
});

const foodOptions = [
  "Chicken", "Lamb & Mutton", "Seafood", "Spicy Curries", 
  "Biryani", "Tandoori", "Salads", "Cheese", 
  "Desserts", "Pasta", "BBQ", "Vegetarian"
];

const grapeOptions = [
  "Cabernet Sauvignon", "Shiraz", "Sauvignon Blanc", "Chenin Blanc",
  "Sangiovese", "Chardonnay", "Tempranillo", "Pinot Noir",
  "Syrah", "Malbec", "Riesling", "Merlot"
];

const wineTypeOptions = [
  "Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified"
];

const flavourProfiles = [
  "Fruity", "Spicy", "Earthy", "Citrus", "Floral", "Bold", "Smooth", "Dry", "Sweet"
];

function App() {
  const [showCatalog, setShowCatalog] = useState(false);
  
  // Hover & Pin states for top header tabs dropdown
  const [hoveredTab, setHoveredTab] = useState(null);
  const [pinnedTab, setPinnedTab] = useState(null);
  
  const activeDropdown = hoveredTab || pinnedTab;

  // Top Pills Filter state
  const [selectedFood, setSelectedFood] = useState([]);
  const [selectedGrapes, setSelectedGrapes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  // Sidebar Filter state
  const [collapsedSections, setCollapsedSections] = useState({
    wineType: false,
    priceRange: false,
    flavour: false,
    foodPref: false,
    cuisine: false,
    sensory: false
  });

  const [sidebarWineTypes, setSidebarWineTypes] = useState([]);
  const [selectedFlavours, setSelectedFlavours] = useState([]);
  const [selectedFoodPrefs, setSelectedFoodPrefs] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [pricePreset, setPricePreset] = useState("all"); // 'under800', '800-1500', '1500plus', 'all'
  const [budget, setBudget] = useState(3500);
  const [spiceLevel, setSpiceLevel] = useState(0); 
  const [sweetnessLevel, setSweetnessLevel] = useState(0); 

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  
  // Favorites toggle
  const [favorites, setFavorites] = useState([]);
  
  // Modal selection state
  const [selectedPairing, setSelectedPairing] = useState(null);

  // Toggle sidebar section collapse
  const toggleSection = (section) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Toggle top pills and automatically close dropdown on selection
  const toggleFood = (food) => {
    setSelectedFood(prev => (
      prev.includes(food) ? prev.filter(f => f !== food) : [...prev, food]
    ));
    setPinnedTab(null);
    setHoveredTab(null);
  };

  const toggleGrape = (grape) => {
    setSelectedGrapes(prev => (
      prev.includes(grape) ? prev.filter(g => g !== grape) : [...prev, grape]
    ));
    setPinnedTab(null);
    setHoveredTab(null);
  };

  const toggleType = (type) => {
    setSelectedTypes(prev => (
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    ));
    setPinnedTab(null);
    setHoveredTab(null);
  };

  // Toggle sidebar checkboxes
  const handleCheckboxChange = (value, list, setList) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  // Toggle flavor profile pill
  const toggleFlavour = (flavour) => {
    setSelectedFlavours(prev => prev.includes(flavour) ? prev.filter(f => f !== flavour) : [...prev, flavour]);
  };

  // Toggle favorite wine
  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]);
  };

  // Compute dynamic counts for grape varieties & wine types
  const getGrapeCount = (grapeName) => {
    return initialPairings.filter(w => w.grape.toLowerCase().includes(grapeName.toLowerCase())).length;
  };
  const getTypeCount = (typeName) => {
    return initialPairings.filter(w => w.wineType.toLowerCase() === typeName.toLowerCase()).length;
  };

  // Reset all filters & reset hover/pin states
  const resetAllFilters = () => {
    setSelectedFood([]);
    setSelectedGrapes([]);
    setSelectedTypes([]);
    setSidebarWineTypes([]);
    setSelectedFlavours([]);
    setSelectedFoodPrefs([]);
    setSelectedCuisines([]);
    setPricePreset("all");
    setBudget(3500);
    setSpiceLevel(0);
    setSweetnessLevel(0);
    setSearchQuery("");
    setHoveredTab(null);
    setPinnedTab(null);
  };

  // Home click handler resets all and returns home
  const handleHomeClick = () => {
    resetAllFilters();
    setShowCatalog(false);
  };

  // Filter wine list based on active top pills & sidebar options
  const filteredPairings = initialPairings.filter(wine => {
    // Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        wine.wineName.toLowerCase().includes(q) ||
        wine.winery.toLowerCase().includes(q) ||
        wine.grape.toLowerCase().includes(q) ||
        wine.dishName.toLowerCase().includes(q) ||
        wine.region.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Top Food pairings filter
    if (selectedFood.length > 0) {
      const matchesFood = wine.foodTags.some(tag => selectedFood.includes(tag));
      if (!matchesFood) return false;
    }

    // Top Grapes filter
    if (selectedGrapes.length > 0) {
      const matchesGrape = selectedGrapes.some(g => wine.grape.toLowerCase().includes(g.toLowerCase()));
      if (!matchesGrape) return false;
    }

    // Top Wine Type filter
    if (selectedTypes.length > 0) {
      if (!selectedTypes.includes(wine.wineType)) return false;
    }

    // Sidebar Wine Types filter
    if (sidebarWineTypes.length > 0) {
      if (!sidebarWineTypes.includes(wine.wineType)) return false;
    }

    // Sidebar Flavour Profile filter
    if (selectedFlavours.length > 0) {
      const matchesTaste = wine.taste.some(t => selectedFlavours.includes(t));
      if (!matchesTaste) return false;
    }

    // Sidebar Food Preference filter
    if (selectedFoodPrefs.length > 0) {
      const matchesPref = wine.foodPref.some(p => selectedFoodPrefs.includes(p));
      if (!matchesPref) return false;
    }

    // Sidebar Cuisine filter
    if (selectedCuisines.length > 0) {
      if (!selectedCuisines.includes(wine.cuisine)) return false;
    }

    // Price Range filter & Budget slider
    if (wine.price > budget) return false;
    if (pricePreset === "under800" && wine.price >= 800) return false;
    if (pricePreset === "800-1500" && (wine.price < 800 || wine.price > 1500)) return false;
    if (pricePreset === "1500plus" && wine.price < 1500) return false;

    // Sensory Filters
    if (spiceLevel > 0 && wine.spiceLevel !== (spiceLevel - 1)) return false;
    if (sweetnessLevel > 0 && wine.sweetness !== (sweetnessLevel - 1)) return false;

    return true;
  });

  // Sort wine list
  const sortedPairings = [...filteredPairings].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name") return a.wineName.localeCompare(b.wineName);
    return 0; // Default
  });

  if (!showCatalog) {
    return <HeroLanding setShowCatalog={setShowCatalog} />;
  }

  return (
    <div className="vivino-app animate-fade-in">
      
      {/* Vivino Dark Burgundy Top Navigation Header & Floating Overlay Wrapper */}
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
                className={`vivino-tab ${activeDropdown === 'food' ? 'active' : ''}`}
                onMouseEnter={() => setHoveredTab('food')}
                onClick={() => setPinnedTab(pinnedTab === 'food' ? null : 'food')}
              >
                Food Pairings
                {selectedFood.length > 0 && <span className="vivino-badge">{selectedFood.length}</span>}
              </button>

              <button 
                className={`vivino-tab ${activeDropdown === 'grapes' ? 'active' : ''}`}
                onMouseEnter={() => setHoveredTab('grapes')}
                onClick={() => setPinnedTab(pinnedTab === 'grapes' ? null : 'grapes')}
              >
                Grapes
                {selectedGrapes.length > 0 && <span className="vivino-badge">{selectedGrapes.length}</span>}
              </button>

              <button 
                className={`vivino-tab ${activeDropdown === 'types' ? 'active' : ''}`}
                onMouseEnter={() => setHoveredTab('types')}
                onClick={() => setPinnedTab(pinnedTab === 'types' ? null : 'types')}
              >
                Wine Types
                {selectedTypes.length > 0 && <span className="vivino-badge">{selectedTypes.length}</span>}
              </button>
            </div>

          {/* Clean Right Search Input */}
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

        {/* Floating Dropdown Filter Control Drawer Panel */}
        <div className="vivino-filter-panel-container">
          {activeDropdown === 'food' && (
            <section className="vivino-filter-panel">
              <div className="vivino-panel-subtitle">WHAT ARE YOU EATING? — WINES UPDATE INSTANTLY</div>
              <div className="vivino-pills-grid">
                {foodOptions.map(food => {
                  const isSelected = selectedFood.includes(food);
                  return (
                    <div 
                      key={food} 
                      className={`vivino-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => toggleFood(food)}
                    >
                      <span>{food}</span>
                    </div>
                  );
                })}
              </div>
              {selectedFood.length > 0 && (
                <span className="vivino-clear-link" onClick={() => setSelectedFood([])}>
                  Clear food selection ({selectedFood.length})
                </span>
              )}
            </section>
          )}

          {activeDropdown === 'grapes' && (
            <section className="vivino-filter-panel">
              <div className="vivino-panel-subtitle">BROWSE BY GRAPE VARIETY</div>
              <div className="vivino-pills-grid">
                {grapeOptions.map(grape => {
                  const isSelected = selectedGrapes.includes(grape);
                  const count = getGrapeCount(grape);
                  return (
                    <div 
                      key={grape} 
                      className={`vivino-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => toggleGrape(grape)}
                    >
                      <span>{grape}</span>
                      <span className="vivino-pill-count">{count}</span>
                    </div>
                  );
                })}
              </div>
              {selectedGrapes.length > 0 && (
                <span className="vivino-clear-link" onClick={() => setSelectedGrapes([])}>
                  Clear grape selection ({selectedGrapes.length})
                </span>
              )}
            </section>
          )}

          {activeDropdown === 'types' && (
            <section className="vivino-filter-panel">
              <div className="vivino-panel-subtitle">BROWSE BY WINE TYPE</div>
              <div className="vivino-pills-grid">
                {wineTypeOptions.map(type => {
                  const isSelected = selectedTypes.includes(type);
                  const count = getTypeCount(type);
                  return (
                    <div 
                      key={type} 
                      className={`vivino-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => toggleType(type)}
                    >
                      <span>{type}</span>
                      <span className="vivino-pill-count">{count}</span>
                    </div>
                  );
                })}
              </div>
              {selectedTypes.length > 0 && (
                <span className="vivino-clear-link" onClick={() => setSelectedTypes([])}>
                  Clear wine type selection ({selectedTypes.length})
                </span>
              )}
            </section>
          )}
        </div>
      </header>

      {/* Dual Layout Container: Left Sidebar + Right Main Content */}
      <div className="vivino-catalog-layout">
        
        {/* Left Sticky Filter Sidebar */}
        <aside className="vivino-sidebar">
          <div className="vivino-sidebar-header">
            <h3><i className="fa-solid fa-sliders"></i> Filter Cellar</h3>
            <button className="vivino-sidebar-reset" onClick={resetAllFilters}>Reset All</button>
          </div>

          {/* Sidebar Section: Wine Type */}
          <div className={`sidebar-section ${collapsedSections.wineType ? 'collapsed' : ''}`}>
            <div className="sidebar-title" onClick={() => toggleSection('wineType')}>
              <span>Wine Type</span>
              <i className="fa-solid fa-chevron-up"></i>
            </div>
            <div className="sidebar-content">
              {wineTypeOptions.map(type => {
                const count = getTypeCount(type);
                const isChecked = sidebarWineTypes.includes(type);
                return (
                  <label key={type} className="sidebar-checkbox-row">
                    <span className="sidebar-checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(type, sidebarWineTypes, setSidebarWineTypes)}
                        style={{ accentColor: '#6B1D2F', cursor: 'pointer' }}
                      />
                      {type}
                    </span>
                    <span className="sidebar-count-badge">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Sidebar Section: Price Range - INR */}
          <div className={`sidebar-section ${collapsedSections.priceRange ? 'collapsed' : ''}`}>
            <div className="sidebar-title" onClick={() => toggleSection('priceRange')}>
              <span>Price Range — INR</span>
              <i className="fa-solid fa-chevron-up"></i>
            </div>
            <div className="sidebar-content">
              <div className="slider-wrapper">
                <div className="slider-labels" style={{ fontSize: '13px', fontWeight: '700' }}>
                  <span>₹500 <small style={{ color: '#888', fontWeight: 'normal' }}>MIN</small></span>
                  <span>₹{budget.toLocaleString()} <small style={{ color: '#888', fontWeight: 'normal' }}>MAX</small></span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="3500" 
                  step="50"
                  value={budget} 
                  onChange={e => { setBudget(parseInt(e.target.value)); setPricePreset("all"); }}
                  className="premium-slider"
                  style={{ width: '100%', accentColor: '#6B1D2F' }}
                />
              </div>

              {/* Price Preset Quick Buttons */}
              <div className="preset-pills-row">
                <button 
                  className={`preset-pill ${pricePreset === 'under800' ? 'active' : ''}`}
                  onClick={() => setPricePreset(pricePreset === 'under800' ? 'all' : 'under800')}
                >
                  Under ₹800
                </button>
                <button 
                  className={`preset-pill ${pricePreset === '800-1500' ? 'active' : ''}`}
                  onClick={() => setPricePreset(pricePreset === '800-1500' ? 'all' : '800-1500')}
                >
                  ₹800–1,500
                </button>
                <button 
                  className={`preset-pill ${pricePreset === '1500plus' ? 'active' : ''}`}
                  onClick={() => setPricePreset(pricePreset === '1500plus' ? 'all' : '1500plus')}
                >
                  ₹1,500+
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Section: Flavour Profile */}
          <div className={`sidebar-section ${collapsedSections.flavour ? 'collapsed' : ''}`}>
            <div className="sidebar-title" onClick={() => toggleSection('flavour')}>
              <span>Flavour Profile</span>
              <i className="fa-solid fa-chevron-up"></i>
            </div>
            <div className="sidebar-content">
              <div className="preset-pills-row">
                {flavourProfiles.map(flavour => {
                  const isSelected = selectedFlavours.includes(flavour);
                  return (
                    <button 
                      key={flavour} 
                      className={`preset-pill ${isSelected ? 'active' : ''}`}
                      onClick={() => toggleFlavour(flavour)}
                    >
                      {flavour}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Section: Food Preference */}
          <div className={`sidebar-section ${collapsedSections.foodPref ? 'collapsed' : ''}`}>
            <div className="sidebar-title" onClick={() => toggleSection('foodPref')}>
              <span>Food Preference</span>
              <i className="fa-solid fa-chevron-up"></i>
            </div>
            <div className="sidebar-content">
              {["Vegetarian", "Vegan", "Non-Vegetarian", "Eggitarian"].map(pref => (
                <label key={pref} className="sidebar-checkbox-row">
                  <span className="sidebar-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedFoodPrefs.includes(pref)}
                      onChange={() => handleCheckboxChange(pref, selectedFoodPrefs, setSelectedFoodPrefs)}
                      style={{ accentColor: '#6B1D2F', cursor: 'pointer' }}
                    />
                    {pref}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sidebar Section: Cuisine */}
          <div className={`sidebar-section ${collapsedSections.cuisine ? 'collapsed' : ''}`}>
            <div className="sidebar-title" onClick={() => toggleSection('cuisine')}>
              <span>Cuisine</span>
              <i className="fa-solid fa-chevron-up"></i>
            </div>
            <div className="sidebar-content">
              {["Indian", "Italian", "Continental", "Asian", "French", "Mexican"].map(c => (
                <label key={c} className="sidebar-checkbox-row">
                  <span className="sidebar-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedCuisines.includes(c)}
                      onChange={() => handleCheckboxChange(c, selectedCuisines, setSelectedCuisines)}
                      style={{ accentColor: '#6B1D2F', cursor: 'pointer' }}
                    />
                    {c}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sidebar Section: Sensory Levels */}
          <div className={`sidebar-section ${collapsedSections.sensory ? 'collapsed' : ''}`}>
            <div className="sidebar-title" onClick={() => toggleSection('sensory')}>
              <span>Sensory Levels</span>
              <i className="fa-solid fa-chevron-up"></i>
            </div>
            <div className="sidebar-content">
              <div className="slider-wrapper">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span>Spice Level</span>
                  <span style={{ fontWeight: '700', color: '#6B1D2F' }}>
                    {spiceLevel === 0 ? "All" : ["Mild", "Med", "Hot", "Fiery"][spiceLevel - 1]}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="4" 
                  value={spiceLevel} 
                  onChange={e => setSpiceLevel(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#6B1D2F' }}
                />
              </div>

              <div className="slider-wrapper" style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span>Sweetness</span>
                  <span style={{ fontWeight: '700', color: '#6B1D2F' }}>
                    {sweetnessLevel === 0 ? "All" : ["Dry", "Off-Dry", "Medium", "Sweet"][sweetnessLevel - 1]}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="4" 
                  value={sweetnessLevel} 
                  onChange={e => setSweetnessLevel(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#6B1D2F' }}
                />
              </div>
            </div>
          </div>

        </aside>

        {/* Right Main Catalog View Container */}
        <main className="vivino-main-content">
          
          {/* Count and Sort Header */}
          <div className="vivino-list-header">
            <span className="vivino-count-text">
              Showing <strong>{sortedPairings.length}</strong> of {initialPairings.length} wines
            </span>

            <div className="vivino-sort-wrapper">
              <span>Sort</span>
              <select 
                className="vivino-sort-select"
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="rating">Rating: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Horizontal Card Wine List */}
          <div className="vivino-wine-list">
            {sortedPairings.map(wine => {
              const isFav = favorites.includes(wine.id);
              return (
                <div 
                  key={wine.id} 
                  className="vivino-card"
                  onClick={() => setSelectedPairing(wine)}
                >
                  <div className="vivino-card-img">
                    <img 
                      src={wine.wineImg || '/images/wine_isolated.png'} 
                      alt={wine.wineName} 
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/wine_isolated.png'; }}
                    />
                  </div>

                  <div className="vivino-card-info">
                    <span className="vivino-wine-badge">{wine.wineType}</span>
                    <h3 className="vivino-wine-title">{wine.wineName}</h3>
                    <div className="vivino-winery-name">{wine.winery}</div>
                    <div className="vivino-wine-sub">{wine.region} · {wine.grape}</div>
                    <p className="vivino-wine-desc">{wine.description}</p>
                  </div>

                  <div className="vivino-card-actions">
                    <button 
                      className={`vivino-fav-btn ${isFav ? 'active' : ''}`}
                      onClick={(e) => toggleFavorite(e, wine.id)}
                      title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <i className={isFav ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                    </button>

                    <div className="vivino-price-box">
                      <span className="vivino-price-val">₹{wine.price}</span>
                      <span className="vivino-price-lbl">avg. price</span>
                    </div>

                    <button className="vivino-view-btn">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}

            {sortedPairings.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
                <i className="fa-solid fa-wine-glass-empty" style={{ fontSize: '42px', color: '#D4AF37', marginBottom: '16px', display: 'block' }}></i>
                <h3 style={{ color: '#2C2523', fontFamily: 'Times New Roman, serif' }}>No Indian wines match your selected cellar filters.</h3>
                <p style={{ marginTop: '8px', fontSize: '14px' }}>Try resetting sidebar options or top selection pills.</p>
                <button 
                  onClick={resetAllFilters}
                  style={{ 
                    marginTop: '16px', 
                    padding: '10px 20px', 
                    background: '#6B1D2F', 
                    color: '#FFF', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Detailed Sommelier Modal Popup */}
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
                  <h3>Paired with {selectedPairing.dishName}</h3>
                  <p className="modal-winery">{selectedPairing.winery} • {selectedPairing.region} {selectedPairing.flag}</p>
                </div>
                
                <hr className="modal-divider" />
                
                <div className="modal-details-grid">
                  <div className="detail-item">
                    <span className="label">Pairing Match</span>
                    <span className="value" style={{ color: '#D4AF37', fontWeight: '700' }}>{selectedPairing.pairingScore}% ({selectedPairing.matchRating})</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Rating</span>
                    <span className="value">★ {selectedPairing.rating}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Average Price</span>
                    <span className="value">₹{selectedPairing.price}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Grape Variety</span>
                    <span className="value">{selectedPairing.grape}</span>
                  </div>
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

                <div className="modal-chips-container">
                  <h4>Flavor & Food Tags</h4>
                  <div className="chips-list">
                    {selectedPairing.taste.map(t => (
                      <span key={t} className="chip">{t}</span>
                    ))}
                    {selectedPairing.foodTags.map(ft => (
                      <span key={ft} className="chip">{ft}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
