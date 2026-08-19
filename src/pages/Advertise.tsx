import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Megaphone, TrendingUp, Users, Eye, Star, Phone, Mail, Loader2 } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { toast } from 'sonner';

const PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹999',
    period: '/month',
    color: 'border-gray-200',
    headerColor: 'bg-gray-50',
    badge: null,
    features: ['Business listing (basic)', '50 lead credits/month', 'Appear in search results', 'Customer reviews enabled', 'UdupiGo verified badge'],
  },
  {
    id: 'business',
    name: 'Business',
    price: '₹2,499',
    period: '/month',
    color: 'border-brand-teal',
    headerColor: 'bg-brand-teal',
    badge: 'POPULAR',
    features: ['All Starter features', '200 lead credits/month', 'Priority search placement', 'Featured in category listing', 'Homepage banner slot (1 week)', 'WhatsApp inquiry routing', 'Analytics dashboard access'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹5,999',
    period: '/month',
    color: 'border-amber-400',
    headerColor: 'bg-gradient-to-r from-amber-400 to-orange-500',
    badge: 'BEST VALUE',
    features: ['All Business features', 'Unlimited lead credits', 'Top placement in every search', 'Homepage featured section', 'Full page banner ad', 'Push notification to users', 'Dedicated account manager', 'Monthly performance report'],
  },
];

const STATS = [
  { value: '50,000+', label: 'Monthly Users', icon: Users, color: 'text-brand-teal' },
  { value: '5,00,000+', label: 'Monthly Views', icon: Eye, color: 'text-blue-500' },
  { value: '500+', label: 'Listed Businesses', icon: TrendingUp, color: 'text-brand-coral' },
  { value: '4.7★', label: 'Average Rating', icon: Star, color: 'text-amber-500' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Choose your Plan', desc: 'Select a package that fits your budget and business goals.' },
  { step: '02', title: 'Submit your Details', desc: 'Fill in your business name, category, contact info and description.' },
  { step: '03', title: 'Go Live in 24 hrs', desc: 'Our team verifies and publishes your listing with verified badge.' },
  { step: '04', title: 'Get Leads & Grow', desc: 'Customers discover, call, and enquire directly through UdupiGo.' },
];

const Advertise = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', business: '', phone: '', plan: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleApply = async () => {
    if (!form.name || !form.phone) { toast.error('Please fill your name and phone'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    toast.success('Application submitted! Our team will call you within 24 hours.');
    setForm({ name: '', business: '', phone: '', plan: '' });
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-heading font-bold text-gray-900 text-lg">Advertise on UdupiGo</h1>
          <p className="text-xs text-gray-500">Reach 50,000+ users in Udupi</p>
        </div>
        <div className="ml-auto">
          <span className="bg-brand-coral text-white text-[10px] font-bold px-2.5 py-1 rounded-full">GROW YOUR BIZ</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-brand-teal to-[#0d7a72] rounded-2xl p-5 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute right-8 bottom-0 w-20 h-20 bg-white/5 rounded-full translate-y-6" />
        <Megaphone size={32} className="text-white/80 mb-3" />
        <h2 className="font-heading font-bold text-xl">Grow Your Business in Udupi</h2>
        <p className="text-white/80 text-sm mt-1 leading-relaxed">Get featured on Udupi's #1 local discovery platform. Reach customers actively searching for your services.</p>
      </div>

      {/* Stats Grid */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        {STATS.map(({ value, label, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className={`font-heading font-bold text-base ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Packages */}
      <div className="px-4 mt-5">
        <h2 className="font-heading font-bold text-gray-900 text-base mb-3">Choose Your Advertising Plan</h2>
        <div className="space-y-4">
          {PACKAGES.map(pkg => (
            <div
              key={pkg.id}
              onClick={() => { setSelectedPlan(pkg.id); setForm(f => ({ ...f, plan: pkg.name })); }}
              className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden cursor-pointer transition-all ${selectedPlan === pkg.id ? pkg.color : 'border-gray-100'}`}
            >
              <div className={`px-4 py-3 flex items-center justify-between ${pkg.id === 'business' ? pkg.headerColor : pkg.id === 'premium' ? pkg.headerColor : 'bg-gray-50'}`}>
                <div>
                  <span className={`font-heading font-bold text-base ${pkg.id === 'starter' ? 'text-gray-800' : 'text-white'}`}>{pkg.name}</span>
                  {pkg.badge && <span className={`ml-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${pkg.id === 'premium' ? 'bg-white text-orange-500' : 'bg-white/30 text-white'}`}>{pkg.badge}</span>}
                </div>
                <div className="text-right">
                  <span className={`font-heading font-bold text-xl ${pkg.id === 'starter' ? 'text-gray-900' : 'text-white'}`}>{pkg.price}</span>
                  <span className={`text-xs ${pkg.id === 'starter' ? 'text-gray-500' : 'text-white/80'}`}>{pkg.period}</span>
                </div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-700">
                      <CheckCircle size={13} className="text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="px-4 mt-6">
        <h2 className="font-heading font-bold text-gray-900 text-base mb-3">How It Works</h2>
        <div className="grid grid-cols-2 gap-3">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <span className="font-heading font-bold text-2xl text-brand-teal/20">{step}</span>
              <h3 className="font-semibold text-sm text-gray-900 mt-1">{title}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Application Form */}
      <div className="mx-4 mt-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-heading font-bold text-gray-900 text-base mb-1">Apply Now</h3>
        <p className="text-xs text-gray-500 mb-4">Fill in your details and our team will contact you within 24 hours.</p>
        <div className="space-y-3">
          {[
            { label: 'Your Name', field: 'name', placeholder: 'Full name', type: 'text' },
            { label: 'Business Name', field: 'business', placeholder: 'Your business name', type: 'text' },
            { label: 'Phone Number', field: 'phone', placeholder: '+91 98765 43210', type: 'tel' },
          ].map(({ label, field, placeholder, type }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} value={(form as Record<string, string>)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-teal transition-colors" />
            </div>
          ))}
          {selectedPlan && (
            <div className="bg-brand-teal/5 border border-brand-teal/20 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">Selected Plan:</span>
              <span className="text-xs font-bold text-brand-teal">{form.plan} — {PACKAGES.find(p => p.id === selectedPlan)?.price}/month</span>
            </div>
          )}
          <button onClick={handleApply} disabled={submitting}
            className="w-full bg-brand-teal text-white font-bold py-3.5 rounded-xl hover:bg-[#0d7a72] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Submit Application
          </button>
        </div>
      </div>

      {/* Contact */}
      <div className="mx-4 mt-4 mb-2 grid grid-cols-2 gap-3">
        <a href="tel:+918202299800" className="flex items-center justify-center gap-2 bg-white rounded-2xl py-3 shadow-sm border border-gray-100 text-brand-teal font-semibold text-sm">
          <Phone size={16} /> Call Us
        </a>
        <a href="mailto:advertise@udupigo.in" className="flex items-center justify-center gap-2 bg-white rounded-2xl py-3 shadow-sm border border-gray-100 text-brand-coral font-semibold text-sm">
          <Mail size={16} /> Email Us
        </a>
      </div>

      <BottomNav />
    </div>
  );
};

export default Advertise;
