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
  getAllPatients, createPatient, updatePatient, getPatientStats, fullName,
  BLOOD_GROUPS, GENDERS, RELATIONS,
} from '../../services/patientService';

// ─── Schema reference ─────────────────────────────────────────────────────────
// patients table columns (exact names):
//   id, uuid, hospital_id, user_id, date_of_birth, gender, blood_group,
//   allergies (jsonb), chronic_diseases (jsonb), current_medications (jsonb),
//   emergency_contact_name, emergency_contact_phone, emergency_contact_relation
//
// users table columns (joined via user_id):
//   first_name, last_name, email, phone, alternate_phone, is_active
//
// NOTE: address/city/state/zip are NOT in patients or users schema tables
// NOTE: aadhaar/pan are NOT in the schema
// NOTE: medical_history is NOT a column — use chronic_diseases jsonb array

// ─── Patient Drawer — schema-aligned field display ─────────────────────────────
function PatientDrawer({ patient, onClose, onEdit }) {
  if (!patient) return null;

  const name      = patient.name || fullName(patient) || '—';
  const dob       = patient.date_of_birth || '—';
  const gender    = patient.gender || '—';
  const blood     = patient.blood_group || 'UNKNOWN';
  const visits    = patient.total_visits || 0;
  const lastVisit = patient.last_visit   || '—';

  // patients.allergies — jsonb array in schema
  const allergies = Array.isArray(patient.allergies) ? patient.allergies : [];
  // patients.chronic_diseases — jsonb array in schema
  const chronicDiseases = Array.isArray(patient.chronic_diseases) ? patient.chronic_diseases : [];
  // patients.current_medications — jsonb array in schema
  const medications = Array.isArray(patient.current_medications) ? patient.current_medications : [];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl animate-slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="font-display text-lg text-slate-900">Patient Record</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">

          {/* Identity header */}
          <div className="flex items-center gap-4">
            <Avatar name={name} size="xl" />
            <div>
              <h4 className="font-display text-xl text-slate-900">{name}</h4>
              <p className="text-sm text-slate-500">{gender.charAt(0) + gender.slice(1).toLowerCase()} · DOB: {dob}</p>
              <div className="mt-1.5 flex gap-1.5 flex-wrap">
                <StatusBadge status={patient.is_active !== false ? 'active' : 'inactive'} />
                <span className="badge badge-red">{blood}</span>
              </div>
            </div>
          </div>

          {/* users table fields */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact (users table)</p>
            {[
              { label: 'First Name',  value: patient.first_name },
              { label: 'Last Name',   value: patient.last_name  },
              { label: 'Email',       value: patient.email      },
              { label: 'Phone',       value: patient.phone      },
              { label: 'Alt. Phone',  value: patient.alternate_phone || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-start gap-3">
                <span className="text-slate-400 flex-shrink-0 w-20">{label}</span>
                <span className="font-medium text-slate-700 text-right">{value || '—'}</span>
              </div>
            ))}
          </div>

          {/* patients table fields */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Patient Data (patients table)</p>
            {[
              { label: 'Date of Birth', value: dob },
              { label: 'Gender',        value: gender },
              { label: 'Blood Group',   value: blood  },
              { label: 'Total Visits',  value: visits },
              { label: 'Last Visit',    value: lastVisit },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-slate-400">{label}</span>
                <span className="font-medium text-slate-700">{value}</span>
              </div>
            ))}
          </div>

          {/* patients.emergency_contact_* */}
          {patient.emergency_contact_name && (
            <div className="bg-orange-50 rounded-xl p-4 text-sm space-y-2">
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">Emergency Contact</p>
              <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="font-medium">{patient.emergency_contact_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Phone</span><span className="font-medium">{patient.emergency_contact_phone}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Relation</span><span className="font-medium">{patient.emergency_contact_relation}</span></div>
            </div>
          )}

          {/* patients.allergies — jsonb array */}
          {allergies.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">⚠ Allergies (patients.allergies)</p>
              <div className="flex flex-wrap gap-1.5">
                {allergies.map((a) => <span key={a} className="badge badge-red">{a}</span>)}
              </div>
            </div>
          )}

          {/* patients.chronic_diseases — jsonb array */}
          {chronicDiseases.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Chronic Diseases (patients.chronic_diseases)</p>
              <div className="flex flex-wrap gap-1.5">
                {chronicDiseases.map((d) => <span key={d} className="badge badge-amber">{d}</span>)}
              </div>
            </div>
          )}

          {/* patients.current_medications — jsonb array */}
          {medications.length > 0 && (
            <div className="bg-brand-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">Current Medications (patients.current_medications)</p>
              <div className="space-y-1">
                {medications.map((m) => <div key={m} className="text-xs text-slate-700">• {m}</div>)}
              </div>
            </div>
          )}

          <button onClick={() => { onClose(); onEdit(patient); }} className="btn-secondary w-full gap-2">
            <Icon name="settings" className="w-4 h-4" /> Edit Patient Record
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Patient Form — exact schema column alignment ──────────────────────────────
// Covers: users table (first_name, last_name, email, phone, alternate_phone)
//       + patients table (date_of_birth, gender, blood_group, allergies,
//                         chronic_diseases, current_medications,
//                         emergency_contact_name/phone/relation)
function PatientForm({ initial, onClose, onSaved }) {
  const editing = !!initial;

  const blank = {
    // ── users table ────────────────────────────────────────────────────
    first_name:     '',
    last_name:      '',
    email:          '',
    phone:          '',             // users.phone NOT NULL
    alternate_phone:'',
    // ── patients table ─────────────────────────────────────────────────
    date_of_birth:  '',             // patients.date_of_birth NOT NULL
    gender:         'MALE',         // patients.gender CHECK: MALE|FEMALE|OTHER
    blood_group:    'UNKNOWN',      // patients.blood_group CHECK: A+/A-.../UNKNOWN
    // allergies, chronic_diseases, current_medications stored as jsonb arrays
    // UI: comma-separated text → split to array on submit
    allergies_text:          '',    // → patients.allergies jsonb
    chronic_diseases_text:   '',    // → patients.chronic_diseases jsonb
    current_medications_text:'',    // → patients.current_medications jsonb
    // emergency contact
    emergency_contact_name:     '',
    emergency_contact_phone:    '',
    emergency_contact_relation: 'Spouse',
  };

  const toForm = (p) => ({
    first_name:      p.first_name || (p.name || '').split(' ')[0] || '',
    last_name:       p.last_name  || (p.name || '').split(' ').slice(1).join(' ') || '',
    email:           p.email          || '',
    phone:           p.phone          || '',
    alternate_phone: p.alternate_phone || '',
    date_of_birth:   p.date_of_birth  || '',
    gender:          p.gender         || 'MALE',
    blood_group:     p.blood_group    || 'UNKNOWN',
    // Convert jsonb arrays back to comma-separated text for editing
    allergies_text:           Array.isArray(p.allergies)           ? p.allergies.join(', ')           : (p.allergies || ''),
    chronic_diseases_text:    Array.isArray(p.chronic_diseases)    ? p.chronic_diseases.join(', ')    : '',
    current_medications_text: Array.isArray(p.current_medications) ? p.current_medications.join(', ') : '',
    emergency_contact_name:     p.emergency_contact_name     || '',
    emergency_contact_phone:    p.emergency_contact_phone    || '',
    emergency_contact_relation: p.emergency_contact_relation || 'Spouse',
  });

  const [form, setForm] = useState(editing ? toForm(initial) : blank);
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Convert comma-separated text to jsonb array
  const toArr = (text) => (text || '').split(',').map((s) => s.trim()).filter(Boolean);

  const submit = async () => {
    if (!form.first_name || !form.phone) {
      setErr('First name and phone number are required.'); return;
    }
    if (!form.date_of_birth) {
      setErr('Date of birth is required (patients.date_of_birth NOT NULL).'); return;
    }
    setErr(''); setBusy(true);
    try {
      const payload = {
        // users table
        first_name:      form.first_name,
        last_name:       form.last_name,
        email:           form.email,
        phone:           form.phone,
        alternate_phone: form.alternate_phone,
        // patients table — exact column names
        date_of_birth:   form.date_of_birth,
        gender:          form.gender,
        blood_group:     form.blood_group,
        // jsonb arrays from text inputs
        allergies:           toArr(form.allergies_text),
        chronic_diseases:    toArr(form.chronic_diseases_text),
        current_medications: toArr(form.current_medications_text),
        // emergency contact
        emergency_contact_name:     form.emergency_contact_name,
        emergency_contact_phone:    form.emergency_contact_phone,
        emergency_contact_relation: form.emergency_contact_relation,
      };
      if (editing) await updatePatient(initial.id, payload);
      else await createPatient(payload);
      onSaved(editing ? 'Patient record updated' : 'Patient registered successfully');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <FormModal
      title={editing ? 'Edit Patient Record' : 'Register New Patient'}
      onClose={onClose} onSubmit={submit} loading={busy} wide
      submitLabel={editing ? 'Save Changes' : 'Register Patient'}
    >
      <div className="space-y-5">
        {err && <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">{err}</div>}

        {/* Section 1 — users table fields */}
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
                <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="patient@email.com" />
              </Field>
              <Field label="Phone Number" required hint="users.phone NOT NULL">
                <input className="input" value={form.phone} onChange={set('phone')} placeholder="+91 98100 00000" />
              </Field>
            </div>
            <Field label="Alternate Phone" hint="users.alternate_phone">
              <input className="input" value={form.alternate_phone} onChange={set('alternate_phone')} placeholder="+91 98100 00000" />
            </Field>
          </div>
        </div>

        {/* Section 2 — patients table core fields */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">
            Patient Details <span className="text-slate-300 font-normal">(patients table)</span>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Date of Birth" required hint="patients.date_of_birth NOT NULL">
                <input type="date" className="input" value={form.date_of_birth} onChange={set('date_of_birth')} />
              </Field>
              <Field label="Gender" hint="patients.gender: MALE|FEMALE|OTHER">
                <select className="input" value={form.gender} onChange={set('gender')}>
                  {GENDERS.map((g) => <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>)}
                </select>
              </Field>
              <Field label="Blood Group" hint="patients.blood_group: A+…UNKNOWN">
                <select className="input" value={form.blood_group} onChange={set('blood_group')}>
                  {BLOOD_GROUPS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
            </div>
          </div>
        </div>

        {/* Section 3 — patients.emergency_contact_* columns */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">
            Emergency Contact <span className="text-slate-300 font-normal">(patients.emergency_contact_*)</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Contact Name" hint="emergency_contact_name">
              <input className="input" value={form.emergency_contact_name} onChange={set('emergency_contact_name')} placeholder="Full name" />
            </Field>
            <Field label="Contact Phone" hint="emergency_contact_phone">
              <input className="input" value={form.emergency_contact_phone} onChange={set('emergency_contact_phone')} placeholder="+91 98100 00000" />
            </Field>
            <Field label="Relation" hint="emergency_contact_relation">
              <select className="input" value={form.emergency_contact_relation} onChange={set('emergency_contact_relation')}>
                {RELATIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Section 4 — patients jsonb array columns */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">
            Clinical Data <span className="text-slate-300 font-normal">(patients table — jsonb arrays)</span>
          </div>
          <div className="space-y-4">
            <Field label="Allergies" hint="patients.allergies jsonb — comma-separated: Penicillin, Aspirin">
              <input className="input" value={form.allergies_text} onChange={set('allergies_text')} placeholder="e.g. Penicillin, Aspirin, Latex" />
            </Field>
            <Field label="Chronic Diseases" hint="patients.chronic_diseases jsonb — comma-separated conditions">
              <input className="input" value={form.chronic_diseases_text} onChange={set('chronic_diseases_text')} placeholder="e.g. Hypertension, Diabetes Type 2, Asthma" />
            </Field>
            <Field label="Current Medications" hint="patients.current_medications jsonb — ongoing prescriptions">
              <input className="input" value={form.current_medications_text} onChange={set('current_medications_text')} placeholder="e.g. Amlodipine 5mg OD, Metformin 500mg BD" />
            </Field>
          </div>
        </div>
      </div>
    </FormModal>
  );
}

// ─── Main Patients Module ──────────────────────────────────────────────────────
export default function PatientsModule({ readOnly = false }) {
  const [patients, setPatients] = useState([]);
  const [stats, setStats]       = useState(null);
  const [busy, setBusy]         = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bloodFilter, setBloodFilter]   = useState('all');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { show, ToastEl }       = useToast();

  const load = useCallback(async () => {
    setBusy(true);
    const [p, s] = await Promise.all([getAllPatients(), getPatientStats()]);
    setPatients(p); setStats(s);
    setBusy(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  const handleSaved = (msg) => { setShowForm(false); setEditing(null); show(msg); load(); };

  const displayed = patients.filter((p) => {
    const name = p.name || fullName(p) || '';
    const q = search.toLowerCase();
    const matchS  = !search || name.toLowerCase().includes(q) || (p.phone || '').includes(q) || (p.email || '').toLowerCase().includes(q);
    const matchSt = statusFilter === 'all' || (statusFilter === 'active' ? p.is_active !== false : p.is_active === false);
    const matchBl = bloodFilter === 'all'  || p.blood_group === bloodFilter;
    return matchS && matchSt && matchBl;
  });

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-5 page-enter">
      {ToastEl}
      <PageHeader
        title="Patients"
        subtitle={`${stats?.total || 0} registered · ${stats?.newThisMonth || 0} new this month`}
        action={!readOnly ? (
          <button className="btn-primary btn-sm gap-1.5" onClick={() => setShowForm(true)}>
            <Icon name="plus" className="w-4 h-4" /> Register Patient
          </button>
        ) : null}
      />

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total',   value: stats.total,   bg: 'bg-slate-100', text: 'text-slate-700' },
            { label: 'Active',  value: stats.active,  bg: 'bg-teal-50',   text: 'text-teal-700'  },
            { label: 'Inactive',value: stats.inactive, bg: 'bg-red-50',   text: 'text-red-700'   },
          ].map(({ label, value, bg, text }) => (
            <div key={label} className={`${bg} rounded-xl px-4 py-3 text-center`}>
              <div className={`text-2xl font-display ${text}`}>{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search name, phone, email…" className="sm:w-72" />
        <FilterTab value={statusFilter} onChange={setStatusFilter} options={[
          { label: 'All', value: 'all' },
          { label: 'Active',   value: 'active'   },
          { label: 'Inactive', value: 'inactive' },
        ]} />
        <FilterTab
          value={bloodFilter} onChange={setBloodFilter}
          options={[{ label: 'All Groups', value: 'all' }, ...BLOOD_GROUPS.map((b) => ({ label: b, value: b }))]}
        />
      </div>

      <div className="card !p-0">
        {displayed.length === 0 ? (
          <EmptyState icon="users" title="No patients found" desc="Register a patient or adjust your search." />
        ) : (
          <div className="table-wrapper border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>DOB / Gender</th>
                  <th>Blood Group</th>
                  <th>Phone</th>
                  <th>Allergies</th>
                  <th>Chronic Diseases</th>
                  <th>Last Visit</th>
                  <th>Visits</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((p) => {
                  const name     = p.name || fullName(p);
                  const allergies= Array.isArray(p.allergies) ? p.allergies : [];
                  const chronic  = Array.isArray(p.chronic_diseases) ? p.chronic_diseases : [];
                  return (
                    <tr key={p.id} className="cursor-pointer" onClick={() => setSelected(p)}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={name} size="sm" />
                          <div>
                            <div className="text-sm font-medium text-slate-800">{name}</div>
                            <div className="text-xs text-slate-400">{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs text-slate-500">
                        <div>{p.date_of_birth || '—'}</div>
                        <div className="text-slate-400">{p.gender ? p.gender.charAt(0) + p.gender.slice(1).toLowerCase() : '—'}</div>
                      </td>
                      <td><span className="badge badge-red">{p.blood_group || 'UNKNOWN'}</span></td>
                      <td className="text-xs font-mono text-slate-500">{p.phone}</td>
                      <td>
                        {allergies.length > 0 ? (
                          <span className="badge badge-red">{allergies.length} known</span>
                        ) : (
                          <span className="text-xs text-slate-300">None</span>
                        )}
                      </td>
                      <td>
                        {chronic.length > 0 ? (
                          <span className="badge badge-amber">{chronic.length} condition{chronic.length > 1 ? 's' : ''}</span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="text-xs text-slate-500">{p.last_visit || '—'}</td>
                      <td className="text-xs font-semibold text-slate-700 text-center">{p.total_visits ?? 0}</td>
                      <td><StatusBadge status={p.is_active !== false ? 'active' : 'inactive'} /></td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <button onClick={() => setSelected(p)} className="text-brand-600 hover:text-brand-800 text-xs font-medium">View</button>
                          {!readOnly && (
                            <button onClick={() => { setEditing(p); setShowForm(true); }} className="text-slate-400 hover:text-slate-700 text-xs font-medium">Edit</button>
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

      {selected && (
        <PatientDrawer
          patient={selected}
          onClose={() => setSelected(null)}
          onEdit={(p) => { setEditing(p); setShowForm(true); }}
        />
      )}
      {showForm && !readOnly && (
        <PatientForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
