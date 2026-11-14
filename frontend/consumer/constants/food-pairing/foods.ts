// src/data/foods.js
// Attributes: richness, fat, spiceLevel, saltLevel, sweetness, cookingMethod, flavorProfile
// Scales: "low" | "medium" | "high"

export const foods = [
  // --- Red meats ---
  { id: "ribeye", name: "Grilled Ribeye Steak", richness: "high", fat: "high", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "grilled", flavorProfile: ["charred", "savory", "beefy"] },
  { id: "lamb-chops", name: "Roasted Lamb Chops", richness: "high", fat: "high", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "roasted", flavorProfile: ["gamey", "herb", "rosemary"] },
  { id: "beef-stew", name: "Braised Beef Stew", richness: "high", fat: "medium", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "braised", flavorProfile: ["savory", "earthy", "root-vegetable"] },
  { id: "bbq-ribs", name: "BBQ Pork Ribs", richness: "high", fat: "high", spiceLevel: "medium", saltLevel: "high", sweetness: "medium", cookingMethod: "smoked", flavorProfile: ["smoke", "caramelized", "tangy"] },
  { id: "burger", name: "Classic Cheeseburger", richness: "high", fat: "high", spiceLevel: "low", saltLevel: "high", sweetness: "low", cookingMethod: "grilled", flavorProfile: ["charred", "savory", "melted-cheese"] },
  { id: "venison", name: "Pan-Seared Venison", richness: "high", fat: "medium", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "seared", flavorProfile: ["gamey", "juniper", "earthy"] },

  // --- Poultry ---
  { id: "roast-chicken", name: "Herb Roast Chicken", richness: "medium", fat: "medium", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "roasted", flavorProfile: ["herb", "savory", "buttery"] },
  { id: "turkey", name: "Roast Turkey with Gravy", richness: "medium", fat: "medium", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "roasted", flavorProfile: ["savory", "herb"] },
  { id: "duck-breast", name: "Seared Duck Breast", richness: "high", fat: "high", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "seared", flavorProfile: ["gamey", "rich", "fruit-sauce"] },
  { id: "buffalo-wings", name: "Spicy Buffalo Wings", richness: "high", fat: "high", spiceLevel: "high", saltLevel: "high", sweetness: "low", cookingMethod: "fried", flavorProfile: ["spicy", "tangy", "buttery"] },
  { id: "chicken-tikka", name: "Chicken Tikka Masala", richness: "high", fat: "medium", spiceLevel: "high", saltLevel: "medium", sweetness: "low", cookingMethod: "simmered", flavorProfile: ["spicy", "creamy", "tomato"] },

  // --- Seafood ---
  { id: "salmon", name: "Grilled Salmon", richness: "medium", fat: "high", spiceLevel: "low", saltLevel: "low", sweetness: "low", cookingMethod: "grilled", flavorProfile: ["oily-fish", "charred", "buttery"] },
  { id: "shrimp-scampi", name: "Shrimp Scampi", richness: "medium", fat: "medium", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "sauteed", flavorProfile: ["garlic", "butter", "citrus"] },
  { id: "fried-fish", name: "Fried Fish & Chips", richness: "high", fat: "high", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "fried", flavorProfile: ["crispy", "oily", "mild-fish"] },
  { id: "oysters", name: "Fresh Oysters", richness: "low", fat: "low", spiceLevel: "low", saltLevel: "high", sweetness: "low", cookingMethod: "raw", flavorProfile: ["briny", "mineral", "delicate"] },
  { id: "lobster", name: "Butter-Poached Lobster", richness: "high", fat: "high", spiceLevel: "low", saltLevel: "low", sweetness: "low", cookingMethod: "poached", flavorProfile: ["sweet-seafood", "buttery"] },
  { id: "sushi", name: "Sushi / Sashimi", richness: "low", fat: "low", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "raw", flavorProfile: ["delicate", "umami", "soy"] },
  { id: "tuna-tartare", name: "Tuna Tartare", richness: "low", fat: "medium", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "raw", flavorProfile: ["delicate", "citrus", "sesame"] },

  // --- Vegetarian / Vegetable ---
  { id: "mushroom-risotto", name: "Mushroom Risotto", richness: "high", fat: "medium", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "simmered", flavorProfile: ["earthy", "creamy", "umami"] },
  { id: "grilled-veg", name: "Grilled Vegetable Platter", richness: "low", fat: "low", spiceLevel: "low", saltLevel: "low", sweetness: "medium", cookingMethod: "grilled", flavorProfile: ["charred", "smoky", "earthy"] },
  { id: "caprese-salad", name: "Caprese Salad", richness: "low", fat: "medium", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "raw", flavorProfile: ["fresh", "tomato", "basil"] },
  { id: "eggplant-parm", name: "Eggplant Parmesan", richness: "high", fat: "medium", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "baked", flavorProfile: ["tomato", "cheesy", "herb"] },
  { id: "veggie-stirfry", name: "Vegetable Stir-Fry", richness: "low", fat: "low", spiceLevel: "medium", saltLevel: "medium", sweetness: "low", cookingMethod: "stir-fried", flavorProfile: ["soy", "ginger", "umami"] },

  // --- Pasta / Grain ---
  { id: "tomato-pasta", name: "Pasta with Tomato Sauce", richness: "medium", fat: "low", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "simmered", flavorProfile: ["tomato-leaf", "herb", "garlic"] },
  { id: "carbonara", name: "Spaghetti Carbonara", richness: "high", fat: "high", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "sauteed", flavorProfile: ["creamy", "savory", "peppery"] },
  { id: "pesto-pasta", name: "Pasta with Pesto", richness: "medium", fat: "medium", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "raw-sauce", flavorProfile: ["basil", "herb", "nutty"] },

  // --- Cheese ---
  { id: "aged-cheddar", name: "Aged Cheddar", richness: "high", fat: "high", spiceLevel: "low", saltLevel: "high", sweetness: "low", cookingMethod: "aged", flavorProfile: ["nutty", "sharp", "savory"] },
  { id: "brie", name: "Brie / Soft Cheese", richness: "high", fat: "high", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "raw", flavorProfile: ["buttery", "creamy", "mild"] },
  { id: "blue-cheese", name: "Blue Cheese", richness: "high", fat: "high", spiceLevel: "low", saltLevel: "high", sweetness: "low", cookingMethod: "aged", flavorProfile: ["pungent", "salty", "funky"] },
  { id: "goat-cheese", name: "Goat Cheese", richness: "medium", fat: "medium", spiceLevel: "low", saltLevel: "medium", sweetness: "low", cookingMethod: "raw", flavorProfile: ["tangy", "fresh", "herb"] },

  // --- Spicy / Asian ---
  { id: "pad-thai", name: "Pad Thai", richness: "medium", fat: "medium", spiceLevel: "medium", saltLevel: "medium", sweetness: "medium", cookingMethod: "stir-fried", flavorProfile: ["sweet-savory", "peanut", "lime"] },
  { id: "thai-curry", name: "Thai Green Curry", richness: "high", fat: "high", spiceLevel: "high", saltLevel: "medium", sweetness: "medium", cookingMethod: "simmered", flavorProfile: ["coconut", "spicy", "herb"] },
  { id: "kimchi", name: "Kimchi / Fermented Vegetables", richness: "low", fat: "low", spiceLevel: "high", saltLevel: "high", sweetness: "low", cookingMethod: "fermented", flavorProfile: ["spicy", "sour", "umami"] },

  // --- Dessert ---
  { id: "chocolate-cake", name: "Dark Chocolate Cake", richness: "high", fat: "high", spiceLevel: "low", saltLevel: "low", sweetness: "high", cookingMethod: "baked", flavorProfile: ["chocolate", "bittersweet"] },
  { id: "creme-brulee", name: "Crème Brûlée", richness: "high", fat: "high", spiceLevel: "low", saltLevel: "low", sweetness: "high", cookingMethod: "baked", flavorProfile: ["vanilla", "caramel", "creamy"] },
  { id: "apple-pie", name: "Apple Pie", richness: "medium", fat: "medium", spiceLevel: "low", saltLevel: "low", sweetness: "high", cookingMethod: "baked", flavorProfile: ["cinnamon", "fruit", "buttery-crust"] },
  { id: "fruit-tart", name: "Fresh Fruit Tart", richness: "medium", fat: "medium", spiceLevel: "low", saltLevel: "low", sweetness: "high", cookingMethod: "baked", flavorProfile: ["fruity", "sweet", "buttery-crust"] }
];
