import { useState } from 'react';
import { Check, Moon, Sun, Smartphone, Layout, Type, Palette } from 'lucide-react';

const COLORS = ['#0d9488','#f05a28','#2563eb','#7c3aed','#16a34a','#db2777','#d97706','#4338ca','#111827','#0891b2','#65a30d','#be123c'];
const FONTS = ['Inter','Poppins','Montserrat','Playfair Display','Roboto','Lato'];
const LAYOUTS = [
  { id: 'classic', label: 'Classic', desc: 'Banner + cards + sections' },
  { id: 'hero', label: 'Hero Focus', desc: 'Large hero with strong CTA' },
  { id: 'grid', label: 'Product Grid', desc: 'Clean shopping-first layout' },
  { id: 'magazine', label: 'Magazine', desc: 'Editorial sections and images' },
];

export interface DesignSettings {
  color: string;
  font: string;
  layout: string;
  button: 'rounded' | 'square' | 'pill';
  dark: boolean;
}

const DEFAULTS: DesignSettings = {
  color: '#0d9488',
  font: 'Inter',
  layout: 'classic',
  button: 'rounded',
  dark: false,
};

export default function WebsiteDesignStudio({
  value = DEFAULTS,
  onChange,
}: {
  value?: DesignSettings;
  onChange: (v: DesignSettings) => void;
}) {
  const [settings, setSettings] = useState<DesignSettings>({ ...DEFAULTS, ...value });

  const update = (patch: Partial<DesignSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    onChange(next);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-5">
      {/* Header */}
      <div>
        <h3 className="font-heading font-bold text-gray-900 flex items-center gap-2">
          <Palette size={17} /> Design Studio
        </h3>
        <p className="text-[11px] text-gray-400 mt-1">Customize your website without coding</p>
      </div>

      {/* Brand Color */}
      <div>
        <label className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-2">
          <Palette size={13} /> Brand Color
        </label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => update({ color: c })}
              style={{ backgroundColor: c }}
              className={`w-9 h-9 rounded-xl relative ${settings.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
              aria-label={c}
            >
              {settings.color === c && <Check size={15} className="absolute inset-0 m-auto text-white" />}
            </button>
          ))}
          <label className="w-9 h-9 rounded-xl border border-gray-200 overflow-hidden relative cursor-pointer" title="Custom color">
            <input
              type="color"
              value={settings.color}
              onChange={e => update({ color: e.target.value })}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="absolute inset-1 rounded-lg" style={{ backgroundColor: settings.color }} />
          </label>
        </div>
      </div>

      {/* Font Style */}
      <div>
        <label className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-2">
          <Type size={13} /> Font Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map(f => (
            <button
              key={f}
              onClick={() => update({ font: f })}
              style={{ fontFamily: f }}
              className={`p-2.5 rounded-xl border text-xs text-left ${
                settings.font === f
                  ? 'border-brand-teal bg-brand-teal/5 text-brand-teal font-bold'
                  : 'border-gray-100 bg-gray-50 text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Homepage Layout */}
      <div>
        <label className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-2">
          <Layout size={13} /> Homepage Layout
        </label>
        <div className="space-y-2">
          {LAYOUTS.map(l => (
            <button
              key={l.id}
              onClick={() => update({ layout: l.id })}
              className={`w-full p-3 rounded-xl border text-left ${
                settings.layout === l.id ? 'border-brand-teal bg-brand-teal/5' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <p className="text-xs font-bold text-gray-700">{l.label}</p>
              <p className="text-[10px] text-gray-400">{l.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Button Shape */}
      <div>
        <label className="text-xs font-bold text-gray-600 mb-2 block">Button Shape</label>
        <div className="grid grid-cols-3 gap-2">
          {(['rounded', 'square', 'pill'] as const).map(b => (
            <button
              key={b}
              onClick={() => update({ button: b })}
              className={`py-2 text-xs font-bold border ${
                b === 'rounded' ? 'rounded-xl' : b === 'pill' ? 'rounded-full' : 'rounded-none'
              } ${settings.button === b ? 'border-brand-teal text-brand-teal bg-brand-teal/5' : 'border-gray-200 text-gray-500'}`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => update({ dark: !settings.dark })}
        className={`w-full flex items-center justify-between p-3 rounded-xl border ${
          settings.dark ? 'border-gray-800 bg-gray-900 text-white' : 'border-gray-100 bg-gray-50 text-gray-700'
        }`}
      >
        <span className="text-xs font-bold flex items-center gap-2">
          {settings.dark ? <Moon size={15} /> : <Sun size={15} />}
          {settings.dark ? 'Dark' : 'Light'} website
        </span>
        <span className="text-[10px] opacity-70">Tap to switch</span>
      </button>

      {/* Mobile Preview */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Smartphone size={15} />
          <span className="text-xs font-bold">Mobile preview</span>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-200" style={{ fontFamily: settings.font }}>
          <div className="h-12 rounded-lg mb-2" style={{ backgroundColor: settings.color }} />
          <div className="h-2 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-2 bg-gray-100 rounded w-1/2 mb-3" />
          <button
            className={`px-4 py-2 text-[10px] text-white ${
              settings.button === 'rounded' ? 'rounded-xl' : settings.button === 'pill' ? 'rounded-full' : 'rounded-none'
            }`}
            style={{ backgroundColor: settings.color }}
          >
            View Store
          </button>
        </div>
      </div>
    </div>
  );
}
