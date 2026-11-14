// src/utils/pairingEngine.js
// Rule-based scoring engine — no ML, no training required.
// Rules encode standard sommelier principles (Wine Folly / WSET style):
//   - Tannin binds with fat/protein
//   - Acidity cuts richness / fat, and matches acidic foods
//   - Body should match the weight/richness of the dish
//   - Sweetness balances spice and matches dessert sweetness
//   - Overlapping flavor notes create "congruent" pairings

export function scorePairing(wine, food) {
  let score = 0;
  const reasons = [];

  // 1. Tannin + Fat/Protein (tannin binds fat, softening astringency)
  if (wine.tannin === "high" && food.fat === "high") {
    score += 3;
    reasons.push("High tannin cuts through the dish's fat");
  } else if (wine.tannin === "medium" && (food.fat === "high" || food.fat === "medium")) {
    score += 1.5;
    reasons.push("Moderate tannin complements the protein");
  }

  // 2. Acidity + Richness/Fat (acid cleanses the palate)
  if (wine.acidity === "high" && (food.richness === "high" || food.fat === "high")) {
    score += 2.5;
    reasons.push("Bright acidity cuts through richness");
  }

  // 3. Acidity should roughly match saltiness (salt + acid = classic pairing)
  if (wine.acidity === "high" && food.saltLevel === "high") {
    score += 1.5;
    reasons.push("Acidity balances saltiness");
  }

  // 4. Body should match richness/weight of dish
  const bodyRank = { light: 1, medium: 2, full: 3 };
  const richnessRank = { low: 1, medium: 2, high: 3 };
  const bodyDiff = Math.abs(bodyRank[wine.body] - richnessRank[food.richness]);
  if (bodyDiff === 0) {
    score += 2;
    reasons.push("Wine body matches the dish's weight");
  } else if (bodyDiff === 1) {
    score += 0.5;
  }

  // 5. Sweetness balances spice (off-dry/sweet wines tame heat)
  if (food.spiceLevel === "high") {
    if (wine.sweetness === "sweet") {
      score += 2.5;
      reasons.push("Sweetness tames the dish's heat");
    } else if (wine.sweetness === "off-dry") {
      score += 1.5;
      reasons.push("Slight sweetness softens the spice");
    } else if (wine.tannin === "high") {
      score -= 1.5; // high tannin + high spice clashes (amplifies heat/bitterness)
      reasons.push("Caution: high tannin can amplify spice");
    }
  }

  // 6. Sweetness should match or exceed dessert sweetness (wine should never taste
  //    drier than the dish, or the wine will taste sour/flat)
  if (food.sweetness === "high") {
    if (wine.sweetness === "sweet") {
      score += 3;
      reasons.push("Dessert wine sweetness matches the dish");
    } else if (wine.sweetness === "dry") {
      score -= 2;
      reasons.push("Caution: dry wine may taste flat next to a sweet dish");
    }
  }

  // 7. Delicate foods need delicate (light-bodied, low-tannin) wines
  if (food.richness === "low" && food.fat === "low") {
    if (wine.body === "light" && wine.tannin === "low") {
      score += 1.5;
      reasons.push("Delicate wine won't overpower a light dish");
    }
    if (wine.tannin === "high") {
      score -= 2;
      reasons.push("Caution: high tannin can overwhelm a delicate dish");
    }
  }

  // 8. Flavor note overlap = congruent pairing (shared flavor compounds)
  const overlap = wine.flavorNotes.filter(f => food.flavorProfile.includes(f));
  if (overlap.length > 0) {
    score += overlap.length * 1.5;
    reasons.push(`Shared flavor notes: ${overlap.join(", ")}`);
  }

  return { score: Math.round(score * 10) / 10, reasons };
}

export function getTopPairings(wine, foods, topN = 5) {
  return foods
    .map(food => {
      const { score, reasons } = scorePairing(wine, food);
      return { food, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

// Reverse lookup: given a food, find the best wines
export function getTopWinesForFood(food, wines, topN = 5) {
  return wines
    .map(wine => {
      const { score, reasons } = scorePairing(wine, food);
      return { wine, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
