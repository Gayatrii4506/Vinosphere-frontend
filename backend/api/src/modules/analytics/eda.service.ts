/**
 * VinoSphere EDA (Exploratory Data Analysis) Service
 * ===================================================
 * Extension of the existing Analytics module.
 * Reuses: SupabaseAdapter, analytics_events, wines, wine_inventory,
 *         bookings, events, experiences, corporate_leads, view_wine_daily_engagement.
 * Does NOT replace AnalyticsService, InsightEngine, or RecommendationService.
 */

import { supabaseAdmin as supabase } from '../../config/supabase';
import * as fs from 'fs';
import * as path from 'path';

// ─── Helper Types ────────────────────────────────────────────────

interface DataAvailability {
  available: boolean;
  recordCount: number;
  message: string;
}

interface DescriptiveStats {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
}

// ─── Math Helpers ────────────────────────────────────────────────

function calcMean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function calcMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calcStdDev(arr: number[], mean: number): number {
  if (arr.length < 2) return 0;
  const variance = arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function descriptiveStats(arr: number[]): DescriptiveStats {
  const filtered = arr.filter(v => v !== null && v !== undefined && !isNaN(v));
  if (filtered.length === 0) return { count: 0, mean: 0, median: 0, min: 0, max: 0, stdDev: 0 };
  const mean = calcMean(filtered);
  return {
    count: filtered.length,
    mean: parseFloat(mean.toFixed(4)),
    median: parseFloat(calcMedian(filtered).toFixed(4)),
    min: parseFloat(Math.min(...filtered).toFixed(4)),
    max: parseFloat(Math.max(...filtered).toFixed(4)),
    stdDev: parseFloat(calcStdDev(filtered, mean).toFixed(4)),
  };
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  const xSlice = x.slice(0, n);
  const ySlice = y.slice(0, n);
  const xMean = calcMean(xSlice);
  const yMean = calcMean(ySlice);
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xSlice[i] - xMean;
    const dy = ySlice[i] - yMean;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  if (den === 0) return 0;
  return parseFloat((num / den).toFixed(4));
}

function buildAvailability(count: number, minRequired: number, analysisName: string): DataAvailability {
  if (count >= minRequired) {
    return { available: true, recordCount: count, message: `${analysisName}: ${count} records available.` };
  }
  return { available: false, recordCount: count, message: `Insufficient data for ${analysisName}. Found ${count} records, minimum ${minRequired} required.` };
}

function countByField(items: any[], field: string): { name: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const item of items) {
    const val = item[field];
    if (val !== null && val !== undefined && val !== '') {
      const key = String(val);
      map[key] = (map[key] || 0) + 1;
    }
  }
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── Wine Quality CSV Parser ────────────────────────────────────

interface WineQualityRow {
  Grape_Name: string;
  Brix_TSS: number;
  pH: number;
  Titratable_Acidity_g_L: number;
  Glucose_Fructose_g_L: number;
  YAN_mg_L: number;
  Malic_Acid_g_L: number;
  Tartaric_Acid_g_L: number;
  Total_Phenolics_mg_L: number;
  Wine_Quality_Score: number;
  Wine_Quality_Category: string;
}

let _qualityCache: WineQualityRow[] | null = null;

function loadWineQualityCSV(): WineQualityRow[] {
  if (_qualityCache) return _qualityCache;

  const csvPath = path.resolve(__dirname, '../../../ml-services/wine-quality/wine quality using grape.csv');
  if (!fs.existsSync(csvPath)) {
    return [];
  }

  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: WineQualityRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (cols.length < headers.length) continue;

    const row: any = {};
    headers.forEach((h, idx) => { row[h] = cols[idx]; });

    rows.push({
      Grape_Name: row['Grape_Name'] || '',
      Brix_TSS: parseFloat(row['Brix_TSS']) || 0,
      pH: parseFloat(row['pH']) || 0,
      Titratable_Acidity_g_L: parseFloat(row['Titratable_Acidity_g_L']) || 0,
      Glucose_Fructose_g_L: parseFloat(row['Glucose_Fructose_g_L']) || 0,
      YAN_mg_L: parseFloat(row['YAN_mg_L']) || 0,
      Malic_Acid_g_L: parseFloat(row['Malic_Acid_g_L']) || 0,
      Tartaric_Acid_g_L: parseFloat(row['Tartaric_Acid_g_L']) || 0,
      Total_Phenolics_mg_L: parseFloat(row['Total_Phenolics_mg_L']) || 0,
      Wine_Quality_Score: parseFloat(row['Wine_Quality_Score']) || 0,
      Wine_Quality_Category: row['Wine_Quality_Category'] || '',
    });
  }

  _qualityCache = rows;
  return rows;
}

