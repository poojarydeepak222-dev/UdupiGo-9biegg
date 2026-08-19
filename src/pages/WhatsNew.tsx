import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle, Star, Zap } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

const VERSIONS = [
  {
    version: 'v1.0.0',
    date: 'June 22, 2026',
    label: 'Latest',
    labelColor: 'bg-brand-teal text-white',
    highlights: 'Full Platform Launch',
    features: [
      'Complete business directory for Udupi with 60+ real businesses',
      'OTP + password authentication with user profiles',
      'Interactive search with category and text filters',
      'Business detail pages with reviews, ratings, call & directions',
      'Review & rating system stored in cloud database',
      'B2B marketplace with inquiry system for business-to-business connections',
      'Business owner dashboard with analytics and lead management',
      'UdupiGo Pay — bill payments and recharge',
      'Local news feed with 12 Udupi news stories',
      'Notifications centre with lead and offer alerts',
      'Special Offers page with active deals from local businesses',
      'List your Business — free submission form',
      'Side drawer menu matching JustDial-style navigation',
      'Bottom navigation bar (Home, Leads, B2B, Pay, News, More)',
    ],
    type: 'major',
  },
  {
    version: 'v0.9.0',
    date: 'June 15, 2026',
    label: 'Beta',
    labelColor: 'bg-blue-100 text-blue-600',
    highlights: 'Beta Testing Release',
    features: [
      'Initial business directory with mock data',
      'Basic search functionality',
      'Category grid navigation',
      'Basic business card design',
      'Home page layout and header',
    ],
    type: 'beta',
  },
  {
    version: 'v0.5.0',
    date: 'June 1, 2026',
    label: 'Alpha',
    labelColor: 'bg-amber-100 text-amber-600',
    highlights: 'Alpha Build',
    features: [
      'Project scaffolding with React + TypeScript + Tailwind',
      'Routing and page structure',
      'Category and business data models',
      'Basic component library setup',
    ],
    type: 'alpha',
  },
];

const UPCOMING = [
  { feature: 'Interactive Leaflet Map View', eta: 'July 2026', icon: '🗺️' },
  { feature: 'Business Appointment Booking System', eta: 'July 2026', icon: '📅' },
  { feature: 'WhatsApp Chat Integration on Listings', eta: 'August 2026', icon: '💬' },
  { feature: 'Udupi Events Calendar', eta: 'August 2026', icon: '🎉' },
  { feature: 'Admin Verification Dashboard', eta: 'August 2026', icon: '🛡️' },
  { feature: 'Mangaluru District Expansion', eta: 'September 2026', icon: '🌊' },
  { feature: 'UPI Payments for Local Businesses', eta: 'Q4 2026', icon: '💳' },
  { feature: 'Offline-First Mode with PWA', eta: 'Q4 2026', icon: '📱' },
];

const WhatsNew = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-heading font-bold text-gray-900 text-lg">What's New</h1>
          <p className="text-xs text-gray-500">UdupiGo Changelog</p>
        </div>
        <span className="ml-auto bg-brand-teal text-white text-[10px] font-bold px-2.5 py-1 rounded-full">v1.0.0</span>
      </div>

      {/* Hero */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-brand-teal to-[#0d7a72] rounded-2xl p-5 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <Sparkles size={28} className="text-white/80 mb-2" />
        <h2 className="font-heading font-bold text-xl">Version 1.0 is Here!</h2>
        <p className="text-white/80 text-sm mt-1 leading-relaxed">UdupiGo officially launches with full-featured business discovery, reviews, B2B marketplace, and payments — all built for Udupi.</p>
      </div>

      {/* Version History */}
      <div className="px-4 mt-5 space-y-4">
        {VERSIONS.map(ver => (
          <div key={ver.version} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Version header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-gray-900 text-base">{ver.version}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ver.labelColor}`}>{ver.label}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-brand-teal">{ver.highlights}</p>
                <p className="text-[10px] text-gray-400">{ver.date}</p>
              </div>
            </div>

            {/* Features */}
            <div className="p-4">
              <ul className="space-y-2">
                {ver.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <CheckCircle size={13} className={`flex-shrink-0 mt-0.5 ${ver.type === 'major' ? 'text-brand-teal' : ver.type === 'beta' ? 'text-blue-500' : 'text-amber-500'}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Features */}
      <div className="px-4 mt-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-brand-coral" />
          <h2 className="font-heading font-bold text-gray-900 text-sm">Coming Soon</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {UPCOMING.map(({ feature, eta, icon }) => (
            <div key={feature} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xl flex-shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{feature}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Expected: {eta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div className="mx-4 mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
        <Star size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-sm text-gray-900">Rate UdupiGo</h3>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">Enjoying the app? Share your feedback and help us improve! Email us at <span className="text-brand-teal font-medium">feedback@udupigo.in</span></p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default WhatsNew;
