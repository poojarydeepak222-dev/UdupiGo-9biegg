import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, Clock, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

const OFFERS = [
  { id: 1, biz: 'Hotel Durga Prasad', title: '20% off on weekends', desc: 'Get flat 20% off on all dine-in orders this weekend. Valid on table bookings.', tag: 'Restaurants', expires: 'Jun 30', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80', discount: '20%', color: 'from-orange-400 to-brand-coral' },
  { id: 2, biz: 'Glamour Zone Salon', title: 'Buy 1 Get 1 on haircut', desc: 'Book two haircuts and get the second one free. Valid Mon-Wed.', tag: 'Beauty', expires: 'Jul 15', image: 'https://images.unsplash.com/photo-1560066984-138daaa0c9a4?w=400&q=80', discount: 'B1G1', color: 'from-pink-400 to-pink-600' },
  { id: 3, biz: 'Coastal Fitness Studio', title: '1 Month FREE with 3 Month Plan', desc: 'Join for 3 months and get 1 month absolutely free. AC gym with personal trainer.', tag: 'Gym', expires: 'Jul 31', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80', discount: '25%', color: 'from-brand-teal to-[#0d7a72]' },
  { id: 4, biz: 'Shree Travels Udupi', title: '₹500 off on tour packages', desc: 'Get ₹500 discount on all tour packages to Goa, Coorg, and Ooty.', tag: 'Travel', expires: 'Aug 10', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80', discount: '₹500', color: 'from-purple-400 to-purple-600' },
];

const Offers = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-40 bg-white shadow-sm flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
        <h1 className="font-heading font-bold text-gray-900 text-lg">Special Offers</h1>
        <span className="ml-auto bg-brand-coral text-white text-xs font-bold px-2.5 py-1 rounded-full">{OFFERS.length} active</span>
      </div>

      <div className="p-4 space-y-4">
        {OFFERS.map(offer => (
          <div key={offer.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className={`relative h-28 bg-gradient-to-r ${offer.color}`}>
              <img src={offer.image} alt={offer.biz} className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 flex items-center justify-between px-5">
                <div>
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">{offer.tag}</span>
                  <h3 className="text-white font-heading font-bold text-base mt-1 leading-tight">{offer.title}</h3>
                  <p className="text-white/80 text-xs mt-0.5">{offer.biz}</p>
                </div>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="font-heading font-bold text-brand-teal text-base">{offer.discount}</span>
                </div>
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-gray-600 leading-relaxed">{offer.desc}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>Expires {offer.expires}</span>
                </div>
                <button onClick={() => navigate('/search?q=' + offer.tag)} className="flex items-center gap-1 text-brand-teal text-xs font-semibold">
                  Claim Offer <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Offers;
