import { useState, useEffect, useCallback } from 'react';
import Avatar from '../../components/common/Avatar';
import Icon from '../../components/common/Icon';
import { PageSpinner } from '../../components/common/Spinner';
import {
  PageHeader, SearchBar, FilterTab, EmptyState,
  FormModal, Field, useToast, ConfirmModal,
} from '../shared';
import {
  getAllPayrolls, createPayroll, updatePayroll, processPayroll, markPayrollPaid,
  getAllPayouts, createPayout, getPayrollStats, getStaffUsers,
  PAYOUT_STATUSES, PAYOUT_TYPES, PAYMENT_MODES, getMonthName,
} from '../../services/payrollService';

const STATUS_CFG = {
  PENDING:    { cls: 'bg-amber-50 text-amber-700',  label: 'Pending'    },
  PROCESSING: { cls: 'bg-blue-50 text-blue-700',    label: 'Processing' },
  PAID:       { cls: 'bg-teal-50 text-teal-700',    label: 'Paid'       },
  FAILED:     { cls: 'bg-red-50 text-red-700',      label: 'Failed'     },
  CANCELLED:  { cls: 'bg-slate-100 text-slate-500', label: 'Cancelled'  },
};

const PAYOUT_TYPE_CFG = {
  SALARY:        { cls: 'bg-brand-50 text-brand-700',   label: 'Salary'        },
  ADVANCE:       { cls: 'bg-amber-50 text-amber-700',   label: 'Advance'       },
  REIMBURSEMENT: { cls: 'bg-blue-50 text-blue-700',     label: 'Reimbursement' },
  BONUS:         { cls: 'bg-teal-50 text-teal-700',     label: 'Bonus'         },
  INCENTIVE:     { cls: 'bg-violet-50 text-violet-700', label: 'Incentive'     },
  DEDUCTION:     { cls: 'bg-red-50 text-red-700',       label: 'Deduction'     },
};

function PayrollBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.PENDING;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
}

