import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Avatar from '../../components/common/Avatar';
import { PageSpinner } from '../../components/common/Spinner';
import Icon from '../../components/common/Icon';
import { useAuth } from '../../context/AuthContext';
import { getDoctorStats, getAppointments } from '../../services/mockData';
import AppointmentsModule  from '../../modules/appointments/AppointmentsModule';
import PrescriptionsModule from '../../modules/prescriptions/PrescriptionsModule';
import PatientsModule      from '../../modules/patients/PatientsModule';
import MedicineDatabaseModule from '../../modules/medicineDatabase/MedicineDatabaseModule';
import ReportsModule       from '../../modules/reports/ReportsModule';
import ScheduleModule      from '../../modules/schedule/ScheduleModule';
import ProfileModule       from '../../modules/profile/ProfileModule';
import IpdModule           from '../../modules/ipd/IpdModule';
import LabOrdersModule     from '../../modules/labOrders/LabOrdersModule';

const NAV = [
  {
    title: 'Main',
    items: [
      { to: '/doctor',               icon: 'home',         label: 'Dashboard',     end: true },
      { to: '/doctor/appointments',  icon: 'calendar',     label: 'Appointments'   },
      { to: '/doctor/prescriptions', icon: 'prescription', label: 'Prescriptions'  },
    ],
  },
  {
    title: 'Practice',
    items: [
      { to: '/doctor/patients',  icon: 'users',    label: 'Patients'      },
      { to: '/doctor/medicines', icon: 'lab',      label: 'Medicine DB'   },
      { to: '/doctor/schedule',  icon: 'chart',    label: 'My Schedule'   },
      { to: '/doctor/financials',icon: 'payment',  label: 'Financials'    },
      { to: '/doctor/ipd',       icon: 'bed',      label: 'IPD'           },
      { to: '/doctor/lab',       icon: 'lab',      label: 'Lab Orders'    },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/doctor/profile',   icon: 'settings', label: 'Profile'       },
    ],
  },
];

