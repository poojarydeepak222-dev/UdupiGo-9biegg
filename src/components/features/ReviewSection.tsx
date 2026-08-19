import { useState } from 'react';
import { Star, ThumbsUp, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ReviewSectionProps {
  businessId: string;
  onLoginRequired: () => void;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_profiles?: { username: string };
}

const ReviewSection = ({ businessId, onLoginRequired }: ReviewSectionProps) => {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, user_profiles(username)')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as Review[];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase.from('reviews').insert({
        business_id: businessId,
        user_id: user.id,
        rating,
        comment,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Review submitted!');
      setRating(0);
      setComment('');
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ['reviews', businessId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="bg-white px-4 py-4 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading font-bold text-gray-900 text-base">Ratings & Reviews</h2>
          {avgRating && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-2xl font-bold text-gray-900">{avgRating}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-xs text-gray-500">({reviews.length})</span>
            </div>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => { if (!user) { onLoginRequired(); return; } setShowForm(true); }}
            className="bg-brand-teal text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-brand-teal-dark transition-colors"
          >
            + Write Review
          </button>
        )}
      </div>

      {/* Write form */}
      {showForm && user && (
        <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-3">Rate this business</p>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(n)}
                className="p-1"
              >
                <Star
                  size={28}
                  className={n <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-teal resize-none"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => submitMutation.mutate()}
              disabled={rating === 0 || submitMutation.isPending}
              className="flex-1 bg-brand-teal text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {submitMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Submit Review
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-brand-teal" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <ThumbsUp size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center">
                    <User size={14} className="text-brand-teal" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {review.user_profiles?.username || 'User'}
                    </p>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={10} className={j < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 mt-2 ml-10 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ReviewSection;
