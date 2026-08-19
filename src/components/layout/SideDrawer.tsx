import {
  X, User, BarChart2, Megaphone, ReceiptText, HelpCircle,
  IndianRupee, Briefcase, Settings, Shield, LineChart, Lightbulb,
  LogOut, ChevronRight, LayoutDashboard, Tag, ShoppingBag, PlusCircle,
  Newspaper, Bell, CreditCard, Gift, Star, MapPin, Phone, Heart,
  Handshake, Home, TrendingUp, BookOpen, Zap, Globe, Info, FileText,
  Users, Package, Store, Search, Building2, Coffee, Navigation, Car, Wrench
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore, authService } from "@/hooks/useAuth";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginOpen: () => void;
}

// Quick action tiles shown below the profile
const QUICK_ACTIONS = [
  { icon: Search, label: 'Search', path: '/search', color: 'bg-blue-100 text-blue-600' },
  { icon: ShoppingBag, label: 'Buy/Sell', path: '/used-products', color: 'bg-orange-100 text-orange-600' },
  { icon: Handshake, label: 'B2B', path: '/b2b', color: 'bg-purple-100 text-purple-600' },
  { icon: CreditCard, label: 'Pay', path: '/pay', color: 'bg-green-100 text-green-600' },
  { icon: Bell, label: 'Alerts', path: '/notifications', color: 'bg-red-100 text-red-600' },
  { icon: Newspaper, label: 'News', path: '/news', color: 'bg-cyan-100 text-cyan-600' },
  { icon: Tag, label: 'Offers', path: '/offers', color: 'bg-pink-100 text-pink-600' },
  { icon: Car, label: 'Auto', path: '/book-rickshaw', color: 'bg-yellow-100 text-yellow-600' },
  { icon: Navigation, label: 'More', path: '/more', color: 'bg-indigo-100 text-indigo-600' },
  { icon: Home, label: 'Property', path: '/property', color: 'bg-rose-100 text-rose-600' },
  { icon: Globe, label: 'My Website', path: '/website-builder', color: 'bg-teal-100 text-teal-600' },
  { icon: FileText, label: 'Invoice', path: '/invoice', color: 'bg-violet-100 text-violet-600' },
];

