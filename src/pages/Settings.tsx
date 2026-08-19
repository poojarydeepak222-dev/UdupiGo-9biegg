import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, MapPin, Lock, Globe, Moon, Trash2, ChevronRight, Shield, Volume2, Eye, Smartphone } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { useAuthStore } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

const Toggle = ({ value, onChange }: ToggleProps) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-brand-teal' : 'bg-gray-200'}`}
    role="switch"
    aria-checked={value}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const LANGUAGES = ['English', 'Kannada (ಕನ್ನಡ)', 'Hindi (हिन्दी)', 'Tulu', 'Konkani'];

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [settings, setSettings] = useState({
    pushNotifications: true,
    leadAlerts: true,
    offerAlerts: true,
    newsAlerts: false,
    emailDigest: true,
    locationEnabled: true,
    darkMode: false,
    dataSaver: false,
    showPhone: true,
    showEmail: false,
    twoFactor: false,
    sounds: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(s => ({ ...s, [key]: !s[key] }));
    toast.success('Setting updated');
  };

  const [language, setLanguage] = useState('English');
  const [showLangPicker, setShowLangPicker] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
        <h1 className="font-heading font-bold text-gray-900 text-lg">Settings</h1>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* Profile Quick View */}
        {user && (
          <button onClick={() => navigate('/profile')} className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 text-left hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal font-bold text-lg flex-shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{user.username}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        )}

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
            <Bell size={15} className="text-brand-teal" />
            <h2 className="font-heading font-semibold text-gray-900 text-sm">Notifications</h2>
          </div>
          {[
            { key: 'pushNotifications', label: 'Push Notifications', sub: 'Receive all app notifications' },
            { key: 'leadAlerts', label: 'Lead Alerts', sub: 'New customer inquiry notifications' },
            { key: 'offerAlerts', label: 'Offer & Deal Alerts', sub: 'Special offers from local businesses' },
            { key: 'newsAlerts', label: 'Udupi News', sub: 'Local news and events' },
            { key: 'emailDigest', label: 'Weekly Email Digest', sub: 'Summary of top businesses and news' },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
              <Toggle value={settings[key as keyof typeof settings] as boolean} onChange={() => toggle(key as keyof typeof settings)} />
            </div>
          ))}
        </div>

        {/* Location & Privacy */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
            <MapPin size={15} className="text-brand-coral" />
            <h2 className="font-heading font-semibold text-gray-900 text-sm">Location & Privacy</h2>
          </div>
          {[
            { key: 'locationEnabled', label: 'Location Access', sub: 'Show nearby businesses and results' },
            { key: 'showPhone', label: 'Show Phone on Profile', sub: 'Visible to businesses you contact' },
            { key: 'showEmail', label: 'Show Email on Profile', sub: 'Visible in business dashboard' },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
              <Toggle value={settings[key as keyof typeof settings] as boolean} onChange={() => toggle(key as keyof typeof settings)} />
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
            <Shield size={15} className="text-purple-500" />
            <h2 className="font-heading font-semibold text-gray-900 text-sm">Security</h2>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-800">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500">Extra security on login</p>
            </div>
            <Toggle value={settings.twoFactor} onChange={() => toggle('twoFactor')} />
          </div>
          <button onClick={() => toast.info('Password change link sent to your email!')} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Lock size={15} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-800 text-left">Change Password</p>
                <p className="text-xs text-gray-500">Reset via email OTP</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-gray-400" />
          </button>
        </div>

        {/* App Preferences */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
            <Smartphone size={15} className="text-blue-500" />
            <h2 className="font-heading font-semibold text-gray-900 text-sm">App Preferences</h2>
          </div>
          {[
            { key: 'sounds', label: 'App Sounds', sub: 'Notification and interaction sounds', icon: Volume2 },
            { key: 'darkMode', label: 'Dark Mode', sub: 'Coming soon!', icon: Moon },
            { key: 'dataSaver', label: 'Data Saver', sub: 'Load lower quality images', icon: Eye },
          ].map(({ key, label, sub, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <Icon size={15} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
              </div>
              <Toggle value={settings[key as keyof typeof settings] as boolean} onChange={() => { if (key === 'darkMode') { toast.info('Dark mode coming soon!'); return; } toggle(key as keyof typeof settings); }} />
            </div>
          ))}
          {/* Language */}
          <button onClick={() => setShowLangPicker(v => !v)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Globe size={15} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-800 text-left">Language</p>
                <p className="text-xs text-gray-500">{language}</p>
              </div>
            </div>
            <ChevronRight size={14} className={`text-gray-400 transition-transform ${showLangPicker ? 'rotate-90' : ''}`} />
          </button>
          {showLangPicker && (
            <div className="border-t border-gray-100 px-4 py-2">
              {LANGUAGES.map(lang => (
                <button key={lang} onClick={() => { setLanguage(lang); setShowLangPicker(false); toast.success(`Language changed to ${lang}`); }}
                  className={`w-full text-left py-2.5 px-2 text-sm rounded-lg flex items-center justify-between ${language === lang ? 'text-brand-teal font-medium bg-brand-teal/5' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {lang}
                  {language === lang && <span className="w-2 h-2 bg-brand-teal rounded-full" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Legal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {[
            { label: 'Privacy Policy', path: '/privacy', icon: Shield },
            { label: 'Terms of Service', path: '/terms', icon: Lock },
            { label: 'Help Center', path: '/help', icon: Bell },
          ].map(({ label, path, icon: Icon }) => (
            <button key={label} onClick={() => navigate(path)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50">
              <Icon size={15} className="text-gray-400" />
              <span className="flex-1 text-sm font-medium text-gray-800 text-left">{label}</span>
              <ChevronRight size={14} className="text-gray-400" />
            </button>
          ))}
        </div>

        {/* Danger Zone */}
        {user && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
            <button onClick={() => toast.error('Account deletion requires email confirmation. Check your inbox.')} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                <Trash2 size={16} className="text-red-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-red-600">Delete Account</p>
                <p className="text-xs text-gray-500">Permanently remove your account and data</p>
              </div>
            </button>
          </div>
        )}

        {/* App Info */}
        <div className="text-center py-2">
          <p className="font-heading font-bold text-brand-teal">Udupi<span className="text-brand-coral">Go</span></p>
          <p className="text-xs text-gray-400 mt-1">Version 1.0.0 · Build 2026.06.22</p>
          <p className="text-[10px] text-gray-300 mt-0.5">Made with ❤️ in Udupi, Karnataka</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
