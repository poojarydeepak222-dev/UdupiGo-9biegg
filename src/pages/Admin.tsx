import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, LogOut, BarChart3, Building2, Package, Handshake, Users,
  Star, CheckCircle, XCircle, Eye, Trash2, Search, RefreshCw,
  TrendingUp, BadgeCheck, AlertCircle, ChevronRight, Lock, Home, Phone, MapPin
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MOCK_BUSINESSES } from '@/constants/businesses';

const ADMIN_PASSWORD = 'UdupiGo@Admin2026';
const STORAGE_KEY = 'udupigo_admin_auth';

// ─── Types ──────────────────────────────────────────────────────────────────
interface DBBusiness {
  id: string; name: string; category: string; address?: string;
  phone?: string; is_verified: boolean; is_active: boolean;
  profile_views: number; lead_count: number; created_at: string;
  owner_id: string;
}
interface DBProduct {
  id: string; title: string; category: string; price: number;
  condition: string; area: string; is_sold: boolean; views: number;
  created_at: string; seller_id: string; phone?: string; images?: string[];
}
interface DBB2B {
  id: string; company_name: string; category: string; location?: string;
  contact_email?: string; contact_phone?: string; is_verified: boolean; created_at: string;
}
interface DBUser {
  id: string; username?: string; email: string;
}
interface DBReview {
  id: string; business_id: string; rating: number; comment?: string; created_at: string;
  user_id: string;
}

