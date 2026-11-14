import { useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export function useAnalytics() {
  const trackEvent = useCallback(async (
    eventType: string,
    data?: {
      wine_id?: string;
      winery_id?: string;
      entity_id?: string;
      metadata?: any;
    }
  ) => {
    try {
      // Get auth token if available (assuming standard localStorage token)
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event_type: eventType,
          ...data
        })
      });

      if (!res.ok) {
        throw new Error(`Analytics API returned ${res.status}`);
      }
    } catch (err) {
      console.warn('Failed to track analytics event:', err);
    }
  }, []);

  return { trackEvent };
}
