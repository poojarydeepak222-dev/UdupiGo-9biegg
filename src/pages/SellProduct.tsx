import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, X, Plus, Tag, MapPin, Phone, IndianRupee, FileText, CheckCircle, Loader2, Info } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { useAuthStore } from '@/hooks/useAuth';
import AuthModal from '@/components/features/AuthModal';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const CATEGORIES = [
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

const CONDITIONS = [
  { id: 'new', label: 'New', desc: 'Unused, sealed', color: 'border-green-400 bg-green-50 text-green-700' },
  { id: 'like_new', label: 'Like New', desc: 'Used once or twice', color: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
  { id: 'good', label: 'Good', desc: 'Minor signs of use', color: 'border-blue-400 bg-blue-50 text-blue-700' },
  { id: 'fair', label: 'Fair', desc: 'Visible wear', color: 'border-amber-400 bg-amber-50 text-amber-700' },
];

const UDUPI_AREAS = [
  'Udupi City', 'Manipal', 'Kinnimulki', 'Car Street', 'Thenkpete', 'Kunjibettu',
  'Malpe', 'Kapu', 'Brahmavar', 'Kundapura', 'Hebri', 'Byndoor',
];

interface FormData {
  title: string;
  description: string;
  category: string;
  condition: string;
  price: string;
  original_price: string;
  is_negotiable: boolean;
  area: string;
  phone: string;
}

const SellProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    condition: '',
    price: '',
    original_price: '',
    is_negotiable: true,
    area: '',
    phone: user?.email?.split('@')[0] || '',
  });

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (uploadedImages.length + files.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => [...prev, reader.result as string]);
        setImageFiles(prev => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (!user) return [];
    const urls: string[] = [];
    for (const file of imageFiles) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
        urls.push(publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setAuthOpen(true); return; }
    if (!form.title.trim()) { toast.error('Please enter a product title'); return; }
    if (!form.category) { toast.error('Please select a category'); return; }
    if (!form.condition) { toast.error('Please select item condition'); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error('Please enter a valid price'); return; }
    if (!form.area) { toast.error('Please select your area'); return; }
    if (!form.phone.trim()) { toast.error('Please enter your phone number'); return; }

    setSubmitting(true);
    try {
      const imageUrls = await uploadImages();
      const { error } = await supabase.from('used_products').insert({
        seller_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        condition: form.condition,
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        is_negotiable: form.is_negotiable,
        area: form.area,
        location: form.area,
        phone: form.phone.trim(),
        images: imageUrls,
      });
      if (error) throw error;
      toast.success('Product listed successfully! Buyers can now find it.');
      navigate('/used-products');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to post listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8 text-center pb-24">
        <div className="w-20 h-20 bg-brand-coral/10 rounded-3xl flex items-center justify-center mb-4">
          <Tag size={36} className="text-brand-coral" />
        </div>
        <h2 className="font-heading font-bold text-gray-900 text-xl mb-2">Sell Your Used Items</h2>
        <p className="text-gray-500 text-sm mb-6">Sign in to post your used products and reach thousands of buyers in Udupi.</p>
        <button onClick={() => setAuthOpen(true)} className="bg-brand-teal text-white font-bold px-8 py-3.5 rounded-xl">Sign In to Sell</button>
        <BottomNav />
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-heading font-bold text-gray-900 text-lg">Sell Used Item</h1>
          <p className="text-xs text-gray-500">Free listing · Reach Udupi buyers instantly</p>
        </div>
        <span className="ml-auto bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full">FREE</span>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5">
        {/* Photos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Camera size={16} className="text-brand-teal" />
            <h3 className="font-semibold text-sm text-gray-900">Photos</h3>
            <span className="text-xs text-gray-400">({uploadedImages.length}/4)</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {uploadedImages.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                  <X size={10} className="text-white" />
                </button>
                {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-brand-teal/80 text-white text-[8px] text-center py-0.5 font-bold">MAIN</span>}
              </div>
            ))}
            {uploadedImages.length < 4 && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-brand-teal hover:bg-brand-teal/5 transition-colors">
                <Plus size={20} className="text-gray-400" />
                <span className="text-[9px] text-gray-400 font-medium">Add Photo</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
          </div>
          <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
            <Info size={10} />First photo will be the main listing image. Max 4 photos.
          </p>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} className="text-brand-teal" />
            <h3 className="font-semibold text-sm text-gray-900">Product Details</h3>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Product Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. iPhone 13 128GB — Space Grey"
              maxLength={80}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/15 transition-all"
              required
            />
            <p className="text-[10px] text-gray-400 mt-1 text-right">{form.title.length}/80</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.id} type="button" onClick={() => set('category', cat.id)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${form.category === cat.id ? 'border-brand-teal bg-brand-teal/5 text-brand-teal' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <span className="text-lg">{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Condition <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map(cond => (
                <button key={cond.id} type="button" onClick={() => set('condition', cond.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${form.condition === cond.id ? cond.color + ' border-current' : 'border-gray-200 hover:border-gray-300'}`}>
                  <p className="text-xs font-bold">{cond.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{cond.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe the item — brand, age, reason for selling, any damage..."
              rows={4}
              maxLength={500}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/15 transition-all resize-none"
            />
            <p className="text-[10px] text-gray-400 mt-1 text-right">{form.description.length}/500</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee size={16} className="text-brand-teal" />
            <h3 className="font-semibold text-sm text-gray-900">Pricing</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Asking Price <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">₹</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                  placeholder="0"
                  min={0}
                  className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-teal focus:bg-white transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Original Price (optional)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">₹</span>
                <input
                  type="number"
                  value={form.original_price}
                  onChange={e => set('original_price', e.target.value)}
                  placeholder="0"
                  min={0}
                  className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-teal focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Negotiable toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">Price Negotiable</p>
              <p className="text-[10px] text-gray-500">Let buyers know they can bargain</p>
            </div>
            <button type="button" onClick={() => set('is_negotiable', !form.is_negotiable)}
              className={`w-12 h-6 rounded-full transition-colors relative ${form.is_negotiable ? 'bg-brand-teal' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_negotiable ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-brand-teal" />
            <h3 className="font-semibold text-sm text-gray-900">Location & Contact</h3>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Area in Udupi <span className="text-red-500">*</span></label>
            <select
              value={form.area}
              onChange={e => set('area', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-teal transition-all appearance-none"
              required
            >
              <option value="">Select your area</option>
              {UDUPI_AREAS.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-teal focus:bg-white transition-all"
                required
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
              <Info size={10} />Buyers will call you on this number
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-brand-teal/5 border border-brand-teal/10 rounded-2xl p-4">
          <h3 className="font-semibold text-sm text-gray-900 mb-2">💡 Tips for faster sale</h3>
          {['Add clear photos from multiple angles', 'Set a fair and competitive price', 'Write detailed description', 'Respond to buyers quickly'].map((tip, i) => (
            <p key={i} className="text-xs text-gray-600 mt-1.5 flex items-center gap-1.5">
              <CheckCircle size={10} className="text-brand-teal flex-shrink-0" />{tip}
            </p>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-teal text-white font-bold py-4 rounded-2xl hover:bg-[#0d7a72] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base shadow-lg shadow-brand-teal/20"
        >
          {submitting ? (
            <><Loader2 size={18} className="animate-spin" /> Posting Your Listing...</>
          ) : (
            <><Tag size={18} /> Post for Free</>
          )}
        </button>
      </form>

      <BottomNav />
    </div>
  );
};

export default SellProduct;
