import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Avatar from '../../components/common/Avatar';
import { PageSpinner } from '../../components/common/Spinner';
import { DashboardSkeleton } from '../../components/common/SkeletonLoader';
import Icon from '../../components/common/Icon';
import { useAuth } from '../../context/AuthContext';
import { getAdminStats, getAppointments, getDoctors, getPatients, getBedStats, getRecentActivity } from '../../services/mockData';
import AppointmentsModule   from '../../modules/appointments/AppointmentsModule';
import DoctorsModule        from '../../modules/doctors/DoctorsModule';
import PatientsModule       from '../../modules/patients/PatientsModule';
import PrescriptionsModule  from '../../modules/prescriptions/PrescriptionsModule';
import MedicineDatabaseModule from '../../modules/medicineDatabase/MedicineDatabaseModule';
import BedManagementModule  from '../../modules/bedManagement/BedManagementModule';
import AmbulanceModule      from '../../modules/ambulance/AmbulanceModule';
import PaymentsModule       from '../../modules/payments/PaymentsModule';
import ReportsModule        from '../../modules/reports/ReportsModule';
import SettingsModule       from '../../modules/settings/SettingsModule';
import CmsModule            from '../../modules/cms/CmsModule';
import ProfileModule        from '../../modules/profile/ProfileModule';
import IpdModule             from '../../modules/ipd/IpdModule';
import LabOrdersModule       from '../../modules/labOrders/LabOrdersModule';
import SuppliersModule       from '../../modules/suppliers/SuppliersModule';
import PayrollModule         from '../../modules/payroll/PayrollModule';

// ─── Admin nav ────────────────────────────────────────────────────────────────
const NAV = [
  {
    title: 'Overview',
    items: [
      { to: '/admin',              icon: 'home',         label: 'Dashboard',     end: true },
      { to: '/admin/reports',      icon: 'chart',        label: 'Reports'       },
    ],
  },
  {
    title: 'Clinical',
    items: [
      { to: '/admin/appointments', icon: 'calendar',     label: 'Appointments'  },
      { to: '/admin/doctors',      icon: 'doctor',       label: 'Doctors'       },
      { to: '/admin/patients',     icon: 'users',        label: 'Patients'      },
      { to: '/admin/prescriptions',icon: 'prescription', label: 'Prescriptions' },
      { to: '/admin/medicines',    icon: 'lab',          label: 'Medicine DB'   },
      { to: '/admin/ipd',          icon: 'bed',          label: 'IPD'           },
      { to: '/admin/lab',          icon: 'lab',          label: 'Lab Orders'    },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/admin/beds',         icon: 'bed',          label: 'Bed Management'},
      { to: '/admin/ambulance',    icon: 'ambulance',    label: 'Ambulance'     },
    ],
  },
  {
    title: 'Finance',
    items: [
      { to: '/admin/payments',     icon: 'payment',      label: 'Payments'      },
      { to: '/admin/payroll',      icon: 'payment',      label: 'Staff Payroll' },
      { to: '/admin/suppliers',    icon: 'prescription', label: 'Procurement'   },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/admin/cms',          icon: 'star',         label: 'CMS & Website' },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/admin/settings',     icon: 'settings',     label: 'Settings'      },
      { to: '/admin/profile',      icon: 'doctor',       label: 'My Profile'    },
    ],
  },
];

