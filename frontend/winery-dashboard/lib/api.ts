const BASE_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1';
const API_URL = `${BASE_API_URL}/dashboard`;
const AUTH_URL = `${BASE_API_URL}/auth`;

/**
 * Onboards and registers a new winery estate
 */
export async function registerWinery(regData: any) {
  try {
    const res = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(regData)
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.message || 'Registration failed');
    }

    return body.data;
  } catch (error: any) {
    console.error('Error in registerWinery:', error);
    throw error;
  }
}

/**
 * Authenticates winery estate owner / manager
 */
export async function loginWinery(email: string, password?: string) {
  try {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.message || 'Login failed');
    }

    return body.data;
  } catch (error: any) {
    console.error('Error in loginWinery:', error);
    throw error;
  }
}

/**
 * Maps the PostgreSQL database objects to the frontend state format
 * so we don't have to rewrite all 4,000 lines of UI code immediately,
 * while still using real database data.
 */

export async function fetchDashboardOverview(wineryId: string) {
  try {
    const res = await fetch(`${API_URL}/${wineryId}/overview`);
    if (!res.ok) {
      throw new Error('Failed to fetch dashboard overview');
    }
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return null;
  }
}

/**
 * Creates a new wine in the database
 */
export async function addWineToDatabase(wineryId: string, wineData: any) {
  try {
    const res = await fetch(`${API_URL}/${wineryId}/wines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
      headers: {
        'Content-Type': 'application/json'
      },
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
      method: 'DELETE'
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
      headers: {
        'Content-Type': 'application/json'
      },
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
      headers: {
        'Content-Type': 'application/json'
      },
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
export function mapWinesToFrontend(dbWines: any[]) {
  if (!dbWines) return [];
  return dbWines.map(wine => {
    const wineType = wine.wine_type || 'Red';
    
    // Dynamic fallback image depending on the wine type
    let displayImage = wine.image_url;
    if (!displayImage) {
      const lowerType = wineType.toLowerCase();
      if (lowerType.includes('white')) {
        displayImage = 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=60';
      } else if (lowerType.includes('rose') || lowerType.includes('rosé')) {
        displayImage = 'https://images.unsplash.com/photo-1553122180-2c700cb75571?w=600&auto=format&fit=crop&q=60';
      } else if (lowerType.includes('sparkling') || lowerType.includes('champagne')) {
        displayImage = 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=600&auto=format&fit=crop&q=60';
      } else if (lowerType.includes('dessert')) {
        displayImage = 'https://images.unsplash.com/photo-1614742468798-e7c65d642398?w=600&auto=format&fit=crop&q=60';
      } else {
        displayImage = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=60';
      }
    }

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
  return dbLeads.map(lead => ({
    id: lead.id,
    companyName: lead.company_name,
    contactPerson: lead.contact_name,
    email: lead.email,
    phone: lead.phone,
    requirement: lead.requirements,
    budget: lead.budget_estimate,
    quantity: lead.estimated_attendees,
    timeline: lead.preferred_date,
    status: lead.status
  }));
}


/**
 * Updates winery estate settings inside the database
 */
export async function updateWinerySettings(wineryId: string, settingsData: any) {
  try {
    const res = await fetch(`${API_URL}/${wineryId}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
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
