import { useState } from 'react';
import { ArrowLeft, Search, RefreshCw, ExternalLink, Clock, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import BottomNav from '@/components/layout/BottomNav';
import { supabase } from '@/lib/supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';

// ─── Types ───────────────────────────────────────────────────────────────────
interface NewsItem {
  id: string;
  title: string;
  body: string;
  url: string;
  source: string;
  category: string;
  image_url: string;
  pub_date: string;
  fetched_at: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Temples', 'Health', 'Community', 'Business', 'Tourism', 'Food', 'Education', 'Infrastructure', 'Politics', 'Sports', 'Technology', 'Crime', 'Weather'];

const CATEGORY_COLORS: Record<string, string> = {
  Temples: 'bg-amber-100 text-amber-700',
  Health: 'bg-blue-100 text-blue-700',
  Community: 'bg-green-100 text-green-700',
  Business: 'bg-purple-100 text-purple-700',
  Food: 'bg-orange-100 text-orange-700',
  Education: 'bg-teal-100 text-teal-700',
  Tourism: 'bg-cyan-100 text-cyan-700',
  Infrastructure: 'bg-slate-100 text-slate-700',
  Technology: 'bg-indigo-100 text-indigo-700',
  Politics: 'bg-red-100 text-red-700',
  Sports: 'bg-lime-100 text-lime-700',
  Crime: 'bg-rose-100 text-rose-700',
  Weather: 'bg-sky-100 text-sky-700',
  General: 'bg-gray-100 text-gray-600',
};

const CATEGORY_ICONS: Record<string, string> = {
  Temples: '🛕', Health: '🏥', Community: '🤝', Business: '💼',
  Tourism: '🌊', Food: '🍽️', Education: '🎓', Infrastructure: '🏗️',
  Politics: '🗳️', Sports: '⚽', Technology: '💻', Crime: '🚨',
  Weather: '🌧️', General: '📰',
};

// Fallback images by category
const FALLBACK_IMAGES: Record<string, string> = {
  Temples: 'https://images.unsplash.com/photo-1545126360-2ad1a8e8b0a8?w=600&q=70',
  Health: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&q=70',
  Community: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=70',
  Business: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=70',
  Tourism: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=70',
  Food: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=70',
  Education: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=70',
  Infrastructure: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=70',
  Politics: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=70',
  Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=70',
  Technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=70',
  Crime: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=70',
  Weather: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=70',
  General: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=70',
};

function getNewsImage(item: NewsItem): string {
  if (item.image_url) return item.image_url;
  return FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES.General;
}

function formatPubDate(pubDate: string): string {
  if (!pubDate) return 'Recently';
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) return pubDate;
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Component ───────────────────────────────────────────────────────────────
const News = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching, refetch, error } = useQuery<{ news: NewsItem[]; from_cache: boolean }>({
    queryKey: ['udupi-news'],
    staleTime: 1000 * 60 * 30, // Consider fresh for 30min client-side
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-udupi-news');
      if (error) {
        let msg = error.message;
        if (error instanceof FunctionsHttpError) {
          try { msg = await error.context?.text() || msg; } catch { /* ignore */ }
        }
        throw new Error(msg);
      }
      return data;
    },
  });

  const news = data?.news || [];
  const fromCache = data?.from_cache;

  const filtered = news.filter(n => {
    const matchCat = activeCategory === 'All' || n.category === activeCategory;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || (n.body || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-gray-900 text-lg leading-none">Udupi News</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-gray-400">
                {isLoading ? 'Fetching live news...' : fromCache ? 'Updated recently' : 'Live from Google News'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isFetching && <RefreshCw size={14} className="text-brand-teal animate-spin" />}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal/10 text-brand-teal text-xs font-semibold rounded-xl hover:bg-brand-teal/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Udupi news..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/30"
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="overflow-x-auto scrollbar-hide px-4 pb-3">
          <div className="flex gap-2" style={{ width: 'max-content' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${activeCategory === cat ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-600'}`}>
                {CATEGORY_ICONS[cat] ? `${CATEGORY_ICONS[cat]} ` : ''}{cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 flex items-center justify-center">
              <Radio size={28} className="text-brand-teal animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800 text-sm">Fetching live Udupi news</p>
            <p className="text-gray-400 text-xs mt-1">Getting latest updates from Google News...</p>
          </div>
          {/* Skeleton cards */}
          <div className="w-full px-4 space-y-3 mt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="mx-4 mt-6 bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
          <p className="text-2xl mb-2">📡</p>
          <p className="font-semibold text-red-700 text-sm">Could not load live news</p>
          <p className="text-red-500 text-xs mt-1">Check your connection or try again</p>
          <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl">Retry</button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Stats bar */}
          <div className="mx-4 mt-4 flex items-center justify-between bg-white rounded-2xl px-4 py-2.5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-gray-700">{filtered.length} stories</span>
              {activeCategory !== 'All' && <span className="text-xs text-brand-teal">in {activeCategory}</span>}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock size={10} />
              {news.length > 0 ? formatPubDate(news[0].fetched_at) : 'No data'}
            </div>
          </div>

          {/* Featured story */}
          {featured && activeCategory === 'All' && !search && (
            <div className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
              <div className="relative h-52 bg-gray-100 overflow-hidden">
                <img
                  src={getNewsImage(featured)}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES.General; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[featured.category] || CATEGORY_COLORS.General}`}>
                    {CATEGORY_ICONS[featured.category]} {featured.category}
                  </span>
                  <span className="bg-brand-coral text-white text-[10px] font-bold px-2.5 py-1 rounded-full">FEATURED</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h2 className="font-heading font-bold text-white text-base leading-snug line-clamp-2">{featured.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/60 text-[10px]">{featured.source}</span>
                    <span className="text-white/40 text-[10px]">·</span>
                    <span className="text-white/60 text-[10px]">{formatPubDate(featured.pub_date)}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 leading-relaxed">{featured.body}</p>
                {featured.url && (
                  <a href={featured.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-brand-teal text-xs font-semibold hover:underline">
                    Read full story <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* News list */}
          <div className="p-4 space-y-4">
            {(activeCategory !== 'All' || search ? filtered : rest).map(newsItem => (
              <article key={newsItem.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={getNewsImage(newsItem)}
                    alt={newsItem.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES[newsItem.category] || FALLBACK_IMAGES.General; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[newsItem.category] || CATEGORY_COLORS.General}`}>
                    {CATEGORY_ICONS[newsItem.category]} {newsItem.category}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] text-gray-400 font-medium">{newsItem.source}</span>
                    <span className="text-gray-200">·</span>
                    <span className="text-[10px] text-gray-400">{formatPubDate(newsItem.pub_date)}</span>
                  </div>
                  <h2 className="font-heading font-bold text-gray-900 text-sm leading-snug">{newsItem.title}</h2>
                  {newsItem.body && (
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{newsItem.body}</p>
                  )}
                  {newsItem.url && (
                    <a href={newsItem.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-brand-teal text-xs font-semibold hover:underline">
                      Read more <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </article>
            ))}

            {filtered.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📰</p>
                <h3 className="font-heading font-bold text-gray-800 text-lg">No news found</h3>
                <p className="text-gray-500 text-sm mt-2">Try a different category or search term</p>
              </div>
            )}
          </div>

          {/* Google News attribution */}
          {news.length > 0 && (
            <div className="mx-4 mb-4 text-center">
              <p className="text-[10px] text-gray-400">News sourced from Google News · Auto-categorized by OnSpace AI</p>
            </div>
          )}
        </>
      )}

      <BottomNav />
    </div>
  );
};

export default News;
