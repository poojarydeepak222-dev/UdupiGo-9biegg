import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, MapPin, Plus, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import BottomNav from "@/components/layout/BottomNav";

type Resort = {
  id: string;
  name: string;
  area: string;
  phone: string;
  address: string;
  description: string;
  price: string;
  rooms: string;
  amenities: string;
  image: string;
};

const STORAGE_KEY = "udupigo_resorts";

const UdupiResorts = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [form, setForm] = useState<Omit<Resort, "id">>({
    name: "", area: "", phone: "", address: "", description: "", price: "", rooms: "", amenities: "", image: ""
  });

  useEffect(() => {
    try { setResorts(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { setResorts([]); }
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.area.trim()) {
      toast.error("Please enter resort name, area and phone number");
      return;
    }
    const item: Resort = { ...form, id: `resort-${Date.now()}` };
    const next = [item, ...resorts];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setResorts(next);
    setForm({ name: "", area: "", phone: "", address: "", description: "", price: "", rooms: "", amenities: "", image: "" });
    setShowForm(false);
    toast.success("Resort added to UdupiGo!");
  };

  const call = (phone: string) => window.location.href = `tel:${phone.replace(/\\s/g, "")}`;
  const whatsapp = (phone: string, name: string) => window.open(`https://wa.me/${phone.replace(/\\D/g, "")}?text=${encodeURIComponent(`Hello ${name}, I found your resort on UdupiGo.`)}`, "_blank");

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100"><ArrowLeft size={20} /></button>
        <div className="flex-1"><h1 className="font-heading font-bold text-gray-900">Udupi Resorts</h1><p className="text-xs text-gray-500">Find and list resorts in Udupi</p></div>
        <button onClick={() => setShowForm(true)} className="bg-brand-teal text-white rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-1"><Plus size={15}/> Add Resort</button>
      </header>

      <section className="mx-4 mt-4 rounded-2xl bg-gradient-to-r from-brand-teal to-[#0d7a72] p-5 text-white">
        <p className="text-xs font-semibold opacity-90">UDUPIGO STAYS</p>
        <h2 className="font-heading font-bold text-xl mt-1">Discover beautiful resorts</h2>
        <p className="text-xs opacity-90 mt-1">Beach stays, family resorts, cottages and nature stays around Udupi.</p>
        <button onClick={() => setShowForm(true)} className="mt-4 bg-white text-brand-teal font-bold text-sm px-4 py-2.5 rounded-xl">List Your Resort — FREE</button>
      </section>

      <main className="px-4 mt-5 space-y-3">
        {resorts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-teal/10 flex items-center justify-center text-3xl">🏝️</div>
            <h3 className="font-heading font-bold text-gray-900 mt-3">No resorts listed yet</h3>
            <p className="text-xs text-gray-500 mt-1">Be the first resort owner to add a listing.</p>
            <button onClick={() => setShowForm(true)} className="mt-4 bg-brand-teal text-white px-5 py-2.5 rounded-xl text-sm font-bold">+ Add Your Resort</button>
          </div>
        ) : resorts.map(resort => (
          <article key={resort.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {resort.image && <img src={resort.image} alt={resort.name} className="w-full h-44 object-cover" />}
            <div className="p-4">
              <div className="flex justify-between gap-3"><div><h3 className="font-heading font-bold text-gray-900 text-base">{resort.name}</h3><p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={12}/>{resort.area}</p></div><span className="text-amber-500 text-xs flex items-center gap-1"><Star size={13} fill="currentColor"/> New</span></div>
              {resort.description && <p className="text-xs text-gray-600 mt-3 leading-relaxed">{resort.description}</p>}
              <div className="flex flex-wrap gap-1.5 mt-3">{resort.price && <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-[10px] font-semibold">₹{resort.price}/night</span>}{resort.rooms && <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-[10px]">{resort.rooms} rooms</span>}{resort.amenities.split(",").filter(Boolean).slice(0,4).map(a => <span key={a} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-[10px]">{a.trim()}</span>)}</div>
              <div className="grid grid-cols-2 gap-2 mt-4"><button onClick={() => call(resort.phone)} className="rounded-xl bg-brand-teal text-white py-2.5 text-xs font-bold">Call Resort</button><button onClick={() => whatsapp(resort.phone, resort.name)} className="rounded-xl bg-green-600 text-white py-2.5 text-xs font-bold">WhatsApp</button></div>
              {resort.address && <p className="text-[10px] text-gray-400 mt-3">{resort.address}</p>}
            </div>
          </article>
        ))}
      </main>

      {showForm && <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <form onSubmit={submit} className="bg-white w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4"><div><h2 className="font-heading font-bold text-lg">Add Your Resort</h2><p className="text-xs text-gray-500">Create a free UdupiGo resort listing</p></div><button type="button" onClick={() => setShowForm(false)} className="text-gray-500 text-2xl">×</button></div>
          <div className="space-y-3">
            {[['name','Resort Name *','e.g. Sea View Resort'],['area','Area *','e.g. Malpe, Udupi'],['phone','Phone Number *','+91 98765 43210'],['address','Full Address','Street, Area, Udupi'],['price','Price per Night','e.g. 2500'],['rooms','Number of Rooms','e.g. 20'],['image','Resort Photo URL','https://...']].map(([key,label,placeholder]) => <div key={key}><label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label><input value={(form as any)[key]} onChange={e => setForm({...form,[key]:e.target.value})} placeholder={placeholder} type={key === 'phone' ? 'tel' : 'text'} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-brand-teal" /></div>)}
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Amenities</label><input value={form.amenities} onChange={e => setForm({...form,amenities:e.target.value})} placeholder="Pool, WiFi, Parking, Restaurant" className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-brand-teal" /></div>
            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Tell guests about your resort..." rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-brand-teal resize-none" /></div>
          </div>
          <div className="bg-amber-50 text-amber-800 text-[10px] rounded-xl p-3 mt-4">Listings are shown on this device for now. Add Supabase later for shared listings, owner accounts, image uploads and admin approval.</div>
          <button type="submit" className="w-full bg-brand-teal text-white font-bold py-3.5 rounded-xl mt-4 flex items-center justify-center gap-2"><CheckCircle size={17}/> Publish Resort</button>
        </form>
      </div>}
      <BottomNav />
    </div>
  );
};

export default UdupiResorts;
