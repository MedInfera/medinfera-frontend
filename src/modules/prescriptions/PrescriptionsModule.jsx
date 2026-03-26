import { useState, useEffect, useCallback, useRef } from 'react';
import Avatar from '../../components/common/Avatar';
import StatusBadge from '../../components/common/StatusBadge';
import Icon from '../../components/common/Icon';
import { PageSpinner } from '../../components/common/Spinner';
import {
  PageHeader, SearchBar, EmptyState, FormModal, Field, useToast,
} from '../shared';
import {
  getAllPrescriptions, getPrescriptionsByDoctor, getPrescriptionsByPatient,
  createPrescription, getPrescriptionById,
} from '../../services/prescriptionService';
import {
  searchMedicines, DOSE_FREQUENCIES, DURATION_OPTIONS, INSTRUCTIONS,
} from '../../services/medicineService';
import { getAllPatients } from '../../services/patientService';

// ─── Medicine Autocomplete ─────────────────────────────────────────────────────
function MedicineAutocomplete({ value, onChange, onSelect, placeholder, patientAllergies = [] }) {
  const [results, setResults]   = useState([]);
  const [open, setOpen]         = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value.length >= 2) {
        const r = await searchMedicines(value);
        setResults(r);
        setOpen(true);
      } else {
        setResults([]);
        setOpen(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasAllergyRisk = (med) =>
    patientAllergies.some((a) =>
      med.contraindications?.some((c) => c.toLowerCase().includes(a.toLowerCase()))
    );

  return (
    <div className="relative" ref={ref}>
      <input
        className="input text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Type medicine name…'}
        onFocus={() => value.length >= 2 && setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
          {results.map((med) => {
            const risk = hasAllergyRisk(med);
            return (
              <button
                key={med.id}
                type="button"
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors ${risk ? 'bg-red-50 hover:bg-red-100' : ''}`}
                onClick={() => { onSelect(med); setOpen(false); }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">{med.brandName}</span>
                    <span className="text-xs text-slate-400 ml-2">{med.strength} · {med.form}</span>
                    {risk && <span className="ml-2 badge badge-red text-[10px]">⚠ Allergy Risk</span>}
                  </div>
                  <span className="text-xs text-slate-400">{med.category}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{med.genericName}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Prescription Builder ─────────────────────────────────────────────────────
function PrescriptionBuilder({ onClose, onSaved, doctor_id: doctorId, doctorName }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form, setForm] = useState({
    diagnosis: '',
    vitals: { bp: '', pulse: '', weight: '', temp: '' },
    advice: '',
    followup_date: '',
    tests: '',
  });
  const [medicines, setMedicines] = useState([
    { id: Date.now(), query: '', selected: null, frequency: 'OD', duration: '5 days', instructions: 'After meals', quantity: '' },
  ]);
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState('');

  useEffect(() => { getAllPatients().then(setPatients); }, []);

  const setV  = (k) => (e)  => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setVt = (k) => (e)  => setForm((f) => ({ ...f, vitals: { ...f.vitals, [k]: e.target.value } }));

  const updateMed = (id, key, value) => {
    setMedicines((prev) => prev.map((m) => m.id === id ? { ...m, [key]: value } : m));
  };

  const selectMed = (id, med) => {
    setMedicines((prev) => prev.map((m) =>
      m.id === id ? { ...m, selected: med, query: med.brandName + ' ' + med.strength, quantity: '' } : m
    ));
  };

  const addMed = () => setMedicines((p) => [
    ...p,
    { id: Date.now(), query: '', selected: null, frequency: 'OD', duration: '5 days', instructions: 'After meals', quantity: '' },
  ]);

  const removeMed = (id) => setMedicines((p) => p.filter((m) => m.id !== id));

  const submit = async () => {
    if (!selectedPatient) { setErr('Please select a patient.'); return; }
    if (!form.diagnosis)  { setErr('Diagnosis is required.'); return; }
    const validMeds = medicines.filter((m) => m.selected);
    if (validMeds.length === 0) { setErr('Add at least one medicine.'); return; }
    setErr('');
    setBusy(true);
    try {
      await createPrescription({
        // prescriptions table — exact column names
        appointment_id: null,          // prescriptions.appointment_id NOT NULL in schema; null for walk-in
        patient_id: selectedPatient.id,
        doctor_id: doctorId,
        // display join fields (not schema columns — for UI only)
        patient_name: selectedPatient.name || (selectedPatient.first_name ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : ''),
        doctor_name: doctorName,
        doctor_specialization: 'General',
        // prescriptions table columns
        diagnosis: form.diagnosis,
        subjective_findings: form.vitals ? `BP: ${form.vitals.bp || '—'}, Pulse: ${form.vitals.pulse || '—'}, Weight: ${form.vitals.weight || '—'}, Temp: ${form.vitals.temp || '—'}` : null,
        objective_findings: null,
        assessment: null,
        advice: form.advice,
        followup_date: form.followup_date,
        // extra UI fields (not schema columns)
        tests: form.tests.split('\n').map((t) => t.trim()).filter(Boolean),
        vitals: form.vitals,
        // prescription_medicines rows
        medicines: validMeds.map((m) => ({
          // prescription_medicines table columns
          medicine_id: m.selected.id,
          medicine_name: m.selected.brandName + ' ' + m.selected.strength,
          generic_name: m.selected.genericName,
          dosage: '1 unit',               // prescription_medicines.dosage NOT NULL
          frequency: m.frequency,          // prescription_medicines.frequency NOT NULL
          duration: m.duration,            // prescription_medicines.duration NOT NULL
          route: 'ORAL',                   // prescription_medicines.route DEFAULT 'ORAL'
          instructions: m.instructions,
          quantity_prescribed: Number(m.quantity) || 1,  // prescription_medicines.quantity_prescribed
          quantity_dispensed: 0,
          is_dispensed: false,
        })),
      });
      onSaved('Prescription created and issued');
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const patientAllergies = selectedPatient?.allergies || [];

  return (
    <FormModal
      title="Write Prescription"
      onClose={onClose}
      onSubmit={submit}
      loading={busy}
      submitLabel="Issue Prescription"
      wide
    >
      <div className="space-y-6">
        {err && <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{err}</div>}

        {/* Patient selection */}
        <div>
          <Field label="Select Patient" required>
            <select
              className="input"
              value={selectedPatient?.id || ''}
              onChange={(e) => {
                const p = patients.find((p) => p.id === Number(e.target.value));
                setSelectedPatient(p || null);
              }}
            >
              <option value="">Choose patient…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.age}y, {p.blood}</option>
              ))}
            </select>
          </Field>
          {selectedPatient?.allergies?.length > 0 && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg text-xs text-red-600">
              <span>⚠</span>
              <span>Patient is allergic to: <strong>{selectedPatient.allergies.join(', ')}</strong></span>
            </div>
          )}
        </div>

        {/* Vitals */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Vitals (optional)</p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { k: 'bp',     ph: 'BP (mmHg)'  },
              { k: 'pulse',  ph: 'Pulse (bpm)' },
              { k: 'weight', ph: 'Weight (kg)' },
              { k: 'temp',   ph: 'Temp (°F)'   },
            ].map(({ k, ph }) => (
              <input key={k} className="input text-sm" value={form.vitals[k]} onChange={setVt(k)} placeholder={ph} />
            ))}
          </div>
        </div>

        {/* Diagnosis */}
        <Field label="Diagnosis / Chief Complaint" required>
          <input className="input" value={form.diagnosis} onChange={setV('diagnosis')} placeholder="e.g. Essential Hypertension Stage 1" />
        </Field>

        {/* Medicines */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medicines</p>
            <button type="button" onClick={addMed} className="btn-secondary btn-sm gap-1.5">
              <Icon name="plus" className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {/* Column headers */}
          <div className="grid gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1" style={{ gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr 0.8fr auto' }}>
            <span>Medicine</span><span>Freq.</span><span>Duration</span><span>Instructions</span><span>Qty</span><span></span>
          </div>

          <div className="space-y-2">
            {medicines.map((m) => (
              <div key={m.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr 0.8fr auto' }}>
                <MedicineAutocomplete
                  value={m.query}
                  onChange={(v) => updateMed(m.id, 'query', v)}
                  onSelect={(med) => selectMed(m.id, med)}
                  patientAllergies={patientAllergies}
                />
                <select className="input text-xs" value={m.frequency} onChange={(e) => updateMed(m.id, 'frequency', e.target.value)}>
                  {DOSE_FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.value}</option>)}
                </select>
                <select className="input text-xs" value={m.duration} onChange={(e) => updateMed(m.id, 'duration', e.target.value)}>
                  {DURATION_OPTIONS.map((d) => <option key={d}>{d}</option>)}
                </select>
                <select className="input text-xs" value={m.instructions} onChange={(e) => updateMed(m.id, 'instructions', e.target.value)}>
                  {INSTRUCTIONS.map((i) => <option key={i}>{i}</option>)}
                </select>
                <input className="input text-xs" value={m.quantity} onChange={(e) => updateMed(m.id, 'quantity', e.target.value)} placeholder="30" />
                <button type="button" onClick={() => removeMed(m.id)} className="text-red-400 hover:text-red-600 w-6 flex items-center justify-center">
                  <Icon name="close" className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tests */}
        <Field label="Investigations / Tests" hint="One per line">
          <textarea
            className="input resize-none text-sm"
            rows={2}
            value={form.tests}
            onChange={setV('tests')}
            placeholder="CBC&#10;ECG&#10;Lipid profile"
          />
        </Field>

        {/* Advice + Follow-up */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Advice / Instructions">
            <textarea className="input resize-none text-sm" rows={3} value={form.advice} onChange={setV('advice')} placeholder="Rest, diet restrictions, follow-up instructions…" />
          </Field>
          <Field label="Follow-up Date">
            <input type="date" className="input" value={form.followup_date} onChange={setV('followup_date')} />
          </Field>
        </div>
      </div>
    </FormModal>
  );
}

// ─── Prescription Viewer ──────────────────────────────────────────────────────
function PrescriptionViewer({ rx, onClose }) {
  if (!rx) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Print header */}
        <div className="bg-brand-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-2xl">Medinfera General Hospital</div>
              <div className="text-brand-200 text-sm mt-0.5">123 MG Road, New Delhi — +91 11-1234-5678</div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-xl px-4 py-2">
                <div className="text-xs text-brand-200">QR / Rx ID</div>
                <div className="font-mono font-bold text-sm">{rx.qr_code || rx.qrCode}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Patient + Doctor info */}
        <div className="grid grid-cols-2 gap-6 px-8 py-5 border-b border-slate-100 bg-slate-50">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Patient</p>
            <div className="flex items-center gap-2 mb-1">
              <Avatar name={rx.patient_name || rx.patientName} size="sm" />
              <span className="font-semibold text-slate-800">{rx.patientName}</span>
            </div>
            {rx.vitals && Object.entries(rx.vitals).some(([, v]) => v) && (
              <div className="flex gap-3 mt-2 flex-wrap">
                {[['BP', rx.vitals.bp],['Pulse', rx.vitals.pulse],['Wt', rx.vitals.weight],['Temp', rx.vitals.temp]].filter(([, v]) => v).map(([l, v]) => (
                  <span key={l} className="text-xs text-slate-500"><span className="font-medium text-slate-700">{l}:</span> {v}</span>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prescribing Doctor</p>
            <div className="flex items-center gap-2 mb-1">
              <Avatar name={rx.doctor_name  || rx.doctorName} size="sm" />
              <div>
                <div className="font-semibold text-slate-800">{rx.doctorName}</div>
                <div className="text-xs text-slate-500">{rx.doctorSpecialization}</div>
              </div>
            </div>
            <div className="text-xs text-slate-400 mt-1">Date: {rx.created_at || rx.date}</div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="px-8 pt-5">
          <div className="bg-brand-50 rounded-xl px-4 py-3 mb-5">
            <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Diagnosis: </span>
            <span className="text-sm font-medium text-slate-800">{rx.diagnosis}</span>
          </div>

          {/* Medicines table */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">℞ Medicines</p>
            <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50">
                <tr>
                  {['Medicine', 'Frequency', 'Duration', 'Instructions', 'Qty'].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rx.medicines.map((m, i) => (
                  <tr key={m.id || i} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{m.name}</div>
                      <div className="text-xs text-slate-400">{m.genericName}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs font-semibold">{m.frequency}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{m.duration}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{m.instructions}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{m.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tests */}
          {rx.tests?.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Investigations</p>
              <div className="flex gap-2 flex-wrap">
                {rx.tests.map((t) => <span key={t} className="badge badge-blue">{t}</span>)}
              </div>
            </div>
          )}

          {/* Advice */}
          {rx.advice && (
            <div className="mb-5 bg-teal-50 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Advice</p>
              <p className="text-sm text-slate-700">{rx.advice}</p>
            </div>
          )}

          {(rx.followup_date || rx.followUp) && (
            <div className="mb-6 text-sm text-slate-600">
              <span className="font-semibold">Follow-up: </span>{rx.followUp}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Close</button>
          <button onClick={() => window.print()} className="btn-primary gap-2">
            <Icon name="prescription" className="w-4 h-4" /> Print / Download
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Prescriptions List ────────────────────────────────────────────────────────
export default function PrescriptionsModule({ role = 'admin', doctorId, patientId, doctorName }) {
  const [rxList, setRxList]   = useState([]);
  const [busy, setBusy]       = useState(true);
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const { show, ToastEl }     = useToast();

  const load = useCallback(async () => {
    setBusy(true);
    const data = doctorId  ? await getPrescriptionsByDoctor(doctorId) :
                 patientId ? await getPrescriptionsByPatient(patientId) :
                 await getAllPrescriptions();
    setRxList(data);
    setBusy(false);
  }, [doctorId, patientId]);

  useEffect(() => { load(); }, [load]);

  const displayed = rxList.filter((r) =>
    !search ||
    r.patientName.toLowerCase().includes(search.toLowerCase()) ||
    r.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
    r.doctorName.toLowerCase().includes(search.toLowerCase())
  );

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-5 page-enter">
      {ToastEl}

      <PageHeader
        title="Prescriptions"
        subtitle={`${rxList.length} prescriptions issued`}
        action={
          role === 'doctor' ? (
            <button className="btn-primary btn-sm gap-1.5" onClick={() => setShowBuilder(true)}>
              <Icon name="prescription" className="w-4 h-4" /> Write Prescription
            </button>
          ) : null
        }
      />

      <SearchBar value={search} onChange={setSearch} placeholder="Search by patient, diagnosis, doctor…" className="max-w-sm" />

      <div className="card !p-0">
        {displayed.length === 0 ? (
          <EmptyState icon="prescription" title="No prescriptions found" desc="Write a new prescription or adjust your search." />
        ) : (
          <div className="table-wrapper border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rx ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Diagnosis</th>
                  <th>Medicines</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((rx) => (
                  <tr key={rx.id} className="cursor-pointer" onClick={() => setSelected(rx)}>
                    <td className="text-xs font-mono text-slate-400">{rx.qrCode}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={rx.patientName} size="xs" />
                        <span className="text-xs font-medium text-slate-800 whitespace-nowrap">{rx.patientName}</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">{rx.doctorName}</td>
                    <td className="text-xs text-slate-500">{rx.date}</td>
                    <td className="text-xs text-slate-700 max-w-[200px] truncate">{rx.diagnosis}</td>
                    <td>
                      <span className="badge badge-blue">{rx.medicines.length} drug{rx.medicines.length !== 1 ? 's' : ''}</span>
                    </td>
                    <td className="text-xs text-slate-500">{rx.followup_date || rx.followUp || '—'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setSelected(rx)} className="text-brand-600 hover:text-brand-800 text-xs font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <PrescriptionViewer rx={selected} onClose={() => setSelected(null)} />}
      {showBuilder && (
        <PrescriptionBuilder
          doctorId={doctorId}
          doctorName={doctorName}
          onClose={() => setShowBuilder(false)}
          onSaved={(msg) => { setShowBuilder(false); show(msg); load(); }}
        />
      )}
    </div>
  );
}
