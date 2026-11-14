import { userRepository } from './user.repository';
import {
  WineType,
  SweetnessLevel,
  BodyLevel,
  AcidityLevel,
  TanninLevel,
  FlavorTag,
  OccasionTag,
} from '../wines/wine.types';
import {
  ExperienceLevel,
  UserPreferenceProfile,
  RawUserPreferencesDto,
} from './user.types';

export { ExperienceLevel, UserPreferenceProfile, RawUserPreferencesDto };

export function normalizeExperienceLevel(rawLevel: string | null | undefined): ExperienceLevel {
  if (!rawLevel) return 'BEGINNER';
  const lower = rawLevel.toLowerCase().trim();
  if (
    lower.includes('expert') ||
    lower.includes('experienced') ||
    lower.includes('connoisseur') ||
    lower.includes('collector')
  ) {
    return 'EXPERIENCED';
  }
  if (lower.includes('intermediate') || lower.includes('enthusiast')) {
    return 'INTERMEDIATE';
  }
  return 'BEGINNER';
}

export function normalizeWineTypes(raw: string[] | string | undefined): WineType[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  const results: WineType[] = [];
  for (const item of list) {
    const upper = (item || '').toUpperCase().trim();
    if (upper.includes('RED') && !results.includes('RED')) results.push('RED');
    if (upper.includes('WHITE') && !results.includes('WHITE')) results.push('WHITE');
    if (upper.includes('ROSE') && !results.includes('ROSE')) results.push('ROSE');
    if (upper.includes('SPARKLING') && !results.includes('SPARKLING')) results.push('SPARKLING');
    if (upper.includes('DESSERT') && !results.includes('DESSERT')) results.push('DESSERT');
  }
  return results;
}

export function normalizeSweetnessPref(raw: string | undefined): SweetnessLevel | 'ALL' | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  if (lower.includes('no_preference') || lower.includes('all') || lower.includes('open')) return 'ALL';
  if (lower.includes('semi') || lower.includes('off')) return 'SEMI_DRY';
  if (lower.includes('sweet') || lower.includes('dessert')) return 'SWEET';
  if (lower.includes('dry')) return 'DRY';
  return null;
}

export function normalizeBodyPref(raw: string | undefined): BodyLevel | 'ALL' | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  if (lower.includes('no_preference') || lower.includes('all') || lower.includes('mix')) return 'ALL';
  if (lower.includes('light')) return 'LIGHT';
  if (lower.includes('full') || lower.includes('bold') || lower.includes('rich')) return 'FULL';
  if (lower.includes('medium') || lower.includes('smooth') || lower.includes('balanced')) return 'MEDIUM';
  return null;
}

export function normalizeAcidityPref(raw: string | undefined): AcidityLevel | 'ALL' | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  if (lower.includes('no_preference') || lower.includes('not_sure')) return 'ALL';
  if (lower.includes('high') || lower.includes('crisp') || lower.includes('vibrant')) return 'HIGH';
  if (lower.includes('low') || lower.includes('soft')) return 'LOW';
  if (lower.includes('medium') || lower.includes('balanced')) return 'MEDIUM';
  return null;
}

export function normalizeTanninPref(raw: string | undefined): TanninLevel | 'ALL' | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();
  if (lower.includes('no_preference') || lower.includes('not_sure')) return 'ALL';
  if (lower.includes('high') || lower.includes('firm') || lower.includes('structured')) return 'HIGH';
  if (lower.includes('low') || lower.includes('silky') || lower.includes('soft')) return 'LOW';
  if (lower.includes('medium') || lower.includes('balanced')) return 'MEDIUM';
  return null;
}

