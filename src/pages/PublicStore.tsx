import { useState } from 'react';
import { Phone, MessageCircle, MapPin, Search, ShoppingCart, Star, CheckCircle, X, RefreshCw, ChevronDown, Instagram, Facebook, ExternalLink, ArrowUp, Info, Clock, Megaphone } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────
interface UserWebsite {
  id: string;
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
  is_published: boolean;
  total_views: number;
}

interface WebsiteProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category: string;
  images?: string[];
  in_stock: boolean;
  is_featured: boolean;
}

interface OrderForm {
  customer_name: string;
  customer_phone: string;
  customer_message: string;
  quantity: number;
}

// ─── Order Modal ────────────────────────────────────────────────────────────
const OrderModal = ({
  product, website, onClose,
}: { product: WebsiteProduct; website: UserWebsite; onClose: () => void }) => {
  const [form, setForm] = useState<OrderForm>({ customer_name: '', customer_phone: '', customer_message: '', quantity: 1 });
  const [success, setSuccess] = useState(false);

  const mut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('website_orders').insert({
        website_id: website.id,
        product_id: product.id,
        product_name: product.name,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_message: form.customer_message || null,
        quantity: form.quantity,
        total_amount: product.price * form.quantity,
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => setSuccess(true),
    onError: (e: Error) => toast.error(e.message),
  });

  const handleWhatsApp = () => {
    if (!form.customer_name || !form.customer_phone) { toast.error('Please fill your name and phone'); return; }
    const waNum = website.whatsapp_number || website.phone || '';
    const phone = waNum.replace(/[\s+\-()]/g, '');
    const msg = encodeURIComponent(
      `Hi! I'd like to order:\n\n` +
      `*Product:* ${product.name}\n` +
      `*Qty:* ${form.quantity}\n` +
      `*Price:* ₹${(product.price * form.quantity).toLocaleString('en-IN')}\n\n` +
      `*My Details:*\nName: ${form.customer_name}\nPhone: ${form.customer_phone}` +
      (form.customer_message ? `\nNote: ${form.customer_message}` : '')
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    mut.mutate();
  };

  const tc = website.theme_color || '#0d9488';
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={onClose}>
      <div className="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h3 className="font-heading font-bold text-gray-900 text-lg">Order via WhatsApp</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2">Order Sent!</h3>
            <p className="text-gray-500 text-sm mb-4">Your order for <strong>{product.name}</strong> has been received. The seller will contact you shortly on WhatsApp.</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-green-500 text-white font-bold rounded-xl text-sm">Done</button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Product summary */}
            <div className="flex gap-3 p-3 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>}
              </div>
              <div>
                <p className="font-heading font-bold text-gray-900 text-sm">{product.name}</p>
                <p className="font-bold text-lg mt-0.5" style={{ color: tc }}>₹{product.price.toLocaleString('en-IN')}</p>
                {discount > 0 && <p className="text-[10px] text-green-600 font-bold">{discount}% OFF</p>}
              </div>
            </div>

            {/* Qty */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold hover:bg-gray-200">−</button>
                <span className="text-xl font-heading font-bold text-gray-900 w-8 text-center">{form.quantity}</span>
                <button onClick={() => setForm(f => ({ ...f, quantity: f.quantity + 1 }))} className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold text-white hover:opacity-90" style={{ backgroundColor: tc }}>+</button>
                <div className="ml-2">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="font-bold text-gray-900">₹{(product.price * form.quantity).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Customer details */}
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Your Name *</label>
              <input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                placeholder="Full name" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 border border-transparent"
                style={{ '--tw-ring-color': tc } as React.CSSProperties} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Phone Number *</label>
              <input value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))}
                placeholder="+91 XXXXX XXXXX" type="tel" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 border border-transparent" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Message (Optional)</label>
              <textarea value={form.customer_message} onChange={e => setForm(f => ({ ...f, customer_message: e.target.value }))}
                placeholder="Special instructions, color/size preference, delivery notes..." rows={2}
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 border border-transparent resize-none" />
            </div>

            <button onClick={handleWhatsApp} disabled={!form.customer_name || !form.customer_phone || mut.isPending}
              className="w-full bg-green-500 text-white font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-green-600 active:scale-[0.98] transition-all disabled:opacity-60">
              {mut.isPending ? <RefreshCw size={16} className="animate-spin" /> : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              )}
              Order via WhatsApp · ₹{(product.price * form.quantity).toLocaleString('en-IN')}
            </button>

            <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
              <Info size={9} /> Your details will be sent to the seller's WhatsApp
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Product Card ────────────────────────────────────────────────────────────
const ProductCard = ({ product, themeColor, onOrder }: { product: WebsiteProduct; themeColor: string; onOrder: (p: WebsiteProduct) => void }) => {
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="relative aspect-square bg-gray-100">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🛍️</div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">-{discount}%</div>
        )}
        {product.is_featured && (
          <div className="absolute top-2 right-2 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
            <Star size={8} fill="white" /> Top Pick
          </div>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 font-bold text-xs px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-heading font-bold text-gray-900 text-sm line-clamp-2 leading-tight">{product.name}</p>
        {product.description && <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{product.description}</p>}
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="font-bold text-base" style={{ color: themeColor }}>₹{product.price.toLocaleString('en-IN')}</span>
          {product.original_price && (
            <span className="text-[10px] text-gray-400 line-through">₹{product.original_price.toLocaleString('en-IN')}</span>
          )}
        </div>
        <button
          onClick={() => product.in_stock && onOrder(product)}
          disabled={!product.in_stock}
          className="mt-2.5 w-full text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: product.in_stock ? themeColor : '#9ca3af' }}
        >
          <ShoppingCart size={12} /> {product.in_stock ? 'Buy via WhatsApp' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

// ─── Main Public Store ────────────────────────────────────────────────────────
const PublicStore = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [orderProduct, setOrderProduct] = useState<WebsiteProduct | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [activePage, setActivePage] = useState<string | null>(null);

  // Load pages
  const { data: pages = [] } = useQuery({
    queryKey: ['public_pages', website?.id],
    enabled: !!website?.id,
    queryFn: async () => {
      const { data } = await supabase.from('website_pages').select('*').eq('website_id', website!.id).eq('is_published', true).order('sort_order', { ascending: true });
      return (data || []) as { id: string; title: string; slug: string; content: string; page_type: string }[];
    },
  });

  // Load widgets
  const { data: widgets = [] } = useQuery({
    queryKey: ['public_widgets', website?.id],
    enabled: !!website?.id,
    queryFn: async () => {
      const { data } = await supabase.from('website_widgets').select('*').eq('website_id', website!.id).eq('is_active', true).order('sort_order', { ascending: true });
      return (data || []) as { id: string; widget_type: string; config: Record<string, string> }[];
    },
  });

  // Load website
  const { data: website, isLoading } = useQuery({
    queryKey: ['public_store', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_websites').select('*').eq('slug', slug!).eq('is_published', true).single();
      if (error) return null;
      // Increment views
      supabase.from('user_websites').update({ total_views: (data.total_views || 0) + 1 }).eq('id', data.id).then(() => {});
      return data as UserWebsite;
    },
  });

  // Load products
  const { data: products = [] } = useQuery({
    queryKey: ['public_products', website?.id],
    enabled: !!website?.id,
    queryFn: async () => {
      const { data } = await supabase.from('website_products').select('*').eq('website_id', website!.id).eq('in_stock', true).order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      return (data || []) as WebsiteProduct[];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={32} className="animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🏪</p>
          <h2 className="font-heading font-bold text-gray-900 text-xl mb-2">Store Not Found</h2>
          <p className="text-gray-500 text-sm mb-4">This store may not exist or is currently unpublished.</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-brand-teal text-white font-bold rounded-xl text-sm">Go to UdupiGo Home</button>
        </div>
      </div>
    );
  }

  const tc = website.theme_color || '#0d9488';
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCat;
  });
  const featuredProducts = products.filter(p => p.is_featured);

  const announcementWidget = widgets.find(w => w.widget_type === 'announcement');
  const hoursWidget = widgets.find(w => w.widget_type === 'hours');
  const testimonialsWidget = widgets.find(w => w.widget_type === 'testimonials');
  const mapWidget = widgets.find(w => w.widget_type === 'map');
  const whatsappCtaWidget = widgets.find(w => w.widget_type === 'whatsapp_cta');

  const currentPage = activePage ? pages.find(p => p.slug === activePage) : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      {/* ── HEADER ── */}
      <div className="sticky top-0 z-40 shadow-sm" style={{ backgroundColor: tc }}>
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Logo */}
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {website.logo_url ? (
              <img src={website.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-lg">{website.business_name[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-white text-base leading-tight truncate">{website.business_name}</h1>
            {website.tagline && <p className="text-white/70 text-[10px] truncate">{website.tagline}</p>}
          </div>
          {website.phone && (
            <a href={`tel:${website.phone}`} className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 hover:bg-white/30">
              <Phone size={16} className="text-white" />
            </a>
          )}
          {website.whatsapp_number && (
            <a href={`https://wa.me/${website.whatsapp_number.replace(/[\s+\-()]/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 hover:bg-green-600">
              <MessageCircle size={16} className="text-white" />
            </a>
          )}
        </div>
      </div>

      {/* ── ANNOUNCEMENT BANNER ── */}
      {announcementWidget && (
        <div className="px-4 py-2.5 text-white text-xs font-bold text-center flex items-center justify-center gap-2" style={{ backgroundColor: announcementWidget.config.color || tc }}>
          <Megaphone size={12} />
          {announcementWidget.config.message}
        </div>
      )}

      {/* ── PAGE TABS ── */}
      {pages.length > 0 && (
        <div className="flex gap-2 px-4 pt-3 overflow-x-auto scrollbar-hide">
          <button onClick={() => setActivePage(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${!activePage ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600'}`}
            style={!activePage ? { backgroundColor: tc, borderColor: tc } : {}}>
            🛍️ Shop
          </button>
          {pages.map(pg => (
            <button key={pg.id} onClick={() => setActivePage(pg.slug)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${activePage === pg.slug ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600'}`}
              style={activePage === pg.slug ? { backgroundColor: tc, borderColor: tc } : {}}>
              {pg.title}
            </button>
          ))}
        </div>
      )}

      {/* ── CUSTOM PAGE VIEW ── */}
      {currentPage && (
        <div className="px-4 pt-4 pb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-heading font-bold text-xl text-gray-900 mb-3" style={{ color: tc }}>{currentPage.title}</h2>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{currentPage.content || 'Coming soon...'}</div>
          </div>
        </div>
      )}

      {/* ── HERO BANNER ── */}
      {website.banner_url ? (
        <div className="relative h-48 overflow-hidden">
          <img src={website.banner_url} alt={website.business_name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4">
            <p className="text-white font-heading font-bold text-xl">{website.business_name}</p>
            {website.tagline && <p className="text-white/80 text-xs mt-0.5">{website.tagline}</p>}
          </div>
        </div>
      ) : (
        <div className="h-36 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${tc}, ${tc}99)` }}>
          <div className="text-center text-white">
            <p className="font-heading font-bold text-2xl">{website.business_name}</p>
            {website.tagline && <p className="text-white/80 text-sm mt-1">{website.tagline}</p>}
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/80 text-xs font-medium">Online Store · {products.length} Products</span>
            </div>
          </div>
        </div>
      )}

      {/* ── STATS ROW ── */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
          <div className="text-center flex-1 border-r border-gray-100">
            <p className="font-bold text-lg text-gray-900">{products.length}</p>
            <p className="text-[10px] text-gray-400">Products</p>
          </div>
          <div className="text-center flex-1 border-r border-gray-100">
            <p className="font-bold text-lg text-gray-900">{website.total_views}</p>
            <p className="text-[10px] text-gray-400">Views</p>
          </div>
          <div className="text-center flex-1">
            <p className="font-bold text-sm text-green-600 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Open
            </p>
            <p className="text-[10px] text-gray-400">{website.category}</p>
          </div>
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ── */}
      {featuredProducts.length > 0 && (
        <div className="px-4 mb-4">
          <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
            <Star size={12} style={{ color: tc }} fill={tc} /> Top Picks
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {featuredProducts.map(p => (
              <div key={p.id} className="flex-shrink-0 w-40 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                onClick={() => setOrderProduct(p)}>
                <div className="h-32 bg-gray-100 overflow-hidden">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>}
                </div>
                <div className="p-2.5">
                  <p className="font-bold text-gray-900 text-xs line-clamp-1">{p.name}</p>
                  <p className="font-bold text-sm mt-0.5" style={{ color: tc }}>₹{p.price.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SEARCH ── */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${website.business_name} products...`}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none shadow-sm" />
        </div>
      </div>

      {/* ── CATEGORY FILTER ── */}
      {categories.length > 2 && (
        <div className="flex gap-2 px-4 mb-4 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${activeCategory === cat ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600'}`}
              style={activeCategory === cat ? { backgroundColor: tc, borderColor: tc } : {}}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ── PRODUCTS GRID ── */}
      <div className="px-4 pb-6">
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-semibold text-gray-700">No products yet</p>
            <p className="text-sm text-gray-400 mt-1">Check back soon!</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-semibold text-gray-700 text-sm">No products found</p>
            <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="mt-2 text-xs font-bold px-4 py-1.5 rounded-lg text-white" style={{ backgroundColor: tc }}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 font-medium mb-3">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} themeColor={tc} onOrder={setOrderProduct} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── ABOUT SECTION ── */}
      {(website.about || website.address) && (
        <div className="mx-4 mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button onClick={() => setShowAbout(!showAbout)} className="w-full flex items-center justify-between p-4">
            <p className="font-heading font-bold text-gray-900 text-sm">About {website.business_name}</p>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showAbout ? 'rotate-180' : ''}`} />
          </button>
          {showAbout && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
              {website.about && <p className="text-xs text-gray-500 leading-relaxed mt-3">{website.about}</p>}
              {website.address && (
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <MapPin size={13} className="flex-shrink-0 mt-0.5" style={{ color: tc }} />
                  <span>{website.address}</span>
                </div>
              )}
              {website.phone && (
                <a href={`tel:${website.phone}`} className="flex items-center gap-2 text-xs font-semibold" style={{ color: tc }}>
                  <Phone size={12} /> {website.phone}
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── CONTACT BAR ── */}
      <div className="mx-4 mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-bold text-gray-700 mb-3">Contact</p>
        <div className="flex gap-2 flex-wrap">
          {website.phone && (
            <a href={`tel:${website.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl text-white"
              style={{ backgroundColor: tc, minWidth: '80px' }}>
              <Phone size={13} /> Call
            </a>
          )}
          {website.whatsapp_number && (
            <a href={`https://wa.me/${website.whatsapp_number.replace(/[\s+\-()]/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600"
              style={{ minWidth: '80px' }}>
              <MessageCircle size={13} /> WhatsApp
            </a>
          )}
          {website.instagram_url && (
            <a href={website.instagram_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-pink-500 text-white text-xs font-bold rounded-xl hover:bg-pink-600"
              style={{ minWidth: '80px' }}>
              <Instagram size={13} /> Instagram
            </a>
          )}
          {website.facebook_url && (
            <a href={website.facebook_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
              style={{ minWidth: '80px' }}>
              <Facebook size={13} /> Facebook
            </a>
          )}
        </div>
      </div>

      {/* ── HOURS WIDGET ── */}
      {!currentPage && hoursWidget && (
        <div className="mx-4 mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} style={{ color: tc }} />
            <p className="text-xs font-bold text-gray-800">Business Hours</p>
          </div>
          <div className="space-y-1.5">
            {[['hours_mon', 'Mon – Fri'], ['hours_sat', 'Saturday'], ['hours_sun', 'Sunday']].map(([k, l]) => hoursWidget.config[k] && (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-gray-400 font-medium">{l}</span>
                <span className={`font-semibold ${hoursWidget.config[k]?.toLowerCase() === 'closed' ? 'text-red-500' : 'text-gray-800'}`}>{hoursWidget.config[k]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TESTIMONIALS WIDGET ── */}
      {!currentPage && testimonialsWidget && (testimonialsWidget.config.review1 || testimonialsWidget.config.review2) && (
        <div className="mx-4 mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} style={{ color: tc }} fill={tc} />
            <p className="text-xs font-bold text-gray-800">What Customers Say</p>
          </div>
          <div className="space-y-3">
            {[['review1', 'name1'], ['review2', 'name2']].map(([rk, nk]) => testimonialsWidget.config[rk] && (
              <div key={rk} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-600 italic">"{testimonialsWidget.config[rk]}"</p>
                {testimonialsWidget.config[nk] && <p className="text-[10px] font-bold mt-1.5" style={{ color: tc }}>— {testimonialsWidget.config[nk]}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MAP WIDGET ── */}
      {!currentPage && mapWidget?.config.embed_url && (
        <div className="mx-4 mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 p-3 border-b border-gray-50">
            <MapPin size={13} style={{ color: tc }} />
            <p className="text-xs font-bold text-gray-800">Find Us</p>
          </div>
          <iframe src={mapWidget.config.embed_url} width="100%" height="200" style={{ border: 0 }} loading="lazy" allowFullScreen />
        </div>
      )}

      {/* ── FOOTER ── */}
      <div className="mx-4 mb-6 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] text-gray-400 mb-1">Powered by</p>
          <p className="font-heading font-bold text-sm">
            <span className="text-brand-teal">Udupi</span><span className="text-brand-coral">Go</span>
          </p>
          <p className="text-[9px] text-gray-300 mt-0.5">Local Business · Digital India</p>
          <button onClick={() => navigate('/website-builder')}
            className="mt-3 text-xs font-bold px-4 py-2 rounded-xl text-white flex items-center gap-1.5 mx-auto"
            style={{ backgroundColor: tc }}>
            Create Your Own Store →
          </button>
        </div>
      </div>

      {/* ── WHATSAPP STICKY CTA ── */}
      {whatsappCtaWidget && website.whatsapp_number && (
        <div className="fixed bottom-16 right-4 z-30">
          <a href={`https://wa.me/${website.whatsapp_number.replace(/[\s+\-()]/g, '')}?text=${encodeURIComponent(whatsappCtaWidget.config.message || 'Hi! I want to know more')}`}
            target="_blank" rel="noopener noreferrer"
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 active:scale-95 transition-all">
            <MessageCircle size={26} className="text-white" />
          </a>
        </div>
      )}

      {/* Order Modal */}
      {orderProduct && (
        <OrderModal product={orderProduct} website={website} onClose={() => setOrderProduct(null)} />
      )}
    </div>
  );
};

export default PublicStore;
