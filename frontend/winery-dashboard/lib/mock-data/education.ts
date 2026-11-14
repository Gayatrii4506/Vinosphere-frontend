export interface EducationModule {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  readTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  articles: {
    title: string;
    preview: string;
    readTime: string;
  }[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
}

export const educationModules: EducationModule[] = [
  {
    id: "edu1",
    title: "Wine Basics",
    category: "Fundamentals",
    description:
      "Start your wine journey with the essential foundations. Learn how wine is made, what makes it taste different, and how to appreciate it.",
    image: "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400&q=80",
    readTime: "25 min",
    difficulty: "Beginner",
    articles: [
      { title: "How Wine is Made", preview: "From grape to glass, the complete winemaking journey", readTime: "5 min" },
      { title: "Red vs White vs Rose", preview: "Understanding the key differences between wine styles", readTime: "4 min" },
      { title: "What Makes Wine Sweet or Dry?", preview: "Residual sugar, fermentation, and taste profiles explained", readTime: "4 min" },
      { title: "Understanding Wine Labels", preview: "How to decode any wine bottle label in 60 seconds", readTime: "6 min" },
      { title: "Serving Temperature Guide", preview: "Why temperature matters and how to get it right", readTime: "3 min" },
      { title: "Wine Glassware 101", preview: "Which glass works for which wine and why it matters", readTime: "3 min" },
    ],
  },
  {
    id: "edu2",
    title: "Food & Wine Pairing",
    category: "Pairing",
    description:
      "Discover the art and science of matching food with wine. From Indian cuisine to global dishes, find the perfect pairing.",
    image: "https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=400&q=80",
    readTime: "30 min",
    difficulty: "Beginner",
    articles: [
      { title: "The Golden Rules of Wine Pairing", preview: "Pairing principles that work for most meals", readTime: "5 min" },
      { title: "Indian Food & Wine Pairing Guide", preview: "The best wines for Butter Chicken, biryani, paneer, and more", readTime: "8 min" },
      { title: "Wine with Seafood", preview: "Why crisp whites and sparkling wines shine at the seafood table", readTime: "4 min" },
      { title: "Cheese & Wine Combinations", preview: "Classic and local cheese-wine pairings", readTime: "5 min" },
      { title: "Spicy Food & Wine", preview: "How to handle heat without overpowering the wine", readTime: "4 min" },
      { title: "Dessert Wine Pairings", preview: "When and how to pair sweet wines with dessert", readTime: "4 min" },
    ],
  },
  {
    id: "edu3",
    title: "Nashik Wine Routes",
    category: "Routes",
    description:
      "Explore Nashik's main winery areas, vineyard routes, and tasting destinations so you can plan better winery visits.",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&q=80",
    readTime: "22 min",
    difficulty: "Beginner",
    articles: [
      { title: "Why Nashik is India's Wine Capital", preview: "Climate, altitude, soil, and the growth of local wineries", readTime: "6 min" },
      { title: "Gangapur Wine Trail", preview: "How to explore Sula, York, and nearby vineyards", readTime: "5 min" },
      { title: "Dindori Vineyard Belt", preview: "Premium vineyards, cool nights, and expressive grapes", readTime: "5 min" },
      { title: "Planning a Nashik Winery Day", preview: "Timing, transport, bookings, and tasting room etiquette", readTime: "6 min" },
    ],
  },
  {
    id: "edu4",
    title: "Wine Tasting Techniques",
    category: "Tasting",
    description:
      "Master professional wine tasting. Learn to see, swirl, sniff, sip, and savour wine with confidence.",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80",
    readTime: "35 min",
    difficulty: "Intermediate",
    articles: [
      { title: "The 5 S's of Wine Tasting", preview: "See, swirl, sniff, sip, and savour", readTime: "7 min" },
      { title: "Understanding Tannins", preview: "What tannins are and why they matter in red wine", readTime: "5 min" },
      { title: "Identifying Wine Aromas", preview: "How to recognize common wine aromas", readTime: "8 min" },
      { title: "Wine Acidity & Balance", preview: "The role of acidity in a wine's structure", readTime: "5 min" },
      { title: "Blind Tasting Basics", preview: "How sommeliers identify wines without seeing the label", readTime: "7 min" },
      { title: "Wine Rating Systems", preview: "Understanding stars, scores, and review language", readTime: "3 min" },
    ],
  },
  {
    id: "edu5",
    title: "Wine Production",
    category: "Production",
    description:
      "Go behind the scenes of winemaking, from vineyard management to fermentation, aging, blending, and bottling.",
    image: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&q=80",
    readTime: "38 min",
    difficulty: "Intermediate",
    articles: [
      { title: "The Vineyard Calendar", preview: "Pruning, flowering, harvest, and the year in a vineyard", readTime: "6 min" },
      { title: "Fermentation Explained", preview: "How yeast turns grape juice into wine", readTime: "5 min" },
      { title: "Oak Aging & Barrels", preview: "How barrels shape aroma, texture, and finish", readTime: "6 min" },
      { title: "Modern Winery Practices", preview: "How Nashik wineries balance tradition, quality, and scale", readTime: "5 min" },
      { title: "How Sparkling Wine is Made", preview: "Traditional method, Charmat, and pet-nat explained", readTime: "6 min" },
      { title: "Harvest Decisions", preview: "How winemakers choose the right picking window", readTime: "5 min" },
    ],
  },
  {
    id: "edu6",
    title: "Wine Etiquette",
    category: "Service",
    description:
      "Learn how to order, taste, serve, and talk about wine confidently in tastings, restaurants, events, and home gatherings.",
    image: "https://images.unsplash.com/photo-1455640276874-2e6732cc114e?w=400&q=80",
    readTime: "24 min",
    difficulty: "Beginner",
    articles: [
      { title: "How to Taste at a Winery", preview: "Simple tasting room manners for first-time visitors", readTime: "5 min" },
      { title: "Ordering Wine at Restaurants", preview: "How to choose a bottle without stress", readTime: "5 min" },
      { title: "Serving Wine at Home", preview: "Temperature, glassware, and sequence made easy", readTime: "5 min" },
      { title: "Wine Gifting Guide", preview: "Choosing bottles for hosts, colleagues, and celebrations", readTime: "5 min" },
      { title: "Common Wine Mistakes", preview: "Easy fixes that instantly improve the experience", readTime: "4 min" },
    ],
  },
];

export const glossaryTerms: GlossaryTerm[] = [
  { term: "Terroir", definition: "The natural environment where wine is produced, including soil, topography, and climate.", category: "Viticulture" },
  { term: "Tannins", definition: "Natural compounds from grape skins, seeds, and stems that create a drying sensation in red wines.", category: "Tasting" },
  { term: "Varietal", definition: "A wine made from a single or dominant grape variety, such as Shiraz or Chenin Blanc.", category: "Production" },
  { term: "Vintage", definition: "The year in which the grapes were harvested.", category: "Production" },
  { term: "Residual Sugar", definition: "The unfermented sugar remaining in wine after fermentation.", category: "Tasting" },
  { term: "Malolactic Fermentation", definition: "A secondary fermentation that softens acidity and can make wine feel creamier.", category: "Production" },
  { term: "Sommelier", definition: "A trained wine professional who specializes in wine service and pairing.", category: "Service" },
  { term: "Decanting", definition: "Pouring wine into another vessel to expose it to air or separate sediment.", category: "Service" },
  { term: "Lees", definition: "Dead yeast cells and grape residue that settle after fermentation; aging on lees adds complexity.", category: "Production" },
  { term: "Tasting Flight", definition: "A guided sequence of small pours that lets you compare different wines or styles.", category: "Service" },
  { term: "Cepage", definition: "A French term for grape variety, often used when describing blends.", category: "Production" },
  { term: "Oxidation", definition: "The reaction of wine with oxygen; controlled oxygen can add complexity, excess oxygen causes spoilage.", category: "Production" },
  { term: "Appellation", definition: "A defined wine region with rules about grapes and production methods.", category: "Regions" },
  { term: "Vertical Tasting", definition: "Tasting multiple vintages of the same wine from the same producer.", category: "Tasting" },
  { term: "Finish", definition: "The flavors and sensations that remain after swallowing or spitting wine.", category: "Tasting" },
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "Which city is known as India's Wine Capital?",
    options: ["Bangalore", "Nashik", "Pune", "Hyderabad"],
    correctIndex: 1,
    explanation: "Nashik is widely known as India's Wine Capital because of its concentration of wineries, vineyards, and wine tourism experiences.",
    category: "Routes",
  },
  {
    id: "q2",
    question: "What gives red wine its color?",
    options: ["The type of barrel used", "The grape variety's juice", "Skin contact during fermentation", "Adding food coloring"],
    correctIndex: 2,
    explanation: "Red wine gets its color from grape skins during fermentation.",
    category: "Production",
  },
  {
    id: "q3",
    question: "Which wine can pair well with spicy Butter Chicken?",
    options: ["Chardonnay", "Off-dry Riesling", "Very tannic Cabernet", "Extra dry vermouth"],
    correctIndex: 1,
    explanation: "A slight sweetness and bright acidity can balance richness and spice.",
    category: "Pairing",
  },
  {
    id: "q4",
    question: "What does terroir mean?",
    options: ["The age of the wine", "The winemaker's technique only", "The natural environment where grapes grow", "The wine's color intensity"],
    correctIndex: 2,
    explanation: "Terroir includes soil, climate, topography, and other environmental factors.",
    category: "Fundamentals",
  },
  {
    id: "q5",
    question: "At what temperature are many full-bodied red wines served?",
    options: ["4-6 C", "8-10 C", "16-18 C", "25-28 C"],
    correctIndex: 2,
    explanation: "Many full-bodied reds show best around 16-18 C.",
    category: "Service",
  },
  {
    id: "q6",
    question: "What is Sula Vineyards' famous wine and music festival called?",
    options: ["VineFest", "SulaFest", "NashikFest", "HarvestFest"],
    correctIndex: 1,
    explanation: "SulaFest is the famous wine and music festival associated with Sula Vineyards in Nashik.",
    category: "Events",
  },
  {
    id: "q7",
    question: "What is a tasting flight?",
    options: ["A vineyard route map", "A sequence of small wine pours", "A bottle delivery service", "A wine festival ticket"],
    correctIndex: 1,
    explanation: "A tasting flight lets guests compare wine styles, grapes, or vintages through small pours.",
    category: "Service",
  },
  {
    id: "q8",
    question: "Why should sparkling wine usually be served chilled?",
    options: ["To reduce bubbles", "To keep it fresh, crisp, and balanced", "To make it sweeter", "To hide the aroma"],
    correctIndex: 1,
    explanation: "Chilling keeps sparkling wine crisp and helps preserve its structure.",
    category: "Service",
  },
];

export const wineTipOfDay = {
  tip: "When pairing wine with spicy Indian food, choose wines with bright acidity, lower tannins, or slight sweetness. Off-dry Riesling works beautifully with heat.",
  category: "Pairing",
  source: "VinoSphere Sommelier Team",
};
