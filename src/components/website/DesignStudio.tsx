import { Check, Eye, Palette, Sparkles } from 'lucide-react';

type DesignValue = {
  theme_color: string;
  template: string;
};

type Props = {
  value: DesignValue;
  onChange: (patch: Partial<DesignValue>) => void;
  onSave: () => void;
  saving?: boolean;
};

const PRESETS = [
  { name: 'Udupi Teal', color: '#0d9488', template: 'modern', desc: 'Fresh & local' },
  { name: 'Coastal Orange', color: '#f05a28', template: 'modern', desc: 'Bold & energetic' },
  { name: 'Royal Purple', color: '#7c3aed', template: 'boutique', desc: 'Premium & elegant' },
  { name: 'Rose Boutique', color: '#db2777', template: 'boutique', desc: 'Fashion & beauty' },
  { name: 'Clean Blue', color: '#2563eb', template: 'minimal', desc: 'Professional & clean' },
  { name: 'Nature Green', color: '#16a34a', template: 'minimal', desc: 'Natural & friendly' },
  { name: 'Warm Amber', color: '#d97706', template: 'modern', desc: 'Warm & welcoming' },
  { name: 'Deep Indigo', color: '#4338ca', template: 'boutique', desc: 'Modern & premium' },
];

const TEMPLATES = [
  { id: 'modern', label: 'Modern', icon: '✨', desc: 'Bold hero, rounded cards and strong CTAs' },
  { id: 'boutique', label: 'Boutique', icon: '🛍️', desc: 'Elegant spacing and premium presentation' },
  { id: 'minimal', label: 'Minimal', icon: '⬜', desc: 'Clean product-first layout' },
];

export default function DesignStudio({ value, onChange, onSave, saving }: Props) {
  const previewColor = value.theme_color || '#0d9488';

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <div className="rounded-3xl p-5 text-white overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${previewColor}, #111827)` }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-white/80 mb-2"><Sparkles size={14} /> DESIGN STUDIO</div>
          <h2 className="font-heading font-bold text-2xl">Make it yours</h2>
          <p className="text-xs text-white/80 mt-1 max-w-sm">Choose a ready-made style or build your own brand look.</p>
        </div>
        <Palette className="absolute -right-3 -bottom-5 opacity-15" size={110} />
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div><h3 className="font-heading font-bold text-gray-900 text-sm">Quick Design Presets</h3><p className="text-[10px] text-gray-400">One tap changes your whole look</p></div>
          <Sparkles size={17} className="text-brand-teal" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map(p => {
            const active = value.theme_color === p.color && value.template === p.template;
            return (
              <button key={p.name} onClick={() => onChange({ theme_color: p.color, template: p.template })}
                className={`text-left rounded-2xl p-3 border-2 transition-all ${active ? 'border-gray-900 shadow-sm' : 'border-gray-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-xl" style={{ backgroundColor: p.color }} />
                  {active && <Check size={14} className="ml-auto text-gray-900" />}
                </div>
                <p className="text-xs font-bold text-gray-800">{p.name}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
        <div><h3 className="font-heading font-bold text-gray-900 text-sm">Brand Color</h3><p className="text-[10px] text-gray-400">Pick any color for your website</p></div>
        <div className="flex items-center gap-3">
          <input type="color" value={previewColor} onChange={e => onChange({ theme_color: e.target.value })} className="w-12 h-12 rounded-xl border-0 p-0 overflow-hidden" />
          <input value={previewColor} onChange={e => onChange({ theme_color: e.target.value })} className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-sm font-mono uppercase outline-none border border-gray-100" maxLength={7} />
          <span className="w-12 h-12 rounded-xl shadow-inner" style={{ backgroundColor: previewColor }} />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-heading font-bold text-gray-900 text-sm mb-3">Homepage Style</h3>
        <div className="space-y-2">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => onChange({ template: t.id })}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left ${value.template === t.id ? 'border-brand-teal bg-brand-teal/5' : 'border-gray-100 bg-gray-50'}`}>
              <span className="text-2xl">{t.icon}</span>
              <div className="flex-1"><p className="text-sm font-bold text-gray-800">{t.label}</p><p className="text-[10px] text-gray-400">{t.desc}</p></div>
              {value.template === t.id && <Check size={16} className="text-brand-teal" />}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex items-center gap-2 mb-3"><Eye size={16} className="text-brand-teal" /><h3 className="font-heading font-bold text-gray-900 text-sm">Live Style Preview</h3></div>
        <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
          <div className="h-20 flex items-end p-3 text-white" style={{ background: `linear-gradient(135deg, ${previewColor}, #111827)` }}>
            <div><p className="font-bold text-sm">Your Business</p><p className="text-[9px] text-white/70">Beautifully designed on UdupiGo</p></div>
          </div>
          <div className={`p-3 grid ${value.template === 'minimal' ? 'grid-cols-2' : 'grid-cols-2'} gap-2`}>
            {[1, 2].map(i => <div key={i} className="bg-white rounded-xl p-2 border border-gray-100"><div className="h-12 rounded-lg bg-gray-100 mb-2" /><div className="h-2 w-3/4 rounded" style={{ backgroundColor: `${previewColor}55` }} /><div className="h-2 w-1/2 rounded bg-gray-100 mt-1" /></div>)}
          </div>
        </div>
      </section>

      <button onClick={onSave} disabled={saving}
        className="w-full py-3.5 rounded-xl bg-brand-teal text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
        <Check size={16} /> {saving ? 'Saving Design...' : 'Save Design'}
      </button>
    </div>
  );
}
