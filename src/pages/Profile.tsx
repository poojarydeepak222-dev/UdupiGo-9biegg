import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Heart, Bell, Bookmark, Star, LogOut, Edit3, Phone, Mail, Shield, ChevronRight, CreditCard, MessageCircle, Loader2 } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { useAuthStore, authService } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import AuthModal from '@/components/features/AuthModal';
import { MOCK_BUSINESSES } from '@/constants/businesses';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'saved' | 'reviews'>('saved');

  const { data: savedIds = [] } = useQuery({
    queryKey: ['saved_all', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from('saved_businesses').select('business_id').eq('user_id', user!.id);
      return (data || []).map(d => d.business_id);
    },
  });

  const { data: myReviews = [] } = useQuery({
    queryKey: ['my_reviews', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from('reviews').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      return data || [];
    },
  });

  const savedBusinesses = MOCK_BUSINESSES.filter(b => savedIds.includes(b.id));

  const handleLogout = async () => {
    try {
      await authService.signOut();
      logout();
      toast.success('Signed out successfully');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8 text-center pb-24">
        <div className="w-20 h-20 bg-brand-teal/10 rounded-full flex items-center justify-center mb-4">
          <User size={36} className="text-brand-teal" />
        </div>
        <h2 className="font-heading font-bold text-gray-900 text-xl mb-2">My Profile</h2>
        <p className="text-gray-500 text-sm mb-6">Sign in to view your profile, saved businesses, and manage your account.</p>
        <button onClick={() => setAuthOpen(true)} className="bg-brand-teal text-white font-bold px-8 py-3.5 rounded-xl">
          Sign In / Register
        </button>
        <BottomNav />
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="sticky top-0 z-40 bg-white shadow-sm flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
        <h1 className="font-heading font-bold text-gray-900 text-lg">My Profile</h1>
      </div>

      {/* Profile header */}
      <div className="bg-gradient-to-br from-brand-teal to-[#0d7a72] px-5 pt-6 pb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white font-bold text-2xl">{user.username[0].toUpperCase()}</span>
            )}
          </div>
          <div>
            <h2 className="font-heading font-bold text-white text-xl">{user.username}</h2>
            <p className="text-white/70 text-sm flex items-center gap-1"><Mail size={12} />{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Saved', value: savedIds.length, icon: Heart },
            { label: 'Reviews', value: myReviews.length, icon: Star },
            { label: 'Businesses', value: 0, icon: Bookmark },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white/15 rounded-xl p-2.5 text-center">
              <Icon size={16} className="text-white/70 mx-auto mb-1" />
              <p className="font-bold text-white text-base">{value}</p>
              <p className="text-white/60 text-[10px]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 -mt-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {[
            { icon: Edit3, label: 'Edit Profile', color: 'text-brand-teal', onClick: () => toast.info('Profile editing coming soon!') },
            { icon: Bell, label: 'Notifications', color: 'text-blue-500', onClick: () => navigate('/notifications') },
            { icon: CreditCard, label: 'Transactions', color: 'text-purple-500', onClick: () => navigate('/transactions') },
            { icon: MessageCircle, label: 'Customer Service', color: 'text-green-500', onClick: () => navigate('/customer-service') },
            { icon: Shield, label: 'Privacy Policy', color: 'text-gray-500', onClick: () => navigate('/privacy') },
          ].map(({ icon: Icon, label, color, onClick }) => (
            <button key={label} onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 border-b border-gray-100 last:border-0">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                <Icon size={16} className={color} />
              </div>
              <span className="flex-1 text-left text-sm font-medium text-gray-800">{label}</span>
              <ChevronRight size={14} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Saved & Reviews tabs */}
      <div className="px-4 mt-4">
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          {(['saved', 'reviews'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors capitalize ${activeTab === tab ? 'bg-white text-brand-teal shadow' : 'text-gray-500'}`}>
              {tab === 'saved' ? `❤️ Saved (${savedIds.length})` : `⭐ Reviews (${myReviews.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'saved' && (
          savedBusinesses.length === 0 ? (
            <div className="text-center py-10">
              <Heart size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No saved businesses yet</p>
              <button onClick={() => navigate('/')} className="text-brand-teal text-sm font-medium mt-2">Browse businesses</button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedBusinesses.map(biz => (
                <button key={biz.id} onClick={() => navigate(`/business/${biz.id}`)} className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3 text-left hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {biz.image && <img src={biz.image} alt={biz.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{biz.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                        {biz.rating}<Star size={8} className="fill-white" />
                      </div>
                      <span className="text-xs text-gray-500">{biz.area}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )
        )}

        {activeTab === 'reviews' && (
          myReviews.length === 0 ? (
            <div className="text-center py-10">
              <Star size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No reviews written yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myReviews.map((rev: { id: string; business_id: string; rating: number; comment: string; created_at: string }) => (
                <div key={rev.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-brand-teal">Business #{rev.business_id}</span>
                    <span className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={12} className={j < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />)}
                  </div>
                  {rev.comment && <p className="text-sm text-gray-600">{rev.comment}</p>}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Logout */}
      <div className="px-4 mt-6">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 border-2 border-red-100 text-red-500 font-semibold py-3 rounded-2xl hover:bg-red-50 transition-colors">
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
