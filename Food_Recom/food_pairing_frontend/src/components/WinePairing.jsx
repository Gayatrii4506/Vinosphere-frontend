import React, { useState, useEffect } from "react";
import { wines } from "../data/wines";
import { foods } from "../data/foods";
import { fetchFoodRecommendations, fetchWineRecommendations } from "../utils/recommendationApi";

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

const WINERY_PREFIXES_REGEX = /^(sula_vineyards_|sula_|grover_zampa_vineyards_|grover_zampa_|grover_|fratelli_wines_|fratelli_|vallonne_vineyards_|vallonne_|vinsura_winery_|vinsura_|charosa_vineyards_|charosa_|york_winery_|york_|krsma_estates_|krsma_|chateau_indage_|four_seasons_vineyards_|four_seasons_|good_earth_winery_|good_earth_|reveilo_wines_|reveilo_|soul_tree_wines_|soul_tree_|seven_peaks_winery_|seven_peaks_|pinnacle_vineyards_|pinnacle_|chandon_india_|domaine_chandon_|chandon_|big_banyan_wines_|big_banyan_|arra_wines_|arra_|renaissance_wines_|renaissance_|nine_hills_|flamingo_wines_|flamingo_)/;

export default function WinePairing() {
  const [mode, setMode] = useState("wineToFood"); // 'wineToFood' | 'foodToWine'
  const [selectedWineId, setSelectedWineId] = useState(wines[0]?.id || "");
  const [selectedFoodId, setSelectedFoodId] = useState(foods[0]?.id || "");

  const [wineRecommendations, setWineRecommendations] = useState([]);
  const [foodRecommendations, setFoodRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wineImageMap, setWineImageMap] = useState({});

  const selectedWine = wines.find(w => w.id === selectedWineId) || wines[0];
  const selectedFood = foods.find(f => f.id === selectedFoodId) || foods[0];

  // Fetch Cloudinary wine image index on mount
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

  const getWineImg = (wine) => {
    if (!wine) return "/images/wine_isolated.png";
    const norm = normalizeWineName(wine.name || "");
    const stripped = norm.replace(WINERY_PREFIXES_REGEX, "");
    const wineryNorm = normalizeWineName(wine.winery || "");
    const prefixed = `${wineryNorm}_${norm}`;
    return (
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
      wineImageMap[`fratelli_${norm}`] ||
      (wine.wineImg && wine.wineImg !== "/images/wine_isolated.png" ? wine.wineImg : "/images/wine_isolated.png")
    );
  };



  // Food -> Wine recommendation effect (calls POST /recommend)
  useEffect(() => {
    if (mode !== "foodToWine" || !selectedFood) return;

    let cancelled = false;

    async function getWineRecs() {
      setLoading(true);
      try {
        const recs = await fetchFoodRecommendations(selectedFood.name);
        if (!cancelled) {
          setWineRecommendations(recs);
        }
      } catch (err) {
        console.error("Failed to fetch wine recommendations:", err);
        if (!cancelled) {
          setWineRecommendations([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    getWineRecs();

    return () => {
      cancelled = true;
    };
  }, [mode, selectedFoodId, selectedFood]);

  // Wine -> Food recommendation effect (calls POST /recommend-food)
  useEffect(() => {
    if (mode !== "wineToFood" || !selectedWine) return;

    let cancelled = false;

    async function getFoodRecs() {
      setLoading(true);
      try {
        const recs = await fetchWineRecommendations(selectedWine.name);
        if (!cancelled) {
          setFoodRecommendations(recs);
        }
      } catch (err) {
        console.error("Failed to fetch food recommendations:", err);
        if (!cancelled) {
          setFoodRecommendations([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    getFoodRecs();

    return () => {
      cancelled = true;
    };
  }, [mode, selectedWineId, selectedWine]);

  return (
    <div className="recommendation-engine-section">
      <div className="engine-header">
        <div className="engine-badge">
          <i className="fa-solid fa-wand-magic-sparkles"></i> Recommendation Engine
        </div>
        <h2 className="engine-title">Interactive Wine & Culinary Matcher</h2>
        <p className="engine-subtitle">
          Select a wine or dish below to calculate pairing compatibility scores based on body, fat, acidity, tannins & spice levels.
        </p>

        {/* Mode Switcher */}
        <div className="engine-mode-tabs">
          <button 
            className={`mode-tab ${mode === "wineToFood" ? "active" : ""}`}
            onClick={() => setMode("wineToFood")}
          >
            <i className="fa-solid fa-wine-glass"></i> Find Dishes for Wine
          </button>
          <button 
            className={`mode-tab ${mode === "foodToWine" ? "active" : ""}`}
            onClick={() => setMode("foodToWine")}
          >
            <i className="fa-solid fa-utensils"></i> Find Wines for Dish
          </button>
        </div>
      </div>

      <div className="engine-grid">
        {/* Input Column */}
        <div className="engine-selector-card">
          {mode === "wineToFood" ? (
            <>
              <label className="selector-label">
                <i className="fa-solid fa-wine-bottle"></i> Select Wine:
              </label>
              <select
                className="engine-select"
                value={selectedWineId}
                onChange={(e) => setSelectedWineId(e.target.value)}
              >
                {wines.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.flag} {w.name} ({w.winery} · {w.type})
                  </option>
                ))}
              </select>

              {selectedWine && (
                <div className="selected-entity-details">
                  <div className="entity-header">
                    <img
                      src={getWineImg(selectedWine)}
                      alt={selectedWine.name}
                      className="entity-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/wine_isolated.png';
                      }}
                    />
                    <div>
                      <h4 className="entity-name">{selectedWine.name}</h4>
                      <span className="entity-sub">{selectedWine.winery} · {selectedWine.region}</span>
                    </div>
                  </div>

                  
                  <div className="profile-spec-grid">
                    <div className="spec-pill"><span>Body:</span> <strong>{selectedWine.body}</strong></div>
                    <div className="spec-pill"><span>Acidity:</span> <strong>{selectedWine.acidity}</strong></div>
                    <div className="spec-pill"><span>Tannin:</span> <strong>{selectedWine.tannin}</strong></div>
                    <div className="spec-pill"><span>Sweetness:</span> <strong>{selectedWine.sweetness}</strong></div>
                  </div>

                  <div className="notes-list">
                    {selectedWine.flavorNotes?.map(note => (
                      <span key={note} className="note-badge">#{note}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <label className="selector-label">
                <i className="fa-solid fa-plate-wheat"></i> Select Dish:
              </label>
              <select
                className="engine-select"
                value={selectedFoodId}
                onChange={(e) => setSelectedFoodId(e.target.value)}
              >
                {foods.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.cuisine})
                  </option>
                ))}
              </select>

              {selectedFood && (
                <div className="selected-entity-details">
                  <div className="entity-header">
                    <img src={selectedFood.dishImg} alt={selectedFood.name} className="entity-thumb" />
                    <div>
                      <h4 className="entity-name">{selectedFood.name}</h4>
                      <span className="entity-sub">{selectedFood.cuisine} Cuisine</span>
                    </div>
                  </div>
                  
                  <div className="profile-spec-grid">
                    <div className="spec-pill"><span>Richness:</span> <strong>{selectedFood.richness}</strong></div>
                    <div className="spec-pill"><span>Fat:</span> <strong>{selectedFood.fat}</strong></div>
                    <div className="spec-pill"><span>Spice Level:</span> <strong>{selectedFood.spiceLevel}/3</strong></div>
                  </div>

                  <div className="notes-list">
                    {selectedFood.flavorProfile?.map(prof => (
                      <span key={prof} className="note-badge">#{prof}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Output Recommendations Column */}
        <div className="engine-results-card">
          <h3 className="results-heading">
            {mode === "wineToFood" ? (
              <>Top Dish Recommendations for <span className="highlight-text">{selectedWine.name}</span></>
            ) : (
              <>Top Wine Recommendations for <span className="highlight-text">{selectedFood.name}</span></>
            )}
          </h3>

          <div className="pairings-list">
            {loading ? (
              <div className="pairing-row-item flex-column-layout">
                <div className="pairing-row-main">
                  <div className="item-info">
                    <div className="item-name">Loading recommendations…</div>
                  </div>
                </div>
              </div>
            ) : mode === "wineToFood" ? (
              foodRecommendations.length === 0 ? (
                <div className="pairing-row-item flex-column-layout">
                  <div className="pairing-row-main">
                    <div className="item-info">
                      <div className="item-name">No food recommendations found.</div>
                    </div>
                  </div>
                </div>
              ) : (
                foodRecommendations.map((rec, index) => (
                  <div key={`${rec.food_name}-${index}`} className="pairing-row-item flex-column-layout">
                    <div className="pairing-row-main">
                      <div className="rank-badge">#{index + 1}</div>
                      {/* Dish image thumbnail */}
                      {rec.image_url ? (
                        <img
                          src={rec.image_url}
                          alt={rec.food_name}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span style={{ fontSize: '28px', flexShrink: 0 }}>🍽️</span>
                      )}
                      <div className="item-info">
                        <div className="item-name">{rec.food_name}</div>
                        <div className="item-tags">{rec.cuisine} Cuisine · Category: {rec.category}</div>
                        <div className="item-tags">Protein: {rec.protein}</div>
                      </div>
                      <div className="score-box">
                        <span className="score-val">{(rec.score * 100).toFixed(1)}%</span>
                        <span className="score-lbl">Sommelier Score</span>
                      </div>
                    </div>
                    <ul className="reasons-bullet-list">
                      <li className="good-reason">
                        <i className="fa-solid fa-check"></i> Spice Level: {rec.spice_level} · Richness: {rec.richness}
                      </li>
                      <li className="good-reason">
                        <i className="fa-solid fa-check"></i> Recommended Wine Type: {rec.recommended_wine_type}
                      </li>
                    </ul>
                  </div>
                ))
              )
            ) : (
              wineRecommendations.length === 0 ? (
                <div className="pairing-row-item flex-column-layout">
                  <div className="pairing-row-main">
                    <div className="item-info">
                      <div className="item-name">No wine recommendations found.</div>
                    </div>
                  </div>
                </div>
              ) : (
                wineRecommendations.map((rec, index) => (
                  <div key={`${rec.wine_name}-${index}`} className="pairing-row-item flex-column-layout">
                    <div className="pairing-row-main">
                      <div className="rank-badge">#{index + 1}</div>
                      {/* Wine/winery image thumbnail */}
                      {rec.image_url ? (
                        <img
                          src={rec.image_url}
                          alt={rec.wine_name}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span style={{ fontSize: '28px', flexShrink: 0 }}>🍷</span>
                      )}
                      <div className="item-info">
                        <div className="item-name">{rec.wine_name}</div>
                        <div className="item-tags">{rec.winery} · {rec.wine_type} ({rec.variety})</div>
                        <div className="item-tags">{rec.region}</div>
                      </div>
                      <div className="score-box">
                        <span className="score-val">{(rec.score * 100).toFixed(1)}%</span>
                        <span className="score-lbl">Sommelier Score</span>
                      </div>
                    </div>
                    <ul className="reasons-bullet-list">
                      <li className="good-reason">
                        <i className="fa-solid fa-check"></i> Body: {rec.body} · Sweetness: {rec.sweetness}
                      </li>
                      <li className="good-reason">
                        <i className="fa-solid fa-check"></i> Acidity: {rec.acidity} · Tannin: {rec.tannin}
                      </li>
                    </ul>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}