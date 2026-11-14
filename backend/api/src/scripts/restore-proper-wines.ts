import { supabaseAdmin } from '../config/supabase';
import dotenv from 'dotenv';
dotenv.config();

interface OriginalWine {
  id: string;
  name: string;
  slug: string;
  wineryId: string;
  wineType: string;
  grapeVariety: string;
  vintage: number;
  price: number;
  stock: number;
  description: string;
  tasteNotes: string;
  sweetness: string;
  body: string;
  acidity: string;
  tannin: string;
  alcoholPercentage: number;
  servingTemperature: string;
  foodPairings: string[];
  imageUrl: string;
}

// Exact 27 wines created by the user from winery profiles
const authenticWines: OriginalWine[] = [
  // 1. Chandon India
  {
    id: '2a849416-e538-4a00-9475-11cb8d401aa6',
    name: 'Brut Cuvee Sparkling Wine',
    slug: 'brut-cuvee-sparkling-wine',
    wineryId: 'cbde71f8-9031-4921-bfce-a0304d02aeb3', // Chandon India
    wineType: 'Sparkling',
    grapeVariety: 'Chardonnay, Pinot Noir',
    vintage: 2022,
    price: 1800,
    stock: 50,
    description: 'Classic traditional method sparkling with fine crisp bubbles, green apple, and toasted brioche notes.',
    tasteNotes: 'Crisp green apple, citrus, brioche, creamy mousse',
    sweetness: 'Dry',
    body: 'Medium',
    acidity: 'High',
    tannin: 'Low',
    alcoholPercentage: 12.5,
    servingTemperature: '8°C',
    foodPairings: ['Seafood', 'Oysters', 'Cheese'],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },

  // 2. York Winery
  {
    id: 'd21e598c-1d6e-4889-bc33-da0567b91f4f',
    name: 'York Arros Reserve',
    slug: 'york-arros-reserve',
    wineryId: '4fcb0319-c7b9-4eb6-84be-00717adeab3a', // York Winery
    wineType: 'Red',
    grapeVariety: 'Shiraz, Cabernet Sauvignon',
    vintage: 2021,
    price: 1450,
    stock: 60,
    description: "York's flagship reserve red — an elegant, harmonious blend of Shiraz and Cabernet Sauvignon.",
    tasteNotes: 'Blackberry, cassis, oak spice, dark chocolate',
    sweetness: 'Dry',
    body: 'Full',
    acidity: 'Medium',
    tannin: 'High',
    alcoholPercentage: 14.0,
    servingTemperature: '16-18°C',
    foodPairings: ['Lamb', 'BBQ', 'Butter Chicken'],
    imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80',
  },
  {
    id: '91b13994-b818-4892-adc6-5594f137755b',
    name: 'York Chenin Blanc',
    slug: 'york-chenin-blanc',
    wineryId: '4fcb0319-c7b9-4eb6-84be-00717adeab3a', // York Winery
    wineType: 'White',
    grapeVariety: 'Chenin Blanc',
    vintage: 2023,
    price: 750,
    stock: 75,
    description: 'Semi-dry, fresh and fruity Chenin Blanc with balanced acidity and aromas of tropical fruit.',
    tasteNotes: 'Pineapple, guava, citrus zest, floral honey',
    sweetness: 'Dry',
    body: 'Light',
    acidity: 'High',
    tannin: 'Low',
    alcoholPercentage: 12.0,
    servingTemperature: '8-10°C',
    foodPairings: ['Paneer Tikka', 'Salads', 'Seafood'],
    imageUrl: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?w=800&q=80',
  },
  {
    id: '38e40c9c-28ec-4ecf-8437-61ef86886f8e',
    name: 'York Sparkling Brut Rosé',
    slug: 'york-sparkling-brut-rose',
    wineryId: '4fcb0319-c7b9-4eb6-84be-00717adeab3a', // York Winery
    wineType: 'Rose',
    grapeVariety: 'Pinot Noir, Shiraz',
    vintage: 2022,
    price: 2100,
    stock: 40,
    description: 'Artisanal traditional method sparkling rosé with vibrant pink hues and red berry notes.',
    tasteNotes: 'Wild strawberry, red cherry, delicate citrus, fine bubbles',
    sweetness: 'Dry',
    body: 'Light',
    acidity: 'High',
    tannin: 'Low',
    alcoholPercentage: 12.0,
    servingTemperature: '6-8°C',
    foodPairings: ['Sushi', 'Tapas', 'Cheese'],
    imageUrl: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=800&q=80',
  },

  // 3. Vallonne Vineyards
  {
    id: '0a9b9027-cfdd-41d4-af95-ac18cb3fa9ef',
    name: 'Anokhee Cabernet Sauvignon Grand Reserve',
    slug: 'anokhee-cabernet-sauvignon-grand-reserve',
    wineryId: '2f549f6b-93b0-429d-8aee-295ebde8b3eb', // Vallonne Vineyards
    wineType: 'Red',
    grapeVariety: 'Cabernet Sauvignon',
    vintage: 2020,
    price: 3500,
    stock: 30,
    description: 'Handcrafted grand reserve Cabernet aged in French oak with rich cassis, cigar box, and dark cocoa.',
    tasteNotes: 'Blackcurrant, tobacco, cedar, dark chocolate, fine tannins',
    sweetness: 'Dry',
    body: 'Full',
    acidity: 'Medium',
    tannin: 'High',
    alcoholPercentage: 14.5,
    servingTemperature: '18°C',
    foodPairings: ['Roasted Lamb', 'Prime Steak', 'Aged Cheese'],
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
  },
  {
    id: '6d959b82-edbf-45b1-a6e2-99f85ff177b4',
    name: 'Vallonné Riesling',
    slug: 'vallonne-riesling',
    wineryId: '2f549f6b-93b0-429d-8aee-295ebde8b3eb', // Vallonne Vineyards
    wineType: 'White',
    grapeVariety: 'Riesling',
    vintage: 2022,
    price: 1400,
    stock: 45,
    description: 'Crisp and aromatic boutique Riesling with green apple, white peach, and mineral freshness.',
    tasteNotes: 'Green apple, jasmine, white peach, flinty mineral',
    sweetness: 'Dry',
    body: 'Light',
    acidity: 'High',
    tannin: 'Low',
    alcoholPercentage: 12.0,
    servingTemperature: '8-10°C',
    foodPairings: ['Thai Curry', 'Grilled Fish', 'Paneer Tikka'],
    imageUrl: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?w=800&q=80',
  },
  {
    id: 'bd262753-5db4-4906-9e9b-9759099a6e78',
    name: 'Vallonné Rosé',
    slug: 'vallonne-rose',
    wineryId: '2f549f6b-93b0-429d-8aee-295ebde8b3eb', // Vallonne Vineyards
    wineType: 'Rose',
    grapeVariety: 'Cabernet Sauvignon',
    vintage: 2023,
    price: 900,
    stock: 60,
    description: 'Delicate Provençal-style dry Rosé boasting wild strawberries, white peach, and subtle white pepper.',
    tasteNotes: 'Wild strawberry, white peach, citrus zest, white pepper',
    sweetness: 'Dry',
    body: 'Light',
    acidity: 'High',
    tannin: 'Low',
    alcoholPercentage: 12.0,
    servingTemperature: '9°C',
    foodPairings: ['Bruschetta', 'Prawns', 'Pasta Primavera'],
    imageUrl: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=800&q=80',
  },

  // 4. Soma Vine Village
  {
    id: 'a144735d-eedd-44ed-b675-27d23fec6c65',
    name: 'Chardonnay Reserve',
    slug: 'soma-chardonnay-reserve',
    wineryId: 'b3bd17e6-35bc-4bdc-918c-2546e00828f7', // Soma Vine Village
    wineType: 'White',
    grapeVariety: 'Chardonnay',
    vintage: 2022,
    price: 1600,
    stock: 50,
    description: 'Rich and buttery Chardonnay with hints of tropical pineapple, toasted vanilla, and crisp acidity.',
    tasteNotes: 'Ripe pineapple, vanilla butter, toasted almond, orchard fruit',
    sweetness: 'Dry',
    body: 'Medium',
    acidity: 'Medium',
    tannin: 'Low',
    alcoholPercentage: 13.0,
    servingTemperature: '10-12°C',
    foodPairings: ['Creamy Pasta', 'Roasted Chicken', 'Brie'],
    imageUrl: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?w=800&q=80',
  },
  {
    id: '8452f4db-9f7e-4e28-ad9c-594d8879cba2',
    name: 'Pinot Noir Reserve',
    slug: 'soma-pinot-noir-reserve',
    wineryId: 'b3bd17e6-35bc-4bdc-918c-2546e00828f7', // Soma Vine Village
    wineType: 'Red',
    grapeVariety: 'Pinot Noir',
    vintage: 2021,
    price: 1950,
    stock: 40,
    description: 'Silky medium-bodied Pinot Noir featuring cherry, wild strawberry, and earthy forest floor notes.',
    tasteNotes: 'Red cherry, forest floor, clove, delicate raspberry',
    sweetness: 'Dry',
    body: 'Medium',
    acidity: 'Medium',
    tannin: 'Medium',
    alcoholPercentage: 13.0,
    servingTemperature: '15-17°C',
    foodPairings: ['Duck', 'Mushroom Risotto', 'Grilled Salmon'],
    imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
  },
  {
    id: 'b8eb7639-067b-4085-8510-49985e890510',
    name: 'Dessert Rose',
    slug: 'soma-dessert-rose',
    wineryId: 'b3bd17e6-35bc-4bdc-918c-2546e00828f7', // Soma Vine Village
    wineType: 'Dessert',
    grapeVariety: 'Muscat, Chenin Blanc',
    vintage: 2022,
    price: 1100,
    stock: 35,
    description: 'Luscious and sweet dessert rosé filled with rose petals, lychee, and honeyed candied fruits.',
    tasteNotes: 'Rose water, lychee, honeyed apricot, candied citrus',
    sweetness: 'Sweet',
    body: 'Medium',
    acidity: 'Medium',
    tannin: 'Low',
    alcoholPercentage: 11.0,
    servingTemperature: '8-10°C',
    foodPairings: ['Fruit Tarts', 'Gulab Jamun', 'Cheesecake'],
    imageUrl: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=800&q=80',
  },

  // 5. Grover Zampa Vineyards
  {
    id: '360192b8-bed7-49d1-ac48-c86749908b8d',
    name: 'Dindori Reserve Shiraz',
    slug: 'grover-dindori-reserve-shiraz',
    wineryId: '4f411bd6-6c35-4637-bda8-83dcd2c26f8a', // Grover Zampa Vineyards
    wineType: 'Red',
    grapeVariety: 'Shiraz',
    vintage: 2021,
    price: 1250,
    stock: 80,
    description: 'Single-vineyard reserve Shiraz showing intense dark berries, pepper, and smoky French oak.',
    tasteNotes: 'Blackberry, pepper, vanilla, charred oak, espresso',
    sweetness: 'Dry',
    body: 'Full',
    acidity: 'Medium',
    tannin: 'High',
    alcoholPercentage: 13.5,
    servingTemperature: '16-18°C',
    foodPairings: ['Lamb Curry', 'BBQ', 'Aged Cheddar'],
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
  },
  {
    id: '3779de98-105e-43f9-8e85-99ba8ee5a2d4',
    name: 'Chêne Grand Reserve Red',
    slug: 'chene-grand-reserve-red',
    wineryId: '4f411bd6-6c35-4637-bda8-83dcd2c26f8a', // Grover Zampa Vineyards
    wineType: 'Red',
    grapeVariety: 'Tempranillo, Shiraz',
    vintage: 2020,
    price: 2200,
    stock: 40,
    description: 'Prestige cuvée aged 15 months in French oak with dark plum, roasted coffee, and velvety tannins.',
    tasteNotes: 'Dark plum, roasted coffee, tobacco, cocoa, rich oak',
    sweetness: 'Dry',
    body: 'Full',
    acidity: 'Medium',
    tannin: 'High',
    alcoholPercentage: 14.0,
    servingTemperature: '18°C',
    foodPairings: ['T-Bone Steak', 'Lamb Shank', 'Gorgonzola'],
    imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80',
  },
  {
    id: 'ee1ffc1e-0c93-4d1d-9f02-b541f37e4951',
    name: 'La Réserve Blanc',
    slug: 'la-reserve-blanc',
    wineryId: '4f411bd6-6c35-4637-bda8-83dcd2c26f8a', // Grover Zampa Vineyards
    wineType: 'White',
    grapeVariety: 'Viognier, Sauvignon Blanc',
    vintage: 2022,
    price: 1150,
    stock: 60,
    description: 'Elegant barrel-fermented white wine with peach, apricot, floral notes, and creamy mouthfeel.',
    tasteNotes: 'Peach, apricot, floral honey, creamy vanilla, lime zest',
    sweetness: 'Dry',
    body: 'Medium',
    acidity: 'Medium',
    tannin: 'Low',
    alcoholPercentage: 13.0,
    servingTemperature: '10°C',
    foodPairings: ['Seafood', 'Butter Garlic Prawns', 'Paneer Tikka'],
    imageUrl: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?w=800&q=80',
  },
  {
    id: '1c50e92a-84ca-4744-b7b6-c8cd5aa20129',
    name: 'Zampa Soirée Brut',
    slug: 'zampa-soiree-brut',
    wineryId: '4f411bd6-6c35-4637-bda8-83dcd2c26f8a', // Grover Zampa Vineyards
    wineType: 'Sparkling',
    grapeVariety: 'Chenin Blanc',
    vintage: 2022,
    price: 1200,
    stock: 55,
    description: 'Methode traditionelle sparkling wine with persistent fine bubbles, crisp lime, and brioche.',
    tasteNotes: 'Lime peel, green apple, brioche, toasted almond',
    sweetness: 'Dry',
    body: 'Medium',
    acidity: 'High',
    tannin: 'Low',
    alcoholPercentage: 12.0,
    servingTemperature: '8°C',
    foodPairings: ['Tapas', 'Fish Tikka', 'Cheeses'],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },

  // 6. Sula Vineyards (13 wines)
  {
    id: 'f69706c4-9fd3-4fa9-bd65-b7bdb7b823bd',
    name: 'Sula Shiraz Cabernet',
    slug: 'sula-shiraz-cabernet',
    wineryId: 'b40a83dd-ee61-43df-bf79-caf3b2a190de', // Sula Vineyards
    wineType: 'Red',
    grapeVariety: 'Shiraz, Cabernet Sauvignon',
    vintage: 2022,
    price: 950,
    stock: 100,
    description: 'Medium-bodied classic red blend with notes of ripe dark fruit, black pepper, and toasted oak.',
    tasteNotes: 'Dark cherry, black pepper, plum, smoky oak',
    sweetness: 'Dry',
    body: 'Medium',
    acidity: 'Medium',
    tannin: 'Medium',
    alcoholPercentage: 13.5,
    servingTemperature: '16-18°C',
    foodPairings: ['Butter Chicken', 'Tandoori Kebabs', 'Pasta'],
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
  },
  {
    id: 'd8a24f8f-b0db-4917-8650-20d156794b78',
    name: 'Sula Zinfandel',
    slug: 'sula-zinfandel',
    wineryId: 'b40a83dd-ee61-43df-bf79-caf3b2a190de', // Sula Vineyards
    wineType: 'Red',
    grapeVariety: 'Zinfandel',
    vintage: 2023,
    price: 850,
    stock: 80,
    description: 'Juicy, fruit-forward red wine packed with aromas of blackberry, cinnamon, and luscious spice.',
    tasteNotes: 'Ripe blackberry, plum, cinnamon, warm spice',
    sweetness: 'Dry',
    body: 'Medium',
    acidity: 'Medium',
    tannin: 'Medium',
    alcoholPercentage: 13.0,
    servingTemperature: '16°C',
    foodPairings: ['Pizza', 'Grilled Vegetables', 'BBQ Chicken'],
    imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
  },
  {
    id: '0618b656-29f4-44a6-9252-193e98cfb8a6',
    name: 'Sula Riesling',
    slug: 'sula-riesling',
    wineryId: 'b40a83dd-ee61-43df-bf79-caf3b2a190de', // Sula Vineyards
    wineType: 'White',
    grapeVariety: 'Riesling',
    vintage: 2023,
    price: 1000,
    stock: 90,
    description: 'Off-dry aromatic white with luscious peach, green apple, jasmine, and bright balancing acidity.',
    tasteNotes: 'White peach, apricot, jasmine blossom, lime zest',
    sweetness: 'Dry',
    body: 'Light',
    acidity: 'High',
    tannin: 'Low',
    alcoholPercentage: 11.5,
    servingTemperature: '8-10°C',
    foodPairings: ['Spicy Food', 'Paneer Tikka', 'Thai Curry'],
    imageUrl: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?w=800&q=80',
  },
  {
    id: '8eb8b87f-652a-4a0b-8b1c-2cb210f92a8c',
    name: 'Sula Sauvignon Blanc',
    slug: 'sula-sauvignon-blanc',
    wineryId: 'b40a83dd-ee61-43df-bf79-caf3b2a190de', // Sula Vineyards
    wineType: 'White',
    grapeVariety: 'Sauvignon Blanc',
    vintage: 2023,
    price: 850,
    stock: 120,
    description: 'Crisp, aromatic, and refreshing, bursting with tropical fruits, gooseberry, and citrus zest.',
    tasteNotes: 'Grapefruit, passion fruit, gooseberry, fresh herbs',
    sweetness: 'Dry',
    body: 'Light',
    acidity: 'High',
    tannin: 'Low',
    alcoholPercentage: 12.5,
    servingTemperature: '8-10°C',
    foodPairings: ['Seafood', 'Paneer Tikka', 'Pasta'],
    imageUrl: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?w=800&q=80',
  },
  {
    id: '12a92d20-4cbd-4a88-987a-7a01af57a20c',
    name: 'Sula Chenin Blanc',
    slug: 'sula-chenin-blanc',
    wineryId: 'b40a83dd-ee61-43df-bf79-caf3b2a190de', // Sula Vineyards
    wineType: 'White',
    grapeVariety: 'Chenin Blanc',
    vintage: 2023,
    price: 750,
    stock: 110,
    description: 'Semi-dry, refreshing white wine with flavors of ripe pineapple, pear, and sweet floral notes.',
    tasteNotes: 'Pineapple, yellow apple, honeysuckle, lemon drops',
    sweetness: 'Dry',
    body: 'Light',
    acidity: 'High',
    tannin: 'Low',
    alcoholPercentage: 12.0,
    servingTemperature: '8°C',
    foodPairings: ['Vegetarian', 'Salads', 'Mild Curries'],
    imageUrl: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?w=800&q=80',
  },
  {
    id: '3fea21f8-6644-4243-b275-09748f56c9df',
    name: 'Sula Chenin Blanc Reserve',
    slug: 'sula-chenin-blanc-reserve',
    wineryId: 'b40a83dd-ee61-43df-bf79-caf3b2a190de', // Sula Vineyards
    wineType: 'White',
    grapeVariety: 'Chenin Blanc',
    vintage: 2022,
    price: 950,
    stock: 70,
    description: 'Oak-aged reserve expression of Chenin Blanc with honeyed complexity, melon, and vanilla.',
    tasteNotes: 'Melon, honey, toasted oak, vanilla bean, peach',
    sweetness: 'Dry',
    body: 'Medium',
    acidity: 'Medium',
    tannin: 'Low',
    alcoholPercentage: 12.5,
    servingTemperature: '10°C',
    foodPairings: ['Roasted Chicken', 'Creamy Pasta', 'Fish Tikka'],
    imageUrl: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?w=800&q=80',
  },
  {
    id: '3ce71f8d-b227-46d5-a645-87715aa6aa9e',
    name: 'Dindori Reserve Chardonnay',
    slug: 'dindori-reserve-chardonnay',
    wineryId: 'b40a83dd-ee61-43df-bf79-caf3b2a190de', // Sula Vineyards
    wineType: 'White',
    grapeVariety: 'Chardonnay',
    vintage: 2022,
    price: 1350,
    stock: 60,
    description: 'Single-vineyard reserve Chardonnay with ripe stone fruit, hazelnut, and creamy French oak finish.',
    tasteNotes: 'Hazelnut, ripe peach, butterscotch, toasted oak',
    sweetness: 'Dry',
    body: 'Full',
    acidity: 'Medium',
    tannin: 'Low',
    alcoholPercentage: 13.0,
    servingTemperature: '10-12°C',
    foodPairings: ['Lobster', 'Creamy Risotto', 'Brie'],
    imageUrl: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?w=800&q=80',
  },
  {
    id: '6fdfb576-6e04-46ca-b674-95f02462e5cd',
    name: 'Dindori Reserve Viognier',
    slug: 'dindori-reserve-viognier',
    wineryId: 'b40a83dd-ee61-43df-bf79-caf3b2a190de', // Sula Vineyards
    wineType: 'White',
    grapeVariety: 'Viognier',
    vintage: 2022,
    price: 1400,
    stock: 65,
    description: 'Exotic and full-bodied white wine with fragrant white blossoms, apricot, and rich texture.',
    tasteNotes: 'Apricot, orange blossom, honeysuckle, ginger spice',
    sweetness: 'Dry',
    body: 'Full',
    acidity: 'Medium',
    tannin: 'Low',
    alcoholPercentage: 13.5,
    servingTemperature: '10-12°C',
    foodPairings: ['Butter Chicken', 'Biryani', 'Mild Cheeses'],
    imageUrl: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?w=800&q=80',
  },
  {
    id: 'c0a251e6-fcd1-4c8c-aaca-b48cde853c05',
    name: 'RĀSĀ Cabernet Sauvignon',
    slug: 'rasa-cabernet-sauvignon',
    wineryId: 'b40a83dd-ee61-43df-bf79-caf3b2a190de', // Sula Vineyards
    wineType: 'Red',
    grapeVariety: 'Cabernet Sauvignon',
    vintage: 2021,
    price: 1850,
    stock: 50,
    description: 'Ultra-premium reserve red crafted from estate grapes, matured 14 months in French oak.',
    tasteNotes: 'Blackcurrant, tobacco leaf, dark cocoa, cedarwood',
    sweetness: 'Dry',
    body: 'Full',
    acidity: 'Medium',
    tannin: 'High',
    alcoholPercentage: 14.0,
    servingTemperature: '18°C',
    foodPairings: ['Lamb Chops', 'Grilled Steak', 'Aged Cheddar'],
    imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80',
  },
  {
    id: '87b4c78c-2146-445c-a78d-26d30e8f3cd3',
    name: 'Sula Late Harvest Chenin Blanc',
    slug: 'sula-late-harvest-chenin-blanc',
    wineryId: 'b40a83dd-ee61-43df-bf79-caf3b2a190de', // Sula Vineyards
    wineType: 'Dessert',
    grapeVariety: 'Chenin Blanc',
    vintage: 2022,
    price: 950,
    stock: 60,
    description: 'Pioneer late-harvest dessert wine bursting with honeyed aromas of mango and apricot.',
    tasteNotes: 'Honey, Alphonso mango, candied citrus, dried apricot',
    sweetness: 'Sweet',
    body: 'Full',
    acidity: 'Medium',
    tannin: 'Low',
    alcoholPercentage: 10.5,
    servingTemperature: '10-12°C',
    foodPairings: ['Desserts', 'Blue Cheese', 'Gulab Jamun'],
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
  },
  {
    id: '0dd6cf98-d4d2-4bb5-ae81-cb11bde28cc7',
    name: 'Sula Sparkling Shiraz',
    slug: 'sula-sparkling-shiraz',
    wineryId: 'b40a83dd-ee61-43df-bf79-caf3b2a190de', // Sula Vineyards
    wineType: 'Sparkling',
    grapeVariety: 'Shiraz',
    vintage: 2022,
    price: 1400,
    stock: 55,
    description: 'Unique sparkling red wine loaded with pomegranate, dark berries, and festive effervescence.',
    tasteNotes: 'Pomegranate, black cherry, dark spice, fine bubbles',
    sweetness: 'Dry',
    body: 'Medium',
    acidity: 'High',
    tannin: 'Low',
    alcoholPercentage: 12.5,
    servingTemperature: '8°C',
    foodPairings: ['BBQ Ribs', 'Roast Duck', 'Spiced Appetizers'],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
  {
    id: 'c98c667e-edad-4536-bd92-ebad50860012',
    name: 'Sula Zinfandel Rosé',
    slug: 'sula-zinfandel-rose',
    wineryId: 'b40a83dd-ee61-43df-bf79-caf3b2a190de', // Sula Vineyards
    wineType: 'Rose',
    grapeVariety: 'Zinfandel',
    vintage: 2023,
    price: 800,
    stock: 90,
    description: 'Popular, easy-drinking blush rosé with fresh strawberry, raspberry, and balanced sweetness.',
    tasteNotes: 'Fresh strawberry, raspberry, watermelon, floral sweetness',
    sweetness: 'Dry',
    body: 'Light',
    acidity: 'High',
    tannin: 'Low',
    alcoholPercentage: 11.5,
    servingTemperature: '8-10°C',
    foodPairings: ['Pizza', 'Tapas', 'Mild Cheeses'],
    imageUrl: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=800&q=80',
  },
  {
    id: 'd1c8c1b0-cabe-4855-a5ee-cf7204dae776',
    name: 'Sula Brut Tropicale',
    slug: 'sula-brut-tropicale-res',
    wineryId: 'b40a83dd-ee61-43df-bf79-caf3b2a190de', // Sula Vineyards
    wineType: 'Sparkling',
    grapeVariety: 'Chenin Blanc, Pinot Noir',
    vintage: 2023,
    price: 1500,
    stock: 85,
    description: 'Vibrant and festive, pale coral sparkling wine with passion fruit, peach, and creamy mousse.',
    tasteNotes: 'Passion fruit, peach, brioche, creamy mousse',
    sweetness: 'Dry',
    body: 'Medium',
    acidity: 'High',
    tannin: 'Low',
    alcoholPercentage: 12.0,
    servingTemperature: '6-8°C',
    foodPairings: ['Seafood', 'Paneer Tikka', 'Desserts'],
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  },
];

async function restoreUserWines() {
  console.log('🍷 Restoring the exact 27 manually added wines with their original IDs & winery associations...\n');

  try {
    // 1. Purge the temporary / test hardcoded wines first
    console.log('Step 1: Removing temporary/dummy records...');
    await supabaseAdmin.from('wine_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('wine_inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('wines').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Insert the exact 27 authentic wines
    console.log('Step 2: Inserting the 27 original wines...');
    let count = 0;

    for (const w of authenticWines) {
      // Insert wine with exact original ID
      const { error: wineErr } = await supabaseAdmin.from('wines').insert({
        id: w.id,
        winery_id: w.wineryId,
        name: w.name,
        slug: w.slug,
        wine_type: w.wineType,
        grape_variety: w.grapeVariety,
        vintage: w.vintage,
        description: w.description,
        sweetness: w.sweetness,
        body: w.body,
        acidity: w.acidity,
        tannin: w.tannin,
        alcohol_percentage: w.alcoholPercentage,
        serving_temperature: w.servingTemperature,
        food_pairings: w.foodPairings,
        taste_notes: w.tasteNotes,
      });

      if (wineErr) {
        console.error(`  ✗ Error inserting wine ${w.name}:`, wineErr.message);
        continue;
      }

      // Insert inventory
      await supabaseAdmin.from('wine_inventory').insert({
        wine_id: w.id,
        price: w.price,
        stock_quantity: w.stock,
        publish_status: 'published',
      });

      // Insert image
      await supabaseAdmin.from('wine_images').insert({
        wine_id: w.id,
        image_url: w.imageUrl,
        is_primary: true,
      });

      console.log(`  ✓ Restored: [${w.id}] ${w.name} (Winery: ${w.wineryId})`);
      count++;
    }

    console.log(`\n🎉 Done! Restored ${count} wines exactly as originally added to their respective winery profiles!`);
  } catch (err) {
    console.error('Fatal error during restoration:', err);
  } finally {
    process.exit(0);
  }
}

restoreUserWines();
