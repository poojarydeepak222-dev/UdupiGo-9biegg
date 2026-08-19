import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import SideDrawer from "@/components/layout/SideDrawer";
import CategoryGrid from "@/components/features/CategoryGrid";
import BusinessCard from "@/components/features/BusinessCard";
import PromoBanner from "@/components/features/PromoBanner";
import QuickActions from "@/components/features/QuickActions";
import AuthModal from "@/components/features/AuthModal";
import BusinessBottomSheet from "@/components/features/BusinessBottomSheet";
import { MOCK_BUSINESSES, BANNERS, NEWS_ITEMS } from "@/constants/businesses";
import { ChevronRight, MapPin, Star, TrendingUp } from "lucide-react";

const CATEGORY_SECTIONS = [
  { key: 'restaurants', label: '🍽️ Top Restaurants', emoji: '🍽️' },
  { key: 'doctors', label: '🏥 Hospitals & Doctors', emoji: '🏥' },
  { key: 'hotels', label: '🏨 Hotels & Resorts', emoji: '🏨' },
  { key: 'travel', label: '✈️ Tourism & Travel', emoji: '✈️' },
  { key: 'beauty', label: '💅 Beauty & Salons', emoji: '💅' },
  { key: 'education', label: '🎓 Schools & Colleges', emoji: '🎓' },
  { key: 'shopping', label: '🛒 Shopping & Malls', emoji: '🛒' },
  { key: 'gym', label: '💪 Gym & Fitness', emoji: '💪' },
];

