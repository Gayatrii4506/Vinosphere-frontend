import { supabase } from './supabaseClient';

const BASE_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1';
const API_URL = `${BASE_API_URL}/dashboard`;
const AUTH_URL = `${BASE_API_URL}/auth`;

const SULA_WINERY_ID = 'b40a83dd-ee61-43df-bf79-caf3b2a190de';
const DEMO_GODAVARI_ID = '00000000-0000-4000-d000-000000000999';

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('vinosphere_winery_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

/**
 * Direct Supabase fallback to fetch comprehensive winery dashboard overview
 * when the Express backend is not running.
 */
export async function fetchDashboardOverviewFromSupabase(wineryId: string) {
  try {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let effectiveWineryId = wineryId;

    if (
      wineryId === '11111111-1111-1111-1111-111111111111' ||
      wineryId === 'winery_1' ||
      wineryId === 'w1' ||
      wineryId === 'sula-vineyards'
    ) {
      effectiveWineryId = SULA_WINERY_ID;
    } else if (wineryId === 'w2' || wineryId === 'york-winery') {
      effectiveWineryId = '4fcb0319-c7b9-4eb6-84be-00717adeab3a';
    } else if (wineryId === 'godavari-hills-estate' || wineryId === DEMO_GODAVARI_ID) {
      effectiveWineryId = DEMO_GODAVARI_ID;
    }

    // 1. Fetch winery record
    let winery: any = null;
    if (UUID_REGEX.test(wineryId)) {
      const { data } = await supabase.from('wineries').select('*').eq('id', wineryId).maybeSingle();
      winery = data;
    }
    if (!winery && UUID_REGEX.test(effectiveWineryId)) {
      const { data } = await supabase.from('wineries').select('*').eq('id', effectiveWineryId).maybeSingle();
      winery = data;
    }
    if (!winery) {
      const { data } = await supabase.from('wineries').select('*').ilike('slug', `%${wineryId}%`).maybeSingle();
      winery = data;
    }
    if (!winery) {
      // Default fallback to Sula Vineyards which has full seed data
      const { data } = await supabase.from('wineries').select('*').eq('id', SULA_WINERY_ID).maybeSingle();
      winery = data;
    }

    const targetId = winery?.id || effectiveWineryId || SULA_WINERY_ID;

    // 2. Concurrently fetch all related data
    const [rawWinesRes, expRes, eventRes, bookingRes, leadsRes, revRes, docRes, invRes, imgRes] = await Promise.all([
      supabase.from('wines').select('*').eq('winery_id', targetId),
      supabase.from('experiences').select('*').eq('winery_id', targetId),
      supabase.from('events').select('*').eq('winery_id', targetId),
      supabase.from('bookings').select('*').eq('winery_id', targetId),
      supabase.from('corporate_leads').select('*').eq('winery_id', targetId),
      supabase.from('reviews').select('*').eq('winery_id', targetId),
      supabase.from('documents').select('*').eq('winery_id', targetId),
      supabase.from('wine_inventory').select('*'),
      supabase.from('wine_images').select('*'),
    ]);

    const rawWines = rawWinesRes.data || [];
    const inventories = invRes.data || [];
    const images = imgRes.data || [];

    // Map inventory price/stock and images to wines
    const wines = rawWines.map((wine: any) => {
      const inventory = inventories.find((inv: any) => inv.wine_id === wine.id);
      const wineImgs = images.filter((img: any) => img.wine_id === wine.id);
      const primaryImg = wineImgs.find((img: any) => img.is_primary) || wineImgs[0];

      return {
        ...wine,
        price: inventory?.price ?? (wine.price || 1500),
        stock_quantity: inventory?.stock_quantity ?? 100,
        image_url: primaryImg?.image_url ?? wine.image_url,
      };
    });

    return {
      winery,
      wines,
      experiences: expRes.data || [],
      events: eventRes.data || [],
      bookings: bookingRes.data || [],
      leads: leadsRes.data || [],
      reviews: revRes.data || [],
      documents: docRes.data || [],
    };
  } catch (err) {
    console.warn('[fetchDashboardOverviewFromSupabase] Error:', err);
    return null;
  }
}

/**
 * Onboards and registers a new winery estate
 */
export async function registerWinery(regData: any) {
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 2000) : null;
    const res = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(regData),
      signal: controller?.signal
    });
    if (timeoutId) clearTimeout(timeoutId);

    const body = await res.json();
    if (res.ok) {
      return body.data;
    }
  } catch (error: any) {
    // Fall back to Supabase direct insert
  }

  try {
    const { data, error } = await supabase.from('wineries').insert([{
      name: regData.wineryName || regData.name,
      slug: (regData.wineryName || regData.name || 'winery').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      email: regData.email,
      phone: regData.phone,
      city: regData.location || 'Nashik',
      description: regData.story || regData.tagline,
      verified: true,
      status: 'published'
    }]).select().single();
    if (error) throw error;
    return { winery: data, token: `demo-token-${data.id}` };
  } catch (err) {
    console.error('Error in registerWinery:', err);
    throw err;
  }
}

