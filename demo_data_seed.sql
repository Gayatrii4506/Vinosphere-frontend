-- ====================================================================
-- VinoSphere Idempotent Demo Data Seed Export
-- Generated for B.Tech Final Year Project Demonstration
-- Targets: Supabase PostgreSQL
-- Covers: Consumer App, Winery Dashboard, and Admin Dashboard
-- ====================================================================

BEGIN;

-- 1. DEMO USERS
INSERT INTO users (id, email, full_name, phone, role, winery_id, city, state, country, experience_level, favorite_wine_types, primary_interest)
VALUES ('00000000-0000-4000-ba00-000000000999', 'estate@godavarihills.in', 'Rajesh Godavari', '+91 98230 11999', 'winery_admin', '00000000-0000-4000-d000-000000000999', 'Nashik', 'Maharashtra', 'India', 'Advanced', ARRAY['Red', 'Sparkling']::TEXT[], 'Estate Management')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  winery_id = EXCLUDED.winery_id;
INSERT INTO users (id, email, full_name, phone, role, winery_id, city, state, country, experience_level, favorite_wine_types, primary_interest)
VALUES ('00000000-0000-4000-ba00-000000000001', 'ananya.sharma@demo.vinosphere.in', 'Ananya Sharma', '+91 98200 44101', 'user', NULL, 'Mumbai', 'Maharashtra', 'India', 'Intermediate', ARRAY['White', 'Sparkling']::TEXT[], 'Tasting & Food Pairing')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  winery_id = EXCLUDED.winery_id;
INSERT INTO users (id, email, full_name, phone, role, winery_id, city, state, country, experience_level, favorite_wine_types, primary_interest)
VALUES ('00000000-0000-4000-ba00-000000000002', 'vikram.singhania@demo.vinosphere.in', 'Vikramaditya Singhania', '+91 98110 55202', 'user', NULL, 'Pune', 'Maharashtra', 'India', 'Connoisseur', ARRAY['Red']::TEXT[], 'Vintage Collecting')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  winery_id = EXCLUDED.winery_id;
INSERT INTO users (id, email, full_name, phone, role, winery_id, city, state, country, experience_level, favorite_wine_types, primary_interest)
VALUES ('00000000-0000-4000-ba00-000000000003', 'meera.kulkarni@demo.vinosphere.in', 'Dr. Meera Kulkarni', '+91 98220 66303', 'user', NULL, 'Nashik', 'Maharashtra', 'India', 'Advanced', ARRAY['Red', 'Rose']::TEXT[], 'Vineyard Tourism')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  winery_id = EXCLUDED.winery_id;
INSERT INTO users (id, email, full_name, phone, role, winery_id, city, state, country, experience_level, favorite_wine_types, primary_interest)
VALUES ('00000000-0000-4000-ba00-000000000004', 'rohan.deshmukh@demo.vinosphere.in', 'Rohan Deshmukh', '+91 98900 77404', 'user', NULL, 'Bangalore', 'Karnataka', 'India', 'Beginner', ARRAY['White', 'Dessert']::TEXT[], 'Weekend Tours')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  winery_id = EXCLUDED.winery_id;


