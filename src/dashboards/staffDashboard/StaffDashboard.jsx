import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Icon from '../../components/common/Icon';
import Avatar from '../../components/common/Avatar';
import { PageSpinner } from '../../components/common/Spinner';
import { PageHeader, SearchBar, FilterTab, FormModal, Field, useToast, EmptyState } from '../../modules/shared';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getAllAppointments, approveAppointment, cancelAppointment } from '../../services/appointmentService';
import { getOccupancySummary, getWards, getBeds, allocateBed, dischargeBed } from '../../services/bedService';
import {
  getAllStaff, createStaff, updateStaff, deleteStaff, getStaffStats,
  fullName as staffFullName, GENDER_OPTIONS,
} from '../../services/staffService';
import AppointmentsModule  from '../../modules/appointments/AppointmentsModule';
import BedManagementModule from '../../modules/bedManagement/BedManagementModule';
import AmbulanceModule     from '../../modules/ambulance/AmbulanceModule';
import ProfileModule       from '../../modules/profile/ProfileModule';
import IpdModule           from '../../modules/ipd/IpdModule';
import LabOrdersModule     from '../../modules/labOrders/LabOrdersModule';

const NAV = [
  {
    title: 'Operations',
    items: [
      { to: '/staff',              icon: 'home',      label: 'Dashboard'       },
      { to: '/staff/appointments', icon: 'calendar',  label: 'Appointments'    },
      { to: '/staff/beds',         icon: 'bed',       label: 'Bed Management'  },
      { to: '/staff/ambulance',    icon: 'ambulance', label: 'Ambulance'       },
      { to: '/staff/ipd',          icon: 'bed',       label: 'IPD'             },
      { to: '/staff/lab',          icon: 'lab',       label: 'Lab Orders'      },
    ],
  },
  {
    title: 'Team',
    items: [
      { to: '/staff/team',         icon: 'users',     label: 'Staff Directory' },
      { to: '/staff/register',     icon: 'plus',      label: 'Register Staff'  },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/staff/profile',      icon: 'settings',  label: 'My Profile'      },
    ],
  },
];

