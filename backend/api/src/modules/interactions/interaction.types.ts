export type WineInteractionType = 'VIEW' | 'LIKE' | 'DISLIKE' | 'WISHLIST' | 'PURCHASE';

export interface UserWineInteraction {
  id: string;
  userId: string;
  wineId: string;
  interactionType: WineInteractionType;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RecordInteractionDto {
  wine_id?: string;
  wineId?: string;
  interaction_type?: string;
  interactionType?: string;
  type?: string;
  metadata?: Record<string, any>;
}

export interface UserInteractionSummary {
  userId: string;
  viewedWineIds: string[];
  likedWineIds: string[];
  dislikedWineIds: string[];
  wishlistedWineIds: string[];
  purchasedWineIds: string[];
  totalInteractions: number;
}

export interface AggregatedInteractionProfile {
  userId: string;
  inferredWineTypes: string[];
  inferredSweetness?: string;
  inferredBody?: string;
  inferredGrapes: string[];
  inferredFlavors: string[];
  dislikedWineIds: string[];
  likedWineIds: string[];
  wishlistedWineIds: string[];
  purchasedWineIds: string[];
  viewedWineIds: string[];
  totalSignalWeight: number;
  hasSufficientSignals: boolean;
}