// ═══════════════════════════════════════════════════════════════
// EDA SERVICE CLASS
// ═══════════════════════════════════════════════════════════════

export class EDAService {

  // ─── 1. EDA OVERVIEW ────────────────────────────────────────

  async getOverview(wineryId: string) {
    // Wines for this winery
    const { data: wines } = await supabase
      .from('wines')
      .select('id, name, wine_type, grape_variety, vintage')
      .eq('winery_id', wineryId);

    const wineIds = (wines || []).map((w: any) => w.id);

    // Wine inventory (prices)
    let inventoryData: any[] = [];
    if (wineIds.length > 0) {
      const { data: inv } = await supabase
        .from('wine_inventory')
        .select('wine_id, price, stock_quantity')
        .in('wine_id', wineIds);
      inventoryData = inv || [];
    }

    // Analytics events
    const { data: analyticsEvents } = await supabase
      .from('analytics_events')
      .select('id, event_type')
      .eq('winery_id', wineryId);

    const events = analyticsEvents || [];
    const totalViews = events.filter((e: any) => e.event_type === 'wine_view').length;
    const totalSaves = events.filter((e: any) => e.event_type === 'wine_save').length;
    const eventViews = events.filter((e: any) => e.event_type === 'event_view').length;

    // Bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, total_amount, booking_status')
      .eq('winery_id', wineryId);

    const activeBookings = (bookings || []).filter((b: any) => b.booking_status !== 'cancelled');

    // Events
    const { data: wineryEvents } = await supabase
      .from('events')
      .select('id')
      .eq('winery_id', wineryId);

    // Prices
    const prices = inventoryData.map((i: any) => Number(i.price)).filter(p => !isNaN(p) && p > 0);
    const avgPrice = prices.length > 0 ? parseFloat(calcMean(prices).toFixed(2)) : null;

    // Quality data
    const qualityRows = loadWineQualityCSV();
    const avgQualityScore = qualityRows.length > 0
      ? parseFloat(calcMean(qualityRows.map(r => r.Wine_Quality_Score)).toFixed(2))
      : null;

    // Data quality assessment
    const missingPrices = (wines || []).length - inventoryData.length;

    return {
      summary: {
        totalWines: (wines || []).length,
        totalViews,
        totalSaves,
        totalBookings: activeBookings.length,
        averageWinePrice: avgPrice,
        averageRating: null, // No ratings table currently tracked per-wine
        averageQualityScore: avgQualityScore,
        totalEvents: (wineryEvents || []).length,
        totalEventViews: eventViews,
      },
      dataQuality: {
        wineRecords: buildAvailability((wines || []).length, 1, 'Wine catalog'),
        analyticsEvents: buildAvailability(events.length, 5, 'Analytics telemetry'),
        bookingRecords: buildAvailability(activeBookings.length, 1, 'Booking data'),
        priceData: buildAvailability(prices.length, 1, 'Price data'),
        missingPrices: missingPrices > 0 ? missingPrices : 0,
        qualityDataset: buildAvailability(qualityRows.length, 10, 'Wine quality dataset'),
        ratingsAvailable: false,
        ratingsMessage: 'Per-wine user ratings are not yet tracked in the database.',
      },
    };
  }

  // ─── 2. WINE DISTRIBUTION ANALYSIS ─────────────────────────

