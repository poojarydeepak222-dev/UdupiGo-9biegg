import { useState } from 'react';
import { ArrowLeft, Home, Building2, MapPin, Phone, MessageCircle, Search, Plus, BedDouble, Bath, Ruler, CheckCircle, RefreshCw, Star, Filter, X, ChevronRight, IndianRupee, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PropertyListing {
  id: string;
  title: string;
  listing_type: string;
  property_type: string;
  price: number;
  price_negotiable: boolean;
  area_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  location: string;
  area?: string;
  description?: string;
  amenities?: string[];
  images?: string[];
  contact_name: string;
  contact_phone: string;
  is_verified: boolean;
  created_at: string;
}

type TabId = 'buy' | 'rent' | 'pg' | 'sell';

// ─── Constants ────────────────────────────────────────────────────────────────
const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'plot', 'land', 'commercial'];
const UDUPI_AREAS = [
  'All Areas', 'Car Street', 'Bannanje', 'Manipal', 'Ajjarakadu', 'KC Road',
  'KM Marg', 'Kinnimulki', 'Kalsanka', 'Malpe', 'Parkala', 'Shivalli',
  'Bypass Road', 'Tiger Circle', 'Padubidri', 'Kaup', 'Brahmavar',
];

const AMENITIES_LIST = [
  'Parking', 'Lift', 'Security', 'Power Backup', 'Gym', 'Swimming Pool',
  'Garden', 'Solar Water Heater', 'Bore Well', 'WiFi', 'AC', 'Furnished',
  'CCTV', 'Club House', 'Playground', 'Modular Kitchen',
];

const TYPE_COLORS: Record<string, string> = {
  apartment: 'bg-blue-100 text-blue-700',
  house: 'bg-green-100 text-green-700',
  villa: 'bg-purple-100 text-purple-700',
  plot: 'bg-amber-100 text-amber-700',
  land: 'bg-lime-100 text-lime-700',
  commercial: 'bg-orange-100 text-orange-700',
};

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
];

