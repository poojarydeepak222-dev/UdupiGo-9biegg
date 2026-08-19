import { useState } from 'react';
import { ArrowLeft, MapPin, Navigation, Clock, Phone, Star, CheckCircle, AlertCircle, ChevronRight, Car, User, FileText, Calendar, Bike, RefreshCw, BadgeCheck, Info, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle_number: string;
  area: string;
  photo_url?: string;
  is_available: boolean;
  is_approved: boolean;
  rating: number;
  total_rides: number;
  years_experience: number;
  languages: string[];
  about?: string;
}

type TabId = 'book' | 'drivers' | 'register';

// ─── Constants ────────────────────────────────────────────────────────────────
const UDUPI_AREAS = [
  'Car Street / Temple Area', 'Manipal / Tiger Circle', 'Malpe Beach / Harbour',
  'Ajjarakadu / KC Road', 'Bannanje / City Center', 'Kinnimulki / Bypass Road',
  'Kaup / NH66', 'Kalsanka / Parkala', 'Shivalli / MAHE Area', 'Old Town',
  'Brahmagiri / Indrali', 'Katapadi / Udupi Junction', 'Padubidri / Kundapura Road',
  'Herga / Perdoor', 'Other',
];

const BOOKING_TYPES = [
  { id: 'immediate', label: 'Ride Now', icon: '⚡', desc: 'Book for immediate pickup' },
  { id: 'scheduled', label: 'Schedule', icon: '📅', desc: 'Book for later today or tomorrow' },
];

const LANGUAGES = ['Kannada', 'Tulu', 'Hindi', 'English', 'Konkani', 'Urdu'];

// ─── Fare Estimator ──────────────────────────────────────────────────────────
function estimateFare(pickup: string, drop: string): number {
  if (!pickup || !drop || pickup === drop) return 0;
  const base = 30;
  const perKm = 12;
  // Rough distance estimation based on area names (simplified)
  const distMap: Record<string, number[]> = {
    'Manipal': [6, 6], 'Malpe': [5, 5], 'Kaup': [12, 12], 'Kalsanka': [3, 3],
    'Bannanje': [1, 1], 'Car Street': [0, 0], 'Kinnimulki': [4, 4], 'Shivalli': [7, 7]
  };
  const pickupKey = Object.keys(distMap).find(k => pickup.includes(k)) || '';
  const dropKey = Object.keys(distMap).find(k => drop.includes(k)) || '';
  const d1 = distMap[pickupKey]?.[0] || 5;
  const d2 = distMap[dropKey]?.[0] || 5;
  const dist = Math.abs(d1 - d2) + 2;
  return Math.max(base, base + (dist * perKm));
}

