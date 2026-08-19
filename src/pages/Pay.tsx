import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, Zap, Wifi, Tv, Shield, ChevronRight, CheckCircle } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { toast } from 'sonner';

const PAY_SERVICES = [
  { id: 'mobile', icon: Smartphone, label: 'Mobile Recharge', color: 'text-blue-500', bg: 'bg-blue-50', description: 'Recharge any network' },
  { id: 'electricity', icon: Zap, label: 'Electricity', color: 'text-yellow-500', bg: 'bg-yellow-50', description: 'MESCOM, CESC' },
  { id: 'internet', icon: Wifi, label: 'Broadband/DTH', color: 'text-purple-500', bg: 'bg-purple-50', description: 'Any provider' },
  { id: 'cable', icon: Tv, label: 'Cable TV', color: 'text-green-500', bg: 'bg-green-50', description: 'Local cable operators' },
  { id: 'insurance', icon: Shield, label: 'Insurance', color: 'text-brand-coral', bg: 'bg-orange-50', description: 'Renew policies' },
  { id: 'credit', icon: CreditCard, label: 'Credit Card', color: 'text-brand-teal', bg: 'bg-brand-teal/10', description: 'Pay bills' },
];

const RECENT_TRANSACTIONS = [
  { id: 1, label: 'Mobile Recharge - Jio', amount: '₹299', date: 'Jun 15', status: 'success' },
  { id: 2, label: 'Electricity - MESCOM', amount: '₹1,250', date: 'Jun 10', status: 'success' },
  { id: 3, label: 'Broadband - BSNL', amount: '₹499', date: 'Jun 5', status: 'success' },
];

const Pay = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [value, setValue] = useState('');

  const handlePay = () => {
    if (!value) { toast.error('Please enter a value'); return; }
    toast.success('Redirecting to payment gateway...');
    setTimeout(() => toast.info('Payment feature coming soon!'), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-40 bg-white shadow-sm flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
        <h1 className="font-heading font-bold text-gray-900 text-lg">UdupiGo Pay</h1>
      </div>

      {/* Balance card */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-brand-teal to-[#0d7a72] rounded-2xl p-5 text-white">
        <p className="text-white/70 text-xs">UdupiGo Wallet</p>
        <p className="font-heading font-bold text-3xl mt-1">₹0.00</p>
        <div className="flex gap-2 mt-4">
          <button onClick={() => toast.info('Add money coming soon!')} className="flex-1 py-2 bg-white/20 rounded-xl text-xs font-semibold hover:bg-white/30">+ Add Money</button>
          <button onClick={() => toast.info('Transfer coming soon!')} className="flex-1 py-2 bg-white/20 rounded-xl text-xs font-semibold hover:bg-white/30">Transfer</button>
        </div>
      </div>

      {/* Services */}
      <section className="px-4 mt-5">
        <h2 className="font-heading font-semibold text-gray-900 text-sm mb-3">Pay Bills & Recharge</h2>
        <div className="grid grid-cols-3 gap-3">
          {PAY_SERVICES.map(({ id, icon: Icon, label, color, bg, description }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className={`flex flex-col items-center gap-2 bg-white rounded-2xl p-3.5 border-2 shadow-sm hover:shadow-md transition-all ${selected === id ? 'border-brand-teal' : 'border-transparent'}`}
            >
              <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-[10px] text-center text-gray-700 font-medium leading-tight">{label}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Payment form */}
      {selected && (
        <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-heading font-semibold text-gray-900 text-sm mb-3">
            {PAY_SERVICES.find(s => s.id === selected)?.label}
          </h3>
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Enter mobile / account number"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 mb-3"
          />
          <button onClick={handlePay} className="w-full bg-brand-teal text-white font-bold py-3 rounded-xl hover:bg-brand-teal-dark transition-colors">
            Proceed to Pay
          </button>
        </div>
      )}

      {/* Recent transactions */}
      <section className="px-4 mt-5">
        <h2 className="font-heading font-semibold text-gray-900 text-sm mb-3">Recent Transactions</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {RECENT_TRANSACTIONS.map((tx, i) => (
            <div key={tx.id} className={`flex items-center justify-between px-4 py-3.5 ${i < RECENT_TRANSACTIONS.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.label}</p>
                  <p className="text-xs text-gray-400">{tx.date}</p>
                </div>
              </div>
              <p className="font-semibold text-sm text-gray-900">{tx.amount}</p>
            </div>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
};

export default Pay;
