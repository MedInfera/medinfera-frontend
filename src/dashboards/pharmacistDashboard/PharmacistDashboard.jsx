import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Icon from '../../components/common/Icon';
import Avatar from '../../components/common/Avatar';
import { PageSpinner } from '../../components/common/Spinner';
import { PageHeader, SearchBar, FilterTab, FormModal, Field, useToast, EmptyState } from '../../modules/shared';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import {
  getAllPharmacists, getInventory, getDispensingLog, getPharmacyStats,
  createPharmacist, fullName as pharmacistFullName, INVENTORY_STATUSES,
} from '../../services/pharmacistService';
import ProfileModule from '../../modules/profile/ProfileModule';
import MedicineDatabaseModule from '../../modules/medicineDatabase/MedicineDatabaseModule';
import SuppliersModule        from '../../modules/suppliers/SuppliersModule';

const NAV = [
  {
    title: 'Pharmacy',
    items: [
      { to: '/pharmacist',            icon: 'home',         label: 'Dashboard'       },
      { to: '/pharmacist/inventory',  icon: 'lab',          label: 'Inventory'       },
      { to: '/pharmacist/dispensing', icon: 'prescription', label: 'Dispensing Log'  },
      { to: '/pharmacist/medicines',  icon: 'search',       label: 'Medicine DB'     },
      { to: '/pharmacist/suppliers',  icon: 'prescription', label: 'Procurement'     },
    ],
  },
  {
    title: 'Team',
    items: [
      { to: '/pharmacist/team',       icon: 'users',        label: 'Pharmacists'     },
      { to: '/pharmacist/register',   icon: 'plus',         label: 'Register Pharmacist' },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/pharmacist/profile',    icon: 'settings',     label: 'My Profile'      },
    ],
  },
];

const INVENTORY_STATUS_CFG = {
  'in-stock':      { badge: 'badge-green',  label: 'In Stock'       },
  'low-stock':     { badge: 'badge-amber',  label: 'Low Stock'      },
  'critical':      { badge: 'badge-red',    label: 'Critical'       },
  'out-of-stock':  { badge: 'badge-red',    label: 'Out of Stock'   },
  'expiring-soon': { badge: 'badge-purple', label: 'Expiring Soon'  },
};

