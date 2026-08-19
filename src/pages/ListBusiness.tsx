import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import BottomNav from "@/components/layout/BottomNav";

const ListBusiness = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    category: '',
    phone: '',
    address: '',
    description: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName || !form.phone) {
      toast.error('Please fill business name and phone number');
      return;
    }
    setSubmitted(true);
    toast.success('Business listed successfully!');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8 text-center pb-24">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="font-heading font-bold text-gray-900 text-2xl mb-2">Listed Successfully!</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Your business "<strong>{form.businessName}</strong>" has been submitted for review.
          Our team will verify and publish it within 24 hours.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-brand-teal text-white font-semibold px-8 py-3 rounded-xl hover:bg-brand-teal-dark transition-colors"
        >
          Back to Home
        </button>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-heading font-bold text-gray-900 text-lg">List Your Business</h1>
          <p className="text-xs text-gray-500">It's FREE – reach thousands in Udupi</p>
        </div>
        <span className="ml-auto bg-brand-coral text-white text-xs font-bold px-3 py-1 rounded-full">FREE</span>
      </div>

      {/* Benefits */}
      <div className="mx-4 my-4 bg-gradient-to-r from-brand-teal to-[#0d7a72] rounded-2xl p-4 text-white">
        <h3 className="font-heading font-bold text-base mb-2">Why list on UdupiGo?</h3>
        <div className="grid grid-cols-2 gap-2">
          {['Get more customers', 'Free business profile', 'Verified badge', 'Customer reviews'].map(b => (
            <div key={b} className="flex items-center gap-1.5 text-xs">
              <CheckCircle size={12} className="text-green-300 flex-shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name *</label>
          <input
            type="text"
            value={form.businessName}
            onChange={e => handleChange('businessName', e.target.value)}
            placeholder="e.g. Hotel Shree Krishna"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={e => handleChange('category', e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
          >
            <option value="">Select a category</option>
            <option value="restaurants">Restaurants & Cafes</option>
            <option value="doctors">Doctors & Healthcare</option>
            <option value="hotels">Hotels & Stays</option>
            <option value="beauty">Beauty & Salon</option>
            <option value="education">Education</option>
            <option value="travel">Travel & Transport</option>
            <option value="gym">Gym & Fitness</option>
            <option value="shopping">Shopping</option>
            <option value="others">Others</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => handleChange('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
          <input
            type="text"
            value={form.address}
            onChange={e => handleChange('address', e.target.value)}
            placeholder="Area, Udupi, Karnataka"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Description</label>
          <textarea
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="Tell customers about your business..."
            rows={3}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-brand-teal text-white font-bold py-4 rounded-xl hover:bg-brand-teal-dark transition-colors text-base"
        >
          List My Business — FREE
        </button>

        <p className="text-center text-xs text-gray-400 pb-2">
          By submitting, you agree to our Terms & Privacy Policy
        </p>
      </form>

      <BottomNav />
    </div>
  );
};

export default ListBusiness;