  async getWineDistribution(wineryId: string) {
    const { data: wines } = await supabase
      .from('wines')
      .select('id, name, wine_type, grape_variety, vintage, sweetness, body, acidity, tannin, alcohol_percentage')
      .eq('winery_id', wineryId);

    const wineList = wines || [];
    const availability = buildAvailability(wineList.length, 2, 'Wine distribution analysis');

    if (!availability.available) {
      return { availability, distributions: {} };
    }

    const wineIds = wineList.map((w: any) => w.id);
    let inventoryData: any[] = [];
    if (wineIds.length > 0) {
      const { data: inv } = await supabase
        .from('wine_inventory')
        .select('wine_id, price')
        .in('wine_id', wineIds);
      inventoryData = inv || [];
    }

    const priceMap: Record<string, number> = {};
    inventoryData.forEach((i: any) => { if (i.price) priceMap[i.wine_id] = Number(i.price); });

    const distributions: Record<string, any> = {};

    // Wine type distribution
    const wineTypes = countByField(wineList, 'wine_type');
    if (wineTypes.length > 0) distributions.wineType = wineTypes;

    // Grape variety distribution
    const grapeVarieties = countByField(wineList, 'grape_variety');
    if (grapeVarieties.length > 0) distributions.grapeVariety = grapeVarieties;

    // Sweetness distribution
    const sweetnessVals = countByField(wineList, 'sweetness');
    if (sweetnessVals.length > 0) distributions.sweetness = sweetnessVals;

    // Body distribution
    const bodyVals = countByField(wineList, 'body');
    if (bodyVals.length > 0) distributions.body = bodyVals;

    // Acidity distribution
    const acidityVals = countByField(wineList, 'acidity');
    if (acidityVals.length > 0) distributions.acidity = acidityVals;

    // Tannin distribution
    const tanninVals = countByField(wineList, 'tannin');
    if (tanninVals.length > 0) distributions.tannin = tanninVals;

    // Price distribution (histogram buckets)
    const prices = wineList
      .map((w: any) => priceMap[w.id])
      .filter((p: any) => p !== undefined && p > 0);

    if (prices.length >= 2) {
      const priceStats = descriptiveStats(prices);
      const bucketSize = Math.max(500, Math.ceil((priceStats.max - priceStats.min) / 6 / 100) * 100);
      const buckets: { range: string; count: number }[] = [];
      const minBucket = Math.floor(priceStats.min / bucketSize) * bucketSize;
      const maxBucket = Math.ceil(priceStats.max / bucketSize) * bucketSize;

      for (let b = minBucket; b < maxBucket; b += bucketSize) {
        const count = prices.filter((p: number) => p >= b && p < b + bucketSize).length;
        buckets.push({ range: `₹${b}-${b + bucketSize}`, count });
      }
      distributions.price = { stats: priceStats, histogram: buckets };
    }

    // Alcohol percentage distribution
    const alcoholVals = wineList
      .map((w: any) => Number(w.alcohol_percentage))
      .filter((v: number) => !isNaN(v) && v > 0);

    if (alcoholVals.length >= 2) {
      distributions.alcoholPercentage = descriptiveStats(alcoholVals);
    }

    // Vintage distribution
    const vintageVals = countByField(wineList, 'vintage');
    if (vintageVals.length > 0) distributions.vintage = vintageVals;

    return { availability, distributions };
  }

  // ─── 3. PRICE VS ENGAGEMENT ─────────────────────────────────