// ─── Pharmacist Registration Form — aligned to users table only ─────────────────
// Schema: NO separate pharmacists table. Pharmacists = users with role_id.
// REMOVED non-schema fields: address, aadhaar_number, salary, joining_date,
//   shift, pharmacy_name, license_number, license_expiry, qualification,
//   experience_years, department
// ADDED schema fields: first_name, last_name, alternate_phone,
//   profile_photo, preferred_language
function PharmacistRegistrationForm({ initial, onClose, onSaved }) {
  const editing = !!initial;

  const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil'   }, { value: 'te', label: 'Telugu' },
    { value: 'bn', label: 'Bengali' }, { value: 'mr', label: 'Marathi' },
  ];

  const toForm = (p) => ({
    first_name:         p.first_name         || '',
    last_name:          p.last_name          || '',
    email:              p.email              || '',
    phone:              p.phone              || '',
    alternate_phone:    p.alternate_phone    || '',
    profile_photo:      p.profile_photo      || null,
    preferred_language: p.preferred_language || 'en',
    designation:        p.designation        || 'Pharmacist',
  });

  const blank = {
    first_name: '', last_name: '', email: '', phone: '',
    alternate_phone: '', profile_photo: null,
    preferred_language: 'en', designation: 'Pharmacist',
  };

  const [form, setForm] = useState(editing ? toForm(initial) : blank);
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.first_name || !form.phone) {
      setErr('First name and phone number are required.'); return;
    }
    setErr(''); setBusy(true);
    try {
      await createPharmacist(form);
      onSaved(editing ? 'Pharmacist record updated' : 'Pharmacist registered successfully');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <FormModal
      title={editing ? 'Edit Pharmacist' : 'Register New Pharmacist'}
      onClose={onClose} onSubmit={submit} loading={busy} wide
      submitLabel={editing ? 'Save Changes' : 'Register Pharmacist'}
    >
      <div className="space-y-5">
        {err && <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">{err}</div>}

        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">
            Personal Information <span className="text-slate-300 font-normal">(users table)</span>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required hint="users.first_name">
                <input className="input" value={form.first_name} onChange={set('first_name')} placeholder="First name" />
              </Field>
              <Field label="Last Name" hint="users.last_name">
                <input className="input" value={form.last_name} onChange={set('last_name')} placeholder="Last name" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email Address" hint="users.email">
                <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="pharmacist@hospital.com" />
              </Field>
              <Field label="Phone Number" required hint="users.phone NOT NULL">
                <input className="input" value={form.phone} onChange={set('phone')} placeholder="+91 98120 00000" />
              </Field>
            </div>
            <Field label="Alternate Phone" hint="users.alternate_phone">
              <input className="input" value={form.alternate_phone} onChange={set('alternate_phone')} placeholder="+91 98120 00000 (optional)" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Preferred Language" hint="users.preferred_language DEFAULT 'en'">
                <select className="input" value={form.preferred_language} onChange={set('preferred_language')}>
                  {LANGUAGE_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </Field>
              <Field label="Designation" hint="Display label only — not a DB column">
                <input className="input" value={form.designation} onChange={set('designation')} placeholder="e.g. Chief Pharmacist" />
              </Field>
            </div>
            <div>
              <label className="label">Profile Photo <span className="text-slate-400 font-normal">(users.profile_photo)</span></label>
              <input
                type="file"
                accept="image/*"
                className="input text-sm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setForm((f) => ({ ...f, profile_photo: ev.target.result }));
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <p className="text-xs text-slate-400 mt-1">Stored as users.profile_photo (text/URL)</p>
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
}

// ─── Inventory Page ────────────────────────────────────────────────────────────
function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [busy, setBusy]           = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { show, ToastEl }         = useToast();

  const load = useCallback(async () => { setBusy(true); setInventory(await getInventory()); setBusy(false); }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = inventory.filter((i) => {
    const matchSearch = !search || i.medicine_name.toLowerCase().includes(search.toLowerCase()) || i.batch_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-5 page-enter">
      {ToastEl}
      <PageHeader title="Pharmacy Inventory" subtitle={`${inventory.length} medicine batches in stock`} />
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search medicine or batch…" className="sm:w-72" />
        <FilterTab value={statusFilter} onChange={setStatusFilter} options={[{ label: 'All Statuses', value: 'all' }, ...INVENTORY_STATUSES.map((s) => ({ label: INVENTORY_STATUS_CFG[s].label, value: s }))]} />
      </div>
      <div className="card !p-0">
        <div className="table-wrapper border-0">
          <table className="data-table">
            <thead><tr><th>Batch #</th><th>Medicine</th><th>Qty Available</th><th>Qty Total</th><th>Expiry</th><th>Selling Price</th><th>Supplier</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((item) => {
                const cfg = INVENTORY_STATUS_CFG[item.status] || { badge: 'badge-slate', label: item.status };
                const pct = Math.round((item.quantity_available / item.quantity_total) * 100);
                return (
                  <tr key={item.id}>
                    <td className="text-xs font-mono text-slate-400">{item.batch_number}</td>
                    <td className="text-sm font-medium text-slate-800">{item.medicine_name}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full">
                          <div className={`h-full rounded-full ${pct <= 10 ? 'bg-red-400' : pct <= 25 ? 'bg-amber-400' : 'bg-teal-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{item.quantity_available}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-500">{item.quantity_total}</td>
                    <td className="text-xs text-slate-500">{item.expiry_date}</td>
                    <td className="text-sm font-semibold text-slate-700">₹{item.selling_price}</td>
                    <td className="text-xs text-slate-500">{item.supplier}</td>
                    <td><span className={`badge ${cfg.badge}`}>{cfg.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Dispensing Log Page ───────────────────────────────────────────────────────
function DispensingLogPage() {
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(true);
  useEffect(() => { getDispensingLog().then(setLog).finally(() => setBusy(false)); }, []);
  if (busy) return <PageSpinner />;
  return (
    <div className="space-y-5 page-enter">
      <PageHeader title="Dispensing Log" subtitle="All medicine dispensing records" />
      <div className="card !p-0">
        <div className="table-wrapper border-0">
          <table className="data-table">
            <thead><tr><th>Rx ID</th><th>Patient</th><th>Medicine</th><th>Qty</th><th>Dispensed By</th><th>Date</th><th>Amount</th></tr></thead>
            <tbody>
              {log.map((l) => (
                <tr key={l.id}>
                  <td className="text-xs font-mono text-slate-400">{l.prescription_id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={l.patient_name} size="xs" />
                      <span className="text-sm font-medium text-slate-800">{l.patient_name}</span>
                    </div>
                  </td>
                  <td className="text-xs text-slate-700">{l.medicine}</td>
                  <td className="text-sm font-semibold text-slate-700">{l.quantity}</td>
                  <td className="text-xs text-slate-500">{l.dispensed_by}</td>
                  <td className="text-xs text-slate-500">{l.date}</td>
                  <td className="text-sm font-semibold text-teal-700">₹{l.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Pharmacist Team Page ──────────────────────────────────────────────────────
function PharmacistTeamPage({ openForm = false }) {
  const [team, setTeam]   = useState([]);
  const [busy, setBusy]   = useState(true);
  const [showForm, setShowForm] = useState(openForm);
  const { show, ToastEl } = useToast();
  const load = useCallback(async () => { setBusy(true); setTeam(await getAllPharmacists()); setBusy(false); }, []);
  useEffect(() => { load(); }, [load]);
  if (busy) return <PageSpinner />;
  return (
    <div className="space-y-5 page-enter">
      {ToastEl}
      <PageHeader title="Pharmacist Team" subtitle={`${team.length} registered pharmacists`} action={<button className="btn-primary btn-sm gap-1.5" onClick={() => setShowForm(true)}><Icon name="plus" className="w-4 h-4"/>Register Pharmacist</button>} />
      <div className="card !p-0">
        <div className="table-wrapper border-0">
          <table className="data-table">
            <thead>
                <tr>
                  <th>Pharmacist</th><th>Email</th><th>Phone</th>
                  <th>Alt. Phone</th><th>Language</th><th>Status</th>
                </tr>
              </thead>
            <tbody>
              {team.map((p) => {
                const name = p.name || pharmacistFullName(p);
                return (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={name} size="sm" />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{name}</div>
                        <div className="text-xs text-slate-400">{p.designation || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-xs text-slate-500">{p.email || '—'}</td>
                  <td className="text-xs font-mono text-slate-500">{p.phone}</td>
                  <td className="text-xs text-slate-400">{p.alternate_phone || '—'}</td>
                  <td className="text-xs text-slate-400 uppercase">{p.preferred_language || 'en'}</td>
                  <td><span className={`badge ${p.is_active !== false ? 'badge-green' : 'badge-slate'}`}>{p.is_active !== false ? 'Active' : 'Inactive'}</span></td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showForm && <PharmacistRegistrationForm onClose={() => setShowForm(false)} onSaved={(msg) => { setShowForm(false); show(msg); load(); }} />}
    </div>
  );
}

// ─── Pharmacist Home ───────────────────────────────────────────────────────────
function PharmacistHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [busy, setBusy]   = useState(true);
  useEffect(() => { getPharmacyStats().then(setStats).finally(() => setBusy(false)); }, []);
  if (busy) return <PageSpinner />;
  return (
    <div className="space-y-6 page-enter">
      <div>
        <h2 className="font-display text-2xl text-slate-900">Welcome, {user?.name?.split(' ')[0]}</h2>
        <p className="text-slate-500 text-sm mt-1">{user?.designation || 'Pharmacist'}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Medicines"   value={stats.totalMedicines}  icon="lab"         color="blue"   delay={0}  />
        <StatCard label="Low / Critical"    value={stats.lowStock + stats.critical} icon="bell" color="amber" delay={60} />
        <StatCard label="Today Dispensed"   value={stats.todayDispensed}  icon="prescription" color="teal"  delay={120}/>
        <StatCard label="Month Revenue"     value={`₹${(stats.monthRevenue/1000).toFixed(1)}K`} icon="payment" color="green" delay={180}/>
      </div>

      {(stats.lowStock + stats.critical + stats.outOfStock + stats.expiringSoon) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Icon name="bell" className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-amber-800">Inventory Alerts</span>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            {[
              { label: 'Low Stock',     value: stats.lowStock,    color: 'text-amber-700' },
              { label: 'Critical',      value: stats.critical,    color: 'text-red-600'   },
              { label: 'Out of Stock',  value: stats.outOfStock,  color: 'text-red-700'   },
              { label: 'Expiring Soon', value: stats.expiringSoon,color: 'text-purple-700'},
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl py-2 px-3">
                <div className={`text-xl font-display ${color}`}>{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'View Inventory',     icon: 'lab',         to: '/pharmacist/inventory',  color: 'bg-brand-50 text-brand-700'   },
          { label: 'Dispensing Log',     icon: 'prescription',to: '/pharmacist/dispensing', color: 'bg-teal-50 text-teal-700'     },
          { label: 'Medicine Database',  icon: 'search',      to: '/pharmacist/medicines',  color: 'bg-violet-50 text-violet-700' },
          { label: 'Register Pharmacist',icon: 'plus',        to: '/pharmacist/register',   color: 'bg-amber-50 text-amber-700'   },
        ].map(({ label, icon, to, color }) => (
          <button key={label} onClick={() => navigate(to)} className={`${color} rounded-xl p-5 text-left hover:opacity-80 transition-opacity`}>
            <Icon name={icon} className="w-6 h-6 mb-2" />
            <div className="font-semibold text-sm">{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PharmacistDashboard() {
  const { user } = useAuth();
  return (
    <DashboardLayout navGroups={NAV} title={user?.name || 'Pharmacy Portal'} subtitle={user?.designation}>
      <Routes>
        <Route index               element={<PharmacistHome />} />
        <Route path="inventory"    element={<InventoryPage />} />
        <Route path="dispensing"   element={<DispensingLogPage />} />
        <Route path="medicines"    element={<MedicineDatabaseModule />} />
        <Route path="team"         element={<PharmacistTeamPage />} />
        <Route path="register"     element={<PharmacistTeamPage openForm />} />
        <Route path="profile"      element={<ProfileModule />} />
        <Route path="suppliers"    element={<SuppliersModule />} />
        <Route path="*"            element={<PharmacistHome />} />
      </Routes>
    </DashboardLayout>
  );
}
