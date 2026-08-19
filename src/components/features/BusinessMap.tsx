import { useState } from 'react';
import { MapPin, ZoomIn, ZoomOut, Navigation } from 'lucide-react';
import { Business } from '@/types';
import { useNavigate } from 'react-router-dom';

// Business coordinates for Udupi area (mock)
const BUSINESS_COORDS: Record<string, { lat: number; lng: number }> = {
  '1': { lat: 13.3409, lng: 74.7421 },
  '2': { lat: 13.3522, lng: 74.7895 },
  '3': { lat: 13.3375, lng: 74.7451 },
  '4': { lat: 13.3523, lng: 74.7900 },
  '5': { lat: 13.3398, lng: 74.7438 },
  '6': { lat: 13.3300, lng: 74.7500 },
  '7': { lat: 13.3410, lng: 74.7410 },
  '8': { lat: 13.3540, lng: 74.7880 },
  '9': { lat: 13.3360, lng: 74.7460 },
  '10': { lat: 13.3280, lng: 74.7520 },
};

interface BusinessMapProps {
  businesses: Business[];
}

const BusinessMap = ({ businesses }: BusinessMapProps) => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  // Map bounds for Udupi (approximate)
  const MAP_LAT_MIN = 13.31;
  const MAP_LAT_MAX = 13.38;
  const MAP_LNG_MIN = 74.73;
  const MAP_LNG_MAX = 74.81;

  const toPercent = (lat: number, lng: number) => {
    const x = ((lng - MAP_LNG_MIN) / (MAP_LNG_MAX - MAP_LNG_MIN)) * 100;
    const y = 100 - ((lat - MAP_LAT_MIN) / (MAP_LAT_MAX - MAP_LAT_MIN)) * 100;
    return { x, y };
  };

  const selectedBiz = businesses.find(b => b.id === selectedId);

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mx-4 mb-4">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <MapPin size={16} className="text-brand-teal" />
          <span className="font-heading font-semibold text-gray-900 text-sm">Map View · Udupi</span>
          <span className="text-xs text-gray-500">({businesses.length} places)</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <ZoomIn size={14} className="text-gray-600" />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.6))} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <ZoomOut size={14} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Map container */}
      <div className="relative h-64 overflow-hidden bg-[#e8f4f0]">
        {/* Grid lines */}
        <div className="absolute inset-0" style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.3s' }}>
          {/* Road SVG */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect width="100" height="100" fill="#e8f4f0" />
            {/* Water body */}
            <ellipse cx="85" cy="50" rx="20" ry="40" fill="#b3d9f0" opacity="0.5" />
            {/* Main roads */}
            <line x1="20" y1="0" x2="20" y2="100" stroke="#fff" strokeWidth="1.5" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#fff" strokeWidth="1.5" />
            <line x1="0" y1="30" x2="100" y2="30" stroke="#fff" strokeWidth="1.5" />
            <line x1="0" y1="60" x2="100" y2="60" stroke="#fff" strokeWidth="1" />
            <line x1="0" y1="80" x2="100" y2="80" stroke="#fff" strokeWidth="1" />
            <line x1="35" y1="0" x2="35" y2="100" stroke="#e5e7eb" strokeWidth="0.8" />
            <line x1="65" y1="0" x2="65" y2="100" stroke="#e5e7eb" strokeWidth="0.8" />
            {/* Diagonal road */}
            <line x1="0" y1="70" x2="70" y2="0" stroke="#fff" strokeWidth="1" />
            {/* Green areas */}
            <rect x="55" y="35" width="12" height="8" fill="#a8d5a2" rx="2" />
            <rect x="10" y="65" width="8" height="6" fill="#a8d5a2" rx="2" />
            <rect x="70" y="20" width="6" height="6" fill="#a8d5a2" rx="2" />
            {/* Labels */}
            <text x="51" y="28" fontSize="3" fill="#6b7280">Manipal</text>
            <text x="15" y="55" fontSize="3" fill="#6b7280">Udupi City</text>
            <text x="80" y="45" fontSize="2.5" fill="#93c5fd">Sea</text>
          </svg>

          {/* Business markers */}
          {businesses.map(biz => {
            const coords = BUSINESS_COORDS[biz.id];
            if (!coords) return null;
            const { x, y } = toPercent(coords.lat, coords.lng);
            const isSelected = selectedId === biz.id;
            return (
              <button
                key={biz.id}
                onClick={() => setSelectedId(isSelected ? null : biz.id)}
                className="absolute transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-110"
                style={{ left: `${x}%`, top: `${y}%`, zIndex: isSelected ? 20 : 10 }}
              >
                <div className={`relative ${isSelected ? 'scale-125' : ''} transition-transform`}>
                  <div className={`w-7 h-7 rounded-full border-2 border-white shadow-md flex items-center justify-center ${isSelected ? 'bg-brand-coral' : 'bg-brand-teal'}`}>
                    <MapPin size={12} className="text-white" fill="white" />
                  </div>
                  {isSelected && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-28 bg-white rounded-xl shadow-lg p-2 text-left border border-gray-100 z-30">
                      <p className="text-[11px] font-bold text-gray-900 leading-tight">{biz.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">{biz.rating}★</div>
                        <span className="text-[9px] text-gray-500 capitalize">{biz.category}</span>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* My location marker */}
        <div className="absolute bottom-4 right-4">
          <button className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200">
            <Navigation size={14} className="text-brand-teal" />
          </button>
        </div>
      </div>

      {/* Selected business strip */}
      {selectedBiz && (
        <button
          onClick={() => navigate(`/business/${selectedBiz.id}`)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-brand-teal/5 border-t border-brand-teal/10 hover:bg-brand-teal/10 transition-colors"
        >
          {selectedBiz.image && (
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              <img src={selectedBiz.image} alt={selectedBiz.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 text-left min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{selectedBiz.name}</p>
            <p className="text-xs text-gray-500 truncate">{selectedBiz.address}</p>
          </div>
          <span className="text-xs text-brand-teal font-medium flex-shrink-0">View →</span>
        </button>
      )}
    </div>
  );
};

export default BusinessMap;
