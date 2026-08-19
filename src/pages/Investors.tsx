import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, Building2, MapPin, Mail, Phone, Star, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

const METRICS = [
  { value: '50,000+', label: 'Monthly Active Users', icon: Users, color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
  { value: '500+', label: 'Businesses Listed', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50' },
  { value: '20+', label: 'Areas Covered', icon: MapPin, color: 'text-brand-coral', bg: 'bg-orange-50' },
  { value: '4.7★', label: 'App Rating', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
];

const MILESTONES = [
  { date: 'Jan 2026', event: 'UdupiGo founded in Udupi, Karnataka', done: true },
  { date: 'Mar 2026', event: 'First 100 businesses onboarded', done: true },
  { date: 'May 2026', event: '10,000 monthly users milestone', done: true },
  { date: 'Jun 2026', event: 'Platform v1.0 launch — full feature set', done: true },
  { date: 'Q3 2026', event: 'Expansion to Mangaluru district', done: false },
  { date: 'Q4 2026', event: 'B2B marketplace full launch + 1000 businesses', done: false },
  { date: 'Q1 2027', event: 'Series A funding round', done: false },
  { date: '2027', event: 'Expansion to 10 coastal Karnataka cities', done: false },
];

const WHY_INVEST = [
  { icon: '🌊', title: 'Underserved Market', desc: 'Coastal Karnataka has 10M+ population with no dominant local discovery platform. JustDial has weak local presence.' },
  { icon: '🕌', title: 'Pilgrim Economy', desc: 'Udupi is one of India\'s top pilgrimage destinations — 5M+ visitors/year creating strong hospitality and services demand.' },
  { icon: '🎓', title: 'University Town', desc: 'Manipal University brings 30,000+ students and families annually — consistent demand for local services.' },
  { icon: '📈', title: 'Strong Monetisation', desc: 'Clear B2B revenue through advertising packages, B2B marketplace commissions, and premium business subscriptions.' },
  { icon: '🤝', title: 'First-Mover Advantage', desc: 'UdupiGo is building deep local relationships that are hard to replicate — the playbook for every coastal Karnataka city.' },
];

const Investors = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-heading font-bold text-gray-900 text-lg">Investor Relations</h1>
          <p className="text-xs text-gray-500">UdupiGo Technologies Pvt. Ltd.</p>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-brand-teal to-[#0d7a72] rounded-2xl p-5 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-36 h-36 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <TrendingUp size={28} className="text-white/80 mb-2" />
        <h2 className="font-heading font-bold text-xl">Building Coastal Karnataka's Local OS</h2>
        <p className="text-white/80 text-sm mt-1 leading-relaxed">UdupiGo is the leading local business discovery platform for Udupi district, on track to cover all of coastal Karnataka by 2027.</p>
        <div className="mt-4 flex gap-3 flex-wrap">
          <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">Seed Stage</span>
          <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">B2B + B2C</span>
          <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">Coastal Karnataka</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="px-4 mt-4">
        <h2 className="font-heading font-bold text-gray-900 text-sm mb-3">Key Metrics</h2>
        <div className="grid grid-cols-2 gap-3">
          {METRICS.map(({ value, label, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className={`font-heading font-bold text-base ${color}`}>{value}</p>
                <p className="text-[10px] text-gray-500 leading-tight">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Invest */}
      <div className="px-4 mt-5">
        <h2 className="font-heading font-bold text-gray-900 text-sm mb-3">Why Invest in UdupiGo?</h2>
        <div className="space-y-3">
          {WHY_INVEST.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-3">
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div>
                <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="px-4 mt-5">
        <h2 className="font-heading font-bold text-gray-900 text-sm mb-3">Growth Milestones</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="space-y-4">
            {MILESTONES.map(({ date, event, done }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${done ? 'bg-brand-teal' : 'bg-gray-200'}`} />
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${done ? 'text-brand-teal' : 'text-gray-400'}`}>{date}</p>
                  <p className={`text-sm mt-0.5 ${done ? 'text-gray-800' : 'text-gray-400'}`}>{event}</p>
                </div>
                {done && <span className="text-[10px] bg-green-50 text-green-600 font-medium px-2 py-0.5 rounded-full flex-shrink-0">Done</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business Model */}
      <div className="px-4 mt-5">
        <h2 className="font-heading font-bold text-gray-900 text-sm mb-3">Revenue Streams</h2>
        <div className="space-y-2">
          {[
            { stream: 'Advertising Packages', detail: 'Starter ₹999 · Business ₹2,499 · Premium ₹5,999/month', share: '55%' },
            { stream: 'B2B Marketplace Commission', detail: '2–5% on verified B2B transactions', share: '25%' },
            { stream: 'Featured Listings', detail: 'One-time or weekly homepage and category placements', share: '15%' },
            { stream: 'Data & Analytics API', detail: 'Aggregate insights for local businesses and researchers', share: '5%' },
          ].map(({ stream, detail, share }) => (
            <div key={stream} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{stream}</p>
                <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
              </div>
              <span className="font-heading font-bold text-brand-teal text-sm flex-shrink-0">{share}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="mx-4 mt-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-heading font-bold text-gray-900 text-sm mb-3">Contact Investor Relations</h3>
        <div className="space-y-3">
          <a href="mailto:invest@udupigo.in" className="flex items-center gap-3 text-sm text-gray-700 hover:text-brand-teal">
            <div className="w-10 h-10 bg-brand-teal/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-brand-teal" />
            </div>
            <div>
              <p className="font-medium">Email</p>
              <p className="text-xs text-brand-teal">invest@udupigo.in</p>
            </div>
            <ChevronRight size={14} className="text-gray-400 ml-auto" />
          </a>
          <a href="tel:+918202299800" className="flex items-center gap-3 text-sm text-gray-700 hover:text-brand-teal">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="font-medium">Phone</p>
              <p className="text-xs text-blue-500">+91 82022 99800</p>
            </div>
            <ChevronRight size={14} className="text-gray-400 ml-auto" />
          </a>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Investors;