// ─── Admin Panel ─────────────────────────────────────────────────────────────
const Admin = () => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(() => sessionStorage.getItem(STORAGE_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'businesses' | 'products' | 'b2b' | 'users' | 'reviews'>('dashboard');
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setIsAuth(true);
      setPwError('');
    } else {
      setPwError('Incorrect password. Please try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAuth(false);
    setPassword('');
  };

  // ── Queries ──
  const { data: businesses = [], isLoading: bLoading, refetch: refetchB } = useQuery({
    queryKey: ['admin_businesses'],
    enabled: isAuth,
    queryFn: async () => {
      const { data } = await supabase.from('business_listings').select('*').order('created_at', { ascending: false });
      return (data || []) as DBBusiness[];
    },
  });

  const { data: products = [], isLoading: pLoading, refetch: refetchP } = useQuery({
    queryKey: ['admin_products'],
    enabled: isAuth,
    queryFn: async () => {
      const { data } = await supabase.from('used_products').select('*').order('created_at', { ascending: false });
      return (data || []) as DBProduct[];
    },
  });

  const { data: b2bListings = [], isLoading: b2bLoading, refetch: refetchB2B } = useQuery({
    queryKey: ['admin_b2b'],
    enabled: isAuth,
    queryFn: async () => {
      const { data } = await supabase.from('b2b_listings').select('*').order('created_at', { ascending: false });
      return (data || []) as DBB2B[];
    },
  });

  const { data: users = [], isLoading: uLoading, refetch: refetchU } = useQuery({
    queryKey: ['admin_users'],
    enabled: isAuth,
    queryFn: async () => {
      const { data } = await supabase.from('user_profiles').select('*').order('id', { ascending: false }).limit(100);
      return (data || []) as DBUser[];
    },
  });

  const { data: reviews = [], isLoading: rLoading, refetch: refetchR } = useQuery({
    queryKey: ['admin_reviews'],
    enabled: isAuth,
    queryFn: async () => {
      const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(200);
      return (data || []) as DBReview[];
    },
  });

  // ── Mutations ──
  const verifyBusiness = useMutation({
    mutationFn: async ({ id, val }: { id: string; val: boolean }) => {
      const { error } = await supabase.from('business_listings').update({ is_verified: val }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['admin_businesses'] }); },
  });

  const deleteBusiness = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('business_listings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Business removed'); qc.invalidateQueries({ queryKey: ['admin_businesses'] }); },
  });

  const verifyB2B = useMutation({
    mutationFn: async ({ id, val }: { id: string; val: boolean }) => {
      const { error } = await supabase.from('b2b_listings').update({ is_verified: val }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('B2B status updated'); qc.invalidateQueries({ queryKey: ['admin_b2b'] }); },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('used_products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Product removed'); qc.invalidateQueries({ queryKey: ['admin_products'] }); },
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Review deleted'); qc.invalidateQueries({ queryKey: ['admin_reviews'] }); },
  });

  // ── Stats ──
  const stats = [
    { label: 'Mock Businesses', value: MOCK_BUSINESSES.length, icon: Building2, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
    { label: 'DB Businesses', value: businesses.length, icon: BadgeCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Registered Users', value: users.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Used Products', value: products.length, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'B2B Listings', value: b2bListings.length, icon: Handshake, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Reviews', value: reviews.length, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Verified Biz', value: businesses.filter(b => b.is_verified).length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Verify', value: businesses.filter(b => !b.is_verified).length, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'businesses', label: 'Businesses', icon: Building2, count: businesses.length },
    { id: 'products', label: 'Products', icon: Package, count: products.length },
    { id: 'b2b', label: 'B2B', icon: Handshake, count: b2bListings.length },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
  ] as const;

  const refetchAll = () => {
    refetchB(); refetchP(); refetchB2B(); refetchU(); refetchR();
    toast.success('Data refreshed');
  };

  // ── Login Screen ──
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-brand-teal/20 border border-brand-teal/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Shield size={36} className="text-brand-teal" />
            </div>
            <h1 className="font-heading font-bold text-white text-2xl">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">UdupiGo Management Console</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1.5">Admin Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPwError(''); }}
                  placeholder="Enter admin password"
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-brand-teal/50 focus:ring-2 focus:ring-brand-teal/20 transition-all"
                  autoFocus
                />
              </div>
              {pwError && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <XCircle size={11} /> {pwError}
                </p>
              )}
            </div>

            <button type="submit" className="w-full bg-brand-teal text-white font-bold py-3.5 rounded-xl hover:bg-[#0d7a72] transition-colors">
              Access Admin Panel
            </button>
          </form>

          <button onClick={() => navigate('/')} className="mt-4 w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
            <Home size={14} /> Back to UdupiGo
          </button>
        </div>
      </div>
    );
  }

  // ── Main Panel ──
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-gray-900 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-teal/20 rounded-xl flex items-center justify-center">
            <Shield size={16} className="text-brand-teal" />
          </div>
          <div>
            <span className="font-heading font-bold text-white text-base">UdupiGo</span>
            <span className="text-gray-400 text-xs ml-1.5">Admin Console</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refetchAll} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Refresh all data">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => navigate('/')} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="View site">
            <Eye size={16} />
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 text-red-400 hover:bg-red-500/25 rounded-xl text-xs font-semibold transition-colors">
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-0 px-4" style={{ width: 'max-content', minWidth: '100%' }}>
          {TABS.map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === id ? 'border-brand-teal text-brand-teal' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={15} />
              {label}
              {count !== undefined && count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === id ? 'bg-brand-teal/15 text-brand-teal' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 max-w-5xl mx-auto">
        {/* Search bar for most tabs */}
        {activeTab !== 'dashboard' && (
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/10 transition-all"
            />
          </div>
        )}

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading font-bold text-gray-900 text-lg mb-1">Welcome, Admin 👋</h2>
              <p className="text-gray-500 text-sm">Manage and monitor UdupiGo platform from here.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon size={18} className={color} />
                  </div>
                  <p className={`font-heading font-bold text-2xl ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-heading font-bold text-gray-900 text-sm mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Verify Pending Businesses', count: businesses.filter(b => !b.is_verified).length, tab: 'businesses', color: 'text-orange-600 bg-orange-50', icon: AlertCircle },
                  { label: 'Review New Products', count: products.filter(p => !p.is_sold).length, tab: 'products', color: 'text-blue-600 bg-blue-50', icon: Package },
                  { label: 'B2B Verifications', count: b2bListings.filter(b => !b.is_verified).length, tab: 'b2b', color: 'text-purple-600 bg-purple-50', icon: Handshake },
                  { label: 'Manage Reviews', count: reviews.length, tab: 'reviews', color: 'text-amber-600 bg-amber-50', icon: Star },
                ].map(({ label, count, tab, color, icon: Icon }) => (
                  <button key={label} onClick={() => setActiveTab(tab as typeof activeTab)}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-brand-teal/30 hover:bg-gray-50 transition-all group text-left">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color.split(' ')[1]}`}>
                        <Icon size={14} className={color.split(' ')[0]} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{label}</p>
                        <p className="text-[10px] text-gray-400">{count} items</p>
                      </div>
                    </div>
                    <ChevronRight size={12} className="text-gray-300 group-hover:text-brand-teal transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-heading font-bold text-gray-900 text-sm mb-3">Recent Registrations</h3>
              {users.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No registered users yet</p>
              ) : (
                <div className="space-y-2.5">
                  {users.slice(0, 5).map(u => (
                    <div key={u.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-teal/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-teal font-bold text-xs">{(u.username || u.email)[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{u.username || 'Unnamed'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                      </div>
                      <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">Active</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Info */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
              <div className="flex items-start gap-3">
                <Shield size={20} className="text-brand-teal mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm mb-1">Admin Access Info</h3>
                  <p className="text-gray-300 text-xs mb-3">You are logged into the UdupiGo admin console. This session is valid until you logout.</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-gray-400 text-[10px] mb-1">Admin Password</p>
                      <p className="font-mono font-bold text-brand-teal text-sm">UdupiGo@Admin2026</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-gray-400 text-[10px] mb-1">Admin URL</p>
                      <p className="font-mono font-bold text-white text-xs break-all">/admin</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BUSINESSES TAB ── */}
        {activeTab === 'businesses' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">{businesses.length} registered businesses</p>
                <p className="text-xs text-gray-400">{businesses.filter(b => b.is_verified).length} verified · {businesses.filter(b => !b.is_verified).length} pending</p>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">✓ {businesses.filter(b => b.is_verified).length} Verified</span>
                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">⏳ {businesses.filter(b => !b.is_verified).length} Pending</span>
              </div>
            </div>

            {bLoading ? (
              <div className="text-center py-16 text-gray-400">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2" />Loading...
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Building2 size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No businesses registered yet</p>
                <p className="text-gray-400 text-xs mt-1">Businesses listed through the app will appear here</p>
              </div>
            ) : (
              businesses
                .filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase()))
                .map(biz => (
                  <div key={biz.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm text-gray-900">{biz.name}</h3>
                          {biz.is_verified ? (
                            <span className="flex items-center gap-1 text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                              <CheckCircle size={9} /> Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[9px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                              <AlertCircle size={9} /> Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 capitalize mt-0.5">{biz.category}</p>
                        {biz.address && (
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <MapPin size={10} />{biz.address}
                          </p>
                        )}
                        {biz.phone && (
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <Phone size={10} />{biz.phone}
                          </p>
                        )}
                        <div className="flex gap-3 mt-2 text-[10px] text-gray-400">
                          <span>👁 {biz.profile_views} views</span>
                          <span>📞 {biz.lead_count} leads</span>
                          <span>📅 {new Date(biz.created_at).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => verifyBusiness.mutate({ id: biz.id, val: !biz.is_verified })}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            biz.is_verified
                              ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {biz.is_verified ? <><XCircle size={11} /> Unverify</> : <><CheckCircle size={11} /> Verify</>}
                        </button>
                        <button
                          onClick={() => { if (confirm(`Remove "${biz.name}"?`)) deleteBusiness.mutate(biz.id); }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === 'products' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-gray-700">{products.length} total products</p>
              <div className="flex gap-2">
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Active: {products.filter(p => !p.is_sold).length}</span>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-bold">Sold: {products.filter(p => p.is_sold).length}</span>
              </div>
            </div>

            {pLoading ? (
              <div className="text-center py-16 text-gray-400"><RefreshCw size={24} className="animate-spin mx-auto mb-2" />Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Package size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No products listed yet</p>
                <p className="text-gray-400 text-xs mt-1">Users' product listings will appear here</p>
              </div>
            ) : (
              products
                .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
                .map(prod => (
                  <div key={prod.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
                    {prod.images?.[0] && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{prod.title}</h3>
                        {prod.is_sold && <span className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold flex-shrink-0">SOLD</span>}
                      </div>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">{prod.category} · {prod.condition}</p>
                      <p className="text-sm font-bold text-brand-teal mt-1">₹{Number(prod.price).toLocaleString('en-IN')}</p>
                      <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                        <span><MapPin size={9} className="inline" /> {prod.area}</span>
                        <span>👁 {prod.views} views</span>
                        <span>📅 {new Date(prod.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => { if (confirm(`Remove "${prod.title}"?`)) deleteProduct.mutate(prod.id); }}
                      className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
            )}
          </div>
        )}

        {/* ── B2B TAB ── */}
        {activeTab === 'b2b' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-gray-700">{b2bListings.length} B2B listings</p>
              <div className="flex gap-2">
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">✓ {b2bListings.filter(b => b.is_verified).length} Verified</span>
              </div>
            </div>

            {b2bLoading ? (
              <div className="text-center py-16 text-gray-400"><RefreshCw size={24} className="animate-spin mx-auto mb-2" />Loading...</div>
            ) : b2bListings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Handshake size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No B2B listings yet</p>
              </div>
            ) : (
              b2bListings
                .filter(b => !search || b.company_name.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase()))
                .map(b2b => (
                  <div key={b2b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-gray-900">{b2b.company_name}</h3>
                          {b2b.is_verified ? (
                            <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Verified</span>
                          ) : (
                            <span className="text-[9px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">Unverified</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 capitalize mt-0.5">{b2b.category}</p>
                        {b2b.location && <p className="text-xs text-gray-400 mt-0.5">📍 {b2b.location}</p>}
                        {b2b.contact_email && <p className="text-xs text-gray-400">✉️ {b2b.contact_email}</p>}
                        <p className="text-[10px] text-gray-300 mt-1">Listed {new Date(b2b.created_at).toLocaleDateString('en-IN')}</p>
                      </div>
                      <button
                        onClick={() => verifyB2B.mutate({ id: b2b.id, val: !b2b.is_verified })}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex-shrink-0 ${
                          b2b.is_verified ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {b2b.is_verified ? <><XCircle size={11} /> Unverify</> : <><CheckCircle size={11} /> Verify</>}
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 mb-1">{users.length} registered users</p>

            {uLoading ? (
              <div className="text-center py-16 text-gray-400"><RefreshCw size={24} className="animate-spin mx-auto mb-2" />Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Users size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No registered users yet</p>
              </div>
            ) : (
              users
                .filter(u => !search || (u.username || '').toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
                .map(u => (
                  <div key={u.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-teal/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-brand-teal font-bold text-sm">{(u.username || u.email)[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{u.username || 'No username'}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      <p className="text-[10px] text-gray-300 font-mono mt-0.5">{u.id.slice(0, 16)}...</p>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold flex-shrink-0">Active</span>
                  </div>
                ))
            )}
          </div>
        )}

        {/* ── REVIEWS TAB ── */}
        {activeTab === 'reviews' && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 mb-1">{reviews.length} total reviews</p>

            {rLoading ? (
              <div className="text-center py-16 text-gray-400"><RefreshCw size={24} className="animate-spin mx-auto mb-2" />Loading...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Star size={36} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No reviews submitted yet</p>
              </div>
            ) : (
              reviews
                .filter(r => !search || (r.comment || '').toLowerCase().includes(search.toLowerCase()) || r.business_id.toLowerCase().includes(search.toLowerCase()))
                .map(review => (
                  <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                            {review.rating} <Star size={8} className="fill-white" />
                          </div>
                          <span className="text-xs text-gray-400">Business: {review.business_id.slice(0, 12)}...</span>
                        </div>
                        {review.comment ? (
                          <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No comment</p>
                        )}
                        <p className="text-[10px] text-gray-300 mt-1.5">
                          User: {review.user_id.slice(0, 12)}... · {new Date(review.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <button
                        onClick={() => { if (confirm('Delete this review?')) deleteReview.mutate(review.id); }}
                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
