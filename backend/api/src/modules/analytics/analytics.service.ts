import { analyticsRepository } from './analytics.repository';
import { db } from '../../adapters/database';

export class AnalyticsService {
  async trackEvent(data: any) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    const payload = { ...data, created_at: new Date().toISOString() };
    payload.metadata = payload.metadata || {};

    if (payload.wine_id && !uuidRegex.test(payload.wine_id)) {
      payload.metadata.original_wine_id = payload.wine_id;
      delete payload.wine_id;
    }

    if (payload.winery_id && !uuidRegex.test(payload.winery_id)) {
      payload.metadata.original_winery_id = payload.winery_id;
      delete payload.winery_id;
    }

    if (payload.user_id && !uuidRegex.test(payload.user_id)) {
      payload.metadata.original_user_id = payload.user_id;
      delete payload.user_id;
    }

    return await analyticsRepository.trackEvent(payload);
  }

  async getWineryAnalytics(wineryId: string) {
    // 1. Fetch raw events for this winery
    const events = await analyticsRepository.getEventsByWinery(wineryId);

    // 2. Compute KPI metrics
    let totalWineViews = 0;
    let totalWineSaves = 0;
    let totalRecommendationClicks = 0;
    let totalEventViews = 0;
    let totalEventBookings = 0;

    const wineInteractions: Record<string, { views: number, saves: number, name: string, category: string }> = {};

    for (const ev of events) {
      if (ev.event_type === 'wine_view') {
        totalWineViews++;
        this.incrementWineStat(wineInteractions, ev, 'views');
      } else if (ev.event_type === 'wine_save') {
        totalWineSaves++;
        this.incrementWineStat(wineInteractions, ev, 'saves');
      } else if (ev.event_type === 'recommendation_click') {
        totalRecommendationClicks++;
      } else if (ev.event_type === 'event_view') {
        totalEventViews++;
      } else if (ev.event_type === 'event_booking') {
        totalEventBookings++;
      }
    }

    // Top wines
    const topWines = Object.entries(wineInteractions)
      .map(([id, stats]) => ({
        wine_id: id,
        name: stats.name,
        category: stats.category,
        views: stats.views,
        saves: stats.saves,
        save_rate: stats.views > 0 ? (stats.saves / stats.views) * 100 : 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Generate actionable insights
    const insights = this.generateWineryInsights({
      totalWineViews,
      totalWineSaves,
      topWines
    });

    return {
      kpis: {
        total_wine_views: totalWineViews,
        total_wine_saves: totalWineSaves,
        recommendation_clicks: totalRecommendationClicks,
        event_views: totalEventViews,
        event_bookings: totalEventBookings
      },
      top_wines: topWines,
      insights
    };
  }

  private incrementWineStat(map: any, ev: any, stat: 'views' | 'saves') {
    if (!ev.wine_id) return;
    if (!map[ev.wine_id]) {
      map[ev.wine_id] = {
        views: 0,
        saves: 0,
        name: ev.wines?.name || 'Unknown Wine',
        category: ev.wines?.category || 'Unknown Category'
      };
    }
    map[ev.wine_id][stat]++;
  }

  private generateWineryInsights(data: any): string[] {
    const insights: string[] = [];
    
    if (data.totalWineViews > 0 && data.totalWineSaves === 0) {
      insights.push("Your wines are receiving attention but no saves. Consider reviewing pricing or descriptions.");
    }
    if (data.topWines.length > 0) {
      const top = data.topWines[0];
      if (top.save_rate > 20) {
        insights.push(`"${top.name}" is receiving exceptionally high interest with a ${top.save_rate.toFixed(1)}% save rate.`);
      } else if (top.views > 50 && top.save_rate < 5) {
        insights.push(`"${top.name}" is viewed frequently but rarely saved. Review the wine's profile to improve conversion.`);
      }
    }
    
    if (insights.length === 0) {
      insights.push("Engagement is steady. Keep updating your wine profiles and events to drive more traffic.");
    }

    return insights;
  }

  async getAdminAnalytics() {
    // Platform-level overview
    const events = await analyticsRepository.getPlatformEvents();
    const users = await db.find('users');
    const wineries = await db.find('wineries');
    const wines = await db.find('wines');

    const platformKpis = {
      total_users: users.length,
      registered_wineries: wineries.length,
      wine_listings: wines.length,
      total_views: events.filter((e: any) => e.event_type === 'wine_view').length,
      total_saves: events.filter((e: any) => e.event_type === 'wine_save').length,
      total_bookings: events.filter((e: any) => e.event_type === 'event_booking').length
    };

    return {
      kpis: platformKpis,
      event_breakdown: events.reduce((acc: any, e: any) => {
        acc[e.event_type] = (acc[e.event_type] || 0) + 1;
        return acc;
      }, {})
    };
  }

  async getUserPreferences(userId: string) {
    const events = await analyticsRepository.getUserEvents(userId);
    
    const categoryCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    for (const ev of events) {
      if (ev.event_type === 'wine_view' || ev.event_type === 'wine_save') {
        if (ev.wines) {
          const cat = ev.wines.category;
          const type = ev.wines.type;
          
          if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + (ev.event_type === 'wine_save' ? 3 : 1);
          if (type) typeCounts[type] = (typeCounts[type] || 0) + (ev.event_type === 'wine_save' ? 3 : 1);
        }
      }
    }

    // Sort to get top preferences
    const getTop = (obj: any) => Object.entries(obj).sort((a: any, b: any) => b[1] - a[1]).map(e => e[0]);

    return {
      top_categories: getTop(categoryCounts),
      top_types: getTop(typeCounts)
    };
  }

  // Helper to fetch wine daily engagement with fallback if view is missing from schema cache
  private async fetchWineDailyEngagement(wineryId: string) {
    const { data, error } = await db.client
      .from('view_wine_daily_engagement')
      .select('wine_id, event_date, daily_views, daily_saves')
      .eq('winery_id', wineryId);

    if (!error && data) return data;

    // Fallback: aggregate directly from analytics_events
    const { data: events, error: eventErr } = await db.client
      .from('analytics_events')
      .select('wine_id, created_at, event_type, user_id')
      .eq('winery_id', wineryId)
      .not('wine_id', 'is', null)
      .in('event_type', ['wine_view', 'wine_save']);

    if (eventErr) throw new Error('Failed to fetch wine stats: ' + eventErr.message);

    const map: Record<string, { wine_id: string; event_date: string; daily_views: number; daily_saves: number; unique_users: Set<string> }> = {};

    (events || []).forEach((e: any) => {
      const dateStr = new Date(e.created_at).toISOString().split('T')[0];
      const key = `${e.wine_id}_${dateStr}`;
      if (!map[key]) {
        map[key] = {
          wine_id: e.wine_id,
          event_date: dateStr,
          daily_views: 0,
          daily_saves: 0,
          unique_users: new Set()
        };
      }
      if (e.event_type === 'wine_view') {
        map[key].daily_views += 1;
        if (e.user_id) map[key].unique_users.add(e.user_id);
      } else if (e.event_type === 'wine_save') {
        map[key].daily_saves += 1;
      }
    });

    return Object.values(map).map(item => ({
      wine_id: item.wine_id,
      event_date: item.event_date,
      daily_views: item.daily_views,
      daily_saves: item.daily_saves,
      daily_unique_viewers: item.unique_users.size
    }));
  }

  // Helper to fetch event performance with fallback if view is missing from schema cache
  private async fetchEventPerformance(wineryId: string) {
    const { data, error } = await db.client
      .from('view_event_performance')
      .select('*')
      .eq('winery_id', wineryId);

    if (!error && data) return data;

    // Fallback: Query events, bookings, analytics_events directly
    const { data: events, error: eventsErr } = await db.client
      .from('events')
      .select('id, winery_id, title, event_date, capacity')
      .eq('winery_id', wineryId);

    if (eventsErr) throw new Error('Failed to fetch event stats: ' + eventsErr.message);
    if (!events || events.length === 0) return [];

    const eventIds = events.map((e: any) => e.id);

    const { data: bookings } = await db.client
      .from('bookings')
      .select('event_id, guests, total_amount, booking_status')
      .in('event_id', eventIds)
      .neq('booking_status', 'cancelled');

    const { data: eventViews } = await db.client
      .from('analytics_events')
      .select('entity_id')
      .eq('event_type', 'event_view')
      .in('entity_id', eventIds);

    const bookingAgg: Record<string, { guests: number; revenue: number }> = {};
    (bookings || []).forEach((b: any) => {
      if (!bookingAgg[b.event_id]) bookingAgg[b.event_id] = { guests: 0, revenue: 0 };
      bookingAgg[b.event_id].guests += b.guests || 0;
      bookingAgg[b.event_id].revenue += b.total_amount || 0;
    });

    const viewAgg: Record<string, number> = {};
    (eventViews || []).forEach((v: any) => {
      if (v.entity_id) {
        viewAgg[v.entity_id] = (viewAgg[v.entity_id] || 0) + 1;
      }
    });

    return events.map((e: any) => {
      const b = bookingAgg[e.id] || { guests: 0, revenue: 0 };
      const views = viewAgg[e.id] || 0;
      const maxCapacity = e.capacity || 0;
      return {
        event_id: e.id,
        winery_id: e.winery_id,
        title: e.title,
        event_date: e.event_date,
        max_capacity: maxCapacity,
        total_guests_booked: b.guests,
        total_revenue: b.revenue,
        capacity_utilization_percent: maxCapacity > 0 ? (b.guests / maxCapacity) * 100 : 0,
        total_views: views
      };
    });
  }

  // Phase 10: New endpoints using the materialized views (with fallback support)
  async getDashboardSummary(wineryId: string) {
    // 1. Wine Summary
    const wineStats = await this.fetchWineDailyEngagement(wineryId);

    let totalViews = 0;
    let totalSaves = 0;
    const wineAgg: Record<string, { views: number }> = {};

    (wineStats || []).forEach((row: any) => {
        totalViews += row.daily_views || 0;
        totalSaves += row.daily_saves || 0;
        if (!wineAgg[row.wine_id]) {
            wineAgg[row.wine_id] = { views: 0 };
        }
        wineAgg[row.wine_id].views += row.daily_views || 0;
    });

    const mostViewedWines = Object.entries(wineAgg)
        .sort((a, b) => b[1].views - a[1].views)
        .slice(0, 5)
        .map(([id, stats]) => ({ wine_id: id, views: stats.views }));

    // 2. Event Summary
    const eventStats = await this.fetchEventPerformance(wineryId);

    let totalGuestsBooked = 0;
    let totalCapacity = 0;
    let totalEventViews = 0;

    (eventStats || []).forEach((row: any) => {
        totalGuestsBooked += row.total_guests_booked || 0;
        totalCapacity += row.max_capacity || 0;
        totalEventViews += row.total_views || 0;
    });

    return {
        wine_views: totalViews,
        wine_saves: totalSaves,
        view_to_save_rate: totalViews > 0 ? parseFloat(((totalSaves / totalViews) * 100).toFixed(2)) : 0,
        event_views: totalEventViews,
        guests_booked: totalGuestsBooked,
        capacity_utilization: totalCapacity > 0 ? parseFloat(((totalGuestsBooked / totalCapacity) * 100).toFixed(2)) : 0,
        most_viewed_wines: mostViewedWines
    };
  }

  async getTimeSeries(wineryId: string) {
      const data = await this.fetchWineDailyEngagement(wineryId);

      // Aggregate by date
      const aggregated: Record<string, { date: string, wine_views: number, wine_saves: number }> = {};
      
      (data || []).forEach((row: any) => {
          const date = row.event_date;
          if (!aggregated[date]) {
              aggregated[date] = { date, wine_views: 0, wine_saves: 0 };
          }
          aggregated[date].wine_views += row.daily_views || 0;
          aggregated[date].wine_saves += row.daily_saves || 0;
      });

      return Object.values(aggregated).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Helper to compute period comparison object with safe zero handling.
   */
  private calculatePeriodComparison(currentVal: number, previousVal: number, minObsThreshold: number = 5) {
    const absoluteChange = currentVal - previousVal;
    let percentageChange: number | null = null;
    if (previousVal > 0) {
      percentageChange = parseFloat(((absoluteChange / previousVal) * 100).toFixed(2));
    }

    return {
      current: currentVal,
      previous: previousVal,
      absoluteChange,
      percentageChange,
      dataSufficient: currentVal >= minObsThreshold
    };
  }

  /**
   * Phase 12A: Business Analytics API
   * Calculates truthful business metrics: Event, Experience, Corporate Inquiry & Gross Booking Value.
   */
  async getBusinessAnalytics(wineryId: string, periodDays: number = 7) {
    const now = new Date();
    const currentStart = new Date(now);
    currentStart.setDate(now.getDate() - periodDays);
    const previousStart = new Date(now);
    previousStart.setDate(now.getDate() - (periodDays * 2));

    const currentStartISO = currentStart.toISOString();
    const previousStartISO = previousStart.toISOString();

    // 1. Fetch Bookings for winery
    const { data: rawBookings } = await db.client
      .from('bookings')
      .select('id, winery_id, event_id, experience_id, guests, total_amount, booking_status, payment_status, created_at, booking_date')
      .eq('winery_id', wineryId)
      .gte('created_at', previousStartISO);

    const bookings = rawBookings || [];

    // Separate into Current Period vs Previous Period
    let currentEvtBookings = 0, previousEvtBookings = 0;
    let currentEvtGuests = 0, previousEvtGuests = 0;
    let currentEvtGBV = 0, previousEvtGBV = 0;

    let currentExpBookings = 0, previousExpBookings = 0;
    let currentExpGuests = 0, previousExpGuests = 0;
    let currentExpGBV = 0, previousExpGBV = 0;

    let currentTotalGBV = 0, previousTotalGBV = 0;

    bookings.forEach((b: any) => {
      const createdAt = new Date(b.created_at || b.booking_date).toISOString();
      const isCurrent = createdAt >= currentStartISO;
      const isCancelled = b.booking_status === 'cancelled';
      const isPaid = b.payment_status === 'paid';
      const isRefunded = b.payment_status === 'refunded';
      const isEligibleGBV = isPaid && !isCancelled && !isRefunded;

      const guestsCount = Number(b.guests) || 0;
      const amount = Number(b.total_amount) || 0;

      // Event Bookings
      if (b.event_id && !isCancelled) {
        if (isCurrent) {
          currentEvtBookings += 1;
          currentEvtGuests += guestsCount;
        } else {
          previousEvtBookings += 1;
          previousEvtGuests += guestsCount;
        }
      }

      if (b.event_id && isEligibleGBV) {
        if (isCurrent) currentEvtGBV += amount;
        else previousEvtGBV += amount;
      }

      // Experience Bookings
      if (b.experience_id && !isCancelled) {
        if (isCurrent) {
          currentExpBookings += 1;
          currentExpGuests += guestsCount;
        } else {
          previousExpBookings += 1;
          previousExpGuests += guestsCount;
        }
      }

      if (b.experience_id && isEligibleGBV) {
        if (isCurrent) currentExpGBV += amount;
        else previousExpGBV += amount;
      }

      // Combined Gross Booking Value (No double counting if record has both IDs)
      if ((b.event_id || b.experience_id) && isEligibleGBV) {
        if (isCurrent) currentTotalGBV += amount;
        else previousTotalGBV += amount;
      }
    });

    // 2. Capacity Utilization for Events
    const { data: rawEvents } = await db.client
      .from('events')
      .select('id, capacity')
      .eq('winery_id', wineryId);

    const totalEventCapacity = (rawEvents || []).reduce((sum: number, e: any) => sum + (Number(e.capacity) || 0), 0);
    const currentCapUtil = totalEventCapacity > 0 ? parseFloat(((currentEvtGuests / totalEventCapacity) * 100).toFixed(2)) : 0;
    const previousCapUtil = totalEventCapacity > 0 ? parseFloat(((previousEvtGuests / totalEventCapacity) * 100).toFixed(2)) : 0;

    // 3. Corporate Leads
    const { data: rawLeads } = await db.client
      .from('corporate_leads')
      .select('id, status, expected_guests, created_at')
      .eq('winery_id', wineryId);

    const leads = rawLeads || [];
    let currentLeads = 0, previousLeads = 0;
    let totalExpectedGuests = 0, validGuestsCount = 0;
    const statusBreakdown = { pending: 0, approved: 0, rejected: 0 };

    leads.forEach((l: any) => {
      const createdAt = new Date(l.created_at).toISOString();
      if (createdAt >= currentStartISO) {
        currentLeads += 1;
      } else if (createdAt >= previousStartISO) {
        previousLeads += 1;
      }

      const st = (l.status || 'pending').toLowerCase();
      if (st === 'approved') statusBreakdown.approved += 1;
      else if (st === 'rejected') statusBreakdown.rejected += 1;
      else statusBreakdown.pending += 1;

      if (l.expected_guests !== null && l.expected_guests !== undefined) {
        totalExpectedGuests += Number(l.expected_guests) || 0;
        validGuestsCount += 1;
      }
    });

    const avgExpectedGuests = validGuestsCount > 0 ? parseFloat((totalExpectedGuests / validGuestsCount).toFixed(2)) : 0;

    return {
      eventBookings: this.calculatePeriodComparison(currentEvtBookings, previousEvtBookings, 5),
      eventGuests: this.calculatePeriodComparison(currentEvtGuests, previousEvtGuests, 5),
      eventCapacityUtilization: this.calculatePeriodComparison(currentCapUtil, previousCapUtil, 0),
      eventGrossBookingValue: this.calculatePeriodComparison(currentEvtGBV, previousEvtGBV, 5),
      experienceBookings: this.calculatePeriodComparison(currentExpBookings, previousExpBookings, 5),
      experienceGuests: this.calculatePeriodComparison(currentExpGuests, previousExpGuests, 5),
      experienceGrossBookingValue: this.calculatePeriodComparison(currentExpGBV, previousExpGBV, 5),
      totalGrossBookingValue: this.calculatePeriodComparison(currentTotalGBV, previousTotalGBV, 5),
      corporateInquiries: this.calculatePeriodComparison(currentLeads, previousLeads, 3),
      corporateStatusBreakdown: statusBreakdown,
      corporateAvgExpectedGuests: avgExpectedGuests
    };
  }
}

export const analyticsService = new AnalyticsService();