-- 2. DEMO WINERIES (6 Published, 2 Draft/Pending Approvals, 1 Archived)
INSERT INTO wineries (id, name, slug, description, established_year, email, phone, website, address, city, state, country, latitude, longitude, logo_url, banner_url, opening_time, closing_time, verified, status, awards, timeline)
VALUES ('00000000-0000-4000-d000-000000000999', 'Godavari Hills Estate', 'godavari-hills-estate', 'Flagship boutique estate nestled along the high-elevation banks of the upper Godavari River. Renowned for old-vine Shiraz and handcrafted Méthode Traditionnelle sparkling wines. (Official Demo Estate)', 2014, 'estate@godavarihills.in', '+91 253 294 1101', 'https://godavarihills.demo.vinosphere.in', 'Gangapur Dam Catchment Road, Post Ganghavare', 'Nashik', 'Maharashtra', 'India', 20.0152, 73.7028, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=85', '10:30:00', '21:30:00', TRUE, 'published', '[{"year":2023,"title":"Decanter Asia Wine Awards - Gold","wine":"Reserve Shiraz 2020"},{"year":2024,"title":"Indian Wine Challenge - Best Sparkling Estate","wine":"Cuvée Royale Brut"}]'::JSONB, '[{"year":"2014","title":"Estate Founded","description":"Planted first 35 acres of Shiraz and Chenin Blanc on basalt terroir."},{"year":"2018","title":"Gravity-Flow Winery","description":"Commissioned state-of-the-art temperature-controlled stainless steel cellar."},{"year":"2023","title":"Organic Viticulture","description":"Achieved 100% solar-powered estate and sustainable certification."}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  verified = EXCLUDED.verified,
  status = EXCLUDED.status;
INSERT INTO wineries (id, name, slug, description, established_year, email, phone, website, address, city, state, country, latitude, longitude, logo_url, banner_url, opening_time, closing_time, verified, status, awards, timeline)
VALUES ('00000000-0000-4000-d000-000000000002', 'Sahyadri Valley Wines', 'sahyadri-valley-wines', 'Picturesque hillside estate situated at the foothills of the Western Ghats. Specializing in high-altitude crisp Sauvignon Blanc and elegant Cabernet-Shiraz blends. (Demo Estate)', 2016, 'concierge@sahyadrivalley.demo.in', '+91 253 294 1102', 'https://sahyadrivalley.demo.vinosphere.in', 'Girnare Foothills Route, Taluka Dindori', 'Nashik', 'Maharashtra', 'India', 20.0842, 73.7421, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&q=80', 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=1200&q=85', '11:00:00', '21:00:00', TRUE, 'published', '[{"year":2024,"title":"Sommelier Guild India - Best White Wine","wine":"Sahyadri Reserve Chenin Blanc"}]'::JSONB, '[{"year":"2016","title":"Estate Planted","description":"Terraced vineyards established on late-ripening hillside slopes."}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  verified = EXCLUDED.verified,
  status = EXCLUDED.status;
INSERT INTO wineries (id, name, slug, description, established_year, email, phone, website, address, city, state, country, latitude, longitude, logo_url, banner_url, opening_time, closing_time, verified, status, awards, timeline)
VALUES ('00000000-0000-4000-d000-000000000003', 'Trimbak Vineyards', 'trimbak-vineyards', 'Heritage estate honoring ancestral viticulture traditions near the sacred Brahmagiri hills. Famous for oak-aged full-bodied reds and barrel-fermented Viognier. (Demo Estate)', 2011, 'visit@trimbakvineyards.demo.in', '+91 253 294 1103', 'https://trimbakvineyards.demo.vinosphere.in', 'Trimbak Highway, Near Anjaneri Hills', 'Nashik', 'Maharashtra', 'India', 19.9324, 73.5412, 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=200&q=80', 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=1200&q=85', '10:00:00', '20:30:00', TRUE, 'published', '[{"year":2022,"title":"National Wine Trophy - Best Full Bodied Red","wine":"Brahmagiri Grand Reserve"}]'::JSONB, '[{"year":"2011","title":"First Barrel Stored","description":"French allier oak cellar established for small batch aging."}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  verified = EXCLUDED.verified,
  status = EXCLUDED.status;
INSERT INTO wineries (id, name, slug, description, established_year, email, phone, website, address, city, state, country, latitude, longitude, logo_url, banner_url, opening_time, closing_time, verified, status, awards, timeline)
VALUES ('00000000-0000-4000-d000-000000000004', 'Deccan Crest Winery', 'deccan-crest-winery', 'Modern architectural winery situated on a windy plateau overlooking Godavari waters. Celebrated for refreshing Rosés, fruity Zinfandels, and lively tasting pavilions. (Demo Estate)', 2018, 'hello@deccancrest.demo.in', '+91 253 294 1104', 'https://deccancrest.demo.vinosphere.in', 'Deccan Plateau Road, Govardhan Village', 'Nashik', 'Maharashtra', 'India', 20.0381, 73.6821, 'https://images.unsplash.com/photo-1553122180-2c700cb75571?w=200&q=80', 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=1200&q=85', '11:00:00', '22:00:00', TRUE, 'published', '[{"year":2024,"title":"India Wine Awards - Double Gold Rosé","wine":"Deccan Crest Blush Zinfandel"}]'::JSONB, '[{"year":"2018","title":"Tasting Deck Opened","description":"Unveiled panoramic tasting deck over the Godavari reservoir."}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  verified = EXCLUDED.verified,
  status = EXCLUDED.status;
INSERT INTO wineries (id, name, slug, description, established_year, email, phone, website, address, city, state, country, latitude, longitude, logo_url, banner_url, opening_time, closing_time, verified, status, awards, timeline)
VALUES ('00000000-0000-4000-d000-000000000005', 'Vinewood Estate', 'vinewood-estate', 'Exclusive private estate and boutique cellar offering limited production natural wines and estate-grown Cabernet Franc. (Demo Estate)', 2019, 'contact@vinewoodestate.demo.in', '+91 253 294 1105', 'https://vinewoodestate.demo.vinosphere.in', 'Vaitarna Backwaters Route, Igatpuri-Nashik Belt', 'Nashik', 'Maharashtra', 'India', 19.8211, 73.5512, 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=200&q=80', 'https://images.unsplash.com/photo-1543418219-44e30b057fea?w=1200&q=85', '11:30:00', '20:00:00', TRUE, 'published', '[{"year":2023,"title":"Boutique Producer of the Year","wine":"Vinewood Artisanal Red"}]'::JSONB, '[{"year":"2019","title":"Estate Planted","description":"First biodynamic vineyard planted on gravelly volcanic soils."}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  verified = EXCLUDED.verified,
  status = EXCLUDED.status;
INSERT INTO wineries (id, name, slug, description, established_year, email, phone, website, address, city, state, country, latitude, longitude, logo_url, banner_url, opening_time, closing_time, verified, status, awards, timeline)
VALUES ('00000000-0000-4000-d000-000000000006', 'Nashik Heritage Wines', 'nashik-heritage-wines', 'Pioneering cooperative estate supporting local grape growers across 12 villages, producing high-value crowd-pleasing Chenin Blanc and sparkling brut. (Demo Estate)', 2012, 'info@nashikheritage.demo.in', '+91 253 294 1106', 'https://nashikheritage.demo.vinosphere.in', 'Dindori Wine Highway, Near Pimpalgaon', 'Nashik', 'Maharashtra', 'India', 20.1512, 73.8123, 'https://images.unsplash.com/photo-1614742468798-e7c65d642398?w=200&q=80', 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&q=85', '10:00:00', '21:00:00', TRUE, 'published', '[{"year":2022,"title":"Indian Consumer Choice Award","wine":"Heritage Sparkling Brut"}]'::JSONB, '[{"year":"2012","title":"Cooperative Launch","description":"Partnered with 40 local multi-generational grape farming families."}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  verified = EXCLUDED.verified,
  status = EXCLUDED.status;
INSERT INTO wineries (id, name, slug, description, established_year, email, phone, website, address, city, state, country, latitude, longitude, logo_url, banner_url, opening_time, closing_time, verified, status, awards, timeline)
VALUES ('00000000-0000-4000-d000-000000000007', 'Riverstone Vineyards', 'riverstone-vineyards-pending', 'Newly registered artisanal riverfront vineyard applying for VinoSphere Certified Estate status. Focuses on small-batch organic Grenache. (Pending Admin Verification)', 2024, 'admin@riverstonevineyards.demo.in', '+91 253 294 1107', 'https://riverstone.demo.vinosphere.in', 'Plot 44, Gangapur Backwaters, Someshwar', 'Nashik', 'Maharashtra', 'India', 20.0092, 73.7314, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=85', '11:00:00', '20:00:00', FALSE, 'draft', '[]'::JSONB, '[{"year":"2024","title":"Application Submitted","description":"Submitted FSSAI and Excise permits for certification."}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  verified = EXCLUDED.verified,
  status = EXCLUDED.status;
INSERT INTO wineries (id, name, slug, description, established_year, email, phone, website, address, city, state, country, latitude, longitude, logo_url, banner_url, opening_time, closing_time, verified, status, awards, timeline)
VALUES ('00000000-0000-4000-d000-000000000008', 'Silver Oak Valley', 'silver-oak-valley-pending', 'Upcoming luxury vineyard and wellness resort seeking marketplace listing and sommelier verification. (Pending Admin Verification)', 2024, 'onboarding@silveroakvalley.demo.in', '+91 253 294 1108', 'https://silveroakvalley.demo.vinosphere.in', 'Silver Oak Ridge, Trimbakeshwar Road', 'Nashik', 'Maharashtra', 'India', 19.9481, 73.5932, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&q=80', 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=1200&q=85', '10:00:00', '21:00:00', FALSE, 'draft', '[]'::JSONB, '[{"year":"2024","title":"Estate Construction","description":"Cellar facility completed, awaiting final sensory inspection."}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  verified = EXCLUDED.verified,
  status = EXCLUDED.status;
INSERT INTO wineries (id, name, slug, description, established_year, email, phone, website, address, city, state, country, latitude, longitude, logo_url, banner_url, opening_time, closing_time, verified, status, awards, timeline)
VALUES ('00000000-0000-4000-d000-000000000009', 'Panchavati Cellars', 'panchavati-cellars-archived', 'Historical archive entry for former cooperative cellar whose registration was discontinued. (Archived Record)', 2008, 'archive@panchavati.demo.in', '+91 253 294 1109', 'https://panchavati.demo.vinosphere.in', 'Old Agra Road, Panchavati', 'Nashik', 'Maharashtra', 'India', 20.0121, 73.8012, 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=200&q=80', 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=1200&q=85', '10:00:00', '18:00:00', FALSE, 'archived', '[]'::JSONB, '[{"year":"2008","title":"Historic Record","description":"Archived from platform directory."}]'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  verified = EXCLUDED.verified,
  status = EXCLUDED.status;


-- 3. WINES (35 Varietals across Red, White, Rosé, Sparkling, Dessert)
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000001', '00000000-0000-4000-d000-000000000999', 'Godavari Reserve Shiraz', 'godavari-reserve-shiraz-2021', 'Red', 'Shiraz', 2021, 13.8, 'Full', 'Dry', 'Medium', 'High', '16-18°C', 'Aged for 14 months in medium-toasted French oak barriques. Rich aromas of crushed black pepper, dark ripe plum, and subtle hints of mocha with velvety, structural tannins.', 'Tandoori Lamb Chops, Rogan Josh, Aged Cheddar, Grilled Portobello Mushrooms', 'Black Pepper, Ripe Blackberry, Dark Chocolate, Toasted Vanilla')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000002', '00000000-0000-4000-d000-000000000999', 'Godavari Estate Chenin Blanc', 'godavari-estate-chenin-blanc-2023', 'White', 'Chenin Blanc', 2023, 12.5, 'Medium', 'Off Dry', 'High', 'Medium', '8-10°C', 'Cool-fermented in stainless steel tanks to preserve crisp minerality and vibrant fruit expression. Tropical passion fruit, green apple, and fragrant jasmine notes.', 'Butter Garlic Prawns, Paneer Tikka, Goan Fish Curry, Mild Asian Salads', 'Green Apple, Passion Fruit, Guava, White Jasmine')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000003', '00000000-0000-4000-d000-000000000999', 'Cuvée Royale Brut Sparkling', 'cuvee-royale-brut-sparkling', 'Sparkling', 'Chenin Blanc & Chardonnay', 2022, 12, 'Medium', 'Dry', 'High', 'Medium', '6-8°C', 'Traditional bottle-fermented Méthode Cap Classique aged on yeast lees for 18 months. Delicate persistent perlage with notes of toasted brioche, lemon zest, and crisp pear.', 'Fresh Oysters, Sushi, Canapés, Calamari Fritters, Brie Cheese', 'Toasted Brioche, Crisp Green Pear, Meyer Lemon, Fresh Mineral')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000004', '00000000-0000-4000-d000-000000000999', 'Godavari Valley Cabernet Sauvignon', 'godavari-cabernet-sauvignon-2020', 'Red', 'Cabernet Sauvignon', 2020, 14, 'Full', 'Dry', 'Medium', 'High', '16-18°C', 'Selected from low-yield hilltop blocks. Shows dark cassis, cedar wood, graphite, and dried herbs with firm aging potential.', 'Grilled Ribeye Steak, Mutton Biryani, Roasted Duck, Blue Cheese', 'Blackcurrant, Cedar Wood, Tobacco Leaf, Black Cherry')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000005', '00000000-0000-4000-d000-000000000999', 'Blush Horizon Zinfandel Rosé', 'blush-horizon-zinfandel-rose-2023', 'Rose', 'Zinfandel', 2023, 11.5, 'Light', 'Off Dry', 'Medium', 'Low', '8-10°C', 'Captivating coral pink blush bursting with fresh wild strawberries, cranberry, and hint of rose petals. Refreshing and playful on the palate.', 'Spicy Thai Noodles, Caprese Salad, Grilled Chicken Satay, Fruit Tarts', 'Wild Strawberry, Cranberry, Rose Water, Red Currant')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000006', '00000000-0000-4000-d000-000000000999', 'Godavari Late Harvest Golden Nectar', 'godavari-late-harvest-chenin-2022', 'Dessert', 'Chenin Blanc', 2022, 12, 'Full', 'Sweet', 'High', 'Low', '6-8°C', 'Harvested in late February under warm sunshine. Concentrated golden hues with honeyed apricot, dried mango, and candied ginger balanced by brisk natural acidity.', 'Lemon Cheesecake, Baklava, Gorgonzola, Mango Panna Cotta', 'Honeyed Apricot, Dried Fig, Candied Orange Peel, Wild Honey')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000007', '00000000-0000-4000-d000-000000000999', 'Godavari Barrel Select Merlot', 'godavari-barrel-select-merlot-2021', 'Red', 'Merlot', 2021, 13.5, 'Medium', 'Dry', 'Medium', 'Medium', '15-17°C', 'Plum and ripe red cherry driven palate with subtle hints of sweet clove and French vanilla. Smooth, rounded tannins provide instant drinkability.', 'Roast Chicken with Herbs, Mushroom Risotto, Sheekh Kebabs, Gouda Cheese', 'Ripe Plum, Sweet Clove, Red Cherry, French Oak')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000008', '00000000-0000-4000-d000-000000000999', 'Godavari Artisanal Sauvignon Blanc', 'godavari-artisanal-sauvignon-blanc-2023', 'White', 'Sauvignon Blanc', 2023, 12.8, 'Medium', 'Dry', 'High', 'Low', '8-10°C', 'Zesty lemongrass, gooseberry, and flinty gunsmoke notes from alluvial river silt soils. Crisp and invigorating finish.', 'Goat Cheese Crostini, Grilled Seabass, Tabbouleh, Asparagus Tart', 'Lemongrass, Gooseberry, Cut Grass, Flint Mineral')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000009', '00000000-0000-4000-d000-000000000999', 'Godavari Signature Viognier', 'godavari-signature-viognier-2022', 'White', 'Viognier', 2022, 13.2, 'Full', 'Dry', 'Medium', 'Low', '10-12°C', 'Voluptuous aromas of white peach, honeysuckle, and orange blossom with a creamy, textured mouthfeel from lees stirring.', 'Chicken Korma, Lobster Thermidor, Moroccan Tagine, Brie', 'White Peach, Honeysuckle, Orange Blossom, Almond Paste')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000010', '00000000-0000-4000-d000-000000000999', 'Sparkling Rosé Méthode Champenoise', 'godavari-sparkling-rose-2022', 'Sparkling', 'Pinot Noir & Shiraz', 2022, 12, 'Medium', 'Dry', 'High', 'Low', '6-8°C', 'Pale salmon pink with fine continuous effervescence. Aromas of pomegranate, wild raspberry, and subtle brioche crust.', 'Smoked Salmon, Dim Sum, Berry Tartlets, Charcuterie Boards', 'Pomegranate, Red Raspberry, Brioche, Lemon Curd')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000011', '00000000-0000-4000-d000-000000000999', 'Godavari Founders Heritage Red Blend', 'godavari-founders-heritage-red-2019', 'Red', 'Shiraz & Cabernet Sauvignon', 2019, 14.2, 'Full', 'Dry', 'Medium', 'High', '16-18°C', 'Flagship limited library release aged 20 months in French barriques. Intense complexity of blackcurrant, dark chocolate, tobacco, and balsamic notes.', 'Prime Beef Tenderloin, Lamb Shank Nihari, Truffle Risotto', 'Cassis, Dark Chocolate, Dried Herbs, Balsamic')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000012', '00000000-0000-4000-d000-000000000999', 'Godavari Fortified Tawny Reserve', 'godavari-fortified-tawny-reserve', 'Fortified', 'Shiraz', 2018, 18.5, 'Full', 'Sweet', 'Medium', 'Medium', '12-14°C', 'Solera-aged dessert wine in seasoned oak casks. Deep mahogany color with decadent notes of walnut, dried raisins, caramel, and warm allspice.', 'Dark Chocolate Fondant, Roasted Walnuts, Blue Stilton, Espresso Truffles', 'Walnut, Raisins, Caramel, Allspice, Dark Toffee')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000013', '00000000-0000-4000-d000-000000000002', 'Sahyadri High Altitude Sauvignon Blanc', 'sahyadri-sauvignon-blanc-2023', 'White', 'Sauvignon Blanc', 2023, 12.5, 'Light', 'Dry', 'High', 'Low', '7-9°C', 'Cultivated at 650 meters altitude. Crisp notes of green apple, crushed lime leaves, and vibrant flinty mineral finish.', 'Fish Tikka, Greek Salad, Lemon Butter Calamari', 'Green Apple, Lime Zest, Crushed Slate, Fresh Herbs')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000014', '00000000-0000-4000-d000-000000000002', 'Sahyadri Hillside Cabernet-Shiraz', 'sahyadri-hillside-cab-shiraz-2022', 'Red', 'Cabernet Sauvignon & Shiraz', 2022, 13.5, 'Full', 'Dry', 'Medium', 'Medium', '16-18°C', 'Harmonious blend displaying spiced blackberry, dark cherry, and gentle oak vanilla with soft approachable tannins.', 'Mutton Seekh Kebab, Grilled Lamb Chops, Lasagna', 'Spiced Blackberry, Red Cherry, Oak Vanilla, Black Pepper')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000015', '00000000-0000-4000-d000-000000000002', 'Sahyadri Valley Grenache Rosé', 'sahyadri-grenache-rose-2023', 'Rose', 'Grenache', 2023, 12, 'Light', 'Dry', 'High', 'Low', '8-10°C', 'Dry Mediterranean-style rosé with wild strawberry, dried herbs, and pink grapefruit aromas.', 'Mediterranean Mezze, Grilled Prawns, Watermelon Feta Salad', 'Pink Grapefruit, Wild Strawberry, Thyme, Mineral')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000016', '00000000-0000-4000-d000-000000000002', 'Sahyadri Reserve Chardonnay', 'sahyadri-reserve-chardonnay-2022', 'White', 'Chardonnay', 2022, 13, 'Full', 'Dry', 'Medium', 'Low', '10-12°C', 'Lightly oaked with buttery brioche, yellow apple, and toasted macadamia notes with a silky finish.', 'Grilled Salmon, Butter Chicken, Creamy Pasta, Brie', 'Yellow Apple, Brioche, Macadamia Nut, Sweet Butter')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000017', '00000000-0000-4000-d000-000000000002', 'Sahyadri Noble Rot Riesling', 'sahyadri-noble-rot-riesling-2021', 'Dessert', 'Riesling', 2021, 10.5, 'Medium', 'Sweet', 'High', 'Low', '6-8°C', 'Rare botrytis-affected sweet Riesling showing wild honey, candied pineapple, and lime marmalade.', 'Blue Cheese, Fruit Tarts, Crème Brûlée, Roasted Figs', 'Candied Pineapple, Wild Honey, Lime Marmalade, Beeswax')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000018', '00000000-0000-4000-d000-000000000003', 'Brahmagiri Grand Reserve Shiraz', 'brahmagiri-grand-reserve-shiraz-2020', 'Red', 'Shiraz', 2020, 14.2, 'Full', 'Dry', 'Medium', 'High', '17-19°C', 'Aged 18 months in new French Allier oak. Opaque ruby red with ripe dark forest fruit, clove, roasted coffee bean, and dark chocolate.', 'Braised Beef Short Ribs, Venison, Smoked Meats, Aged Gouda', 'Dark Plum, Clove, Roasted Coffee, Dark Cocoa')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000019', '00000000-0000-4000-d000-000000000003', 'Trimbak Heritage Cabernet Franc', 'trimbak-heritage-cabernet-franc-2021', 'Red', 'Cabernet Franc', 2021, 13.6, 'Medium', 'Dry', 'High', 'Medium', '15-17°C', 'Vibrant red currant, roasted red bell pepper, and graphite minerality with firm acidity.', 'Herb-Crusted Pork Loin, Duck Confit, Grilled Vegetables', 'Red Currant, Roasted Bell Pepper, Graphite, Dried Herbs')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000020', '00000000-0000-4000-d000-000000000003', 'Trimbak Oak Barrel Viognier', 'trimbak-barrel-viognier-2022', 'White', 'Viognier', 2022, 13.5, 'Full', 'Dry', 'Medium', 'Low', '10-12°C', 'Barrel fermented with wild native yeast. Rich aromas of apricot jam, gardenia blossoms, and toasted almond.', 'Crab Curry, Roasted Turkey, Thai Yellow Curry', 'Apricot Jam, Gardenia, Vanilla Bean, Toasted Almond')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000021', '00000000-0000-4000-d000-000000000003', 'Trimbak Valley Blanc de Blancs Brut', 'trimbak-blanc-de-blancs-brut', 'Sparkling', 'Chardonnay', 2021, 12.2, 'Medium', 'Dry', 'High', 'Low', '6-8°C', '100% Chardonnay sparkling wine aged 24 months on fine lees. Brioche, green apple, and creamy chalky finish.', 'Caviar, Lobster Roll, Truffle Popcorn, Parmesan Crisps', 'Brioche, Green Apple, Chalky Mineral, Lemon Curd')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000022', '00000000-0000-4000-d000-000000000003', 'Trimbak Estate Zinfandel', 'trimbak-estate-zinfandel-2022', 'Red', 'Zinfandel', 2022, 14.5, 'Full', 'Off Dry', 'Medium', 'Medium', '16-18°C', 'Generous ripe blackberry jam, black pepper spice, and dark fig with warm comforting finish.', 'Barbecue Pulled Pork, Spicy Sausage Pizza, Grilled Burgers', 'Blackberry Jam, Fig, Black Pepper, Cinnamon')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000023', '00000000-0000-4000-d000-000000000004', 'Deccan Crest Blush Zinfandel', 'deccan-crest-blush-zinfandel-2023', 'Rose', 'Zinfandel', 2023, 11.5, 'Light', 'Off Dry', 'Medium', 'Low', '7-9°C', 'India Wine Awards Double Gold winner. Bright watermelon, ripe strawberry, and cotton candy aromas with balanced sweetness.', 'Spicy Chicken Wings, Dim Sum, Fresh Fruit Platter', 'Watermelon, Strawberry, Cotton Candy, Citrus')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000024', '00000000-0000-4000-d000-000000000004', 'Deccan Crest Plateau Chenin Blanc', 'deccan-crest-plateau-chenin-2023', 'White', 'Chenin Blanc', 2023, 12, 'Light', 'Off Dry', 'Medium', 'Low', '8-10°C', 'Crisp and fruit-forward with juicy pineapple, sweet lime, and white floral fragrance.', 'Paneer Makhani, Vegetable Biryani, Fried Calamari', 'Juicy Pineapple, Sweet Lime, White Jasmine, Honey')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000025', '00000000-0000-4000-d000-000000000004', 'Deccan Crest Smooth Shiraz', 'deccan-crest-smooth-shiraz-2022', 'Red', 'Shiraz', 2022, 13, 'Medium', 'Dry', 'Medium', 'Medium', '16-18°C', 'Ripe mulberry, crushed pepper, and subtle mocha notes designed for everyday celebration.', 'Chicken Tikka, Pepperoni Pizza, Kebabs', 'Mulberry, Red Cherry, Black Pepper, Mocha')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000026', '00000000-0000-4000-d000-000000000004', 'Deccan Crest Sparkling Moscato', 'deccan-crest-sparkling-moscato-2023', 'Sparkling', 'Moscato', 2023, 8.5, 'Light', 'Sweet', 'High', 'Low', '5-7°C', 'Low-alcohol, fragrant sweet sparkling wine brimming with peach, orange blossom, and honeydew melon.', 'Fruit Salads, Fruit Tarts, Mild Cheeses, Light Pastries', 'Peach, Orange Blossom, Honeydew, Citrus Fizz')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000027', '00000000-0000-4000-d000-000000000005', 'Vinewood Biodynamic Pinot Noir', 'vinewood-biodynamic-pinot-noir-2022', 'Red', 'Pinot Noir', 2022, 13, 'Light', 'Dry', 'High', 'Low', '14-16°C', 'Delicate cool-climate Pinot Noir with wild cherry, forest floor, and damp earth notes with silky fine tannins.', 'Pan-Seared Duck Breast, Wild Mushroom Pasta, Roasted Beetroot', 'Wild Cherry, Forest Floor, Rose Petals, Earth')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000028', '00000000-0000-4000-d000-000000000005', 'Vinewood Natural Pet-Nat Sparkling', 'vinewood-natural-pet-nat-2023', 'Sparkling', 'Chenin Blanc', 2023, 11, 'Light', 'Dry', 'High', 'Low', '7-9°C', 'Ancestral method Pétillant Naturel unfiltered sparkling with cloudy golden sheen, raw pear, and cider apple notes.', 'Artisanal Charcuterie, Sourdough Bread, Fermented Cheeses', 'Raw Pear, Cider Apple, Lemon Yeast, Saline Mineral')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000029', '00000000-0000-4000-d000-000000000005', 'Vinewood Artisanal Cabernet Franc', 'vinewood-artisanal-cab-franc-2021', 'Red', 'Cabernet Franc', 2021, 13.8, 'Medium', 'Dry', 'Medium', 'Medium', '16-18°C', 'Small-batch basket pressed red with black raspberry, crushed stones, and delicate violet notes.', 'Roast Lamb, Grilled Eggplant, Truffle Gnocchi', 'Black Raspberry, Violet, Crushed Stones, Tobacco')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000030', '00000000-0000-4000-d000-000000000005', 'Vinewood Skin-Contact Orange Wine', 'vinewood-skin-contact-orange-2022', 'White', 'Chenin Blanc & Viognier', 2022, 12.5, 'Medium', 'Dry', 'High', 'Medium', '11-13°C', 'White grapes fermented on skins for 28 days in terracotta amphorae. Dried apricot, bergamot tea, and structural tannic grip.', 'Indian Spiced Mutton, Korean Kimchi Fried Rice, Aged Hard Cheeses', 'Dried Apricot, Bergamot Tea, Dried Orange, Almond')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000031', '00000000-0000-4000-d000-000000000006', 'Heritage Classic Chenin Blanc', 'heritage-classic-chenin-blanc-2023', 'White', 'Chenin Blanc', 2023, 12, 'Medium', 'Off Dry', 'Medium', 'Low', '8-10°C', 'Refreshing aromas of green apple, lime cordial, and tropical pineapple. Smooth, crowd-pleasing finish.', 'Vegetable Pakoras, Fish Amritsari, Chicken Tikka', 'Green Apple, Lime Cordial, Pineapple, Honey')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000032', '00000000-0000-4000-d000-000000000006', 'Heritage Reserve Shiraz-Cabernet', 'heritage-reserve-shiraz-cabernet-2022', 'Red', 'Shiraz & Cabernet Sauvignon', 2022, 13.5, 'Medium', 'Dry', 'Medium', 'Medium', '16-18°C', 'Ripe blackberry, black pepper, and subtle oak spice. Well structured and easy drinking.', 'Tandoori Chicken, Mutton Curry, Grilled Burgers', 'Blackberry, Black Pepper, Oak Spice, Vanilla')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000033', '00000000-0000-4000-d000-000000000006', 'Heritage Sparkling Brut', 'heritage-sparkling-brut-2022', 'Sparkling', 'Chenin Blanc & Ugni Blanc', 2022, 12, 'Medium', 'Dry', 'High', 'Low', '6-8°C', 'Award-winning celebratory sparkling with fine bubbles, toasted yeast, and lemon pear flavors.', 'Paneer Pakora, Samosas, Salted Cashews, Canapés', 'Toasted Yeast, Crisp Pear, Lemon Zest, Green Apple')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000034', '00000000-0000-4000-d000-000000000006', 'Heritage Valley Zinfandel Rosé', 'heritage-valley-zinfandel-rose-2023', 'Rose', 'Zinfandel', 2023, 11.5, 'Light', 'Off Dry', 'Medium', 'Low', '7-9°C', 'Vibrant salmon pink with juicy raspberry, red cherry, and a hint of mint.', 'Prawn Biryani, Spring Rolls, Goat Cheese Salad', 'Raspberry, Red Cherry, Mint, Fresh Strawberry')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;
INSERT INTO wines (id, winery_id, name, slug, wine_type, grape_variety, vintage, alcohol_percentage, body, sweetness, acidity, tannin, serving_temperature, description, food_pairings, taste_notes)
VALUES ('00000000-0000-4000-ca00-000000000035', '00000000-0000-4000-d000-000000000006', 'Heritage Golden Harvest Dessert Wine', 'heritage-golden-harvest-2022', 'Dessert', 'Chenin Blanc', 2022, 11.5, 'Full', 'Sweet', 'High', 'Low', '6-8°C', 'Sweet golden late harvest nectar with dried peach, honey, and orange zest.', 'Gulab Jamun with Ice Cream, Apple Pie, Blue Cheese', 'Dried Peach, Honey, Orange Zest, Caramel')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  wine_type = EXCLUDED.wine_type,
  grape_variety = EXCLUDED.grape_variety;


