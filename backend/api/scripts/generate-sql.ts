import * as fs from 'fs';
import * as path from 'path';
import {
  DEMO_WINERIES,
  DEMO_USERS,
  DEMO_WINES,
  DEMO_EVENTS,
  DEMO_EXPERIENCES,
  DEMO_BOOKINGS,
  DEMO_CORPORATE_LEADS,
  DEMO_DOCUMENTS,
  DEMO_REVIEWS
} from './seed-demo-data';

function esc(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (Array.isArray(val) && typeof val[0] === 'string') {
    return `ARRAY[${val.map(s => `'${s.replace(/'/g, "''")}'`).join(', ')}]::TEXT[]`;
  }
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::JSONB`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

function generateSql() {
  const lines: string[] = [];

  lines.push('-- ====================================================================');
  lines.push('-- VinoSphere Idempotent Demo Data Seed Export');
  lines.push('-- Generated for B.Tech Final Year Project Demonstration');
  lines.push('-- Targets: Supabase PostgreSQL');
  lines.push('-- Covers: Consumer App, Winery Dashboard, and Admin Dashboard');
  lines.push('-- ====================================================================\n');

  lines.push('BEGIN;\n');

  // 1. Users
  lines.push('-- 1. DEMO USERS');
  for (const u of DEMO_USERS) {
    lines.push(`INSERT INTO users (id, email, full_name, phone, role, winery_id, city, state, country, experience_level, favorite_wine_types, primary_interest)
VALUES (${esc(u.id)}, ${esc(u.email)}, ${esc(u.full_name)}, ${esc(u.phone)}, ${esc(u.role)}, ${esc(u.winery_id)}, ${esc(u.city)}, ${esc(u.state)}, ${esc(u.country)}, ${esc(u.experience_level)}, ${esc(u.favorite_wine_types)}, ${esc(u.primary_interest)})
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  winery_id = EXCLUDED.winery_id;`);
  }
  lines.push('\n');

  // 2. Wineries
  lines.push('-- 2. DEMO WINERIES (6 Published, 2 Draft/Pending Approvals, 1 Archived)');
  for (const w of DEMO_WINERIES) {
    lines.push(`INSERT INTO wineries (id, name, slug, description, established_year, email, phone, website, address, city, state, country, latitude, longitude, logo_url, banner_url, opening_time, closing_time, verified, status, awards, timeline)
