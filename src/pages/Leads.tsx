import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, PhoneCall, Star, Users, ChevronRight, Bell } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { useAuthStore } from '@/hooks/useAuth';
import AuthModal from '@/components/features/AuthModal';
import { toast } from 'sonner';

const MOCK_LEADS = [
  { id: 1, name: 'Ramesh Kumar', phone: '+91 98765 43210', service: 'Hotel Booking', time: '2 min ago', status: 'new' },
  { id: 2, name: 'Priya Shetty', phone: '+91 87654 32109', service: 'Restaurant Query', time: '1 hr ago', status: 'contacted' },
  { id: 3, name: 'Suresh Nayak', phone: '+91 76543 21098', service: 'Doctor Appointment', time: '3 hr ago', status: 'new' },
  { id: 4, name: 'Kavitha Rao', phone: '+91 65432 10987', service: 'Salon Booking', time: '1 day ago', status: 'completed' },
  { id: 5, name: 'Mohan Hegde', phone: '+91 54321 09876', service: 'Travel Inquiry', time: '2 days ago', status: 'contacted' },
];

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-brand-coral/10 text-brand-coral' },
  contacted: { label: 'Contacted', color: 'bg-blue-50 text-blue-600' },
  completed: { label: 'Completed', color: 'bg-green-50 text-green-600' },
};

const Leads = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8 text-center pb-24">
        <div className="w-20 h-20 bg-brand-teal/10 rounded-3xl flex items-center justify-center mb-4">
          <TrendingUp size={36} className="text-brand-teal" />
        </div>
        <h2 className="font-heading font-bold text-gray-900 text-xl mb-2">My Leads</h2>
        <p className="text-gray-500 text-sm mb-6">Sign in to manage leads from customers who are looking for your services.</p>
        <button onClick={() => setAuthOpen(true)} className="bg-brand-teal text-white font-bold px-8 py-3.5 rounded-xl">Sign In</button>
        <BottomNav />
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  const filtered = activeFilter === 'all' ? MOCK_LEADS : MOCK_LEADS.filter(l => l.status === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-gray-900 text-lg">My Leads</h1>
            <p className="text-xs text-gray-500">{MOCK_LEADS.filter(l => l.status === 'new').length} new leads</p>
          </div>
          <button onClick={() => toast.info('Notifications configured!')} className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-coral rounded-full" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 px-4 pb-3">
          {[
            { label: 'Total', value: MOCK_LEADS.length, color: 'text-gray-900' },
            { label: 'New', value: MOCK_LEADS.filter(l => l.status === 'new').length, color: 'text-brand-coral' },
            { label: 'Completed', value: MOCK_LEADS.filter(l => l.status === 'completed').length, color: 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
              <p className={`font-bold text-base ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 px-4 pb-3">
          {['all', 'new', 'contacted', 'completed'].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${activeFilter === f ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-600'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {filtered.map(lead => (
          <div key={lead.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                  <span className="font-bold text-brand-teal text-sm">{lead.name[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{lead.name}</p>
                  <p className="text-xs text-gray-500">{lead.service}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG].color}`}>
                  {STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG].label}
                </span>
                <span className="text-[10px] text-gray-400">{lead.time}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <a href={`tel:${lead.phone}`} className="flex-1 flex items-center justify-center gap-1.5 bg-brand-teal text-white rounded-xl py-2 text-xs font-semibold">
                <PhoneCall size={12} /> Call
              </a>
              <button onClick={() => toast.success('Lead marked as contacted!')} className="flex-1 flex items-center justify-center gap-1.5 border border-brand-teal text-brand-teal rounded-xl py-2 text-xs font-semibold">
                Mark Contacted
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Leads;
