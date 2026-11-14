// Phase 4: Data Quality & Sufficiency
export interface DataSufficiencyStatus {
    status: 'sufficient' | 'insufficient_data';
    reason?: string;
    observations: number;
    entity_id: string;
    metric: string;
}

export class InsightEngine {
    
    /**
     * Data Sufficiency Checks
     * Implements specific thresholds for different metrics rather than a blanket rule.
     */
    static checkSufficiency(
        entityId: string, 
        metric: string, 
        currentObservations: number, 
        historicalObservations: number
    ): DataSufficiencyStatus {
        
        // Define minimums per metric (heuristic evidence thresholds)
        const thresholds: Record<string, { minObs: number; requireHistory: boolean }> = {
            'wine_views': { minObs: 20, requireHistory: true },
            'wine_saves': { minObs: 5, requireHistory: false },
            'event_views': { minObs: 15, requireHistory: false },
            'view_to_save_rate': { minObs: 0, requireHistory: false },
            'event_bookings': { minObs: 2, requireHistory: false },
            'experience_bookings': { minObs: 5, requireHistory: true },
            'corporate_leads': { minObs: 3, requireHistory: true },
            'gross_booking_value': { minObs: 5, requireHistory: true },
            'event_guests': { minObs: 5, requireHistory: true },
            'experience_guests': { minObs: 5, requireHistory: true }
        };

        const config = thresholds[metric] || { minObs: 10, requireHistory: false };

        if (currentObservations < config.minObs) {
            return {
                status: 'insufficient_data',
                reason: `Not enough observations (${currentObservations}) to establish a reliable trend (minimum ${config.minObs})`,
                entity_id: entityId,
                metric,
                observations: currentObservations
            };
        }

        if (config.requireHistory && historicalObservations === 0) {
            return {
                status: 'insufficient_data',
                reason: 'No historical comparison data available for trend detection',
                entity_id: entityId,
                metric,
                observations: currentObservations
            };
        }

        return {
            status: 'sufficient',
            entity_id: entityId,
            metric,
            observations: currentObservations
        };
    }

    /**
     * Phase 5 & Phase 12A: Pattern Detection
     * Deterministic trend detection.
     */
    static detectTrend(
        entityType: string,
        entityId: string,
        metric: string,
        currentValue: number,
        comparisonValue: number,
        periodInfo: { current: string; comparison: string }
    ) {
        const sufficiency = this.checkSufficiency(entityId, metric, currentValue, comparisonValue);
        if (sufficiency.status === 'insufficient_data') {
            return sufficiency;
        }

        const absoluteChange = currentValue - comparisonValue;
        const percentageChange = comparisonValue > 0 ? (absoluteChange / comparisonValue) * 100 : 100;
        
        let condition_detected = 'stable';
        let rule_id = 'STABLE_NO_ACTION';

        if (metric === 'wine_views') {
            if (percentageChange >= 30 && absoluteChange >= 15) {
                condition_detected = 'increasing engagement';
                rule_id = 'RISING_WINE_INTEREST';
            } else if (percentageChange <= -30 && absoluteChange <= -15) {
                condition_detected = 'decreasing engagement';
                rule_id = 'FALLING_WINE_INTEREST';
            }
        } else if (metric === 'event_bookings') {
            if (percentageChange >= 25 && absoluteChange >= 3) {
                condition_detected = 'increasing event bookings';
                rule_id = 'RISING_EVENT_BOOKINGS';
            } else if (percentageChange <= -25 && absoluteChange <= -3) {
                condition_detected = 'decreasing event bookings';
                rule_id = 'FALLING_EVENT_BOOKINGS';
            }
        } else if (metric === 'experience_bookings') {
            if (percentageChange >= 25 && absoluteChange >= 3) {
                condition_detected = 'increasing experience bookings';
                rule_id = 'RISING_EXPERIENCE_BOOKINGS';
            } else if (percentageChange <= -25 && absoluteChange <= -3) {
                condition_detected = 'decreasing experience bookings';
                rule_id = 'FALLING_EXPERIENCE_BOOKINGS';
            }
        } else if (metric === 'corporate_leads') {
            if (percentageChange >= 25 && absoluteChange >= 2) {
                condition_detected = 'increasing corporate inquiries';
                rule_id = 'RISING_CORPORATE_INQUIRIES';
            } else if (percentageChange <= -25 && absoluteChange <= -2) {
                condition_detected = 'decreasing corporate inquiries';
                rule_id = 'FALLING_CORPORATE_INQUIRIES';
            }
        } else if (metric === 'gross_booking_value') {
            if (percentageChange >= 20 && absoluteChange >= 5000) {
                condition_detected = 'increasing gross booking value';
                rule_id = 'RISING_GROSS_BOOKING_VALUE';
            } else if (percentageChange <= -20 && absoluteChange <= -5000) {
                condition_detected = 'decreasing gross booking value';
                rule_id = 'FALLING_GROSS_BOOKING_VALUE';
            }
        } else if (metric === 'view_to_save_rate') {
            if (comparisonValue === 0) {
                return {
                    status: 'insufficient_data',
                    reason: 'Denominator (views) is zero, cannot calculate rate.',
                    entity_id: entityId,
                    metric,
                    observations: currentValue
                };
            }
            if (comparisonValue > 50 && currentValue < 2) {
                condition_detected = 'high interest but weak conversion';
                rule_id = 'HIGH_VIEWS_LOW_SAVE_RATE';
            } else if (currentValue >= 10 && comparisonValue < 20) {
                condition_detected = 'high saves low views';
                rule_id = 'HIGH_SAVES_LOW_VIEWS';
            }
        }

        // Return structured insight object
        return {
            entity_type: entityType,
            entity_id: entityId,
            metric,
            current_value: currentValue,
            comparison_value: comparisonValue,
            absolute_change: absoluteChange,
            percentage_change: parseFloat(percentageChange.toFixed(2)),
            period: periodInfo,
            detection_condition: condition_detected,
            rule_id: rule_id,
            data_sufficiency: sufficiency,
            generated_at: new Date().toISOString()
        };
    }

