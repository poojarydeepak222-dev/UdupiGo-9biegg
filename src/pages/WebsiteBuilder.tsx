import { useState, useRef } from 'react';
import { ArrowLeft, Globe, Plus, Trash2, Edit3, Eye, Star, ShoppingBag, Package, Settings, CheckCircle, Copy, ExternalLink, Upload, RefreshCw, Phone, Mail, MapPin, Instagram, Facebook, X, ChevronRight, Zap, TrendingUp, Users, ShoppingCart, AlertCircle, BadgeCheck, Info, PlusCircle, Image as ImageIcon, Link, Layout, Puzzle, Clock, MessageSquare, Megaphone, Map, ToggleLeft, ToggleRight, MoveUp, MoveDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserWebsite {
  id: string;
  user_id: string;
  slug: string;
  business_name: string;
  tagline?: string;
  category: string;
  about?: string;
  phone?: string;
  email?: string;
  address?: string;
  logo_url?: string;
  banner_url?: string;
  theme_color: string;
  template: string;
  whatsapp_number?: string;
  instagram_url?: string;
  facebook_url?: string;
  custom_domain?: string;
  is_published: boolean;
  total_views: number;
  created_at: string;
}

interface WebsiteProduct {
  id: string;
  website_id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category: string;
  images?: string[];
  in_stock: boolean;
  is_featured: boolean;
  created_at: string;
}

interface WebsiteOrder {
  id: string;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  customer_message?: string;
  quantity: number;
  total_amount?: number;
  status: string;
  created_at: string;
}

type TabId = 'dashboard' | 'setup' | 'products' | 'orders' | 'pages' | 'widgets' | 'publish';

interface WebsitePage {
  id: string;
  website_id: string;
  title: string;
  slug: string;
  content: string;
  page_type: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

interface WebsiteWidget {
  id: string;
  website_id: string;
  widget_type: string;
  config: Record<string, string>;
  is_active: boolean;
  sort_order: number;
}

const PAGE_TYPES = [
  { id: 'about', label: 'About Us', emoji: '📖' },
  { id: 'services', label: 'Services', emoji: '⚡' },
  { id: 'gallery', label: 'Gallery', emoji: '🖼️' },
  { id: 'contact', label: 'Contact', emoji: '📞' },
  { id: 'faq', label: 'FAQ', emoji: '❓' },
  { id: 'custom', label: 'Custom Page', emoji: '📄' },
];

const WIDGET_TYPES = [
  { id: 'announcement', label: 'Announcement Banner', emoji: '📢', desc: 'Show a top banner message to visitors' },
  { id: 'hours', label: 'Business Hours', emoji: '🕐', desc: 'Display your opening and closing times' },
  { id: 'testimonials', label: 'Customer Reviews', emoji: '⭐', desc: 'Show customer testimonial quotes' },
  { id: 'map', label: 'Google Maps', emoji: '📍', desc: 'Embed your location on the store page' },
  { id: 'social', label: 'Social Feed', emoji: '📸', desc: 'Show Instagram handle and follower count' },
  { id: 'whatsapp_cta', label: 'WhatsApp CTA Bar', emoji: '💬', desc: 'Sticky WhatsApp chat button at bottom' },
];

// ─── Constants ─────────────────────────────────────────────────────────────
const BUSINESS_CATEGORIES = [
  'Retail', 'Fashion & Clothing', 'Food & Bakery', 'Electronics', 'Jewellery',
  'Health & Beauty', 'Home Decor', 'Handicrafts', 'Books & Stationery',
  'Sports & Fitness', 'Toys & Kids', 'Automotive', 'Services', 'Other',
];

const THEME_COLORS = [
  { label: 'Teal', value: '#0d9488' },
  { label: 'Coral', value: '#f05a28' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Purple', value: '#7c3aed' },
  { label: 'Green', value: '#16a34a' },
  { label: 'Pink', value: '#db2777' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Indigo', value: '#4338ca' },
];

const TEMPLATES = [
  { id: 'modern', label: 'Modern', emoji: '✨', desc: 'Clean cards, bold typography' },
  { id: 'boutique', label: 'Boutique', emoji: '🛍️', desc: 'Elegant grid, fashion-forward' },
  { id: 'minimal', label: 'Minimal', emoji: '⬜', desc: 'Simple, product-focused' },
];

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => (
  <div className={`${color} rounded-2xl p-4 text-center`}>
    <div className="flex justify-center mb-1">{icon}</div>
    <p className="font-heading font-bold text-2xl">{value}</p>
    <p className="text-xs opacity-70 mt-0.5">{label}</p>
  </div>
);

// ─── Product Form Modal ────────────────────────────────────────────────────
const ProductFormModal = ({
  websiteId, userId, product, onClose, onSuccess,
}: {
  websiteId: string; userId: string; product?: WebsiteProduct | null; onClose: () => void; onSuccess: () => void;
}) => {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    original_price: product?.original_price?.toString() || '',
    category: product?.category || 'General',
    in_stock: product?.in_stock ?? true,
    is_featured: product?.is_featured ?? false,
    imageUrl: product?.images?.[0] || '',
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${userId}/products/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('website-assets').upload(path, file, { upsert: true });
    if (error) { toast.error('Upload failed'); setUploading(false); return; }
    const { data } = supabase.storage.from('website-assets').getPublicUrl(path);
    setForm(f => ({ ...f, imageUrl: data.publicUrl }));
    setUploading(false);
  };

  const mut = useMutation({
    mutationFn: async () => {
      const payload = {
        website_id: websiteId,
        user_id: userId,
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        category: form.category,
        in_stock: form.in_stock,
        is_featured: form.is_featured,
        images: form.imageUrl ? [form.imageUrl] : [],
      };
      if (product) {
        const { error } = await supabase.from('website_products').update(payload).eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('website_products').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(product ? 'Product updated!' : 'Product added!');
      qc.invalidateQueries({ queryKey: ['website_products'] });
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div className="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h3 className="font-heading font-bold text-gray-900 text-lg">{product ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Image */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-2">Product Image</label>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={24} className="text-gray-300" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-2 border-2 border-dashed border-brand-teal/30 text-brand-teal text-xs font-bold rounded-xl hover:bg-brand-teal/5 flex items-center justify-center gap-2"
                >
                  {uploading ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
                <input
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="Or paste image URL"
                  className="w-full px-3 py-1.5 bg-gray-50 rounded-xl text-xs outline-none border border-gray-100"
                />
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }} />
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Product Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Handmade Silk Saree" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Selling Price (₹) *</label>
              <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                type="number" placeholder="999" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">MRP (₹)</label>
              <input value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))}
                type="number" placeholder="1299" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Category</label>
            <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              placeholder="e.g. Clothing, Electronics..." className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Product details, materials, sizes, colors..."
              rows={3} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 resize-none" />
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <button type="button" onClick={() => setForm(f => ({ ...f, in_stock: !f.in_stock }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${form.in_stock ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
              <CheckCircle size={13} /> In Stock
            </button>
            <button type="button" onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${form.is_featured ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
              <Star size={13} /> Featured
            </button>
          </div>

          <button onClick={() => mut.mutate()} disabled={!form.name || !form.price || mut.isPending}
            className="w-full bg-brand-teal text-white font-bold py-3.5 rounded-xl text-sm hover:bg-[#0d7a72] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {mut.isPending ? <><RefreshCw size={15} className="animate-spin" /> Saving...</> : <><CheckCircle size={15} /> {product ? 'Update Product' : 'Add Product'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const WebsiteBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [productModal, setProductModal] = useState<{ open: boolean; product?: WebsiteProduct | null }>({ open: false });
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Website form state
  const [setupForm, setSetupForm] = useState({
    business_name: '',
    tagline: '',
    category: 'Retail',
    about: '',
    phone: '',
    email: '',
    address: '',
    whatsapp_number: '',
    instagram_url: '',
    facebook_url: '',
    theme_color: '#0d9488',
    template: 'modern',
    logo_url: '',
    banner_url: '',
    custom_domain: '',
  });

  // ── Load website ──
  const { data: website, isLoading: websiteLoading } = useQuery({
    queryKey: ['user_website', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from('user_websites').select('*').eq('user_id', user!.id).single();
      if (data) {
        setSetupForm({
          business_name: data.business_name || '',
          tagline: data.tagline || '',
          category: data.category || 'Retail',
          about: data.about || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          whatsapp_number: data.whatsapp_number || '',
          instagram_url: data.instagram_url || '',
          facebook_url: data.facebook_url || '',
          theme_color: data.theme_color || '#0d9488',
          template: data.template || 'modern',
          logo_url: data.logo_url || '',
          banner_url: data.banner_url || '',
          custom_domain: data.custom_domain || '',
        });
      }
      return data as UserWebsite | null;
    },
  });

  // ── Load products ──
  const { data: products = [] } = useQuery({
    queryKey: ['website_products', website?.id],
    enabled: !!website?.id,
    queryFn: async () => {
      const { data } = await supabase.from('website_products').select('*').eq('website_id', website!.id).order('created_at', { ascending: false });
      return (data || []) as WebsiteProduct[];
    },
  });

  // ── Load orders ──
  const { data: orders = [] } = useQuery({
    queryKey: ['website_orders', website?.id],
    enabled: !!website?.id,
    queryFn: async () => {
      const { data } = await supabase.from('website_orders').select('*').eq('website_id', website!.id).order('created_at', { ascending: false });
      return (data || []) as WebsiteOrder[];
    },
  });

  // ── Create/Update website ──
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not logged in');
      const slug = generateSlug(setupForm.business_name) || `store-${Date.now()}`;
      if (website) {
        const { error } = await supabase.from('user_websites').update({
          ...setupForm,
          updated_at: new Date().toISOString(),
        }).eq('id', website.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_websites').insert({
          ...setupForm,
          user_id: user.id,
          slug,
          is_published: false,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Website saved successfully!');
      qc.invalidateQueries({ queryKey: ['user_website'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Publish/Unpublish ──
  const publishMutation = useMutation({
    mutationFn: async (publish: boolean) => {
      const { error } = await supabase.from('user_websites').update({ is_published: publish }).eq('id', website!.id);
      if (error) throw error;
    },
    onSuccess: (_, publish) => {
      toast.success(publish ? '🎉 Your website is now LIVE!' : 'Website unpublished');
      qc.invalidateQueries({ queryKey: ['user_website'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Delete product ──
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('website_products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Product deleted');
      qc.invalidateQueries({ queryKey: ['website_products'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ── Update order status ──
  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('website_orders').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['website_orders'] });
      toast.success('Order status updated');
    },
  });

  // ── Upload image helper ──
  const uploadFile = async (file: File, type: 'logo' | 'banner') => {
    if (!user?.id) return;
    const setter = type === 'logo' ? setUploadingLogo : setUploadingBanner;
    setter(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${type}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('website-assets').upload(path, file, { upsert: true });
    if (error) { toast.error('Upload failed'); setter(false); return; }
    const { data } = supabase.storage.from('website-assets').getPublicUrl(path);
    setSetupForm(f => ({ ...f, [type === 'logo' ? 'logo_url' : 'banner_url']: data.publicUrl }));
    setter(false);
    toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded!`);
  };

  const storeUrl = website ? `${window.location.origin}/shop/${website.slug}` : '';
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  // ── Load pages ──
  const { data: pages = [], refetch: refetchPages } = useQuery({
    queryKey: ['website_pages', website?.id],
    enabled: !!website?.id,
    queryFn: async () => {
      const { data } = await supabase.from('website_pages').select('*').eq('website_id', website!.id).order('sort_order', { ascending: true });
      return (data || []) as WebsitePage[];
    },
  });

  // ── Load widgets ──
  const { data: widgets = [], refetch: refetchWidgets } = useQuery({
    queryKey: ['website_widgets', website?.id],
    enabled: !!website?.id,
    queryFn: async () => {
      const { data } = await supabase.from('website_widgets').select('*').eq('website_id', website!.id).order('sort_order', { ascending: true });
      return (data || []) as WebsiteWidget[];
    },
  });

  // Page form state
  const [pageForm, setPageForm] = useState({ title: '', slug: '', content: '', page_type: 'custom', is_published: true });
  const [editPage, setEditPage] = useState<WebsitePage | null>(null);
  const [showPageForm, setShowPageForm] = useState(false);

  // Widget config state
  const [widgetConfigs, setWidgetConfigs] = useState<Record<string, Record<string, string>>>({});

  const savePage = useMutation({
    mutationFn: async () => {
      if (!website || !user?.id) throw new Error('No website');
      const payload = { ...pageForm, website_id: website.id, user_id: user.id, slug: pageForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
      if (editPage) {
        const { error } = await supabase.from('website_pages').update(payload).eq('id', editPage.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('website_pages').insert({ ...payload, sort_order: pages.length });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editPage ? 'Page updated!' : 'Page created!');
      qc.invalidateQueries({ queryKey: ['website_pages'] });
      setShowPageForm(false);
      setEditPage(null);
      setPageForm({ title: '', slug: '', content: '', page_type: 'custom', is_published: true });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('website_pages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Page deleted'); qc.invalidateQueries({ queryKey: ['website_pages'] }); },
  });

  const togglePagePublish = useMutation({
    mutationFn: async ({ id, val }: { id: string; val: boolean }) => {
      const { error } = await supabase.from('website_pages').update({ is_published: val }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website_pages'] }),
  });

  const addWidget = useMutation({
    mutationFn: async ({ type, config }: { type: string; config: Record<string, string> }) => {
      if (!website || !user?.id) throw new Error('No website');
      const { error } = await supabase.from('website_widgets').insert({
        website_id: website.id,
        user_id: user.id,
        widget_type: type,
        config,
        is_active: true,
        sort_order: widgets.length,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Widget added!'); qc.invalidateQueries({ queryKey: ['website_widgets'] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleWidget = useMutation({
    mutationFn: async ({ id, val }: { id: string; val: boolean }) => {
      const { error } = await supabase.from('website_widgets').update({ is_active: val }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website_widgets'] }),
  });

  const deleteWidget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('website_widgets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Widget removed'); qc.invalidateQueries({ queryKey: ['website_widgets'] }); },
  });

  const TABS: { id: TabId; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'setup', label: 'Setup', icon: '⚙️' },
    { id: 'products', label: 'Products', icon: '📦', badge: products.length },
    { id: 'orders', label: 'Orders', icon: '🛒', badge: pendingOrders || undefined },
    { id: 'pages', label: 'Pages', icon: '📄', badge: pages.length || undefined },
    { id: 'widgets', label: 'Widgets', icon: '🧩' },
    { id: 'publish', label: 'Publish', icon: '🚀' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24 px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🔐</p>
          <h2 className="font-heading font-bold text-gray-900 text-xl mb-2">Sign In Required</h2>
          <p className="text-gray-500 text-sm mb-6">Please sign in to access the Website Builder</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-brand-teal text-white font-bold rounded-xl text-sm">Go to Home →</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-gray-900 text-lg">Website Builder</h1>
            <p className="text-xs text-gray-400">
              {website ? (website.is_published ? '🟢 Live · ' : '⚫ Draft · ') : ''}
              {website?.business_name || 'Create your online store'}
            </p>
          </div>
          {website && (
            <button
              onClick={() => navigate(`/shop/${website.slug}`)}
              className="p-2 rounded-full bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/20"
              title="Preview store"
            >
              <Eye size={18} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center justify-center gap-1 px-4 py-3 text-xs font-bold border-b-2 transition-all relative ${activeTab === tab.id ? 'border-brand-teal text-brand-teal' : 'border-transparent text-gray-400'}`}>
              <span>{tab.icon}</span> {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-2 right-1 min-w-[14px] h-[14px] bg-brand-coral text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── DASHBOARD TAB ── */}
      {activeTab === 'dashboard' && (
        <div className="px-4 pt-4 space-y-4">
          {/* Hero */}
          <div className="bg-gradient-to-br from-brand-teal via-[#0d9488] to-[#0a6b65] rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-32 flex items-center justify-center opacity-10 text-9xl pointer-events-none">🌐</div>
            <p className="text-xs text-white/70 font-semibold mb-1">UdupiGo Website Builder</p>
            <h2 className="font-heading font-bold text-2xl mb-1">Your Online Store</h2>
            <p className="text-xs text-white/80 max-w-xs mb-4">Create a beautiful mobile website for your business in minutes — no coding needed</p>
            {!website ? (
              <button onClick={() => setActiveTab('setup')} className="bg-white text-brand-teal font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 active:scale-95 transition-all">
                Create Website →
              </button>
            ) : (
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => navigate(`/shop/${website.slug}`)} className="bg-white text-brand-teal font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-white/90 transition-all">
                  <Eye size={14} /> Preview
                </button>
                <button onClick={() => setActiveTab('products')} className="bg-white/20 text-white font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-white/30 transition-all">
                  <Plus size={14} /> Add Products
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          {website ? (
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<Eye size={18} className="text-blue-600" />} label="Total Views" value={website.total_views} color="bg-blue-50 text-blue-800" />
              <StatCard icon={<Package size={18} className="text-purple-600" />} label="Products" value={products.length} color="bg-purple-50 text-purple-800" />
              <StatCard icon={<ShoppingCart size={18} className="text-green-600" />} label="Total Orders" value={orders.length} color="bg-green-50 text-green-800" />
              <StatCard icon={<AlertCircle size={18} className="text-amber-600" />} label="Pending" value={pendingOrders} color="bg-amber-50 text-amber-800" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="text-4xl mb-3">🚀</p>
              <h3 className="font-heading font-bold text-gray-900 mb-2">Launch Your Store Today</h3>
              <p className="text-sm text-gray-500 mb-4">Set up your website in 3 simple steps and start selling online</p>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[['1', '⚙️', 'Setup Details'], ['2', '📦', 'Add Products'], ['3', '🚀', 'Go Live']].map(([num, icon, label]) => (
                  <div key={num} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg mb-1">{icon}</p>
                    <p className="text-[10px] font-bold text-gray-600">{label}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveTab('setup')} className="w-full bg-brand-teal text-white font-bold py-3 rounded-xl text-sm">
                Start Building →
              </button>
            </div>
          )}

          {/* Features list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-heading font-bold text-gray-900 text-sm mb-3">What You Get</h3>
            <div className="space-y-3">
              {[
                { icon: '🌐', title: 'Free Website URL', desc: `udupigo.in/shop/${website?.slug || 'your-store'}` },
                { icon: '📱', title: 'Mobile-First Design', desc: 'Looks perfect on all phones and tablets' },
                { icon: '🛒', title: 'Online Shop', desc: 'Unlimited products with WhatsApp ordering' },
                { icon: '💳', title: 'No Commission', desc: 'Keep 100% of your sales — completely free' },
                { icon: '🔗', title: 'Custom Domain', desc: 'Connect your own domain like yourstore.com' },
                { icon: '📊', title: 'Analytics', desc: 'Track views and orders from your dashboard' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
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

      {/* ── SETUP TAB ── */}
      {activeTab === 'setup' && (
        <div className="px-4 pt-4 space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-5 text-white">
            <h2 className="font-heading font-bold text-lg mb-1">Website Setup</h2>
            <p className="text-xs text-white/80">Fill in your business details to personalize your store</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <h3 className="font-heading font-bold text-gray-900 text-sm">Business Info</h3>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Business Name *</label>
              <input value={setupForm.business_name} onChange={e => setSetupForm(f => ({ ...f, business_name: e.target.value }))}
                placeholder="e.g. Priya's Boutique" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
              {setupForm.business_name && (
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <Globe size={9} /> Your URL: udupigo.in/shop/{generateSlug(setupForm.business_name)}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Tagline</label>
              <input value={setupForm.tagline} onChange={e => setSetupForm(f => ({ ...f, tagline: e.target.value }))}
                placeholder="e.g. Handcrafted with love in Udupi" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Category</label>
              <select value={setupForm.category} onChange={e => setSetupForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 appearance-none">
                {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">About Your Business</label>
              <textarea value={setupForm.about} onChange={e => setSetupForm(f => ({ ...f, about: e.target.value }))}
                placeholder="Describe your business, products, and what makes you special..."
                rows={3} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 resize-none" />
            </div>
          </div>

          {/* Logo & Banner */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <h3 className="font-heading font-bold text-gray-900 text-sm">Logo & Banner</h3>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Logo</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {setupForm.logo_url ? (
                    <img src={setupForm.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={20} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <button onClick={() => logoRef.current?.click()} disabled={uploadingLogo}
                    className="w-full py-2 border-2 border-dashed border-brand-teal/30 text-brand-teal text-xs font-bold rounded-xl hover:bg-brand-teal/5 flex items-center justify-center gap-1.5">
                    {uploadingLogo ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </button>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadFile(e.target.files[0], 'logo'); }} />
                  <input value={setupForm.logo_url} onChange={e => setSetupForm(f => ({ ...f, logo_url: e.target.value }))}
                    placeholder="Or paste logo URL" className="w-full px-3 py-1.5 bg-gray-50 rounded-xl text-xs outline-none border border-gray-100" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Hero Banner</label>
              <div className="rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 h-24 flex items-center justify-center overflow-hidden mb-2">
                {setupForm.banner_url ? (
                  <img src={setupForm.banner_url} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <p className="text-gray-300 text-sm">Banner Preview</p>
                )}
              </div>
              <button onClick={() => bannerRef.current?.click()} disabled={uploadingBanner}
                className="w-full py-2 border-2 border-dashed border-brand-teal/30 text-brand-teal text-xs font-bold rounded-xl hover:bg-brand-teal/5 flex items-center justify-center gap-1.5 mb-2">
                {uploadingBanner ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
                {uploadingBanner ? 'Uploading...' : 'Upload Banner Image'}
              </button>
              <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadFile(e.target.files[0], 'banner'); }} />
              <input value={setupForm.banner_url} onChange={e => setSetupForm(f => ({ ...f, banner_url: e.target.value }))}
                placeholder="Or paste banner image URL" className="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs outline-none border border-gray-100" />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <h3 className="font-heading font-bold text-gray-900 text-sm">Contact Details</h3>
            {[
              { key: 'phone', label: 'Phone Number', placeholder: '+91 XXXXX XXXXX', type: 'tel', icon: <Phone size={13} className="text-gray-400" /> },
              { key: 'whatsapp_number', label: 'WhatsApp Number', placeholder: '91XXXXXXXXXX (for orders)', type: 'tel', icon: <Phone size={13} className="text-green-500" /> },
              { key: 'email', label: 'Email', placeholder: 'yourstore@email.com', type: 'email', icon: <Mail size={13} className="text-gray-400" /> },
              { key: 'address', label: 'Address', placeholder: 'Shop address in Udupi', type: 'text', icon: <MapPin size={13} className="text-gray-400" /> },
            ].map(({ key, label, placeholder, type, icon }) => (
              <div key={key}>
                <label className="text-xs font-bold text-gray-600 block mb-1">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
                  <input value={(setupForm as Record<string, string>)[key]}
                    onChange={e => setSetupForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} type={type}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
                </div>
              </div>
            ))}

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Instagram URL</label>
              <div className="relative">
                <Instagram size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" />
                <input value={setupForm.instagram_url} onChange={e => setSetupForm(f => ({ ...f, instagram_url: e.target.value }))}
                  placeholder="https://instagram.com/yourstore" className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <h3 className="font-heading font-bold text-gray-900 text-sm">Theme & Style</h3>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Brand Color</label>
              <div className="flex flex-wrap gap-2">
                {THEME_COLORS.map(c => (
                  <button key={c.value} onClick={() => setSetupForm(f => ({ ...f, theme_color: c.value }))}
                    className={`w-9 h-9 rounded-xl transition-all relative ${setupForm.theme_color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                    style={{ backgroundColor: c.value }} title={c.label}>
                    {setupForm.theme_color === c.value && <CheckCircle size={16} className="absolute inset-0 m-auto text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Template Style</label>
              <div className="space-y-2">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setSetupForm(f => ({ ...f, template: t.id }))}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${setupForm.template === t.id ? 'border-brand-teal bg-brand-teal/5' : 'border-gray-100 bg-gray-50'}`}>
                    <span className="text-2xl">{t.emoji}</span>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${setupForm.template === t.id ? 'text-brand-teal' : 'text-gray-700'}`}>{t.label}</p>
                      <p className="text-[10px] text-gray-400">{t.desc}</p>
                    </div>
                    {setupForm.template === t.id && <CheckCircle size={16} className="text-brand-teal ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={() => saveMutation.mutate()} disabled={!setupForm.business_name || saveMutation.isPending}
            className="w-full bg-brand-teal text-white font-bold py-3.5 rounded-xl text-sm hover:bg-[#0d7a72] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {saveMutation.isPending ? <><RefreshCw size={15} className="animate-spin" /> Saving...</> : <><CheckCircle size={15} /> Save Website Settings</>}
          </button>
        </div>
      )}

      {/* ── PRODUCTS TAB ── */}
      {activeTab === 'products' && (
        <div className="px-4 pt-4 space-y-4">
          {!website ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">⚙️</p>
              <p className="font-semibold text-gray-700">Setup your website first</p>
              <button onClick={() => setActiveTab('setup')} className="mt-3 px-6 py-2 bg-brand-teal text-white font-bold text-sm rounded-xl">Go to Setup</button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading font-bold text-gray-900">Products</h2>
                  <p className="text-xs text-gray-400">{products.length} products in your store</p>
                </div>
                <button onClick={() => setProductModal({ open: true, product: null })}
                  className="bg-brand-teal text-white font-bold text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#0d7a72] active:scale-95 transition-all">
                  <Plus size={15} /> Add Product
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <p className="text-5xl mb-3">📦</p>
                  <p className="font-semibold text-gray-700">No products yet</p>
                  <p className="text-sm text-gray-400 mt-1 mb-4">Add your first product to start selling</p>
                  <button onClick={() => setProductModal({ open: true, product: null })} className="px-6 py-2.5 bg-brand-teal text-white font-bold text-sm rounded-xl flex items-center gap-2 mx-auto">
                    <Plus size={14} /> Add First Product
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="flex gap-3 p-3">
                        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-heading font-bold text-gray-900 text-sm truncate">{p.name}</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5">{p.category}</p>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button onClick={() => setProductModal({ open: true, product: p })} className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100">
                                <Edit3 size={13} />
                              </button>
                              <button onClick={() => deleteProduct.mutate(p.id)} className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-brand-teal text-sm">₹{p.price.toLocaleString('en-IN')}</span>
                            {p.original_price && (
                              <span className="text-[10px] text-gray-400 line-through">₹{p.original_price.toLocaleString('en-IN')}</span>
                            )}
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${p.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {p.in_stock ? 'In Stock' : 'Out of Stock'}
                            </span>
                            {p.is_featured && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700">★ Featured</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {activeTab === 'orders' && (
        <div className="px-4 pt-4 space-y-4">
          {!website ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">⚙️</p>
              <p className="font-semibold text-gray-700">Setup your website first</p>
              <button onClick={() => setActiveTab('setup')} className="mt-3 px-6 py-2 bg-brand-teal text-white font-bold text-sm rounded-xl">Go to Setup</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total', value: orders.length, color: 'bg-blue-50 text-blue-700' },
                  { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'bg-amber-50 text-amber-700' },
                  { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, color: 'bg-green-50 text-green-700' },
                ].map(s => (
                  <div key={s.label} className={`${s.color} rounded-2xl p-3 text-center`}>
                    <p className="font-heading font-bold text-2xl">{s.value}</p>
                    <p className="text-[10px] font-medium mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <p className="text-5xl mb-3">📬</p>
                  <p className="font-semibold text-gray-700">No orders yet</p>
                  <p className="text-sm text-gray-400 mt-1">Share your store link to start receiving orders</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-heading font-bold text-gray-900 text-sm">{order.product_name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' : order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-1 mb-3">
                        <p className="text-xs text-gray-700 font-semibold">{order.customer_name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10} /> {order.customer_phone}</p>
                        {order.customer_message && <p className="text-xs text-gray-400 italic">"{order.customer_message}"</p>}
                        <div className="flex items-center gap-3 text-[10px] text-gray-400">
                          <span>Qty: {order.quantity}</span>
                          {order.total_amount && <span className="font-bold text-brand-teal">₹{order.total_amount}</span>}
                          <span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a href={`https://wa.me/${order.customer_phone.replace(/[\s+\-()]/g, '')}?text=${encodeURIComponent(`Hi ${order.customer_name}, your order for "${order.product_name}" has been received! We'll contact you shortly.`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 bg-green-500 text-white font-bold text-xs py-2 rounded-xl text-center flex items-center justify-center gap-1.5 hover:bg-green-600">
                          <Phone size={11} /> WhatsApp
                        </a>
                        {order.status === 'pending' && (
                          <button onClick={() => updateOrderStatus.mutate({ id: order.id, status: 'completed' })}
                            className="flex-1 bg-brand-teal text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#0d7a72]">
                            <CheckCircle size={11} /> Mark Done
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── PUBLISH TAB ── */}
      {activeTab === 'publish' && (
        <div className="px-4 pt-4 space-y-4">
          {!website ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">⚙️</p>
              <p className="font-semibold text-gray-700">Create your website first</p>
              <button onClick={() => setActiveTab('setup')} className="mt-3 px-6 py-2 bg-brand-teal text-white font-bold text-sm rounded-xl">Go to Setup</button>
            </div>
          ) : (
            <>
              {/* Status card */}
              <div className={`rounded-2xl p-5 text-white ${website.is_published ? 'bg-gradient-to-r from-green-500 to-green-700' : 'bg-gradient-to-r from-gray-500 to-gray-700'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {website.is_published ? <CheckCircle size={18} /> : <AlertCircle size={18} className="text-white/70" />}
                  <p className="font-bold text-sm">{website.is_published ? 'LIVE' : 'DRAFT — NOT PUBLISHED'}</p>
                </div>
                <h2 className="font-heading font-bold text-xl mb-1">{website.business_name}</h2>
                <p className="text-xs text-white/80 mb-3">{website.is_published ? 'Your store is live and visible to customers' : 'Publish to make your store visible to customers'}</p>
                {website.is_published ? (
                  <button onClick={() => publishMutation.mutate(false)} disabled={publishMutation.isPending}
                    className="bg-white/20 text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-all">
                    Unpublish Website
                  </button>
                ) : (
                  <button onClick={() => publishMutation.mutate(true)} disabled={publishMutation.isPending}
                    className="bg-white text-green-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 flex items-center gap-2 active:scale-95 transition-all">
                    {publishMutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                    Publish Website Now
                  </button>
                )}
              </div>

              {/* Store URL */}
              {website.is_published && (
                <div className="bg-white rounded-2xl border border-brand-teal/20 shadow-sm p-4">
                  <p className="text-xs font-bold text-gray-600 mb-2">Your Store URL</p>
                  <div className="flex items-center gap-2 bg-brand-teal/5 rounded-xl px-3 py-2.5">
                    <Globe size={14} className="text-brand-teal flex-shrink-0" />
                    <p className="text-sm font-semibold text-brand-teal flex-1 truncate">{storeUrl}</p>
                    <button onClick={() => { navigator.clipboard.writeText(storeUrl); toast.success('Copied!'); }} className="p-1.5 rounded-lg hover:bg-brand-teal/10">
                      <Copy size={13} className="text-brand-teal" />
                    </button>
                    <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-brand-teal/10">
                      <ExternalLink size={13} className="text-brand-teal" />
                    </a>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Visit my online store: ${storeUrl}`)}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 bg-green-500 text-white font-bold text-xs py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5">
                      Share on WhatsApp
                    </a>
                    <button onClick={() => navigate(`/shop/${website.slug}`)}
                      className="flex-1 bg-brand-teal text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                      <Eye size={12} /> Preview Store
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Domain */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Link size={15} className="text-brand-teal" />
                  <h3 className="font-heading font-bold text-gray-900 text-sm">Custom Domain</h3>
                  <span className="text-[9px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold">PRO</span>
                </div>
                <p className="text-xs text-gray-500">Connect your own domain like <strong>yourstore.com</strong> to your UdupiGo website</p>

                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Your Domain</label>
                  <div className="flex gap-2">
                    <input value={setupForm.custom_domain} onChange={e => setSetupForm(f => ({ ...f, custom_domain: e.target.value }))}
                      placeholder="e.g. www.priyasboutique.com" className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
                    <button onClick={() => saveMutation.mutate()} className="px-4 py-2.5 bg-brand-teal text-white font-bold text-xs rounded-xl">Save</button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs font-bold text-blue-700 mb-2">DNS Setup Instructions</p>
                  <div className="space-y-2 text-[10px] text-blue-600">
                    <div className="bg-white rounded-lg p-2 border border-blue-100">
                      <p className="font-bold">Step 1: Go to your domain registrar (GoDaddy, Namecheap, etc.)</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-blue-100">
                      <p className="font-bold">Step 2: Add a CNAME record</p>
                      <p className="font-mono mt-1">Name: www → Value: udupigo.in</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-blue-100">
                      <p className="font-bold">Step 3: Wait 24-48 hours for DNS propagation</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-blue-100">
                      <p className="font-bold">Step 4: Contact support@udupigo.in to activate your domain</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-heading font-bold text-gray-900 text-sm mb-3">Launch Checklist</h3>
                <div className="space-y-2.5">
                  {[
                    { done: !!website.business_name, label: 'Business name set', action: () => setActiveTab('setup') },
                    { done: !!website.logo_url, label: 'Logo uploaded', action: () => setActiveTab('setup') },
                    { done: !!website.whatsapp_number, label: 'WhatsApp number added', action: () => setActiveTab('setup') },
                    { done: products.length > 0, label: `Products added (${products.length})`, action: () => setActiveTab('products') },
                    { done: website.is_published, label: 'Website published', action: () => publishMutation.mutate(true) },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500' : 'bg-gray-100'}`}>
                        {item.done ? <CheckCircle size={12} className="text-white" /> : <span className="text-gray-400 text-[10px] font-bold">{i + 1}</span>}
                      </div>
                      <p className={`flex-1 text-xs font-medium ${item.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.label}</p>
                      {!item.done && (
                        <button onClick={item.action} className="text-[10px] text-brand-teal font-bold flex items-center gap-0.5 hover:underline">
                          Fix <ChevronRight size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── PAGES TAB ── */}
      {activeTab === 'pages' && (
        <div className="px-4 pt-4 space-y-4">
          {!website ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">⚙️</p>
              <p className="font-semibold text-gray-700">Setup your website first</p>
              <button onClick={() => setActiveTab('setup')} className="mt-3 px-6 py-2 bg-brand-teal text-white font-bold text-sm rounded-xl">Go to Setup</button>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
                <h2 className="font-heading font-bold text-lg mb-1">Website Pages</h2>
                <p className="text-xs text-white/80">Add custom pages to your store — About, Services, Gallery, FAQ and more</p>
              </div>

              {/* Add Page Button */}
              {!showPageForm && (
                <button onClick={() => { setShowPageForm(true); setEditPage(null); setPageForm({ title: '', slug: '', content: '', page_type: 'custom', is_published: true }); }}
                  className="w-full border-2 border-dashed border-brand-teal/30 text-brand-teal font-bold text-sm py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-teal/5">
                  <Plus size={16} /> Add New Page
                </button>
              )}

              {/* Page Form */}
              {showPageForm && (
                <div className="bg-white rounded-2xl border border-brand-teal/20 shadow-sm p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-sm">{editPage ? 'Edit Page' : 'New Page'}</h3>
                    <button onClick={() => { setShowPageForm(false); setEditPage(null); }} className="p-1.5 rounded-full hover:bg-gray-100"><X size={16} /></button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Page Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PAGE_TYPES.map(pt => (
                        <button key={pt.id} onClick={() => setPageForm(f => ({ ...f, page_type: pt.id, title: f.title || pt.label }))}
                          className={`p-2 rounded-xl border-2 text-center transition-all ${pageForm.page_type === pt.id ? 'border-brand-teal bg-brand-teal/5' : 'border-gray-100'}`}>
                          <span className="text-lg block">{pt.emoji}</span>
                          <span className="text-[9px] font-bold text-gray-600">{pt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Page Title *</label>
                    <input value={pageForm.title} onChange={e => setPageForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. About Us" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">Page Content</label>
                    <textarea value={pageForm.content} onChange={e => setPageForm(f => ({ ...f, content: e.target.value }))}
                      placeholder="Write the content for this page — your story, services, team info, etc."
                      rows={5} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20 resize-none" />
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="pg_pub" checked={pageForm.is_published} onChange={e => setPageForm(f => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4 accent-brand-teal" />
                    <label htmlFor="pg_pub" className="text-xs font-semibold text-gray-600">Published (visible on store)</label>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => { setShowPageForm(false); setEditPage(null); }}
                      className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold text-sm rounded-xl">Cancel</button>
                    <button onClick={() => savePage.mutate()} disabled={!pageForm.title || savePage.isPending}
                      className="flex-1 py-2.5 bg-brand-teal text-white font-bold text-sm rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
                      {savePage.isPending ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                      {editPage ? 'Update' : 'Create'} Page
                    </button>
                  </div>
                </div>
              )}

              {/* Pages List */}
              {pages.length === 0 && !showPageForm ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <Layout size={36} className="mx-auto text-gray-200 mb-3" />
                  <p className="font-semibold text-gray-700">No pages yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add pages like About Us, Services, Gallery to enrich your store</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pages.map(pg => {
                    const pt = PAGE_TYPES.find(t => t.id === pg.page_type);
                    return (
                      <div key={pg.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 p-3.5">
                          <span className="text-2xl flex-shrink-0">{pt?.emoji || '📄'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">{pg.title}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">/page/{pg.slug} · {pg.content?.length || 0} chars</p>
                          </div>
                          <button onClick={() => togglePagePublish.mutate({ id: pg.id, val: !pg.is_published })}
                            className={`flex-shrink-0 ${pg.is_published ? 'text-green-500' : 'text-gray-300'}`}>
                            {pg.is_published ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                          </button>
                        </div>
                        <div className="flex border-t border-gray-50">
                          <button onClick={() => { setEditPage(pg); setPageForm({ title: pg.title, slug: pg.slug, content: pg.content || '', page_type: pg.page_type, is_published: pg.is_published }); setShowPageForm(true); }}
                            className="flex-1 py-2 text-xs font-semibold text-blue-600 flex items-center justify-center gap-1.5 hover:bg-blue-50">
                            <Edit3 size={11} /> Edit
                          </button>
                          <button onClick={() => deletePage.mutate(pg.id)}
                            className="flex-1 py-2 text-xs font-semibold text-red-500 flex items-center justify-center gap-1.5 hover:bg-red-50 border-l border-gray-50">
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs font-bold text-blue-700 mb-1">💡 How pages work</p>
                <p className="text-[11px] text-blue-600">Published pages appear as navigation tabs on your public store (/shop/your-store). Visitors can browse your About, Gallery, and Services pages directly.</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── WIDGETS TAB ── */}
      {activeTab === 'widgets' && (
        <div className="px-4 pt-4 space-y-4">
          {!website ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">⚙️</p>
              <p className="font-semibold text-gray-700">Setup your website first</p>
              <button onClick={() => setActiveTab('setup')} className="mt-3 px-6 py-2 bg-brand-teal text-white font-bold text-sm rounded-xl">Go to Setup</button>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white">
                <h2 className="font-heading font-bold text-lg mb-1">Store Widgets</h2>
                <p className="text-xs text-white/80">Add interactive components to enhance your store — banners, hours, reviews, and more</p>
              </div>

              {/* Active Widgets */}
              {widgets.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Widgets ({widgets.length})</p>
                  {widgets.map(w => {
                    const wt = WIDGET_TYPES.find(t => t.id === w.widget_type);
                    return (
                      <div key={w.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 p-3.5">
                          <span className="text-2xl flex-shrink-0">{wt?.emoji || '🧩'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm">{wt?.label || w.widget_type}</p>
                            {w.config.message && <p className="text-[10px] text-gray-400 truncate mt-0.5">{w.config.message}</p>}
                            {w.config.hours_mon && <p className="text-[10px] text-gray-400 mt-0.5">Mon–Fri: {w.config.hours_mon}</p>}
                            {w.config.review1 && <p className="text-[10px] text-gray-400 truncate mt-0.5">"{w.config.review1}"</p>}
                          </div>
                          <button onClick={() => toggleWidget.mutate({ id: w.id, val: !w.is_active })}
                            className={`flex-shrink-0 ${w.is_active ? 'text-green-500' : 'text-gray-300'}`}>
                            {w.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                          </button>
                          <button onClick={() => deleteWidget.mutate(w.id)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Available Widgets */}
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Add Widgets</p>
              <div className="space-y-3">
                {WIDGET_TYPES.map(wt => {
                  const cfg = widgetConfigs[wt.id] || {};
                  const isExpanded = !!widgetConfigs[wt.id];

                  return (
                    <div key={wt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <button onClick={() => setWidgetConfigs(c => isExpanded ? Object.fromEntries(Object.entries(c).filter(([k]) => k !== wt.id)) : { ...c, [wt.id]: {} })}
                        className="w-full flex items-center gap-3 p-4">
                        <span className="text-2xl flex-shrink-0">{wt.emoji}</span>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-gray-900 text-sm">{wt.label}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{wt.desc}</p>
                        </div>
                        <Plus size={16} className={`text-brand-teal transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-gray-50 space-y-3">
                          {wt.id === 'announcement' && (
                            <>
                              <input value={cfg.message || ''} onChange={e => setWidgetConfigs(c => ({ ...c, [wt.id]: { ...c[wt.id], message: e.target.value } }))}
                                placeholder="e.g. Free delivery on orders above ₹500!" className="w-full px-3 py-2 bg-gray-50 rounded-xl text-sm outline-none" />
                              <div className="grid grid-cols-2 gap-2">
                                <select value={cfg.color || '#0d9488'} onChange={e => setWidgetConfigs(c => ({ ...c, [wt.id]: { ...c[wt.id], color: e.target.value } }))}
                                  className="px-3 py-2 bg-gray-50 rounded-xl text-xs outline-none">
                                  <option value="#0d9488">Teal</option>
                                  <option value="#f05a28">Coral</option>
                                  <option value="#16a34a">Green</option>
                                  <option value="#2563eb">Blue</option>
                                  <option value="#dc2626">Red</option>
                                </select>
                              </div>
                            </>
                          )}
                          {wt.id === 'hours' && (
                            <div className="space-y-2">
                              {[['hours_mon', 'Mon – Fri'], ['hours_sat', 'Saturday'], ['hours_sun', 'Sunday']].map(([k, l]) => (
                                <div key={k} className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-gray-500 w-16 flex-shrink-0">{l}</span>
                                  <input value={cfg[k] || ''} onChange={e => setWidgetConfigs(c => ({ ...c, [wt.id]: { ...c[wt.id], [k]: e.target.value } }))}
                                    placeholder="e.g. 9 AM – 8 PM or Closed"
                                    className="flex-1 px-3 py-1.5 bg-gray-50 rounded-xl text-xs outline-none" />
                                </div>
                              ))}
                            </div>
                          )}
                          {wt.id === 'testimonials' && (
                            <div className="space-y-2">
                              {[['review1', 'Review 1', 'name1', 'Name 1'], ['review2', 'Review 2', 'name2', 'Name 2']].map(([rk, rl, nk, nl]) => (
                                <div key={rk} className="space-y-1.5">
                                  <input value={cfg[rk] || ''} onChange={e => setWidgetConfigs(c => ({ ...c, [wt.id]: { ...c[wt.id], [rk]: e.target.value } }))}
                                    placeholder={`${rl} text`} className="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs outline-none" />
                                  <input value={cfg[nk] || ''} onChange={e => setWidgetConfigs(c => ({ ...c, [wt.id]: { ...c[wt.id], [nk]: e.target.value } }))}
                                    placeholder={nl} className="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs outline-none" />
                                </div>
                              ))}
                            </div>
                          )}
                          {wt.id === 'map' && (
                            <>
                              <input value={cfg.embed_url || ''} onChange={e => setWidgetConfigs(c => ({ ...c, [wt.id]: { ...c[wt.id], embed_url: e.target.value } }))}
                                placeholder="Google Maps embed URL (get from maps.google.com Share button)" className="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs outline-none" />
                              <p className="text-[9px] text-gray-400">Go to Google Maps → Share → Embed a map → Copy src URL</p>
                            </>
                          )}
                          {wt.id === 'social' && (
                            <input value={cfg.instagram || ''} onChange={e => setWidgetConfigs(c => ({ ...c, [wt.id]: { ...c[wt.id], instagram: e.target.value } }))}
                              placeholder="Instagram handle (e.g. @priyasboutique)" className="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs outline-none" />
                          )}
                          {wt.id === 'whatsapp_cta' && (
                            <input value={cfg.message || ''} onChange={e => setWidgetConfigs(c => ({ ...c, [wt.id]: { ...c[wt.id], message: e.target.value } }))}
                              placeholder="Chat message (e.g. Hi! I'd like to know more)" className="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs outline-none" />
                          )}

                          <button onClick={() => {
                            addWidget.mutate({ type: wt.id, config: cfg });
                            setWidgetConfigs(c => Object.fromEntries(Object.entries(c).filter(([k]) => k !== wt.id)));
                          }} disabled={addWidget.isPending}
                            className="w-full bg-brand-teal text-white font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
                            {addWidget.isPending ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
                            Add {wt.label}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Product Modal */}
      {productModal.open && website && (
        <ProductFormModal
          websiteId={website.id}
          userId={user.id}
          product={productModal.product}
          onClose={() => setProductModal({ open: false })}
          onSuccess={() => setProductModal({ open: false })}
        />
      )}

      <BottomNav />
    </div>
  );
};

export default WebsiteBuilder;
