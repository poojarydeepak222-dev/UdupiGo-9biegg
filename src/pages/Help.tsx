import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown, ChevronRight, BookOpen, Building2, Star, CreditCard, User, Shield } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

const HELP_CATEGORIES = [
  { id: 'account', label: 'Account & Profile', icon: User, color: 'text-brand-teal', bg: 'bg-brand-teal/10', count: 8 },
  { id: 'business', label: 'Business Listing', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50', count: 12 },
  { id: 'reviews', label: 'Reviews & Ratings', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', count: 6 },
  { id: 'payments', label: 'Payments & Bills', icon: CreditCard, color: 'text-brand-coral', bg: 'bg-orange-50', count: 9 },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-50', count: 5 },
  { id: 'general', label: 'General', icon: BookOpen, color: 'text-gray-600', bg: 'bg-gray-100', count: 7 },
];

const FAQ_DATA: Record<string, { q: string; a: string }[]> = {
  account: [
    { q: 'How do I create an account?', a: 'Tap the profile icon on the top-right or "Sign In" from the side menu. Enter your email to get an OTP, verify, then set a password and username.' },
    { q: 'How do I change my password?', a: 'Go to Profile > Settings > Change Password. Enter your current password, then your new password twice.' },
    { q: 'Can I use UdupiGo without signing in?', a: 'Yes! You can browse businesses, read reviews, and search without an account. Signing in unlocks saving businesses, writing reviews, and managing leads.' },
    { q: 'How do I delete my account?', a: 'Go to Profile > Settings > Delete Account. Note that this permanently removes your saved businesses, reviews and profile data.' },
  ],
  business: [
    { q: 'How do I list my business for free?', a: 'Tap "List your Business" on the home screen or side menu. Complete the form with your business name, category, phone and address. Our team reviews and publishes within 24 hours.' },
    { q: 'How long does verification take?', a: 'Basic listing goes live in 24 hours. Verified badge requires document submission and takes 2–3 business days.' },
    { q: 'Can I edit my business listing?', a: 'Yes. Visit Business Dashboard > Select listing > tap Edit. Updates are reflected within 12 hours.' },
    { q: 'What is the verified badge?', a: 'The teal checkmark badge indicates that UdupiGo has verified your business registration, address and phone number. It builds customer trust.' },
  ],
  reviews: [
    { q: 'How do I write a review?', a: 'Visit any business detail page and scroll to the Reviews section. Tap "Write a Review", select your star rating and add a comment.' },
    { q: 'Can I edit my review?', a: 'Yes, go to Profile > Reviews tab > tap the review you want to edit. Note: reviews can only be edited within 30 days of posting.' },
    { q: 'Why was my review removed?', a: 'Reviews are removed if they violate community guidelines: spam, fake content, offensive language, or conflict of interest. Contact support if you think this was an error.' },
  ],
  payments: [
    { q: 'Which payment methods are accepted?', a: 'UPI, credit/debit cards, net banking, and UdupiGo wallet are all accepted for bill payments and advertising packages.' },
    { q: 'Is my payment information safe?', a: 'All payments use bank-grade SSL encryption. We never store your card details. Payments are processed through certified payment gateways.' },
    { q: 'How long does a refund take?', a: 'Refunds are initiated within 24 hours and typically reflect in your account within 5–7 business days depending on your bank.' },
  ],
  privacy: [
    { q: 'What data does UdupiGo collect?', a: 'We collect your email, name, and location city. If you list a business, we collect business details. We never share your personal information with third parties without consent.' },
    { q: 'How is my location used?', a: 'Location is used only to show nearby businesses and relevant search results. It is never stored permanently without your consent.' },
  ],
  general: [
    { q: 'What areas does UdupiGo cover?', a: 'UdupiGo primarily covers Udupi city, Manipal, Malpe, Kinnimulki, Kapu, Parkala, and the wider Udupi district. We\'re continuously adding more areas.' },
    { q: 'Is UdupiGo free to use?', a: 'Yes, browsing and searching UdupiGo is completely free. Business listing is also free. Advertising packages are optional paid plans for extra visibility.' },
    { q: 'How are search results ranked?', a: 'Results are ranked by relevance, verified status, rating, reviews count, and whether the business has an active advertising plan.' },
  ],
};

const Help = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const currentFaqs = selectedCategory ? (FAQ_DATA[selectedCategory] || []) : [];
  const filteredFaqs = search
    ? Object.values(FAQ_DATA).flat().filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-gray-900 text-lg">Help Center</h1>
            <p className="text-xs text-gray-500">Find answers instantly</p>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setSelectedCategory(null); }} placeholder="Search help articles..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/30" />
          </div>
        </div>
      </div>

      {/* Search Results */}
      {search && (
        <div className="px-4 pt-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 mb-2">{filteredFaqs.length} results for "{search}"</p>
          {filteredFaqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                <span className="text-sm font-medium text-gray-800 pr-4">{faq.q}</span>
                <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{faq.a}</div>}
            </div>
          ))}
          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">No articles found. Try different keywords or contact support.</div>
          )}
        </div>
      )}

      {/* Categories */}
      {!search && !selectedCategory && (
        <>
          <div className="px-4 pt-4">
            <h2 className="font-heading font-semibold text-gray-900 text-sm mb-3">Browse by Topic</h2>
            <div className="grid grid-cols-2 gap-3">
              {HELP_CATEGORIES.map(({ id, label, icon: Icon, color, bg, count }) => (
                <button key={id} onClick={() => setSelectedCategory(id)}
                  className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left">
                  <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} className={color} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 leading-tight">{label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{count} articles</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-400 ml-auto flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Popular Questions */}
          <div className="px-4 mt-5">
            <h2 className="font-heading font-semibold text-gray-900 text-sm mb-3">Popular Questions</h2>
            <div className="space-y-2">
              {Object.values(FAQ_DATA).flat().slice(0, 5).map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                    <span className="text-sm font-medium text-gray-800 pr-4">{faq.q}</span>
                    <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="mx-4 mt-5 bg-brand-teal/5 border border-brand-teal/10 rounded-2xl p-4 text-center">
            <p className="text-sm font-medium text-gray-800 mb-1">Didn't find your answer?</p>
            <p className="text-xs text-gray-500 mb-3">Our support team is ready to help</p>
            <button onClick={() => navigate('/customer-service')} className="bg-brand-teal text-white font-bold px-6 py-2 rounded-xl text-sm">
              Contact Support
            </button>
          </div>
        </>
      )}

      {/* Category Articles */}
      {!search && selectedCategory && (
        <div className="px-4 pt-4">
          <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-1 text-brand-teal text-sm font-medium mb-4">
            <ArrowLeft size={14} /> Back to Topics
          </button>
          <h2 className="font-heading font-bold text-gray-900 text-base mb-3">{HELP_CATEGORIES.find(c => c.id === selectedCategory)?.label}</h2>
          <div className="space-y-2">
            {currentFaqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                  <span className="text-sm font-medium text-gray-800 pr-4">{faq.q}</span>
                  <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Help;
