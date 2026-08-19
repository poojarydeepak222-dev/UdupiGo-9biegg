import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { MAIN_CATEGORIES, MORE_CATEGORIES } from "@/constants/categories";

const CategoryGrid = () => {
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  const allCategories = showMore ? [...MAIN_CATEGORIES, ...MORE_CATEGORIES] : MAIN_CATEGORIES;

  return (
    <section className="bg-white px-4 py-4">
      <div className="grid grid-cols-4 gap-3">
        {allCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => navigate(`/search?category=${cat.id}&q=${encodeURIComponent(cat.label)}`)}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm"
              style={{ backgroundColor: cat.bgColor }}
            >
              {cat.emoji}
            </div>
            <span className="text-[10px] text-center text-gray-700 font-medium leading-tight">{cat.label}</span>
          </button>
        ))}

        {/* Show More / Less */}
        <button
          onClick={() => setShowMore(v => !v)}
          className="flex flex-col items-center gap-1.5 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center transition-transform group-hover:scale-110">
            <ChevronDown
              size={22}
              className={`text-gray-500 transition-transform ${showMore ? 'rotate-180' : ''}`}
            />
          </div>
          <span className="text-[10px] text-center text-gray-600 font-medium">{showMore ? 'Show Less' : 'Show More'}</span>
        </button>
      </div>
    </section>
  );
};

export default CategoryGrid;
