import { Wine } from '@/constants/wines';

export interface UserPreferences {
    experience_level?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERIENCED';
    favorite_types?: string[];
    sweetness?: string;
    body_style?: string;
    flavors?: string[];
    grapes?: string[];
    regions?: string[];
    occasions?: string[];
    budget_min?: number;
    budget_max?: number;
    taste_appealing?: string;
}

export interface RecommendationResponse {
    status: string;
    data: {
        wines: Wine[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        sort: string;
        isPersonalized: boolean;
    };
}

export interface MLMatchDetails {
    cosineSimilarity: number;
    matchPercentage: number;
    reasons: string[];
    confidence: 'Top Match' | 'Strong Match' | 'Fair Match';
}
