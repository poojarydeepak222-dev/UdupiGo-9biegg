import { useNavigate, useLocation } from "react-router-dom";
import { Home, TrendingUp, Handshake, CreditCard, Newspaper, MoreHorizontal } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'leads', label: 'Leads', icon: TrendingUp, path: '/leads', badge: '3' },
  { id: 'b2b', label: 'B2B', icon: Handshake, path: '/b2b' },
  { id: 'pay', label: 'Pay', icon: CreditCard, path: '/pay' },
  { id: 'news', label: 'News', icon: Newspaper, path: '/news', badge: '4' },
  { id: 'more', label: 'More', icon: MoreHorizontal, path: '/more' },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around px-1 py-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon, path, badge }) => {
          const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 min-w-[44px] min-h-[44px] justify-center rounded-lg transition-colors ${
                isActive ? 'text-brand-teal' : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label={label}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {badge && (
                  <span className="absolute -top-2 -right-2 bg-brand-coral text-white text-[9px] font-bold min-w-[15px] h-[15px] rounded-full flex items-center justify-center px-0.5">
                    {badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-brand-teal' : 'text-gray-500'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
