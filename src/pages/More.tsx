import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Megaphone, Building2, IndianRupee, HelpCircle, Briefcase, Settings, Shield, LineChart, Lightbulb, Star, MessageCircle, Bookmark, Globe } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { MORE_CATEGORIES } from '@/constants/categories';

const MENU_SECTIONS = [
  {
    heading: 'Business Tools',
    items: [
      { icon: Building2, label: 'List Your Business', sub: 'Free listing for your business', path: '/list-business', badge: 'FREE', badgeColor: 'bg-brand-coral text-white', color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
      { icon: LineChart, label: 'Business Dashboard', sub: 'Manage your listings & analytics', path: '/dashboard', badge: null, badgeColor: '', color: 'text-blue-500', bg: 'bg-blue-50' },
      { icon: Megaphone, label: 'Advertise', sub: 'Reach 50,000+ users in Udupi', path: '/advertise', badge: null, badgeColor: '', color: 'text-brand-coral', bg: 'bg-orange-50' },
      { icon: IndianRupee, label: 'Manage Quotes', sub: 'View & respond to price requests', path: '/quotes', badge: null, badgeColor: '', color: 'text-green-500', bg: 'bg-green-50' },
    ],
  },
  {
    heading: 'Account & Activity',
    items: [
      { icon: Star, label: 'Special Offers', sub: 'Exclusive deals from local businesses', path: '/offers', badge: null, badgeColor: '', color: 'text-amber-500', bg: 'bg-amber-50' },
      { icon: Bookmark, label: 'My Transactions', sub: 'Payment history and billing', path: '/transactions', badge: null, badgeColor: '', color: 'text-purple-500', bg: 'bg-purple-50' },
    ],
  },
  {
    heading: 'Support & Info',
    items: [
      { icon: MessageCircle, label: 'Customer Service', sub: 'Mon–Sat 9AM–6PM', path: '/customer-service', badge: null, badgeColor: '', color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
      { icon: HelpCircle, label: 'Help Center', sub: 'FAQs and how-to guides', path: '/help', badge: null, badgeColor: '', color: 'text-blue-500', bg: 'bg-blue-50' },
      { icon: Briefcase, label: "We're Hiring!", sub: `${5} open positions in Udupi`, path: '/careers', badge: 'HIRING', badgeColor: 'bg-green-100 text-green-600', color: 'text-green-500', bg: 'bg-green-50' },
      { icon: Settings, label: 'Settings', sub: 'Preferences and notifications', path: '/settings', badge: null, badgeColor: '', color: 'text-gray-500', bg: 'bg-gray-100' },
    ],
  },
  {
    heading: 'Legal & About',
    items: [
      { icon: Shield, label: 'Privacy Policy', sub: 'How we handle your data', path: '/privacy', badge: null, badgeColor: '', color: 'text-gray-500', bg: 'bg-gray-100' },
      { icon: Globe, label: 'Terms of Service', sub: 'Platform usage terms', path: '/terms', badge: null, badgeColor: '', color: 'text-gray-500', bg: 'bg-gray-100' },
      { icon: LineChart, label: 'Investor Relations', sub: 'Company financials and growth', path: '/investors', badge: null, badgeColor: '', color: 'text-indigo-500', bg: 'bg-indigo-50' },
      { icon: Lightbulb, label: "What's New", sub: 'Latest features and updates', path: '/whats-new', badge: 'NEW', badgeColor: 'bg-brand-teal/10 text-brand-teal', color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
    ],
  },
];

const More = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-heading font-bold text-gray-900 text-lg">More</h1>
          <p className="text-xs text-gray-500">All features & tools</p>
        </div>
      </div>

      {/* More Categories */}
      <section className="bg-white px-4 py-4 mt-2">
        <h2 className="font-heading font-semibold text-gray-900 text-sm mb-3">More Categories</h2>
        <div className="grid grid-cols-4 gap-3">
          {MORE_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => navigate(`/search?category=${cat.id}&q=${encodeURIComponent(cat.label)}`)}
              className="flex flex-col items-center gap-1.5 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110 group-active:scale-95"
                style={{ backgroundColor: cat.bgColor }}>{cat.emoji}</div>
              <span className="text-[10px] text-center text-gray-700 font-medium leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Menu sections */}
      <div className="px-4 pt-4 space-y-4">
        {MENU_SECTIONS.map(section => (
          <div key={section.heading}>
            <h2 className="font-heading font-semibold text-gray-500 text-xs uppercase tracking-wide mb-2 px-1">{section.heading}</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {section.items.map(({ icon: Icon, label, sub, path, badge, badgeColor, color, bg }) => (
                <button key={label} onClick={() => navigate(path)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </div>
                  {badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${badgeColor}`}>{badge}</span>}
                  <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mx-4 mt-6 text-center pb-2">
        <p className="font-heading font-bold text-brand-teal text-lg">Udupi<span className="text-brand-coral">Go</span></p>
        <p className="text-xs text-gray-400 mt-1">Version 1.0.0 · Udupi, Karnataka</p>
        <p className="text-[10px] text-gray-300 mt-0.5">Made with ❤️ in coastal Karnataka</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default More;