export function normalizeFlavorsPref(raw: string[] | string | undefined): FlavorTag[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  const tags: FlavorTag[] = [];
  const add = (t: FlavorTag) => {
    if (!tags.includes(t)) tags.push(t);
  };

  for (const item of list) {
    const l = (item || '').toLowerCase();
    if (l.includes('berry') || l.includes('dark_fruit') || l.includes('cassis')) {
      add('BERRY');
      add('FRUITY');
    }
    if (l.includes('citrus')) add('CITRUS');
    if (l.includes('tropical') || l.includes('stone')) add('TROPICAL');
    if (l.includes('oak')) add('OAK');
    if (l.includes('vanilla')) add('VANILLA');
    if (l.includes('spice')) add('SPICY');
    if (l.includes('floral')) add('FLORAL');
    if (l.includes('herb')) add('HERBAL');
    if (l.includes('earth') || l.includes('mineral')) add('EARTHY');
    if (l.includes('fruit')) add('FRUITY');
  }
  return tags;
}

export function normalizeOccasionsPref(raw: string[] | string | undefined): OccasionTag[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  const tags: OccasionTag[] = [];
  const add = (o: OccasionTag) => {
    if (!tags.includes(o)) tags.push(o);
  };

  for (const item of list) {
    const l = (item || '').toLowerCase();
    if (l.includes('pairing') || l.includes('food') || l.includes('dining')) {
      add('FOOD_PAIRING');
      add('CASUAL_DINING');
    }
    if (l.includes('celebration') || l.includes('party')) add('CELEBRATION');
    if (l.includes('date') || l.includes('evening') || l.includes('romantic')) add('ROMANTIC_DINNER');
    if (l.includes('tasting') || l.includes('explore')) add('WINE_TASTING');
    if (l.includes('gift')) add('GIFTING');
    if (l.includes('relaxing')) add('CASUAL_DINING');
    if (l.includes('summer') || l.includes('outdoor')) add('SUMMER_OUTDOOR');
  }
  return tags;
}

export function parseBudgetRange(
  rawBudget: string | undefined,
  min?: number,
  max?: number
): { budgetMin: number | null; budgetMax: number | null } {
  if (typeof min === 'number' || typeof max === 'number') {
    return {
      budgetMin: typeof min === 'number' ? min : null,
      budgetMax: typeof max === 'number' ? max : null,
    };
  }

  if (!rawBudget) return { budgetMin: null, budgetMax: null };
  const b = rawBudget.toLowerCase();
  if (b.includes('under_500')) return { budgetMin: 0, budgetMax: 500 };
  if (b.includes('500_1000')) return { budgetMin: 500, budgetMax: 1000 };
  if (b.includes('under_1000')) return { budgetMin: 0, budgetMax: 1000 };
  if (b.includes('1000_1800')) return { budgetMin: 1000, budgetMax: 1800 };
  if (b.includes('1000_2000')) return { budgetMin: 1000, budgetMax: 2000 };
  if (b.includes('2000_3500')) return { budgetMin: 2000, budgetMax: 3500 };
  if (b.includes('above_2000')) return { budgetMin: 2000, budgetMax: null };
  if (b.includes('above_3500')) return { budgetMin: 3500, budgetMax: null };

  return { budgetMin: null, budgetMax: null };
}

