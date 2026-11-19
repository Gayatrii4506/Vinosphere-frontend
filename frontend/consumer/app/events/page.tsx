import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { WineEventsCatalog } from '@/components/events/WineEventsCatalog'
import { VinoSphereExperience, EXPERIENCES } from '@/constants/events'
import { API_V1_URL } from '@/lib/api-config'

export const metadata: Metadata = {
    title: 'Estate Journeys & Wine Masterclasses | VinoSphere',
    description: 'Discover and book exclusive grape harvest festivals, sommelier masterclasses, vineyard tours, and chef pairing dinners with VinoSphere.',
}

function getEventImage(item: any): string {
    // 1. Direct cover_image or banner_image from the event record
    const directImage = item.cover_image || item.banner_image || item.image
    if (directImage && !directImage.includes('photo-1506377247377-2a5b3b417ebb')) {
        return directImage
    }

    // 2. Direct gallery images from the event
    const galleryFirst = (item.gallery_images && item.gallery_images.length > 0) ? item.gallery_images[0] : null
    if (galleryFirst && !galleryFirst.includes('photo-1506377247377-2a5b3b417ebb')) {
        return galleryFirst
    }

    // 3. Match from the official curated EXPERIENCES list in events.ts
    const matchingExp = EXPERIENCES.find(e => 
        e.id === item.id || 
        e.title.toLowerCase().trim() === String(item.title || '').toLowerCase().trim() ||
        String(item.title || '').toLowerCase().includes(e.title.toLowerCase().slice(0, 15))
    )
    if (matchingExp && matchingExp.image) {
        return matchingExp.image
    }

    // 4. Deterministic match by event title
    const titleLower = String(item.title || '').toLowerCase()
    if (titleLower.includes('vip barrel') || titleLower.includes('barrel tasting')) {
        return 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80'
    }
    if (titleLower.includes('sunset jazz') || titleLower.includes('pinot evening')) {
        return 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=1200&q=80'
    }
    if (titleLower.includes('sulafest') || titleLower.includes('music festival')) {
        return 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784629410/sula_fest_tvurpq.png'
    }
    if (titleLower.includes('harvest') || titleLower.includes('stomping')) {
        return 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=80'
    }
    if (titleLower.includes('sunset acoustic') || titleLower.includes('lounge')) {
        return 'https://images.unsplash.com/photo-1507034589631-9433cc6bc453?auto=format&fit=crop&w=1200&q=80'
    }
    if (titleLower.includes('cheese') || titleLower.includes('pairing')) {
        return 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?auto=format&fit=crop&w=1200&q=80'
    }
    if (titleLower.includes('cellar') || titleLower.includes('masterclass')) {
        return 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?auto=format&fit=crop&w=1200&q=80'
    }
    if (titleLower.includes('tour') || titleLower.includes('walk') || titleLower.includes('picnic')) {
        return 'https://images.unsplash.com/photo-1543418219-44e2bf85a630?auto=format&fit=crop&w=1200&q=80'
    }

    return directImage || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80'
}