/**
 * Authenticates winery estate owner / manager
 */
export async function loginWinery(email: string, password?: string) {
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 2000) : null;
    const res = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      signal: controller?.signal
    });
    if (timeoutId) clearTimeout(timeoutId);

    if (res.ok) {
      const body = await res.json();
      return body.data;
    }
  } catch (error: any) {
    // Backend API unreachable, fall back to direct Supabase lookup
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const prefix = cleanEmail.split('@')[0];
    const { data: winery } = await supabase
      .from('wineries')
      .select('*')
      .or(`email.ilike.${cleanEmail},name.ilike.%${prefix}%,slug.ilike.%${prefix}%`)
      .limit(1)
      .maybeSingle();

    if (winery) {
      return {
        winery,
        token: `demo-token-${winery.id}`
      };
    }
  } catch (err) {
    console.warn('[loginWinery] Supabase fallback error:', err);
  }

  throw new Error('Invalid credentials. Winery not found.');
}

/**
 * Maps the PostgreSQL database objects to the frontend state format
 * so we don't have to rewrite all 4,000 lines of UI code immediately,
 * while still using real database data.
 */

export async function fetchDashboardOverview(wineryId: string) {
  // First attempt: try Express Backend API with a fast 1500ms timeout
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 1500) : null;

    const res = await fetch(`${API_URL}/${wineryId}/overview`, {
      headers: getAuthHeaders(),
      signal: controller?.signal
    });
    if (timeoutId) clearTimeout(timeoutId);

    if (res.ok) {
      const { data } = await res.json();
      if (data && (data.winery || (data.wines && data.wines.length > 0))) {
        return data;
      }
    }
  } catch (error) {
    // Express backend is not running or unreachable; fall back seamlessly to direct Supabase
  }

  // Graceful fallback to Supabase PostgreSQL direct queries
  return await fetchDashboardOverviewFromSupabase(wineryId);
}

/**
 * Creates a new wine in the database
 */
export async function addWineToDatabase(wineryId: string, wineData: any) {
  try {
    const res = await fetch(`${API_URL}/${wineryId}/wines`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(wineData)
    });
    
    if (!res.ok) {
      throw new Error('Failed to add wine');
    }
    
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error('Error adding wine:', error);
    return null;
  }
}

/**
 * Updates an existing wine's details in the database
 */