export class UserService {
  async getAllUsers() {
    return await userRepository.findAll();
  }

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error(`User with ID ${id} not found`);
    return user;
  }

  /**
   * Retrieves full strongly-typed UserPreferenceProfile.
   */
  async getPreferences(authUserId: string, email?: string): Promise<UserPreferenceProfile> {
    let user = await userRepository.findByAuthId(authUserId);
    if (!user && email) {
      user = await userRepository.findByEmail(email);
    }
    if (!user) {
      user = await userRepository.findById(authUserId);
    }

    const rawExp = user?.experience_level;
    const exp = normalizeExperienceLevel(rawExp);
    const wineTypes = normalizeWineTypes(user?.favorite_wine_types);

    const budget = parseBudgetRange(user?.budget, user?.budget_min, user?.budget_max);

    return {
      userId: user?.id || authUserId,
      experienceLevel: exp,
      preferredWineTypes: wineTypes,
      preferredSweetness: normalizeSweetnessPref(user?.preferred_sweetness || user?.sweetness),
      preferredBody: normalizeBodyPref(user?.preferred_body || user?.body_style || user?.body),
      preferredFlavors: normalizeFlavorsPref(user?.preferred_flavors || user?.flavors),
      preferredOccasions: normalizeOccasionsPref(user?.preferred_occasions || user?.occasion || user?.primary_interest),
      budgetMin: budget.budgetMin,
      budgetMax: budget.budgetMax,
      preferredGrapes: user?.preferred_grapes || user?.grapes || [],
      preferredAcidity: normalizeAcidityPref(user?.preferred_acidity || user?.acidity),
      preferredTannin: normalizeTanninPref(user?.preferred_tannin || user?.tannin),
      preferredRegions: user?.preferred_regions || user?.regions || (user?.region ? [user.region] : []),
      primaryInterest: user?.primary_interest || 'tastings',
      createdAt: user?.created_at,
      updatedAt: user?.updated_at,
    };
  }

  /**
   * Updates and saves user preferences, updating user record and returning UserPreferenceProfile.
   */
  async updatePreferences(
    authUserId: string,
    dto: RawUserPreferencesDto,
    email?: string
  ): Promise<UserPreferenceProfile> {
    let user = await userRepository.findByAuthId(authUserId);
    if (!user && email) {
      user = await userRepository.findByEmail(email);
    }
    if (!user) {
      user = await userRepository.findById(authUserId);
    }

    const normalizedExp = normalizeExperienceLevel(dto.experience_level || dto.experience);
    const dbExp = normalizedExp === 'EXPERIENCED' ? 'expert' : normalizedExp.toLowerCase();

    const rawTypes = dto.preferred_wine_types || dto.favorite_wine_types || dto.wine_types || [];
    const wineTypes = normalizeWineTypes(rawTypes);

    const sweetnessPref = normalizeSweetnessPref(dto.preferred_sweetness || dto.sweetness);
    const bodyPref = normalizeBodyPref(dto.preferred_body || dto.body_style || dto.body);
    const acidityPref = normalizeAcidityPref(dto.preferred_acidity || dto.acidity);
    const tanninPref = normalizeTanninPref(dto.preferred_tannin || dto.tannin);
    const flavorsPref = normalizeFlavorsPref(dto.preferred_flavors || dto.flavors);
    const occasionsPref = normalizeOccasionsPref(dto.preferred_occasions || dto.occasions || dto.occasion);
    const budgetRange = parseBudgetRange(dto.budget, dto.budget_min, dto.budget_max);
    const grapesPref = dto.preferred_grapes || dto.grapes || [];
    const regionsPref = dto.preferred_regions || dto.regions || (dto.region ? [dto.region] : []);
    const primaryInterest = dto.primary_interest || dto.interest || 'tastings';

    const updateData: any = {
      experience_level: dbExp,
      favorite_wine_types: wineTypes.map((t) => t.toLowerCase()),
      primary_interest: primaryInterest,
    };

    if (dto.full_name) updateData.full_name = dto.full_name;

    let targetId = user?.id;
    if (user) {
      await userRepository.update(user.id, updateData);
    } else {
      const created = await userRepository.create({
        auth_id: authUserId,
        email: email || '',
        role: 'user',
        ...updateData,
      });
      targetId = created?.id || authUserId;
    }

    return {
      userId: targetId || authUserId,
      experienceLevel: normalizedExp,
      preferredWineTypes: wineTypes,
      preferredSweetness: sweetnessPref,
      preferredBody: bodyPref,
      preferredFlavors: flavorsPref,
      preferredOccasions: occasionsPref,
      budgetMin: budgetRange.budgetMin,
      budgetMax: budgetRange.budgetMax,
      preferredGrapes: grapesPref,
      preferredAcidity: acidityPref,
      preferredTannin: tanninPref,
      preferredRegions: regionsPref,
      primaryInterest: primaryInterest,
      updatedAt: new Date().toISOString(),
    };
  }

  async createUser(data: any) {
    return await userRepository.create(data);
  }

  async updateUser(id: string, data: any) {
    await this.getUserById(id);
    return await userRepository.update(id, data);
  }

  async deleteUser(id: string) {
    await this.getUserById(id);
    return await userRepository.delete(id);
  }
}

export const userService = new UserService();

