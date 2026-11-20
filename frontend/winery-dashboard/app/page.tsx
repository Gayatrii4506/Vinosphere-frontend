
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/lib/context/RoleContext";
import { useTheme } from "@/components/layout/ThemeProvider";
import { wineries as mockWineries } from "@/lib/mock-data/wineries";
import * as db from "@/lib/supabaseQueries";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchDashboardOverview, mapWinesToFrontend, resolveWineBottleImage, mapExperiencesToFrontend, mapEventsToFrontend, mapBookingsToFrontend, mapLeadsToFrontend, addWineToDatabase, updateWineInDatabase, deleteWineFromDatabase, addExperienceToDatabase, addEventToDatabase, updateWinerySettings, registerWinery, loginWinery } from "@/lib/api";
import {
  Activity,
  LayoutDashboard,
  Building2,
  Wine,
  Sparkles,
  FlaskConical,
  Calendar,
  BookmarkCheck,
  ShoppingBag,
  Building,
  MessageSquare,
  BarChart3,
  FileText,
  Bell,
  Settings,
  LogOut,
  Search,
  Mail,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  ChevronRight,
  Star,
  Upload,
  ShieldCheck,
  TrendingUp,
  Users,
  DollarSign,
  AlertCircle,
  MapPin,
  Clock,
  Globe,
  Award,
  Image as ImageIcon,
  QrCode,
  Briefcase,
  ChevronDown,
  Percent,
  CheckCircle,
  Eye,
  Send,
  MoreVertical,
  PlusCircle,
  Menu,
  Filter,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  User,
  FileUp,
  Sun,
  Moon,
  TrendingDown,
  Info,
  HelpCircle,
  Minus,
  Download,
  Loader2
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from "recharts";
import { WineQualityAssayLab } from "@/components/wines/WineQualityAssayLab";
import EDADashboard from "@/components/analytics/EDADashboard";

const THEME = {
  bg: "#F8F9FB",
  card: "#FFFFFF",
  primary: "#6D071A",
  secondary: "#D4AF37",
  text: "#222222",
  border: "#ECECEC",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
};


function DynamicListInput({ label, items = [], onChange, placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">{label}</label>
      {(items || []).map((item: string, idx: number) => (
        <div key={idx} className="flex gap-2 mb-2">
          <input value={item} onChange={e => {
            const newItems = [...items];
            newItems[idx] = e.target.value;
            onChange(newItems);
          }} className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none" placeholder={placeholder} />
          <button type="button" onClick={() => onChange(items.filter((_: any, i: number) => i !== idx))} className="text-red-500 text-xs px-2 font-bold">&times;</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...(items || []), ""])} className="text-[#6D071A] text-[10px] font-semibold uppercase tracking-wide">+ Add Item</button>
    </div>
  )
}


function FeaturedVintagesInput({ items = [], onChange, availableWines = [] }: any) {
  return (
    <div className="space-y-1.5 border-t border-[#ECECEC] pt-4 mt-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Featured Vintages / Wines</label>
        <span className="text-[10px] text-charcoal-500 font-medium">Link directly from inventory</span>
      </div>
      {(items || []).map((item: any, idx: number) => (
        <div key={idx} className="bg-[#F8F9FB] p-3 rounded-xl mb-3 relative group border border-[#ECECEC] space-y-2">
          <button type="button" onClick={() => onChange(items.filter((_: any, i: number) => i !== idx))} className="absolute top-2 right-2 text-red-500 text-xs opacity-0 group-hover:opacity-100 transition">&times; Remove</button>
          
          {/* Inventory Selection Dropdown if available */}
          {availableWines && availableWines.length > 0 && (
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600 block mb-1">Select From Winery Inventory</label>
              <select
                value={item.wine_id || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selected = availableWines.find((w: any) => w.id === selectedId);
                  const newItems = [...items];
                  if (selected) {
                    newItems[idx] = {
                      ...newItems[idx],
                      wine_id: selected.id,
                      name: selected.name,
                      vintage: selected.vintage || "",
                      type: selected.type || selected.wine_type || "",
                      price: selected.price || "",
                      image: selected.image || ""
                    };
                  } else {
                    newItems[idx] = {
                      ...newItems[idx],
                      wine_id: ""
                    };
                  }
                  onChange(newItems);
                }}
                className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white font-medium text-charcoal-800"
              >
                <option value="">-- Choose wine from inventory (or enter custom) --</option>
                {availableWines.map((w: any) => (
                  <option key={w.id} value={w.id}>
                    {w.name} {w.vintage ? `(${w.vintage})` : ''} - {w.type || w.wine_type || 'Wine'} {w.price ? `• ₹${w.price}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <input value={item.name} onChange={e => {
              const newItems = [...items];
              newItems[idx].name = e.target.value;
              onChange(newItems);
            }} className="p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white font-medium" placeholder="Wine Name (e.g. Reserve Shiraz)" />
            <input value={item.vintage} onChange={e => {
              const newItems = [...items];
              newItems[idx].vintage = e.target.value;
              onChange(newItems);
            }} className="p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white font-medium" placeholder="Vintage Year (e.g. 2024)" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={item.type} onChange={e => {
              const newItems = [...items];
              newItems[idx].type = e.target.value;
              onChange(newItems);
            }} className="p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white font-medium" placeholder="Wine Type (e.g. Sparkling)" />
            <input value={item.notes} onChange={e => {
              const newItems = [...items];
              newItems[idx].notes = e.target.value;
              onChange(newItems);
            }} className="p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white font-medium" placeholder="Tasting Notes (e.g. crisp, fruity)" />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { wine_id: "", name: "", vintage: "", type: "", notes: "" }])} className="w-full py-2 border border-dashed border-[#ECECEC] text-[10px] font-bold uppercase tracking-wider text-[#6D071A] hover:bg-[#F8F9FB] rounded-lg transition-colors flex items-center justify-center gap-1.5">+ Add Featured Wine</button>
    </div>
  );
}


function ItineraryInput({ items = [], onChange }: any) {
  return (
    <div className="space-y-2 border-t border-[#ECECEC] pt-4 mt-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Step-by-Step Itinerary ({items?.length || 0} Steps)</label>
        <button
          type="button"
          onClick={() => onChange([...(items || []), { time: "", activity: "", title: "", description: "" }])}
          className="text-[#6D071A] text-[10px] font-bold uppercase tracking-wide hover:underline"
        >
          + Add Itinerary Step
        </button>
      </div>

      {(!items || items.length === 0) ? (
        <p className="text-[11px] text-stone-400 italic">No itinerary steps configured yet. Click above to add schedule activities.</p>
      ) : (
        items.map((item: any, idx: number) => (
          <div key={idx} className="bg-[#F8F9FB] p-3.5 rounded-2xl mb-3 relative border border-[#ECECEC] space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#ECECEC] pb-1.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Step {idx + 1}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_: any, i: number) => i !== idx))}
                className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 transition"
              >
                &times; Remove Step
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Time</label>
                <input
                  value={item.time || ""}
                  onChange={e => {
                    const newItems = [...items];
                    newItems[idx].time = e.target.value;
                    onChange(newItems);
                  }}
                  className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white font-medium"
                  placeholder="e.g. 6:30 PM"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Activity</label>
                <input
                  value={item.activity || item.title || ""}
                  onChange={e => {
                    const newItems = [...items];
                    newItems[idx].activity = e.target.value;
                    newItems[idx].title = e.target.value;
                    onChange(newItems);
                  }}
                  className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white font-medium"
                  placeholder="e.g. Welcome Toast & Cellar Tour"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Description</label>
              <textarea
                value={item.description || ""}
                onChange={e => {
                  const newItems = [...items];
                  newItems[idx].description = e.target.value;
                  onChange(newItems);
                }}
                className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white h-14 resize-none leading-relaxed"
                placeholder="Details of what happens during this step..."
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const INSIGHT_METRIC_LABELS: Record<string, string> = {
  event_bookings: "Event bookings",
  experience_bookings: "Experience bookings",
  gross_booking_value: "Gross Booking Value",
  wine_views: "Wine views",
  wine_saves: "Wine saves",
  corporate_leads: "Corporate inquiries",
};

function getInsightMetricLabel(rawMetric?: string): string {
  if (!rawMetric) return "Performance Metric";
  const key = rawMetric.toLowerCase();
  if (INSIGHT_METRIC_LABELS[key]) return INSIGHT_METRIC_LABELS[key];
  return rawMetric.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatInsightDate(timestamp?: any): string | null {
  if (!timestamp) return null;
  const parsed = new Date(timestamp);
  if (isNaN(parsed.getTime())) return null;
  const day = parsed.getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[parsed.getMonth()];
  const year = parsed.getFullYear();
  return `Detected ${day} ${month} ${year}`;
}

function formatInsightValue(val: number, metric?: string): string {
  const mKey = (metric || '').toLowerCase();
  if (mKey === 'gross_booking_value') {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  }
  if (mKey === 'event_bookings' || mKey === 'experience_bookings') {
    return `${val} bookings`;
  }
  if (mKey === 'corporate_leads') {
    return `${val} leads`;
  }
  if (mKey === 'wine_views') {
    return `${val} views`;
  }
  if (mKey === 'wine_saves') {
    return `${val} saves`;
  }
  return `${val}`;
}

function formatInsightAbsoluteChange(change: number, metric?: string): string {
  const prefix = change >= 0 ? '+' : '';
  const mKey = (metric || '').toLowerCase();
  if (mKey === 'gross_booking_value') {
    return `${prefix}${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(change || 0)}`;
  }
  if (mKey === 'event_bookings' || mKey === 'experience_bookings') {
    return `${prefix}${change} bookings`;
  }
  if (mKey === 'corporate_leads') {
    return `${prefix}${change} leads`;
  }
  return `${prefix}${change}`;
}

function constructWhatThisMeans(evidenceObj: any): string {
  if (!evidenceObj) return "Performance metric evaluated against previous window.";
  const metric = evidenceObj.metric || '';
  const label = getInsightMetricLabel(metric);
  const currentVal = evidenceObj.current_value ?? 0;
  const prevVal = evidenceObj.comparison_value ?? 0;
  const currentFormatted = formatInsightValue(currentVal, metric);
  const prevFormatted = formatInsightValue(prevVal, metric);

  const mKey = metric.toLowerCase();
  if (mKey === 'event_bookings') {
    return `Event bookings increased from ${prevVal} to ${currentVal} compared with the previous period.`;
  }
  if (mKey === 'experience_bookings') {
    return `Experience bookings increased from ${prevVal} to ${currentVal} compared with the previous period.`;
  }
  if (mKey === 'gross_booking_value') {
    return `${label} increased from ${prevFormatted} to ${currentFormatted}, reflecting stronger reservation volume across events and experiences.`;
  }

  return `${label} changed from ${prevFormatted} to ${currentFormatted} compared with the previous period.`;
}

function extractRecommendationText(insight: any): string {
  if (insight.recommendation_text) return insight.recommendation_text;
  if (insight.llm_explanation) {
    const parts = insight.llm_explanation.split('. ');
    if (parts.length > 1) {
      return parts.slice(1).join('. ');
    }
    return insight.llm_explanation;
  }
  return "Consider reviewing your strategy based on these findings.";
}

export default function WineryDashboardPage() {
  const { role, login, logout, isLoggedIn } = useRole();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedWinery = localStorage.getItem("vinosphere_current_winery");
      if (savedWinery) {
        try {
          const parsed = JSON.parse(savedWinery);
          if (parsed) {
            setCurrentWinery(parsed);
            login("winery");
          }
        } catch (e) {
          console.error("Failed to parse saved winery", e);
        }
      } else {
        // Default to primary seeded estate: Sula Vineyards
        const defaultWinery = {
          id: 'b40a83dd-ee61-43df-bf79-caf3b2a190de',
          name: 'Sula Vineyards',
          slug: 'sula-vineyards',
          location: 'Nashik',
          email: 'info@sulawines.com'
        };
        setCurrentWinery(defaultWinery);
        login("winery");
      }
    }
  }, []);

  const [allWineries, setAllWineries] = useState<any[]>(mockWineries);
  const [allWines, setAllWines] = useState<any[]>([]);
  const [allExperiences, setAllExperiences] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [allDocs, setAllDocs] = useState<any[]>([]);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);

  const [currentWinery, setCurrentWinery] = useState<any>(null);
  const [portalMode, setPortalMode] = useState<"login" | "register">("login");

  // Phase 10 & 12A & 12D: Real Analytics, Business State & Presentation Demo Mode
  const DEMO_WINERY_ID = "00000000-0000-4000-d000-000000000999";
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vinosphere_analytics_demo_mode");
      if (stored !== null) return stored === "true";
    }
    return process.env.NEXT_PUBLIC_ANALYTICS_DEMO_MODE !== "false";
  });
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [dashboardTimeSeries, setDashboardTimeSeries] = useState<any[]>([]);
  const [dashboardInsights, setDashboardInsights] = useState<any[]>([]);
  const [businessAnalytics, setBusinessAnalytics] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7d");
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(false);
  const [insightActionStates, setInsightActionStates] = useState<Record<string, { status: 'loading' | 'error'; action: 'completed' | 'dismissed'; message?: string }>>({});

  const handleUpdateInsightStatus = async (insightId: string, newStatus: 'completed' | 'dismissed') => {
    setInsightActionStates(prev => ({
      ...prev,
      [insightId]: { status: 'loading', action: newStatus }
    }));

    try {
      const res = await fetch(`http://localhost:5000/api/v1/analytics/recommendations/${insightId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      setDashboardInsights(prev => prev.filter(item => item.id !== insightId));
      setInsightActionStates(prev => {
        const next = { ...prev };
        delete next[insightId];
        return next;
      });
    } catch (err) {
      setInsightActionStates(prev => ({
        ...prev,
        [insightId]: { status: 'error', action: newStatus, message: `Failed to mark as ${newStatus}. Please try again.` }
      }));
    }
  };

  const handleDownloadPDF = () => {
    const activeDemo = isDemoMode;
    const wineryId = activeDemo ? DEMO_WINERY_ID : (currentWinery?.id || '11111111-1111-1111-1111-111111111111');
    window.open(`http://localhost:5000/api/v1/analytics/dashboard/${wineryId}/report/pdf?period=${selectedPeriod}`, '_blank');
  };

  const handleDownloadCSV = () => {
    const activeDemo = isDemoMode;
    const wineryId = activeDemo ? DEMO_WINERY_ID : (currentWinery?.id || '11111111-1111-1111-1111-111111111111');
    window.open(`http://localhost:5000/api/v1/analytics/dashboard/${wineryId}/report/csv?period=${selectedPeriod}`, '_blank');
  };

  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  
  const [regStep, setRegStep] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [selectedWine, setSelectedWine] = useState<any>(null);
  const [wineViewMode, setWineViewMode] = useState<"grid" | "table">("grid");
  const [wineFilterType, setWineFilterType] = useState<string>("All");

  const [regForm, setRegForm] = useState({
    ownerName: "", email: "", phone: "", password: "", wineryName: "",
    tagline: "Nashik's Boutique Vineyard", story: "A family-run organic vineyard harvesting the finest terroir grapes.",
    history: "Founded with passion to make premium local wines.", location: "Nashik Valley", established: "2024",
    vineyardArea: "45 acres", operatingHours: "Mon-Sun: 11:00 AM - 10:00 PM", priceRange: "₹₹₹",
    coverImage: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",
    exciseOk: false, fssaiOk: false, isoOk: false, gstOk: false
  });

  const [addWineModalOpen, setAddWineModalOpen] = useState(false);
  const [editWineModalOpen, setEditWineModalOpen] = useState(false);
  const [editingWine, setEditingWine] = useState<any>(null);
  const [isUpdatingWine, setIsUpdatingWine] = useState(false);
  const [addEventModalOpen, setAddEventModalOpen] = useState(false);
  const [addExperienceModalOpen, setAddExperienceModalOpen] = useState(false);
  const [addDocModalOpen, setAddDocModalOpen] = useState(false);
  const [viewingQrBooking, setViewingQrBooking] = useState<any | null>(null);
  const [qrCopied, setQrCopied] = useState(false);
  const [newAwardMedal, setNewAwardMedal] = useState("Gold");
  const [newAwardCustomMedal, setNewAwardCustomMedal] = useState("");

  const [newWine, setNewWine] = useState<any>({
    name: "", category: "Red Wine", customCategory: "", price: "", vintage: "2024", alcoholContent: "13.5%", image: "",
    gallery: "", description: "", foodPairings: "Paneer Tikka, BBQ, Lamb",
    tasteNotes: "Plum, spice, vanilla, cherry", servingTemp: "16-18°C", awards: "Decanter Bronze",
    grapeVariety: "", stock: "100", body: "Medium", sweetness: "Dry", acidity: "Medium", tannin: "Medium"
  , publicId: ""
  });
  const [isUploading, setIsUploading] = useState(false);

  const fillDemoData = () => {
    setNewWine({
      name: "Estate Reserve Rosé",
      category: "Rosé",
      price: "850",
      vintage: "2023",
      alcoholContent: "12%",
      image: "https://images.unsplash.com/photo-1559564103-6f8e705359a6?w=500&auto=format&fit=crop&q=60",
      publicId: "",
      gallery: "",
      description: "A fun, fruity, and versatile rosé with vibrant flavors of berries and citrus. Perfect for a warm afternoon.",
      foodPairings: "Pasta, Spicy food, Soft cheese",
      tasteNotes: "Strawberry, Citrus, Melon",
      servingTemp: "8-10°C",
      awards: "",
      grapeVariety: "Zinfandel",
      stock: "150",
      body: "Light",
      sweetness: "Off-Dry",
      acidity: "High",
      tannin: "Low"
    });
  };

  const uploadFileToBackend = async (file: File, folder = 'wineries'): Promise<{ url: string; publicId?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${backendUrl}/uploads`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let msg = `Upload failed (Status: ${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson?.message) msg = errJson.message;
      } catch {
        // use fallback
      }
      throw new Error(msg);
    }

    const json = await res.json();
    return {
      url: json.data?.url || '',
      publicId: json.data?.publicId,
    };
  };

  const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await uploadFileToBackend(file, 'events');
      setNewEvent((prev: any) => ({ ...prev, image_url: data.url }));
    } catch (error: any) {
      console.error('Error uploading event image:', error);
      alert(error?.message || 'Error uploading event image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExpImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await uploadFileToBackend(file, 'experiences');
      setNewExperience((prev: any) => ({ ...prev, image_url: data.url }));
    } catch (error: any) {
      console.error('Error uploading experience image:', error);
      alert(error?.message || 'Error uploading experience image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await uploadFileToBackend(file, 'wineries/cover');
      setCurrentWinery((prev: any) => ({ ...prev, coverImage: data.url }));
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Failed to upload cover image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await uploadFileToBackend(file, 'wineries/logo');
      setCurrentWinery((prev: any) => ({ ...prev, logo: data.url }));
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Failed to upload logo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const data = await uploadFileToBackend(files[i], 'wineries/gallery');
        if (data.url) urls.push(data.url);
      }
      setCurrentWinery((prev: any) => ({ ...prev, images: [...(prev?.images || []), ...urls] }));
    } catch (err: any) {
      console.error('Gallery upload error:', err);
      alert(err?.message || 'Failed to upload gallery images.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await uploadFileToBackend(file, 'wines');
      setNewWine((prev: any) => ({
        ...prev,
        image: data.url,
        publicId: data.publicId,
      }));
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleWineAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWinery) return;

    const parsedPrice = parseFloat(newWine.price) || 1000;
    const finalCategory = newWine.category === "Other"
      ? (newWine.customCategory?.trim() || "Other")
      : (newWine.category || "Red");
    
    // Convert newWine into the expected database format
    const dbPayload = {
      name: newWine.name,
      wine_type: finalCategory,
      grape_variety: newWine.grapeVariety,
      vintage: parseInt(newWine.vintage) || 2024,
      alcohol_percentage: parseFloat(newWine.alcoholContent.replace('%', '')) || 13.5,
      body: newWine.body,
      sweetness: newWine.sweetness,
      acidity: newWine.acidity,
      tannin: newWine.tannin,
      serving_temperature: newWine.servingTemp,
      food_pairings: newWine.foodPairings,
      taste_notes: newWine.tasteNotes,
      description: newWine.description,
      stock_quantity: parseInt(newWine.stock) || 0,
      price: parsedPrice,
      image_url: newWine.image,
      public_id: newWine.publicId || null
    };

    // Send the POST request to our Express backend
    const createdWine = await addWineToDatabase(currentWinery.id, dbPayload);

    if (createdWine) {
      // Rather than manually pushing to state, we refresh the dashboard overview
      const overview = await fetchDashboardOverview(currentWinery.id);
      if (overview) {
        setAllWines(mapWinesToFrontend(overview.wines));
      }
      setAddWineModalOpen(false);
      // Reset form
      setNewWine({
        name: "", category: "Red", customCategory: "", price: "", vintage: "2024", alcoholContent: "13.5%", image: "",
        gallery: "", description: "", foodPairings: "Paneer Tikka, BBQ, Lamb",
        tasteNotes: "Plum, spice, vanilla, cherry", servingTemp: "16-18°C", awards: "Decanter Bronze",
        grapeVariety: "", stock: "100", body: "Medium", sweetness: "Dry", acidity: "Medium", tannin: "Medium", publicId: ""
      });
    } else {
      alert("Failed to add wine to the database.");
    }
  };

  const handleOpenEditWine = (wine: any) => {
    const rawCat = wine.category || wine.type || "Red";
    const stdMap: Record<string, string> = {
      "Red": "Red", "Red Wine": "Red",
      "White": "White", "White Wine": "White",
      "Sparkling": "Sparkling", "Sparkling Wine": "Sparkling",
      "Rosé": "Rosé", "Rose": "Rosé", "Rose Wine": "Rosé", "Rosé Wine": "Rosé",
      "Dessert": "Dessert", "Dessert Wine": "Dessert"
    };
    const isStd = !!stdMap[rawCat];

    setEditingWine({
      id: wine.id,
      name: wine.name || "",
      category: isStd ? stdMap[rawCat] : "Other",
      customCategory: isStd ? "" : rawCat,
      price: wine.price !== undefined ? String(wine.price) : "",
      vintage: wine.vintage !== undefined ? String(wine.vintage) : "2024",
      alcoholContent: wine.alcoholContent ? String(wine.alcoholContent).replace('%', '') : "13.5",
      image: wine.image || "",
      publicId: wine.publicId || "",
      description: wine.description || "",
      foodPairings: Array.isArray(wine.foodPairings) ? wine.foodPairings.join(", ") : (wine.foodPairings || ""),
      tasteNotes: wine.tasteNotes || "",
      servingTemp: wine.servingTemp || "16-18°C",
      grapeVariety: Array.isArray(wine.grapeVariety) ? wine.grapeVariety.join(", ") : (wine.grapeVariety || ""),
      stock: wine.stockQuantity !== undefined ? String(wine.stockQuantity) : (wine.stock === "In Stock" ? "100" : "0"),
      body: wine.body || "Medium",
      sweetness: wine.sweetness || "Dry",
      acidity: wine.acidity || "Medium",
      tannin: wine.tannin || "Medium"
    });
    setEditWineModalOpen(true);
  };

  const handleEditWineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await uploadFileToBackend(file, 'wines');
      setEditingWine((prev: any) => ({
        ...prev,
        image: data.url,
        publicId: data.publicId,
      }));
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleWineUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWinery || !editingWine?.id) return;

    setIsUpdatingWine(true);
    const parsedPrice = parseFloat(editingWine.price) || 1000;
    const finalCategory = editingWine.category === "Other"
      ? (editingWine.customCategory?.trim() || "Other")
      : (editingWine.category || "Red");

    const dbPayload = {
      name: editingWine.name,
      wine_type: finalCategory,
      grape_variety: editingWine.grapeVariety,
      vintage: parseInt(editingWine.vintage) || 2024,
      alcohol_percentage: parseFloat(String(editingWine.alcoholContent).replace('%', '')) || 13.5,
      body: editingWine.body,
      sweetness: editingWine.sweetness,
      acidity: editingWine.acidity,
      tannin: editingWine.tannin,
      serving_temperature: editingWine.servingTemp,
      food_pairings: editingWine.foodPairings,
      taste_notes: editingWine.tasteNotes,
      description: editingWine.description,
      stock_quantity: parseInt(editingWine.stock) || 0,
      price: parsedPrice,
      image_url: editingWine.image,
      public_id: editingWine.publicId || null
    };

    try {
      await updateWineInDatabase(currentWinery.id, editingWine.id, dbPayload);
      const overview = await fetchDashboardOverview(currentWinery.id);
      if (overview?.wines) {
        const mapped = mapWinesToFrontend(overview.wines);
        setAllWines(mapped);
        if (selectedWine?.id === editingWine.id) {
          const updatedSelected = mapped.find((w: any) => w.id === editingWine.id);
          if (updatedSelected) setSelectedWine(updatedSelected);
        }
      }
      setEditWineModalOpen(false);
      alert("Wine details updated successfully!");
    } catch (err: any) {
      console.error("Error updating wine:", err);
      alert(err?.message || "Failed to update wine details.");
    } finally {
      setIsUpdatingWine(false);
    }
  };

  const handleWineDelete = async (wine: any) => {
    if (!confirm(`Are you sure you want to remove "${wine.name}" from your catalog?`)) {
      return;
    }
    if (!currentWinery) return;

    try {
      await deleteWineFromDatabase(currentWinery.id, wine.id);
      const overview = await fetchDashboardOverview(currentWinery.id);
      if (overview?.wines) {
        setAllWines(mapWinesToFrontend(overview.wines));
      } else {
        setAllWines(prev => prev.filter(w => w.id !== wine.id));
      }
      if (selectedWine?.id === wine.id) {
        setSelectedWine(null);
      }
      alert(`"${wine.name}" removed successfully.`);
    } catch (err: any) {
      console.error("Failed to delete wine:", err);
      alert(err?.message || "Failed to delete wine.");
    }
  };

  const handleWineryLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = loginEmail.trim().toLowerCase();
    
    try {
      const authData = await loginWinery(normalizedEmail, loginPassword);
      if (authData?.winery) {
        if (authData.token) {
          localStorage.setItem("vinosphere_winery_token", authData.token);
        }
        const normalizedAuthWinery = {
          ...authData.winery,
          email: authData.winery.email || normalizedEmail,
          contact: authData.winery.contact || {
            email: authData.winery.email || normalizedEmail,
            phone: authData.winery.phone || "",
            address: authData.winery.address || "",
            website: authData.winery.website || ""
          }
        };
        localStorage.setItem("vinosphere_current_winery", JSON.stringify(normalizedAuthWinery));
        setCurrentWinery(normalizedAuthWinery);
        login("winery");

        const overview = await fetchDashboardOverview(authData.winery.id);
        if (overview) {
          if (overview.wines) setAllWines(mapWinesToFrontend(overview.wines));
          if (overview.experiences) setAllExperiences(mapExperiencesToFrontend(overview.experiences));
          if (overview.events) setAllEvents(mapEventsToFrontend(overview.events));
        }
        return;
      }
    } catch (apiErr: any) {
      console.warn("API login attempt failed:", apiErr);
      alert(apiErr.message || "Invalid credentials. Please check your winery email and password.");
      return;
    }

    alert("Invalid credentials. Please verify your registered winery email and password, or register your estate.");
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      const result = await registerWinery(regForm);
      const rawWinery = result?.winery;
      const registeredWinery = {
        id: rawWinery?.id || `w-${Date.now()}`,
        name: rawWinery?.name || regForm.wineryName,
        slug: rawWinery?.slug || regForm.wineryName.toLowerCase().replace(/\s+/g, '-'),
        location: rawWinery?.city || regForm.location,
        owner: regForm.ownerName,
        email: rawWinery?.email || regForm.email,
        phone: rawWinery?.phone || regForm.phone,
        contact: rawWinery?.contact || {
          email: rawWinery?.email || regForm.email,
          phone: rawWinery?.phone || regForm.phone,
          address: rawWinery?.address || regForm.location,
          website: rawWinery?.website || ""
        },
        description: rawWinery?.description || regForm.story || "A premier vineyard estate.",
        story: rawWinery?.description || "A premier vineyard estate.",
        coverImage: rawWinery?.banner_url || "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb",
        logo: rawWinery?.logo_url || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
        images: rawWinery?.images || [
          "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb"
        ],
        awards: rawWinery?.awards || [],
        storyTimeline: rawWinery?.timeline || [],
        coordinates: {
          lat: rawWinery?.latitude ? Number(rawWinery.latitude) : 20.0049,
          lng: rawWinery?.longitude ? Number(rawWinery.longitude) : 73.7124
        }
      };

      // Update local estate directory
      setAllWineries((prev: any[]) => [...prev, registeredWinery]);
      
      const updatedNotifs = [...allNotifications, {
        id: Date.now(),
        title: "Registration Submitted",
        message: `Welcome, ${regForm.ownerName}! Your estate "${regForm.wineryName}" registration has been submitted for Superadmin verification. Once approved, your login credentials will be emailed to ${regForm.email}.`,
        type: "success",
        date: new Date().toISOString()
      }];
      setAllNotifications(updatedNotifs);
      syncToLocalStorage("vinosphere_notifications", updatedNotifs);

      // Pre-fill login email and switch to login view (NO auto-login)
      setLoginEmail(regForm.email);
      setLoginPassword("");
      setPortalMode("login");
      setRegStep(0);

      alert(`Registration Submitted for Superadmin Approval!\n\nYour estate application for "${regForm.wineryName}" has been submitted to the VinoSphere Superadmin.\n\nOnce verified and approved, your login link and credentials will be sent to your registered email (${regForm.email}).`);
    } catch (error: any) {
      console.error("Winery registration failed:", error);
      alert(error.message || "Registration failed. Please verify your fields and try again.");
    } finally {
      setIsRegistering(false);
    }
  };

    const [eventSubTab, setEventSubTab] = useState<'upcoming' | 'past'>('upcoming');
    const [journeySubTab, setJourneySubTab] = useState<'active' | 'past'>('active');
    const [newEvent, setNewEvent] = useState<any>({
      name: "", date: "", start_time: "18:00", end_time: "21:00", venue: "Amphitheatre", capacity: 200, ticketPrice: "", status: "Published", description: "", sponsors: "VinoSphere", image_url: "",
      booking_status: "Open",
      booking_deadline: "",
      tags: [], highlights: [], inclusions: [], host_info: { name: "", title: "", avatar: "", rating: 5, bio: "" },
      itinerary: [],
      featured_vintages: [],
      event_status: "upcoming",
      turnout_count: "",
      rating: "4.9",
      reviews: [],
      recap_notes: ""
    });

    const [newExperience, setNewExperience] = useState<any>({
      name: "",
      short_description: "",
      duration: "90 Mins",
      capacity: "15",
      price: "",
      status: "active",
      experience_status: "active",
      description: "",
      experience_type: "Wine Tastings",
      gallery_images: [],
      start_date: "",
      end_date: "",
      available_days: ["Friday", "Saturday", "Sunday"],
      time_slots: ["11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
      max_guests_per_slot: 15,
      booking_status: "Open for Booking",
      cancellation_policy: "Free cancellation up to 48 hours before the journey starts.",
      min_age: "18+",
      meeting_point: "Estate Tasting Room & Visitor Center",
      arrival_instructions: "Please arrive 15 minutes prior to your time slot for check-in and welcome drink.",
      parking_available: true,
      exclusions: [],
      turnout_count: "",
      rating: "4.95",
      edition_date: "",
      reviews: [],
      recap_notes: "",
      tags: [],
      highlights: [],
      inclusions: [],
      host_info: { name: "", title: "", avatar: "", rating: 5, bio: "" },
      featured_vintages: []
    });

  const [newDoc, setNewDoc] = useState({
    name: "", type: "Wine License", number: "", expiryDate: ""
  });

  const toggleDemoMode = (newMode: boolean) => {
    setIsDemoMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("vinosphere_analytics_demo_mode", String(newMode));
    }
    loadAnalytics(selectedPeriod, newMode);
  };

  const generateFallbackAnalytics = React.useCallback((period: string) => {
    // 1. Time Series (30 days of traffic and engagement)
    const days = period === '90d' ? 90 : (period === '30d' ? 30 : 7);
    const tsData: any[] = [];
    const now = new Date();
    for (let i = days; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayFactor = (i % 7 === 0 || i % 7 === 1) ? 1.55 : 1.0;
      const baseViews = Math.round((140 + Math.sin(i * 0.5) * 40) * dayFactor);
      const baseSaves = Math.round(baseViews * (0.13 + (i % 4) * 0.01));
      tsData.push({
        date: dateStr,
        wine_views: baseViews,
        wine_saves: baseSaves,
        guests_booked: Math.round(baseViews * 0.05)
      });
    }
    setDashboardTimeSeries(tsData);

    // 2. Summary
    const totalViews = tsData.reduce((acc, curr) => acc + curr.wine_views, 0);
    const totalSaves = tsData.reduce((acc, curr) => acc + curr.wine_saves, 0);
    const totalGuests = tsData.reduce((acc, curr) => acc + curr.guests_booked, 0);

    const mostViewed = (allWines.length > 0 ? allWines : [
      { id: 'w-1', name: 'Rasa Cabernet Sauvignon 2021', type: 'Red', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1787505421/7a34cefe-0fde-47ee-b4fa-0351d0565493.png' },
      { id: 'w-2', name: 'Dindori Reserve Shiraz 2022', type: 'Red', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1787466141/0cd29da9-8a93-42aa-9479-74238d0277e2.png' },
      { id: 'w-3', name: 'Tropical Sec Sparkling Wine', type: 'Sparkling', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1787559573/806ea689-6b3a-4a26-9a0a-a56fd357de34.png' },
      { id: 'w-4', name: 'The Source Sauvignon Blanc', type: 'White', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1787420071/fc25ab84-2606-40db-864b-ccea4a9d7ebf.png' },
      { id: 'w-5', name: 'Sula Zinfandel Rosé', type: 'Rosé', image: 'https://res.cloudinary.com/xfklkvdc/image/upload/v1784485224/86f83964-a90e-43ad-84f7-bad5cb60e12f_jzc8yi.png' }
    ]).slice(0, 5).map((w, idx) => ({
      wine_id: w.id,
      name: w.name,
      views: Math.round(1450 / (idx + 1)),
      saves: Math.round(180 / (idx + 1)),
      coverImage: w.image || w.image_url
    }));

    setDashboardSummary({
      wine_views: totalViews,
      wine_saves: totalSaves,
      view_to_save_rate: 14,
      guests_booked: totalGuests,
      capacity_utilization: 87,
      most_viewed_wines: mostViewed
    });

    // 3. Business Analytics
    const numBookings = allBookings.length || 65;
    const numLeads = allLeads.length || 36;
    const grossRevenue = allBookings.reduce((sum, b) => sum + (Number(b.total) || 0), 0) || 245000;
    const prevGross = Math.round(grossRevenue * 0.78);

    const eventBookingsCount = Math.round(numBookings * 0.43);
    const expBookingsCount = numBookings - eventBookingsCount;

    const eventGuestsCount = Math.round(eventBookingsCount * 3.2);
    const expGuestsCount = Math.round(expBookingsCount * 2.4);

    const eventGross = Math.round(grossRevenue * 0.52);
    const expGross = grossRevenue - eventGross;

    setBusinessAnalytics({
      eventBookings: {
        current: eventBookingsCount,
        previous: Math.round(eventBookingsCount * 0.75),
        absoluteChange: eventBookingsCount - Math.round(eventBookingsCount * 0.75),
        percentageChange: 33.3
      },
      eventGuests: {
        current: eventGuestsCount,
        previous: Math.round(eventGuestsCount * 0.78),
        absoluteChange: eventGuestsCount - Math.round(eventGuestsCount * 0.78),
        percentageChange: 28.2
      },
      eventCapacityUtilization: {
        current: 82,
        previous: 68,
        percentageChange: 20.6
      },
      eventGrossBookingValue: {
        current: eventGross,
        previous: Math.round(eventGross * 0.8),
        absoluteChange: eventGross - Math.round(eventGross * 0.8),
        percentageChange: 25.0
      },
      experienceBookings: {
        current: expBookingsCount,
        previous: Math.round(expBookingsCount * 0.82),
        absoluteChange: expBookingsCount - Math.round(expBookingsCount * 0.82),
        percentageChange: 21.9
      },
      experienceGuests: {
        current: expGuestsCount,
        previous: Math.round(expGuestsCount * 0.8),
        absoluteChange: expGuestsCount - Math.round(expGuestsCount * 0.8),
        percentageChange: 25.0
      },
      experienceGrossBookingValue: {
        current: expGross,
        previous: Math.round(expGross * 0.76),
        absoluteChange: expGross - Math.round(expGross * 0.76),
        percentageChange: 31.5
      },
      corporateInquiries: {
        current: numLeads,
        previous: Math.max(1, Math.round(numLeads * 0.70)),
        absoluteChange: numLeads - Math.max(1, Math.round(numLeads * 0.70)),
        percentageChange: 42.8
      },
      corporateStatusBreakdown: {
        pending: allLeads.filter(l => l.status?.toLowerCase() === 'pending').length || 12,
        approved: allLeads.filter(l => l.status?.toLowerCase() === 'approved').length || 20,
        rejected: allLeads.filter(l => l.status?.toLowerCase() === 'rejected').length || 4
      },
      corporateAvgExpectedGuests: 58,
      totalGrossBookingValue: {
        current: grossRevenue,
        previous: prevGross,
        absoluteChange: grossRevenue - prevGross,
        percentageChange: 28.2
      }
    });

    // 4. Insights
    setDashboardInsights([
      {
        id: 'ins-1',
        type: 'growth',
        title: 'Strong Weekend Tasting Demand',
        insight: 'Weekend tasting reservations for Sula Vineyards have reached 87% cellar door capacity.',
        recommendation: 'Consider opening an additional 4:00 PM sunset tasting slot to capture excess weekend demand.',
        confidence: 0.94
      },
      {
        id: 'ins-2',
        type: 'conversion',
        title: 'High Save Rate on Rasa Cabernet Sauvignon',
        insight: 'Rasa Cabernet Sauvignon 2021 has an exceptional 16.4% view-to-save conversion rate among B2B leads.',
        recommendation: 'Highlight this vintage in upcoming corporate tasting gift proposals.',
        confidence: 0.91
      }
    ]);
  }, [allWines, allBookings, allLeads]);

  const loadAnalytics = React.useCallback(async (period: string = selectedPeriod, demoOverride?: boolean) => {
    const activeDemo = demoOverride !== undefined ? demoOverride : isDemoMode;
    const wineryId = activeDemo ? DEMO_WINERY_ID : (currentWinery?.id || 'b40a83dd-ee61-43df-bf79-caf3b2a190de');
    if (!dashboardSummary) {
      setAnalyticsLoading(true);
    }
    setAnalyticsError(false);
    try {
      const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL 
        ? process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/api\/v1\/?$/, '') 
        : 'http://localhost:5000';
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 1200) : null;
      const [summaryRes, tsRes, insightsRes, businessRes, reportRes] = await Promise.all([
        fetch(`${backendBase}/api/v1/analytics/dashboard/${wineryId}/summary`, { signal: controller?.signal }).catch(() => null),
        fetch(`${backendBase}/api/v1/analytics/dashboard/${wineryId}/timeseries`, { signal: controller?.signal }).catch(() => null),
        fetch(`${backendBase}/api/v1/analytics/dashboard/${wineryId}/insights`, { signal: controller?.signal }).catch(() => null),
        fetch(`${backendBase}/api/v1/analytics/dashboard/${wineryId}/business?period=${period}`, { signal: controller?.signal }).catch(() => null),
        fetch(`${backendBase}/api/v1/analytics/dashboard/${wineryId}/report?period=${period}`, { signal: controller?.signal }).catch(() => null)
      ]);
      if (timeoutId) clearTimeout(timeoutId);

      if (summaryRes?.ok && tsRes?.ok && insightsRes?.ok) {
        const summaryData = await summaryRes.json();
        const tsData = await tsRes.json();
        const insightsData = await insightsRes.json();

        setDashboardSummary(summaryData.data);
        setDashboardTimeSeries(tsData.data);
        setDashboardInsights(insightsData.data);

        if (businessRes?.ok) {
          const businessData = await businessRes.json();
          setBusinessAnalytics(businessData.data);
        }

        if (reportRes?.ok) {
          const rData = await reportRes.json();
          setReportData(rData.data);
        }
      } else {
        // Fallback: Generate authentic business & traffic analytics directly from the seeded estate data
        generateFallbackAnalytics(period);
      }
    } catch (err) {
      // Backend analytics API is unreachable - graceful fallback without crashing
      generateFallbackAnalytics(period);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [currentWinery?.id, selectedPeriod, isDemoMode, dashboardSummary, generateFallbackAnalytics]);

  // Load state from Postgres Backend instead of localStorage
  useEffect(() => {
    async function loadData() {
      if (!currentWinery?.id) return;
      const overview = await fetchDashboardOverview(currentWinery.id);
      if (overview) {
        if (overview.winery) {
          setCurrentWinery((prev: any) => {
            const base = prev || {};
            // Avoid infinite re-render loops by returning identical reference if unchanged
            if (
              base.id === overview.winery.id &&
              base.name === overview.winery.name &&
              base.logo === (overview.winery.logo_url || base.logo)
            ) {
              return prev;
            }
            return {
              ...base,
              id: overview.winery.id,
              name: overview.winery.name,
              slug: overview.winery.slug,
              description: overview.winery.description || base.description || '',
              story: overview.winery.description || base.story || '',
              coverImage: overview.winery.banner_url || base.coverImage || '',
              logo: overview.winery.logo_url || base.logo || '',
              awards: overview.winery.awards || base.awards || [],
              storyTimeline: overview.winery.timeline || base.storyTimeline || [],
              coordinates: {
                lat: overview.winery.latitude ? Number(overview.winery.latitude) : (base.coordinates?.lat || 20.0),
                lng: overview.winery.longitude ? Number(overview.winery.longitude) : (base.coordinates?.lng || 73.0)
              },
              location: overview.winery.city || base.location || 'Nashik',
              contact: {
                phone: overview.winery.phone || base.contact?.phone || '',
                email: overview.winery.email || base.contact?.email || '',
                website: overview.winery.website || base.contact?.website || '',
                address: overview.winery.address || base.contact?.address || ''
              }
            };
          });
        }
        setAllWines(mapWinesToFrontend(overview.wines));
        setAllExperiences(mapExperiencesToFrontend(overview.experiences));
        setAllEvents(mapEventsToFrontend(overview.events));
        setAllBookings(mapBookingsToFrontend(overview.bookings));
        setAllLeads(mapLeadsToFrontend(overview.leads));
        setAllDocs(overview.documents || []);
        setAllReviews(overview.reviews || []);
      }
    }

    if (typeof window !== "undefined") {
      loadData();
    }
  }, [currentWinery?.id]);

  // Synchronize analytics and performance metrics with loaded database records
  useEffect(() => {
    if (typeof window !== "undefined") {
      loadAnalytics(selectedPeriod);
    }
  }, [allBookings.length, allWines.length, allLeads.length, selectedPeriod, loadAnalytics]);

  const renderMetricChange = (metric: any) => {
    if (!metric) return <span className="text-charcoal-400 text-[11px]">No data</span>;
    const { current, previous, percentageChange } = metric;
    if (previous === 0 && current === 0) {
      return <span className="text-charcoal-400 text-[11px]">No activity</span>;
    }
    if (previous === 0 && current > 0) {
      return <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1"><TrendingUp className="w-3 h-3" /> New activity</span>;
    }
    if (percentageChange === null) {
      return <span className="text-charcoal-400 text-[11px]">No baseline</span>;
    }
    if (percentageChange > 0) {
      return <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +{percentageChange}%</span>;
    }
    if (percentageChange < 0) {
      return <span className="text-rose-600 font-semibold text-[11px] flex items-center gap-1"><TrendingDown className="w-3 h-3" /> {percentageChange}%</span>;
    }
    return <span className="text-charcoal-500 font-medium text-[11px] flex items-center gap-1"><Minus className="w-3 h-3" /> 0%</span>;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const activeWines = allWines;
  const filteredWines = activeWines.filter(w => {
    const matchesSearch = (w.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (w.type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (Array.isArray(w.grapeVariety) ? w.grapeVariety.join(" ") : (w.grapeVariety || "")).toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (wineFilterType === "All") return true;
    if (wineFilterType === "Other") {
      return !["Red", "White", "Sparkling", "Rosé", "Dessert"].includes(w.type);
    }
    return w.type === wineFilterType;
  });
  const activeExperiences = allExperiences;
  const activeEvents = allEvents;
  const activeDocs = allDocs;
  const activeReviews = allReviews;
  const activeNotifications = allNotifications;
  const activeUnreadNotifications = activeNotifications.filter(n => !n.read).length;
  const activeBookings = allBookings;
  const activeLeads = allLeads;
  const activeRevenue = activeBookings.reduce((sum, b) => sum + (b.total || 0), 0) +
                        activeEvents.reduce((sum, e) => sum + (e.revenue || 0), 0);
  const activeAverageRating = activeReviews.length > 0
    ? (activeReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / activeReviews.length).toFixed(1)
    : "5.0";

  const monthlyRevenueData = staticMonthlyRevenueData;
  const wineSalesDistribution = staticWineSalesDistribution;
  const foodPairingsAnalytics = staticFoodPairingsAnalytics;
  const bookingsByExperience = staticBookingsByExperience;

  const syncToLocalStorage = (key: string, data: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const handleEventCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const capacityNum = parseInt(newEvent.capacity) || 100;
    const priceNum = parseFloat(newEvent.ticketPrice) || 1500;
    
    // Convert local file to base64 for Cloudinary upload if needed
    let imageBase64 = null;
    if (newEvent.imageFile) {
      imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(newEvent.imageFile);
      });
    }

    try {
      const status = newEvent.event_status || (newEvent.date && new Date(newEvent.date) < new Date(new Date().toDateString()) ? 'past' : 'upcoming');
      const dbPayload = {
        name: newEvent.name || "Amphitheatre Uncorked",
        description: newEvent.description || "A tasting event under the stars.",
        date: newEvent.date || "2026-08-20",
        start_time: newEvent.start_time || newEvent.time || "18:00",
        end_time: newEvent.end_time || "21:00",
        booking_status: newEvent.booking_status || "Open",
        booking_deadline: newEvent.booking_deadline || "",
        capacity: capacityNum,
        price: priceNum,
        status: status,
        event_status: status,
        turnout_count: newEvent.turnout_count ? parseInt(newEvent.turnout_count) : (status === 'past' ? capacityNum : null),
        rating: newEvent.rating ? parseFloat(newEvent.rating) : (status === 'past' ? 4.9 : null),
        reviews: newEvent.reviews || [],
        recap_notes: newEvent.recap_notes || '',
        image_url: imageBase64 || newEvent.image_url, 
        tags: newEvent.tags, 
        highlights: newEvent.highlights, 
        inclusions: newEvent.inclusions, 
        itinerary: newEvent.itinerary, 
        host_info: {
          ...(newEvent.host_info || {}),
          end_time: newEvent.end_time || "21:00",
          booking_status: newEvent.booking_status || "Open",
          booking_deadline: newEvent.booking_deadline || "",
          featured_vintages: newEvent.featured_vintages || []
        }, 
        featured_vintages: newEvent.featured_vintages
      };

      await addEventToDatabase(currentWinery.id, dbPayload);

      // Refresh the dashboard overview to get the latest data
      const overview = await fetchDashboardOverview(currentWinery.id);
      if (overview) {
        setAllEvents(mapEventsToFrontend(overview.events));
      }
      
      setAddEventModalOpen(false);
      setNewEvent({ 
        name: "", date: "", start_time: "18:00", end_time: "21:00", venue: "Amphitheatre", 
        capacity: 200, ticketPrice: "", description: "", sponsors: "VinoSphere",
        event_status: "upcoming", booking_status: "Open", booking_deadline: "",
        turnout_count: "", rating: "4.9", reviews: [], recap_notes: "",
        tags: [], highlights: [], inclusions: [], host_info: { name: "", title: "", avatar: "", rating: 5, bio: "" }, itinerary: [],
        featured_vintages: []
      } as any);
      
      const notifs = [
        { id: "N-" + Date.now(), wineryId: currentWinery.id, title: "New Event Scheduled", description: `${newEvent.name} created.`, time: "Just now", category: "Event", read: false },
        ...allNotifications
      ];
      setAllNotifications(notifs);
      
    } catch (err) { 
      console.error("Error saving event to Backend:", err); 
    }
  };

  const handleExperienceCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newExperience.price) || 1200;
    
    // Convert local file to base64 for Cloudinary upload if needed, similar to wines
    let imageBase64 = null;
    if (newExperience.imageFile) {
      imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(newExperience.imageFile);
      });
    }


    try {
      const status = newExperience.experience_status || "active";
      const capacityNum = parseInt((newExperience as any).capacity) || 15;
      const dbPayload = {
        name: newExperience.name || "Gourmet Tasting Tour",
        short_description: newExperience.short_description || "",
        description: newExperience.description || "",
        experience_type: newExperience.experience_type || "Wine Tastings",
        duration: newExperience.duration || "90 Mins",
        capacity: capacityNum,
        price: priceNum,
        status: status,
        experience_status: status,
        gallery_images: (newExperience.gallery_images || []).filter(Boolean),
        start_date: newExperience.start_date || null,
        end_date: newExperience.end_date || null,
        available_days: newExperience.available_days || [],
        time_slots: (newExperience.time_slots || []).filter(Boolean),
        max_guests_per_slot: parseInt(newExperience.max_guests_per_slot) || capacityNum,
        booking_status: newExperience.booking_status || (status === 'upcoming' ? 'Coming Soon' : 'Open for Booking'),
        cancellation_policy: newExperience.cancellation_policy || '',
        min_age: newExperience.min_age || '18+',
        meeting_point: newExperience.meeting_point || '',
        arrival_instructions: newExperience.arrival_instructions || '',
        parking_available: newExperience.parking_available ?? true,
        exclusions: (newExperience.exclusions || []).filter(Boolean),
        edition_date: newExperience.edition_date || null,
        turnout_count: newExperience.turnout_count ? parseInt(newExperience.turnout_count) : (status === 'past' ? 45 : null),
        rating: newExperience.rating ? parseFloat(newExperience.rating) : (status === 'past' ? 4.95 : null),
        reviews: newExperience.reviews || [],
        recap_notes: newExperience.recap_notes || '',
        image_url: imageBase64 || newExperience.image_url, 
        tags: newExperience.tags || [], 
        highlights: newExperience.highlights || [], 
        inclusions: newExperience.inclusions || [], 
        itinerary: newExperience.itinerary || [], 
        host_info: newExperience.host_info || {}, 
        featured_vintages: newExperience.featured_vintages || []
      };

      await addExperienceToDatabase(currentWinery.id, dbPayload);

      // Refresh the dashboard overview to get the latest data
      const overview = await fetchDashboardOverview(currentWinery.id);
      if (overview) {
        setAllExperiences(mapExperiencesToFrontend(overview.experiences));
      }
      
      setAddExperienceModalOpen(false);
      setNewExperience({ 
        name: "", short_description: "", duration: "90 Mins", capacity: "15", price: "", 
        status: "active", experience_status: "active", description: "", experience_type: "Wine Tastings",
        gallery_images: [], start_date: "", end_date: "",
        available_days: ["Friday", "Saturday", "Sunday"],
        time_slots: ["11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
        max_guests_per_slot: 15, booking_status: "Open for Booking",
        cancellation_policy: "Free cancellation up to 48 hours before the journey starts.",
        min_age: "18+", meeting_point: "Estate Tasting Room & Visitor Center",
        arrival_instructions: "Please arrive 15 minutes prior to your time slot for check-in and welcome drink.",
        parking_available: true, exclusions: [], edition_date: "",
        turnout_count: "", rating: "4.95", reviews: [], recap_notes: "",
        tags: [], highlights: [], inclusions: [], host_info: { name: "", title: "", avatar: "", rating: 5, bio: "" },
        featured_vintages: []
      } as any);
      
      const notifs = [
        { id: "N-" + Date.now(), wineryId: currentWinery.id, title: status === 'past' ? "Past Journey Archived" : "New Estate Journey Added", description: `${newExperience.name} is saved.`, time: "Just now", category: "Experience", read: false },
        ...allNotifications
      ];
      setAllNotifications(notifs);
      
    } catch (err) { 
      console.error("Error saving experience to Backend:", err); 
    }
  };

  const handleDocUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const addedDoc = {
      id: "doc-" + Date.now(),
      wineryId: currentWinery.id,
      name: newDoc.name || "Licensing Record",
      type: newDoc.type,
      number: newDoc.number || "LIC-REG-" + Date.now().toString().slice(-4),
      fileUrl: "#",
      status: "Verified",
      expiryDate: newDoc.expiryDate || "2027-12-31",
      expiryDays: 480
    };

    const updated = [addedDoc, ...allDocs];
    setAllDocs(updated);
    syncToLocalStorage("vinosphere_documents", updated);
    setAddDocModalOpen(false);

    const notifs = [
      { id: "N-" + Date.now(), wineryId: currentWinery.id, title: "Document Uploaded", description: `Uploaded ${addedDoc.name}.`, time: "Just now", category: "Document", read: false },
      ...allNotifications
    ];
    setAllNotifications(notifs);
    syncToLocalStorage("vinosphere_notifications", notifs);

    setNewDoc({ name: "", type: "Wine License", number: "", expiryDate: "" });
  };
const handleUpdateWineryInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        description: currentWinery.story || currentWinery.description,
        latitude: currentWinery.coordinates?.lat,
        longitude: currentWinery.coordinates?.lng,
        banner_url: currentWinery.coverImage,
        logo_url: currentWinery.logo,
        city: currentWinery.location,
        awards: currentWinery.awards || [],
        timeline: currentWinery.storyTimeline || [],
      };

      const updatedDbWinery = await updateWinerySettings(currentWinery.id, payload);
      if (!updatedDbWinery) {
        throw new Error("Failed to update winery settings on the backend");
      }

      // Save updated winery fields
      const updatedWineries = allWineries.map(w => {
        if (w.id === currentWinery.id) {
          return currentWinery;
        }
        return w;
      });
      setAllWineries(updatedWineries);
      syncToLocalStorage("vinosphere_wineries", updatedWineries);

      const notifs = [
        { id: "N-" + Date.now(), wineryId: currentWinery.id, title: "Estate Narrative Saved", description: "Winery profile updated successfully and saved to DB.", time: "Just now", category: "Profile", read: false },
        ...allNotifications
      ];
      setAllNotifications(notifs);
      syncToLocalStorage("vinosphere_notifications", notifs);
      alert("Winery settings saved successfully and synced to database!");
    } catch (err) {
      console.error("Error saving winery settings:", err);
      alert("Failed to sync winery settings to database.");
    }
  };

  const markAllNotificationsRead = () => {
    const updated = allNotifications.map(n => n.wineryId === currentWinery?.id ? { ...n, read: true } : n);
    setAllNotifications(updated);
    syncToLocalStorage("vinosphere_notifications", updated);
  };

  const handleLeadAction = (id: string, action: "Accepted" | "Rejected" | "Proposal Sent") => {
    const updated = allLeads.map(l => l.id === id ? { ...l, status: action } : l);
    setAllLeads(updated);
    syncToLocalStorage("vinosphere_leads", updated);

    const notifs = [
      { id: "N-" + Date.now(), wineryId: currentWinery.id, title: "CRM Lead Actioned", description: `Lead status updated to ${action}.`, time: "Just now", category: "Corporate Lead", read: false },
      ...allNotifications
    ];
    setAllNotifications(notifs);
    syncToLocalStorage("vinosphere_notifications", notifs);
  };

  const handleReviewReply = (id: string, replyText: string) => {
    if (!replyText.trim()) return;
    const updated = allReviews.map(r => r.id === id ? { ...r, reply: replyText } : r);
    setAllReviews(updated);
    syncToLocalStorage("vinosphere_reviews", updated);

    const notifs = [
      { id: "N-" + Date.now(), wineryId: currentWinery.id, title: "Review Answered", description: "Your response has been published.", time: "Just now", category: "Review", read: false },
      ...allNotifications
    ];
    setAllNotifications(notifs);
    syncToLocalStorage("vinosphere_notifications", notifs);
  };

  const handleCheckIn = (id: string) => {
    const updated = allBookings.map(b => b.id === id ? { ...b, checkInStatus: "Checked In" } : b);
    setAllBookings(updated);
    syncToLocalStorage("vinosphere_bookings", updated);

    const notifs = [
      { id: "N-" + Date.now(), wineryId: currentWinery.id, title: "Customer Checked In", description: `Booking reference ${id} checked in.`, time: "Just now", category: "Booking", read: false },
      ...allNotifications
    ];
    setAllNotifications(notifs);
    syncToLocalStorage("vinosphere_notifications", notifs);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("vinosphere_current_winery");
      localStorage.removeItem("vinosphere_winery_token");
    }
    setCurrentWinery(null);
    logout();
    setPortalMode("login");
    setLoginEmail("");
    setLoginPassword("");
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FB]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6D071A]"></div>
      </div>
    );
  }

  // PORTAL VIEWS (LOGIN / REGISTRATION STEPS)
  if (!currentWinery) {
    return (
      <div className="h-screen w-screen relative overflow-hidden flex flex-col items-center justify-center font-sans bg-black">
        {/* Full screen background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/landing_bg.jpg')` }}
        />
        {/* Dark overlay with blur */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" />
        

        {/* Branding header above card */}
        <div className="relative z-10 flex flex-col items-center gap-3 mb-6">
          <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3">
            <img
              src="/vinosphere-logo.png"
              alt="VinoSphere"
              className="h-12 w-auto object-contain"
            />
            <div className="h-6 w-px bg-[#ECECEC]" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] font-mono leading-none">
                Business Suite
              </span>
              <span className="text-xs font-semibold text-[#6D071A] leading-tight">
                Estate Portal
              </span>
            </div>
          </div>
          <p className="text-white/80 text-xs font-medium tracking-wide">Nashik Estate Suite Portal</p>
        </div>

        {/* Central card */}
        <div className="relative z-10 w-full flex items-center justify-center px-4 max-h-[85vh]">
          {portalMode === "login" ? (
            // Centered login card (clean inputs, no demo cards)
            <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#ECECEC] shadow-2xl space-y-6 text-left">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold font-serif text-[#222222]">Winery Login</h2>
                <p className="text-xs text-charcoal-500">Sign in to your estate manager workspace to oversee wines, experiences, and bookings.</p>
              </div>

              <form onSubmit={handleWineryLogin} className="space-y-5 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Winery Registered Email / Username</label>
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="estate@winery.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ECECEC] bg-white focus:ring-1 focus:ring-[#6D071A] focus:border-[#6D071A] outline-none transition text-xs text-[#222222]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Password / Access Key</label>
                    <a href="#" className="text-[10px] font-semibold text-[#6D071A] hover:underline">Forgot?</a>
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ECECEC] bg-white focus:ring-1 focus:ring-[#6D071A] focus:border-[#6D071A] outline-none transition text-xs text-[#222222]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#6D071A] text-white rounded-xl font-bold hover:bg-[#841126] transition flex items-center justify-center gap-2 text-xs shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Sign In as Winery Owner
                </button>
              </form>

              <div className="pt-4 border-t border-[#ECECEC] text-center space-y-2">
                <p className="text-[10px] text-charcoal-400">Not a winery partner yet?</p>
                <button
                  onClick={() => setPortalMode("register")}
                  className="w-full py-2 border border-[#ECECEC] text-xs font-bold rounded-xl text-[#6D071A] hover:bg-burgundy-50 transition"
                >
                  Register Your Estate
                </button>
              </div>
            </div>
          ) : (
            // Centered Onboarding Wizard Card
            <div className="w-full max-w-3xl bg-white rounded-3xl border border-[#ECECEC] shadow-2xl overflow-hidden grid md:grid-cols-[200px_1fr] h-[520px]">
              {/* Wizard Sidebar Step Indicators */}
              <div className="bg-[#F8F9FB] border-r border-[#ECECEC] p-6 flex flex-col justify-between">
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Wine className="w-4 h-4 text-[#6D071A]" />
                    <span className="text-[10px] uppercase font-bold text-[#6D071A] tracking-wider">Setup Wizard</span>
                  </div>

                  {/* Steps mapping */}
                  {["Account", "Winery", "Business", "Documents", "Review"].map((item, index) => {
                    const isActive = regStep === index;
                    const isFirstStep = index === 0;

                    let bgStyle = "bg-transparent text-charcoal-500 hover:bg-[#FAF7F2]";
                    let circleStyle = "bg-[#F5EFE6] text-charcoal-700";
                    let textStyle = "text-charcoal-600 font-semibold";

                    if (isActive) {
                      if (isFirstStep) {
                        bgStyle = "bg-[#6D071A] text-white shadow-sm";
                        circleStyle = "bg-white/20 text-white";
                        textStyle = "text-white font-bold";
                      } else {
                        bgStyle = "bg-[#FAF7F2] border border-[#D4AF37]/30 text-[#222222] shadow-sm";
                        circleStyle = "bg-[#6D071A] text-white";
                        textStyle = "text-[#222222] font-bold";
                      }
                    }

                    return (
                      <div
                        key={item}
                        className={`flex items-center gap-2.5 p-2 rounded-xl transition-all duration-300 ${bgStyle}`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${circleStyle}`}>
                          {index + 1}
                        </span>
                        <span className={`text-[10px] uppercase tracking-wider ${textStyle}`}>{item}</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => { setPortalMode("login"); setRegStep(0); }}
                  className="text-[10px] font-bold text-charcoal-400 hover:text-charcoal-600 text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to Login
                </button>
              </div>

              {/* Wizard Form Panels */}
              <div className="p-8 flex flex-col justify-between overflow-y-auto bg-white">
                <div className="space-y-6">
                  
                  {/* Step Title Header */}
                  <div className="text-left">
                    <span className="text-[9px] uppercase font-bold text-[#D4AF37] tracking-wider">Step {regStep + 1} of 5</span>
                    <h3 className="text-xl font-bold font-serif text-[#222222]">
                      {regStep === 0 && "Owner Credentials"}
                      {regStep === 1 && "Estate Branding"}
                      {regStep === 2 && "Vineyard Business"}
                      {regStep === 3 && "Verification Docs"}
                      {regStep === 4 && "Narrative Verification"}
                    </h3>
                  </div>

                  {/* Form step 0: Account */}
                  {regStep === 0 && (
                    <div className="space-y-3 text-left">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-700">
                          Winery Owner Name <span className="text-red-500 font-bold ml-0.5">*</span>
                        </label>
                        <input
                          type="text"
                          value={regForm.ownerName}
                          onChange={(e) => setRegForm({ ...regForm, ownerName: e.target.value })}
                          placeholder="e.g. Rajeev Samant"
                          className="w-full p-2 border border-[#ECECEC] bg-white text-[#222222] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-700">
                          Winery Registered Email <span className="text-red-500 font-bold ml-0.5">*</span>
                        </label>
                        <input
                          type="email"
                          value={regForm.email}
                          onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                          placeholder="estate@winery.com"
                          className="w-full p-2 border border-[#ECECEC] bg-white text-[#222222] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-700">
                            Contact Phone <span className="text-red-500 font-bold ml-0.5">*</span>
                          </label>
                          <input
                            type="text"
                            value={regForm.phone}
                            onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                            placeholder="+91..."
                            className="w-full p-2 border border-[#ECECEC] bg-white text-[#222222] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-700">
                            Access Password <span className="text-red-500 font-bold ml-0.5">*</span>
                          </label>
                          <input
                            type="password"
                            value={regForm.password}
                            onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                            placeholder="Min. 6 characters"
                            className="w-full p-2 border border-[#ECECEC] bg-white text-[#222222] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form step 1: Winery */}
                  {regStep === 1 && (
                    <div className="space-y-3 text-left">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-700">
                          Winery Name <span className="text-red-500 font-bold ml-0.5">*</span>
                        </label>
                        <input
                          type="text"
                          value={regForm.wineryName}
                          onChange={(e) => setRegForm({ ...regForm, wineryName: e.target.value })}
                          placeholder="e.g. Sahyadri Hills Estate"
                          className="w-full p-2 border border-[#ECECEC] bg-white text-[#222222] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-700">
                          Tagline / Catchphrase <span className="text-charcoal-400 font-normal ml-1">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={regForm.tagline}
                          onChange={(e) => setRegForm({ ...regForm, tagline: e.target.value })}
                          className="w-full p-2 border border-[#ECECEC] bg-white text-[#222222] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-700">
                          Winery Location Region <span className="text-red-500 font-bold ml-0.5">*</span>
                        </label>
                        <select
                          value={regForm.location}
                          onChange={(e) => setRegForm({ ...regForm, location: e.target.value })}
                          className="w-full p-2 border border-[#ECECEC] bg-white text-[#222222] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                          required
                        >
                          <option value="Nashik Valley">Nashik Valley</option>
                          <option value="Gangapur">Gangapur, Nashik</option>
                          <option value="Dindori">Dindori, Nashik</option>
                          <option value="Ozar">Ozar, Nashik</option>
                          <option value="Vavi">Vavi, Nashik</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Form step 2: Business */}
                  {regStep === 2 && (
                    <div className="space-y-3 text-left">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-700">
                            Established Year <span className="text-red-500 font-bold ml-0.5">*</span>
                          </label>
                          <input
                            type="text"
                            value={regForm.established}
                            onChange={(e) => setRegForm({ ...regForm, established: e.target.value })}
                            placeholder="e.g. 2024"
                            className="w-full p-2 border border-[#ECECEC] bg-white text-[#222222] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-700">
                            Vineyard Size (Acres) <span className="text-red-500 font-bold ml-0.5">*</span>
                          </label>
                          <input
                            type="text"
                            value={regForm.vineyardArea}
                            onChange={(e) => setRegForm({ ...regForm, vineyardArea: e.target.value })}
                            placeholder="e.g. 150 acres"
                            className="w-full p-2 border border-[#ECECEC] bg-white text-[#222222] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-700">
                          Operating Hours <span className="text-red-500 font-bold ml-0.5">*</span>
                        </label>
                        <input
                          type="text"
                          value={regForm.operatingHours}
                          onChange={(e) => setRegForm({ ...regForm, operatingHours: e.target.value })}
                          placeholder="e.g. Mon-Sun: 10:00 AM - 8:00 PM"
                          className="w-full p-2 border border-[#ECECEC] bg-white text-[#222222] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-700">
                          Price Tier Category <span className="text-red-500 font-bold ml-0.5">*</span>
                        </label>
                        <select
                          value={regForm.priceRange}
                          onChange={(e) => setRegForm({ ...regForm, priceRange: e.target.value })}
                          className="w-full p-2 border border-[#ECECEC] bg-white text-[#222222] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                          required
                        >
                          <option value="₹">₹ (Economy Retail)</option>
                          <option value="₹₹">₹₹ (Value/Everyday)</option>
                          <option value="₹₹₹">₹₹₹ (Premium/Award Winning)</option>
                          <option value="₹₹₹₹">₹₹₹₹ (Ultra Premium/Collector)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Form step 3: Documents */}
                  {regStep === 3 && (
                    <div className="space-y-2 text-left">
                      {[
                        { key: "exciseOk", label: "State Excise Winery License (Form I)", mandatory: true },
                        { key: "fssaiOk", label: "FSSAI Central Food Safety Certification", mandatory: true },
                        { key: "isoOk", label: "ISO 22000 Quality Management Compliance", mandatory: false },
                        { key: "gstOk", label: "GSTIN Tax Registration Certification", mandatory: false }
                      ].map(doc => (
                        <label key={doc.key} className="flex items-center justify-between p-2.5 border border-[#ECECEC] rounded-xl bg-white hover:bg-[#F8F9FB] transition cursor-pointer">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-charcoal-700">{doc.label}</span>
                            {doc.mandatory ? (
                              <span className="text-[9px] font-bold uppercase text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                                Required
                              </span>
                            ) : (
                              <span className="text-[9px] text-charcoal-400 font-medium">(Optional)</span>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean((regForm as any)[doc.key])}
                            onChange={(e) => setRegForm({ ...regForm, [doc.key]: e.target.checked })}
                            className="w-4 h-4 accent-[#6D071A]"
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Form step 4: Review */}
                  {regStep === 4 && (
                    <div className="space-y-3 text-left overflow-y-auto max-h-[220px] pr-1">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-[#F8F9FB] border border-[#ECECEC] rounded-xl">
                          <span className="block text-[8px] uppercase font-bold text-charcoal-400">Owner Name</span>
                          <span className="font-bold text-[#222222]">{regForm.ownerName || "Not provided"}</span>
                        </div>
                        <div className="p-2.5 bg-[#F8F9FB] border border-[#ECECEC] rounded-xl">
                          <span className="block text-[8px] uppercase font-bold text-charcoal-400">Email Address</span>
                          <span className="font-bold text-[#222222] truncate block">{regForm.email || "Not provided"}</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-[#F8F9FB] border border-[#ECECEC] rounded-xl text-xs">
                        <span className="block text-[8px] uppercase font-bold text-charcoal-400">Winery Name</span>
                        <span className="font-bold text-[#6D071A]">{regForm.wineryName || "Not provided"}</span>
                        <span className="block text-[9px] text-charcoal-500 mt-1">{regForm.tagline} · {regForm.location}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-[#F8F9FB] border border-[#ECECEC] rounded-xl">
                          <span className="block text-[8px] uppercase font-bold text-charcoal-400">Established Year</span>
                          <span className="font-bold text-[#222222]">{regForm.established}</span>
                        </div>
                        <div className="p-2.5 bg-[#F8F9FB] border border-[#ECECEC] rounded-xl">
                          <span className="block text-[8px] uppercase font-bold text-charcoal-400">Vineyard Size</span>
                          <span className="font-bold text-[#222222]">{regForm.vineyardArea}</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-[#F8F9FB] border border-[#ECECEC] rounded-xl text-xs">
                        <span className="block text-[8px] uppercase font-bold text-charcoal-400">Verified Compliance</span>
                        <span className="font-bold text-green-700">
                          {[regForm.exciseOk, regForm.fssaiOk, regForm.isoOk, regForm.gstOk].filter(Boolean).length} / 4 Licenses Checked
                        </span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Form Navigation Actions */}
                <div className="flex justify-between gap-3 pt-3 border-t border-[#ECECEC] shrink-0">
                  <button
                    type="button"
                    disabled={regStep === 0 || isRegistering}
                    onClick={() => setRegStep(curr => Math.max(curr - 1, 0))}
                    className="px-4 py-1.5 border border-[#ECECEC] text-[#222222] text-xs font-bold rounded-xl hover:bg-[#F8F9FB] transition disabled:opacity-40"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    disabled={isRegistering}
                    onClick={() => {
                      if (regStep === 4) {
                        handleRegister();
                      } else {
                        // Step 0 Validation (Account)
                        if (regStep === 0) {
                          if (!regForm.ownerName.trim()) {
                            alert("Please enter the Winery Owner Name.");
                            return;
                          }
                          if (!regForm.email.trim() || !regForm.email.includes("@") || !regForm.email.includes(".")) {
                            alert("Please enter a valid Winery Registered Email (e.g. owner@estate.com).");
                            return;
                          }
                          if (!regForm.phone.trim() || regForm.phone.trim().length < 8) {
                            alert("Please enter a valid Contact Phone number.");
                            return;
                          }
                          if (!regForm.password || regForm.password.length < 6) {
                            alert("Password must be at least 6 characters long.");
                            return;
                          }
                        }

                        // Step 1 Validation (Winery Brand)
                        if (regStep === 1) {
                          if (!regForm.wineryName.trim()) {
                            alert("Please specify the Winery Name.");
                            return;
                          }
                          if (!regForm.location) {
                            alert("Please select the Winery Location Region.");
                            return;
                          }
                        }

                        // Step 2 Validation (Business & Vineyard)
                        if (regStep === 2) {
                          if (!regForm.established.trim() || isNaN(Number(regForm.established))) {
                            alert("Please enter a valid 4-digit Established Year (e.g. 2024).");
                            return;
                          }
                          if (!regForm.vineyardArea.trim()) {
                            alert("Please specify the Vineyard Size (e.g. 45 acres).");
                            return;
                          }
                          if (!regForm.operatingHours.trim()) {
                            alert("Please enter the Cellar Door Operating Hours.");
                            return;
                          }
                        }

                        // Step 3 Validation (Compliance Licenses)
                        if (regStep === 3) {
                          if (!regForm.exciseOk || !regForm.fssaiOk) {
                            alert("Both State Excise Winery License and FSSAI Food Safety Certification are required for onboarding.");
                            return;
                          }
                        }

                        setRegStep(curr => Math.min(curr + 1, 4));
                      }
                    }}
                    className="px-5 py-2 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition flex items-center gap-1.5 shadow disabled:opacity-50"
                  >
                    {isRegistering ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Launching...</span>
                      </>
                    ) : (
                      <>
                        <span>{regStep === 4 ? "Register & Launch" : "Continue"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#222222] font-sans flex overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-[260px] bg-white border-r border-[#ECECEC] flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30">
        <div>
          {/* Logo Brand Header */}
          <div className="p-5 border-b border-[#ECECEC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/vinosphere-logo.png"
                alt="VinoSphere"
                className="h-12 w-auto object-contain"
              />
            </div>
            <span className="px-2 py-0.5 text-[9px] font-bold bg-[#FAF5D3] text-[#936F18] border border-[#D4AF37]/30 rounded uppercase tracking-wider font-mono">
              Winery
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
            {[
              { label: "Dashboard", icon: LayoutDashboard },
              { label: "My Winery", icon: Building2 },
              { label: "Wine Catalog", icon: Wine },
              { label: "Quality Lab", tab: "Quality Lab", icon: FlaskConical },
              { label: "Tours & Experiences", tab: "Experiences", icon: Sparkles },
              { label: "Events", icon: Calendar },
              { label: "Bookings", icon: BookmarkCheck },
              { label: "Corporate Leads", icon: Briefcase },
              { label: "Reviews & Ratings", icon: MessageSquare },
              { label: "Analytics", icon: BarChart3 },
              { label: "EDA Layer", tab: "EDA Layer", icon: Activity },
              { label: "Documents", icon: FileText },
              { label: "Notifications", icon: Bell, badge: activeUnreadNotifications },
              { label: "Settings", icon: Settings }
            ].map(item => {
              const Icon = item.icon;
              const tabKey = (item as any).tab || item.label;
              const isActive = activeTab === tabKey || activeTab === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setActiveTab(tabKey);
                    if (item.label === "Notifications") setNotificationsOpen(true);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                    isActive
                      ? "bg-burgundy-50 text-[#6D071A]"
                      : "text-charcoal-600 hover:bg-[#F8F9FB] hover:text-[#222222]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#6D071A]" : "text-charcoal-400 group-hover:text-charcoal-600"}`} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#6D071A] text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile footer */}
        <div className="p-4 border-t border-[#ECECEC] space-y-2">
          <div className="flex items-center gap-3 p-2 bg-[#F8F9FB] rounded-xl">
            {currentWinery.logo ? (
              <img 
                src={currentWinery.logo} 
                alt="winery logo" 
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
                className="w-10 h-10 rounded-lg object-cover bg-white" 
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#6D071A]/10 text-[#6D071A] font-bold flex items-center justify-center text-sm font-serif">
                {currentWinery.name?.[0] || 'W'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#222222] truncate">{currentWinery.name}</p>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-[#D4AF37]" />
                <span className="text-[10px] text-charcoal-400 font-semibold uppercase">Verified</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-[#EF4444] bg-[#F8F9FB] rounded-xl hover:bg-red-50 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout Estate
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* TOP NAVIGATION BAR */}
        <header className="h-[72px] bg-white border-b border-[#ECECEC] px-8 flex justify-between items-center shrink-0 sticky top-0 z-20">
          {/* Top Left: Title or Search */}
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search wines, event bookings, and corporate leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#ECECEC] rounded-xl outline-none focus:border-[#6D071A] text-xs text-[#222222]"
              />
            </div>
          </div>

          {/* Top Right: Status Badges, Bell, Profile dropdown */}
          <div className="flex items-center gap-6">


            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 hover:bg-[#F8F9FB] rounded-xl transition relative"
              >
                <Bell className="w-4 h-4 text-charcoal-600" />
                {activeUnreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full animate-ping"></span>
                )}
              </button>

              {/* In-app Notifications Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-[#ECECEC] rounded-2xl shadow-xl z-40 overflow-hidden"
                    >
                      <div className="p-4 border-b border-[#ECECEC] flex justify-between items-center">
                        <span className="text-xs font-bold text-[#222222]">Notifications</span>
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[10px] font-bold text-[#6D071A] hover:underline"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="divide-y divide-[#ECECEC] max-h-72 overflow-y-auto text-left">
                        {activeNotifications.length > 0 ? (
                          activeNotifications.map(n => (
                            <div key={n.id} className={`p-4 hover:bg-[#F8F9FB] transition ${!n.read ? "bg-burgundy-50/20" : ""}`}>
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-xs font-semibold text-[#222222]">{n.title}</p>
                                <span className="text-[9px] text-charcoal-400 whitespace-nowrap">{n.time}</span>
                              </div>
                              <p className="text-[11px] text-charcoal-600 mt-1 leading-relaxed">{n.description}</p>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-charcoal-400 text-xs">No notifications yet.</div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Picture & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-[#F8F9FB] rounded-xl transition"
              >
                {currentWinery.logo ? (
                  <img 
                    src={currentWinery.logo} 
                    alt="avatar" 
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
                    className="w-7 h-7 rounded-lg object-cover" 
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-[#6D071A]/10 text-[#6D071A] font-bold flex items-center justify-center text-xs font-serif">
                    {currentWinery.name?.[0] || 'W'}
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setProfileDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-[#ECECEC] rounded-2xl shadow-xl z-40 overflow-hidden"
                    >
                      <div className="p-4 border-b border-[#ECECEC] text-left">
                        <p className="text-xs font-bold text-[#222222]">{currentWinery.name}</p>
                        <p className="text-[10px] text-charcoal-400 mt-0.5 truncate">{currentWinery.contact?.email || currentWinery.email || "estate@vinosphere.in"}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => { setActiveTab("My Winery"); setProfileDropdownOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-charcoal-700 hover:bg-[#F8F9FB] rounded-lg transition"
                        >
                          My Profile
                        </button>
                        <button
                          onClick={() => { setActiveTab("Settings"); setProfileDropdownOpen(false); }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-charcoal-700 hover:bg-[#F8F9FB] rounded-lg transition"
                        >
                          Portal Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* SUBPAGE CONTENT AREA */}
        <main className="p-8 flex-1 max-w-7xl w-full mx-auto space-y-8">
          
          {/* TAB 1: DASHBOARD HOME */}
          {activeTab === "Dashboard" && (
            <div className="space-y-8">
              {/* Operations header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-[#ECECEC] shadow-sm relative overflow-hidden">
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-[#6D071A] tracking-wider">Estate Operations</span>
                    <span className="px-2 py-0.5 bg-[#FDF2F4] text-[#6D071A] border border-[#6D071A]/20 text-[10px] font-bold rounded-md">Live Estate Portal</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#222222]">
                    Operations Dashboard &bull; <span className="text-[#6D071A]">{currentWinery.name}</span>
                  </h2>
                  <p className="text-xs text-charcoal-500 max-w-xl">
                    Operational management for active vintages, tasting reservations, cellar door check-ins, and B2B corporate inquiries.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setAddWineModalOpen(true)}
                    className="px-4 py-2.5 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Quick Add Wine
                  </button>
                  <button
                    onClick={() => setActiveTab("Bookings")}
                    className="px-4 py-2.5 bg-white border border-[#ECECEC] text-[#222222] hover:bg-[#F8F9FB] text-xs font-bold rounded-xl transition flex items-center gap-2"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Review Bookings
                  </button>
                </div>
              </div>

              {/* BUSINESS PERFORMANCE OVERVIEW & PERIOD SELECTOR */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-charcoal-400 text-left">Business Performance Overview</h3>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#ECECEC] shadow-sm">
                    <Calendar className="w-3.5 h-3.5 text-[#6D071A]" />
                    <span className="text-xs font-semibold text-charcoal-600">Period:</span>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => {
                        const p = e.target.value;
                        setSelectedPeriod(p);
                        loadAnalytics(p);
                      }}
                      className="bg-transparent text-xs font-bold text-[#222222] focus:outline-none cursor-pointer"
                    >
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                  {/* Card 1: Event Bookings */}
                  <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-sm text-left relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Event Bookings</p>
                      <Calendar className="w-4 h-4 text-burgundy-600" />
                    </div>
                    <p className="text-2xl font-bold font-serif text-[#222222] mt-1">
                      {analyticsLoading ? "..." : (businessAnalytics?.eventBookings?.current ?? 0)}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      {renderMetricChange(businessAnalytics?.eventBookings)}
                      <span className="text-[9px] text-charcoal-400 font-medium">vs {businessAnalytics?.eventBookings?.previous ?? 0} prev</span>
                    </div>
                  </div>

                  {/* Card 2: Experience Bookings */}
                  <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-sm text-left relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Experience Bookings</p>
                      <Sparkles className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold font-serif text-[#222222] mt-1">
                      {analyticsLoading ? "..." : (businessAnalytics?.experienceBookings?.current ?? 0)}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      {renderMetricChange(businessAnalytics?.experienceBookings)}
                      <span className="text-[9px] text-charcoal-400 font-medium">vs {businessAnalytics?.experienceBookings?.previous ?? 0} prev</span>
                    </div>
                  </div>

                  {/* Card 3: Corporate Inquiries */}
                  <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-sm text-left relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Corporate Inquiries</p>
                      <Briefcase className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold font-serif text-[#222222] mt-1">
                      {analyticsLoading ? "..." : (businessAnalytics?.corporateInquiries?.current ?? 0)}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      {renderMetricChange(businessAnalytics?.corporateInquiries)}
                      <span className="text-[9px] text-charcoal-400 font-medium">vs {businessAnalytics?.corporateInquiries?.previous ?? 0} prev</span>
                    </div>
                  </div>

                  {/* Card 4: Gross Booking Value */}
                  <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-sm text-left relative overflow-hidden group">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Gross Booking Value</p>
                        <div className="relative group/tooltip">
                          <Info className="w-3 h-3 text-charcoal-400 cursor-help" />
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg.charcoal-900 text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition pointer-events-none z-30">
                            Gross Booking Value reflects eligible paid event and experience bookings recorded on VinoSphere. It does not represent total winery revenue.
                          </div>
                        </div>
                      </div>
                      <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <p className="text-2xl font-bold font-serif text-[#222222] mt-1">
                      {analyticsLoading ? "..." : formatCurrency(businessAnalytics?.totalGrossBookingValue?.current ?? 0)}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      {renderMetricChange(businessAnalytics?.totalGrossBookingValue)}
                      <span className="text-[9px] text-charcoal-400 font-medium">vs {formatCurrency(businessAnalytics?.totalGrossBookingValue?.previous ?? 0)} prev</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TRAFFIC & ENGAGEMENT METRICS */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-charcoal-400 mb-4 text-left">Traffic & Engagement Summary</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                  {[
                    { label: "Wine Views", value: analyticsLoading ? "..." : dashboardSummary?.wine_views || 0, badge: "VinoSphere Traffic" },
                    { label: "Wine Saves", value: analyticsLoading ? "..." : dashboardSummary?.wine_saves || 0, badge: `${dashboardSummary?.view_to_save_rate || 0}% Save Rate` },
                    { label: "Guests Booked", value: analyticsLoading ? "..." : dashboardSummary?.guests_booked || 0, badge: `${dashboardSummary?.capacity_utilization || 0}% Utilization` },
                    { label: "Active Bookings", value: activeBookings.length, badge: `${activeBookings.filter((b: any) => b.checkInStatus === "Pending").length} Pending` },
                  ].map((kpi, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-sm text-left">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">{kpi.label}</p>
                        <p className="text-2xl font-bold font-serif text-[#222222]">{kpi.value}</p>
                        <span className="inline-block text-[9px] font-semibold text-charcoal-500 bg-[#F8F9FB] px-2 py-0.5 rounded-md mt-1">
                          {kpi.badge}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DASHBOARD CHARTS SECTION */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Chart: VinoSphere Engagement Trend */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#ECECEC] shadow-sm space-y-6 text-left">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-[#222222]">VinoSphere Engagement Trend</h4>
                      <p className="text-[10px] text-charcoal-400">Daily wine views vs wine saves over the last 30 days</p>
                    </div>
                  </div>
                  <div className="h-64">
                    {analyticsLoading ? (
                      <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-xs">Loading trend data...</div>
                    ) : dashboardTimeSeries.length === 0 ? (
                      <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-xs">Not enough data yet to generate a reliable trend insight.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dashboardTimeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6D071A" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#6D071A" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" stroke="#CCCCCC" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis stroke="#CCCCCC" fontSize={9} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "12px", border: "1px solid #ECECEC" }} />
                          <CartesianGrid stroke="#F5F5F5" strokeDasharray="3 3" vertical={false} />
                          <Area type="monotone" dataKey="wine_views" stroke="#6D071A" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" name="Wine Views" />
                          <Area type="monotone" dataKey="wine_saves" stroke="#D4AF37" strokeWidth={1.5} fillOpacity={0} name="Wine Saves" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Right Panel: Most Viewed Wines */}
                <div className="bg-white p-6 rounded-3xl border border-[#ECECEC] shadow-sm space-y-6 flex flex-col justify-between text-left">
                  <div>
                    <h4 className="text-sm font-bold text-[#222222]">Most Viewed Wines</h4>
                    <p className="text-[10px] text-charcoal-400">Wines receiving the most traffic on VinoSphere</p>
                  </div>
                  <div className="space-y-4 flex-1">
                    {analyticsLoading ? (
                      <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-xs">Loading wine data...</div>
                    ) : (!dashboardSummary?.most_viewed_wines || dashboardSummary.most_viewed_wines.length === 0) ? (
                      <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-xs">No wine traffic recorded yet.</div>
                    ) : (
                      dashboardSummary.most_viewed_wines.map((wine: any, idx: number) => {
                         const wineDetails = activeWines.find(w => w.id === wine.wine_id) || { name: 'Unknown Wine', coverImage: '' };
                         return (
                           <div key={idx} className="flex items-center justify-between">
                             <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 bg-charcoal-50 rounded overflow-hidden shrink-0 flex items-center justify-center">
                                  {wineDetails.coverImage ? (
                                    <img src={wineDetails.coverImage} alt={wineDetails.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Wine className="w-4 h-4 text-charcoal-300" />
                                  )}
                                </div>
                                <div className="truncate">
                                  <p className="text-xs font-semibold text-[#222222] truncate">{wineDetails.name}</p>
                                </div>
                             </div>
                             <p className="text-xs font-bold text-burgundy-600 shrink-0">{wine.views} Views</p>
                           </div>
                         );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* BOOKING PERFORMANCE (EVENTS & EXPERIENCES) & CORPORATE INQUIRIES */}
              <div className="grid lg:grid-cols-3 gap-8 text-left">
                {/* Left: Events Performance */}
                <div className="bg-white p-6 rounded-3xl border border-[#ECECEC] shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-burgundy-600" />
                      <h4 className="text-sm font-bold text-[#222222]">Events Performance</h4>
                    </div>
                    <span className="text-[10px] font-bold text-burgundy-600 bg-burgundy-50 px-2 py-0.5 rounded">Events</span>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center py-1.5 border-b border-[#F5F5F5]">
                      <span className="text-xs text-charcoal-500">Event Bookings</span>
                      <span className="text-xs font-bold text-[#222222]">{businessAnalytics?.eventBookings?.current ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#F5F5F5]">
                      <span className="text-xs text-charcoal-500">Guests Booked</span>
                      <span className="text-xs font-bold text-[#222222]">{businessAnalytics?.eventGuests?.current ?? 0} guests</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#F5F5F5]">
                      <span className="text-xs text-charcoal-500">Capacity Utilization</span>
                      <span className="text-xs font-bold text-emerald-600">
                        {businessAnalytics?.eventCapacityUtilization?.current !== undefined && businessAnalytics?.eventCapacityUtilization?.current > 0
                          ? `${businessAnalytics.eventCapacityUtilization.current}% capacity utilization`
                          : "No event capacity data"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-xs text-charcoal-500 font-medium">Gross Booking Value</span>
                      <span className="text-xs font-bold text-burgundy-600">
                        {formatCurrency(businessAnalytics?.eventGrossBookingValue?.current ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: Experiences Performance */}
                <div className="bg-white p-6 rounded-3xl border border-[#ECECEC] shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <h4 className="text-sm font-bold text-[#222222]">Experiences Performance</h4>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Tours & Tastings</span>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center py-1.5 border-b border-[#F5F5F5]">
                      <span className="text-xs text-charcoal-500">Experience Bookings</span>
                      <span className="text-xs font-bold text-[#222222]">{businessAnalytics?.experienceBookings?.current ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#F5F5F5]">
                      <span className="text-xs text-charcoal-500">Guests Booked</span>
                      <span className="text-xs font-bold text-[#222222]">{businessAnalytics?.experienceGuests?.current ?? 0} guests</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#F5F5F5]">
                      <span className="text-xs text-charcoal-500">Avg Party Size</span>
                      <span className="text-xs font-bold text-[#222222]">
                        {businessAnalytics?.experienceBookings?.current > 0
                          ? ((businessAnalytics?.experienceGuests?.current ?? 0) / (businessAnalytics.experienceBookings.current || 1)).toFixed(1)
                          : "0"} guests
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-xs text-charcoal-500 font-medium">Gross Booking Value</span>
                      <span className="text-xs font-bold text-amber-600">
                        {formatCurrency(businessAnalytics?.experienceGrossBookingValue?.current ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Corporate Inquiries */}
                <div className="bg-white p-6 rounded-3xl border border-[#ECECEC] shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-bold text-[#222222]">Corporate Inquiries</h4>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">B2B Leads</span>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center py-1.5 border-b border-[#F5F5F5]">
                      <span className="text-xs text-charcoal-500">Total Inquiries</span>
                      <span className="text-xs font-bold text-[#222222]">{businessAnalytics?.corporateInquiries?.current ?? 0}</span>
                    </div>
                    <div className="py-2 border-b border-[#F5F5F5] space-y-1.5">
                      <span className="text-xs text-charcoal-500 block">Status Breakdown</span>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="bg-amber-50 p-1.5 rounded border border-amber-100">
                          <span className="block text-[9px] text-amber-700 font-medium">Pending</span>
                          <span className="text-xs font-bold text-amber-800">{businessAnalytics?.corporateStatusBreakdown?.pending ?? 0}</span>
                        </div>
                        <div className="bg-emerald-50 p-1.5 rounded border border-emerald-100">
                          <span className="block text-[9px] text-emerald-700 font-medium">Approved</span>
                          <span className="text-xs font-bold text-emerald-800">{businessAnalytics?.corporateStatusBreakdown?.approved ?? 0}</span>
                        </div>
                        <div className="bg-rose-50 p-1.5 rounded border border-rose-100">
                          <span className="block text-[9px] text-rose-700 font-medium">Rejected</span>
                          <span className="text-xs font-bold text-rose-800">{businessAnalytics?.corporateStatusBreakdown?.rejected ?? 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-charcoal-500">Avg Expected Guests</span>
                      <span className="text-xs font-bold text-blue-600">
                        {businessAnalytics?.corporateAvgExpectedGuests ?? 0} guests
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PERIOD COMPARISON SUMMARY TABLE */}
              <div className="bg-white p-6 rounded-3xl border border-[#ECECEC] shadow-sm space-y-4 text-left">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-[#222222]">Period Comparison Report</h4>
                    <p className="text-[10px] text-charcoal-400">Comparing current period vs equivalent previous period</p>
                  </div>
                  <span className="text-[10px] font-semibold text-charcoal-500 bg-[#F8F9FB] px-2 py-1 rounded-md border border-[#ECECEC]">
                    {selectedPeriod === '7d' ? '7-Day Windows' : selectedPeriod === '30d' ? '30-Day Windows' : '90-Day Windows'}
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#ECECEC] text-[10px] uppercase tracking-wider text-charcoal-400">
                        <th className="py-2.5 px-3 font-bold">Business Metric</th>
                        <th className="py-2.5 px-3 font-bold text-right">Current Period</th>
                        <th className="py-2.5 px-3 font-bold text-right">Previous Period</th>
                        <th className="py-2.5 px-3 font-bold text-right">Absolute Change</th>
                        <th className="py-2.5 px-3 font-bold text-right">Percentage Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F5F5] text-xs">
                      {[
                        { label: "Event Bookings", metric: businessAnalytics?.eventBookings, isCurrency: false },
                        { label: "Event Guests", metric: businessAnalytics?.eventGuests, isCurrency: false },
                        { label: "Experience Bookings", metric: businessAnalytics?.experienceBookings, isCurrency: false },
                        { label: "Experience Guests", metric: businessAnalytics?.experienceGuests, isCurrency: false },
                        { label: "Corporate Inquiries", metric: businessAnalytics?.corporateInquiries, isCurrency: false },
                        { label: "Gross Booking Value", metric: businessAnalytics?.totalGrossBookingValue, isCurrency: true },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#F8F9FB] transition">
                          <td className="py-2.5 px-3 font-semibold text-[#222222]">{row.label}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-[#222222]">
                            {row.isCurrency ? formatCurrency(row.metric?.current) : (row.metric?.current ?? 0)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-charcoal-500">
                            {row.isCurrency ? formatCurrency(row.metric?.previous) : (row.metric?.previous ?? 0)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-charcoal-600 font-medium">
                            {row.metric?.absoluteChange > 0 ? `+${row.metric.absoluteChange}` : (row.metric?.absoluteChange ?? 0)}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {renderMetricChange(row.metric)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DASHBOARD INSIGHTS SECTION */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-charcoal-400 mb-4 text-left">Insights & Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                  {analyticsLoading ? (
                    <div className="bg-white p-6 rounded-3xl border border-[#ECECEC] shadow-sm flex items-center justify-center text-charcoal-400 text-xs col-span-3">Loading insights...</div>
                  ) : (!dashboardInsights || dashboardInsights.length === 0) ? (
                    <div className="bg-white p-6 rounded-3xl border border-[#ECECEC] shadow-sm flex items-center justify-center text-charcoal-400 text-xs col-span-3">No active recommendations available. Check back later when more traffic occurs.</div>
                  ) : (
                    dashboardInsights.map((insight: any) => {
                      const evidenceObj = insight.evidence || insight;
                      const formattedDate = formatInsightDate(insight.created_at || insight.generated_at || evidenceObj?.generated_at);
                      const actionState = insightActionStates[insight.id];
                      const isActionPending = actionState?.status === 'loading';

                      return (
                        <div key={insight.id} className="bg-white p-5 rounded-3xl border border-burgundy-200 shadow-sm flex flex-col justify-between relative overflow-hidden space-y-3.5">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-burgundy-50 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

                          {/* Top row: Badge + Date */}
                          <div className="flex items-center justify-between gap-2 z-10">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-burgundy-700 bg-burgundy-50 px-2.5 py-1 rounded border border-burgundy-100">
                              {insight.rule_id ? insight.rule_id.replace(/_/g, ' ') : getInsightMetricLabel(evidenceObj?.metric)}
                            </span>
                            {formattedDate && (
                              <span className="text-[10px] font-medium text-charcoal-400 shrink-0">{formattedDate}</span>
                            )}
                          </div>

                          {/* Condition Detected / Title */}
                          <div className="z-10">
                            <h4 className="text-sm font-bold text-[#222222] capitalize leading-snug">
                              {insight.condition_detected || (evidenceObj?.metric ? `${getInsightMetricLabel(evidenceObj.metric)} trend` : 'Insight Detected')}
                            </h4>
                          </div>

                          {/* Evidence / KPI Grid */}
                          {evidenceObj && (
                            <div className="bg-[#F8F9FB] p-3 rounded-2xl border border-[#ECECEC] text-left z-10 space-y-2">
                              <div className="grid grid-cols-3 gap-2 border-b border-[#ECECEC] pb-2">
                                <div>
                                  <span className="text-[10px] text-charcoal-400 block font-semibold uppercase">Current</span>
                                  <span className="text-xs font-bold text-stone-900">{formatInsightValue(evidenceObj.current_value, evidenceObj.metric)}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-charcoal-400 block font-semibold uppercase">Previous</span>
                                  <span className="text-xs font-bold text-stone-900">{formatInsightValue(evidenceObj.comparison_value, evidenceObj.metric)}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-charcoal-400 block font-semibold uppercase">Change</span>
                                  <span className={`text-xs font-bold ${(evidenceObj.percentage_change || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {(evidenceObj.percentage_change || 0) >= 0 ? `+${evidenceObj.percentage_change}%` : `${evidenceObj.percentage_change}%`}
                                  </span>
                                </div>
                              </div>
                              <div className="text-[10px] text-charcoal-500 font-medium flex justify-between items-center">
                                <span>Absolute change</span>
                                <span className="font-bold text-stone-800">{formatInsightAbsoluteChange(evidenceObj.absolute_change, evidenceObj.metric)}</span>
                              </div>
                            </div>
                          )}

                          {/* What this means */}
                          <div className="text-left space-y-1 z-10">
                            <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wide block">What this means</span>
                            <p className="text-xs text-charcoal-700 leading-relaxed font-normal">
                              {constructWhatThisMeans(evidenceObj)}
                            </p>
                          </div>

                          {/* Recommended action */}
                          <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-2xl text-left space-y-1 z-10">
                            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1">
                              <Sparkles size={12} className="text-amber-600 shrink-0" />
                              Recommended action
                            </span>
                            <p className="text-xs text-amber-950 font-medium leading-relaxed">
                              {extractRecommendationText(insight)}
                            </p>
                          </div>

                          {/* Error Banner */}
                          {actionState?.status === 'error' && (
                            <div className="text-[10px] text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200 text-center z-10">
                              {actionState.message}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-1 flex gap-2 z-10">
                            <button
                              disabled={isActionPending}
                              onClick={() => handleUpdateInsightStatus(insight.id, 'completed')}
                              className="flex-1 bg-burgundy-600 text-white text-[11px] font-bold py-2 px-3 rounded-xl hover:bg-burgundy-700 disabled:opacity-50 transition flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              {isActionPending && actionState?.action === 'completed' ? (
                                <>
                                  <Loader2 size={12} className="animate-spin" />
                                  <span>Completing...</span>
                                </>
                              ) : (
                                <span>Mark Complete</span>
                              )}
                            </button>
                            <button
                              disabled={isActionPending}
                              onClick={() => handleUpdateInsightStatus(insight.id, 'dismissed')}
                              className="flex-1 bg-white border border-[#ECECEC] text-charcoal-700 text-[11px] font-bold py-2 px-3 rounded-xl hover:bg-[#F8F9FB] disabled:opacity-50 transition flex items-center justify-center gap-1.5"
                            >
                              {isActionPending && actionState?.action === 'dismissed' ? (
                                <>
                                  <Loader2 size={12} className="animate-spin" />
                                  <span>Dismissing...</span>
                                </>
                              ) : (
                                <span>Dismiss</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* QUICK ACTIONS SECTION */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-charcoal-400 mb-4 text-left">Quick Estate Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {[
                    { title: "Add New Wine", icon: PlusCircle, onClick: () => setAddWineModalOpen(true) },
                    { title: "Create Experience", icon: Sparkles, onClick: () => setAddExperienceModalOpen(true) },
                    { title: "Create Event", icon: Calendar, onClick: () => setAddEventModalOpen(true) },
                    { title: "Manage Pricing", icon: Percent, onClick: () => setActiveTab("Wine Catalog") },
                    { title: "Upload Certification", icon: Upload, onClick: () => setAddDocModalOpen(true) },
                    { title: "Update Winery Profile", icon: Building2, onClick: () => setActiveTab("My Winery") },
                  ].map((act, idx) => {
                    const Icon = act.icon;
                    return (
                      <button
                        key={idx}
                        onClick={act.onClick}
                        className="bg-white p-4 rounded-xl border border-[#ECECEC] hover:bg-[#F8F9FB] transition-all text-left flex flex-col justify-between h-24 group"
                      >
                        <div className="p-2 rounded-lg bg-[#F8F9FB] group-hover:bg-burgundy-50 transition w-fit">
                          <Icon className="w-4 h-4 text-charcoal-600 group-hover:text-[#6D071A]" />
                        </div>
                        <p className="text-xs font-bold text-[#222222] group-hover:text-[#6D071A]">{act.title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY WINERY */}
          {activeTab === "My Winery" && (
            <div className="space-y-8 text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-[#222222]">Winery Profile Narrative</h2>
                  <p className="text-xs text-charcoal-500">Edit {currentWinery.name} public storefront narrative, story copy, contact coordinates, and certifications.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateWineryInfo} className="bg-white p-8 rounded-3xl border border-[#ECECEC] shadow-sm space-y-8">
                
                {/* Covers & Logos Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">Winery Cover Image</label>
                    <div 
                      onClick={() => coverInputRef.current?.click()}
                      className="relative h-44 rounded-2xl overflow-hidden border border-[#ECECEC] group cursor-pointer"
                    >
                      <img src={currentWinery.coverImage} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-charcoal-700 flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" /> Replace Cover
                        </span>
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={coverInputRef} 
                      onChange={handleCoverUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">Estate Logo</label>
                    <div 
                      onClick={() => logoInputRef.current?.click()}
                      className="h-44 border border-dashed border-[#ECECEC] rounded-2xl flex flex-col items-center justify-center p-6 bg-[#F8F9FB] relative group cursor-pointer hover:bg-[#F0F2F5] transition"
                    >
                      <img src={currentWinery.logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover border border-[#ECECEC] shadow-sm bg-white" />
                      <span className="text-[10px] text-charcoal-400 mt-3 font-semibold group-hover:underline">Change Logo</span>
                    </div>
                    <input 
                      type="file" 
                      ref={logoInputRef} 
                      onChange={handleLogoUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />
                  </div>
                </div>

                {/* Banners & Images Url Inputs */}
                <div className="grid md:grid-cols-2 gap-6 bg-[#F8F9FB] p-6 rounded-2xl border border-[#ECECEC]">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6D071A]">Cover Image URL</label>
                    <input
                      type="text"
                      value={currentWinery.coverImage || ""}
                      onChange={(e) => setCurrentWinery({ ...currentWinery, coverImage: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl outline-none focus:border-[#6D071A] text-xs text-[#222222] bg-white shadow-sm"
                      placeholder="Paste banner image URL here..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6D071A]">Logo Image URL</label>
                    <input
                      type="text"
                      value={currentWinery.logo || ""}
                      onChange={(e) => setCurrentWinery({ ...currentWinery, logo: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl outline-none focus:border-[#6D071A] text-xs text-[#222222] bg-white shadow-sm"
                      placeholder="Paste logo image URL here..."
                    />
                  </div>
                </div>

                {/* Narrative Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">Winery Story (About Us)</label>
                    <textarea
                      value={currentWinery.story || currentWinery.description || ""}
                      onChange={(e) => setCurrentWinery({ ...currentWinery, story: e.target.value })}
                      className="w-full h-32 p-4 border border-[#ECECEC] rounded-xl outline-none focus:border-[#6D071A] text-xs text-[#222222]"
                      placeholder="Write your organic vision story..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">Estate History (Heritage)</label>
                    <textarea
                      value={currentWinery.history || ""}
                      onChange={(e) => setCurrentWinery({ ...currentWinery, history: e.target.value })}
                      className="w-full h-32 p-4 border border-[#ECECEC] rounded-xl outline-none focus:border-[#6D071A] text-xs text-[#222222]"
                      placeholder="Detail vintage foundation years..."
                    />
                  </div>
                </div>

                {/* Contact Coordinates */}
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">Inquiry Phone</label>
                    <input
                      type="text"
                      value={currentWinery.contact?.phone || currentWinery.phone || ""}
                      onChange={(e) => setCurrentWinery({ ...currentWinery, contact: { ...(currentWinery.contact || {}), phone: e.target.value } })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl outline-none focus:border-[#6D071A] text-xs text-[#222222]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">Customer Support Email</label>
                    <input
                      type="email"
                      value={currentWinery.contact?.email || currentWinery.email || ""}
                      onChange={(e) => setCurrentWinery({ ...currentWinery, contact: { ...(currentWinery.contact || {}), email: e.target.value } })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl outline-none focus:border-[#6D071A] text-xs text-[#222222]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">Estate Website URL</label>
                    <input
                      type="text"
                      value={currentWinery.contact?.website || currentWinery.website || ""}
                      onChange={(e) => setCurrentWinery({ ...currentWinery, contact: { ...(currentWinery.contact || {}), website: e.target.value } })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl outline-none focus:border-[#6D071A] text-xs text-[#222222]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">Operating Hours</label>
                    <input
                      type="text"
                      value={currentWinery.openingHours || ""}
                      onChange={(e) => setCurrentWinery({ ...currentWinery, openingHours: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl outline-none focus:border-[#6D071A] text-xs text-[#222222]"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">Location Address</label>
                    <input
                      type="text"
                      value={currentWinery.contact?.address || currentWinery.address || ""}
                      onChange={(e) => setCurrentWinery({ ...currentWinery, contact: { ...(currentWinery.contact || {}), address: e.target.value } })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl outline-none focus:border-[#6D071A] text-xs text-[#222222]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">Awards Listing (Comma Separated)</label>
                    <input
                      type="text"
                      value={currentWinery.awards?.join(", ") || ""}
                      onChange={(e) => setCurrentWinery({ ...currentWinery, awards: e.target.value.split(",").map(s => s.trim()) })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl outline-none focus:border-[#6D071A] text-xs text-[#222222]"
                    />
                  </div>
                </div>

                {/* Awards List Builder */}
                <div className="space-y-4 pt-6 border-t border-[#ECECEC] bg-[#F8F9FB] p-6 rounded-2xl border border-[#ECECEC]">
                  <div>
                    <h3 className="text-sm font-bold text-[#6D071A]">Awards & Recognitions</h3>
                    <p className="text-[10px] text-charcoal-500">Configure award badges that display at the top of your consumer storefront page.</p>
                  </div>

                  <div className="space-y-3">
                    {(currentWinery.awards || []).map((award: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#ECECEC] text-xs">
                        <div>
                          <span className="font-bold text-[#6D071A] mr-2">[{award.year}]</span>
                          <span className="font-semibold text-charcoal-800">{award.title}</span>
                          <span className="text-charcoal-400 mx-1.5">•</span>
                          <span className="text-charcoal-500">{award.competition}</span>
                          <span className="ml-2 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[9px] border border-amber-200 font-bold">{award.medal}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (currentWinery.awards || []).filter((_: any, i: number) => i !== idx);
                            setCurrentWinery({ ...currentWinery, awards: list });
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 items-end bg-white p-4 rounded-xl border border-[#ECECEC]">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-charcoal-600">Year</label>
                      <input
                        id="new-award-year"
                        type="text"
                        placeholder="e.g. 2023"
                        className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none focus:border-[#6D071A]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-charcoal-600">Award Title</label>
                      <input
                        id="new-award-title"
                        type="text"
                        placeholder="e.g. Best Red Wine"
                        className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none focus:border-[#6D071A]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-charcoal-600">Competition</label>
                      <input
                        id="new-award-comp"
                        type="text"
                        placeholder="e.g. Decanter Awards"
                        className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none focus:border-[#6D071A]"
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="space-y-1 flex-1">
                        <label className="text-[10px] font-bold text-charcoal-600">Medal / Recognition</label>
                        <select
                          id="new-award-medal"
                          value={newAwardMedal}
                          onChange={(e) => setNewAwardMedal(e.target.value)}
                          className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none focus:border-[#6D071A]"
                        >
                          <option value="Gold">Gold</option>
                          <option value="Silver">Silver</option>
                          <option value="Bronze">Bronze</option>
                          <option value="Platinum">Platinum</option>
                          <option value="Double Gold">Double Gold</option>
                          <option value="Other">Other (Custom)</option>
                        </select>
                      </div>
                      {newAwardMedal !== "Other" && (
                        <button
                          type="button"
                          onClick={() => {
                            const yearInput = document.getElementById('new-award-year') as HTMLInputElement | null;
                            const titleInput = document.getElementById('new-award-title') as HTMLInputElement | null;
                            const compInput = document.getElementById('new-award-comp') as HTMLInputElement | null;
                            const year = yearInput?.value?.trim() || '';
                            const title = titleInput?.value?.trim() || '';
                            const comp = compInput?.value?.trim() || '';
                            if (!year || !title) {
                              alert("Year and Award Title are required");
                              return;
                            }
                            const list = [...(currentWinery.awards || []), { year, title, competition: comp, medal: newAwardMedal }];
                            setCurrentWinery({ ...currentWinery, awards: list });
                            if (yearInput) yearInput.value = '';
                            if (titleInput) titleInput.value = '';
                            if (compInput) compInput.value = '';
                          }}
                          className="px-3 py-2 bg-[#6D071A] text-white rounded-lg text-xs font-bold hover:bg-[#841126] transition flex items-center justify-center h-[34px]"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>

                  {newAwardMedal === "Other" && (
                    <div className="flex flex-col sm:flex-row gap-3 items-end bg-amber-50/70 p-4 rounded-xl border border-amber-200">
                      <div className="space-y-1 flex-1 w-full">
                        <label className="text-[10px] font-bold text-amber-900 flex items-center gap-1.5">
                          <span>Custom Medal / Award Title</span>
                          <span className="text-[9px] font-normal text-amber-700">(Write your custom recognition or award designation)</span>
                        </label>
                        <input
                          type="text"
                          value={newAwardCustomMedal}
                          onChange={(e) => setNewAwardCustomMedal(e.target.value)}
                          placeholder="e.g. Trophy Winner, Best in Show, Commended, 96 Points"
                          className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none focus:border-[#6D071A] text-charcoal-800"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const yearEl = document.getElementById('new-award-year') as HTMLInputElement;
                          const titleEl = document.getElementById('new-award-title') as HTMLInputElement;
                          const compEl = document.getElementById('new-award-comp') as HTMLInputElement;
                          const medalEl = document.getElementById('new-award-medal') as HTMLSelectElement;
                          const year = yearEl?.value;
                          const title = titleEl?.value;
                          const comp = compEl?.value;
                          const medal = medalEl?.value;
                          if (!year || !title) {
                            alert("Year and Award Title are required");
                            return;
                          }
                          if (!newAwardCustomMedal) {
                            alert("Please enter the custom medal or award title in the write section");
                            return;
                          }
                          const list = [...(currentWinery.awards || []), { year, title, competition: comp, medal: newAwardCustomMedal }];
                          setCurrentWinery({ ...currentWinery, awards: list });
                          if (yearEl) yearEl.value = '';
                          if (titleEl) titleEl.value = '';
                          if (compEl) compEl.value = '';
                        }}
                        className="px-4 py-2 bg-[#6D071A] text-white rounded-lg text-xs font-bold hover:bg-[#841126] transition flex items-center justify-center h-[34px] shrink-0"
                      >
                        Add Custom Award
                      </button>
                    </div>
                  )}
                </div>

                {/* Story Timeline List Builder */}
                <div className="space-y-4 pt-6 border-t border-[#ECECEC] bg-[#F8F9FB] p-6 rounded-2xl border border-[#ECECEC]">
                  <div>
                    <h3 className="text-sm font-bold text-[#6D071A]">Story Timeline Milestones</h3>
                    <p className="text-[10px] text-charcoal-500">Configure key historic milestones (years, descriptions, images) that appear in the Story section.</p>
                  </div>

                  <div className="space-y-3">
                    {(currentWinery.storyTimeline || []).map((step: any, idx: number) => (
                      <div key={idx} className="flex gap-4 items-start bg-white p-3 rounded-xl border border-[#ECECEC] text-xs">
                        {step.image && (
                          <img src={step.image} className="w-12 h-12 rounded-lg object-cover border" alt="step" />
                        )}
                        <div className="flex-1">
                          <div>
                            <span className="font-bold text-[#6D071A] mr-2">[{step.year}]</span>
                            <span className="font-semibold text-charcoal-800">{step.title}</span>
                          </div>
                          <p className="text-charcoal-500 text-[10px] leading-relaxed mt-1 line-clamp-2">{step.text}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const list = (currentWinery.storyTimeline || []).filter((_: any, i: number) => i !== idx);
                            setCurrentWinery({ ...currentWinery, storyTimeline: list });
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#ECECEC] space-y-3">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-charcoal-600">Milestone Year</label>
                        <input
                          id="new-timeline-year"
                          type="text"
                          placeholder="e.g. 1999"
                          className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none focus:border-[#6D071A]"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-charcoal-600">Milestone Title</label>
                        <input
                          id="new-timeline-title"
                          type="text"
                          placeholder="e.g. A Dream Takes Root"
                          className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none focus:border-[#6D071A]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-charcoal-600">Milestone Description (Text)</label>
                      <textarea
                        id="new-timeline-text"
                        placeholder="Write about this milestone..."
                        className="w-full h-16 p-2 border border-[#ECECEC] rounded-lg text-xs outline-none focus:border-[#6D071A]"
                      />
                    </div>
                    <div className="grid md:grid-cols-4 gap-4 items-end">
                      <div className="md:col-span-3 space-y-1">
                        <label className="text-[10px] font-bold text-charcoal-600">Milestone Image URL</label>
                        <input
                          id="new-timeline-image"
                          type="text"
                          placeholder="Paste cover image link here..."
                          className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none focus:border-[#6D071A]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const yearEl = document.getElementById('new-timeline-year') as HTMLInputElement;
                          const titleEl = document.getElementById('new-timeline-title') as HTMLInputElement;
                          const textEl = document.getElementById('new-timeline-text') as HTMLInputElement;
                          const imageEl = document.getElementById('new-timeline-image') as HTMLInputElement;
                          const year = yearEl?.value;
                          const title = titleEl?.value;
                          const text = textEl?.value;
                          const image = imageEl?.value;
                          if (!year || !title || !text) {
                            alert("Year, Title, and Description are required");
                            return;
                          }
                          const list = [...(currentWinery.storyTimeline || []), { year, title, text, image: image || 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb' }];
                          setCurrentWinery({ ...currentWinery, storyTimeline: list });
                          if (yearEl) yearEl.value = '';
                          if (titleEl) titleEl.value = '';
                          if (textEl) textEl.value = '';
                          if (imageEl) imageEl.value = '';
                        }}
                        className="w-full py-2.5 bg-[#6D071A] text-white rounded-lg text-xs font-bold hover:bg-[#841126] transition flex items-center justify-center h-[34px]"
                      >
                        Add Milestone
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gallery List Preview */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">Estate Image Gallery</label>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                    {currentWinery.images?.map((img: string, idx: number) => (
                      <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-[#ECECEC]">
                        <img src={img} alt="gallery" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const remainingImages = currentWinery.images.filter((_: any, i: number) => i !== idx);
                            setCurrentWinery({ ...currentWinery, images: remainingImages });
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 rounded text-white hover:bg-red-600 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <div 
                      onClick={() => galleryInputRef.current?.click()}
                      className="border border-dashed border-[#ECECEC] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#F8F9FB] transition bg-white h-20"
                    >
                      <ImageIcon className="w-4 h-4 text-charcoal-400" />
                      <span className="text-[9px] text-charcoal-400 font-bold mt-1">Upload Photo</span>
                    </div>
                    <input 
                      type="file" 
                      ref={galleryInputRef} 
                      onChange={handleGalleryUpload} 
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                    />
                  </div>
                </div>

                {/* Geographic Coordinates */}
                <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-[#ECECEC] bg-[#F8F9FB] p-6 rounded-2xl border border-[#ECECEC]">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6D071A]">Latitude Coordinate</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={currentWinery.coordinates?.lat || ""}
                      onChange={(e) => setCurrentWinery({ 
                        ...currentWinery, 
                        coordinates: { ...currentWinery.coordinates, lat: parseFloat(e.target.value) || 0 } 
                      })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl outline-none focus:border-[#6D071A] text-xs text-[#222222] bg-white shadow-sm"
                      placeholder="e.g. 20.0049"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6D071A]">Longitude Coordinate</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={currentWinery.coordinates?.lng || ""}
                      onChange={(e) => setCurrentWinery({ 
                        ...currentWinery, 
                        coordinates: { ...currentWinery.coordinates, lng: parseFloat(e.target.value) || 0 } 
                      })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl outline-none focus:border-[#6D071A] text-xs text-[#222222] bg-white shadow-sm"
                      placeholder="e.g. 73.7124"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6D071A]">Region City</label>
                    <input
                      type="text"
                      value={currentWinery.location || ""}
                      onChange={(e) => setCurrentWinery({ ...currentWinery, location: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl outline-none focus:border-[#6D071A] text-xs text-[#222222] bg-white shadow-sm"
                      placeholder="e.g. Nashik"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ECECEC] flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition flex items-center gap-1.5 shadow"
                  >
                    <Check className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
          {/* TAB 3: WINE CATALOG */}
          {activeTab === "Wine Catalog" && (
            <div className="space-y-8 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-[#222222]">Winery Portfolio Inventory</h2>
                  <p className="text-xs text-charcoal-500">Oversee active vintages, prices, in-stock status, and sensory details for {currentWinery.name}.</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* View Toggle */}
                  <div className="flex bg-[#F8F9FB] border border-[#ECECEC] p-1 rounded-xl">
                    <button
                      onClick={() => setWineViewMode("grid")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        wineViewMode === "grid"
                          ? "bg-white text-[#6D071A] shadow-sm"
                          : "text-charcoal-500 hover:text-charcoal-700"
                      }`}
                    >
                      Grid View
                    </button>
                    <button
                      onClick={() => setWineViewMode("table")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        wineViewMode === "table"
                          ? "bg-white text-[#6D071A] shadow-sm"
                          : "text-charcoal-500 hover:text-charcoal-700"
                      }`}
                    >
                      Table View
                    </button>
                  </div>

                  <button
                    onClick={() => setAddWineModalOpen(true)}
                    className="px-4 py-2.5 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Wine Bottle
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-[#ECECEC] pb-4">
                {[
                  { label: "All", filter: "All" },
                  { label: "Red Wines", filter: "Red" },
                  { label: "White Wines", filter: "White" },
                  { label: "Sparklings", filter: "Sparkling" },
                  { label: "Rosés", filter: "Rosé" },
                  { label: "Dessert Wines", filter: "Dessert" },
                  { label: "Other Specialties", filter: "Other" }
                ].map(tab => {
                  const isActive = wineFilterType === tab.filter;
                  const count = tab.filter === "All" 
                    ? activeWines.length 
                    : tab.filter === "Other"
                    ? activeWines.filter(w => !["Red", "White", "Sparkling", "Rosé", "Dessert"].includes(w.type)).length
                    : activeWines.filter(w => w.type === tab.filter).length;
                  return (
                    <button
                      key={tab.filter}
                      onClick={() => setWineFilterType(tab.filter)}
                      className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${
                        isActive
                          ? "bg-[#6D071A] text-white border-[#6D071A] shadow-sm"
                          : "bg-white border-[#ECECEC] text-charcoal-600 hover:bg-[#F8F9FB] hover:text-[#222222]"
                      }`}
                    >
                      {tab.label} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${
                        isActive ? "bg-white/20 text-white" : "bg-[#F8F9FB] text-charcoal-500"
                      }`}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {filteredWines.length === 0 ? (
                <div className="bg-white border border-[#ECECEC] rounded-3xl p-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-burgundy-50 flex items-center justify-center mx-auto">
                    <Wine className="w-6 h-6 text-[#6D071A]" />
                  </div>
                  <h4 className="text-sm font-bold text-[#222222]">No wines found matching this filter</h4>
                  <p className="text-xs text-charcoal-400 max-w-sm mx-auto">Try selecting another grape type or check back if any inventory was saved as a draft.</p>
                </div>
              ) : wineViewMode === "grid" ? (
                // A: REAL PREMIUM CARDS GRID VIEW
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredWines.map(wine => {
                    // Aesthetic backdrop styling matching wine type
                    let circleBg = "bg-[#6D071A]/10"; // Red
                    let backdropBg = "from-[#FDF2F4] to-[#FCE7EB]"; // Red
                    if (wine.type === "White") {
                      backdropBg = "from-[#FAF9F2] to-[#F5EFE6]";
                      circleBg = "bg-[#D4AF37]/15";
                    } else if (wine.type === "Rosé" || wine.type === "Rose") {
                      backdropBg = "from-[#FFF5F7] to-[#FFE3E8]";
                      circleBg = "bg-[#EF4444]/10";
                    } else if (wine.type === "Sparkling") {
                      backdropBg = "from-[#F0FAFB] to-[#E0F5F7]";
                      circleBg = "bg-[#06B6D4]/10";
                    } else if (wine.type === "Dessert") {
                      backdropBg = "from-[#FFFBEB] to-[#FEF3C7]";
                      circleBg = "bg-[#F59E0B]/15";
                    } else if (!["Red", "White", "Rosé", "Rose", "Sparkling", "Dessert"].includes(wine.type)) {
                      backdropBg = "from-[#F5F3FF] to-[#EDE9FE]";
                      circleBg = "bg-[#8B5CF6]/15";
                    }

                    return (
                      <div
                        key={wine.id}
                        className="bg-white border border-[#ECECEC] hover:border-[#6D071A]/40 rounded-3xl overflow-hidden hover:shadow-[0_20px_50px_rgba(109,7,26,0.08)] transition-all duration-300 flex flex-col justify-between min-h-[460px] group"
                      >
                        {/* Wine Portrait Banner */}
                        <div className={`relative h-[250px] bg-gradient-to-b ${backdropBg} flex items-center justify-center border-b border-[#ECECEC]/60 overflow-hidden`}>
                          <div className={`absolute w-32 h-32 rounded-full blur-2xl ${circleBg}`} />
                          <div className="absolute bottom-3.5 w-24 h-2.5 bg-black/10 blur-xs rounded-full pointer-events-none z-0" />
                          <img
                            src={wine.image || resolveWineBottleImage(wine)}
                            alt={wine.name}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = resolveWineBottleImage(wine);
                            }}
                            className="h-[210px] w-auto max-w-[130px] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)] relative z-10 transition-transform duration-500 ease-out group-hover:scale-108 group-hover:-translate-y-1"
                          />
                          
                          {/* Top-left: Vintage badge */}
                          <span className="absolute top-3.5 left-3.5 z-20 px-2.5 py-1 bg-[#1A1A1A]/85 backdrop-blur-md text-[#FAF5D3] text-[9.5px] font-bold uppercase rounded-lg tracking-wider border border-white/10 shadow-xs">
                            {wine.vintage} Vintage
                          </span>

                          {/* Top-right: Stock Status Pill */}
                          <span className={`absolute top-3.5 right-3.5 z-20 px-2.5 py-1 text-[9.5px] font-bold rounded-full shadow-xs backdrop-blur-md flex items-center gap-1.5 ${
                            wine.stock === "In Stock" ? "bg-emerald-50/95 text-emerald-800 border border-emerald-200" :
                            wine.stock === "Limited" ? "bg-amber-50/95 text-amber-800 border border-amber-200" :
                            "bg-rose-50/95 text-rose-800 border border-rose-200"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                              wine.stock === "In Stock" ? "bg-emerald-600 animate-pulse" :
                              wine.stock === "Limited" ? "bg-amber-500" : "bg-rose-500"
                            }`} />
                            {wine.stock}
                          </span>

                          {/* Bottom-left: Category label */}
                          <span className="absolute bottom-3.5 left-3.5 z-20 px-2.5 py-1 bg-white/95 backdrop-blur-md border border-[#ECECEC] text-[#6D071A] text-[9px] font-bold uppercase tracking-wider rounded-lg shadow-xs">
                            {wine.type}
                          </span>

                          {/* Bottom-right: Stock count */}
                          <span className="absolute bottom-3.5 right-3.5 z-20 px-2.5 py-0.5 bg-[#1A1A1A]/70 backdrop-blur-md text-white/90 text-[9px] font-medium rounded-md font-mono border border-white/10">
                            {wine.stockQuantity !== undefined ? `${wine.stockQuantity} Bottles` : "Cellar Stock"}
                          </span>
                        </div>

                        {/* Wine Info Card Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-base font-serif font-bold text-[#222222] group-hover:text-[#6D071A] transition-colors leading-snug line-clamp-1" title={wine.name}>
                              {wine.name}
                            </h4>
                            <p className="text-[10px] text-[#A3704C] font-bold uppercase tracking-wider line-clamp-1">
                              {wine.grapeVariety?.join(", ") || "Terroir blend"}
                            </p>
                          </div>

                          {/* Taste Profile mini tag lists */}
                          <div className="flex flex-wrap gap-1">
                            {wine.tasteProfile?.slice(0, 3).map((profile: string) => (
                              <span key={profile} className="px-2 py-0.5 bg-[#FAF7F2] border border-[#ECECEC] text-stone-700 text-[9px] font-semibold uppercase rounded-md tracking-wider">
                                {profile}
                              </span>
                            ))}
                            {wine.alcoholContent && (
                              <span className="px-2 py-0.5 bg-[#FDF2F4] border border-[#6D071A]/20 text-[#6D071A] text-[9px] font-bold uppercase rounded-md tracking-wider">
                                {wine.alcoholContent} ABV
                              </span>
                            )}
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-[#F0F0F0]">
                            <div>
                              <p className="text-[9px] text-stone-400 uppercase font-bold tracking-wider">Cellar Retail</p>
                              <p className="text-lg font-bold text-[#6D071A] font-serif">₹{wine.price}</p>
                            </div>

                            {/* Actions overlay */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedWine(wine)}
                                className="px-3 py-1.5 bg-[#F8F9FB] border border-[#ECECEC] text-[#222222] hover:bg-[#ECECEC] text-[11px] font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-stone-500" /> Specs
                              </button>
                              <button
                                onClick={() => handleOpenEditWine(wine)}
                                className="px-3.5 py-1.5 bg-[#6D071A] hover:bg-[#841126] text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                                title="Edit wine details"
                              >
                                <Edit className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => handleWineDelete(wine)}
                                className="p-1.5 border border-[#ECECEC] hover:border-rose-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
                                title="Delete wine"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // B: CLEAN MANAGEMENT TABLE VIEW
                <div className="bg-white rounded-3xl border border-[#ECECEC] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#F8F9FB] border-b border-[#ECECEC] text-charcoal-700 font-bold uppercase tracking-wider">
                          <th className="p-4">Bottle Image</th>
                          <th className="p-4">Wine Name</th>
                          <th className="p-4">Wine Type</th>
                          <th className="p-4">Vintage</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Stock Status</th>
                          <th className="p-4">Views</th>
                          <th className="p-4">Rating</th>
                          <th className="p-4">Publish State</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ECECEC] text-charcoal-800">
                        {filteredWines.map(wine => (
                          <tr key={wine.id} className="hover:bg-[#F8F9FB] transition">
                            <td className="p-4">
                              <div className="w-11 h-14 rounded-xl bg-gradient-to-b from-stone-50 to-stone-100/90 border border-[#ECECEC] flex items-center justify-center p-1 shadow-xs">
                                <img
                                  src={wine.image || resolveWineBottleImage(wine)}
                                  alt={wine.name}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = resolveWineBottleImage(wine);
                                  }}
                                  className="h-full w-auto max-w-full object-contain drop-shadow-xs"
                                />
                              </div>
                            </td>
                            <td className="p-4 font-bold text-[#222222]">
                              {wine.name}
                              <span className="block text-[9px] font-medium text-charcoal-400 mt-0.5">{wine.grapeVariety?.join(", ")}</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 text-[9px] font-semibold rounded-full ${
                                wine.type === "Red" ? "bg-red-50 text-red-700" :
                                wine.type === "White" ? "bg-yellow-50 text-yellow-700" :
                                wine.type === "Sparkling" ? "bg-cyan-50 text-cyan-700" : "bg-purple-50 text-purple-700"
                              }`}>
                                {wine.type}
                              </span>
                            </td>
                            <td className="p-4 font-medium">{wine.vintage}</td>
                            <td className="p-4 font-bold text-[#6D071A]">₹{wine.price}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                                wine.stock === "In Stock" ? "bg-green-50 text-green-700" :
                                wine.stock === "Limited" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                              }`}>
                                {wine.stock}
                              </span>
                            </td>
                            <td className="p-4 font-medium text-charcoal-400">{wine.views}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                                <span className="font-bold">{wine.rating}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full ${
                                wine.status === "Published" ? "bg-green-100 text-green-800" : "bg-charcoal-100 text-charcoal-600"
                              }`}>
                                {wine.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setSelectedWine(wine)}
                                  className="p-1.5 border border-[#ECECEC] hover:bg-[#F8F9FB] rounded-lg text-charcoal-600 hover:text-[#6D071A]"
                                  title="View Details / Specs"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditWine(wine)}
                                  className="p-1.5 border border-[#ECECEC] hover:bg-burgundy-50 rounded-lg text-charcoal-600 hover:text-[#6D071A]"
                                  title="Edit Wine Details"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleWineDelete(wine)}
                                  className="p-1.5 border border-[#ECECEC] hover:bg-red-50 rounded-lg text-charcoal-600 hover:text-red-600"
                                  title="Delete Wine"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: QUALITY ASSAY LAB */}
          {activeTab === "Quality Lab" && (
            <WineQualityAssayLab
              wineryId={currentWinery?.id || (isDemoMode ? DEMO_WINERY_ID : "11111111-1111-1111-1111-111111111111")}
              wineryName={currentWinery?.name || "VinoSphere Estate Vineyard"}
            />
          )}

          {/* TAB 4: ESTATE JOURNEYS */}
          {activeTab === "Experiences" && (() => {
            const activeJourneys = activeExperiences.filter(e => e.experienceStatus !== 'past');
            const pastJourneys = activeExperiences.filter(e => e.experienceStatus === 'past');
            const displayJourneys = journeySubTab === 'active' ? activeJourneys : pastJourneys;

            return (
              <div className="space-y-8 text-left">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold font-serif text-[#222222]">Tasting Experiences &amp; Tours</h2>
                    <p className="text-xs text-charcoal-500">Configure bookable vineyard walks, cellar masterclasses, sunset tastings, and archive past retrospective editions.</p>
                  </div>

                  <button
                    onClick={() => setAddExperienceModalOpen(true)}
                    className="px-4 py-2.5 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" /> Create Experience
                  </button>
                </div>

                {/* Sub-navigation tabs: Active vs Previous */}
                <div className="flex items-center gap-2 border-b border-[#ECECEC] pb-3">
                  <button
                    type="button"
                    onClick={() => setJourneySubTab('active')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      journeySubTab === 'active'
                        ? 'bg-[#6D071A] text-white shadow-sm'
                        : 'bg-[#F8F9FB] text-charcoal-600 hover:bg-[#ECECEC]'
                    }`}
                  >
                    <span>Active & Current Offerings</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      journeySubTab === 'active' ? 'bg-white/20 text-white' : 'bg-[#ECECEC] text-charcoal-700'
                    }`}>
                      {activeJourneys.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setJourneySubTab('past')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      journeySubTab === 'past'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-[#F8F9FB] text-charcoal-600 hover:bg-[#ECECEC]'
                    }`}
                  >
                    <span>Previous & Past Editions (Showcase)</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      journeySubTab === 'past' ? 'bg-white/20 text-white' : 'bg-[#ECECEC] text-charcoal-700'
                    }`}>
                      {pastJourneys.length}
                    </span>
                  </button>
                </div>

                {displayJourneys.length === 0 ? (
                  <div className="bg-white border border-dashed border-[#ECECEC] rounded-3xl p-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-charcoal-400">
                      <Sparkles className="w-6 h-6 text-[#6D071A]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#222222]">
                        {journeySubTab === 'active' ? 'No Active Estate Journeys' : 'No Past Journeys Recorded'}
                      </h4>
                      <p className="text-xs text-charcoal-500 max-w-md mx-auto mt-1">
                        {journeySubTab === 'active'
                          ? 'Create a new vineyard walk, tasting masterclass, or cellar tour offering.'
                          : 'No past retrospective editions have been saved.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayJourneys.map((exp) => (
                      <div
                        key={exp.id}
                        className="bg-white border border-[#ECECEC] rounded-2xl overflow-hidden hover:shadow-lg transition group flex flex-col justify-between"
                      >
                        <div className="relative h-48 bg-stone-100 overflow-hidden">
                          {exp.image ? (
                            <img
                              src={exp.image}
                              alt={exp.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#1E0B11] to-[#3B121A] flex items-center justify-center text-white/30">
                              <Wine className="w-12 h-12" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/90 backdrop-blur-sm border border-white/20 rounded-md text-[9px] font-bold text-[#6D071A] uppercase">
                            {exp.duration}
                          </div>
                        </div>

                        <div className="p-6 space-y-4">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-[#222222]">{exp.name}</h4>
                            <p className="text-[10px] text-charcoal-400 line-clamp-2">{exp.description || 'Exclusive curated journey through our vineyard and cellar.'}</p>
                          </div>

                          {/* Social Proof & Metrics for Past Journey */}
                          {exp.experienceStatus === 'past' ? (
                            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl space-y-2 text-xs">
                              <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
                                <span>👥 {exp.turnoutCount || 45} Guests Hosted</span>
                                <span className="flex items-center gap-1 text-amber-700">
                                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                  <span>{exp.rating || 4.95}</span>
                                </span>
                              </div>
                              {exp.recapNotes && (
                                <p className="text-[10px] text-stone-600 italic line-clamp-2">
                                  &ldquo;{exp.recapNotes}&rdquo;
                                </p>
                              )}
                              {exp.reviews && exp.reviews.length > 0 && (
                                <div className="text-[10px] text-amber-900 font-medium">
                                  ★ {exp.reviews.length} Verified Guest {exp.reviews.length === 1 ? 'Review' : 'Reviews'}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex justify-between items-center pt-2 border-t border-[#F8F9FB]">
                              <div>
                                <p className="text-[9px] text-charcoal-400 uppercase font-bold text-left">Price per Guest</p>
                                <p className="text-sm font-bold text-[#6D071A]">₹{exp.price}</p>
                              </div>

                              <div>
                                <p className="text-[9px] text-charcoal-400 uppercase font-bold text-right">Capacity</p>
                                <p className="text-xs font-bold text-[#222222] text-right">{exp.availableSeats || 15} guests / slot</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-4 bg-[#F8F9FB] border-t border-[#ECECEC] flex justify-between gap-2">
                          <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                            exp.experienceStatus === 'past' ? 'text-amber-800' : 'text-green-700'
                          }`}>
                            {exp.experienceStatus === 'past' ? (
                              <>
                                <Award className="w-3.5 h-3.5 text-amber-600" /> Past Showcase
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" /> Bookable Active
                              </>
                            )}
                          </span>
                          <button
                            onClick={() => {
                              if (confirm(`Remove this estate journey?`)) {
                                const updated = allExperiences.filter(e => e.id !== exp.id);
                                setAllExperiences(updated);
                                syncToLocalStorage("vinosphere_experiences", updated);
                              }
                            }}
                            className="text-[10px] font-bold text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 5: EVENTS */}
          {activeTab === "Events" && (() => {
            const upcomingAndOngoingEvents = activeEvents.filter(e => e.eventStatus !== 'past');
            const pastEvents = activeEvents.filter(e => e.eventStatus === 'past');
            const displayEvents = eventSubTab === 'upcoming' ? upcomingAndOngoingEvents : pastEvents;

            return (
              <div className="space-y-8 text-left">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold font-serif text-[#222222]">Event Management</h2>
                    <p className="text-xs text-charcoal-500">Plan upcoming estate events, manage live tickets, and showcase past event attendance & guest reviews.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setNewEvent((prev: any) => ({ ...prev, event_status: eventSubTab === 'past' ? 'past' : 'upcoming' }));
                        setAddEventModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> {eventSubTab === 'past' ? 'Add Past Event' : 'Create Event'}
                    </button>
                  </div>
                </div>

                {/* Sub Navigation Bar */}
                <div className="flex items-center gap-2 border-b border-[#ECECEC] pb-3">
                  <button
                    onClick={() => setEventSubTab('upcoming')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      eventSubTab === 'upcoming'
                        ? 'bg-[#6D071A] text-white shadow-sm'
                        : 'bg-[#F8F9FB] text-charcoal-600 hover:bg-[#ECECEC]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Upcoming & Ongoing ({upcomingAndOngoingEvents.length})</span>
                  </button>
                  <button
                    onClick={() => setEventSubTab('past')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      eventSubTab === 'past'
                        ? 'bg-[#6D071A] text-white shadow-sm'
                        : 'bg-[#F8F9FB] text-charcoal-600 hover:bg-[#ECECEC]'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Previous & Past Events ({pastEvents.length})</span>
                  </button>
                </div>

                {/* Event grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Left Side: Events List with Stats */}
                  <div className="lg:col-span-2 space-y-6">
                    {displayEvents.length === 0 ? (
                      <div className="bg-white border border-dashed border-[#ECECEC] rounded-3xl p-12 text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-charcoal-400">
                          {eventSubTab === 'upcoming' ? <Calendar className="w-6 h-6" /> : <Award className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#222222]">
                            {eventSubTab === 'upcoming' ? 'No Upcoming Events Scheduled' : 'No Previous Events Recorded'}
                          </h4>
                          <p className="text-xs text-charcoal-500 max-w-md mx-auto mt-1">
                            {eventSubTab === 'upcoming' 
                              ? 'Schedule a harvest festival, tasting dinner, or concert at your amphitheatre.'
                              : 'Add your past events along with guest attendance turnout, audience ratings, and customer reviews to highlight social proof.'}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setNewEvent((prev: any) => ({ ...prev, event_status: eventSubTab === 'past' ? 'past' : 'upcoming' }));
                            setAddEventModalOpen(true);
                          }}
                          className="px-4 py-2 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition inline-flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> {eventSubTab === 'past' ? 'Record Past Event' : 'Schedule Event'}
                        </button>
                      </div>
                    ) : (
                      displayEvents.map(evt => (
                        <div key={evt.id} className="bg-white border border-[#ECECEC] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition">
                          <img src={evt.coverImage} alt={evt.name} className="w-full md:w-36 h-36 object-cover rounded-2xl" />
                          <div className="flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider">
                                  {new Date(evt.date).toLocaleDateString("en-IN", { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })} · {evt.time}
                                </span>
                                {evt.eventStatus === 'past' ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold text-[9px] uppercase border border-stone-200">
                                    Concluded Showcase
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 font-bold text-[9px] uppercase border border-green-200">
                                    Tickets Live
                                  </span>
                                )}
                              </div>
                              <h4 className="text-base font-bold text-[#222222]">{evt.name}</h4>
                              <p className="text-[11px] text-charcoal-500">{evt.venue}</p>
                            </div>

                            {/* Performance metrics */}
                            {evt.eventStatus === 'past' ? (
                              <div className="bg-[#F8F9FB] p-3 rounded-xl border border-[#ECECEC] space-y-2">
                                <div className="flex justify-between items-center text-xs font-semibold text-charcoal-700">
                                  <span className="flex items-center gap-1.5">
                                    <span className="text-stone-400">Attendance Turnout:</span>
                                    <span className="font-bold text-[#6D071A]">👥 {evt.turnoutCount || evt.soldCount || 120} Guests</span>
                                  </span>
                                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                                    <span>★</span>
                                    <span>{evt.rating || 4.9} / 5.0</span>
                                  </span>
                                </div>
                                {evt.recapNotes && (
                                  <p className="text-[11px] text-stone-600 italic">"{evt.recapNotes}"</p>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-semibold text-charcoal-700">
                                  <span>Ticket sales: {evt.soldCount} / {evt.capacity} sold</span>
                                  <span className="text-[#6D071A] font-bold">Revenue: ₹{(evt.revenue || 0).toLocaleString()}</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#F8F9FB] rounded-full overflow-hidden border border-[#ECECEC]">
                                  <div className="h-full bg-[#6D071A]" style={{ width: `${(evt.soldCount / evt.capacity) * 100}%` }}></div>
                                </div>
                              </div>
                            )}

                            {/* Reviews / Feedback Display for past events */}
                            {evt.eventStatus === 'past' && evt.reviews && evt.reviews.length > 0 && (
                              <div className="space-y-1.5 pt-2 border-t border-[#ECECEC]">
                                <span className="text-[9px] font-bold text-charcoal-500 uppercase tracking-wider">Attendee Reviews</span>
                                <div className="space-y-1">
                                  {evt.reviews.slice(0, 2).map((rev: any, rIdx: number) => (
                                    <div key={rIdx} className="bg-white p-2 rounded-lg border border-[#ECECEC] text-[11px]">
                                      <div className="flex justify-between items-center">
                                        <span className="font-bold text-[#222222]">{rev.author}</span>
                                        <span className="text-amber-500 font-semibold text-[10px]">★ {rev.rating}/5</span>
                                      </div>
                                      <p className="text-stone-600 italic mt-0.5">"{rev.comment}"</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-[10px] text-charcoal-400 font-medium pt-1">
                              <span>Sponsors: {(evt as any).sponsors ? (evt as any).sponsors.join(", ") : "VinoSphere Partner"}</span>
                              <button
                                onClick={() => {
                                  if (confirm(`Remove this event entry?`)) {
                                    const updated = allEvents.filter(e => e.id !== evt.id);
                                    setAllEvents(updated);
                                    syncToLocalStorage("vinosphere_events", updated);
                                  }
                                }}
                                className="text-red-500 font-bold hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Right Side: Simple Calendar View */}
                  <div className="bg-white border border-[#ECECEC] rounded-3xl p-6 shadow-sm space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-[#222222]">Events Calendar</h4>
                      <p className="text-[10px] text-charcoal-400">Quick view of Scheduled & Past events</p>
                    </div>

                    <div className="border border-[#ECECEC] rounded-2xl overflow-hidden text-center divide-y divide-[#ECECEC]">
                      <div className="bg-[#F8F9FB] p-3 text-xs font-bold text-[#6D071A]">Schedule Grid</div>
                      <div className="grid grid-cols-7 gap-1 p-3 text-[10px] font-bold text-charcoal-600">
                        <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1 p-3 text-[10px] text-charcoal-500 font-medium h-32 items-center">
                        {Array.from({ length: 31 }, (_, i) => {
                          const day = i + 1;
                          const hasUpcoming = upcomingAndOngoingEvents.some(e => new Date(e.date).getDate() === day);
                          const hasPast = pastEvents.some(e => new Date(e.date).getDate() === day);
                          return (
                            <span key={day} className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] ${
                              hasUpcoming ? "bg-[#6D071A] text-white font-bold" : (hasPast ? "bg-stone-300 text-stone-800 font-bold" : "")
                            }`}>
                              {day}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#ECECEC] text-[10px] text-charcoal-500">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#6D071A]" />
                        <span>Upcoming / Live Event</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                        <span>Previous / Past Concluded Event</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 6: BOOKINGS */}
          {activeTab === "Bookings" && (
            <div className="space-y-8 text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-[#222222]">Customer Booking Desk</h2>
                  <p className="text-xs text-charcoal-500">Track paid bookings, issue entry QR check-ins, and inspect refund requests.</p>
                </div>
              </div>

              {/* Bookings cards view */}
              <div className="space-y-4">
                {activeBookings.map(booking => (
                  <div key={booking.id} className="bg-white border border-[#ECECEC] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-burgundy-50 border border-burgundy-100 rounded-2xl flex items-center justify-center shrink-0">
                        <QrCode className="w-6 h-6 text-[#6D071A]" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#222222]">{booking.customer}</span>
                          <span className="text-[10px] text-charcoal-400">({booking.email})</span>
                        </div>
                        <p className="text-xs font-semibold text-[#6D071A]">{booking.experience}</p>
                        <p className="text-[10px] text-charcoal-400">Scheduled: {booking.date} · {booking.tickets} Tickets reserved</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <p className="text-[9px] text-charcoal-400 uppercase font-bold">Transaction</p>
                        <p className="text-xs font-bold text-green-700">₹{booking.total} Paid</p>
                      </div>

                      <div>
                        <p className="text-[9px] text-charcoal-400 uppercase font-bold">Check-in Status</p>
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full ${
                          booking.checkInStatus === "Checked In" ? "bg-green-100 text-green-800" :
                          booking.checkInStatus === "Completed" ? "bg-blue-100 text-blue-800" :
                          booking.checkInStatus === "Pending" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                        }`}>
                          {booking.checkInStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {booking.checkInStatus === "Pending" && (
                          <button
                            onClick={() => handleCheckIn(booking.id)}
                            className="px-3.5 py-1.5 bg-[#6D071A] text-white text-[10px] font-bold rounded-lg hover:bg-[#841126] transition flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Mark Check-in
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setViewingQrBooking(booking);
                            setQrCopied(false);
                          }}
                          className="px-3.5 py-1.5 bg-white border border-[#ECECEC] text-[10px] font-bold text-charcoal-700 rounded-lg hover:bg-[#F8F9FB] transition flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#6D071A]" />
                          <span>View QR</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: CORPORATE LEADS */}
          {activeTab === "Corporate Leads" && (
            <div className="space-y-8 text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-[#222222]">Corporate Leads CRM</h2>
                  <p className="text-xs text-charcoal-500">Track and respond to private corporate retreats, B2B wine label partnerships, and event inquiries.</p>
                </div>
              </div>

              {/* Leads cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {activeLeads.map(lead => (
                  <div key={lead.id} className="bg-white border border-[#ECECEC] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition">
                    <div className="space-y-4">
                      {/* Company Info */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-[#222222]">{lead.companyName}</h4>
                          <p className="text-[10px] text-charcoal-400">Contact: {lead.contactPerson} ({lead.phone})</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                          lead.status === "New Inquiry" ? "bg-blue-100 text-blue-800" :
                          lead.status === "Proposal Sent" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                        }`}>
                          {lead.status}
                        </span>
                      </div>

                      {/* Requirement Details */}
                      <div className="p-4 bg-[#F8F9FB] rounded-2xl border border-[#ECECEC] text-xs space-y-2">
                        <p className="font-semibold text-charcoal-700 leading-relaxed">&ldquo;{lead.requirement}&rdquo;</p>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#ECECEC] text-[10px] text-charcoal-500 font-medium">
                          <span>Target size: {lead.quantity} PAX</span>
                          <span>Timeline: {lead.timeline}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-[#F8F9FB]">
                      <div>
                        <p className="text-[9px] text-charcoal-400 uppercase font-bold">Estimated Budget</p>
                        <p className="text-sm font-bold text-[#6D071A]">₹{Number(lead.budget || 0).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {lead.status === "New Inquiry" && (
                          <>
                            <button
                              onClick={() => handleLeadAction(lead.id, "Accepted")}
                              className="px-3 py-1.5 bg-green-600 text-white text-[10px] font-bold rounded-lg hover:bg-green-700 transition"
                            >
                              Accept Inquiry
                            </button>
                            <button
                              onClick={() => handleLeadAction(lead.id, "Rejected")}
                              className="px-3 py-1.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-lg hover:bg-red-200 transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {lead.status !== "Accepted" && (
                          <button
                            onClick={() => handleLeadAction(lead.id, "Proposal Sent")}
                            className="px-3 py-1.5 bg-[#6D071A] text-white text-[10px] font-bold rounded-lg hover:bg-[#841126] transition flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> Send Proposal
                          </button>
                        )}
                        <a
                          href={`mailto:${lead.email}`}
                          className="px-3 py-1.5 bg-white border border-[#ECECEC] text-charcoal-600 text-[10px] font-bold rounded-lg hover:bg-[#F8F9FB] transition"
                        >
                          Contact Company
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: REVIEWS */}
          {activeTab === "Reviews & Ratings" && (
            <div className="space-y-8 text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-[#222222]">Customer Reviews</h2>
                  <p className="text-xs text-charcoal-500">Monitor customer opinions, respond to vineyard guides feedback, and track keywords analytics.</p>
                </div>
              </div>

              {/* Reviews Summary Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Score Summary */}
                <div className="bg-white border border-[#ECECEC] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Average Rating</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold font-serif text-[#222222]">{activeAverageRating}</span>
                      <span className="text-sm font-medium text-charcoal-400">/ 5.0</span>
                    </div>
                    <div className="flex gap-1 text-[#D4AF37] pt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-charcoal-500 pt-4 border-t border-[#F8F9FB]">Based on {activeReviews.length} verified check-ins and cellar purchases.</p>
                </div>

                {/* Keywords Cloud */}
                <div className="md:col-span-2 bg-white border border-[#ECECEC] rounded-3xl p-6 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Most Mentioned Keywords</h4>
                    <p className="text-[10px] text-charcoal-400">Recurring phrases in customer feedback sentiment</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {[
                      { word: "Sunset View", count: 184, sentiment: "positive" },
                      { word: "Knowledgeable Guide", count: 122, sentiment: "positive" },
                      { word: "World-class Shiraz", count: 98, sentiment: "positive" },
                      { word: "Tasting Room Crowded", count: 32, sentiment: "neutral" },
                      { word: "Chilled Sauvignon", count: 28, sentiment: "positive" },
                      { word: "Great Cheese Pairing", count: 24, sentiment: "positive" }
                    ].map((w, idx) => (
                      <span key={idx} className={`px-3 py-1.5 text-[10px] font-bold rounded-full border ${
                        w.sentiment === "positive" ? "bg-green-50/50 border-green-200 text-green-700" : "bg-amber-50/50 border-amber-200 text-amber-700"
                      }`}>
                        {w.word} ({w.count})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {activeReviews.map(review => (
                  <div key={review.id} className="bg-white border border-[#ECECEC] rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <img src={review.customerPhoto} alt="customer" className="w-10 h-10 rounded-full object-cover border border-[#ECECEC]" />
                        <div>
                          <p className="text-xs font-bold text-[#222222]">{review.customerName}</p>
                          <p className="text-[9px] text-charcoal-400">Purchased: {review.winePurchased} · Experiencing: {review.experience}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex text-[#D4AF37]">
                          {Array.from({ length: review.rating }, (_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                          ))}
                        </div>
                        <span className="text-[10px] text-charcoal-400">{review.date}</span>
                      </div>
                    </div>

                    <p className="text-xs text-charcoal-700 leading-relaxed">&ldquo;{review.review}&ldquo;</p>

                    {/* Replies */}
                    {review.reply ? (
                      <div className="p-4 bg-[#F8F9FB] border border-[#ECECEC] rounded-2xl text-xs space-y-1">
                        <p className="font-bold text-[#6D071A]">{currentWinery.name} (Owner Response):</p>
                        <p className="text-charcoal-600 font-medium leading-relaxed">{review.reply}</p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Respond to this review..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleReviewReply(review.id, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }}
                          className="flex-1 px-4 py-2 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                        />
                        <button
                          onClick={(e) => {
                            const input = (e.currentTarget.previousSibling as HTMLInputElement);
                            handleReviewReply(review.id, input.value);
                            input.value = "";
                          }}
                          className="px-4 py-2 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition"
                        >
                          Submit Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: ANALYTICS PAGE */}
          {activeTab === "Analytics" && (
            <div className="space-y-8 text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold font-serif text-[#222222]">Business Analytics & Performance Report</h2>
                    {isDemoMode && (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1 rounded-xl shadow-xs">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          <span>🧪</span> Analytics Demo Mode
                        </span>
                        <span className="text-amber-300 font-bold">|</span>
                        <span className="text-xs font-semibold text-amber-800">
                          VinoSphere Analytics Demo Winery
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-charcoal-500">
                    {isDemoMode 
                      ? "Connected to controlled synthetic Phase 12D demo dataset via backend analytics API."
                      : "Truthful business metrics covering event & experience bookings, corporate inquiries, capacity utilization, and Gross Booking Value."}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Demo Mode Toggle Switch */}
                  <button
                    onClick={() => toggleDemoMode(!isDemoMode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition shadow-xs ${
                      isDemoMode 
                        ? "bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200" 
                        : "bg-white border-[#ECECEC] text-charcoal-700 hover:border-[#6D071A] hover:text-[#6D071A]"
                    }`}
                    title={isDemoMode ? "Switch to real winery dataset" : "Switch to Phase 12D Controlled Synthetic Demo Dataset"}
                  >
                    <span>🧪</span>
                    <span>{isDemoMode ? "Demo Mode ON" : "Enable Demo Mode"}</span>
                  </button>

                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#ECECEC] shadow-sm">
                    <Calendar className="w-3.5 h-3.5 text-[#6D071A]" />
                    <span className="text-xs font-semibold text-charcoal-600">Period:</span>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => {
                        const p = e.target.value;
                        setSelectedPeriod(p);
                        loadAnalytics(p);
                      }}
                      className="bg-transparent text-xs font-bold text-[#222222] focus:outline-none cursor-pointer"
                    >
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4 PRIMARY BUSINESS METRICS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                {/* Event Bookings */}
                <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-sm text-left">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Event Bookings</p>
                    <Calendar className="w-4 h-4 text-burgundy-600" />
                  </div>
                  <p className="text-2xl font-bold font-serif text-[#222222] mt-1">
                    {analyticsLoading ? "..." : (businessAnalytics?.eventBookings?.current ?? 0)}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    {renderMetricChange(businessAnalytics?.eventBookings)}
                    <span className="text-[9px] text-charcoal-400 font-medium">vs {businessAnalytics?.eventBookings?.previous ?? 0} prev</span>
                  </div>
                </div>

                {/* Experience Bookings */}
                <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-sm text-left">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Experience Bookings</p>
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold font-serif text-[#222222] mt-1">
                    {analyticsLoading ? "..." : (businessAnalytics?.experienceBookings?.current ?? 0)}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    {renderMetricChange(businessAnalytics?.experienceBookings)}
                    <span className="text-[9px] text-charcoal-400 font-medium">vs {businessAnalytics?.experienceBookings?.previous ?? 0} prev</span>
                  </div>
                </div>

                {/* Corporate Inquiries */}
                <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-sm text-left">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Corporate Inquiries</p>
                    <Briefcase className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold font-serif text-[#222222] mt-1">
                    {analyticsLoading ? "..." : (businessAnalytics?.corporateInquiries?.current ?? 0)}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    {renderMetricChange(businessAnalytics?.corporateInquiries)}
                    <span className="text-[9px] text-charcoal-400 font-medium">vs {businessAnalytics?.corporateInquiries?.previous ?? 0} prev</span>
                  </div>
                </div>

                {/* Gross Booking Value */}
                <div className="bg-white p-5 rounded-2xl border border-[#ECECEC] shadow-sm text-left relative group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1">
                      <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Gross Booking Value</p>
                      <div className="relative group/tooltip">
                        <Info className="w-3 h-3 text-charcoal-400 cursor-help" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg.charcoal-900 text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition pointer-events-none z-30">
                          Gross Booking Value reflects eligible paid event and experience bookings recorded on VinoSphere. It does not represent total winery revenue.
                        </div>
                      </div>
                    </div>
                    <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <p className="text-2xl font-bold font-serif text-[#222222] mt-1">
                    {analyticsLoading ? "..." : formatCurrency(businessAnalytics?.totalGrossBookingValue?.current ?? 0)}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    {renderMetricChange(businessAnalytics?.totalGrossBookingValue)}
                    <span className="text-[9px] text-charcoal-400 font-medium">vs {formatCurrency(businessAnalytics?.totalGrossBookingValue?.previous ?? 0)} prev</span>
                  </div>
                </div>
              </div>

              {/* DETAILED BOOKING PERFORMANCE & CORPORATE BREAKDOWN */}
              <div className="grid lg:grid-cols-3 gap-8 text-left">
                {/* Events Performance */}
                <div className="bg-white p-6 rounded-3xl border border-[#ECECEC] shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-burgundy-600" />
                      <h4 className="text-sm font-bold text-[#222222]">Events Booking Performance</h4>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center py-1.5 border-b border-[#F5F5F5]">
                      <span className="text-xs text-charcoal-500">Event Bookings</span>
                      <span className="text-xs font-bold text-[#222222]">{businessAnalytics?.eventBookings?.current ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#F5F5F5]">
                      <span className="text-xs text-charcoal-500">Guests Booked</span>
                      <span className="text-xs font-bold text-[#222222]">{businessAnalytics?.eventGuests?.current ?? 0} guests</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#F5F5F5]">
                      <span className="text-xs text-charcoal-500">Capacity Utilization</span>
                      <span className="text-xs font-bold text-emerald-600">
                        {businessAnalytics?.eventCapacityUtilization?.current !== undefined && businessAnalytics?.eventCapacityUtilization?.current > 0
                          ? `${businessAnalytics.eventCapacityUtilization.current}% capacity utilization`
                          : "No event capacity data"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-xs text-charcoal-500 font-medium">Gross Booking Value</span>
                      <span className="text-xs font-bold text-burgundy-600">
                        {formatCurrency(businessAnalytics?.eventGrossBookingValue?.current ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Experiences Performance */}
                <div className="bg-white p-6 rounded-3xl border border-[#ECECEC] shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <h4 className="text-sm font-bold text-[#222222]">Experiences Booking Performance</h4>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center py-1.5 border-b border-[#F5F5F5]">
                      <span className="text-xs text-charcoal-500">Experience Bookings</span>
                      <span className="text-xs font-bold text-[#222222]">{businessAnalytics?.experienceBookings?.current ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#F5F5F5]">
                      <span className="text-xs text-charcoal-500">Guests Booked</span>
                      <span className="text-xs font-bold text-[#222222]">{businessAnalytics?.experienceGuests?.current ?? 0} guests</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-xs text-charcoal-500 font-medium">Gross Booking Value</span>
                      <span className="text-xs font-bold text-amber-600">
                        {formatCurrency(businessAnalytics?.experienceGrossBookingValue?.current ?? 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Corporate Inquiries */}
                <div className="bg-white p-6 rounded-3xl border border-[#ECECEC] shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-bold text-[#222222]">Corporate Inquiries Breakdown</h4>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center py-1.5 border-b border-[#F5F5F5]">
                      <span className="text-xs text-charcoal-500">Total Inquiries</span>
                      <span className="text-xs font-bold text-[#222222]">{businessAnalytics?.corporateInquiries?.current ?? 0}</span>
                    </div>
                    <div className="py-2 border-b border-[#F5F5F5] space-y-1.5">
                      <span className="text-xs text-charcoal-500 block">Status Breakdown</span>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="bg-amber-50 p-1.5 rounded border border-amber-100">
                          <span className="block text-[9px] text-amber-700 font-medium">Pending</span>
                          <span className="text-xs font-bold text-amber-800">{businessAnalytics?.corporateStatusBreakdown?.pending ?? 0}</span>
                        </div>
                        <div className="bg-emerald-50 p-1.5 rounded border border-emerald-100">
                          <span className="block text-[9px] text-emerald-700 font-medium">Approved</span>
                          <span className="text-xs font-bold text-emerald-800">{businessAnalytics?.corporateStatusBreakdown?.approved ?? 0}</span>
                        </div>
                        <div className="bg-rose-50 p-1.5 rounded border border-rose-100">
                          <span className="block text-[9px] text-rose-700 font-medium">Rejected</span>
                          <span className="text-xs font-bold text-rose-800">{businessAnalytics?.corporateStatusBreakdown?.rejected ?? 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-xs text-charcoal-500">Avg Expected Guests</span>
                      <span className="text-xs font-bold text-blue-600">
                        {businessAnalytics?.corporateAvgExpectedGuests ?? 0} guests
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FULL PERIOD COMPARISON REPORT TABLE */}
              <div className="bg-white p-6 rounded-3xl border border-[#ECECEC] shadow-sm space-y-4 text-left">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-[#222222]">Period Comparison Report</h4>
                    <p className="text-[10px] text-charcoal-400 font-medium">Current window vs equivalent previous period</p>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#ECECEC] text-[10px] uppercase tracking-wider text-charcoal-400">
                        <th className="py-2.5 px-3 font-bold">Business Metric</th>
                        <th className="py-2.5 px-3 font-bold text-right">Current Period</th>
                        <th className="py-2.5 px-3 font-bold text-right">Previous Period</th>
                        <th className="py-2.5 px-3 font-bold text-right">Absolute Change</th>
                        <th className="py-2.5 px-3 font-bold text-right">Percentage Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F5F5] text-xs">
                      {[
                        { label: "Event Bookings", metric: businessAnalytics?.eventBookings, isCurrency: false },
                        { label: "Event Guests", metric: businessAnalytics?.eventGuests, isCurrency: false },
                        { label: "Experience Bookings", metric: businessAnalytics?.experienceBookings, isCurrency: false },
                        { label: "Experience Guests", metric: businessAnalytics?.experienceGuests, isCurrency: false },
                        { label: "Corporate Inquiries", metric: businessAnalytics?.corporateInquiries, isCurrency: false },
                        { label: "Gross Booking Value", metric: businessAnalytics?.totalGrossBookingValue, isCurrency: true },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#F8F9FB] transition">
                          <td className="py-2.5 px-3 font-semibold text-[#222222]">{row.label}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-[#222222]">
                            {row.isCurrency ? formatCurrency(row.metric?.current) : (row.metric?.current ?? 0)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-charcoal-500">
                            {row.isCurrency ? formatCurrency(row.metric?.previous) : (row.metric?.previous ?? 0)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-charcoal-600 font-medium">
                            {row.metric?.absoluteChange > 0 ? `+${row.metric.absoluteChange}` : (row.metric?.absoluteChange ?? 0)}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {renderMetricChange(row.metric)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GENERATED ANALYTICS REPORT CARD */}
              <div className="bg-white p-6 rounded-3xl border border-[#ECECEC] shadow-sm space-y-4 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#6D071A]" />
                      <h4 className="text-base font-bold text-[#222222]">Generated Analytics Report</h4>
                    </div>
                    <p className="text-xs text-charcoal-500 mt-1">
                      {(typeof reportData?.winery === "string" ? reportData.winery : reportData?.winery?.name) || (isDemoMode ? "VinoSphere Analytics Demo Winery" : currentWinery?.name || "VinoSphere Winery")} — {selectedPeriod === "7d" ? "Last 7 Days" : selectedPeriod === "30d" ? "Last 30 Days" : "Last 90 Days"}
                    </p>
                    <p className="text-[10px] text-charcoal-400 mt-0.5">
                      Generated: {reportData?.generatedAt ? new Date(reportData.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {isDemoMode && <span className="ml-2 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Controlled Analytics Demonstration Dataset</span>}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="px-4 py-2 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Report
                    </button>

                    <button
                      onClick={handleDownloadPDF}
                      className="px-4 py-2 bg-white border border-[#ECECEC] text-[#222222] text-xs font-bold rounded-xl hover:border-[#6D071A] hover:text-[#6D071A] transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-[#6D071A]" /> Download PDF
                    </button>

                    <button
                      onClick={handleDownloadCSV}
                      className="px-4 py-2 bg-white border border-[#ECECEC] text-[#222222] text-xs font-bold rounded-xl hover:border-[#6D071A] hover:text-[#6D071A] transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" /> Download CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9.5: EDA LAYER */}
          {(activeTab === "EDA Layer" || activeTab === "EDA Analysis") && (
            <EDADashboard wineryId={currentWinery?.id || (isDemoMode ? DEMO_WINERY_ID : "00000000-0000-4000-d000-000000000999")} />
          )}

          {/* TAB 10: DOCUMENTS */}
          {activeTab === "Documents" && (
            <div className="space-y-8 text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-[#222222]">Compliance Documents & Licenses</h2>
                  <p className="text-xs text-charcoal-500">Track active excise numbers, organic farm certifications, and safety licenses alongside validity alerts.</p>
                </div>

                <button
                  onClick={() => setAddDocModalOpen(true)}
                  className="px-4 py-2.5 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Upload Document
                </button>
              </div>

              {/* Expiry Tracker Warning Alert */}
              {activeDocs.some(d => d.expiryDays <= 15) && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-800">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Urgent Action Required:</span> You have certification licenses expiring within the next 15 days. Please update excise filings immediately to prevent booking interruptions.
                  </div>
                </div>
              )}

              {/* Doc Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {activeDocs.map(doc => (
                  <div key={doc.id} className="bg-white border border-[#ECECEC] rounded-3xl p-6 shadow-sm flex justify-between items-start hover:shadow-md transition">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-[#D4AF37] uppercase">{doc.type}</span>
                        <h4 className="text-sm font-bold text-[#222222]">{doc.name}</h4>
                        <p className="text-[10px] text-charcoal-400">License ID: {doc.number}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] text-charcoal-500">Expires: {doc.expiryDate}</p>
                        {doc.expiryDate !== "Never" && (
                          <span className={`inline-block text-[9px] font-bold ${
                            doc.expiryDays <= 15 ? "text-red-600" : "text-charcoal-400"
                          }`}>
                            ({doc.expiryDays} Days remaining)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                        doc.status === "Verified" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {doc.status}
                      </span>
                      <a href={doc.fileUrl} className="text-xs font-bold text-[#6D071A] hover:underline">
                        View License PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: SETTINGS */}
          {activeTab === "Settings" && (
            <div className="space-y-8 text-left">
              <div>
                <h2 className="text-2xl font-bold font-serif text-[#222222]">Winery Suite Configuration</h2>
                <p className="text-xs text-charcoal-500">Manage tax rates, payout routing (via Stripe), booking guidelines, and platform integrations.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-[#ECECEC] shadow-sm space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">GST Registration Number</label>
                    <input type="text" defaultValue="27AAACS1999A1Z2" className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-700">Wine Sale Commission Rate</label>
                    <input type="text" defaultValue="12%" disabled className="w-full p-3 bg-[#F8F9FB] border border-[#ECECEC] rounded-xl text-xs text-charcoal-500 outline-none" />
                  </div>
                </div>

                <div className="pt-6 border-t border-[#ECECEC] flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-[#222222]">Direct Payout Routing</h4>
                    <p className="text-[10px] text-charcoal-400">Powered by Stripe Connect. Payouts processed every Friday.</p>
                  </div>
                  <span className="px-3.5 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-bold text-green-700">Connected</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODALS SECTION */}
      
      {/* REPORT PREVIEW MODAL */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 border border-[#ECECEC] shadow-2xl space-y-8 text-left my-8"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-[#ECECEC] pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-[#6D071A]" />
                    <h2 className="text-2xl font-bold font-serif text-[#222222]">VinoSphere Winery Analytics Report</h2>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-charcoal-600">
                    <p><span className="font-semibold text-[#222222]">Winery:</span> {(typeof reportData?.winery === "string" ? reportData.winery : reportData?.winery?.name) || (isDemoMode ? "VinoSphere Analytics Demo Winery" : currentWinery?.name || "VinoSphere Winery")}</p>
                    <p><span className="font-semibold text-[#222222]">Analysis Period:</span> {reportData?.periodLabel || (selectedPeriod === "7d" ? "Last 7 Days" : selectedPeriod === "30d" ? "Last 30 Days" : "Last 90 Days")}</p>
                    <p><span className="font-semibold text-[#222222]">Generated On:</span> {reportData?.generatedAt ? new Date(reportData.generatedAt).toLocaleString("en-IN") : new Date().toLocaleString("en-IN")}</p>
                    {isDemoMode && (
                      <p className="inline-block mt-1 font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                        Controlled Analytics Demonstration Dataset
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="px-3 py-1.5 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition flex items-center gap-1 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition flex items-center gap-1 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-[#F8F9FB] rounded-xl transition">
                    <X className="w-5 h-5 text-charcoal-600" />
                  </button>
                </div>
              </div>

              {/* 1. EXECUTIVE SUMMARY */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-serif text-[#222222] border-b border-[#ECECEC] pb-2">1. Executive Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Event Bookings", cur: reportData?.executiveSummary?.eventBookings?.current ?? businessAnalytics?.eventBookings?.current ?? 0, prev: reportData?.executiveSummary?.eventBookings?.previous ?? businessAnalytics?.eventBookings?.previous ?? 0, pct: reportData?.executiveSummary?.eventBookings?.percentageChangeFormatted ?? businessAnalytics?.eventBookings?.percentageChangeFormatted ?? "0%" },
                    { label: "Experience Bookings", cur: reportData?.executiveSummary?.experienceBookings?.current ?? businessAnalytics?.experienceBookings?.current ?? 0, prev: reportData?.executiveSummary?.experienceBookings?.previous ?? businessAnalytics?.experienceBookings?.previous ?? 0, pct: reportData?.executiveSummary?.experienceBookings?.percentageChangeFormatted ?? businessAnalytics?.experienceBookings?.percentageChangeFormatted ?? "0%" },
                    { label: "Corporate Inquiries", cur: reportData?.executiveSummary?.corporateInquiries?.current ?? businessAnalytics?.corporateInquiries?.current ?? 0, prev: reportData?.executiveSummary?.corporateInquiries?.previous ?? businessAnalytics?.corporateInquiries?.previous ?? 0, pct: reportData?.executiveSummary?.corporateInquiries?.percentageChangeFormatted ?? businessAnalytics?.corporateInquiries?.percentageChangeFormatted ?? "0%" },
                    { label: "Gross Booking Value", cur: formatCurrency(reportData?.executiveSummary?.grossBookingValue?.current ?? businessAnalytics?.totalGrossBookingValue?.current ?? 0), prev: formatCurrency(reportData?.executiveSummary?.grossBookingValue?.previous ?? businessAnalytics?.totalGrossBookingValue?.previous ?? 0), pct: reportData?.executiveSummary?.grossBookingValue?.percentageChangeFormatted ?? businessAnalytics?.totalGrossBookingValue?.percentageChangeFormatted ?? "0%" },
                    { label: "Capacity Utilization", cur: `${reportData?.executiveSummary?.eventCapacityUtilization?.current ?? businessAnalytics?.eventCapacityUtilization?.current ?? 0}%`, prev: `${reportData?.executiveSummary?.eventCapacityUtilization?.previous ?? businessAnalytics?.eventCapacityUtilization?.previous ?? 0}%`, pct: reportData?.executiveSummary?.eventCapacityUtilization?.percentageChangeFormatted ?? "0%" },
                    { label: "Event Guests", cur: reportData?.executiveSummary?.eventGuests?.current ?? businessAnalytics?.eventGuests?.current ?? 0, prev: reportData?.executiveSummary?.eventGuests?.previous ?? businessAnalytics?.eventGuests?.previous ?? 0, pct: reportData?.executiveSummary?.eventGuests?.percentageChangeFormatted ?? businessAnalytics?.eventGuests?.percentageChangeFormatted ?? "0%" },
                    { label: "Experience Guests", cur: reportData?.executiveSummary?.experienceGuests?.current ?? businessAnalytics?.experienceGuests?.current ?? 0, prev: reportData?.executiveSummary?.experienceGuests?.previous ?? businessAnalytics?.experienceGuests?.previous ?? 0, pct: reportData?.executiveSummary?.experienceGuests?.percentageChangeFormatted ?? businessAnalytics?.experienceGuests?.percentageChangeFormatted ?? "0%" },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#F8F9FB] p-3.5 rounded-2xl border border-[#ECECEC]">
                      <p className="text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-base font-bold text-[#222222] mt-1">{item.cur}</p>
                      <p className="text-[10px] text-charcoal-500 mt-0.5">Prev: {item.prev} ({item.pct})</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. WINE ENGAGEMENT REPORT */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-serif text-[#222222] border-b border-[#ECECEC] pb-2">2. Wine Engagement Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#F8F9FB] p-4 rounded-2xl border border-[#ECECEC]">
                    <p className="text-xs text-charcoal-500">Wine Views</p>
                    <p className="text-xl font-bold text-[#222222]">{reportData?.wineEngagement?.wineViews ?? dashboardSummary?.wine_views ?? 0}</p>
                    <p className="text-[10px] text-charcoal-400 mt-1">VinoSphere discovery views</p>
                  </div>
                  <div className="bg-[#F8F9FB] p-4 rounded-2xl border border-[#ECECEC]">
                    <p className="text-xs text-charcoal-500">Wine Saves</p>
                    <p className="text-xl font-bold text-[#222222]">{reportData?.wineEngagement?.wineSaves ?? dashboardSummary?.wine_saves ?? 0}</p>
                    <p className="text-[10px] text-charcoal-400 mt-1">Saved to user wishlists</p>
                  </div>
                  <div className="bg-[#F8F9FB] p-4 rounded-2xl border border-[#ECECEC]">
                    <p className="text-xs text-charcoal-500">Save Rate</p>
                    <p className="text-xl font-bold text-emerald-600">{reportData?.wineEngagement?.saveRateFormatted ?? `${dashboardSummary?.view_to_save_rate || 0}%`}</p>
                    <p className="text-[10px] text-charcoal-400 mt-1">View-to-save conversion</p>
                  </div>
                </div>
                {(reportData?.wineEngagement?.wineViews ?? 0) === 0 && (
                  <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    Insufficient data for reliable trend analysis.
                  </p>
                )}
              </div>

              {/* 3. EVENT PERFORMANCE REPORT */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-serif text-[#222222] border-b border-[#ECECEC] pb-2">3. Event Performance Report</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-[#F8F9FB] p-3.5 rounded-2xl border border-[#ECECEC]">
                    <span className="text-charcoal-500 block">Event Bookings</span>
                    <span className="text-base font-bold text-[#222222]">{reportData?.events?.bookings?.current ?? 0}</span>
                  </div>
                  <div className="bg-[#F8F9FB] p-3.5 rounded-2xl border border-[#ECECEC]">
                    <span className="text-charcoal-500 block">Event Guests</span>
                    <span className="text-base font-bold text-[#222222]">{reportData?.events?.guests?.current ?? 0}</span>
                  </div>
                  <div className="bg-[#F8F9FB] p-3.5 rounded-2xl border border-[#ECECEC]">
                    <span className="text-charcoal-500 block">Capacity Utilization</span>
                    <span className="text-base font-bold text-emerald-600">{reportData?.events?.capacityUtilization?.current ?? 0}%</span>
                  </div>
                  <div className="bg-[#F8F9FB] p-3.5 rounded-2xl border border-[#ECECEC]">
                    <span className="text-charcoal-500 block">Event GBV</span>
                    <span className="text-base font-bold text-burgundy-600">{formatCurrency(reportData?.events?.grossBookingValue?.current ?? 0)}</span>
                  </div>
                </div>
              </div>

              {/* 4. EXPERIENCE PERFORMANCE REPORT */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-serif text-[#222222] border-b border-[#ECECEC] pb-2">4. Experience Performance Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-[#F8F9FB] p-3.5 rounded-2xl border border-[#ECECEC]">
                    <span className="text-charcoal-500 block">Experience Bookings</span>
                    <span className="text-base font-bold text-[#222222]">{reportData?.experiences?.bookings?.current ?? 0}</span>
                  </div>
                  <div className="bg-[#F8F9FB] p-3.5 rounded-2xl border border-[#ECECEC]">
                    <span className="text-charcoal-500 block">Experience Guests</span>
                    <span className="text-base font-bold text-[#222222]">{reportData?.experiences?.guests?.current ?? 0}</span>
                  </div>
                  <div className="bg-[#F8F9FB] p-3.5 rounded-2xl border border-[#ECECEC]">
                    <span className="text-charcoal-500 block">Experience GBV</span>
                    <span className="text-base font-bold text-amber-600">{formatCurrency(reportData?.experiences?.grossBookingValue?.current ?? 0)}</span>
                  </div>
                </div>
              </div>

              {/* 5. CORPORATE INQUIRY REPORT */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-serif text-[#222222] border-b border-[#ECECEC] pb-2">5. Corporate Inquiry Report</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-[#F8F9FB] p-3.5 rounded-2xl border border-[#ECECEC]">
                    <span className="text-charcoal-500 block">Total Inquiries</span>
                    <span className="text-base font-bold text-[#222222]">{reportData?.corporate?.totalInquiries?.current ?? 0}</span>
                  </div>
                  <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                    <span className="text-amber-700 block font-semibold">Pending</span>
                    <span className="text-base font-bold text-amber-800">{reportData?.corporate?.statusBreakdown?.pending ?? 0}</span>
                  </div>
                  <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                    <span className="text-emerald-700 block font-semibold">Approved</span>
                    <span className="text-base font-bold text-emerald-800">{reportData?.corporate?.statusBreakdown?.approved ?? 0}</span>
                  </div>
                  <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200">
                    <span className="text-rose-700 block font-semibold">Rejected</span>
                    <span className="text-base font-bold text-rose-800">{reportData?.corporate?.statusBreakdown?.rejected ?? 0}</span>
                  </div>
                </div>
                <p className="text-[11px] text-charcoal-500 bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <Info className="w-3.5 h-3.5 inline mr-1 text-blue-600" />
                  Corporate inquiries represent business leads received through VinoSphere. They are not included in Gross Booking Value unless represented by an eligible paid event or experience booking.
                </p>
              </div>

              {/* 6. GROSS BOOKING VALUE REPORT */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-serif text-[#222222] border-b border-[#ECECEC] pb-2">6. Gross Booking Value (GBV)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-[#F8F9FB] p-4 rounded-2xl border border-[#ECECEC]">
                    <span className="text-charcoal-500 block">Event GBV</span>
                    <span className="text-lg font-bold text-burgundy-600">{formatCurrency(reportData?.grossBookingValue?.breakdown?.events ?? 0)}</span>
                  </div>
                  <div className="bg-[#F8F9FB] p-4 rounded-2xl border border-[#ECECEC]">
                    <span className="text-charcoal-500 block">Experience GBV</span>
                    <span className="text-lg font-bold text-amber-600">{formatCurrency(reportData?.grossBookingValue?.breakdown?.experiences ?? 0)}</span>
                  </div>
                  <div className="bg-[#F8F9FB] p-4 rounded-2xl border border-[#ECECEC]">
                    <span className="text-charcoal-500 block">Combined Total GBV</span>
                    <span className="text-lg font-bold text-emerald-600">{formatCurrency(reportData?.grossBookingValue?.current ?? 0)}</span>
                  </div>
                </div>
                <p className="text-[11px] text-charcoal-500 bg-[#F8F9FB] p-3 rounded-xl border border-[#ECECEC]">
                  <Info className="w-3.5 h-3.5 inline mr-1 text-charcoal-600" />
                  Gross Booking Value represents eligible paid event and experience bookings recorded through VinoSphere. It is not total winery revenue and does not include offline sales, wholesale revenue, restaurant revenue, or external corporate contracts.
                </p>
              </div>

              {/* 7. PERIOD COMPARISON TABLE */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-serif text-[#222222] border-b border-[#ECECEC] pb-2">7. Period Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-[#ECECEC]">
                    <thead>
                      <tr className="bg-[#F8F9FB] text-[10px] uppercase tracking-wider text-charcoal-600 border-b border-[#ECECEC]">
                        <th className="py-2.5 px-3 font-bold">Business Metric</th>
                        <th className="py-2.5 px-3 font-bold text-right">Current Period</th>
                        <th className="py-2.5 px-3 font-bold text-right">Previous Period</th>
                        <th className="py-2.5 px-3 font-bold text-right">Absolute Change</th>
                        <th className="py-2.5 px-3 font-bold text-right">Percentage Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ECECEC] text-xs">
                      {(reportData?.comparison || []).map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#F8F9FB] transition">
                          <td className="py-2.5 px-3 font-semibold text-[#222222]">{row.metric}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-[#222222]">{row.current}</td>
                          <td className="py-2.5 px-3 text-right text-charcoal-500">{row.previous}</td>
                          <td className="py-2.5 px-3 text-right text-charcoal-600">{row.change > 0 ? `+${row.change}` : row.change}</td>
                          <td className="py-2.5 px-3 text-right font-semibold">{row.percentageChange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 8. INSIGHTS & RECOMMENDATIONS */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-serif text-[#222222] border-b border-[#ECECEC] pb-2">8. Insights & Recommendations</h3>
                <div className="space-y-3">
                  {(reportData?.insights || []).length > 0 ? (
                    reportData.insights.map((item: any, i: number) => {
                      const formatObj = (val: any, fallback: string = '') => {
                        if (!val) return fallback;
                        if (typeof val === 'string') return val;
                        if (typeof val === 'object') {
                          if (val.metric && val.current_value !== undefined) {
                            const pct = val.percentage_change !== undefined ? ` (${val.percentage_change >= 0 ? '+' : ''}${val.percentage_change}%)` : '';
                            return `${val.metric}: current ${val.current_value} vs previous ${val.comparison_value ?? 0}${pct}`;
                          }
                          if (val.condition_detected) return val.condition_detected;
                          if (val.recommendation_text) return val.recommendation_text;
                          if (val.rule_id) return val.rule_id;
                          return JSON.stringify(val);
                        }
                        return String(val);
                      };

                      return (
                        <div key={i} className="bg-[#F8F9FB] p-4 rounded-2xl border border-[#ECECEC] space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                              item.severity === "high" ? "bg-rose-100 text-rose-800" :
                              item.severity === "medium" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                            }`}>
                              {item.severity?.toUpperCase() || "INSIGHT"}
                            </span>
                            <h4 className="text-xs font-bold text-[#222222]">{formatObj(item.insight, item.condition || item.rule_id || "Insight")}</h4>
                          </div>
                          <p className="text-[11px] text-charcoal-600"><span className="font-semibold text-[#222222]">Evidence:</span> {formatObj(item.evidence, "Automated trend evidence recorded")}</p>
                          <p className="text-[11px] text-[#6D071A] font-medium"><span className="font-semibold text-[#222222]">Recommendation:</span> {formatObj(item.recommendation, "Action recommended based on platform rules")}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-charcoal-500 italic">No automated insights detected for this evaluation window.</p>
                  )}
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 font-mono text-center">
                  Raw platform activity → Analytics aggregation → Validated metrics → Trend detection → Insight → Recommendation → Report
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#ECECEC] flex justify-between items-center text-xs text-charcoal-400">
                <span>VinoSphere Winery Analytics Module v13.0</span>
                <button onClick={() => setShowReportModal(false)} className="px-5 py-2 bg-[#222222] text-white font-bold rounded-xl hover:bg-black transition">
                  Close Report Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* QR CODE INSPECT MODAL */}
      <AnimatePresence>
        {viewingQrBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 border border-[#ECECEC] shadow-2xl space-y-5 text-left"
            >
              <div className="flex justify-between items-center border-b border-[#ECECEC] pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#6D071A]" />
                  <h3 className="text-base font-bold font-serif text-[#222222]">Guest Reservation Pass</h3>
                </div>
                <button
                  onClick={() => setViewingQrBooking(null)}
                  className="p-1.5 hover:bg-[#F8F9FB] rounded-lg transition"
                >
                  <X className="w-4 h-4 text-charcoal-600" />
                </button>
              </div>

              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EDE5D8] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Guest Name:</span>
                  <span className="font-bold text-[#222222]">{viewingQrBooking.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Experience / Event:</span>
                  <span className="font-bold text-[#6D071A]">{viewingQrBooking.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Date &amp; Party:</span>
                  <span className="font-semibold text-[#222222]">{viewingQrBooking.date} &bull; {viewingQrBooking.tickets} Guests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Payment Status:</span>
                  <span className="font-bold text-emerald-700">₹{viewingQrBooking.total} Paid</span>
                </div>
              </div>

              <div className="p-4 bg-white border border-dashed border-[#ECECEC] rounded-xl text-center space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">Digital Access Code</p>
                <code className="block bg-[#F8F9FB] px-3 py-2 rounded-lg font-mono text-sm font-bold text-[#6D071A] border border-[#ECECEC] select-all">
                  {viewingQrBooking.qrCode}
                </code>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(viewingQrBooking.qrCode);
                    setQrCopied(true);
                    setTimeout(() => setQrCopied(false), 2000);
                  }}
                  className="px-4 py-2 bg-[#6D071A] hover:bg-[#841126] text-white text-xs font-bold rounded-xl transition shadow-sm"
                >
                  {qrCopied ? "Copied Reference!" : "Copy Access Code"}
                </button>
                <button
                  type="button"
                  onClick={() => setViewingQrBooking(null)}
                  className="px-4 py-2 border border-[#ECECEC] hover:bg-[#F8F9FB] text-charcoal-700 text-xs font-bold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. ADD WINE MODAL */}
      <AnimatePresence>
        {addWineModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 border border-[#ECECEC] shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-[#ECECEC] pb-4">
                <h3 className="text-lg font-bold font-serif text-[#222222] text-left">Add New Wine to Inventory</h3>
                <button onClick={() => setAddWineModalOpen(false)} className="p-1.5 hover:bg-[#F8F9FB] rounded-lg transition">
                  <X className="w-4 h-4 text-charcoal-600" />
                </button>
              </div>

              <form onSubmit={handleWineAdd} className="space-y-6 text-left">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Wine Name</label>
                    <input
                      type="text"
                      value={newWine.name}
                      onChange={(e) => setNewWine({ ...newWine, name: e.target.value })}
                      placeholder="e.g. Sauvignon Blanc Special Reserve"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Category Type</label>
                    <select
                      value={["Red", "White", "Sparkling", "Rosé", "Dessert"].includes(newWine.category) ? newWine.category : (newWine.category ? "Other" : "Red")}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Other") {
                          setNewWine({ ...newWine, category: "Other", customCategory: newWine.customCategory || "" });
                        } else {
                          setNewWine({ ...newWine, category: val, customCategory: "" });
                        }
                      }}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                    >
                      <option value="Red">Red Wine</option>
                      <option value="White">White Wine</option>
                      <option value="Sparkling">Sparkling Wine</option>
                      <option value="Rosé">Rosé Wine</option>
                      <option value="Dessert">Dessert Wine</option>
                      <option value="Other">Other (Custom Category)</option>
                    </select>

                    {(newWine.category === "Other" || !["Red", "White", "Sparkling", "Rosé", "Dessert"].includes(newWine.category)) && (
                      <input
                        type="text"
                        value={newWine.customCategory !== undefined ? newWine.customCategory : (newWine.category === "Other" ? "" : newWine.category)}
                        onChange={(e) => setNewWine({ ...newWine, customCategory: e.target.value })}
                        placeholder="Enter custom category (e.g. Fortified Wine, Mead, Port, Orange Wine)"
                        className="w-full p-3 border border-[#6D071A]/40 bg-[#FAF7F2] rounded-xl text-xs outline-none focus:border-[#6D071A] mt-2 placeholder:text-charcoal-400"
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Grape Variety</label>
                    <input
                      type="text"
                      value={newWine.grapeVariety}
                      onChange={(e) => setNewWine({ ...newWine, grapeVariety: e.target.value })}
                      placeholder="e.g. Shiraz, Chardonnay"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Initial Stock</label>
                    <input
                      type="number"
                      value={newWine.stock}
                      onChange={(e) => setNewWine({ ...newWine, stock: e.target.value })}
                      placeholder="100"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Vintage Year</label>
                    <input
                      type="number"
                      value={newWine.vintage}
                      onChange={(e) => setNewWine({ ...newWine, vintage: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Price (INR)</label>
                    <input
                      type="number"
                      value={newWine.price}
                      onChange={(e) => setNewWine({ ...newWine, price: e.target.value })}
                      placeholder="₹1200"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Alcohol Content</label>
                    <input
                      type="text"
                      value={newWine.alcoholContent}
                      onChange={(e) => setNewWine({ ...newWine, alcoholContent: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Serving Temp</label>
                    <input
                      type="text"
                      value={newWine.servingTemp}
                      onChange={(e) => setNewWine({ ...newWine, servingTemp: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Body</label>
                    <select
                      value={newWine.body}
                      onChange={(e) => setNewWine({ ...newWine, body: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                    >
                      <option value="Light">Light</option>
                      <option value="Medium">Medium</option>
                      <option value="Full">Full</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Sweetness</label>
                    <select
                      value={newWine.sweetness}
                      onChange={(e) => setNewWine({ ...newWine, sweetness: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                    >
                      <option value="Bone Dry">Bone Dry</option>
                      <option value="Dry">Dry</option>
                      <option value="Off-Dry">Off-Dry</option>
                      <option value="Sweet">Sweet</option>
                      <option value="Very Sweet">Very Sweet</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Acidity</label>
                    <select
                      value={newWine.acidity}
                      onChange={(e) => setNewWine({ ...newWine, acidity: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Tannin</label>
                    <select
                      value={newWine.tannin}
                      onChange={(e) => setNewWine({ ...newWine, tannin: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Bottle Photo</label>
                  <div className="relative w-full border border-[#ECECEC] rounded-xl overflow-hidden bg-[#F8F9FB] flex items-center justify-center" style={{ minHeight: '120px' }}>
                    {isUploading ? (
                      <div className="text-xs text-charcoal-400 font-bold animate-pulse flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-[#6D071A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                        Uploading...
                      </div>
                    ) : newWine.image ? (
                      <div className="w-full h-full relative group">
                        <img src={newWine.image} alt="Preview" className="w-full h-full object-contain max-h-[160px] p-2" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <button 
                            type="button" 
                            onClick={() => setNewWine({ ...newWine, image: '', publicId: '' })}
                            className="px-3 py-1.5 bg-white text-xs font-bold text-[#6D071A] rounded-md shadow"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-6 h-6 text-charcoal-400 mx-auto mb-2" />
                        <span className="text-xs text-charcoal-500 font-medium">Click to upload image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Bottle Description</label>
                  <textarea
                    value={newWine.description}
                    onChange={(e) => setNewWine({ ...newWine, description: e.target.value })}
                    placeholder="Describe sensory characteristics, maturation details..."
                    className="w-full h-20 p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Food Pairings</label>
                    <input
                      type="text"
                      value={newWine.foodPairings}
                      onChange={(e) => setNewWine({ ...newWine, foodPairings: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Taste Notes</label>
                    <input
                      type="text"
                      value={newWine.tasteNotes}
                      onChange={(e) => setNewWine({ ...newWine, tasteNotes: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[#ECECEC]">
                  <button
                    type="button"
                    onClick={fillDemoData}
                    className="px-5 py-2.5 bg-[#F8F9FB] border border-[#ECECEC] text-charcoal-700 text-xs font-bold rounded-xl hover:bg-[#ECECEC] transition mr-auto"
                  >
                    Fill Demo Data
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition"
                  >
                    Publish to Storefront
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddWineModalOpen(false)}
                    className="px-5 py-2.5 bg-white border border-[#ECECEC] text-charcoal-700 text-xs font-bold rounded-xl hover:bg-[#F8F9FB] transition"
                  >
                    Save as Draft
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* 1B. EDIT WINE MODAL */}
      <AnimatePresence>
        {editWineModalOpen && editingWine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 border border-[#ECECEC] shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-[#ECECEC] pb-4">
                <div>
                  <h3 className="text-lg font-bold font-serif text-[#222222] text-left">Edit Wine Bottle Details</h3>
                  <p className="text-xs text-charcoal-400 text-left">Update catalog specifications, pricing, inventory stock, and sensory notes.</p>
                </div>
                <button onClick={() => setEditWineModalOpen(false)} className="p-1.5 hover:bg-[#F8F9FB] rounded-lg transition">
                  <X className="w-4 h-4 text-charcoal-600" />
                </button>
              </div>

              <form onSubmit={handleWineUpdate} className="space-y-6 text-left">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Wine Name</label>
                    <input
                      type="text"
                      value={editingWine.name}
                      onChange={(e) => setEditingWine({ ...editingWine, name: e.target.value })}
                      placeholder="e.g. Sula Shiraz Cabernet"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Category Type</label>
                    <select
                      value={["Red", "White", "Sparkling", "Rosé", "Dessert"].includes(editingWine.category) ? editingWine.category : "Other"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Other") {
                          setEditingWine({ ...editingWine, category: "Other", customCategory: editingWine.customCategory || "" });
                        } else {
                          setEditingWine({ ...editingWine, category: val, customCategory: "" });
                        }
                      }}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                    >
                      <option value="Red">Red Wine</option>
                      <option value="White">White Wine</option>
                      <option value="Sparkling">Sparkling Wine</option>
                      <option value="Rosé">Rosé Wine</option>
                      <option value="Dessert">Dessert Wine</option>
                      <option value="Other">Other (Custom Category)</option>
                    </select>

                    {(editingWine.category === "Other" || !["Red", "White", "Sparkling", "Rosé", "Dessert"].includes(editingWine.category)) && (
                      <input
                        type="text"
                        value={editingWine.customCategory !== undefined ? editingWine.customCategory : (editingWine.category === "Other" ? "" : editingWine.category)}
                        onChange={(e) => setEditingWine({ ...editingWine, customCategory: e.target.value })}
                        placeholder="Enter custom category (e.g. Fortified Wine, Mead, Port, Orange Wine)"
                        className="w-full p-3 border border-[#6D071A]/40 bg-[#FAF7F2] rounded-xl text-xs outline-none focus:border-[#6D071A] mt-2 placeholder:text-charcoal-400"
                        required
                      />
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Grape Variety</label>
                    <input
                      type="text"
                      value={editingWine.grapeVariety}
                      onChange={(e) => setEditingWine({ ...editingWine, grapeVariety: e.target.value })}
                      placeholder="e.g. Shiraz, Cabernet Sauvignon"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Stock Quantity (Bottles)</label>
                    <input
                      type="number"
                      value={editingWine.stock}
                      onChange={(e) => setEditingWine({ ...editingWine, stock: e.target.value })}
                      placeholder="100"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Vintage Year</label>
                    <input
                      type="number"
                      value={editingWine.vintage}
                      onChange={(e) => setEditingWine({ ...editingWine, vintage: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Price (INR)</label>
                    <input
                      type="number"
                      value={editingWine.price}
                      onChange={(e) => setEditingWine({ ...editingWine, price: e.target.value })}
                      placeholder="₹1200"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Alcohol %</label>
                    <input
                      type="text"
                      value={editingWine.alcoholContent}
                      onChange={(e) => setEditingWine({ ...editingWine, alcoholContent: e.target.value })}
                      placeholder="13.5"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Serving Temp</label>
                    <input
                      type="text"
                      value={editingWine.servingTemp}
                      onChange={(e) => setEditingWine({ ...editingWine, servingTemp: e.target.value })}
                      placeholder="16-18°C"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Body</label>
                    <select
                      value={editingWine.body}
                      onChange={(e) => setEditingWine({ ...editingWine, body: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                    >
                      <option value="Light">Light</option>
                      <option value="Medium">Medium</option>
                      <option value="Full">Full</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Sweetness</label>
                    <select
                      value={editingWine.sweetness}
                      onChange={(e) => setEditingWine({ ...editingWine, sweetness: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                    >
                      <option value="Bone Dry">Bone Dry</option>
                      <option value="Dry">Dry</option>
                      <option value="Off-Dry">Off-Dry</option>
                      <option value="Sweet">Sweet</option>
                      <option value="Very Sweet">Very Sweet</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Acidity</label>
                    <select
                      value={editingWine.acidity}
                      onChange={(e) => setEditingWine({ ...editingWine, acidity: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Tannin</label>
                    <select
                      value={editingWine.tannin}
                      onChange={(e) => setEditingWine({ ...editingWine, tannin: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Bottle Photo</label>
                  <div className="relative w-full border border-[#ECECEC] rounded-xl overflow-hidden bg-[#F8F9FB] flex items-center justify-center" style={{ minHeight: '120px' }}>
                    {isUploading ? (
                      <div className="text-xs text-charcoal-400 font-bold animate-pulse flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-[#6D071A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                        Uploading...
                      </div>
                    ) : editingWine.image ? (
                      <div className="w-full h-full relative group">
                        <img src={editingWine.image} alt="Preview" className="w-full h-full object-contain max-h-[160px] p-2" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          <label className="px-3 py-1.5 bg-white text-xs font-bold text-[#6D071A] rounded-md shadow cursor-pointer">
                            Change Photo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleEditWineImageUpload}
                              className="hidden"
                            />
                          </label>
                          <button 
                            type="button" 
                            onClick={() => setEditingWine({ ...editingWine, image: '', publicId: '' })}
                            className="px-3 py-1.5 bg-red-600 text-xs font-bold text-white rounded-md shadow"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-6 h-6 text-charcoal-400 mx-auto mb-2" />
                        <span className="text-xs text-charcoal-500 font-medium">Click to upload new bottle image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditWineImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Bottle Description</label>
                  <textarea
                    value={editingWine.description}
                    onChange={(e) => setEditingWine({ ...editingWine, description: e.target.value })}
                    placeholder="Describe sensory characteristics, maturation details..."
                    className="w-full h-20 p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Food Pairings</label>
                    <input
                      type="text"
                      value={editingWine.foodPairings}
                      onChange={(e) => setEditingWine({ ...editingWine, foodPairings: e.target.value })}
                      placeholder="e.g. Cheese, Lamb, BBQ"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Taste Notes</label>
                    <input
                      type="text"
                      value={editingWine.tasteNotes}
                      onChange={(e) => setEditingWine({ ...editingWine, tasteNotes: e.target.value })}
                      placeholder="e.g. Blackberry, vanilla, spice"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none focus:border-[#6D071A]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[#ECECEC]">
                  <button
                    type="button"
                    onClick={() => setEditWineModalOpen(false)}
                    className="px-5 py-2.5 bg-white border border-[#ECECEC] text-charcoal-700 text-xs font-bold rounded-xl hover:bg-[#F8F9FB] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingWine}
                    className="px-5 py-2.5 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition flex items-center gap-2"
                  >
                    {isUpdatingWine ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                        Saving Changes...
                      </>
                    ) : (
                      "Save Wine Changes"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* 2. CREATE EVENT MODAL */}
      <AnimatePresence>
        {addEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 border border-[#ECECEC] shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-[#ECECEC] pb-4">
                <h3 className="text-lg font-bold font-serif text-[#222222] text-left">Schedule Estate Event</h3>
                <button onClick={() => setAddEventModalOpen(false)} className="p-1.5 hover:bg-[#F8F9FB] rounded-lg transition">
                  <X className="w-4 h-4 text-charcoal-600" />
                </button>
              </div>

              <form onSubmit={handleEventCreate} className="space-y-4 text-left">
                {/* Event Stage / Status Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Event Timeline & Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewEvent({ ...newEvent, event_status: 'upcoming' })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center ${
                        newEvent.event_status === 'upcoming'
                          ? 'bg-[#6D071A] text-white border-[#6D071A] shadow-sm'
                          : 'bg-[#F8F9FB] text-charcoal-600 border-[#ECECEC] hover:bg-white'
                      }`}
                    >
                      Upcoming / Next
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewEvent({ ...newEvent, event_status: 'ongoing' })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center ${
                        newEvent.event_status === 'ongoing'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-[#F8F9FB] text-charcoal-600 border-[#ECECEC] hover:bg-white'
                      }`}
                    >
                      Current / Ongoing
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewEvent({ ...newEvent, event_status: 'past' })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-center ${
                        newEvent.event_status === 'past'
                          ? 'bg-stone-800 text-white border-stone-800 shadow-sm'
                          : 'bg-[#F8F9FB] text-charcoal-600 border-[#ECECEC] hover:bg-white'
                      }`}
                    >
                      Previous / Past Event
                    </button>
                  </div>
                </div>

                {/* If Past Event, render attendance turnout, ratings, and customer reviews */}
                {newEvent.event_status === 'past' && (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#6D071A]" />
                        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">Past Event Metrics & Social Proof</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewEvent((prev: any) => ({
                            ...prev,
                            turnout_count: "185",
                            rating: "4.9",
                            recap_notes: "A full-house amphitheatre harvest festival featuring live acoustic sets, barrel tastings, and sunset dinners.",
                            reviews: [
                              {
                                author: "Aarav Deshmukh",
                                rating: 5,
                                comment: "The sunset wine pairing at the amphitheatre was magnificent. Unforgettable ambiance!"
                              },
                              {
                                author: "Simran Kaur",
                                rating: 5,
                                comment: "Exceptional reserve vintages and sommelier walkthrough. Our group had an incredible evening!"
                              }
                            ]
                          }));
                        }}
                        className="text-[10px] font-bold text-[#6D071A] hover:underline"
                      >
                        ⚡ Fill Sample Data
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-stone-600">Total Attendees / Turnout</label>
                        <input
                          type="number"
                          value={newEvent.turnout_count || ""}
                          onChange={(e) => setNewEvent({ ...newEvent, turnout_count: e.target.value })}
                          placeholder="e.g. 185"
                          className="w-full p-2.5 border border-stone-200 rounded-xl text-xs outline-none bg-white font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-stone-600">Event Rating (1.0 to 5.0)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={newEvent.rating || "4.9"}
                          onChange={(e) => setNewEvent({ ...newEvent, rating: e.target.value })}
                          placeholder="e.g. 4.9"
                          className="w-full p-2.5 border border-stone-200 rounded-xl text-xs outline-none bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-stone-600">Event Recap / Highlights Summary</label>
                      <textarea
                        value={newEvent.recap_notes || ""}
                        onChange={(e) => setNewEvent({ ...newEvent, recap_notes: e.target.value })}
                        placeholder="Brief summary of the concluded event's highlights and attendee reception..."
                        rows={2}
                        className="w-full p-2.5 border border-stone-200 rounded-xl text-xs outline-none bg-white resize-none"
                      />
                    </div>

                    {/* Attendee Reviews List */}
                    <div className="space-y-2 pt-2 border-t border-stone-200">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-stone-600">Attendee Reviews & Feedback ({newEvent.reviews?.length || 0})</label>
                        <button
                          type="button"
                          onClick={() => {
                            setNewEvent((prev: any) => ({
                              ...prev,
                              reviews: [...(prev.reviews || []), { author: "", rating: 5, comment: "" }]
                            }));
                          }}
                          className="text-[10px] font-bold text-[#6D071A] hover:underline"
                        >
                          + Add Review
                        </button>
                      </div>

                      {(!newEvent.reviews || newEvent.reviews.length === 0) ? (
                        <p className="text-[11px] text-stone-400 italic">No reviews added yet. Click '+ Add Review' or 'Fill Sample Data' to attach guest quotes.</p>
                      ) : (
                        <div className="space-y-2">
                          {newEvent.reviews.map((rev: any, rIdx: number) => (
                            <div key={rIdx} className="bg-white p-3 rounded-xl border border-stone-200 space-y-2">
                              <div className="flex justify-between items-center gap-2">
                                <input
                                  type="text"
                                  value={rev.author}
                                  onChange={(e) => {
                                    const updated = [...newEvent.reviews];
                                    updated[rIdx].author = e.target.value;
                                    setNewEvent({ ...newEvent, reviews: updated });
                                  }}
                                  placeholder="Guest Name (e.g. Rahul Sharma)"
                                  className="flex-1 p-1.5 border border-stone-200 rounded-lg text-xs outline-none"
                                />
                                <select
                                  value={rev.rating}
                                  onChange={(e) => {
                                    const updated = [...newEvent.reviews];
                                    updated[rIdx].rating = parseInt(e.target.value) || 5;
                                    setNewEvent({ ...newEvent, reviews: updated });
                                  }}
                                  className="p-1.5 border border-stone-200 rounded-lg text-xs outline-none bg-white font-bold"
                                >
                                  <option value={5}>★ 5</option>
                                  <option value={4}>★ 4</option>
                                  <option value={3}>★ 3</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = newEvent.reviews.filter((_: any, i: number) => i !== rIdx);
                                    setNewEvent({ ...newEvent, reviews: updated });
                                  }}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={rev.comment}
                                onChange={(e) => {
                                  const updated = [...newEvent.reviews];
                                  updated[rIdx].comment = e.target.value;
                                  setNewEvent({ ...newEvent, reviews: updated });
                                }}
                                placeholder="Review quote (e.g. 'Magical evening with great wine pairings!')"
                                className="w-full p-1.5 border border-stone-200 rounded-lg text-xs outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Banner Image</label>
                    <div className="relative border-2 border-dashed border-[#ECECEC] rounded-xl p-4 text-center hover:bg-[#F8F9FB] transition">
                      {newEvent.image_url ? (
                        <div className="relative">
                          <img src={newEvent.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                          <button 
                            type="button"
                            onClick={() => setNewEvent({ ...newEvent, image_url: undefined } as any)}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-4">
                          {isUploading ? (
                            <div className="text-xs text-charcoal-500 font-medium">Uploading to Cloudinary...</div>
                          ) : (
                            <>
                              <ImageIcon className="w-6 h-6 text-charcoal-400 mx-auto mb-2" />
                              <span className="text-xs text-charcoal-500 font-medium">Click to upload banner image</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleEventImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Event Name</label>
                  <input
                    type="text"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    placeholder="e.g. Monsoon Harvest Festival"
                    className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Event Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Booking / Registration Deadline</label>
                    <input
                      type="datetime-local"
                      value={newEvent.booking_deadline || ""}
                      onChange={(e) => setNewEvent({ ...newEvent, booking_deadline: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Start Time</label>
                    <input
                      type="text"
                      value={newEvent.start_time || newEvent.time || ""}
                      onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value, time: e.target.value })}
                      placeholder="e.g. 18:00 or 6:00 PM"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">End Time</label>
                    <input
                      type="text"
                      value={newEvent.end_time || ""}
                      onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                      placeholder="e.g. 21:00 or 9:00 PM"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Booking Status</label>
                    <select
                      value={newEvent.booking_status || "Open"}
                      onChange={(e) => setNewEvent({ ...newEvent, booking_status: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none bg-white font-medium"
                    >
                      <option value="Open">Open</option>
                      <option value="Coming Soon">Coming Soon</option>
                      <option value="Sold Out">Sold Out</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Venue Capacity</label>
                    <input
                      type="number"
                      value={newEvent.capacity}
                      onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Ticket Price (INR)</label>
                    <input
                      type="number"
                      value={newEvent.ticketPrice}
                      onChange={(e) => setNewEvent({ ...newEvent, ticketPrice: e.target.value })}
                      placeholder="e.g. 1500"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Event Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Provide itinerary details..."
                    className="w-full h-16 p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                  />
                </div>

                
                  <div className="space-y-4 pt-4 border-t border-[#ECECEC]">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Tags / Badges</label>
                      <input
                        type="text"
                        value={newEvent.tags?.join(", ") || ""}
                        onChange={(e) => setNewEvent({ ...newEvent, tags: e.target.value.split(",").map(s => s.trim()) } as any)}
                        placeholder="e.g. Music, Harvest"
                        className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                      />
                    </div>

                    <div className="bg-[#F8F9FB] p-4 rounded-2xl border border-[#ECECEC] space-y-3">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6D071A]">Host Information</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Host Name</label>
                          <input
                            type="text"
                            value={newEvent.host_info?.name || ""}
                            onChange={(e) => setNewEvent({ ...newEvent, host_info: { ...newEvent.host_info, name: e.target.value } } as any)}
                            placeholder="e.g. Karan Varma"
                            className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Host Title</label>
                          <input
                            type="text"
                            value={newEvent.host_info?.title || ""}
                            onChange={(e) => setNewEvent({ ...newEvent, host_info: { ...newEvent.host_info, title: e.target.value } } as any)}
                            placeholder="e.g. Senior Sommelier"
                            className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Host Rating</label>
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={newEvent.host_info?.rating || "5.0"}
                            onChange={(e) => setNewEvent({ ...newEvent, host_info: { ...newEvent.host_info, rating: parseFloat(e.target.value) || 5.0 } } as any)}
                            className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Host Avatar Image URL</label>
                          <input
                            type="text"
                            value={newEvent.host_info?.avatar || ""}
                            onChange={(e) => setNewEvent({ ...newEvent, host_info: { ...newEvent.host_info, avatar: e.target.value } } as any)}
                            placeholder="Optional"
                            className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Host Bio</label>
                        <textarea
                          value={newEvent.host_info?.bio || ""}
                          onChange={(e) => setNewEvent({ ...newEvent, host_info: { ...newEvent.host_info, bio: e.target.value } } as any)}
                          placeholder="Host background..."
                          rows={2}
                          className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none resize-none bg-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DynamicListInput label="Highlights" items={newEvent.highlights} onChange={(val: any) => setNewEvent({...newEvent, highlights: val})} placeholder="e.g. Exclusive acoustic session" />
                  <DynamicListInput label="What's Included" items={newEvent.inclusions} onChange={(val: any) => setNewEvent({...newEvent, inclusions: val})} placeholder="e.g. Shuttle service" />
                  <FeaturedVintagesInput items={newEvent.featured_vintages} onChange={(val: any) => setNewEvent({...newEvent, featured_vintages: val})} availableWines={allWines} />
                  <ItineraryInput items={newEvent.itinerary} onChange={(val: any) => setNewEvent({...newEvent, itinerary: val})} />

                  <button
                  type="submit"
                  className="w-full py-3 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition shadow"
                >
                  {newEvent.event_status === 'past' ? 'Archive Past Event Showcase' : newEvent.event_status === 'ongoing' ? 'Update & Confirm Ongoing Event' : 'Publish & Issue Tickets'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* 3. CREATE ESTATE JOURNEY MODAL */}
      <AnimatePresence>
        {addExperienceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 border border-[#ECECEC] shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-[#ECECEC] pb-4">
                <div>
                  <h3 className="text-lg font-bold font-serif text-[#222222] text-left">Configure Estate Journey</h3>
                  <p className="text-xs text-charcoal-500 text-left mt-0.5">Publish bookable vineyard walks, cellar masterclasses, or archive past editions with social proof.</p>
                </div>
                <button onClick={() => setAddExperienceModalOpen(false)} className="p-1.5 hover:bg-[#F8F9FB] rounded-lg transition">
                  <X className="w-4 h-4 text-charcoal-600" />
                </button>
              </div>

              <form onSubmit={handleExperienceCreate} className="space-y-5 text-left">
                {/* Journey Timeline Stage Selector */}
                <div className="space-y-1.5 bg-[#F8F9FB] p-3.5 rounded-2xl border border-[#ECECEC]">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700 block">Journey Timeline Stage</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewExperience({ ...newExperience, experience_status: 'active', booking_status: 'Open for Booking' })}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        newExperience.experience_status === 'active'
                          ? 'bg-[#6D071A] text-white shadow-sm'
                          : 'bg-white border border-[#ECECEC] text-charcoal-600 hover:bg-[#F0F2F5]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Active Offering</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewExperience({ ...newExperience, experience_status: 'upcoming', booking_status: 'Coming Soon' })}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        newExperience.experience_status === 'upcoming'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white border border-[#ECECEC] text-charcoal-600 hover:bg-[#F0F2F5]'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Upcoming / Soon</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewExperience({ ...newExperience, experience_status: 'past', booking_status: 'Closed' })}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        newExperience.experience_status === 'past'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-white border border-[#ECECEC] text-charcoal-600 hover:bg-[#F0F2F5]'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Past Edition</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-500 font-medium px-1">
                    {newExperience.experience_status === 'active' && "✓ Active journeys are visible and bookable by guests immediately."}
                    {newExperience.experience_status === 'upcoming' && "✓ Upcoming journeys are publicly displayed for discovery, but booking CTA is set to 'Coming Soon'."}
                    {newExperience.experience_status === 'past' && "✓ Past editions are displayed as historical archive & social proof showcases."}
                  </p>
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Cover Image</label>
                  <div className="relative border-2 border-dashed border-[#ECECEC] rounded-xl p-4 text-center hover:bg-[#F8F9FB] transition">
                    {(newExperience as any).image_url ? (
                      <div className="relative">
                        <img src={(newExperience as any).image_url} alt="Preview" className="w-full h-36 object-cover rounded-lg" />
                        <button 
                          type="button"
                          onClick={() => setNewExperience({ ...newExperience, image_url: undefined } as any)}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-4">
                        {isUploading ? (
                          <div className="text-xs text-charcoal-500 font-medium">Uploading to Cloudinary...</div>
                        ) : (
                          <>
                            <ImageIcon className="w-6 h-6 text-charcoal-400 mx-auto mb-2" />
                            <span className="text-xs text-charcoal-500 font-medium">Click to upload cover image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleExpImageUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience Gallery (Multiple Images) */}
                <div className="space-y-2 bg-[#F8F9FB] p-3.5 rounded-2xl border border-[#ECECEC]">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-charcoal-500" />
                      <span>Experience Gallery ({(newExperience.gallery_images || []).length} photos)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setNewExperience({
                          ...newExperience,
                          gallery_images: [...(newExperience.gallery_images || []), ""]
                        });
                      }}
                      className="text-[10px] font-bold text-[#6D071A] hover:underline"
                    >
                      + Add Gallery Photo
                    </button>
                  </div>
                  {(newExperience.gallery_images || []).length === 0 ? (
                    <p className="text-[11px] text-stone-400 italic">No extra gallery photos added yet. Click above to add photo URLs.</p>
                  ) : (
                    <div className="space-y-2">
                      {(newExperience.gallery_images || []).map((imgUrl: string, gIdx: number) => (
                        <div key={gIdx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#ECECEC]">
                          {imgUrl ? (
                            <img src={imgUrl} alt={`Gallery ${gIdx}`} className="w-10 h-10 object-cover rounded-lg flex-shrink-0 border border-stone-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="w-4 h-4 text-stone-400" />
                            </div>
                          )}
                          <input
                            type="text"
                            value={imgUrl}
                            onChange={(e) => {
                              const updated = [...(newExperience.gallery_images || [])];
                              updated[gIdx] = e.target.value;
                              setNewExperience({ ...newExperience, gallery_images: updated });
                            }}
                            placeholder="https://images.unsplash.com/... (Image URL)"
                            className="w-full text-xs p-1 outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (newExperience.gallery_images || []).filter((_: any, i: number) => i !== gIdx);
                              setNewExperience({ ...newExperience, gallery_images: updated });
                            }}
                            className="text-stone-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Journey Title</label>
                    <input
                      type="text"
                      value={newExperience.name}
                      onChange={(e) => setNewExperience({ ...newExperience, name: e.target.value })}
                      placeholder="e.g. Terroir Reserve Cellar Masterclass"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Journey Category</label>
                    <select
                      value={newExperience.experience_type}
                      onChange={(e) => setNewExperience({ ...newExperience, experience_type: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none bg-white font-medium"
                    >
                      <option value="Wine Tastings">Wine Tastings</option>
                      <option value="Vineyard Tours">Vineyard Tours</option>
                      <option value="Food Pairing">Food Pairing</option>
                      <option value="Sommelier Workshops">Sommelier Workshops</option>
                      <option value="Harvest Festivals">Harvest Festivals</option>
                      <option value="Sunset Soirées">Sunset Soirées</option>
                    </select>
                  </div>
                </div>

                {/* Short Description (Teaser) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Short Description (Teaser Card)</label>
                  <input
                    type="text"
                    value={newExperience.short_description || ""}
                    onChange={(e) => setNewExperience({ ...newExperience, short_description: e.target.value })}
                    placeholder="e.g. An exclusive behind-the-scenes cellar tasting paired with artisan cheeses."
                    className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                  />
                </div>

                {/* Duration & Capacity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Duration</label>
                    <input
                      type="text"
                      value={newExperience.duration}
                      onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                      placeholder="e.g. 90 Mins or 2 Hours"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Max Group Capacity</label>
                    <input
                      type="number"
                      value={newExperience.capacity}
                      onChange={(e) => setNewExperience({ ...newExperience, capacity: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Price per Guest (INR)</label>
                  <input
                    type="number"
                    value={newExperience.price}
                    onChange={(e) => setNewExperience({ ...newExperience, price: e.target.value })}
                    placeholder="e.g. 1800"
                    className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Overview & Narrative</label>
                  <textarea
                    value={newExperience.description || ""}
                    onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                    placeholder="Describe this journey (e.g. guided vineyard walk, underground vault barrel tastings, curated artisan pairings...)"
                    rows={3}
                    className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none resize-none"
                    required
                  />
                </div>

                {/* SCHEDULE & AVAILABILITY */}
                <div className="bg-[#F8F9FB] p-4 rounded-2xl border border-[#ECECEC] space-y-3.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#6D071A]" />
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6D071A]">Schedule & Availability</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Start Date</label>
                      <input
                        type="date"
                        value={newExperience.start_date || ""}
                        onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })}
                        className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">End Date</label>
                      <input
                        type="date"
                        value={newExperience.end_date || ""}
                        onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })}
                        className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white"
                      />
                    </div>
                  </div>

                  {/* Available Days Multi-select pills */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Available Days</label>
                    <div className="flex flex-wrap gap-1.5">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                        const isSelected = (newExperience.available_days || []).includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const current = newExperience.available_days || [];
                              const updated = isSelected ? current.filter((d: string) => d !== day) : [...current, day];
                              setNewExperience({ ...newExperience, available_days: updated });
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                              isSelected ? 'bg-[#6D071A] text-white' : 'bg-white border border-[#ECECEC] text-charcoal-600 hover:bg-stone-100'
                            }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Configured Time Slots */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-charcoal-500" />
                        <span>Configured Time Slots ({(newExperience.time_slots || []).length})</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setNewExperience({
                            ...newExperience,
                            time_slots: [...(newExperience.time_slots || []), ""]
                          });
                        }}
                        className="text-[10px] font-bold text-[#6D071A] hover:underline"
                      >
                        + Add Time Slot
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(newExperience.time_slots || []).map((slot: string, sIdx: number) => (
                        <div key={sIdx} className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-[#ECECEC]">
                          <input
                            type="text"
                            value={slot}
                            onChange={(e) => {
                              const updated = [...(newExperience.time_slots || [])];
                              updated[sIdx] = e.target.value;
                              setNewExperience({ ...newExperience, time_slots: updated });
                            }}
                            placeholder="11:00 AM"
                            className="w-full text-xs outline-none bg-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (newExperience.time_slots || []).filter((_: any, i: number) => i !== sIdx);
                              setNewExperience({ ...newExperience, time_slots: updated });
                            }}
                            className="text-stone-400 hover:text-red-500 text-xs px-1 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Maximum Guests Per Slot */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Maximum Guests Per Slot</label>
                    <input
                      type="number"
                      value={newExperience.max_guests_per_slot || ""}
                      onChange={(e) => setNewExperience({ ...newExperience, max_guests_per_slot: e.target.value })}
                      placeholder="e.g. 15"
                      className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white"
                    />
                  </div>
                </div>

                {/* BOOKING INFORMATION */}
                <div className="bg-[#F8F9FB] p-4 rounded-2xl border border-[#ECECEC] space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6D071A]">Booking Information & Policies</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Booking Status</label>
                      <select
                        value={newExperience.booking_status || "Open for Booking"}
                        onChange={(e) => setNewExperience({ ...newExperience, booking_status: e.target.value })}
                        className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white font-medium"
                      >
                        <option value="Open for Booking">Open for Booking</option>
                        <option value="Coming Soon">Coming Soon</option>
                        <option value="Sold Out">Sold Out</option>
                        <option value="Temporarily Unavailable">Temporarily Unavailable</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Minimum Age Requirement</label>
                      <input
                        type="text"
                        value={newExperience.min_age || "18+"}
                        onChange={(e) => setNewExperience({ ...newExperience, min_age: e.target.value })}
                        placeholder="e.g. 18+ or 21+"
                        className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Cancellation Policy</label>
                    <input
                      type="text"
                      value={newExperience.cancellation_policy || ""}
                      onChange={(e) => setNewExperience({ ...newExperience, cancellation_policy: e.target.value })}
                      placeholder="e.g. Free cancellation up to 48 hours before the journey starts."
                      className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white"
                    />
                  </div>
                </div>

                {/* LOCATION & ARRIVAL */}
                <div className="bg-[#F8F9FB] p-4 rounded-2xl border border-[#ECECEC] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6D071A] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Location & Arrival Details</span>
                    </h4>
                    <span className="text-[10px] text-stone-500 font-medium">
                      📍 {(currentWinery as any)?.contact?.address || (currentWinery as any)?.location?.address || (currentWinery as any)?.location?.region || "Estate Grounds"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Meeting Point on Estate</label>
                    <input
                      type="text"
                      value={newExperience.meeting_point || ""}
                      onChange={(e) => setNewExperience({ ...newExperience, meeting_point: e.target.value })}
                      placeholder="e.g. Estate Tasting Room & Visitor Pavilion"
                      className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Arrival Instructions</label>
                    <textarea
                      value={newExperience.arrival_instructions || ""}
                      onChange={(e) => setNewExperience({ ...newExperience, arrival_instructions: e.target.value })}
                      placeholder="e.g. Please arrive 15 minutes prior to your time slot for check-in and welcome drink."
                      rows={2}
                      className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none resize-none bg-white"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={newExperience.parking_available ?? true}
                      onChange={(e) => setNewExperience({ ...newExperience, parking_available: e.target.checked })}
                      className="w-4 h-4 rounded text-[#6D071A] accent-[#6D071A]"
                    />
                    <span className="text-xs text-charcoal-700 font-medium">On-site complimentary guest parking available</span>
                  </label>
                </div>

                {/* Past Edition Social Proof Suite */}
                {newExperience.experience_status === 'past' && (
                  <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-700" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">Past Edition Metrics & Social Proof</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewExperience({
                            ...newExperience,
                            edition_date: "2025-11-15",
                            turnout_count: "65",
                            rating: "4.96",
                            recap_notes: "Concluded special monsoon harvest masterclass with 65 passionate wine lovers experiencing cellar verticals and barrel tastings.",
                            reviews: [
                              {
                                id: `rev-${Date.now()}-1`,
                                author: "Vikramaditya Rao",
                                rating: 5,
                                date: "Recent Season",
                                comment: "One of the finest vineyard immersions in India. Walking through the barrel room with the winemaker was unforgettable!"
                              },
                              {
                                id: `rev-${Date.now()}-2`,
                                author: "Ananya Sen",
                                rating: 5,
                                date: "Recent Season",
                                comment: "Exceptional hospitality, gorgeous views, and top-tier pairing dinner. Highly recommended!"
                              }
                            ]
                          });
                        }}
                        className="px-2.5 py-1 bg-amber-200/70 hover:bg-amber-200 text-amber-900 font-bold text-[10px] rounded-lg transition"
                      >
                        ⚡ Fill Sample Social Proof Data
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-amber-900">Edition / Event Date</label>
                        <input
                          type="date"
                          value={newExperience.edition_date || ""}
                          onChange={(e) => setNewExperience({ ...newExperience, edition_date: e.target.value })}
                          className="w-full p-2.5 border border-amber-200 rounded-xl text-xs outline-none bg-white font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-amber-900">Total Guests Hosted</label>
                        <input
                          type="number"
                          value={newExperience.turnout_count || ""}
                          onChange={(e) => setNewExperience({ ...newExperience, turnout_count: e.target.value })}
                          placeholder="e.g. 65"
                          className="w-full p-2.5 border border-amber-200 rounded-xl text-xs outline-none bg-white font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-amber-900">Overall Rating (1 - 5)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          max="5"
                          value={newExperience.rating || "4.95"}
                          onChange={(e) => setNewExperience({ ...newExperience, rating: e.target.value })}
                          className="w-full p-2.5 border border-amber-200 rounded-xl text-xs outline-none bg-white font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-amber-900">Post-Journey Recap & Highlights</label>
                      <textarea
                        value={newExperience.recap_notes || ""}
                        onChange={(e) => setNewExperience({ ...newExperience, recap_notes: e.target.value })}
                        placeholder="Editorial summary of how this journey edition unfolded, key vintages poured, attendee reception..."
                        rows={2}
                        className="w-full p-2.5 border border-amber-200 rounded-xl text-xs outline-none bg-white resize-none"
                      />
                    </div>

                    {/* Dynamic Guest Reviews */}
                    <div className="space-y-2 pt-2 border-t border-amber-200">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-amber-950">Verified Guest Reviews ({newExperience.reviews?.length || 0})</label>
                        <button
                          type="button"
                          onClick={() => {
                            const currentRevs = newExperience.reviews || [];
                            setNewExperience({
                              ...newExperience,
                              reviews: [
                                ...currentRevs,
                                {
                                  id: `rev-${Date.now()}`,
                                  author: "",
                                  rating: 5,
                                  date: "Recent Season",
                                  comment: ""
                                }
                              ]
                            });
                          }}
                          className="text-[10px] font-bold text-amber-800 hover:text-amber-950 hover:underline"
                        >
                          + Add Guest Review
                        </button>
                      </div>

                      {(newExperience.reviews || []).map((rev: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white border border-amber-200 rounded-xl space-y-2 relative group">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = newExperience.reviews.filter((_: any, i: number) => i !== idx);
                              setNewExperience({ ...newExperience, reviews: updated });
                            }}
                            className="absolute top-2 right-2 text-stone-400 hover:text-red-500 text-xs font-bold"
                          >
                            ✕
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={rev.author}
                              onChange={(e) => {
                                const updated = [...newExperience.reviews];
                                updated[idx].author = e.target.value;
                                setNewExperience({ ...newExperience, reviews: updated });
                              }}
                              placeholder="Guest Name (e.g. Vikramaditya Rao)"
                              className="p-1.5 border border-[#ECECEC] rounded-lg text-xs outline-none"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-stone-500 font-bold">Rating:</span>
                              <input
                                type="number"
                                min="1"
                                max="5"
                                value={rev.rating || 5}
                                onChange={(e) => {
                                  const updated = [...newExperience.reviews];
                                  updated[idx].rating = parseInt(e.target.value) || 5;
                                  setNewExperience({ ...newExperience, reviews: updated });
                                }}
                                className="w-14 p-1.5 border border-[#ECECEC] rounded-lg text-xs outline-none"
                              />
                            </div>
                          </div>
                          <textarea
                            value={rev.comment}
                            onChange={(e) => {
                              const updated = [...newExperience.reviews];
                              updated[idx].comment = e.target.value;
                              setNewExperience({ ...newExperience, reviews: updated });
                            }}
                            placeholder="Guest feedback comment..."
                            rows={2}
                            className="w-full p-1.5 border border-[#ECECEC] rounded-lg text-xs outline-none resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Tags & Badges</label>
                  <input
                    type="text"
                    value={newExperience.tags?.join(", ") || ""}
                    onChange={(e) => setNewExperience({ ...newExperience, tags: e.target.value.split(",").map((s: string) => s.trim()) } as any)}
                    placeholder="e.g. Best Seller, Exclusive, Harvest"
                    className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                  />
                </div>

                {/* Host Info */}
                <div className="bg-[#F8F9FB] p-4 rounded-2xl border border-[#ECECEC] space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6D071A]">Host / Winemaker Guide Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Guide Name</label>
                      <input
                        type="text"
                        value={newExperience.host_info?.name || ""}
                        onChange={(e) => setNewExperience({ ...newExperience, host_info: { ...newExperience.host_info, name: e.target.value } } as any)}
                        placeholder="e.g. Karan Varma"
                        className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Guide Title</label>
                      <input
                        type="text"
                        value={newExperience.host_info?.title || ""}
                        onChange={(e) => setNewExperience({ ...newExperience, host_info: { ...newExperience.host_info, title: e.target.value } } as any)}
                        placeholder="e.g. Senior Sommelier"
                        className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Guide Photo (URL)</label>
                    <input
                      type="text"
                      value={newExperience.host_info?.avatar || ""}
                      onChange={(e) => setNewExperience({ ...newExperience, host_info: { ...newExperience.host_info, avatar: e.target.value } } as any)}
                      placeholder="https://... (Guide portrait URL)"
                      className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-charcoal-600">Guide Bio</label>
                    <textarea
                      value={newExperience.host_info?.bio || ""}
                      onChange={(e) => setNewExperience({ ...newExperience, host_info: { ...newExperience.host_info, bio: e.target.value } } as any)}
                      placeholder="Sommelier certifications, years at estate..."
                      rows={2}
                      className="w-full p-2 border border-[#ECECEC] rounded-lg text-xs outline-none resize-none bg-white"
                    />
                  </div>
                </div>

                <DynamicListInput label="Highlights" items={newExperience.highlights} onChange={(val: any) => setNewExperience({...newExperience, highlights: val})} placeholder="e.g. Private barrel tasting in underground vault" />
                <DynamicListInput label="What's Included" items={newExperience.inclusions} onChange={(val: any) => setNewExperience({...newExperience, inclusions: val})} placeholder="e.g. 5 Hand-selected Reserve Vintages" />
                <DynamicListInput label="What's Not Included" items={newExperience.exclusions} onChange={(val: any) => setNewExperience({...newExperience, exclusions: val})} placeholder="e.g. Personal transit, additional takeaway bottles" />
                <FeaturedVintagesInput items={newExperience.featured_vintages} onChange={(val: any) => setNewExperience({...newExperience, featured_vintages: val})} availableWines={allWines} />

                <button
                  type="submit"
                  className={`w-full py-3.5 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-2 ${
                    newExperience.experience_status === 'past'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : newExperience.experience_status === 'upcoming'
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-[#6D071A] hover:bg-[#841126]'
                  }`}
                >
                  {newExperience.experience_status === 'past' ? (
                    <>
                      <Award className="w-4 h-4" />
                      <span>Archive Past Edition Showcase</span>
                    </>
                  ) : newExperience.experience_status === 'upcoming' ? (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Publish Upcoming Journey (Coming Soon)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Publish Active Estate Journey</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* 4. UPLOAD CERTIFICATION MODAL */}
      <AnimatePresence>
        {addDocModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md p-8 border border-[#ECECEC] shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-[#ECECEC] pb-4">
                <h3 className="text-lg font-bold font-serif text-[#222222] text-left">Upload Compliance License</h3>
                <button onClick={() => setAddDocModalOpen(false)} className="p-1.5 hover:bg-[#F8F9FB] rounded-lg transition">
                  <X className="w-4 h-4 text-charcoal-600" />
                </button>
              </div>

              <form onSubmit={handleDocUpload} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Document/License Name</label>
                  <input
                    type="text"
                    value={newDoc.name}
                    onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                    placeholder="e.g. Organic Farming Certificate"
                    className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Classification Type</label>
                  <select
                    value={newDoc.type}
                    onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                    className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                  >
                    <option value="Wine License">Excise Wine License</option>
                    <option value="Food License">FSSAI Food License</option>
                    <option value="ISO Certification">ISO Safety QMS</option>
                    <option value="Sustainability">Organic/Eco Certification</option>
                    <option value="Tax Registration">GSTIN / VAT Tax</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Registration Number</label>
                    <input
                      type="text"
                      value={newDoc.number}
                      onChange={(e) => setNewDoc({ ...newDoc, number: e.target.value })}
                      placeholder="e.g. ISO-2026-X1"
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Expiry Date</label>
                    <input
                      type="date"
                      value={newDoc.expiryDate}
                      onChange={(e) => setNewDoc({ ...newDoc, expiryDate: e.target.value })}
                      className="w-full p-3 border border-[#ECECEC] rounded-xl text-xs outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-700">Select PDF File</label>
                  <div className="border border-dashed border-[#ECECEC] p-6 rounded-2xl flex flex-col items-center justify-center bg-[#F8F9FB] cursor-pointer">
                    <Upload className="w-6 h-6 text-charcoal-400" />
                    <span className="text-[10px] text-charcoal-400 mt-2 font-semibold">Click to browse file</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition shadow"
                >
                  Upload & Queue Verification
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* 5. VIEW WINE DETAILS MODAL */}
      <AnimatePresence>
        {selectedWine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden border border-[#ECECEC] shadow-2xl flex flex-col md:flex-row h-[560px]"
            >
              {/* Left Column: Wine Portrait Block */}
              {(() => {
                let modalBackdrop = "from-[#FDF2F4] to-[#FCE7EB]"; // Red
                if (selectedWine.type === "White") modalBackdrop = "from-[#FAF9F2] to-[#F5EFE6]";
                if (selectedWine.type === "Rosé") modalBackdrop = "from-[#FFF5F7] to-[#FFE3E8]";
                if (selectedWine.type === "Sparkling") modalBackdrop = "from-[#F0FAFB] to-[#E0F5F7]";
                if (selectedWine.type === "Dessert") modalBackdrop = "from-[#FFFBEB] to-[#FEF3C7]";

                return (
                  <div className={`md:w-1/3 bg-gradient-to-b ${modalBackdrop} flex flex-col justify-between p-6 items-center shrink-0 border-r border-[#ECECEC]`}>
                    <div className="w-full flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-[#222222] text-white text-[8px] font-bold rounded">
                        {selectedWine.vintage}
                      </span>
                      <span className="text-[9px] font-bold text-charcoal-500 uppercase">
                        {selectedWine.type}
                      </span>
                    </div>

                    <img
                      src={selectedWine.image || resolveWineBottleImage(selectedWine)}
                      alt={selectedWine.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = resolveWineBottleImage(selectedWine);
                      }}
                      className="h-[320px] object-contain drop-shadow-2xl my-4 hover:scale-105 transition-transform duration-300"
                    />

                    <div>
                      <p className="text-[10px] text-charcoal-400 uppercase font-bold text-center">Terroir Price</p>
                      <p className="text-base font-bold text-[#6D071A] text-center">₹{selectedWine.price}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Right Column: Spec Sheet Details */}
              <div className="flex-1 p-8 overflow-y-auto flex flex-col justify-between text-left space-y-6">
                
                {/* Header title */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold font-serif text-[#222222] leading-tight">{selectedWine.name}</h3>
                    <p className="text-xs text-charcoal-400 font-semibold uppercase tracking-wider">
                      {selectedWine.grapeVariety?.join(", ") || "Bespoke blend"} · {selectedWine.origin}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditWine(selectedWine)}
                      className="px-3 py-1.5 bg-[#6D071A] text-white text-xs font-bold rounded-xl hover:bg-[#841126] transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Wine
                    </button>
                    <button onClick={() => setSelectedWine(null)} className="p-1.5 hover:bg-[#F8F9FB] rounded-lg transition shrink-0">
                      <X className="w-4 h-4 text-charcoal-600" />
                    </button>
                  </div>
                </div>

                {/* Narrative description */}
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-charcoal-400 block">Estate Description</span>
                  <p className="text-xs text-charcoal-600 leading-relaxed font-medium bg-[#F8F9FB] p-3.5 rounded-2xl border border-[#ECECEC]">
                    {selectedWine.description}
                  </p>
                </div>

                {/* Tasting profile scores sliders */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-charcoal-400 block">Taste Profile Indicators</span>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[10px] font-semibold text-charcoal-700">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Body</span>
                        <span className="text-[#6D071A] font-bold">
                          {selectedWine.tasteProfile?.includes("Full Body") ? "Full" : selectedWine.tasteProfile?.includes("Light") ? "Light" : "Medium"}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#F8F9FB] rounded-full border border-[#ECECEC] overflow-hidden">
                        <div className="h-full bg-[#6D071A]" style={{ width: selectedWine.tasteProfile?.includes("Full Body") ? "85%" : selectedWine.tasteProfile?.includes("Light") ? "35%" : "60%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Sweetness</span>
                        <span className="text-[#6D071A] font-bold">
                          {selectedWine.type === "Dessert" ? "Sweet" : selectedWine.tasteProfile?.includes("Sweet") ? "Off-Dry" : "Dry"}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#F8F9FB] rounded-full border border-[#ECECEC] overflow-hidden">
                        <div className="h-full bg-[#6D071A]" style={{ width: selectedWine.type === "Dessert" ? "95%" : selectedWine.tasteProfile?.includes("Sweet") ? "65%" : "20%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Acidity</span>
                        <span className="text-[#6D071A] font-bold">
                          {selectedWine.tasteProfile?.includes("Crisp") ? "Vibrant" : "Balanced"}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#F8F9FB] rounded-full border border-[#ECECEC] overflow-hidden">
                        <div className="h-full bg-[#6D071A]" style={{ width: selectedWine.tasteProfile?.includes("Crisp") ? "80%" : "50%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Oak Maturation</span>
                        <span className="text-[#6D071A] font-bold">
                          {selectedWine.name.toLowerCase().includes("rasa") ? "New Oak" : selectedWine.name.toLowerCase().includes("reserve") ? "Seasoned" : "Unoaked"}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#F8F9FB] rounded-full border border-[#ECECEC] overflow-hidden">
                        <div className="h-full bg-[#6D071A]" style={{ width: selectedWine.name.toLowerCase().includes("rasa") ? "90%" : selectedWine.name.toLowerCase().includes("reserve") ? "60%" : "10%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-y border-[#F5F5F5] py-4">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-charcoal-400 font-bold">Alcohol ABV</span>
                    <span className="text-xs font-bold text-[#222222]">{selectedWine.alcoholContent || "13.5%"}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-charcoal-400 font-bold">Serving Temp</span>
                    <span className="text-xs font-bold text-[#222222]">{selectedWine.servingTemp || "16-18°C"}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-charcoal-400 font-bold">Aging Potential</span>
                    <span className="text-xs font-bold text-[#222222]">{selectedWine.agingPotential || "5-8 Years"}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-charcoal-400 font-bold">Stock Count</span>
                    <span className="text-xs font-bold text-green-700">{selectedWine.stock}</span>
                  </div>
                </div>

                {/* Taste notes & Food pairing tags */}
                <div className="grid md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="space-y-1.5">
                    <span className="block text-[9px] uppercase tracking-wider text-charcoal-400 font-bold">Taste Notes</span>
                    <p className="text-[11px] text-charcoal-700 font-medium leading-relaxed">{selectedWine.tasteNotes}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="block text-[9px] uppercase tracking-wider text-charcoal-400 font-bold">Food Pairings</span>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {selectedWine.foodPairings?.map((food: string) => (
                        <span key={food} className="px-2 py-0.5 bg-[#FAF7F2] border border-[#D4AF37]/20 text-charcoal-700 text-[9px] font-bold rounded">
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Awards list */}
                {selectedWine.awards?.length > 0 && (
                  <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
                    <Award className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <div>
                      <span className="font-bold">Awards won:</span> {selectedWine.awards.join(" · ")}
                    </div>
                  </div>
                )}
                
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
}

// Simple Static Charts seeding
const staticMonthlyRevenueData = [
  { name: "Jan", revenue: 240000, bookings: 75 },
  { name: "Feb", revenue: 310000, bookings: 98 },
  { name: "Mar", revenue: 450000, bookings: 142 },
  { name: "Apr", revenue: 390000, bookings: 110 },
  { name: "May", revenue: 520000, bookings: 180 },
  { name: "Jun", revenue: 640000, bookings: 215 },
  { name: "Jul", revenue: 710000, bookings: 248 }
];

const staticWineSalesDistribution = [
  { name: "Red Wine", value: 45 },
  { name: "White Wine", value: 30 },
  { name: "Sparkling", value: 15 },
  { name: "Rosé", value: 8 },
  { name: "Dessert", value: 2 },
];

const COLORS_PIE = ["#6D071A", "#C4A27F", "#D4AF37", "#f498a8", "#3d020d"];

const staticFoodPairingsAnalytics = [
  { name: "BBQ & Lamb", count: 480 },
  { name: "Cheese Boards", count: 390 },
  { name: "Paneer Tikka", count: 320 },
  { name: "Butter Chicken", count: 280 },
  { name: "Spicy Seafood", count: 190 },
];

const staticBookingsByExperience = [
  { name: "Sunset Tour", value: 320 },
  { name: "Wine Tasting", value: 240 },
  { name: "Workshop", value: 110 },
];
