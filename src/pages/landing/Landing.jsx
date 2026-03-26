import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import Icon from '../../components/common/Icon';

const FEATURES = [
  { icon: 'calendar',     title: 'Appointment Management',  desc: 'Online & offline booking with slot management, doctor scheduling, and Zoom telemedicine integration.' },
  { icon: 'prescription', title: 'e-Prescription System',   desc: 'Digital prescriptions with medicine database, dosage templates, allergy alerts, and QR verification.' },
  { icon: 'bed',          title: 'Bed & Ward Management',   desc: 'Live IPD occupancy — Buildings → Floors → Wards → Beds with real-time allocation and discharge workflow.' },
  { icon: 'ambulance',    title: 'Ambulance Dispatch',      desc: 'Fleet management, driver assignment, trip tracking, and automatic billing per kilometer.' },
  { icon: 'lab',          title: 'Pharmacy & Inventory',    desc: 'Batch-level stock tracking, expiry alerts, supplier management, and dispensing logs.' },
  { icon: 'chart',        title: 'Reports & Analytics',     desc: 'Hospital revenue, doctor performance, bed occupancy trends, and patient growth dashboards.' },
];

const STATS = [
  { value: '50+',   label: 'Hospitals' },
  { value: '1.2L+', label: 'Patients Served' },
  { value: '800+',  label: 'Doctors' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const ROLE_ENTRIES = [
  { role: 'superadmin', label: 'Super Admin',  color: 'bg-purple-600 hover:bg-purple-700',  icon: 'star',     desc: 'Platform management'  },
  { role: 'admin',      label: 'Hospital Admin',color: 'bg-brand-600 hover:bg-brand-700',   icon: 'settings', desc: 'Hospital operations'  },
  { role: 'doctor',     label: 'Doctor',        color: 'bg-teal-600 hover:bg-teal-700',     icon: 'doctor',   desc: 'Appointments & Rx'    },
  { role: 'staff',      label: 'Staff',          color: 'bg-amber-600 hover:bg-amber-700',   icon: 'users',    desc: 'Ward & desk ops'      },
  { role: 'pharmacist', label: 'Pharmacist',     color: 'bg-orange-600 hover:bg-orange-700', icon: 'lab',      desc: 'Pharmacy & inventory' },
  { role: 'patient',    label: 'Patient',        color: 'bg-slate-700 hover:bg-slate-800',   icon: 'calendar', desc: 'Book & track care'    },
];

const ROLE_HOME = {
  superadmin: '/superadmin', admin: '/admin', doctor: '/doctor',
  staff: '/staff', pharmacist: '/pharmacist', patient: '/patient',
};

const ROLE_CARDS = [
  {
    role: 'admin', title: 'Hospital Admin',
    iconBg: 'bg-brand-600/20', iconCls: 'text-brand-400', icon: 'settings',
    desc: 'Complete operational control of your hospital — staff, appointments, financials, beds, and content.',
    items: ['Doctor & Staff Management', 'Bed & Ward Control', 'Revenue & Payouts', 'CMS & Website Control'],
  },
  {
    role: 'doctor', title: 'Doctor',
    iconBg: 'bg-teal-600/20', iconCls: 'text-teal-400', icon: 'doctor',
    desc: 'Manage your clinical workflow — from appointments to e-prescriptions and telemedicine consultations.',
    items: ["Today's Appointment Schedule", 'e-Prescription Builder', 'Patient Medical History', 'Zoom Video Consultations'],
  },
  {
    role: 'staff', title: 'Staff',
    iconBg: 'bg-amber-600/20', iconCls: 'text-amber-400', icon: 'users',
    desc: 'Support hospital operations — manage appointments, bed allocations, and ambulance dispatch.',
    items: ['Appointment Approvals', 'Bed Allocation & Discharge', 'Ambulance Dispatch', 'Staff Directory'],
  },
  {
    role: 'pharmacist', title: 'Pharmacist',
    iconBg: 'bg-orange-600/20', iconCls: 'text-orange-400', icon: 'lab',
    desc: 'Run the in-house pharmacy — manage inventory, dispensing, and medicine tracking.',
    items: ['Medicine Inventory', 'Dispensing Log', 'Expiry & Stock Alerts', 'Batch Management'],
  },
  {
    role: 'patient', title: 'Patient',
    iconBg: 'bg-violet-600/20', iconCls: 'text-violet-400', icon: 'calendar',
    desc: 'Access your healthcare — book appointments, view prescriptions, and manage your health profile.',
    items: ['Appointment Booking', 'Prescription Access', 'Payment History', 'Health Profile'],
  },
  {
    role: 'superadmin', title: 'Super Admin',
    iconBg: 'bg-purple-600/20', iconCls: 'text-purple-400', icon: 'star',
    desc: 'Platform-level control — manage all hospitals, subscriptions, and cross-hospital analytics.',
    items: ['Multi-Hospital Management', 'Subscription Plans', 'Platform Analytics', 'Audit Logs'],
  },
];

export default function Landing() {
  const navigate  = useNavigate();
  const { loginAs } = useAuth();
  const [loading, setLoading] = useState(null);

  const handleLogin = async (role) => {
    setLoading(role);
    try {
      await loginAs(role);
      navigate(ROLE_HOME[role]);
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-display text-xl text-slate-900">Medinfera</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')}  className="btn-ghost btn-sm">Sign in</button>
            <button onClick={() => navigate('/signup')} className="btn-primary btn-sm">Get started</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-brand-100/40 blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal-100/40 blur-3xl -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-medium mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            Multi-tenant Hospital ERP · 6 Role-based Portals
          </div>

          <h1 className="font-display text-5xl sm:text-6xl text-slate-900 mb-6 leading-[1.05] animate-slide-up">
            Healthcare management,
            <br />
            <span className="text-brand-600 italic">fully reimagined.</span>
          </h1>

          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10 animate-slide-up stagger-2 leading-relaxed">
            One platform for every role — Super Admin, Hospital Admin, Doctor, Staff, Pharmacist, and Patient. Designed for scale, built for clarity.
          </p>

          {/* Role access buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6 animate-slide-up stagger-3">
            {ROLE_ENTRIES.map(({ role, label, color, icon, desc }) => (
              <button
                key={role}
                onClick={() => handleLogin(role)}
                disabled={!!loading}
                className={`${color} text-white flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-60 shadow-sm`}
              >
                {loading === role
                  ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin flex-shrink-0" />
                  : <Icon name={icon} className="w-4 h-4 flex-shrink-0" />
                }
                <span className="flex flex-col items-start leading-tight">
                  <span className="font-semibold">{label}</span>
                  <span className="text-[10px] font-normal opacity-70">{desc}</span>
                </span>
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-400 animate-fade-in stagger-4">
            Click any role above to access the portal · All data is pre-loaded for evaluation
          </p>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-4xl text-slate-900 mb-1">{value}</div>
                <div className="text-sm text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl text-slate-900 mb-4">Everything your hospital needs</h2>
          <p className="text-slate-500 max-w-md mx-auto">From bedside to boardroom — every workflow covered in one integrated system.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className="card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                <Icon name={icon} className="w-5 h-5 text-brand-600" />
              </div>
              <h3 className="font-display text-lg text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Role cards ──────────────────────────────────────────── */}
      <section className="bg-slate-900 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-white mb-4">Built for every role</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Six tailored portals — each with role-scoped access, navigation, and workflows. Everyone sees exactly what they need.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ROLE_CARDS.map(({ role, title, iconBg, iconCls, icon, desc, items }, i) => (
              <div
                key={role}
                className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200 animate-slide-up flex flex-col"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                  <Icon name={icon} className={`w-5 h-5 ${iconCls}`} />
                </div>
                <h3 className="font-display text-xl text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed flex-1">{desc}</p>
                <ul className="space-y-1.5 mb-5">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <Icon name="check" className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleLogin(role)}
                  disabled={!!loading}
                  className="w-full text-xs py-2 rounded-lg border border-slate-600 text-slate-300 bg-slate-700 hover:bg-slate-600 hover:border-slate-500 transition-all disabled:opacity-50 font-medium"
                >
                  {loading === role
                    ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Signing in…</span>
                    : `Access ${title} Portal`
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-display text-slate-700">Medinfera Health Platform</span>
          </div>
          <p className="text-xs text-slate-400">© 2026 Medinfera · Hospital ERP · All data pre-loaded for evaluation</p>
          <div className="flex gap-4">
            <button onClick={() => navigate('/login')}  className="text-xs text-slate-500 hover:text-brand-600 transition-colors">Sign In</button>
            <button onClick={() => navigate('/signup')} className="text-xs text-slate-500 hover:text-brand-600 transition-colors">Register</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