function formatPrice(price: number, type: string) {
  if (!price) return 'Price on Request';
  if (type === 'rent' || type === 'pg') return `₹${price.toLocaleString('en-IN')}/mo`;
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

// ─── Property Card ─────────────────────────────────────────────────────────
const PropertyCard = ({ prop }: { prop: PropertyListing }) => {
  const img = prop.images?.[0] || PLACEHOLDER_IMAGES[Math.abs(prop.id.charCodeAt(0) % 4)];

  const handleCall = () => { window.location.href = `tel:${prop.contact_phone}`; };
  const handleWhatsApp = () => {
    const phone = prop.contact_phone.replace(/[\s+\-()]/g, '');
    const msg = encodeURIComponent(`Hi ${prop.contact_name}, I saw your property "${prop.title}" on UdupiGo. I'm interested. Please share more details.`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Image */}
      <div className="relative h-44">
        <img src={img} alt={prop.title} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full capitalize ${TYPE_COLORS[prop.property_type] || 'bg-gray-100 text-gray-600'}`}>
            {prop.property_type}
          </span>
          {prop.is_verified && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500 text-white flex items-center gap-0.5">
              <CheckCircle size={8} /> Verified
            </span>
          )}
        </div>
        <div className="absolute bottom-2 right-2 bg-black/60 rounded-xl px-2.5 py-1">
          <p className="font-heading font-bold text-white text-sm">{formatPrice(prop.price, prop.listing_type)}</p>
          {prop.price_negotiable && <p className="text-white/70 text-[9px] text-right">Negotiable</p>}
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="font-heading font-bold text-gray-900 text-sm leading-tight line-clamp-2">{prop.title}</h3>

        <div className="flex items-center gap-1.5 mt-1.5">
          <MapPin size={11} className="text-brand-teal flex-shrink-0" />
          <p className="text-xs text-gray-500 truncate">{prop.location}</p>
        </div>

        {/* Specs */}
        {(prop.bedrooms || prop.area_sqft) && (
          <div className="flex items-center gap-3 mt-2">
            {prop.bedrooms && (
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <BedDouble size={11} className="text-gray-400" /> {prop.bedrooms} BHK
              </div>
            )}
            {prop.bathrooms && (
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <Bath size={11} className="text-gray-400" /> {prop.bathrooms}
              </div>
            )}
            {prop.area_sqft && (
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <Ruler size={11} className="text-gray-400" /> {prop.area_sqft.toLocaleString('en-IN')} sqft
              </div>
            )}
          </div>
        )}

        {/* Amenities preview */}
        {prop.amenities && prop.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {prop.amenities.slice(0, 3).map(a => (
              <span key={a} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-medium">{a}</span>
            ))}
            {prop.amenities.length > 3 && (
              <span className="text-[9px] bg-brand-teal/10 text-brand-teal px-1.5 py-0.5 rounded-md font-bold">+{prop.amenities.length - 3}</span>
            )}
          </div>
        )}

        {/* Contact */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400">Contact</p>
            <p className="text-xs font-semibold text-gray-700 truncate">{prop.contact_name}</p>
          </div>
          <button onClick={handleCall} className="bg-brand-teal text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 hover:bg-[#0d7a72] active:scale-95 transition-all">
            <Phone size={12} /> Call
          </button>
          <button onClick={handleWhatsApp} className="bg-green-500 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 hover:bg-green-600 active:scale-95 transition-all">
            <MessageCircle size={12} /> WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Post Form ─────────────────────────────────────────────────────────────
const PostForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    listing_type: 'sell',
    property_type: 'apartment',
    price: '',
    price_negotiable: true,
    area_sqft: '',
    bedrooms: '',
    bathrooms: '',
    location: '',
    area: '',
    description: '',
    amenities: [] as string[],
    contact_name: user?.username || '',
    contact_phone: '',
  });

  const mut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('property_listings').insert({
        ...form,
        user_id: user?.id || null,
        price: parseFloat(form.price) || 0,
        area_sqft: parseInt(form.area_sqft) || null,
        bedrooms: parseInt(form.bedrooms) || null,
        bathrooms: parseInt(form.bathrooms) || null,
        is_active: true,
        is_verified: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Property listed successfully! It will go live after review.');
      qc.invalidateQueries({ queryKey: ['property_listings'] });
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleAmenity = (a: string) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.contact_name || !form.contact_phone) {
      toast.error('Please fill all required fields');
      return;
    }
    mut.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-6">
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
        <strong>Free Listing!</strong> Post your property for free. Our team will verify and activate within 24 hours.
      </div>

      {/* Listing Type */}
      <div>
        <label className="text-xs font-bold text-gray-600 block mb-2">Listing Type *</label>
        <div className="grid grid-cols-3 gap-2">
          {[['sell', '🏷️', 'For Sale'], ['rent', '🔑', 'For Rent'], ['pg', '🏠', 'PG/Hostel']].map(([v, e, l]) => (
            <button key={v} type="button" onClick={() => setForm(f => ({ ...f, listing_type: v }))}
              className={`flex flex-col items-center py-3 rounded-xl border-2 text-xs font-bold transition-all ${form.listing_type === v ? 'border-brand-teal bg-brand-teal/5 text-brand-teal' : 'border-gray-100 text-gray-600'}`}>
              <span className="text-xl mb-1">{e}</span>{l}
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="text-xs font-bold text-gray-600 block mb-2">Property Type *</label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map(t => (
            <button key={t} type="button" onClick={() => setForm(f => ({ ...f, property_type: t }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border-2 transition-all ${form.property_type === t ? 'border-brand-teal bg-brand-teal text-white' : 'border-gray-100 text-gray-600 bg-white'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-bold text-gray-600 block mb-1">Title *</label>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="e.g. 2BHK Flat near Manipal University"
          className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Price (₹)</label>
          <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            placeholder={form.listing_type === 'sell' ? '4500000' : '15000'}
            type="number"
            className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Area (sqft)</label>
          <input value={form.area_sqft} onChange={e => setForm(f => ({ ...f, area_sqft: e.target.value }))}
            placeholder="1200" type="number"
            className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="neg" checked={form.price_negotiable} onChange={e => setForm(f => ({ ...f, price_negotiable: e.target.checked }))} className="w-4 h-4 accent-brand-teal" />
        <label htmlFor="neg" className="text-xs font-semibold text-gray-600">Price is negotiable</label>
      </div>

      {/* Bedrooms / Bathrooms */}
      {['apartment', 'house', 'villa'].includes(form.property_type) && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Bedrooms</label>
            <select value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 appearance-none">
              <option value="">Select</option>
              {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} BHK</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Bathrooms</label>
            <select value={form.bathrooms} onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 appearance-none">
              <option value="">Select</option>
              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Location */}
      <div>
        <label className="text-xs font-bold text-gray-600 block mb-1">Location / Address *</label>
        <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
          placeholder="e.g. Near Manipal University, Vidyanagar, Manipal"
          className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
      </div>

      <div>
        <label className="text-xs font-bold text-gray-600 block mb-1">Area</label>
        <select value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
          className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 appearance-none">
          <option value="">Select Area</option>
          {UDUPI_AREAS.slice(1).map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-bold text-gray-600 block mb-1">Description</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Describe the property, nearby amenities, special features..."
          rows={3}
          className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 resize-none" />
      </div>

      {/* Amenities */}
      <div>
        <label className="text-xs font-bold text-gray-600 block mb-2">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES_LIST.map(a => (
            <button key={a} type="button" onClick={() => toggleAmenity(a)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold transition-all border ${form.amenities.includes(a) ? 'bg-brand-teal text-white border-brand-teal' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Your Name *</label>
          <input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
            placeholder="Full name"
            className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Phone *</label>
          <input value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
            placeholder="+91 XXXXX XXXXX" type="tel"
            className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
        </div>
      </div>

      <button type="submit" disabled={mut.isPending}
        className="w-full bg-brand-teal text-white font-bold py-3.5 rounded-xl text-sm hover:bg-[#0d7a72] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
        {mut.isPending ? <><RefreshCw size={15} className="animate-spin" /> Submitting...</> : <><Plus size={15} /> Post Property for Free</>}
      </button>
    </form>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Property = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('buy');
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [showFilters, setShowFilters] = useState(false);
  const [propType, setPropType] = useState('');

  const listingTypeMap: Record<TabId, string> = { buy: 'sell', rent: 'rent', pg: 'pg', sell: '' };

  const { data: listings = [], isLoading, refetch } = useQuery({
    queryKey: ['property_listings', activeTab],
    queryFn: async () => {
      if (activeTab === 'sell') return [];
      let q = supabase.from('property_listings').select('*').eq('is_active', true);
      const lt = listingTypeMap[activeTab];
      if (lt) q = q.eq('listing_type', lt);
      q = q.order('created_at', { ascending: false });
      const { data } = await q;
      return (data || []) as PropertyListing[];
    },
  });

  const filtered = listings.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchArea = selectedArea === 'All Areas' || p.area === selectedArea || p.location.includes(selectedArea);
    const matchType = !propType || p.property_type === propType;
    return matchSearch && matchArea && matchType;
  });

  const TABS: { id: TabId; label: string; icon: string }[] = [
    { id: 'buy', label: 'Buy', icon: '🏠' },
    { id: 'rent', label: 'Rent', icon: '🔑' },
    { id: 'pg', label: 'PG / Hostel', icon: '🛏️' },
    { id: 'sell', label: 'Post Ad', icon: '➕' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-gray-900 text-lg">Property in Udupi</h1>
            <p className="text-xs text-gray-400">Buy · Rent · Sell · PG Listings</p>
          </div>
          <button onClick={() => refetch()} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-3 text-xs font-bold border-b-2 transition-all ${activeTab === tab.id ? 'border-brand-teal text-brand-teal' : 'border-transparent text-gray-400'}`}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab !== 'sell' ? (
        <div className="px-4 pt-4 space-y-4">
          {/* Hero */}
          <div className="bg-gradient-to-r from-brand-teal to-[#0d7a72] rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-28 flex items-center justify-center opacity-15 text-8xl pointer-events-none select-none">🏡</div>
            <p className="text-xs text-white/70 mb-1">
              {activeTab === 'buy' ? 'Properties for Sale' : activeTab === 'rent' ? 'Properties for Rent' : 'PG & Hostel'}
            </p>
            <h2 className="font-heading font-bold text-xl mb-1">Find Your Home in Udupi</h2>
            <p className="text-xs text-white/80">Verified listings across Udupi, Manipal & surrounding areas</p>
            <div className="flex gap-3 mt-3">
              {[
                [listings.length.toString(), 'Listings'],
                [listings.filter(p => p.is_verified).length.toString(), 'Verified'],
                ['Free', 'Post Ad'],
              ].map(([v, l]) => (
                <div key={l} className="bg-white/20 rounded-xl px-3 py-2 text-center">
                  <p className="font-bold text-sm">{v}</p>
                  <p className="text-[9px] text-white/70">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, location..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 shadow-sm" />
          </div>

          {/* Filters row */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold flex-shrink-0 transition-colors ${showFilters ? 'bg-brand-teal text-white border-brand-teal' : 'bg-white border-gray-200 text-gray-600'}`}>
              <Filter size={12} /> Filters
            </button>
            {UDUPI_AREAS.map(a => (
              <button key={a} onClick={() => setSelectedArea(a)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${selectedArea === a ? 'bg-brand-teal text-white border-brand-teal' : 'bg-white border-gray-200 text-gray-600'}`}>
                {a}
              </button>
            ))}
          </div>

          {/* Property type filter */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-xs font-bold text-gray-600 mb-2">Property Type</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setPropType('')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${!propType ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-600'}`}>
                  All Types
                </button>
                {PROPERTY_TYPES.map(t => (
                  <button key={t} onClick={() => setPropType(t)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${propType === t ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl h-56 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">🏠</p>
              <p className="font-semibold text-gray-700">No listings found</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">Be the first to post a property here!</p>
              <button onClick={() => setActiveTab('sell')}
                className="px-6 py-2.5 bg-brand-teal text-white font-bold text-sm rounded-xl">
                Post Property →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 font-semibold">{filtered.length} {activeTab === 'buy' ? 'properties for sale' : activeTab === 'rent' ? 'rental listings' : 'PG / Hostel listings'}</p>
              {filtered.map(p => <PropertyCard key={p.id} prop={p} />)}
            </div>
          )}

          {/* CTA to post */}
          <div className="bg-gradient-to-r from-brand-coral/10 to-orange-50 border border-brand-coral/20 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">🏡</p>
            <p className="font-bold text-sm text-gray-800">Have a property to list?</p>
            <p className="text-xs text-gray-500 mt-1 mb-3">Post your property for free and reach thousands of buyers in Udupi</p>
            <button onClick={() => setActiveTab('sell')}
              className="px-6 py-2 bg-brand-coral text-white font-bold text-xs rounded-xl">
              Post Free Ad →
            </button>
          </div>
        </div>
      ) : (
        /* POST AD TAB */
        <div className="px-4 pt-4">
          <div className="bg-gradient-to-r from-brand-coral to-orange-500 rounded-2xl p-5 text-white mb-4 relative overflow-hidden">
            <div className="absolute right-2 top-0 bottom-0 flex items-center text-7xl opacity-15 pointer-events-none">🏡</div>
            <p className="text-xs text-white/70 mb-1">Udupi Property Market</p>
            <h2 className="font-heading font-bold text-xl mb-1">Post Your Property</h2>
            <p className="text-xs text-white/80">Free listing · Verified within 24 hours · Reach 50,000+ users</p>
          </div>
          <PostForm onSuccess={() => setActiveTab('buy')} />
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Property;