// ─── Staff Registration Form — aligned to users table only ──────────────────────
// Schema: NO separate staff table. Staff = users with role_id = staff.
// REMOVED non-schema fields: address, aadhaar_number, salary, joining_date,
//   shift, department, role, qualification, experience_years
// ADDED schema fields: first_name, last_name, alternate_phone,
//   profile_photo, preferred_language
function StaffRegistrationForm({ initial, onClose, onSaved }) {
  const editing = !!initial;

  const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil'   }, { value: 'te', label: 'Telugu' },
    { value: 'bn', label: 'Bengali' }, { value: 'mr', label: 'Marathi' },
  ];

  const blank = {
    // users table — exact column names
    first_name:         '',
    last_name:          '',
    email:              '',
    phone:              '',       // users.phone NOT NULL
    alternate_phone:    '',       // users.alternate_phone
    profile_photo:      null,     // users.profile_photo
    preferred_language: 'en',     // users.preferred_language DEFAULT 'en'
    // display-only (not a DB column, used for staff card display)
    designation:        '',
  };

  const toForm = (s) => ({
    first_name:         s.first_name         || '',
    last_name:          s.last_name          || '',
    email:              s.email              || '',
    phone:              s.phone              || '',
    alternate_phone:    s.alternate_phone    || '',
    profile_photo:      s.profile_photo      || null,
    preferred_language: s.preferred_language || 'en',
    designation:        s.designation        || '',
  });

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
      if (editing) await updateStaff(initial.id, form);
      else await createStaff(form);
      onSaved(editing ? 'Staff record updated' : 'Staff member registered successfully');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <FormModal
      title={editing ? 'Edit Staff Record' : 'Register New Staff Member'}
      onClose={onClose} onSubmit={submit} loading={busy} wide
      submitLabel={editing ? 'Save Changes' : 'Register Staff'}
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
                <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="staff@hospital.com" />
              </Field>
              <Field label="Phone Number" required hint="users.phone NOT NULL">
                <input className="input" value={form.phone} onChange={set('phone')} placeholder="+91 98100 00000" />
              </Field>
            </div>
            <Field label="Alternate Phone" hint="users.alternate_phone">
              <input className="input" value={form.alternate_phone} onChange={set('alternate_phone')} placeholder="+91 98100 00000 (optional)" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Preferred Language" hint="users.preferred_language DEFAULT 'en'">
                <select className="input" value={form.preferred_language} onChange={set('preferred_language')}>
                  {LANGUAGE_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </Field>
              <Field label="Designation" hint="Display label — not a DB column">
                <input className="input" value={form.designation} onChange={set('designation')} placeholder="e.g. Senior Nurse" />
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

// ─── Staff Directory Page ──────────────────────────────────────────────────────
function StaffDirectoryPage({ showForm = false }) {
  const [staff, setStaff]       = useState([]);
  const [stats, setStats]       = useState(null);
  const [busy, setBusy]         = useState(true);
  const [search, setSearch]     = useState('');
  const [editing, setEditing]   = useState(null);
  const [formOpen, setFormOpen] = useState(showForm);
  const { show, ToastEl }       = useToast();

  const load = useCallback(async () => {
    setBusy(true);
    const [s, st] = await Promise.all([getAllStaff(), getStaffStats()]);
    setStaff(s); setStats(st);
    setBusy(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleSaved = (msg) => { setFormOpen(false); setEditing(null); show(msg); load(); };
  const handleDelete = async (id) => {
    await deleteStaff(id);
    show('Staff record removed'); load();
  };

  const filtered = staff.filter((s) => {
    const matchSearch = !search || (`${s.first_name||""} ${s.last_name||""}`.toLowerCase()).includes(search.toLowerCase()) || (s.designation || '').toLowerCase().includes(search.toLowerCase());
    const matchRole   = true; // role filter uses role_id FK, not a text field
    return matchSearch && matchRole;
  });

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-5 page-enter">
      {ToastEl}
      <PageHeader
        title="Staff Directory"
        subtitle={`${stats?.total || 0} registered staff members`}
        action={<button className="btn-primary btn-sm gap-1.5" onClick={() => { setEditing(null); setFormOpen(true); }}><Icon name="plus" className="w-4 h-4"/>Register Staff</button>}
      />
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Staff', value: stats.total,    bg: 'bg-slate-100',  text: 'text-slate-700' },
            { label: 'Active',      value: stats.active,   bg: 'bg-teal-50',    text: 'text-teal-700'  },
            { label: 'Nurses',      value: stats.byRole.find((r) => r.role === 'Nurse')?.count || 0, bg: 'bg-brand-50', text: 'text-brand-700' },
            { label: 'Support',     value: stats.byRole.filter((r) => !['Nurse'].includes(r.role)).reduce((s, r) => s + r.count, 0), bg: 'bg-amber-50', text: 'text-amber-700' },
          ].map(({ label, value, bg, text }) => (
            <div key={label} className={`${bg} rounded-xl px-4 py-3 text-center`}>
              <div className={`text-2xl font-display ${text}`}>{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-3 flex-col sm:flex-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, or designation…" className="sm:w-72" />
        {/* role filter removed — role managed via users.role_id FK */}
      </div>
      <div className="card !p-0">
        {filtered.length === 0 ? <EmptyState icon="users" title="No staff members found" /> : (
          <div className="table-wrapper border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Staff Member</th><th>Email</th>
                  <th>Phone</th><th>Alt. Phone</th><th>Language</th>
                  <th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const name = s.name || staffFullName(s);
                  return (
                  <tr key={s.id}>
                    <td className="text-xs font-mono text-slate-400">#{s.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={name} size="sm" />
                        <div>
                          <div className="text-sm font-medium text-slate-800">{name}</div>
                          <div className="text-xs text-slate-400">{s.designation || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-slate-500">{s.email || '—'}</td>
                    <td className="text-xs font-mono text-slate-500">{s.phone}</td>
                    <td className="text-xs text-slate-400">{s.alternate_phone || '—'}</td>
                    <td className="text-xs text-slate-400 uppercase">{s.preferred_language || 'en'}</td>
                    <td><StatusBadge status={s.is_active !== false ? 'active' : 'inactive'} /></td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing(s); setFormOpen(true); }} className="text-brand-600 hover:text-brand-800 text-xs font-medium">Edit</button>
                        <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Remove</button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {formOpen && <StaffRegistrationForm initial={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSaved={handleSaved} />}
    </div>
  );
}

// ─── Staff Home ─────────────────────────────────────────────────────────────────
function StaffHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appts, setAppts] = useState([]);
  const [bedSummary, setBedSummary] = useState(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    Promise.all([getAllAppointments(), getOccupancySummary()])
      .then(([a, b]) => { setAppts(a.filter((x) => x.status === 'pending').slice(0, 5)); setBedSummary(b); })
      .finally(() => setBusy(false));
  }, []);

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-slate-900">Welcome, {user?.name?.split(' ')[0]}</h2>
          <p className="text-slate-500 text-sm mt-1">{user?.designation || 'Staff Member'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Approvals"   value={appts.length}            icon="calendar"  color="amber" delay={0}  />
        <StatCard label="Beds Available"      value={bedSummary?.available}   icon="bed"       color="teal"  delay={60} />
        <StatCard label="Beds Occupied"       value={bedSummary?.occupied}    icon="users"     color="red"   delay={120}/>
        <StatCard label="Cleaning / Maint."   value={(bedSummary?.cleaning || 0) + (bedSummary?.maintenance || 0)} icon="settings" color="blue" delay={180}/>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card !p-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-display text-base text-slate-900">Pending Appointments</h3>
            <button onClick={() => navigate('/staff/appointments')} className="text-xs text-brand-600 font-medium hover:underline">View all →</button>
          </div>
          {appts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No pending appointments</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {appts.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Avatar name={a.patientName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{a.patientName}</div>
                    <div className="text-xs text-slate-400">{a.doctorName} · {a.time}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={async () => { await approveAppointment(a.id); setAppts((p) => p.filter((x) => x.id !== a.id)); }} className="text-teal-600 hover:text-teal-800 text-xs font-medium">Approve</button>
                    <button onClick={async () => { await cancelAppointment(a.id); setAppts((p) => p.filter((x) => x.id !== a.id)); }} className="text-red-500 hover:text-red-700 text-xs font-medium">Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-display text-base text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Approve Appointments', icon: 'check',     to: '/staff/appointments', color: 'bg-teal-50 text-teal-700'  },
              { label: 'Manage Beds',           icon: 'bed',       to: '/staff/beds',         color: 'bg-brand-50 text-brand-700' },
              { label: 'Dispatch Ambulance',    icon: 'ambulance', to: '/staff/ambulance',    color: 'bg-red-50 text-red-700'    },
              { label: 'Staff Directory',       icon: 'users',     to: '/staff/team',         color: 'bg-slate-100 text-slate-700'},
            ].map(({ label, icon, to, color }) => (
              <button key={label} onClick={() => navigate(to)} className={`${color} rounded-xl p-4 text-left hover:opacity-80 transition-opacity`}>
                <Icon name={icon} className="w-5 h-5 mb-2" />
                <div className="text-sm font-medium leading-snug">{label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  const { user } = useAuth();
  return (
    <DashboardLayout navGroups={NAV} title={user?.name || 'Staff Portal'} subtitle={user?.designation}>
      <Routes>
        <Route index              element={<StaffHome />} />
        <Route path="appointments" element={<AppointmentsModule role="staff" />} />
        <Route path="beds"         element={<BedManagementModule />} />
        <Route path="ambulance"    element={<AmbulanceModule />} />
        <Route path="team"         element={<StaffDirectoryPage />} />
        <Route path="register"     element={<StaffDirectoryPage showForm />} />
        <Route path="profile"      element={<ProfileModule />} />
        <Route path="ipd"          element={<IpdModule />} />
        <Route path="lab"          element={<LabOrdersModule role="staff" />} />
        <Route path="*"            element={<StaffHome />} />
      </Routes>
    </DashboardLayout>
  );
}
