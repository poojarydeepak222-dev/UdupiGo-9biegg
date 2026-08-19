import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, Eye, Phone, Star, PlusCircle, Edit3, Trash2, CheckCircle, Loader2, TrendingUp, Users, MessageSquare } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AuthModal from '@/components/features/AuthModal';

interface BusinessListing {
  id: string;
  name: string;
  category: string;
  description: string;
  phone: string;
  address: string;
  area: string;
  is_active: boolean;
  profile_views: number;
  lead_count: number;
  created_at: string;
}

const CATEGORIES = ['Restaurants', 'Doctors', 'Hotels', 'Beauty & Salon', 'Education', 'Travel', 'Gym', 'Shopping', 'Services', 'Others'];

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [authOpen, setAuthOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: 'Restaurants', description: '', phone: '', address: '', area: '' });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['my_businesses', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_listings')
        .select('*')
        .eq('owner_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as BusinessListing[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase.from('business_listings').insert({
        owner_id: user.id,
        name: form.name,
        category: form.category,
        description: form.description,
        phone: form.phone,
        address: form.address,
        area: form.area,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Business listed successfully!');
      setShowForm(false);
      setForm({ name: '', category: 'Restaurants', description: '', phone: '', address: '', area: '' });
      qc.invalidateQueries({ queryKey: ['my_businesses', user?.id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('business_listings').update({ is_active: active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Status updated!');
      qc.invalidateQueries({ queryKey: ['my_businesses', user?.id] });
    },
  });

  const totalViews = listings.reduce((s, l) => s + (l.profile_views || 0), 0);
  const totalLeads = listings.reduce((s, l) => s + (l.lead_count || 0), 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8 text-center pb-24">
        <div className="w-20 h-20 bg-brand-teal/10 rounded-3xl flex items-center justify-center mb-4">
          <BarChart2 size={36} className="text-brand-teal" />
        </div>
        <h2 className="font-heading font-bold text-gray-900 text-xl mb-2">Business Dashboard</h2>
        <p className="text-gray-500 text-sm mb-6">Sign in to manage your listed businesses, view analytics, and respond to leads.</p>
        <button onClick={() => setAuthOpen(true)} className="bg-brand-teal text-white font-bold px-8 py-3.5 rounded-xl hover:bg-brand-teal-dark">
          Sign In to Continue
        </button>
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
            <h1 className="font-heading font-bold text-gray-900 text-lg">Business Dashboard</h1>
            <p className="text-xs text-gray-500">Hello, {user.username} 👋</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-brand-teal text-white text-xs font-bold px-3 py-2 rounded-xl">
            <PlusCircle size={14} /> Add
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="px-4 pt-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Businesses', value: listings.length, icon: BarChart2, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
          { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Total Leads', value: totalLeads, icon: TrendingUp, color: 'text-brand-coral', bg: 'bg-orange-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <Icon size={18} className={color} />
            </div>
            <p className="font-heading font-bold text-gray-900 text-lg leading-tight">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Performance chart (visual) */}
      {listings.length > 0 && (
        <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-brand-teal" />
            <h3 className="font-heading font-semibold text-gray-900 text-sm">Performance Overview</h3>
          </div>
          <div className="flex items-end gap-2 h-16">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const heights = [40, 65, 45, 80, 55, 90, 70];
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg bg-brand-teal/20 relative" style={{ height: `${heights[i]}%` }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-brand-teal rounded-t-lg" style={{ height: `${30 + i * 5}%` }} />
                  </div>
                  <span className="text-[9px] text-gray-400">{day}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-brand-teal" /><span className="text-xs text-gray-500">Profile Views</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-brand-teal/20" /><span className="text-xs text-gray-500">Calls</span></div>
          </div>
        </div>
      )}

      {/* Business listings */}
      <div className="px-4 mt-4 space-y-3">
        <h2 className="font-heading font-semibold text-gray-900 text-sm">My Businesses</h2>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-brand-teal" /></div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
            <BarChart2 size={36} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-gray-700 text-base mb-1">No businesses yet</h3>
            <p className="text-gray-500 text-xs mb-4">List your first business to start getting leads</p>
            <button onClick={() => setShowForm(true)} className="bg-brand-teal text-white font-bold px-6 py-2.5 rounded-xl text-sm">
              + List Business
            </button>
          </div>
        ) : (
          listings.map(listing => (
            <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold text-gray-900 text-sm truncate">{listing.name}</h3>
                    {listing.is_active && <CheckCircle size={14} className="text-green-500 flex-shrink-0" />}
                  </div>
                  <span className="text-[10px] bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded-full inline-block mt-1">{listing.category}</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => toggleActiveMutation.mutate({ id: listing.id, active: !listing.is_active })}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${listing.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {listing.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              {listing.description && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{listing.description}</p>
              )}

              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { label: 'Views', value: listing.profile_views || 0, icon: Eye, color: 'text-blue-500' },
                  { label: 'Leads', value: listing.lead_count || 0, icon: Users, color: 'text-brand-coral' },
                  { label: 'Reviews', value: 0, icon: MessageSquare, color: 'text-amber-500' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-2 text-center">
                    <Icon size={14} className={`${color} mx-auto mb-0.5`} />
                    <p className="font-bold text-sm text-gray-900">{value}</p>
                    <p className="text-[10px] text-gray-500">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { setForm({ name: listing.name, category: listing.category, description: listing.description || '', phone: listing.phone || '', address: listing.address || '', area: listing.area || '' }); setEditingId(listing.id); setShowForm(true); }}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-brand-teal text-brand-teal rounded-xl py-2 text-xs font-semibold"
                >
                  <Edit3 size={12} /> Edit
                </button>
                {listing.phone && (
                  <a href={`tel:${listing.phone}`} className="flex-1 flex items-center justify-center gap-1.5 bg-brand-teal/10 text-brand-teal rounded-xl py-2 text-xs font-semibold">
                    <Phone size={12} /> Call
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add business form */}
      {showForm && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => { setShowForm(false); setEditingId(null); }} />
          <div className="fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto pb-8" style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <h2 className="font-heading font-bold text-gray-900 text-lg">{editingId ? 'Edit Business' : 'List New Business'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-2 rounded-full hover:bg-gray-100">✕</button>
            </div>
            <div className="px-5 pt-4 space-y-3">
              {[
                { label: 'Business Name *', field: 'name', placeholder: 'e.g. Hotel Shree Udupi' },
                { label: 'Phone', field: 'phone', placeholder: '+91 98765 43210' },
                { label: 'Address', field: 'address', placeholder: 'Street, Area, Udupi' },
                { label: 'Area', field: 'area', placeholder: 'e.g. Car Street, Manipal' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input type="text" value={(form as Record<string, string>)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-teal" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-teal">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Tell customers about your business..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-teal resize-none" />
              </div>
              <button onClick={() => createMutation.mutate()} disabled={!form.name || createMutation.isPending}
                className="w-full bg-brand-teal text-white font-bold py-3.5 rounded-xl hover:bg-brand-teal-dark disabled:opacity-50 flex items-center justify-center gap-2">
                {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                {editingId ? 'Update Business' : 'List Business — FREE'}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      <BottomNav />
    </div>
  );
};

export default BusinessDashboard;
