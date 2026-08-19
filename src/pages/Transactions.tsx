import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, Download, Filter } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

const ALL_TRANSACTIONS = [
  { id: 'TXN001', label: 'Mobile Recharge — Jio', type: 'Recharge', amount: '-₹299', date: 'Jun 15, 2026', time: '11:24 AM', status: 'success', category: 'payments' },
  { id: 'TXN002', label: 'Electricity Bill — MESCOM', type: 'Bill Pay', amount: '-₹1,250', date: 'Jun 10, 2026', time: '9:05 AM', status: 'success', category: 'payments' },
  { id: 'TXN003', label: 'Broadband Bill — BSNL', type: 'Bill Pay', amount: '-₹499', date: 'Jun 5, 2026', time: '3:47 PM', status: 'success', category: 'payments' },
  { id: 'TXN004', label: 'Refund — Hotel Kediyoor', type: 'Refund', amount: '+₹500', date: 'Jun 3, 2026', time: '10:30 AM', status: 'success', category: 'refunds' },
  { id: 'TXN005', label: 'DTH Recharge — Tata Play', type: 'Recharge', amount: '-₹349', date: 'May 28, 2026', time: '8:12 PM', status: 'success', category: 'payments' },
  { id: 'TXN006', label: 'UdupiGo Business Listing', type: 'Subscription', amount: '-₹999', date: 'May 20, 2026', time: '12:00 PM', status: 'success', category: 'payments' },
  { id: 'TXN007', label: 'Mobile Recharge — Vi', type: 'Recharge', amount: '-₹199', date: 'May 15, 2026', time: '6:55 PM', status: 'failed', category: 'payments' },
  { id: 'TXN008', label: 'Refund — UdupiGo Wallet', type: 'Refund', amount: '+₹199', date: 'May 15, 2026', time: '7:02 PM', status: 'success', category: 'refunds' },
  { id: 'TXN009', label: 'Water Bill — UDUPI CMC', type: 'Bill Pay', amount: '-₹320', date: 'May 10, 2026', time: '2:30 PM', status: 'pending', category: 'payments' },
  { id: 'TXN010', label: 'Electricity Bill — MESCOM', type: 'Bill Pay', amount: '-₹1,100', date: 'May 8, 2026', time: '11:00 AM', status: 'success', category: 'payments' },
];

type Tab = 'all' | 'payments' | 'refunds';

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Success' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Failed' },
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pending' },
};

const Transactions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('all');

  const filtered = activeTab === 'all' ? ALL_TRANSACTIONS : ALL_TRANSACTIONS.filter(t => t.category === activeTab);

  const totalSpent = ALL_TRANSACTIONS.filter(t => t.status === 'success' && t.amount.startsWith('-')).reduce((sum, t) => sum + parseInt(t.amount.replace(/[^0-9]/g, '')), 0);
  const totalRefunds = ALL_TRANSACTIONS.filter(t => t.status === 'success' && t.amount.startsWith('+')).reduce((sum, t) => sum + parseInt(t.amount.replace(/[^0-9]/g, '')), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
          <h1 className="font-heading font-bold text-gray-900 text-lg flex-1">My Transactions</h1>
          <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Filter"><Filter size={18} className="text-gray-500" /></button>
          <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Download"><Download size={18} className="text-gray-500" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-3">
          {(['all', 'payments', 'refunds'] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${activeTab === tab ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-600'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Spent</p>
          <p className="font-heading font-bold text-red-500 text-xl">₹{totalSpent.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">This month</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Refunds</p>
          <p className="font-heading font-bold text-green-600 text-xl">₹{totalRefunds.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">This month</p>
        </div>
      </div>

      {/* Transactions list */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {filtered.map(tx => {
            const statusCfg = STATUS_CONFIG[tx.status];
            const StatusIcon = statusCfg.icon;
            const isCredit = tx.amount.startsWith('+');
            return (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${statusCfg.bg}`}>
                  <StatusIcon size={18} className={statusCfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{tx.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{tx.type} · {tx.date} · {tx.time}</p>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${statusCfg.bg} ${statusCfg.color}`}>{statusCfg.label}</span>
                </div>
                <p className={`font-heading font-bold text-sm flex-shrink-0 ${isCredit ? 'text-green-600' : 'text-gray-900'}`}>{tx.amount}</p>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">Showing {filtered.length} transactions</p>
      </div>

      {/* Transaction ID ref */}
      <div className="mx-4 mt-4 bg-brand-teal/5 border border-brand-teal/10 rounded-2xl p-4">
        <p className="text-xs text-gray-600 leading-relaxed">
          For disputes or transaction issues, contact UdupiGo Support at{' '}
          <a href="mailto:support@udupigo.in" className="text-brand-teal font-medium">support@udupigo.in</a> or call{' '}
          <a href="tel:+918202299800" className="text-brand-teal font-medium">+91 82022 99800</a>
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Transactions;
