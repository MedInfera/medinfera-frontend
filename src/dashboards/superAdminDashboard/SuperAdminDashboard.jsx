import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';
import Icon from '../../components/common/Icon';
import { PageSpinner } from '../../components/common/Spinner';
import { PageHeader, SearchBar, FilterTab, FormModal, Field, useToast, EmptyState } from '../../modules/shared';
import {
  getHospitals, getPlatformStats, createHospital, updateHospital,
  toggleHospitalStatus, SUBSCRIPTION_PLANS,
} from '../../services/superAdminService';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import ProfileModule from '../../modules/profile/ProfileModule';

const NAV = [
  {
    title: 'Platform',
    items: [
      { to: '/superadmin',            icon: 'home',     label: 'Overview'        },
      { to: '/superadmin/hospitals',  icon: 'hospital', label: 'Hospitals'       },
      { to: '/superadmin/analytics',  icon: 'chart',    label: 'Analytics'       },
    ],
  },
  {
    title: 'Management',
    items: [
      { to: '/superadmin/plans',      icon: 'star',     label: 'Subscription Plans' },
      { to: '/superadmin/audit',      icon: 'lab',      label: 'Audit Logs'      },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/superadmin/profile',    icon: 'settings', label: 'My Profile'      },
    ],
  },
];

