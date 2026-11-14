import { db } from '../../adapters/database';
import { cacheService } from '../../shared/cache.service';

export class DashboardService {
  /**
   * Fetch inventory statistics for a specific winery
   */
  async getInventory(wineryId: string) {
    return await db.find('wine_inventory', { winery_id: wineryId });
  }

  /**
   * Update stock levels for a specific wine
   */
  async updateStock(inventoryId: string, quantity: number) {
    return await db.update('wine_inventory', inventoryId, { stock: quantity });
  }

  /**
   * Fetch daily analytics for a specific winery
   */
  async getDailyAnalytics(wineryId: string) {
    return await db.find('analytics_daily', { winery_id: wineryId });
  }

  /**
   * Fetch a massive comprehensive overview of all winery data
   * Useful for loading the entire dashboard state efficiently.
   */
  async getOverview(wineryId: string) {
    const effectiveWineryId = wineryId === '11111111-1111-1111-1111-111111111111'
      ? 'b40a83dd-ee61-43df-bf79-caf3b2a190de'
      : wineryId;

    // Run all queries concurrently using Promise.all
    const [winery, rawWines, experiences, events, rawBookings, leads, reviews, documents, inventories, images] = await Promise.all([
      db.findOne('wineries', { id: effectiveWineryId }),
      db.find('wines', { winery_id: effectiveWineryId }),
      db.find('experiences', { winery_id: effectiveWineryId }),
      db.find('events', { winery_id: effectiveWineryId }),
      db.find('bookings', { winery_id: effectiveWineryId }),
      db.find('corporate_leads', { winery_id: effectiveWineryId }),
      db.find('reviews', { winery_id: effectiveWineryId }),
      db.find('documents', { winery_id: effectiveWineryId }),
      db.find('wine_inventory'),
      db.find('wine_images'),
    ]);

    // Map inventory and images locally to each wine
    const wines = rawWines.map((wine: any) => {
      const inventory = inventories.find((inv: any) => inv.wine_id === wine.id);
      const wineImgs = images.filter((img: any) => img.wine_id === wine.id);
      const primaryImg = wineImgs.find((img: any) => img.is_primary) || wineImgs[0];

      return {
        ...wine,
        price: inventory ? inventory.price : null,
        stock_quantity: inventory ? inventory.stock_quantity : 0,
        image_url: primaryImg ? primaryImg.image_url : null,
      };
    });

    // Gather all users to map names and emails locally
    const usersMap: Record<string, any> = {};
    try {
      const usersList = await db.find('users');
      usersList.forEach((u: any) => {
        usersMap[u.id] = u;
      });
    } catch (err) {
      console.error('[getOverview] Failed to fetch users list:', err);
    }

    // Map rawBookings to populate customer details and experience/event titles for dashboard mapping
    const bookings = rawBookings.map((b: any) => {
      const user = usersMap[b.user_id];
      
      // Look up experience or event title locally from the resolved arrays
      let experienceTitle = 'Wine Tour';
      if (b.experience_id) {
        const matchedExp = experiences.find((e: any) => e.id === b.experience_id);
        if (matchedExp) experienceTitle = matchedExp.title;
      } else if (b.event_id) {
        const matchedEvt = events.find((e: any) => e.id === b.event_id);
        if (matchedEvt) experienceTitle = matchedEvt.title;
      }

      return {
        ...b,
        customer_name: user?.full_name || 'Guest',
        customer_email: user?.email || '',
        experience: experienceTitle,
        status: b.booking_status === 'confirmed' ? 'Checked In' : 'Pending',
        number_of_guests: b.guests
      };
    });

    return {
      winery,
      wines,
      experiences,
      events,
      bookings,
      leads,
      reviews,
      documents
    };
  }

