import { db } from '../../adapters/database';
import { normalizeWine } from '../wines/wine-normalizer';

export class DiscoveryService {
  /**
   * Fetch all wines with their associated winery details.
   */
  async discoverWines() {
    // Fetch wines along with their winery, price (inventory), and images
    const selectQuery = '*, wineries(name, city, state, country), wine_inventory(price, stock_quantity, publish_status), wine_images(image_url, is_primary)';
    const rawWines = await db.findWithRelations('wines', selectQuery);

    // Transform the raw database output into a clean object for the frontend
    return rawWines.map((wine: any) => {
      // Supabase might return one-to-one relations as objects or single-item arrays
      const inventory = Array.isArray(wine.wine_inventory) ? wine.wine_inventory[0] : wine.wine_inventory;
      
      // Find the primary image or just grab the first one
      const images = wine.wine_images || [];
      const primaryImage = images.find((img: any) => img.is_primary) || images[0];

      const normalized = normalizeWine(wine);

      return {
        id: wine.id,
        name: wine.name,
        slug: wine.slug,
        wine_type: wine.wine_type,
        grape_variety: wine.grape_variety,
        vintage: wine.vintage,
        winery: wine.wineries,
        price: inventory?.price || null,
        stock_quantity: inventory?.stock_quantity || 0,
        image_url: primaryImage?.image_url || null,
        description: wine.description || null,
        food_pairings: wine.food_pairings || null,
        taste_notes: wine.taste_notes || null,
        sweetness: wine.sweetness || null,
        body: wine.body || null,
        acidity: wine.acidity || null,
        tannin: wine.tannin || null,
        serving_temperature: wine.serving_temperature || null,
        alcohol_percentage: wine.alcohol_percentage || null,
        // Recommendation & filtering metadata
        normalized_type: normalized.wineType,
        normalized_sweetness: normalized.sweetness,
        normalized_body: normalized.body,
        normalized_acidity: normalized.acidity,
        normalized_tannin: normalized.tannin,
        flavors: normalized.flavors,
        occasions: normalized.occasions,
        is_beginner_friendly: normalized.isBeginnerFriendly,
        is_available: normalized.isAvailable,
        rating: normalized.rating,
        star_rating: normalized.starRating,
        review_count: normalized.reviewCount,
      };
    });
  }

  /**
   * Search wines by query (name, type, region)
   * This is a simplified search. In a real app, this might use full-text search.
   */
  async searchWines(query: string) {
    const wines = await this.discoverWines();
    const lowerQuery = query.toLowerCase();
    
    // In-memory filter for demonstration
    return wines.filter((wine: any) => 
      wine.name?.toLowerCase().includes(lowerQuery) || 
      wine.wine_type?.toLowerCase().includes(lowerQuery) ||
      wine.grape_variety?.toLowerCase().includes(lowerQuery) ||
      wine.winery?.name?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Fetch all upcoming events and experiences (aggregated).
   */
  async getUpcomingEvents() {
    const selectQuery = '*, wineries(name, city, state, country)';
    
    // Fetch both tables
    const rawEvents = await db.findWithRelations('events', selectQuery) || [];
    const rawExperiences = await db.findWithRelations('experiences', selectQuery) || [];

    // Map Events
    const mappedEvents = rawEvents.map((evt: any) => {
      const recap = evt.host_info?.recap || {};
      const todayStr = new Date().toISOString().split('T')[0];
      let status = evt.event_status || recap.status;
      if (!status) {
        if (evt.event_date === todayStr) status = 'ongoing';
        else if (evt.event_date && evt.event_date < todayStr) status = 'past';
        else status = 'upcoming';
      }

      const hostInfo = evt.host_info || {};

      return {
        id: evt.id,
        title: evt.title,
        description: evt.description,
        type: 'event', // tag to distinguish
        date: evt.event_date,
        start_time: evt.start_time,
        end_time: evt.end_time || hostInfo.end_time || null,
        booking_status: evt.booking_status || hostInfo.booking_status || (status === 'past' ? 'Closed' : 'Open'),
        booking_deadline: evt.booking_deadline || hostInfo.booking_deadline || null,
        capacity: evt.capacity,
        available_slots: evt.available_slots,
        price: evt.price,
        cover_image: evt.banner_image,
        winery: evt.wineries,
        tags: evt.tags || [],
        gallery_images: evt.gallery_images || [],
        host_info: evt.host_info || null,
        highlights: evt.highlights || [],
        itinerary: evt.itinerary || [],
        inclusions: evt.inclusions || [],
        featured_vintages: evt.featured_vintages || hostInfo.featured_vintages || [],
        event_status: status,
        turnout_count: evt.turnout_count ?? recap.turnoutCount ?? (status === 'past' ? (evt.capacity ? Math.round(evt.capacity * 0.9) : 120) : null),
        rating: evt.rating ?? recap.rating ?? (status === 'past' ? 4.9 : null),
        reviews: evt.reviews || recap.reviews || [],
        recap_notes: evt.recap_notes || recap.notes || null,
      };
    });

    // Map Experiences / Estate Journeys
    const mappedExperiences = rawExperiences.map((exp: any) => {
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

      return {
        id: exp.id,
        title: exp.title,
        short_description: exp.short_description || exp.host_info?.short_description || null,
        description: exp.description,
        type: exp.experience_type || 'experience',
        duration_minutes: exp.duration_minutes,
        capacity: exp.capacity,
        price: exp.price,
        cover_image: exp.cover_image,
        winery: exp.wineries,
        tags: exp.tags || [],
        gallery_images: exp.gallery_images || exp.host_info?.gallery_images || [],
        host_info: exp.host_info || null,
        highlights: exp.highlights || [],
        itinerary: exp.itinerary || [],
        inclusions: exp.inclusions || [],
        exclusions: exp.exclusions || exp.host_info?.exclusions || [],
        featured_vintages: exp.featured_vintages || exp.host_info?.featured_vintages || [],
        event_status: status === 'past' ? 'past' : (status === 'upcoming' ? 'upcoming' : 'ongoing'),
        experience_status: status,
        start_date: exp.start_date || schedule.start_date || null,
        end_date: exp.end_date || schedule.end_date || null,
        available_days: exp.available_days || schedule.available_days || [],
        time_slots: exp.time_slots || schedule.time_slots || [],
        max_guests_per_slot: exp.max_guests_per_slot || schedule.max_guests_per_slot || exp.capacity || 15,
        booking_status: exp.booking_status || booking.booking_status || (status === 'upcoming' ? 'Coming Soon' : 'Open for Booking'),
        cancellation_policy: exp.cancellation_policy || booking.cancellation_policy || null,
        min_age: exp.min_age || booking.min_age || '18+',
        meeting_point: exp.meeting_point || location.meeting_point || null,
        arrival_instructions: exp.arrival_instructions || location.arrival_instructions || null,
        parking_available: exp.parking_available ?? location.parking_available ?? true,
        edition_date: exp.edition_date || recap.edition_date || null,
        turnout_count: exp.turnout_count ?? recap.turnoutCount ?? (status === 'past' ? (exp.capacity ? Math.round(exp.capacity * 2.5) : 85) : null),
        rating: exp.rating ?? recap.rating ?? (status === 'past' ? 4.95 : 4.8),
        reviews: exp.reviews || recap.reviews || [],
        recap_notes: exp.recap_notes || recap.notes || null,
      };
    });

    // Combine and return
    return [...mappedEvents, ...mappedExperiences];
  }
}

export const discoveryService = new DiscoveryService();
