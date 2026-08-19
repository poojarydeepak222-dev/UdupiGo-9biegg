import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Phone, MapPin, Share2, Heart, BadgeCheck, Clock, ChevronRight } from 'lucide-react';
import { MOCK_BUSINESSES } from '@/constants/businesses';
import BottomNav from '@/components/layout/BottomNav';
import BusinessCard from '@/components/features/BusinessCard';
import ReviewSection from '@/components/features/ReviewSection';
import AuthModal from '@/components/features/AuthModal';
import { useAuthStore } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [authOpen, setAuthOpen] = useState(false);
  const qc = useQueryClient();

  const business = MOCK_BUSINESSES.find(b => b.id === id);
  const similar = MOCK_BUSINESSES.filter(b => b.id !== id && b.category === business?.category).slice(0, 3);

  const { data: isSaved = false } = useQuery({
    queryKey: ['saved', id, user?.id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from('saved_businesses')
        .select('id')
        .eq('user_id', user!.id)
        .eq('business_id', id!)
        .maybeSingle();
      return !!data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Login required');
      if (isSaved) {
        await supabase.from('saved_businesses').delete().eq('user_id', user.id).eq('business_id', id!);
      } else {
        await supabase.from('saved_businesses').insert({ user_id: user.id, business_id: id! });
      }
    },
    onSuccess: () => {
      toast.success(isSaved ? 'Removed from saved' : 'Saved to favorites!');
      qc.invalidateQueries({ queryKey: ['saved', id, user?.id] });
    },
    onError: () => toast.error('Action failed'),
  });

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-5xl">🏢</p>
        <h2 className="font-heading font-bold text-gray-800 text-xl">Business not found</h2>
        <button onClick={() => navigate('/')} className="text-brand-teal font-medium">Go Home</button>
      </div>
    );
  }

  const handleCall = () => { window.location.href = `tel:${business.phone}`; };
  const handleShare = async () => {
    try { await navigator.share({ title: business.name, url: window.location.href }); }
    catch { toast.success('Link copied!'); }
  };
  const handleSave = () => {
    if (!user) { setAuthOpen(true); return; }
    saveMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="relative h-52 bg-gray-200">
        {business.image && <img src={business.image} alt={business.name} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white" aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
          <div className="flex gap-2">
            <button onClick={handleShare} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white" aria-label="Share">
              <Share2 size={16} />
            </button>
            <button onClick={handleSave} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center" aria-label="Save">
              <Heart size={16} className={isSaved ? 'fill-red-500 text-red-500' : 'text-white'} />
            </button>
          </div>
        </div>
        {business.isClosed && (
          <div className="absolute bottom-3 left-4">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Currently Closed</span>
          </div>
        )}
      </div>

      <div className="bg-white px-4 pt-4 pb-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading font-bold text-gray-900 text-xl">{business.name}</h1>
              {business.isVerified && (
                <div className="flex items-center gap-1 bg-brand-teal/10 px-2 py-0.5 rounded-full">
                  <BadgeCheck size={12} className="text-brand-teal" />
                  <span className="text-[10px] text-brand-teal font-semibold">Verified</span>
                </div>
              )}
            </div>
            <p className="text-gray-500 text-sm capitalize mt-0.5">{business.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 bg-green-500 text-white px-2.5 py-1 rounded-lg">
            <span className="font-bold text-sm">{business.rating}</span>
            <Star size={11} className="fill-white" />
          </div>
          <span className="text-sm text-gray-600">{business.reviewCount} Ratings & Reviews</span>
        </div>
        <div className="flex items-start gap-2 mt-3">
          <MapPin size={15} className="text-brand-coral mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700">{business.address}</p>
        </div>
        {business.openTime && (
          <div className="flex items-center gap-2 mt-2">
            <Clock size={15} className="text-brand-teal flex-shrink-0" />
            <p className="text-sm text-gray-700">{business.openTime === '24 Hours' ? 'Open 24 Hours' : `${business.openTime} – ${business.closeTime}`}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {business.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">{tag}</span>
          ))}
        </div>
        {business.description && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{business.description}</p>}
        <div className="flex gap-3 mt-4">
          <button onClick={handleCall} className="flex-1 flex items-center justify-center gap-2 bg-brand-teal text-white rounded-xl py-3 font-semibold text-sm hover:bg-brand-teal-dark transition-colors">
            <Phone size={16} /> Call Now
          </button>
          <button onClick={() => toast.info('WhatsApp coming soon!')} className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white rounded-xl py-3 font-semibold text-sm hover:bg-green-600 transition-colors">
            💬 WhatsApp
          </button>
        </div>
      </div>

      {/* Reviews from DB */}
      <ReviewSection businessId={business.id} onLoginRequired={() => setAuthOpen(true)} />

      {similar.length > 0 && (
        <section className="mt-4 bg-white px-4 py-4">
          <h2 className="font-heading font-bold text-gray-900 text-base mb-4">Similar Businesses</h2>
          <div className="space-y-3">{similar.map(biz => <BusinessCard key={biz.id} business={biz} />)}</div>
        </section>
      )}

      <BottomNav />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
};

export default BusinessDetail;
