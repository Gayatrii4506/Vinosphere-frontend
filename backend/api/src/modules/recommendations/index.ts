/**
 * VinoSphere Recommendation & Machine Learning Module
 * 
 * Centralized recommendation engine containing:
 * - In-Engine Vector Space & Cosine Similarity ML Recommender (ml-recommender.service.ts)
 * - 32D Feature Vector Space Model & Normalizer (vectorizer.ts)
 * - Recommendation Service Orchestrator (recommendation.service.ts)
 * - Type Definitions & Interfaces (recommendation.types.ts)
 */

export * from './recommendation.types';
export * from './vectorizer';
export * from './ml-recommender.service';
export * from './recommendation.service';
