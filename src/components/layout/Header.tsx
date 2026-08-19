import { Bell, User, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/hooks/useAuth";

interface HeaderProps {
  onMenuOpen: () => void;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: (val: string) => void;
  showSearch?: boolean;
  onLoginOpen?: () => void;
}

const Header = ({ onMenuOpen, searchValue = '', onSearchChange, onSearchSubmit, showSearch = true, onLoginOpen }: HeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit && searchValue.trim()) {
      onSearchSubmit(searchValue.trim());
    }
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else if (onLoginOpen) {
      onLoginOpen();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuOpen}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
            aria-label="Open menu"
          >
            <Menu size={22} className="text-gray-700" />
          </button>
          <button onClick={onMenuOpen} className="flex items-center" aria-label="Home">
            <span className="font-heading text-2xl font-800 text-brand-teal">Udupi<span className="text-brand-coral">Go</span></span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={22} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-coral rounded-full" />
          </button>
          <button
            onClick={handleProfileClick}
            className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors overflow-hidden"
            aria-label="Profile"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : user ? (
              <span className="font-bold text-gray-700 text-sm">{user.username[0].toUpperCase()}</span>
            ) : (
              <User size={18} className="text-gray-600" />
            )}
          </button>
        </div>
      </div>

      <div className="px-4 pb-1 flex items-center gap-1 text-sm text-gray-500">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-coral">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        <span className="font-medium text-gray-700">Udupi</span>
        <span className="text-gray-400">, Karnataka</span>
      </div>

      {showSearch && (
        <form onSubmit={handleSearch} className="px-4 pb-3">
          <div className="relative flex items-center bg-gray-100 rounded-xl border border-gray-200 focus-within:border-brand-teal focus-within:bg-white transition-all">
            <svg className="absolute left-3 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={e => onSearchChange?.(e.target.value)}
              placeholder="Search businesses, services..."
              className="w-full bg-transparent pl-10 pr-12 py-3 text-sm outline-none text-gray-800 placeholder-gray-400"
            />
            <button type="button" className="absolute right-3 p-1 text-brand-teal" aria-label="Voice search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          </div>
        </form>
      )}
    </header>
  );
};

export default Header;
