import { WineType, SweetnessLevel, BodyLevel, AcidityLevel, TanninLevel, FlavorTag, OccasionTag } from '../wines/wine.types';

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERIENCED';

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

export interface RawUserPreferencesDto {
  experience_level?: string;
  experience?: string;
  preferred_wine_types?: string[];
  favorite_wine_types?: string[];
  wine_types?: string[];
  sweetness?: string;
  preferred_sweetness?: string;
  body?: string;
  body_style?: string;
  preferred_body?: string;
  flavors?: string[];
  preferred_flavors?: string[];
  occasions?: string[];
  occasion?: string;
  preferred_occasions?: string[];
  budget?: string;
  budget_min?: number;
  budget_max?: number;
  grapes?: string[];
  preferred_grapes?: string[];
  acidity?: string;
  preferred_acidity?: string;
  tannin?: string;
  preferred_tannin?: string;
  regions?: string[];
  region?: string;
  preferred_regions?: string[];
  primary_interest?: string;
  interest?: string;
  taste_appealing?: string;
  full_name?: string;
}
