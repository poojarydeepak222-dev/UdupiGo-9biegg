import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MessageCircle, ChevronDown, Clock, MapPin, Headphones, CheckCircle } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

const FAQS = [
  { q: 'How do I list my business on UdupiGo?', a: 'Tap "List your Business" from the menu or home screen. Fill in your business name, category, phone, and address. Our team verifies and publishes within 24 hours — it\'s completely FREE.' },
  { q: 'How do I update my business information?', a: 'Visit the Business Dashboard from the side menu. Select your business listing and tap Edit. Changes go live after a quick review.' },
  { q: 'Is it free to list on UdupiGo?', a: 'Yes! Basic listing is completely free. We also offer paid advertising packages (Starter, Business, Premium) for higher visibility and more leads.' },
  { q: 'How do I report incorrect information?', a: 'Go to the business listing page, scroll to the bottom and tap "Report an Issue". Describe the issue and our team will fix it within 48 hours.' },
  { q: 'My review was removed. Why?', a: 'Reviews that violate our community guidelines (spam, offensive language, fake reviews) are removed. If you believe yours was wrongly removed, contact support.' },
  { q: 'How do I get the verified badge?', a: 'The verified badge is awarded after our team confirms your business registration documents, address, and contact number. Submit verification in Business Dashboard.' },
  { q: 'Can I advertise my business on UdupiGo?', a: 'Yes! Visit Advertise > Choose a Plan. Our Starter plan starts at ₹999/month. Contact our team for custom packages.' },
  { q: 'How do leads work?', a: 'When a customer contacts a business through UdupiGo, it\'s counted as a lead. Leads are tracked in your Business Dashboard under "Leads" tab.' },
];

const CONTACT_OPTIONS = [
  { icon: Phone, label: 'Call Support', sub: 'Mon–Sat 9AM–6PM', value: '+91 82022 99800', href: 'tel:+918202299800', color: 'text-brand-teal', bg: 'bg-brand-teal/10' },
  { icon: Mail, label: 'Email Us', sub: 'Reply in 24hrs', value: 'support@udupigo.in', href: 'mailto:support@udupigo.in', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: MessageCircle, label: 'WhatsApp', sub: 'Quick response', value: '+91 98860 55555', href: 'https://wa.me/919886055555?text=Hi+UdupiGo+Support', color: 'text-green-500', bg: 'bg-green-50' },
];

const CustomerService = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-heading font-bold text-gray-900 text-lg">Customer Service</h1>
          <p className="text-xs text-gray-500">We're here to help</p>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-brand-teal to-[#0d7a72] rounded-2xl p-5 text-white">
        <Headphones size={28} className="text-white/80 mb-2" />
        <h2 className="font-heading font-bold text-lg">How can we help you?</h2>
        <p className="text-white/80 text-sm mt-1">Our support team is available Monday to Saturday, 9 AM to 6 PM IST.</p>
        <div className="flex items-center gap-1.5 mt-3 text-white/90 text-xs">
          <Clock size={12} /> <span>Average response time: under 2 hours</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-white/90 text-xs">
          <MapPin size={12} /> <span>Support centre: Udupi, Karnataka</span>
        </div>
      </div>

      {/* Contact Options */}
      <div className="px-4 mt-5">
        <h2 className="font-heading font-bold text-gray-900 text-sm mb-3">Contact Us</h2>
        <div className="space-y-3">
          {CONTACT_OPTIONS.map(({ icon: Icon, label, sub, value, href, color, bg }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
                <p className={`text-xs font-medium mt-0.5 ${color}`}>{value}</p>
              </div>
              <ChevronDown size={16} className="text-gray-400 -rotate-90" />
            </a>
          ))}
        </div>
      </div>

      {/* Quick Resolve */}
      <div className="px-4 mt-5">
        <h2 className="font-heading font-bold text-gray-900 text-sm mb-3">Quick Resolve</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🏢', label: 'List Business', action: () => navigate('/list-business') },
            { icon: '🔔', label: 'Notifications', action: () => navigate('/notifications') },
            { icon: '💬', label: 'Manage Quotes', action: () => navigate('/quotes') },
            { icon: '📊', label: 'Business Dashboard', action: () => navigate('/dashboard') },
          ].map(({ icon, label, action }) => (
            <button key={label} onClick={action}
              className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-medium text-gray-700 text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="px-4 mt-5">
        <h2 className="font-heading font-bold text-gray-900 text-sm mb-3">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              >
                <span className="text-sm font-medium text-gray-800 pr-4">{faq.q}</span>
                <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resolution Guarantee */}
      <div className="mx-4 mt-5 bg-green-50 border border-green-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={16} className="text-green-500" />
          <h3 className="font-semibold text-sm text-gray-900">Our Commitment</h3>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">Every complaint is acknowledged within 2 hours and resolved within 48 hours. For critical business issues, we offer same-day resolution.</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default CustomerService;
