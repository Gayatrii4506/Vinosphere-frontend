import { supabase } from './supabaseClient';

// We'll define simple wrappers for the DB calls
export const getWineries = async () => {
  const { data, error } = await supabase.from('wineries').select('*');
  if (error) console.error(error);
  return data || [];
};

export const getWines = async () => {
  const { data, error } = await supabase.from('wines').select(`
    *,
    wine_inventory ( price, stock_quantity, featured, publish_status ),
    wine_images ( image_url, is_primary )
  `);
  if (error) console.error(error);
  return data || [];
};

export const getExperiences = async () => {
  const { data, error } = await supabase.from('experiences').select('*');
  if (error) console.error(error);
  return data || [];
};

export const getEvents = async () => {
  const { data, error } = await supabase.from('events').select('*');
  if (error) console.error(error);
  return data || [];
};

export const getBookings = async () => {
  const { data, error } = await supabase.from('bookings').select('*');
  if (error) console.error(error);
  return data || [];
};

export const getReviews = async () => {
  const { data, error } = await supabase.from('reviews').select('*');
  if (error) console.error(error);
  return data || [];
};

// Add Winery
export const addWinery = async (wineryData: any) => {
  const { data, error } = await supabase.from('wineries').insert([{
    name: wineryData.name,
    slug: wineryData.slug,
    description: wineryData.description,
    logo_url: wineryData.logo,
    banner_url: wineryData.coverImage,
    city: "Nashik",
    state: "Maharashtra",
    country: "India",
    status: 'published',
    verified: true
  }]).select().single();
  
  if (error) throw error;
  return data;
};

// Add Wine
export const addWine = async (wineData: any) => {
  // 1. Insert into wines
  const { data: wineInsert, error: wineErr } = await supabase.from('wines').insert([{
    winery_id: wineData.winery_id,
    name: wineData.name,
    slug: wineData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    wine_type: wineData.type || 'Red',
    grape_variety: "Estate Blend", // Required field in new schema
    vintage: parseInt(wineData.vintage) || null,
    description: wineData.description,
    alcohol_percentage: parseFloat(wineData.alcoholContent) || 0
  }]).select().single();

  if (wineErr) throw wineErr;

  const wineId = wineInsert.id;

  // 2. Insert into wine_inventory
  const { error: invErr } = await supabase.from('wine_inventory').insert([{
    wine_id: wineId,
    price: parseFloat(wineData.price) || 0,
    stock_quantity: 100, // Default for now
    publish_status: 'published'
  }]);

  if (invErr) throw invErr;

  // 3. Insert into wine_images
  const { error: imgErr } = await supabase.from('wine_images').insert([{
    wine_id: wineId,
    image_url: wineData.image || 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600&q=80',
    public_id: 'default_public_id', // Required field in new schema
    is_primary: true
  }]);

  if (imgErr) throw imgErr;

  return wineInsert;
};

// Add Event
export const addEvent = async (eventData: any) => {
  const { data, error } = await supabase.from('events').insert([{
    winery_id: eventData.winery_id,
    title: eventData.name,
    description: eventData.description,
    event_date: eventData.date,
    start_time: eventData.time,
    end_time: "23:59:00", // Default
    capacity: parseInt(eventData.capacity),
    available_slots: parseInt(eventData.capacity),
    price: parseFloat(eventData.ticketPrice),
    publish_status: 'published'
  }]).select().single();

  if (error) throw error;
  return data;
};

// Add Experience
export const addExperience = async (expData: any) => {
  const { data, error } = await supabase.from('experiences').insert([{
    winery_id: expData.winery_id,
    title: expData.name,
    description: expData.description,
    duration_minutes: parseInt(expData.duration) || 90,
    capacity: parseInt(expData.capacity),
    price: parseFloat(expData.price),
    publish_status: 'published'
  }]).select().single();

  if (error) throw error;
  return data;
};
