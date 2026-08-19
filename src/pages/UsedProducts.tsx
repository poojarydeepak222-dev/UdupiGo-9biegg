import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, SlidersHorizontal, Tag, MapPin, Clock, Heart, Plus, Package, ChevronRight, Flame } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🛍️' },
  { id: 'electronics', label: 'Electronics', emoji: '📱' },
  { id: 'furniture', label: 'Furniture', emoji: '🛋️' },
  { id: 'vehicles', label: 'Vehicles', emoji: '🚗' },
  { id: 'clothing', label: 'Clothing', emoji: '👗' },
  { id: 'books', label: 'Books', emoji: '📚' },
  { id: 'appliances', label: 'Appliances', emoji: '🍳' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'toys', label: 'Toys', emoji: '🧸' },
  { id: 'other', label: 'Other', emoji: '📦' },
];

const CONDITION_COLORS: Record<string, string> = {
  new: 'bg-green-100 text-green-700',
  like_new: 'bg-emerald-100 text-emerald-700',
  good: 'bg-blue-100 text-blue-700',
  fair: 'bg-amber-100 text-amber-700',
};

const CONDITION_LABELS: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
};

const MOCK_PRODUCTS = [
  { id: 'p1', title: 'iPhone 13 - 128GB Blue', category: 'electronics', condition: 'like_new', price: 38000, original_price: 69900, location: 'Manipal', area: 'Manipal', images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&q=80'], phone: '+91 94480 00001', is_sold: false, is_negotiable: true, views: 124, created_at: '2026-06-20', description: 'Used for 8 months. No scratches. Battery health 91%. Original box and accessories included.' },
  { id: 'p2', title: 'Samsung 43" Smart TV', category: 'electronics', condition: 'good', price: 18000, original_price: 32000, location: 'Car Street', area: 'Udupi', images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=400&q=80'], phone: '+91 82020 00002', is_sold: false, is_negotiable: true, views: 87, created_at: '2026-06-18', description: 'Shifting to another city. 2 years old. No issues. Netflix, YouTube apps working.' },
  { id: 'p3', title: 'Honda Activa 5G 2021', category: 'vehicles', condition: 'good', price: 55000, original_price: 72000, location: 'Kinnimulki', area: 'Udupi', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'], phone: '+91 98800 00003', is_sold: false, is_negotiable: false, views: 203, created_at: '2026-06-17', description: '2021 model, 22,000 km done. All documents clear. New tyres fitted last month.' },
  { id: 'p4', title: 'Study Table with Chair', category: 'furniture', condition: 'good', price: 2500, original_price: 5000, location: 'Manipal', area: 'Manipal', images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80'], phone: '+91 82020 00004', is_sold: false, is_negotiable: true, views: 45, created_at: '2026-06-15', description: 'Teak wood table, 4x2 ft. Chair included. Minor scratches on surface. Good for students.' },
  { id: 'p5', title: 'Canon DSLR 1500D Camera Kit', category: 'electronics', condition: 'like_new', price: 24000, original_price: 42000, location: 'Udupi City', area: 'Udupi', images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80'], phone: '+91 94480 00005', is_sold: false, is_negotiable: true, views: 156, created_at: '2026-06-14', description: 'Rarely used. 2 lenses included (18-55mm and 50mm). All original accessories.' },
  { id: 'p6', title: 'LG Washing Machine 6.5kg', category: 'appliances', condition: 'good', price: 8000, original_price: 18000, location: 'Manipal', area: 'Manipal', images: ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&q=80'], phone: '+91 82020 00006', is_sold: false, is_negotiable: true, views: 67, created_at: '2026-06-12', description: 'Working perfectly. 3 years old. Front load. Selling due to shift to new apartment.' },
  { id: 'p7', title: 'Engineering Textbooks Set (1st Year)', category: 'books', condition: 'good', price: 800, original_price: 2500, location: 'Manipal', area: 'Manipal', images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80'], phone: '+91 97400 00007', is_sold: false, is_negotiable: true, views: 32, created_at: '2026-06-10', description: 'Complete set of 1st year engineering books for MAHE. Minor highlights. All subjects.' },
  { id: 'p8', title: 'Refrigerator 165L Samsung', category: 'appliances', condition: 'good', price: 6500, original_price: 14000, location: 'Thenkpete', area: 'Udupi', images: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80'], phone: '+91 82020 00008', is_sold: false, is_negotiable: false, views: 91, created_at: '2026-06-08', description: '4 year old, single door. Cooling perfect. Minor dent at the back. Buyer pickup only.' },
  { id: 'p9', title: 'Gym Dumbbells Set 40kg', category: 'sports', condition: 'like_new', price: 3200, original_price: 6000, location: 'Kunjibettu', area: 'Udupi', images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80'], phone: '+91 94480 00009', is_sold: false, is_negotiable: true, views: 28, created_at: '2026-06-07', description: 'Cast iron dumbbells. Used only 3 months at home gym. Selling as relocation.' },
  { id: 'p10', title: 'Kids Bicycle 20" Blue', category: 'toys', condition: 'good', price: 1800, original_price: 4500, location: 'Manipal', area: 'Manipal', images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&q=80'], phone: '+91 82020 00010', is_sold: false, is_negotiable: true, views: 19, created_at: '2026-06-05', description: 'Age 6-10 years. Working perfectly. Minor scratches. Training wheels included.' },
];

const UsedProducts = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest');
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const { data: dbProducts = [] } = useQuery({
    queryKey: ['used_products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('used_products')
        .select('*')
        .eq('is_sold', false)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const allProducts = dbProducts.length > 0 ? dbProducts : MOCK_PRODUCTS;

  const filtered = allProducts
    .filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return Number(a.price) - Number(b.price);
      if (sortBy === 'price_high') return Number(b.price) - Number(a.price);
      if (sortBy === 'popular') return Number(b.views || 0) - Number(a.views || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const toggleSave = (id: string) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const discount = (orig: number, price: number) => orig ? Math.round((1 - price / orig) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search used products in Udupi..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-brand-teal/20 transition-all"
            />
          </div>
          <button className="p-2.5 bg-gray-100 rounded-xl relative">
            <SlidersHorizontal size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === cat.id ? 'bg-brand-teal text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <span>{cat.emoji}</span>{cat.label}
            </button>
          ))}
        </div>

        {/* Sort + Stats */}
        <div className="flex items-center justify-between px-4 pb-3">
          <p className="text-xs text-gray-500">{filtered.length} items found</p>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs bg-gray-100 rounded-lg px-2 py-1.5 outline-none text-gray-700">
            <option value="newest">Newest First</option>
            <option value="popular">Most Viewed</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Sell CTA Banner */}
      <div
        onClick={() => navigate('/sell-product')}
        className="mx-4 mt-3 bg-gradient-to-r from-brand-coral to-orange-500 rounded-2xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Plus size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">Sell Something?</p>
          <p className="text-white/80 text-xs">Post your used item free — reach buyers in Udupi</p>
        </div>
        <ChevronRight size={18} className="text-white/70" />
      </div>

      {/* Products Grid */}
      <div className="px-4 mt-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={48} className="text-gray-200 mx-auto mb-3" />
            <h3 className="font-heading font-semibold text-gray-700">No products found</h3>
            <p className="text-gray-500 text-sm mt-1">Try a different search or category</p>
            <button onClick={() => navigate('/sell-product')} className="mt-4 bg-brand-teal text-white font-bold px-6 py-2.5 rounded-xl text-sm">
              Be the first to sell
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(product => {
              const disc = discount(Number(product.original_price), Number(product.price));
              const isSaved = savedIds.includes(product.id);
              return (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} className="text-gray-300" />
                      </div>
                    )}
                    {/* Badges */}
                    {disc >= 10 && (
                      <span className="absolute top-2 left-2 bg-brand-coral text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Flame size={9} />{disc}% off
                      </span>
                    )}
                    {product.is_sold && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white text-gray-800 font-bold text-xs px-3 py-1 rounded-full">SOLD</span>
                      </div>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); toggleSave(product.id); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
                    >
                      <Heart size={13} className={isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-2.5" onClick={() => navigate(`/product/${product.id}`)} role="button">
                    <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">{product.title}</p>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1.5 ${CONDITION_COLORS[product.condition] || 'bg-gray-100 text-gray-600'}`}>
                      {CONDITION_LABELS[product.condition] || product.condition}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="font-heading font-bold text-brand-teal text-sm">₹{Number(product.price).toLocaleString('en-IN')}</span>
                      {product.original_price && (
                        <span className="text-[10px] text-gray-400 line-through">₹{Number(product.original_price).toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={9} className="text-gray-400" />
                      <span className="text-[10px] text-gray-500 truncate">{product.area || product.location}</span>
                    </div>
                    {product.is_negotiable && (
                      <span className="text-[9px] text-green-600 font-medium">Negotiable</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recently Posted */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-bold text-gray-900 text-sm flex items-center gap-1.5">
            <Clock size={14} className="text-brand-teal" /> Just Posted
          </h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {MOCK_PRODUCTS.slice(0, 5).map(p => (
            <div key={p.id + 'recent'} onClick={() => navigate(`/product/${p.id}`)}
              className="flex-shrink-0 w-28 cursor-pointer">
              <div className="w-28 h-24 rounded-xl overflow-hidden bg-gray-100">
                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <p className="text-[10px] font-medium text-gray-800 mt-1 line-clamp-2 leading-tight">{p.title}</p>
              <p className="text-[10px] font-bold text-brand-teal">₹{Number(p.price).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Tips */}
      <div className="mx-4 mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <h3 className="font-semibold text-sm text-gray-900 mb-2">🛡️ Safety Tips for Buyers</h3>
        {[
          'Always meet sellers in a public place',
          'Inspect the product before payment',
          'Never pay advance without seeing the item',
          'Prefer UdupiGo verified sellers',
        ].map((tip, i) => (
          <p key={i} className="text-xs text-gray-600 mt-1.5 flex items-start gap-1.5">
            <span className="text-amber-500 font-bold flex-shrink-0">•</span>{tip}
          </p>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default UsedProducts;
