import { supabaseAdmin as supabase } from '../src/config/supabase';

export const SULA_WINERY_ID = '11111111-1111-1111-1111-111111111111';
export const DEMO_WINERY_ID = '00000000-0000-4000-d000-000000000999';
export const SULA_EMAIL = 'info@sulawines.com';

export async function seedSulaDataset(): Promise<void> {
  console.log(`Starting analytics dataset seed for Sula Vineyards (${SULA_EMAIL})...`);

  // Gather all potential winery IDs to seed (Sula ID, Demo ID, and any existing DB ID for info@sulawines.com)
  const targetWineryIds = new Set<string>([SULA_WINERY_ID, DEMO_WINERY_ID]);

  try {
    const { data: existingWineries } = await supabase
      .from('wineries')
      .select('id, email, name')
      .or(`email.eq.${SULA_EMAIL},id.eq.${SULA_WINERY_ID}`);

    if (existingWineries && existingWineries.length > 0) {
      existingWineries.forEach(w => targetWineryIds.add(w.id));
      console.log(`Found existing Sula winery records with IDs:`, Array.from(targetWineryIds));
    }
  } catch (err: any) {
    console.warn('Query existing wineries notice:', err?.message || err);
  }

  const now = new Date();
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

  for (const wineryId of Array.from(targetWineryIds)) {
    console.log(`Seeding data for Winery ID: ${wineryId}...`);

    // Unique slug per winery ID if multiple exist
    const winerySlug = wineryId === SULA_WINERY_ID ? 'sula-vineyards' : `sula-vineyards-${wineryId.slice(0, 8)}`;

    // 1. Upsert Winery Record
    const { error: wErr } = await supabase.from('wineries').upsert([
      {
        id: wineryId,
        name: 'Sula Vineyards',
        slug: winerySlug,
        email: SULA_EMAIL,
        description: "India's premier estate winery located in the sun-drenched hills of Nashik Valley.",
        city: 'Nashik',
        state: 'Maharashtra',
        country: 'India',
        status: 'published',
        verified: true
      }
    ], { onConflict: 'id' });
    if (wErr) console.warn(`Winery ${wineryId} notice:`, wErr.message);

    // 2. Ensure User Linked to Winery
    let sulaUserId: string | null = null;
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', SULA_EMAIL)
        .maybeSingle();

      if (!existingUser) {
        const { data: newUser, error: nuErr } = await supabase.from('users').insert([{
          email: SULA_EMAIL,
          full_name: 'Sula Estate Manager',
          role: 'winery_admin',
          winery_id: wineryId,
          city: 'Nashik',
          state: 'Maharashtra',
          country: 'India'
        }]).select('id').single();
        if (newUser) sulaUserId = newUser.id;
        if (nuErr) console.warn('New user notice:', nuErr.message);
      } else {
        sulaUserId = existingUser.id;
        await supabase.from('users').update({ winery_id: wineryId }).eq('id', existingUser.id);
      }
    } catch (uErr: any) {
      console.warn('User table setup notice:', uErr?.message || uErr);
    }

    // Prefix for entities to avoid primary key collisions across wineries
    const prefix = wineryId.slice(0, 8);

    // 3. Seed Wines (Matches schema: id, winery_id, name, slug, wine_type, grape_variety, vintage, description)
    const sulaWines = [
      {
        id: `${prefix}-1111-4000-a000-000000000001`,
        winery_id: wineryId,
        name: 'Rasa Cabernet Sauvignon 2021',
        slug: `rasa-cabernet-sauvignon-2021-${prefix}`,
        wine_type: 'Red',
        grape_variety: 'Cabernet Sauvignon',
        vintage: 2021,
        description: 'Hand-picked from our finest vineyard blocks in Dindori. Aged for 14 months in French oak barrels.'
      },
      {
        id: `${prefix}-1111-4000-a000-000000000002`,
        winery_id: wineryId,
        name: 'Dindori Reserve Shiraz 2022',
        slug: `dindori-reserve-shiraz-2022-${prefix}`,
        wine_type: 'Red',
        grape_variety: 'Shiraz',
        vintage: 2022,
        description: 'Full-bodied red wine bursting with lush aromas of dark berries, cocoa, and subtle pepper notes.'
      },
      {
        id: `${prefix}-1111-4000-a000-000000000003`,
        winery_id: wineryId,
        name: 'Tropical Sec Sparkling Wine',
        slug: `tropical-sec-sparkling-${prefix}`,
        wine_type: 'Sparkling',
        grape_variety: 'Chenin Blanc, Riesling',
        vintage: 2023,
        description: 'Vibrant sparkling wine with fine bubbles and tropical fruit aromas of passion fruit and mango.'
      },
      {
        id: `${prefix}-1111-4000-a000-000000000004`,
        winery_id: wineryId,
        name: 'Zinfandel Rosé 2023',
        slug: `zinfandel-rose-2023-${prefix}`,
        wine_type: 'Rose',
        grape_variety: 'Zinfandel',
        vintage: 2023,
        description: 'Refreshing and light-bodied rosé filled with strawberry and citrus notes.'
      }
    ];

    const { error: wineErr } = await supabase.from('wines').upsert(sulaWines, { onConflict: 'id' });
    if (wineErr) console.warn('Wines notice:', wineErr.message);

    // 4. Seed Events
    const sulaEvents = [
      {
        id: `${prefix}-1111-4000-b000-000000000001`,
        winery_id: wineryId,
        title: 'SulaFest 2026 - Gourmet & Music Festival',
        event_date: getDateStr(-15),
        capacity: 500,
        price: 3500,
        publish_status: 'published',
        description: 'India\'s premier vineyard music and gourmet food festival at the Sula Amphitheatre.'
      },
      {
        id: `${prefix}-1111-4000-b000-000000000002`,
        winery_id: wineryId,
        title: 'Annual Grape Harvest & Stomping Celebration',
        event_date: getDateStr(-7),
        capacity: 120,
        price: 2200,
        publish_status: 'published',
        description: 'Join our winemakers in traditional grape stomping, harvest tours, and outdoor live acoustic sessions.'
      },
      {
        id: `${prefix}-1111-4000-b000-000000000003`,
        winery_id: wineryId,
        title: 'Sunset Acoustic & Pinot Lounge',
        event_date: getDateStr(5),
        capacity: 80,
        price: 1800,
        publish_status: 'published',
        description: 'Retrospective sunset lounge overlooking Gangapur Dam with live saxophone performance.'
      }
    ];

    const { error: evtErr } = await supabase.from('events').upsert(sulaEvents, { onConflict: 'id' });
    if (evtErr) console.warn('Events notice:', evtErr.message);

    // 5. Seed Experiences
    const sulaExperiences = [
      {
        id: `${prefix}-1111-4000-c000-000000000001`,
        winery_id: wineryId,
        title: 'Sula Vineyard Walk & Cellar Masterclass',
        capacity: 25,
        price: 1500,
        publish_status: 'published',
        description: 'Guided walk across our estate vines followed by barrel cellar tasting and winemaker Q&A.'
      },
      {
        id: `${prefix}-1111-4000-c000-000000000002`,
        winery_id: wineryId,
        title: 'VIP Winemaker Barrel Tasting & Cheese Pairing',
        capacity: 15,
        price: 3000,
        publish_status: 'published',
        description: 'Exclusive private cellar tour with vintage reserve barrel samples paired with artisanal cheeses.'
      }
    ];

    const { error: expErr } = await supabase.from('experiences').upsert(sulaExperiences, { onConflict: 'id' });
    if (expErr) console.warn('Experiences notice:', expErr.message);

    // 6. Seed Analytics Events
    const analyticsEvents: any[] = [];
    for (let i = 0; i < 120; i++) {
      analyticsEvents.push({
        event_type: 'winery_view',
        winery_id: wineryId,
        created_at: getISODate(2, i % 12),
        metadata: { sula: true }
      });
    }
    for (let i = 0; i < 65; i++) {
      analyticsEvents.push({
        event_type: 'winery_view',
        winery_id: wineryId,
        created_at: getISODate(10, i % 12),
        metadata: { sula: true }
      });
    }
    for (let i = 0; i < 35; i++) {
      analyticsEvents.push({
        event_type: 'wine_view',
        winery_id: wineryId,
        wine_id: sulaWines[0].id,
        created_at: getISODate(3, i % 6),
        metadata: { sula: true }
      });
    }
    for (let i = 0; i < 28; i++) {
      analyticsEvents.push({
        event_type: 'wine_view',
        winery_id: wineryId,
        wine_id: sulaWines[1].id,
        created_at: getISODate(4, i % 6),
        metadata: { sula: true }
      });
    }
    for (let i = 0; i < 5; i++) {
      analyticsEvents.push({
        event_type: 'wine_save',
        winery_id: wineryId,
        wine_id: sulaWines[0].id,
        created_at: getISODate(2, i),
        metadata: { sula: true }
      });
    }

    const { error: aeErr } = await supabase.from('analytics_events').insert(analyticsEvents);
    if (aeErr) console.warn('Analytics events notice:', aeErr.message);

    // 7. Seed Bookings (Requires user_id)
    const bookings: any[] = [];
    if (sulaUserId) {
      for (let i = 0; i < 8; i++) {
        bookings.push({
          user_id: sulaUserId,
          winery_id: wineryId,
          event_id: sulaEvents[0].id,
          guests: 3,
          total_amount: 3500 * 3,
          booking_status: 'confirmed',
          payment_status: 'paid',
          booking_date: getDateStr(2),
          created_at: getISODate(2, i)
        });
      }
      for (let i = 0; i < 6; i++) {
        bookings.push({
          user_id: sulaUserId,
          winery_id: wineryId,
          event_id: sulaEvents[1].id,
          guests: 2,
          total_amount: 2200 * 2,
          booking_status: 'confirmed',
          payment_status: 'paid',
          booking_date: getDateStr(3),
          created_at: getISODate(3, i)
        });
      }
      for (let i = 0; i < 5; i++) {
        bookings.push({
          user_id: sulaUserId,
          winery_id: wineryId,
          event_id: sulaEvents[2].id,
          guests: 4,
          total_amount: 1800 * 4,
          booking_status: 'confirmed',
          payment_status: 'paid',
          booking_date: getDateStr(10),
          created_at: getISODate(10, i)
        });
      }
      for (let i = 0; i < 7; i++) {
        bookings.push({
          user_id: sulaUserId,
          winery_id: wineryId,
          experience_id: sulaExperiences[0].id,
          guests: 2,
          total_amount: 1500 * 2,
          booking_status: 'confirmed',
          payment_status: 'paid',
          booking_date: getDateStr(1),
          created_at: getISODate(1, i)
        });
      }
      for (let i = 0; i < 5; i++) {
        bookings.push({
          user_id: sulaUserId,
          winery_id: wineryId,
          experience_id: sulaExperiences[1].id,
          guests: 2,
          total_amount: 3000 * 2,
          booking_status: 'confirmed',
          payment_status: 'paid',
          booking_date: getDateStr(4),
          created_at: getISODate(4, i)
        });
      }

      const { error: bkErr } = await supabase.from('bookings').insert(bookings);
      if (bkErr) console.warn('Bookings notice:', bkErr.message);
    } else {
      console.warn('Skipping bookings seed: No valid user_id found');
    }

    // 8. Seed Corporate Leads
    const corporateLeads = [
      {
        winery_id: wineryId,
        company_name: 'Mahindra & Mahindra Executive Retreat',
        contact_person: 'Anand V.',
        email: 'retreats@mahindra.com',
        status: 'pending',
        expected_guests: 60,
        created_at: getISODate(2, 1)
      },
      {
        winery_id: wineryId,
        company_name: 'Tata Consultancy Services Leadership Summit',
        contact_person: 'Rajesh G.',
        email: 'events@tcs.com',
        status: 'approved',
        expected_guests: 100,
        created_at: getISODate(3, 2)
      },
      {
        winery_id: wineryId,
        company_name: 'Deloitte India Partner Celebration',
        contact_person: 'Priya M.',
        email: 'deloitte.events@deloitte.com',
        status: 'approved',
        expected_guests: 45,
        created_at: getISODate(4, 3)
      },
      {
        winery_id: wineryId,
        company_name: 'HDFC Bank Regional Directors Gathering',
        contact_person: 'Suresh K.',
        email: 'directors@hdfc.com',
        status: 'rejected',
        expected_guests: 30,
        created_at: getISODate(5, 4)
      }
    ];

    const { error: clErr } = await supabase.from('corporate_leads').insert(corporateLeads);
    if (clErr) console.warn('Corporate leads notice:', clErr.message);
  }

  console.log(`✅ Successfully seeded analytics & estate dataset for Sula Vineyards across all demo and live winery IDs!`);
}

// Execute if run directly
if (require.main === module) {
  seedSulaDataset()
    .then(() => process.exit(0))
    .catch((err: any) => {
      console.error('Error seeding Sula dataset:', err);
      process.exit(1);
    });
}
