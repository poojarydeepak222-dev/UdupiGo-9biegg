import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Building2, Phone, Mail, MapPin, Loader2, BadgeCheck, ChevronRight, Plus, Tag, X } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AuthModal from '@/components/features/AuthModal';

const B2B_CATEGORIES = [
  'All', 'Food & Beverages', 'Construction', 'IT & Software', 'Textiles', 'Agriculture',
  'Healthcare', 'Education', 'Logistics', 'Manufacturing', 'Retail', 'Services',
];

interface B2BListing {
  id: string;
  company_name: string;
  category: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  location: string;
  tags: string[];
  is_verified: boolean;
  created_at: string;
  user_profiles?: { username: string };
}

const B2B = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [inquiryTarget, setInquiryTarget] = useState<B2BListing | null>(null);
  const [form, setForm] = useState({ company_name: '', category: 'Food & Beverages', description: '', contact_email: '', contact_phone: '', location: '', tags: [] as string[], tagInput: '' });
  const [inquiry, setInquiry] = useState({ name: '', email: '', phone: '', message: '' });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['b2b_listings', activeCategory, searchText],
    queryFn: async () => {
      let q = supabase.from('b2b_listings').select('*, user_profiles(username)').order('created_at', { ascending: false });
      if (activeCategory !== 'All') q = q.eq('category', activeCategory);
      if (searchText) q = q.ilike('company_name', `%${searchText}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as B2BListing[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Login required');
      const { error } = await supabase.from('b2b_listings').insert({
        user_id: user.id,
        company_name: form.company_name,
        category: form.category,
        description: form.description,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        location: form.location,
        tags: form.tags,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Business listed on B2B marketplace!');
      setShowForm(false);
      setForm({ company_name: '', category: 'Food & Beverages', description: '', contact_email: '', contact_phone: '', location: '', tags: [], tagInput: '' });
      qc.invalidateQueries({ queryKey: ['b2b_listings'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const inquiryMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('b2b_inquiries').insert({
        listing_id: inquiryTarget!.id,
        sender_id: user?.id || null,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Inquiry sent successfully!');
      setInquiryTarget(null);
      setInquiry({ name: '', email: '', phone: '', message: '' });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const addTag = () => {
    const t = form.tagInput.trim();
    if (t && !form.tags.includes(t) && form.tags.length < 5) {
      setForm(f => ({ ...f, tags: [...f.tags, t], tagInput: '' }));
    }
  };

  // Mock listings for initial view
  const MOCK_B2B = [
    { id: 'm1', company_name: 'Udupi Spice Exports', category: 'Food & Beverages', description: 'Premium quality spices sourced from coastal Karnataka. Wholesale and export.', contact_email: 'spice@udupi.com', contact_phone: '+91 82020 11111', location: 'Udupi', tags: ['Spices', 'Export', 'Wholesale'], is_verified: true, created_at: '', user_profiles: { username: 'spiceking' } },
    { id: 'm2', company_name: 'Coastal Constructions', category: 'Construction', description: 'Building contractor for residential and commercial projects in Udupi district.', contact_email: 'build@coastal.com', contact_phone: '+91 82020 22222', location: 'Udupi', tags: ['Construction', 'Contractor', 'Civil'], is_verified: false, created_at: '', user_profiles: { username: 'coastal_build' } },
    { id: 'm3', company_name: 'TechManipal Solutions', category: 'IT & Software', description: 'Custom software development, web and mobile apps for Udupi businesses.', contact_email: 'tech@manipal.com', contact_phone: '+91 82020 33333', location: 'Manipal', tags: ['Software', 'Web', 'Mobile'], is_verified: true, created_at: '', user_profiles: { username: 'techmanipal' } },
    { id: 'm4', company_name: 'Malpe Fisheries Co-op', category: 'Food & Beverages', description: 'Fresh seafood supplier — tuna, sardine, pomfret, prawns. Bulk orders welcome.', contact_email: 'fish@malpe.com', contact_phone: '+91 82020 44444', location: 'Malpe, Udupi', tags: ['Seafood', 'Fish', 'Export'], is_verified: true, created_at: '', user_profiles: { username: 'malpe_fish' } },
  ];

  const displayListings: B2BListing[] = listings.length > 0 ? listings : (MOCK_B2B as unknown as B2BListing[]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-gray-900 text-lg">B2B Marketplace</h1>
            <p className="text-xs text-gray-500">Connect with Udupi businesses</p>
          </div>
          <button
            onClick={() => { if (!user) { setAuthOpen(true); return; } setShowForm(true); }}
            className="flex items-center gap-1.5 bg-brand-teal text-white text-xs font-bold px-3 py-2 rounded-xl"
          >
            <Plus size={14} /> List Business
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search companies, products..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/30"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="overflow-x-auto scrollbar-hide px-4 pb-3">
          <div className="flex gap-2" style={{ width: 'max-content' }}>
            {B2B_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${activeCategory === cat ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-600'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero stats */}
      <div className="mx-4 my-4 bg-gradient-to-r from-brand-teal to-[#0d7a72] rounded-2xl p-4 text-white">
        <h3 className="font-heading font-bold text-base">Udupi B2B Hub</h3>
        <p className="text-white/80 text-xs mt-0.5 mb-3">Connect with 500+ verified suppliers & buyers</p>
        <div className="grid grid-cols-3 gap-3">
          {[['500+', 'Suppliers'], ['1Cr+', 'Transactions'], ['50+', 'Categories']].map(([v, l]) => (
            <div key={l} className="bg-white/15 rounded-xl p-2.5 text-center">
              <p className="font-heading font-bold text-base">{v}</p>
              <p className="text-white/70 text-[10px]">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="px-4 space-y-3 pb-4">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-brand-teal" /></div>
        ) : displayListings.length === 0 ? (
          <div className="text-center py-16">
            <Building2 size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No listings found. Be the first to list!</p>
          </div>
        ) : displayListings.map(listing => (
          <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-heading font-semibold text-gray-900 text-sm">{listing.company_name}</h3>
                  {listing.is_verified && <BadgeCheck size={14} className="text-brand-teal flex-shrink-0" />}
                </div>
                <span className="text-[10px] bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded-full font-medium mt-1 inline-block">{listing.category}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <MapPin size={11} className="text-gray-400" />
                <span className="text-xs text-gray-500">{listing.location}</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-2">{listing.description}</p>
            {listing.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {listing.tags.map(t => (
                  <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Tag size={8} />{t}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <a href={`tel:${listing.contact_phone}`} className="flex-1 flex items-center justify-center gap-1.5 bg-brand-teal/10 text-brand-teal rounded-xl py-2 text-xs font-semibold">
                <Phone size={12} /> Call
              </a>
              <button
                onClick={() => setInquiryTarget(listing)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-brand-coral/10 text-brand-coral rounded-xl py-2 text-xs font-semibold"
              >
                <Mail size={12} /> Send Inquiry
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* List business form */}
      {showForm && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setShowForm(false)} />
          <div className="fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto pb-8" style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <h2 className="font-heading font-bold text-gray-900 text-lg">List Your Business</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="px-5 pt-4 space-y-3">
              {[
                { label: 'Company Name *', field: 'company_name', placeholder: 'Your company name' },
                { label: 'Email', field: 'contact_email', placeholder: 'business@email.com' },
                { label: 'Phone', field: 'contact_phone', placeholder: '+91 98765 43210' },
                { label: 'Location', field: 'location', placeholder: 'City, Area' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input type="text" value={(form as Record<string, unknown>)[field] as string} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-teal" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-teal">
                  {B2B_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Tell buyers about your business..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-teal resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tags (up to 5)</label>
                <div className="flex gap-2">
                  <input type="text" value={form.tagInput} onChange={e => setForm(f => ({ ...f, tagInput: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}} placeholder="Add tag + Enter"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-teal" />
                  <button type="button" onClick={addTag} className="px-3 py-2 bg-brand-teal text-white rounded-xl text-sm font-medium">Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tags.map(t => (
                    <span key={t} className="flex items-center gap-1 text-xs bg-brand-teal/10 text-brand-teal px-2.5 py-1 rounded-full">
                      {t}
                      <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))}><X size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => createMutation.mutate()} disabled={!form.company_name || createMutation.isPending}
                className="w-full bg-brand-teal text-white font-bold py-3.5 rounded-xl hover:bg-brand-teal-dark disabled:opacity-50 flex items-center justify-center gap-2">
                {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                Publish Listing
              </button>
            </div>
          </div>
        </>
      )}

      {/* Inquiry modal */}
      {inquiryTarget && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setInquiryTarget(null)} />
          <div className="fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-3xl shadow-2xl pb-8" style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h2 className="font-heading font-bold text-gray-900 text-lg">Send Inquiry</h2>
                <p className="text-xs text-gray-500">To: {inquiryTarget.company_name}</p>
              </div>
              <button onClick={() => setInquiryTarget(null)} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="px-5 pt-4 space-y-3">
              {[
                { label: 'Your Name', field: 'name', placeholder: 'Full name' },
                { label: 'Email', field: 'email', placeholder: 'your@email.com' },
                { label: 'Phone', field: 'phone', placeholder: '+91 98765 43210' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input type="text" value={(inquiry as Record<string, string>)[field]} onChange={e => setInquiry(i => ({ ...i, [field]: e.target.value }))} placeholder={placeholder}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-teal" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Message *</label>
                <textarea value={inquiry.message} onChange={e => setInquiry(i => ({ ...i, message: e.target.value }))} rows={3} placeholder="Describe your requirements..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-teal resize-none" />
              </div>
              <button onClick={() => inquiryMutation.mutate()} disabled={!inquiry.name || !inquiry.message || inquiryMutation.isPending}
                className="w-full bg-brand-coral text-white font-bold py-3.5 rounded-xl hover:bg-[#c0410f] disabled:opacity-50 flex items-center justify-center gap-2">
                {inquiryMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                Send Inquiry
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      <BottomNav />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
};

export default B2B;
