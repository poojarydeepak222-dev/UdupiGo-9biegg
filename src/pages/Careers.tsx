import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, Clock, IndianRupee, ChevronDown, Send, Users, TrendingUp, Loader2 } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { toast } from 'sonner';

const JOBS = [
  {
    id: 1,
    title: 'Field Sales Executive',
    department: 'Sales & Business Development',
    location: 'Udupi, Karnataka',
    type: 'Full-time',
    salary: '₹2.5L – ₹4.5L/year',
    experience: '0–2 years',
    skills: ['Sales', 'Communication', 'Kannada/English', 'Bike Required'],
    description: 'Visit local businesses in Udupi and Manipal to onboard them onto UdupiGo platform. Build strong relationships with business owners, explain our services, and achieve monthly targets.',
    perks: ['Travel Allowance', 'Performance Bonus', 'Health Insurance', 'Flexible Hours'],
  },
  {
    id: 2,
    title: 'Frontend Developer (React)',
    department: 'Technology',
    location: 'Udupi / Remote',
    type: 'Full-time',
    salary: '₹5L – ₹10L/year',
    experience: '1–3 years',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
    description: 'Build and enhance the UdupiGo web and mobile platform. Work on the listing directory, business dashboards, payment flows, and customer-facing features. You\'ll be part of a small, impactful team.',
    perks: ['Remote Work Option', 'Latest MacBook', 'Learning Budget', 'Stock Options'],
  },
  {
    id: 3,
    title: 'Content & Social Media Executive',
    department: 'Marketing',
    location: 'Udupi, Karnataka',
    type: 'Full-time',
    salary: '₹2L – ₹3.5L/year',
    experience: '0–1 year',
    skills: ['Content Writing', 'Instagram', 'Canva', 'Kannada Preferred'],
    description: 'Create engaging content about local Udupi businesses, food, culture, and events. Manage Instagram, Facebook and WhatsApp channels. Write blogs and help local businesses tell their stories.',
    perks: ['Free Meals (Restaurant Reviews!)', 'Creative Freedom', 'Growth Opportunities'],
  },
  {
    id: 4,
    title: 'Customer Support Associate',
    department: 'Customer Success',
    location: 'Udupi, Karnataka',
    type: 'Full-time',
    salary: '₹1.8L – ₹2.8L/year',
    experience: 'Fresher welcome',
    skills: ['Communication', 'Problem Solving', 'Kannada + English', 'Computer Basic'],
    description: 'Handle customer and business owner queries via phone, email, and WhatsApp. Assist with account setup, business listing issues, payment queries, and general feedback collection.',
    perks: ['Training Provided', 'No Night Shifts', 'PF & ESI', 'Festival Bonuses'],
  },
  {
    id: 5,
    title: 'City Manager — Mangalore Expansion',
    department: 'Operations',
    location: 'Mangaluru, Karnataka',
    type: 'Full-time',
    salary: '₹5L – ₹8L/year',
    experience: '3–5 years',
    skills: ['Team Management', 'Business Development', 'Local Network', 'Target-Oriented'],
    description: 'Lead UdupiGo\'s expansion into Mangaluru city. Build and manage the field sales team, onboard 500+ businesses in first 6 months, and establish UdupiGo as the #1 local directory in Dakshina Kannada.',
    perks: ['City-level P&L Ownership', 'ESOPs', 'Premium Health Cover', 'Annual Retreats'],
  },
];

const VALUES = [
  { icon: '🏃', title: 'Move Fast', desc: 'We ship features weekly and make decisions quickly.' },
  { icon: '🌊', title: 'Coastal Roots', desc: 'We\'re building for Udupi — we live here, we understand the community.' },
  { icon: '🤝', title: 'Inclusive Culture', desc: 'Every voice matters, from interns to founders.' },
  { icon: '📈', title: 'Grow Together', desc: 'Your growth is our growth — promotions every 6 months for top performers.' },
];

