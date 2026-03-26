import { useState, useEffect, useCallback } from 'react';
import Avatar from '../../components/common/Avatar';
import StatusBadge from '../../components/common/StatusBadge';
import Icon from '../../components/common/Icon';
import { PageSpinner } from '../../components/common/Spinner';
import {
  PageHeader, SearchBar, FilterTab, EmptyState,
  FormModal, Field, useToast,
} from '../shared';
import {
  getAllAppointments, getAppointmentsByDoctor, getAppointmentsByPatient,
  approveAppointment, cancelAppointment, completeAppointment,
  createAppointment, getAppointmentStats,
  APPOINTMENT_TYPES, MEETING_PROVIDERS, TIME_SLOTS,
} from '../../services/appointmentService';
import { getAllDoctors } from '../../services/doctorService';

// Schema-aligned field accessors (handles both old and new field names)
const N = {
  patientName:  (a) => a.patient_name    || a.patientName    || '—',
  doctorName:   (a) => a.doctor_name     || a.doctorName     || '—',
  aptDate:      (a) => a.appointment_date|| a.date           || '—',
  startTime:    (a) => a.start_time      || a.time           || '—',
  endTime:      (a) => a.end_time        || '',
  aptType:      (a) => a.appointment_type|| a.type           || '—',
  status:       (a) => a.status          || '—',
  fee:          (a) => a.consultation_fee ?? a.fee ?? 0,
  payStatus:    (a) => a.payment_status  || a.paymentStatus  || '—',
  complaint:    (a) => a.chief_complaint || a.notes          || null,
  aptNum:       (a) => a.appointment_number || `#${a.id}`,
};

const TYPE_LABEL = { ONLINE: 'Online', OFFLINE: 'Offline', Online: 'Online', Offline: 'Offline' };

