import { useNavigate } from "react-router-dom";

const QUICK_ACTIONS = [
  { id: 'jiomart', label: 'JioMart\nShopping', bg: '#0052a5', logo: '🛍️' },
  { id: 'fashion', label: 'AJIO\nFashion', bg: '#1a1a1a', logo: '👗' },
  { id: 'beauty', label: 'Beauty\nStore', bg: '#f5b8a2', logo: '💄', textColor: '#333' },
  { id: 'pay', label: 'Pay\nBills', bg: '#003087', logo: '💳' },
  { id: 'food', label: 'Order\nFood', bg: '#e8480c', logo: '🍔' },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto scrollbar-hide px-4">
      <div className="flex gap-3 pb-1" style={{ width: 'max-content' }}>
        {QUICK_ACTIONS.map(action => (
          <button
            key={action.id}
            onClick={() => navigate('/more')}
            className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md transition-shadow active:scale-95"
            style={{ backgroundColor: action.bg }}
          >
            <span className="text-2xl">{action.logo}</span>
            <span
              className="text-[9px] font-bold text-center leading-tight"
              style={{ color: action.textColor || 'white' }}
            >
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
