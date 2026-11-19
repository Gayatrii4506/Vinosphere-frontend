import { supabaseAdmin as supabase } from '../../config/supabase';

/**
 * Phase 12D — Isolated Synthetic Demo Winery & Dataset
 * ====================================================
 * Dedicated synthetic demo dataset for showcasing the complete VinoSphere Analytics module.
 * Winery ID: 00000000-0000-4000-d000-000000000999
 * Prefix: 00000000-0000-4000-d000-
 */

export const DEMO_WINERY_ID = '00000000-0000-4000-d000-000000000999';
export const DEMO_WINERY_NAME = 'VinoSphere Analytics Demo Winery';
export const DEMO_WINERY_SLUG = 'vinosphere-analytics-demo-winery';

export const DEMO_WINE_A_ID = '00000000-0000-4000-d000-000000001001';
export const DEMO_WINE_B_ID = '00000000-0000-4000-d000-000000001002';

export const DEMO_EVENT_1_ID = '00000000-0000-4000-d000-000000002001';
export const DEMO_EVENT_2_ID = '00000000-0000-4000-d000-000000002002';

export const DEMO_EXPERIENCE_1_ID = '00000000-0000-4000-d000-000000003001';
export const DEMO_EXPERIENCE_2_ID = '00000000-0000-4000-d000-000000003002';

export const DEMO_USER_ID = '2eaca3d1-cdf9-46b7-ba45-91a4c6eda59c';

import { RecommendationService } from './recommendation.service';

/**
 * Safely removes ONLY demo winery records without affecting any production or other test data.
 */
export async function resetDemoDataset(): Promise<void> {
  RecommendationService.clearInMemoryStorage();
  await supabase.from('recommendations').delete().eq('winery_id', DEMO_WINERY_ID);
  await supabase.from('bookings').delete().eq('winery_id', DEMO_WINERY_ID);
  await supabase.from('corporate_leads').delete().eq('winery_id', DEMO_WINERY_ID);
  await supabase.from('events').delete().eq('winery_id', DEMO_WINERY_ID);
  await supabase.from('experiences').delete().eq('winery_id', DEMO_WINERY_ID);
  await supabase.from('analytics_events').delete().eq('winery_id', DEMO_WINERY_ID);
  await supabase.from('wines').delete().eq('winery_id', DEMO_WINERY_ID);
  await supabase.from('wineries').delete().eq('id', DEMO_WINERY_ID);
}

/**
 * Seeds the complete, realistic, isolated synthetic demo dataset.
 */