VALUES (${esc(w.id)}, ${esc(w.name)}, ${esc(w.slug)}, ${esc(w.description)}, ${esc(w.established_year)}, ${esc(w.email)}, ${esc(w.phone)}, ${esc(w.website)}, ${esc(w.address)}, ${esc(w.city)}, ${esc(w.state)}, ${esc(w.country)}, ${esc(w.latitude)}, ${esc(w.longitude)}, ${esc(w.logo_url)}, ${esc(w.banner_url)}, ${esc(w.opening_time)}, ${esc(w.closing_time)}, ${esc(w.verified)}, ${esc(w.status)}, ${esc(w.awards)}, ${esc(w.timeline)})
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  verified = EXCLUDED.verified,
  status = EXCLUDED.status;`);
  }
  lines.push('\n');

  // 3. Wines
  lines.push('-- 3. WINES (35 Varietals across Red, White, Rosé, Sparkling, Dessert)');
  for (const w of DEMO_WINES) {
    lines.push(`INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES (${esc(w.id)}, ${esc(w.winery_id)}, ${esc(w.name)}, ${esc(w.slug)}, ${esc(w.wine_type)}, ${esc(w.grape_variety)}, ${esc(w.vintage)}, ${esc(w.alcohol_percentage)}, ${esc(w.body)}, ${esc(w.sweetness)}, ${esc(w.acidity)}, ${esc(w.tannin || 'Medium')}, ${esc(w.serving_temperature)}, ${esc(w.description)}, ${esc(w.food_pairings)}, ${esc(w.taste_notes)})
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;`);
  }
  lines.push('\n');

  // 4. Wine Inventory
  lines.push('-- 4. WINE INVENTORY (Prices in INR, Stock Quantities, SKUs, Featured)');
  DEMO_WINES.forEach((w, idx) => {
    const invId = `00000000-0000-4000-da00-${String(idx + 1).padStart(12, '0')}`;
    lines.push(`INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES (${esc(invId)}, ${esc(w.id)}, ${esc(w.sku)}, ${esc(w.price)}, ${esc(w.stock_quantity)}, ${esc(w.featured)}, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;`);
  });
  lines.push('\n');

  // 5. Wine Images
  lines.push('-- 5. WINE IMAGES (Primary Bottle Imagery)');
  DEMO_WINES.forEach((w, idx) => {
    const imgId = `00000000-0000-4000-db00-${String(idx + 1).padStart(12, '0')}`;
    lines.push(`INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES (${esc(imgId)}, ${esc(w.id)}, ${esc(w.image_url)}, ${esc(`demo_wine_img_${idx + 1}`)}, 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;`);
  });
  lines.push('\n');

  // 6. Events & Experiences
  lines.push('-- 6. UPCOMING EVENTS (Scheduled Dec 2026 - Mar 2027)');
  for (const e of DEMO_EVENTS) {
    lines.push(`INSERT INTO events (id, winery_id, title, description, event_date, start_time, end_time, capacity, available_slots, price, banner_image, publish_status, event_status, tags, gallery_images, highlights, inclusions, rating, host_info)
VALUES (${esc(e.id)}, ${esc(e.winery_id)}, ${esc(e.title)}, ${esc(e.description)}, ${esc(e.event_date)}, ${esc(e.start_time)}, ${esc(e.end_time)}, ${esc(e.capacity)}, ${esc(e.available_slots)}, ${esc(e.price)}, ${esc(e.banner_image)}, ${esc(e.publish_status)}, ${esc(e.event_status)}, ${esc(e.tags)}, ${esc(e.gallery_images)}, ${esc(e.highlights)}, ${esc(e.inclusions)}, ${esc(e.rating)}, ${esc(e.host_info)})
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  event_date = EXCLUDED.event_date,
  event_status = EXCLUDED.event_status;`);
  }
  lines.push('\n');

  lines.push('-- 7. CURATED ESTATE EXPERIENCES');
  for (const exp of DEMO_EXPERIENCES) {
    lines.push(`INSERT INTO experiences (id, winery_id, title, description, experience_type, duration_minutes, capacity, price, cover_image, publish_status, tags, gallery_images, highlights, inclusions)
VALUES (${esc(exp.id)}, ${esc(exp.winery_id)}, ${esc(exp.title)}, ${esc(exp.description)}, ${esc(exp.experience_type)}, ${esc(exp.duration_minutes)}, ${esc(exp.capacity)}, ${esc(exp.price)}, ${esc(exp.cover_image)}, ${esc(exp.publish_status)}, ${esc(exp.tags)}, ${esc(exp.gallery_images)}, ${esc(exp.highlights)}, ${esc(exp.inclusions)})
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price;`);
  }
  lines.push('\n');

  // 8. Bookings
  lines.push('-- 8. BOOKINGS HISTORY (Completed, Confirmed, Pending, Cancelled)');
  for (const b of DEMO_BOOKINGS) {
    lines.push(`INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES (${esc(b.id)}, ${esc(b.user_id)}, ${esc(b.winery_id)}, ${esc(b.event_id)}, ${esc(b.experience_id)}, ${esc(b.booking_date)}, ${esc(b.booking_time)}, ${esc(b.guests)}, ${esc(b.total_amount)}, ${esc(b.payment_status)}, ${esc(b.booking_status)}, ${esc(b.special_requests)})
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;`);
  }
  lines.push('\n');

  // 9. Corporate Leads & Documents
  lines.push('-- 9. CORPORATE LEADS & COMPLIANCE DOCUMENTS');
  for (const l of DEMO_CORPORATE_LEADS) {
    lines.push(`INSERT INTO corporate_leads (id, winery_id, company_name, contact_person, email, phone, event_type, expected_guests, message, status)
VALUES (${esc(l.id)}, ${esc(l.winery_id)}, ${esc(l.company_name)}, ${esc(l.contact_person)}, ${esc(l.email)}, ${esc(l.phone)}, ${esc(l.event_type)}, ${esc(l.expected_guests)}, ${esc(l.message)}, ${esc(l.status)})
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;`);
  }
  lines.push('\n');

  for (const d of DEMO_DOCUMENTS) {
    lines.push(`INSERT INTO documents (id, winery_id, document_name, document_type, document_url, verification_status, remarks)
VALUES (${esc(d.id)}, ${esc(d.winery_id)}, ${esc(d.document_name)}, ${esc(d.document_type)}, ${esc(d.document_url)}, ${esc(d.verification_status)}, ${esc(d.remarks)})
ON CONFLICT (id) DO UPDATE SET
  verification_status = EXCLUDED.verification_status;`);
  }
  lines.push('\n');

  // 10. Reviews
  lines.push('-- 10. SOMMELIER REVIEWS & RATINGS');
  for (const r of DEMO_REVIEWS) {
    lines.push(`INSERT INTO reviews (id, user_id, winery_id, wine_id, experience_id, event_id, rating, review)
VALUES (${esc(r.id)}, ${esc(r.user_id)}, ${esc(r.winery_id)}, ${esc(r.wine_id)}, ${esc(r.experience_id)}, ${esc(r.event_id)}, ${esc(r.rating)}, ${esc(r.review)})
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  review = EXCLUDED.review;`);
  }
  lines.push('\n');

  lines.push('COMMIT;\n');

  const outputPath = path.resolve(__dirname, '../../../demo_data_seed.sql');
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
  console.log(`✅ SQL Dump successfully generated at: ${outputPath}`);
}

generateSql();
