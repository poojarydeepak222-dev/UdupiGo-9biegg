import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNav from "@/components/layout/BottomNav";

const PAGE_CONFIG: Record<string, { title: string; emoji: string; content: string }> = {
  '/leads': {
    title: 'My Leads',
    emoji: '📊',
    content: 'Track and manage all your business leads from customers who contacted you through UdupiGo.',
  },
  '/b2b': {
    title: 'B2B Marketplace',
    emoji: '🤝',
    content: 'Connect with suppliers, manufacturers, and business partners across Udupi and coastal Karnataka.',
  },
  '/pay': {
    title: 'UdupiGo Pay',
    emoji: '💳',
    content: 'Pay utility bills, recharge mobile, and make payments to local businesses — all in one place.',
  },
  '/transactions': {
    title: 'My Transactions',
    emoji: '🧾',
    content: 'View your complete transaction history including payments and orders.',
  },
  '/profile': {
    title: 'My Profile',
    emoji: '👤',
    content: 'Manage your profile, saved businesses, and account settings.',
  },
  '/customer-service': {
    title: 'Customer Service',
    emoji: '🎧',
    content: 'Need help? Our customer service team is available Monday to Saturday, 9 AM to 6 PM.',
  },
  '/help': {
    title: 'Help Center',
    emoji: '❓',
    content: 'Find answers to frequently asked questions about UdupiGo.',
  },
  '/quotes': {
    title: 'Manage Quotes',
    emoji: '💬',
    content: 'View and manage price quotes requested from local businesses.',
  },
  '/careers': {
    title: 'We are Hiring!',
    emoji: '💼',
    content: 'Join the UdupiGo team and help build the future of local business discovery in Udupi.',
  },
  '/settings': {
    title: 'Settings',
    emoji: '⚙️',
    content: 'Manage your app preferences, notifications, and privacy settings.',
  },
  '/privacy': {
    title: 'Privacy Policy',
    emoji: '🔒',
    content: 'UdupiGo is committed to protecting your privacy. We collect only the information necessary to provide our services.',
  },
  '/investors': {
    title: 'Investor Relations',
    emoji: '📈',
    content: 'Information for investors interested in UdupiGo growth story in coastal Karnataka.',
  },
  '/whats-new': {
    title: "What's New",
    emoji: '✨',
    content: 'Version 1.0 — Initial launch of UdupiGo with 500+ businesses listed across Udupi district.',
  },
  '/notifications': {
    title: 'Notifications',
    emoji: '🔔',
    content: 'Stay updated with the latest offers and news from businesses near you.',
  },
  '/others': {
    title: 'Others',
    emoji: '∞',
    content: 'More features and services coming soon to UdupiGo.',
  },
  '/more': {
    title: 'More',
    emoji: '📋',
    content: 'Explore additional features and services available on UdupiGo.',
  },
  '/advertise': {
    title: 'Advertise',
    emoji: '📢',
    content: 'Promote your business to thousands of UdupiGo users. Get more visibility and leads.',
  },
  '/terms': {
    title: 'Terms of Service',
    emoji: '📄',
    content: 'By using UdupiGo, you agree to our terms and conditions.',
  },
  '/offers': {
    title: 'Special Offers',
    emoji: '🎉',
    content: 'Exclusive deals and discounts from local businesses in Udupi.',
  },
};

const GenericPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const config = PAGE_CONFIG[location.pathname] || {
    title: 'Coming Soon',
    emoji: '🚧',
    content: 'This feature is under development. Check back soon!',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-heading font-bold text-gray-900 text-lg">{config.title}</h1>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center px-8 pt-20 text-center">
        <div className="w-24 h-24 bg-brand-teal/10 rounded-3xl flex items-center justify-center mb-6">
          <span className="text-4xl">{config.emoji}</span>
        </div>
        <h2 className="font-heading font-bold text-gray-900 text-2xl mb-3">{config.title}</h2>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{config.content}</p>

        <button
          onClick={() => navigate('/')}
          className="mt-8 bg-brand-teal text-white font-semibold px-8 py-3 rounded-xl hover:bg-brand-teal-dark transition-colors"
        >
          Back to Home
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default GenericPage;
