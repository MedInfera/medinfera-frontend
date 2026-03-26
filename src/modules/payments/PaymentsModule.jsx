import { useState, useEffect, useCallback } from 'react';
import Avatar from '../../components/common/Avatar';
import Icon from '../../components/common/Icon';
import { PageSpinner } from '../../components/common/Spinner';
import { PageHeader, SearchBar, FilterTab, EmptyState, useToast } from '../shared';
import {
  getAllPayments, getDoctorPayouts, getPaymentSummary,
  approvePayment, markPayoutPaid, PAYMENT_METHODS,
} from '../../services/paymentService';

// ─── Payout Modal ─────────────────────────────────────────────────────────────
function PayoutModal({ payout, onClose, onDone }) {
  const [method, setMethod] = useState('Bank Transfer');
  const [busy, setBusy]     = useState(false);
  const submit = async () => {
    setBusy(true);
    await markPayoutPaid(payout.id, method);
    onDone(`₹${payout.amount.toLocaleString('en-IN')} paid to ${payout.doctor_name}`);
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="font-display text-lg text-slate-900">Process Payout</h3>
          <p className="text-sm text-slate-400 mt-0.5">{payout.doctor_name}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-brand-50 rounded-xl px-5 py-4 text-center">
            <div className="text-3xl font-display text-brand-700">₹{payout.amount.toLocaleString('en-IN')}</div>
            <div className="text-xs text-brand-400 mt-1">{payout.period_start ? `${payout.period_start} – ${payout.period_end}` : payout.period || '—'}</div>
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
              {['Bank Transfer','Cash','Cheque','UPI'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={submit} disabled={busy} className="btn-primary flex-1">
              {busy ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto" /> : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Payments Module ─────────────────────────────────────────────────────
export default function PaymentsModule({ role = 'admin', patientId }) {
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts]   = useState([]);
  const [summary, setSummary]   = useState(null);
  const [busy, setBusy]         = useState(true);
  const [tab, setTab]           = useState('transactions');
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter]     = useState('all');
  const [selectedPayout, setSelectedPayout] = useState(null);
  const { show, ToastEl }       = useToast();

  const isPatient = role === 'patient';

  const load = useCallback(async () => {
    setBusy(true);
    const [p, po, s] = await Promise.all([getAllPayments(), getDoctorPayouts(), getPaymentSummary()]);
    setPayments(p); setPayouts(po); setSummary(s);
    setBusy(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    await approvePayment(id);
    show('Payment approved');
    load();
  };

  const handlePayoutDone = (msg) => { setSelectedPayout(null); show(msg); load(); };

  const filtered = payments.filter((p) => {
    // Patient only sees their own payments
    if (isPatient && patientId && p.patientId !== patientId) return false;
    const matchSearch = !search ||
      p.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.doctor_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.transaction_id || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (p.status === statusFilter || p.status?.toUpperCase() === statusFilter?.toUpperCase());
    const matchType   = typeFilter   === 'all' || p.type   === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-6 page-enter">
      {ToastEl}

      <PageHeader title="Payments & Billing" subtitle="Transaction history, bank approvals, and doctor payouts" />

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue',      value: `₹${((summary.total_revenue || summary.totalRevenue || 0) / 1000).toFixed(0)}K`,    icon: 'chart',   bg: 'bg-teal-50',   ic: 'text-teal-500'  },
            { label: 'Pending Payments',   value: `₹${((summary.pending_amount || summary.pendingAmount || 0) / 1000).toFixed(0)}K`,  icon: 'bell',    bg: 'bg-amber-50',  ic: 'text-amber-500' },
            { label: 'Doctor Payouts Due', value: `₹${((summary.pending_payouts || summary.pendingPayouts || 0) / 1000).toFixed(0)}K`,icon: 'payment', bg: 'bg-red-50',    ic: 'text-red-500'   },
            { label: 'Total Transactions', value: summary.total_transactions || summary.totalTransactions || 0,                        icon: 'lab',     bg: 'bg-slate-100', ic: 'text-slate-500' },
          ].map(({ label, value, icon, bg, ic }) => (
            <div key={label} className="card flex items-center gap-4 !py-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon name={icon} className={`w-5 h-5 ${ic}`} />
              </div>
              <div>
                <div className="text-xs text-slate-500">{label}</div>
                <div className="text-xl font-display text-slate-900">{value}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-100">
        {[['transactions','payment','Transactions'],['payouts','doctor','Doctor Payouts']].filter(([k]) => !(isPatient && k === 'payouts')).map(([k, icon, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === k ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name={icon} className="w-4 h-4" />
            {label}
            {k === 'payouts' && payouts.filter((p) => (p.status === 'PENDING' || p.status === 'pending')).length > 0 && (
              <span className="badge badge-amber ml-1">{payouts.filter((p) => p.status === 'pending').length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Transactions */}
      {tab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by patient, txn ID…" className="sm:w-72" />
            <FilterTab value={statusFilter} onChange={setStatusFilter} options={['all','paid','pending']} />
            <FilterTab value={typeFilter} onChange={setTypeFilter} options={[{ label: 'All Types', value: 'all' },{ label: 'Appointment', value: 'appointment' },{ label: 'Ambulance', value: 'ambulance' }]} />
          </div>

          <div className="card !p-0">
            {filtered.length === 0 ? (
              <EmptyState icon="payment" title="No transactions found" desc="Adjust your filters to see payments." />
            ) : (
              <div className="table-wrapper border-0">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Payment #</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>For</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Tax</th>
                      <th>Discount</th>
                      <th>Hosp. Share</th>
                      <th>Dr. Share</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id}>
                        <td className="text-xs font-mono text-slate-400">{p.payment_number || p.transaction_id || `#${p.id}`}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Avatar name={p.patient_name} size="xs" />
                            <span className="text-xs font-medium text-slate-800">{p.patient_name || '—'}</span>
                          </div>
                        </td>
                        <td className="text-xs text-slate-500">{p.doctor_name || '—'}</td>
                        <td><span className={`badge ${(p.type === 'ambulance' || p.ambulance_trip_id !== null) ? 'badge-purple' : 'badge-slate'}`}>{p.type || (p.ambulance_trip_id ? 'Ambulance' : p.appointment_id ? 'Appointment' : 'Other')}</span></td>
                        <td className="text-xs text-slate-600">{p.payment_method}</td>
                        <td className="text-sm font-semibold text-slate-800">₹{p.amount.toLocaleString('en-IN')}</td>
                        <td className="text-xs text-slate-500">₹{p.tax_amount ?? 0}</td>
                        <td className="text-xs text-slate-500">₹{p.discount_amount ?? 0}</td>
                        <td className="text-xs text-slate-500">₹{p.hospital_share ?? 0}</td>
                        <td className="text-xs text-slate-500">₹{p.doctor_share ?? 0}</td>
                        <td className="text-xs text-slate-500">{p.payment_date?.split(' ')[0] || p.payment_date || '—'}</td>
                        <td>
                          <span className={`badge ${(p.status === 'SUCCESS' || p.status === 'PAID' || p.status === 'paid') ? 'badge-green' : p.status === 'FAILED' ? 'badge-red' : p.status === 'REFUNDED' ? 'badge-purple' : 'badge-amber'}`}>
                            {p.status === 'SUCCESS' || p.status === 'PAID' || p.status === 'paid' ? 'Success' : p.status === 'FAILED' ? 'Failed' : p.status === 'REFUNDED' ? 'Refunded' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          {!isPatient && (p.status === 'PENDING' || p.status === 'pending') && (
                            <button onClick={() => handleApprove(p.id)} className="text-teal-600 hover:text-teal-800 text-xs font-medium">
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payouts */}
      {tab === 'payouts' && (
        <div className="card !p-0">
          <div className="table-wrapper border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payout #</th>
                  <th>Doctor</th>
                  <th>Period</th>
                  <th>Consults</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Transaction Ref</th>
                  <th>Paid At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="text-xs font-mono text-slate-400">{p.payout_number || `#${p.id}`}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={p.doctor_name} size="xs" />
                        <div>
                          <div className="text-sm font-medium text-slate-800">{p.doctor_name}</div>
                          <div className="text-xs text-slate-400">{p.specialization || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-slate-500">{p.period_start ? `${p.period_start} – ${p.period_end}` : p.period || '—'}</td>
                    <td className="text-xs font-semibold text-slate-700">{p.consultation_count ?? '—'}</td>
                    <td className="text-sm font-semibold text-slate-800">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="text-xs text-slate-500">{p.payment_method || '—'}</td>
                    <td className="text-xs font-mono text-slate-400">{p.transaction_reference || '—'}</td>
                    <td className="text-xs text-slate-500">{p.paid_at?.split(' ')[0] || p.payment_date?.split(' ')[0] || '—'}</td>
                    <td>
                      <span className={`badge ${(p.status === 'PAID' || p.status === 'paid') ? 'badge-green' : (p.status === 'PROCESSED') ? 'badge-blue' : (p.status === 'CANCELLED') ? 'badge-red' : 'badge-amber'}`}>
                        {p.status === 'PAID' || p.status === 'paid' ? 'Paid' : p.status === 'PROCESSED' ? 'Processed' : p.status === 'CANCELLED' ? 'Cancelled' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {(p.status === 'PENDING' || p.status === 'pending') && (
                        <button onClick={() => setSelectedPayout(p)} className="text-brand-600 hover:text-brand-800 text-xs font-medium">
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPayout && <PayoutModal payout={selectedPayout} onClose={() => setSelectedPayout(null)} onDone={handlePayoutDone} />}
    </div>
  );
}
