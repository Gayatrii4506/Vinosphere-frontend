import { supabaseAdmin } from '../../config/supabase';

export class AnalyticsRepository {
  private readonly tableName = 'analytics_events';

  async trackEvent(data: {
    user_id?: string;
    event_type: string;
    wine_id?: string;
    winery_id?: string;
    entity_id?: string;
    metadata?: any;
  }) {
    const { data: created, error } = await supabaseAdmin
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`[AnalyticsRepository.trackEvent] ${error.message}`);
    return created;
  }

  async getEventsByWinery(wineryId: string, startDate?: string, endDate?: string) {
    let query = supabaseAdmin
      .from(this.tableName)
      .select('*, wines(name, category, price, type, characteristics)')
      .eq('winery_id', wineryId);

    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data, error } = await query;
    if (error) throw new Error(`[AnalyticsRepository.getEventsByWinery] ${error.message}`);
    return data;
  }

  async getPlatformEvents(startDate?: string, endDate?: string) {
    let query = supabaseAdmin
      .from(this.tableName)
      .select('*');

    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data, error } = await query;
    if (error) throw new Error(`[AnalyticsRepository.getPlatformEvents] ${error.message}`);
    return data;
  }

  async getUserEvents(userId: string) {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .select('*, wines(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw new Error(`[AnalyticsRepository.getUserEvents] ${error.message}`);
    return data;
  }
}

export const analyticsRepository = new AnalyticsRepository();