// ─── Overview Home ────────────────────────────────────────────────────────────
function AdminHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [appts, setAppts]     = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds]       = useState(null);
  const [activity, setActivity] = useState([]);
  const [busy, setBusy]       = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    Promise.all([
      getAdminStats(),
      getAppointments(),
      getDoctors(),
      getBedStats(),
      getRecentActivity(),
    ]).then(([s, a, d, b, ac]) => {
      setStats(s); setAppts(a.slice(0, 5));
      setDoctors(d.slice(0, 4)); setBeds(b);
      setActivity(ac);
    }).catch((e) => setError(e.message))
      .finally(() => setBusy(false));
  }, []);

  if (busy) return <DashboardSkeleton />;

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
        <Icon name="close" className="w-7 h-7 text-red-400" />
      </div>
      <p className="font-display text-xl text-slate-800">Failed to load dashboard</p>
      <p className="text-sm text-slate-500">{error}</p>
      <button onClick={() => window.location.reload()} className="btn-primary btn-sm">Retry</button>
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 page-enter">
      {/* Greeting + quick links */}
      <div className="flex items-start justify-between gap-4 animate-slide-up">
        <div>
          <h2 className="font-display text-2xl text-slate-900">{greeting}, {user?.name?.split(' ')[0]} 👋</h2>
          <p className="text-slate-500 text-sm mt-1">Here's what's happening at Medinfera General Hospital today.</p>
        </div>
        <div className="hidden sm:flex gap-2 flex-shrink-0">
          <button onClick={() => navigate('/admin/appointments')} className="btn-primary btn-sm gap-1.5">
            <Icon name="plus" className="w-3.5 h-3.5" /> New Appointment
          </button>
          <button onClick={() => navigate('/admin/reports')} className="btn-secondary btn-sm gap-1.5">
            <Icon name="chart" className="w-3.5 h-3.5" /> Reports
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Appointments" value={stats.todayAppointments} icon="calendar" color="blue"  trend={8}  delay={0}   />
        <StatCard label="Total Patients"        value={stats.totalPatients}    icon="users"    color="teal"  trend={12} delay={60}  />
        <StatCard label="Beds Available"        value={stats.bedsAvailable}    icon="bed"      color="green" delay={120} />
        <StatCard label="Month Revenue"         value={`₹${(stats.monthRevenue/1000).toFixed(0)}K`} icon="payment" color="amber" trend={5} delay={180} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Approval', value: stats.pendingAppointments, icon: 'calendar', bg: 'bg-amber-50', ic: 'text-amber-500', to: '/admin/appointments' },
          { label: 'Total Doctors',    value: stats.totalDoctors,        icon: 'doctor',   bg: 'bg-brand-50', ic: 'text-brand-500', to: '/admin/doctors'      },
          { label: 'Active Ambulances',value: stats.activeAmbulances,   icon: 'ambulance', bg: 'bg-teal-50',  ic: 'text-teal-500',  to: '/admin/ambulance'    },
        ].map(({ label, value, icon, bg, ic, to }, i) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className={`card animate-slide-up stagger-${i + 3} flex items-center gap-4 text-left hover:shadow-card-hover hover:-translate-y-0.5 transition-all cursor-pointer w-full`}
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon name={icon} className={`w-5 h-5 ${ic}`} />
            </div>
            <div>
              <div className="text-xs text-slate-500">{label}</div>
              <div className="text-2xl font-display text-slate-900">{value}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Appointments table */}
        <div className="lg:col-span-2 card animate-slide-up stagger-3 !p-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-display text-base text-slate-900">Recent Appointments</h3>
            <div className="flex items-center gap-2">
              <span className="badge badge-blue">{appts.length} shown</span>
              <button onClick={() => navigate('/admin/appointments')} className="text-xs text-brand-600 font-medium hover:underline">View all →</button>
            </div>
          </div>
          <div className="table-wrapper rounded-none border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appts.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={a.patientName} size="sm" />
                        <span className="font-medium text-slate-800 text-xs whitespace-nowrap">{a.patientName}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">{a.doctorName}</td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">{a.time}</td>
                    <td><StatusBadge status={a.type} /></td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity feed */}
        <div className="card animate-slide-up stagger-4">
          <h3 className="font-display text-base text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {activity.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name={a.icon} className="w-3.5 h-3.5 text-brand-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-700 leading-snug">{a.text}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Doctors */}
        <div className="card animate-slide-up stagger-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base text-slate-900">Top Doctors</h3>
            <button className="text-xs text-brand-600 font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {doctors.map((d) => (
              <div key={d.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <Avatar name={d.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{d.name}</div>
                  <div className="text-xs text-slate-400">{d.specialization} · {d.experience}y exp</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-semibold text-slate-700">{d.patients} pts</div>
                  <div className="text-[11px] text-amber-500">★ {d.rating}</div>
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Bed occupancy */}
        {beds && (
          <div className="card animate-slide-up stagger-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base text-slate-900">Bed Occupancy</h3>
              <span className="badge badge-blue">{beds.total} total</span>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { label: 'Available',   value: beds.available,   color: 'text-teal-600',  bg: 'bg-teal-50'  },
                { label: 'Occupied',    value: beds.occupied,    color: 'text-red-600',   bg: 'bg-red-50'   },
                { label: 'Cleaning',    value: beds.cleaning,    color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Maintenance', value: beds.maintenance, color: 'text-slate-500', bg: 'bg-slate-100'},
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl px-3 py-2.5 text-center`}>
                  <div className={`text-lg font-display ${color}`}>{value}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Ward breakdown */}
            <div className="space-y-3">
              {beds.wards.map((w) => {
                const pct = Math.round((w.occupied / w.total) * 100);
                return (
                  <div key={w.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">{w.name}</span>
                      <span className="text-slate-400">{w.available} free of {w.total}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-teal-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Placeholder pages ────────────────────────────────────────────────────────
// ─── Admin Dashboard root ────────────────────────────────────────────────────
export default function AdminDashboard() {
  return (
    <DashboardLayout
      navGroups={NAV}
      title="Medinfera General Hospital"
      subtitle="Hospital Admin Panel"
    >
      <Routes>
        <Route index        element={<AdminHome />} />
        <Route path="appointments"    element={<AppointmentsModule role="admin" />} />
        <Route path="patients"        element={<PatientsModule />} />
        <Route path="doctors"         element={<DoctorsModule />} />
        <Route path="prescriptions"   element={<PrescriptionsModule role="admin" />} />
        <Route path="medicines"       element={<MedicineDatabaseModule />} />
        <Route path="beds"            element={<BedManagementModule />} />
        <Route path="ambulance"       element={<AmbulanceModule />} />
        <Route path="payments"        element={<PaymentsModule />} />
        <Route path="reports"         element={<ReportsModule />} />
        <Route path="cms"             element={<CmsModule />} />
        <Route path="settings"        element={<SettingsModule />} />
        <Route path="profile"         element={<ProfileModule />} />
        <Route path="ipd"            element={<IpdModule />} />
        <Route path="lab"            element={<LabOrdersModule role="admin" />} />
        <Route path="payroll"        element={<PayrollModule />} />
        <Route path="suppliers"      element={<SuppliersModule />} />
        <Route path="*"               element={<AdminHome />} />
      </Routes>
    </DashboardLayout>
  );
}