  async getPriceEngagement(wineryId: string) {
    const { data: wines } = await supabase
      .from('wines')
      .select('id, name, wine_type')
      .eq('winery_id', wineryId);

    const wineList = wines || [];
    if (wineList.length === 0) {
      return {
        availability: buildAvailability(0, 1, 'Price vs engagement analysis'),
        dataPoints: [],
        summaryStats: null,
      };
    }

    const wineIds = wineList.map((w: any) => w.id);

    // Fetch prices
    const { data: inv } = await supabase
      .from('wine_inventory')
      .select('wine_id, price')
      .in('wine_id', wineIds);

    const priceMap: Record<string, number> = {};
    (inv || []).forEach((i: any) => { if (i.price) priceMap[i.wine_id] = Number(i.price); });

    // Fetch engagement from analytics_events
    const { data: events } = await supabase
      .from('analytics_events')
      .select('wine_id, event_type')
      .eq('winery_id', wineryId)
      .not('wine_id', 'is', null)
      .in('event_type', ['wine_view', 'wine_save']);

    const viewMap: Record<string, number> = {};
    const saveMap: Record<string, number> = {};
    (events || []).forEach((e: any) => {
      if (e.event_type === 'wine_view') viewMap[e.wine_id] = (viewMap[e.wine_id] || 0) + 1;
      if (e.event_type === 'wine_save') saveMap[e.wine_id] = (saveMap[e.wine_id] || 0) + 1;
    });

    const dataPoints = wineList
      .filter((w: any) => priceMap[w.id] !== undefined)
      .map((w: any) => ({
        wineId: w.id,
        wineName: w.name,
        wineType: w.wine_type,
        price: priceMap[w.id],
        views: viewMap[w.id] || 0,
        saves: saveMap[w.id] || 0,
      }));

    const availability = buildAvailability(dataPoints.length, 2, 'Price vs engagement analysis');

    // Summary statistics
    let summaryStats = null;
    if (dataPoints.length >= 2) {
      const prices = dataPoints.map(d => d.price);
      const views = dataPoints.map(d => d.views);
      const saves = dataPoints.map(d => d.saves);

      summaryStats = {
        priceStats: descriptiveStats(prices),
        viewStats: descriptiveStats(views),
        saveStats: descriptiveStats(saves),
        priceViewCorrelation: pearsonCorrelation(prices, views),
        priceSaveCorrelation: pearsonCorrelation(prices, saves),
        note: 'Correlation values range from -1 to 1. This represents statistical association, not causation.',
      };
    }

    return { availability, dataPoints, summaryStats };
  }

  // ─── 4. CONVERSION FUNNEL ──────────────────────────────────

  async getConversionFunnel(wineryId: string) {
    const { data: events } = await supabase
      .from('analytics_events')
      .select('event_type')
      .eq('winery_id', wineryId);

    const allEvents = events || [];
    const availability = buildAvailability(allEvents.length, 5, 'Engagement funnel analysis');

    const wineViews = allEvents.filter((e: any) => e.event_type === 'wine_view').length;
    const wineSaves = allEvents.filter((e: any) => e.event_type === 'wine_save').length;
    const eventExperienceViews = allEvents.filter((e: any) =>
      e.event_type === 'event_view' || e.event_type === 'experience_view'
    ).length;
    const eventBookingEvents = allEvents.filter((e: any) => e.event_type === 'event_booking').length;

    // Also check actual bookings table for total confirmation
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, booking_status')
      .eq('winery_id', wineryId);

    const confirmedBookings = (bookings || []).filter((b: any) => b.booking_status !== 'cancelled').length;
    const bookingCount = Math.max(eventBookingEvents, confirmedBookings);

    const stages = [
      { stage: 'Wine Views', count: wineViews },
      { stage: 'Wine Saves', count: wineSaves },
      { stage: 'Event / Experience Views', count: eventExperienceViews },
      { stage: 'Bookings', count: bookingCount },
    ];

    // Calculate conversion rates between applicable stages
    const conversions: { from: string; to: string; rate: number | null }[] = [];

    if (wineViews > 0) {
      conversions.push({
        from: 'Wine Views',
        to: 'Wine Saves',
        rate: parseFloat(((wineSaves / wineViews) * 100).toFixed(2)),
      });
    }

    if (wineViews > 0 && eventExperienceViews > 0) {
      conversions.push({
        from: 'Wine Views',
        to: 'Event / Experience Views',
        rate: parseFloat(((eventExperienceViews / wineViews) * 100).toFixed(2)),
      });
    }

    if (eventExperienceViews > 0 && bookingCount > 0) {
      conversions.push({
        from: 'Event / Experience Views',
        to: 'Bookings',
        rate: parseFloat(((bookingCount / eventExperienceViews) * 100).toFixed(2)),
      });
    }

    return {
      availability,
      disclaimer: 'This is an aggregate engagement funnel. It does not imply every individual user progressed through each stage sequentially.',
      stages,
      conversions,
    };
  }

  // ─── 5. SEASONALITY / TIME ANALYSIS ─────────────────────────

