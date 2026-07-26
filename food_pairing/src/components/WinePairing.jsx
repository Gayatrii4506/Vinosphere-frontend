import React, { useState } from "react";
import { wines } from "../data/wines";
import { foods } from "../data/foods";
import { getTopPairings, getTopWinesForFood } from "../utils/pairingEngine";

export default function WinePairing() {
  const [mode, setMode] = useState("wineToFood"); // 'wineToFood' | 'foodToWine'
  const [selectedWineId, setSelectedWineId] = useState(wines[0]?.id || "");
  const [selectedFoodId, setSelectedFoodId] = useState(foods[0]?.id || "");

  const selectedWine = wines.find(w => w.id === selectedWineId) || wines[0];
  const selectedFood = foods.find(f => f.id === selectedFoodId) || foods[0];

  const foodPairings = getTopPairings(selectedWine, foods, 5);
  const winePairings = getTopWinesForFood(selectedFood, wines, 5);

  return (
    <div className="recommendation-engine-section">
      <div className="engine-header">
        <div className="engine-badge">
          <i className="fa-solid fa-wand-magic-sparkles"></i> AI Rule-Based Engine
        </div>
        <h2 className="engine-title">Interactive Wine & Culinary Matcher</h2>
        <p className="engine-subtitle">
          Select a wine or dish below to compute real-time pairing compatibility scores based on body, fat, acidity, tannins & spice levels.
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
                    <img src={selectedWine.wineImg} alt={selectedWine.name} className="entity-thumb" />
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
              <>Recommended Pairings for <span className="highlight-text">{selectedWine.name}</span></>
            ) : (
              <>Top Wine Recommendations for <span className="highlight-text">{selectedFood.name}</span></>
            )}
          </h3>

          <div className="pairings-list">
            {mode === "wineToFood" ? (
              foodPairings.map(({ food, score, reasons }, index) => (
                <div key={food.id} className="pairing-row-item flex-column-layout">
                  <div className="pairing-row-main">
                    <div className="rank-badge">#{index + 1}</div>
                    <img src={food.dishImg} alt={food.name} className="item-img" />
                    <div className="item-info">
                      <div className="item-name">{food.name}</div>
                      <div className="item-tags">{food.cuisine} · {food.foodTags?.join(", ")}</div>
                    </div>
                    <div className="score-box">
                      <span className="score-val">+{score} pts</span>
                      <span className="score-lbl">Sommelier Score</span>
                    </div>
                  </div>
                  {reasons && reasons.length > 0 && (
                    <ul className="reasons-bullet-list">
                      {reasons.map((r, i) => (
                        <li key={i} className={r.startsWith("Caution:") ? "caution-reason" : "good-reason"}>
                          <i className={r.startsWith("Caution:") ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-check"}></i> {r}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              winePairings.map(({ wine, score, reasons }, index) => (
                <div key={wine.id} className="pairing-row-item flex-column-layout">
                  <div className="pairing-row-main">
                    <div className="rank-badge">#{index + 1}</div>
                    <img src={wine.wineImg} alt={wine.name} className="item-img" />
                    <div className="item-info">
                      <div className="item-name">{wine.flag} {wine.name}</div>
                      <div className="item-tags">{wine.winery} · {wine.type} ({wine.grape})</div>
                    </div>
                    <div className="score-box">
                      <span className="score-val">+{score} pts</span>
                      <span className="score-lbl">Sommelier Score</span>
                    </div>
                  </div>
                  {reasons && reasons.length > 0 && (
                    <ul className="reasons-bullet-list">
                      {reasons.map((r, i) => (
                        <li key={i} className={r.startsWith("Caution:") ? "caution-reason" : "good-reason"}>
                          <i className={r.startsWith("Caution:") ? "fa-solid fa-triangle-exclamation" : "fa-solid fa-check"}></i> {r}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