-- 4. WINE INVENTORY (Prices in INR, Stock Quantities, SKUs, Featured)
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000001', '00000000-0000-4000-ca00-000000000001', 'GHE-SHZ-2021', 1850, 240, TRUE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000002', '00000000-0000-4000-ca00-000000000002', 'GHE-CHB-2023', 950, 380, TRUE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000003', '00000000-0000-4000-ca00-000000000003', 'GHE-BRT-2022', 1950, 180, TRUE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000004', '00000000-0000-4000-ca00-000000000004', 'GHE-CS-2020', 2200, 150, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000005', '00000000-0000-4000-ca00-000000000005', 'GHE-ROS-2023', 850, 320, TRUE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000006', '00000000-0000-4000-ca00-000000000006', 'GHE-LH-2022', 1450, 110, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000007', '00000000-0000-4000-ca00-000000000007', 'GHE-MER-2021', 1350, 210, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000008', '00000000-0000-4000-ca00-000000000008', 'GHE-SB-2023', 1150, 290, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000009', '00000000-0000-4000-ca00-000000000009', 'GHE-VIO-2022', 1650, 95, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000010', '00000000-0000-4000-ca00-000000000010', 'GHE-SROS-2022', 2150, 140, TRUE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000011', '00000000-0000-4000-ca00-000000000011', 'GHE-FND-2019', 2950, 65, TRUE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000012', '00000000-0000-4000-ca00-000000000012', 'GHE-TWN-2018', 2400, 80, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000013', '00000000-0000-4000-ca00-000000000013', 'SVW-SB-2023', 990, 310, TRUE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000014', '00000000-0000-4000-ca00-000000000014', 'SVW-CS-2022', 1250, 260, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000015', '00000000-0000-4000-ca00-000000000015', 'SVW-ROS-2023', 890, 280, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000016', '00000000-0000-4000-ca00-000000000016', 'SVW-CHD-2022', 1550, 130, TRUE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000017', '00000000-0000-4000-ca00-000000000017', 'SVW-DES-2021', 2100, 75, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000018', '00000000-0000-4000-ca00-000000000018', 'TBV-SHZ-2020', 2600, 110, TRUE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000019', '00000000-0000-4000-ca00-000000000019', 'TBV-CF-2021', 1750, 140, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000020', '00000000-0000-4000-ca00-000000000020', 'TBV-VIO-2022', 1550, 160, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000021', '00000000-0000-4000-ca00-000000000021', 'TBV-BDB-2021', 2450, 90, TRUE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000022', '00000000-0000-4000-ca00-000000000022', 'TBV-ZIN-2022', 1390, 220, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000023', '00000000-0000-4000-ca00-000000000023', 'DCW-BLU-2023', 790, 450, TRUE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000024', '00000000-0000-4000-ca00-000000000024', 'DCW-CHB-2023', 750, 520, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000025', '00000000-0000-4000-ca00-000000000025', 'DCW-SHZ-2022', 990, 340, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000026', '00000000-0000-4000-ca00-000000000026', 'DCW-MOS-2023', 1100, 260, TRUE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000027', '00000000-0000-4000-ca00-000000000027', 'VWE-PN-2022', 2400, 110, TRUE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000028', '00000000-0000-4000-ca00-000000000028', 'VWE-PET-2023', 1800, 95, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000029', '00000000-0000-4000-ca00-000000000029', 'VWE-CF-2021', 2100, 85, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000030', '00000000-0000-4000-ca00-000000000030', 'VWE-ORG-2022', 2250, 70, TRUE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000031', '00000000-0000-4000-ca00-000000000031', 'NHW-CHB-2023', 780, 480, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000032', '00000000-0000-4000-ca00-000000000032', 'NHW-SRC-2022', 1100, 360, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000033', '00000000-0000-4000-ca00-000000000033', 'NHW-BRT-2022', 1350, 220, TRUE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000034', '00000000-0000-4000-ca00-000000000034', 'NHW-ROS-2023', 820, 390, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;
INSERT INTO wine_inventory (id, wine_id, sku, price, stock_quantity, featured, publish_status)
VALUES ('00000000-0000-4000-da00-000000000035', '00000000-0000-4000-ca00-000000000035', 'NHW-DES-2022', 1250, 110, FALSE, 'published')
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  featured = EXCLUDED.featured;