  async getSeasonality(wineryId: string) {
    const { data: events } = await supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .eq('winery_id', wineryId)
      .order('created_at', { ascending: true });

    const allEvents = events || [];
    const availability = buildAvailability(allEvents.length, 5, 'Seasonality analysis');

    if (!availability.available) {
      return { availability, daily: [], weekly: [], monthly: [], dayOfWeek: [], bookingTrend: [] };
    }

    // Daily engagement
    const dailyMap: Record<string, { date: string; views: number; saves: number; total: number }> = {};
    allEvents.forEach((e: any) => {
      const date = new Date(e.created_at).toISOString().split('T')[0];
      if (!dailyMap[date]) dailyMap[date] = { date, views: 0, saves: 0, total: 0 };
      dailyMap[date].total++;
      if (e.event_type === 'wine_view') dailyMap[date].views++;
      if (e.event_type === 'wine_save') dailyMap[date].saves++;
    });
    const daily = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // Weekly engagement (ISO week)
    const weeklyMap: Record<string, { week: string; total: number; views: number; saves: number }> = {};
    allEvents.forEach((e: any) => {
      const d = new Date(e.created_at);
      const jan1 = new Date(d.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
      const key = `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
      if (!weeklyMap[key]) weeklyMap[key] = { week: key, total: 0, views: 0, saves: 0 };
      weeklyMap[key].total++;
      if (e.event_type === 'wine_view') weeklyMap[key].views++;
      if (e.event_type === 'wine_save') weeklyMap[key].saves++;
    });
    const weekly = Object.values(weeklyMap).sort((a, b) => a.week.localeCompare(b.week));

    // Monthly engagement
    const monthlyMap: Record<string, { month: string; total: number; views: number; saves: number }> = {};
    allEvents.forEach((e: any) => {
      const d = new Date(e.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, total: 0, views: 0, saves: 0 };
      monthlyMap[key].total++;
      if (e.event_type === 'wine_view') monthlyMap[key].views++;
      if (e.event_type === 'wine_save') monthlyMap[key].saves++;
    });
    const monthly = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    // Day-of-week activity
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dowMap: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    allEvents.forEach((e: any) => {
      const dow = new Date(e.created_at).getDay();
      dowMap[dow]++;
    });
    const dayOfWeek = dayNames.map((name, i) => ({ day: name, count: dowMap[i] }));

    // Booking trend (from bookings table)
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, created_at, total_amount, booking_status')
      .eq('winery_id', wineryId)
      .neq('booking_status', 'cancelled')
      .order('created_at', { ascending: true });

    const bookingDailyMap: Record<string, { date: string; bookings: number; revenue: number }> = {};
    (bookings || []).forEach((b: any) => {
      const date = new Date(b.created_at).toISOString().split('T')[0];
      if (!bookingDailyMap[date]) bookingDailyMap[date] = { date, bookings: 0, revenue: 0 };
      bookingDailyMap[date].bookings++;
      bookingDailyMap[date].revenue += Number(b.total_amount) || 0;
    });
    const bookingTrend = Object.values(bookingDailyMap).sort((a, b) => a.date.localeCompare(b.date));

    return { availability, daily, weekly, monthly, dayOfWeek, bookingTrend };
  }

  // ─── 6. BOOKING ANALYSIS ──────────────────────────────────

  async getBookingAnalysis(wineryId: string) {
    // Bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, event_id, experience_id, guests, total_amount, booking_status, payment_status, created_at')
      .eq('winery_id', wineryId);

    const allBookings = bookings || [];
    const activeBookings = allBookings.filter((b: any) => b.booking_status !== 'cancelled');
    const availability = buildAvailability(activeBookings.length, 1, 'Booking analysis');

    if (!availability.available) {
      return { availability, summary: null, eventBreakdown: [], experienceBreakdown: [] };
    }

    const amounts = activeBookings.map((b: any) => Number(b.total_amount) || 0);
    const guests = activeBookings.map((b: any) => Number(b.guests) || 0);

    const summary = {
      totalBookings: activeBookings.length,
      totalAmount: parseFloat(amounts.reduce((s, v) => s + v, 0).toFixed(2)),
      averageAmount: parseFloat(calcMean(amounts).toFixed(2)),
      totalGuests: guests.reduce((s, v) => s + v, 0),
      averageGuests: parseFloat(calcMean(guests).toFixed(2)),
      amountStats: descriptiveStats(amounts),
      guestStats: descriptiveStats(guests),
      statusBreakdown: countByField(allBookings, 'booking_status'),
      paymentBreakdown: countByField(activeBookings, 'payment_status'),
    };

    // Event breakdown
    const { data: wineryEvents } = await supabase
      .from('events')
      .select('id, title, capacity, price, event_date')
      .eq('winery_id', wineryId);

    const eventBreakdown = (wineryEvents || []).map((evt: any) => {
      const evtBookings = activeBookings.filter((b: any) => b.event_id === evt.id);
      const evtGuests = evtBookings.reduce((s: number, b: any) => s + (Number(b.guests) || 0), 0);
      const evtRevenue = evtBookings.reduce((s: number, b: any) => s + (Number(b.total_amount) || 0), 0);
      const capacity = Number(evt.capacity) || 0;
      return {
        eventId: evt.id,
        title: evt.title,
        eventDate: evt.event_date,
        capacity,
        bookings: evtBookings.length,
        guests: evtGuests,
        revenue: parseFloat(evtRevenue.toFixed(2)),
        capacityUtilization: capacity > 0 ? parseFloat(((evtGuests / capacity) * 100).toFixed(2)) : 0,
      };
    });

    // Experience breakdown
    const { data: wineryExperiences } = await supabase
      .from('experiences')
      .select('id, title, capacity, price')
      .eq('winery_id', wineryId);

    const experienceBreakdown = (wineryExperiences || []).map((exp: any) => {
      const expBookings = activeBookings.filter((b: any) => b.experience_id === exp.id);
      const expGuests = expBookings.reduce((s: number, b: any) => s + (Number(b.guests) || 0), 0);
      const expRevenue = expBookings.reduce((s: number, b: any) => s + (Number(b.total_amount) || 0), 0);
      const capacity = Number(exp.capacity) || 0;
      return {
        experienceId: exp.id,
        title: exp.title,
        capacity,
        bookings: expBookings.length,
        guests: expGuests,
        revenue: parseFloat(expRevenue.toFixed(2)),
        capacityUtilization: capacity > 0 ? parseFloat(((expGuests / capacity) * 100).toFixed(2)) : 0,
      };
    });

    // Guests vs Revenue scatter data
    const guestsVsRevenue = activeBookings.map((b: any) => ({
      guests: Number(b.guests) || 0,
      amount: Number(b.total_amount) || 0,
      type: b.event_id ? 'event' : 'experience',
    }));

    return { availability, summary, eventBreakdown, experienceBreakdown, guestsVsRevenue };
  }

  // ─── 7. QUALITY ANALYSIS (from CSV dataset) ────────────────

  async getQualityAnalysis() {
    const rows = loadWineQualityCSV();
    const availability = buildAvailability(rows.length, 10, 'Wine quality EDA');

    if (!availability.available) {
      return { availability, descriptive: null, qualityDistribution: null, featureVsQuality: null };
    }

    // A. Descriptive statistics for each physicochemical variable
    const chemicalFields: { key: keyof WineQualityRow; label: string }[] = [
      { key: 'Brix_TSS', label: 'Brix / TSS' },
      { key: 'pH', label: 'pH' },
      { key: 'Titratable_Acidity_g_L', label: 'Titratable Acidity (g/L)' },
      { key: 'Glucose_Fructose_g_L', label: 'Glucose+Fructose (g/L)' },
      { key: 'YAN_mg_L', label: 'YAN (mg/L)' },
      { key: 'Malic_Acid_g_L', label: 'Malic Acid (g/L)' },
      { key: 'Tartaric_Acid_g_L', label: 'Tartaric Acid (g/L)' },
      { key: 'Total_Phenolics_mg_L', label: 'Total Phenolics (mg/L)' },
      { key: 'Wine_Quality_Score', label: 'Wine Quality Score' },
    ];

    const descriptive: Record<string, DescriptiveStats & { label: string }> = {};
    for (const f of chemicalFields) {
      const vals = rows.map(r => r[f.key] as number).filter(v => !isNaN(v));
      descriptive[f.key] = { ...descriptiveStats(vals), label: f.label };
    }

    // C. Quality distribution
    const qualityDistribution = countByField(rows, 'Wine_Quality_Category');

    // Score histogram
    const scores = rows.map(r => r.Wine_Quality_Score).filter(v => !isNaN(v));
    const scoreHistogram: { range: string; count: number }[] = [];
    for (let s = 1; s <= 10; s++) {
      const count = scores.filter(v => Math.round(v) === s).length;
      if (count > 0) scoreHistogram.push({ range: String(s), count });
    }

    // Grape variety quality
    const grapeQuality: Record<string, { scores: number[]; count: number }> = {};
    rows.forEach(r => {
      if (!grapeQuality[r.Grape_Name]) grapeQuality[r.Grape_Name] = { scores: [], count: 0 };
      grapeQuality[r.Grape_Name].scores.push(r.Wine_Quality_Score);
      grapeQuality[r.Grape_Name].count++;
    });
    const grapeQualityAvg = Object.entries(grapeQuality)
      .map(([grape, data]) => ({
        grape,
        avgScore: parseFloat(calcMean(data.scores).toFixed(2)),
        count: data.count,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);

    // D. Feature vs Quality scatter data (sampled)
    const sampleSize = Math.min(rows.length, 500);
    const step = Math.max(1, Math.floor(rows.length / sampleSize));
    const sampled = rows.filter((_, i) => i % step === 0);

    const featureVsQuality = {
      note: 'Scatter data for feature vs quality analysis. Correlation does not imply causation.',
      pH: sampled.map(r => ({ x: r.pH, y: r.Wine_Quality_Score })),
      brix: sampled.map(r => ({ x: r.Brix_TSS, y: r.Wine_Quality_Score })),
      totalPhenolics: sampled.map(r => ({ x: r.Total_Phenolics_mg_L, y: r.Wine_Quality_Score })),
      titratableAcidity: sampled.map(r => ({ x: r.Titratable_Acidity_g_L, y: r.Wine_Quality_Score })),
      YAN: sampled.map(r => ({ x: r.YAN_mg_L, y: r.Wine_Quality_Score })),
      malicAcid: sampled.map(r => ({ x: r.Malic_Acid_g_L, y: r.Wine_Quality_Score })),
    };

    return {
      availability,
      totalSamples: rows.length,
      descriptive,
      qualityDistribution,
      scoreHistogram,
      grapeQualityAvg,
      featureVsQuality,
    };
  }

  // ─── 8. CORRELATION ANALYSIS ──────────────────────────────

  async getCorrelation(wineryId: string) {
    // Correlation matrix for wine quality dataset
    const rows = loadWineQualityCSV();
    const availability = buildAvailability(rows.length, 20, 'Correlation analysis');

    if (!availability.available) {
      return { availability, matrix: null };
    }

    const fields: { key: keyof WineQualityRow; label: string }[] = [
      { key: 'Brix_TSS', label: 'Brix/TSS' },
      { key: 'pH', label: 'pH' },
      { key: 'Titratable_Acidity_g_L', label: 'Acidity' },
      { key: 'Glucose_Fructose_g_L', label: 'Glucose' },
      { key: 'YAN_mg_L', label: 'YAN' },
      { key: 'Malic_Acid_g_L', label: 'Malic Acid' },
      { key: 'Tartaric_Acid_g_L', label: 'Tartaric Acid' },
      { key: 'Total_Phenolics_mg_L', label: 'Phenolics' },
      { key: 'Wine_Quality_Score', label: 'Quality' },
    ];

    const labels = fields.map(f => f.label);
    const matrix: number[][] = [];

    for (let i = 0; i < fields.length; i++) {
      const row: number[] = [];
      const xVals = rows.map(r => r[fields[i].key] as number);
      for (let j = 0; j < fields.length; j++) {
        if (i === j) {
          row.push(1);
        } else {
          const yVals = rows.map(r => r[fields[j].key] as number);
          row.push(pearsonCorrelation(xVals, yVals));
        }
      }
      matrix.push(row);
    }

    // Also provide per-winery engagement correlation if enough data
    let engagementCorrelation = null;
    const { data: wines } = await supabase
      .from('wines')
      .select('id')
      .eq('winery_id', wineryId);

    if (wines && wines.length >= 3) {
      const wineIds = wines.map((w: any) => w.id);

      const { data: inv } = await supabase
        .from('wine_inventory')
        .select('wine_id, price')
        .in('wine_id', wineIds);

      const { data: events } = await supabase
        .from('analytics_events')
        .select('wine_id, event_type')
        .eq('winery_id', wineryId)
        .not('wine_id', 'is', null);

      if (inv && inv.length > 0 && events && events.length > 0) {
        const priceMap: Record<string, number> = {};
        inv.forEach((i: any) => { priceMap[i.wine_id] = Number(i.price) || 0; });

        const viewMap: Record<string, number> = {};
        const saveMap: Record<string, number> = {};
        events.forEach((e: any) => {
          if (e.event_type === 'wine_view') viewMap[e.wine_id] = (viewMap[e.wine_id] || 0) + 1;
          if (e.event_type === 'wine_save') saveMap[e.wine_id] = (saveMap[e.wine_id] || 0) + 1;
        });

        const priced = wineIds.filter((id: string) => priceMap[id] > 0);
        if (priced.length >= 3) {
          const pArr = priced.map((id: string) => priceMap[id]);
          const vArr = priced.map((id: string) => viewMap[id] || 0);
          const sArr = priced.map((id: string) => saveMap[id] || 0);
          engagementCorrelation = {
            priceVsViews: pearsonCorrelation(pArr, vArr),
            priceVsSaves: pearsonCorrelation(pArr, sArr),
            viewsVsSaves: pearsonCorrelation(vArr, sArr),
            sampleSize: priced.length,
            note: 'Engagement correlation for this winery\'s wine catalog. Correlation does not imply causation.',
          };
        }
      }
    }

    return {
      availability,
      qualityCorrelation: {
        labels,
        matrix,
        note: 'Pearson correlation matrix computed from the wine quality grape dataset. Values range from -1 to 1.',
      },
      engagementCorrelation,
    };
  }

  // ─── EDA Insights for InsightEngine Integration ────────────

  async generateEDAInsights(wineryId: string): Promise<any[]> {
    const insights: any[] = [];

    try {
      // Check high views / low saves
      const funnel = await this.getConversionFunnel(wineryId);
      if (funnel.availability.available) {
        const viewStage = funnel.stages.find(s => s.stage === 'Wine Views');
        const saveStage = funnel.stages.find(s => s.stage === 'Wine Saves');
        if (viewStage && saveStage && viewStage.count > 20) {
          const convRate = saveStage.count / viewStage.count;
          if (convRate < 0.02) {
            insights.push({
              type: 'eda_observation',
              category: 'Engagement',
              metric: 'view_to_save_conversion',
              observation: `View-to-save conversion is ${(convRate * 100).toFixed(2)}% across ${viewStage.count} views.`,
              interpretation: 'Very low save rate may indicate that wines are being browsed but not generating sufficient interest for users to save them.',
              severity: 'medium',
              dataSufficient: true,
            });
          }
        }
      }

      // Check booking analysis for capacity insights
      const booking = await this.getBookingAnalysis(wineryId);
      if (booking.availability.available && booking.eventBreakdown.length > 0) {
        const lowCapEvents = booking.eventBreakdown.filter(e => e.capacityUtilization < 30 && e.capacity > 0);
        if (lowCapEvents.length > 0) {
          insights.push({
            type: 'eda_observation',
            category: 'Event Performance',
            metric: 'capacity_utilization',
            observation: `${lowCapEvents.length} event(s) have capacity utilization below 30%.`,
            interpretation: 'Consider reviewing event promotion strategies or adjusting capacity estimates for under-booked events.',
            severity: 'low',
            dataSufficient: true,
          });
        }
      }
    } catch {
      // Silently skip failed insights rather than breaking the API
    }

    return insights;
  }
}

export const edaService = new EDAService();