const Careers = () => {
  const navigate = useNavigate();
  const [openJob, setOpenJob] = useState<number | null>(null);
  const [applyingTo, setApplyingTo] = useState<typeof JOBS[0] | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', experience: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleApply = async () => {
    if (!form.name || !form.email || !form.phone) { toast.error('Please fill all required fields'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    toast.success(`Application for "${applyingTo?.title}" submitted! We\'ll contact you within 3 business days.`);
    setApplyingTo(null);
    setForm({ name: '', email: '', phone: '', experience: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm flex items-center gap-3 px-4 py-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Back"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-heading font-bold text-gray-900 text-lg">We're Hiring!</h1>
          <p className="text-xs text-gray-500">{JOBS.length} open positions in Udupi</p>
        </div>
        <span className="ml-auto bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{JOBS.length} OPEN</span>
      </div>

      {/* Hero */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-brand-teal to-[#0d7a72] rounded-2xl p-5 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-28 h-28 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <Briefcase size={28} className="text-white/80 mb-2" />
        <h2 className="font-heading font-bold text-xl">Join the UdupiGo Team</h2>
        <p className="text-white/80 text-sm mt-1 leading-relaxed">Help us build coastal Karnataka's best local discovery platform. We're a small, fast-moving team with big ambitions.</p>
        <div className="flex gap-3 mt-4">
          {[['15+', 'Team Members'], ['5', 'Open Roles'], ['Udupi', 'HQ']].map(([val, label]) => (
            <div key={label} className="bg-white/15 rounded-xl px-3 py-2 text-center">
              <p className="font-heading font-bold text-base">{val}</p>
              <p className="text-white/70 text-[10px]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="px-4 mt-5">
        <h2 className="font-heading font-bold text-gray-900 text-sm mb-3">Why Work at UdupiGo?</h2>
        <div className="grid grid-cols-2 gap-3">
          {VALUES.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <span className="text-2xl">{icon}</span>
              <h3 className="font-semibold text-sm text-gray-900 mt-2">{title}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Jobs */}
      <div className="px-4 mt-5">
        <h2 className="font-heading font-bold text-gray-900 text-sm mb-3">Open Positions</h2>
        <div className="space-y-3">
          {JOBS.map(job => (
            <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button onClick={() => setOpenJob(openJob === job.id ? null : job.id)} className="w-full p-4 text-left">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-gray-900 text-sm">{job.title}</h3>
                    <p className="text-xs text-brand-teal mt-0.5">{job.department}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-gray-500"><MapPin size={9} />{job.location}</span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-500"><Clock size={9} />{job.type}</span>
                      <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium"><IndianRupee size={9} />{job.salary}</span>
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform mt-1 ${openJob === job.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {openJob === job.id && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <p className="text-xs text-gray-600 leading-relaxed mt-3">{job.description}</p>

                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Skills Required</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map(s => <span key={s} className="text-[10px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{s}</span>)}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Perks & Benefits</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.perks.map(p => <span key={p} className="text-[10px] bg-brand-teal/10 text-brand-teal px-2.5 py-1 rounded-full">{p}</span>)}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-xs text-gray-500">Experience: {job.experience}</span>
                    <span className="text-xs font-semibold text-brand-teal">{job.salary}</span>
                  </div>

                  <button onClick={() => setApplyingTo(job)} className="mt-4 w-full bg-brand-teal text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                    <Send size={14} /> Apply Now
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Internship note */}
      <div className="mx-4 mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-900 mb-1">🎓 Internships Available</p>
        <p className="text-xs text-gray-600 leading-relaxed">We offer 3–6 month internships for MAHE/MIT students in tech, marketing and sales. Email your resume to <span className="text-brand-teal font-medium">careers@udupigo.in</span></p>
      </div>

      {/* Apply Modal */}
      {applyingTo && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setApplyingTo(null)} />
          <div className="fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-3xl shadow-2xl pb-8 max-h-[90vh] overflow-y-auto" style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h2 className="font-heading font-bold text-gray-900 text-base">Apply for Position</h2>
                <p className="text-xs text-brand-teal mt-0.5">{applyingTo.title}</p>
              </div>
              <button onClick={() => setApplyingTo(null)} className="p-2 rounded-full hover:bg-gray-100">✕</button>
            </div>
            <div className="px-5 pt-4 space-y-3">
              {[
                { label: 'Full Name *', field: 'name', placeholder: 'Your full name' },
                { label: 'Email *', field: 'email', placeholder: 'your@email.com' },
                { label: 'Phone *', field: 'phone', placeholder: '+91 98765 43210' },
                { label: 'Years of Experience', field: 'experience', placeholder: 'e.g. 2 years / Fresher' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input type="text" value={(form as Record<string, string>)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-teal" />
                </div>
              ))}
              <button onClick={handleApply} disabled={submitting}
                className="w-full bg-brand-teal text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                Submit Application
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      <BottomNav />
    </div>
  );
};

export default Careers;
