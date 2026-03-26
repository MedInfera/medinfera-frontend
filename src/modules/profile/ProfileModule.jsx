// ─── Profile Module — schema-exact field names for all roles ──────────────────
// users table: first_name, last_name, email, phone, alternate_phone,
//              profile_photo, preferred_language
// doctors extra: registration_number, specialization, qualification,
//                experience_years, consultation_fee, followup_fee,
//                slot_duration, max_appointments_per_day, is_online_available,
//                meeting_provider, video_consultation_link, is_verified
// patients extra: date_of_birth, gender, blood_group, allergies,
//                 chronic_diseases, current_medications, emergency_contact_*
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../components/common/Avatar';
import Icon from '../../components/common/Icon';
import { PageHeader, Field, useToast } from '../shared';

const GENDER_OPTIONS    = ['MALE', 'FEMALE', 'OTHER'];
const BLOOD_GROUPS      = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'];
const LANGUAGE_OPTIONS  = [
  { value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi'   },
  { value: 'ta', label: 'Tamil'   }, { value: 'te', label: 'Telugu'  },
  { value: 'bn', label: 'Bengali' }, { value: 'mr', label: 'Marathi' },
];
const RELATIONS         = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Guardian', 'Other'];
const MEETING_PROVIDERS = ['ZOOM', 'GOOGLE_MEET'];

const toArr  = (val) => Array.isArray(val) ? val.join(', ') : (val || '');
const fromArr = (text) => (text || '').split(',').map((s) => s.trim()).filter(Boolean);

export default function ProfileModule() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { show, ToastEl } = useToast();

  const isDoctor     = user?.role === 'doctor';
  const isPatient    = user?.role === 'patient';
  const isStaff      = user?.role === 'staff';
  const isPharmacist = user?.role === 'pharmacist';

  // ── All field names match DB columns exactly ────────────────────────────────
  const [form, setForm] = useState({
    // ── users table ──────────────────────────────────────────────────────────
    first_name:         user?.first_name || (user?.name || '').split(' ')[0] || '',
    last_name:          user?.last_name  || (user?.name || '').split(' ').slice(1).join(' ') || '',
    email:              user?.email          || '',
    phone:              user?.phone          || '',
    alternate_phone:    user?.alternate_phone|| '',
    profile_photo:      user?.profile_photo  || null,
    preferred_language: user?.preferred_language || 'en',
    // ── doctors table ────────────────────────────────────────────────────────
    registration_number:     user?.registration_number     || '',
    specialization:          user?.specialization          || '',
    qualification:           user?.qualification           || '',
    experience_years:        String(user?.experience_years || user?.experience || ''),
    consultation_fee:        String(user?.consultation_fee || ''),
    followup_fee:            String(user?.followup_fee     || ''),
    slot_duration:           String(user?.slot_duration    || '30'),
    max_appointments_per_day:String(user?.max_appointments_per_day || '20'),
    is_online_available:     user?.is_online_available !== false,
    meeting_provider:        user?.meeting_provider || 'GOOGLE_MEET',
    video_consultation_link: user?.video_consultation_link || '',
    // is_verified is admin-controlled, shown read-only
    // ── patients table ────────────────────────────────────────────────────────
    date_of_birth:      user?.date_of_birth || user?.dob || '',
    gender:             (user?.gender || 'MALE').toUpperCase(),
    blood_group:        user?.blood_group   || 'UNKNOWN',
    // jsonb arrays displayed as comma-separated text
    allergies_text:           toArr(user?.allergies),
    chronic_diseases_text:    toArr(user?.chronic_diseases),
    current_medications_text: toArr(user?.current_medications),
    emergency_contact_name:     user?.emergency_contact_name     || '',
    emergency_contact_phone:    user?.emergency_contact_phone    || '',
    emergency_contact_relation: user?.emergency_contact_relation || 'Spouse',
  });

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving]   = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const set   = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };
  const setPw  = (k) => (e) => setPwForm((f) => ({ ...f, [k]: e.target.value }));

  const saveProfile = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    show('Profile updated successfully');
  };

  const changePassword = async () => {
    if (pwForm.next !== pwForm.confirm) { show('New passwords do not match', 'error'); return; }
    if (pwForm.next.length < 6)         { show('Password must be at least 6 characters', 'error'); return; }
    setSavingPw(true);
    await new Promise((r) => setTimeout(r, 700));
    setSavingPw(false);
    setPwForm({ current: '', next: '', confirm: '' });
    show('Password changed successfully');
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const displayName = () => [form.first_name, form.last_name].filter(Boolean).join(' ') || user?.name || 'User';

  const SectionTitle = ({ children }) => (
    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100 mt-5">{children}</div>
  );

  return (
    <div className="space-y-6 page-enter max-w-3xl">
      {ToastEl}
      <PageHeader title="My Profile" subtitle="Manage your account and personal information" />

      {/* Avatar + role banner */}
      <div className="card bg-gradient-to-r from-slate-800 to-slate-900 !border-0 text-white flex items-center gap-5">
        <Avatar name={displayName()} size="xl" className="ring-4 ring-white/20" />
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-2xl text-white">{displayName()}</h2>
          <p className="text-slate-400 text-sm mt-0.5">{user?.designation || user?.role?.toUpperCase()}</p>
          <div className="flex gap-2 mt-3">
            <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full font-medium capitalize">{user?.role}</span>
            <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">{user?.hospital}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-xl transition-colors flex-shrink-0">
          <Icon name="logout" className="w-4 h-4" /> Sign out
        </button>
      </div>

      {/* ── Personal & Contact (users table) ─────────────────────────────────── */}
      <div className="card">
        <h3 className="font-display text-base text-slate-900 mb-1">Personal Information</h3>
        <p className="text-xs text-slate-400 mb-4">users table fields</p>
        <div className="space-y-4">

          {/* profile_photo */}
          <div>
            <label className="label">Profile Photo <span className="text-slate-400 font-normal">(users.profile_photo)</span></label>
            <div className="flex items-center gap-4">
              <Avatar name={displayName()} size="lg" />
              <div className="flex-1">
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
                <p className="text-xs text-slate-400 mt-1">JPG, PNG or GIF. Stored as users.profile_photo (text/URL)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" hint="users.first_name">
              <input className="input" value={form.first_name} onChange={set('first_name')} placeholder="First name" />
            </Field>
            <Field label="Last Name" hint="users.last_name">
              <input className="input" value={form.last_name} onChange={set('last_name')} placeholder="Last name" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email Address" hint="users.email">
              <input type="email" className="input" value={form.email} onChange={set('email')} />
            </Field>
            <Field label="Phone" hint="users.phone NOT NULL">
              <input className="input" value={form.phone} onChange={set('phone')} placeholder="+91 98100 00000" />
            </Field>
          </div>

          <Field label="Alternate Phone" hint="users.alternate_phone">
            <input className="input" value={form.alternate_phone} onChange={set('alternate_phone')} placeholder="+91 98100 00000 (optional)" />
          </Field>

          <Field label="Preferred Language" hint="users.preferred_language DEFAULT 'en'">
            <select className="input" value={form.preferred_language} onChange={set('preferred_language')}>
              {LANGUAGE_OPTIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </Field>

          {/* ── Doctor-specific fields (doctors table) ───────────────────────── */}
          {isDoctor && (
            <>
              <SectionTitle>Professional Details (doctors table)</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Registration Number" hint="doctors.registration_number">
                  <input className="input font-mono" value={form.registration_number} onChange={set('registration_number')} placeholder="MCI-DL-YYYY-0000" />
                </Field>
                <Field label="Specialization" hint="doctors.specialization">
                  <input className="input" value={form.specialization} onChange={set('specialization')} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Qualification" hint="doctors.qualification">
                  <input className="input" value={form.qualification} onChange={set('qualification')} placeholder="MBBS, MD…" />
                </Field>
                <Field label="Experience (years)" hint="doctors.experience_years numeric(3,1)">
                  <input type="number" step="0.5" className="input" value={form.experience_years} onChange={set('experience_years')} min="0" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Consultation Fee (₹)" hint="doctors.consultation_fee">
                  <input type="number" className="input" value={form.consultation_fee} onChange={set('consultation_fee')} min="0" />
                </Field>
                <Field label="Follow-up Fee (₹)" hint="doctors.followup_fee">
                  <input type="number" className="input" value={form.followup_fee} onChange={set('followup_fee')} min="0" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Slot Duration (min)" hint="doctors.slot_duration">
                  <input type="number" className="input" value={form.slot_duration} onChange={set('slot_duration')} min="5" step="5" />
                </Field>
                <Field label="Max Appts / Day" hint="doctors.max_appointments_per_day">
                  <input type="number" className="input" value={form.max_appointments_per_day} onChange={set('max_appointments_per_day')} min="1" />
                </Field>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isOnline" className="w-4 h-4 rounded border-slate-300" checked={form.is_online_available} onChange={set('is_online_available')} />
                <label htmlFor="isOnline" className="text-sm text-slate-700 cursor-pointer">Accept online appointments (doctors.is_online_available)</label>
              </div>
              {form.is_online_available && (
                <>
                  <Field label="Meeting Provider" hint="doctors.meeting_provider: ZOOM | GOOGLE_MEET">
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
              {/* is_verified — read-only, set by admin */}
              <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-700">Verification Status (doctors.is_verified)</div>
                  <div className="text-xs text-slate-400">Set by hospital administrator only</div>
                </div>
                <span className={`badge ${user?.is_verified ? 'badge-green' : 'badge-amber'}`}>{user?.is_verified ? 'Verified ✓' : 'Pending verification'}</span>
              </div>
            </>
          )}

          {/* ── Patient-specific fields (patients table) ─────────────────────── */}
          {isPatient && (
            <>
              <SectionTitle>Patient Details (patients table)</SectionTitle>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Date of Birth" hint="patients.date_of_birth NOT NULL">
                  <input type="date" className="input" value={form.date_of_birth} onChange={set('date_of_birth')} />
                </Field>
                <Field label="Gender" hint="patients.gender: MALE|FEMALE|OTHER">
                  <select className="input" value={form.gender} onChange={set('gender')}>
                    {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>)}
                  </select>
                </Field>
                <Field label="Blood Group" hint="patients.blood_group">
                  <select className="input" value={form.blood_group} onChange={set('blood_group')}>
                    {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
              </div>

              <SectionTitle>Clinical Data (patients jsonb arrays)</SectionTitle>
              <Field label="Allergies" hint="patients.allergies jsonb — comma-separated">
                <input className="input" value={form.allergies_text} onChange={set('allergies_text')} placeholder="e.g. Penicillin, Aspirin" />
              </Field>
              <Field label="Chronic Diseases" hint="patients.chronic_diseases jsonb — comma-separated">
                <input className="input" value={form.chronic_diseases_text} onChange={set('chronic_diseases_text')} placeholder="e.g. Hypertension, Diabetes Type 2" />
              </Field>
              <Field label="Current Medications" hint="patients.current_medications jsonb — comma-separated">
                <input className="input" value={form.current_medications_text} onChange={set('current_medications_text')} placeholder="e.g. Amlodipine 5mg OD" />
              </Field>

              <SectionTitle>Emergency Contact (patients.emergency_contact_*)</SectionTitle>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Contact Name">
                  <input className="input" value={form.emergency_contact_name} onChange={set('emergency_contact_name')} placeholder="Full name" />
                </Field>
                <Field label="Contact Phone">
                  <input type="tel" className="input" value={form.emergency_contact_phone} onChange={set('emergency_contact_phone')} placeholder="+91 98100 00000" />
                </Field>
                <Field label="Relation">
                  <select className="input" value={form.emergency_contact_relation} onChange={set('emergency_contact_relation')}>
                    {RELATIONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </Field>
              </div>
            </>
          )}

          <div className="flex justify-end pt-2">
            <button onClick={saveProfile} disabled={saving} className="btn-primary gap-2">
              {saving ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Icon name="check" className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Change Password ───────────────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-base text-slate-900">Change Password</h3>
          <button onClick={() => setShowPw(!showPw)} className="text-xs text-brand-600 font-medium hover:underline">
            {showPw ? 'Cancel' : 'Change'}
          </button>
        </div>
        {!showPw ? (
          <p className="text-sm text-slate-400">Click "Change" to update your password.</p>
        ) : (
          <div className="space-y-4">
            <Field label="Current Password">
              <input type="password" className="input" value={pwForm.current} onChange={setPw('current')} placeholder="••••••••" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="New Password">
                <input type="password" className="input" value={pwForm.next} onChange={setPw('next')} placeholder="Min. 6 characters" />
              </Field>
              <Field label="Confirm New Password">
                <input type="password" className="input" value={pwForm.confirm} onChange={setPw('confirm')} placeholder="Repeat password" />
              </Field>
            </div>
            <div className="flex justify-end">
              <button onClick={changePassword} disabled={savingPw} className="btn-primary gap-2">
                {savingPw ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : null}
                {savingPw ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Account Info ─────────────────────────────────────────────────────── */}
      <div className="card">
        <h3 className="font-display text-base text-slate-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Role',             value: user?.role?.toUpperCase() },
            { label: 'Role ID',          value: `#${user?.role_id || '—'}` },
            { label: 'Hospital',         value: user?.hospital },
            { label: 'Hospital ID',      value: `#${user?.hospital_id || '—'}` },
            { label: 'Account ID',       value: `#${user?.id}` },
            { label: 'Preferred Lang',   value: form.preferred_language },
            { label: 'Account Status',   value: user?.is_active ? 'Active ✓' : 'Inactive' },
            { label: 'Member Since',     value: user?.created_at || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-xl px-4 py-3">
              <div className="text-xs text-slate-400 mb-0.5">{label}</div>
              <div className="font-medium text-slate-800 text-sm">{value || '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