// ─── Hospital Form ─────────────────────────────────────────────────────────────
function HospitalForm({ initial, onClose, onSaved }) {
  const editing = !!initial;
  const blank = {
    name: '', email: '', phone: '', address: '', city: '', state: '', zip_code: '',
    admin_name: '', admin_email: '', subscription_plan: 'Professional',
  };
  const [form, setForm] = useState(initial ? { ...initial } : blank);
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.email || !form.admin_name) {
      setErr('Hospital name, email, and admin name are required.'); return;
    }
    setErr(''); setBusy(true);
    try {
      if (editing) await updateHospital(initial.id, form);
      else await createHospital(form);
      onSaved(editing ? 'Hospital updated successfully' : 'Hospital registered successfully');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <FormModal title={editing ? 'Edit Hospital' : 'Register New Hospital'} onClose={onClose} onSubmit={submit} loading={busy} wide submitLabel={editing ? 'Save Changes' : 'Register Hospital'}>
      <div className="space-y-5">
        {err && <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">{err}</div>}

        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Hospital Information</div>
          <div className="space-y-4">
            <Field label="Hospital Name" required>
              <input className="input" value={form.name} onChange={set('name')} placeholder="e.g. City General Hospital" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Official Email" required>
                <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="info@hospital.com" />
              </Field>
              <Field label="Phone Number">
                <input className="input" value={form.phone} onChange={set('phone')} placeholder="+91 11-0000-0000" />
              </Field>
            </div>
            <Field label="Street Address">
              <input className="input" value={form.address} onChange={set('address')} placeholder="Street address" />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="City"><input className="input" value={form.city} onChange={set('city')} placeholder="City" /></Field>
              <Field label="State"><input className="input" value={form.state} onChange={set('state')} placeholder="State" /></Field>
              <Field label="ZIP Code"><input className="input" value={form.zip_code} onChange={set('zip_code')} placeholder="000000" /></Field>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Hospital Administrator</div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Admin Full Name" required>
              <input className="input" value={form.admin_name} onChange={set('admin_name')} placeholder="Full name" />
            </Field>
            <Field label="Admin Email" required>
              <input type="email" className="input" value={form.admin_email} onChange={set('admin_email')} placeholder="admin@hospital.com" />
            </Field>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Subscription</div>
          <Field label="Subscription Plan">
            <select className="input" value={form.subscription_plan} onChange={set('subscription_plan')}>
              {SUBSCRIPTION_PLANS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
        </div>
      </div>
    </FormModal>
  );
}

// ─── Hospital Card ─────────────────────────────────────────────────────────────
function HospitalCard({ hospital, onEdit, onToggle }) {
  const planColors = { Enterprise: 'badge-purple', Professional: 'badge-blue', Starter: 'badge-slate', Custom: 'badge-amber' };
  return (
    <div className={`card hover:shadow-card-hover transition-all duration-200 animate-slide-up border-l-4 ${hospital.is_active ? 'border-l-teal-400' : 'border-l-slate-300'}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
          <Icon name="hospital" className="w-5 h-5 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-base text-slate-900 leading-tight">{hospital.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">{hospital.city}, {hospital.state}</div>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            <span className={`badge ${planColors[hospital.subscription_plan] || 'badge-slate'}`}>{hospital.subscription_plan}</span>
            <span className={`badge ${hospital.is_active ? 'badge-green' : 'badge-red'}`}>{hospital.is_active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Beds',     value: hospital.beds     },
          { label: 'Doctors',  value: hospital.doctors  },
          { label: 'Staff',    value: hospital.staff    },
          { label: 'Patients', value: hospital.patients_total },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-50 rounded-lg px-2 py-2 text-center">
            <div className="text-lg font-display text-slate-800">{value}</div>
            <div className="text-[10px] text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="text-xs text-slate-500 mb-3">
        <div>Admin: <span className="font-medium text-slate-700">{hospital.admin_name}</span></div>
        <div>Revenue this month: <span className="font-semibold text-teal-700">₹{hospital.monthly_revenue.toLocaleString('en-IN')}</span></div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <button onClick={() => onEdit(hospital)} className="btn-secondary btn-sm flex-1 text-xs">Edit</button>
        <button
          onClick={() => onToggle(hospital.id, hospital.is_active)}
          className={`btn-sm flex-1 text-xs btn ${hospital.is_active ? 'btn-danger' : 'btn-primary'}`}
        >
          {hospital.is_active ? 'Suspend' : 'Activate'}
        </button>
      </div>
    </div>
  );
}

// ─── Overview Home ─────────────────────────────────────────────────────────────
function SuperAdminHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [busy, setBusy]         = useState(true);

  useEffect(() => {
    Promise.all([getPlatformStats(), getHospitals()])
      .then(([s, h]) => { setStats(s); setHospitals(h.slice(0, 4)); })
      .finally(() => setBusy(false));
  }, []);

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl text-slate-900">Platform Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Medinfera Health Platform · {stats.totalHospitals} hospitals registered</p>
        </div>
        <button onClick={() => navigate('/superadmin/hospitals')} className="btn-primary btn-sm gap-1.5">
          <Icon name="plus" className="w-4 h-4" /> Register Hospital
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Hospitals"   value={stats.activeHospitals}   icon="hospital" color="blue"  trend={8}  delay={0}   />
        <StatCard label="Total Doctors"      value={stats.totalDoctors}      icon="doctor"   color="teal"  trend={12} delay={60}  />
        <StatCard label="Total Patients"     value={stats.totalPatients}     icon="users"    color="green" delay={120} />
        <StatCard label="Platform Revenue"   value={`₹${(stats.monthRevenue/100000).toFixed(1)}L`} icon="payment" color="amber" trend={6} delay={180} />
      </div>

      {/* Plan breakdown */}
      <div className="card">
        <h3 className="font-display text-base text-slate-900 mb-4">Subscription Breakdown</h3>
        <div className="grid grid-cols-4 gap-4">
          {stats.planBreakdown.map(({ plan, count }) => {
            const colors = { Enterprise: 'bg-violet-50 text-violet-700', Professional: 'bg-brand-50 text-brand-700', Starter: 'bg-slate-100 text-slate-600', Custom: 'bg-amber-50 text-amber-700' };
            return (
              <div key={plan} className={`${colors[plan] || 'bg-slate-100 text-slate-600'} rounded-xl p-4 text-center`}>
                <div className="text-3xl font-display">{count}</div>
                <div className="text-xs font-medium mt-1">{plan}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent hospitals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base text-slate-900">Registered Hospitals</h3>
          <button onClick={() => navigate('/superadmin/hospitals')} className="text-xs text-brand-600 font-medium hover:underline">View all →</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {hospitals.map((h) => (
            <div key={h.id} className="card flex items-center gap-4">
              <div className={`w-3 h-12 rounded-full flex-shrink-0 ${h.is_active ? 'bg-teal-400' : 'bg-slate-300'}`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 truncate">{h.name}</div>
                <div className="text-xs text-slate-500">{h.city} · {h.doctors} doctors · {h.beds} beds</div>
                <div className="text-xs text-teal-600 font-medium mt-0.5">₹{h.monthly_revenue.toLocaleString('en-IN')}/month</div>
              </div>
              <span className={`badge ${h.is_active ? 'badge-green' : 'badge-red'} flex-shrink-0`}>{h.is_active ? 'Active' : 'Inactive'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Hospitals Page ────────────────────────────────────────────────────────────
function HospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [busy, setBusy]           = useState(true);
  const [search, setSearch]       = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [editing, setEditing]     = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const { show, ToastEl }         = useToast();

  const load = useCallback(async () => { setBusy(true); setHospitals(await getHospitals()); setBusy(false); }, []);
  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id, wasActive) => {
    await toggleHospitalStatus(id);
    show(wasActive ? 'Hospital suspended' : 'Hospital activated', wasActive ? 'warning' : 'success');
    load();
  };

  const handleSaved = (msg) => { setShowForm(false); setEditing(null); show(msg); load(); };

  const filtered = hospitals.filter((h) => {
    const matchSearch = !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase());
    const matchPlan   = planFilter === 'all' || h.subscription_plan === planFilter;
    return matchSearch && matchPlan;
  });

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-5 page-enter">
      {ToastEl}
      <PageHeader
        title="Hospitals"
        subtitle={`${hospitals.length} hospitals registered on the platform`}
        action={<button className="btn-primary btn-sm gap-1.5" onClick={() => { setEditing(null); setShowForm(true); }}><Icon name="plus" className="w-4 h-4"/>Register Hospital</button>}
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or city…" className="sm:w-72" />
        <FilterTab value={planFilter} onChange={setPlanFilter} options={[{ label: 'All Plans', value: 'all' }, ...SUBSCRIPTION_PLANS.map((p) => ({ label: p, value: p }))]} />
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon="hospital" title="No hospitals found" desc="Register the first hospital to get started." />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((h) => (
            <HospitalCard key={h.id} hospital={h} onEdit={(h) => { setEditing(h); setShowForm(true); }} onToggle={handleToggle} />
          ))}
        </div>
      )}
      {showForm && <HospitalForm initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={handleSaved} />}
    </div>
  );
}


// ─── Platform Analytics Page ──────────────────────────────────────────────────
function PlatformAnalyticsPage() {
  const [stats, setStats]       = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [busy, setBusy]         = useState(true);

  useEffect(() => {
    Promise.all([getPlatformStats(), getHospitals()])
      .then(([s, h]) => { setStats(s); setHospitals(h); })
      .finally(() => setBusy(false));
  }, []);

  if (busy) return <PageSpinner />;

  const activeHospitals = hospitals.filter((h) => h.is_active);
  const maxRevenue = Math.max(...activeHospitals.map((h) => h.monthly_revenue), 1);

  return (
    <div className="space-y-6 page-enter">
      <PageHeader title="Platform Analytics" subtitle="Cross-hospital performance metrics" />

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Hospitals',   value: stats.totalHospitals,    color: 'text-slate-700',   bg: 'bg-slate-100'  },
          { label: 'Active Hospitals',  value: stats.activeHospitals,   color: 'text-teal-700',    bg: 'bg-teal-50'    },
          { label: 'Total Doctors',     value: stats.totalDoctors,      color: 'text-brand-700',   bg: 'bg-brand-50'   },
          { label: 'Total Patients',    value: stats.totalPatients.toLocaleString('en-IN'), color: 'text-violet-700', bg: 'bg-violet-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl px-5 py-4 animate-slide-up`}>
            <div className={`text-3xl font-display ${color}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by Hospital */}
        <div className="card animate-slide-up">
          <h3 className="font-display text-base text-slate-900 mb-5">Monthly Revenue by Hospital</h3>
          <div className="space-y-4">
            {activeHospitals.map((h) => {
              const pct = Math.round((h.monthly_revenue / maxRevenue) * 100);
              return (
                <div key={h.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700 truncate max-w-[60%]">{h.name}</span>
                    <span className="font-semibold text-teal-700 flex-shrink-0">₹{(h.monthly_revenue/1000).toFixed(0)}K</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{h.appointments_this_month} appointments · {h.city}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hospital comparison table */}
        <div className="card animate-slide-up stagger-2">
          <h3 className="font-display text-base text-slate-900 mb-4">Hospital Comparison</h3>
          <div className="space-y-3">
            {hospitals.map((h) => (
              <div key={h.id} className={`flex items-center gap-3 p-3 rounded-xl border ${h.is_active ? 'border-slate-100 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                <div className={`w-2 h-10 rounded-full flex-shrink-0 ${h.is_active ? 'bg-teal-400' : 'bg-slate-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{h.name}</div>
                  <div className="text-xs text-slate-400">{h.city} · {h.subscription_plan}</div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center flex-shrink-0">
                  {[
                    { v: h.doctors,  l: 'Docs'  },
                    { v: h.beds,     l: 'Beds'   },
                    { v: h.patients_total, l: 'Pts' },
                  ].map(({ v, l }) => (
                    <div key={l}>
                      <div className="text-sm font-semibold text-slate-700">{v}</div>
                      <div className="text-[10px] text-slate-400">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan distribution */}
      <div className="card animate-slide-up stagger-3">
        <h3 className="font-display text-base text-slate-900 mb-4">Subscription Plan Distribution</h3>
        <div className="grid grid-cols-4 gap-4">
          {stats.planBreakdown.map(({ plan, count }) => {
            const pct = stats.totalHospitals > 0 ? Math.round((count / stats.totalHospitals) * 100) : 0;
            const colors = { Enterprise: 'bg-violet-100 text-violet-700', Professional: 'bg-brand-100 text-brand-700', Starter: 'bg-slate-100 text-slate-600', Custom: 'bg-amber-100 text-amber-700' };
            return (
              <div key={plan} className={`${colors[plan] || 'bg-slate-100 text-slate-600'} rounded-2xl p-5 text-center`}>
                <div className="text-4xl font-display mb-1">{count}</div>
                <div className="text-xs font-semibold mb-0.5">{plan}</div>
                <div className="text-[11px] opacity-70">{pct}% of total</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Subscription Plans Page ──────────────────────────────────────────────────
function SubscriptionPlansPage() {
  const { show, ToastEl } = useToast();

  const PLANS = [
    {
      name: 'Starter', price: 9999, cycle: 'per month',
      color: 'border-slate-200', headerBg: 'bg-slate-50', headerText: 'text-slate-700',
      features: ['Up to 50 beds', 'Up to 5 doctors', 'Appointments & Prescriptions', 'Basic Reports', 'Email Support'],
      hospitals: 1,
    },
    {
      name: 'Professional', price: 24999, cycle: 'per month',
      color: 'border-brand-300', headerBg: 'bg-brand-600', headerText: 'text-white',
      badge: 'Most Popular',
      features: ['Up to 120 beds', 'Up to 20 doctors', 'Appointments, Prescriptions & Pharmacy', 'Ambulance Module', 'Advanced Reports', 'Priority Support', 'Multi-language'],
      hospitals: 2,
    },
    {
      name: 'Enterprise', price: 59999, cycle: 'per month',
      color: 'border-violet-300', headerBg: 'bg-violet-600', headerText: 'text-white',
      features: ['Unlimited beds', 'Unlimited doctors', 'All modules included', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee', 'API access'],
      hospitals: 1,
    },
    {
      name: 'Custom', price: null, cycle: 'contact us',
      color: 'border-amber-200', headerBg: 'bg-amber-50', headerText: 'text-amber-700',
      features: ['Tailored to your needs', 'White-label option', 'Custom SLA', 'On-premise deployment', 'Training & onboarding'],
      hospitals: 0,
    },
  ];

  return (
    <div className="space-y-6 page-enter">
      {ToastEl}
      <PageHeader title="Subscription Plans" subtitle="Manage and configure platform subscription tiers" />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {PLANS.map((plan) => (
          <div key={plan.name} className={`rounded-2xl border-2 ${plan.color} overflow-hidden flex flex-col`}>
            <div className={`${plan.headerBg} px-5 py-5`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className={`font-display text-lg ${plan.headerText}`}>{plan.name}</h3>
                {plan.badge && <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">{plan.badge}</span>}
              </div>
              {plan.price ? (
                <div className={plan.headerText}>
                  <span className="text-3xl font-display">₹{(plan.price/1000).toFixed(0)}K</span>
                  <span className="text-sm opacity-70"> /{plan.cycle}</span>
                </div>
              ) : (
                <div className={`text-lg font-semibold ${plan.headerText}`}>Custom Pricing</div>
              )}
              <div className="text-xs opacity-70 mt-1">{plan.hospitals} hospital{plan.hospitals !== 1 ? 's' : ''} on this plan</div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Icon name="check" className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => show(`${plan.name} plan configuration saved`, 'success')}
                className="mt-5 btn-secondary w-full text-sm py-2.5"
              >
                Edit Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Plan settings */}
      <div className="card animate-slide-up">
        <h3 className="font-display text-base text-slate-900 mb-5">Plan Configuration</h3>
        <div className="grid grid-cols-2 gap-6">
          {[
            { label: 'Trial Period', value: '14', unit: 'days' },
            { label: 'Grace Period (post-expiry)', value: '7', unit: 'days' },
            { label: 'Max hospitals per plan', value: '—', unit: '' },
            { label: 'Annual discount', value: '15', unit: '%' },
          ].map(({ label, value, unit }) => (
            <div key={label} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-600">{label}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">{value}</span>
                {unit && <span className="text-xs text-slate-400">{unit}</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-5">
          <button onClick={() => show('Platform settings saved')} className="btn-primary btn-sm">Save Configuration</button>
        </div>
      </div>
    </div>
  );
}

// ─── Audit Logs Page ───────────────────────────────────────────────────────────
function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const AUDIT_LOGS = [
    { id: 1,  hospital: 'Medinfera General Hospital', user: 'Rajesh Kumar',  action: 'HOSPITAL_UPDATED',      entity: 'Hospital',     entityId: 1,  timestamp: '2026-03-20 14:32:11', ip: '192.168.1.101', severity: 'info'    },
    { id: 2,  hospital: 'Medinfera General Hospital', user: 'Dr. Priya Sharma',action:'PRESCRIPTION_CREATED',entity: 'Prescription',  entityId: 3,  timestamp: '2026-03-20 13:18:45', ip: '192.168.1.105', severity: 'info'    },
    { id: 3,  hospital: 'City Care Hospital',         user: 'Pooja Rao',      action: 'DOCTOR_REGISTERED',    entity: 'Doctor',       entityId: 12, timestamp: '2026-03-20 11:55:22', ip: '10.0.0.55',     severity: 'info'    },
    { id: 4,  hospital: 'Medinfera General Hospital', user: 'Rajesh Kumar',  action: 'SETTINGS_CHANGED',      entity: 'Settings',     entityId: 1,  timestamp: '2026-03-19 17:40:09', ip: '192.168.1.101', severity: 'warning' },
    { id: 5,  hospital: 'Apollo Lifeline Clinic',     user: 'Vikram Desai',  action: 'PLAN_UPGRADED',         entity: 'Subscription', entityId: 3,  timestamp: '2026-03-19 10:22:33', ip: '203.0.113.42',  severity: 'info'    },
    { id: 6,  hospital: 'Medinfera General Hospital', user: 'Dinesh Bhatia', action: 'INVENTORY_UPDATED',     entity: 'Inventory',    entityId: 4,  timestamp: '2026-03-19 09:15:58', ip: '192.168.1.110', severity: 'info'    },
    { id: 7,  hospital: 'Medinfera General Hospital', user: 'System',        action: 'LOGIN_FAILED',          entity: 'Auth',         entityId: null,timestamp:'2026-03-18 22:03:17', ip: '198.51.100.88', severity: 'critical'},
    { id: 8,  hospital: 'City Care Hospital',         user: 'Pooja Rao',     action: 'PATIENT_DELETED',       entity: 'Patient',      entityId: 88, timestamp: '2026-03-18 16:48:41', ip: '10.0.0.55',     severity: 'warning' },
    { id: 9,  hospital: 'Medinfera General Hospital', user: 'Kavitha Reddy', action: 'BED_ALLOCATED',         entity: 'Bed',          entityId: 14, timestamp: '2026-03-18 14:11:27', ip: '192.168.1.108', severity: 'info'    },
    { id: 10, hospital: 'Medinfera General Hospital', user: 'Arjun Mehrotra',action: 'HOSPITAL_SUSPENDED',    entity: 'Hospital',     entityId: 4,  timestamp: '2026-03-17 10:05:00', ip: '192.168.1.1',   severity: 'critical'},
  ];

  const SEVERITY_CFG = {
    info:     { badge: 'badge-blue',   label: 'Info'     },
    warning:  { badge: 'badge-amber',  label: 'Warning'  },
    critical: { badge: 'badge-red',    label: 'Critical' },
  };

  const filtered = AUDIT_LOGS.filter((l) => {
    const matchSearch = !search || l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.hospital.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === 'all' || l.severity === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-5 page-enter">
      <PageHeader
        title="Audit Logs"
        subtitle="Platform-wide security and activity log"
        action={
          <button className="btn-secondary btn-sm gap-1.5">
            <Icon name="prescription" className="w-4 h-4" /> Export CSV
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Critical Events', value: AUDIT_LOGS.filter((l) => l.severity === 'critical').length, bg: 'bg-red-50',   text: 'text-red-700'   },
          { label: 'Warnings',        value: AUDIT_LOGS.filter((l) => l.severity === 'warning').length,  bg: 'bg-amber-50', text: 'text-amber-700' },
          { label: 'Total Entries',   value: AUDIT_LOGS.length,                                          bg: 'bg-slate-100',text: 'text-slate-700' },
        ].map(({ label, value, bg, text }) => (
          <div key={label} className={`${bg} rounded-xl px-5 py-4`}>
            <div className={`text-3xl font-display ${text}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search user, action, hospital…" className="max-w-sm" />
        <FilterTab value={typeFilter} onChange={setTypeFilter} options={[{ label: 'All', value: 'all' }, { label: 'Info', value: 'info' }, { label: 'Warning', value: 'warning' }, { label: 'Critical', value: 'critical' }]} />
      </div>

      <div className="card !p-0">
        <div className="table-wrapper border-0">
          <table className="data-table">
            <thead>
              <tr><th>Timestamp</th><th>Hospital</th><th>User</th><th>Action</th><th>Entity</th><th>IP Address</th><th>Severity</th></tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const sc = SEVERITY_CFG[log.severity] || SEVERITY_CFG.info;
                return (
                  <tr key={log.id} className={log.severity === 'critical' ? 'bg-red-50/30' : log.severity === 'warning' ? 'bg-amber-50/20' : ''}>
                    <td className="text-xs font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="text-xs text-slate-600 whitespace-nowrap max-w-[160px] truncate">{log.hospital}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={log.user} size="xs" />
                        <span className="text-xs font-medium text-slate-800">{log.user}</span>
                      </div>
                    </td>
                    <td className="text-xs font-mono text-slate-700 font-semibold">{log.action}</td>
                    <td className="text-xs text-slate-500">{log.entity}{log.entityId ? ` #${log.entityId}` : ''}</td>
                    <td className="text-xs font-mono text-slate-400">{log.ip}</td>
                    <td><span className={`badge ${sc.badge}`}>{sc.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">No audit logs match the current filter.</div>
        )}
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  return (
    <DashboardLayout navGroups={NAV} title="Medinfera Health Platform" subtitle="Super Administrator">
      <Routes>
        <Route index                   element={<SuperAdminHome />} />
        <Route path="hospitals"        element={<HospitalsPage />} />
        <Route path="analytics"        element={<PlatformAnalyticsPage />} />
        <Route path="plans"            element={<SubscriptionPlansPage />} />
        <Route path="audit"            element={<AuditLogsPage />} />
        <Route path="profile"          element={<ProfileModule />} />
        <Route path="*"                element={<SuperAdminHome />} />
      </Routes>
    </DashboardLayout>
  );
}