// ─── Today's appointments card ────────────────────────────────────────────────
function AppointmentRow({ a, onAction }) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-slate-50 last:border-0 group">
      <Avatar name={a.patientName} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-800 truncate">{a.patientName}</span>
          <StatusBadge status={a.type} />
        </div>
        <div className="text-xs text-slate-400 mt-0.5">{a.service} · {a.time}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={a.status} />
        {a.status === 'pending' && (
          <button
            onClick={() => onAction(a.id, 'approve')}
            className="text-xs font-medium text-teal-600 hover:text-teal-800 border border-teal-200 rounded-lg px-2.5 py-1 hover:bg-teal-50 transition-colors"
          >
            Approve
          </button>
        )}
        {a.status === 'confirmed' && (
          <button
            onClick={() => onAction(a.id, 'prescribe')}
            className="text-xs font-medium text-brand-600 hover:text-brand-800 border border-brand-200 rounded-lg px-2.5 py-1 hover:bg-brand-50 transition-colors"
          >
            Prescribe
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Quick Prescription Builder (mock) ───────────────────────────────────────
function QuickPrescribeModal({ onClose }) {
  const [meds, setMeds]   = useState([{ name: '', dose: '', freq: 'OD', days: '5' }]);
  const [advice, setAdvice] = useState('');
  const [saved, setSaved]  = useState(false);

  const addMed = () => setMeds([...meds, { name: '', dose: '', freq: 'OD', days: '5' }]);
  const setMed = (i, k) => (e) => {
    const n = [...meds];
    n[i][k] = e.target.value;
    setMeds(n);
  };
  const removeMed = (i) => setMeds(meds.filter((_, j) => j !== i));

  const save = () => { setSaved(true); setTimeout(onClose, 1200); };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-slate-900">e-Prescription</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {saved ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
              <Icon name="check" className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-sm text-teal-700 font-medium">Prescription saved!</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medicines</div>
              {meds.map((m, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input value={m.name} onChange={setMed(i, 'name')} className="input text-xs col-span-4" placeholder="Medicine name…" />
                  <input value={m.dose} onChange={setMed(i, 'dose')} className="input text-xs col-span-2" placeholder="Dose" />
                  <select value={m.freq} onChange={setMed(i, 'freq')} className="input text-xs col-span-3">
                    {['OD','BD','TDS','QID','SOS'].map(f => <option key={f}>{f}</option>)}
                  </select>
                  <div className="flex items-center gap-1 col-span-2">
                    <input value={m.days} onChange={setMed(i, 'days')} className="input text-xs w-full" placeholder="Days" />
                  </div>
                  <button onClick={() => removeMed(i)} className="text-red-400 hover:text-red-600 col-span-1 flex justify-center">
                    <Icon name="close" className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button onClick={addMed} className="btn-secondary btn-sm gap-1.5 text-xs">
                <Icon name="plus" className="w-3.5 h-3.5" /> Add medicine
              </button>
            </div>

            <div className="mb-5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Advice / Notes</div>
              <textarea
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                className="input resize-none text-sm"
                rows={3}
                placeholder="Rest well, drink fluids, follow-up in 5 days…"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button onClick={save} className="btn-primary flex-1">Save Prescription</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Doctor Home ──────────────────────────────────────────────────────────────
function DoctorHome() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [appts, setAppts]   = useState([]);
  const [busy, setBusy]     = useState(true);
  const [prescribeOpen, setPrescribeOpen] = useState(false);

  useEffect(() => {
    Promise.all([getDoctorStats(), getAppointments()])
      .then(([s, a]) => { setStats(s); setAppts(a); })
      .finally(() => setBusy(false));
  }, []);

  const handleAction = (id, action) => {
    if (action === 'prescribe') setPrescribeOpen(true);
    if (action === 'approve') {
      setAppts(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    }
  };

  if (busy) return <PageSpinner />;

  const today  = appts.filter(a => a.date === '2026-03-18');
  const pending = appts.filter(a => a.status === 'pending');

  return (
    <div className="space-y-6 page-enter">
      {/* Greeting */}
      <div className="animate-slide-up">
        <h2 className="font-display text-2xl text-slate-900">Welcome, {user?.name} 🩺</h2>
        <p className="text-slate-500 text-sm mt-1">{user?.designation} · {user?.specialization}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Appointments" value={stats.todayAppointments}    icon="calendar"     color="blue"  trend={2}  delay={0}   />
        <StatCard label="Pending Requests"      value={stats.pendingRequests}      icon="bell"         color="amber" delay={60}  />
        <StatCard label="Total Patients"        value={stats.totalPatients}        icon="users"        color="teal"  trend={5}  delay={120} />
        <StatCard label="Month Earnings"        value={`₹${(stats.monthEarnings/1000).toFixed(0)}K`} icon="payment" color="green" delay={180} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's appointments */}
        <div className="lg:col-span-2 card animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base text-slate-900">Today's Schedule</h3>
            <div className="flex items-center gap-2">
              {pending.length > 0 && (
                <span className="badge badge-amber">{pending.length} pending</span>
              )}
              <span className="badge badge-blue">{today.length} total</span>
            </div>
          </div>
          {today.length > 0 ? (
            <div>
              {today.map(a => <AppointmentRow key={a.id} a={a} onAction={handleAction} />)}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">No appointments scheduled today.</div>
          )}
        </div>

        {/* Quick actions + info */}
        <div className="space-y-4 animate-slide-up stagger-4">
          {/* Quick Prescribe */}
          <div className="card bg-gradient-to-br from-brand-600 to-brand-700 !border-0 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon name="prescription" className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-display text-base">Quick Prescribe</div>
                <div className="text-xs text-brand-200">Write a new e-prescription</div>
              </div>
            </div>
            <button
              onClick={() => setPrescribeOpen(true)}
              className="w-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium py-2 rounded-xl transition-colors border border-white/20"
            >
              Open Prescription Builder →
            </button>
          </div>

          {/* Doctor info card */}
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={user?.name} size="md" />
              <div>
                <div className="text-sm font-semibold text-slate-800">{user?.name}</div>
                <div className="text-xs text-slate-400">{user?.specialization}</div>
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Qualification</span>
                <span className="font-medium">{user?.qualification}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Experience</span>
                <span className="font-medium">{user?.experience} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone</span>
                <span className="font-medium font-mono text-xs">{user?.phone}</span>
              </div>
            </div>
          </div>

          {/* Stats mini */}
          <div className="card">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">This Month</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Completed</span>
                <span className="font-semibold text-slate-900">{stats.completedThisMonth}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full">
                <div className="h-full w-3/4 bg-teal-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {prescribeOpen && <QuickPrescribeModal onClose={() => setPrescribeOpen(false)} />}
    </div>
  );
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  return (
    <DashboardLayout
      navGroups={NAV}
      title={user?.name || 'Doctor Portal'}
      subtitle={user?.designation}
    >
      <Routes>
        <Route index              element={<DoctorHome />} />
        <Route path="appointments"  element={<AppointmentsModule role="doctor" doctorId={2} />} />
        <Route path="prescriptions" element={<PrescriptionsModule role="doctor" doctorId={2} doctorName={user?.name} />} />
        <Route path="patients"      element={<PatientsModule readOnly />} />
        <Route path="medicines"     element={<MedicineDatabaseModule />} />
        <Route path="financials"    element={<ReportsModule />} />
        <Route path="schedule"      element={<ScheduleModule />} />
        <Route path="profile"       element={<ProfileModule />} />
        <Route path="ipd"           element={<IpdModule />} />
        <Route path="lab"           element={<LabOrdersModule role="doctor" />} />
        <Route path="*"             element={<DoctorHome />} />
      </Routes>
    </DashboardLayout>
  );
}
