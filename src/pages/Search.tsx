import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BusinessBottomSheet from '@/components/features/BusinessBottomSheet';
import { ArrowLeft, Search, MapPin, Filter, Map, List, SlidersHorizontal } from 'lucide-react';
import BusinessCard from '@/components/features/BusinessCard';
import BusinessMap from '@/components/features/BusinessMap';
import BottomNav from '@/components/layout/BottomNav';
import { MOCK_BUSINESSES } from '@/constants/businesses';

const SORT_OPTIONS = ['Relevance', 'Rating', 'Reviews', 'Nearest'];
const FILTER_TABS = ['All', 'Open Now', 'Verified', 'Top Rated'];

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const [searchText, setSearchText] = useState(query);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Relevance');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedBizId, setSelectedBizId] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => setSelectedBizId((e as CustomEvent).detail);
    window.addEventListener('open-business-sheet', handler);
    return () => window.removeEventListener('open-business-sheet', handler);
  }, []);

  useEffect(() => { setSearchText(query); }, [query]);

  const results = useMemo(() => {
    let filtered = [...MOCK_BUSINESSES];
    if (category) filtered = filtered.filter(b => b.category === category);
    if (searchText && !category) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.tags.some(t => t.toLowerCase().includes(q)) ||
        b.area.toLowerCase().includes(q)
      );
    }
    if (activeFilter === 'Open Now') filtered = filtered.filter(b => !b.isClosed);
    if (activeFilter === 'Verified') filtered = filtered.filter(b => b.isVerified);
    if (activeFilter === 'Top Rated') filtered = filtered.filter(b => b.rating >= 4.3);
    if (activeSort === 'Rating') filtered.sort((a, b) => b.rating - a.rating);
    if (activeSort === 'Reviews') filtered.sort((a, b) => b.reviewCount - a.reviewCount);
    return filtered;
  }, [searchText, category, activeFilter, activeSort]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search in Udupi..."
              className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-teal/30"
            />
          </div>
          {/* Toggle map/list */}
          <div className="flex bg-gray-100 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${viewMode === 'list' ? 'bg-white shadow text-brand-teal' : 'text-gray-500'}`}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${viewMode === 'map' ? 'bg-white shadow text-brand-teal' : 'text-gray-500'}`}
            >
              <Map size={14} />
            </button>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Filter">
            <SlidersHorizontal size={20} className="text-brand-teal" />
          </button>
        </div>

        <div className="flex items-center gap-1 px-4 pb-2 text-xs text-gray-500">
          <MapPin size={11} className="text-brand-coral" />
          <span>Udupi, Karnataka</span>
          <span className="mx-1">·</span>
          <span className="font-medium text-gray-700">{results.length} results</span>
          {(query || category) && (
            <span className="ml-1">for "<span className="text-brand-teal font-semibold">{category || query}</span>"</span>
          )}
        </div>

        <div className="overflow-x-auto scrollbar-hide px-4 pb-3">
          <div className="flex gap-2" style={{ width: 'max-content' }}>
            {FILTER_TABS.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeFilter === f ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-600'}`}>
                {f}
              </button>
            ))}
            <div className="w-px bg-gray-200 mx-1" />
            {SORT_OPTIONS.map(s => (
              <button key={s} onClick={() => setActiveSort(s)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeSort === s ? 'bg-brand-coral/10 text-brand-coral' : 'bg-gray-100 text-gray-600'}`}>
                {activeSort === s && <Filter size={10} />}{s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map view */}
      {viewMode === 'map' && (
        <div className="pt-4">
          <BusinessMap businesses={results} />
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 font-medium mb-3">{results.length} Results</p>
            <div className="space-y-3">
              {results.map(biz => <BusinessCard key={biz.id} business={biz} onSelect={setSelectedBizId} />)}
            </div>
          </div>
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="px-4 py-4 space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <h3 className="font-heading font-bold text-gray-800 text-lg">No results found</h3>
              <p className="text-gray-500 text-sm mt-2">Try a different search or adjust filters</p>
            </div>
          ) : (
            results.map(biz => <BusinessCard key={biz.id} business={biz} onSelect={setSelectedBizId} />)
          )}
        </div>
      )}

      <BottomNav />
      <BusinessBottomSheet businessId={selectedBizId} onClose={() => setSelectedBizId(null)} />
    </div>
  );
};

export default SearchPage;
