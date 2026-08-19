import { useNavigate } from "react-router-dom";

interface PromoBannerProps {
  title: string;
  subtitle: string;
  ctaText: string;
  bgColor: string;
  image: string;
  path?: string;
}

const PromoBanner = ({ title, subtitle, ctaText, bgColor, image, path = '/' }: PromoBannerProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${bgColor} mx-4 cursor-pointer active:scale-[0.98] transition-transform`}
      onClick={() => navigate(path)}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex-1">
          <h3 className="font-heading font-bold text-white text-base leading-tight">{title}</h3>
          <p className="text-white/80 text-xs mt-1 leading-relaxed">{subtitle}</p>
          <button className="mt-3 bg-white text-[#1a9e94] font-bold text-xs px-4 py-2 rounded-xl hover:bg-white/90 transition-colors">
            {ctaText}
          </button>
        </div>
        <div className="w-24 h-20 rounded-xl overflow-hidden ml-4 flex-shrink-0 shadow-lg">
          <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