function AppointmentDrawer({ appt, onClose, onAction }) {
  const [busy, setBusy] = useState(false);
  if (!appt) return null;
  const act = async (fn, label) => {
    setBusy(true);
    try { await fn(appt.id); onAction(label); onClose(); }
    finally { setBusy(false); }
  };
  const aptType  = N.aptType(appt);
  const aptSt    = N.status(appt);
  const symptoms = Array.isArray(appt.symptoms) ? appt.symptoms : [];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl animate-slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <div><h3 className="font-display text-lg text-slate-900">{N.aptNum(appt)}</h3><StatusBadge status={aptSt} /></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><Icon name="close" className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[['PATIENT', N.patientName(appt)], ['DOCTOR', N.doctorName(appt)]].map(([lbl, nm]) => (
              <div key={lbl} className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">{lbl}</p>
                <div className="flex items-center gap-2"><Avatar name={nm} size="sm" /><span className="text-sm font-semibold text-slate-800">{nm}</span></div>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 text-sm">
            {[
              { label: 'Appointment #',    value: N.aptNum(appt) },
              { label: 'Date',             value: N.aptDate(appt) },
              { label: 'Time Slot',        value: N.endTime(appt) ? `${N.startTime(appt)} – ${N.endTime(appt)}` : N.startTime(appt) },
              { label: 'Type',             value: <span className={`badge ${aptType.includes('ONLINE') || aptType === 'Online' ? 'badge-blue' : 'badge-slate'}`}>{TYPE_LABEL[aptType] || aptType}</span> },
              { label: 'Consultation Fee', value: `₹${N.fee(appt)}` },
              { label: 'Payment Status',   value: <StatusBadge status={N.payStatus(appt)} /> },
              appt.is_followup && { label: 'Follow-up', value: 'Yes' },
              appt.specialization && { label: 'Specialization', value: appt.specialization },
            ].filter(Boolean).map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-400">{label}</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </div>

          {N.complaint(appt) && (
            <div className="bg-brand-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-brand-600 mb-1 uppercase tracking-wider">Chief Complaint</p>
              <p className="text-sm text-slate-700">{N.complaint(appt)}</p>
            </div>
          )}
          {symptoms.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-600 mb-2 uppercase tracking-wider">Symptoms</p>
              <div className="flex flex-wrap gap-1.5">{symptoms.map((s) => <span key={s} className="badge badge-amber capitalize">{s}</span>)}</div>
            </div>
          )}
          {appt.meeting_link && (
            <div className="bg-teal-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-teal-600 mb-1 uppercase tracking-wider">{appt.meeting_provider || 'Meeting Link'}</p>
              <a href={appt.meeting_link} target="_blank" rel="noreferrer" className="text-sm text-brand-600 underline break-all">{appt.meeting_link}</a>
              {appt.meeting_id && <div className="text-xs text-slate-500 mt-1">ID: {appt.meeting_id}{appt.meeting_password ? ` · Pass: ${appt.meeting_password}` : ''}</div>}
            </div>
          )}
          {appt.consultation_notes && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Consultation Notes</p>
              <p className="text-sm text-slate-700">{appt.consultation_notes}</p>
            </div>
          )}
          {aptSt === 'CANCELLED' && appt.cancelled_reason && (
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-500 mb-1 uppercase tracking-wider">Cancellation Reason</p>
              <p className="text-sm text-slate-700">{appt.cancelled_reason}</p>
            </div>
          )}
          <div className="space-y-2 pt-2">
            {(aptSt === 'PENDING' || aptSt === 'pending') && (
              <>
                <button disabled={busy} onClick={() => act(approveAppointment, 'Appointment confirmed')} className="btn-primary w-full gap-2"><Icon name="check" className="w-4 h-4"/>Confirm Appointment</button>
                <button disabled={busy} onClick={() => act(cancelAppointment, 'Appointment cancelled')} className="btn-danger w-full gap-2"><Icon name="close" className="w-4 h-4"/>Cancel Appointment</button>
              </>
            )}
            {(aptSt === 'CONFIRMED' || aptSt === 'confirmed') && (
              <>
                <button disabled={busy} onClick={() => act(completeAppointment, 'Appointment completed')} className="btn-primary w-full gap-2"><Icon name="check" className="w-4 h-4"/>Mark as Completed</button>
                <button disabled={busy} onClick={() => act(cancelAppointment, 'Appointment cancelled')} className="btn-danger w-full gap-2"><Icon name="close" className="w-4 h-4"/>Cancel Appointment</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewAppointmentForm({ onClose, onCreated }) {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patient_name: '', patient_id: '',
    doctor_id: '', doctor_name: '', specialization: '',
    appointment_date: '', start_time: '', end_time: '',
    appointment_type: 'OFFLINE',
    chief_complaint: '', symptoms: '',
    consultation_fee: '',
    meeting_provider: 'GOOGLE_MEET', meeting_link: '',
    is_followup: false,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState('');

  useEffect(() => { getAllDoctors().then(setDoctors); }, []);

  useEffect(() => {
    if (!form.start_time) return;
    const [h, m] = form.start_time.split(':').map(Number);
    const endMin = h * 60 + m + 30;
    const eh = String(Math.floor(endMin / 60) % 24).padStart(2, '0');
    const em = String(endMin % 60).padStart(2, '0');
    setForm((f) => ({ ...f, end_time: `${eh}:${em}` }));
  }, [form.start_time]);

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (k === 'doctor_id') {
      const doc = doctors.find((d) => d.id === Number(v));
      setForm((f) => ({
        ...f, doctor_id: v,
        doctor_name: doc?.name || '',
        specialization: doc?.specialization || '',
        consultation_fee: String(doc?.consultation_fee ?? doc?.fee ?? ''),
        meeting_provider: doc?.meeting_provider || 'GOOGLE_MEET',
        meeting_link: doc?.video_consultation_link || '',
      }));
    } else { setForm((f) => ({ ...f, [k]: v })); }
  };

  const submit = async () => {
    if (!form.patient_name || !form.doctor_id || !form.appointment_date || !form.start_time) {
      setErr('Patient name, doctor, date and start time are required.'); return;
    }
    setErr(''); setBusy(true);
    try {
      await createAppointment({
        ...form,
        doctor_id: Number(form.doctor_id),
        patient_id: form.patient_id ? Number(form.patient_id) : null,
        consultation_fee: Number(form.consultation_fee) || 0,
        symptoms: form.symptoms ? form.symptoms.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      onCreated('Appointment created successfully');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const isOnline = form.appointment_type === 'ONLINE';

  return (
    <FormModal title="New Appointment" onClose={onClose} onSubmit={submit} loading={busy} submitLabel="Create Appointment" wide>
      <div className="space-y-5">
        {err && <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">{err}</div>}

        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Patient & Doctor</div>
          <div className="space-y-4">
            <Field label="Patient Name" required><input className="input" value={form.patient_name} onChange={set('patient_name')} placeholder="Full name" /></Field>
            <Field label="Patient ID" hint="If registered in system"><input type="number" className="input" value={form.patient_id} onChange={set('patient_id')} placeholder="Leave blank for walk-in" /></Field>
            <Field label="Doctor" required>
              <select className="input" value={form.doctor_id} onChange={set('doctor_id')}>
                <option value="">Select a doctor…</option>
                {doctors.filter((d) => d.is_active !== false && d.status !== 'on-leave').map((d) => (
                  <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Schedule</div>
          <div className="space-y-4">
            <Field label="Appointment Date" required><input type="date" className="input" value={form.appointment_date} onChange={set('appointment_date')} min="2026-01-01" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Time" required>
                <select className="input" value={form.start_time} onChange={set('start_time')}>
                  <option value="">Select slot…</option>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="End Time" hint="Auto-calculated">
                <input type="time" className="input bg-slate-50" value={form.end_time} readOnly />
              </Field>
            </div>
            <Field label="Appointment Type" required>
              <select className="input" value={form.appointment_type} onChange={set('appointment_type')}>
                <option value="OFFLINE">Offline (In-person)</option>
                <option value="ONLINE">Online (Telemedicine)</option>
              </select>
            </Field>
          </div>
        </div>

        {isOnline && (
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Telemedicine</div>
            <div className="space-y-4">
              <Field label="Meeting Provider">
                <select className="input" value={form.meeting_provider} onChange={set('meeting_provider')}>
                  <option value="GOOGLE_MEET">Google Meet</option>
                  <option value="ZOOM">Zoom</option>
                </select>
              </Field>
              <Field label="Meeting Link"><input className="input" value={form.meeting_link} onChange={set('meeting_link')} placeholder="https://meet.google.com/…" /></Field>
            </div>
          </div>
        )}

        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Clinical</div>
          <div className="space-y-4">
            <Field label="Chief Complaint"><textarea className="input resize-none" rows={2} value={form.chief_complaint} onChange={set('chief_complaint')} placeholder="Primary reason for visit" /></Field>
            <Field label="Symptoms" hint="Comma-separated"><input className="input" value={form.symptoms} onChange={set('symptoms')} placeholder="headache, fever, nausea" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Consultation Fee (₹)"><input type="number" className="input" value={form.consultation_fee} onChange={set('consultation_fee')} placeholder="0" min="0" /></Field>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300" checked={form.is_followup} onChange={set('is_followup')} />
                  <span className="text-sm text-slate-600">Follow-up appointment</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
}

function StatsRow({ stats }) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {[
        { label: 'Total',     value: stats.total,     bg: 'bg-slate-100', text: 'text-slate-700' },
        { label: 'Pending',   value: stats.pending,   bg: 'bg-amber-50',  text: 'text-amber-700' },
        { label: 'Confirmed', value: stats.confirmed, bg: 'bg-brand-50',  text: 'text-brand-700' },
        { label: 'Completed', value: stats.completed, bg: 'bg-teal-50',   text: 'text-teal-700'  },
        { label: 'Cancelled', value: stats.cancelled, bg: 'bg-red-50',    text: 'text-red-700'   },
        { label: 'Revenue',   value: `₹${((stats.revenue||0)/1000).toFixed(1)}K`, bg: 'bg-slate-900', text: 'text-white' },
      ].map(({ label, value, bg, text }) => (
        <div key={label} className={`${bg} rounded-xl px-3 py-2.5 text-center`}>
          <div className={`text-xl font-display ${text}`}>{value}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function AppointmentsModule({ role = 'admin', doctorId, patientId }) {
  const [appts, setAppts]           = useState([]);
  const [stats, setStats]           = useState(null);
  const [busy, setBusy]             = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected]     = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const { show, ToastEl }           = useToast();

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [data, s] = await Promise.all([
        doctorId  ? getAppointmentsByDoctor(doctorId)   :
        patientId ? getAppointmentsByPatient(patientId) :
        getAllAppointments(),
        getAppointmentStats(),
      ]);
      setAppts(data); setStats(s);
    } finally { setBusy(false); }
  }, [doctorId, patientId]);

  useEffect(() => { load(); }, [load]);
  const handleAction = (msg) => { show(msg); load(); };

  const displayed = appts.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      N.patientName(a).toLowerCase().includes(q) ||
      N.doctorName(a).toLowerCase().includes(q)  ||
      (a.specialization || a.service || '').toLowerCase().includes(q) ||
      (a.chief_complaint || a.notes || '').toLowerCase().includes(q);
    const aStatus = (N.status(a)).toUpperCase();
    const aType   = (N.aptType(a)).toUpperCase();
    const matchStatus = filter === 'all'     || aStatus === filter.toUpperCase();
    const matchType   = typeFilter === 'all' || aType   === typeFilter.toUpperCase();
    return matchSearch && matchStatus && matchType;
  });

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-5 page-enter">
      {ToastEl}
      <PageHeader
        title="Appointments"
        subtitle={`${appts.length} total · ${appts.filter((a) => N.status(a).toUpperCase() === 'PENDING').length} pending`}
        action={role !== 'patient' ? (
          <button className="btn-primary btn-sm gap-1.5" onClick={() => setShowForm(true)}>
            <Icon name="plus" className="w-4 h-4" /> New Appointment
          </button>
        ) : null}
      />

      <StatsRow stats={stats} />

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search patient, doctor, complaint…" className="sm:w-72" />
        <FilterTab value={filter} onChange={setFilter} options={[
          { label: 'All', value: 'all' },
          { label: 'Pending',     value: 'PENDING'    },
          { label: 'Confirmed',   value: 'CONFIRMED'  },
          { label: 'In Progress', value: 'IN_PROGRESS'},
          { label: 'Completed',   value: 'COMPLETED'  },
          { label: 'Cancelled',   value: 'CANCELLED'  },
          { label: 'No Show',     value: 'NO_SHOW'    },
        ]} />
        <FilterTab value={typeFilter} onChange={setTypeFilter} options={[
          { label: 'All Types', value: 'all'     },
          { label: 'Online',    value: 'ONLINE'  },
          { label: 'Offline',   value: 'OFFLINE' },
        ]} />
      </div>

      <div className="card !p-0">
        {displayed.length === 0 ? (
          <EmptyState icon="calendar" title="No appointments found" desc="Try adjusting your filters or search." />
        ) : (
          <div className="table-wrapper border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Apt #</th><th>Patient</th>
                  {role !== 'patient' && <th>Doctor</th>}
                  <th>Date</th><th>Time Slot</th><th>Type</th><th>Fee</th><th>Status</th>
                  {role !== 'patient' && <th>Payment</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((a) => {
                  const aptType = N.aptType(a);
                  const aptSt   = N.status(a);
                  const timeSlot = N.endTime(a) ? `${N.startTime(a)} – ${N.endTime(a)}` : N.startTime(a);
                  return (
                    <tr key={a.id} className="cursor-pointer" onClick={() => setSelected(a)}>
                      <td className="text-xs font-mono text-slate-400">{N.aptNum(a)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={N.patientName(a)} size="xs" />
                          <span className="text-xs font-medium text-slate-800 whitespace-nowrap">{N.patientName(a)}</span>
                        </div>
                      </td>
                      {role !== 'patient' && <td className="text-xs text-slate-500 whitespace-nowrap">{N.doctorName(a)}</td>}
                      <td className="text-xs text-slate-500 whitespace-nowrap">{N.aptDate(a)}</td>
                      <td className="text-xs text-slate-500 whitespace-nowrap">{timeSlot}</td>
                      <td><span className={`badge ${aptType.includes('ONLINE') || aptType === 'Online' ? 'badge-blue' : 'badge-slate'}`}>{TYPE_LABEL[aptType] || aptType}</span></td>
                      <td className="text-xs font-semibold text-slate-700">₹{N.fee(a)}</td>
                      <td><StatusBadge status={aptSt} /></td>
                      {role !== 'patient' && <td><StatusBadge status={N.payStatus(a)} /></td>}
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button onClick={() => setSelected(a)} className="text-brand-600 hover:text-brand-800 text-xs font-medium">View</button>
                          {(aptSt === 'PENDING' || aptSt === 'pending') && role !== 'patient' && (
                            <button onClick={async (e) => { e.stopPropagation(); await approveAppointment(a.id); handleAction('Confirmed'); }}
                              className="text-teal-600 hover:text-teal-800 text-xs font-medium">Confirm</button>
                          )}
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

      {selected && <AppointmentDrawer appt={selected} onClose={() => setSelected(null)} onAction={handleAction} />}
      {showForm && <NewAppointmentForm onClose={() => setShowForm(false)} onCreated={(msg) => { setShowForm(false); handleAction(msg); }} />}
    </div>
  );
}
