import { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/common/Icon';
import { PageSpinner } from '../../components/common/Spinner';
import {
  PageHeader, SearchBar, FilterTab, EmptyState,
  FormModal, Field, useToast, ConfirmModal,
} from '../shared';
import {
  getAllSuppliers, createSupplier, updateSupplier, deleteSupplier,
  getAllPurchaseOrders, createPurchaseOrder, updatePurchaseOrderStatus, deletePurchaseOrder,
  getSupplierStats, PO_STATUSES,
} from '../../services/supplierService';
import { getAllMedicines } from '../../services/medicineService';

const PO_STATUS_CFG = {
  DRAFT:              { cls: 'bg-slate-100 text-slate-600',  label: 'Draft'               },
  SUBMITTED:          { cls: 'bg-amber-50 text-amber-700',   label: 'Submitted'           },
  APPROVED:           { cls: 'bg-brand-50 text-brand-700',   label: 'Approved'            },
  PARTIALLY_RECEIVED: { cls: 'bg-blue-50 text-blue-700',     label: 'Partially Received'  },
  RECEIVED:           { cls: 'bg-teal-50 text-teal-700',     label: 'Received'            },
  CANCELLED:          { cls: 'bg-red-50 text-red-600',       label: 'Cancelled'           },
};

function PoStatusBadge({ status }) {
  const cfg = PO_STATUS_CFG[status] || PO_STATUS_CFG.DRAFT;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
}

// ─── Supplier Form ────────────────────────────────────────────────────────────
function SupplierForm({ supplier, onClose, onDone }) {
  const [form, setForm] = useState({
    name: supplier?.name || '', contact_person: supplier?.contact_person || '',
    phone: supplier?.phone || '', email: supplier?.email || '',
    address: supplier?.address || '', city: supplier?.city || '',
    state: supplier?.state || '', gst_number: supplier?.gst_number || '',
    drug_license: supplier?.drug_license || '',
    payment_terms: supplier?.payment_terms || 30,
    credit_limit: supplier?.credit_limit || 0,
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name) { toast.error('Supplier name is required'); return; }
    setSaving(true);
    try {
      if (supplier) {
        await updateSupplier(supplier.id, { ...form, payment_terms: Number(form.payment_terms), credit_limit: Number(form.credit_limit) });
        onDone('Supplier updated');
      } else {
        await createSupplier({ ...form, payment_terms: Number(form.payment_terms), credit_limit: Number(form.credit_limit) });
        onDone('Supplier added');
      }
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <FormModal title={supplier ? 'Edit Supplier' : 'Add Supplier'} onClose={onClose} onSubmit={submit} loading={saving} wide>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Supplier Name *"><input className="input" value={form.name} onChange={set('name')} /></Field>
        <Field label="Contact Person"><input className="input" value={form.contact_person} onChange={set('contact_person')} /></Field>
        <Field label="Phone"><input className="input" value={form.phone} onChange={set('phone')} /></Field>
        <Field label="Email"><input className="input" type="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="City"><input className="input" value={form.city} onChange={set('city')} /></Field>
        <Field label="State"><input className="input" value={form.state} onChange={set('state')} /></Field>
        <Field label="GST Number"><input className="input" placeholder="27AAAAA0000A1Z5" value={form.gst_number} onChange={set('gst_number')} /></Field>
        <Field label="Drug License"><input className="input" value={form.drug_license} onChange={set('drug_license')} /></Field>
        <Field label="Payment Terms (days)"><input className="input" type="number" value={form.payment_terms} onChange={set('payment_terms')} /></Field>
        <Field label="Credit Limit (₹)"><input className="input" type="number" value={form.credit_limit} onChange={set('credit_limit')} /></Field>
      </div>
      <Field label="Address"><textarea className="input" rows={2} value={form.address} onChange={set('address')} /></Field>
    </FormModal>
  );
}

// ─── PO Detail Drawer ─────────────────────────────────────────────────────────
function PoDrawer({ po, onClose, onStatusChange }) {
  if (!po) return null;

  const canAdvance = { DRAFT: 'SUBMITTED', SUBMITTED: 'APPROVED', APPROVED: 'RECEIVED' };
  const nextStatus = canAdvance[po.status];
  const nextLabel  = { DRAFT: 'Submit Order', SUBMITTED: 'Mark Approved', APPROVED: 'Mark Received' }[po.status];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <div>
            <h3 className="font-display text-lg text-slate-900">{po.order_number}</h3>
            <p className="text-xs text-slate-400">{po.supplier_name}</p>
          </div>
          <button onClick={onClose}><Icon name="close" className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-5">
          {/* Status + action */}
          <div className="flex items-center gap-3">
            <PoStatusBadge status={po.status} />
            {nextStatus && (
              <button onClick={() => onStatusChange(po.id, nextStatus)} className="btn-primary btn-sm ml-auto">{nextLabel}</button>
            )}
            {po.status !== 'CANCELLED' && po.status !== 'RECEIVED' && (
              <button onClick={() => onStatusChange(po.id, 'CANCELLED')} className="btn-sm text-xs text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg">Cancel</button>
            )}
          </div>

          {/* Supplier info */}
          <div className="card !p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Supplier</div>
            {[
              ['Name', po.supplier_name],
              ['Ordered At', po.ordered_at ? new Date(po.ordered_at).toLocaleDateString('en-IN') : '—'],
              ['Expected Delivery', po.expected_delivery_at || '—'],
              ['Received At', po.received_at ? new Date(po.received_at).toLocaleDateString('en-IN') : '—'],
              ['Ordered By', po.ordered_by],
              ['Approved By', po.approved_by || '—'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-slate-400">{label}</span>
                <span className="text-slate-700">{val}</span>
              </div>
            ))}
            {po.notes && <p className="text-xs text-slate-500 italic mt-1 pt-2 border-t border-slate-100">{po.notes}</p>}
          </div>

          {/* Items */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase mb-3">Order Items</div>
            <div className="space-y-2">
              {(po.items || []).map((item) => (
                <div key={item.id} className="card !p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">{item.medicine_name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Batch: {item.batch_number || '—'} · Exp: {item.expiry_date || '—'}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-slate-500">Qty: {item.quantity_ordered}</div>
                    <div className="text-xs font-medium text-slate-700">₹{item.unit_price}/unit</div>
                    {item.quantity_received > 0 && (
                      <div className="text-[10px] text-teal-600">Received: {item.quantity_received}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="card !p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-3">Summary</div>
            {[
              ['Subtotal', `₹${po.subtotal?.toLocaleString('en-IN')}`],
              ['Discount', `−₹${po.discount_amount?.toLocaleString('en-IN')}`],
              ['GST', `₹${po.gst_amount?.toLocaleString('en-IN')}`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">{label}</span>
                <span className="text-slate-600">{val}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-display pt-2 border-t border-slate-100">
              <span className="text-slate-700">Net Amount</span>
              <span className="text-brand-700">₹{po.net_amount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create PO Form ───────────────────────────────────────────────────────────
function CreatePoForm({ suppliers, onClose, onDone }) {
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({ supplier_id: '', expected_delivery_at: '', notes: '', discount_amount: 0 });
  const [items, setItems] = useState([{ medicine_id: '', medicine_name: '', quantity_ordered: 1, unit_price: 0, gst_rate: 12, gst_amount: 0, total_price: 0 }]);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { getAllMedicines().then(setMedicines); }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const setItem = (idx, k, val) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [k]: val };
      if (k === 'medicine_id') {
        const med = medicines.find(m => m.id === Number(val));
        updated.medicine_name = med?.name || med?.brandName || '';
        updated.unit_price    = med?.purchasePrice || med?.mrp || 0;
      }
      const qty   = Number(updated.quantity_ordered) || 0;
      const price = Number(updated.unit_price) || 0;
      const gstR  = Number(updated.gst_rate) || 0;
      updated.gst_amount  = Math.round((qty * price * gstR) / 100);
      updated.total_price = Math.round(qty * price + updated.gst_amount);
      return updated;
    }));
  };

  const addItem    = () => setItems(prev => [...prev, { medicine_id: '', medicine_name: '', quantity_ordered: 1, unit_price: 0, gst_rate: 12, gst_amount: 0, total_price: 0 }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const subtotal   = items.reduce((s, i) => s + Number(i.unit_price) * Number(i.quantity_ordered), 0);
  const gstTotal   = items.reduce((s, i) => s + Number(i.gst_amount), 0);
  const netAmount  = subtotal - Number(form.discount_amount || 0) + gstTotal;

  const submit = async () => {
    if (!form.supplier_id || items.some(i => !i.medicine_id || !i.quantity_ordered)) {
      toast.error('Supplier and at least one complete item are required');
      return;
    }
    setSaving(true);
    try {
      await createPurchaseOrder({ ...form, supplier_id: Number(form.supplier_id), items, subtotal, gst_amount: gstTotal, net_amount: netAmount });
      onDone('Purchase order created');
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <FormModal title="New Purchase Order" onClose={onClose} onSubmit={submit} loading={saving} submitLabel="Create PO" wide>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Supplier *">
          <select className="input" value={form.supplier_id} onChange={set('supplier_id')}>
            <option value="">Select supplier…</option>
            {suppliers.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Expected Delivery">
          <input className="input" type="date" value={form.expected_delivery_at} onChange={set('expected_delivery_at')} />
        </Field>
        <Field label="Discount (₹)">
          <input className="input" type="number" value={form.discount_amount} onChange={set('discount_amount')} />
        </Field>
        <Field label="Notes">
          <input className="input" placeholder="Optional note…" value={form.notes} onChange={set('notes')} />
        </Field>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase">Items</span>
          <button type="button" onClick={addItem} className="text-xs text-brand-600 hover:underline font-medium">+ Add Item</button>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-end border border-slate-100 rounded-xl p-3">
            <div className="col-span-4">
              <label className="text-[10px] text-slate-400 mb-0.5 block">Medicine</label>
              <select className="input text-xs" value={item.medicine_id} onChange={e => setItem(idx, 'medicine_id', e.target.value)}>
                <option value="">Select…</option>
                {medicines.map(m => <option key={m.id} value={m.id}>{m.name || m.brandName}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 mb-0.5 block">Qty</label>
              <input className="input text-xs" type="number" min="1" value={item.quantity_ordered} onChange={e => setItem(idx, 'quantity_ordered', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 mb-0.5 block">Unit Price (₹)</label>
              <input className="input text-xs" type="number" value={item.unit_price} onChange={e => setItem(idx, 'unit_price', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 mb-0.5 block">GST %</label>
              <input className="input text-xs" type="number" value={item.gst_rate} onChange={e => setItem(idx, 'gst_rate', e.target.value)} />
            </div>
            <div className="col-span-1">
              <label className="text-[10px] text-slate-400 mb-0.5 block">Total</label>
              <div className="text-xs font-medium text-slate-700 pt-2">₹{item.total_price.toLocaleString()}</div>
            </div>
            <div className="col-span-1 flex justify-end pb-1">
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600">
                  <Icon name="close" className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-brand-50 rounded-xl px-4 py-3 flex items-center justify-between">
        <div className="text-xs text-brand-600">{items.length} item(s) · GST: ₹{gstTotal.toLocaleString()}</div>
        <div className="font-display text-brand-700">Net: ₹{netAmount.toLocaleString()}</div>
      </div>
    </FormModal>
  );
}

// ─── Suppliers Tab ────────────────────────────────────────────────────────────
function SuppliersTab() {
  const [suppliers, setSuppliers]   = useState([]);
  const [busy, setBusy]             = useState(true);
  const [search, setSearch]         = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const load = useCallback(async () => { setBusy(true); setSuppliers(await getAllSuppliers()); setBusy(false); }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = suppliers.filter(s => [s.name, s.city, s.contact_person].some(v => v?.toLowerCase().includes(search.toLowerCase())));

  const handleDelete = async () => {
    await deleteSupplier(deleteTarget.id);
    setDeleteTarget(null);
    toast.success('Supplier removed');
    load();
  };

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search suppliers…" className="w-64" />
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary btn-sm gap-1.5 ml-auto">
          <Icon name="plus" className="w-3.5 h-3.5" /> Add Supplier
        </button>
      </div>
      {filtered.length === 0 ? <EmptyState icon="users" title="No suppliers found" /> : (
        <div className="card !p-0">
          <div className="table-wrapper border-0">
            <table className="data-table">
              <thead><tr><th>Supplier</th><th>Contact</th><th>Phone</th><th>City</th><th>Payment Terms</th><th>Credit Limit</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="text-sm font-medium text-slate-800">{s.name}</div>
                      <div className="text-xs text-slate-400">{s.drug_license || '—'}</div>
                    </td>
                    <td className="text-xs text-slate-500">{s.contact_person || '—'}</td>
                    <td className="text-xs text-slate-500">{s.phone || '—'}</td>
                    <td className="text-xs text-slate-500">{s.city || '—'}</td>
                    <td className="text-xs text-slate-500">{s.payment_terms} days</td>
                    <td className="text-xs text-slate-700">₹{s.credit_limit?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.is_active ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing(s); setShowForm(true); }} className="text-brand-600 hover:text-brand-800 text-xs font-medium">Edit</button>
                        <button onClick={() => setDeleteTarget(s)} className="text-red-400 hover:text-red-600 text-xs font-medium">Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showForm && <SupplierForm supplier={editing} onClose={() => { setShowForm(false); setEditing(null); }} onDone={(msg) => { setShowForm(false); setEditing(null); toast.success(msg); load(); }} />}
      {deleteTarget && <ConfirmModal title="Delete Supplier" message={`Remove "${deleteTarget.name}"?`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}

// ─── Main Suppliers Module ────────────────────────────────────────────────────
const PO_FILTER_OPTS = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Received', value: 'RECEIVED' },
];

export default function SuppliersModule() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders]       = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats]         = useState(null);
  const [busy, setBusy]           = useState(true);
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const load = useCallback(async (f = filter) => {
    setBusy(true);
    const [o, s, st] = await Promise.all([getAllPurchaseOrders(f), getAllSuppliers(), getSupplierStats()]);
    setOrders(o); setSuppliers(s); setStats(st);
    setBusy(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = (f) => { setFilter(f); load(f); };

  const handleStatusChange = async (id, status) => {
    await updatePurchaseOrderStatus(id, status);
    toast.success('Status updated');
    load();
    setSelected(null);
  };

  const handleDelete = async () => {
    await deletePurchaseOrder(deleteTarget.id);
    setDeleteTarget(null);
    toast.success('Purchase order deleted');
    load();
  };

  const filtered = orders.filter(o =>
    [o.order_number, o.supplier_name].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const TABS = [
    { id: 'orders',    label: 'Purchase Orders' },
    { id: 'suppliers', label: 'Suppliers'       },
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Procurement"
        subtitle="Suppliers and purchase orders management"
        action={
          activeTab === 'orders'
            ? <button onClick={() => setShowCreate(true)} className="btn-primary gap-1.5"><Icon name="plus" className="w-4 h-4" /> New PO</button>
            : null
        }
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Suppliers',       value: stats.active,                                     bg: 'bg-brand-50',  ic: 'text-brand-500'  },
            { label: 'Pending Orders',  value: stats.pending,                                    bg: 'bg-amber-50',  ic: 'text-amber-500'  },
            { label: 'Total Suppliers', value: stats.total,                                      bg: 'bg-slate-100', ic: 'text-slate-500'  },
            { label: 'Total Value',     value: `₹${((stats.totalValue || 0) / 1000).toFixed(0)}K`, bg: 'bg-teal-50',   ic: 'text-teal-500'   },
          ].map(({ label, value, bg, ic }) => (
            <div key={label} className="card flex items-center gap-3 animate-slide-up">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon name="payment" className={`w-4 h-4 ${ic}`} />
              </div>
              <div>
                <div className="text-xs text-slate-400">{label}</div>
                <div className="text-2xl font-display text-slate-900">{value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`text-sm pb-2 border-b-2 font-medium transition-colors -mb-px ${activeTab === t.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'suppliers' ? <SuppliersTab /> : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar value={search} onChange={setSearch} placeholder="Search order, supplier…" className="w-72" />
            <FilterTab options={PO_FILTER_OPTS} value={filter} onChange={handleFilterChange} />
          </div>

          {busy ? <PageSpinner /> : filtered.length === 0 ? (
            <EmptyState icon="prescription" title="No purchase orders" action={<button onClick={() => setShowCreate(true)} className="btn-primary btn-sm">New PO</button>} />
          ) : (
            <div className="card !p-0 animate-slide-up">
              <div className="table-wrapper border-0">
                <table className="data-table">
                  <thead>
                    <tr><th>PO #</th><th>Supplier</th><th>Items</th><th>Net Amount</th><th>Ordered At</th><th>Expected</th><th>Status</th><th></th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(o => (
                      <tr key={o.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelected(o)}>
                        <td className="font-medium text-brand-700 text-xs">{o.order_number}</td>
                        <td className="text-xs text-slate-800 font-medium">{o.supplier_name}</td>
                        <td className="text-xs text-slate-500">{(o.items || []).length} item(s)</td>
                        <td className="text-xs font-medium text-slate-700">₹{o.net_amount?.toLocaleString('en-IN')}</td>
                        <td className="text-xs text-slate-400">{o.ordered_at ? new Date(o.ordered_at).toLocaleDateString('en-IN') : '—'}</td>
                        <td className="text-xs text-slate-400">{o.expected_delivery_at || '—'}</td>
                        <td><PoStatusBadge status={o.status} /></td>
                        <td>
                          <div className="flex gap-1">
                            <button onClick={e => { e.stopPropagation(); setSelected(o); }} className="text-slate-400 hover:text-brand-600 p-1"><Icon name="eye" className="w-4 h-4" /></button>
                            {o.status === 'DRAFT' && (
                              <button onClick={e => { e.stopPropagation(); setDeleteTarget(o); }} className="text-slate-400 hover:text-red-500 p-1"><Icon name="close" className="w-4 h-4" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {selected && <PoDrawer po={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />}
      {showCreate && <CreatePoForm suppliers={suppliers} onClose={() => setShowCreate(false)} onDone={(msg) => { setShowCreate(false); toast.success(msg); load(); }} />}
      {deleteTarget && <ConfirmModal title="Delete PO" message={`Delete "${deleteTarget.order_number}"?`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}