const MENU_SECTIONS = [
  {
    title: 'My Account',
    color: 'text-brand-teal',
    items: [
      { icon: User, label: 'My Profile', path: '/profile', desc: 'View & edit your profile', iconBg: 'bg-teal-100 text-teal-600' },
      { icon: LayoutDashboard, label: 'Business Dashboard', path: '/dashboard', desc: 'Analytics & leads', iconBg: 'bg-blue-100 text-blue-600' },
      { icon: ReceiptText, label: 'My Transactions', path: '/transactions', desc: 'Payment history', iconBg: 'bg-green-100 text-green-600' },
      { icon: Bell, label: 'Notifications', path: '/notifications', desc: 'Alerts & updates', iconBg: 'bg-red-100 text-red-600', badge: '3' },
      { icon: IndianRupee, label: 'Manage Quotes', path: '/quotes', desc: 'Your quote requests', iconBg: 'bg-amber-100 text-amber-600' },
    ],
  },
  {
    title: 'Buy & Sell',
    color: 'text-orange-500',
    items: [
      { icon: ShoppingBag, label: 'Used Products', path: '/used-products', desc: 'Browse second-hand items', iconBg: 'bg-orange-100 text-orange-600', badge: 'NEW' },
      { icon: PlusCircle, label: 'Sell Your Item', path: '/sell-product', desc: 'Post a free listing', iconBg: 'bg-brand-coral/15 text-brand-coral', badge: 'Free' },
      { icon: Package, label: 'My Listings', path: '/profile', desc: 'Items you are selling', iconBg: 'bg-purple-100 text-purple-600' },
      { icon: Tag, label: 'Special Offers', path: '/offers', desc: 'Deals & discounts', iconBg: 'bg-pink-100 text-pink-600' },
      { icon: Gift, label: 'Pay & Recharge', path: '/pay', desc: 'Mobile, DTH, utilities', iconBg: 'bg-green-100 text-green-600' },
    ],
  },
  {
    title: 'Business',
    color: 'text-purple-600',
    items: [
      { icon: Store, label: 'List your Business', path: '/list-business', desc: 'Register for free', iconBg: 'bg-purple-100 text-purple-600', badge: 'Free' },
      { icon: Megaphone, label: 'Advertise', path: '/advertise', desc: 'Reach 50K+ users', iconBg: 'bg-rose-100 text-rose-600' },
      { icon: Handshake, label: 'B2B Marketplace', path: '/b2b', desc: 'Connect with suppliers', iconBg: 'bg-indigo-100 text-indigo-600' },
      { icon: TrendingUp, label: 'Leads Dashboard', path: '/leads', desc: 'Manage customer leads', iconBg: 'bg-emerald-100 text-emerald-600' },
      { icon: Building2, label: 'Business Directory', path: '/search', desc: 'All Udupi businesses', iconBg: 'bg-sky-100 text-sky-600' },
      { icon: FileText, label: 'Invoice Manager', path: '/invoice', desc: 'Create & manage invoices', iconBg: 'bg-violet-100 text-violet-600', badge: 'NEW' },
    ],
  },
  {
    title: 'Explore Udupi',
    color: 'text-blue-600',
    items: [
      { icon: Newspaper, label: 'Udupi News', path: '/news', desc: 'Latest local updates', iconBg: 'bg-cyan-100 text-cyan-600', badge: '4' },
      { icon: Car, label: 'Book Auto-Rickshaw', path: '/book-rickshaw', desc: 'Ride across Udupi', iconBg: 'bg-yellow-100 text-yellow-600', badge: 'NEW' },
      { icon: Home, label: 'Property Buy/Sell', path: '/property', desc: 'Buy, rent & sell property', iconBg: 'bg-rose-100 text-rose-600', badge: 'NEW' },
      { icon: Globe, label: 'Build My Website', path: '/website-builder', desc: 'Launch your online store', iconBg: 'bg-teal-100 text-teal-600', badge: 'FREE' },
      { icon: Zap, label: 'Electricians', path: '/electricians', desc: 'Electrical services', iconBg: 'bg-amber-100 text-amber-600' },
      { icon: Wrench, label: 'Plumbers', path: '/plumbers', desc: 'Plumbing & water services', iconBg: 'bg-blue-100 text-blue-600' },
      { icon: Coffee, label: 'Restaurants & Cafes', path: '/search?category=restaurants', desc: 'Best places to eat', iconBg: 'bg-orange-100 text-orange-600' },
      { icon: MapPin, label: 'Nearby Places', path: '/search', desc: 'Discover around you', iconBg: 'bg-rose-100 text-rose-600' },
      { icon: Star, label: 'Top Rated', path: '/search?sort=rating', desc: 'Highest rated businesses', iconBg: 'bg-yellow-100 text-yellow-600' },
    ],
  },
  {
    title: 'Company',
    color: 'text-gray-600',
    items: [
      { icon: Briefcase, label: 'We are Hiring', path: '/careers', desc: 'Join UdupiGo team', iconBg: 'bg-indigo-100 text-indigo-600' },
      { icon: LineChart, label: 'Investor Relations', path: '/investors', desc: 'Company performance', iconBg: 'bg-green-100 text-green-600' },
      { icon: Lightbulb, label: "What's New", path: '/whats-new', desc: 'Latest updates & features', iconBg: 'bg-amber-100 text-amber-600' },
      { icon: Globe, label: 'About Us', path: '/more', desc: 'Our story & mission', iconBg: 'bg-sky-100 text-sky-600' },
    ],
  },
  {
    title: 'Support & Legal',
    color: 'text-gray-500',
    items: [
      { icon: HelpCircle, label: 'Customer Service', path: '/customer-service', desc: '24/7 support available', iconBg: 'bg-teal-100 text-teal-600' },
      { icon: Heart, label: 'Help Center', path: '/help', desc: 'FAQs & guides', iconBg: 'bg-pink-100 text-pink-600' },
      { icon: Settings, label: 'Settings', path: '/settings', desc: 'Preferences & privacy', iconBg: 'bg-gray-100 text-gray-600' },
      { icon: Shield, label: 'Privacy Policy', path: '/privacy', desc: 'How we protect you', iconBg: 'bg-blue-100 text-blue-600' },
      { icon: FileText, label: 'Terms of Service', path: '/terms', desc: 'Usage terms', iconBg: 'bg-slate-100 text-slate-600' },
      { icon: Info, label: 'Others', path: '/others', desc: 'More links & info', iconBg: 'bg-gray-100 text-gray-500' },
    ],
  },
];

