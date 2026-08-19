import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, IndianRupee, Clock, CheckCircle, XCircle, PhoneCall, Plus, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { useAuthStore } from '@/hooks/useAuth';
import AuthModal from '@/components/features/AuthModal';
import { toast } from 'sonner';

const MOCK_QUOTES = [
  { id: 'Q001', business: 'Coastal Packers & Movers', service: 'Home Shifting — 2BHK', requestedOn: 'Jun 12, 2026', estimatedPrice: '₹8,500 – ₹12,000', status: 'received', phone: '+91 82020 01234', note: 'Includes packing material, loading, transport, unloading within Udupi city.' },
  { id: 'Q002', business: 'Shubhamangala Catering', service: 'Wedding Catering — 300 guests', requestedOn: 'Jun 10, 2026', estimatedPrice: '₹1,80,000', status: 'accepted', phone: '+91 94480 12345', note: 'Banana leaf meals for lunch, South Indian full menu. Includes setup and serving staff.' },
  { id: 'Q003', business: 'Glamour Zone Salon', service: 'Bridal Makeup Package', requestedOn: 'Jun 8, 2026', estimatedPrice: '₹6,000 – ₹9,000', status: 'pending', phone: '+91 82020 89012', note: 'Includes bridal makeup, hairstyling and mehndi for the bride.' },
  { id: 'Q004', business: 'Coastal Properties Udupi', service: '2BHK Apartment Rental — Near City Center', requestedOn: 'Jun 5, 2026', estimatedPrice: '₹14,000/month', status: 'expired', phone: '+91 82022 37400', note: 'Semi-furnished, 2nd floor, parking available. 11-month agreement.' },
  { id: 'Q005', business: 'Pai Computers & Electronics', service: 'Laptop Repair — Screen Replacement', requestedOn: 'Jun 1, 2026', estimatedPrice: '₹3,500 – ₹5,500', status: 'received', phone: '+91 82022 28900', note: 'Dell Inspiron 15 series screen replacement with 3-month warranty.' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Awaiting Quote', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  received: { label: 'Quote Received', color: 'text-blue-600', bg: 'bg-blue-50', icon: IndianRupee },
  accepted: { label: 'Accepted', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
  expired: { label: 'Expired', color: 'text-gray-500', bg: 'bg-gray-100', icon: XCircle },
};

type FilterTab = 'all' | 'pending' | 'received' | 'accepted';

const Quotes = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filtered = activeTab === 'all' ? MOCK_QUOTES : MOCK_QUOTES.filter(q => q.status === activeTab);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8 text-center pb-24">
        <div className="w-20 h-20 bg-brand-teal/10 rounded-3xl flex items-center justify-center mb-4">
          <IndianRupee size={36} className="text-brand-teal" />
        </div>
        <h2 className="font-heading font-bold text-gray-900 text-xl mb-2">Manage Quotes</h2>
        <p className="text-gray-500 text-sm mb-6">Sign in to view and manage price quotes from local businesses in Udupi.</p>
        <button onClick={() => setAuthOpen(true)} className="bg-brand-teal text-white font-bold px-8 py-3.5 rounded-xl">Sign In</button>
        <BottomNav />
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-gray-900 text-lg">Manage Quotes</h1>
            <p className="text-xs text-gray-500">{MOCK_QUOTES.filter(q => q.status === 'received').length} quotes received</p>
          </div>
          <button onClick={() => navigate('/search')} className="flex items-center gap-1.5 bg-brand-teal text-white text-xs font-bold px-3 py-2 rounded-xl">
            <Plus size={14} /> Request Quote
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 px-4 pb-3">
          {[
            { label: 'Total', value: MOCK_QUOTES.length, color: 'text-gray-900' },
            { label: 'Pending', value: MOCK_QUOTES.filter(q => q.status === 'pending').length, color: 'text-amber-500' },
            { label: 'Received', value: MOCK_QUOTES.filter(q => q.status === 'received').length, color: 'text-blue-600' },
            { label: 'Accepted', value: MOCK_QUOTES.filter(q => q.status === 'accepted').length, color: 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-2 text-center">
              <p className={`font-bold text-base ${color}`}>{value}</p>
              <p className="text-[10px] text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {(['all', 'pending', 'received', 'accepted'] as FilterTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-600'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Quote Cards */}
      <div className="px-4 py-4 space-y-4">
        {filtered.map(quote => {
          const statusCfg = STATUS_CONFIG[quote.status];
          const StatusIcon = statusCfg.icon;
          return (
            <div key={quote.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-gray-900 text-sm">{quote.business}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{quote.service}</p>
                </div>
                <span className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusCfg.bg} ${statusCfg.color}`}>
                  <StatusIcon size={10} />{statusCfg.label}
                </span>
              </div>

              {quote.estimatedPrice && (
                <div className="bg-gray-50 rounded-xl px-3 py-2 mb-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Estimated Price</span>
                  <span className="font-heading font-bold text-brand-teal text-sm">{quote.estimatedPrice}</span>
                </div>
              )}

              <p className="text-xs text-gray-600 leading-relaxed mb-3">{quote.note}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={11} />
                  <span>Requested {quote.requestedOn}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">#{quote.id}</span>
              </div>

              <div className="flex gap-2 mt-3">
                <a href={`tel:${quote.phone}`} className="flex-1 flex items-center justify-center gap-1.5 bg-brand-teal text-white rounded-xl py-2 text-xs font-semibold">
                  <PhoneCall size={12} /> Call Business
                </a>
                {quote.status === 'received' && (
                  <button onClick={() => toast.success('Quote accepted!')} className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 text-green-600 rounded-xl py-2 text-xs font-semibold">
                    <CheckCircle size={12} /> Accept Quote
                  </button>
                )}
                {quote.status === 'pending' && (
                  <button onClick={() => toast.info('Reminder sent to business!')} className="flex-1 flex items-center justify-center gap-1.5 border border-brand-teal text-brand-teal rounded-xl py-2 text-xs font-semibold">
                    Send Reminder
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <IndianRupee size={40} className="text-gray-200 mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-gray-700">No quotes found</h3>
            <p className="text-gray-500 text-sm mt-1">Request quotes from businesses you're interested in.</p>
            <button onClick={() => navigate('/search')} className="mt-4 bg-brand-teal text-white font-bold px-6 py-2.5 rounded-xl text-sm">Browse Businesses</button>
          </div>
        )}

        {/* How to request */}
        <div className="bg-brand-teal/5 border border-brand-teal/10 rounded-2xl p-4">
          <h3 className="font-semibold text-sm text-gray-900 mb-2">How to Request a Quote?</h3>
          {['Find a business in search results', 'Open their detail page', 'Tap "Get Quote" button', 'Fill your requirements and submit'].map((step, i) => (
            <div key={i} className="flex items-center gap-2 mt-1.5">
              <span className="w-5 h-5 bg-brand-teal rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">{i + 1}</span>
              <span className="text-xs text-gray-600">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Quotes;