    /**
     * Phase 5 & Phase 12A: Recommendation Engine
     */
    static generateRecommendation(ruleId: string): string {
        const rules: Record<string, string> = {
            'RISING_WINE_INTEREST': 'Consider featuring this wine in relevant winery content or upcoming tasting events to capitalize on rising interest.',
            'HIGH_SAVES_LOW_VIEWS': 'Recommend improving wine discoverability on the platform (e.g., tags, cover image) as those who find it tend to save it.',
            'HIGH_VIEWS_LOW_SAVE_RATE': 'Review wine description, imagery, or pricing information, as the high views are not translating to saves.',
            'FALLING_WINE_INTEREST': 'Investigate recent changes in visibility or consider running a promotion to re-engage interest.',
            'RISING_EVENT_BOOKINGS': 'Event bookings increased compared with the previous period. Consider maintaining or increasing visibility for events receiving stronger engagement.',
            'FALLING_EVENT_BOOKINGS': 'Event bookings decreased compared with the previous period. Consider reviewing event presentation, scheduling availability, and promotional outreach.',
            'RISING_EXPERIENCE_BOOKINGS': 'Experience bookings increased compared with the previous period. Consider highlighting experiences receiving stronger booking activity.',
            'FALLING_EXPERIENCE_BOOKINGS': 'Experience bookings decreased compared with the previous period. Consider reviewing experience presentation, availability, and engagement.',
            'RISING_CORPORATE_INQUIRIES': 'Corporate inquiries increased compared with the previous period. Consider reviewing inquiry follow-up activity and staff capacity to handle increased corporate interest.',
            'FALLING_CORPORATE_INQUIRIES': 'Corporate inquiries decreased compared with the previous period. Consider reviewing corporate experience visibility and inquiry-generation channels.',
            'RISING_GROSS_BOOKING_VALUE': 'Gross booking value increased compared with the previous period, reflecting stronger reservation volume across events and experiences.',
            'FALLING_GROSS_BOOKING_VALUE': 'Gross booking value decreased compared with the previous period. Review booking pricing, experience availability, and promotional positioning.',
            'STABLE_NO_ACTION': 'No action recommended at this time.'
        };
        return rules[ruleId] || rules['STABLE_NO_ACTION'];
    }
}
