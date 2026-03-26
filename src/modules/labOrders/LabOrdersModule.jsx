import { useState, useEffect, useCallback } from 'react';
import Avatar from '../../components/common/Avatar';
import Icon from '../../components/common/Icon';
import { PageSpinner } from '../../components/common/Spinner';
import {
  PageHeader, SearchBar, FilterTab, EmptyState,
  FormModal, Field, useToast, ConfirmModal,
} from '../shared';
import {
  getAllLabOrders, getAllLabTests, getAllLabPanels,
  createLabOrder, updateLabOrderStatus, updateLabItemResult,
  createLabTest, updateLabTest, deleteLabTest, getLabStats,
  LAB_STATUSES, LAB_PRIORITIES, SAMPLE_TYPES, LAB_CATEGORIES,
} from '../../services/labService';
import { getAllDoctors } from '../../services/doctorService';
import { getAllPatients } from '../../services/patientService';

const STATUS_CFG = {
  ORDERED:          { cls: 'bg-brand-50 text-brand-700',   label: 'Ordered'          },
  SAMPLE_COLLECTED: { cls: 'bg-amber-50 text-amber-700',   label: 'Sample Collected' },
  IN_PROGRESS:      { cls: 'bg-blue-50 text-blue-700',     label: 'In Progress'      },
  COMPLETED:        { cls: 'bg-teal-50 text-teal-700',     label: 'Completed'        },
  CANCELLED:        { cls: 'bg-slate-100 text-slate-500',  label: 'Cancelled'        },
  REJECTED:         { cls: 'bg-red-50 text-red-700',       label: 'Rejected'         },
};

const PRIORITY_CFG = {
  ROUTINE: 'bg-slate-100 text-slate-600',
  URGENT:  'bg-amber-50 text-amber-700',
  STAT:    'bg-red-50 text-red-700',
};

function LabStatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.ORDERED;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
}