-- 5. WINE IMAGES (Primary Bottle Imagery)
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000001', '00000000-0000-4000-ca00-000000000001', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_1', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000002', '00000000-0000-4000-ca00-000000000002', 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_2', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000003', '00000000-0000-4000-ca00-000000000003', 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_3', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000004', '00000000-0000-4000-ca00-000000000004', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_4', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000005', '00000000-0000-4000-ca00-000000000005', 'https://images.unsplash.com/photo-1553122180-2c700cb75571?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_5', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000006', '00000000-0000-4000-ca00-000000000006', 'https://images.unsplash.com/photo-1614742468798-e7c65d642398?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_6', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000007', '00000000-0000-4000-ca00-000000000007', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_7', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000008', '00000000-0000-4000-ca00-000000000008', 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_8', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000009', '00000000-0000-4000-ca00-000000000009', 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_9', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000010', '00000000-0000-4000-ca00-000000000010', 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_10', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000011', '00000000-0000-4000-ca00-000000000011', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_11', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000012', '00000000-0000-4000-ca00-000000000012', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_12', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000013', '00000000-0000-4000-ca00-000000000013', 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_13', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000014', '00000000-0000-4000-ca00-000000000014', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_14', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000015', '00000000-0000-4000-ca00-000000000015', 'https://images.unsplash.com/photo-1553122180-2c700cb75571?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_15', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000016', '00000000-0000-4000-ca00-000000000016', 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_16', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000017', '00000000-0000-4000-ca00-000000000017', 'https://images.unsplash.com/photo-1614742468798-e7c65d642398?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_17', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000018', '00000000-0000-4000-ca00-000000000018', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_18', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000019', '00000000-0000-4000-ca00-000000000019', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_19', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000020', '00000000-0000-4000-ca00-000000000020', 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_20', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000021', '00000000-0000-4000-ca00-000000000021', 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_21', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000022', '00000000-0000-4000-ca00-000000000022', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_22', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000023', '00000000-0000-4000-ca00-000000000023', 'https://images.unsplash.com/photo-1553122180-2c700cb75571?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_23', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000024', '00000000-0000-4000-ca00-000000000024', 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_24', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000025', '00000000-0000-4000-ca00-000000000025', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_25', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000026', '00000000-0000-4000-ca00-000000000026', 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_26', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000027', '00000000-0000-4000-ca00-000000000027', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_27', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000028', '00000000-0000-4000-ca00-000000000028', 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_28', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000029', '00000000-0000-4000-ca00-000000000029', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_29', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000030', '00000000-0000-4000-ca00-000000000030', 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_30', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000031', '00000000-0000-4000-ca00-000000000031', 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_31', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000032', '00000000-0000-4000-ca00-000000000032', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_32', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000033', '00000000-0000-4000-ca00-000000000033', 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_33', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000034', '00000000-0000-4000-ca00-000000000034', 'https://images.unsplash.com/photo-1553122180-2c700cb75571?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_34', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;
INSERT INTO wine_images (id, wine_id, image_url, public_id, display_order, is_primary)
VALUES ('00000000-0000-4000-db00-000000000035', '00000000-0000-4000-ca00-000000000035', 'https://images.unsplash.com/photo-1614742468798-e7c65d642398?w=600&auto=format&fit=crop&q=80', 'demo_wine_img_35', 1, TRUE)
ON CONFLICT (id) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  is_primary = EXCLUDED.is_primary;


