import { Star, Phone, MapPin, BadgeCheck } from "lucide-react";
import { Business } from "@/types";

interface BusinessCardProps {
  business: Business;
  variant?: 'list' | 'compact';
  onSelect?: (id: string) => void;
}

const BusinessCard = ({ business, variant = 'list', onSelect }: BusinessCardProps) => {
  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${business.phone}`;
  };

  const handleSelect = () => {
    if (onSelect) onSelect(business.id);
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleSelect}
        className="flex-shrink-0 w-40 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left"
      >
        <div className="h-24 overflow-hidden bg-gray-100">
          <img
            src={business.image}
            alt={business.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="p-2.5">
          <p className="font-semibold text-xs text-gray-900 truncate">{business.name}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-medium text-gray-700">{business.rating}</span>
            <span className="text-[10px] text-gray-400">({business.reviewCount})</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5 truncate">{business.area}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleSelect}
      className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left"
    >
      <div className="flex gap-3 p-3">
        {/* Image */}
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
          <img
            src={business.image}
            alt={business.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 truncate">{business.name}</h3>
              {business.isVerified && (
                <BadgeCheck size={14} className="text-brand-teal flex-shrink-0" />
              )}
            </div>
            {business.isClosed && (
              <span className="text-[10px] bg-red-50 text-red-500 font-medium px-2 py-0.5 rounded-full flex-shrink-0">Closed</span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center gap-0.5 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              <span>{business.rating}</span>
              <Star size={8} className="fill-white" />
            </div>
            <span className="text-xs text-gray-500">{business.reviewCount} Reviews</span>
          </div>

          {/* Address */}
          <div className="flex items-center gap-1 mt-1.5">
            <MapPin size={11} className="text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 truncate">{business.address}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {business.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Call button */}
      <div className="px-3 pb-3 flex gap-2">
        <button
          onClick={handleCall}
          className="flex-1 flex items-center justify-center gap-1.5 bg-brand-teal text-white rounded-xl py-2 text-xs font-semibold hover:bg-brand-teal-dark transition-colors"
        >
          <Phone size={13} />
          <span>Call Now</span>
        </button>
        <button
          onClick={e => { e.stopPropagation(); handleSelect(); }}
          className="flex-1 flex items-center justify-center gap-1.5 border border-brand-teal text-brand-teal rounded-xl py-2 text-xs font-semibold hover:bg-secondary transition-colors"
        >
          View Details
        </button>
      </div>
    </button>
  );
};

export default BusinessCard;
