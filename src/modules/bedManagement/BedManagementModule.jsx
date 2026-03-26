import { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/common/Icon';
import { PageSpinner } from '../../components/common/Spinner';
import { PageHeader, FormModal, Field, useToast, EmptyState } from '../shared';
import {
  getBeds, getOccupancySummary, getWards,
  allocateBed, dischargeBed, updateBedStatus,
  BED_TYPES, BED_STATUSES, WARD_TYPES,
} from '../../services/bedService';
import { getAllDoctors } from '../../services/doctorService';
import { getAllPatients } from '../../services/patientService';

// Schema-exact status values: AVAILABLE | OCCUPIED | RESERVED | CLEANING | MAINTENANCE | DISINFECTING
const STATUS_CFG = {
  AVAILABLE:    { bg: 'bg-teal-100',   border: 'border-teal-300',   text: 'text-teal-700',   dot: 'bg-teal-500',   label: 'Available'    },
  OCCUPIED:     { bg: 'bg-red-100',    border: 'border-red-300',    text: 'text-red-700',    dot: 'bg-red-500',    label: 'Occupied'     },
  RESERVED:     { bg: 'bg-brand-100',  border: 'border-brand-300',  text: 'text-brand-700',  dot: 'bg-brand-500',  label: 'Reserved'     },
  CLEANING:     { bg: 'bg-amber-100',  border: 'border-amber-300',  text: 'text-amber-700',  dot: 'bg-amber-500',  label: 'Cleaning'     },
  MAINTENANCE:  { bg: 'bg-slate-100',  border: 'border-slate-300',  text: 'text-slate-500',  dot: 'bg-slate-400',  label: 'Maintenance'  },
  DISINFECTING: { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-700', dot: 'bg-violet-500', label: 'Disinfecting' },
};
const cfgFor = (status) => STATUS_CFG[(status||'').toUpperCase()] || STATUS_CFG.AVAILABLE;

// ─── Bed Allocation Form — aligned to bed_allocations table ─────────────────────
function AllocateForm({ bed, onClose, onDone }) {
  const [patients, setPatients] = useState([]);
  const [doctors,  setDoctors]  = useState([]);
  const [form, setForm] = useState({
    // bed_allocations columns
    patient_id:                '',
    admitting_doctor_id:       '',
    admitted_by:               1,                   // current user id
    admission_datetime:        new Date().toISOString().slice(0, 16),
    expected_discharge_datetime: '',
    primary_diagnosis:         '',
    treatment_plan:            '',
    daily_charge_applicable:   bed.daily_charge || 800,
    notes:                     '',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState('');

  useEffect(() => {
    Promise.all([getAllPatients(), getAllDoctors()]).then(([p, d]) => { setPatients(p); setDoctors(d); });
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.patient_id || !form.admitting_doctor_id || !form.primary_diagnosis) {
      setErr('Patient, admitting doctor, and primary diagnosis are required.'); return;
    }
    setErr(''); setBusy(true);
    try {
      await allocateBed({ bed_id: bed.id, ...form, patient_id: Number(form.patient_id), admitting_doctor_id: Number(form.admitting_doctor_id), daily_charge_applicable: Number(form.daily_charge_applicable) });
      onDone(`Bed ${bed.bed_number} allocated successfully`);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <FormModal title={`Allocate Bed ${bed.bed_number} — ${bed.ward_type || bed.bed_type}`} onClose={onClose} onSubmit={submit} loading={busy} submitLabel="Allocate Bed" wide>
      <div className="space-y-5">
        {err && <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">{err}</div>}

        <div className="bg-teal-50 rounded-xl p-4 flex items-center gap-4">
          <div className="text-2xl font-display font-bold text-teal-700">{bed.bed_number}</div>
          <div>
            <div className="text-xs text-slate-500">Bed Type: <span className="font-medium">{bed.bed_type}</span></div>
            <div className="text-xs text-slate-500">Daily Charge: <span className="font-semibold text-teal-700">₹{bed.daily_charge}/day</span></div>
            {bed.has_oxygen && <span className="badge badge-blue text-[10px] mt-1">O₂</span>}
            {bed.has_ventilator && <span className="badge badge-red text-[10px] mt-1 ml-1">Ventilator</span>}
            {bed.has_monitor && <span className="badge badge-amber text-[10px] mt-1 ml-1">Monitor</span>}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Patient Details</div>
          <div className="space-y-4">
            <Field label="Patient" required>
              <select className="input" value={form.patient_id} onChange={set('patient_id')}>
                <option value="">Select patient…</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.name || `${p.first_name} ${p.last_name}`}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">Admission Details</div>
          <div className="space-y-4">
            <Field label="Admitting Doctor" required>
              <select className="input" value={form.admitting_doctor_id} onChange={set('admitting_doctor_id')}>
                <option value="">Select doctor…</option>
                {doctors.filter((d) => d.is_active !== false).map((d) => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Admission Date & Time">
                <input type="datetime-local" className="input" value={form.admission_datetime} onChange={set('admission_datetime')} />
              </Field>
              <Field label="Expected Discharge">
                <input type="datetime-local" className="input" value={form.expected_discharge_datetime} onChange={set('expected_discharge_datetime')} />
              </Field>
            </div>
            <Field label="Primary Diagnosis" required>
              <textarea className="input resize-none" rows={2} value={form.primary_diagnosis} onChange={set('primary_diagnosis')} placeholder="e.g. Acute Myocardial Infarction, STEMI" />
            </Field>
            <Field label="Treatment Plan">
              <textarea className="input resize-none" rows={2} value={form.treatment_plan} onChange={set('treatment_plan')} placeholder="e.g. Thrombolysis, PCI, anticoagulation therapy" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Daily Charge Applicable (₹)">
                <input type="number" className="input" value={form.daily_charge_applicable} onChange={set('daily_charge_applicable')} min="0" />
              </Field>
              <Field label="Admission Notes">
                <input className="input" value={form.notes} onChange={set('notes')} placeholder="Any special instructions" />
              </Field>
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
}

// ─── Bed Cell ────────────────────────────────────────────────────────────────────
function BedCell({ bed, onClick }) {
  const cfg = cfgFor(bed.status);
  return (
    <button
      onClick={() => onClick(bed)}
      className={`relative w-full aspect-square rounded-xl border-2 ${cfg.bg} ${cfg.border} p-2 flex flex-col items-center justify-center transition-all hover:scale-105 cursor-pointer`}
    >
      <span className={`text-xs font-bold font-mono ${cfg.text}`}>{bed.bed_number}</span>
      <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${cfg.dot}`} />
      {bed.has_ventilator && <span className="text-[8px] text-violet-500 font-bold">VENT</span>}
      {bed.patient_name && <div className="text-[9px] text-slate-600 mt-0.5 truncate w-full text-center font-medium">{bed.patient_name.split(' ')[0]}</div>}
      {bed.admitted_on && <div className="text-[8px] text-slate-400">{bed.admitted_on}</div>}
    </button>
  );
}

// ─── Bed Detail Panel ────────────────────────────────────────────────────────────
function BedPanel({ bed, onClose, onAllocate, onDischarge, onStatusChange }) {
  if (!bed) return null;
  const cfg   = cfgFor(bed.status);
  const isOcc = (bed.status||'').toUpperCase() === 'OCCUPIED';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl animate-slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="font-display text-lg text-slate-900">Bed {bed.bed_number}</h3>
          <button onClick={onClose}><Icon name="close" className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className={`${cfg.bg} rounded-2xl p-5 text-center`}>
            <div className={`font-display text-4xl ${cfg.text} mb-1`}>{bed.bed_number}</div>
            <div className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</div>
            <div className="text-xs text-slate-500 mt-1">Type: {bed.bed_type}</div>
            <div className="text-xs text-slate-500">Daily: ₹{bed.daily_charge}</div>
          </div>

          {/* Equipment */}
          <div className="flex flex-wrap gap-2">
            {bed.has_oxygen     && <span className="badge badge-blue">O₂ Oxygen</span>}
            {bed.has_suction    && <span className="badge badge-slate">Suction</span>}
            {bed.has_monitor    && <span className="badge badge-amber">Monitor</span>}
            {bed.has_ventilator && <span className="badge badge-red">Ventilator</span>}
          </div>

          {/* Patient info */}
          {isOcc && bed.patient_name && (
            <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Patient</p>
              <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="font-semibold text-slate-800">{bed.patient_name}</span></div>
              {bed.admitted_on && <div className="flex justify-between"><span className="text-slate-400">Admitted</span><span className="text-slate-700">{bed.admitted_on}</span></div>}
            </div>
          )}

          {/* Timestamps */}
          {bed.last_cleaned_at && (
            <div className="text-xs text-slate-400">Last cleaned: {bed.last_cleaned_at}</div>
          )}
          {bed.last_maintenance_at && (
            <div className="text-xs text-slate-400">Last maintenance: {bed.last_maintenance_at}</div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            {(bed.status||'').toUpperCase() === 'AVAILABLE' && (
              <button onClick={() => onAllocate(bed)} className="btn-primary w-full gap-2"><Icon name="plus" className="w-4 h-4"/>Allocate Bed</button>
            )}
            {isOcc && (
              <button onClick={() => onDischarge(bed)} className="btn-danger w-full gap-2"><Icon name="check" className="w-4 h-4"/>Discharge Patient</button>
            )}
            <div>
              <p className="text-xs text-slate-400 font-medium mb-2">Change Status</p>
              <div className="grid grid-cols-2 gap-1.5">
                {['AVAILABLE','CLEANING','MAINTENANCE','DISINFECTING'].map((s) => (
                  <button
                    key={s}
                    onClick={() => onStatusChange(bed.id, s)}
                    className={`text-xs py-2 px-3 rounded-lg border font-medium transition-all ${(bed.status||'').toUpperCase() === s ? `${STATUS_CFG[s].bg} ${STATUS_CFG[s].border} ${STATUS_CFG[s].text}` : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'}`}
                  >
                    {STATUS_CFG[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Ward Occupancy Card ─────────────────────────────────────────────────────────
function WardCard({ ward }) {
  const wardName = ward.ward_name || ward.wardName || `Ward ${ward.ward_id}`;
  const total    = ward.total;
  const occupied = ward.occupied;
  const avail    = ward.available;
  const pct      = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="card animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-display text-sm text-slate-900">{wardName}</div>
          <div className="text-xs text-slate-400">{ward.ward_type} · {total} beds</div>
        </div>
        <div className={`text-2xl font-display ${pct > 80 ? 'text-red-600' : pct > 60 ? 'text-amber-600' : 'text-teal-600'}`}>{pct}%</div>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-red-400' : pct > 60 ? 'bg-amber-400' : 'bg-teal-400'}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-2">
        <span>{occupied} occupied</span>
        <span>{avail} available</span>
      </div>
    </div>
  );
}

// ─── Main Module ──────────────────────────────────────────────────────────────────
export default function BedManagementModule() {
  const [beds, setBeds]           = useState([]);
  const [summary, setSummary]     = useState(null);
  const [wards, setWards]         = useState([]);
  const [busy, setBusy]           = useState(true);
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedBed, setSelectedBed]   = useState(null);
  const [allocateBedObj, setAllocateBedObj] = useState(null);
  const { show, ToastEl }         = useToast();

  const load = useCallback(async () => {
    setBusy(true);
    const [b, s, w] = await Promise.all([getBeds(), getOccupancySummary(), getWards()]);
    setBeds(b); setSummary(s); setWards(w);
    setBusy(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleBedClick = (bed) => {
    setSelectedBed(bed);
    if ((bed.status||'').toUpperCase() === 'AVAILABLE') setAllocateBedObj(null);
  };

  const handleAllocate = (bed) => { setSelectedBed(null); setAllocateBedObj(bed); };

  const handleDischarge = async (bed) => {
    await dischargeBed(bed.id);
    show(`Patient discharged from bed ${bed.bed_number}. Bed marked for cleaning.`);
    setSelectedBed(null); load();
  };

  const handleStatusChange = async (bedId, status) => {
    await updateBedStatus(bedId, status);
    show(`Bed status updated to ${STATUS_CFG[status]?.label || status}`);
    setSelectedBed(null); load();
  };

  const filteredBeds = beds.filter((b) => selectedWard === 'all' || b.ward_id === Number(selectedWard));

  if (busy) return <PageSpinner />;

  return (
    <div className="space-y-5 page-enter">
      {ToastEl}
      <PageHeader title="Bed Management" subtitle={`${summary?.total || 0} beds · ${summary?.available || 0} available · ${summary?.occupied || 0} occupied`} />

      {/* KPI strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Available',    value: summary?.available,    bg: 'bg-teal-50',    text: 'text-teal-700'   },
          { label: 'Occupied',     value: summary?.occupied,     bg: 'bg-red-50',     text: 'text-red-700'    },
          { label: 'Reserved',     value: summary?.reserved,     bg: 'bg-brand-50',   text: 'text-brand-700'  },
          { label: 'Cleaning',     value: summary?.cleaning,     bg: 'bg-amber-50',   text: 'text-amber-700'  },
          { label: 'Maintenance',  value: summary?.maintenance,  bg: 'bg-slate-100',  text: 'text-slate-700'  },
          { label: 'Disinfecting', value: summary?.disinfecting, bg: 'bg-violet-50',  text: 'text-violet-700' },
        ].map(({ label, value, bg, text }) => (
          <div key={label} className={`${bg} rounded-xl px-3 py-2.5 text-center`}>
            <div className={`text-2xl font-display ${text}`}>{value ?? 0}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Ward occupancy cards */}
      {summary?.ward_summary && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary.ward_summary.map((w) => <WardCard key={w.ward_id} ward={w} />)}
        </div>
      )}

      {/* Ward filter + Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500">Ward:</span>
          <button onClick={() => setSelectedWard('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedWard === 'all' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>All Wards</button>
          {wards.map((w) => (
            <button key={w.id} onClick={() => setSelectedWard(String(w.id))} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedWard === String(w.id) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>{w.name}</button>
          ))}
        </div>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(STATUS_CFG).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${v.dot}`} />
              <span className="text-xs text-slate-500">{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bed grid */}
      {filteredBeds.length === 0 ? (
        <EmptyState icon="bed" title="No beds found" desc="Select a different ward filter." />
      ) : (
        <div className="card">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {filteredBeds.map((bed) => <BedCell key={bed.id} bed={bed} onClick={handleBedClick} />)}
          </div>
        </div>
      )}

      {selectedBed && (
        <BedPanel
          bed={selectedBed}
          onClose={() => setSelectedBed(null)}
          onAllocate={handleAllocate}
          onDischarge={handleDischarge}
          onStatusChange={handleStatusChange}
        />
      )}
      {allocateBedObj && (
        <AllocateForm
          bed={allocateBedObj}
          onClose={() => setAllocateBedObj(null)}
          onDone={(msg) => { setAllocateBedObj(null); show(msg); load(); }}
        />
      )}
    </div>
  );
}
