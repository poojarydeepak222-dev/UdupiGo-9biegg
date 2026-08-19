import { useState, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, Printer, Download, CheckCircle, RefreshCw, Edit3, Eye, X, IndianRupee, FileText, Send, Clock, XCircle, Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';

// ─── Types ────────────────────────────────────────────────────────────────────
interface InvoiceItem { id: string; description: string; qty: number; rate: number; amount: number; }
interface InvoiceData {
  id: string;
  invoice_number: string;
  business_name: string;
  business_phone: string;
  business_address: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  notes: string;
  due_date: string;
  created_at: string;
}

type ViewMode = 'list' | 'create' | 'preview';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const cfg: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: <Edit3 size={9} /> },
    sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: <Send size={9} /> },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={9} /> },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600', icon: <XCircle size={9} /> },
  };
  const c = cfg[status] || cfg.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.color}`}>
      {c.icon} {c.label}
    </span>
  );
};

// ─── Print Invoice ────────────────────────────────────────────────────────────
const PrintView = ({ invoice, onClose }: { invoice: InvoiceData; onClose: () => void }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML || '';
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, sans-serif; padding: 40px; color: #1f2937; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #0d9488; }
        .brand { font-size: 24px; font-weight: 800; color: #0d9488; }
        .brand span { color: #f05a28; }
        .invoice-title { font-size: 20px; font-weight: 700; color: #374151; text-align: right; }
        .invoice-num { font-size: 13px; color: #6b7280; margin-top: 4px; text-align: right; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 24px; }
        .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af; margin-bottom: 6px; letter-spacing: 0.05em; }
        .detail-text { font-size: 13px; color: #374151; line-height: 1.6; }
        .detail-name { font-weight: 700; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #f3f4f6; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6b7280; }
        td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
        .text-right { text-align: right; }
        .totals { margin-left: auto; width: 240px; }
        .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #374151; }
        .total-final { border-top: 2px solid #0d9488; margin-top: 6px; padding-top: 8px; font-weight: 800; font-size: 16px; color: #0d9488; }
        .notes { margin-top: 24px; padding: 12px 16px; background: #f9fafb; border-radius: 8px; font-size: 12px; color: #6b7280; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af; padding-top: 16px; border-top: 1px solid #e5e7eb; }
        .status-paid { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #16a34a; font-weight: 700; font-size: 13px; border-radius: 6px; border: 1px solid #86efac; }
        @media print { body { padding: 20px; } }
      </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  const subtotal = invoice.items.reduce((s, i) => s + i.amount, 0);
  const taxAmt = (subtotal - (invoice.discount || 0)) * (invoice.tax_rate / 100);
  const total = subtotal - (invoice.discount || 0) + taxAmt;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col">
      <div className="flex items-center justify-between bg-white px-4 py-3 flex-shrink-0 shadow-sm">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
        <h2 className="font-bold text-gray-900">Invoice Preview</h2>
        <button onClick={handlePrint} className="flex items-center gap-2 bg-brand-teal text-white font-bold text-sm px-4 py-2 rounded-xl">
          <Printer size={14} /> Print / PDF
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        <div ref={printRef} className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Invoice Header */}
          <div className="header flex justify-between items-start p-8 pb-6 border-b-2 border-brand-teal">
            <div>
              <div className="brand text-2xl font-black mb-1">
                <span className="text-brand-teal">Udupi</span><span className="text-brand-coral">Go</span>
              </div>
              {invoice.business_name && <p className="font-bold text-gray-800 text-lg mt-1">{invoice.business_name}</p>}
              {invoice.business_phone && <p className="text-sm text-gray-500 mt-0.5">{invoice.business_phone}</p>}
              {invoice.business_address && <p className="text-xs text-gray-400 mt-0.5 max-w-[200px]">{invoice.business_address}</p>}
            </div>
            <div className="text-right">
              <p className="invoice-title text-xl font-bold text-gray-700">INVOICE</p>
              <p className="invoice-num text-sm text-gray-400 mt-1">#{invoice.invoice_number}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(invoice.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              {invoice.due_date && <p className="text-xs text-gray-400 mt-0.5">Due: {new Date(invoice.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
              {invoice.status === 'paid' && <span className="status-paid mt-2 inline-block text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full">✓ PAID</span>}
            </div>
          </div>

          {/* Bill To */}
          <div className="p-8 pt-5">
            <div className="details-grid grid grid-cols-2 gap-8 mb-6">
              <div>
                <p className="section-label text-[10px] font-bold uppercase text-gray-400 mb-1.5">Bill To</p>
                <p className="detail-name font-bold text-gray-900">{invoice.client_name}</p>
                {invoice.client_email && <p className="text-xs text-gray-500 mt-0.5">{invoice.client_email}</p>}
                {invoice.client_phone && <p className="text-xs text-gray-500 mt-0.5">{invoice.client_phone}</p>}
                {invoice.client_address && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{invoice.client_address}</p>}
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-2.5 px-3 text-[11px] font-bold uppercase text-gray-400">Description</th>
                  <th className="text-right py-2.5 px-3 text-[11px] font-bold uppercase text-gray-400">Qty</th>
                  <th className="text-right py-2.5 px-3 text-[11px] font-bold uppercase text-gray-400">Rate</th>
                  <th className="text-right py-2.5 px-3 text-[11px] font-bold uppercase text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2.5 px-3 text-sm text-gray-800">{item.description}</td>
                    <td className="py-2.5 px-3 text-sm text-gray-600 text-right">{item.qty}</td>
                    <td className="py-2.5 px-3 text-sm text-gray-600 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-sm font-semibold text-gray-900 text-right">₹{item.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="ml-auto w-56 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              {(invoice.discount || 0) > 0 && (
                <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-₹{(invoice.discount || 0).toLocaleString('en-IN')}</span></div>
              )}
              {invoice.tax_rate > 0 && (
                <div className="flex justify-between text-sm text-gray-600"><span>GST ({invoice.tax_rate}%)</span><span>₹{taxAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></div>
              )}
              <div className="flex justify-between font-bold text-base text-brand-teal border-t-2 border-brand-teal pt-2 mt-2">
                <span>Total</span><span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-5 p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Notes</p>
                <p className="text-xs text-gray-600">{invoice.notes}</p>
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-gray-100 text-center text-[10px] text-gray-300">
              Generated by <span className="text-brand-teal font-bold">UdupiGo</span> · udupigo.in
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Invoice Form ─────────────────────────────────────────────────────────────
const InvoiceForm = ({ invoice, onClose, onSuccess }: { invoice?: InvoiceData | null; onClose: () => void; onSuccess: () => void }) => {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items && invoice.items.length > 0 ? invoice.items : [{ id: '1', description: '', qty: 1, rate: 0, amount: 0 }]
  );
  const [form, setForm] = useState({
    business_name: invoice?.business_name || '',
    business_phone: invoice?.business_phone || '',
    business_address: invoice?.business_address || '',
    client_name: invoice?.client_name || '',
    client_email: invoice?.client_email || '',
    client_phone: invoice?.client_phone || '',
    client_address: invoice?.client_address || '',
    tax_rate: invoice?.tax_rate?.toString() || '18',
    discount: invoice?.discount?.toString() || '0',
    notes: invoice?.notes || '',
    due_date: invoice?.due_date || '',
    status: invoice?.status || 'draft',
  });

  const addItem = () => setItems(it => [...it, { id: Date.now().toString(), description: '', qty: 1, rate: 0, amount: 0 }]);
  const removeItem = (id: string) => setItems(it => it.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(it => it.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: field === 'description' ? value : Number(value) };
      updated.amount = updated.qty * updated.rate;
      return updated;
    }));
  };

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const discount = parseFloat(form.discount) || 0;
  const taxRate = parseFloat(form.tax_rate) || 0;
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + taxAmount;

  const mut = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not signed in');
      const payload = {
        user_id: user.id,
        invoice_number: invoice?.invoice_number || `INV-${Date.now().toString().slice(-6)}`,
        ...form,
        tax_rate: taxRate,
        discount,
        items,
        subtotal,
        tax_amount: taxAmount,
        total,
        updated_at: new Date().toISOString(),
      };
      if (invoice) {
        const { error } = await supabase.from('invoices').update(payload).eq('id', invoice.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('invoices').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(invoice ? 'Invoice updated!' : 'Invoice created!');
      qc.invalidateQueries({ queryKey: ['invoices'] });
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4 pb-8">
      {/* Business Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <h3 className="font-heading font-bold text-gray-900 text-sm flex items-center gap-2">
          <span className="w-6 h-6 bg-brand-teal text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
          Your Business
        </h3>
        <input value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
          placeholder="Your Business Name" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
        <div className="grid grid-cols-2 gap-3">
          <input value={form.business_phone} onChange={e => setForm(f => ({ ...f, business_phone: e.target.value }))}
            placeholder="Phone" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
          <input value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
            type="date" placeholder="Due Date" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
        </div>
        <input value={form.business_address} onChange={e => setForm(f => ({ ...f, business_address: e.target.value }))}
          placeholder="Business Address" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
      </div>

      {/* Client Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <h3 className="font-heading font-bold text-gray-900 text-sm flex items-center gap-2">
          <span className="w-6 h-6 bg-brand-coral text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
          Bill To (Client) *
        </h3>
        <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
          placeholder="Client Name *" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-teal/20" />
        <div className="grid grid-cols-2 gap-3">
          <input value={form.client_phone} onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))}
            placeholder="Phone" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
          <input value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))}
            placeholder="Email" type="email" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
        </div>
        <input value={form.client_address} onChange={e => setForm(f => ({ ...f, client_address: e.target.value }))}
          placeholder="Client Address" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none" />
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-bold text-gray-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
            Items / Services
          </h3>
          <button onClick={addItem} className="text-xs font-bold text-brand-teal flex items-center gap-1 hover:underline">
            <Plus size={12} /> Add Item
          </button>
        </div>

        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-12 gap-1.5 text-[9px] font-bold text-gray-400 uppercase px-1">
            <div className="col-span-5">Description</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-3 text-center">Rate (₹)</div>
            <div className="col-span-2 text-right">Amt</div>
          </div>
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-1.5 items-center">
              <input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                placeholder="Item description" className="col-span-5 px-2.5 py-2 bg-gray-50 rounded-xl text-xs outline-none border border-gray-100 focus:border-brand-teal/30" />
              <input value={item.qty || ''} onChange={e => updateItem(item.id, 'qty', e.target.value)}
                type="number" min="1" className="col-span-2 px-2 py-2 bg-gray-50 rounded-xl text-xs text-center outline-none border border-gray-100" />
              <input value={item.rate || ''} onChange={e => updateItem(item.id, 'rate', e.target.value)}
                type="number" min="0" className="col-span-3 px-2 py-2 bg-gray-50 rounded-xl text-xs text-center outline-none border border-gray-100" />
              <div className="col-span-1 text-right">
                <p className="text-xs font-bold text-gray-800">₹{item.amount.toLocaleString('en-IN')}</p>
              </div>
              {items.length > 1 && (
                <button onClick={() => removeItem(item.id)} className="col-span-1 flex justify-center text-red-400 hover:text-red-600">
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Tax and Discount */}
        <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">GST / Tax %</label>
              <select value={form.tax_rate} onChange={e => setForm(f => ({ ...f, tax_rate: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 rounded-xl text-sm outline-none appearance-none">
                <option value="0">No Tax</option>
                <option value="5">5% GST</option>
                <option value="12">12% GST</option>
                <option value="18">18% GST</option>
                <option value="28">28% GST</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Discount (₹)</label>
              <input value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                type="number" min="0" placeholder="0"
                className="w-full px-3 py-2 bg-gray-50 rounded-xl text-sm outline-none border border-gray-100" />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            {discount > 0 && <div className="flex justify-between text-xs text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>}
            {taxRate > 0 && <div className="flex justify-between text-xs text-gray-500"><span>GST ({taxRate}%)</span><span>₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></div>}
            <div className="flex justify-between font-bold text-sm text-brand-teal border-t border-gray-200 pt-1.5 mt-1"><span>Total</span><span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></div>
          </div>
        </div>
      </div>

      {/* Notes & Status */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <h3 className="font-heading font-bold text-gray-900 text-sm">Notes & Status</h3>
        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Payment instructions, bank details, thank you note..."
          rows={2} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none resize-none" />
        <div>
          <label className="text-[10px] font-bold text-gray-400 block mb-1">Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm outline-none appearance-none">
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <button onClick={() => mut.mutate()} disabled={!form.client_name || items.every(i => !i.description) || mut.isPending}
        className="w-full bg-brand-teal text-white font-bold py-3.5 rounded-xl text-sm hover:bg-[#0d7a72] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
        {mut.isPending ? <><RefreshCw size={15} className="animate-spin" /> Saving...</> : <><CheckCircle size={15} /> {invoice ? 'Update Invoice' : 'Create Invoice'}</>}
      </button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Invoice = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [view, setView] = useState<ViewMode>('list');
  const [editInvoice, setEditInvoice] = useState<InvoiceData | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceData | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from('invoices').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      return (data || []) as InvoiceData[];
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Invoice deleted'); qc.invalidateQueries({ queryKey: ['invoices'] }); },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['invoices'] }); },
  });

  const filtered = invoices.filter(inv => {
    const matchSearch = !search || inv.client_name.toLowerCase().includes(search.toLowerCase()) || inv.invoice_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'sent').length,
    totalValue: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24 px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🔐</p>
          <h2 className="font-heading font-bold text-xl mb-2">Sign In Required</h2>
          <p className="text-gray-500 text-sm mb-6">Please sign in to access Invoice Manager</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-brand-teal text-white font-bold rounded-xl text-sm">Go to Home</button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={view !== 'list' ? () => { setView('list'); setEditInvoice(null); } : () => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-gray-900 text-lg">
              {view === 'list' ? 'Invoice Manager' : view === 'create' ? (editInvoice ? 'Edit Invoice' : 'New Invoice') : 'Preview'}
            </h1>
            <p className="text-xs text-gray-400">{invoices.length} invoices · UdupiGo Business</p>
          </div>
          {view === 'list' && (
            <button onClick={() => { setEditInvoice(null); setView('create'); }}
              className="bg-brand-teal text-white font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-[#0d7a72]">
              <Plus size={15} /> New
            </button>
          )}
        </div>
      </div>

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="px-4 pt-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-brand-teal to-[#0d7a72] rounded-2xl p-4 text-white">
              <p className="text-xs text-white/70">Total Invoices</p>
              <p className="font-heading font-bold text-3xl mt-1">{stats.total}</p>
              <p className="text-xs text-white/60 mt-0.5">{stats.paid} paid · {stats.pending} pending</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-4 text-white">
              <p className="text-xs text-white/70">Amount Received</p>
              <p className="font-heading font-bold text-2xl mt-1">₹{stats.totalValue > 99999 ? `${(stats.totalValue / 100000).toFixed(1)}L` : stats.totalValue.toLocaleString('en-IN')}</p>
              <p className="text-xs text-white/60 mt-0.5">From paid invoices</p>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search client, invoice #..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none shadow-sm" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-100 rounded-xl text-xs font-semibold text-gray-700 outline-none shadow-sm appearance-none pr-7">
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Invoice List */}
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <FileText size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="font-semibold text-gray-700">No invoices yet</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">Create your first professional invoice</p>
              <button onClick={() => { setEditInvoice(null); setView('create'); }}
                className="px-6 py-2.5 bg-brand-teal text-white font-bold text-sm rounded-xl flex items-center gap-2 mx-auto">
                <Plus size={14} /> Create Invoice
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(inv => (
                <div key={inv.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-heading font-bold text-gray-900 text-sm">{inv.client_name}</p>
                          <StatusBadge status={inv.status} />
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">#{inv.invoice_number}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-brand-teal">₹{inv.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">{new Date(inv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>

                    {/* Quick status change */}
                    {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                      <div className="flex gap-1.5 mt-2.5 overflow-x-auto scrollbar-hide">
                        {inv.status === 'draft' && (
                          <button onClick={() => updateStatus.mutate({ id: inv.id, status: 'sent' })}
                            className="flex-shrink-0 text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <Send size={9} /> Mark Sent
                          </button>
                        )}
                        <button onClick={() => updateStatus.mutate({ id: inv.id, status: 'paid' })}
                          className="flex-shrink-0 text-[10px] bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <CheckCircle size={9} /> Mark Paid
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-0 border-t border-gray-50">
                    <button onClick={() => setPreviewInvoice(inv)}
                      className="flex-1 py-2.5 text-xs font-semibold text-brand-teal flex items-center justify-center gap-1.5 hover:bg-brand-teal/5">
                      <Eye size={12} /> Preview
                    </button>
                    <button onClick={() => { setEditInvoice(inv); setView('create'); }}
                      className="flex-1 py-2.5 text-xs font-semibold text-gray-600 flex items-center justify-center gap-1.5 hover:bg-gray-50 border-l border-gray-50">
                      <Edit3 size={12} /> Edit
                    </button>
                    <button onClick={() => { setPreviewInvoice(inv); setTimeout(() => { const win = window.open(''); win?.print(); }, 300); }}
                      className="flex-1 py-2.5 text-xs font-semibold text-blue-600 flex items-center justify-center gap-1.5 hover:bg-blue-50 border-l border-gray-50">
                      <Printer size={12} /> Print
                    </button>
                    <button onClick={() => deleteInvoice.mutate(inv.id)}
                      className="flex-1 py-2.5 text-xs font-semibold text-red-500 flex items-center justify-center gap-1.5 hover:bg-red-50 border-l border-gray-50">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-heading font-bold text-gray-900 text-sm mb-3">💡 Invoice Tips</h3>
            <div className="space-y-2">
              {[
                'Add your UPI ID or bank details in the Notes section',
                'Always include GST number if your business is GST registered',
                'Use "Print / PDF" to share professional invoices via WhatsApp',
                'Track payments by marking invoices as Paid',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center text-[8px] font-bold flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-[11px] text-gray-500">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT VIEW ── */}
      {view === 'create' && (
        <div className="px-4 pt-4">
          <div className="bg-gradient-to-r from-brand-teal to-[#0d7a72] rounded-2xl p-5 text-white mb-4">
            <h2 className="font-heading font-bold text-lg mb-0.5">{editInvoice ? 'Edit Invoice' : 'New Invoice'}</h2>
            <p className="text-xs text-white/80">Create a professional invoice for your client</p>
          </div>
          <InvoiceForm
            invoice={editInvoice}
            onClose={() => { setView('list'); setEditInvoice(null); }}
            onSuccess={() => { setView('list'); setEditInvoice(null); }}
          />
        </div>
      )}

      {/* Print Preview Modal */}
      {previewInvoice && (
        <PrintView invoice={previewInvoice} onClose={() => setPreviewInvoice(null)} />
      )}

      <BottomNav />
    </div>
  );
};

export default Invoice;
