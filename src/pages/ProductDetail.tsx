import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Phone, MessageCircle, MapPin, Clock, Eye, Tag, ChevronLeft, ChevronRight, Shield, AlertCircle, Flame, CheckCircle, Package } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const MOCK_PRODUCTS: Record<string, {
  id: string; title: string; category: string; condition: string; price: number; original_price: number;
  location: string; area: string; images: string[]; phone: string; is_sold: boolean; is_negotiable: boolean;
  views: number; created_at: string; description: string;
}> = {
  p1: { id: 'p1', title: 'iPhone 13 - 128GB Blue', category: 'electronics', condition: 'like_new', price: 38000, original_price: 69900, location: 'Manipal', area: 'Manipal', images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&q=80'], phone: '+91 94480 00001', is_sold: false, is_negotiable: true, views: 124, created_at: '2026-06-20', description: 'Used for 8 months. No scratches. Battery health 91%. Original box and accessories included. iOS 17. Face ID works perfectly. Selling because upgrading to iPhone 15.' },
  p2: { id: 'p2', title: 'Samsung 43" Smart TV', category: 'electronics', condition: 'good', price: 18000, original_price: 32000, location: 'Car Street', area: 'Udupi', images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600&q=80'], phone: '+91 82020 00002', is_sold: false, is_negotiable: true, views: 87, created_at: '2026-06-18', description: 'Shifting to another city. 2 years old. No issues. Netflix, YouTube apps working. Remote included. Wall mount not included.' },
  p3: { id: 'p3', title: 'Honda Activa 5G 2021', category: 'vehicles', condition: 'good', price: 55000, original_price: 72000, location: 'Kinnimulki', area: 'Udupi', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'], phone: '+91 98800 00003', is_sold: false, is_negotiable: false, views: 203, created_at: '2026-06-17', description: '2021 model, 22,000 km done. All documents clear. New tyres fitted last month. Serviced at authorised centre. Good mileage, no modifications.' },
  p4: { id: 'p4', title: 'Study Table with Chair', category: 'furniture', condition: 'good', price: 2500, original_price: 5000, location: 'Manipal', area: 'Manipal', images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80'], phone: '+91 82020 00004', is_sold: false, is_negotiable: true, views: 45, created_at: '2026-06-15', description: 'Teak wood table, 4x2 ft. Chair included. Minor scratches on surface. Good for students. Self-pickup only from Manipal.' },
  p5: { id: 'p5', title: 'Canon DSLR 1500D Camera Kit', category: 'electronics', condition: 'like_new', price: 24000, original_price: 42000, location: 'Udupi City', area: 'Udupi', images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80'], phone: '+91 94480 00005', is_sold: false, is_negotiable: true, views: 156, created_at: '2026-06-14', description: 'Rarely used. 2 lenses included (18-55mm and 50mm prime lens). All original accessories, carry bag, and 16GB card. No sensor dust.' },
};

const CONDITION_LABELS: Record<string, string> = {
  new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair',
};

const CONDITION_COLORS: Record<string, string> = {
  new: 'bg-green-100 text-green-700',
  like_new: 'bg-emerald-100 text-emerald-700',
  good: 'bg-blue-100 text-blue-700',
  fair: 'bg-amber-100 text-amber-700',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  electronics: '📱', furniture: '🛋️', vehicles: '🚗', clothing: '👗',
  books: '📚', appliances: '🍳', sports: '⚽', toys: '🧸', other: '📦',
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [imageIndex, setImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const { data: dbProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await supabase.from('used_products').select('*').eq('id', id).single();
      return data;
    },
    enabled: !!id,
  });

  const product = dbProduct || (id ? MOCK_PRODUCTS[id] : null);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pb-24 text-center px-8">
        <Package size={48} className="text-gray-200 mb-3" />
        <h2 className="font-heading font-bold text-gray-700 text-lg">Product not found</h2>
        <button onClick={() => navigate('/used-products')} className="mt-4 bg-brand-teal text-white font-bold px-6 py-2.5 rounded-xl text-sm">
          Browse Products
        </button>
        <BottomNav />
      </div>
    );
  }

  const images: string[] = product.images || [];
  const discount = product.original_price ? Math.round((1 - Number(product.price) / Number(product.original_price)) * 100) : 0;
  const daysAgo = Math.floor((Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24));

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.title, text: `Check out ${product.title} for ₹${Number(product.price).toLocaleString('en-IN')} on UdupiGo`, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur shadow-sm flex items-center justify-between px-4 py-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-heading font-semibold text-gray-900 text-sm truncate flex-1 text-center mx-2">{product.title}</h1>
        <div className="flex items-center gap-1">
          <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-100">
            <Share2 size={18} className="text-gray-600" />
          </button>
          <button onClick={() => setIsSaved(v => !v)} className="p-2 rounded-full hover:bg-gray-100">
            <Heart size={18} className={isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative bg-black aspect-[4/3] overflow-hidden">
        {images.length > 0 ? (
          <>
            <img src={images[imageIndex]} alt={product.title} className="w-full h-full object-contain" />
            {images.length > 1 && (
              <>
                <button onClick={() => setImageIndex(i => Math.max(0, i - 1))} disabled={imageIndex === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center disabled:opacity-30">
                  <ChevronLeft size={18} className="text-white" />
                </button>
                <button onClick={() => setImageIndex(i => Math.min(images.length - 1, i + 1))} disabled={imageIndex === images.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center disabled:opacity-30">
                  <ChevronRight size={18} className="text-white" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setImageIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === imageIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Package size={64} className="text-gray-300" />
          </div>
        )}
        {product.is_sold && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-white text-gray-900 font-heading font-bold text-xl px-6 py-2 rounded-full">SOLD</span>
          </div>
        )}
        {discount >= 10 && !product.is_sold && (
          <span className="absolute top-3 left-3 bg-brand-coral text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
            <Flame size={12} />{discount}% OFF
          </span>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Price & Title */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h2 className="font-heading font-bold text-gray-900 text-lg leading-tight">{product.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${CONDITION_COLORS[product.condition] || 'bg-gray-100 text-gray-600'}`}>
                  {CONDITION_LABELS[product.condition] || product.condition}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  {CATEGORY_EMOJIS[product.category]} {product.category}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-end gap-3 mt-3">
            <span className="font-heading font-bold text-brand-teal text-3xl">₹{Number(product.price).toLocaleString('en-IN')}</span>
            {product.original_price && (
              <div className="mb-1">
                <span className="text-gray-400 line-through text-sm">₹{Number(product.original_price).toLocaleString('en-IN')}</span>
                {discount >= 5 && <span className="text-brand-coral text-xs font-bold ml-1">Save ₹{(Number(product.original_price) - Number(product.price)).toLocaleString('en-IN')}</span>}
              </div>
            )}
          </div>
          {product.is_negotiable && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 px-2.5 py-1 rounded-lg mt-2">
              <CheckCircle size={11} /> Price is negotiable
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
          <div className="flex justify-between">
            {[
              { icon: MapPin, label: product.area || product.location },
              { icon: Clock, label: daysAgo === 0 ? 'Today' : `${daysAgo}d ago` },
              { icon: Eye, label: `${product.views || 0} views` },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <Icon size={13} className="text-gray-400" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
              <Tag size={14} className="text-brand-teal" /> Description
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Safety */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <div className="flex items-start gap-2.5">
            <Shield size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-gray-900">Safety Tips</h3>
              <ul className="mt-1.5 space-y-1">
                {['Meet in a public place', 'Inspect before paying', 'Never pay in advance', "Don't share OTP/UPI PIN"].map(tip => (
                  <li key={tip} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <AlertCircle size={10} className="text-amber-500 flex-shrink-0" />{tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Similar */}
        <div>
          <h3 className="font-heading font-bold text-sm text-gray-900 mb-3">Similar Listings</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {Object.values(MOCK_PRODUCTS)
              .filter(p => p.id !== id && p.category === product.category)
              .slice(0, 4)
              .map(p => (
                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)}
                  className="flex-shrink-0 w-28 cursor-pointer">
                  <div className="w-28 h-24 rounded-xl overflow-hidden bg-gray-100">
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] font-medium text-gray-800 mt-1 line-clamp-2">{p.title}</p>
                  <p className="text-[10px] font-bold text-brand-teal">₹{p.price.toLocaleString('en-IN')}</p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      {!product.is_sold && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-30">
          <a
            href={`https://wa.me/${product.phone?.replace(/\D/g, '')}?text=Hi, I saw your listing for "${product.title}" on UdupiGo for ₹${Number(product.price).toLocaleString('en-IN')}. Is it still available?`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3.5 rounded-xl text-sm active:scale-[0.98] transition-transform"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
          <a
            href={`tel:${product.phone}`}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-teal text-white font-bold py-3.5 rounded-xl text-sm active:scale-[0.98] transition-transform"
          >
            <Phone size={16} /> Call Seller
          </a>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ProductDetail;