export async function updateWineInDatabase(wineryId: string, wineId: string, wineData: any) {
  try {
    const res = await fetch(`${API_URL}/${wineryId}/wines/${wineId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(wineData)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update wine');
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error('Error updating wine:', error);
    throw error;
  }
}

/**
 * Deletes a wine from the database
 */
export async function deleteWineFromDatabase(wineryId: string, wineId: string) {
  try {
    const res = await fetch(`${API_URL}/${wineryId}/wines/${wineId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete wine');
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error('Error deleting wine:', error);
    throw error;
  }
}

/**
 * Creates a new experience in the database
 */
export async function addExperienceToDatabase(wineryId: string, experienceData: any) {
  try {
    const res = await fetch(`${API_URL}/${wineryId}/experiences`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(experienceData)
    });
    
    if (!res.ok) {
      throw new Error('Failed to add experience');
    }
    
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error('Error adding experience:', error);
    return null;
  }
}

/**
 * Creates a new event in the database
 */
export async function addEventToDatabase(wineryId: string, eventData: any) {
  try {
    const res = await fetch(`${API_URL}/${wineryId}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData)
    });
    
    if (!res.ok) {
      throw new Error('Failed to add event');
    }
    
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error('Error adding event:', error);
    return null;
  }
}

/**
 * Example mapping function for wines
 */
/**
 * Resolves authentic, high-resolution transparent wine bottle images
 * matching wine varietals and types, replacing landscape generic photos.
 */
export function resolveWineBottleImage(wine: any): string {
  const existing = wine?.image_url || wine?.imageUrl || wine?.image;
  // If existing is already a valid image and not one of the broken/unwanted generic landscape photos:
  if (
    existing &&
    typeof existing === 'string' &&
    existing.trim() !== '' &&
    !existing.includes('photo-1510812431401-41d2bd2722f3') && // landscape cheering glasses
    !existing.includes('photo-1594261899853-27e6c210ab6e') && // broken Unsplash sparkling link
    !existing.includes('photo-1568213816046-0ee1c42bd559') && // landscape white glass
    !existing.includes('photo-1553122180-2c700cb75571') && // landscape rose glass
    !existing.includes('photo-1614742468798-e7c65d642398')    // landscape dessert glass
  ) {
    return existing;
  }

  const name = String(wine?.name || '').toLowerCase();
  const grape = String(wine?.grape_variety || (Array.isArray(wine?.grapeVariety) ? wine.grapeVariety.join(' ') : (wine?.grapeVariety || ''))).toLowerCase();
  const type = String(wine?.wine_type || wine?.type || wine?.category || '').toLowerCase();

  // 1. Specific signature wine bottle matches
  if (name.includes('rasa cabernet') || (name.includes('cabernet') && !type.includes('white')) || (grape.includes('cabernet') && !type.includes('white'))) {
    return 'https://res.cloudinary.com/xfklkvdc/image/upload/v1787505421/7a34cefe-0fde-47ee-b4fa-0351d0565493.png';
  }
  if (name.includes('dindori') || name.includes('shiraz') || grape.includes('shiraz') || grape.includes('syrah')) {
    return 'https://res.cloudinary.com/xfklkvdc/image/upload/v1787466141/0cd29da9-8a93-42aa-9479-74238d0277e2.png';
  }
  if (name.includes('tropical sec') || name.includes('sparkling') || name.includes('brut') || type.includes('sparkling') || type.includes('champagne')) {
    return 'https://res.cloudinary.com/xfklkvdc/image/upload/v1787559573/806ea689-6b3a-4a26-9a0a-a56fd357de34.png';
  }
  if (name.includes('sauvignon') || grape.includes('sauvignon')) {
    return 'https://res.cloudinary.com/xfklkvdc/image/upload/v1787420071/fc25ab84-2606-40db-864b-ccea4a9d7ebf.png';
  }
  if (name.includes('chenin') || grape.includes('chenin')) {
    return 'https://res.cloudinary.com/xfklkvdc/image/upload/v1787477823/661a369f-c93e-4d70-9eb2-adb7a8819b5e.png';
  }
  if (name.includes('zinfandel') || name.includes('rosé') || name.includes('rose') || type.includes('rose') || type.includes('rosé')) {
    return 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784485224/86f83964-a90e-43ad-84f7-bad5cb60e12f_jzc8yi.png';
  }
  if (name.includes('dessert') || name.includes('late harvest') || type.includes('dessert')) {
    return 'https://res.cloudinary.com/xfklkvdc/image/upload/v1787480433/688635e8-76f7-4149-9e6d-2bdd0a7d6e09.png';
  }
  if (name.includes('viognier') || name.includes('chardonnay') || name.includes('riesling')) {
    return 'https://res.cloudinary.com/xfklkvdc/image/upload/v1787477674/5ec770ff-e6af-42a8-970e-b04a1ae99a95.png';
  }

  // 2. High-res bottle fallbacks by category/type
  if (type.includes('white')) {
    return 'https://res.cloudinary.com/xfklkvdc/image/upload/v1787420071/fc25ab84-2606-40db-864b-ccea4a9d7ebf.png';
  }
  if (type.includes('sparkling')) {
    return 'https://res.cloudinary.com/xfklkvdc/image/upload/v1787559573/806ea689-6b3a-4a26-9a0a-a56fd357de34.png';
  }
  if (type.includes('rose') || type.includes('rosé')) {
    return 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784485224/86f83964-a90e-43ad-84f7-bad5cb60e12f_jzc8yi.png';
  }
  if (type.includes('dessert')) {
    return 'https://res.cloudinary.com/xfklkvdc/image/upload/v1787480433/688635e8-76f7-4149-9e6d-2bdd0a7d6e09.png';
  }

  // Default Red Wine bottle
  return 'https://res.cloudinary.com/xfklkvdc/image/upload/v1787505421/7a34cefe-0fde-47ee-b4fa-0351d0565493.png';
}

export function mapWinesToFrontend(dbWines: any[]) {
  if (!dbWines) return [];
  return dbWines.map(wine => {
    const wineType = wine.wine_type || 'Red';
    const displayImage = resolveWineBottleImage({ ...wine, wine_type: wineType });

    return {
      id: wine.id,
      wineryId: wine.winery_id,
      name: wine.name,
      type: wineType,
      category: wineType,
      grapeVariety: wine.grape_variety ? wine.grape_variety.split(',') : [],
      vintage: wine.vintage,
      alcoholContent: wine.alcohol_percentage ? `${wine.alcohol_percentage}%` : '',
      servingTemp: wine.serving_temperature,
      description: wine.description,
      status: wine.status || 'Published',
      views: Math.floor(Math.random() * 5000),
      image: displayImage,
      price: wine.price || 1500,
      stock: (wine.stock_quantity !== undefined && wine.stock_quantity <= 0) ? 'Out of Stock' : ((wine.stock_quantity !== undefined && wine.stock_quantity < 20) ? 'Limited' : 'In Stock'),
      stockQuantity: wine.stock_quantity !== undefined ? wine.stock_quantity : 100,
      awards: wine.awards || [],
      rating: wine.rating || 4.7,
      foodPairings: wine.food_pairings ? (wine.food_pairings.startsWith('[') ? JSON.parse(wine.food_pairings) : wine.food_pairings.split(',')) : ['Cheese', 'Charcuterie'],
      tasteProfile: wine.taste_profile ? wine.taste_profile.split(',') : [wine.body, wine.sweetness].filter(Boolean),
      tasteNotes: wine.taste_notes || '',
      body: wine.body || 'Medium',
      sweetness: wine.sweetness || 'Dry',
      acidity: wine.acidity || 'Medium',
      tannin: wine.tannin || 'Medium',
    };
  });
}

/**
 * Dynamic Image Resolvers for Experiences & Events
 */
export function resolveExperienceImage(exp: any): string {
  const existing = exp?.image_url || exp?.cover_image || exp?.imageUrl || exp?.image;
  if (existing && typeof existing === 'string' && existing.trim() !== '') {
    return existing;
  }
  const title = (exp?.name || exp?.title || '').toLowerCase();
  const category = (exp?.experience_type || exp?.category || '').toLowerCase();
  const combo = `${title} ${category}`;

  if (combo.includes('vip') || combo.includes('barrel') || combo.includes('cheese')) {
    return 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=800&auto=format&fit=crop&q=80';
  }
  if (combo.includes('masterclass') || combo.includes('cellar')) {
    return 'https://images.unsplash.com/photo-1528823872057-9c018a7a70b3?w=800&auto=format&fit=crop&q=80';
  }
  if (combo.includes('walk') || combo.includes('tour') || combo.includes('vineyard')) {
    return 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop&q=80';
  }
  if (combo.includes('sunset') || combo.includes('tasting')) {
    return 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1543418219-44e2bf85a630?w=800&auto=format&fit=crop&q=80';
}

export function resolveEventImage(evt: any): string {
  const existing = evt?.banner_image || evt?.image_url || evt?.coverImage || evt?.image;
  if (existing && typeof existing === 'string' && existing.trim() !== '') {
    return existing;
  }
  const title = (evt?.title || evt?.name || '').toLowerCase();
  const type = (evt?.event_type || evt?.type || '').toLowerCase();
  const combo = `${title} ${type}`;

  if (combo.includes('harvest') || combo.includes('grape')) {
    return 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop&q=80';
  }
  if (combo.includes('sunset') || combo.includes('concert') || combo.includes('music')) {
    return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80';
  }
  if (combo.includes('dinner') || combo.includes('gala') || combo.includes('pairing')) {
    return 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80';
}

/**
 * Map Experiences / Estate Journeys
 */
export function mapExperiencesToFrontend(dbExp: any[]) {
  if (!dbExp) return [];
  return dbExp.map(exp => {
    const recap = exp.host_info?.recap || {};
    const schedule = exp.host_info?.schedule || {};
    const booking = exp.host_info?.booking || {};
    const location = exp.host_info?.location || {};
    
    let status = exp.experience_status || recap.status;
    if (!status) {
      if (exp.tags && exp.tags.includes('Status:past')) status = 'past';
      else if (exp.tags && exp.tags.includes('Status:upcoming')) status = 'upcoming';
      else status = 'active';
    }

    const displayImage = resolveExperienceImage(exp);

    return {
      id: exp.id,
      name: exp.name || exp.title || 'Estate Journey',
      shortDescription: exp.short_description || exp.host_info?.short_description || '',
      description: exp.description,
      duration: exp.duration_minutes ? `${exp.duration_minutes} Mins` : (exp.duration || '90 Mins'),
      capacity: exp.max_capacity || exp.capacity || 15,
      price: exp.price_per_person || exp.price || 2000,
      status: status === 'past' ? 'Concluded' : (status === 'upcoming' ? 'Coming Soon' : 'Published'),
      experienceStatus: status, // 'active' | 'upcoming' | 'past'
      wineryId: exp.winery_id,
      wineryName: 'VinoSphere Estates',
      winerySlug: 'vinosphere-estates',
      category: exp.experience_type || 'Wine Tasting',
      image: displayImage,
      imageUrl: displayImage,
      image_url: displayImage,
      cover_image: displayImage,
      galleryImages: exp.gallery_images || exp.host_info?.gallery_images || [displayImage],
      maxGuests: exp.max_capacity || exp.capacity || 15,
      availableSeats: exp.max_capacity || exp.capacity || 15,
      priceUnit: 'per person',
      rating: exp.rating ?? recap.rating ?? (status === 'past' ? 4.95 : 4.8),
      reviewCount: Array.isArray(exp.reviews) ? exp.reviews.length : (Array.isArray(recap.reviews) ? recap.reviews.length : 15),
      turnoutCount: exp.turnout_count ?? recap.turnoutCount ?? (status === 'past' ? 120 : null),
      reviews: exp.reviews || recap.reviews || [],
      recapNotes: exp.recap_notes || recap.notes || '',
      editionDate: exp.edition_date || recap.edition_date || null,
      includes: exp.inclusions && exp.inclusions.length > 0 ? exp.inclusions : ['Winery Tour', 'Premium Tastings', 'Souvenir Glass'],
      highlights: exp.highlights && exp.highlights.length > 0 ? exp.highlights : ['Scenic Views', 'Private Cellar Access'],
      exclusions: exp.exclusions || exp.host_info?.exclusions || [],
      startDate: exp.start_date || schedule.start_date || null,
      endDate: exp.end_date || schedule.end_date || null,
      availableDays: exp.available_days || schedule.available_days || [],
      timeSlots: exp.time_slots || schedule.time_slots || [],
      maxGuestsPerSlot: exp.max_guests_per_slot || schedule.max_guests_per_slot || (exp.max_capacity || exp.capacity || 15),
      bookingStatus: exp.booking_status || booking.booking_status || (status === 'upcoming' ? 'Coming Soon' : 'Open for Booking'),
      cancellationPolicy: exp.cancellation_policy || booking.cancellation_policy || '',
      minAge: exp.min_age || booking.min_age || '18+',
      meetingPoint: exp.meeting_point || location.meeting_point || '',
      arrivalInstructions: exp.arrival_instructions || location.arrival_instructions || '',
      parkingAvailable: exp.parking_available ?? location.parking_available ?? true,
      schedule: schedule.time_slots?.length > 0 ? schedule.time_slots.join(', ') : 'Daily at 11:00 AM, 3:00 PM',
      isPopular: true,
      isFeatured: false,
      languages: ['English', 'Hindi'],
      location: 'Nashik Valley, India',
      tags: exp.tags || ['Tasting', 'Tour', 'Artisanal'],
      hostInfo: exp.host_info || {},
      featuredVintages: exp.featured_vintages || exp.host_info?.featured_vintages || []
    };
  });
}

/**
 * Map Events
 */
export function mapEventsToFrontend(dbEvents: any[]) {
  if (!dbEvents) return [];
  return dbEvents.map(evt => {
    const recap = evt.host_info?.recap || {};
    const todayStr = new Date().toISOString().split('T')[0];
    const eventDate = evt.event_date || evt.start_date || evt.date || todayStr;
    let status = evt.event_status || recap.status;
    if (!status) {
      if (eventDate === todayStr) status = 'ongoing';
      else if (eventDate < todayStr) status = 'past';
      else status = 'upcoming';
    }

    const displayImage = resolveEventImage(evt);

    return {
      id: evt.id,
      name: evt.title || evt.name || 'Estate Event',
      date: eventDate,
      time: evt.start_time || evt.time || '18:00',
      endTime: evt.end_time || evt.host_info?.end_time || '21:00',
      bookingStatus: evt.booking_status || evt.host_info?.booking_status || (status === 'past' ? 'Closed' : 'Open'),
      bookingDeadline: evt.booking_deadline || evt.host_info?.booking_deadline || null,
      venue: evt.venue || 'Amphitheatre & Cellar, Nashik',
      capacity: evt.capacity || 100,
      description: evt.description || '',
      remainingCapacity: evt.available_slots || evt.capacity || 100,
      revenue: (evt.capacity ? evt.capacity * (evt.price || 1500) : 0),
      status: status,
      eventStatus: status, // 'upcoming' | 'ongoing' | 'past'
      coverImage: displayImage,
      image: displayImage,
      imageUrl: displayImage,
      image_url: displayImage,
      banner_image: displayImage,
      type: evt.event_type || (evt.tags && evt.tags[0]) || 'Harvest Festival',
      soldCount: status === 'past' 
        ? (evt.turnout_count ?? recap.turnoutCount ?? (evt.capacity ? Math.round(evt.capacity * 0.95) : 95))
        : (evt.soldCount || 15),
      ticketTiers: [{ name: 'General Admission', price: evt.price || evt.ticket_price || 1500 }],
      location: evt.venue || 'Amphitheatre, Nashik',
      wineryName: 'VinoSphere Estates',
      tags: evt.tags || ['Festival', 'Tasting'],
      highlights: evt.highlights || [],
      inclusions: evt.inclusions || [],
      itinerary: evt.itinerary || [],
      hostInfo: evt.host_info || {},
      featuredVintages: evt.featured_vintages || evt.host_info?.featured_vintages || [],
      slug: evt.id,
      isFeatured: true,
      turnoutCount: evt.turnout_count ?? recap.turnoutCount ?? (status === 'past' ? (evt.capacity ? Math.round(evt.capacity * 0.95) : 120) : null),
      rating: evt.rating ?? recap.rating ?? (status === 'past' ? 4.9 : null),
      reviews: evt.reviews || recap.reviews || [],
      recapNotes: evt.recap_notes || recap.notes || ''
    };
  });
}

/**
 * Map Bookings
 */
export function mapBookingsToFrontend(dbBookings: any[]) {
  if (!dbBookings) return [];
  return dbBookings.map(bk => ({
    id: bk.id,
    customer: bk.customer_name || 'Guest',
    email: bk.customer_email || '',
    experience: 'Wine Tour', // Fallback
    date: bk.booking_date,
    tickets: bk.number_of_guests,
    paymentStatus: bk.payment_status,
    checkInStatus: bk.status,
    total: bk.total_amount
  }));
}

/**
 * Map Leads
 */
export function mapLeadsToFrontend(dbLeads: any[]) {
  if (!dbLeads) return [];

  // Distinct corporate budgets and scheduled event timelines
  const budgetMap: Record<string, number> = {
    'Hindustan Aeronautics Ltd (HAL Nashik)': 580000,
    'Mahindra & Mahindra Auto (Nashik Plant)': 640000,
    'Bosch Limited (MIDC Ambad Nashik)': 320000,
    'Glenmark Pharmaceuticals (Nashik Hub)': 475000,
    'VIP Industries Ltd (Ambad Nashik)': 1250000,
    'Google India Cloud Leadership': 425000,
    'McKinsey & Company India': 780000,
    'Mercedes-Benz India': 390000,
    'Novartis Healthcare Research': 1150000,
    'Red Bull Media House': 1850000,
  };

  const timelineMap: Record<string, string> = {
    'Hindustan Aeronautics Ltd (HAL Nashik)': '16 Dec 2026',
    'Mahindra & Mahindra Auto (Nashik Plant)': '09 Jan 2027',
    'Bosch Limited (MIDC Ambad Nashik)': '28 Jan 2027',
    'Glenmark Pharmaceuticals (Nashik Hub)': '18 Feb 2027',
    'VIP Industries Ltd (Ambad Nashik)': '12 Mar 2027',
    'Google India Cloud Leadership': '18 Dec 2026',
    'McKinsey & Company India': '22 Jan 2027',
    'Mercedes-Benz India': '06 Feb 2027',
    'Novartis Healthcare Research': '24 Feb 2027',
    'Red Bull Media House': '15 Mar 2027',
  };

  return dbLeads.map(lead => {
    const guests = Number(lead.expected_guests || lead.estimated_attendees || lead.quantity || 50);
    const computedBudget = Number(
      lead.budget_estimate ||
      lead.budget ||
      budgetMap[lead.company_name] ||
      (guests * 4500)
    );
    
    const formattedTimeline = 
      lead.timeline || 
      lead.preferred_date || 
      timelineMap[lead.company_name] || 
      (lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Q1 2027');

    // Normalize status for UI action handlers and status pills
    let uiStatus = lead.status;
    if (lead.company_name === 'Mahindra & Mahindra Auto (Nashik Plant)' || lead.company_name === 'McKinsey & Company India') {
      uiStatus = 'Proposal Sent';
    } else if (lead.status === 'pending') {
      uiStatus = 'New Inquiry';
    } else if (lead.status === 'approved') {
      uiStatus = 'Accepted';
    } else if (lead.status === 'rejected') {
      uiStatus = 'Rejected';
    }

    return {
      id: lead.id,
      companyName: lead.company_name || 'Corporate Lead',
      contactPerson: lead.contact_person || lead.contact_name || 'Event Coordinator',
      email: lead.email || 'events@corporate.in',
      phone: lead.phone || '+91 98200 12345',
      requirement: lead.message || lead.requirements || lead.event_type || 'Private corporate wine tasting retreat with guided cellar tour and dinner.',
      budget: computedBudget,
      quantity: guests,
      timeline: formattedTimeline,
      status: uiStatus
    };
  });
}


/**
 * Updates winery estate settings inside the database
 */
export async function updateWinerySettings(wineryId: string, settingsData: any) {
  try {
    const res = await fetch(`${API_URL}/${wineryId}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settingsData)
    });
    
    if (!res.ok) {
      throw new Error('Failed to update winery settings');
    }
    
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error('Error updating winery settings:', error);
    return null;
  }
}
