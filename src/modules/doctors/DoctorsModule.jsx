import { useState, useEffect, useCallback } from 'react';
import Avatar from '../../components/common/Avatar';
import StatusBadge from '../../components/common/StatusBadge';
import Icon from '../../components/common/Icon';
import { PageSpinner } from '../../components/common/Spinner';
import {
  PageHeader, SearchBar, FilterTab, EmptyState,
  ConfirmModal, FormModal, Field, useToast,
} from '../shared';
import {
  getAllDoctors, createDoctor, updateDoctor, updateDoctorStatus,
  deleteDoctor, SPECIALIZATIONS, getDoctorStats,
} from '../../services/doctorService';
import {
  getAllLeaves, createLeave, approveLeave, deleteLeave,
} from '../../services/doctorLeaveService';

// ─── Doctor Leaves Tab ────────────────────────────────────────────────────────
function DoctorLeavesTab() {
  const [leaves, setLeaves]     = useState([]);
  const [doctors, setDoctors]   = useState([]);
  const [busy, setBusy]         = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ doctor_id: '', doctor_name: '', leave_date: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setBusy(true);
    const [l, d] = await Promise.all([getAllLeaves(), getAllDoctors()]);
    setLeaves(l.sort((a, b) => a.leave_date.localeCompare(b.leave_date)));
    setDoctors(d);
    setBusy(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const selectDoctor = (e) => {
    const d = doctors.find(d => d.id === Number(e.target.value));
    setForm(f => ({ ...f, doctor_id: e.target.value, doctor_name: d ? (d.name || `Dr. ${d.first_name} ${d.last_name}`) : '' }));
  };

  const submit = async () => {
    if (!form.doctor_id || !form.leave_date) { toast.error('Doctor and leave date are required'); return; }
    setSaving(true);
    try {
      await createLeave({ ...form, doctor_id: Number(form.doctor_id) });
      toast.success('Leave marked');
      setShowForm(false);
      setForm({ doctor_id: '', doctor_name: '', leave_date: '', reason: '' });
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleApprove = async (id) => {
    await approveLeave(id);
    toast.success('Leave approved');
    load();
  };

  const handleDelete = async () => {
    await deleteLeave(deleteTarget.id);
    setDeleteTarget(null);
    toast.success('Leave removed');
    load();
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = leaves.filter(l => l.leave_date >= today);
  const past     = leaves.filter(l => l.leave_date < today);

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-display text-base text-slate-900">Doctor Leaves</h4>
          <p className="text-xs text-slate-400 mt-0.5">{upcoming.length} upcoming, {past.length} past</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary btn-sm gap-1.5">
          <Icon name="plus" className="w-3.5 h-3.5" /> Mark Leave
        </button>
      </div>

      {leaves.length === 0 ? (
        <EmptyState icon="calendar" title="No leaves recorded" desc="Mark a doctor's leave using the button above." />
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Upcoming</div>
              <div className="card !p-0">
                <div className="table-wrapper border-0">
                  <table className="data-table">
                    <thead><tr><th>Doctor</th><th>Leave Date</th><th>Reason</th><th>Approved By</th><th>Actions</th></tr></thead>
                    <tbody>
                      {upcoming.map(l => (
                        <tr key={l.id}>
                          <td>
                            <div className="flex items-center gap-2">
                              <Avatar name={l.doctor_name} size="sm" />
                              <span className="text-xs font-medium text-slate-800">{l.doctor_name}</span>
                            </div>
                          </td>
                          <td className="text-xs text-slate-700 font-medium">{l.leave_date}</td>
                          <td className="text-xs text-slate-500">{l.reason || '—'}</td>
                          <td>
                            {l.approved_by
                              ? <span className="text-xs text-teal-600 font-medium">✓ {l.approved_by}</span>
                              : <span className="text-xs text-amber-500">Pending</span>}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              {!l.approved_by && (
                                <button onClick={() => handleApprove(l.id)} className="text-xs text-teal-600 hover:underline font-medium">Approve</button>
                              )}
                              <button onClick={() => setDeleteTarget(l)} className="text-xs text-red-400 hover:text-red-600 font-medium">Remove</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Past</div>
              <div className="card !p-0">
                <div className="table-wrapper border-0">
                  <table className="data-table">
                    <thead><tr><th>Doctor</th><th>Leave Date</th><th>Reason</th><th>Approved By</th></tr></thead>
                    <tbody>
                      {past.slice(0, 10).map(l => (
                        <tr key={l.id}>
                          <td className="text-xs font-medium text-slate-600">{l.doctor_name}</td>
                          <td className="text-xs text-slate-400">{l.leave_date}</td>
                          <td className="text-xs text-slate-400">{l.reason || '—'}</td>
                          <td className="text-xs text-slate-400">{l.approved_by || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showForm && (
        <FormModal title="Mark Doctor Leave" onClose={() => setShowForm(false)} onSubmit={submit} loading={saving}>
          <Field label="Doctor *">
            <select className="input" value={form.doctor_id} onChange={selectDoctor}>
              <option value="">Select doctor…</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name || `Dr. ${d.first_name} ${d.last_name}`}</option>)}
            </select>
          </Field>
          <Field label="Leave Date *">
            <input className="input" type="date" value={form.leave_date} onChange={set('leave_date')} min={today} />
          </Field>
          <Field label="Reason">
            <input className="input" placeholder="e.g. Medical conference, personal leave…" value={form.reason} onChange={set('reason')} />
          </Field>
        </FormModal>
      )}
      {deleteTarget && (
        <ConfirmModal
          title="Remove Leave"
          message={`Remove leave for ${deleteTarget.doctor_name} on ${deleteTarget.leave_date}?`}
          confirmLabel="Remove"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Doctor Detail Panel ───────────────────────────────────────────────────────
function DoctorDrawer({ doctor, onClose, onEdit, onStatusChange }) {
  if (!doctor) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl animate-slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="font-display text-lg text-slate-900">Doctor Profile</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <Avatar name={doctor.name} size="xl" />
            <div>
              <h4 className="font-display text-xl text-slate-900">{doctor.name}</h4>
              <p className="text-sm text-slate-500">{doctor.specialization}</p>
              <div className="mt-1"><StatusBadge status={doctor.is_active !== false ? 'active' : 'inactive'} /></div>
            </div>
          </div>

          {/* Info grid */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-sm">
            {[
              { label: 'Email',                value: doctor.email },
              { label: 'Phone',                value: doctor.phone },
              { label: 'Alternate Phone',      value: doctor.alternate_phone || '—' },
              { label: 'Qualification',        value: doctor.qualification },
              { label: 'Registration No.',     value: doctor.registration_number || doctor.license_number || '—' },
              { label: 'Experience',           value: `${doctor.experience_years ?? doctor.experience ?? 0} years` },
              { label: 'Consultation Fee',     value: `₹${doctor.consultation_fee ?? doctor.fee ?? 0}` },
              { label: 'Follow-up Fee',        value: `₹${doctor.followup_fee ?? 0}` },
              { label: 'Slot Duration',        value: `${doctor.slot_duration ?? 30} min` },
              { label: 'Max Appts/Day',        value: doctor.max_appointments_per_day ?? 20 },
              { label: 'Available Days',       value: Array.isArray(doctor.available_days) ? doctor.available_days.join(', ') : (doctor.available_days || '—') },
              { label: 'Online Consultations', value: doctor.is_online_available ? 'Yes' : 'No' },
              { label: 'Meeting Provider',     value: doctor.meeting_provider || '—' },
              { label: 'Chamber',              value: doctor.chamber || '—' },
              { label: 'Verified',             value: doctor.is_verified ? 'Yes ✓' : 'Not verified' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-start gap-2">
                <span className="text-slate-400 flex-shrink-0">{label}</span>
                <span className="font-medium text-slate-700 text-right">{value}</span>
              </div>
            ))}
          </div>

          {/* Bio */}
          {doctor.bio && (
            <div className="bg-brand-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-brand-600 mb-1">BIO</p>
              <p className="text-sm text-slate-700">{doctor.bio}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => { onClose(); onEdit(doctor); }} className="btn-secondary flex-1 gap-2">
              <Icon name="settings" className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => {
                onStatusChange(doctor.id, doctor.is_active === false);
                onClose();
              }}
              className={`flex-1 btn ${doctor.is_active !== false ? 'btn-danger' : 'btn-primary'}`}
            >
              {doctor.is_active !== false ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Doctor Form — aligned to doctors + users tables ──────────────────────────
function DoctorForm({ initial, onClose, onSaved }) {
  const editing = !!initial;
  const blank = {
    // users table fields
    first_name: '', last_name: '', email: '', phone: '', alternate_phone: '',
    profile_photo: null, preferred_language: 'en',
    gender: 'MALE', date_of_birth: '',
    // doctors table fields — exact column names
    registration_number: '',      // NOT license_number — schema is registration_number
    specialization: '', qualification: '',
    experience_years: '',         // numeric(3,1) in schema
    consultation_fee: '',         // numeric(10,2)
    followup_fee: '',             // numeric(10,2) DEFAULT 0
    available_days: 'MON,TUE,WED,THU,FRI',  // jsonb in schema
    slot_duration: '30',          // integer DEFAULT 15
    max_appointments_per_day: '20', // integer DEFAULT 20
    is_online_available: true,    // boolean DEFAULT true
    video_consultation_link: '',
    meeting_provider: 'GOOGLE_MEET', // ZOOM | GOOGLE_MEET
    // doctors table booleans
    is_verified: false,           // doctors.is_verified boolean DEFAULT false
    // display/computed helpers (not schema columns)
    designation: '', chamber: '', bio: '',
  };

  const toForm = (d) => ({
    ...blank,
    first_name:    d.first_name   || (d.name || '').replace('Dr. ', '').split(' ')[0] || '',
    last_name:     d.last_name    || (d.name || '').replace('Dr. ', '').split(' ').slice(1).join(' ') || '',
    profile_photo: d.profile_photo || null,
    preferred_language: d.preferred_language || 'en',
    email:         d.email        || '',
    phone:         d.phone        || '',
    alternate_phone: d.alternate_phone || '',
    gender:        d.gender       || 'MALE',
    date_of_birth: d.date_of_birth || '',
    registration_number: d.registration_number || d.license_number || '',
    specialization: d.specialization || '',
    qualification: d.qualification  || '',
    experience_years: String(d.experience_years || d.experience || ''),
    consultation_fee: String(d.consultation_fee || d.fee || ''),
    followup_fee: String(d.followup_fee || ''),
    available_days: Array.isArray(d.available_days) ? d.available_days.join(',') : (d.available_days || 'MON,TUE,WED,THU,FRI'),
    slot_duration: String(d.slot_duration || '30'),
    max_appointments_per_day: String(d.max_appointments_per_day || '20'),
    is_online_available: d.is_online_available !== false,
    video_consultation_link: d.video_consultation_link || '',
    meeting_provider: d.meeting_provider || 'GOOGLE_MEET',
    is_verified: d.is_verified || false,
    designation: d.designation || '',
    chamber: d.chamber || '',
    bio: d.bio || '',
  });

  const [form, setForm] = useState(editing ? toForm(initial) : blank);
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState('');
  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const submit = async () => {
    if (!form.first_name || !form.email || !form.specialization || !form.registration_number) {
      setErr('First name, email, specialization and registration number are required.'); return;
    }
    setErr(''); setBusy(true);
    try {
      const payload = {
        ...form,
        name: `Dr. ${form.first_name} ${form.last_name}`.trim(),
        experience_years: Number(form.experience_years) || 0,
        consultation_fee: Number(form.consultation_fee) || 0,
        followup_fee:     Number(form.followup_fee)     || 0,
        slot_duration:    Number(form.slot_duration)    || 30,
        max_appointments_per_day: Number(form.max_appointments_per_day) || 20,
        available_days: form.available_days ? form.available_days.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean) : ['MON','TUE','WED','THU','FRI'],
        is_verified: form.is_verified,
      };
      if (editing) await updateDoctor(initial.id, payload);
      else await createDoctor(payload);
      onSaved(editing ? 'Doctor record updated' : 'Doctor registered successfully');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <FormModal
      title={editing ? 'Edit Doctor Record' : 'Register New Doctor'}
      onClose={onClose} onSubmit={submit} loading={busy} wide
      submitLabel={editing ? 'Save Changes' : 'Register Doctor'}
    >
      <div className="space-y-5">
        {err && <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">{err}</div>}

        {/* Section 1 — Personal (users table) */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Personal Information</div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required>
                <input className="input" value={form.first_name} onChange={set('first_name')} placeholder="First name" />
              </Field>
              <Field label="Last Name">
                <input className="input" value={form.last_name} onChange={set('last_name')} placeholder="Last name" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Gender">
                <select className="input" value={form.gender} onChange={set('gender')}>
                  {['MALE','FEMALE','OTHER'].map((g) => <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>)}
                </select>
              </Field>
              <Field label="Date of Birth">
                <input type="date" className="input" value={form.date_of_birth} onChange={set('date_of_birth')} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email Address" required>
                <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="doctor@hospital.com" />
              </Field>
              <Field label="Phone Number">
                <input className="input" value={form.phone} onChange={set('phone')} placeholder="+91 98100 00000" />
              </Field>
            </div>
            <Field label="Alternate Phone">
              <input className="input" value={form.alternate_phone} onChange={set('alternate_phone')} placeholder="+91 98100 00000" />
            </Field>
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

        {/* Section 2 — Professional (doctors table) */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Professional Credentials</div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Specialization" required>
                <select className="input" value={form.specialization} onChange={set('specialization')}>
                  <option value="">Select specialization…</option>
                  {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Qualification" required hint="e.g. MBBS, MD (Cardiology)">
                <input className="input" value={form.qualification} onChange={set('qualification')} placeholder="MBBS, MD…" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Registration Number" required hint="doctors.registration_number — MCI / State Council">
                <input className="input font-mono" value={form.registration_number} onChange={set('registration_number')} placeholder="MCI-DL-YYYY-0000" />
              </Field>
              <Field label="Experience (years)" hint="Stored as numeric(3,1) — e.g. 5.5">
                <input type="number" step="0.5" className="input" value={form.experience_years} onChange={set('experience_years')} min="0" placeholder="0" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Designation" hint="Display title — not in schema column, display only">
                <input className="input" value={form.designation} onChange={set('designation')} placeholder="e.g. Senior Cardiologist" />
              </Field>
              <Field label="OPD Chamber / Room">
                <input className="input" value={form.chamber} onChange={set('chamber')} placeholder="OPD Room 1" />
              </Field>
            </div>
            <Field label="Bio / Professional Summary">
              <textarea className="input resize-none" rows={3} value={form.bio} onChange={set('bio')} placeholder="Brief professional bio…" />
            </Field>
          </div>
        </div>

        {/* Section 3 — Consultation settings (doctors table columns) */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Consultation Settings</div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Consultation Fee (₹)" hint="doctors.consultation_fee">
                <input type="number" className="input" value={form.consultation_fee} onChange={set('consultation_fee')} min="0" placeholder="0" />
              </Field>
              <Field label="Follow-up Fee (₹)" hint="doctors.followup_fee — DEFAULT 0">
                <input type="number" className="input" value={form.followup_fee} onChange={set('followup_fee')} min="0" placeholder="0" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Slot Duration (min)" hint="doctors.slot_duration — DEFAULT 15">
                <input type="number" className="input" value={form.slot_duration} onChange={set('slot_duration')} min="5" step="5" placeholder="30" />
              </Field>
              <Field label="Max Appts / Day" hint="doctors.max_appointments_per_day">
                <input type="number" className="input" value={form.max_appointments_per_day} onChange={set('max_appointments_per_day')} min="1" placeholder="20" />
              </Field>
            </div>
            <Field label="Available Days" hint="doctors.available_days jsonb — comma-separated: MON,TUE,WED,THU,FRI">
              <input className="input font-mono" value={form.available_days} onChange={set('available_days')} placeholder="MON,TUE,WED,THU,FRI" />
            </Field>
          </div>
        </div>

        {/* Section 4 — Telemedicine (doctors table columns) */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Telemedicine</div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isOnline" className="w-4 h-4 rounded border-slate-300" checked={form.is_online_available} onChange={set('is_online_available')} />
              <label htmlFor="isOnline" className="text-sm text-slate-700 cursor-pointer">doctors.is_online_available — Accept online appointments</label>
            </div>
            {form.is_online_available && (
              <>
                <Field label="Meeting Provider" hint="doctors.meeting_provider — ZOOM or GOOGLE_MEET">
                  <select className="input" value={form.meeting_provider} onChange={set('meeting_provider')}>
                    <option value="GOOGLE_MEET">Google Meet</option>
                    <option value="ZOOM">Zoom</option>
                  </select>
                </Field>
                <Field label="Video Consultation Link" hint="doctors.video_consultation_link">
                  <input className="input" value={form.video_consultation_link} onChange={set('video_consultation_link')} placeholder="https://meet.google.com/…" />
                </Field>
              </>
            )}
          </div>
        </div>

        {/* Section 5 — Admin verification (doctors.is_verified) */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Verification</div>
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <input
              type="checkbox"
              id="isVerified"
              className="w-4 h-4 rounded border-slate-300"
              checked={form.is_verified}
              onChange={(e) => setForm((f) => ({ ...f, is_verified: e.target.checked }))}
            />
            <label htmlFor="isVerified" className="cursor-pointer">
              <div className="text-sm font-medium text-slate-700">Mark as Verified (doctors.is_verified)</div>
              <div className="text-xs text-slate-400">Admin-only. Grants verified badge on doctor profile.</div>
            </label>
          </div>
        </div>
      </div>
    </FormModal>
  );
}

// ─── Doctor Card (grid view) ──────────────────────────────────────────────────
function DoctorCard({ doctor, onClick }) {
  const exp = doctor.experience_years ?? doctor.experience ?? 0;
  const fee = doctor.consultation_fee ?? doctor.fee ?? 0;
  const name = doctor.name || `Dr. ${doctor.first_name || ''} ${doctor.last_name || ''}`.trim();
  return (
    <div
      className="card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer animate-slide-up"
      onClick={() => onClick(doctor)}
    >
      <div className="flex items-start gap-3 mb-4">
        <Avatar name={name} size="lg" />
        <div className="flex-1 min-w-0">
          <h4 className="font-display text-base text-slate-900 leading-tight">{name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{doctor.specialization}</p>
          <div className="mt-1.5 flex gap-1.5 flex-wrap">
            <StatusBadge status={doctor.is_active !== false ? 'active' : 'inactive'} />
            {doctor.is_online_available && <span className="badge badge-blue text-[10px]">Online</span>}
            {doctor.is_verified && <span className="badge badge-green text-[10px]">Verified</span>}
          </div>
        </div>
      </div>
      <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-50 pt-3">
        <div className="flex justify-between"><span className="text-slate-400">Qualification</span><span className="font-medium">{doctor.qualification || '—'}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Reg. No.</span><span className="font-mono text-[10px] text-slate-600">{doctor.registration_number || doctor.license_number || '—'}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Experience</span><span className="font-medium">{exp} years</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Consult Fee</span><span className="font-semibold text-slate-700">₹{fee}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Follow-up</span><span className="text-slate-600">₹{doctor.followup_fee ?? 0}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Slot</span><span>{doctor.slot_duration ?? 30} min · max {doctor.max_appointments_per_day ?? 20}/day</span></div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
        <span className="text-amber-500 text-xs font-medium">{doctor.rating ? `★ ${doctor.rating}` : '—'}</span>
        <span className="text-xs text-slate-400">{doctor.chamber || '—'}</span>
      </div>
    </div>
  );
}

// ─── Main Doctors Module ───────────────────────────────────────────────────────
export default function DoctorsModule() {
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats]     = useState(null);
  const [busy, setBusy]       = useState(true);
  const [search, setSearch]   = useState('');
  const [specFilter, setSpecFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView]       = useState('grid'); // 'grid' | 'table'
  const [selected, setSelected] = useState(null);
  const [editing, setEditing]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { show, ToastEl }     = useToast();
  const [activeTab, setActiveTab] = useState('doctors');

  const load = useCallback(async () => {
    setBusy(true);
    const [d, s] = await Promise.all([getAllDoctors(), getDoctorStats()]);
    setDoctors(d); setStats(s);
    setBusy(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaved = (msg) => { setShowForm(false); setEditing(null); show(msg); load(); };
  const handleStatusChange = async (id, is_active) => {
    await updateDoctorStatus(id, is_active);
    show(`Doctor ${is_active ? 'activated' : 'deactivated'}`);
    load();
  };

  const specializations = ['all', ...new Set(doctors.map((d) => d.specialization))];

  const displayed = doctors.filter((d) => {
    const dName = d.name || `Dr. ${d.first_name || ''} ${d.last_name || ''}`.trim();
    const matchS = !search || dName.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase()) || (d.registration_number || '').toLowerCase().includes(search.toLowerCase());
    const matchSpec = specFilter === 'all' || d.specialization === specFilter;
    const matchSt   = statusFilter === 'all' || (statusFilter === 'active' ? d.is_active !== false : !d.is_active);
    return matchS && matchSpec && matchSt;
  });

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-5 page-enter">
      {ToastEl}

      <PageHeader
        title="Doctors"
        subtitle={`${stats?.total || 0} registered · ${stats?.active || 0} active`}
        action={
          <button className="btn-primary btn-sm gap-1.5" onClick={() => setShowForm(true)}>
            <Icon name="plus" className="w-4 h-4" /> Add Doctor
          </button>
        }
      />


      {/* Module Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        {[
          { id: 'doctors', label: 'Doctors' },
          { id: 'leaves',  label: 'Leave Management' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`text-sm pb-2 border-b-2 font-medium transition-colors -mb-px ${activeTab === t.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'leaves' ? <DoctorLeavesTab /> : (
      <>{/* Doctors content start */}
      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total',    value: stats.total,    bg: 'bg-slate-100',   text: 'text-slate-700' },
            { label: 'Active',   value: stats.active,   bg: 'bg-teal-50',     text: 'text-teal-700'  },
            { label: 'On Leave', value: stats.onLeave,  bg: 'bg-amber-50',    text: 'text-amber-700' },
            { label: 'Inactive', value: stats.inactive, bg: 'bg-red-50',      text: 'text-red-700'   },
          ].map(({ label, value, bg, text }) => (
            <div key={label} className={`${bg} rounded-xl px-4 py-3 text-center`}>
              <div className={`text-2xl font-display ${text}`}>{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or specialization…" className="sm:w-72" />
        <div className="flex gap-2 flex-wrap flex-1">
          <FilterTab value={statusFilter} onChange={setStatusFilter} options={['all','active','on-leave','inactive']} />
        </div>
        {/* View toggle */}
        <div className="flex gap-1 border border-slate-200 rounded-xl p-1 flex-shrink-0">
          {[['grid','star'],['table','chart']].map(([v, icon]) => (
            <button key={v} onClick={() => setView(v)} className={`w-8 h-7 rounded-lg flex items-center justify-center transition-all ${view === v ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}>
              <Icon name={icon} className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Spec filter chips */}
      <div className="flex gap-2 flex-wrap">
        {specializations.slice(0, 8).map((s) => (
          <button
            key={s}
            onClick={() => setSpecFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${specFilter === s ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}
          >
            {s === 'all' ? 'All Specializations' : s}
          </button>
        ))}
      </div>

      {/* Content */}
      {displayed.length === 0 ? (
        <EmptyState icon="doctor" title="No doctors found" desc="Try adjusting your search or filters." action={<button className="btn-primary btn-sm" onClick={() => setShowForm(true)}>Add first doctor</button>} />
      ) : view === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayed.map((d, i) => <DoctorCard key={d.id} doctor={d} onClick={setSelected} />)}
        </div>
      ) : (
        <div className="card !p-0">
          <div className="table-wrapper border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Qualification</th>
                  <th>Exp.</th>
                  <th>Fee</th>
                  <th>Patients</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((d) => (
                  <tr key={d.id} className="cursor-pointer" onClick={() => setSelected(d)}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={d.name || `Dr. ${d.first_name||''} ${d.last_name||''}`} size="sm" />
                        <div>
                          <div className="text-sm font-medium text-slate-800">{d.name || `Dr. ${d.first_name||''} ${d.last_name||''}`}</div>
                          <div className="text-xs text-slate-400">{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-slate-600">{d.specialization}</td>
                    <td className="text-xs text-slate-500">{d.qualification}</td>
                    <td className="text-xs text-slate-600">{d.experience_years ?? d.experience ?? 0}y</td>
                    <td className="text-xs font-semibold text-slate-700">₹{d.consultation_fee ?? d.fee ?? 0}</td>
                    <td className="text-xs text-slate-600">{d.patients_count ?? d.patients ?? 0}</td>
                    <td className="text-xs text-amber-500 font-medium">{d.rating ? `★ ${d.rating}` : '—'}</td>
                    <td><StatusBadge status={d.is_active !== false ? 'active' : 'inactive'} /></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditing(d); setShowForm(true); }} className="text-brand-600 hover:text-brand-800 text-xs font-medium">Edit</button>
                        <button
                          onClick={() => handleStatusChange(d.id, d.is_active === false)}
                          className={`text-xs font-medium ${d.is_active !== false ? 'text-red-500 hover:text-red-700' : 'text-teal-600 hover:text-teal-800'}`}
                        >
                          {d.is_active !== false ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      </> )} {/* end leaves conditional */}
      {activeTab !== 'leaves' && selected && (
        <DoctorDrawer
          doctor={selected}
          onClose={() => setSelected(null)}
          onEdit={(d) => { setEditing(d); setShowForm(true); }}
          onStatusChange={handleStatusChange}
        />
      )}
      {showForm && (
        <DoctorForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