async function getExperiences(): Promise<VinoSphereExperience[]> {
    try {
        const res = await fetch(`${API_V1_URL}/discovery/events`, {
            cache: 'no-store'
        });
        
        if (!res.ok) {
            console.error('Failed to fetch events from backend');
            return [];
        }
        
        const data = await res.json();
        
        if (data.status === 'success' && data.data) {
            return data.data.map((item: any, index: number): VinoSphereExperience => {
                const wineryObj = item.winery || {};
                const locationStr = [wineryObj.city, wineryObj.state].filter(Boolean).join(', ');
                
                // Take authentic image directly from event record
                const resolvedCover = getEventImage(item);

                // Construct gallery
                const gallery = item.gallery_images || [];
                if (resolvedCover && !gallery.includes(resolvedCover)) {
                    gallery.unshift(resolvedCover);
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

                const eventStatus = item.event_status || (item.date && new Date(item.date) < new Date(new Date().toDateString()) ? 'past' : 'upcoming');
                const turnoutCount = item.turnout_count ?? undefined;
                const reviews = Array.isArray(item.reviews) && item.reviews.length > 0 
                    ? item.reviews.map((r: any, idx: number) => ({
                        id: r.id || `rev-${idx}`,
                        author: r.author || 'Wine Enthusiast',
                        avatar: r.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.author || 'Guest')}`,
                        rating: r.rating || 5,
                        date: r.date || 'Recent Event',
                        comment: r.comment || ''
                      }))
                    : [];
                const eventRating = item.rating || (reviews.length > 0 
                    ? Number((reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)) 
                    : 5.0);

                const expStatus = item.experience_status || (eventStatus === 'past' ? 'past' : (item.booking_status === 'Coming Soon' || eventStatus === 'upcoming' ? 'upcoming' : 'active'));
                const availableDays: string[] = item.available_days || item.host_info?.schedule?.available_days || [];
                const timeSlots: string[] = item.time_slots || item.host_info?.schedule?.time_slots || [];

                if (!isEvent) {
                    if (availableDays.length > 0) {
                        displayDate = availableDays.map(d => d.slice(0, 3)).join(', ');
                    }
                    if (timeSlots.length > 0) {
                        displayTime = `${timeSlots.length} Slots (${timeSlots[0]}${timeSlots.length > 1 ? '...' : ''})`;
                    }
                }

                return {
                    id: item.id || Math.random().toString(),
                    title: item.title || 'Untitled Event',
                    wineryId: item.winery_id || wineryObj.id || '',
                    rating: eventRating,
                    reviewCount: reviews.length,
                    currency: '₹',
                    spotsLeft: item.available_slots !== undefined && item.available_slots !== null ? item.available_slots : (item.max_capacity || item.capacity || 12),
                    totalSpots: item.capacity || item.max_capacity || 150,
                    coordinates: {
                        lat: parseFloat(wineryObj.latitude) || 19.9975,
                        lng: parseFloat(wineryObj.longitude) || 73.7898
                    },
                    overview: item.description || '',
                    description: item.description || '',
                    shortDescription: item.short_description || item.host_info?.short_description || '',
                    type: isEvent ? 'event' : 'experience',
                    tagline: item.short_description || item.description?.substring(0, 70) || 'An unforgettable experience',
                    category,
                    badge,
                    image: resolvedCover,
                    gallery,
                    winery: wineryObj.name || 'VinoSphere Partner',
                    location: locationStr || 'Nashik Valley, India',
                    region: wineryObj.country || 'India',
                    date: displayDate,
                    time: displayTime,
                    endTime: item.end_time || null,
                    bookingDeadline: item.booking_deadline || null,
                    duration: displayDuration,
                    price: item.price || 0,
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
                    reviews: reviews,
                    status: eventStatus,
                    experienceStatus: expStatus,
                    startDate: item.start_date || item.host_info?.schedule?.start_date || null,
                    endDate: item.end_date || item.host_info?.schedule?.end_date || null,
                    availableDays: availableDays,
                    timeSlots: timeSlots,
                    maxGuestsPerSlot: item.max_guests_per_slot || item.host_info?.schedule?.max_guests_per_slot || item.capacity || 15,
                    bookingStatus: item.booking_status || (isEvent ? (eventStatus === 'past' ? 'Closed' : 'Open') : (item.host_info?.booking?.booking_status || (expStatus === 'upcoming' ? 'Coming Soon' : 'Open for Booking'))),
                    cancellationPolicy: item.cancellation_policy || item.host_info?.booking?.cancellation_policy || '',
                    minAge: item.min_age || item.host_info?.booking?.min_age || '18+',
                    meetingPoint: item.meeting_point || item.host_info?.location?.meeting_point || '',
                    arrivalInstructions: item.arrival_instructions || item.host_info?.location?.arrival_instructions || '',
                    parkingAvailable: item.parking_available ?? item.host_info?.location?.parking_available ?? true,
                    exclusions: item.exclusions || item.host_info?.exclusions || [],
                    editionDate: item.edition_date || item.host_info?.recap?.edition_date || null,
                    turnoutCount: turnoutCount,
                    recapNotes: item.recap_notes || ''
                };
            });
        }
        
        return [];
    } catch (error: any) {
        if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('Dynamic server usage')) {
            throw error;
        }
        console.error('Error fetching events:', error);
        return [];
    }
}

export default async function EventsPage() {
    const fetchedExperiences = await getExperiences();
    const experiencesToDisplay = fetchedExperiences.length > 0 ? fetchedExperiences : EXPERIENCES;

    return (
        <Suspense
            fallback={
                <div className="bg-vino-cream min-h-screen pt-32 pb-24 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-vino-accent border-t-transparent rounded-full animate-spin" />
                        <div className="text-vino-dark/60 text-sm font-semibold tracking-wider uppercase">
                            Loading VinoSphere Estate Journeys...
                        </div>
                    </div>
                </div>
            }
        >
            <WineEventsCatalog initialExperiences={experiencesToDisplay} />
        </Suspense>
    )
}