export async function seedDemoDataset(): Promise<void> {
  // First ensure clean state
  await resetDemoDataset();

  const now = new Date();
  const nowISO = now.toISOString();
  const todayStr = nowISO.split('T')[0];

  // Helper for generating dates relative to today
  const getDateStr = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const getISODate = (daysAgo: number, hourOffset: number = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(12 + hourOffset, 0, 0, 0);
    return d.toISOString();
  };

  // 1. Seed Winery
  const r1 = await supabase.from('wineries').upsert([
    {
      id: DEMO_WINERY_ID,
      name: DEMO_WINERY_NAME,
      slug: DEMO_WINERY_SLUG
    }
  ], { onConflict: 'id' });
  if (r1.error) throw new Error(`Failed to seed wineries: ${r1.error.message}`);

  // 2. Seed Wines
  const r2 = await supabase.from('wines').upsert([
    {
      id: DEMO_WINE_A_ID,
      winery_id: DEMO_WINERY_ID,
      name: 'Reserve Cabernet Sauvignon 2021',
      slug: 'reserve-cabernet-sauvignon-2021',
      wine_type: 'Red',
      grape_variety: 'Cabernet Sauvignon'
    },
    {
      id: DEMO_WINE_B_ID,
      winery_id: DEMO_WINERY_ID,
      name: 'Estate Chardonnay 2022',
      slug: 'estate-chardonnay-2022',
      wine_type: 'White',
      grape_variety: 'Chardonnay'
    }
  ], { onConflict: 'id' });
  if (r2.error) throw new Error(`Failed to seed wines: ${r2.error.message}`);

  // 3. Seed Events (2 published events with authentic event banner images)
  const r3 = await supabase.from('events').upsert([
    {
      id: DEMO_EVENT_1_ID,
      winery_id: DEMO_WINERY_ID,
      title: 'VIP Barrel Tasting Masterclass',
      event_date: getDateStr(-5), // Upcoming event
      capacity: 40,
      price: 2500,
      banner_image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
      publish_status: 'published'
    },
    {
      id: DEMO_EVENT_2_ID,
      winery_id: DEMO_WINERY_ID,
      title: 'Sunset Jazz & Pinot Evening',
      event_date: getDateStr(-10),
      capacity: 35,
      price: 1800,
      banner_image: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=1200&q=80',
      publish_status: 'published'
    }
  ], { onConflict: 'id' });
  if (r3.error) throw new Error(`Failed to seed events: ${r3.error.message}`);

  // 4. Seed Experiences (2 published experiences with authentic cover images)
  const r4 = await supabase.from('experiences').upsert([
    {
      id: DEMO_EXPERIENCE_1_ID,
      winery_id: DEMO_WINERY_ID,
      title: 'Private Winemaker Estate Tour',
      capacity: 20,
      price: 3000,
      cover_image: 'https://images.unsplash.com/photo-1543418219-44e2bf85a630?auto=format&fit=crop&w=1200&q=80',
      publish_status: 'published'
    },
    {
      id: DEMO_EXPERIENCE_2_ID,
      winery_id: DEMO_WINERY_ID,
      title: 'Cheese & Vintage Wine Pairing',
      capacity: 15,
      price: 2000,
      cover_image: 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?auto=format&fit=crop&w=1200&q=80',
      publish_status: 'published'
    }
  ], { onConflict: 'id' });
  if (r4.error) throw new Error(`Failed to seed experiences: ${r4.error.message}`);

  // 5. Seed Analytics Events (Wine engagement & winery views)
  const analyticsEvents = [];

  // Wine A: High views (25), low saves (1) in current period => view-to-save 4.0%
  for (let i = 0; i < 25; i++) {
    analyticsEvents.push({
      event_type: 'wine_view',
      winery_id: DEMO_WINERY_ID,
      wine_id: DEMO_WINE_A_ID,
      user_id: null,
      created_at: getISODate(2, i % 5),
      metadata: { demo: true }
    });
  }
  analyticsEvents.push({
    event_type: 'wine_save',
    winery_id: DEMO_WINERY_ID,
    wine_id: DEMO_WINE_A_ID,
    user_id: DEMO_USER_ID,
    created_at: getISODate(2, 0),
    metadata: { demo: true }
  });

  // Wine B: Rising interest (20 views current vs 8 views previous)
  for (let i = 0; i < 20; i++) {
    analyticsEvents.push({
      event_type: 'wine_view',
      winery_id: DEMO_WINERY_ID,
      wine_id: DEMO_WINE_B_ID,
      user_id: null,
      created_at: getISODate(3, i % 5),
      metadata: { demo: true }
    });
  }
  for (let i = 0; i < 8; i++) {
    analyticsEvents.push({
      event_type: 'wine_view',
      winery_id: DEMO_WINERY_ID,
      wine_id: DEMO_WINE_B_ID,
      user_id: null,
      created_at: getISODate(10, i % 5),
      metadata: { demo: true }
    });
  }

  // Winery Views (100 current vs 50 previous)
  for (let i = 0; i < 100; i++) {
    analyticsEvents.push({
      event_type: 'winery_view',
      winery_id: DEMO_WINERY_ID,
      created_at: getISODate(2, i % 12),
      metadata: { demo: true }
    });
  }
  for (let i = 0; i < 50; i++) {
    analyticsEvents.push({
      event_type: 'winery_view',
      winery_id: DEMO_WINERY_ID,
      created_at: getISODate(10, i % 12),
      metadata: { demo: true }
    });
  }

  const r5 = await supabase.from('analytics_events').insert(analyticsEvents);
  if (r5.error) throw new Error(`Failed to seed analytics_events: ${r5.error.message}`);

  // 6. Seed Bookings
  const bookings = [];

  // CURRENT PERIOD EVENT BOOKINGS (last 7 days - e.g. 2 days ago)
  // Event 1 (5 bookings, 3 guests each = 15 guests, ₹2500 total each = ₹12,500)
  for (let i = 0; i < 5; i++) {
    bookings.push({
      winery_id: DEMO_WINERY_ID,
      event_id: DEMO_EVENT_1_ID,
      user_id: DEMO_USER_ID,
      guests: 3,
      total_amount: 2500,
      booking_status: 'confirmed',
      payment_status: 'paid',
      booking_date: getDateStr(2),
      created_at: getISODate(2, i)
    });
  }

  // Event 2 (6 bookings, 4 guests each = 24 guests, ₹1800 total each = ₹10,800)
  for (let i = 0; i < 6; i++) {
    bookings.push({
      winery_id: DEMO_WINERY_ID,
      event_id: DEMO_EVENT_2_ID,
      user_id: DEMO_USER_ID,
      guests: 4,
      total_amount: 1800,
      booking_status: 'confirmed',
      payment_status: 'paid',
      booking_date: getDateStr(3),
      created_at: getISODate(3, i)
    });
  }

  // Uneligible / Filtered Event Bookings (1 cancelled, 1 unpaid) to demonstrate filtering
  bookings.push({
    winery_id: DEMO_WINERY_ID,
    event_id: DEMO_EVENT_2_ID,
    user_id: DEMO_USER_ID,
    guests: 2,
    total_amount: 1800,
    booking_status: 'cancelled',
    payment_status: 'refunded',
    booking_date: getDateStr(3),
    created_at: getISODate(3, 7)
  });
  bookings.push({
    winery_id: DEMO_WINERY_ID,
    event_id: DEMO_EVENT_2_ID,
    user_id: DEMO_USER_ID,
    guests: 2,
    total_amount: 1800,
    booking_status: 'pending',
    payment_status: 'pending',
    booking_date: getDateStr(3),
    created_at: getISODate(3, 8)
  });

  // PREVIOUS PERIOD EVENT BOOKINGS (days 8-14 - e.g. 10 days ago)
  // 5 bookings (3 guests each = 15 guests, ₹2200 each = ₹11,000 GBV)
  for (let i = 0; i < 5; i++) {
    bookings.push({
      winery_id: DEMO_WINERY_ID,
      event_id: DEMO_EVENT_1_ID,
      user_id: DEMO_USER_ID,
      guests: 3,
      total_amount: 2200,
      booking_status: 'confirmed',
      payment_status: 'paid',
      booking_date: getDateStr(10),
      created_at: getISODate(10, i)
    });
  }

  // CURRENT PERIOD EXPERIENCE BOOKINGS (last 7 days - e.g. 2 days ago)
  // Experience 1 (5 bookings, 3 guests each = 15 guests, ₹3000 total each = ₹15,000)
  for (let i = 0; i < 5; i++) {
    bookings.push({
      winery_id: DEMO_WINERY_ID,
      experience_id: DEMO_EXPERIENCE_1_ID,
      user_id: DEMO_USER_ID,
      guests: 3,
      total_amount: 3000,
      booking_status: 'confirmed',
      payment_status: 'paid',
      booking_date: getDateStr(2),
      created_at: getISODate(2, i)
    });
  }

  // Experience 2 (4 bookings, 2 guests each = 8 guests, ₹2000 total each = ₹8,000)
  for (let i = 0; i < 4; i++) {
    bookings.push({
      winery_id: DEMO_WINERY_ID,
      experience_id: DEMO_EXPERIENCE_2_ID,
      user_id: DEMO_USER_ID,
      guests: 2,
      total_amount: 2000,
      booking_status: 'confirmed',
      payment_status: 'paid',
      booking_date: getDateStr(3),
      created_at: getISODate(3, i)
    });
  }

  // PREVIOUS PERIOD EXPERIENCE BOOKINGS (days 8-14 - e.g. 10 days ago)
  // 4 bookings (2 guests each = 8 guests, ₹2250 total each = ₹9,000 GBV)
  for (let i = 0; i < 4; i++) {
    bookings.push({
      winery_id: DEMO_WINERY_ID,
      experience_id: DEMO_EXPERIENCE_1_ID,
      user_id: DEMO_USER_ID,
      guests: 2,
      total_amount: 2250,
      booking_status: 'confirmed',
      payment_status: 'paid',
      booking_date: getDateStr(10),
      created_at: getISODate(10, i)
    });
  }

  const r6 = await supabase.from('bookings').insert(bookings);
  if (r6.error) throw new Error(`Failed to seed bookings: ${r6.error.message}`);

  // 7. Seed Corporate Leads
  const r7 = await supabase.from('corporate_leads').insert([
    {
      winery_id: DEMO_WINERY_ID,
      company_name: 'Tech Global Corp',
      status: 'pending',
      expected_guests: 50,
      created_at: getISODate(2, 1)
    },
    {
      winery_id: DEMO_WINERY_ID,
      company_name: 'Apex Financial Holdings',
      status: 'approved',
      expected_guests: 35,
      created_at: getISODate(3, 2)
    },
    {
      winery_id: DEMO_WINERY_ID,
      company_name: 'Horizon Creative Partners',
      status: 'approved',
      expected_guests: 75,
      created_at: getISODate(4, 3)
    },
    {
      winery_id: DEMO_WINERY_ID,
      company_name: 'Summit Law Group',
      status: 'rejected',
      expected_guests: 20,
      created_at: getISODate(5, 4)
    }
  ]);
  if (r7.error) throw new Error(`Failed to seed corporate_leads: ${r7.error.message}`);
}