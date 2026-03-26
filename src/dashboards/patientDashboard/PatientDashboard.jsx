import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Avatar from '../../components/common/Avatar';
import { PageSpinner } from '../../components/common/Spinner';
import Icon from '../../components/common/Icon';
import { useAuth } from '../../context/AuthContext';
import { getPatientStats, getAppointments, getDoctors } from '../../services/mockData';
import AppointmentsModule  from '../../modules/appointments/AppointmentsModule';
import PrescriptionsModule from '../../modules/prescriptions/PrescriptionsModule';
import PaymentsModule      from '../../modules/payments/PaymentsModule';
import ProfileModule       from '../../modules/profile/ProfileModule';

const NAV = [
  {
    title: 'My Health',
    items: [
      { to: '/patient',               icon: 'home',         label: 'Dashboard',     end: true },
      { to: '/patient/appointments',  icon: 'calendar',     label: 'Appointments'   },
      { to: '/patient/prescriptions', icon: 'prescription', label: 'Prescriptions'  },
      { to: '/patient/payments',      icon: 'payment',      label: 'Payments'       },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/patient/profile',       icon: 'settings',     label: 'Profile'        },
    ],
  },
];

// ─── Booking Wizard ───────────────────────────────────────────────────────────
function BookingWizard({ doctors, onClose }) {
  const [step, setStep]     = useState(1);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [type, setType]     = useState('Offline');
  const [notes, setNotes]   = useState('');
  const [done, setDone]     = useState(false);

  const SLOTS = ['09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM'];

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);
  const book = () => { setDone(true); setTimeout(onClose, 1500); };

  const steps = ['Choose Doctor','Pick Slot','Confirm'];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-display text-xl text-slate-900">Book Appointment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Step progress */}
        <div className="flex items-center px-6 py-3 gap-3 border-b border-slate-50">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${i + 1 <= step ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {i + 1 < step ? <Icon name="check" className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${i + 1 === step ? 'text-brand-700' : 'text-slate-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-slate-200" />}
            </div>
          ))}
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-12 px-6">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
              <Icon name="check" className="w-7 h-7 text-teal-600" />
            </div>
            <p className="font-display text-lg text-slate-800">Appointment Booked!</p>
            <p className="text-sm text-slate-500 text-center">Your appointment has been submitted. You'll receive a confirmation shortly.</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Step 1: Choose Doctor */}
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 mb-3">Select a doctor for your appointment</p>
                {doctors.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDoc(d)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedDoc?.id === d.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'}`}
                  >
                    <Avatar name={d.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800">{d.name}</div>
                      <div className="text-xs text-slate-400">{d.specialization} · {d.experience}y exp</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-semibold text-slate-700">₹{d.fee}</div>
                      <div className="text-[11px] text-amber-500">★ {d.rating}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Pick Slot + Type */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="label">Appointment Type</label>
                  <div className="flex gap-3">
                    {['Offline','Online'].map(t => (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${type === t ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300'}`}
                      >
                        <Icon name={t === 'Online' ? 'eye' : 'hospital'} className="w-4 h-4 inline mr-1.5" />
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Available Slots</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SLOTS.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSlot(s)}
                        className={`py-2 rounded-lg border text-xs font-medium transition-all ${selectedSlot === s ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Problem / Notes</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="input resize-none text-sm"
                    rows={2}
                    placeholder="Describe your problem briefly…"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && selectedDoc && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 mb-2">Review your appointment details</p>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Doctor</span><span className="font-medium text-slate-800">{selectedDoc.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Specialization</span><span className="font-medium text-slate-800">{selectedDoc.specialization}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Type</span><StatusBadge status={type} /></div>
                  <div className="flex justify-between"><span className="text-slate-400">Time Slot</span><span className="font-medium text-slate-800">{selectedSlot}</span></div>
                  <div className="flex justify-between border-t border-slate-200 pt-3"><span className="text-slate-600 font-medium">Consultation Fee</span><span className="font-semibold text-slate-900">₹{selectedDoc.fee}</span></div>
                </div>
                {notes && (
                  <div className="bg-blue-50 rounded-xl p-3 text-xs text-brand-700">{notes}</div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              {step > 1 && <button onClick={back} className="btn-secondary flex-1">Back</button>}
              {step < 3 && (
                <button
                  onClick={next}
                  disabled={(step === 1 && !selectedDoc) || (step === 2 && !selectedSlot)}
                  className="btn-primary flex-1"
                >
                  Continue →
                </button>
              )}
              {step === 3 && (
                <button onClick={book} className="btn-primary flex-1">
                  Confirm Booking
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Patient Home ─────────────────────────────────────────────────────────────
function PatientHome() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [appts, setAppts]   = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [busy, setBusy]     = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    Promise.all([getPatientStats(), getAppointments(), getDoctors()])
      .then(([s, a, d]) => { setStats(s); setAppts(a.slice(0, 4)); setDoctors(d); })
      .finally(() => setBusy(false));
  }, []);

  if (busy) return <PageSpinner />;

  const upcoming = appts.filter(a => ['confirmed', 'pending'].includes(a.status));

  // Mock prescriptions
  const rxList = [
    { id: 1, doctor: 'Dr. Priya Sharma', date: '2026-03-15', diagnosis: 'Hypertension follow-up', meds: 3 },
    { id: 2, doctor: 'Dr. Arjun Patel',  date: '2026-02-20', diagnosis: 'Migraine management',    meds: 2 },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Greeting */}
      <div className="animate-slide-up">
        <h2 className="font-display text-2xl text-slate-900">Hello, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-slate-500 text-sm mt-1">Here's your health overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Appointments"   value={stats.totalAppointments}   icon="calendar"     color="blue"  delay={0}   />
        <StatCard label="Upcoming"             value={stats.upcomingAppointments} icon="bell"        color="amber" delay={60}  />
        <StatCard label="Prescriptions"        value={stats.totalPrescriptions}  icon="prescription" color="teal"  delay={120} />
        <StatCard label="Pending Payments"     value={stats.pendingPayments}     icon="payment"      color="red"   delay={180} />
      </div>

      {/* Book appointment CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-6 flex items-center justify-between animate-slide-up stagger-3 overflow-hidden relative">
        <div className="absolute right-0 top-0 w-48 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="80" cy="20" r="40" fill="white" />
          </svg>
        </div>
        <div className="text-white">
          <div className="font-display text-xl mb-1">Book an Appointment</div>
          <div className="text-brand-200 text-sm">Choose from 18 doctors across specializations</div>
        </div>
        <button
          onClick={() => setBooking(true)}
          className="bg-white text-brand-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors flex-shrink-0"
        >
          Book Now →
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming appointments */}
        <div className="card animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base text-slate-900">Upcoming Appointments</h3>
            <span className="badge badge-blue">{upcoming.length}</span>
          </div>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Icon name="calendar" className="w-4.5 h-4.5 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800">{a.doctorName}</span>
                      <StatusBadge status={a.type} />
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{a.service} · {a.date} at {a.time}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="calendar" className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No upcoming appointments</p>
              <button onClick={() => setBooking(true)} className="mt-3 text-xs text-brand-600 font-medium hover:underline">
                Book one now →
              </button>
            </div>
          )}
        </div>

        {/* Recent prescriptions */}
        <div className="card animate-slide-up stagger-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base text-slate-900">Recent Prescriptions</h3>
            <button className="text-xs text-brand-600 font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {rxList.map((rx) => (
              <div key={rx.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <Icon name="prescription" className="w-4.5 h-4.5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800">{rx.diagnosis}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{rx.doctor} · {rx.date}</div>
                  <div className="text-xs text-teal-600 mt-0.5">{rx.meds} medicines prescribed</div>
                </div>
                <button className="text-slate-400 group-hover:text-brand-600 transition-colors">
                  <Icon name="eye" className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient info card */}
      <div className="card animate-slide-up stagger-5">
        <h3 className="font-display text-base text-slate-900 mb-4">My Health Profile</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Blood Group', value: user?.blood_group || 'B+',         color: 'bg-red-50 text-red-700'    },
            { label: 'Gender',      value: user?.gender      || 'Female',      color: 'bg-violet-50 text-violet-700' },
            { label: 'Date of Birth', value: user?.dob       || '1990-05-15',  color: 'bg-slate-100 text-slate-600' },
            { label: 'Phone',       value: user?.phone       || '+91 —',       color: 'bg-brand-50 text-brand-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${color} rounded-xl px-4 py-3`}>
              <div className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-1">{label}</div>
              <div className="text-sm font-semibold">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {booking && <BookingWizard doctors={doctors} onClose={() => setBooking(false)} />}
    </div>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  return (
    <DashboardLayout
      navGroups={NAV}
      title={user?.name || 'My Health'}
      subtitle="Patient Portal"
    >
      <Routes>
        <Route index              element={<PatientHome />} />
        <Route path="appointments"  element={<AppointmentsModule role="patient" patientId={3} />} />
        <Route path="prescriptions" element={<PrescriptionsModule role="patient" patientId={3} />} />
        <Route path="payments"      element={<PaymentsModule role="patient" patientId={3} />} />
        <Route path="profile"       element={<ProfileModule />} />
        <Route path="*"             element={<PatientHome />} />
      </Routes>
    </DashboardLayout>
  );
}
