import { useState } from 'react';
import { ArrowLeft, Phone, MessageCircle, Search, MapPin, Star, Droplets, Clock, CheckCircle, Shield, AlertTriangle, BadgeCheck, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_BUSINESSES } from '@/constants/businesses';
import { Business } from '@/types';
import BottomNav from '@/components/layout/BottomNav';

const PLUMBERS = MOCK_BUSINESSES.filter(b => b.category === 'plumbers');
const AREAS = ['All Areas', ...Array.from(new Set(PLUMBERS.map(b => b.area).filter(Boolean)))];

const SERVICE_TAGS = [
  'Pipe Repair', 'Water Leak', 'Bathroom Fitting', 'Drain Cleaning',
  'Waterproofing', 'RO Installation', 'Tank Cleaning', 'Borewell',
  '24/7 Emergency', 'Gas Pipeline', 'Solar Water', 'Geyser',
];

const PlumberCard = ({ biz }: { biz: Business }) => {
  const handleCall = () => { window.location.href = `tel:${biz.phone}`; };
  const handleWhatsApp = () => {
    const phone = biz.phone.replace(/[\s+\-()]/g, '');
    const msg = encodeURIComponent(`Hi, I need plumbing service. I found ${biz.name} on UdupiGo. Please let me know your availability.`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex gap-3 p-4">
        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl">🔧</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-heading font-bold text-gray-900 text-sm truncate">{biz.name}</h3>
            {biz.isVerified && (
              <span className="flex items-center gap-0.5 text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                <BadgeCheck size={9} /> Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-2 py-0.5">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-amber-600">{biz.rating.toFixed(1)}</span>
            </div>
            <span className="text-[10px] text-gray-400">({biz.reviewCount} reviews)</span>
            {!biz.isClosed && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">Open</span>}
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
            <MapPin size={10} className="text-brand-teal flex-shrink-0" />
            {biz.address}
          </p>
          {biz.openTime && (
            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
              <Clock size={9} /> {biz.openTime} – {biz.closeTime}
            </p>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {biz.tags?.slice(0, 4).map(tag => (
              <span key={tag} className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded-md font-medium">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {biz.description && (
        <p className="px-4 pb-2 text-[10px] text-gray-400 leading-relaxed line-clamp-2">{biz.description}</p>
      )}

      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        <button onClick={handleCall}
          className="bg-blue-500 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <Phone size={14} /> Call Now
        </button>
        <button onClick={handleWhatsApp}
          className="bg-green-500 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-green-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <MessageCircle size={14} /> WhatsApp
        </button>
      </div>
    </div>
  );
};

const Plumbers = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [selectedTag, setSelectedTag] = useState('');
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  const filtered = PLUMBERS.filter(b => {
    const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.address.toLowerCase().includes(search.toLowerCase());
    const matchArea = selectedArea === 'All Areas' || b.area === selectedArea;
    const matchTag = !selectedTag || b.tags?.some(t => t.toLowerCase().includes(selectedTag.toLowerCase()));
    const matchOpen = !showOpenOnly || !b.isClosed;
    return matchSearch && matchArea && matchTag && matchOpen;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!a.isClosed && b.isClosed) return -1;
    if (a.isClosed && !b.isClosed) return 1;
    return b.rating - a.rating;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-gray-900 text-lg">Plumbers in Udupi</h1>
            <p className="text-xs text-gray-400">{PLUMBERS.length} verified plumbers</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🔧</div>
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search plumbers..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400/20" />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-28 opacity-15 flex items-center justify-center text-8xl pointer-events-none select-none">🔧</div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-white/80" />
            <p className="text-xs font-bold text-white/80">EMERGENCY SERVICE</p>
          </div>
          <h2 className="font-heading font-bold text-xl mb-1">Plumbing Services</h2>
          <p className="text-xs text-white/80 max-w-xs mb-3">Pipe leaks, drain cleaning, bathroom fittings, waterproofing — trusted plumbers in Udupi</p>
          <div className="flex gap-3">
            {[
              [PLUMBERS.length.toString(), 'Plumbers'],
              [PLUMBERS.filter(b => b.isVerified).length.toString(), 'Verified'],
              [PLUMBERS.filter(b => !b.isClosed).length.toString(), 'Available'],
            ].map(([v, l]) => (
              <div key={l} className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
                <p className="font-bold text-sm">{v}</p>
                <p className="text-[9px] text-white/70">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency tip */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
          <Droplets size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-blue-700">Water Leak Emergency?</p>
            <p className="text-[10px] text-blue-600 mt-0.5">First close the main water valve to prevent flooding, then call a plumber immediately.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowOpenOnly(!showOpenOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold flex-shrink-0 transition-colors ${showOpenOnly ? 'bg-green-500 text-white border-green-500' : 'bg-white border-gray-200 text-gray-600'}`}>
              <CheckCircle size={11} /> Open Now
            </button>
            <div className="overflow-x-auto flex gap-2 pb-0.5 scrollbar-hide">
              {AREAS.map(area => (
                <button key={area} onClick={() => setSelectedArea(area)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${selectedArea === area ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-200 text-gray-600'}`}>
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto flex gap-2 pb-1 scrollbar-hide">
            <button onClick={() => setSelectedTag('')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${!selectedTag ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-200 text-gray-600'}`}>
              All Services
            </button>
            {SERVICE_TAGS.map(tag => (
              <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${selectedTag === tag ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-200 text-gray-600'}`}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500 font-semibold">{sorted.length} plumbers found</p>

        {sorted.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">🔧</p>
            <p className="font-semibold text-gray-700">No plumbers found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(biz => <PlumberCard key={biz.id} biz={biz} />)}
          </div>
        )}

        {/* Safety tips */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-blue-500" />
            <h3 className="font-heading font-bold text-gray-900 text-sm">Plumbing Maintenance Tips</h3>
          </div>
          <div className="space-y-2">
            {[
              'Check for leaks under sinks and around toilets monthly',
              'Clean water tanks every 6 months to prevent contamination',
              'Use drain strainers to prevent hair and debris blockages',
              'Inspect water heater pressure relief valve annually',
              'Know the location of your main water shut-off valve',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-[10px] text-gray-500">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Plumbers;
