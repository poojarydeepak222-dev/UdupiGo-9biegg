import { useState, useEffect, useRef } from 'react';
import {
  X, Star, Phone, MapPin, Share2, Heart, BadgeCheck,
  Clock, ChevronRight, MessageCircle, Navigation, Globe
} from 'lucide-react';
import { Business } from '@/types';
import ReviewSection from '@/components/features/ReviewSection';
import AuthModal from '@/components/features/AuthModal';
import { useAuthStore } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MOCK_BUSINESSES } from '@/constants/businesses';

interface BusinessBottomSheetProps {
  businessId: string | null;
  onClose: () => void;
}

const BusinessBottomSheet = ({ businessId, onClose }: BusinessBottomSheetProps) => {
  const { user } = useAuthStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [similar, setSimilar] = useState<typeof MOCK_BUSINESSES>([]);
  const sheetRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const business = businessId ? MOCK_BUSINESSES.find(b => b.id === businessId) : null;

  // Animate in
  useEffect(() => {
    if (businessId) {
      setVisible(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }
  }, [businessId]);

  useEffect(() => {
    if (business) {
      setSimilar(MOCK_BUSINESSES.filter(b => b.id !== business.id && b.category === business.category).slice(0, 3));
    }
  }, [business]);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (businessId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [businessId]);

  const { data: isSaved = false } = useQuery({
    queryKey: ['saved', businessId, user?.id],
    enabled: !!user && !!businessId,
    queryFn: async () => {
      const { data } = await supabase
        .from('saved_businesses')
        .select('id')
        .eq('user_id', user!.id)
        .eq('business_id', businessId!)
        .maybeSingle();
      return !!data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Login required');
      if (isSaved) {
        await supabase.from('saved_businesses').delete().eq('user_id', user.id).eq('business_id', businessId!);
      } else {
        await supabase.from('saved_businesses').insert({ user_id: user.id, business_id: businessId! });
      }
    },
    onSuccess: () => {
      toast.success(isSaved ? 'Removed from saved' : 'Saved to favorites!');
      qc.invalidateQueries({ queryKey: ['saved', businessId, user?.id] });
    },
    onError: () => toast.error('Action failed'),
  });

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleSave = () => {
    if (!user) { setAuthOpen(true); return; }
    saveMutation.mutate();
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: business?.name, url: `${window.location.origin}/business/${businessId}` });
    } catch {
      await navigator.clipboard.writeText(`${window.location.origin}/business/${businessId}`);
      toast.success('Link copied!');
    }
  };

  if (!businessId) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col"
        style={{
          maxHeight: '92dvh',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <X size={16} className="text-gray-600" />
        </button>

        {business ? (
          <div className="overflow-y-auto overscroll-contain flex-1 pb-36">
            {/* Hero image */}
            <div className="relative h-44 bg-gray-200 flex-shrink-0 mx-4 mt-1 rounded-2xl overflow-hidden">
              {business.image && (
                <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Closed badge */}
              {business.isClosed && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Currently Closed
                </span>
              )}

              {/* Action buttons overlay */}
              <div className="absolute top-3 right-3 flex gap-1.5">
                <button onClick={handleShare} className="w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center" aria-label="Share">
                  <Share2 size={14} className="text-white" />
                </button>
                <button onClick={handleSave} className="w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center" aria-label="Save">
                  <Heart size={14} className={isSaved ? 'fill-red-500 text-red-500' : 'text-white'} />
                </button>
              </div>

              {/* Category pill */}
              <span className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize border border-white/20">
                {business.category}
              </span>
            </div>

            {/* Business info card */}
            <div className="px-4 pt-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-heading font-bold text-gray-900 text-xl leading-tight">{business.name}</h2>
                    {business.isVerified && (
                      <div className="flex items-center gap-1 bg-brand-teal/10 px-2 py-0.5 rounded-full">
                        <BadgeCheck size={12} className="text-brand-teal" />
                        <span className="text-[10px] text-brand-teal font-semibold">Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Rating row */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded-lg">
                      <span className="font-bold text-sm">{business.rating}</span>
                      <Star size={10} className="fill-white" />
                    </div>
                    <span className="text-sm text-gray-600">{business.reviewCount} Ratings</span>
                    {business.isClosed === false && (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Open Now</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 mt-3">
                <MapPin size={14} className="text-brand-coral mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">{business.address}</p>
              </div>

              {/* Timing */}
              {business.openTime && (
                <div className="flex items-center gap-2 mt-2">
                  <Clock size={14} className="text-brand-teal flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    {business.openTime === '24 Hours'
                      ? 'Open 24 Hours'
                      : `${business.openTime} – ${business.closeTime}`}
                  </p>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {business.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">{tag}</span>
                ))}
              </div>

              {/* Description */}
              {business.description && (
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{business.description}</p>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { icon: Star, label: 'Rating', value: `${business.rating}/5`, color: 'text-amber-500' },
                  { icon: Phone, label: 'Calls', value: `${Math.floor(business.reviewCount * 0.7)}+`, color: 'text-brand-teal' },
                  { icon: Heart, label: 'Saves', value: `${Math.floor(business.reviewCount * 0.3)}+`, color: 'text-red-400' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
                    <Icon size={14} className={`${color} mx-auto mb-1`} />
                    <p className="font-bold text-xs text-gray-900">{value}</p>
                    <p className="text-[9px] text-gray-500">{label}</p>
                  </div>
                ))}
              </div>

              {/* More Actions */}
              <div className="flex gap-2 mt-3">
                {business.website && (
                  <a href={`https://${business.website}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition-colors">
                    <Globe size={13} /> Website
                  </a>
                )}
                <button
                  onClick={() => toast.info('Directions opening...')}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  <Navigation size={13} /> Directions
                </button>
                <button
                  onClick={() => { window.location.href = `tel:${business.phone}`; }}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-brand-teal/30 text-brand-teal rounded-xl py-2.5 text-xs font-semibold hover:bg-brand-teal/5 transition-colors"
                >
                  <Phone size={13} /> Call
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-4 mt-4 h-px bg-gray-100" />

            {/* Reviews */}
            <div className="px-4 mt-4">
              <ReviewSection businessId={business.id} onLoginRequired={() => setAuthOpen(true)} />
            </div>

            {/* Similar businesses */}
            {similar.length > 0 && (
              <div className="px-4 mt-4">
                <h3 className="font-heading font-bold text-gray-900 text-sm mb-3 flex items-center justify-between">
                  Similar in {business.category}
                  <ChevronRight size={14} className="text-gray-400" />
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
                  {similar.map(biz => (
                    <button
                      key={biz.id}
                      onClick={() => {
                        // Re-trigger sheet with new business
                        setVisible(false);
                        setTimeout(() => {
                          // We need a way to change the businessId - handled by parent
                          window.dispatchEvent(new CustomEvent('open-business-sheet', { detail: biz.id }));
                        }, 150);
                      }}
                      className="flex-shrink-0 w-32 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-left"
                    >
                      <div className="h-20 bg-gray-100 overflow-hidden">
                        <img src={biz.image} alt={biz.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2">
                        <p className="text-[11px] font-semibold text-gray-900 line-clamp-2 leading-tight">{biz.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={9} className="fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-medium text-gray-700">{biz.rating}</span>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-0.5 truncate">{biz.area}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center py-20 text-gray-400">
            <p className="text-sm">Business not found</p>
          </div>
        )}

        {/* Fixed bottom CTAs */}
        {business && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-3 safe-bottom">
            <a
              href={`https://wa.me/${business.phone?.replace(/\D/g, '')}?text=Hi, I found ${business.name} on UdupiGo. Is it open now?`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3.5 rounded-xl text-sm active:scale-[0.98] transition-transform"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              href={`tel:${business.phone}`}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-teal text-white font-bold py-3.5 rounded-xl text-sm active:scale-[0.98] transition-transform"
            >
              <Phone size={16} /> Call Now
            </a>
          </div>
        )}
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default BusinessBottomSheet;
