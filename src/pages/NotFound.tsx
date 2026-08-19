import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-8 text-center">
      <div className="w-24 h-24 bg-brand-teal/10 rounded-3xl flex items-center justify-center mb-6">
        <span className="text-4xl">🗺️</span>
      </div>
      <h1 className="font-heading font-bold text-gray-900 text-3xl mb-2">404</h1>
      <p className="text-gray-500 text-base mb-2">Page not found</p>
      <p className="text-gray-400 text-sm mb-8">The page you're looking for doesn't exist in Udupi — or anywhere!</p>
      <button
        onClick={() => navigate('/')}
        className="bg-brand-teal text-white font-semibold px-8 py-3 rounded-xl hover:bg-brand-teal-dark transition-colors"
      >
        Back to UdupiGo Home
      </button>
    </div>
  );
};

export default NotFound;