const Index = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedBizId, setSelectedBizId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Listen for events from similar businesses inside sheet
  useEffect(() => {
    const handler = (e: Event) => setSelectedBizId((e as CustomEvent).detail);
    window.addEventListener('open-business-sheet', handler);
    return () => window.removeEventListener('open-business-sheet', handler);
  }, []);  

  const handleSearchSubmit = (val: string) => {
    navigate(`/search?q=${encodeURIComponent(val)}`);
  };

  const topRated = MOCK_BUSINESSES.filter(b => b.rating >= 4.5).slice(0, 5);
  const temples = MOCK_BUSINESSES.filter(b => b.category === 'temples');
  const touristSpots = MOCK_BUSINESSES.filter(b => b.category === 'travel').slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        onMenuOpen={() => setDrawerOpen(true)}
        onLoginOpen={() => setAuthOpen(true)}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
      />

      <main className="space-y-4 pb-4">
        {/* Category grid */}
        <CategoryGrid />

        {/* Promo banner 1 */}
        <PromoBanner {...BANNERS[0]} path={BANNERS[0].path} />

        {/* Quick Access */}
        <section>
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="font-heading font-bold text-gray-900 text-base">Quick Access</h2>
          </div>
          <QuickActions />
        </section>

        {/* Stats row */}
        <div className="mx-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Businesses Listed', value: '500+', icon: TrendingUp, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
            { label: 'Verified Listings', value: '200+', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Udupi Areas', value: '20+', icon: MapPin, color: 'text-brand-coral', bg: 'bg-orange-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
              <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mx-auto mb-1.5`}>
                <Icon size={16} className={color} />
              </div>
              <p className="font-heading font-bold text-gray-900 text-base">{value}</p>
              <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Top Rated */}
        <section className="bg-white py-4">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="font-heading font-bold text-gray-900 text-base">⭐ Top Rated in Udupi</h2>
            <button onClick={() => navigate('/search?q=top+rated')} className="flex items-center gap-0.5 text-brand-teal text-sm font-medium">
              See All <ChevronRight size={14} />
            </button>
          </div>
          <div className="px-4 space-y-3">
            {topRated.map(biz => (
              <BusinessCard key={biz.id} business={biz} onSelect={setSelectedBizId} />
            ))}
          </div>
        </section>

        {/* Temple & Spiritual */}
        {temples.length > 0 && (
          <section className="bg-white py-4">
            <div className="flex items-center justify-between px-4 mb-3">
              <h2 className="font-heading font-bold text-gray-900 text-base">🛕 Sacred Temples & Heritage</h2>
              <button onClick={() => navigate('/search?category=temples')} className="flex items-center gap-0.5 text-brand-teal text-sm font-medium">
                See All <ChevronRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto scrollbar-hide px-4">
              <div className="flex gap-3 pb-1" style={{ width: 'max-content' }}>
                {temples.map(biz => (
                  <BusinessCard key={biz.id} business={biz} variant="compact" onSelect={setSelectedBizId} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Category Sections */}
        {CATEGORY_SECTIONS.map(({ key, label }) => {
          const items = MOCK_BUSINESSES.filter(b => b.category === key).slice(0, 3);
          if (items.length === 0) return null;
          return (
            <section key={key} className="bg-white py-4">
              <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="font-heading font-bold text-gray-900 text-base">{label}</h2>
                <button onClick={() => navigate(`/search?category=${key}`)} className="flex items-center gap-0.5 text-brand-teal text-sm font-medium">
                  See All <ChevronRight size={14} />
                </button>
              </div>
              {key === 'restaurants' || key === 'hotels' || key === 'beauty' ? (
                <div className="overflow-x-auto scrollbar-hide px-4">
                  <div className="flex gap-3 pb-1" style={{ width: 'max-content' }}>
                    {items.map(biz => (
                      <BusinessCard key={biz.id} business={biz} variant="compact" onSelect={setSelectedBizId} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-4 space-y-3">
                  {items.map(biz => (
                    <BusinessCard key={biz.id} business={biz} onSelect={setSelectedBizId} />
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {/* Banner 2 */}
        <PromoBanner {...BANNERS[1]} path={BANNERS[1].path} />

        {/* Tourism highlights */}
        <section className="bg-white py-4">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="font-heading font-bold text-gray-900 text-base">🌊 Tourism Highlights</h2>
            <button onClick={() => navigate('/search?category=travel')} className="flex items-center gap-0.5 text-brand-teal text-sm font-medium">
              See All <ChevronRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto scrollbar-hide px-4">
            <div className="flex gap-3 pb-1" style={{ width: 'max-content' }}>
              {touristSpots.map(biz => (
                <BusinessCard key={biz.id} business={biz} variant="compact" onSelect={setSelectedBizId} />
              ))}
            </div>
          </div>
        </section>

        {/* Banner 3 */}
        <PromoBanner {...BANNERS[2]} path={BANNERS[2].path} />

        {/* Latest News */}
        <section className="bg-white py-4">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="font-heading font-bold text-gray-900 text-base">📰 Udupi News</h2>
            <button onClick={() => navigate('/news')} className="flex items-center gap-0.5 text-brand-teal text-sm font-medium">
              More <ChevronRight size={14} />
            </button>
          </div>
          <div className="px-4 space-y-3">
            {NEWS_ITEMS.slice(0, 4).map(news => (
              <button key={news.id} onClick={() => navigate('/news')} className="w-full flex items-start gap-3 text-left group">
                <div className="w-16 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <img src={news.image} alt={news.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] bg-brand-teal/10 text-brand-teal font-medium px-2 py-0.5 rounded-full">{news.category}</span>
                  <p className="text-sm font-medium text-gray-800 mt-1 line-clamp-2 group-hover:text-brand-teal transition-colors">{news.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{news.time}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Banner 4 */}
        <PromoBanner {...BANNERS[3]} path={BANNERS[3].path} />

        {/* Footer */}
        <div className="px-4 py-6 text-center">
          <p className="font-heading font-bold text-brand-teal text-lg">Udupi<span className="text-brand-coral">Go</span></p>
          <p className="text-xs text-gray-400 mt-1">Connecting you to the best of Udupi · 60+ local businesses listed</p>
          <div className="flex justify-center gap-4 mt-3 text-xs text-gray-400">
            <button onClick={() => navigate('/privacy')} className="hover:text-brand-teal">Privacy</button>
            <button onClick={() => navigate('/help')} className="hover:text-brand-teal">Help</button>
            <button onClick={() => navigate('/list-business')} className="hover:text-brand-teal">List Business</button>
          </div>
        </div>
      </main>

      <BottomNav />
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onLoginOpen={() => setAuthOpen(true)} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <BusinessBottomSheet businessId={selectedBizId} onClose={() => setSelectedBizId(null)} />
    </div>
  );
};

export default Index;