-- 6. UPCOMING EVENTS (Scheduled Dec 2026 - Mar 2027)
INSERT INTO events (id, winery_id, title, description, event_date, start_time, end_time, capacity, available_slots, price, banner_image, publish_status, event_status, tags, gallery_images, highlights, inclusions, rating, host_info)
VALUES ('00000000-0000-4000-e000-000000000001', '00000000-0000-4000-d000-000000000999', 'Nashik Winter Harvest & Grape Stomping Festival 2026', 'Celebrate the commencement of the 2026-27 harvest season at Godavari Hills Estate. Traditional wooden vat grape stomping, live acoustic vineyard music, unlimited estate tasting, and lavish buffet.', '2026-12-20', '11:00:00', '18:00:00', 150, 85, 2499, 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=1200&q=85', 'published', 'upcoming', ARRAY['Harvest Festival', 'Grape Stomping', 'Live Music', 'Family Friendly']::TEXT[], ARRAY['https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80', 'https://images.unsplash.com/photo-1543418219-44e30b057fea?w=800&q=80']::TEXT[], ARRAY['Traditional Wooden Tub Grape Stomping', 'Guided Cellar Tasting of 6 Vintages', 'Farm-to-Fork Harvest Lunch']::TEXT[], ARRAY['Souvenir Tasting Glass', 'Buffet Lunch & High Tea', 'All Tasting Flights', 'Harvest Hat']::TEXT[], 4.9, '{"host_name":"Rajesh Godavari","contact_phone":"+91 253 294 1101","booking_status":"Open","booking_deadline":"2026-12-18"}'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  event_date = EXCLUDED.event_date,
  event_status = EXCLUDED.event_status;
INSERT INTO events (id, winery_id, title, description, event_date, start_time, end_time, capacity, available_slots, price, banner_image, publish_status, event_status, tags, gallery_images, highlights, inclusions, rating, host_info)
VALUES ('00000000-0000-4000-e000-000000000002', '00000000-0000-4000-d000-000000000999', 'Sunset Jazz & Reserve Shiraz Soirée', 'An intimate evening of live jazz quartet performances on the panoramic amphitheater lawn overlooking the Godavari reservoir, paired with aged reserve reds and gourmet tapas.', '2027-01-09', '17:30:00', '22:00:00', 80, 42, 3200, 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=1200&q=85', 'published', 'upcoming', ARRAY['Live Jazz', 'Reserve Shiraz', 'Sunset View', 'Gourmet Tapas']::TEXT[], ARRAY['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80']::TEXT[], ARRAY['Live Jazz Quartet Performance', 'Exclusive 2019 Library Vintage Pour', 'Artisanal Cheese & Tapas Bar']::TEXT[], ARRAY['Welcome Glass of Sparkling Brut', '4 Premium Wine Tastings', 'Gourmet Dinner Tapas']::TEXT[], 5, '{"host_name":"Sommelier Team","contact_phone":"+91 253 294 1101","booking_status":"Open","booking_deadline":"2027-01-07"}'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  event_date = EXCLUDED.event_date,
  event_status = EXCLUDED.event_status;
INSERT INTO events (id, winery_id, title, description, event_date, start_time, end_time, capacity, available_slots, price, banner_image, publish_status, event_status, tags, gallery_images, highlights, inclusions, rating, host_info)
VALUES ('00000000-0000-4000-e000-000000000003', '00000000-0000-4000-d000-000000000999', 'French Oak Barrel Tasting Masterclass', 'Rare opportunity to taste unfinished vintages straight from French and American oak barrels alongside Chief Winemaker, exploring the alchemy of wood aging.', '2027-01-23', '14:00:00', '17:30:00', 35, 18, 4500, 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=1200&q=85', 'published', 'upcoming', ARRAY['Masterclass', 'Barrel Tasting', 'Winemaker Guided', 'VIP Exclusive']::TEXT[], '[]'::JSONB, ARRAY['Direct Barrel Extraction with Wine Thief', 'Comparative French vs American Oak Profiling', 'Charcuterie Pairing']::TEXT[], ARRAY['Winemaker Certificate', '5 Barrel Samples + 3 Finished Vintages', 'Artisanal Charcuterie Board']::TEXT[], 4.95, '{"host_name":"Chief Winemaker","booking_status":"Open","booking_deadline":"2027-01-21"}'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  event_date = EXCLUDED.event_date,
  event_status = EXCLUDED.event_status;
INSERT INTO events (id, winery_id, title, description, event_date, start_time, end_time, capacity, available_slots, price, banner_image, publish_status, event_status, tags, gallery_images, highlights, inclusions, rating, host_info)
VALUES ('00000000-0000-4000-e000-000000000004', '00000000-0000-4000-d000-000000000002', 'Sahyadri High-Altitude Wine & Barbecue Fair', 'Crisp mountain breezes and sizzling grill specialties paired with Sahyadri Valley Sauvignon Blanc and hillside Cabernet-Shiraz.', '2027-02-06', '12:00:00', '19:00:00', 120, 64, 1999, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&q=85', 'published', 'upcoming', ARRAY['Barbecue', 'Mountain View', 'Outdoor', 'Tasting']::TEXT[], '[]'::JSONB, ARRAY['Live Charcoal Grills', 'Hilltop Vineyard Views', 'Guided Tasting Pavilion']::TEXT[], ARRAY['4 Wine Tasting Tokens', 'Unlimited Barbecue Skewers & Salads']::TEXT[], 4.8, '{"booking_status":"Open","booking_deadline":"2027-02-04"}'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  event_date = EXCLUDED.event_date,
  event_status = EXCLUDED.event_status;
INSERT INTO events (id, winery_id, title, description, event_date, start_time, end_time, capacity, available_slots, price, banner_image, publish_status, event_status, tags, gallery_images, highlights, inclusions, rating, host_info)
VALUES ('00000000-0000-4000-e000-000000000005', '00000000-0000-4000-d000-000000000003', 'Valentine’s Sparkling Romance Dinner', 'Candlelit 5-course gourmet dinner beneath starlit Brahmagiri hills, featuring vintage Blanc de Blancs brut and chocolate pairings for couples.', '2027-02-14', '19:30:00', '23:00:00', 50, 22, 4999, 'https://images.unsplash.com/photo-1594261899853-27e6c210ab6e?w=1200&q=85', 'published', 'upcoming', ARRAY['Valentines', 'Romance', '5-Course Dinner', 'Sparkling Wine']::TEXT[], '[]'::JSONB, ARRAY['5-Course Degustation Menu', 'Champagne Sabre Demonstration', 'Live Harp Performance']::TEXT[], ARRAY['Bottle of Vintage Sparkling Brut per Couple', '5-Course Dinner', 'Handcrafted Chocolate Box']::TEXT[], 5, '{"booking_status":"Open","booking_deadline":"2027-02-12"}'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  event_date = EXCLUDED.event_date,
  event_status = EXCLUDED.event_status;
INSERT INTO events (id, winery_id, title, description, event_date, start_time, end_time, capacity, available_slots, price, banner_image, publish_status, event_status, tags, gallery_images, highlights, inclusions, rating, host_info)
VALUES ('00000000-0000-4000-e000-000000000006', '00000000-0000-4000-d000-000000000004', 'Deccan Sunset Rosé & Salsa Evening', 'Celebrate lively weekend vibes with introductory salsa dancing lessons on the Deccan Crest terrace, chilled Blush Zinfandel, and woodfired pizzas.', '2027-02-27', '18:00:00', '22:30:00', 100, 50, 1499, 'https://images.unsplash.com/photo-1553122180-2c700cb75571?w=1200&q=85', 'published', 'upcoming', ARRAY['Rosé', 'Salsa Dancing', 'Woodfired Pizza', 'Party']::TEXT[], '[]'::JSONB, ARRAY['Salsa Instructor Workshop', 'Chilled Rosé Fountain', 'Woodfired Neapolitan Pizza']::TEXT[], ARRAY['3 Glasses of Rosé', 'Individual Artisanal Pizza', 'Dance Session Entry']::TEXT[], 4.85, '{"booking_status":"Open","booking_deadline":"2027-02-25"}'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  event_date = EXCLUDED.event_date,
  event_status = EXCLUDED.event_status;
INSERT INTO events (id, winery_id, title, description, event_date, start_time, end_time, capacity, available_slots, price, banner_image, publish_status, event_status, tags, gallery_images, highlights, inclusions, rating, host_info)
VALUES ('00000000-0000-4000-e000-000000000007', '00000000-0000-4000-d000-000000000005', 'Spring Equinox Biodynamic Vineyard Walk & Brunch', 'An educational walking tour exploring lunar planting cycles, organic compost preparation, and cover crops at Vinewood Estate, followed by natural wine pairing brunch.', '2027-03-20', '09:30:00', '14:00:00', 40, 25, 2799, 'https://images.unsplash.com/photo-1543418219-44e30b057fea?w=1200&q=85', 'published', 'upcoming', ARRAY['Biodynamic', 'Vineyard Walk', 'Organic Brunch', 'Natural Wine']::TEXT[], '[]'::JSONB, ARRAY['Hands-on Biodynamic Soil Exploration', 'Pet-Nat Tasting in the Vines', 'Organic Farm-to-Table Brunch']::TEXT[], ARRAY['Guided Viticulture Tour', 'Full Organic Brunch', '3 Natural Wine Tastings']::TEXT[], 4.9, '{"booking_status":"Open","booking_deadline":"2027-03-18"}'::JSONB)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  event_date = EXCLUDED.event_date,
  event_status = EXCLUDED.event_status;


-- 7. CURATED ESTATE EXPERIENCES
INSERT INTO experiences (id, winery_id, title, description, experience_type, duration_minutes, capacity, price, cover_image, publish_status, tags, gallery_images, highlights, inclusions)
VALUES ('00000000-0000-4000-fa00-000000000001', '00000000-0000-4000-d000-000000000999', 'Signature Cellar Tour & Guided Sommelier Tasting', 'Comprehensive guided walkthrough of Godavari Hills Estate gravity-flow fermentation tanks, barrel aging cellar, and automated bottling line, followed by a tutored tasting of 5 flagship wines.', 'Cellar Tour & Tasting', 75, 25, 1200, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80', 'published', ARRAY['Cellar Tour', 'Sommelier Led', 'Tasting Flight', 'Bestseller']::TEXT[], ARRAY['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80', 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=800&q=80']::TEXT[], ARRAY['Exclusive access to underground barrel vault', 'Sensory tasting wheel guidance', 'Q&A with certified sommelier']::TEXT[], ARRAY['Tasting flight of 5 award-winning wines', 'Fresh water crackers & pallete cleansers', '10% discount voucher at estate shop']::TEXT[])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price;
INSERT INTO experiences (id, winery_id, title, description, experience_type, duration_minutes, capacity, price, cover_image, publish_status, tags, gallery_images, highlights, inclusions)
VALUES ('00000000-0000-4000-fa00-000000000002', '00000000-0000-4000-d000-000000000999', 'Master Sensory Blending Workshop', 'Become a winemaker for an afternoon! Learn the intricate art of blending Shiraz, Cabernet, and Merlot under winemaker guidance, bottle your own custom vintage, and cork it to take home.', 'Interactive Workshop', 120, 15, 2800, 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800&q=80', 'published', ARRAY['Hands-on', 'Blending Workshop', 'Take-Home Bottle', 'Masterclass']::TEXT[], '[]'::JSONB, ARRAY['Hands-on measuring cylinders and barrel samples', 'Personalized custom label printing', 'Hand-corking and wax dipping']::TEXT[], ARRAY['Personal 750ml custom blend bottle', 'Workshop booklet & aroma kit access', 'Gourmet cheese platter']::TEXT[])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price;
INSERT INTO experiences (id, winery_id, title, description, experience_type, duration_minutes, capacity, price, cover_image, publish_status, tags, gallery_images, highlights, inclusions)
VALUES ('00000000-0000-4000-fa00-000000000003', '00000000-0000-4000-d000-000000000999', 'Private Hilltop Vineyard Walk & Sunset Picnic', 'An exclusive couple or family experience. Stroll through the lush vines to a secluded hilltop pavilion overlooking the Godavari reservoir, featuring a curated wicker picnic basket.', 'Private Experience', 90, 6, 3500, 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?w=800&q=80', 'published', ARRAY['Private', 'Romantic', 'Picnic Basket', 'Sunset']::TEXT[], '[]'::JSONB, ARRAY['Private reserved hilltop pavilion', 'Chilled bottle of Cuvée Royale Brut', 'Artisanal cheese, sourdough, and charcuterie']::TEXT[], ARRAY['Full bottle of Sparkling Wine', 'Deluxe picnic basket for 2-4', 'Dedicated estate concierge service']::TEXT[])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price;
INSERT INTO experiences (id, winery_id, title, description, experience_type, duration_minutes, capacity, price, cover_image, publish_status, tags, gallery_images, highlights, inclusions)
VALUES ('00000000-0000-4000-fa00-000000000004', '00000000-0000-4000-d000-000000000002', 'Sahyadri Terrace Tasting & Cheese Harmony', 'Relax on the terraced stone patio with panoramic mountain vistas while tasting 4 high-altitude whites and rosés matched with artisanal Maharashtra cheeses.', 'Wine & Cheese Pairing', 60, 20, 1500, 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=800&q=80', 'published', ARRAY['Wine & Cheese', 'Scenic View', 'Relaxed']::TEXT[], '[]'::JSONB, ARRAY['4 artisanal cheese selections', 'Panoramic mountain view deck', 'Sommelier flavor matching']::TEXT[], ARRAY['4 Wine Tastings', 'Artisanal Cheese Board with preserves']::TEXT[])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price;
INSERT INTO experiences (id, winery_id, title, description, experience_type, duration_minutes, capacity, price, cover_image, publish_status, tags, gallery_images, highlights, inclusions)
VALUES ('00000000-0000-4000-fa00-000000000005', '00000000-0000-4000-d000-000000000003', 'Brahmagiri Heritage Barrel & Cellar Vault Tour', 'Discover the heritage of Trimbak viticulture with a private tour of subterranean stone cellar vaults and tasting of aged reserve vintages.', 'Heritage Tour', 75, 18, 1800, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80', 'published', ARRAY['Heritage Cellar', 'Aged Reds', 'Stone Vaults']::TEXT[], '[]'::JSONB, ARRAY['Ancient subterranean vault access', '3 Reserve Vintage Tastings', 'Historical estate storytelling']::TEXT[], ARRAY['Tasting flight of 4 wines', 'Tasting notes journal', 'Estate crystal glass']::TEXT[])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price;
INSERT INTO experiences (id, winery_id, title, description, experience_type, duration_minutes, capacity, price, cover_image, publish_status, tags, gallery_images, highlights, inclusions)
VALUES ('00000000-0000-4000-fa00-000000000006', '00000000-0000-4000-d000-000000000005', 'Vinewood Amphora & Natural Wine Tasting', 'Explore the natural and biodynamic winemaking movement. Sample unfiltered wines poured directly from terracotta amphora vessels.', 'Natural Wine Discovery', 60, 12, 2200, 'https://images.unsplash.com/photo-1543418219-44e30b057fea?w=800&q=80', 'published', ARRAY['Natural Wine', 'Amphora', 'Biodynamic', 'Orange Wine']::TEXT[], '[]'::JSONB, ARRAY['Terracotta amphora room inspection', 'Orange wine tasting', 'Biodynamic viticulture tutorial']::TEXT[], ARRAY['4 Natural & Amphora wine pours', 'Fermented pairing snacks']::TEXT[])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price;


-- 8. BOOKINGS HISTORY (Completed, Confirmed, Pending, Cancelled)
INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES ('00000000-0000-4000-bb00-000000000001', '00000000-0000-4000-ba00-000000000001', '00000000-0000-4000-d000-000000000999', NULL, '00000000-0000-4000-fa00-000000000001', '2026-11-02', '11:30:00', 2, 2400, 'paid', 'completed', 'Anniversary celebration, prefer window table')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;
INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES ('00000000-0000-4000-bb00-000000000002', '00000000-0000-4000-ba00-000000000002', '00000000-0000-4000-d000-000000000999', NULL, '00000000-0000-4000-fa00-000000000002', '2026-11-05', '14:00:00', 4, 11200, 'paid', 'completed', 'Executive tasting group from Pune')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;
INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES ('00000000-0000-4000-bb00-000000000003', '00000000-0000-4000-ba00-000000000003', '00000000-0000-4000-d000-000000000999', NULL, '00000000-0000-4000-fa00-000000000003', '2026-11-08', '16:30:00', 2, 7000, 'paid', 'completed', 'Sunset picnic setup')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;
INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES ('00000000-0000-4000-bb00-000000000004', '00000000-0000-4000-ba00-000000000004', '00000000-0000-4000-d000-000000000999', NULL, '00000000-0000-4000-fa00-000000000001', '2026-11-12', '12:00:00', 3, 3600, 'paid', 'completed', 'First time wine visitors')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;
INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES ('00000000-0000-4000-bb00-000000000005', '00000000-0000-4000-ba00-000000000001', '00000000-0000-4000-d000-000000000999', NULL, '00000000-0000-4000-fa00-000000000001', '2026-11-15', '15:00:00', 4, 4800, 'paid', 'completed', 'Vegetarian cheese platter')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;
INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES ('00000000-0000-4000-bb00-000000000006', '00000000-0000-4000-ba00-000000000002', '00000000-0000-4000-d000-000000000999', NULL, '00000000-0000-4000-fa00-000000000002', '2026-11-16', '14:00:00', 2, 5600, 'paid', 'completed', 'Custom label for birthday gift')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;
INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES ('00000000-0000-4000-bb00-000000000007', '00000000-0000-4000-ba00-000000000001', '00000000-0000-4000-d000-000000000999', '00000000-0000-4000-e000-000000000001', NULL, '2026-12-20', '11:00:00', 2, 4998, 'paid', 'confirmed', 'Harvest fest VIP front row seating')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;
INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES ('00000000-0000-4000-bb00-000000000008', '00000000-0000-4000-ba00-000000000002', '00000000-0000-4000-d000-000000000999', '00000000-0000-4000-e000-000000000001', NULL, '2026-12-20', '11:00:00', 4, 9996, 'paid', 'confirmed', 'Family group attending grape stomping')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;
INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES ('00000000-0000-4000-bb00-000000000009', '00000000-0000-4000-ba00-000000000003', '00000000-0000-4000-d000-000000000999', '00000000-0000-4000-e000-000000000002', NULL, '2027-01-09', '17:30:00', 2, 6400, 'paid', 'confirmed', 'Outdoor amphitheater table')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;
INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES ('00000000-0000-4000-bb00-000000000010', '00000000-0000-4000-ba00-000000000004', '00000000-0000-4000-d000-000000000999', NULL, '00000000-0000-4000-fa00-000000000001', '2026-12-05', '14:30:00', 2, 2400, 'paid', 'confirmed', 'Tour in English')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;
INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES ('00000000-0000-4000-bb00-000000000011', '00000000-0000-4000-ba00-000000000002', '00000000-0000-4000-d000-000000000999', '00000000-0000-4000-e000-000000000003', NULL, '2027-01-23', '14:00:00', 2, 9000, 'paid', 'confirmed', 'Sommelier certificate requested')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;
INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES ('00000000-0000-4000-bb00-000000000012', '00000000-0000-4000-ba00-000000000004', '00000000-0000-4000-d000-000000000999', NULL, '00000000-0000-4000-fa00-000000000003', '2026-12-12', '16:00:00', 2, 7000, 'pending', 'pending', 'Awaiting corporate credit card approval')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;
INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES ('00000000-0000-4000-bb00-000000000013', '00000000-0000-4000-ba00-000000000001', '00000000-0000-4000-d000-000000000999', NULL, '00000000-0000-4000-fa00-000000000001', '2026-11-20', '11:00:00', 4, 4800, 'refunded', 'cancelled', 'Flight delayed, rescheduled for December')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;
INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES ('00000000-0000-4000-bb00-000000000014', '00000000-0000-4000-ba00-000000000003', '00000000-0000-4000-d000-000000000002', '00000000-0000-4000-e000-000000000004', NULL, '2027-02-06', '12:00:00', 4, 7996, 'paid', 'confirmed', 'Outdoor BBQ table')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;
INSERT INTO bookings (id, user_id, winery_id, event_id, experience_id, booking_date, booking_time, guests, total_amount, payment_status, booking_status, special_requests)
VALUES ('00000000-0000-4000-bb00-000000000015', '00000000-0000-4000-ba00-000000000002', '00000000-0000-4000-d000-000000000003', '00000000-0000-4000-e000-000000000005', NULL, '2027-02-14', '19:30:00', 2, 4999, 'paid', 'confirmed', 'Couples celebration')
ON CONFLICT (id) DO UPDATE SET
  booking_status = EXCLUDED.booking_status,
  payment_status = EXCLUDED.payment_status;


-- 9. CORPORATE LEADS & COMPLIANCE DOCUMENTS
INSERT INTO corporate_leads (id, winery_id, company_name, contact_person, email, phone, event_type, expected_guests, message, status)
VALUES ('00000000-0000-4000-cb00-000000000001', '00000000-0000-4000-d000-000000000999', 'TechMatrix Global Solutions Pvt Ltd', 'Siddharth Roy (VP Operations)', 'siddharth.roy@techmatrix.example.com', '+91 98201 98765', 'Annual Leadership Retreat', 45, 'Seeking a private estate buyout for our Senior Leadership offsite on Jan 16-17. Require full conference AV setup, cellar tour, and gala dinner.', 'pending')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;
INSERT INTO corporate_leads (id, winery_id, company_name, contact_person, email, phone, event_type, expected_guests, message, status)
VALUES ('00000000-0000-4000-cb00-000000000002', '00000000-0000-4000-d000-000000000999', 'Apex Wealth Partners Mumbai', 'Priyamvada Deshpande (Head of Client Relations)', 'priyamvada@apexwealth.example.com', '+91 98199 87654', 'Ultra-HNI Client Appreciation Evening', 60, 'Planning an exclusive vintage reserve tasting and 4-course dinner for our private wealth clients on Feb 12. Need customized gift hampers.', 'approved')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;
INSERT INTO corporate_leads (id, winery_id, company_name, contact_person, email, phone, event_type, expected_guests, message, status)
VALUES ('00000000-0000-4000-cb00-000000000003', '00000000-0000-4000-d000-000000000999', 'Zenith Life Sciences Research', 'Dr. Alok Verma', 'alok.verma@zenithbio.example.com', '+91 98233 45678', 'National Advisory Board Dinner', 28, 'Looking for sunset wine tasting session followed by private indoor dining for advisory doctors visiting Nashik.', 'pending')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;
INSERT INTO corporate_leads (id, winery_id, company_name, contact_person, email, phone, event_type, expected_guests, message, status)
VALUES ('00000000-0000-4000-cb00-000000000004', '00000000-0000-4000-d000-000000000999', 'Indo-French Chamber of Commerce', 'Camille Dubois', 'c.dubois@ifcci.example.org', '+91 98200 12345', 'Bilateral Viticulture Symposium', 110, 'Hosting delegates from Bordeaux and Nashik for technical exchange and Indo-French wine networking dinner in late January.', 'approved')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;
INSERT INTO corporate_leads (id, winery_id, company_name, contact_person, email, phone, event_type, expected_guests, message, status)
VALUES ('00000000-0000-4000-cb00-000000000005', '00000000-0000-4000-d000-000000000999', 'Starlight Media Productions', 'Karan Mehta', 'karan@starlightmedia.example.com', '+91 98900 99887', 'Commercial Web Series Shoot', 70, 'Requested 3-day full vineyard closure for filming. Declined due to weekend public tasting schedule conflicts.', 'rejected')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;


INSERT INTO documents (id, winery_id, document_name, document_type, document_url, verification_status, remarks)
VALUES ('00000000-0000-4000-d00c-000000000001', '00000000-0000-4000-d000-000000000999', 'FSSAI Central Manufacturing License - Wine & Beverages', 'FSSAI', 'https://vinosphere.demo.s3.amazonaws.com/compliance/GHE_FSSAI_License_2026.pdf', 'approved', 'Verified by State Food Safety Commissioner. Valid through Dec 2028.')
ON CONFLICT (id) DO UPDATE SET
  verification_status = EXCLUDED.verification_status;
INSERT INTO documents (id, winery_id, document_name, document_type, document_url, verification_status, remarks)
VALUES ('00000000-0000-4000-d00c-000000000002', '00000000-0000-4000-d000-000000000999', 'Maharashtra State Excise Winery Commercial License', 'Wine License', 'https://vinosphere.demo.s3.amazonaws.com/compliance/GHE_Excise_Commercial_Permit.pdf', 'approved', 'Excise Division Nashik approved for bonded warehouse and on-premise tasting room.')
ON CONFLICT (id) DO UPDATE SET
  verification_status = EXCLUDED.verification_status;
INSERT INTO documents (id, winery_id, document_name, document_type, document_url, verification_status, remarks)
VALUES ('00000000-0000-4000-d00c-000000000003', '00000000-0000-4000-d000-000000000999', 'GSTIN Registration Certificate - Nashik Division', 'GST', 'https://vinosphere.demo.s3.amazonaws.com/compliance/GHE_GSTIN_Certificate.pdf', 'approved', 'Active GST registration verified.')
ON CONFLICT (id) DO UPDATE SET
  verification_status = EXCLUDED.verification_status;
INSERT INTO documents (id, winery_id, document_name, document_type, document_url, verification_status, remarks)
VALUES ('00000000-0000-4000-d00c-000000000004', '00000000-0000-4000-d000-000000000999', 'Certificate of Incorporation - Godavari Hills Estate Pvt Ltd', 'Business Registration', 'https://vinosphere.demo.s3.amazonaws.com/compliance/GHE_MCA_COI.pdf', 'approved', 'Ministry of Corporate Affairs CIN verified.')
ON CONFLICT (id) DO UPDATE SET
  verification_status = EXCLUDED.verification_status;


-- 10. SOMMELIER REVIEWS & RATINGS
INSERT INTO reviews (id, user_id, winery_id, wine_id, experience_id, event_id, rating, review)
VALUES ('00000000-0000-4000-fb00-000000000001', '00000000-0000-4000-ba00-000000000002', '00000000-0000-4000-d000-000000000999', '00000000-0000-4000-ca00-000000000001', NULL, NULL, 5, 'Extraordinary depth for an Indian Shiraz. The 14-month French oak aging brings elegant nuances of toasted clove and dark chocolate that seamlessly complement the peppery black fruit.')
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  review = EXCLUDED.review;
INSERT INTO reviews (id, user_id, winery_id, wine_id, experience_id, event_id, rating, review)
VALUES ('00000000-0000-4000-fb00-000000000002', '00000000-0000-4000-ba00-000000000001', '00000000-0000-4000-d000-000000000999', '00000000-0000-4000-ca00-000000000002', NULL, NULL, 4.8, 'Crisp, aromatic, and superbly refreshing. Passion fruit and green apple notes shine brightly. Paired flawlessly with butter garlic prawns at the tasting pavilion!')
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  review = EXCLUDED.review;
INSERT INTO reviews (id, user_id, winery_id, wine_id, experience_id, event_id, rating, review)
VALUES ('00000000-0000-4000-fb00-000000000003', '00000000-0000-4000-ba00-000000000003', '00000000-0000-4000-d000-000000000999', '00000000-0000-4000-ca00-000000000003', NULL, NULL, 5, 'A true benchmark for Indian traditional method sparkling. Incredibly fine perlage with toasted brioche and Meyer lemon. Easily rivals international crémants.')
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  review = EXCLUDED.review;
INSERT INTO reviews (id, user_id, winery_id, wine_id, experience_id, event_id, rating, review)
VALUES ('00000000-0000-4000-fb00-000000000004', '00000000-0000-4000-ba00-000000000004', '00000000-0000-4000-d000-000000000999', '00000000-0000-4000-ca00-000000000005', NULL, NULL, 4.6, 'Delightfully fruit-forward with juicy strawberry and floral notes. Very easy to enjoy chilled on a warm afternoon. Great beginner-friendly bottle!')
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  review = EXCLUDED.review;
INSERT INTO reviews (id, user_id, winery_id, wine_id, experience_id, event_id, rating, review)
VALUES ('00000000-0000-4000-fb00-000000000005', '00000000-0000-4000-ba00-000000000002', '00000000-0000-4000-d000-000000000999', NULL, '00000000-0000-4000-fa00-000000000002', NULL, 5, 'The blending workshop was the absolute highlight of our Nashik trip. Winemaker Rajesh explained barrel aging with immense passion, and corking our custom bottle was unforgettable.')
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  review = EXCLUDED.review;
INSERT INTO reviews (id, user_id, winery_id, wine_id, experience_id, event_id, rating, review)
VALUES ('00000000-0000-4000-fb00-000000000006', '00000000-0000-4000-ba00-000000000001', '00000000-0000-4000-d000-000000000999', NULL, '00000000-0000-4000-fa00-000000000001', NULL, 4.9, 'Immaculately maintained gravity-flow cellar and professional sommelier guidance. The tasting flight was generous and educational.')
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  review = EXCLUDED.review;
INSERT INTO reviews (id, user_id, winery_id, wine_id, experience_id, event_id, rating, review)
VALUES ('00000000-0000-4000-fb00-000000000007', '00000000-0000-4000-ba00-000000000003', '00000000-0000-4000-d000-000000000002', '00000000-0000-4000-ca00-000000000013', NULL, NULL, 4.8, 'Vibrant flinty minerality and mouthwatering citrus acidity. A stellar expression of high-elevation Dindori terroir.')
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  review = EXCLUDED.review;
INSERT INTO reviews (id, user_id, winery_id, wine_id, experience_id, event_id, rating, review)
VALUES ('00000000-0000-4000-fb00-000000000008', '00000000-0000-4000-ba00-000000000002', '00000000-0000-4000-d000-000000000003', '00000000-0000-4000-ca00-000000000018', NULL, NULL, 4.9, 'Brahmagiri Grand Reserve has serious aging pedigree. Intense dark plum, clove, and roasted coffee. Needs decanting for an hour to open up completely.')
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  review = EXCLUDED.review;
INSERT INTO reviews (id, user_id, winery_id, wine_id, experience_id, event_id, rating, review)
VALUES ('00000000-0000-4000-fb00-000000000009', '00000000-0000-4000-ba00-000000000004', '00000000-0000-4000-d000-000000000004', '00000000-0000-4000-ca00-000000000023', NULL, NULL, 4.7, 'The Blush Zinfandel is so refreshing on a sunny afternoon! Perfect balance of light sweetness and fruity acidity. Everyone in our group loved it.')
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  review = EXCLUDED.review;
INSERT INTO reviews (id, user_id, winery_id, wine_id, experience_id, event_id, rating, review)
VALUES ('00000000-0000-4000-fb00-000000000010', '00000000-0000-4000-ba00-000000000001', '00000000-0000-4000-d000-000000000005', '00000000-0000-4000-ca00-000000000030', NULL, NULL, 4.9, 'Skin-contact orange wine fermented in amphorae is a revelation for Indian viticulture. Dried apricot and bergamot tea with intriguing tannic grip.')
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  review = EXCLUDED.review;
INSERT INTO reviews (id, user_id, winery_id, wine_id, experience_id, event_id, rating, review)
VALUES ('00000000-0000-4000-fb00-000000000011', '00000000-0000-4000-ba00-000000000003', '00000000-0000-4000-d000-000000000006', '00000000-0000-4000-ca00-000000000033', NULL, NULL, 4.8, 'Heritage Sparkling Brut delivers incredible quality for value. Fine, persistent bubbles and crisp lemon-brioche flavor profile.')
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  review = EXCLUDED.review;
INSERT INTO reviews (id, user_id, winery_id, wine_id, experience_id, event_id, rating, review)
VALUES ('00000000-0000-4000-fb00-000000000012', '00000000-0000-4000-ba00-000000000002', '00000000-0000-4000-d000-000000000999', '00000000-0000-4000-ca00-000000000011', NULL, NULL, 5, 'A collector’s treasure. The 2019 Founders Heritage red blend has layers of cassis, balsamic, and dark cocoa with immense longevity. World-class winemaking in Nashik.')
ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  review = EXCLUDED.review;


COMMIT;