const MONTHS = [
  { value: 1, label: 'January' },   { value: 2, label: 'February' },
  { value: 3, label: 'March' },     { value: 4, label: 'April' },
  { value: 5, label: 'May' },       { value: 6, label: 'June' },
  { value: 7, label: 'July' },      { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

// ─── Pay Modal ────────────────────────────────────────────────────────────────
function PayModal({ payroll, onClose, onDone }) {
  const [mode, setMode]   = useState('NETBANKING');
  const [ref, setRef]     = useState('');
  const [busy, setBusy]   = useState(false);
  const toast = useToast();

  const submit = async () => {
    setBusy(true);
    try {
      await markPayrollPaid(payroll.id, mode, ref);
      onDone(`₹${payroll.net_salary.toLocaleString('en-IN')} paid to ${payroll.user_name}`);
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-lg text-slate-900 mb-1">Process Payment</h3>
        <p className="text-sm text-slate-400 mb-5">{payroll.user_name} · {getMonthName(payroll.month)} {payroll.year}</p>
        <div className="bg-brand-50 rounded-xl px-5 py-4 text-center mb-5">
          <div className="text-3xl font-display text-brand-700">₹{payroll.net_salary?.toLocaleString('en-IN')}</div>
          <div className="text-xs text-brand-400 mt-1">Net Salary</div>
        </div>
        <div className="space-y-3 mb-5">
          <Field label="Payment Mode">
            <select className="input" value={mode} onChange={e => setMode(e.target.value)}>
              {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Reference Number (optional)">
            <input className="input" placeholder="Transaction ref…" value={ref} onChange={e => setRef(e.target.value)} />
          </Field>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={busy} className="btn-primary flex-1">
            {busy ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto" /> : 'Mark Paid'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Payroll Form ────────────────────────────────────────────────────────
function EditPayrollForm({ payroll, onClose, onDone }) {
  const [form, setForm] = useState({
    basic_salary: payroll.basic_salary, allowances: payroll.allowances, deductions: payroll.deductions, notes: payroll.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const net = Number(form.basic_salary || 0) + Number(form.allowances || 0) - Number(form.deductions || 0);

  const submit = async () => {
    setSaving(true);
    try {
      await updatePayroll(payroll.id, { ...form, basic_salary: Number(form.basic_salary), allowances: Number(form.allowances), deductions: Number(form.deductions), net_salary: net });
      onDone('Payroll updated');
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <FormModal title={`Edit Payroll — ${payroll.user_name}`} onClose={onClose} onSubmit={submit} loading={saving}>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Basic Salary (₹)"><input className="input" type="number" value={form.basic_salary} onChange={set('basic_salary')} /></Field>
        <Field label="Allowances (₹)"><input className="input" type="number" value={form.allowances} onChange={set('allowances')} /></Field>
        <Field label="Deductions (₹)"><input className="input" type="number" value={form.deductions} onChange={set('deductions')} /></Field>
      </div>
      <Field label="Notes"><input className="input" placeholder="Any remarks…" value={form.notes} onChange={set('notes')} /></Field>
      <div className="bg-brand-50 rounded-xl px-4 py-2 flex items-center justify-between">
        <span className="text-sm text-brand-600">Net Salary</span>
        <span className="font-display text-brand-700">₹{net.toLocaleString('en-IN')}</span>
      </div>
    </FormModal>
  );
}

// ─── Create Payroll Form ──────────────────────────────────────────────────────
function CreatePayrollForm({ onClose, onDone }) {
  const [staffUsers, setStaffUsers] = useState([]);
  const [form, setForm] = useState({
    user_id: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    basic_salary: 0, allowances: 0, deductions: 0, notes: '',
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { getStaffUsers().then(setStaffUsers); }, []);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const net = Number(form.basic_salary || 0) + Number(form.allowances || 0) - Number(form.deductions || 0);

  const submit = async () => {
    if (!form.user_id || !form.basic_salary) { toast.error('Staff member and basic salary are required'); return; }
    setSaving(true);
    try {
      await createPayroll({ ...form, user_id: Number(form.user_id), month: Number(form.month), year: Number(form.year), basic_salary: Number(form.basic_salary), allowances: Number(form.allowances), deductions: Number(form.deductions), net_salary: net });
      onDone('Payroll record created');
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <FormModal title="Add Payroll Record" onClose={onClose} onSubmit={submit} loading={saving} wide>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Staff Member *">
          <select className="input" value={form.user_id} onChange={set('user_id')}>
            <option value="">Select staff…</option>
            {staffUsers.map(u => <option key={u.user_id} value={u.user_id}>{u.name} ({u.role})</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-2 col-span-1">
          <Field label="Month">
            <select className="input" value={form.month} onChange={set('month')}>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
          <Field label="Year">
            <input className="input" type="number" value={form.year} onChange={set('year')} />
          </Field>
        </div>
        <Field label="Basic Salary (₹) *"><input className="input" type="number" value={form.basic_salary} onChange={set('basic_salary')} /></Field>
        <Field label="Allowances (₹)"><input className="input" type="number" value={form.allowances} onChange={set('allowances')} /></Field>
        <Field label="Deductions (₹)"><input className="input" type="number" value={form.deductions} onChange={set('deductions')} /></Field>
        <Field label="Notes"><input className="input" value={form.notes} onChange={set('notes')} /></Field>
      </div>
      <div className="bg-brand-50 rounded-xl px-4 py-2 flex items-center justify-between">
        <span className="text-sm text-brand-600">Net Salary</span>
        <span className="font-display text-brand-700">₹{net.toLocaleString('en-IN')}</span>
      </div>
    </FormModal>
  );
}

// ─── Payouts Tab ──────────────────────────────────────────────────────────────
function PayoutsTab() {
  const [payouts, setPayouts]   = useState([]);
  const [busy, setBusy]         = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [staffUsers, setStaffUsers] = useState([]);
  const [form, setForm] = useState({ user_id: '', type: 'ADVANCE', amount: '', payment_mode: 'CASH', notes: '', reference_number: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => { setBusy(true); setPayouts(await getAllPayouts()); setBusy(false); }, []);
  useEffect(() => { load(); getStaffUsers().then(setStaffUsers); }, [load]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.user_id || !form.amount) { toast.error('Staff member and amount are required'); return; }
    setSaving(true);
    try {
      await createPayout({ ...form, user_id: Number(form.user_id), amount: Number(form.amount) });
      toast.success('Payout recorded');
      setShowForm(false);
      setForm({ user_id: '', type: 'ADVANCE', amount: '', payment_mode: 'CASH', notes: '', reference_number: '' });
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-sm text-slate-700">Payout Records</h4>
        <button onClick={() => setShowForm(true)} className="btn-primary btn-sm gap-1.5">
          <Icon name="plus" className="w-3.5 h-3.5" /> Add Payout
        </button>
      </div>
      {payouts.length === 0 ? <EmptyState icon="payment" title="No payouts yet" /> : (
        <div className="card !p-0">
          <div className="table-wrapper border-0">
            <table className="data-table">
              <thead><tr><th>Staff</th><th>Type</th><th>Amount</th><th>Mode</th><th>Reference</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={p.user_name} size="sm" />
                        <span className="text-xs font-medium text-slate-800">{p.user_name}</span>
                      </div>
                    </td>
                    <td><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(PAYOUT_TYPE_CFG[p.type] || {}).cls || 'bg-slate-100 text-slate-600'}`}>{(PAYOUT_TYPE_CFG[p.type] || {}).label || p.type}</span></td>
                    <td className="text-xs font-medium text-slate-700">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                    <td className="text-xs text-slate-500">{p.payment_mode || '—'}</td>
                    <td className="text-xs text-slate-400">{p.reference_number || '—'}</td>
                    <td className="text-xs text-slate-400">{p.created_at}</td>
                    <td><PayrollBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showForm && (
        <FormModal title="Add Payout" onClose={() => setShowForm(false)} onSubmit={submit} loading={saving}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Staff Member *">
              <select className="input" value={form.user_id} onChange={set('user_id')}>
                <option value="">Select staff…</option>
                {staffUsers.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select className="input" value={form.type} onChange={set('type')}>
                {PAYOUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Amount (₹) *"><input className="input" type="number" value={form.amount} onChange={set('amount')} /></Field>
            <Field label="Payment Mode">
              <select className="input" value={form.payment_mode} onChange={set('payment_mode')}>
                {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Reference #"><input className="input" value={form.reference_number} onChange={set('reference_number')} /></Field>
            <Field label="Notes"><input className="input" value={form.notes} onChange={set('notes')} /></Field>
          </div>
        </FormModal>
      )}
    </div>
  );
}

// ─── Main Payroll Module ──────────────────────────────────────────────────────
export default function PayrollModule() {
  const [activeTab, setActiveTab] = useState('payroll');
  const [payrolls, setPayrolls]   = useState([]);
  const [stats, setStats]         = useState(null);
  const [busy, setBusy]           = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear]   = useState(new Date().getFullYear());
  const [search, setSearch]       = useState('');
  const [payTarget, setPayTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setBusy(true);
    const [p, s] = await Promise.all([getAllPayrolls(selectedMonth, selectedYear), getPayrollStats()]);
    setPayrolls(p);
    setStats(s);
    setBusy(false);
  }, [selectedMonth, selectedYear]);

  useEffect(() => { load(); }, [load]);

  const handleProcess = async (id) => {
    await processPayroll(id);
    toast.success('Payroll moved to Processing');
    load();
  };

  const filtered = payrolls.filter(p =>
    p.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.role?.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { id: 'payroll', label: 'Payroll'  },
    { id: 'payouts', label: 'Payouts'  },
  ];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Staff Payroll"
        subtitle="Monthly salary processing and payout tracking"
        action={
          activeTab === 'payroll'
            ? <button onClick={() => setShowCreate(true)} className="btn-primary gap-1.5"><Icon name="plus" className="w-4 h-4" /> Add Record</button>
            : null
        }
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Pending',      value: stats.pending,                                         bg: 'bg-amber-50', ic: 'text-amber-500' },
            { label: 'Paid',         value: stats.paid,                                            bg: 'bg-teal-50',  ic: 'text-teal-500'  },
            { label: 'Pending (₹)',  value: `₹${(stats.totalPending / 1000).toFixed(0)}K`,          bg: 'bg-red-50',   ic: 'text-red-500'   },
            { label: 'Paid (₹)',     value: `₹${(stats.totalPaid / 1000).toFixed(0)}K`,             bg: 'bg-brand-50', ic: 'text-brand-500' },
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

      {activeTab === 'payouts' ? <PayoutsTab /> : (
        <>
          {/* Month / Year filters */}
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar value={search} onChange={setSearch} placeholder="Search staff, role…" className="w-64" />
            <div className="flex items-center gap-2 ml-auto">
              <select className="input text-sm py-1.5" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <input className="input text-sm py-1.5 w-24" type="number" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} />
            </div>
          </div>

          {busy ? <PageSpinner /> : filtered.length === 0 ? (
            <EmptyState icon="users" title="No payroll records" desc="Add payroll records for this month." action={<button onClick={() => setShowCreate(true)} className="btn-primary btn-sm">Add Record</button>} />
          ) : (
            <div className="card !p-0 animate-slide-up">
              <div className="table-wrapper border-0">
                <table className="data-table">
                  <thead>
                    <tr><th>Staff</th><th>Role</th><th>Basic</th><th>Allowances</th><th>Deductions</th><th>Net Salary</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <Avatar name={p.user_name} size="sm" />
                            <div>
                              <div className="text-xs font-medium text-slate-800">{p.user_name}</div>
                              {p.notes && <div className="text-[10px] text-slate-400">{p.notes}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="text-xs text-slate-500">{p.role}</td>
                        <td className="text-xs text-slate-700">₹{Number(p.basic_salary).toLocaleString('en-IN')}</td>
                        <td className="text-xs text-teal-600">+₹{Number(p.allowances).toLocaleString('en-IN')}</td>
                        <td className="text-xs text-red-500">−₹{Number(p.deductions).toLocaleString('en-IN')}</td>
                        <td className="text-sm font-display text-slate-900">₹{Number(p.net_salary).toLocaleString('en-IN')}</td>
                        <td><PayrollBadge status={p.status} /></td>
                        <td>
                          <div className="flex gap-2 items-center">
                            {p.status === 'PENDING' && (
                              <>
                                <button onClick={() => setEditTarget(p)} className="text-xs text-brand-600 hover:underline font-medium">Edit</button>
                                <button onClick={() => handleProcess(p.id)} className="text-xs text-blue-600 hover:underline font-medium">Process</button>
                              </>
                            )}
                            {p.status === 'PROCESSING' && (
                              <button onClick={() => setPayTarget(p)} className="text-xs font-medium text-teal-600 border border-teal-200 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-colors">
                                Pay Now
                              </button>
                            )}
                            {p.status === 'PAID' && (
                              <span className="text-xs text-slate-400">{p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN') : '—'}</span>
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

      {payTarget   && <PayModal payroll={payTarget} onClose={() => setPayTarget(null)} onDone={(msg) => { setPayTarget(null); toast.success(msg); load(); }} />}
      {editTarget  && <EditPayrollForm payroll={editTarget} onClose={() => setEditTarget(null)} onDone={(msg) => { setEditTarget(null); toast.success(msg); load(); }} />}
      {showCreate  && <CreatePayrollForm onClose={() => setShowCreate(false)} onDone={(msg) => { setShowCreate(false); toast.success(msg); load(); }} />}
    </div>
  );
}