  /**
   * Add a new wine and its inventory record
   */
  async addWine(wineryId: string, data: any) {
    // Generate a simple slug from the name (make unique)
    const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${Date.now()}`;
    
    const wineTypeMap: Record<string, string> = {
      'Red': 'Red',
      'White': 'White',
      'Rosé': 'Rose',
      'Rose': 'Rose',
      'Sparkling': 'Sparkling',
      'Dessert': 'Dessert',
      'Red Wine': 'Red',
      'White Wine': 'White',
      'Rose Wine': 'Rose',
      'Sparkling Wine': 'Sparkling',
      'Dessert Wine': 'Dessert',
      'Fortified Wine': 'Fortified'
    };

    const sweetnessMap: Record<string, string> = {
      'Bone Dry': 'Dry',
      'Dry': 'Dry',
      'Off-Dry': 'Off Dry',
      'Sweet': 'Sweet',
      'Very Sweet': 'Sweet'
    };

    // Create the wine record
    const wine: any = await db.create('wines', {
      winery_id: wineryId,
      name: data.name,
      slug: slug,
      wine_type: wineTypeMap[data.wine_type] || data.wine_type || 'Red',
      grape_variety: data.grape_variety || null,
      vintage: data.vintage || null,
      alcohol_percentage: data.alcohol_percentage || null,
      body: data.body || null,
      sweetness: data.sweetness ? (sweetnessMap[data.sweetness] || 'Dry') : null,
      acidity: data.acidity || null,
      tannin: data.tannin || null,
      serving_temperature: data.serving_temperature || null,
      food_pairings: data.food_pairings || null,
      taste_notes: data.taste_notes || null,
      description: data.description || null
    });

    // Create the inventory record
    if (wine && wine.id) {
      await db.create('wine_inventory', {
        wine_id: wine.id,
        stock_quantity: data.stock_quantity || 0,
        price: data.price || 0,
        publish_status: 'published'
      });
      
      if (data.image_url) {
        await db.create('wine_images', {
          wine_id: wine.id,
          image_url: data.image_url,
          public_id: data.public_id || `temp_${Date.now()}`,
          is_primary: true
        });
      }
    }

    return wine;
  }

  /**
   * Update an existing wine and its inventory / image records
   */
  async updateWine(wineryId: string, wineId: string, data: any) {
    const effectiveWineryId = wineryId === '11111111-1111-1111-1111-111111111111'
      ? 'b40a83dd-ee61-43df-bf79-caf3b2a190de'
      : wineryId;

    const existingWine = await db.findOne('wines', { id: wineId });
    if (!existingWine) {
      throw new Error(`Wine with ID ${wineId} not found`);
    }
    if (existingWine.winery_id !== effectiveWineryId && existingWine.winery_id !== wineryId) {
      throw new Error(`Unauthorized: Wine does not belong to this winery`);
    }

    const wineTypeMap: Record<string, string> = {
      'Red': 'Red',
      'White': 'White',
      'Rosé': 'Rose',
      'Rose': 'Rose',
      'Sparkling': 'Sparkling',
      'Dessert': 'Dessert',
      'Red Wine': 'Red',
      'White Wine': 'White',
      'Rose Wine': 'Rose',
      'Sparkling Wine': 'Sparkling',
      'Dessert Wine': 'Dessert',
      'Fortified Wine': 'Fortified'
    };

    const sweetnessMap: Record<string, string> = {
      'Bone Dry': 'Dry',
      'Dry': 'Dry',
      'Off-Dry': 'Off Dry',
      'Sweet': 'Sweet',
      'Very Sweet': 'Sweet'
    };

    const wineUpdates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (data.name !== undefined) wineUpdates.name = data.name;
    if (data.wine_type !== undefined || data.category !== undefined) {
      const t = data.wine_type || data.category;
      wineUpdates.wine_type = wineTypeMap[t] || t;
    }
    if (data.grape_variety !== undefined || data.grapeVariety !== undefined) {
      const g = data.grape_variety !== undefined ? data.grape_variety : data.grapeVariety;
      wineUpdates.grape_variety = Array.isArray(g) ? g.join(', ') : g;
    }
    if (data.vintage !== undefined) wineUpdates.vintage = parseInt(data.vintage) || null;
    if (data.alcohol_percentage !== undefined || data.alcoholContent !== undefined) {
      const a = data.alcohol_percentage !== undefined ? data.alcohol_percentage : data.alcoholContent;
      wineUpdates.alcohol_percentage = typeof a === 'string' ? parseFloat(a.replace('%', '')) : a;
    }
    if (data.body !== undefined) wineUpdates.body = data.body;
    if (data.sweetness !== undefined) wineUpdates.sweetness = sweetnessMap[data.sweetness] || data.sweetness;
    if (data.acidity !== undefined) wineUpdates.acidity = data.acidity;
    if (data.tannin !== undefined) wineUpdates.tannin = data.tannin;
    if (data.serving_temperature !== undefined || data.servingTemp !== undefined) {
      wineUpdates.serving_temperature = data.serving_temperature || data.servingTemp;
    }
    if (data.food_pairings !== undefined || data.foodPairings !== undefined) {
      const fp = data.food_pairings !== undefined ? data.food_pairings : data.foodPairings;
      wineUpdates.food_pairings = Array.isArray(fp) ? JSON.stringify(fp) : fp;
    }
    if (data.taste_notes !== undefined || data.tasteNotes !== undefined) {
      wineUpdates.taste_notes = data.taste_notes || data.tasteNotes;
    }
    if (data.description !== undefined) wineUpdates.description = data.description;

    await db.update('wines', wineId, wineUpdates);

    // Update or create inventory
    if (data.price !== undefined || data.stock_quantity !== undefined || data.stock !== undefined) {
      const existingInventory = await db.find('wine_inventory', { wine_id: wineId });
      const priceVal = data.price !== undefined ? parseFloat(data.price) : undefined;
      const stockVal = data.stock_quantity !== undefined
        ? parseInt(data.stock_quantity)
        : (data.stock !== undefined ? parseInt(data.stock) : undefined);

      if (existingInventory && existingInventory.length > 0) {
        const invUpdates: any = { updated_at: new Date().toISOString() };
        if (priceVal !== undefined && !isNaN(priceVal)) invUpdates.price = priceVal;
        if (stockVal !== undefined && !isNaN(stockVal)) invUpdates.stock_quantity = stockVal;
        await db.update('wine_inventory', existingInventory[0].id, invUpdates);
      } else {
        await db.create('wine_inventory', {
          wine_id: wineId,
          price: priceVal || 0,
          stock_quantity: stockVal || 0,
          publish_status: 'published'
        });
      }
    }

    // Update or create image
    const imgUrl = data.image_url || data.image;
    if (imgUrl && typeof imgUrl === 'string' && imgUrl.trim()) {
      const existingImages = await db.find('wine_images', { wine_id: wineId });
      if (existingImages && existingImages.length > 0) {
        const primary = existingImages.find((img: any) => img.is_primary) || existingImages[0];
        await db.update('wine_images', primary.id, {
          image_url: imgUrl,
          updated_at: new Date().toISOString()
        });
      } else {
        await db.create('wine_images', {
          wine_id: wineId,
          image_url: imgUrl,
          public_id: data.public_id || data.publicId || `wine_${Date.now()}`,
          is_primary: true
        });
      }
    }

    // Invalidate caches
    try {
      cacheService.invalidate('raw_wines_catalog');
      cacheService.invalidate('discovery_wines');
      cacheService.invalidate('discovery_wines_summary');
      cacheService.invalidate(`wine:${wineId}`);
      cacheService.invalidateWines();
    } catch {}

    const updatedWine = await db.findOne('wines', { id: wineId });
    return updatedWine;
  }

  /**
   * Delete a wine and associated inventory & images
   */
  async deleteWine(wineryId: string, wineId: string) {
    const effectiveWineryId = wineryId === '11111111-1111-1111-1111-111111111111'
      ? 'b40a83dd-ee61-43df-bf79-caf3b2a190de'
      : wineryId;

    const existingWine = await db.findOne('wines', { id: wineId });
    if (!existingWine) {
      throw new Error(`Wine with ID ${wineId} not found`);
    }
    if (existingWine.winery_id !== effectiveWineryId && existingWine.winery_id !== wineryId) {
      throw new Error(`Unauthorized: Wine does not belong to this winery`);
    }

    const [inventories, images] = await Promise.all([
      db.find('wine_inventory', { wine_id: wineId }),
      db.find('wine_images', { wine_id: wineId })
    ]);

    for (const inv of inventories) {
      await db.delete('wine_inventory', inv.id);
    }
    for (const img of images) {
      await db.delete('wine_images', img.id);
    }

    const result = await db.delete('wines', wineId);

    try {
      cacheService.invalidate('raw_wines_catalog');
      cacheService.invalidate('discovery_wines');
      cacheService.invalidate('discovery_wines_summary');
      cacheService.invalidate(`wine:${wineId}`);
      cacheService.invalidateWines();
    } catch {}

    return result;
  }

  /**
   * Add a new experience / estate journey for a winery
   */
  async addExperience(wineryId: string, data: any) {
    const status = data.status || data.experience_status || 'active';
    const hostInfo = typeof data.host_info === 'object' && data.host_info !== null ? { ...data.host_info } : {};

    // Persist past journey metrics, reviews, turnout, and recap notes
    hostInfo.recap = {
      status: status,
      turnoutCount: data.turnout_count !== undefined && data.turnout_count !== null ? parseInt(data.turnout_count) : (status === 'past' ? parseInt(data.capacity) || 45 : null),
      rating: data.rating !== undefined && data.rating !== null ? parseFloat(data.rating) : (status === 'past' ? 4.95 : null),
      reviews: Array.isArray(data.reviews) ? data.reviews : [],
      notes: data.recap_notes || data.recapNotes || null,
      edition_date: data.edition_date || null
    };

    // Store schedule, booking, location, exclusions, short_description in hostInfo for compatibility
    hostInfo.short_description = data.short_description || '';
    hostInfo.schedule = {
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      available_days: Array.isArray(data.available_days) ? data.available_days : [],
      time_slots: Array.isArray(data.time_slots) ? data.time_slots : [],
      max_guests_per_slot: parseInt(data.max_guests_per_slot) || parseInt(data.capacity) || 15
    };
    hostInfo.booking = {
      booking_status: data.booking_status || (status === 'upcoming' ? 'Coming Soon' : 'Open for Booking'),
      cancellation_policy: data.cancellation_policy || '',
      min_age: data.min_age || '18+'
    };
    hostInfo.location = {
      meeting_point: data.meeting_point || '',
      arrival_instructions: data.arrival_instructions || '',
      parking_available: data.parking_available !== undefined ? Boolean(data.parking_available) : true
    };
    hostInfo.exclusions = Array.isArray(data.exclusions) ? data.exclusions : [];
    hostInfo.gallery_images = Array.isArray(data.gallery_images) ? data.gallery_images : [];
    hostInfo.featured_vintages = Array.isArray(data.featured_vintages) ? data.featured_vintages : [];

    const tags = Array.isArray(data.tags) ? [...data.tags] : [];
    if (!tags.includes(`Status:${status}`)) {
      tags.push(`Status:${status}`);
    }

    // Basic formatting for DB schema constraints
    const expData = {
      winery_id: wineryId,
      title: data.name,
      description: data.description || '',
      experience_type: data.experience_type || null,
      duration_minutes: parseInt(data.duration) || 90,
      capacity: parseInt(data.capacity) || 15,
      price: parseFloat(data.price) || 0,
      cover_image: data.image_url || 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
      publish_status: 'published',
      tags: tags,
      gallery_images: data.gallery_images || [],
      host_info: hostInfo,
      highlights: data.highlights || [],
      itinerary: data.itinerary || [],
      inclusions: data.inclusions || [],
      featured_vintages: data.featured_vintages || []
    };

    const newExp = await db.create('experiences', expData);
    return newExp;
  }

  /**
   * Add a new event for a winery
   */
  async addEvent(wineryId: string, data: any) {
    const status = data.status || data.event_status || (data.date && new Date(data.date) < new Date(new Date().toDateString()) ? 'past' : 'upcoming');
    const hostInfo = typeof data.host_info === 'object' && data.host_info !== null ? { ...data.host_info } : {};
    
    // Store end_time, booking_status, booking_deadline, and featured_vintages in host_info for schema-safe persistence
    hostInfo.end_time = data.end_time || hostInfo.end_time || '21:00';
    hostInfo.booking_status = data.booking_status || hostInfo.booking_status || 'Open';
    hostInfo.booking_deadline = data.booking_deadline || hostInfo.booking_deadline || null;
    hostInfo.featured_vintages = data.featured_vintages || hostInfo.featured_vintages || [];

    // Persist past event metrics and guest reviews
    hostInfo.recap = {
      status: status,
      turnoutCount: data.turnout_count !== undefined && data.turnout_count !== null ? parseInt(data.turnout_count) : (status === 'past' ? parseInt(data.capacity) || 120 : null),
      rating: data.rating !== undefined && data.rating !== null ? parseFloat(data.rating) : (status === 'past' ? 4.9 : null),
      reviews: Array.isArray(data.reviews) ? data.reviews : [],
      notes: data.recap_notes || data.recapNotes || null
    };

    const tags = Array.isArray(data.tags) ? [...data.tags] : [];
    if (!tags.includes(`Status:${status}`)) {
      tags.push(`Status:${status}`);
    }

    const eventData = {
      winery_id: wineryId,
      title: data.name,
      description: data.description || '',
      event_date: data.date || new Date().toISOString().split('T')[0],
      start_time: data.start_time || '18:00',
      end_time: data.end_time || '21:00',
      booking_status: data.booking_status || 'Open',
      booking_deadline: data.booking_deadline || null,
      capacity: parseInt(data.capacity) || 100,
      available_slots: parseInt(data.capacity) || 100, // initially, available slots equal capacity
      price: parseFloat(data.price) || 0,
      banner_image: data.image_url || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
      publish_status: 'published',
      tags: tags,
      gallery_images: data.gallery_images || [],
      host_info: hostInfo,
      highlights: data.highlights || [],
      itinerary: data.itinerary || [],
      inclusions: data.inclusions || [],
      featured_vintages: data.featured_vintages || []
    };

    const newEvent = await db.create('events', eventData);
    return newEvent;
  }

  async updateSettings(wineryId: string, data: any) {
    const updateData: any = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.logo_url !== undefined) updateData.logo_url = data.logo_url;
    if (data.banner_url !== undefined) updateData.banner_url = data.banner_url;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.awards !== undefined) updateData.awards = data.awards;
    if (data.timeline !== undefined) updateData.timeline = data.timeline;

    return await db.update('wineries', wineryId, updateData);
  }
}

export const dashboardService = new DashboardService();