// ─── Lab Order Drawer ─────────────────────────────────────────────────────────
function LabOrderDrawer({ order, onClose, onStatusChange, onResultSave }) {
  const [resultForm, setResultForm] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!order) return null;

  const nextStatus = {
    ORDERED: 'SAMPLE_COLLECTED',
    SAMPLE_COLLECTED: 'IN_PROGRESS',
    IN_PROGRESS: 'COMPLETED',
  }[order.status];

  const nextLabel = {
    ORDERED: 'Mark Sample Collected',
    SAMPLE_COLLECTED: 'Mark In Progress',
    IN_PROGRESS: 'Mark Completed',
  }[order.status];

  const handleResultSave = async (itemId) => {
    setSaving(true);
    try {
      await updateLabItemResult(order.id, itemId, resultForm[itemId] || {});
      toast.success('Result saved');
      setEditingItem(null);
      onResultSave();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl animate-slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <div>
            <h3 className="font-display text-lg text-slate-900">{order.order_number}</h3>
            <p className="text-xs text-slate-400">{order.priority} · {new Date(order.ordered_at).toLocaleDateString('en-IN')}</p>
          </div>
          <button onClick={onClose}><Icon name="close" className="w-5 h-5 text-slate-400" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Patient + Doctor */}
          <div className="flex items-center gap-4">
            <Avatar name={order.patient_name} size="md" />
            <div>
              <div className="font-display text-base text-slate-900">{order.patient_name}</div>
              <div className="text-xs text-slate-400">{order.doctor_name}</div>
              {order.clinical_info && <div className="text-xs text-slate-500 mt-1 italic">"{order.clinical_info}"</div>}
            </div>
          </div>

          {/* Status + actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <LabStatusBadge status={order.status} />
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${PRIORITY_CFG[order.priority]}`}>{order.priority}</span>
            {nextStatus && (
              <button
                onClick={() => onStatusChange(order.id, nextStatus)}
                className="btn-primary btn-sm ml-auto"
              >
                {nextLabel}
              </button>
            )}
          </div>

          {/* Timeline */}
          <div className="card !p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Timeline</div>
            {[
              ['Ordered', order.ordered_at],
              ['Sample Collected', order.sample_collected_at],
              ['Completed', order.completed_at],
              ['Reported', order.reported_at],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-slate-400">{label}</span>
                <span className={val ? 'text-slate-700' : 'text-slate-300'}>
                  {val ? new Date(val).toLocaleString('en-IN') : '—'}
                </span>
              </div>
            ))}
          </div>

          {/* Test Results */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase mb-3">Test Results</div>
            <div className="space-y-3">
              {(order.items || []).map((item) => (
                <div key={item.id} className="card !p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-800">{item.test_name}</span>
                    {item.is_abnormal === true && (
                      <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">Abnormal</span>
                    )}
                    {item.is_abnormal === false && (
                      <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-medium">Normal</span>
                    )}
                  </div>
                  {item.result_value ? (
                    <div>
                      <p className="text-xs text-slate-600">{item.result_value}</p>
                      {item.result_notes && <p className="text-xs text-slate-400 mt-1">{item.result_notes}</p>}
                      <button onClick={() => setEditingItem(item.id)} className="text-xs text-brand-600 hover:underline mt-1">Edit result</button>
                    </div>
                  ) : (
                    editingItem !== item.id ? (
                      order.status !== 'COMPLETED' && order.status !== 'CANCELLED' ? (
                        <button
                          onClick={() => setEditingItem(item.id)}
                          className="text-xs text-brand-600 hover:underline"
                        >
                          + Enter result
                        </button>
                      ) : <span className="text-xs text-slate-300">No result</span>
                    ) : null
                  )}
                  {editingItem === item.id && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-100">
                      <input
                        className="input text-xs"
                        placeholder="Result value…"
                        value={(resultForm[item.id] || {}).result_value || ''}
                        onChange={(e) => setResultForm(f => ({ ...f, [item.id]: { ...f[item.id], result_value: e.target.value } }))}
                      />
                      <input
                        className="input text-xs"
                        placeholder="Notes (optional)"
                        value={(resultForm[item.id] || {}).result_notes || ''}
                        onChange={(e) => setResultForm(f => ({ ...f, [item.id]: { ...f[item.id], result_notes: e.target.value } }))}
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={(resultForm[item.id] || {}).is_abnormal || false}
                            onChange={(e) => setResultForm(f => ({ ...f, [item.id]: { ...f[item.id], is_abnormal: e.target.checked } }))}
                          />
                          Mark as Abnormal
                        </label>
                        <button disabled={saving} onClick={() => handleResultSave(item.id)} className="btn-primary btn-sm ml-auto">Save</button>
                        <button onClick={() => setEditingItem(null)} className="btn-secondary btn-sm">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Lab Order Form ────────────────────────────────────────────────────
function CreateOrderForm({ onClose, onDone }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors]   = useState([]);
  const [tests, setTests]       = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [form, setForm] = useState({
    patient_id: '', patient_name: '',
    doctor_id: '', doctor_name: '',
    priority: 'ROUTINE', clinical_info: '',
    ordered_by: 'Current User',
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([getAllPatients(), getAllDoctors(), getAllLabTests()]).then(([p, d, t]) => {
      setPatients(p); setDoctors(d); setTests(t);
    });
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const selectPatient = (e) => {
    const p = patients.find(p => p.id === Number(e.target.value));
    setForm(f => ({ ...f, patient_id: e.target.value, patient_name: p ? (p.name || `${p.first_name} ${p.last_name}`) : '' }));
  };
  const selectDoctor = (e) => {
    const d = doctors.find(d => d.id === Number(e.target.value));
    setForm(f => ({ ...f, doctor_id: e.target.value, doctor_name: d ? (d.name || `Dr. ${d.first_name} ${d.last_name}`) : '' }));
  };

  const toggleTest = (test) => {
    setSelectedTests(prev =>
      prev.find(t => t.id === test.id)
        ? prev.filter(t => t.id !== test.id)
        : [...prev, test]
    );
  };

  const submit = async () => {
    if (!form.patient_id || !form.doctor_id || selectedTests.length === 0) {
      toast.error('Patient, doctor and at least one test are required');
      return;
    }
    setSaving(true);
    try {
      await createLabOrder({
        ...form,
        items: selectedTests.map((t, i) => ({
          id: Date.now() + i, lab_test_id: t.id, test_name: t.name,
          result_value: null, result_notes: null, is_abnormal: null, completed_at: null,
        })),
      });
      onDone('Lab order created');
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const totalPrice = selectedTests.reduce((s, t) => s + t.price, 0);

  return (
    <FormModal title="New Lab Order" onClose={onClose} onSubmit={submit} loading={saving} submitLabel="Create Order" wide>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Patient *">
          <select className="input" value={form.patient_id} onChange={selectPatient}>
            <option value="">Select patient…</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name || `${p.first_name} ${p.last_name}`}</option>)}
          </select>
        </Field>
        <Field label="Ordering Doctor *">
          <select className="input" value={form.doctor_id} onChange={selectDoctor}>
            <option value="">Select doctor…</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name || `Dr. ${d.first_name} ${d.last_name}`}</option>)}
          </select>
        </Field>
        <Field label="Priority">
          <select className="input" value={form.priority} onChange={set('priority')}>
            {LAB_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Clinical Info">
          <input className="input" placeholder="Clinical indication…" value={form.clinical_info} onChange={set('clinical_info')} />
        </Field>
      </div>
      <Field label="Select Tests *">
        <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto">
          {tests.filter(t => t.is_active).map((t) => (
            <label key={t.id} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={!!selectedTests.find(s => s.id === t.id)}
                onChange={() => toggleTest(t)}
                className="rounded"
              />
              <span className="flex-1 text-sm text-slate-700">{t.name}</span>
              <span className="text-xs text-slate-400">{t.sample_type}</span>
              <span className="text-xs font-medium text-slate-700">₹{t.price}</span>
            </label>
          ))}
        </div>
      </Field>
      {selectedTests.length > 0 && (
        <div className="bg-brand-50 rounded-xl px-4 py-2 flex items-center justify-between text-sm">
          <span className="text-brand-600">{selectedTests.length} test(s) selected</span>
          <span className="font-display text-brand-700">Total: ₹{totalPrice.toLocaleString('en-IN')}</span>
        </div>
      )}
    </FormModal>
  );
}

// ─── Lab Tests Management ─────────────────────────────────────────────────────
function LabTestsTab() {
  const [tests, setTests]       = useState([]);
  const [busy, setBusy]         = useState(true);
  const [search, setSearch]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', category: 'HAEMATOLOGY', sample_type: 'BLOOD', price: '', gst_rate: 5, turnaround_hours: 24, normal_range_male: '', normal_range_female: '', unit: '', description: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setBusy(true);
    const t = await getAllLabTests();
    setTests(t);
    setBusy(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name, code: t.code || '', category: t.category || 'HAEMATOLOGY', sample_type: t.sample_type || 'BLOOD', price: t.price, gst_rate: t.gst_rate, turnaround_hours: t.turnaround_hours, normal_range_male: t.normal_range_male || '', normal_range_female: t.normal_range_female || '', unit: t.unit || '', description: t.description || '' });
    setShowForm(true);
  };

  const submit = async () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateLabTest(editing.id, { ...form, price: Number(form.price), gst_rate: Number(form.gst_rate), turnaround_hours: Number(form.turnaround_hours) });
        toast.success('Test updated');
      } else {
        await createLabTest({ ...form, price: Number(form.price), gst_rate: Number(form.gst_rate), turnaround_hours: Number(form.turnaround_hours) });
        toast.success('Test added');
      }
      setShowForm(false); setEditing(null);
      setForm({ name: '', code: '', category: 'HAEMATOLOGY', sample_type: 'BLOOD', price: '', gst_rate: 5, turnaround_hours: 24, normal_range_male: '', normal_range_female: '', unit: '', description: '' });
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await deleteLabTest(deleteTarget.id);
    setDeleteTarget(null);
    toast.success('Test deleted');
    load();
  };

  const filtered = tests.filter(t => [t.name, t.code, t.category].some(v => v?.toLowerCase().includes(search.toLowerCase())));

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Search tests…" className="w-64" />
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary btn-sm gap-1.5 ml-auto">
          <Icon name="plus" className="w-3.5 h-3.5" /> Add Test
        </button>
      </div>
      {filtered.length === 0 ? <EmptyState icon="lab" title="No tests found" /> : (
        <div className="card !p-0">
          <div className="table-wrapper border-0">
            <table className="data-table">
              <thead><tr><th>Test Name</th><th>Code</th><th>Category</th><th>Sample</th><th>TAT</th><th>Price</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td className="font-medium text-slate-800 text-xs">{t.name}</td>
                    <td className="text-xs text-slate-400">{t.code || '—'}</td>
                    <td className="text-xs text-slate-500">{t.category}</td>
                    <td className="text-xs text-slate-500">{t.sample_type}</td>
                    <td className="text-xs text-slate-500">{t.turnaround_hours}h</td>
                    <td className="text-xs font-medium text-slate-700">₹{t.price}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(t)} className="text-brand-600 hover:text-brand-800 text-xs font-medium">Edit</button>
                        <button onClick={() => setDeleteTarget(t)} className="text-red-400 hover:text-red-600 text-xs font-medium">Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showForm && (
        <FormModal title={editing ? 'Edit Lab Test' : 'Add Lab Test'} onClose={() => { setShowForm(false); setEditing(null); }} onSubmit={submit} loading={saving} wide>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Test Name *"><input className="input" value={form.name} onChange={set('name')} /></Field>
            <Field label="Code"><input className="input" placeholder="e.g. CBC" value={form.code} onChange={set('code')} /></Field>
            <Field label="Category">
              <select className="input" value={form.category} onChange={set('category')}>
                {LAB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Sample Type">
              <select className="input" value={form.sample_type} onChange={set('sample_type')}>
                {SAMPLE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Price (₹) *"><input className="input" type="number" value={form.price} onChange={set('price')} /></Field>
            <Field label="GST Rate (%)"><input className="input" type="number" value={form.gst_rate} onChange={set('gst_rate')} /></Field>
            <Field label="Turnaround (hours)"><input className="input" type="number" value={form.turnaround_hours} onChange={set('turnaround_hours')} /></Field>
            <Field label="Unit"><input className="input" placeholder="e.g. mg/dL" value={form.unit} onChange={set('unit')} /></Field>
            <Field label="Normal Range (Male)"><input className="input" placeholder="e.g. 70–100 mg/dL" value={form.normal_range_male} onChange={set('normal_range_male')} /></Field>
            <Field label="Normal Range (Female)"><input className="input" placeholder="e.g. 70–100 mg/dL" value={form.normal_range_female} onChange={set('normal_range_female')} /></Field>
          </div>
        </FormModal>
      )}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Lab Test"
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Main Lab Orders Module ───────────────────────────────────────────────────
const FILTER_OPTS = [
  { label: 'All', value: 'all' },
  { label: 'Ordered', value: 'ORDERED' },
  { label: 'Sample Collected', value: 'SAMPLE_COLLECTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

export default function LabOrdersModule({ role = 'admin' }) {
  const [orders, setOrders]   = useState([]);
  const [stats, setStats]     = useState(null);
  const [busy, setBusy]       = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const toast = useToast();

  const load = useCallback(async (f = filter) => {
    setBusy(true);
    const [o, s] = await Promise.all([getAllLabOrders(f), getLabStats()]);
    setOrders(o);
    setStats(s);
    setBusy(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = (f) => { setFilter(f); load(f); };

  const handleStatusChange = async (id, status) => {
    await updateLabOrderStatus(id, status);
    toast.success('Order status updated');
    load();
    setSelected(prev => prev ? { ...prev, status } : null);
  };

  const filtered = orders.filter(o =>
    [o.patient_name, o.doctor_name, o.order_number].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const TABS = [
    { id: 'orders', label: 'Lab Orders' },
    ...(role === 'admin' ? [{ id: 'tests', label: 'Test Catalogue' }] : []),
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Laboratory"
        subtitle="Lab orders, test results and test catalogue"
        action={
          <button onClick={() => setShowCreate(true)} className="btn-primary gap-1.5">
            <Icon name="plus" className="w-4 h-4" /> New Lab Order
          </button>
        }
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats.total,       cls: 'bg-brand-50 text-brand-500' },
            { label: 'Ordered',      value: stats.ordered,     cls: 'bg-amber-50 text-amber-500' },
            { label: 'In Progress',  value: stats.in_progress, cls: 'bg-blue-50 text-blue-500'   },
            { label: 'Completed',    value: stats.completed,   cls: 'bg-teal-50 text-teal-500'   },
          ].map(({ label, value, cls }) => (
            <div key={label} className="card flex items-center gap-3 animate-slide-up">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cls.split(' ')[0]}`}>
                <Icon name="lab" className={`w-4 h-4 ${cls.split(' ')[1]}`} />
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
      {TABS.length > 1 && (
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
      )}

      {activeTab === 'tests' ? <LabTestsTab /> : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar value={search} onChange={setSearch} placeholder="Search order, patient, doctor…" className="w-72" />
            <FilterTab options={FILTER_OPTS} value={filter} onChange={handleFilterChange} />
          </div>

          {busy ? <PageSpinner /> : filtered.length === 0 ? (
            <EmptyState icon="lab" title="No lab orders found" action={<button onClick={() => setShowCreate(true)} className="btn-primary btn-sm">New Lab Order</button>} />
          ) : (
            <div className="card !p-0 animate-slide-up">
              <div className="table-wrapper border-0">
                <table className="data-table">
                  <thead>
                    <tr><th>Order #</th><th>Patient</th><th>Doctor</th><th>Tests</th><th>Priority</th><th>Ordered At</th><th>Status</th><th></th></tr>
                  </thead>
                  <tbody>
                    {filtered.map((o) => (
                      <tr key={o.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelected(o)}>
                        <td className="font-medium text-brand-700 text-xs">{o.order_number}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Avatar name={o.patient_name} size="sm" />
                            <span className="font-medium text-slate-800 text-xs">{o.patient_name}</span>
                          </div>
                        </td>
                        <td className="text-xs text-slate-500">{o.doctor_name}</td>
                        <td className="text-xs text-slate-500">{(o.items || []).length} test(s)</td>
                        <td><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_CFG[o.priority]}`}>{o.priority}</span></td>
                        <td className="text-xs text-slate-400">{new Date(o.ordered_at).toLocaleDateString('en-IN')}</td>
                        <td><LabStatusBadge status={o.status} /></td>
                        <td>
                          <button onClick={e => { e.stopPropagation(); setSelected(o); }} className="text-slate-400 hover:text-brand-600 p-1">
                            <Icon name="eye" className="w-4 h-4" />
                          </button>
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

      {selected && (
        <LabOrderDrawer
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onResultSave={() => load()}
        />
      )}
      {showCreate && (
        <CreateOrderForm
          onClose={() => setShowCreate(false)}
          onDone={(msg) => { setShowCreate(false); toast.success(msg); load(); }}
        />
      )}
    </div>
  );
}
