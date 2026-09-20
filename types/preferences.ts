export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERIENCED';

export type WineType = 'RED' | 'WHITE' | 'ROSE' | 'SPARKLING' | 'DESSERT';

export type SweetnessLevel = 'DRY' | 'SEMI_DRY' | 'SWEET';

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
    | 'CASUAL_DINING'
    | 'CELEBRATION'
    | 'ROMANTIC_DINNER'
    | 'WINE_TASTING'
    | 'GIFTING'
    | 'SUMMER_OUTDOOR'
    | 'FOOD_PAIRING';

export interface UserPreferenceProfile {
    userId: string;
    experienceLevel: ExperienceLevel;
    preferredWineTypes: WineType[];
    preferredSweetness?: SweetnessLevel | 'ALL' | null;
    preferredBody?: BodyLevel | 'ALL' | null;
    preferredFlavors: FlavorTag[];
    preferredOccasions: OccasionTag[];
    budgetMin?: number | null;
    budgetMax?: number | null;
    preferredGrapes?: string[];
    preferredAcidity?: AcidityLevel | 'ALL' | null;
    preferredTannin?: TanninLevel | 'ALL' | null;
    preferredRegions?: string[];
    primaryInterest?: string;
    createdAt?: string;
    updatedAt?: string;
}
