import { useState, useEffect, useCallback } from 'react';
import Avatar from '../../components/common/Avatar';
import StatusBadge from '../../components/common/StatusBadge';
import Icon from '../../components/common/Icon';
import { PageSpinner } from '../../components/common/Spinner';
import {
  PageHeader, SearchBar, FilterTab, EmptyState,
  FormModal, Field, useToast, ConfirmModal,
} from '../shared';
import {
  getAllAdmissions, getAdmissionById, createAdmission, updateAdmission,
  dischargeAdmission, getVitalSigns, addVitalSign,
  getIpdNotes, addIpdNote, getIpdStats,
  IPD_STATUSES, NOTE_TYPES,
} from '../../services/ipdService';
import { getAllDoctors } from '../../services/doctorService';
import { getAllPatients } from '../../services/patientService';

const STATUS_CFG = {
  ADMITTED:        { bg: 'bg-brand-50',  text: 'text-brand-700',  label: 'Admitted'        },
  UNDER_TREATMENT: { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Under Treatment' },
  CRITICAL:        { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Critical'        },
  STABLE:          { bg: 'bg-teal-50',   text: 'text-teal-700',   label: 'Stable'          },
  DISCHARGED:      { bg: 'bg-slate-100', text: 'text-slate-500',  label: 'Discharged'      },
  TRANSFERRED:     { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Transferred'     },
  ABSCONDED:       { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Absconded'       },
  DECEASED:        { bg: 'bg-red-100',   text: 'text-red-900',    label: 'Deceased'        },
};

function IpdStatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.ADMITTED;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

// ─── Vitals Tab ───────────────────────────────────────────────────────────────
function VitalsTab({ admissionId, patientId }) {
  const [vitals, setVitals]   = useState([]);
  const [busy, setBusy]       = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({
    bp_systolic: '', bp_diastolic: '', heart_rate: '', temperature_celsius: '',
    oxygen_saturation: '', respiratory_rate: '', weight_kg: '', height_cm: '',
    blood_glucose: '', pain_scale: '', notes: '',
  });
  const [saving, setSaving]   = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setBusy(true);
    const v = await getVitalSigns(admissionId);
    setVitals(v.reverse());
    setBusy(false);
  }, [admissionId]);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setSaving(true);
    try {
      await addVitalSign({
        admission_id: admissionId, patient_id: patientId, hospital_id: 1,
        ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? null : isNaN(v) ? v : Number(v)])),
        recorded_by: 'Current User',
      });
      toast.success('Vitals recorded');
      setShowForm(false);
      setForm({ bp_systolic: '', bp_diastolic: '', heart_rate: '', temperature_celsius: '', oxygen_saturation: '', respiratory_rate: '', weight_kg: '', height_cm: '', blood_glucose: '', pain_scale: '', notes: '' });
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-sm text-slate-700">Vital Signs Log</h4>
        <button onClick={() => setShowForm(true)} className="btn-primary btn-sm gap-1.5">
          <Icon name="plus" className="w-3.5 h-3.5" /> Record Vitals
        </button>
      </div>

      {vitals.length === 0 ? (
        <EmptyState icon="lab" title="No vitals recorded" desc="Record the first set of vitals for this patient." />
      ) : (
        <div className="space-y-3">
          {vitals.map((v) => (
            <div key={v.id} className="card !p-4 animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">{new Date(v.recorded_at).toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-500">By: {v.recorded_by}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {v.bp_systolic && (
                  <div className="bg-red-50 rounded-xl p-2.5 text-center">
                    <div className="text-sm font-display text-red-700">{v.bp_systolic}/{v.bp_diastolic}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">BP (mmHg)</div>
                  </div>
                )}
                {v.heart_rate && (
                  <div className="bg-pink-50 rounded-xl p-2.5 text-center">
                    <div className="text-sm font-display text-pink-700">{v.heart_rate}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Heart Rate</div>
                  </div>
                )}
                {v.temperature_celsius && (
                  <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                    <div className="text-sm font-display text-amber-700">{v.temperature_celsius}°C</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Temp</div>
                  </div>
                )}
                {v.oxygen_saturation && (
                  <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                    <div className="text-sm font-display text-blue-700">{v.oxygen_saturation}%</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">SpO₂</div>
                  </div>
                )}
                {v.respiratory_rate && (
                  <div className="bg-teal-50 rounded-xl p-2.5 text-center">
                    <div className="text-sm font-display text-teal-700">{v.respiratory_rate}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Resp. Rate</div>
                  </div>
                )}
                {v.pain_scale !== null && v.pain_scale !== undefined && (
                  <div className="bg-orange-50 rounded-xl p-2.5 text-center">
                    <div className="text-sm font-display text-orange-700">{v.pain_scale}/10</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Pain Scale</div>
                  </div>
                )}
                {v.blood_glucose && (
                  <div className="bg-violet-50 rounded-xl p-2.5 text-center">
                    <div className="text-sm font-display text-violet-700">{v.blood_glucose}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Glucose</div>
                  </div>
                )}
              </div>
              {v.notes && <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">{v.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <FormModal title="Record Vital Signs" onClose={() => setShowForm(false)} onSubmit={submit} loading={saving} submitLabel="Save Vitals">
          <div className="grid grid-cols-2 gap-3">
            <Field label="BP Systolic"><input className="input" type="number" placeholder="e.g. 120" value={form.bp_systolic} onChange={set('bp_systolic')} /></Field>
            <Field label="BP Diastolic"><input className="input" type="number" placeholder="e.g. 80" value={form.bp_diastolic} onChange={set('bp_diastolic')} /></Field>
            <Field label="Heart Rate (bpm)"><input className="input" type="number" placeholder="e.g. 72" value={form.heart_rate} onChange={set('heart_rate')} /></Field>
            <Field label="Temperature (°C)"><input className="input" type="number" step="0.1" placeholder="e.g. 37.0" value={form.temperature_celsius} onChange={set('temperature_celsius')} /></Field>
            <Field label="SpO₂ (%)"><input className="input" type="number" step="0.1" placeholder="e.g. 98.5" value={form.oxygen_saturation} onChange={set('oxygen_saturation')} /></Field>
            <Field label="Respiratory Rate"><input className="input" type="number" placeholder="e.g. 16" value={form.respiratory_rate} onChange={set('respiratory_rate')} /></Field>
            <Field label="Weight (kg)"><input className="input" type="number" step="0.1" placeholder="e.g. 65.5" value={form.weight_kg} onChange={set('weight_kg')} /></Field>
            <Field label="Blood Glucose (mg/dL)"><input className="input" type="number" step="0.1" placeholder="e.g. 95" value={form.blood_glucose} onChange={set('blood_glucose')} /></Field>
            <Field label="Pain Scale (0–10)"><input className="input" type="number" min="0" max="10" placeholder="0–10" value={form.pain_scale} onChange={set('pain_scale')} /></Field>
          </div>
          <Field label="Notes"><textarea className="input" rows={2} placeholder="Any observations…" value={form.notes} onChange={set('notes')} /></Field>
        </FormModal>
      )}
    </div>
  );
}

// ─── Notes Tab ────────────────────────────────────────────────────────────────
function NotesTab({ admissionId }) {
  const [notes, setNotes]     = useState([]);
  const [busy, setBusy]       = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ note_type: 'PROGRESS', content: '' });
  const [saving, setSaving]   = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setBusy(true);
    const n = await getIpdNotes(admissionId);
    setNotes(n.reverse());
    setBusy(false);
  }, [admissionId]);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.content.trim()) { toast.error('Note content is required'); return; }
    setSaving(true);
    try {
      await addIpdNote({ admission_id: admissionId, hospital_id: 1, ...form, written_by: 'Current User' });
      toast.success('Note added');
      setShowForm(false);
      setForm({ note_type: 'PROGRESS', content: '' });
      load();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const NOTE_COLORS = { PROGRESS: 'bg-brand-50 text-brand-700', NURSING: 'bg-teal-50 text-teal-700', DOCTOR: 'bg-blue-50 text-blue-700', DISCHARGE: 'bg-amber-50 text-amber-700', PROCEDURE: 'bg-violet-50 text-violet-700', OBSERVATION: 'bg-slate-100 text-slate-600' };

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-sm text-slate-700">Clinical Notes</h4>
        <button onClick={() => setShowForm(true)} className="btn-primary btn-sm gap-1.5">
          <Icon name="plus" className="w-3.5 h-3.5" /> Add Note
        </button>
      </div>
      {notes.length === 0 ? (
        <EmptyState icon="prescription" title="No notes yet" desc="Add the first clinical note." />
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="card !p-4 animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${NOTE_COLORS[n.note_type] || 'bg-slate-100 text-slate-600'}`}>{n.note_type}</span>
                <span className="text-xs text-slate-400 ml-auto">{new Date(n.written_at).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{n.content}</p>
              <p className="text-xs text-slate-400 mt-2">— {n.written_by}</p>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <FormModal title="Add Clinical Note" onClose={() => setShowForm(false)} onSubmit={submit} loading={saving} submitLabel="Add Note">
          <Field label="Note Type">
            <select className="input" value={form.note_type} onChange={set('note_type')}>
              {NOTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Note Content *">
            <textarea className="input" rows={5} placeholder="Enter clinical note…" value={form.content} onChange={set('content')} />
          </Field>
        </FormModal>
      )}
    </div>
  );
}

// ─── Admission Detail Drawer ──────────────────────────────────────────────────
function AdmissionDrawer({ admission, onClose, onStatusChange, onDischarge }) {
  const [tab, setTab] = useState('info');
  if (!admission) return null;

  const TABS = [
    { id: 'info',   label: 'Info'   },
    { id: 'vitals', label: 'Vitals' },
    { id: 'notes',  label: 'Notes'  },
  ];

  const isActive = admission.status !== 'DISCHARGED';
  const daysSince = Math.floor((new Date() - new Date(admission.admission_date)) / 86400000);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl animate-slide-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-display text-lg text-slate-900">{admission.admission_number}</h3>
            <p className="text-xs text-slate-400">{admission.ward_name} · {admission.bed_number}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><Icon name="close" className="w-5 h-5" /></button>
        </div>

        {/* Patient summary */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
          <Avatar name={admission.patient_name} size="lg" />
          <div className="flex-1">
            <div className="font-display text-base text-slate-900">{admission.patient_name}</div>
            <div className="text-xs text-slate-400 mt-0.5">Dr. {admission.primary_doctor_name}</div>
            <div className="flex gap-2 mt-2">
              <IpdStatusBadge status={admission.status} />
              <span className="text-xs text-slate-400">{daysSince}d admitted</span>
            </div>
          </div>
          {isActive && (
            <div className="flex flex-col gap-2">
              <select
                className="input text-xs py-1.5"
                value={admission.status}
                onChange={(e) => onStatusChange(admission.id, e.target.value)}
              >
                {IPD_STATUSES.filter(s => s !== 'DISCHARGED').map(s => (
                  <option key={s} value={s}>{STATUS_CFG[s]?.label || s}</option>
                ))}
              </select>
              <button
                onClick={() => onDischarge(admission)}
                className="btn-sm text-xs bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-medium"
              >
                Discharge
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 border-b border-slate-100 flex gap-4">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-sm pb-2 border-b-2 font-medium transition-colors ${tab === t.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'info' && (
            <div className="space-y-5">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Admission Details</div>
                <div className="space-y-2">
                  {[
                    ['Admission Date', new Date(admission.admission_date).toLocaleDateString('en-IN')],
                    ['Expected Discharge', admission.expected_discharge || '—'],
                    ['Reason', admission.reason_for_admission],
                    ['Provisional Diagnosis', admission.provisional_diagnosis || '—'],
                    ['Referred By', admission.referred_by || '—'],
                    ['Admitted By', admission.admitted_by],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-slate-400 flex-shrink-0">{label}</span>
                      <span className="text-slate-700 text-right ml-4">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              {admission.status === 'DISCHARGED' && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Discharge Summary</div>
                  <div className="space-y-2">
                    {[
                      ['Discharge Date', new Date(admission.discharge_date).toLocaleDateString('en-IN')],
                      ['Final Diagnosis', admission.final_diagnosis || '—'],
                      ['Treatment Summary', admission.treatment_summary || '—'],
                      ['Discharge Notes', admission.discharge_notes || '—'],
                      ['Discharged By', admission.discharged_by || '—'],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-slate-400 flex-shrink-0">{label}</span>
                        <span className="text-slate-700 text-right ml-4 max-w-xs">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === 'vitals' && <VitalsTab admissionId={admission.id} patientId={admission.patient_id} />}
          {tab === 'notes'  && <NotesTab admissionId={admission.id} />}
        </div>
      </div>
    </div>
  );
}

// ─── Admit Patient Form ───────────────────────────────────────────────────────
function AdmitForm({ onClose, onDone }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors]   = useState([]);
  const [form, setForm] = useState({
    patient_id: '', patient_name: '',
    primary_doctor_id: '', primary_doctor_name: '',
    bed_number: '', ward_name: '', bed_id: '', ward_id: '',
    reason_for_admission: '', provisional_diagnosis: '',
    expected_discharge: '', referred_by: '',
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([getAllPatients(), getAllDoctors()]).then(([p, d]) => {
      setPatients(p);
      setDoctors(d);
    });
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.patient_id || !form.primary_doctor_id || !form.reason_for_admission) {
      toast.error('Patient, doctor and reason are required');
      return;
    }
    setSaving(true);
    try {
      await createAdmission({
        ...form,
        admitted_by: form.primary_doctor_name,
        admission_date: new Date().toISOString(),
      });
      onDone('Patient admitted successfully');
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const selectPatient = (e) => {
    const p = patients.find(p => p.id === Number(e.target.value));
    setForm(f => ({ ...f, patient_id: e.target.value, patient_name: p ? (p.name || `${p.first_name} ${p.last_name}`) : '' }));
  };

  const selectDoctor = (e) => {
    const d = doctors.find(d => d.id === Number(e.target.value));
    setForm(f => ({ ...f, primary_doctor_id: e.target.value, primary_doctor_name: d ? (d.name || `Dr. ${d.first_name} ${d.last_name}`) : '' }));
  };

  return (
    <FormModal title="Admit Patient" onClose={onClose} onSubmit={submit} loading={saving} submitLabel="Admit Patient" wide>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Patient *">
          <select className="input" value={form.patient_id} onChange={selectPatient}>
            <option value="">Select patient…</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name || `${p.first_name} ${p.last_name}`}</option>)}
          </select>
        </Field>
        <Field label="Primary Doctor *">
          <select className="input" value={form.primary_doctor_id} onChange={selectDoctor}>
            <option value="">Select doctor…</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name || `Dr. ${d.first_name} ${d.last_name}`}</option>)}
          </select>
        </Field>
        <Field label="Ward Name">
          <input className="input" placeholder="e.g. General Ward A" value={form.ward_name} onChange={set('ward_name')} />
        </Field>
        <Field label="Bed Number">
          <input className="input" placeholder="e.g. B-101" value={form.bed_number} onChange={set('bed_number')} />
        </Field>
        <Field label="Expected Discharge">
          <input className="input" type="date" value={form.expected_discharge} onChange={set('expected_discharge')} />
        </Field>
        <Field label="Referred By">
          <input className="input" placeholder="Referring doctor/hospital" value={form.referred_by} onChange={set('referred_by')} />
        </Field>
      </div>
      <Field label="Reason for Admission *">
        <textarea className="input" rows={2} placeholder="Chief complaint / reason…" value={form.reason_for_admission} onChange={set('reason_for_admission')} />
      </Field>
      <Field label="Provisional Diagnosis">
        <input className="input" placeholder="Initial diagnosis…" value={form.provisional_diagnosis} onChange={set('provisional_diagnosis')} />
      </Field>
    </FormModal>
  );
}

// ─── Discharge Form ───────────────────────────────────────────────────────────
function DischargeForm({ admission, onClose, onDone }) {
  const [form, setForm] = useState({
    final_diagnosis: admission.provisional_diagnosis || '',
    treatment_summary: '',
    discharge_notes: '',
    discharged_by: admission.primary_doctor_name || '',
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.final_diagnosis) { toast.error('Final diagnosis is required'); return; }
    setSaving(true);
    try {
      await dischargeAdmission(admission.id, form);
      onDone(`${admission.patient_name} discharged successfully`);
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <FormModal title={`Discharge — ${admission.patient_name}`} onClose={onClose} onSubmit={submit} loading={saving} submitLabel="Confirm Discharge" wide>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-2">
        <p className="text-sm text-amber-700">Please complete the discharge summary before confirming. This action cannot be undone.</p>
      </div>
      <Field label="Final Diagnosis *">
        <input className="input" placeholder="Final confirmed diagnosis" value={form.final_diagnosis} onChange={set('final_diagnosis')} />
      </Field>
      <Field label="Treatment Summary">
        <textarea className="input" rows={3} placeholder="Summary of treatment provided during stay…" value={form.treatment_summary} onChange={set('treatment_summary')} />
      </Field>
      <Field label="Discharge Instructions / Notes">
        <textarea className="input" rows={3} placeholder="Follow-up instructions, medications to continue…" value={form.discharge_notes} onChange={set('discharge_notes')} />
      </Field>
      <Field label="Discharged By">
        <input className="input" value={form.discharged_by} onChange={set('discharged_by')} />
      </Field>
    </FormModal>
  );
}

// ─── Main IPD Module ──────────────────────────────────────────────────────────
const FILTER_OPTS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Critical', value: 'CRITICAL' },
  { label: 'Stable', value: 'STABLE' },
  { label: 'Discharged', value: 'DISCHARGED' },
];

export default function IpdModule() {
  const [admissions, setAdmissions] = useState([]);
  const [stats, setStats]         = useState(null);
  const [busy, setBusy]           = useState(true);
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);
  const [showAdmit, setShowAdmit] = useState(false);
  const [dischargeTarget, setDischargeTarget] = useState(null);
  const toast = useToast();

  const load = useCallback(async (f = filter) => {
    setBusy(true);
    const [a, s] = await Promise.all([getAllAdmissions(f), getIpdStats()]);
    setAdmissions(a);
    setStats(s);
    setBusy(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = (f) => { setFilter(f); load(f); };

  const handleStatusChange = async (id, status) => {
    await updateAdmission(id, { status });
    setAdmissions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    toast.success('Status updated');
  };

  const handleAdmitDone = (msg) => {
    setShowAdmit(false);
    toast.success(msg);
    load();
  };

  const handleDischargeDone = (msg) => {
    setDischargeTarget(null);
    setSelected(null);
    toast.success(msg);
    load();
  };

  const filtered = admissions.filter(a =>
    [a.patient_name, a.primary_doctor_name, a.admission_number, a.ward_name].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="IPD Management"
        subtitle="In-Patient Department — admissions, vitals & discharge"
        action={
          <button onClick={() => setShowAdmit(true)} className="btn-primary gap-1.5">
            <Icon name="plus" className="w-4 h-4" /> Admit Patient
          </button>
        }
      />

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Admitted', value: stats.total,     bg: 'bg-brand-50',  ic: 'text-brand-500'  },
            { label: 'Active',         value: stats.active,    bg: 'bg-teal-50',   ic: 'text-teal-500'   },
            { label: 'Critical',       value: stats.critical,  bg: 'bg-red-50',    ic: 'text-red-500'    },
            { label: 'Discharged',     value: stats.discharged,bg: 'bg-slate-100', ic: 'text-slate-500'  },
          ].map(({ label, value, bg, ic }) => (
            <div key={label} className={`card flex items-center gap-3 animate-slide-up`}>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon name="bed" className={`w-4.5 h-4.5 ${ic}`} />
              </div>
              <div>
                <div className="text-xs text-slate-400">{label}</div>
                <div className="text-2xl font-display text-slate-900">{value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search patient, doctor, ward…" className="w-72" />
        <FilterTab options={FILTER_OPTS} value={filter} onChange={handleFilterChange} />
      </div>

      {/* Table */}
      {busy ? <PageSpinner /> : filtered.length === 0 ? (
        <EmptyState icon="bed" title="No admissions found" desc="Try adjusting filters or admit a new patient." action={<button onClick={() => setShowAdmit(true)} className="btn-primary btn-sm">Admit Patient</button>} />
      ) : (
        <div className="card !p-0 animate-slide-up">
          <div className="table-wrapper border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Admission #</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Ward / Bed</th>
                  <th>Admitted</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelected(a)}>
                    <td className="font-medium text-brand-700 text-xs">{a.admission_number}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={a.patient_name} size="sm" />
                        <span className="font-medium text-slate-800 text-xs">{a.patient_name}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-500">{a.primary_doctor_name}</td>
                    <td className="text-xs text-slate-500">{a.ward_name} · {a.bed_number}</td>
                    <td className="text-xs text-slate-400">{new Date(a.admission_date).toLocaleDateString('en-IN')}</td>
                    <td><IpdStatusBadge status={a.status} /></td>
                    <td>
                      <button className="text-slate-400 hover:text-brand-600 transition-colors p-1" onClick={e => { e.stopPropagation(); setSelected(a); }}>
                        <Icon name="eye" className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <AdmissionDrawer
          admission={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onDischarge={(a) => { setSelected(null); setDischargeTarget(a); }}
        />
      )}
      {showAdmit && <AdmitForm onClose={() => setShowAdmit(false)} onDone={handleAdmitDone} />}
      {dischargeTarget && (
        <DischargeForm
          admission={dischargeTarget}
          onClose={() => setDischargeTarget(null)}
          onDone={handleDischargeDone}
        />
      )}
    </div>
  );
}
