export interface Event {
  id: string;
  name: string;
  slug: string;
  wineryId: string;
  wineryName: string;
  winerySlug: string;
  type: "Festival" | "Concert" | "Workshop" | "Tasting" | "Dinner" | "Harvest";
  description: string;
  longDescription: string;
  coverImage: string;
  images: string[];
  date: string;
  endDate: string;
  time: string;
  venue: string;
  location: string;
  capacity: number;
  soldCount: number;
  ticketTiers: {
    name: string;
    price: number;
    description: string;
    perks: string[];
    available: number;
  }[];
  lineup?: string[];
  schedule?: { time: string; activity: string }[];
  tags: string[];
  isFeatured: boolean;
  isUpcoming: boolean;
}

export const events: Event[] = [
  {
    id: "e1",
    name: "SulaFest 2027",
    slug: "sulafest-2027",
    wineryId: "w1",
    wineryName: "Sula Vineyards",
    winerySlug: "sula-vineyards",
    type: "Festival",
    description: "Asia's premier wine & music festival returns for its 19th edition with world-class artists, gourmet food, and unlimited wine.",
    longDescription: "SulaFest is the wine world's most anticipated annual gathering in India. Set against the breathtaking backdrop of Sula Vineyards' rolling hills and dam views, this 2-day extravaganza brings together international and Indian musicians, celebrity chefs, craft beer, artisan food stalls, wine masterclasses, and of course — unlimited wine from Sula's world-class cellar. From sunrise yoga sessions in the vineyard to late-night DJ sets under the stars, SulaFest is unlike any festival experience in the world.",
    coverImage: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1400&q=80",
    images: [
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80",
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    ],
    date: "2027-02-06",
    endDate: "2027-02-07",
    time: "12:00 PM onwards",
    venue: "Sula Vineyards Amphitheatre",
    location: "Nashik, Maharashtra",
    capacity: 8000,
    soldCount: 5420,
    ticketTiers: [
      {
        name: "General Access",
        price: 3500,
        description: "Festival access for 2 days with unlimited wine tasting",
        perks: ["2-day festival entry", "Unlimited wine tasting", "Food stall access"],
        available: 2000,
      },
      {
        name: "VIP Experience",
        price: 8500,
        description: "Premium experience with VIP lounge, gourmet dining, and front-stage access",
        perks: ["VIP lounge access", "Gourmet dinner", "Front-stage viewing", "Exclusive wine selection", "Meet & Greet with artists"],
        available: 300,
      },
      {
        name: "Weekend Glamping",
        price: 22000,
        description: "Stay in a luxury glamping tent at the vineyard for the full immersive experience",
        perks: ["Luxury tent accommodation", "All meals included", "Sunrise vineyard walk", "Private wine masterclass", "VIP festival access"],
        available: 50,
      },
    ],
    lineup: ["Prateek Kuhad", "When Chai Met Toast", "Ritviz", "Ankur Tewari", "DJ Nucleya", "Dualist Inquiry", "International Guest TBA"],
    schedule: [
      { time: "07:00 AM", activity: "Sunrise Vineyard Walk" },
      { time: "08:30 AM", activity: "Wine & Yoga Session" },
      { time: "12:00 PM", activity: "Festival Gates Open" },
      { time: "01:00 PM", activity: "Wine Masterclass - Decoding Nashik Terroir" },
      { time: "03:00 PM", activity: "Live Music Stage 1 Opens" },
      { time: "05:00 PM", activity: "Sunset Tasting Session" },
      { time: "07:00 PM", activity: "Headliner Performances" },
      { time: "10:00 PM", activity: "DJ Night" },
    ],
    tags: ["Festival", "Music", "Wine", "2-Day", "International Artists", "Glamping"],
    isFeatured: true,
    isUpcoming: true,
  },
  {
    id: "e2",
    name: "Nashik Harvest Festival 2026",
    slug: "nashik-harvest-2026",
    wineryId: "w5",
    wineryName: "Soma Vine Village",
    winerySlug: "soma-vine-village",
    type: "Harvest",
    description: "Experience the magic of grape harvest firsthand. Stomp grapes, pick bunches, and learn the ancient art of winemaking.",
    longDescription: "The Nashik Harvest Festival at Soma Vine Village is a hands-on celebration of the grape harvest season. Visitors get to participate in actual grape picking, traditional grape stomping, and guided cellar tours. The event includes traditional Maharashtrian food, folk music, and ends with a wine dinner under the stars.",
    coverImage: "https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=1400&q=80",
    images: ["https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800&q=80"],
    date: "2026-02-14",
    endDate: "2026-02-16",
    time: "9:00 AM - 6:00 PM",
    venue: "Soma Vine Village",
    location: "Dindori, Nashik",
    capacity: 200,
    soldCount: 156,
    ticketTiers: [
      {
        name: "Day Pass",
        price: 2500,
        description: "Full day harvest experience",
        perks: ["Grape picking", "Grape stomping", "Cellar tour", "Wine tasting", "Lunch included"],
        available: 50,
      },
      {
        name: "Weekend Package",
        price: 12000,
        description: "3-day immersive harvest stay",
        perks: ["2-night accommodation", "All meals", "Full harvest experience", "Take-home wine bottle"],
        available: 15,
      },
    ],
    schedule: [
      { time: "09:00 AM", activity: "Welcome & Introduction" },
      { time: "10:00 AM", activity: "Vineyard Walk & Grape Picking" },
      { time: "12:30 PM", activity: "Traditional Maharashtrian Lunch" },
      { time: "02:00 PM", activity: "Grape Stomping Experience" },
      { time: "03:30 PM", activity: "Cellar Tour & Winemaking Talk" },
      { time: "05:00 PM", activity: "Wine Tasting Session" },
      { time: "07:00 PM", activity: "Wine Dinner (Weekend package)" },
    ],
    tags: ["Harvest", "Hands-on", "Family", "Cultural", "Farm to Glass"],
    isFeatured: true,
    isUpcoming: true,
  },
  {
    id: "e3",
    name: "Nashik Wine & Dine Experience",
    slug: "nashik-wine-dine-2026",
    wineryId: "w2",
    wineryName: "York Winery",
    winerySlug: "york-winery",
    type: "Dinner",
    description: "An intimate 5-course wine-pairing dinner crafted by Michelin-trained chef Rishab Puri alongside York's premium reserve collection.",
    longDescription: "York Winery presents an exclusive 5-course dinner pairing their finest reserve wines with dishes crafted by celebrated chef Rishab Puri. Limited to 40 covers, this intimate dinner takes place in York's stunning barrel cellar. Each course is meticulously paired with York wines, accompanied by the winemaker's notes.",
    coverImage: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=1400&q=80",
    images: ["https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&q=80"],
    date: "2026-12-20",
    endDate: "2026-12-20",
    time: "7:00 PM - 11:00 PM",
    venue: "York Winery Barrel Cellar",
    location: "Gangapur, Nashik",
    capacity: 40,
    soldCount: 32,
    ticketTiers: [
      {
        name: "Per Person",
        price: 7500,
        description: "5-course dinner with wine pairing",
        perks: ["5-course gourmet dinner", "Wine pairing with each course", "Cellar ambiance", "Winemaker interaction"],
        available: 8,
      },
    ],
    tags: ["Intimate", "Gourmet", "Cellar Dinner", "Chef", "Premium"],
    isFeatured: false,
    isUpcoming: true,
  },
  {
    id: "e4",
    name: "Wine Blending Masterclass",
    slug: "blending-masterclass-2026",
    wineryId: "w4",
    wineryName: "Fratelli Wines",
    winerySlug: "fratelli-wines",
    type: "Workshop",
    description: "Blend your own wine guided by Fratelli's Italian winemaker. Take home your custom blend with a personalized label.",
    longDescription: "Ever wondered what it feels like to be a winemaker? This hands-on masterclass lets you blend your own wine from different grape varieties under the guidance of Fratelli's winemaker from Italy. You'll learn the art and science of blending, taste individual components, and create your own unique blend that you take home in a labeled bottle.",
    coverImage: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=1400&q=80",
    images: ["https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800&q=80"],
    date: "2026-11-15",
    endDate: "2026-11-15",
    time: "3:00 PM - 6:00 PM",
    venue: "Fratelli Winery Lab",
    location: "Nashik, Maharashtra",
    capacity: 20,
    soldCount: 14,
    ticketTiers: [
      {
        name: "Per Person",
        price: 4500,
        description: "Blending session with take-home bottle",
        perks: ["Guided blending session", "All materials provided", "Take-home custom bottle", "Personalized label", "Certificate of blending"],
        available: 6,
      },
    ],
    tags: ["Workshop", "Hands-on", "Masterclass", "Creative", "Take-home"],
    isFeatured: false,
    isUpcoming: true,
  },
  {
    id: "e5",
    name: "Organic Wine Tasting Evening",
    slug: "organic-tasting-2026",
    wineryId: "w8",
    wineryName: "Vallonne Vineyards",
    winerySlug: "vallonne-vineyards",
    type: "Tasting",
    description: "An exclusive tasting of Vallonne's rare biodynamic wines, guided by the winemaker himself in an intimate vineyard setting.",
    longDescription: "Vallonne's winemaker Dr. Ajay Shetye personally hosts this exclusive tasting of their complete range of biodynamic wines. With production of less than 2,000 cases per year, this is a rare opportunity to taste wines that are almost impossible to find in retail. Limited to 15 guests.",
    coverImage: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1400&q=80",
    images: ["https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80"],
    date: "2026-10-10",
    endDate: "2026-10-10",
    time: "5:00 PM - 8:00 PM",
    venue: "Vallonne Estate",
    location: "Ozar, Nashik",
    capacity: 15,
    soldCount: 12,
    ticketTiers: [
      {
        name: "Per Person",
        price: 6000,
        description: "Exclusive biodynamic wine tasting",
        perks: ["6 wine tasting", "Winemaker guided", "Cheese & charcuterie board", "Vineyard walk"],
        available: 3,
      },
    ],
    tags: ["Exclusive", "Biodynamic", "Organic", "Intimate", "Rare"],
    isFeatured: false,
    isUpcoming: true,
  },
];
