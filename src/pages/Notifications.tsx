import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Megaphone, Tag, Star, TrendingUp, CheckCheck } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

const NOTIFICATIONS = [
  { id: 1, type: 'lead', icon: TrendingUp, color: 'bg-brand-teal/10 text-brand-teal', title: 'New Lead!', body: 'Ramesh Kumar is looking for restaurants near Car Street.', time: '2 min ago', unread: true },
  { id: 2, type: 'offer', icon: Tag, color: 'bg-orange-50 text-brand-coral', title: 'Special Offer', body: 'Get 20% off at Hotel Durga Prasad this weekend!', time: '1 hr ago', unread: true },
  { id: 3, type: 'review', icon: Star, color: 'bg-amber-50 text-amber-500', title: 'New Review', body: 'Your business received a 5-star review from Priya M.', time: '3 hr ago', unread: false },
  { id: 4, type: 'news', icon: Megaphone, color: 'bg-blue-50 text-blue-500', title: 'Udupi News', body: 'Krishna Mutt announces special puja schedule for upcoming festival.', time: '5 hr ago', unread: false },
  { id: 5, type: 'lead', icon: TrendingUp, color: 'bg-brand-teal/10 text-brand-teal', title: 'New Lead!', body: 'Suresh Nayak is looking for a doctor near Manipal.', time: '1 day ago', unread: false },
];

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => setNotifications(n => n.map(notif => ({ ...notif, unread: false })));
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-gray-900 text-lg">Notifications</h1>
            {unreadCount > 0 && <p className="text-xs text-gray-500">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-brand-teal text-xs font-medium">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-2">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`flex items-start gap-3 bg-white rounded-2xl p-4 border shadow-sm transition-all ${notif.unread ? 'border-brand-teal/20 bg-brand-teal/2' : 'border-gray-100'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.color}`}>
              <notif.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm text-gray-900">{notif.title}</p>
                {notif.unread && <div className="w-2 h-2 bg-brand-teal rounded-full flex-shrink-0" />}
              </div>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{notif.body}</p>
              <p className="text-[10px] text-gray-400 mt-1.5">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
