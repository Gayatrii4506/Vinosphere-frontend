import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { WineEventsCatalog } from '@/components/events/WineEventsCatalog'
import { VinoSphereExperience } from '@/constants/events'

export const metadata: Metadata = {
    title: 'Wine Experiences & Masterclasses | VinoSphere',
    description: 'Discover and book exclusive grape harvest festivals, sommelier masterclasses, vineyard tours, and chef pairing dinners with VinoSphere.',
}

async function getExperiences(): Promise<VinoSphereExperience[]> {
    try {
        const res = await fetch('http://localhost:5000/api/v1/discovery/events', {
            cache: 'no-store'
        });
        
        if (!res.ok) {
            console.error('Failed to fetch events from backend');
            return [];
        }
        
        const data = await res.json();
        
        if (data.status === 'success' && data.data) {
            return data.data.map((item: any): VinoSphereExperience => {
                const wineryObj = item.winery || {};
                const locationStr = [wineryObj.city, wineryObj.state].filter(Boolean).join(', ');
                
                // Construct gallery
                const gallery = item.gallery_images || [];
                if (item.cover_image && !gallery.includes(item.cover_image)) {
                    gallery.unshift(item.cover_image);
                }

                // Map included strings to IncludedItem format expected by the frontend
                const included = Array.isArray(item.inclusions) 
                    ? item.inclusions.map((inc: string) => ({
                        item: inc,
                        iconName: 'CheckCircle2' // default fallback icon
                      }))
                    : [];

                // Map featured vintages to FeaturedWine
                const featuredWines = Array.isArray(item.featured_vintages)
                    ? item.featured_vintages.map((v: any) => ({
                        name: v.name || '',
                        type: v.type || '',
                        vintage: v.vintage || '',
                        notes: v.notes || ''
                      }))
                    : [];

                // Determine category based on type or tags
                let category: VinoSphereExperience['category'] = 'Wine Tastings';
                const lowerType = String(item.type).toLowerCase();
                if (lowerType.includes('tour')) category = 'Vineyard Tours';
                if (lowerType.includes('harvest')) category = 'Harvest Festivals';
                if (lowerType.includes('food') || lowerType.includes('pairing')) category = 'Food Pairing';
                if (lowerType.includes('workshop')) category = 'Sommelier Workshops';
                
                // Badges
                let badge: VinoSphereExperience['badge'] = undefined;
                if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
                    const t = item.tags[0].toLowerCase();
                    if (t.includes('feature')) badge = 'Featured';
                    if (t.includes('best seller')) badge = 'Best Seller';
                    if (t.includes('exclusive')) badge = 'Exclusive';
                    if (t.includes('reserve')) badge = 'Reserve Collection';
                }

                const isEvent = item.type === 'event';
                
                // Helper to format 24h string to 12h AM/PM
                const formatTime = (timeStr: string) => {
                    if (!timeStr) return '';
                    const parts = timeStr.split(':');
                    const hour = parseInt(parts[0], 10);
                    const minute = parts[1] || '00';
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 || 12;
                    return `${displayHour}:${minute} ${ampm}`;
                };

                const calculateDuration = (start: string, end: string) => {
                    try {
                        const [sH, sM] = start.split(':').map(Number);
                        const [eH, eM] = end.split(':').map(Number);
                        const startMin = sH * 60 + (sM || 0);
                        const endMin = eH * 60 + (eM || 0);
                        const diff = endMin - startMin;
                        if (diff <= 0) return '2 Hours';
                        const hours = Math.floor(diff / 60);
                        const mins = diff % 60;
                        return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
                    } catch {
                        return '2 Hours';
                    }
                };

                let displayDate = 'Flexible Booking';
                let displayTime = 'Select Time Slot';
                let displayDuration = item.duration_minutes ? `${item.duration_minutes} Mins` : '90 Mins';

                if (isEvent) {
                    if (item.date) {
                        try {
                            displayDate = new Date(item.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                            });
                        } catch {
                            displayDate = item.date;
                        }
                    } else {
                        displayDate = 'Special Date';
                    }
                    
                    displayTime = item.start_time && item.end_time 
                        ? `${formatTime(item.start_time)} - ${formatTime(item.end_time)}` 
                        : (item.start_time ? formatTime(item.start_time) : 'TBD');
                        
                    displayDuration = item.duration_minutes 
                        ? `${item.duration_minutes} Mins` 
                        : (item.start_time && item.end_time ? calculateDuration(item.start_time, item.end_time) : '2 Hours');
                }

                return {
                    id: item.id || Math.random().toString(),
                    title: item.title || 'Untitled Event',
                    wineryId: item.winery_id || wineryObj.id || '',
                    rating: 4.8,
                    reviewCount: 15,
                    currency: '₹',
                    spotsLeft: item.max_capacity || 12,
                    totalSpots: item.max_capacity || 150,
                    coordinates: {
                        lat: parseFloat(wineryObj.latitude) || 19.9975,
                        lng: parseFloat(wineryObj.longitude) || 73.7898
                    },
                    overview: item.description || '',
                    type: isEvent ? 'event' : 'experience',
                    tagline: item.description?.substring(0, 50) || 'An unforgettable experience',
                    category,
                    badge,
                    image: item.cover_image || 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb',
                    gallery,
                    winery: wineryObj.name || 'VinoSphere Partner',
                    location: locationStr || 'Napa Valley, CA',
                    region: wineryObj.country || 'USA',
                    date: displayDate,
                    time: displayTime,
                    duration: displayDuration,
                    price: item.price || 0,
                    description: item.description || '',
                    host: {
                        name: item.host_info?.name || 'VinoSphere Host',
                        title: item.host_info?.title || 'Expert Sommelier',
                        avatar: item.host_info?.avatar || 'https://ui-avatars.com/api/?name=' + (item.host_info?.name || 'Host'),
                        rating: item.host_info?.rating || 5.0,
                        bio: item.host_info?.bio || 'An experienced host ready to guide you through premium wine tastings.',
                        verified: item.host_info?.verified ?? true
                    },
                    highlights: item.highlights || [],
                    itinerary: item.itinerary || [],
                    included,
                    featuredWines,
                    reviews: [] // Reviews not stored in this payload yet
                };
            });
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

export default async function EventsPage() {
    const fetchedExperiences = await getExperiences();

    return (
        <Suspense
            fallback={
                <div className="bg-vino-cream min-h-screen pt-32 pb-24 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-vino-accent border-t-transparent rounded-full animate-spin" />
                        <div className="text-vino-dark/60 text-sm font-semibold tracking-wider uppercase">
                            Loading VinoSphere Experiences...
                        </div>
                    </div>
                </div>
            }
        >
            <WineEventsCatalog initialExperiences={fetchedExperiences} />
        </Suspense>
    )
}