// ─── Driver Card ─────────────────────────────────────────────────────────────
const DriverCard = ({ driver, onCall, onWhatsApp }: { driver: Driver; onCall: (d: Driver) => void; onWhatsApp: (d: Driver) => void }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl ${driver.is_available ? 'bg-brand-teal' : 'bg-gray-300'}`}>
        {driver.photo_url ? (
          <img src={driver.photo_url} alt={driver.name} className="w-full h-full object-cover rounded-2xl" />
        ) : (
          driver.name[0]
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-heading font-bold text-gray-900 text-sm">{driver.name}</h3>
          {driver.is_approved && (
            <span className="flex items-center gap-0.5 text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
              <BadgeCheck size={9} /> Verified
            </span>
          )}
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${driver.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {driver.is_available ? '🟢 Available' : '🔴 Busy'}
          </span>
        </div>

        {/* Rating row */}
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-2 py-0.5">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-amber-600">{Number(driver.rating).toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-gray-400">{driver.total_rides.toLocaleString('en-IN')} rides</span>
          <span className="text-[10px] text-gray-400">{driver.years_experience}yr exp</span>
        </div>

        {/* Area */}
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <MapPin size={10} className="text-brand-teal flex-shrink-0" />
          {driver.area}
        </p>

        {/* Vehicle */}
        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
          <Bike size={10} /> {driver.vehicle_number}
        </p>

        {/* Languages */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {driver.languages?.map(lang => (
            <span key={lang} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-medium">{lang}</span>
          ))}
        </div>

        {driver.about && (
          <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed line-clamp-2">{driver.about}</p>
        )}
      </div>
    </div>

    {/* CTAs */}
    {driver.is_available && (
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => onCall(driver)}
          className="bg-brand-teal text-white font-bold text-sm py-2.5 rounded-xl hover:bg-[#0d7a72] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Phone size={14} /> Call
        </button>
        <button
          onClick={() => onWhatsApp(driver)}
          className="bg-green-500 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-green-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle size={14} /> WhatsApp
        </button>
      </div>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const RickshawBook = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>('book');

  // ── Book form state ──
  const [form, setForm] = useState({
    passenger_name: user?.username || '',
    passenger_phone: '',
    pickup_location: '',
    drop_location: '',
    booking_type: 'immediate',
    booking_date: '',
    booking_time: '',
    notes: '',
  });

  // ── Register form state ──
  const [regForm, setRegForm] = useState({
    name: '',
    phone: '',
    vehicle_number: '',
    area: '',
    years_experience: '',
    languages: ['Kannada', 'Tulu'] as string[],
    about: '',
  });

  const [driverSearch, setDriverSearch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookedId, setBookedId] = useState('');

  // ── Queries ──
  const { data: drivers = [], isLoading: driversLoading, refetch } = useQuery({
    queryKey: ['rickshaw_drivers'],
    queryFn: async () => {
      const { data } = await supabase
        .from('rickshaw_drivers')
        .select('*')
        .eq('is_approved', true)
        .order('is_available', { ascending: false })
        .order('rating', { ascending: false });
      return (data || []) as Driver[];
    },
  });

  // ── Book mutation ──
  const bookMutation = useMutation({
    mutationFn: async () => {
      const fare = estimateFare(form.pickup_location, form.drop_location);
      const { data, error } = await supabase.from('rickshaw_bookings').insert({
        user_id: user?.id || null,
        passenger_name: form.passenger_name,
        passenger_phone: form.passenger_phone,
        pickup_location: form.pickup_location,
        drop_location: form.drop_location,
        booking_type: form.booking_type,
        booking_date: form.booking_date || null,
        booking_time: form.booking_time || null,
        notes: form.notes || null,
        status: 'pending',
        fare_estimate: fare || null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setBookedId(data.id);
      setShowSuccess(true);
      setForm({ passenger_name: user?.username || '', passenger_phone: '', pickup_location: '', drop_location: '', booking_type: 'immediate', booking_date: '', booking_time: '', notes: '' });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Register mutation ──
  const registerMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('rickshaw_drivers').insert({
        user_id: user?.id || null,
        name: regForm.name,
        phone: regForm.phone,
        vehicle_number: regForm.vehicle_number.toUpperCase(),
        area: regForm.area,
        years_experience: parseInt(regForm.years_experience) || 0,
        languages: regForm.languages,
        about: regForm.about || null,
        is_available: true,
        is_approved: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Registration submitted! We will verify and activate your profile within 24 hours.');
      qc.invalidateQueries({ queryKey: ['rickshaw_drivers'] });
      setRegForm({ name: '', phone: '', vehicle_number: '', area: '', years_experience: '', languages: ['Kannada', 'Tulu'], about: '' });
      setActiveTab('drivers');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.passenger_name || !form.passenger_phone || !form.pickup_location || !form.drop_location) {
      toast.error('Please fill in all required fields');
      return;
    }
    bookMutation.mutate();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.phone || !regForm.vehicle_number || !regForm.area) {
      toast.error('Please fill in all required fields');
      return;
    }
    registerMutation.mutate();
  };

  const handleCallDriver = (driver: Driver) => {
    window.location.href = `tel:${driver.phone}`;
  };

  const handleWhatsAppDriver = (driver: Driver) => {
    const phone = driver.phone.replace(/[\s+\-()]/g, '');
    const msg = encodeURIComponent(`Hi ${driver.name}, I need an auto-rickshaw. I found your profile on UdupiGo. Please contact me.`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const toggleLanguage = (lang: string) => {
    setRegForm(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const fareEst = estimateFare(form.pickup_location, form.drop_location);
  const availableDrivers = drivers.filter(d => d.is_available);
  const filteredDrivers = drivers.filter(d =>
    !driverSearch || d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
    d.area.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const TABS: { id: TabId; label: string; icon: string; count?: number }[] = [
    { id: 'book', label: 'Book Ride', icon: '🛺' },
    { id: 'drivers', label: 'Drivers', icon: '👤', count: availableDrivers.length },
    { id: 'register', label: 'Driver? Join', icon: '➕' },
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
            <h1 className="font-heading font-bold text-gray-900 text-lg">Book Auto-Rickshaw</h1>
            <p className="text-xs text-gray-400">Udupi · {availableDrivers.length} drivers available now</p>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowSuccess(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.id ? 'border-brand-teal text-brand-teal' : 'border-transparent text-gray-400'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? 'bg-brand-teal/15 text-brand-teal' : 'bg-green-100 text-green-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── BOOK TAB ── */}
      {activeTab === 'book' && (
        <div className="px-4 pt-4 space-y-4">
          {showSuccess ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="font-heading font-bold text-gray-900 text-xl mb-2">Booking Confirmed!</h2>
              <p className="text-gray-500 text-sm mb-1">Your booking ID: <span className="font-mono font-bold text-brand-teal">#{bookedId.slice(0, 8).toUpperCase()}</span></p>
              <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">A driver will contact you shortly on your registered number.</p>

              <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={14} className="text-amber-600" />
                  <p className="text-xs font-bold text-amber-700">What happens next?</p>
                </div>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Nearby drivers are notified of your booking</li>
                  <li>• A confirmed driver will call you within 5 minutes</li>
                  <li>• If no driver available, call directly from Drivers tab</li>
                </ul>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => { setShowSuccess(false); setActiveTab('drivers'); }}
                  className="flex-1 bg-brand-teal text-white font-bold py-3 rounded-xl text-sm"
                >
                  Find Drivers
                </button>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm"
                >
                  New Booking
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Hero banner */}
              <div className="bg-gradient-to-r from-brand-teal to-[#0d7a72] rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-32 flex items-center justify-center opacity-20 text-8xl pointer-events-none select-none">🛺</div>
                <p className="text-xs font-semibold text-white/70 mb-1">Udupi Auto</p>
                <h2 className="font-heading font-bold text-xl mb-1">Book Your Ride</h2>
                <p className="text-xs text-white/80 max-w-[200px]">Safe, affordable, and trusted rickshaw service across Udupi</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
                    <p className="font-bold text-lg">{availableDrivers.length}</p>
                    <p className="text-[9px] text-white/70">Available</p>
                  </div>
                  <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
                    <p className="font-bold text-lg">₹30+</p>
                    <p className="text-[9px] text-white/70">Starting fare</p>
                  </div>
                  <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
                    <p className="font-bold text-lg">4.7★</p>
                    <p className="text-[9px] text-white/70">Avg rating</p>
                  </div>
                </div>
              </div>

              {/* Booking type */}
              <div className="grid grid-cols-2 gap-3">
                {BOOKING_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setForm(f => ({ ...f, booking_type: type.id }))}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      form.booking_type === type.id
                        ? 'border-brand-teal bg-brand-teal/5'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <p className="font-bold text-sm text-gray-900">{type.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{type.desc}</p>
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleBook} className="space-y-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-heading font-bold text-gray-900 text-sm mb-1">Ride Details</h3>

                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Your Name *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={form.passenger_name}
                      onChange={e => setForm(f => ({ ...f, passenger_name: e.target.value }))}
                      placeholder="Full name"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 border border-transparent focus:border-brand-teal/30"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={form.passenger_phone}
                      onChange={e => setForm(f => ({ ...f, passenger_phone: e.target.value }))}
                      placeholder="+91 XXXXX XXXXX"
                      type="tel"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 border border-transparent focus:border-brand-teal/30"
                    />
                  </div>
                </div>

                {/* Pickup */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Pickup Location *</label>
                  <div className="relative">
                    <Navigation size={14} className="absolute left-3 top-3 text-brand-teal" />
                    <select
                      value={form.pickup_location}
                      onChange={e => setForm(f => ({ ...f, pickup_location: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 border border-transparent focus:border-brand-teal/30 appearance-none"
                    >
                      <option value="">Select pickup area</option>
                      {UDUPI_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                {/* Drop */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Drop Location *</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-3 text-brand-coral" />
                    <select
                      value={form.drop_location}
                      onChange={e => setForm(f => ({ ...f, drop_location: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 border border-transparent focus:border-brand-teal/30 appearance-none"
                    >
                      <option value="">Select drop area</option>
                      {UDUPI_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                {/* Fare estimate */}
                {fareEst > 0 && (
                  <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-700 font-semibold">Estimated Fare</p>
                      <p className="text-[10px] text-green-500">Actual fare may vary slightly</p>
                    </div>
                    <p className="font-heading font-bold text-green-700 text-xl">₹{fareEst}–{fareEst + 20}</p>
                  </div>
                )}

                {/* Scheduled fields */}
                {form.booking_type === 'scheduled' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Date</label>
                      <div className="relative">
                        <Calendar size={13} className="absolute left-2.5 top-3 text-gray-400" />
                        <input
                          type="date"
                          value={form.booking_date}
                          onChange={e => setForm(f => ({ ...f, booking_date: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full pl-8 pr-2 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Time</label>
                      <div className="relative">
                        <Clock size={13} className="absolute left-2.5 top-3 text-gray-400" />
                        <input
                          type="time"
                          value={form.booking_time}
                          onChange={e => setForm(f => ({ ...f, booking_time: e.target.value }))}
                          className="w-full pl-8 pr-2 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Additional Notes</label>
                  <div className="relative">
                    <FileText size={13} className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="e.g. With heavy luggage, medical trip, etc."
                      rows={2}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 resize-none border border-transparent focus:border-brand-teal/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookMutation.isPending}
                  className="w-full bg-brand-teal text-white font-bold py-3.5 rounded-xl text-sm hover:bg-[#0d7a72] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {bookMutation.isPending ? (
                    <><RefreshCw size={15} className="animate-spin" /> Booking...</>
                  ) : (
                    <><Car size={15} /> Book Auto-Rickshaw</>
                  )}
                </button>

                <p className="text-[10px] text-gray-400 text-center">You can also directly call a driver from the Drivers tab</p>
              </form>
            </>
          )}
        </div>
      )}

      {/* ── DRIVERS TAB ── */}
      {activeTab === 'drivers' && (
        <div className="px-4 pt-4 space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Drivers', value: drivers.length, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
              { label: 'Available Now', value: availableDrivers.length, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Avg Rating', value: drivers.length ? (drivers.reduce((s, d) => s + Number(d.rating), 0) / drivers.length).toFixed(1) + '★' : '-', color: 'text-amber-500', bg: 'bg-amber-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
                <p className={`font-heading font-bold text-xl ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Navigation size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={driverSearch}
              onChange={e => setDriverSearch(e.target.value)}
              placeholder="Search by name or area..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 shadow-sm"
            />
          </div>

          {driversLoading ? (
            <div className="text-center py-12">
              <RefreshCw size={24} className="animate-spin text-brand-teal mx-auto mb-2" />
              <p className="text-sm text-gray-400">Loading drivers...</p>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">🛺</p>
              <p className="font-semibold text-gray-700">No drivers found</p>
              <p className="text-sm text-gray-400 mt-1">Try a different search or check back later</p>
            </div>
          ) : (
            <>
              {/* Available first */}
              {availableDrivers.length > 0 && !driverSearch && (
                <p className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                  Available Right Now
                </p>
              )}
              {filteredDrivers.map(driver => (
                <DriverCard key={driver.id} driver={driver} onCall={handleCallDriver} onWhatsApp={handleWhatsAppDriver} />
              ))}
            </>
          )}

          {/* CTA to register */}
          <div className="bg-gradient-to-r from-brand-coral/10 to-orange-50 border border-brand-coral/20 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">🛺</p>
            <p className="font-bold text-sm text-gray-800">Are you an Auto Driver?</p>
            <p className="text-xs text-gray-500 mt-1 mb-3">Register today and get bookings from thousands of Udupi users</p>
            <button
              onClick={() => setActiveTab('register')}
              className="px-6 py-2 bg-brand-coral text-white font-bold text-xs rounded-xl hover:bg-orange-600 transition-colors"
            >
              Register as Driver →
            </button>
          </div>
        </div>
      )}

      {/* ── REGISTER TAB ── */}
      {activeTab === 'register' && (
        <div className="px-4 pt-4 space-y-4">
          {/* Hero */}
          <div className="bg-gradient-to-r from-brand-coral to-orange-500 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute right-2 top-0 bottom-0 flex items-center text-7xl opacity-20 pointer-events-none">🛺</div>
            <p className="text-xs font-semibold text-white/70 mb-1">Join UdupiGo</p>
            <h2 className="font-heading font-bold text-xl mb-1">Register as Driver</h2>
            <p className="text-xs text-white/80 max-w-xs">Get more passengers, earn more, and build your customer base in Udupi</p>
            <div className="flex gap-4 mt-3 text-center">
              {[['Free', 'Registration'], ['24hr', 'Verification'], ['100%', 'Free Platform']].map(([val, label]) => (
                <div key={label} className="bg-white/15 rounded-xl px-3 py-2">
                  <p className="font-bold text-sm">{val}</p>
                  <p className="text-[9px] text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">Your profile will be reviewed by UdupiGo team and activated within 24 hours after verification.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <h3 className="font-heading font-bold text-gray-900 text-sm">Driver Details</h3>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Full Name *</label>
              <input
                value={regForm.name}
                onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Phone Number *</label>
              <input
                value={regForm.phone}
                onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 XXXXX XXXXX"
                type="tel"
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Vehicle Registration Number *</label>
              <input
                value={regForm.vehicle_number}
                onChange={e => setRegForm(f => ({ ...f, vehicle_number: e.target.value }))}
                placeholder="KA-20-A-1234"
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 font-mono uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Primary Operating Area *</label>
              <select
                value={regForm.area}
                onChange={e => setRegForm(f => ({ ...f, area: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 appearance-none"
              >
                <option value="">Select your area</option>
                {UDUPI_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Years of Driving Experience</label>
              <input
                value={regForm.years_experience}
                onChange={e => setRegForm(f => ({ ...f, years_experience: e.target.value }))}
                placeholder="e.g. 5"
                type="number"
                min="0"
                max="50"
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Languages Spoken</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      regForm.languages.includes(lang)
                        ? 'bg-brand-teal text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">About Yourself (Optional)</label>
              <textarea
                value={regForm.about}
                onChange={e => setRegForm(f => ({ ...f, about: e.target.value }))}
                placeholder="Brief description about your service, specialty routes, etc."
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-brand-coral text-white font-bold py-3.5 rounded-xl text-sm hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {registerMutation.isPending ? (
                <><RefreshCw size={15} className="animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle size={15} /> Submit Registration</>
              )}
            </button>
          </form>

          {/* Benefits */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-heading font-bold text-gray-900 text-sm mb-3">Why Join UdupiGo?</h3>
            <div className="space-y-2.5">
              {[
                { icon: '👥', title: 'More Customers', desc: 'Reach thousands of users in Udupi instantly' },
                { icon: '⭐', title: 'Build Your Rating', desc: 'Earn reviews and grow your reputation' },
                { icon: '🆓', title: 'Completely Free', desc: 'No registration fee, no commission cuts' },
                { icon: '📱', title: 'Easy Bookings', desc: 'Passengers contact you directly via phone' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{item.title}</p>
                    <p className="text-[10px] text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default RickshawBook;