// Featured services banner items  
const FEATURED = [
  { emoji: '🏥', label: 'Doctors', path: '/search?category=doctors', color: 'bg-red-50 border-red-100' },
  { emoji: '🏨', label: 'Hotels', path: '/search?category=hotels', color: 'bg-blue-50 border-blue-100' },
  { emoji: '💇', label: 'Salons', path: '/search?category=salons', color: 'bg-pink-50 border-pink-100' },
  { emoji: '🍽️', label: 'Restaurants', path: '/search?category=restaurants', color: 'bg-amber-50 border-amber-100' },
  { emoji: '🚗', label: 'Travel', path: '/search?category=travel', color: 'bg-green-50 border-green-100' },
  { emoji: '🏢', label: 'Real Estate', path: '/search?category=real-estate', color: 'bg-purple-50 border-purple-100' },
];

const SideDrawer = ({ isOpen, onClose, onLoginOpen }: SideDrawerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      logout();
      toast.success('Signed out successfully');
    } catch {
      toast.error('Logout failed');
    }
    onClose();
  };

  const handleLoginClick = () => {
    onLoginOpen();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
        style={{ animation: 'fadeIn 0.2s ease' }}
      />

      {/* Drawer panel */}
      <div
        className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[360px] bg-white shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: 'slideInLeft 0.28s cubic-bezier(0.32,0.72,0,1)' }}
      >
        {/* ── PROFILE HEADER ── */}
        <div className="relative bg-gradient-to-br from-[#0d9488] via-brand-teal to-[#0a6b65] px-5 pt-12 pb-5 flex-shrink-0">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10 pointer-events-none" />
          <div className="absolute bottom-0 left-16 w-20 h-20 bg-white/5 rounded-full translate-y-8 pointer-events-none" />

          <button onClick={onClose} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors" aria-label="Close menu">
            <X size={18} />
          </button>

          {/* App brand top-right */}
          <div className="absolute top-4 right-4">
            <span className="font-heading font-bold text-white text-sm tracking-tight">Udupi<span className="text-brand-coral">Go</span></span>
          </div>

          {/* Avatar + info */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={user ? () => handleNav('/profile') : handleLoginClick}
              className="relative w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center overflow-hidden flex-shrink-0 hover:border-white/60 transition-colors"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : user ? (
                <span className="text-white font-bold text-2xl">{user.username[0].toUpperCase()}</span>
              ) : (
                <User size={30} className="text-white/80" />
              )}
              {user && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              {user ? (
                <>
                  <h2 className="text-white font-heading font-bold text-lg leading-tight truncate">{user.username}</h2>
                  <p className="text-white/60 text-xs mt-0.5 truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="px-2.5 py-1 bg-white/15 rounded-full text-[10px] text-white font-medium">Udupi Member</span>
                    <span className="px-2.5 py-1 bg-green-500/30 rounded-full text-[10px] text-green-200 font-medium flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-300 rounded-full" />Online
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-white font-heading font-bold text-xl">Welcome!</h2>
                  <p className="text-white/70 text-xs mt-0.5">Sign in to unlock full features</p>
                  <button onClick={handleLoginClick} className="mt-2.5 bg-white text-brand-teal font-bold text-xs px-5 py-2 rounded-xl hover:bg-white/90 transition-colors">
                    Sign In / Register
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User stats (logged in only) */}
          {user && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { value: '0', label: 'Reviews', path: '/profile' },
                { value: '0', label: 'Saved', path: '/profile' },
                { value: '0', label: 'Listings', path: '/used-products' },
              ].map(({ value, label, path }) => (
                <button key={label} onClick={() => handleNav(path)}
                  className="bg-white/10 hover:bg-white/20 rounded-xl py-2 text-center transition-colors">
                  <p className="text-white font-heading font-bold text-base">{value}</p>
                  <p className="text-white/60 text-[9px] font-medium">{label}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* Quick Actions Grid */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Quick Access</p>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_ACTIONS.map(({ icon: Icon, label, path, color }) => (
                <button key={label} onClick={() => handleNav(path)}
                  className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors active:scale-95">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[9px] font-medium text-gray-600 leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Featured Categories */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Browse Categories</p>
            <div className="grid grid-cols-3 gap-2">
              {FEATURED.map(({ emoji, label, path, color }) => (
                <button key={label} onClick={() => handleNav(path)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-medium text-gray-700 hover:border-brand-teal/30 hover:bg-brand-teal/5 transition-colors ${color}`}>
                  <span className="text-base">{emoji}</span>
                  <span className="text-[10px] font-semibold truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-gray-100" />

          {/* ── MENU SECTIONS ── */}
          <div className="pb-4">
            {MENU_SECTIONS.map(section => (
              <div key={section.title}>
                <p className={`px-5 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider ${section.color}`}>
                  {section.title}
                </p>
                {section.items.map(({ icon: Icon, label, path, desc, iconBg, badge }) => {
                  const isActive = location.pathname === path;
                  return (
                    <button
                      key={label}
                      onClick={() => handleNav(path)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors group ${isActive ? 'bg-brand-teal/5' : 'hover:bg-gray-50'}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${isActive ? 'ring-2 ring-brand-teal/20' : ''}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className={`text-sm font-semibold leading-tight truncate ${isActive ? 'text-brand-teal' : 'text-gray-800'}`}>{label}</p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{desc}</p>
                      </div>
                      {badge && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          badge === 'NEW' ? 'bg-brand-coral text-white' :
                          badge === 'Free' ? 'bg-green-100 text-green-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>{badge}</span>
                      )}
                      <ChevronRight size={12} className={`flex-shrink-0 ${isActive ? 'text-brand-teal' : 'text-gray-300'}`} />
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Contact quick links */}
            <div className="mx-4 mt-4 bg-gradient-to-r from-brand-teal/5 to-blue-50 rounded-2xl p-4 border border-brand-teal/10">
              <p className="text-xs font-bold text-gray-700 mb-3">Need Help? Contact Us</p>
              <div className="flex gap-2">
                <a href="tel:+918202299800" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white rounded-xl text-xs font-semibold text-brand-teal border border-brand-teal/20 hover:bg-brand-teal/5 transition-colors">
                  <Phone size={13} /> Call
                </a>
                <a href="https://wa.me/918202299800" target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 rounded-xl text-xs font-semibold text-white hover:bg-green-600 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a href="mailto:support@udupigo.in"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white rounded-xl text-xs font-semibold text-brand-coral border border-brand-coral/20 hover:bg-brand-coral/5 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  Email
                </a>
              </div>
            </div>

            {/* Sign Out */}
            {user && (
              <div className="mx-4 mt-3">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors group border border-red-100"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                    <LogOut size={16} className="text-red-500" />
                  </div>
                  <span className="font-semibold text-red-600 text-sm">Sign Out</span>
                  <ChevronRight size={12} className="text-red-300 ml-auto" />
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-5 text-center border-t border-gray-100">
            <p className="font-heading text-base font-bold">
              <span className="text-brand-teal">Udupi</span><span className="text-brand-coral">Go</span>
            </p>
            <p className="text-[10px] text-gray-400 mt-1">Your Local Business Discovery Platform</p>
            <p className="text-[9px] text-gray-300 mt-1">v1.0.0 · Udupi, Karnataka · Made with ❤️</p>

            <div className="flex items-center justify-center gap-4 mt-3">
              {[
                { label: 'Privacy', path: '/privacy' },
                { label: 'Terms', path: '/terms' },
                { label: 'Help', path: '/help' },
              ].map(({ label, path }) => (
                <button key={label} onClick={() => handleNav(path)} className="text-[10px] text-gray-400 hover:text-brand-teal transition-colors">{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default SideDrawer;
