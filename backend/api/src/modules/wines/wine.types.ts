export type WineType = 'RED' | 'WHITE' | 'ROSE' | 'SPARKLING' | 'DESSERT';

export type SweetnessLevel = 'DRY' | 'SEMI_DRY' | 'SWEET'| 'OFF-DRY';

export type BodyLevel = 'LIGHT' | 'MEDIUM' | 'FULL';

export type AcidityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type TanninLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type FlavorTag =
  | 'FRUITY'
  | 'BERRY'
  | 'CITRUS'
  | 'TROPICAL'
  | 'FLORAL'
  | 'OAK'
  | 'VANILLA'
  | 'SPICY'
  | 'EARTHY'
  | 'HERBAL';

export type OccasionTag =
  | 'CELEBRATION'
  | 'CASUAL_DINING'
  | 'ROMANTIC_DINNER'
  | 'GIFTING'
  | 'SUMMER_OUTDOOR'
  | 'WINE_TASTING'
  | 'FOOD_PAIRING';

export interface NormalizedWine {
  id: string;
  name: string;
  slug: string;
  wineryId: string | null;
  wineryName: string;
  wineryCity: string | null;
  wineryState: string | null;
  wineryCountry: string;
  wineType: WineType;
  grapeVariety: string;
  vintage: number | null;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  imageUrl: string | null;
  sweetness: SweetnessLevel;
  body: BodyLevel;
  acidity: AcidityLevel;
  tannin: TanninLevel;
  alcoholPercentage: number | null;
  servingTemperature: string | null;
  flavors: FlavorTag[];
  foodPairings: string[];
  occasions: OccasionTag[];
  rating: number; // 0-100 scale (e.g. 88, 92)
  starRating: number; // 0-5 scale (e.g. 4.4, 4.6)
  reviewCount: number;
  isBeginnerFriendly: boolean;
  description: string | null;
  tasteNotesRaw: string | null;
}
